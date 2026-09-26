import { readSetting, writeSetting } from './settings'

/**
 * Interviewer voice (text-to-speech) abstraction. The UI never talks to a
 * provider: it asks the server what is available and, when a premium provider
 * is configured, streams synthesised audio from `/api/interviews/voice`.
 * Otherwise the browser's own speech synthesis is used and reported as a
 * fallback, never as premium quality. Keys stay in the environment.
 */
export type TtsProviderId = 'openai' | 'google' | 'elevenlabs' | 'fixture'
export const TTS_PROVIDER_IDS: TtsProviderId[] = ['openai', 'google', 'elevenlabs', 'fixture']

export interface TtsVoice {
  id: string
  label: string
  locale: string
}

export interface SynthesizeInput {
  text: string
  voice: string
  /** Speaking rate multiplier (0.7–1.3). */
  rate: number
  locale: string
  signal: AbortSignal
  fetchImpl: typeof fetch
}

export interface TtsAdapter {
  id: TtsProviderId
  label: string
  isConfigured(): boolean
  voices: TtsVoice[]
  defaultVoice: string
  synthesize(input: SynthesizeInput, apiKey: string): Promise<{ audio: ArrayBuffer; mime: string }>
  keyFromEnv(): string
}

export class TtsError extends Error {
  constructor(
    public kind: 'not_configured' | 'auth' | 'rate_limit' | 'server' | 'timeout' | 'network' | 'validation',
    message: string,
    public status: number | null = null,
  ) {
    super(message)
    this.name = 'TtsError'
  }
}

/** Admin-managed voice settings (platform_settings key "voice"). No secrets here. */
export interface VoicePolicy {
  /** Preferred provider order; the first configured one is used. */
  providerOrder: TtsProviderId[]
  /** Voice per provider (empty = provider default). */
  voices: Partial<Record<TtsProviderId, string>>
  /** Default speaking rate multiplier. Calm and clear: slightly under normal. */
  rate: number
  locale: string
  /** Seconds of silence before "Take your time." and before offering to repeat (accessibility: learners may raise them). */
  silenceThinkingSec: number
  silenceClarifySec: number
  /** Seconds of silence after speech before the answer is treated as finished. */
  endOfSpeechSec: number
  timeoutMs: number
  enabled: boolean
}

export const DEFAULT_VOICE_POLICY: VoicePolicy = { providerOrder: ['openai', 'google', 'elevenlabs', 'fixture'], voices: {}, rate: 0.95, locale: 'en-IN', silenceThinkingSec: 25, silenceClarifySec: 60, endOfSpeechSec: 4, timeoutMs: 15_000, enabled: true }

const num = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}
const isProvider = (v: unknown): v is TtsProviderId => typeof v === 'string' && (TTS_PROVIDER_IDS as string[]).includes(v)

export function normalizeVoicePolicy(value: unknown): VoicePolicy {
  const out: VoicePolicy = { ...DEFAULT_VOICE_POLICY, providerOrder: [...DEFAULT_VOICE_POLICY.providerOrder], voices: {} }
  if (!value || typeof value !== 'object') return out
  const v = value as Record<string, unknown>
  if (Array.isArray(v.providerOrder)) {
    const order = Array.from(new Set(v.providerOrder.filter(isProvider)))
    if (order.length) out.providerOrder = order
  }
  if (v.voices && typeof v.voices === 'object') for (const [p, id] of Object.entries(v.voices as Record<string, unknown>)) if (isProvider(p) && typeof id === 'string' && id.trim()) out.voices[p] = id.trim().slice(0, 80)
  out.rate = Math.round(num(v.rate, out.rate, 0.7, 1.3) * 100) / 100
  if (typeof v.locale === 'string' && /^[a-z]{2}(-[A-Z]{2})?$/.test(v.locale)) out.locale = v.locale
  out.silenceThinkingSec = Math.round(num(v.silenceThinkingSec, out.silenceThinkingSec, 0, 600))
  out.silenceClarifySec = Math.round(num(v.silenceClarifySec, out.silenceClarifySec, 0, 900))
  out.endOfSpeechSec = Math.round(num(v.endOfSpeechSec, out.endOfSpeechSec, 1.5, 20) * 10) / 10
  out.timeoutMs = Math.round(num(v.timeoutMs, out.timeoutMs, 2000, 60_000))
  if (typeof v.enabled === 'boolean') out.enabled = v.enabled
  return out
}

export const VOICE_SETTING_KEY = 'voice'
export const getVoicePolicy = (): Promise<VoicePolicy> => readSetting(VOICE_SETTING_KEY, DEFAULT_VOICE_POLICY, normalizeVoicePolicy)
export async function saveVoicePolicy(value: unknown, updatedBy: string | null): Promise<VoicePolicy> {
  const policy = normalizeVoicePolicy(value)
  await writeSetting(VOICE_SETTING_KEY, policy, updatedBy)
  return policy
}

// ---------------------------------------------------------------------------
// Adapters
// ---------------------------------------------------------------------------

const env = (name: string) => (process.env[name] || '').trim()

async function failFrom(res: Response, provider: string): Promise<never> {
  const body = await res.text().catch(() => '')
  const kind = res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate_limit' : 'server'
  throw new TtsError(kind, `${provider} TTS ${res.status}: ${body.slice(0, 200)}`, res.status)
}

/** OpenAI speech API (`gpt-4o-mini-tts` / `tts-1`): calm, neutral international English voices. */
export const openAiTts: TtsAdapter = {
  id: 'openai',
  label: 'OpenAI speech',
  keyFromEnv: () => env('OPENAI_TTS_API_KEY') || env('OPENAI_API_KEY'),
  isConfigured() {
    return Boolean(this.keyFromEnv())
  },
  voices: [
    { id: 'onyx', label: 'Onyx · deep, calm', locale: 'en' },
    { id: 'echo', label: 'Echo · neutral, measured', locale: 'en' },
    { id: 'sage', label: 'Sage · warm, clear', locale: 'en' },
    { id: 'alloy', label: 'Alloy · neutral', locale: 'en' },
    { id: 'shimmer', label: 'Shimmer · soft, clear', locale: 'en' },
  ],
  defaultVoice: 'echo',
  async synthesize(input, apiKey) {
    const model = env('OPENAI_TTS_MODEL') || 'gpt-4o-mini-tts'
    const res = await input.fetchImpl('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: input.text, voice: input.voice, speed: input.rate, response_format: 'mp3', ...(model.startsWith('gpt-4o') ? { instructions: 'You are a calm, professional interviewer. Speak clearly at a measured pace, neutral and confident, never enthusiastic or hurried. Use clear neutral international English.' } : {}) }),
      signal: input.signal,
    })
    if (!res.ok) await failFrom(res, 'OpenAI')
    return { audio: await res.arrayBuffer(), mime: 'audio/mpeg' }
  },
}

/** Google Cloud Text-to-Speech (API key): Indian-English and international neural voices. */
export const googleTts: TtsAdapter = {
  id: 'google',
  label: 'Google Cloud Text-to-Speech',
  keyFromEnv: () => env('GOOGLE_TTS_API_KEY'),
  isConfigured() {
    return Boolean(this.keyFromEnv())
  },
  voices: [
    { id: 'en-IN-Neural2-B', label: 'Indian English · male, neutral', locale: 'en-IN' },
    { id: 'en-IN-Neural2-A', label: 'Indian English · female, neutral', locale: 'en-IN' },
    { id: 'en-GB-Neural2-B', label: 'British English · male, calm', locale: 'en-GB' },
    { id: 'en-US-Neural2-D', label: 'US English · male, measured', locale: 'en-US' },
    { id: 'en-US-Neural2-F', label: 'US English · female, clear', locale: 'en-US' },
  ],
  defaultVoice: 'en-IN-Neural2-B',
  async synthesize(input, apiKey) {
    const languageCode = /^[a-z]{2}-[A-Z]{2}/.exec(input.voice)?.[0] ?? input.locale
    const res = await input.fetchImpl(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text: input.text }, voice: { languageCode, name: input.voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: input.rate, pitch: 0 } }),
      signal: input.signal,
    })
    if (!res.ok) await failFrom(res, 'Google')
    const data = (await res.json()) as { audioContent?: string }
    if (!data.audioContent) throw new TtsError('server', 'Google TTS returned no audio')
    return { audio: Buffer.from(data.audioContent, 'base64').buffer.slice(0) as ArrayBuffer, mime: 'audio/mpeg' }
  },
}

/** ElevenLabs multilingual voices (voice ids are account specific; set ELEVENLABS_VOICE_ID). */
export const elevenLabsTts: TtsAdapter = {
  id: 'elevenlabs',
  label: 'ElevenLabs',
  keyFromEnv: () => env('ELEVENLABS_API_KEY'),
  isConfigured() {
    return Boolean(this.keyFromEnv()) && Boolean(env('ELEVENLABS_VOICE_ID'))
  },
  get voices() {
    const id = env('ELEVENLABS_VOICE_ID')
    return id ? [{ id, label: 'Configured ElevenLabs voice', locale: 'en' }] : []
  },
  get defaultVoice() {
    return env('ELEVENLABS_VOICE_ID')
  },
  async synthesize(input, apiKey) {
    const res = await input.fetchImpl(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(input.voice)}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.text, model_id: env('ELEVENLABS_MODEL') || 'eleven_multilingual_v2', voice_settings: { stability: 0.6, similarity_boost: 0.7, speed: input.rate } }),
      signal: input.signal,
    })
    if (!res.ok) await failFrom(res, 'ElevenLabs')
    return { audio: await res.arrayBuffer(), mime: 'audio/mpeg' }
  },
}

/** Silent WAV fixture (development and tests only): proves the streaming path without any provider. */
export const fixtureTts: TtsAdapter = {
  id: 'fixture',
  label: 'Fixture voice (development only)',
  keyFromEnv: () => (process.env.NODE_ENV !== 'production' || (process.env.APP_STAGE || '').trim().toLowerCase() === 'staging' ? (env('TTS_FIXTURE') === '1' ? 'fixture' : '') : ''),
  isConfigured() {
    return Boolean(this.keyFromEnv())
  },
  voices: [{ id: 'fixture-neutral', label: 'Fixture · silent test tone', locale: 'en-IN' }],
  defaultVoice: 'fixture-neutral',
  async synthesize(input) {
    const forced = /\[tts:([a-z_]+)\]/.exec(input.text)
    if (forced) throw new TtsError(forced[1] as TtsError['kind'], `fixture ${forced[1]}`, forced[1] === 'rate_limit' ? 429 : 500)
    // ~120 ms of silence per 10 characters, so duration tracks text length like real speech.
    const seconds = Math.min(30, Math.max(0.3, (input.text.length / 10) * 0.12 / input.rate))
    return { audio: silentWav(seconds), mime: 'audio/wav' }
  },
}

export function silentWav(seconds: number, sampleRate = 8000): ArrayBuffer {
  const samples = Math.floor(seconds * sampleRate)
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  const str = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  str(36, 'data')
  view.setUint32(40, samples * 2, true)
  return buffer
}

export const TTS_ADAPTERS: TtsAdapter[] = [openAiTts, googleTts, elevenLabsTts, fixtureTts]

export interface VoiceAvailability {
  /** 'premium' when a server provider is configured, 'browser' when only the browser can speak, reported honestly to the UI. */
  mode: 'premium' | 'browser'
  provider: TtsProviderId | null
  providerLabel: string | null
  voices: TtsVoice[]
  defaultVoice: string | null
  rate: number
  locale: string
  silenceThinkingSec: number
  silenceClarifySec: number
  endOfSpeechSec: number
  enabled: boolean
}

export function resolveTts(policy: VoicePolicy, adapters: TtsAdapter[] = TTS_ADAPTERS): { adapter: TtsAdapter; apiKey: string } | null {
  if (!policy.enabled) return null
  for (const id of policy.providerOrder) {
    const adapter = adapters.find((a) => a.id === id)
    if (!adapter || !adapter.isConfigured()) continue
    const apiKey = adapter.keyFromEnv()
    if (apiKey) return { adapter, apiKey }
  }
  return null
}

export function voiceAvailability(policy: VoicePolicy, adapters: TtsAdapter[] = TTS_ADAPTERS): VoiceAvailability {
  const resolved = resolveTts(policy, adapters)
  const base = { rate: policy.rate, locale: policy.locale, silenceThinkingSec: policy.silenceThinkingSec, silenceClarifySec: policy.silenceClarifySec, endOfSpeechSec: policy.endOfSpeechSec, enabled: policy.enabled }
  if (!resolved) return { mode: 'browser', provider: null, providerLabel: null, voices: [], defaultVoice: null, ...base }
  const { adapter } = resolved
  const chosen = policy.voices[adapter.id]
  return { mode: 'premium', provider: adapter.id, providerLabel: adapter.label, voices: adapter.voices, defaultVoice: chosen && adapter.voices.some((v) => v.id === chosen) ? chosen : adapter.defaultVoice, ...base }
}

export const MAX_TTS_CHARS = 1500
/** The line learners hear from "Test interviewer voice" and admins synthesise with the voice probe. */
export const VOICE_TEST_LINE = "Hello. I'll be your interviewer today. Can you hear me clearly?"

/**
 * Synthesises one interviewer utterance with the first configured provider.
 * Returns null when no provider is configured; throws TtsError on provider
 * failure so the route can tell the client to fall back to browser speech.
 */
export async function synthesizeSpeech(policy: VoicePolicy, input: { text: string; voice?: string | null; rate?: number | null }, deps: { adapters?: TtsAdapter[]; fetchImpl?: typeof fetch } = {}): Promise<{ audio: ArrayBuffer; mime: string; provider: TtsProviderId; voice: string; latencyMs: number } | null> {
  const text = input.text.replace(/\s+/g, ' ').trim()
  if (!text) throw new TtsError('validation', 'Nothing to say')
  if (text.length > MAX_TTS_CHARS) throw new TtsError('validation', `Utterance longer than ${MAX_TTS_CHARS} characters`)
  const resolved = resolveTts(policy, deps.adapters ?? TTS_ADAPTERS)
  if (!resolved) return null
  const { adapter, apiKey } = resolved
  const voice = input.voice && adapter.voices.some((v) => v.id === input.voice) ? input.voice : policy.voices[adapter.id] && adapter.voices.some((v) => v.id === policy.voices[adapter.id]) ? policy.voices[adapter.id]! : adapter.defaultVoice
  const rate = Math.round(Math.min(1.3, Math.max(0.7, Number(input.rate) || policy.rate)) * 100) / 100
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), policy.timeoutMs)
  const started = Date.now()
  try {
    const out = await adapter.synthesize({ text, voice, rate, locale: policy.locale, signal: controller.signal, fetchImpl: deps.fetchImpl ?? fetch }, apiKey)
    return { ...out, provider: adapter.id, voice, latencyMs: Date.now() - started }
  } catch (error) {
    if (error instanceof TtsError) throw error
    if ((error as Error)?.name === 'AbortError') throw new TtsError('timeout', 'voice provider timed out')
    throw new TtsError('network', (error as Error)?.message || 'voice provider failure')
  } finally {
    clearTimeout(timer)
  }
}
