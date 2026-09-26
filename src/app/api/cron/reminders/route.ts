import { NextResponse } from 'next/server'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { cronAuthorized } from '../../../../lib/server/cronAuth'
import { logEvent } from '../../../../lib/server/log'
import { runReminderPass } from '../../../../lib/server/notifications'

export const dynamic = 'force-dynamic'

/** Daily reminder pass (tracker follow-ups, outreach follow-ups). Inert until CRON_SECRET is set; no cron is configured. */
export async function GET(req: Request) {
  const authz = cronAuthorized(req.headers)
  if (!authz.ok) {
    if (authz.reason !== 'not_configured') logEvent('warn', 'cron.auth_failed', { route: 'reminders', reason: authz.reason })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    return NextResponse.json(await runReminderPass())
  } catch (error) {
    return errorResponse(error, 'GET /api/cron/reminders')
  }
}
