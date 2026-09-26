import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { recordAudit } from '../../../../../lib/server/audit'
import { getPlan, parsePlanInput, savePlan } from '../../../../../lib/server/plans'
import { isResponse, requireRole } from '../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

/** Updates a plan (features, limits, prices, flags). Audited with before/after. Plans are never deleted; deactivate instead. */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const before = await getPlan(db, id)
    if (!before) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const input = parsePlanInput(await readJson(req), before)
    const plan = await savePlan(db, input)
    await recordAudit({ actorId: actor.userId, action: 'plan.update', entityType: 'billing_plan', entityId: id, before, after: plan })
    return NextResponse.json({ plan })
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/plans/[id]')
  }
}
