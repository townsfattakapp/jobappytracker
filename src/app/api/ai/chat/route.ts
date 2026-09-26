import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { AI_PROVIDER_IDS, type AiMessage, type AiProviderId } from '../../../../lib/ai/types'
import { getUserAiKeySummary } from '../../../../lib/server/aiKeys'
import { aiAvailability, runAi } from '../../../../lib/server/ai'
import { getEntitlement, requireAccess } from '../../../../lib/server/entitlement'
import { rateLimited } from '../../../../lib/server/rateLimit'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_MESSAGES = 60
const MAX_TOTAL_CHARS = 120_000
const NO_KEY_MESSAGE = 'Add your Groq, Gemini, Mistral, OpenRouter or OpenAI API key in Settings to enable AI features.'

/** Tells the client whether AI can run for this account and why not otherwise. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    const availability = await aiAvailability(null)
    return NextResponse.json({ signedIn: false, access: false, available: false, serverConfigured: availability.providers.length > 0, userKey: null, reason: 'Sign in to use AI.' })
  }
  const [entitlement, userKey, availability] = await Promise.all([getEntitlement(session.user.id), getUserAiKeySummary(session.user.id), aiAvailability(session.user.id)])
  const serverConfigured = availability.providers.filter((p) => p !== 'fixture').length > 0 || availability.providers.includes('fixture')
  const hasKey = Boolean(userKey) || serverConfigured
  const available = availability.enabled && entitlement.access && hasKey
  const reason = !availability.enabled ? 'AI features are switched off right now.' : !entitlement.access ? 'Choose a plan to use AI features.' : !hasKey ? NO_KEY_MESSAGE : null
  return NextResponse.json({ signedIn: true, access: entitlement.access, status: entitlement.status, available, serverConfigured, userKey, reason })
}

function sanitizeMessages(input: unknown): AiMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null
  const out: AiMessage[] = []
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

/** Learner chat (tutor, lessons, general mock rounds) through the AI gateway: policy, provider order, timeout, retry, fallback, accounting. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const { messages: rawMessages, temperature = 0.3, json = false, provider = 'auto' } = body
    const messages = sanitizeMessages(rawMessages)
    if (!messages) return NextResponse.json({ error: 'Invalid or oversized messages array' }, { status: 400 })
    const gate = await requireAccess()
    if (gate instanceof NextResponse) return gate
    const limited = rateLimited(req, 'ai.chat', 30, 60_000, gate.userId)
    if (limited) return limited
    const prefer = typeof provider === 'string' && (AI_PROVIDER_IDS as string[]).includes(provider) ? (provider as AiProviderId) : null
    const outcome = await runAi({ feature: 'chat', messages, temperature: typeof temperature === 'number' ? temperature : 0.3, json: Boolean(json), sensitivity: 'normal', userId: gate.userId, preferProvider: prefer })
    if (!outcome.ok) {
      const { kind, errorId, message } = outcome.error
      const friendly =
        kind === 'auth' ? 'The AI provider rejected the API key. Update it in Settings.' : kind === 'rate_limit' ? 'The AI provider is rate limiting requests. Wait a moment and try again.' : kind === 'not_configured' ? NO_KEY_MESSAGE : kind === 'disabled' ? 'AI features are switched off right now.' : kind === 'timeout' ? 'The AI provider took too long to answer. Try again.' : 'The AI provider is unavailable right now.'
      return NextResponse.json({ error: `${friendly} (ref ${errorId})`, code: kind === 'not_configured' ? 'no_key' : kind, errorId, details: message }, { status: kind === 'not_configured' || kind === 'disabled' ? 400 : 502 })
    }
    return NextResponse.json({ content: outcome.result.content, provider: `${outcome.result.provider}/${outcome.result.model}`, requestId: outcome.result.requestId })
  } catch (err) {
    console.error('AI gateway error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
