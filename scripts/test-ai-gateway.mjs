// Phase 6.5: AI gateway. Provider failure, timeout, malformed output, rate
// limit, retry, fallback, sensitive-data routing (no cross-provider
// fallback), policy switches, daily cap, learner keys, adapter request
// shapes (Gemini and OpenAI-compatible), usage accounting and output
// validators. No network: adapters are scripted.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

process.env.NODE_ENV = 'test'
process.env.AI_FIXTURE = '1'
await build({
  entryPoints: { gateway: 'src/lib/ai/gateway.ts', adapters: 'src/lib/ai/adapters.ts', policy: 'src/lib/ai/policy.ts', validators: 'src/lib/ai/validators.ts', types: 'src/lib/ai/types.ts' },
  outdir: 'scratch/ai-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['drizzle-orm', 'drizzle-orm/*', 'pg', 'next/*'],
  logLevel: 'silent',
})
const { runGateway, resolveCandidates, extractJsonObject } = await import('../scratch/ai-tests/gateway.mjs')
const adapters = await import('../scratch/ai-tests/adapters.mjs')
const { DEFAULT_AI_POLICY, normalizeAiPolicy } = await import('../scratch/ai-tests/policy.mjs')
const v = await import('../scratch/ai-tests/validators.mjs')
const { AiError } = await import('../scratch/ai-tests/types.mjs')

/** Scripted adapter: each call pops the next step. */
function scripted(id, steps, models = [`${id}-model`]) {
  const calls = []
  return {
    id,
    label: id,
    models,
    calls,
    keyFromEnv: () => 'key',
    isConfigured: () => true,
    async call(input) {
      calls.push(input)
      const step = steps.shift() ?? { kind: 'ok', content: `${id} says hi` }
      if (step.kind === 'hang') await new Promise((_, reject) => input.signal.addEventListener('abort', () => reject(new AiError('timeout', 'timed out')), { once: true }))
      if (step.kind === 'error') throw new AiError(step.error, `${id} ${step.error}`, step.status ?? null, step.retryAfterMs ?? null)
      return { content: step.content, usage: { promptTokens: 7, completionTokens: 3 }, model: step.model ?? models[0] }
    },
  }
}
function deps(list, over = {}) {
  const records = []
  const sleeps = []
  const policy = normalizeAiPolicy({ ...DEFAULT_AI_POLICY, providerOrder: list.map((a) => a.id), timeoutMs: 50, maxRetries: 1, ...over.policy })
  return { adapters: list, policy, record: async (r) => void records.push(r), sleep: async (ms) => void sleeps.push(ms), records, sleeps, callsToday: over.callsToday, fetchImpl: over.fetchImpl }
}
const req = (over = {}) => ({ feature: 'chat', messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hello' }], sensitivity: 'normal', userId: 'u1', ...over })

test('server failure retries once then falls back to the next provider; every attempt and the final usage are recorded', async () => {
  const a = scripted('groq', [{ kind: 'error', error: 'server', status: 500 }, { kind: 'error', error: 'server', status: 502 }])
  const b = scripted('gemini', [{ kind: 'ok', content: 'b answered' }])
  const d = deps([a, b])
  const out = await runGateway(req(), d)
  assert.equal(out.ok, true)
  assert.equal(out.result.provider, 'gemini')
  assert.equal(out.result.content, 'b answered')
  assert.deepEqual(out.result.attempts.map((x) => `${x.provider}:${x.status}:${x.errorKind ?? ''}`), ['groq:error:server', 'groq:error:server', 'gemini:ok:'])
  assert.equal(d.sleeps.length, 1, 'backoff between retries on the same provider')
  assert.equal(d.records.length, 1)
  assert.equal(d.records[0].status, 'ok')
  assert.equal(d.records[0].attempts, 3)
  assert.equal(d.records[0].promptTokens, 7)
  assert.ok(/^ai_[a-f0-9]+$/.test(out.result.requestId))
})

test('timeouts abort the attempt and fall back; rate limits wait for retry-after then retry; auth errors skip straight to the next provider', async () => {
  const slow = scripted('groq', [{ kind: 'hang' }, { kind: 'hang' }])
  const ok = scripted('gemini', [])
  const d = deps([slow, ok])
  const out = await runGateway(req(), d)
  assert.equal(out.ok, true)
  assert.equal(out.result.provider, 'gemini')
  assert.deepEqual(out.result.attempts.map((x) => x.errorKind ?? 'ok'), ['timeout', 'timeout', 'ok'])

  const limited = scripted('mistral', [{ kind: 'error', error: 'rate_limit', status: 429, retryAfterMs: 1200 }, { kind: 'ok', content: 'after backoff' }])
  const d2 = deps([limited])
  const out2 = await runGateway(req(), d2)
  assert.equal(out2.ok, true)
  assert.equal(out2.result.content, 'after backoff')
  assert.deepEqual(d2.sleeps, [1200])

  const bad = scripted('openrouter', [{ kind: 'error', error: 'auth', status: 401 }])
  const good = scripted('openai', [])
  const d3 = deps([bad, good])
  const out3 = await runGateway(req(), d3)
  assert.equal(out3.ok, true)
  assert.equal(bad.calls.length, 1, 'no retry after an auth failure')
  assert.equal(out3.result.provider, 'openai')

  const all = scripted('groq', [{ kind: 'error', error: 'server' }, { kind: 'error', error: 'server' }])
  const d4 = deps([all])
  const out4 = await runGateway(req(), d4)
  assert.equal(out4.ok, false)
  assert.equal(out4.error.kind, 'server')
  assert.ok(/^E-[A-F0-9]{8}$/.test(out4.error.errorId), 'failures carry an error id')
  assert.equal(d4.records[0].status, 'error')
  assert.equal(d4.records[0].errorId, out4.error.errorId)
})

test('structured output: malformed JSON is nudged once, validation runs, and persistent garbage fails cleanly', async () => {
  const a = scripted('groq', [{ kind: 'ok', content: 'not json at all' }, { kind: 'ok', content: '```json\n{"answer": 42}\n```' }])
  const d = deps([a])
  const out = await runGateway(req({ json: true }), d, (data) => (typeof data.answer === 'number' ? { answer: data.answer } : null))
  assert.equal(out.ok, true)
  assert.deepEqual(out.result.data, { answer: 42 })
  assert.equal(a.calls.length, 2)
  assert.match(a.calls[1].messages[a.calls[1].messages.length - 1].content, /valid JSON object/)

  const wrongShape = scripted('groq', [{ kind: 'ok', content: '{"other": 1}' }, { kind: 'ok', content: '{"other": 2}' }])
  const fallback = scripted('gemini', [{ kind: 'ok', content: '{"answer": 7}' }])
  const d2 = deps([wrongShape, fallback])
  const out2 = await runGateway(req({ json: true }), d2, (data) => (typeof data.answer === 'number' ? { answer: data.answer } : null))
  assert.equal(out2.ok, true)
  assert.equal(out2.result.provider, 'gemini', 'validation failure falls back to the next provider')

  const garbage = scripted('groq', [{ kind: 'ok', content: 'x' }, { kind: 'ok', content: 'y' }])
  const out3 = await runGateway(req({ json: true }), deps([garbage]))
  assert.equal(out3.ok, false)
  assert.equal(out3.error.kind, 'malformed')
  assert.deepEqual(extractJsonObject('prefix {"a":1} suffix'), { a: 1 })
  assert.equal(extractJsonObject('[1,2]'), null)
})

test('sensitive requests go to exactly one provider and never fall back; the allow-list and the learner key are honoured', async () => {
  const a = scripted('groq', [{ kind: 'error', error: 'server' }, { kind: 'error', error: 'server' }])
  const b = scripted('gemini', [])
  const d = deps([a, b])
  const cands = resolveCandidates(req({ feature: 'resume.insights', sensitivity: 'sensitive' }), d)
  assert.equal(cands.length, 1)
  assert.equal(cands[0].adapter.id, 'groq')
  const out = await runGateway(req({ feature: 'resume.insights', sensitivity: 'sensitive' }), d)
  assert.equal(out.ok, false, 'no fallback for sensitive content')
  assert.equal(b.calls.length, 0, 'second provider never received the content')
  assert.equal(d.records[0].sensitivity, 'sensitive')

  const d2 = deps([a, b], { policy: { sensitiveProviders: ['gemini'] } })
  const cands2 = resolveCandidates(req({ feature: 'resume.insights', sensitivity: 'sensitive' }), d2)
  assert.deepEqual(cands2.map((c) => c.adapter.id), ['gemini'], 'only allow-listed providers may receive sensitive content')

  const cands3 = resolveCandidates(req({ feature: 'resume.insights', sensitivity: 'sensitive', userKey: { provider: 'gemini', key: 'own' } }), deps([a, b]))
  assert.deepEqual(cands3.map((c) => `${c.adapter.id}:${c.own}`), ['gemini:true'], 'the learner\'s own key wins for sensitive content')

  const mis = await runGateway(req({ feature: 'resume.insights', sensitivity: 'normal' }), deps([a, b]))
  assert.equal(mis.ok, false)
  assert.equal(mis.error.kind, 'policy', 'sensitive features cannot be sent as normal')
})

test('policy switches, daily cap, learner keys first, per-feature provider and model overrides', async () => {
  const a = scripted('groq', [])
  const b = scripted('gemini', [])
  const off = await runGateway(req(), deps([a, b], { policy: { enabled: false } }))
  assert.equal(off.ok, false)
  assert.equal(off.error.kind, 'disabled')
  const featureOff = await runGateway(req(), deps([a, b], { policy: { features: { chat: { enabled: false } } } }))
  assert.equal(featureOff.error.kind, 'disabled')
  const capped = await runGateway(req(), deps([a, b], { policy: { dailyCallsPerUser: 5 }, callsToday: async () => 5 }))
  assert.equal(capped.error.kind, 'rate_limit')
  const none = await runGateway(req(), deps([]))
  assert.equal(none.error.kind, 'not_configured')
  const withKey = resolveCandidates(req({ userKey: { provider: 'gemini', key: 'own' } }), deps([a, b]))
  assert.deepEqual(withKey.map((c) => `${c.adapter.id}:${c.own}`), ['gemini:true', 'groq:false'], 'own key first, then the shared order')
  const overridden = resolveCandidates(req(), deps([a, b], { policy: { features: { chat: { providers: ['gemini'], models: { gemini: 'g-custom' } } } } }))
  assert.deepEqual(overridden.map((c) => `${c.adapter.id}/${c.model}`), ['gemini/g-custom'])
  const normalized = normalizeAiPolicy({ timeoutMs: 999999, maxRetries: 9, providerOrder: ['nope', 'groq'], features: { chat: { models: { groq: '  llama  ' } } } })
  assert.equal(normalized.timeoutMs, 120000)
  assert.equal(normalized.maxRetries, 3)
  assert.deepEqual(normalized.providerOrder, ['groq'])
  assert.equal(normalized.features.chat.models.groq, 'llama')
})

test('adapters build correct provider requests and classify provider errors (no network)', async () => {
  const seen = []
  const fetchImpl = async (url, init) => {
    seen.push({ url, init })
    if (url.includes('generativelanguage')) return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'gemini says hi' }] } }], usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 2 } }), { status: 200 })
    if (url.includes('mistral')) return new Response('rate limited', { status: 429, headers: { 'retry-after': '3' } })
    if (url.includes('openrouter')) return new Response('bad key', { status: 401 })
    return new Response(JSON.stringify({ choices: [{ message: { content: 'groq says hi' } }], usage: { prompt_tokens: 4, completion_tokens: 1 }, model: 'llama-x' }), { status: 200 })
  }
  const input = { model: 'gemini-2.0-flash', messages: [{ role: 'system', content: 'be brief' }, { role: 'user', content: 'hi' }, { role: 'assistant', content: 'hello' }, { role: 'user', content: 'again' }], temperature: 0.2, json: true, maxTokens: 100, signal: new AbortController().signal, fetchImpl }
  const g = await adapters.geminiAdapter.call(input, 'AIza-test')
  assert.equal(g.content, 'gemini says hi')
  const gemBody = JSON.parse(seen[0].init.body)
  assert.equal(gemBody.systemInstruction.parts[0].text, 'be brief')
  assert.deepEqual(gemBody.contents.map((c) => c.role), ['user', 'model', 'user'])
  assert.equal(gemBody.generationConfig.responseMimeType, 'application/json')
  assert.equal(seen[0].init.headers['x-goog-api-key'], 'AIza-test')
  const q = await adapters.groqAdapter.call({ ...input, model: 'llama-3.3-70b-versatile' }, 'gsk_test')
  assert.equal(q.content, 'groq says hi')
  const groqBody = JSON.parse(seen[1].init.body)
  assert.equal(groqBody.response_format.type, 'json_object')
  assert.equal(seen[1].init.headers.Authorization, 'Bearer gsk_test')
  await assert.rejects(adapters.mistralAdapter.call({ ...input, model: 'mistral-small-latest' }, 'k'), (e) => e.kind === 'rate_limit' && e.status === 429)
  await assert.rejects(adapters.openRouterAdapter.call({ ...input, model: 'm' }, 'k'), (e) => e.kind === 'auth')
  assert.equal(adapters.fixtureAdapter.isConfigured(), true, 'fixture enabled by AI_FIXTURE outside production')
  adapters.fixtureScript.steps.push({ kind: 'error', error: 'server' })
  await assert.rejects(adapters.fixtureAdapter.call(input, 'fixture'), (e) => e.kind === 'server')
  const fx = await adapters.fixtureAdapter.call({ ...input, json: false, messages: [{ role: 'user', content: 'ping' }] }, 'fixture')
  assert.match(fx.content, /Fixture response to: ping/)
})

test('validators keep AI output subordinate to the deterministic facts', () => {
  assert.equal(v.validateFollowUp('Could you walk me through where you used indexing in production?'), 'Could you walk me through where you used indexing in production?')
  assert.equal(v.validateFollowUp('You would definitely be hired for this.'), null)
  assert.equal(v.validateFollowUp('Tell me more.'), null, 'must be a question')
  assert.equal(v.validateCoachSummary('Focus on naming trade-offs when you explain caching, and bring one concrete production example for each behavioural answer. Practise the missed concepts before the next attempt.'), 'Focus on naming trade-offs when you explain caching, and bring one concrete production example for each behavioural answer. Practise the missed concepts before the next attempt.')
  assert.equal(v.validateCoachSummary('You have an 80% chance of getting hired if you keep this up, honestly.'), null)
  assert.deepEqual(v.validateInsights({ insights: ['Lead with your Spring Boot API work: it maps directly to the required stack.', 'Consider learning Rust.'] }, ['Spring Boot', 'Java']), ['Lead with your Spring Boot API work: it maps directly to the required stack.'])
  assert.equal(v.validateInsights({ insights: ['Something generic and unrelated to any known skill.'] }, ['Java']), null)
  const original = 'Hi [Name], I am applying for the Backend Engineer role at Acme and have 3 years of Java experience. Thank you.'
  assert.equal(v.validateRefinedDraft('Hi [Name], I am applying for the Backend Engineer role at Acme with 3 years of Java experience. Thank you for your time.', original, ['[Name]']).startsWith('Hi [Name]'), true)
  assert.equal(v.validateRefinedDraft('Hi there, I am applying for the Backend Engineer role at Acme with 3 years of Java experience.', original, ['[Name]']), null, 'placeholder removed')
  assert.equal(v.validateRefinedDraft('Hi [Name], I am applying for the Backend Engineer role at Acme with 5 years of Java experience. Thank you.', original, ['[Name]']), null, 'new number invented')
  assert.equal(v.validateRefinedDraft('Hi [Name], as discussed when we met, I am applying for the Backend Engineer role at Acme with 3 years of Java experience. Thank you.', original, ['[Name]']), null, 'invented relationship')
})
