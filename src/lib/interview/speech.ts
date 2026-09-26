/**
 * Browser speech APIs behind small abstractions.
 *
 * Text-to-speech here is the *browser fallback*; the interview room prefers
 * the server voice (see voice.ts) and only uses `speak` when no premium
 * provider is available or it fails. Speech recognition wraps the Web Speech
 * API with pause tolerance: a short silence never ends the answer, the
 * recogniser is restarted when the browser stops it early, and the caller is
 * told about silence so it can detect the end of an answer or nudge gently.
 */

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(window.speechSynthesis) && typeof SpeechSynthesisUtterance !== 'undefined'
}

let cachedVoice: SpeechSynthesisVoice | null | undefined
let preferredVoiceUri: string | null = null

export function browserVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return []
  return window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang || ''))
}

/** Lets the learner pick a specific browser voice (voiceURI); null returns to the automatic choice. */
export function setPreferredBrowserVoice(uri: string | null): void {
  preferredVoiceUri = uri
  cachedVoice = undefined
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  if (preferredVoiceUri) {
    const chosen = voices.find((v) => v.voiceURI === preferredVoiceUri)
    if (chosen) {
      cachedVoice = chosen
      return chosen
    }
  }
  const preferred = ['en-IN', 'en-GB', 'en-US', 'en-AU']
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0
    const idx = preferred.findIndex((lang) => v.lang?.replace('_', '-').toLowerCase().startsWith(lang.toLowerCase()))
    if (idx >= 0) s += (preferred.length - idx) * 10
    if (/natural|neural|premium|enhanced|online/i.test(v.name)) s += 8
    if (/google|microsoft/i.test(v.name)) s += 4
    if (v.localService === false) s += 2
    return s
  }
  cachedVoice = [...voices].sort((a, b) => score(b) - score(a))[0] || null
  return cachedVoice
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined
  })
}

export interface SpeakOptions {
  onStart?: () => void
  onEnd?: () => void
  /** Speaking rate multiplier; the interviewer default is slightly under normal. */
  rate?: number
  /** Milliseconds to wait for the synthesiser to start before treating the utterance as finished (headless or muted engines never fire onstart). */
  startTimeoutMs?: number
}

/** Speaks the text with the browser synthesiser; returns a cancel function. Resolves callers even when the engine never starts. */
export function speak(text: string, opts: SpeakOptions = {}): () => void {
  if (!ttsSupported() || !text.trim()) {
    opts.onEnd?.()
    return () => {}
  }
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) utterance.voice = voice
  utterance.rate = Math.min(1.3, Math.max(0.7, opts.rate ?? 0.95))
  utterance.pitch = 1
  let started = false
  let ended = false
  const finish = () => {
    if (ended) return
    ended = true
    window.clearTimeout(watchdog)
    opts.onEnd?.()
  }
  const watchdog = window.setTimeout(() => {
    if (!started) finish()
  }, opts.startTimeoutMs ?? 2500)
  utterance.onstart = () => {
    started = true
    opts.onStart?.()
  }
  utterance.onend = finish
  utterance.onerror = finish
  synth.speak(utterance)
  return () => {
    synth.cancel()
    finish()
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
  onspeechstart?: (() => void) | null
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

/** Checks microphone permission and device without starting recognition. Releases the probe stream immediately. */
export async function checkMicrophone(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof window === 'undefined') return { ok: false, message: 'Microphone checks need a browser.' }
  const policy = (document as Document & { permissionsPolicy?: { allowsFeature: (feature: string) => boolean }; featurePolicy?: { allowsFeature: (feature: string) => boolean } }).permissionsPolicy || (document as Document & { featurePolicy?: { allowsFeature: (feature: string) => boolean } }).featurePolicy
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return { ok: false, message: 'Microphone access needs a secure browser page (https or localhost). You can still type your answers.' }
  if (policy && !policy.allowsFeature('microphone')) return { ok: false, message: 'This page’s permissions policy blocks the microphone. Reload the page, or open the site directly rather than in an embedded browser.' }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return { ok: true }
  } catch (error) {
    return { ok: false, message: microphoneErrorMessage(error instanceof Error ? error.name : 'UnknownError') }
  }
}

export interface ListenOptions {
  /** Recognition language; defaults to the browser language when English, else en-IN. */
  lang?: string
  /** Called every second of silence with the milliseconds since speech was last heard (0 while the learner is talking). */
  onSilence?: (silentMs: number, spokeSomething: boolean) => void
  /** Milliseconds of silence after speech before the listener stops itself and reports end of speech. 0 disables. */
  endOfSpeechMs?: number
  onEndOfSpeech?: (finalText: string) => void
  /** Skip the microphone probe (already checked by the device check). */
  skipProbe?: boolean
}

/**
 * Starts dictation. `onText` receives the finalised text so far and the
 * current interim fragment; `onEnd` fires when listening stops for good.
 * Browsers stop continuous recognition after a few seconds of silence or on
 * a hiccup; the listener restarts it transparently so a pause to think never
 * ends the answer. Only a manual stop, an unrecoverable error, or
 * `endOfSpeechMs` of silence after speech ends the session.
 */
export function listen(handlers: { onText: (finalText: string, interim: string) => void; onEnd: (error?: string) => void }, options: ListenOptions = {}): Listener | null {
  const Ctor = recognitionCtor()
  if (!Ctor) return null
  const lang = options.lang || (navigator.language?.startsWith('en') ? navigator.language : 'en-IN')
  let rec: SpeechRecognitionLike | null = null
  let finalText = ''
  let interim = ''
  let stopped = false
  let restarts = 0
  let spoke = false
  let lastSpeechAt = Date.now()
  const startedAt = Date.now()
  const silenceTimer = window.setInterval(() => {
    if (stopped) return
    const silentMs = interim ? 0 : Date.now() - lastSpeechAt
    options.onSilence?.(silentMs, spoke)
    if (options.endOfSpeechMs && spoke && silentMs >= options.endOfSpeechMs) {
      stopAll()
      options.onEndOfSpeech?.(finalText)
      handlers.onEnd()
    }
  }, 1000)
  const stopAll = () => {
    if (stopped) return
    stopped = true
    window.clearInterval(silenceTimer)
    try {
      rec?.stop()
    } catch {
      // ignore
    }
  }
  const fail = (message?: string) => {
    if (stopped) return
    stopAll()
    handlers.onEnd(message)
  }
  const attach = () => {
    const r = new Ctor()
    r.lang = lang
    r.continuous = true
    r.interimResults = true
    r.onresult = (event) => {
      let chunkInterim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const chunk = result[0]?.transcript || ''
        if (result.isFinal) finalText += (finalText && !finalText.endsWith(' ') ? ' ' : '') + chunk.trim()
        else chunkInterim += chunk
      }
      interim = chunkInterim
      if (chunkInterim.trim() || finalText.trim()) {
        spoke = true
        lastSpeechAt = Date.now()
      }
      handlers.onText(finalText, interim)
    }
    r.onerror = (event) => {
      if (stopped) return
      const code = event.error
      // Silence and aborted recognisers are recoverable: restart and keep listening.
      if (code === 'no-speech' || code === 'aborted') return
      if (code === 'network' && restarts < 2 && Date.now() - startedAt > 3000) return
      fail(recognitionErrorMessage(code))
    }
    r.onend = () => {
      if (stopped) return
      // The browser ended recognition (silence timeout or an internal reset). Keep listening.
      if (restarts >= 40) {
        fail('Dictation stopped after a long pause. Press the microphone to continue, or type your answer.')
        return
      }
      restarts += 1
      interim = ''
      window.setTimeout(() => {
        if (stopped) return
        try {
          attach()
        } catch {
          fail('Dictation could not be restarted. Press the microphone to continue, or type your answer.')
        }
      }, 150)
    }
    rec = r
    r.start()
  }
  const begin = async () => {
    if (stopped) return
    if (!options.skipProbe) {
      const check = await checkMicrophone()
      if (!check.ok) {
        fail(check.message)
        return
      }
    }
    if (stopped) return
    try {
      attach()
    } catch {
      fail('The microphone is available, but speech recognition could not start. Try again in Google Chrome, or type your answer.')
    }
  }
  // Defer callbacks until the caller has received its cancellable listener.
  void Promise.resolve().then(begin)
  return {
    stop: () => {
      if (stopped) return
      stopAll()
      handlers.onEnd()
    },
  }
}

/**
 * Pure end-of-answer detector shared by the listener and its tests: given the
 * silence so far and whether speech was heard, says whether the answer looks
 * finished. Brief pauses (under `endOfSpeechMs`) never count.
 */
export function answerLooksFinished(silentMs: number, spoke: boolean, endOfSpeechMs: number): boolean {
  return endOfSpeechMs > 0 && spoke && silentMs >= endOfSpeechMs
}

/** Which silence nudge (if any) applies after `silentMs` without any speech. Thresholds of 0 disable a level. */
export function silenceNudgeLevel(silentMs: number, spoke: boolean, thresholds: { thinkingMs: number; clarifyMs: number }): 0 | 1 | 2 {
  if (spoke) return 0
  if (thresholds.clarifyMs > 0 && silentMs >= thresholds.clarifyMs) return 2
  if (thresholds.thinkingMs > 0 && silentMs >= thresholds.thinkingMs) return 1
  return 0
}
