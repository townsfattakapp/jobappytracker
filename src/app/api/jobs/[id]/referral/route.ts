import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { featureLockedResponse, resolveAccess } from '../../../../../lib/server/entitlements'
import { getJob } from '../../../../../lib/server/jobs'
import { rateLimited } from '../../../../../lib/server/rateLimit'
import { referralDeps } from '../../../../../lib/server/referralDeps'
import { creditSummary, getReferralSettings, jobReferralAvailability, learnerRequestForJob, recordReassignmentAllowance, runReadiness, submitRequest } from '../../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/**
 * Referral state for one job as the learner sees it: availability of the verified
 * network for the company, the learner's own request (if any), credits and plan
 * limits. Never returns referrer identity or pool sizes.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const access = await resolveAccess()
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    const deps = referralDeps()
    const settings = await getReferralSettings(deps.db)
    const canView = access.can('referral.viewAvailability')
    const availability = settings.mode === 'disabled' ? { state: 'network_disabled' as const, message: 'Referral assistance is not available right now.', available: false } : canView ? await jobReferralAvailability(deps, job) : null
    const request = access.userId ? await learnerRequestForJob(deps, access.userId, id) : null
    const credits = access.userId && access.can('referral.request') ? await creditSummary(deps, access.userId, access.limits.referralRequestsMonthly) : null
    return NextResponse.json({
      availability,
      request,
      credits: credits ? { available: credits.available, held: credits.held, allowance: credits.allowance } : null,
      features: { viewAvailability: canView, readiness: access.can('referral.readiness'), request: access.can('referral.request'), reassignment: access.can('referral.reassignment'), history: access.can('referral.history') },
      limits: { monthly: access.limits.referralRequestsMonthly, active: access.limits.referralActiveRequests, reassignments: access.limits.referralReassignmentAttempts },
      signedIn: Boolean(access.userId),
      requireCredits: settings.requireCredits,
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/[id]/referral')
  }
}

/**
 * Body { action: 'readiness', resumeId?, alreadyApplied?, preparationStarted? } runs the readiness review;
 * { action: 'submit', requestId, introduction, whyRole, relevantExperience, consent } submits the ready request.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const body = (await readJson(req)) as { action?: string; resumeId?: string; alreadyApplied?: boolean; preparationStarted?: boolean; requestId?: string; introduction?: string; whyRole?: string; relevantExperience?: string; consent?: boolean }
    const deps = referralDeps()
    if (body.action === 'readiness') {
      if (!access.can('referral.readiness')) return featureLockedResponse('referral.readiness', access)
      const limited = rateLimited(req, 'referral.readiness', 20, 60 * 60_000, access.userId)
      if (limited) return limited
      const job = await getJob(id, { publicOnly: true })
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      const result = await runReadiness(deps, { userId: access.userId, jobId: id, resumeId: body.resumeId ?? null, alreadyApplied: Boolean(body.alreadyApplied), preparationStarted: Boolean(body.preparationStarted) })
      return NextResponse.json(result)
    }
    if (body.action === 'submit') {
      if (!access.can('referral.request')) return featureLockedResponse('referral.request', access)
      const limited = rateLimited(req, 'referral.submit', 10, 60 * 60_000, access.userId)
      if (limited) return limited
      if (!body.requestId) return NextResponse.json({ error: 'requestId is required', field: 'requestId' }, { status: 400 })
      const settings = await getReferralSettings(deps.db)
      const request = await submitRequest(deps, {
        userId: access.userId,
        email: access.email,
        requestId: body.requestId,
        introduction: body.introduction ?? '',
        whyRole: body.whyRole ?? '',
        relevantExperience: body.relevantExperience ?? '',
        consent: body.consent === true,
        limits: { monthly: access.limits.referralRequestsMonthly, active: access.limits.referralActiveRequests },
        requireCredits: settings.requireCredits,
      })
      await recordReassignmentAllowance(deps, request.id, access.can('referral.reassignment') ? access.limits.referralReassignmentAttempts : 0)
      return NextResponse.json({ request })
    }
    return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/referral')
  }
}
