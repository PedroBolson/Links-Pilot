import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import {createLinkSchema} from "../lib/validators.js";
import {generateSlug} from "../lib/slug.js";
import {PLAN_LIMITS} from "../types/link.types.js";
import {enforceRateLimit} from "../lib/rate-limiter.js";
import {safeBrowsingApiKey, checkUrlSafety} from "../lib/safe-browsing.js";
import {auditLog} from "../lib/audit.js";
import type {UserProfile} from "../types/link.types.js";

const RATE_LIMIT_FREE = 20;
const RATE_LIMIT_PRO = 200;

export const createLink = onCall(
  {region: "southamerica-east1", cors: true, secrets: [safeBrowsingApiKey]},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;

    const parsed = createLinkSchema.safeParse(request.data);
    if (!parsed.success) {
      console.error("createLink validation failed:", JSON.stringify(parsed.error.issues));
      throw new HttpsError("invalid-argument", parsed.error.issues[0].message);
    }

    const {originalUrl, slug: requestedSlug, title, expiresAt: expiresAtDate} = parsed.data;
    const expiresAt = Timestamp.fromDate(expiresAtDate);

    if (expiresAt.toMillis() <= Date.now()) {
      throw new HttpsError("invalid-argument", "Expiration date must be in the future.");
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const userProfile = userSnap.data() as UserProfile;

    // 1. Rate limiting — impede criação em massa mesmo dentro do limite do plano
    const rateMax = userProfile.plan === "pro" ? RATE_LIMIT_PRO : RATE_LIMIT_FREE;
    try {
      await enforceRateLimit(uid, "createLink", rateMax);
    } catch (err) {
      auditLog({action: "createLink", uid, result: "rate_limited"});
      throw err;
    }

    const limit = PLAN_LIMITS[userProfile.plan];
    if (userProfile.linkCount >= limit) {
      throw new HttpsError("resource-exhausted", "Link limit reached for your plan.");
    }

    // 2. Verificação de URL maliciosa via Google Safe Browsing
    const apiKey = safeBrowsingApiKey.value();
    const {safe, threats} = await checkUrlSafety(originalUrl, apiKey);
    if (!safe) {
      auditLog({
        action: "createLink",
        uid,
        result: "url_blocked",
        metadata: {url: originalUrl, threats},
      });
      throw new HttpsError(
        "invalid-argument",
        `URL blocked: flagged as ${threats.join(", ")}.`
      );
    }

    const slug = requestedSlug?.trim() || generateSlug();
    const isCustomSlug = Boolean(requestedSlug?.trim());

    const slugRef = db.collection("slugs").doc(slug);
    const linkRef = db.collection("links").doc();

    await db.runTransaction(async (tx) => {
      const slugSnap = await tx.get(slugRef);
      if (slugSnap.exists) {
        throw new HttpsError("already-exists", "This slug is already taken.");
      }

      tx.set(slugRef, {
        linkId: linkRef.id,
        userId: uid,
        expiresAt,
      });

      tx.set(linkRef, {
        slug,
        originalUrl,
        userId: uid,
        title: title?.trim() || null,
        customSlug: isCustomSlug,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt,
        status: "active",
        clickCount: 0,
        ttl: expiresAt,
      });

      tx.update(userRef, {linkCount: FieldValue.increment(1)});
    });

    const shortUrl = `${process.env.HOSTING_URL ?? "https://linkspilot.pedrobolson.com.br"}/r/${slug}`;

    auditLog({
      action: "createLink",
      uid,
      result: "success",
      metadata: {linkId: linkRef.id, slug},
    });

    return {linkId: linkRef.id, slug, shortUrl};
  }
);
