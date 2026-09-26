import { NextResponse } from 'next/server'
import { errorResponse } from '../../../lib/server/apiErrors'
import { dashboardFor } from '../../../lib/server/dashboard'
import { resolveAccess } from '../../../lib/server/entitlements'

export const dynamic = 'force-dynamic'

/** Career Command Center data for the signed-in learner (one request, no waterfall). */
export async function GET() {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    return NextResponse.json({ dashboard: await dashboardFor(access.userId, { personalised: access.can('jobs.personalizedFeed') }) })
  } catch (error) {
    return errorResponse(error, 'GET /api/dashboard')
  }
}
