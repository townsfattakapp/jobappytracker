import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { getEntitlement } from '../../../../lib/server/entitlement'
import { createSubscription, isRazorpayConfigured, mapSubscription, razorpayConfig } from '../../../../lib/server/razorpay'
import { PLAN } from '../../../../lib/billing/plan'

export const dynamic = 'force-dynamic'

/** Creates a Razorpay subscription for the signed-in user and returns what Checkout needs. */
export async function POST() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to subscribe.' }, { status: 401 })
  if (!isRazorpayConfigured()) return NextResponse.json({ error: 'Payments are not configured on this deployment yet.' }, { status: 503 })

  const entitlement = await getEntitlement(userId)
  if (entitlement.status === 'active') return NextResponse.json({ error: 'You already have an active subscription.' }, { status: 409 })

  try {
    const email = session.user?.email || ''
    const created = await createSubscription(userId, email)
    const row = mapSubscription(created)
    await db
      .insert(subscriptions)
      .values({ ...row, userId, lastPaymentId: null })
      .onConflictDoUpdate({ target: subscriptions.id, set: { status: row.status, updatedAt: new Date() } })
    return NextResponse.json({
      subscriptionId: created.id,
      keyId: razorpayConfig().keyId,
      name: PLAN.name,
      description: `${PLAN.name} · ₹${PLAN.priceInr}/month`,
      email,
      userName: session.user?.name || '',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start the subscription'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
