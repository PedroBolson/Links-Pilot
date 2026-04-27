import { useEffect, useState } from 'react'
import { subscribeToBillingPlans } from '@/services/billing.service'
import {
  DEFAULT_BILLING_PLANS,
  type BillingPlan,
  type BillingPlanId,
} from '@/types/billing.types'

export function useBillingPlans() {
  const [state, setState] = useState<{
    plans: Record<BillingPlanId, BillingPlan>
    isError: boolean
  }>({
    plans: DEFAULT_BILLING_PLANS,
    isError: false,
  })

  useEffect(() => {
    return subscribeToBillingPlans(
      (plans) => setState({ plans, isError: false }),
      () => setState({ plans: DEFAULT_BILLING_PLANS, isError: true }),
    )
  }, [])

  return {
    data: state.plans,
    isError: state.isError,
  }
}
