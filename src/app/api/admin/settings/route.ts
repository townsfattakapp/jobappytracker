import { NextResponse } from 'next/server'
import { normalizeFeatureFlags } from '../../../../lib/entitlements/features'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { normalizeRoleFamilyConfig } from '../../../../lib/jobs/taxonomy'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { recordAudit } from '../../../../lib/server/audit'
import { isResponse, requireRole } from '../../../../lib/server/rbac'
import { getFeatureFlags, getRoleFamilyConfig, SETTING_KEYS, writeSetting } from '../../../../lib/server/settings'

export const dynamic = 'force-dynamic'

async function snapshot() {
  const [flags, roleFamilies] = await Promise.all([getFeatureFlags(), getRoleFamilyConfig()])
  return { flags, roleFamilies }
}

export async function GET() {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    return NextResponse.json(await snapshot())
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/settings')
  }
}

/** Body: any subset of { flags, roleFamilies }. Entitlements and limits live on plans (/api/admin/plans). Each written key is audited. */
export async function PUT(req: Request) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req)) as { flags?: unknown; roleFamilies?: unknown }
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    const before = await snapshot()
    const writes: { key: string; action: string; value: unknown; before: unknown }[] = []
    if (body.flags !== undefined) writes.push({ key: SETTING_KEYS.features, action: 'settings.features', value: normalizeFeatureFlags(body.flags), before: before.flags })
    if (body.roleFamilies !== undefined) writes.push({ key: SETTING_KEYS.roleFamilies, action: 'settings.roleFamilies', value: normalizeRoleFamilyConfig(body.roleFamilies), before: before.roleFamilies })
    for (const w of writes) {
      await writeSetting(w.key, w.value, actor.userId)
      await recordAudit({ actorId: actor.userId, action: w.action, entityType: 'platform_settings', entityId: w.key, before: w.before, after: w.value })
    }
    return NextResponse.json(await snapshot())
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/settings')
  }
}
