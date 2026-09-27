import { NextResponse } from 'next/server'
import { auth } from '../../../../../lib/auth'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { rateLimited } from '../../../../../lib/server/rateLimit'
import { referralDeps } from '../../../../../lib/server/referralDeps'
import { getReferrerAssignment, respondToAssignment, type ReferrerAction } from '../../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/** One assignment with the candidate package, only for the referrer it was assigned to (404 otherwise). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    const assignment = await getReferrerAssignment(referralDeps(), session.user.id, id).catch(() => null)
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    return NextResponse.json({ assignment })
  } catch (error) {
    return errorResponse(error, 'GET /api/referrer/assignments/[id]')
  }
}

/** Body: one of the ReferrerAction shapes (accept, decline, clarify, message, submitted, disclose). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const limited = rateLimited(req, 'referrer.action', 60, 60 * 60_000, session.user.id)
    if (limited) return limited
    const { id } = await ctx.params
    const body = (await readJson(req)) as ReferrerAction
    if (!body || typeof body !== 'object' || !['accept', 'decline', 'clarify', 'message', 'submitted', 'disclose'].includes(String((body as { action?: string }).action))) return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
    return NextResponse.json({ assignment: await respondToAssignment(referralDeps(), session.user.id, id, body) })
  } catch (error) {
    // Someone else's assignment (or none) answers exactly like a missing one, so ids cannot be probed.
    if (error instanceof ValidationError && (error.field === 'assignmentId' || error.field === 'referrer')) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    return errorResponse(error, 'POST /api/referrer/assignments/[id]')
  }
}
