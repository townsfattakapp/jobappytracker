/** Thin wrappers over the browser speech APIs, with graceful no-ops where unsupported. */

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

let cachedVoice: SpeechSynthesisVoice | null | undefined

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const preferred = ['en-IN', 'en-GB', 'en-US', 'en-AU']
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0
    const idx = preferred.findIndex((lang) => v.lang?.replace('_', '-').toLowerCase().startsWith(lang.toLowerCase()))
    if (idx >= 0) s += (preferred.length - idx) * 10
    if (/google|microsoft|natural|premium|enhanced/i.test(v.name)) s += 5
    if (v.localService === false) s += 2
    return s
  }
  cachedVoice = [...voices].sort((a, b) => score(b) - score(a))[0] || null
  return cachedVoice
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined
  })
}

/** Speaks the text; resolves when finished or cancelled. */
export function speak(text: string, opts: { onStart?: () => void; onEnd?: () => void } = {}): () => void {
  if (!ttsSupported() || !text.trim()) {
    opts.onEnd?.()
    return () => {}
  }
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 1.02
  utterance.pitch = 1
  utterance.onstart = () => opts.onStart?.()
  utterance.onend = () => opts.onEnd?.()
  utterance.onerror = () => opts.onEnd?.()
  synth.speak(utterance)
  return () => {
    synth.cancel()
    opts.onEnd?.()
  }
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel()
}

type RecognitionCtor = new () => SpeechRecognitionLike

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function sttSupported(): boolean {
  return recognitionCtor() !== null
}

export interface Listener {
  stop: () => void
}

/**
 * Starts dictation. `onText` receives the finalised text so far and the
 * current interim fragment; `onEnd` fires when the browser stops listening.
 */
export function listen(handlers: { onText: (finalText: string, interim: string) => void; onEnd: (error?: string) => void }): Listener | null {
  const Ctor = recognitionCtor()
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = navigator.language?.startsWith('en') ? navigator.language : 'en-IN'
  rec.continuous = true
  rec.interimResults = true
  let finalText = ''
  let stopped = false
  rec.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const chunk = result[0]?.transcript || ''
      if (result.isFinal) finalText += (finalText && !finalText.endsWith(' ') ? ' ' : '') + chunk.trim()
      else interim += chunk
    }
    handlers.onText(finalText, interim)
  }
  rec.onerror = (event) => {
    if (stopped) return
    stopped = true
    handlers.onEnd(event.error === 'not-allowed' ? 'Microphone access was blocked. Allow the microphone in your browser and try again.' : event.error === 'no-speech' ? undefined : event.error)
  }
  rec.onend = () => {
    if (stopped) return
    stopped = true
    handlers.onEnd()
  }
  try {
    rec.start()
  } catch {
    return null
  }
  return {
    stop: () => {
      if (stopped) return
      stopped = true
      try {
        rec.stop()
      } catch {
        // ignore
      }
      handlers.onEnd()
    },
  }
}
