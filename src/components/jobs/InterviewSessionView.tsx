import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AlgoEditor from '../compiler/AlgoEditor'
import MermaidEditor from '../MermaidEditor'
import InterviewRoom, { useFocusMode, useFullscreen, type RoomTurn } from '../interview/InterviewRoom'
import { ApiError } from '../../lib/adminClient'
import type { CandidateIntent } from '../../lib/interview/conversation'
import { SECTION_TITLES, type InterviewQuestion, type TurnRecord } from '../../lib/interview/jobInterview'
import { useInterviewVoice } from '../../lib/interview/useInterviewVoice'
import type { VoiceSettings } from '../../lib/interview/voice'
import { abandonInterview, completeInterview, sendInterviewTurn, wrapUpInterview, type VoiceConfig } from '../../lib/jobs/interviewClient'
import { normalizeRunnerLanguage, STARTER_CODE } from '../../lib/codeRunner'
import type { NextStep, SessionDto } from '../../lib/server/interviews'

interface Props {
  session: SessionDto
  voiceConfig: VoiceConfig | null
  settings: VoiceSettings
  onSettingsChange: (s: VoiceSettings) => void
  onSessionChanged: (s: SessionDto) => void
  onFinished: (s: SessionDto) => void
  onLeave: () => void
}

const DEFAULT_DIAGRAM = `flowchart LR
  Client --> API[API service]
  API --> DB[(Database)]`

const TURN_NOTE: Partial<Record<TurnRecord['kind'], string>> = { clarification_request: 'asked for clarification', follow_up: 'follow-up', nudge: 'while you were thinking', candidate_question: 'your question', skip: 'skipped', transition: 'moving on', farewell: 'closing' }

/** Idle grace after the clock runs out before the interviewer wraps up on their own. */
const TIME_UP_GRACE_MS = 90_000

/**
 * The live job-specific interview inside the interview room. The server owns
 * the conversation (what is said, when to follow up, transitions, timing and
 * the closing); this view speaks it, listens, and sends the learner's turns.
 * A refresh resumes from the server; feedback is never shown until the
 * farewell has been spoken.
 */
export default function InterviewSessionView({ session, voiceConfig, settings, onSettingsChange, onSessionChanged, onFinished, onLeave }: Props) {
  const plannedMs = session.config.minutes * 60_000
  const startedAt = useMemo(() => Date.now() - session.elapsedMs, [session.id, session.elapsedMs])
  const [remaining, setRemaining] = useState(plannedMs - session.elapsedMs)
  const [text, setText] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [diagram, setDiagram] = useState(DEFAULT_DIAGRAM)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clarifyMode, setClarifyMode] = useState(false)
  /** A session started "in text only" stays silent until the learner unmutes; sessions started with voice (or that received a spoken answer) speak. */
  const [voiceOverride, setVoiceOverride] = useState(false)
  /** Restored after a refresh (the learner has already spoken or a while has passed): do not talk over them on mount. */
  const [resumed] = useState(session.turns.some((t) => t.role === 'candidate') || session.elapsedMs > 15_000)
  const [fullscreen, toggleFullscreen] = useFullscreen()
  const finishing = useRef(false)
  const busyRef = useRef(false)
  const sessionRef = useRef(session)
  sessionRef.current = session
  const textRef = useRef(text)
  textRef.current = text
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastSpokenTurn = useRef<string | null>(null)
  const turnStartedAt = useRef<number | null>(null)
  const lastTurnMs = useRef<number | null>(null)
  const serverDiag = useRef<{ serverMs: number; aiMs: number } | null>(null)
  const timeUpSince = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const next: NextStep = session.next
  const question: InterviewQuestion | null = next.type === 'done' ? null : next.question
  const serverMode: 'premium' | 'browser' = voiceConfig?.tts.mode === 'premium' ? 'premium' : 'browser'
  const voiceAllowed = Boolean(voiceConfig?.voice)
  const voiceOn = voiceAllowed && settings.enabled && (session.state.voice === true || voiceOverride)
  const timeUp = remaining <= 0

  useFocusMode(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const finish = useCallback(async () => {
    if (finishing.current) return
    finishing.current = true
    setBusy('finish')
    setError(null)
    try {
      const { session: done } = await completeInterview(sessionRef.current.id)
      onFinished(done)
    } catch (e) {
      finishing.current = false
      setError(e instanceof ApiError ? e.message : 'Could not finish the interview')
    } finally {
      setBusy(null)
    }
  }, [onFinished])
  const finishRef = useRef(finish)
  finishRef.current = finish

  const sendNudge = useCallback(
    async (level: 1 | 2) => {
      const s = sessionRef.current
      if (s.next.type === 'done' || busyRef.current) return
      try {
        const res = await sendInterviewTurn(s.id, { questionId: s.next.question.id, kind: 'nudge', level })
        onSessionChanged(res.session)
      } catch {
        // a missed nudge is harmless
      }
    },
    [onSessionChanged],
  )

  const submitRef = useRef<(kind: 'answer' | 'skip' | 'clarify', opts?: { text?: string; input?: 'voice' | 'text'; intent?: CandidateIntent }) => Promise<void>>(async () => {})
  const voiceListeningRef = useRef(false)
  const dictatedRef = useRef('')

  const voice = useInterviewVoice({
    serverMode,
    settings: useMemo(() => ({ ...settings, enabled: voiceOn }), [settings, voiceOn]),
    active: session.status === 'active' && !finishing.current,
    questionKey: question ? `${question.id}:${next.type}:${session.turns.length}` : null,
    // Only text the learner typed (not the dictated transcript) counts as a draft: it pauses nudges and cancels the automatic send.
    hasDraft: Boolean(text.trim()) && !voiceListeningRef.current && text.trim() !== dictatedRef.current.trim(),
    onNudge: (level) => void sendNudge(level),
    onAutoSend: (spoken) => void submitRef.current('answer', { text: spoken, input: 'voice' }),
  })
  voiceListeningRef.current = voice.listening
  dictatedRef.current = voice.transcript

  // Keep the draft in sync with dictation.
  useEffect(() => {
    if (voice.listening) setText(voice.transcript)
  }, [voice.transcript, voice.listening])

  useEffect(() => {
    const tick = window.setInterval(() => setRemaining(plannedMs - (Date.now() - startedAt)), 1000)
    return () => window.clearInterval(tick)
  }, [plannedMs, startedAt])

  useEffect(() => {
    if (question?.tool === 'code') {
      const lang = normalizeRunnerLanguage(question.language || 'javascript')
      setLanguage(lang)
      setCode(STARTER_CODE[lang] || '')
    } else if (question?.tool === 'diagram') setDiagram(DEFAULT_DIAGRAM)
    setClarifyMode(false)
  }, [question?.id, question?.tool, question?.language])

  // Speak whatever the interviewer just said, then hand the floor to the learner.
  useEffect(() => {
    const last = session.turns[session.turns.length - 1]
    if (!last || lastSpokenTurn.current === last.id) return
    const first = lastSpokenTurn.current === null
    lastSpokenTurn.current = last.id
    if (last.role !== 'interviewer') return
    if (first && resumed) {
      // Restored after a refresh: do not talk over the learner; the caption shows the question and "Repeat question" replays it.
      if (session.phase === 'ended') void finishRef.current()
      return
    }
    // No cleanup flag: React's development double-invocation of effects must not swallow the hand-over to the learner.
    // A newer interviewer turn (or an unmount) is detected through refs instead.
    ;(async () => {
      // Turn latency = learner finished → interviewer audio starts (measured at speech start, not at the end of playback).
      const result = await voice.speak(session.say, {
        onStart: () => {
          if (turnStartedAt.current) {
            lastTurnMs.current = Math.round(performance.now() - turnStartedAt.current)
            turnStartedAt.current = null
          }
        },
      })
      if (!mountedRef.current) return
      const s = sessionRef.current
      if (s.turns[s.turns.length - 1]?.id !== last.id) return
      if (turnStartedAt.current) {
        lastTurnMs.current = Math.round(performance.now() - turnStartedAt.current)
        turnStartedAt.current = null
      }
      if (s.phase === 'ended' || s.next.type === 'done') {
        void finishRef.current()
        return
      }
      if (voiceOn && result.mode !== 'off' && voice.micSupported && !textRef.current.trim()) voice.startListening('')
    })()
  }, [session.turns.length, session.say])

  // The clock ran out: the interviewer lets the current answer finish, then wraps up; idle learners are wrapped up after a grace period.
  useEffect(() => {
    if (!timeUp || session.phase !== 'interview') {
      timeUpSince.current = null
      return
    }
    if (timeUpSince.current === null) timeUpSince.current = Date.now()
    const timer = window.setInterval(async () => {
      const idle = !textRef.current.trim() && !voiceListeningRef.current && !busyRef.current
      if (idle && timeUpSince.current && Date.now() - timeUpSince.current >= TIME_UP_GRACE_MS) {
        window.clearInterval(timer)
        try {
          const { session: s } = await wrapUpInterview(sessionRef.current.id, 'time')
          onSessionChanged(s)
        } catch {
          // the next learner turn will wrap up instead
        }
      }
    }, 2000)
    return () => window.clearInterval(timer)
  }, [timeUp, session.phase, onSessionChanged])

  const submit = useCallback(
    async (kind: 'answer' | 'skip' | 'clarify', opts: { text?: string; input?: 'voice' | 'text'; intent?: CandidateIntent } = {}) => {
      const s = sessionRef.current
      if (s.next.type === 'done' || busyRef.current) return
      const q = s.next.question
      busyRef.current = true
      setBusy(kind)
      setError(null)
      voice.cancelSpeech()
      voice.setProcessing(true)
      turnStartedAt.current = performance.now()
      try {
        const answerText = (opts.text ?? textRef.current).trim()
        const shareCode = kind === 'answer' && q.tool === 'code' && code.trim() && code.trim() !== (STARTER_CODE[normalizeRunnerLanguage(language)] || '').trim()
        const shareDiagram = kind === 'answer' && q.tool === 'diagram' && diagram.trim() && diagram.trim() !== DEFAULT_DIAGRAM.trim()
        const latency = { ttsMs: voice.lastLatency.ttsMs ?? undefined, sttMs: voice.lastLatency.sttMs ?? undefined, turnMs: lastTurnMs.current ?? undefined }
        const res = await sendInterviewTurn(s.id, { questionId: q.id, kind, text: kind === 'skip' ? '' : answerText, code: shareCode ? code : null, language: shareCode ? language : null, diagram: shareDiagram ? diagram : null, input: opts.input ?? 'text', intent: opts.intent, latency })
        serverDiag.current = res.diagnostics ?? null
        setText('')
        voice.setTranscript('')
        setClarifyMode(false)
        onSessionChanged(res.session)
      } catch (e) {
        turnStartedAt.current = null
        setError(e instanceof ApiError ? e.message : 'Could not send your answer')
      } finally {
        busyRef.current = false
        setBusy(null)
        voice.setProcessing(false)
      }
    },
    [code, language, diagram, voice, onSessionChanged],
  )
  submitRef.current = submit

  const endInterview = async () => {
    if (session.phase === 'ended') {
      void finish()
      return
    }
    if (!window.confirm('End the interview now? The interviewer will wrap up, and your feedback follows right after.')) return
    busyRef.current = true
    setBusy('end')
    voice.cancelSpeech()
    voice.stopListening()
    try {
      const { session: s } = await wrapUpInterview(session.id, 'learner')
      setText('')
      voice.setTranscript('')
      onSessionChanged(s)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not wrap up the interview')
    } finally {
      busyRef.current = false
      setBusy(null)
    }
  }

  const leave = async () => {
    if (!window.confirm('Leave this interview? It will be marked as abandoned and no feedback will be generated.')) return
    voice.cancelSpeech()
    voice.stopListening()
    try {
      await abandonInterview(session.id)
    } catch {
      // still leave
    }
    onLeave()
  }

  const repeat = () => {
    if (voice.state === 'speaking') voice.cancelSpeech()
    void submit('clarify', { text: 'Could you repeat the question?', intent: 'repeat', input: 'text' })
  }

  const toggleMic = () => {
    if (voice.listening) voice.stopListening()
    else {
      voice.cancelSpeech()
      voice.startListening(text)
    }
  }

  const transcript: RoomTurn[] = useMemo(
    () =>
      session.turns.map((t) => ({
        id: t.id,
        role: t.role,
        text: t.kind === 'skip' ? '(skipped)' : t.lead ? `${t.lead} ${t.text}` : t.text,
        note: [TURN_NOTE[t.kind], t.role === 'candidate' && t.input === 'voice' ? 'spoken' : null].filter(Boolean).join(' · ') || undefined,
        code: t.code,
        diagram: t.diagram,
      })),
    [session.turns],
  )

  const stage = question ? { label: SECTION_TITLES[question.sectionId], index: next.type === 'done' ? session.plan.sections.length - 1 : next.sectionIndex, total: session.plan.sections.length } : null
  const statusLine = voice.state === 'speaking' ? 'Interviewer speaking…' : voice.state === 'processing' ? 'Processing response…' : voice.state === 'listening' ? `Listening… ${settings.autoSend ? `pause for ${settings.endOfSpeechSec} seconds when you are done` : 'press the microphone when you are done'}` : session.phase === 'closing' ? 'Your turn: ask a question, or say you have none.' : question ? (voiceOn ? 'Your turn. Speak, or type your answer.' : 'Your turn. Type your answer.') : 'Wrapping up…'
  const sendLabel = clarifyMode ? 'Ask' : session.phase === 'closing' ? 'Send' : next.type === 'follow_up' ? 'Answer follow-up' : 'Send answer'
  const disabled = busy !== null || finishing.current

  const composer = question ? (
    <form
      className="room-composer"
      onSubmit={(e) => {
        e.preventDefault()
        void submit(clarifyMode ? 'clarify' : 'answer', { input: voice.transcript && text === voice.transcript ? 'voice' : 'text' })
      }}
    >
      {voice.voiceError && (
        <p className="room-voice-error" role="alert">
          {voice.voiceError}{' '}
          <button type="button" className="btn btn-link btn-sm" onClick={voice.clearVoiceError}>
            Dismiss
          </button>
        </p>
      )}
      {voice.autoSendIn !== null && (
        <p className="room-autosend" role="status">
          Sending in {voice.autoSendIn}… Keep talking, edit the text, or{' '}
          <button type="button" className="btn btn-link btn-sm" onClick={voice.cancelAutoSend}>
            cancel
          </button>
        </p>
      )}
      <div className="room-composer-row">
        {voiceOn && voice.micSupported && (
          <button type="button" className={`room-mic${voice.listening ? ' is-live' : ''}`} onClick={toggleMic} disabled={disabled} aria-pressed={voice.listening} title={voice.listening ? 'Stop listening' : 'Answer by voice'}>
            <span className="room-mic-icon" aria-hidden="true" />
            <span className="sr-only">{voice.listening ? 'Stop listening' : 'Answer by voice'}</span>
          </button>
        )}
        <label className="room-composer-field">
          <span className="sr-only">{clarifyMode ? 'Your clarification question' : 'Your answer'}</span>
          <textarea
            id="jiv-answer"
            ref={textareaRef}
            className="input-field jiv-answer"
            rows={question.tool === 'text' ? 4 : 3}
            value={voice.listening && voice.interim ? `${text}${text && !text.endsWith(' ') ? ' ' : ''}${voice.interim}` : text}
            onChange={(e) => {
              // Typing takes over from dictation: stop listening and keep what the learner typed.
              if (voice.listening) voice.stopListening()
              setText(e.target.value)
            }}
            placeholder={clarifyMode ? 'What would you like clarified?' : voice.listening ? 'Listening… speak naturally; pauses are fine.' : question.tool === 'code' ? 'Talk through your approach, complexity and edge cases; the code goes in the editor.' : question.tool === 'diagram' ? 'Talk through the design, its trade-offs and failure handling; sketch in the whiteboard.' : session.phase === 'closing' ? 'Ask the interviewer a question, or say you have none.' : 'Type your answer, or use the microphone.'}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void submit(clarifyMode ? 'clarify' : 'answer')
              }
            }}
          />
        </label>
      </div>
      <div className="room-composer-actions">
        <button type="submit" className="btn btn-primary" disabled={disabled || (!text.trim() && !voice.interim && (question.tool === 'text' || clarifyMode))}>
          {busy === 'answer' || busy === 'clarify' ? 'Sending…' : sendLabel}
        </button>
        {clarifyMode ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setClarifyMode(false)} disabled={disabled}>
            Back to answering
          </button>
        ) : (
          question.skippable && next.type !== 'follow_up' && session.phase === 'interview' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void submit('skip')} disabled={disabled}>
              Skip question
            </button>
          )
        )}
        <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">Ctrl/⌘ + Enter to send · feedback comes after the interview</span>
      </div>
    </form>
  ) : (
    <div className="room-composer">
      <p className="text-sm text-muted-foreground">{busy === 'finish' ? 'Preparing your feedback…' : 'The interview has ended.'}</p>
    </div>
  )

  const workspace = question?.tool === 'code' ? <AlgoEditor key={question.id} initialLanguage={language} initialCode={code} onCodeChange={setCode} onLanguageChange={setLanguage} height="100%" /> : question?.tool === 'diagram' ? <MermaidEditor value={diagram} onChange={setDiagram} /> : undefined

  const banner = timeUp && session.phase === 'interview' ? (
    <div className="iv-banner" role="status">
      Time is up. Finish your current answer; the interviewer will wrap up after it.
    </div>
  ) : resumed && session.turns.length && lastSpokenTurn.current === session.turns[session.turns.length - 1]?.id && voice.state === 'idle' && !voice.listening && session.phase !== 'ended' ? (
    <div className="iv-banner" role="status">
      Interview restored where you left off. Press “Repeat question” to hear it again.
    </div>
  ) : null

  const diagnostics = voiceConfig?.diagnostics ? (
    <p className="room-diag" aria-label="Latency diagnostics">
      dev · tts {voice.lastLatency.ttsMs ?? '—'} ms · stt {voice.lastLatency.sttMs ?? '—'} ms · server {serverDiag.current?.serverMs ?? '—'} ms · ai {serverDiag.current?.aiMs ?? '—'} ms · turn {lastTurnMs.current ?? '—'} ms · engine {voice.mode}
      {voice.fallbackReason ? ` (fallback: ${voice.fallbackReason})` : ''}
    </p>
  ) : null

  return (
    <InterviewRoom
      ariaLabel="Mock interview session"
      title={session.interviewer.title}
      subtitle={`Mock interview · ${session.job.title} · ${session.plan.label}`}
      stage={stage}
      remainingMs={remaining}
      timeUp={timeUp}
      voiceState={voice.state}
      voiceMode={voice.mode}
      voiceEnabled={voiceAllowed}
      currentSay={session.say}
      transcript={transcript}
      statusLine={statusLine}
      controls={{
        muted: !voiceOn,
        onToggleMute: () => {
          if (voiceOn) {
            voice.cancelSpeech()
            onSettingsChange({ ...settings, enabled: false })
          } else {
            setVoiceOverride(true)
            if (!settings.enabled) onSettingsChange({ ...settings, enabled: true })
          }
        },
        captions: settings.captions,
        onToggleCaptions: () => onSettingsChange({ ...settings, captions: !settings.captions }),
        onRepeat: repeat,
        onClarify: question && session.phase === 'interview' ? () => {
          setClarifyMode(true)
          textareaRef.current?.focus()
        } : undefined,
        onLeave: leave,
        onEnd: () => void endInterview(),
        endLabel: session.phase === 'ended' ? (busy === 'finish' ? 'Finishing…' : 'See feedback') : session.phase === 'closing' ? 'Finish' : 'End interview',
        disabled,
        fullscreen,
        onToggleFullscreen: toggleFullscreen,
      }}
      composer={composer}
      workspace={workspace}
      workspaceLabel={question?.tool === 'code' ? 'Code editor' : question?.tool === 'diagram' ? 'Whiteboard' : undefined}
      banner={banner}
      error={error}
      diagnostics={diagnostics}
    />
  )
}
