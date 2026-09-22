import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { getEntitlement, latestSubscription } from '../../../../lib/server/entitlement'
import { cancelSubscription, mapSubscription } from '../../../../lib/server/razorpay'

export const dynamic = 'force-dynamic'

/** Cancels at the end of the paid period; access continues until then. */
export async function POST() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const current = await latestSubscription(userId)
  if (!current || !['active', 'authenticated', 'pending', 'halted'].includes(current.status)) {
    return NextResponse.json({ error: 'There is no active subscription to cancel.' }, { status: 409 })
  }
  try {
    const live = await cancelSubscription(current.id, true)
    const mapped = mapSubscription(live)
    await db
      .update(subscriptions)
      .set({ ...mapped, status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(subscriptions.id, current.id))
    return NextResponse.json({ ok: true, entitlement: await getEntitlement(userId) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not cancel' }, { status: 502 })
  }
}
