import { AI_FEATURE_KEYS, AI_PROVIDER_IDS, type AiFeature, type AiProviderId } from './types'

/**
 * Admin-managed AI policy (platform_settings key "ai"). Nothing here holds
 * a secret: keys come from the environment (or the learner's encrypted key).
 */
export interface AiFeaturePolicy {
  enabled: boolean
  /** Provider order for this feature; empty = the global order. */
  providers: AiProviderId[]
  /** Model override per provider. */
  models: Partial<Record<AiProviderId, string>>
}

export interface AiPolicy {
  enabled: boolean
  /** Global provider priority. */
  providerOrder: AiProviderId[]
  /** Providers allowed to receive sensitive content (resume, interview answers, drafts). Empty = the first configured provider only. */
  sensitiveProviders: AiProviderId[]
  timeoutMs: number
  maxRetries: number
  /** Maximum gateway calls per learner per day across all features (0 = unlimited). */
  dailyCallsPerUser: number
  features: Record<AiFeature, AiFeaturePolicy>
}

export const DEFAULT_AI_POLICY: AiPolicy = {
  enabled: true,
  providerOrder: ['groq', 'gemini', 'mistral', 'openrouter', 'openai', 'fixture'],
  sensitiveProviders: [],
  timeoutMs: 20_000,
  maxRetries: 1,
  dailyCallsPerUser: 200,
  features: {} as Record<AiFeature, AiFeaturePolicy>,
}

const isProvider = (v: unknown): v is AiProviderId => typeof v === 'string' && (AI_PROVIDER_IDS as string[]).includes(v)
const providerList = (v: unknown): AiProviderId[] => (Array.isArray(v) ? Array.from(new Set(v.filter(isProvider))) : [])
const emptyFeatures = (): Record<AiFeature, AiFeaturePolicy> => Object.fromEntries(AI_FEATURE_KEYS.map((k) => [k, { enabled: true, providers: [] as AiProviderId[], models: {} as Partial<Record<AiProviderId, string>> }])) as unknown as Record<AiFeature, AiFeaturePolicy>

const int = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback
}

export function normalizeAiPolicy(value: unknown): AiPolicy {
  const out: AiPolicy = { ...DEFAULT_AI_POLICY, providerOrder: [...DEFAULT_AI_POLICY.providerOrder], sensitiveProviders: [], features: emptyFeatures() }
  if (!value || typeof value !== 'object') return out
  const v = value as Record<string, unknown>
  if (typeof v.enabled === 'boolean') out.enabled = v.enabled
  const order = providerList(v.providerOrder)
  if (order.length) out.providerOrder = order
  out.sensitiveProviders = providerList(v.sensitiveProviders)
  out.timeoutMs = int(v.timeoutMs, DEFAULT_AI_POLICY.timeoutMs, 2_000, 120_000)
  out.maxRetries = int(v.maxRetries, DEFAULT_AI_POLICY.maxRetries, 0, 3)
  out.dailyCallsPerUser = int(v.dailyCallsPerUser, DEFAULT_AI_POLICY.dailyCallsPerUser, 0, 100_000)
  if (v.features && typeof v.features === 'object') {
    for (const key of AI_FEATURE_KEYS) {
      const f = (v.features as Record<string, unknown>)[key]
      if (!f || typeof f !== 'object') continue
      const ff = f as Record<string, unknown>
      const models: Partial<Record<AiProviderId, string>> = {}
      if (ff.models && typeof ff.models === 'object') for (const [p, m] of Object.entries(ff.models as Record<string, unknown>)) if (isProvider(p) && typeof m === 'string' && m.trim()) models[p] = m.trim().slice(0, 80)
      out.features[key] = { enabled: typeof ff.enabled === 'boolean' ? ff.enabled : true, providers: providerList(ff.providers), models }
    }
  }
  return out
}

DEFAULT_AI_POLICY.features = emptyFeatures()
