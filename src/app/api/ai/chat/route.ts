import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { getUserAiKey, getUserAiKeySummary } from '../../../../lib/server/aiKeys'
import { getEntitlement, requireAccess } from '../../../../lib/server/entitlement'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// Groq retires models regularly; the first working candidate wins.
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant', 'openai/gpt-oss-20b']

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o']

const MAX_MESSAGES = 60
const MAX_TOTAL_CHARS = 120_000

const NO_KEY_MESSAGE = 'Add your OpenAI or Groq API key in Settings to enable AI features.'

function serverKeys() {
  return {
    groq: (process.env.GROQ_API_KEY || '').trim(),
    openai: (process.env.OPENAI_API_KEY || '').trim(),
  }
}

/** Tells the client whether AI can run for this account and why not otherwise. */
export async function GET() {
  const session = await auth()
  const server = serverKeys()
  const serverConfigured = Boolean(server.groq || server.openai)
  if (!session?.user?.id) {
    return NextResponse.json({ signedIn: false, access: false, available: false, serverConfigured, userKey: null, reason: 'Sign in to use AI.' })
  }
  const [entitlement, userKey] = await Promise.all([getEntitlement(session.user.id), getUserAiKeySummary(session.user.id)])
  const hasKey = Boolean(userKey) || serverConfigured
  const available = entitlement.access && hasKey
  const reason = !entitlement.access ? 'Your free trial has ended. Subscribe to keep using AI.' : !hasKey ? NO_KEY_MESSAGE : null
  return NextResponse.json({ signedIn: true, access: entitlement.access, status: entitlement.status, available, serverConfigured, userKey, reason })
}

async function callProvider(url: string, apiKey: string, model: string, messages: ChatMessage[], temperature: number, json: boolean) {
  return fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      messages,
    }),
  })
}

function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null
  const out: ChatMessage[] = []
  let total = 0
  for (const item of input) {
    if (!item || typeof item !== 'object') return null
    const { role, content } = item as { role?: unknown; content?: unknown }
    if (role !== 'system' && role !== 'user' && role !== 'assistant') return null
    if (typeof content !== 'string') return null
    total += content.length
    if (total > MAX_TOTAL_CHARS) return null
    out.push({ role, content })
  }
  return out
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const { messages: rawMessages, temperature = 0.3, json = false, provider = 'auto' } = body

    const messages = sanitizeMessages(rawMessages)
    if (!messages) return NextResponse.json({ error: 'Invalid or oversized messages array' }, { status: 400 })

    const gate = await requireAccess()
    if (gate instanceof NextResponse) return gate

    // The learner's own key first; the deployment's shared key as a fallback.
    const own = await getUserAiKey(gate.userId)
    const server = serverKeys()
    const groqKey = own?.provider === 'groq' ? own.key : own ? '' : server.groq
    const openAiKey = own?.provider === 'openai' ? own.key : own ? '' : server.openai
    if (!groqKey && !openAiKey) return NextResponse.json({ error: NO_KEY_MESSAGE, code: 'no_key' }, { status: 400 })

    const temp = typeof temperature === 'number' && temperature >= 0 && temperature <= 2 ? temperature : 0.3
    let lastError = ''

    const tryModels = async (url: string, key: string, models: string[], label: string): Promise<Response | null> => {
      if (!key) return null
      for (const model of models) {
        const res = await callProvider(url, key, model, messages, temp, Boolean(json))
        if (res.ok) return res
        const errText = await res.text().catch(() => '')
        lastError = `${label} (${model}) ${res.status}: ${errText.slice(0, 300)}`
        if (res.status === 401 || res.status === 429) break
      }
      return null
    }

    let response: Response | null = null
    if (provider === 'openai') {
      response = await tryModels(OPENAI_URL, openAiKey, OPENAI_MODELS, 'OpenAI')
    } else if (provider === 'groq') {
      response = await tryModels(GROQ_URL, groqKey, GROQ_MODELS, 'Groq')
    } else {
      if (groqKey) response = await tryModels(GROQ_URL, groqKey, GROQ_MODELS, 'Groq')
      if (!response && openAiKey) response = await tryModels(OPENAI_URL, openAiKey, OPENAI_MODELS, 'OpenAI')
    }

    if (!response) {
      const friendly =
        / 401:/.test(lastError) || /invalid api key/i.test(lastError)
          ? 'The AI provider rejected your API key. Update it in Settings.'
          : / 429:/.test(lastError) || /rate limit/i.test(lastError)
            ? 'The AI provider is rate limiting requests. Wait a moment and try again.'
            : 'The AI provider is unavailable right now.'
      return NextResponse.json({ error: friendly, details: lastError }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'The AI returned an empty response.' }, { status: 502 })

    return NextResponse.json({ content, provider: data.model })
  } catch (err) {
    console.error('AI gateway error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
