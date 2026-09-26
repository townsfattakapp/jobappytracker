import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { recordAudit } from '../../../../lib/server/audit'
import { listPlans, parsePlanInput, savePlan } from '../../../../lib/server/plans'
import { isResponse, requireRole } from '../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

export async function GET() {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    return NextResponse.json({ plans: await listPlans(db) })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/plans')
  }
}

/** Creates a plan. Audited. */
export async function POST(req: Request) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const input = parsePlanInput(await readJson(req))
    const existing = (await listPlans(db)).find((p) => p.id === input.id)
    if (existing) return NextResponse.json({ error: `Plan "${input.id}" already exists; edit it instead.` }, { status: 409 })
    const plan = await savePlan(db, input)
    await recordAudit({ actorId: actor.userId, action: 'plan.create', entityType: 'billing_plan', entityId: plan.id, after: plan })
    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    return errorResponse(error, 'POST /api/admin/plans')
  }
}
