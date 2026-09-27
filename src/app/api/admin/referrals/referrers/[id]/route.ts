import { NextResponse } from 'next/server'
import { errorResponse, readJson } from '../../../../../../lib/server/apiErrors'
import { isResponse, requireRole } from '../../../../../../lib/server/rbac'
import { referralDeps } from '../../../../../../lib/server/referralDeps'
import { adminUpdateReferrer, type AdminReferrerAction } from '../../../../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

/** Body: AdminReferrerAction (verify, reject, suspend, reverify, pause, resume, capacity, notes, roleFamilies). Admin only, audited. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const body = (await readJson(req)) as AdminReferrerAction
    if (!['verify', 'reject', 'suspend', 'reverify', 'pause', 'resume', 'capacity', 'notes', 'roleFamilies'].includes(String((body as { action?: string }).action))) return NextResponse.json({ error: 'Unknown action', field: 'action' }, { status: 400 })
    return NextResponse.json({ referrer: await adminUpdateReferrer(referralDeps(), id, body, actor.userId) })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/referrals/referrers/[id]')
  }
}
