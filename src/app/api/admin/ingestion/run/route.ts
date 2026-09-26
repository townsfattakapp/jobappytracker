import { NextResponse } from 'next/server'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { runSourceIngestion } from '../../../../../lib/server/ingestion'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

/** Body: { sourceId }. Runs the source's provider once and records the run. */
export async function POST(req: Request) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req)) as { sourceId?: string }
    const sourceId = typeof body?.sourceId === 'string' ? body.sourceId : ''
    if (!sourceId) throw new ValidationError('sourceId is required', 'sourceId')
    const result = await runSourceIngestion(sourceId, actor.userId)
    if (!result) return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : 422 })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/ingestion/run')
  }
}
