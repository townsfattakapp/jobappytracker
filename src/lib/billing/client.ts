import type { Entitlement } from './entitlement'
import type { Plan } from './plan'
import { invalidateAiStatus } from '../aiGatewayClient'

export interface BillingState {
  signedIn: boolean
  configured: boolean
  keyId: string | null
  product: string
  plans: Plan[]
  entitlement: Entitlement | null
}

export const BILLING_CHANGED_EVENT = 'jobappy:billing-changed'

export async function fetchBillingState(): Promise<BillingState | null> {
  try {
    const res = await fetch('/api/billing/status', { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as BillingState
  } catch {
    return null
  }
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (payload: unknown) => void) => void }
  }
}

let checkoutScript: Promise<void> | null = null

function loadCheckout(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Checkout needs a browser'))
  if (window.Razorpay) return Promise.resolve()
  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        checkoutScript = null
        reject(new Error('Could not load the payment window. Check your connection and try again.'))
      }
      document.head.appendChild(script)
    })
  }
  return checkoutScript
}

export const PAYMENT_CANCELLED = 'Payment cancelled'

/**
 * Buys a pass: creates the order, opens Razorpay Checkout, verifies the
 * signature and resolves with the new entitlement. Rejects with
 * PAYMENT_CANCELLED when the learner closes the window.
 */
export async function purchasePlan(planId: Plan['id']): Promise<Entitlement> {
  const res = await fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) })
  const data = (await res.json().catch(() => ({}))) as { error?: string; orderId?: string; amount?: number; currency?: string; keyId?: string; name?: string; description?: string; email?: string; userName?: string }
  if (!res.ok || !data.orderId || !data.keyId) throw new Error(data.error || 'Could not start the payment')
  await loadCheckout()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new Error('Payment window unavailable')

  return new Promise<Entitlement>((resolve, reject) => {
    const checkout = new Razorpay({
      key: data.keyId,
      order_id: data.orderId,
      amount: data.amount,
      currency: data.currency || 'INR',
      name: data.name || 'Prep Pro',
      description: data.description,
      image: '/favicon.svg',
      prefill: { email: data.email || '', name: data.userName || '' },
      theme: { color: '#c13584' },
      modal: { ondismiss: () => reject(new Error(PAYMENT_CANCELLED)) },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const verify = await fetch('/api/billing/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) })
          const body = (await verify.json().catch(() => ({}))) as { error?: string; entitlement?: Entitlement }
          if (!verify.ok || !body.entitlement) throw new Error(body.error || 'Payment could not be verified')
          invalidateAiStatus()
          window.dispatchEvent(new Event(BILLING_CHANGED_EVENT))
          resolve(body.entitlement)
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Payment could not be verified'))
        }
      },
    })
    checkout.on('payment.failed', (payload: unknown) => {
      const reason = (payload as { error?: { description?: string } })?.error?.description
      reject(new Error(reason ? `Payment failed: ${reason}` : 'Payment failed'))
    })
    checkout.open()
  })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
