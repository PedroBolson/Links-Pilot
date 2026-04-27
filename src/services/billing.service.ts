import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  DEFAULT_BILLING_PLANS,
  type BillingPlan,
  type BillingPlanId,
  type OverageTier,
} from '@/types/billing.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function nullableNumberOr(value: unknown, fallback: number | null): number | null {
  if (value === null) return null
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function overageTiersOr(value: unknown, fallback: OverageTier[]): OverageTier[] {
  if (!Array.isArray(value)) return fallback

  const tiers = value.flatMap((item) => {
    if (!isRecord(item)) return []

    const from = numberOr(item.from, Number.NaN)
    const to = item.to === null ? null : numberOr(item.to, Number.NaN)
    const priceCents = numberOr(item.priceCents, Number.NaN)

    if (!Number.isFinite(from) || !Number.isFinite(priceCents)) return []
    if (to !== null && !Number.isFinite(to)) return []

    return [{ from, to, priceCents }]
  })

  return tiers.length > 0 ? tiers : fallback
}

function normalizeBillingPlan(id: BillingPlanId, data: unknown): BillingPlan {
  const fallback = DEFAULT_BILLING_PLANS[id]
  if (!isRecord(data)) return fallback

  return {
    id,
    active: typeof data.active === 'boolean' ? data.active : fallback.active,
    name: typeof data.name === 'string' ? data.name : fallback.name,
    currency: data.currency === 'BRL' ? 'BRL' : fallback.currency,
    monthlyPriceCents: numberOr(data.monthlyPriceCents, fallback.monthlyPriceCents),
    includedLinksLifetime: nullableNumberOr(
      data.includedLinksLifetime,
      fallback.includedLinksLifetime,
    ),
    includedLinksPerCycle: nullableNumberOr(
      data.includedLinksPerCycle,
      fallback.includedLinksPerCycle,
    ),
    maxExpirationDays: numberOr(data.maxExpirationDays, fallback.maxExpirationDays),
    allowOverage: typeof data.allowOverage === 'boolean' ? data.allowOverage : fallback.allowOverage,
    overageTiers: overageTiersOr(data.overageTiers, fallback.overageTiers),
    minimumFinalChargeCents: numberOr(
      data.minimumFinalChargeCents,
      fallback.minimumFinalChargeCents,
    ),
    softLimitLinksPerCycle: nullableNumberOr(
      data.softLimitLinksPerCycle,
      fallback.softLimitLinksPerCycle,
    ),
    hardLimitLinksPerCycle: nullableNumberOr(
      data.hardLimitLinksPerCycle,
      fallback.hardLimitLinksPerCycle,
    ),
  }
}

export function subscribeToBillingPlans(
  callback: (plans: Record<BillingPlanId, BillingPlan>) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'billingPlans'),
    (snap) => {
      const plans = { ...DEFAULT_BILLING_PLANS }

      snap.docs.forEach((doc) => {
        if (doc.id === 'free' || doc.id === 'pro') {
          plans[doc.id] = normalizeBillingPlan(doc.id, doc.data())
        }
      })

      callback(plans)
    },
    onError,
  )
}
