import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'

export const maxDuration = 60

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// Groq retires models regularly; the first working candidate wins.
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant', 'openai/gpt-oss-20b']

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o']

const MAX_MESSAGES = 60
const MAX_TOTAL_CHARS = 120_000

function serverKeys() {
  return {
    groq: (process.env.GROQ_API_KEY || '').trim(),
    openai: (process.env.OPENAI_API_KEY || '').trim(),
  }
}

/** Lets the client know whether AI works without a personal key. */
export async function GET() {
  const keys = serverKeys()
  return NextResponse.json({ serverConfigured: Boolean(keys.groq || keys.openai) })
}

async function callProvider(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  json: boolean,
) {
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
    const { messages: rawMessages, temperature = 0.3, json = false, provider = 'auto', clientProvidedKey } = body

    const messages = sanitizeMessages(rawMessages)
    if (!messages) return NextResponse.json({ error: 'Invalid or oversized messages array' }, { status: 400 })

    const clientGroq = typeof clientProvidedKey?.groq === 'string' ? clientProvidedKey.groq.trim() : ''
    const clientOpenAi = typeof clientProvidedKey?.openai === 'string' ? clientProvidedKey.openai.trim() : ''
    const server = serverKeys()

    // Personal keys are the user's own spend. Server keys are only for signed-in users.
    let groqKey = clientGroq
    let openAiKey = clientOpenAi
    if (!groqKey && !openAiKey && (server.groq || server.openai)) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Sign in to use the built-in AI, or add your own Groq/OpenAI key in Settings.' },
          { status: 401 },
        )
      }
      groqKey = server.groq
      openAiKey = server.openai
    }

    if (!groqKey && !openAiKey) {
      return NextResponse.json(
        { error: 'AI is not configured. Add a free Groq key or an OpenAI key in Settings.' },
        { status: 400 },
      )
    }

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
      const friendly = / 401:/.test(lastError) || /invalid api key/i.test(lastError)
        ? 'The AI provider rejected the API key. Check it in Settings.'
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
