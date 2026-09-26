import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { billingSubscriptions } from '../../../../lib/db/schema'
import { db } from '../../../../lib/db'
import { activeProvider, providerById } from '../../../../lib/billing/providers'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { resolveAccess } from '../../../../lib/server/entitlements'
import { notify } from '../../../../lib/server/notifications'
import { logEvent } from '../../../../lib/server/log'
import { getPlan } from '../../../../lib/server/plans'
import { cancelRenewal, currentSubscription, expireLapsed, listSubscriptions } from '../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

/** The signed-in account's billing state: resolved plan, current subscription, history. */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    await expireLapsed(db)
    const [access, current, history] = await Promise.all([resolveAccess(), currentSubscription(db, session.user.id), listSubscriptions(db, session.user.id)])
    const plan = await getPlan(db, access.config.plan.id)
    return NextResponse.json({ plan, planSource: access.config.planSource, accessEndsAt: access.config.accessEndsAt, subscription: current, history, provider: activeProvider()?.id ?? null })
  } catch (error) {
    return errorResponse(error, 'GET /api/billing/subscription')
  }
}

/** Body: { action: 'cancel_renewal', subscriptionId }. Only the owner can act, and only on a renewing subscription. */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const body = (await readJson(req)) as { action?: string; subscriptionId?: string }
    if (body?.action !== 'cancel_renewal' || typeof body.subscriptionId !== 'string') throw new ValidationError('Unsupported action')
    // Ownership first: a subscription that is not the caller's does not exist as far as they are concerned.
    const owned = await db.query.billingSubscriptions.findFirst({ where: and(eq(billingSubscriptions.id, body.subscriptionId), eq(billingSubscriptions.userId, session.user.id)), columns: { id: true } })
    if (!owned) {
      logEvent('warn', 'security.billing_ownership', { userId: session.user.id, subscriptionId: body.subscriptionId })
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    const current = await currentSubscription(db, session.user.id)
    const provider = current ? providerById(current.provider) ?? null : null
    const updated = await cancelRenewal(db, provider, session.user.id, body.subscriptionId)
    const plan = await getPlan(db, updated.planId)
    void notify(session.user.id, session.user.email || null, 'subscription.cancelled', { plan: plan?.displayName ?? updated.planId, periodEnd: updated.currentPeriodEnd ? new Date(updated.currentPeriodEnd).toDateString() : null })
    return NextResponse.json({ subscription: updated })
  } catch (error) {
    return errorResponse(error, 'POST /api/billing/subscription')
  }
}
