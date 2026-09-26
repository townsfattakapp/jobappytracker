import { NextResponse } from 'next/server'
import { PLATFORM_ROLES, type PlatformRole } from '../../../../../../lib/db/schema'
import { ValidationError } from '../../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../../lib/server/apiErrors'
import { setUserRoles } from '../../../../../../lib/server/jobs'
import { isResponse, requireRole } from '../../../../../../lib/server/rbac'

export const dynamic = 'force-dynamic'

/** Replaces the target user's roles. Only admins may do this and never at their own expense. */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const { id } = await ctx.params
    const body = (await readJson(req)) as { roles?: unknown }
    if (!Array.isArray(body?.roles)) throw new ValidationError('roles must be a list', 'roles')
    const roles = Array.from(new Set(body.roles.map(String))) as PlatformRole[]
    for (const r of roles) if (!(PLATFORM_ROLES as readonly string[]).includes(r)) throw new ValidationError(`Unknown role ${r}`, 'roles')
    if (id === actor.userId && !roles.includes('admin') && !actor.bootstrapRoles.includes('admin')) {
      throw new ValidationError('You cannot remove your own admin role', 'roles')
    }
    const result = await setUserRoles(id, roles, actor.userId)
    if (!result) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ roles: result })
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/users/[id]/roles')
  }
}
