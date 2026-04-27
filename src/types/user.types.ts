import type { Timestamp } from 'firebase/firestore'
import type { BillingPlanId, BillingStatus } from './billing.types'

export type UserPlan = BillingPlanId

export interface UserProfile {
  uid: string
  email: string
  plan: UserPlan
  billingStatus?: BillingStatus
  linkCount: number
  currentBillingCycleId?: string | null
  createdAt: Timestamp
}
