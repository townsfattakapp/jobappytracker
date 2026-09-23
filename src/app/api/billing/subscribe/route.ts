import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { createOrder, isRazorpayConfigured, razorpayConfig } from '../../../../lib/server/razorpay'
import { planById, PRODUCT_NAME } from '../../../../lib/billing/plan'

export const dynamic = 'force-dynamic'

/** Creates a Razorpay order for a plan and returns what Checkout needs. */
export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to choose a plan.' }, { status: 401 })
  if (!isRazorpayConfigured()) return NextResponse.json({ error: 'Payments are not configured on this deployment yet.' }, { status: 503 })

  const body = (await req.json().catch(() => null)) as { planId?: unknown } | null
  const plan = planById(typeof body?.planId === 'string' ? body.planId : null)
  if (!plan) return NextResponse.json({ error: 'Choose a valid plan.' }, { status: 400 })

  try {
    const email = session.user?.email || ''
    const order = await createOrder(plan, userId, email)
    await db.insert(subscriptions).values({ id: order.id, userId, planId: plan.id, status: 'created' }).onConflictDoNothing()
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayConfig().keyId,
      name: PRODUCT_NAME,
      description: `${PRODUCT_NAME} · ${plan.name} · ₹${plan.priceInr}`,
      email,
      userName: session.user?.name || '',
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not start the payment' }, { status: 502 })
  }
}
