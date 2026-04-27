export type BillingPlanId = 'free' | 'pro'

export type BillingStatus =
  | 'none'
  | 'manual_active'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'

export interface OverageTier {
  from: number
  to: number | null
  priceCents: number
}

export interface BillingPlan {
  id: BillingPlanId
  active: boolean
  name: string
  currency: 'BRL'
  monthlyPriceCents: number
  includedLinksLifetime: number | null
  includedLinksPerCycle: number | null
  maxExpirationDays: number
  allowOverage: boolean
  overageTiers: OverageTier[]
  minimumFinalChargeCents: number
  softLimitLinksPerCycle: number | null
  hardLimitLinksPerCycle: number | null
}

export const DEFAULT_BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  free: {
    id: 'free',
    active: true,
    name: 'Free',
    currency: 'BRL',
    monthlyPriceCents: 0,
    includedLinksLifetime: 10,
    includedLinksPerCycle: null,
    maxExpirationDays: 30,
    allowOverage: false,
    overageTiers: [],
    minimumFinalChargeCents: 0,
    softLimitLinksPerCycle: 10,
    hardLimitLinksPerCycle: 10,
  },
  pro: {
    id: 'pro',
    active: true,
    name: 'Pro',
    currency: 'BRL',
    monthlyPriceCents: 3499,
    includedLinksLifetime: null,
    includedLinksPerCycle: 50,
    maxExpirationDays: 90,
    allowOverage: true,
    overageTiers: [
      { from: 1, to: 50, priceCents: 100 },
      { from: 51, to: 150, priceCents: 76 },
      { from: 151, to: null, priceCents: 50 },
    ],
    minimumFinalChargeCents: 1000,
    softLimitLinksPerCycle: 200,
    hardLimitLinksPerCycle: 500,
  },
}

const ACTIVE_BILLING_STATUSES = new Set<BillingStatus>([
  'manual_active',
  'trialing',
  'active',
])

export function isProEntitled(plan?: BillingPlanId, status?: BillingStatus): boolean {
  return plan === 'pro' && ACTIVE_BILLING_STATUSES.has(status ?? 'none')
}

export function formatCurrencyCents(value: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}
