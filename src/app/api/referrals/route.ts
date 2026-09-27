import { NextResponse } from 'next/server'
import { errorResponse } from '../../../lib/server/apiErrors'
import { resolveAccess } from '../../../lib/server/entitlements'
import { referralDeps } from '../../../lib/server/referralDeps'
import { creditSummary, getReferralSettings, listLearnerRequests } from '../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/** The learner's Referral Center: every request (history included), credits and plan limits. */
export async function GET() {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const deps = referralDeps()
    const settings = await getReferralSettings(deps.db)
    const requests = await listLearnerRequests(deps, access.userId)
    const credits = await creditSummary(deps, access.userId, access.can('referral.request') ? access.limits.referralRequestsMonthly : 0)
    return NextResponse.json({
      requests: access.can('referral.history') ? requests : requests.filter((r) => !['CLOSED', 'CANCELLED', 'EXPIRED'].includes(r.status)),
      credits,
      limits: { monthly: access.limits.referralRequestsMonthly, active: access.limits.referralActiveRequests, reassignments: access.limits.referralReassignmentAttempts },
      features: { request: access.can('referral.request'), history: access.can('referral.history'), readiness: access.can('referral.readiness') },
      networkMode: settings.mode,
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/referrals')
  }
}
