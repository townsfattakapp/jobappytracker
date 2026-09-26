import { and, eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { db } from '../db'
import { usageCounters } from '../db/schema'
import { hasFeature, type Tier, type TierLimits } from '../entitlements/features'
import { platformConfigFor, type PlatformConfig } from './settings'

/**
 * The single server-side entry point for "may this caller use feature X".
 * Route handlers call `resolveAccess()` once and then check `can(key)`;
 * nobody compares plan names or reads the subscriptions table directly.
 */

export interface Access {
  userId: string | null
  email: string | null
  tier: Tier
  features: string[]
  limits: TierLimits
  config: PlatformConfig
  can: (feature: string) => boolean
}

export async function resolveAccess(): Promise<Access> {
  const session = await auth()
  const userId = session?.user?.id || null
  const email = session?.user?.email || null
  const config = await platformConfigFor(userId, email)
  return { userId, email, tier: config.tier, features: config.features, limits: config.limits, config, can: (feature) => hasFeature(config.features, feature) }
}

export const UPGRADE_CODE = 'upgrade'

/** Standard response when a feature is outside the caller's tier: 401 signed out, 402 with code "upgrade" otherwise. */
export function featureLockedResponse(feature: string, access: Access): NextResponse {
  if (!access.userId) return NextResponse.json({ error: 'Sign in to use this feature.', code: 'sign_in', feature }, { status: 401 })
  return NextResponse.json({ error: 'This feature is part of Prep Pro.', code: UPGRADE_CODE, feature, tier: access.tier }, { status: 402 })
}

/** Resolves access and returns either the access or a locked response. */
export async function requireFeature(feature: string): Promise<Access | NextResponse> {
  const access = await resolveAccess()
  if (!access.can(feature)) return featureLockedResponse(feature, access)
  return access
}

export const utcDay = (now: Date = new Date()) => now.toISOString().slice(0, 10)

/**
 * Atomically counts one use of a limited feature for today and reports
 * whether the caller is still within the limit. `limit` 0 means "none".
 */
export async function consumeUsage(userId: string, key: string, limit: number, now: Date = new Date()): Promise<{ allowed: boolean; used: number; limit: number }> {
  const day = utcDay(now)
  if (limit <= 0) return { allowed: false, used: 0, limit }
  const [row] = await db
    .insert(usageCounters)
    .values({ userId, key, day, count: 1, updatedAt: now })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.key, usageCounters.day],
      set: { count: sql`${usageCounters.count} + 1`, updatedAt: now },
    })
    .returning({ count: usageCounters.count })
  const used = row.count
  if (used > limit) {
    // Roll the increment back so the counter reflects real usage only.
    await db.update(usageCounters).set({ count: sql`${usageCounters.count} - 1` }).where(and(eq(usageCounters.userId, userId), eq(usageCounters.key, key), eq(usageCounters.day, day)))
    return { allowed: false, used: used - 1, limit }
  }
  return { allowed: true, used, limit }
}

export async function usageToday(userId: string, key: string, now: Date = new Date()): Promise<number> {
  const row = await db.query.usageCounters.findFirst({ where: and(eq(usageCounters.userId, userId), eq(usageCounters.key, key), eq(usageCounters.day, utcDay(now))) })
  return row?.count ?? 0
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}
