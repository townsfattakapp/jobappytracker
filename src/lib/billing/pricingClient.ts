import { api } from '../adminClient'
import type { PlanDto } from '../server/plans'
import type { SubscriptionDto } from '../server/subscriptions'
import type { CheckoutSession } from './providers/types'

export interface PublicPlan extends Pick<PlanDto, 'id' | 'displayName' | 'description' | 'monthlyPriceMinor' | 'annualPriceMinor' | 'currency' | 'highlighted' | 'isDefault' | 'features' | 'limits' | 'trialDays'> {}

export interface PlansResponse {
  plans: PublicPlan[]
  current: { planId: string; source: 'subscription' | 'legacy_pass' | 'allowlist' | 'default'; accessEndsAt: string | null; signedIn: boolean }
  billing: { provider: string | null; configured: boolean; testMode: boolean }
}

export interface BillingStateResponse {
  plan: PlanDto | null
  planSource: 'subscription' | 'legacy_pass' | 'allowlist' | 'default'
  accessEndsAt: string | null
  subscription: SubscriptionDto | null
  history: SubscriptionDto[]
  provider: string | null
}

export interface UsageResponse {
  plan: { id: string; displayName: string; isDefault: boolean }
  meters: { key: string; label: string; used: number; limit: number; included: boolean; resets: string }[]
  feed: { limit: number; label: string }
  resetsAt: string
}

export const fetchPlans = () => api<PlansResponse>('/api/billing/plans')
export const fetchBillingState = () => api<BillingStateResponse>('/api/billing/subscription')
export const fetchUsage = () => api<UsageResponse>('/api/billing/usage')
export const startCheckout = (planId: string, interval: 'month' | 'year') => api<{ subscription: SubscriptionDto; session: CheckoutSession; email: string; name: string }>('/api/billing/checkout', { method: 'POST', json: { planId, interval } })
export const completeFixtureCheckout = (token: string, outcome: 'success' | 'failed') => api<{ webhook: { status: string }; subscription: SubscriptionDto | null }>('/api/billing/fixture/complete', { method: 'POST', json: { token, outcome } })
export const cancelRenewal = (subscriptionId: string) => api<{ subscription: SubscriptionDto }>('/api/billing/subscription', { method: 'POST', json: { action: 'cancel_renewal', subscriptionId } })
export const verifyRazorpayCheckout = (payload: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => api<{ ok: true; subscription: SubscriptionDto | null }>('/api/billing/checkout/verify', { method: 'POST', json: payload })

export function formatMoney(minor: number, currency: string): string {
  const major = minor / 100
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en', { style: 'currency', currency, maximumFractionDigits: major % 1 ? 2 : 0 }).format(major)
  } catch {
    return `${currency} ${major}`
  }
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  trialing: 'Trial',
  active: 'Active',
  past_due: 'Payment due',
  cancel_at_period_end: 'Renewal cancelled',
  cancelled: 'Cancelled',
  expired: 'Expired',
}
