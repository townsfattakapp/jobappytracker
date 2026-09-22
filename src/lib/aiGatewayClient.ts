export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/**
 * Client for the AI gateway. Keys never live in the browser any more: the
 * learner saves an OpenAI or Groq key to their account (Settings) and the
 * server uses it for every request. AI is available to signed-in accounts on
 * a trial or subscription that have a key (their own, or the deployment's).
 */

export interface AiStatus {
  signedIn: boolean
  access: boolean
  status?: 'trial' | 'active' | 'cancelling' | 'past_due' | 'expired'
  available: boolean
  serverConfigured: boolean
  userKey: { provider: 'groq' | 'openai'; hint: string } | null
  reason: string | null
}

export const AI_SETUP_HINT = 'Add your OpenAI or Groq API key in Settings to enable AI features.'
export const AI_STATUS_EVENT = 'jobappy:ai-status'
export const BILLING_REQUIRED_EVENT = 'jobappy:billing-required'

let statusCache: { at: number; value: AiStatus } | null = null

const OFFLINE: AiStatus = { signedIn: false, access: false, available: false, serverConfigured: false, userKey: null, reason: 'Sign in to use AI.' }

/** Current AI availability for this account (cached for a minute; call invalidateAiStatus after changes). */
export async function getAiStatus(force = false): Promise<AiStatus> {
  if (!force && statusCache && Date.now() - statusCache.at < 60_000) return statusCache.value
  try {
    const res = await fetch('/api/ai/chat', { method: 'GET', cache: 'no-store' })
    const value = (await res.json()) as AiStatus
    statusCache = { at: Date.now(), value }
    return value
  } catch {
    return statusCache?.value ?? OFFLINE
  }
}

export function invalidateAiStatus(): void {
  statusCache = null
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AI_STATUS_EVENT))
}

/** Resolves whether an AI request would succeed right now. */
export async function isAiAvailable(): Promise<boolean> {
  return (await getAiStatus()).available
}

/** Human explanation of why AI is unavailable, or null when it is available. */
export async function aiUnavailableReason(): Promise<string | null> {
  const status = await getAiStatus()
  return status.available ? null : status.reason || AI_SETUP_HINT
}

export class AiRequestError extends Error {
  code: string
  constructor(message: string, code = 'error') {
    super(message)
    this.code = code
  }
}

export async function chatWithAI(options: { messages: AIMessage[]; temperature?: number; json?: boolean; provider?: 'openai' | 'groq' | 'auto' }): Promise<string> {
  let response: Response
  try {
    response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: options.messages,
        temperature: options.temperature,
        json: options.json,
        provider: options.provider || 'auto',
      }),
    })
  } catch {
    throw new AiRequestError('Could not reach the AI service. Check your connection and try again.', 'network')
  }

  const data = (await response.json().catch(() => ({}))) as { content?: string; error?: string; code?: string }
  if (!response.ok) {
    if (response.status === 402 && typeof window !== 'undefined') window.dispatchEvent(new Event(BILLING_REQUIRED_EVENT))
    if (response.status === 401 || response.status === 402 || data.code === 'no_key') invalidateAiStatus()
    throw new AiRequestError(data.error || 'AI request failed', data.code || String(response.status))
  }
  return data.content as string
}

export function extractJsonObject<T extends Record<string, unknown>>(text: string): T {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed) as T
  } catch {
    // fall through to a lenient scan
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim()) as T
    } catch {
      // continue
    }
  }
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1)) as T
  }
  throw new Error('The AI response was not valid JSON.')
}
