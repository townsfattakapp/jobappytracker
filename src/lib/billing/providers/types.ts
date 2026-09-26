/**
 * Billing provider abstraction. Business logic (plans, subscription state,
 * entitlements) only talks to this interface; Razorpay and the deterministic
 * fixture provider implement it. Nothing here touches the database.
 */

export type BillingInterval = 'month' | 'year'

export interface CheckoutRequest {
  userId: string
  email: string
  name: string
  planId: string
  interval: BillingInterval
  /** Our internal subscription id, created before checkout so the webhook can find it. */
  subscriptionId: string
  amountMinor: number
  currency: string
  providerPlanId: string | null
  trialDays: number
}

export type CheckoutSession =
  | { mode: 'razorpay'; providerSubscriptionId: string; keyId: string; description: string }
  | { mode: 'fixture'; providerSubscriptionId: string; checkoutToken: string }

/** Provider-independent event types the subscription service understands. */
export type NormalizedEventType = 'subscription.activated' | 'subscription.charged' | 'subscription.payment_failed' | 'subscription.cancelled' | 'subscription.completed' | 'subscription.expired' | 'subscription.paused' | 'ignored'

export interface NormalizedEvent {
  provider: string
  /** Unique per provider; used for idempotency. */
  eventId: string
  type: NormalizedEventType
  rawType: string
  providerSubscriptionId: string | null
  /** Period boundaries when the provider states them (unix seconds → Date). */
  periodStart: Date | null
  periodEnd: Date | null
  paymentId: string | null
  failureReason: string | null
  /** Small, redacted subset of the payload for the ledger. */
  summary: Record<string, unknown>
}

export type WebhookParse = { ok: true; event: NormalizedEvent } | { ok: false; reason: 'invalid_signature' | 'invalid_body' | 'not_configured' }

export interface BillingProvider {
  id: string
  isConfigured(): boolean
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>
  /** Ask the provider to stop renewals at the end of the current period. */
  cancelAtPeriodEnd(providerSubscriptionId: string): Promise<void>
  /** Verify and normalise a webhook delivery. Never trusts unsigned bodies. */
  parseWebhook(rawBody: string, headers: Headers): WebhookParse
}
