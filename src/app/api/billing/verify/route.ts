import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { getEntitlement } from '../../../../lib/server/entitlement'
import { fetchSubscription, mapSubscription, verifyCheckoutSignature } from '../../../../lib/server/razorpay'

export const dynamic = 'force-dynamic'

/**
 * Called by the Checkout success handler. Verifies Razorpay's signature, then
 * marks the subscription as authenticated so access starts immediately; the
 * webhook confirms the first charge shortly after.
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as { razorpay_payment_id?: string; razorpay_subscription_id?: string; razorpay_signature?: string } | null
  const paymentId = body?.razorpay_payment_id || ''
  const subscriptionId = body?.razorpay_subscription_id || ''
  const signature = body?.razorpay_signature || ''
  if (!verifyCheckoutSignature(paymentId, subscriptionId, signature)) {
    return NextResponse.json({ error: 'Payment signature did not verify. If you were charged, contact support with your payment id.' }, { status: 400 })
  }

  const owned = await db.query.subscriptions.findFirst({ where: and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId)) })
  if (!owned) return NextResponse.json({ error: 'This subscription does not belong to the signed-in account.' }, { status: 403 })

  // Prefer Razorpay's view of the subscription; fall back to marking it authenticated.
  let update: Partial<typeof subscriptions.$inferInsert> = { status: 'authenticated', lastPaymentId: paymentId, updatedAt: new Date() }
  try {
    const live = await fetchSubscription(subscriptionId)
    const mapped = mapSubscription(live)
    const status = ['created'].includes(mapped.status) ? 'authenticated' : mapped.status
    update = { ...mapped, status, lastPaymentId: paymentId, updatedAt: new Date() }
  } catch {
    // keep the optimistic update
  }
  await db.update(subscriptions).set(update).where(eq(subscriptions.id, subscriptionId))
  return NextResponse.json({ ok: true, entitlement: await getEntitlement(userId) })
}
