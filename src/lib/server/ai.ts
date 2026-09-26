import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { db } from '../db'
import { aiUsageLog } from '../db/schema'
import { ADAPTERS } from '../ai/adapters'
import { runGateway, type GatewayDeps, type GatewayOutcome, type UsageRecord } from '../ai/gateway'
import { DEFAULT_AI_POLICY, normalizeAiPolicy, type AiPolicy } from '../ai/policy'
import { AI_FEATURES, type AiFeature, type AiProviderId, type AiRequest } from '../ai/types'
import { getUserAiKey } from './aiKeys'
import { readSetting, writeSetting } from './settings'
import { utcDay } from './entitlements'

/** Server binding of the AI gateway: policy from platform settings, usage log in PostgreSQL, adapters with environment keys. */
export const AI_SETTING_KEY = 'ai'

export function getAiPolicy(): Promise<AiPolicy> {
  return readSetting(AI_SETTING_KEY, DEFAULT_AI_POLICY, normalizeAiPolicy)
}

export async function saveAiPolicy(value: unknown, updatedBy: string | null): Promise<AiPolicy> {
  const policy = normalizeAiPolicy(value)
  await writeSetting(AI_SETTING_KEY, policy, updatedBy)
  return policy
}

async function record(row: UsageRecord): Promise<void> {
  try {
    await db.insert(aiUsageLog).values({ id: crypto.randomUUID(), requestId: row.requestId, userId: row.userId, feature: row.feature, provider: row.provider, model: row.model, status: row.status, errorKind: row.errorKind, errorId: row.errorId, sensitivity: row.sensitivity, promptChars: row.promptChars, promptTokens: row.promptTokens, completionTokens: row.completionTokens, latencyMs: row.latencyMs, attempts: row.attempts })
  } catch {
    // Accounting must never break the feature that called the gateway.
  }
}

async function callsToday(userId: string): Promise<number> {
  const start = new Date(`${utcDay()}T00:00:00.000Z`)
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(aiUsageLog).where(and(eq(aiUsageLog.userId, userId), gte(aiUsageLog.createdAt, start), eq(aiUsageLog.status, 'ok')))
  return row?.n ?? 0
}

export async function gatewayDeps(): Promise<GatewayDeps> {
  return { adapters: ADAPTERS, policy: await getAiPolicy(), record, callsToday }
}

/**
 * Runs one AI request for a signed-in learner (their own key first when it
 * matches policy). Returns the gateway outcome; callers keep their
 * deterministic result whatever happens here.
 */
export async function runAi<T = Record<string, unknown>>(input: Omit<AiRequest, 'userKey'> & { userKey?: AiRequest['userKey'] }, validate?: (data: Record<string, unknown>) => T | null): Promise<GatewayOutcome<T>> {
  const deps = await gatewayDeps()
  let userKey = input.userKey ?? null
  if (input.userKey === undefined && input.userId) {
    const own = await getUserAiKey(input.userId)
    if (own) userKey = { provider: own.provider as AiProviderId, key: own.key }
  }
  return runGateway<T>({ ...input, userKey }, deps, validate)
}

/** Whether any provider could answer a feature right now (for UI hints and health). */
export async function aiAvailability(userId: string | null): Promise<{ enabled: boolean; providers: AiProviderId[]; userKeyProvider: AiProviderId | null }> {
  const policy = await getAiPolicy()
  const providers = ADAPTERS.filter((a) => a.isConfigured()).map((a) => a.id)
  const own = userId ? await getUserAiKey(userId) : null
  return { enabled: policy.enabled, providers, userKeyProvider: (own?.provider as AiProviderId) ?? null }
}

export interface ProviderHealthRow {
  id: AiProviderId
  label: string
  configured: boolean
  models: string[]
  ok24h: number
  failed24h: number
  lastSuccessAt: string | null
  lastErrorAt: string | null
  lastErrorKind: string | null
  status: 'healthy' | 'degraded' | 'not_configured' | 'unknown'
}

export async function aiProviderHealth(): Promise<ProviderHealthRow[]> {
  const since = new Date(Date.now() - 24 * 3600_000)
  const rows = await db.select({ provider: aiUsageLog.provider, status: aiUsageLog.status, n: sql<number>`count(*)::int`, last: sql<string>`max("createdAt")::text` }).from(aiUsageLog).where(gte(aiUsageLog.createdAt, since)).groupBy(aiUsageLog.provider, aiUsageLog.status)
  const lastErrors = await db.select({ provider: aiUsageLog.provider, errorKind: aiUsageLog.errorKind, createdAt: aiUsageLog.createdAt }).from(aiUsageLog).where(and(gte(aiUsageLog.createdAt, since), eq(aiUsageLog.status, 'error'))).orderBy(desc(aiUsageLog.createdAt)).limit(50)
  return ADAPTERS.map((a) => {
    const ok = rows.find((r) => r.provider === a.id && r.status === 'ok')
    const failed = rows.find((r) => r.provider === a.id && r.status === 'error')
    const lastErr = lastErrors.find((e) => e.provider === a.id)
    const configured = a.isConfigured()
    const ok24h = ok?.n ?? 0
    const failed24h = failed?.n ?? 0
    const status: ProviderHealthRow['status'] = !configured ? 'not_configured' : ok24h + failed24h === 0 ? 'unknown' : failed24h > ok24h ? 'degraded' : 'healthy'
    return { id: a.id, label: a.label, configured, models: a.models, ok24h, failed24h, lastSuccessAt: ok?.last ? new Date(ok.last).toISOString() : null, lastErrorAt: lastErr ? lastErr.createdAt.toISOString() : null, lastErrorKind: lastErr?.errorKind ?? null, status }
  })
}

export async function aiUsageSummary(days = 7): Promise<{ feature: string; ok: number; failed: number; skipped: number; promptTokens: number; completionTokens: number }[]> {
  const since = new Date(Date.now() - days * 24 * 3600_000)
  const rows = await db.select({ feature: aiUsageLog.feature, status: aiUsageLog.status, n: sql<number>`count(*)::int`, pt: sql<number>`coalesce(sum("promptTokens"),0)::int`, ct: sql<number>`coalesce(sum("completionTokens"),0)::int` }).from(aiUsageLog).where(gte(aiUsageLog.createdAt, since)).groupBy(aiUsageLog.feature, aiUsageLog.status)
  return AI_FEATURES.map((f) => {
    const of = (s: string) => rows.find((r) => r.feature === f.key && r.status === s)
    return { feature: f.key, ok: of('ok')?.n ?? 0, failed: of('error')?.n ?? 0, skipped: of('skipped')?.n ?? 0, promptTokens: (of('ok')?.pt ?? 0) + (of('error')?.pt ?? 0), completionTokens: of('ok')?.ct ?? 0 }
  })
}

export async function recentAiFailures(limit = 20): Promise<{ id: string; createdAt: string; feature: string; provider: string | null; model: string | null; errorKind: string | null; errorId: string | null; attempts: number; latencyMs: number }[]> {
  const rows = await db.select().from(aiUsageLog).where(eq(aiUsageLog.status, 'error')).orderBy(desc(aiUsageLog.createdAt)).limit(limit)
  return rows.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString(), feature: r.feature, provider: r.provider, model: r.model, errorKind: r.errorKind, errorId: r.errorId, attempts: r.attempts, latencyMs: r.latencyMs }))
}

export const isAiFeature = (v: unknown): v is AiFeature => typeof v === 'string' && AI_FEATURES.some((f) => f.key === v)
