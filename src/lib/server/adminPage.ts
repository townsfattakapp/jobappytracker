import { notFound } from 'next/navigation'
import { currentActor, hasRole, PANEL_ROLES, type Actor, type PlatformRole } from './rbac'
import { getFeatureFlags } from './settings'
import { logEvent } from './log'

/**
 * Server-component gate for /admin pages. Visitors without a panel role get a
 * 404 so the panel is not discoverable; a disabled adminPanel flag hides it
 * for everyone except bootstrap admins (so it can be switched back on).
 */
export async function requireAdminPage(...wanted: PlatformRole[]): Promise<Actor> {
  const actor = await currentActor()
  if (!actor || !hasRole(actor, ...(wanted.length ? wanted : PANEL_ROLES))) {
    if (actor) logEvent('warn', 'security.admin_page_denied', { userId: actor.userId, wanted, roles: actor.roles })
    notFound()
  }
  const flags = await getFeatureFlags()
  if (!flags.adminPanel && !actor.bootstrapRoles.includes('admin')) notFound()
  return actor
}
