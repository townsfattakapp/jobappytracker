import { browserVoices, setPreferredBrowserVoice, speak as browserSpeak, stopSpeaking, ttsSupported } from './speech'
import { VOICE_SYNTH_URL } from '../jobs/interviewClient'

/**
 * Interviewer voice for the browser: prefers the server voice (premium
 * provider, streamed as audio) and falls back to the browser's own speech
 * synthesis, reporting honestly which one is in use. Nothing here knows about
 * provider keys. Every `speak` resolves even when audio cannot play, so the
 * interview never waits on a voice.
 */
export type VoiceMode = 'premium' | 'browser' | 'off'

export interface VoiceSettings {
  /** Interviewer speaks out loud. */
  enabled: boolean
  /** Speaking rate multiplier (0.8 – 1.2). */
  rate: number
  /** Premium voice id (server) or browser voiceURI, depending on mode. */
  voiceId: string | null
  captions: boolean
  /** Send the spoken answer automatically after the end-of-speech pause. */
  autoSend: boolean
  /** Silence before "Take your time." and before the repeat / clarify offer, seconds (0 disables). */
  silenceThinkingSec: number
  silenceClarifySec: number
  /** Silence after speech before the answer counts as finished, seconds. */
  endOfSpeechSec: number
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = { enabled: true, rate: 0.95, voiceId: null, captions: true, autoSend: true, silenceThinkingSec: 25, silenceClarifySec: 60, endOfSpeechSec: 4 }

const SETTINGS_KEY = 'prep-interview-voice'

/** Per-device convenience: remembered voice preferences. Never authoritative for anything server-side. */
export function loadVoiceSettings(defaults: Partial<VoiceSettings> = {}): VoiceSettings {
  const base = { ...DEFAULT_VOICE_SETTINGS, ...defaults }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : base.enabled,
      rate: typeof parsed.rate === 'number' && parsed.rate >= 0.8 && parsed.rate <= 1.2 ? parsed.rate : base.rate,
      voiceId: typeof parsed.voiceId === 'string' ? parsed.voiceId : base.voiceId,
      captions: typeof parsed.captions === 'boolean' ? parsed.captions : base.captions,
      autoSend: typeof parsed.autoSend === 'boolean' ? parsed.autoSend : base.autoSend,
      silenceThinkingSec: typeof parsed.silenceThinkingSec === 'number' ? parsed.silenceThinkingSec : base.silenceThinkingSec,
      silenceClarifySec: typeof parsed.silenceClarifySec === 'number' ? parsed.silenceClarifySec : base.silenceClarifySec,
      endOfSpeechSec: typeof parsed.endOfSpeechSec === 'number' && parsed.endOfSpeechSec >= 2 && parsed.endOfSpeechSec <= 15 ? parsed.endOfSpeechSec : base.endOfSpeechSec,
    }
  } catch {
    return base
  }
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // per-device convenience only
  }
}

export interface SpeakResult {
  /** Which engine actually spoke (or 'off' when nothing did). */
  mode: VoiceMode
  /** Milliseconds from the request until audio started (or until the fallback decision). */
  latencyMs: number
  /** Set when the premium voice failed and the browser voice was used instead. */
  fallbackReason?: string
}

export interface Speaker {
  /** Speaks one utterance; resolves when it ends or is cancelled. Never rejects. */
  speak: (text: string, opts?: { onStart?: () => void }) => Promise<SpeakResult>
  cancel: () => void
  /** Whether a premium (server) voice is the preferred engine right now. */
  premium: boolean
  supported: boolean
}

export interface SpeakerConfig {
  /** From the device check: 'premium' when the server can synthesise for this learner. */
  serverMode: 'premium' | 'browser'
  settings: VoiceSettings
  fetchImpl?: typeof fetch
}

/** Text-only version of an interviewer line for speech synthesis (code fences are not read out). */
export function speakable(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' Take a look at the snippet I shared. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Creates a speaker for the current settings. Recreate it when settings change. */
export function createSpeaker(config: SpeakerConfig): Speaker {
  const { settings } = config
  const fetchImpl = config.fetchImpl ?? (typeof fetch === 'function' ? fetch.bind(globalThis) : undefined)
  let current: { cancel: () => void } | null = null
  let serverBroken = false
  if (config.serverMode !== 'premium' && settings.voiceId) setPreferredBrowserVoice(settings.voiceId)
  else setPreferredBrowserVoice(null)
  const supported = typeof window !== 'undefined' && (ttsSupported() || typeof Audio !== 'undefined')

  const viaBrowser = (text: string, onStart?: () => void, started: number = Date.now(), fallbackReason?: string): Promise<SpeakResult> =>
    new Promise((resolve) => {
      if (!ttsSupported()) {
        resolve({ mode: 'off', latencyMs: Date.now() - started, fallbackReason: fallbackReason ?? 'unsupported' })
        return
      }
      let latency = -1
      const cancel = browserSpeak(text, {
        rate: settings.rate,
        onStart: () => {
          latency = Date.now() - started
          onStart?.()
        },
        onEnd: () => {
          current = null
          resolve({ mode: 'browser', latencyMs: latency >= 0 ? latency : Date.now() - started, fallbackReason })
        },
      })
      current = { cancel }
    })

  const viaServer = async (text: string, onStart?: () => void): Promise<SpeakResult> => {
    const started = Date.now()
    if (!fetchImpl || typeof Audio === 'undefined') return viaBrowser(text, onStart, started, 'no_audio_element')
    let res: Response
    try {
      res = await fetchImpl(VOICE_SYNTH_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: settings.voiceId, rate: settings.rate }), credentials: 'same-origin' })
    } catch {
      return viaBrowser(text, onStart, started, 'network')
    }
    if (res.status === 204 || res.status === 503 || !res.ok) {
      const reason = res.headers.get('X-Voice-Reason') || `http_${res.status}`
      if (res.status === 402 || res.status === 204) serverBroken = true
      return viaBrowser(text, onStart, started, reason)
    }
    const blob = await res.blob().catch(() => null)
    if (!blob || !blob.size) return viaBrowser(text, onStart, started, 'empty_audio')
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      let done = false
      let latency = -1
      const finish = (result: SpeakResult) => {
        if (done) return
        done = true
        URL.revokeObjectURL(url)
        current = null
        resolve(result)
      }
      audio.onplaying = () => {
        latency = Date.now() - started
        onStart?.()
      }
      audio.onended = () => finish({ mode: 'premium', latencyMs: latency >= 0 ? latency : Date.now() - started })
      audio.onerror = () => {
        if (done) return
        done = true
        URL.revokeObjectURL(url)
        // Audio element failed (autoplay policy, codec): fall back to the browser voice for this utterance.
        void viaBrowser(text, onStart, started, 'playback').then(resolve)
      }
      current = {
        cancel: () => {
          try {
            audio.pause()
          } catch {
            // ignore
          }
          finish({ mode: 'premium', latencyMs: latency >= 0 ? latency : Date.now() - started })
        },
      }
      audio.play().catch(() => {
        if (done) return
        done = true
        URL.revokeObjectURL(url)
        void viaBrowser(text, onStart, started, 'autoplay').then(resolve)
      })
    })
  }

  return {
    supported,
    premium: config.serverMode === 'premium',
    cancel: () => {
      current?.cancel()
      current = null
      stopSpeaking()
    },
    speak: async (raw, opts = {}) => {
      const text = speakable(raw)
      if (!settings.enabled || !text) return { mode: 'off', latencyMs: 0 }
      current?.cancel()
      if (config.serverMode === 'premium' && !serverBroken) return viaServer(text, opts.onStart)
      return viaBrowser(text, opts.onStart)
    },
  }
}

/** Browser voices as options for the settings panel (empty until the browser has loaded them). */
export function browserVoiceOptions(): { id: string; label: string }[] {
  return browserVoices().map((v) => ({ id: v.voiceURI, label: `${v.name} (${v.lang})` }))
}
