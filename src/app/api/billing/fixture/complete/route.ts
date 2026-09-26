import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../../../lib/auth'
import { db } from '../../../../../lib/db'
import { billingSubscriptions } from '../../../../../lib/db/schema'
import { buildFixtureWebhook, fixtureEnabled, fixtureProvider, readFixtureToken, type FixtureOutcome } from '../../../../../lib/billing/providers/fixture'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { notify } from '../../../../../lib/server/notifications'
import { getPlan } from '../../../../../lib/server/plans'
import { currentSubscription, processWebhook } from '../../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

/**
 * Development-only checkout completion for the fixture provider. It does
 * not activate anything itself: it builds a signed webhook delivery for the
 * chosen outcome and pushes it through the same verification, ledger and
 * state machine a real provider would hit. Refuses to run in production.
 */
export async function POST(req: Request) {
  try {
    if (!fixtureEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const body = (await readJson(req)) as { token?: string; outcome?: string }
    const token = typeof body?.token === 'string' ? readFixtureToken(body.token) : null
    if (!token) throw new ValidationError('Invalid or expired test checkout token', 'token')
    if (token.userId !== session.user.id) return NextResponse.json({ error: 'This checkout belongs to another account.' }, { status: 403 })
    const outcome = (['success', 'failed', 'renewal', 'cancelled', 'expired'] as FixtureOutcome[]).includes(body.outcome as FixtureOutcome) ? (body.outcome as FixtureOutcome) : 'success'
    const owned = await db.query.billingSubscriptions.findFirst({ where: and(eq(billingSubscriptions.id, token.subscriptionId), eq(billingSubscriptions.userId, session.user.id)) })
    if (!owned) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    const delivery = buildFixtureWebhook({ providerSubscriptionId: token.providerSubscriptionId, outcome, eventId: `fx_${outcome}_${crypto.randomUUID()}`, periodDays: token.interval === 'year' ? 365 : 30 })
    const result = await processWebhook(db, fixtureProvider, delivery.rawBody, new Headers({ 'x-fixture-signature': delivery.signature }))
    const subscription = await currentSubscription(db, session.user.id)
    const plan = await getPlan(db, owned.planId)
    if (result.status === 'processed' && outcome === 'success') void notify(session.user.id, session.user.email || null, 'subscription.activated', { plan: plan?.displayName ?? owned.planId, periodEnd: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toDateString() : null })
    if (result.status === 'processed' && outcome === 'failed') void notify(session.user.id, session.user.email || null, 'payment.failed', { plan: plan?.displayName ?? owned.planId, reason: 'Test card declined' })
    return NextResponse.json({ webhook: result, subscription })
  } catch (error) {
    return errorResponse(error, 'POST /api/billing/fixture/complete')
  }
}
