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

export function microphoneErrorMessage(name: string): string {
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Microphone permission was denied. In this site’s browser settings, set Microphone to Allow, then check your device’s microphone privacy settings allow this browser. Reload the page and try again. You can still type your answer.'
  if (name === 'NotFoundError') return 'No microphone was found. Connect a microphone and select it in your browser’s microphone settings, then try again.'
  if (name === 'NotReadableError' || name === 'AbortError') return 'The microphone could not be opened. Close other apps using it, check your selected input device, and try again.'
  return 'Microphone access could not be checked. Open this page directly in Chrome, check your microphone settings, or type your answer.'
}

export function recognitionErrorMessage(code?: string): string | undefined {
  if (code === 'no-speech' || code === 'aborted') return undefined
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'The microphone check passed, but your browser blocked speech recognition. Open this page directly in Google Chrome and allow microphone access. Browser privacy settings or an organisation policy may disable dictation. You can still type your answer.'
  if (code === 'audio-capture') return 'Speech recognition could not capture audio. Check the microphone selected in your browser and close other apps using it, then try again.'
  if (code === 'network') return 'The speech-recognition service could not be reached. Check your connection and try again, or type your answer.'
  if (code === 'language-not-supported') return 'Your browser’s speech service does not support this language. Try English in Google Chrome, or type your answer.'
  return 'Dictation stopped unexpectedly. Try the microphone again, or type your answer.'
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
    handlers.onEnd(recognitionErrorMessage(event.error))
  }
  rec.onend = () => {
    if (stopped) return
    stopped = true
    handlers.onEnd()
  }
  const fail = (message: string) => {
    if (stopped) return
    stopped = true
    handlers.onEnd(message)
  }
  // Check capture separately so a rejected speech service is not incorrectly
  // reported as denied microphone permission. Release the probe immediately.
  const begin = async () => {
    if (stopped) return
    const policy = (document as Document & { permissionsPolicy?: { allowsFeature: (feature: string) => boolean }; featurePolicy?: { allowsFeature: (feature: string) => boolean } }).permissionsPolicy
      || (document as Document & { featurePolicy?: { allowsFeature: (feature: string) => boolean } }).featurePolicy
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      fail('Microphone access needs a secure browser page. Open https://prep.evolw.in directly in Chrome, or type your answer.')
      return
    }
    if (policy && !policy.allowsFeature('microphone')) {
      fail('This page’s permissions policy blocks the microphone. Reload the page to get the latest version. If you are in a preview or embedded browser, open https://prep.evolw.in directly.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      fail(microphoneErrorMessage(error instanceof Error ? error.name : 'UnknownError'))
      return
    }
    if (stopped) return
    try {
      rec.start()
    } catch {
      fail('The microphone is available, but speech recognition could not start. Try again in Google Chrome, or type your answer.')
    }
  }
  // Defer callbacks until the caller has received its cancellable listener.
  void Promise.resolve().then(begin)
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
