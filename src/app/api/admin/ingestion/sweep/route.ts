import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { runLifecycleSweep } from '../../../../../lib/server/ingestion'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

/** Marks stale and expired jobs by age and expiry date. Safe to run repeatedly. */
export async function POST() {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    return NextResponse.json(await runLifecycleSweep(actor.userId))
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/ingestion/sweep')
  }
}
