import { PLAN } from './plan'

/** Subscription facts as stored in our database (dates as ISO strings for transport). */
export interface SubscriptionInfo {
  id: string
  status: string
  currentEnd: string | null
  chargeAt: string | null
  cancelledAt: string | null
}

export type EntitlementStatus = 'trial' | 'active' | 'cancelling' | 'past_due' | 'expired'

export interface Entitlement {
  status: EntitlementStatus
  /** True when the account may use the paid features right now. */
  access: boolean
  trialEndsAt: string
  /** Days left in the trial, or until the paid period ends when cancelling. */
  daysLeft: number
  /** When the next charge happens, for active subscriptions. */
  renewsAt: string | null
  /** When access ends, for cancelling subscriptions. */
  endsAt: string | null
  subscription: SubscriptionInfo | null
}

const ACTIVE = new Set(['active', 'authenticated'])
const PAST_DUE = new Set(['pending', 'halted'])

const DAY = 86_400_000

export function computeEntitlement(createdAt: Date, subscription: SubscriptionInfo | null, now: Date = new Date(), trialDays: number = PLAN.trialDays): Entitlement {
  const trialEnd = new Date(createdAt.getTime() + trialDays * DAY)
  const base = { trialEndsAt: trialEnd.toISOString(), subscription, renewsAt: null as string | null, endsAt: null as string | null }
  const daysUntil = (d: Date) => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / DAY))

  if (subscription) {
    const end = subscription.currentEnd ? new Date(subscription.currentEnd) : null
    const stillPaid = end ? end.getTime() > now.getTime() : false
    if (ACTIVE.has(subscription.status)) {
      return { ...base, status: 'active', access: true, daysLeft: end ? daysUntil(end) : 30, renewsAt: subscription.chargeAt || subscription.currentEnd }
    }
    if (subscription.status === 'cancelled' && stillPaid) {
      return { ...base, status: 'cancelling', access: true, daysLeft: daysUntil(end as Date), endsAt: subscription.currentEnd }
    }
    if (PAST_DUE.has(subscription.status)) {
      // Keep the door open while Razorpay retries the charge.
      return { ...base, status: 'past_due', access: stillPaid, daysLeft: end ? daysUntil(end) : 0, endsAt: subscription.currentEnd }
    }
  }
  if (now.getTime() < trialEnd.getTime()) {
    return { ...base, status: 'trial', access: true, daysLeft: daysUntil(trialEnd) }
  }
  return { ...base, status: 'expired', access: false, daysLeft: 0 }
}
