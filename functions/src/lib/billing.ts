import {Timestamp} from "firebase-admin/firestore";
import {db} from "./firestore.js";
import {
  DEFAULT_BILLING_PLANS,
  type BillingPlan,
  type BillingStatus,
  type OverageTier,
  type UserPlan,
} from "../types/billing.types.js";

const ACTIVE_BILLING_STATUSES = new Set<BillingStatus>([
  "manual_active",
  "trialing",
  "active",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeNullableNumber(value: unknown, fallback: number | null): number | null {
  if (value === null) return null;
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeOverageTiers(value: unknown, fallback: OverageTier[]): OverageTier[] {
  if (!Array.isArray(value)) return fallback;

  const tiers = value.flatMap((item) => {
    if (!isRecord(item)) return [];

    const from = normalizeNumber(item.from, NaN);
    const to = item.to === null ? null : normalizeNumber(item.to, NaN);
    const priceCents = normalizeNumber(item.priceCents, NaN);

    if (!Number.isFinite(from) || !Number.isFinite(priceCents)) return [];
    if (to !== null && !Number.isFinite(to)) return [];

    return [{from, to, priceCents}];
  });

  return tiers.length > 0 ? tiers : fallback;
}

export function resolveEffectivePlan(plan: UserPlan, billingStatus?: BillingStatus): UserPlan {
  if (plan !== "pro") return "free";
  return ACTIVE_BILLING_STATUSES.has(billingStatus ?? "none") ? "pro" : "free";
}

export function normalizeBillingPlan(id: UserPlan, data: unknown): BillingPlan {
  const fallback = DEFAULT_BILLING_PLANS[id];
  if (!isRecord(data)) return fallback;

  return {
    id,
    active: typeof data.active === "boolean" ? data.active : fallback.active,
    name: typeof data.name === "string" ? data.name : fallback.name,
    currency: data.currency === "BRL" ? "BRL" : fallback.currency,
    monthlyPriceCents: normalizeNumber(data.monthlyPriceCents, fallback.monthlyPriceCents),
    includedLinksLifetime: normalizeNullableNumber(
      data.includedLinksLifetime,
      fallback.includedLinksLifetime
    ),
    includedLinksPerCycle: normalizeNullableNumber(
      data.includedLinksPerCycle,
      fallback.includedLinksPerCycle
    ),
    maxExpirationDays: normalizeNumber(data.maxExpirationDays, fallback.maxExpirationDays),
    allowOverage: typeof data.allowOverage === "boolean" ? data.allowOverage : fallback.allowOverage,
    overageTiers: normalizeOverageTiers(data.overageTiers, fallback.overageTiers),
    minimumFinalChargeCents: normalizeNumber(
      data.minimumFinalChargeCents,
      fallback.minimumFinalChargeCents
    ),
    softLimitLinksPerCycle: normalizeNullableNumber(
      data.softLimitLinksPerCycle,
      fallback.softLimitLinksPerCycle
    ),
    hardLimitLinksPerCycle: normalizeNullableNumber(
      data.hardLimitLinksPerCycle,
      fallback.hardLimitLinksPerCycle
    ),
  };
}

export function calculateOverageCents(billableLinks: number, tiers: OverageTier[]): number {
  if (billableLinks <= 0) return 0;

  return tiers.reduce((total, tier) => {
    const tierEnd = tier.to ?? billableLinks;
    const units = Math.max(Math.min(billableLinks, tierEnd) - tier.from + 1, 0);
    return total + units * tier.priceCents;
  }, 0);
}

export function getManualBillingCycle(now = new Date()): {
  idSuffix: string
  periodStart: Timestamp
  periodEnd: Timestamp
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

  return {
    idSuffix: `${year}-${String(month + 1).padStart(2, "0")}`,
    periodStart: Timestamp.fromDate(start),
    periodEnd: Timestamp.fromDate(end),
  };
}

export function billingPlanRef(plan: UserPlan) {
  return db.collection("billingPlans").doc(plan);
}
