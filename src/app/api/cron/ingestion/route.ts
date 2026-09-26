import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { cronAuthorized } from '../../../../lib/server/cronAuth'
import { runScheduler } from '../../../../lib/server/ingestion'
import { logEvent } from '../../../../lib/server/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Deploy-ready entry point for a platform cron (for example a Vercel cron
 * hitting GET /api/cron/ingestion). It is inert until CRON_SECRET is set and
 * the caller presents it; no cron is configured in this repository yet.
 */
export async function GET(req: Request) {
  const authz = cronAuthorized(req.headers)
  if (!authz.ok) {
    if (authz.reason !== 'not_configured') logEvent('warn', 'cron.auth_failed', { route: 'ingestion', reason: authz.reason })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    return NextResponse.json(await runScheduler(null, {}))
  } catch (error) {
    return errorResponse(error, 'GET /api/cron/ingestion')
  }
}
