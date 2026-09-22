export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string }

// Bring-your-own-key storage. Keys never leave this browser except to call /api/ai/chat.
const GROQ_STORAGE_KEY = 'job-app-groq-key'
const OPENAI_STORAGE_KEY = 'job-app-openai-key'

function readKey(storageKey: string): string {
  try {
    return localStorage.getItem(storageKey)?.trim() || ''
  } catch {
    return ''
  }
}

function writeKey(storageKey: string, value: string): void {
  const trimmed = value.trim()
  try {
    if (!trimmed) localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, trimmed)
  } catch {
    // Storage may be unavailable (private mode); the key is simply not remembered.
  }
}

export function getClientGroqApiKey(): string {
  return readKey(GROQ_STORAGE_KEY)
}

export function setClientGroqApiKey(key: string): void {
  writeKey(GROQ_STORAGE_KEY, key)
}

export function getClientOpenAIApiKey(): string {
  return readKey(OPENAI_STORAGE_KEY)
}

export function setClientOpenAIApiKey(key: string): void {
  writeKey(OPENAI_STORAGE_KEY, key)
}

/** True when the user saved a personal key in this browser. */
export function hasClientAiKey(): boolean {
  return Boolean(getClientGroqApiKey() || getClientOpenAIApiKey())
}

let serverStatusCache: { at: number; configured: boolean } | null = null

/** True when the server has its own provider key (signed-in users can use it). */
export async function isServerAiConfigured(): Promise<boolean> {
  if (serverStatusCache && Date.now() - serverStatusCache.at < 5 * 60_000) return serverStatusCache.configured
  try {
    const res = await fetch('/api/ai/chat', { method: 'GET' })
    const data = await res.json()
    const configured = Boolean(data?.serverConfigured)
    serverStatusCache = { at: Date.now(), configured }
    return configured
  } catch {
    return false
  }
}

/** Resolves whether any AI path is usable right now. */
export async function isAiAvailable(): Promise<boolean> {
  if (hasClientAiKey()) return true
  return isServerAiConfigured()
}

export const AI_SETUP_HINT = 'Add a free Groq key (or an OpenAI key) in Settings to enable AI features.'

export async function chatWithAI(options: {
  messages: AIMessage[]
  temperature?: number
  json?: boolean
  provider?: 'openai' | 'groq' | 'auto'
}): Promise<string> {
  const clientProvidedKey = {
    groq: getClientGroqApiKey(),
    openai: getClientOpenAIApiKey(),
  }

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
        clientProvidedKey,
      }),
    })
  } catch {
    throw new Error('Could not reach the AI service. Check your connection and try again.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'AI request failed')
  }
  return data.content as string
}

export function extractJsonObject<T extends Record<string, unknown>>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced?.[1]?.trim() || text.trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('AI did not return JSON')
  return JSON.parse(raw.slice(start, end + 1)) as T
}
