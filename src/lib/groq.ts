const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const GROQ_MODEL = 'openai/gpt-oss-20b'
/** Tried in order when a model is retired or unavailable for the key. */
const GROQ_MODEL_FALLBACKS = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'groq/compound-mini']
const STORAGE_KEY = 'job-app-groq-key'

export function getGroqApiKey(): string {
  const fromEnv = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim()
  if (fromEnv) return fromEnv
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

export function setGroqApiKey(key: string): void {
  const trimmed = key.trim()
  if (!trimmed) localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, trimmed)
}

export function hasGroqApiKey(): boolean {
  return Boolean(getGroqApiKey())
}

export type GroqMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function callGroq(
  apiKey: string,
  model: string,
  options: { messages: GroqMessage[]; temperature?: number; json?: boolean },
): Promise<Response> {
  return fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.3,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      messages: options.messages,
    }),
  })
}

export async function groqChat(options: {
  messages: GroqMessage[]
  temperature?: number
  json?: boolean
  model?: string
}): Promise<string> {
  const apiKey = getGroqApiKey()
  if (!apiKey) throw new Error('Add your free Groq API key first')

  const candidates = options.model
    ? [options.model, ...GROQ_MODEL_FALLBACKS]
    : [GROQ_MODEL, ...GROQ_MODEL_FALLBACKS]

  let response: Response | null = null
  let lastDetail = ''

  for (const model of candidates) {
    response = await callGroq(apiKey, model, options)
    if (response.ok) break

    lastDetail = await response.text().catch(() => '')
    if (response.status === 401) throw new Error('Groq API key is invalid')
    if (response.status === 429) throw new Error('Groq rate limit hit — try again in a minute')

    // Retired/unavailable model — try the next candidate.
    const retryable =
      (response.status === 400 || response.status === 404) &&
      /model_not_found|does not exist|decommissioned/i.test(lastDetail)
    if (!retryable) break
  }

  if (!response || !response.ok) {
    throw new Error(lastDetail || `Groq request failed (${response?.status ?? 'network error'})`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from Groq')
  return content
}

export function extractJsonObject<T extends Record<string, unknown>>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced?.[1]?.trim() || text.trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Groq did not return JSON')
  return JSON.parse(raw.slice(start, end + 1)) as T
}
