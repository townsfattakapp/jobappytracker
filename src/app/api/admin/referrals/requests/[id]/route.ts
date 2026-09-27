import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../../../lib/server/apiErrors'
import { isResponse, requireRole } from '../../../../../../lib/server/rbac'
import { referralDeps } from '../../../../../../lib/server/referralDeps'
import { adminGetRequest, adminRequestAction, type AdminRequestAction } from '../../../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const request = await adminGetRequest(referralDeps(), id)
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    return NextResponse.json({ request })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/referrals/requests/[id]')
  }
}

/** Body: AdminRequestAction (assign, reassign, close, note, retry_matching, confirm). Admin only, audited. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const body = (await readJson(req)) as AdminRequestAction
    if (!['assign', 'reassign', 'close', 'note', 'retry_matching', 'confirm'].includes(String((body as { action?: string }).action))) return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
    return NextResponse.json({ request: await adminRequestAction(referralDeps(), id, body, actor.userId) })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/referrals/requests/[id]')
  }
}
