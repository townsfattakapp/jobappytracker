import { createHmac, timingSafeEqual } from 'node:crypto'
import type { BillingProvider, CheckoutRequest, CheckoutSession, NormalizedEvent, NormalizedEventType, WebhookParse } from './types'

/**
 * Razorpay Subscriptions adapter (test mode until live keys are configured).
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
 * Razorpay plan ids (plan_xxx) are stored per billing plan and interval.
 * Documented API: POST /v1/subscriptions, POST /v1/subscriptions/:id/cancel,
 * webhook events subscription.activated | charged | pending | halted |
 * cancelled | completed | expired | paused, signed with HMAC-SHA256 of the raw body.
 */

const BASE = 'https://api.razorpay.com/v1'

function config() {
  return { keyId: (process.env.RAZORPAY_KEY_ID || '').trim(), keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim(), webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim() }
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

async function rp<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret } = config()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })
  const text = await res.text()
  if (!res.ok) {
    let message = `Razorpay ${res.status}`
    try {
      message = (JSON.parse(text) as { error?: { description?: string } }).error?.description || message
    } catch {
      // keep status
    }
    throw new Error(message)
  }
  return JSON.parse(text) as T
}

const EVENT_MAP: Record<string, NormalizedEventType> = {
  'subscription.activated': 'subscription.activated',
  'subscription.charged': 'subscription.charged',
  'subscription.pending': 'subscription.payment_failed',
  'subscription.halted': 'subscription.payment_failed',
  'subscription.cancelled': 'subscription.cancelled',
  'subscription.completed': 'subscription.completed',
  'subscription.expired': 'subscription.expired',
  'subscription.paused': 'subscription.paused',
}

/** Checkout success handler signature: HMAC-SHA256(payment_id|subscription_id) with the key secret. */
export function verifySubscriptionCheckoutSignature(paymentId: string, subscriptionId: string, signature: string, secret = config().keySecret): boolean {
  if (!secret || !paymentId || !subscriptionId || !signature) return false
  const expected = createHmac('sha256', secret).update(`${paymentId}|${subscriptionId}`).digest('hex')
  return safeEqual(expected, signature)
}

export function parseRazorpayWebhook(rawBody: string, signature: string | null, secret: string): WebhookParse {
  if (!secret) return { ok: false, reason: 'not_configured' }
  if (!signature) return { ok: false, reason: 'invalid_signature' }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  if (!safeEqual(expected, signature)) return { ok: false, reason: 'invalid_signature' }
  let body: { event?: string; created_at?: number; payload?: { subscription?: { entity?: { id?: string; status?: string; current_start?: number; current_end?: number; notes?: Record<string, string> } }; payment?: { entity?: { id?: string; error_description?: string; status?: string } } } }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return { ok: false, reason: 'invalid_body' }
  }
  const sub = body.payload?.subscription?.entity
  const payment = body.payload?.payment?.entity
  const rawType = body.event || 'unknown'
  const type = EVENT_MAP[rawType] ?? 'ignored'
  // Razorpay sends x-razorpay-event-id; fall back to a body-derived id so replays still dedupe.
  const event: NormalizedEvent = {
    provider: 'razorpay',
    eventId: '',
    type,
    rawType,
    providerSubscriptionId: sub?.id ?? null,
    periodStart: sub?.current_start ? new Date(sub.current_start * 1000) : null,
    periodEnd: sub?.current_end ? new Date(sub.current_end * 1000) : null,
    paymentId: payment?.id ?? null,
    failureReason: payment?.error_description ?? (type === 'subscription.payment_failed' ? `Razorpay status ${sub?.status ?? 'unknown'}` : null),
    summary: { event: rawType, subscriptionStatus: sub?.status ?? null, paymentStatus: payment?.status ?? null, createdAt: body.created_at ?? null },
  }
  return { ok: true, event }
}

export const razorpayProvider: BillingProvider = {
  id: 'razorpay',
  isConfigured() {
    const c = config()
    return Boolean(c.keyId && c.keySecret)
  },
  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    if (!req.providerPlanId) throw new Error('This plan has no Razorpay plan id for the chosen billing period; an admin must add it under Plans.')
    const sub = await rp<{ id: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: req.providerPlanId,
        total_count: req.interval === 'year' ? 10 : 120,
        quantity: 1,
        customer_notify: 1,
        notes: { userId: req.userId, planId: req.planId, interval: req.interval, subscriptionId: req.subscriptionId },
      }),
    })
    return { mode: 'razorpay', providerSubscriptionId: sub.id, keyId: config().keyId, description: `${req.planId} · ${req.interval === 'year' ? 'annual' : 'monthly'}` }
  },
  async cancelAtPeriodEnd(providerSubscriptionId: string): Promise<void> {
    await rp(`/subscriptions/${encodeURIComponent(providerSubscriptionId)}/cancel`, { method: 'POST', body: JSON.stringify({ cancel_at_cycle_end: 1 }) })
  },
  parseWebhook(rawBody: string, headers: Headers): WebhookParse {
    const parsed = parseRazorpayWebhook(rawBody, headers.get('x-razorpay-signature'), config().webhookSecret)
    if (!parsed.ok) return parsed
    const headerId = headers.get('x-razorpay-event-id')
    parsed.event.eventId = headerId || createHmac('sha256', 'razorpay-event').update(rawBody).digest('hex').slice(0, 32)
    return parsed
  },
}
