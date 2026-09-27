import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { referralDeps } from '../../../../lib/server/referralDeps'
import { confirmCorporateVerification } from '../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/**
 * Confirms a corporate-email link. Public (the referrer opens it from the
 * corporate mailbox, possibly signed out), single use, rate limited per client,
 * and the answer never says which referrer or address the token belonged to.
 */
export async function POST(req: Request) {
  try {
    const limited = rateLimited(req, 'referrer.verify', 60, 15 * 60_000)
    if (limited) return limited
    const body = (await readJson(req)) as { token?: string }
    if (!body.token || typeof body.token !== 'string' || body.token.length > 200) return NextResponse.json({ result: 'invalid' })
    return NextResponse.json({ result: await confirmCorporateVerification(referralDeps(), body.token) })
  } catch (error) {
    return errorResponse(error, 'POST /api/referrer/verify')
  }
}
