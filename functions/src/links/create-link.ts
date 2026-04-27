import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import {createLinkSchema} from "../lib/validators.js";
import {generateSlug} from "../lib/slug.js";
import {enforceRateLimit} from "../lib/rate-limiter.js";
import {safeBrowsingApiKey, checkUrlSafety} from "../lib/safe-browsing.js";
import {auditLog} from "../lib/audit.js";
import {CALLABLE_CORS, FUNCTION_REGION} from "../lib/http-options.js";
import {
  billingPlanRef,
  calculateOverageCents,
  getManualBillingCycle,
  normalizeBillingPlan,
  resolveEffectivePlan,
} from "../lib/billing.js";
import type {UserProfile} from "../types/link.types.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_FREE = 20;
const RATE_LIMIT_PRO = 200;

export const createLink = onCall(
  {region: FUNCTION_REGION, cors: CALLABLE_CORS, secrets: [safeBrowsingApiKey]},
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
    const ratePlan = resolveEffectivePlan(userProfile.plan, userProfile.billingStatus);

    // 1. Rate limiting — impede criação em massa mesmo dentro do limite do plano
    const rateMax = ratePlan === "pro" ? RATE_LIMIT_PRO : RATE_LIMIT_FREE;
    try {
      await enforceRateLimit(uid, "createLink", rateMax);
    } catch (err) {
      auditLog({action: "createLink", uid, result: "rate_limited"});
      throw err;
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
    const usageEventRef = db.collection("usageEvents").doc(linkRef.id);

    await db.runTransaction(async (tx) => {
      const userTxSnap = await tx.get(userRef);
      const slugSnap = await tx.get(slugRef);

      if (!userTxSnap.exists) {
        throw new HttpsError("not-found", "User profile not found.");
      }

      const txUserProfile = userTxSnap.data() as UserProfile;
      const effectivePlanId = resolveEffectivePlan(
        txUserProfile.plan,
        txUserProfile.billingStatus
      );
      const planSnap = await tx.get(billingPlanRef(effectivePlanId));
      const plan = normalizeBillingPlan(effectivePlanId, planSnap.data());
      const currentLifetimeLinks = Number(txUserProfile.linkCount ?? 0);

      if (!Number.isFinite(currentLifetimeLinks)) {
        throw new HttpsError("failed-precondition", "Invalid user usage state.");
      }

      if (!plan.active) {
        throw new HttpsError("failed-precondition", "Selected plan is not active.");
      }

      const maxExpirationMs = Date.now() + plan.maxExpirationDays * DAY_MS;
      if (expiresAt.toMillis() > maxExpirationMs) {
        throw new HttpsError(
          "permission-denied",
          `Your plan allows links to expire within ${plan.maxExpirationDays} days.`
        );
      }

      const lifetimeLimit = plan.includedLinksLifetime;
      if (lifetimeLimit !== null && currentLifetimeLinks >= lifetimeLimit) {
        throw new HttpsError("resource-exhausted", "Link limit reached for your plan.");
      }

      if (slugSnap.exists) {
        throw new HttpsError("already-exists", "This slug is already taken.");
      }

      const now = Timestamp.now();
      let billingCycleId: string | null = null;
      let countedAs: "free" | "included" | "overage" = effectivePlanId === "free" ?
        "free" :
        "included";
      let amountCentsSnapshot = 0;

      if (effectivePlanId === "pro") {
        const manualCycle = getManualBillingCycle();
        billingCycleId = `${uid}_${manualCycle.idSuffix}`;
        const cycleRef = db.collection("billingCycles").doc(billingCycleId);
        const cycleSnap = await tx.get(cycleRef);
        const includedLinks = plan.includedLinksPerCycle ?? 0;
        const currentLinksCreated = cycleSnap.exists ?
          Number(cycleSnap.data()?.linksCreated ?? 0) :
          0;
        const nextLinksCreated = currentLinksCreated + 1;

        if (!plan.allowOverage && nextLinksCreated > includedLinks) {
          throw new HttpsError("resource-exhausted", "Cycle included link limit reached.");
        }

        if (
          plan.hardLimitLinksPerCycle !== null &&
          nextLinksCreated > plan.hardLimitLinksPerCycle
        ) {
          throw new HttpsError("resource-exhausted", "Cycle link limit reached for your plan.");
        }

        const previousBillableLinks = Math.max(currentLinksCreated - includedLinks, 0);
        const nextBillableLinks = Math.max(nextLinksCreated - includedLinks, 0);
        const previousOverageCents = calculateOverageCents(
          previousBillableLinks,
          plan.overageTiers
        );
        const nextOverageCents = calculateOverageCents(nextBillableLinks, plan.overageTiers);

        amountCentsSnapshot = Math.max(nextOverageCents - previousOverageCents, 0);
        countedAs = amountCentsSnapshot > 0 ? "overage" : "included";

        if (cycleSnap.exists) {
          tx.update(cycleRef, {
            linksCreated: nextLinksCreated,
            billableLinks: nextBillableLinks,
            estimatedOverageCents: nextOverageCents,
            updatedAt: now,
          });
        } else {
          tx.set(cycleRef, {
            userId: uid,
            plan: effectivePlanId,
            periodStart: manualCycle.periodStart,
            periodEnd: manualCycle.periodEnd,
            includedLinks,
            linksCreated: nextLinksCreated,
            billableLinks: nextBillableLinks,
            estimatedOverageCents: nextOverageCents,
            status: "open",
            pricingSnapshot: plan,
            createdAt: now,
            updatedAt: now,
          });
        }
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
        planAtCreation: effectivePlanId,
        billingCycleId,
        usageCountedAs: countedAs,
        usageAmountCents: amountCentsSnapshot,
      });

      tx.set(usageEventRef, {
        userId: uid,
        linkId: linkRef.id,
        cycleId: billingCycleId,
        type: "link_created",
        quantity: 1,
        countedAs,
        amountCentsSnapshot,
        plan: effectivePlanId,
        createdAt: now,
      });

      tx.update(userRef, {
        linkCount: FieldValue.increment(1),
        currentBillingCycleId: billingCycleId,
      });
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
