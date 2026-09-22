import { createHmac, timingSafeEqual } from 'node:crypto'
import { PLAN } from '../billing/plan'

/**
 * Thin Razorpay REST client for subscriptions. No SDK: three endpoints and two
 * HMAC checks are all the app needs.
 *
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_ID (a monthly plan
 * for ₹199 created once with `npm run razorpay:plan`), RAZORPAY_WEBHOOK_SECRET.
 */

const BASE = 'https://api.razorpay.com/v1'

export function razorpayConfig() {
  return {
    keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
    planId: (process.env.RAZORPAY_PLAN_ID || '').trim(),
    webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim(),
  }
}

export function isRazorpayConfigured(): boolean {
  const c = razorpayConfig()
  return Boolean(c.keyId && c.keySecret && c.planId)
}

async function rp<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret } = razorpayConfig()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })
  const text = await res.text()
  if (!res.ok) {
    let message = `Razorpay ${res.status}`
    try {
      message = (JSON.parse(text) as { error?: { description?: string } }).error?.description || message
    } catch {
      // keep the status message
    }
    throw new Error(message)
  }
  return JSON.parse(text) as T
}

export interface RazorpaySubscription {
  id: string
  plan_id: string
  status: string
  current_start?: number | null
  current_end?: number | null
  charge_at?: number | null
  ended_at?: number | null
  notes?: Record<string, string>
}

export async function createSubscription(userId: string, email: string): Promise<RazorpaySubscription> {
  const { planId } = razorpayConfig()
  return rp<RazorpaySubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: planId,
      total_count: 120, // ten years of monthly charges; cancellable any time
      quantity: 1,
      customer_notify: 1,
      notes: { userId, email, app: PLAN.name },
    }),
  })
}

export async function fetchSubscription(id: string): Promise<RazorpaySubscription> {
  return rp<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(id)}`)
}

export async function cancelSubscription(id: string, atCycleEnd = true): Promise<RazorpaySubscription> {
  return rp<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancel_at_cycle_end: atCycleEnd ? 1 : 0 }),
  })
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/** Checkout success handler: HMAC-SHA256(payment_id|subscription_id) with the key secret. */
export function verifyCheckoutSignature(paymentId: string, subscriptionId: string, signature: string, secret = razorpayConfig().keySecret): boolean {
  if (!secret || !paymentId || !subscriptionId || !signature) return false
  const expected = createHmac('sha256', secret).update(`${paymentId}|${subscriptionId}`).digest('hex')
  return safeEqual(expected, signature)
}

/** Webhook: HMAC-SHA256 of the raw body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret = razorpayConfig().webhookSecret): boolean {
  if (!secret || !signature) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return safeEqual(expected, signature)
}

const toDate = (seconds?: number | null) => (seconds ? new Date(seconds * 1000) : null)

/** Our row shape from a Razorpay subscription entity. */
export function mapSubscription(entity: RazorpaySubscription) {
  return {
    id: entity.id,
    planId: entity.plan_id,
    status: entity.status,
    currentStart: toDate(entity.current_start),
    currentEnd: toDate(entity.current_end),
    chargeAt: toDate(entity.charge_at),
    cancelledAt: entity.status === 'cancelled' ? toDate(entity.ended_at) || new Date() : null,
  }
}
