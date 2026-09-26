import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { listIngestionRuns, providerHealth } from '../../../../../lib/server/ingestion'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireRole('jobs_editor', 'support')
  if (isResponse(actor)) return actor
  try {
    const url = new URL(req.url)
    const [runs, providers] = await Promise.all([listIngestionRuns({ sourceId: url.searchParams.get('sourceId') || undefined, limit: Number(url.searchParams.get('limit') || 50) || 50 }), providerHealth()])
    return NextResponse.json({ runs, providers })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/ingestion/runs')
  }
}
