import { NextResponse } from 'next/server'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { aiAvailability } from '../../../../lib/server/ai'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { resolveAccess } from '../../../../lib/server/entitlements'
import { interviewAccess } from '../../../../lib/server/interviews'
import { logEvent } from '../../../../lib/server/log'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { getVoicePolicy, MAX_TTS_CHARS, synthesizeSpeech, TtsError, voiceAvailability, VOICE_TEST_LINE } from '../../../../lib/server/tts'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Device / connection check for the interview room: which voice mode the
 * server can offer (premium provider or browser fallback), the learner's voice
 * entitlements, silence thresholds, and whether the AI gateway can enrich the
 * conversation. Nothing here blocks a text-only interview.
 */
export async function GET() {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const ia = interviewAccess(access)
    const [policy, ai] = await Promise.all([getVoicePolicy(), aiAvailability(access.userId)])
    const availability = voiceAvailability(policy)
    const premium = availability.mode === 'premium' && ia.premiumVoice
    return NextResponse.json({
      voice: ia.voice,
      premiumVoice: ia.premiumVoice,
      replay: ia.replay,
      tts: { ...availability, mode: premium ? 'premium' : 'browser', premiumConfigured: availability.mode === 'premium', voices: premium ? availability.voices : [], defaultVoice: premium ? availability.defaultVoice : null, testLine: VOICE_TEST_LINE },
      stt: { provider: 'browser' },
      ai: { available: ai.enabled && (ai.providers.length > 0 || Boolean(ai.userKeyProvider)), enabled: ai.enabled },
      diagnostics: process.env.NODE_ENV !== 'production' || access.config.flags.adminPanel && Boolean(access.features.length && access.email && (process.env.PLATFORM_ADMINS || '').toLowerCase().includes(access.email.toLowerCase())),
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/interviews/voice')
  }
}

/**
 * Body: { text, voice?, rate?, test? }. Streams synthesised audio for one
 * interviewer utterance. 204 with X-Voice-Fallback when no premium provider is
 * available (client uses browser speech); 503 with the same header when the
 * provider failed, so the client falls back instead of losing the turn.
 */
export async function POST(req: Request) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const ia = interviewAccess(access)
    if (!ia.voice) return NextResponse.json({ error: 'Voice interviews are not included in your plan.', code: 'upgrade', feature: 'interview.voice' }, { status: 402 })
    const limited = rateLimited(req, 'interview.voice', 90, 60_000, access.userId)
    if (limited) return limited
    const body = (await readJson(req)) as Record<string, unknown>
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    const text = body.test === true ? VOICE_TEST_LINE : String(body.text ?? '')
    if (!text.trim()) throw new ValidationError('Nothing to say', 'text')
    if (text.length > MAX_TTS_CHARS) throw new ValidationError(`Text longer than ${MAX_TTS_CHARS} characters`, 'text')
    if (!ia.premiumVoice) return new NextResponse(null, { status: 204, headers: { 'X-Voice-Fallback': 'browser', 'X-Voice-Reason': 'entitlement' } })
    const policy = await getVoicePolicy()
    const started = Date.now()
    try {
      const out = await synthesizeSpeech(policy, { text, voice: typeof body.voice === 'string' ? body.voice : null, rate: typeof body.rate === 'number' ? body.rate : null })
      if (!out) return new NextResponse(null, { status: 204, headers: { 'X-Voice-Fallback': 'browser', 'X-Voice-Reason': 'not_configured' } })
      logEvent('info', 'interview.voice.synthesized', { userId: access.userId, provider: out.provider, voice: out.voice, chars: text.length, latencyMs: out.latencyMs })
      return new NextResponse(out.audio, { status: 200, headers: { 'Content-Type': out.mime, 'Cache-Control': 'no-store', 'X-Voice-Provider': out.provider, 'X-Voice-Id': out.voice, 'X-Voice-Latency': String(out.latencyMs) } })
    } catch (error) {
      if (error instanceof TtsError) {
        logEvent('warn', 'interview.voice.failed', { userId: access.userId, kind: error.kind, status: error.status, latencyMs: Date.now() - started })
        if (error.kind === 'validation') throw new ValidationError(error.message, 'text')
        return new NextResponse(null, { status: 503, headers: { 'X-Voice-Fallback': 'browser', 'X-Voice-Reason': error.kind } })
      }
      throw error
    }
  } catch (error) {
    return errorResponse(error, 'POST /api/interviews/voice')
  }
}
