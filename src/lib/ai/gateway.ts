import { newErrorId, logEvent } from '../server/log'
import { AI_FEATURES, AiError, type AiAdapter, type AiAttempt, type AiGatewayError, type AiProviderId, type AiRequest, type AiResult, type AiUsage } from './types'
import type { AiPolicy } from './policy'

/**
 * The gateway core. Pure apart from the injected dependencies, so tests can
 * drive provider failures, timeouts, malformed output, rate limits and
 * fallback without a network.
 */
export interface UsageRecord {
  requestId: string
  userId: string | null
  feature: string
  provider: AiProviderId | null
  model: string | null
  status: 'ok' | 'error' | 'skipped'
  errorKind: string | null
  errorId: string | null
  promptChars: number
  promptTokens: number | null
  completionTokens: number | null
  latencyMs: number
  attempts: number
  sensitivity: AiRequest['sensitivity']
}

export interface GatewayDeps {
  adapters: AiAdapter[]
  policy: AiPolicy
  record: (row: UsageRecord) => Promise<void>
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  /** Calls the learner made today, for the per-user daily cap. */
  callsToday?: (userId: string) => Promise<number>
}

export type GatewayOutcome<T> = { ok: true; result: AiResult<T> } | { ok: false; error: AiGatewayError }

const RETRYABLE = new Set(['rate_limit', 'timeout', 'server', 'network', 'malformed'])

export function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  const candidates = [trimmed, trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')]
  const first = trimmed.indexOf('{')
  const last = trimmed.lastIndexOf('}')
  if (first >= 0 && last > first) candidates.push(trimmed.slice(first, last + 1))
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>
    } catch {
      // try the next candidate
    }
  }
  return null
}

/** Provider/model candidates for a request in policy order, honouring configuration, the learner's own key and data-handling rules. */
export function resolveCandidates(req: AiRequest, deps: GatewayDeps): { adapter: AiAdapter; model: string; apiKey: string; own: boolean }[] {
  const policy = deps.policy
  const fp = policy.features[req.feature]
  const order = fp?.providers.length ? fp.providers : policy.providerOrder
  const out: { adapter: AiAdapter; model: string; apiKey: string; own: boolean }[] = []
  const push = (id: AiProviderId, own: boolean) => {
    const adapter = deps.adapters.find((a) => a.id === id)
    if (!adapter) return
    const apiKey = own ? req.userKey!.key : adapter.keyFromEnv()
    if (!apiKey) return
    if (out.some((o) => o.adapter.id === id)) return
    const model = fp?.models[id] || adapter.models[0]
    out.push({ adapter, model, apiKey, own })
  }
  if (req.userKey && order.includes(req.userKey.provider)) push(req.userKey.provider, true)
  if (req.preferProvider) push(req.preferProvider, false)
  for (const id of order) push(id, false)
  if (req.sensitivity === 'sensitive') {
    // Sensitive content goes to one provider only: the learner's own key, or the first allowed configured provider. No cross-provider fallback.
    const allowed = policy.sensitiveProviders.length ? out.filter((o) => o.own || policy.sensitiveProviders.includes(o.adapter.id)) : out
    return allowed.slice(0, 1)
  }
  return out
}

export async function runGateway<T = Record<string, unknown>>(req: AiRequest, deps: GatewayDeps, validate?: (data: Record<string, unknown>) => T | null): Promise<GatewayOutcome<T>> {
  const now = deps.now ?? (() => Date.now())
  const sleep = deps.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)))
  const fetchImpl = deps.fetchImpl ?? fetch
  const requestId = `ai_${newErrorId().slice(2).toLowerCase()}`
  const started = now()
  const promptChars = req.messages.reduce((s, m) => s + m.content.length, 0)
  const attempts: AiAttempt[] = []
  const fail = async (kind: AiGatewayError['kind'], message: string, provider: AiProviderId | null = null, model: string | null = null): Promise<GatewayOutcome<T>> => {
    const errorId = newErrorId()
    logEvent(kind === 'disabled' || kind === 'not_configured' || kind === 'policy' ? 'info' : 'warn', 'ai.request_failed', { errorId, requestId, feature: req.feature, kind, message, attempts: attempts.length, provider })
    await deps.record({ requestId, userId: req.userId, feature: req.feature, provider, model, status: kind === 'disabled' || kind === 'not_configured' || kind === 'policy' ? 'skipped' : 'error', errorKind: kind, errorId, promptChars, promptTokens: null, completionTokens: null, latencyMs: now() - started, attempts: attempts.length, sensitivity: req.sensitivity })
    return { ok: false, error: { errorId, kind, message, attempts } }
  }
  const featureDef = AI_FEATURES.find((f) => f.key === req.feature)
  if (!featureDef) return fail('policy', `unknown feature ${req.feature}`)
  if (!deps.policy.enabled) return fail('disabled', 'AI is switched off by the administrator')
  if (!deps.policy.features[req.feature]?.enabled) return fail('disabled', `AI is switched off for ${featureDef.label}`)
  if (featureDef.sensitive && req.sensitivity !== 'sensitive') return fail('policy', `${req.feature} must be sent as sensitive`)
  if (deps.policy.dailyCallsPerUser > 0 && req.userId && deps.callsToday) {
    const used = await deps.callsToday(req.userId)
    if (used >= deps.policy.dailyCallsPerUser) return fail('rate_limit', `daily AI allowance of ${deps.policy.dailyCallsPerUser} calls reached`)
  }
  const candidates = resolveCandidates(req, deps)
  if (!candidates.length) return fail('not_configured', 'no AI provider is configured for this request')
  const temperature = typeof req.temperature === 'number' && req.temperature >= 0 && req.temperature <= 2 ? req.temperature : 0.3
  const maxTokens = Math.min(8000, Math.max(64, req.maxTokens ?? 1200))
  let lastKind: AiGatewayError['kind'] = 'server'
  let lastMessage = 'no provider answered'
  for (const c of candidates) {
    let nudged = false
    let messages = req.messages
    for (let attempt = 0; attempt <= deps.policy.maxRetries; attempt++) {
      const t0 = now()
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), deps.policy.timeoutMs)
      try {
        const reply = await c.adapter.call({ model: c.model, messages, temperature, json: Boolean(req.json), maxTokens, signal: controller.signal, fetchImpl }, c.apiKey)
        clearTimeout(timer)
        const latencyMs = now() - t0
        let data: T | null = null
        if (req.json) {
          const parsed = extractJsonObject(reply.content)
          const valid = parsed ? (validate ? validate(parsed) : (parsed as unknown as T)) : null
          if (!valid) {
            attempts.push({ provider: c.adapter.id, model: c.model, status: 'error', errorKind: parsed ? 'validation' : 'malformed', latencyMs })
            lastKind = parsed ? 'validation' : 'malformed'
            lastMessage = parsed ? 'provider JSON did not match the expected shape' : 'provider did not return JSON'
            if (!nudged && attempt < deps.policy.maxRetries) {
              nudged = true
              messages = [...req.messages, { role: 'user', content: 'Your previous reply was not a valid JSON object of the requested shape. Reply with only the JSON object.' }]
              continue
            }
            break
          }
          data = valid
        }
        attempts.push({ provider: c.adapter.id, model: c.model, status: 'ok', latencyMs })
        const usage: AiUsage = reply.usage
        await deps.record({ requestId, userId: req.userId, feature: req.feature, provider: c.adapter.id, model: reply.model, status: 'ok', errorKind: null, errorId: null, promptChars, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens, latencyMs: now() - started, attempts: attempts.length, sensitivity: req.sensitivity })
        return { ok: true, result: { content: reply.content, data, provider: c.adapter.id, model: reply.model, usage, latencyMs: now() - started, attempts, requestId } }
      } catch (error) {
        clearTimeout(timer)
        const e = error instanceof AiError || (error && typeof error === 'object' && (error as { name?: string }).name === 'AiError' && 'kind' in error) ? (error as AiError) : new AiError('server', (error as Error)?.message || 'provider failure')
        attempts.push({ provider: c.adapter.id, model: c.model, status: 'error', errorKind: e.kind, latencyMs: now() - t0 })
        lastKind = e.kind
        lastMessage = e.message
        if (e.kind === 'auth' || !RETRYABLE.has(e.kind)) break
        if (attempt < deps.policy.maxRetries) await sleep(Math.min(e.retryAfterMs ?? 500 * 2 ** attempt, 5000))
      }
    }
    // Next provider (never for sensitive requests: candidates is already a single entry).
  }
  return fail(lastKind, lastMessage, candidates[candidates.length - 1]?.adapter.id ?? null, candidates[candidates.length - 1]?.model ?? null)
}
