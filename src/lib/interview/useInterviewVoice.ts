import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listen, silenceNudgeLevel, sttSupported, ttsSupported, type Listener } from './speech'
import { createSpeaker, type SpeakResult, type VoiceMode, type VoiceSettings } from './voice'

/**
 * Voice orchestration for an interview room: the interviewer speaks (server
 * or browser voice), the learner answers by microphone with pause tolerance,
 * silence is noticed gently, and the end of an answer is detected without
 * cutting the learner off. Text always works; the hook is inert when voice is
 * disabled or unsupported.
 */
export type VoiceState = 'idle' | 'speaking' | 'listening' | 'processing'

export interface UseInterviewVoiceArgs {
  /** 'premium' when the server can synthesise for this learner; 'browser' otherwise. */
  serverMode: 'premium' | 'browser'
  settings: VoiceSettings
  /** The room is live (not on the device check or the report). */
  active: boolean
  /** The current question changed: silence timers restart. */
  questionKey: string | null
  /** Draft text typed by the learner; typing pauses silence nudges and cancels auto-send. */
  hasDraft: boolean
  onNudge?: (level: 1 | 2) => void
  onAutoSend?: (text: string) => void
}

export interface UseInterviewVoice {
  state: VoiceState
  /** Engine that spoke last (premium / browser / off) so the UI can label it honestly. */
  mode: VoiceMode
  fallbackReason: string | null
  speak: (text: string, opts?: { onStart?: () => void }) => Promise<SpeakResult>
  cancelSpeech: () => void
  startListening: (base?: string) => void
  stopListening: () => void
  listening: boolean
  /** Final recognised text so far and the live interim fragment. */
  transcript: string
  interim: string
  setTranscript: (text: string) => void
  voiceError: string | null
  clearVoiceError: () => void
  setProcessing: (on: boolean) => void
  micSupported: boolean
  speechSupported: boolean
  /** Seconds left before the spoken answer is sent automatically, or null. */
  autoSendIn: number | null
  cancelAutoSend: () => void
  lastLatency: { ttsMs: number | null; sttMs: number | null }
}

export function useInterviewVoice(args: UseInterviewVoiceArgs): UseInterviewVoice {
  const { serverMode, settings, active, questionKey, hasDraft, onNudge, onAutoSend } = args
  const [state, setState] = useState<VoiceState>('idle')
  const [mode, setMode] = useState<VoiceMode>(settings.enabled ? (serverMode === 'premium' ? 'premium' : 'browser') : 'off')
  const [fallbackReason, setFallbackReason] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [autoSendIn, setAutoSendIn] = useState<number | null>(null)
  const [lastLatency, setLastLatency] = useState<{ ttsMs: number | null; sttMs: number | null }>({ ttsMs: null, sttMs: null })
  const speaker = useMemo(() => createSpeaker({ serverMode, settings }), [serverMode, settings])
  const listener = useRef<Listener | null>(null)
  const processing = useRef(false)
  const speakingRef = useRef(false)
  const listeningRef = useRef(false)
  const silenceStart = useRef<number>(Date.now())
  const nudged = useRef<0 | 1 | 2>(0)
  const lastInterimAt = useRef<number | null>(null)
  const autoSendTimer = useRef<number | null>(null)
  const pendingText = useRef<string>('')
  const onNudgeRef = useRef(onNudge)
  const onAutoSendRef = useRef(onAutoSend)
  onNudgeRef.current = onNudge
  onAutoSendRef.current = onAutoSend

  const compute = useCallback(() => {
    if (processing.current) return 'processing'
    if (speakingRef.current) return 'speaking'
    if (listeningRef.current) return 'listening'
    return 'idle'
  }, [])
  const refresh = useCallback(() => setState(compute()), [compute])

  const cancelAutoSend = useCallback(() => {
    if (autoSendTimer.current) window.clearInterval(autoSendTimer.current)
    autoSendTimer.current = null
    pendingText.current = ''
    setAutoSendIn(null)
  }, [])

  const stopListening = useCallback(() => {
    listener.current?.stop()
    listener.current = null
    listeningRef.current = false
    setListening(false)
    setInterim('')
    refresh()
  }, [refresh])

  const cancelSpeech = useCallback(() => {
    speaker.cancel()
    speakingRef.current = false
    refresh()
  }, [speaker, refresh])

  const speak = useCallback(
    async (text: string, opts: { onStart?: () => void } = {}): Promise<SpeakResult> => {
      if (!settings.enabled) {
        setMode('off')
        return { mode: 'off', latencyMs: 0 }
      }
      if (listener.current) stopListening()
      speakingRef.current = true
      refresh()
      const result = await speaker.speak(text, {
        onStart: () => {
          speakingRef.current = true
          refresh()
          opts.onStart?.()
        },
      })
      speakingRef.current = false
      setMode(result.mode)
      setFallbackReason(result.fallbackReason ?? null)
      setLastLatency((l) => ({ ...l, ttsMs: result.latencyMs }))
      silenceStart.current = Date.now()
      nudged.current = 0
      refresh()
      return result
    },
    [speaker, settings.enabled, stopListening, refresh],
  )

  const startListening = useCallback(
    (base = '') => {
      if (listener.current) return
      cancelAutoSend()
      speaker.cancel()
      speakingRef.current = false
      setVoiceError(null)
      const started = listen(
        {
          onText: (finalText, interimText) => {
            setTranscript(`${base}${base && !base.endsWith(' ') && finalText ? ' ' : ''}${finalText}`)
            setInterim(interimText)
            if (interimText) lastInterimAt.current = Date.now()
            else if (lastInterimAt.current) {
              const sttMs = Date.now() - lastInterimAt.current
              lastInterimAt.current = null
              setLastLatency((l) => ({ ...l, sttMs }))
            }
            silenceStart.current = Date.now()
          },
          onEnd: (err) => {
            listener.current = null
            listeningRef.current = false
            setListening(false)
            setInterim('')
            if (err) setVoiceError(err)
            refresh()
          },
        },
        {
          endOfSpeechMs: settings.autoSend ? Math.round(settings.endOfSpeechSec * 1000) : 0,
          onEndOfSpeech: (finalText) => {
            const text = `${base}${base && !base.endsWith(' ') && finalText ? ' ' : ''}${finalText}`.trim()
            if (!text) return
            pendingText.current = text
            let left = 3
            setAutoSendIn(left)
            autoSendTimer.current = window.setInterval(() => {
              left -= 1
              if (left <= 0) {
                cancelAutoSend()
                onAutoSendRef.current?.(text)
              } else setAutoSendIn(left)
            }, 1000)
          },
        },
      )
      if (!started) {
        setVoiceError('Dictation is not available in this browser. Chrome and Edge support it; you can always type.')
        return
      }
      listener.current = started
      listeningRef.current = true
      setListening(true)
      refresh()
    },
    [speaker, settings.autoSend, settings.endOfSpeechSec, cancelAutoSend, refresh],
  )

  const setProcessing = useCallback(
    (on: boolean) => {
      processing.current = on
      if (on) {
        cancelAutoSend()
        if (listener.current) stopListening()
      }
      refresh()
    },
    [cancelAutoSend, stopListening, refresh],
  )

  // Silence nudges: only while the room is live, the interviewer is quiet, nothing is typed and no answer is in flight.
  useEffect(() => {
    silenceStart.current = Date.now()
    nudged.current = 0
  }, [questionKey])
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      if (speakingRef.current || processing.current || hasDraft || autoSendTimer.current) {
        silenceStart.current = Date.now()
        return
      }
      const spoke = Boolean(transcript.trim() || interim.trim())
      const level = silenceNudgeLevel(Date.now() - silenceStart.current, spoke, { thinkingMs: settings.silenceThinkingSec * 1000, clarifyMs: settings.silenceClarifySec * 1000 })
      if (level > nudged.current) {
        nudged.current = level
        onNudgeRef.current?.(level as 1 | 2)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [active, hasDraft, transcript, interim, settings.silenceThinkingSec, settings.silenceClarifySec])

  // Typing cancels a pending auto-send.
  useEffect(() => {
    if (hasDraft && autoSendTimer.current) cancelAutoSend()
  }, [hasDraft, cancelAutoSend])

  useEffect(
    () => () => {
      listener.current?.stop()
      speaker.cancel()
      if (autoSendTimer.current) window.clearInterval(autoSendTimer.current)
    },
    [speaker],
  )

  return {
    state,
    mode,
    fallbackReason,
    speak,
    cancelSpeech,
    startListening,
    stopListening,
    listening,
    transcript,
    interim,
    setTranscript,
    voiceError,
    clearVoiceError: () => setVoiceError(null),
    setProcessing,
    micSupported: typeof window !== 'undefined' && sttSupported(),
    speechSupported: typeof window !== 'undefined' && (ttsSupported() || serverMode === 'premium'),
    autoSendIn,
    cancelAutoSend,
    lastLatency,
  }
}
