import { NextResponse } from 'next/server'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { activeProvider } from '../../../../lib/billing/providers'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { startCheckout } from '../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

/** Body: { planId, interval: 'month' | 'year' }. Creates a pending subscription and a provider checkout session. */
export async function POST(req: Request) {
  try {
    const burst = rateLimited(req, 'billing.checkout', 10, 60_000)
    if (burst) return burst
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to choose a plan.', code: 'sign_in' }, { status: 401 })
    const provider = activeProvider()
    if (!provider) return NextResponse.json({ error: 'Payments are not configured on this deployment yet.', code: 'not_configured' }, { status: 503 })
    const body = (await readJson(req)) as { planId?: unknown; interval?: unknown }
    const planId = typeof body?.planId === 'string' ? body.planId : ''
    const interval = body?.interval === 'year' ? 'year' : body?.interval === 'month' ? 'month' : null
    if (!planId || !interval) throw new ValidationError('planId and interval (month | year) are required')
    const result = await startCheckout(db, provider, { userId: session.user.id, email: session.user.email || '', name: session.user.name || '', planId, interval })
    return NextResponse.json({ subscription: result.subscription, session: result.session, email: session.user.email || '', name: session.user.name || '' }, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/billing/checkout')
  }
}
