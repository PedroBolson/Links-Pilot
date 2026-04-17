import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import {createLinkSchema} from "../lib/validators.js";
import {generateSlug} from "../lib/slug.js";
import {PLAN_LIMITS} from "../types/link.types.js";
import type {UserProfile} from "../types/link.types.js";

export const createLink = onCall(
  {region: "southamerica-east1", cors: true},
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
    const limit = PLAN_LIMITS[userProfile.plan];

    if (userProfile.linkCount >= limit) {
      throw new HttpsError("resource-exhausted", "Link limit reached for your plan.");
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

    return {
      linkId: linkRef.id,
      slug,
      shortUrl: `${process.env.HOSTING_URL ?? "https://linkspilot.web.app"}/r/${slug}`,
    };
  },
);
