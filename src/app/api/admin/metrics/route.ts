import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { adminMetrics } from '../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET() {
  const actor = await requireRole('admin', 'jobs_editor', 'content_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    return NextResponse.json(await adminMetrics())
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/metrics')
  }
}
