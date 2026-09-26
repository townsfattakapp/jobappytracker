import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { db } from '../db'
import { userRoles, PLATFORM_ROLES, type PlatformRole } from '../db/schema'
import { logEvent } from './log'

/**
 * Role-based access control for the admin panel and /api/admin routes.
 *
 * Roles come from the `user_roles` table. Two environment lists bootstrap
 * roles without SQL so the first operator can sign in and grant the rest:
 *   PLATFORM_ADMINS="a@x.com,b@y.com"   → admin
 *   CURRICULUM_ADMINS="..."             → content_editor (existing variable)
 */

export type { PlatformRole }

export interface Actor {
  userId: string
  email: string
  name: string
  roles: PlatformRole[]
  /** Roles that come from environment bootstrap and cannot be revoked in the UI. */
  bootstrapRoles: PlatformRole[]
}

function envEmails(name: string): Set<string> {
  return new Set(
    (process.env[name] || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function bootstrapRolesFor(email: string | null | undefined): PlatformRole[] {
  if (!email) return []
  const lower = email.toLowerCase()
  const roles: PlatformRole[] = []
  if (envEmails('PLATFORM_ADMINS').has(lower)) roles.push('admin')
  if (envEmails('CURRICULUM_ADMINS').has(lower)) roles.push('content_editor')
  return roles
}

export async function rolesFor(userId: string, email: string | null | undefined): Promise<{ roles: PlatformRole[]; bootstrapRoles: PlatformRole[] }> {
  const rows = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, userId))
  const bootstrapRoles = bootstrapRolesFor(email)
  const roles = Array.from(new Set<PlatformRole>([...rows.map((r) => r.role), ...bootstrapRoles])).filter((r) => (PLATFORM_ROLES as readonly string[]).includes(r))
  return { roles, bootstrapRoles }
}

/** The signed-in account with its roles, or null when signed out. */
export async function currentActor(): Promise<Actor | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null
  const email = session.user?.email || ''
  const { roles, bootstrapRoles } = await rolesFor(userId, email)
  return { userId, email, name: session.user?.name || '', roles, bootstrapRoles }
}

/** Admins hold every permission; other roles are scoped. */
export function hasRole(actor: Actor | null, ...wanted: PlatformRole[]): boolean {
  if (!actor) return false
  if (actor.roles.includes('admin')) return true
  return wanted.some((r) => actor.roles.includes(r))
}

/** Roles allowed to reach the admin panel at all. */
export const PANEL_ROLES: PlatformRole[] = ['admin', 'content_editor', 'jobs_editor', 'support']

/** Route-handler gate: the actor, or a ready-made 401/403 JSON response. */
export async function requireRole(...wanted: PlatformRole[]): Promise<Actor | NextResponse> {
  const actor = await currentActor()
  if (!actor) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
  if (!hasRole(actor, ...wanted)) {
    logEvent('warn', 'security.forbidden', { userId: actor.userId, wanted, roles: actor.roles })
    return NextResponse.json({ error: 'You do not have permission to do this.', code: 'forbidden' }, { status: 403 })
  }
  return actor
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}
