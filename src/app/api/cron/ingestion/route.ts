import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { cronAuthorized } from '../../../../lib/server/cronAuth'
import { runScheduler } from '../../../../lib/server/ingestion'
import { logEvent } from '../../../../lib/server/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Entry point for the platform cron (vercel.json schedules GET
 * /api/cron/ingestion; Vercel presents CRON_SECRET as the bearer token). Inert
 * until CRON_SECRET is set. Each pass works through the least-recently-run
 * sources inside a time budget below the function limit and defers the rest
 * to the next pass, so a large catalog is covered across passes.
 */
const PASS_BUDGET_MS = Math.max(30_000, Number(process.env.INGESTION_PASS_BUDGET_MS) || 240_000)
export async function GET(req: Request) {
  const authz = cronAuthorized(req.headers)
  if (!authz.ok) {
    if (authz.reason !== 'not_configured') logEvent('warn', 'cron.auth_failed', { route: 'ingestion', reason: authz.reason })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    return NextResponse.json(await runScheduler(null, { budgetMs: PASS_BUDGET_MS }))
  } catch (error) {
    return errorResponse(error, 'GET /api/cron/ingestion')
  }
}
