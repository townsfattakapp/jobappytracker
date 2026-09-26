import { AiError, type AdapterCallInput, type AiAdapter, type AiMessage, type AiProviderId, type AiUsage } from './types'
import { fixturesAllowed } from '../server/stage'

const UA = 'JobAppy/1.0 (+https://prep.evolw.in)'

function classify(status: number, text: string): AiError {
  const retryAfter = /retry[- ]after[^0-9]*(\d+)/i.exec(text)
  if (status === 401 || status === 403) return new AiError('auth', `provider rejected the API key (${status})`, status)
  if (status === 429) return new AiError('rate_limit', 'provider is rate limiting', status, retryAfter ? Number(retryAfter[1]) * 1000 : null)
  if (status === 408 || status === 504) return new AiError('timeout', `provider timed out (${status})`, status)
  if (status >= 500) return new AiError('server', `provider error ${status}`, status)
  if (status === 400 && /model/i.test(text)) return new AiError('server', `model rejected: ${text.slice(0, 120)}`, status)
  return new AiError('server', `provider responded ${status}: ${text.slice(0, 160)}`, status)
}

async function readError(res: Response): Promise<string> {
  return (await res.text().catch(() => '')).slice(0, 400)
}

/** OpenAI-compatible chat completions (Groq, Mistral, OpenRouter, OpenAI). */
function openAiCompatible(id: AiProviderId, label: string, url: string, envKey: string, models: string[], extraHeaders: Record<string, string> = {}): AiAdapter {
  return {
    id,
    label,
    models,
    keyFromEnv: () => (process.env[envKey] || '').trim(),
    isConfigured() {
      return Boolean(this.keyFromEnv())
    },
    async call(input, apiKey) {
      let res: Response
      try {
        res = await input.fetchImpl(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'user-agent': UA, ...extraHeaders },
          body: JSON.stringify({ model: input.model, temperature: input.temperature, max_tokens: input.maxTokens, ...(input.json ? { response_format: { type: 'json_object' } } : {}), messages: input.messages }),
          signal: input.signal,
        })
      } catch (error) {
        if ((error as Error)?.name === 'AbortError' || (error as Error)?.name === 'TimeoutError') throw new AiError('timeout', 'request timed out')
        throw new AiError('network', (error as Error)?.message || 'network error')
      }
      if (!res.ok) throw classify(res.status, await readError(res))
      const data = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number }; model?: string } | null
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string' || !content.trim()) throw new AiError('malformed', 'empty completion')
      const usage: AiUsage = { promptTokens: data?.usage?.prompt_tokens ?? null, completionTokens: data?.usage?.completion_tokens ?? null }
      return { content, usage, model: data?.model || input.model }
    },
  }
}

/** Google Gemini generateContent: system → systemInstruction, assistant → model role, JSON via responseMimeType. */
export const geminiAdapter: AiAdapter = {
  id: 'gemini',
  label: 'Google Gemini',
  models: ['gemini-2.0-flash', 'gemini-1.5-flash'],
  keyFromEnv: () => (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '').trim(),
  isConfigured() {
    return Boolean(this.keyFromEnv())
  },
  async call(input, apiKey) {
    const system = input.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
    const contents = input.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
    if (!contents.length) contents.push({ role: 'user', parts: [{ text: 'Begin.' }] })
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent`
    let res: Response
    try {
      res = await input.fetchImpl(url, {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json', 'user-agent': UA },
        body: JSON.stringify({ ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}), contents, generationConfig: { temperature: input.temperature, maxOutputTokens: input.maxTokens, ...(input.json ? { responseMimeType: 'application/json' } : {}) } }),
        signal: input.signal,
      })
    } catch (error) {
      if ((error as Error)?.name === 'AbortError' || (error as Error)?.name === 'TimeoutError') throw new AiError('timeout', 'request timed out')
      throw new AiError('network', (error as Error)?.message || 'network error')
    }
    if (!res.ok) throw classify(res.status, await readError(res))
    const data = (await res.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } } | null
    const content = (data?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('')
    if (!content.trim()) throw new AiError('malformed', 'empty completion')
    return { content, usage: { promptTokens: data?.usageMetadata?.promptTokenCount ?? null, completionTokens: data?.usageMetadata?.candidatesTokenCount ?? null }, model: input.model }
  },
}

export const groqAdapter = openAiCompatible('groq', 'Groq', 'https://api.groq.com/openai/v1/chat/completions', 'GROQ_API_KEY', ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'])
export const mistralAdapter = openAiCompatible('mistral', 'Mistral', 'https://api.mistral.ai/v1/chat/completions', 'MISTRAL_API_KEY', ['mistral-small-latest', 'open-mistral-nemo'])
export const openRouterAdapter = openAiCompatible('openrouter', 'OpenRouter', (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '') + '/chat/completions', 'OPENROUTER_API_KEY', [(process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct').trim()], { 'HTTP-Referer': 'https://prep.evolw.in', 'X-Title': 'JobAppy' })
export const openAiAdapter = openAiCompatible('openai', 'OpenAI', 'https://api.openai.com/v1/chat/completions', 'OPENAI_API_KEY', ['gpt-4o-mini', 'gpt-4.1-mini'])

/**
 * Deterministic fixture for tests and development without keys. Enabled by
 * AI_FIXTURE=1 (never in production). Behaviour can be scripted per call
 * through `fixtureScript` (tests) or driven by the prompt: a system message
 * containing "[fixture:<kind>]" forces a failure kind.
 */
export type FixtureStep = { kind: 'ok'; content: string; model?: string } | { kind: 'error'; error: AiErrorKind; status?: number; retryAfterMs?: number } | { kind: 'hang' }
export type AiErrorKind = AiError['kind']
export const fixtureScript: { steps: FixtureStep[]; calls: AdapterCallInput[] } = { steps: [], calls: [] }

/** Deterministic, feature-aware replies so development and e2e runs exercise the positive path of every validator. */
function fixtureReply(messages: AiMessage[], json: boolean): string {
  const system = messages.find((m) => m.role === 'system')?.content ?? ''
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  if (/interviewer/i.test(system) && /Follow-up to rephrase:/.test(last)) {
    const original = last.split('Follow-up to rephrase:')[1]?.trim() ?? ''
    return `Thanks, that helps. ${original.replace(/\?$/, '')}?`
  }
  if (/interview coach/i.test(system)) return 'Fixture coach note: revisit the areas listed under needs improvement first, practise naming trade-offs out loud, and bring one concrete production example to each behavioural answer before your next attempt.'
  if (/resume-versus-job/i.test(system) && json) {
    try {
      const facts = JSON.parse(last) as { demonstrated?: { skill: string }[]; projects?: { name: string }[] }
      const skill = facts.demonstrated?.[0]?.skill
      const project = facts.projects?.[0]?.name
      const insights = [skill ? `Lead with your ${skill} evidence: it maps directly to a required skill in this listing.` : null, project ? `Describe ${project} in terms of the problem, your decision and the result so the matched skills are visible.` : null].filter(Boolean)
      return JSON.stringify({ insights })
    } catch {
      return JSON.stringify({ insights: [] })
    }
  }
  if (/application-guidance/i.test(system)) return 'Fixture guidance: lead with the skills the analysis marks as demonstrated, address the missing requirements honestly by pointing at what you are learning, and apply after the resume checklist is done. Then network with one engineer on the team, follow up once after a week, and prepare the interview priorities in the order listed.'
  if (/Polish the wording/i.test(system)) return last
  if (json) return JSON.stringify({ fixture: true, summary: `Fixture response to: ${last.slice(0, 80)}`, note: 'deterministic fixture output' })
  return `Fixture response to: ${last.slice(0, 80)}`
}

export const fixtureAdapter: AiAdapter = {
  id: 'fixture',
  label: 'Fixture (development only)',
  models: ['fixture-1'],
  keyFromEnv: () => (!fixturesAllowed() ? '' : (process.env.AI_FIXTURE || '').trim() === '1' ? 'fixture' : ''),
  isConfigured() {
    return Boolean(this.keyFromEnv())
  },
  async call(input) {
    fixtureScript.calls.push(input)
    const step = fixtureScript.steps.shift()
    if (step) {
      if (step.kind === 'hang') {
        await new Promise((_, reject) => input.signal.addEventListener('abort', () => reject(new AiError('timeout', 'request timed out')), { once: true }))
      }
      if (step.kind === 'error') throw new AiError(step.error, `fixture ${step.error}`, step.status ?? null, step.retryAfterMs ?? null)
      if (step.kind === 'ok') return { content: step.content, usage: { promptTokens: 10, completionTokens: 5 }, model: step.model ?? 'fixture-1' }
    }
    const forced = /\[fixture:([a-z_]+)\]/.exec(input.messages.find((m) => m.role === 'system')?.content ?? '')
    if (forced) throw new AiError(forced[1] as AiErrorKind, `fixture ${forced[1]}`, forced[1] === 'rate_limit' ? 429 : 500)
    return { content: fixtureReply(input.messages, input.json), usage: { promptTokens: 10, completionTokens: 5 }, model: 'fixture-1' }
  },
}

export const ADAPTERS: AiAdapter[] = [geminiAdapter, groqAdapter, mistralAdapter, openRouterAdapter, openAiAdapter, fixtureAdapter]
export const adapterById = (id: string): AiAdapter | undefined => ADAPTERS.find((a) => a.id === id)
