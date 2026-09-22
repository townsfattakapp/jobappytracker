import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { mapSubscription, verifyWebhookSignature, type RazorpaySubscription } from '../../../../lib/server/razorpay'

export const dynamic = 'force-dynamic'

/**
 * Razorpay webhook. Configure it in the Razorpay dashboard with the URL
 * https://<your-domain>/api/billing/webhook and subscribe to the
 * subscription.* events. The row is upserted from the entity in every event,
 * so late or repeated deliveries are harmless.
 */
export async function POST(req: Request) {
  const raw = await req.text()
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event?: string; payload?: { subscription?: { entity?: RazorpaySubscription }; payment?: { entity?: { id?: string } } } }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const entity = event.payload?.subscription?.entity
  if (!entity?.id) return NextResponse.json({ ok: true, ignored: event.event || 'unknown' })

  const mapped = mapSubscription(entity)
  const paymentId = event.payload?.payment?.entity?.id || null
  const existing = await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, entity.id) })
  const userId = existing?.userId || entity.notes?.userId
  if (!userId) return NextResponse.json({ ok: true, ignored: 'no user' })

  if (existing) {
    await db
      .update(subscriptions)
      .set({ ...mapped, userId, lastPaymentId: paymentId || existing.lastPaymentId, updatedAt: new Date() })
      .where(eq(subscriptions.id, entity.id))
  } else {
    await db.insert(subscriptions).values({ ...mapped, userId, lastPaymentId: paymentId })
  }
  return NextResponse.json({ ok: true, event: event.event })
}
