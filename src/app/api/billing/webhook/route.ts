import { NextResponse } from 'next/server'
import { grantOrder } from '../../../../lib/server/entitlement'
import { verifyWebhookSignature } from '../../../../lib/server/razorpay'

export const dynamic = 'force-dynamic'

/**
 * Razorpay webhook. Configure https://<domain>/api/billing/webhook in the
 * dashboard with the payment.captured and order.paid events. Granting is
 * idempotent, so repeated deliveries and the checkout handler cannot double
 * up a pass.
 */
export async function POST(req: Request) {
  const raw = await req.text()
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } }; order?: { entity?: { id?: string; status?: string } } } }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const payment = event.payload?.payment?.entity
  const order = event.payload?.order?.entity
  const orderId = payment?.order_id || order?.id
  const paid = (event.event === 'payment.captured' && payment?.status === 'captured') || event.event === 'order.paid'
  if (!orderId || !paid) return NextResponse.json({ ok: true, ignored: event.event || 'unknown' })
  const granted = await grantOrder(orderId, payment?.id || null)
  return NextResponse.json({ ok: true, event: event.event, granted })
}
