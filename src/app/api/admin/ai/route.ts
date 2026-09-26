import { NextResponse } from 'next/server'
import { ADAPTERS, fixtureScript } from '../../../../lib/ai/adapters'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { aiProviderHealth, aiUsageSummary, gatewayDeps, getAiPolicy, recentAiFailures, saveAiPolicy } from '../../../../lib/server/ai'
import { runGateway } from '../../../../lib/ai/gateway'
import { recordAudit } from '../../../../lib/server/audit'
import { isResponse, requireRole } from '../../../../lib/server/rbac'
import { getVoicePolicy, saveVoicePolicy, synthesizeSpeech, TTS_ADAPTERS, TtsError, voiceAvailability, VOICE_TEST_LINE } from '../../../../lib/server/tts'

export const dynamic = 'force-dynamic'

const voiceProviders = () => TTS_ADAPTERS.map((a) => ({ id: a.id, label: a.label, configured: a.isConfigured(), voices: a.voices, defaultVoice: a.defaultVoice }))

/** AI policy, provider health (configured / 24 h outcomes), usage by feature, and the interviewer voice policy. Keys are never returned. */
export async function GET() {
  const actor = await requireRole('admin', 'support')
  if (isResponse(actor)) return actor
  try {
    const [policy, providers, usage, failures, voice] = await Promise.all([getAiPolicy(), aiProviderHealth(), aiUsageSummary(7), recentAiFailures(20), getVoicePolicy()])
    return NextResponse.json({ policy, providers, usage, failures, adapters: ADAPTERS.map((a) => ({ id: a.id, label: a.label, models: a.models })), voice: { policy: voice, providers: voiceProviders(), availability: voiceAvailability(voice) } })
  } catch (error) {
    return errorResponse(error, 'GET /api/admin/ai')
  }
}

/**
 * Body: the full AI policy document (normalised and audited); { action: 'probe', provider } to send one harmless test prompt;
 * { action: 'voice', policy } to save the interviewer voice policy; { action: 'voice_probe' } to synthesise the test line with the current voice policy.
 */
export async function PUT(req: Request) {
  const actor = await requireRole('admin')
  if (isResponse(actor)) return actor
  try {
    const body = (await readJson(req)) as Record<string, unknown>
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    if (body.action === 'probe') {
      const provider = String(body.provider ?? '')
      const adapter = ADAPTERS.find((a) => a.id === provider)
      if (!adapter) throw new ValidationError('Unknown provider', 'provider')
      if (adapter.id === 'fixture') fixtureScript.steps.length = 0
      // A probe targets exactly this provider: no learner key, no fallback to the rest of the order.
      const deps = await gatewayDeps()
      const probePolicy = { ...deps.policy, enabled: true, features: { ...deps.policy.features, chat: { enabled: true, providers: [adapter.id], models: deps.policy.features.chat?.models ?? {} } } }
      const outcome = await runGateway({ feature: 'chat', messages: [{ role: 'system', content: 'You are a health check. Reply with the single word OK.' }, { role: 'user', content: 'Health check.' }], sensitivity: 'normal', userId: actor.userId, userKey: null, maxTokens: 16 }, { ...deps, policy: probePolicy })
      await recordAudit({ actorId: actor.userId, action: 'ai.probe', entityType: 'ai_provider', entityId: adapter.id, after: outcome.ok ? { ok: true, model: outcome.result.model, latencyMs: outcome.result.latencyMs } : { ok: false, kind: outcome.error.kind, errorId: outcome.error.errorId } })
      return NextResponse.json(outcome.ok ? { ok: true, provider: outcome.result.provider, model: outcome.result.model, latencyMs: outcome.result.latencyMs, content: outcome.result.content.slice(0, 80) } : { ok: false, kind: outcome.error.kind, errorId: outcome.error.errorId, message: outcome.error.message })
    }
    if (body.action === 'voice') {
      const before = await getVoicePolicy()
      const policy = await saveVoicePolicy(body.policy ?? {}, actor.userId)
      await recordAudit({ actorId: actor.userId, action: 'settings.voice', entityType: 'platform_settings', entityId: 'voice', before, after: policy })
      return NextResponse.json({ voice: { policy, providers: voiceProviders(), availability: voiceAvailability(policy) } })
    }
    if (body.action === 'voice_probe') {
      const policy = await getVoicePolicy()
      try {
        const out = await synthesizeSpeech(policy, { text: VOICE_TEST_LINE })
        return NextResponse.json(out ? { ok: true, provider: out.provider, voice: out.voice, bytes: out.audio.byteLength, mime: out.mime, latencyMs: out.latencyMs } : { ok: false, kind: 'not_configured', message: 'No voice provider is configured; the browser voice is used as the fallback.' })
      } catch (error) {
        if (error instanceof TtsError) return NextResponse.json({ ok: false, kind: error.kind, message: error.message })
        throw error
      }
    }
    const before = await getAiPolicy()
    const policy = await saveAiPolicy(body.policy ?? body, actor.userId)
    await recordAudit({ actorId: actor.userId, action: 'settings.ai', entityType: 'platform_settings', entityId: 'ai', before, after: policy })
    return NextResponse.json({ policy })
  } catch (error) {
    return errorResponse(error, 'PUT /api/admin/ai')
  }
}
