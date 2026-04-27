import type {Timestamp} from "firebase-admin/firestore";

export type UserPlan = "free" | "pro";

export type BillingStatus =
  | "none"
  | "manual_active"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

export interface OverageTier {
  from: number
  to: number | null
  priceCents: number
}

export interface BillingPlan {
  id: UserPlan
  active: boolean
  name: string
  currency: "BRL"
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

export interface BillingCycle {
  userId: string
  plan: UserPlan
  periodStart: Timestamp
  periodEnd: Timestamp
  includedLinks: number
  linksCreated: number
  billableLinks: number
  estimatedOverageCents: number
  status: "open" | "closed" | "invoiced" | "paid"
  pricingSnapshot: BillingPlan
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const DEFAULT_BILLING_PLANS: Record<UserPlan, BillingPlan> = {
  free: {
    id: "free",
    active: true,
    name: "Free",
    currency: "BRL",
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
    id: "pro",
    active: true,
    name: "Pro",
    currency: "BRL",
    monthlyPriceCents: 3499,
    includedLinksLifetime: null,
    includedLinksPerCycle: 50,
    maxExpirationDays: 90,
    allowOverage: true,
    overageTiers: [
      {from: 1, to: 50, priceCents: 100},
      {from: 51, to: 150, priceCents: 76},
      {from: 151, to: null, priceCents: 50},
    ],
    minimumFinalChargeCents: 1000,
    softLimitLinksPerCycle: 200,
    hardLimitLinksPerCycle: 500,
  },
};
