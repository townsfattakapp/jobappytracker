import { eq } from 'drizzle-orm'
import { db } from '../db'
import { platformSettings } from '../db/schema'
import { DEFAULT_FEATURE_FLAGS, normalizeFeatureFlags, type FeatureFlags, type Tier, type TierLimits } from '../entitlements/features'
import { DEFAULT_ROLE_FAMILY_CONFIG, normalizeRoleFamilyConfig, type RoleFamilyConfig } from '../jobs/taxonomy'
import { resolvePlanForUser, type ResolvedPlan } from './subscriptions'

/** Platform-wide configuration stored as JSON documents keyed by name. */
export const SETTING_KEYS = { features: 'features', roleFamilies: 'roleFamilies' } as const

export async function readSetting<T>(key: string, fallback: T, normalize: (value: unknown) => T): Promise<T> {
  const row = await db.query.platformSettings.findFirst({ where: eq(platformSettings.key, key) })
  if (!row) return fallback
  return normalize(row.value)
}

export async function writeSetting(key: string, value: unknown, updatedBy: string | null): Promise<void> {
  await db
    .insert(platformSettings)
    .values({ key, value, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({ target: platformSettings.key, set: { value, updatedBy, updatedAt: new Date() } })
}

export function getFeatureFlags(): Promise<FeatureFlags> {
  return readSetting(SETTING_KEYS.features, DEFAULT_FEATURE_FLAGS, normalizeFeatureFlags)
}

export function getRoleFamilyConfig(): Promise<RoleFamilyConfig> {
  return readSetting(SETTING_KEYS.roleFamilies, DEFAULT_ROLE_FAMILY_CONFIG, normalizeRoleFamilyConfig)
}

export interface PlatformConfig {
  flags: FeatureFlags
  /** The learner's plan id (admin-managed); kept under the historical name. */
  tier: Tier
  plan: { id: string; displayName: string; isDefault: boolean }
  /** Where the plan came from: subscription, legacy pass, allowlist or the default plan. */
  planSource: ResolvedPlan['source']
  accessEndsAt: string | null
  features: string[]
  limits: TierLimits
  signedIn: boolean
  /** Role families switched off by admins (hidden from learner filters). */
  disabledRoleFamilies: string[]
}

/** What the client needs to decide which modules and features to show. Entitlements come from the resolved plan only. */
export async function platformConfigFor(userId: string | null, email: string | null | undefined): Promise<PlatformConfig> {
  const [flags, roleFamilies, resolved] = await Promise.all([getFeatureFlags(), getRoleFamilyConfig(), resolvePlanForUser(db, userId, email)])
  return {
    flags,
    tier: resolved.plan.id,
    plan: { id: resolved.plan.id, displayName: resolved.plan.displayName, isDefault: resolved.plan.isDefault },
    planSource: resolved.source,
    accessEndsAt: resolved.accessEndsAt,
    features: resolved.plan.features,
    limits: resolved.plan.limits,
    signedIn: Boolean(userId),
    disabledRoleFamilies: roleFamilies.disabled,
  }
}
