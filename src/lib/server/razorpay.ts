import { createHmac, timingSafeEqual } from 'node:crypto'
import { amountPaise, PRODUCT_NAME, type Plan } from '../billing/plan'

/**
 * Thin Razorpay REST client for one-time orders (fixed-length passes).
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
 */

const BASE = 'https://api.razorpay.com/v1'

export function razorpayConfig() {
  return {
    keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
    webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim(),
  }
}

export function isRazorpayConfigured(): boolean {
  const c = razorpayConfig()
  return Boolean(c.keyId && c.keySecret)
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

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  status: string
  notes?: Record<string, string>
}

export async function createOrder(plan: Plan, userId: string, email: string): Promise<RazorpayOrder> {
  return rp<RazorpayOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: amountPaise(plan),
      currency: 'INR',
      receipt: `${plan.id}-${Date.now().toString(36)}`,
      notes: { userId, email, planId: plan.id, product: PRODUCT_NAME },
    }),
  })
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/** Checkout success handler: HMAC-SHA256(order_id|payment_id) with the key secret. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret = razorpayConfig().keySecret): boolean {
  if (!secret || !orderId || !paymentId || !signature) return false
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
  return safeEqual(expected, signature)
}

/** Webhook: HMAC-SHA256 of the raw body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret = razorpayConfig().webhookSecret): boolean {
  if (!secret || !signature) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return safeEqual(expected, signature)
}
