import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { currentActor, hasRole, PANEL_ROLES } from '../../../../lib/server/rbac'
import { platformConfigFor } from '../../../../lib/server/settings'

export const dynamic = 'force-dynamic'

/** Feature flags, the caller's tier and feature keys, and whether the admin panel link should show. */
export async function GET() {
  try {
    const session = await auth()
    const config = await platformConfigFor(session?.user?.id || null, session?.user?.email)
    const actor = session?.user?.id ? await currentActor() : null
    return NextResponse.json({ ...config, canOpenAdmin: config.flags.adminPanel && hasRole(actor, ...PANEL_ROLES) })
  } catch (error) {
    return errorResponse(error, 'GET /api/platform/config')
  }
}
