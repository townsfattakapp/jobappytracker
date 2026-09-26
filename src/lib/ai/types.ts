/**
 * Server-side AI gateway contracts (Phase 6.5). Every AI call in JobAppy goes
 * through the gateway: feature policy → provider/model → timeout → retry →
 * fallback → structured output validation → usage accounting. API keys never
 * leave the server. Deterministic engines stay the fallback for every feature.
 */

export type AiProviderId = 'gemini' | 'groq' | 'mistral' | 'openrouter' | 'openai' | 'fixture'
export const AI_PROVIDER_IDS: AiProviderId[] = ['gemini', 'groq', 'mistral', 'openrouter', 'openai', 'fixture']

export type AiMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/** Features that may call the gateway; each has its own policy. */
export const AI_FEATURES = [
  { key: 'chat', label: 'Learner AI chat (tutor, lessons, general mock rounds)', sensitive: false },
  { key: 'interview.followup', label: 'Job interview follow-up phrasing', sensitive: true },
  { key: 'interview.feedback', label: 'Job interview coaching summary', sensitive: true },
  { key: 'resume.insights', label: 'Resume vs job reasoning', sensitive: true },
  { key: 'strategy.narrative', label: 'Application guidance narrative', sensitive: true },
  { key: 'drafts.refine', label: 'Networking draft refinement', sensitive: true },
] as const
export type AiFeature = (typeof AI_FEATURES)[number]['key']
export const AI_FEATURE_KEYS: AiFeature[] = AI_FEATURES.map((f) => f.key)

export type AiSensitivity = 'normal' | 'sensitive'

export interface AiRequest {
  feature: AiFeature
  messages: AiMessage[]
  temperature?: number
  /** Ask the provider for a JSON object; the gateway parses and validates it. */
  json?: boolean
  maxTokens?: number
  /** Sensitive requests (resume, interview answers, drafts) never fall back across providers. */
  sensitivity: AiSensitivity
  userId: string | null
  /** The learner's own key, if they configured one; used only for its provider. */
  userKey?: { provider: AiProviderId; key: string } | null
  /** Provider preference from the caller (e.g. the learner picked one); must still pass policy. */
  preferProvider?: AiProviderId | null
}

export interface AiUsage {
  promptTokens: number | null
  completionTokens: number | null
}

export interface AiAttempt {
  provider: AiProviderId
  model: string
  status: 'ok' | 'error'
  errorKind?: AiErrorKind
  latencyMs: number
}

export interface AiResult<T = unknown> {
  content: string
  /** Parsed JSON when `json` was requested and validation passed. */
  data: T | null
  provider: AiProviderId
  model: string
  usage: AiUsage
  latencyMs: number
  attempts: AiAttempt[]
  requestId: string
}

export type AiErrorKind = 'not_configured' | 'disabled' | 'auth' | 'rate_limit' | 'timeout' | 'server' | 'network' | 'malformed' | 'validation' | 'policy'

export class AiError extends Error {
  constructor(
    public kind: AiErrorKind,
    message: string,
    public status: number | null = null,
    public retryAfterMs: number | null = null,
  ) {
    super(message)
    this.name = 'AiError'
  }
}

export interface AiGatewayError {
  errorId: string
  kind: AiErrorKind
  message: string
  attempts: AiAttempt[]
}

export interface AdapterCallInput {
  model: string
  messages: AiMessage[]
  temperature: number
  json: boolean
  maxTokens: number
  signal: AbortSignal
  fetchImpl: typeof fetch
}

export interface AiAdapter {
  id: AiProviderId
  label: string
  /** Default model candidates in preference order (admins can override per feature). */
  models: string[]
  /** Whether a server key exists; learner keys are checked separately. */
  isConfigured(): boolean
  keyFromEnv(): string
  call(input: AdapterCallInput, apiKey: string): Promise<{ content: string; usage: AiUsage; model: string }>
}
