import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { getEntitlement, grantOrder } from '../../../../lib/server/entitlement'
import { verifyPaymentSignature } from '../../../../lib/server/razorpay'

export const dynamic = 'force-dynamic'

/** Checkout success handler: verifies Razorpay's signature and grants the pass immediately. */
export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string } | null
  const orderId = body?.razorpay_order_id || ''
  const paymentId = body?.razorpay_payment_id || ''
  const signature = body?.razorpay_signature || ''
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: 'Payment signature did not verify. If you were charged, contact support with your payment id.' }, { status: 400 })
  }
  const owned = await db.query.subscriptions.findFirst({ where: and(eq(subscriptions.id, orderId), eq(subscriptions.userId, userId)) })
  if (!owned) return NextResponse.json({ error: 'This order does not belong to the signed-in account.' }, { status: 403 })

  await grantOrder(orderId, paymentId)
  return NextResponse.json({ ok: true, entitlement: await getEntitlement(userId, session.user?.email) })
}
