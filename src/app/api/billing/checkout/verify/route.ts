import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../../../lib/auth'
import { db } from '../../../../../lib/db'
import { billingSubscriptions } from '../../../../../lib/db/schema'
import { verifySubscriptionCheckoutSignature } from '../../../../../lib/billing/providers/razorpay'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { logEvent } from '../../../../../lib/server/log'
import { applyEvent, currentSubscription } from '../../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

/**
 * Razorpay Checkout success handler. The browser's claim is never trusted:
 * activation happens only if Razorpay's HMAC over payment_id|subscription_id
 * verifies with the server-side key secret, and only for a subscription the
 * signed-in account started. The webhook remains authoritative for renewals.
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const body = (await readJson(req)) as { razorpay_payment_id?: string; razorpay_subscription_id?: string; razorpay_signature?: string }
    const paymentId = body?.razorpay_payment_id || ''
    const providerSubscriptionId = body?.razorpay_subscription_id || ''
    const signature = body?.razorpay_signature || ''
    if (!verifySubscriptionCheckoutSignature(paymentId, providerSubscriptionId, signature)) {
      logEvent('warn', 'billing.checkout_signature_invalid', { userId: session.user.id })
      return NextResponse.json({ error: 'Payment signature did not verify. If you were charged, contact support with your payment id.' }, { status: 400 })
    }
    const owned = await db.query.billingSubscriptions.findFirst({ where: and(eq(billingSubscriptions.provider, 'razorpay'), eq(billingSubscriptions.providerSubscriptionId, providerSubscriptionId), eq(billingSubscriptions.userId, session.user.id)) })
    if (!owned) return NextResponse.json({ error: 'This subscription does not belong to the signed-in account.' }, { status: 403 })
    await applyEvent(db, { provider: 'razorpay', eventId: `checkout:${paymentId}`, type: 'subscription.activated', rawType: 'checkout.verified', providerSubscriptionId, periodStart: null, periodEnd: null, paymentId, failureReason: null, summary: { source: 'checkout' } })
    return NextResponse.json({ ok: true, subscription: await currentSubscription(db, session.user.id) })
  } catch (error) {
    return errorResponse(error, 'POST /api/billing/checkout/verify')
  }
}
