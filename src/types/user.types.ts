import type { Timestamp } from 'firebase/firestore'

export type UserPlan = 'free' | 'pro'

export interface UserProfile {
  uid: string
  email: string
  plan: UserPlan
  linkCount: number
  createdAt: Timestamp
}

export const PLAN_LIMITS: Record<UserPlan, number> = {
  free: 10,
  pro: Infinity,
}
