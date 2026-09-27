import { NextResponse } from 'next/server'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { resolveAccess } from '../../../../lib/server/entitlements'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { referralDeps } from '../../../../lib/server/referralDeps'
import { cancelRequest, getLearnerRequest, learnerMessage, linkApplication } from '../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/** One request as its owner sees it; 404 for everyone else (never 403, so ids cannot be probed). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    const request = await getLearnerRequest(referralDeps(), access.userId, id)
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    return NextResponse.json({ request })
  } catch (error) {
    return errorResponse(error, 'GET /api/referrals/[id]')
  }
}

/** Body { action: 'cancel' } | { action: 'message', body } | { action: 'link_application', applicationId }. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    const body = (await readJson(req)) as { action?: string; body?: string; applicationId?: string }
    const deps = referralDeps()
    const limited = rateLimited(req, 'referral.learner_action', 60, 60 * 60_000, access.userId)
    if (limited) return limited
    if (body.action === 'cancel') return NextResponse.json({ request: await cancelRequest(deps, access.userId, id) })
    if (body.action === 'message') return NextResponse.json({ request: await learnerMessage(deps, access.userId, id, body.body) })
    if (body.action === 'link_application') {
      if (!body.applicationId) return NextResponse.json({ error: 'applicationId is required', field: 'applicationId' }, { status: 400 })
      await linkApplication(deps, access.userId, id, body.applicationId)
      return NextResponse.json({ request: await getLearnerRequest(deps, access.userId, id) })
    }
    return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
  } catch (error) {
    // Another learner's request answers exactly like a missing one.
    if (error instanceof ValidationError && error.field === 'requestId') return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    return errorResponse(error, 'POST /api/referrals/[id]')
  }
}
