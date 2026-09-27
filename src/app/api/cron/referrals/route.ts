import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { cronAuthorized } from '../../../../lib/server/cronAuth'
import { logEvent } from '../../../../lib/server/log'
import { referralDeps } from '../../../../lib/server/referralDeps'
import { sweepReferrals } from '../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/** Referral sweep: unanswered assignments move on, expired jobs and stale requests close, lapsed verifications stop. Inert until CRON_SECRET is set. */
export async function GET(req: Request) {
  const authz = cronAuthorized(req.headers)
  if (!authz.ok) {
    if (authz.reason !== 'not_configured') logEvent('warn', 'cron.auth_failed', { route: 'referrals', reason: authz.reason })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const report = await sweepReferrals(referralDeps())
    logEvent('info', 'referral.sweep', { ...report })
    return NextResponse.json(report)
  } catch (error) {
    return errorResponse(error, 'GET /api/cron/referrals')
  }
}
