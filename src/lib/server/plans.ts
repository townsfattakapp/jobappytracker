import { asc, eq, sql } from 'drizzle-orm'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from '../db/schema'
import { DEFAULT_TIER_FEATURES, DEFAULT_TIER_LIMITS, FEATURE_KEYS, LIMIT_KEYS, type TierLimits } from '../entitlements/features'
import { ValidationError } from '../jobs/normalize'

/**
 * Admin-managed plans. A plan carries its own feature keys and limits, so
 * the entitlement engine never needs to know plan names. Two development
 * fixtures ("free" default, "pro") are seeded when the table is empty; they
 * are not commercial pricing.
 */

export type PlansDb = PgDatabase<PgQueryResultHKT, typeof schema>
const { billingPlans } = schema

export interface PlanDto {
  id: string
  name: string
  displayName: string
  description: string | null
  monthlyPriceMinor: number
  annualPriceMinor: number
  currency: string
  active: boolean
  isDefault: boolean
  highlighted: boolean
  displayOrder: number
  features: string[]
  limits: TierLimits
  trialDays: number
  providerPlanIds: Record<string, string>
  createdAt: string
  updatedAt: string
}

export function normalizeLimits(value: unknown, base: TierLimits): TierLimits {
  const out: TierLimits = { ...base }
  if (!value || typeof value !== 'object') return out
  const v = value as Record<string, unknown>
  for (const { key } of LIMIT_KEYS) {
    const n = v[key]
    if (typeof n === 'number' && Number.isFinite(n) && n >= 0) out[key] = Math.floor(n)
    else if (typeof n === 'string' && n.trim() !== '' && Number.isFinite(Number(n)) && Number(n) >= 0) out[key] = Math.floor(Number(n))
  }
  return out
}

export function toPlanDto(row: typeof billingPlans.$inferSelect): PlanDto {
  return {
    ...row,
    features: (row.features || []).filter((f) => FEATURE_KEYS.includes(f)),
    limits: normalizeLimits(row.limits, row.isDefault ? DEFAULT_TIER_LIMITS.free : DEFAULT_TIER_LIMITS.pro),
    providerPlanIds: row.providerPlanIds || {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** Development fixtures, seeded once; admins edit everything afterwards. */
export const SEED_PLANS: Omit<PlanDto, 'createdAt' | 'updatedAt'>[] = [
  { id: 'free', name: 'free', displayName: 'Free', description: 'Core learning experience, limited job discovery, application tracker, basic networking guidance and resume storage.', monthlyPriceMinor: 0, annualPriceMinor: 0, currency: 'INR', active: true, isDefault: true, highlighted: false, displayOrder: 0, features: DEFAULT_TIER_FEATURES.free, limits: DEFAULT_TIER_LIMITS.free, trialDays: 0, providerPlanIds: {} },
  { id: 'pro', name: 'pro', displayName: 'Prep Pro', description: 'Full job matching, resume-vs-job intelligence, curriculum gap analysis, application strategy, referral drafts, Prepare for This Job with 7/14/30-day plans, interview kit and higher usage limits.', monthlyPriceMinor: 19900, annualPriceMinor: 199000, currency: 'INR', active: true, isDefault: false, highlighted: true, displayOrder: 1, features: DEFAULT_TIER_FEATURES.pro, limits: DEFAULT_TIER_LIMITS.pro, trialDays: 0, providerPlanIds: {} },
]

export async function ensurePlansSeeded(db: PlansDb): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(billingPlans)
  if (count > 0) return
  const now = new Date()
  await db.insert(billingPlans).values(SEED_PLANS.map((p) => ({ ...p, createdAt: now, updatedAt: now }))).onConflictDoNothing()
}

export async function listPlans(db: PlansDb, opts: { activeOnly?: boolean } = {}): Promise<PlanDto[]> {
  await ensurePlansSeeded(db)
  const rows = await db.select().from(billingPlans).where(opts.activeOnly ? eq(billingPlans.active, true) : undefined).orderBy(asc(billingPlans.displayOrder), asc(billingPlans.id))
  return rows.map(toPlanDto)
}

export async function getPlan(db: PlansDb, id: string): Promise<PlanDto | null> {
  await ensurePlansSeeded(db)
  const row = await db.query.billingPlans.findFirst({ where: eq(billingPlans.id, id) })
  return row ? toPlanDto(row) : null
}

/** The plan accounts fall back to (isDefault, else the cheapest active plan). */
export async function defaultPlan(db: PlansDb): Promise<PlanDto> {
  const plans = await listPlans(db, { activeOnly: true })
  return plans.find((p) => p.isDefault) ?? plans.sort((a, b) => a.monthlyPriceMinor - b.monthlyPriceMinor)[0] ?? toPlanDto({ ...SEED_PLANS[0], createdAt: new Date(), updatedAt: new Date() } as typeof billingPlans.$inferSelect)
}

/** Plan honoured for legacy one-time passes and the operator allowlist: the highlighted active paid plan, else the most expensive. */
export async function legacyPaidPlan(db: PlansDb): Promise<PlanDto> {
  const plans = (await listPlans(db, { activeOnly: true })).filter((p) => !p.isDefault && (p.monthlyPriceMinor > 0 || p.annualPriceMinor > 0))
  return plans.find((p) => p.id === 'pro') ?? plans.find((p) => p.highlighted) ?? plans.sort((a, b) => b.monthlyPriceMinor - a.monthlyPriceMinor)[0] ?? defaultPlan(db)
}

export interface PlanInput {
  id: string
  name: string
  displayName: string
  description: string | null
  monthlyPriceMinor: number
  annualPriceMinor: number
  currency: string
  active: boolean
  isDefault: boolean
  highlighted: boolean
  displayOrder: number
  features: string[]
  limits: TierLimits
  trialDays: number
  providerPlanIds: Record<string, string>
}

const str = (v: unknown, field: string, max: number, required = false): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!s) {
    if (required) throw new ValidationError(`${field} is required`, field)
    return null
  }
  return s.slice(0, max)
}
const int = (v: unknown, field: string, fallback: number): number => {
  if (v === undefined || v === null || v === '') return fallback
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) throw new ValidationError(`${field} must be a whole number ≥ 0`, field)
  return n
}

export function parsePlanInput(body: unknown, existing?: PlanDto): PlanInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
  const b = body as Record<string, unknown>
  const id = existing?.id ?? str(b.id, 'Plan id', 40, true)!.toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(id)) throw new ValidationError('Plan id must be lower-case letters, digits and dashes', 'id')
  const features = Array.isArray(b.features) ? Array.from(new Set(b.features.map(String).filter((f) => FEATURE_KEYS.includes(f)))) : (existing?.features ?? [])
  const currency = (str(b.currency, 'Currency', 3) ?? existing?.currency ?? 'INR').toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) throw new ValidationError('Currency must be a 3-letter code', 'currency')
  const providerPlanIds: Record<string, string> = {}
  if (b.providerPlanIds && typeof b.providerPlanIds === 'object') {
    for (const [k, v] of Object.entries(b.providerPlanIds as Record<string, unknown>)) if (['monthly', 'annual'].includes(k) && typeof v === 'string' && v.trim()) providerPlanIds[k] = v.trim().slice(0, 80)
  }
  return {
    id,
    name: str(b.name, 'Name', 60) ?? existing?.name ?? id,
    displayName: str(b.displayName, 'Display name', 80) ?? existing?.displayName ?? id,
    description: b.description === undefined ? (existing?.description ?? null) : str(b.description, 'Description', 600),
    monthlyPriceMinor: int(b.monthlyPriceMinor, 'Monthly price', existing?.monthlyPriceMinor ?? 0),
    annualPriceMinor: int(b.annualPriceMinor, 'Annual price', existing?.annualPriceMinor ?? 0),
    currency,
    active: typeof b.active === 'boolean' ? b.active : (existing?.active ?? true),
    isDefault: typeof b.isDefault === 'boolean' ? b.isDefault : (existing?.isDefault ?? false),
    highlighted: typeof b.highlighted === 'boolean' ? b.highlighted : (existing?.highlighted ?? false),
    displayOrder: int(b.displayOrder, 'Display order', existing?.displayOrder ?? 0),
    features,
    limits: normalizeLimits(b.limits, existing?.limits ?? DEFAULT_TIER_LIMITS.free),
    trialDays: Math.min(90, int(b.trialDays, 'Trial days', existing?.trialDays ?? 0)),
    providerPlanIds: b.providerPlanIds === undefined ? (existing?.providerPlanIds ?? {}) : providerPlanIds,
  }
}

export async function savePlan(db: PlansDb, input: PlanInput): Promise<PlanDto> {
  await ensurePlansSeeded(db)
  const now = new Date()
  if (input.isDefault) await db.update(billingPlans).set({ isDefault: false, updatedAt: now }).where(sql`${billingPlans.id} <> ${input.id}`)
  const [row] = await db
    .insert(billingPlans)
    .values({ ...input, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: billingPlans.id, set: { ...input, updatedAt: now } })
    .returning()
  return toPlanDto(row)
}
