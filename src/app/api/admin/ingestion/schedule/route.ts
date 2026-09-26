import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { runScheduler } from '../../../../../lib/server/ingestion'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

/** Runs the scheduled ingestion pass now (every enabled provider source, retries, sweep). Body: { sourceIds?: string[] } */
export async function POST(req: Request) {
  const actor = await requireRole('jobs_editor')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req).catch(() => ({}))) as { sourceIds?: unknown }
    const sourceIds = Array.isArray(body?.sourceIds) ? body.sourceIds.map(String).slice(0, 50) : undefined
    return NextResponse.json(await runScheduler(actor.userId, { sourceIds }))
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/ingestion/schedule')
  }
}
