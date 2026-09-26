import { fixturesAllowed } from '../../server/stage'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { BillingProvider, CheckoutRequest, CheckoutSession, NormalizedEvent, NormalizedEventType, WebhookParse } from './types'

/**
 * Deterministic billing provider for development and tests. It never moves
 * money: "checkout" returns a signed token, and completing it posts a signed
 * webhook through the same verification and idempotency path Razorpay uses.
 * Refuses to run in production.
 */

export function fixtureSecret(): string {
  return (process.env.BILLING_FIXTURE_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '').trim()
}

export function fixtureEnabled(): boolean {
  if (!fixturesAllowed()) return false
  return Boolean(fixtureSecret())
}

function sign(payload: string, secret = fixtureSecret()): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export interface FixtureToken {
  subscriptionId: string
  providerSubscriptionId: string
  userId: string
  planId: string
  interval: 'month' | 'year'
  exp: number
}

export function issueFixtureToken(t: FixtureToken, secret = fixtureSecret()): string {
  const body = Buffer.from(JSON.stringify(t)).toString('base64url')
  return `${body}.${sign(body, secret)}`
}

export function readFixtureToken(token: string, secret = fixtureSecret(), now = Date.now()): FixtureToken | null {
  const [body, sig] = token.split('.')
  if (!body || !sig || !safeEqual(sign(body, secret), sig)) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as FixtureToken
    if (!parsed.subscriptionId || !parsed.userId || parsed.exp < now) return null
    return parsed
  } catch {
    return null
  }
}

export type FixtureOutcome = 'success' | 'failed' | 'renewal' | 'cancelled' | 'expired'

/** Builds a signed webhook body the way a provider would deliver it. */
export function buildFixtureWebhook(input: { providerSubscriptionId: string; outcome: FixtureOutcome; eventId: string; periodDays: number; now?: Date }, secret = fixtureSecret()): { rawBody: string; signature: string } {
  const now = input.now ?? new Date()
  const map: Record<FixtureOutcome, NormalizedEventType> = { success: 'subscription.activated', failed: 'subscription.payment_failed', renewal: 'subscription.charged', cancelled: 'subscription.cancelled', expired: 'subscription.expired' }
  const body = {
    id: input.eventId,
    type: map[input.outcome],
    subscription: { id: input.providerSubscriptionId, period_start: now.toISOString(), period_end: new Date(now.getTime() + input.periodDays * 86_400_000).toISOString() },
    payment: input.outcome === 'failed' ? { id: `pay_fx_${input.eventId}`, error: 'Test card declined' } : input.outcome === 'success' || input.outcome === 'renewal' ? { id: `pay_fx_${input.eventId}` } : null,
  }
  const rawBody = JSON.stringify(body)
  return { rawBody, signature: sign(rawBody, secret) }
}

export function parseFixtureWebhook(rawBody: string, signature: string | null, secret = fixtureSecret()): WebhookParse {
  if (!secret) return { ok: false, reason: 'not_configured' }
  if (!signature || !safeEqual(sign(rawBody, secret), signature)) return { ok: false, reason: 'invalid_signature' }
  let body: { id?: string; type?: NormalizedEventType; subscription?: { id?: string; period_start?: string; period_end?: string }; payment?: { id?: string; error?: string } | null }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return { ok: false, reason: 'invalid_body' }
  }
  if (!body.id || !body.type) return { ok: false, reason: 'invalid_body' }
  const event: NormalizedEvent = {
    provider: 'fixture',
    eventId: body.id,
    type: body.type,
    rawType: body.type,
    providerSubscriptionId: body.subscription?.id ?? null,
    periodStart: body.subscription?.period_start ? new Date(body.subscription.period_start) : null,
    periodEnd: body.subscription?.period_end ? new Date(body.subscription.period_end) : null,
    paymentId: body.payment?.id ?? null,
    failureReason: body.payment?.error ?? null,
    summary: { type: body.type, subscription: body.subscription?.id ?? null },
  }
  return { ok: true, event }
}

export const fixtureProvider: BillingProvider = {
  id: 'fixture',
  isConfigured: fixtureEnabled,
  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const providerSubscriptionId = `fxsub_${req.subscriptionId.slice(0, 8)}${Date.now().toString(36)}`
    const checkoutToken = issueFixtureToken({ subscriptionId: req.subscriptionId, providerSubscriptionId, userId: req.userId, planId: req.planId, interval: req.interval, exp: Date.now() + 30 * 60_000 })
    return { mode: 'fixture', providerSubscriptionId, checkoutToken }
  },
  async cancelAtPeriodEnd(): Promise<void> {
    // Nothing to call; the subscription service records the intent.
  },
  parseWebhook(rawBody: string, headers: Headers): WebhookParse {
    return parseFixtureWebhook(rawBody, headers.get('x-fixture-signature'))
  },
}
