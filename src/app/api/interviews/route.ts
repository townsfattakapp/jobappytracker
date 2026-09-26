import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { errorResponse } from '../../../lib/server/apiErrors'
import { resolveAccess } from '../../../lib/server/entitlements'
import { listSessions, toHistoryItem } from '../../../lib/server/interviews'

export const dynamic = 'force-dynamic'

/** All job-specific interview attempts of the signed-in learner (for the Mock Interview workspace); limited to the latest without the history entitlement. */
export async function GET() {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const rows = (await listSessions(db, access.userId)).filter((r) => r.status !== 'active').map(toHistoryItem)
    return NextResponse.json({ history: access.can('interview.history') ? rows : rows.slice(0, 1), total: rows.length })
  } catch (error) {
    return errorResponse(error, 'GET /api/interviews')
  }
}
