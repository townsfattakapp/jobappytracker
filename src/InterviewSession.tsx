import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { InterviewTurn, MockInterviewSummary } from './types'
import { getInterviewSessionTranscript, saveInterviewSessionTranscript } from './db'
import { aiUnavailableReason, chatWithAI, extractJsonObject } from './lib/aiGatewayClient'
import { buildInterviewerMessages, buildScorecardMessages, interviewerTitle, normalizeScorecard, personaById, type InterviewSetup, type InterviewerTurn } from './lib/interview/config'
import { useRoundById } from './lib/interview/hooks'
import { useInterviewVoice } from './lib/interview/useInterviewVoice'
import { loadVoiceSettings, saveVoiceSettings, type VoiceSettings } from './lib/interview/voice'
import { fetchVoiceConfig, type VoiceConfig } from './lib/jobs/interviewClient'
import { renderMarkdownRich } from './lib/markdown'
import InterviewRoom, { useFocusMode, useFullscreen, type RoomTurn } from './components/interview/InterviewRoom'
import AlgoEditor from './components/compiler/AlgoEditor'
import MermaidEditor from './components/MermaidEditor'
import { normalizeRunnerLanguage, RUNNER_LANGUAGES, STARTER_CODE } from './lib/codeRunner'

interface InterviewSessionProps {
  setup: InterviewSetup
  /** Restore a session in progress after a refresh (transcript is read from the local store). */
  resume?: { id: string; startedAt: string } | null
  onEndSession: (summary: MockInterviewSummary) => void
  onCancel: () => void
  onOpenSettings?: () => void
}

const DEFAULT_DIAGRAM = `flowchart LR
  Client --> LB[Load balancer]
  LB --> API[API servers]
  API --> Cache[(Cache)]
  API --> DB[(Primary DB)]`

export const ACTIVE_MOCK_KEY = 'prep-mock-active'

export interface ActiveMock {
  setup: InterviewSetup
  id: string
  startedAt: string
}

export function readActiveMock(): ActiveMock | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_MOCK_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveMock
    if (!parsed?.id || !parsed?.setup?.roundId) return null
    // Stale sessions (older than the planned length plus a grace period) are not restored.
    if (Date.now() - new Date(parsed.startedAt).getTime() > (parsed.setup.minutes + 15) * 60_000) return null
    return parsed
  } catch {
    return null
  }
}

export function clearActiveMock(): void {
  try {
    sessionStorage.removeItem(ACTIVE_MOCK_KEY)
  } catch {
    // ignore
  }
}

function parseInterviewer(raw: string): InterviewerTurn {
  try {
    const obj = extractJsonObject<Record<string, unknown>>(raw)
    const say = typeof obj.say === 'string' ? obj.say.trim() : ''
    if (say) {
      const stage = ['intro', 'question', 'follow_up', 'closing', 'done'].includes(String(obj.stage)) ? (obj.stage as InterviewerTurn['stage']) : 'question'
      const question = Number.isFinite(Number(obj.question)) ? Math.max(1, Math.round(Number(obj.question))) : 1
      return { say, stage, question, note: typeof obj.note === 'string' ? obj.note.trim() : '' }
    }
  } catch {
    // fall through: treat the whole reply as speech
  }
  return { say: raw.trim(), stage: 'question', question: 1, note: '' }
}

const STAGE_LABEL: Record<NonNullable<InterviewTurn['stage']>, string> = { intro: 'Introduction', question: 'Discussion', follow_up: 'Follow-up', closing: 'Wrapping up', done: 'Ended' }
const RE_REPEAT = /\b(repeat|say that again|didn'?t catch)\b/i

/**
 * General mock round in the interview room. The AI interviewer (through the
 * gateway) runs the conversation; this component speaks it, listens, keeps
 * the transcript, manages time and produces the scorecard at the end.
 */
export default function InterviewSession({ setup, resume, onEndSession, onCancel, onOpenSettings }: InterviewSessionProps) {
  const round = useRoundById(setup.roundId)
  const persona = useMemo(() => personaById(setup.personaId), [setup.personaId])
  const runnerLanguage = round.coding && round.defaultLanguage && round.defaultLanguage !== 'sql'
  const plannedMs = setup.minutes * 60_000

  const [turns, setTurns] = useState<InterviewTurn[]>([])
  const [input, setInput] = useState('')
  const [code, setCode] = useState(() => (runnerLanguage ? STARTER_CODE[normalizeRunnerLanguage(round.defaultLanguage)] : ''))
  const [language, setLanguage] = useState(() => (round.coding ? round.defaultLanguage || 'javascript' : ''))
  const [diagram, setDiagram] = useState(DEFAULT_DIAGRAM)
  const [thinking, setThinking] = useState(false)
  const [finishing, setFinishing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const [remaining, setRemaining] = useState(plannedMs)
  const [banner, setBanner] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(Boolean(resume))
  const [clarifyMode, setClarifyMode] = useState(false)
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig | null>(null)
  const [settings, setSettings] = useState<VoiceSettings>(() => ({ ...loadVoiceSettings(), enabled: setup.voice && loadVoiceSettings().enabled }))
  const [fullscreen, toggleFullscreen] = useFullscreen()

  const startedAt = useRef(resume ? new Date(resume.startedAt).getTime() : Date.now())
  const sessionId = useRef(resume?.id ?? uuidv4())
  const started = useRef(false)
  const finished = useRef(false)
  const warned = useRef<Set<number>>(new Set())
  const turnsRef = useRef<InterviewTurn[]>([])
  const inputRef = useRef('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastSpoken = useRef<number>(-1)
  const mountedRef = useRef(true)
  const turnStartedAt = useRef<number | null>(null)
  const lastTurnMs = useRef<number | null>(null)
  turnsRef.current = turns
  inputRef.current = input
  const title = interviewerTitle(round)
  const serverMode: 'premium' | 'browser' = voiceConfig?.tts.mode === 'premium' ? 'premium' : 'browser'
  const voiceAllowed = voiceConfig ? voiceConfig.voice : true
  const voiceOn = voiceAllowed && settings.enabled

  useFocusMode(!unavailable)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const updateSettings = (s: VoiceSettings) => {
    setSettings(s)
    saveVoiceSettings(s)
  }

  const persist = useCallback(
    (history: InterviewTurn[]) => {
      saveInterviewSessionTranscript({ id: sessionId.current, transcript: history, roundId: round.id, level: setup.level, personaId: persona.id, plannedMinutes: setup.minutes, startedAt: new Date(startedAt.current).toISOString() }).catch(() => {})
      try {
        sessionStorage.setItem(ACTIVE_MOCK_KEY, JSON.stringify({ setup, id: sessionId.current, startedAt: new Date(startedAt.current).toISOString() } satisfies ActiveMock))
      } catch {
        // ignore
      }
    },
    [round.id, setup, persona.id],
  )

  const remainingMinutes = useCallback(() => Math.max(0, Math.round((plannedMs - (Date.now() - startedAt.current)) / 60_000)), [plannedMs])

  const sendRef = useRef<(kind: InterviewTurn['kind'], overrides?: Partial<InterviewTurn>, opts?: { input?: 'voice' | 'text' }) => Promise<void>>(async () => {})
  const nudgeRef = useRef<(level: 1 | 2) => void>(() => {})
  const voiceListening = useRef(false)
  const dictatedRef = useRef('')
  const voice = useInterviewVoice({
    serverMode,
    settings: useMemo(() => ({ ...settings, enabled: voiceOn }), [settings, voiceOn]),
    active: !unavailable && !ended && !finishing,
    questionKey: turns.length ? `${turns.length}` : null,
    hasDraft: Boolean(input.trim()) && !voiceListening.current && input.trim() !== dictatedRef.current.trim(),
    onNudge: (level) => nudgeRef.current(level),
    onAutoSend: (spoken) => void sendRef.current('answer', { content: spoken }, { input: 'voice' }),
  })
  voiceListening.current = voice.listening
  dictatedRef.current = voice.transcript
  useEffect(() => {
    if (voice.listening) setInput(voice.transcript)
  }, [voice.transcript, voice.listening])

  useEffect(() => {
    let cancelled = false
    fetchVoiceConfig()
      .then((c) => {
        if (cancelled) return
        setVoiceConfig(c)
        setSettings((s) => ({ ...s, enabled: s.enabled && c.voice }))
      })
      .catch(() => {
        if (!cancelled) setVoiceConfig(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const askInterviewer = useCallback(
    async (history: InterviewTurn[]) => {
      setThinking(true)
      voice.setProcessing(true)
      setError(null)
      turnStartedAt.current = performance.now()
      try {
        const raw = await chatWithAI({ messages: buildInterviewerMessages(setup, history, remainingMinutes()), json: true, temperature: 0.6 })
        const parsed = parseInterviewer(raw)
        const turn: InterviewTurn = { role: 'interviewer', content: parsed.say, stage: parsed.stage, question: parsed.question, note: parsed.note, at: Date.now() - startedAt.current }
        const next = [...history, turn]
        setTurns(next)
        persist(next)
        if (parsed.stage === 'done') setEnded(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The interviewer could not respond. Try again.')
      } finally {
        setThinking(false)
        voice.setProcessing(false)
      }
    },
    [setup, remainingMinutes, persist, voice],
  )

  // Kick off: restore or check AI, then let the interviewer open the round.
  useEffect(() => {
    if (started.current) return
    started.current = true
    ;(async () => {
      const reason = await aiUnavailableReason()
      if (reason) {
        setUnavailable(reason)
        setRestoring(false)
        return
      }
      if (resume) {
        const saved = await getInterviewSessionTranscript(resume.id).catch(() => undefined)
        const history = saved?.transcript ?? []
        setTurns(history)
        lastSpoken.current = history.length - 1
        setRestoring(false)
        if (history.length === 0) await askInterviewer([])
        else if (history[history.length - 1].role === 'candidate') await askInterviewer(history)
        return
      }
      setRestoring(false)
      await askInterviewer([])
    })()
  }, [askInterviewer, resume])

  // Speak the interviewer's newest line, then hand over.
  useEffect(() => {
    const idx = turns.length - 1
    if (idx < 0 || idx <= lastSpoken.current) return
    const t = turns[idx]
    if (t.role !== 'interviewer') return
    lastSpoken.current = idx
    ;(async () => {
      const result = await voice.speak(t.content, {
        onStart: () => {
          if (turnStartedAt.current) {
            lastTurnMs.current = Math.round(performance.now() - turnStartedAt.current)
            turnStartedAt.current = null
          }
        },
      })
      if (!mountedRef.current || turnsRef.current.length - 1 !== idx) return
      if (turnStartedAt.current) {
        lastTurnMs.current = Math.round(performance.now() - turnStartedAt.current)
        turnStartedAt.current = null
      }
      if (t.stage === 'done') return
      if (voiceOn && result.mode !== 'off' && voice.micSupported && !inputRef.current.trim()) voice.startListening('')
    })()
  }, [turns])

  // Clock with quiet warnings and auto wrap-up.
  useEffect(() => {
    const tick = window.setInterval(() => {
      const left = plannedMs - (Date.now() - startedAt.current)
      setRemaining(left)
      const minutesLeft = Math.ceil(left / 60_000)
      for (const mark of [5, 1]) {
        if (minutesLeft === mark && left > 0 && !warned.current.has(mark)) {
          warned.current.add(mark)
          setBanner(mark === 5 ? 'About five minutes left. The interviewer will start wrapping up.' : 'One minute left. The interview ends after your current answer.')
          window.setTimeout(() => setBanner(null), 8000)
        }
      }
    }, 1000)
    return () => window.clearInterval(tick)
  }, [plannedMs])

  const send = useCallback(
    async (kind: InterviewTurn['kind'], overrides: Partial<InterviewTurn> = {}, opts: { input?: 'voice' | 'text' } = {}) => {
      if (thinking || finishing || ended) return
      voice.stopListening()
      voice.cancelSpeech()
      const content = (overrides.content ?? inputRef.current).trim()
      const turn: InterviewTurn = { role: 'candidate', kind, at: Date.now() - startedAt.current, ...overrides, content }
      if (!turn.content && !turn.code && !turn.diagram) return
      const history = [...turnsRef.current, turn]
      setTurns(history)
      persist(history)
      setInput('')
      voice.setTranscript('')
      setClarifyMode(false)
      void opts
      await askInterviewer(history)
    },
    [thinking, finishing, ended, voice, persist, askInterviewer],
  )
  sendRef.current = send

  nudgeRef.current = (level) => {
    if (thinking || finishing || ended || !turnsRef.current.length) return
    const line = level === 1 ? 'Take your time.' : 'Would you like me to repeat or clarify the question? Just say so, or carry on whenever you are ready.'
    const turn: InterviewTurn = { role: 'interviewer', content: line, stage: 'follow_up', question: turnsRef.current.reduce((m, t) => Math.max(m, t.role === 'interviewer' ? t.question || 0 : 0), 0), note: '', at: Date.now() - startedAt.current }
    const history = [...turnsRef.current, turn]
    setTurns(history)
    persist(history)
  }

  const shareCode = () => void send('code', { content: inputRef.current.trim() || 'Here is my code so far.', code, language })
  const shareDiagram = () => void send('diagram', { content: inputRef.current.trim() || 'Here is my design so far.', diagram })
  const retryInterviewer = () => void askInterviewer(turnsRef.current)

  const repeat = () => {
    const last = [...turnsRef.current].reverse().find((t) => t.role === 'interviewer' && !RE_REPEAT.test(t.content))
    if (!last) return
    voice.stopListening()
    void voice.speak(last.content).then((r) => {
      if (voiceOn && r.mode !== 'off' && voice.micSupported && !inputRef.current.trim()) voice.startListening('')
    })
  }

  const finish = useCallback(
    async (auto = false) => {
      if (finished.current) return
      const history = turnsRef.current
      const answered = history.filter((t) => t.role === 'candidate').length
      if (!auto && answered === 0 && !window.confirm('You have not answered anything yet. End the interview anyway?')) return
      finished.current = true
      voice.stopListening()
      voice.cancelSpeech()
      setFinishing('Saving the transcript…')
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000))
      const id = sessionId.current
      await saveInterviewSessionTranscript({ id, transcript: history, roundId: round.id, level: setup.level, personaId: persona.id, plannedMinutes: setup.minutes, startedAt: new Date(startedAt.current).toISOString() })
      clearActiveMock()
      const hintsUsed = history.filter((t) => t.role === 'candidate' && (t.kind === 'hint' || /\bhint\b/i.test(t.content))).length
      const questionsAsked = history.reduce((max, t) => Math.max(max, t.role === 'interviewer' ? t.question || 0 : 0), 0)
      const base: MockInterviewSummary = { id, date: new Date().toISOString(), category: round.label, difficulty: setup.level, durationMinutes: elapsedMinutes, strengths: [], improvementAreas: [], recommendedRevisionTopics: [], roundId: round.id, personaId: persona.id, plannedMinutes: setup.minutes, hintsUsed, questionsAsked }
      if (answered === 0) {
        onEndSession({ ...base, incomplete: true, summary: 'The interview ended before any answer was given.' })
        return
      }
      setFinishing('Preparing your feedback…')
      try {
        const raw = await chatWithAI({ messages: buildScorecardMessages(setup, history, hintsUsed, elapsedMinutes), json: true, temperature: 0.2 })
        const card = normalizeScorecard(extractJsonObject<Record<string, unknown>>(raw), round)
        onEndSession({ ...base, strengths: card.strengths, improvementAreas: card.improvements, recommendedRevisionTopics: card.recommendedTopics, overallScore: card.overall, verdict: card.verdict, summary: card.summary, dimensions: card.dimensions, modelAnswers: card.modelAnswers, nextSteps: card.nextSteps, rating: (Math.min(5, Math.max(1, Math.round(card.overall / 20))) || 1) as 1 | 2 | 3 | 4 | 5 })
      } catch (err) {
        onEndSession({ ...base, incomplete: true, summary: `The scorecard could not be generated (${err instanceof Error ? err.message : 'AI error'}). The transcript is saved.` })
      }
    },
    [round, setup, persona.id, onEndSession, voice],
  )

  // Time is up: let the interviewer's last words play, then score once the learner is idle.
  useEffect(() => {
    if (remaining > 0 || finished.current || unavailable) return
    const timer = window.setInterval(() => {
      if (!inputRef.current.trim() && !voiceListening.current && !thinking) void finish(true)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [remaining, finish, unavailable, thinking])

  // The interviewer said goodbye: produce the scorecard once the farewell has been spoken.
  useEffect(() => {
    if (ended && voice.state !== 'speaking' && !finished.current) void finish(true)
  }, [ended, voice.state, finish])

  const cancel = () => {
    if (turns.some((t) => t.role === 'candidate') && !window.confirm('Leave without feedback? This session will not be saved.')) return
    voice.cancelSpeech()
    voice.stopListening()
    clearActiveMock()
    onCancel()
  }

  if (unavailable) {
    return (
      <div className="animate-rise max-w-xl mx-auto w-full surface rounded-2xl border border-border p-6 sm:p-8 text-center">
        <h1 className="mt-2 text-2xl font-display font-bold">The interviewer needs AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">{unavailable}</p>
        <p className="mt-2 text-xs text-muted-foreground">Job-specific mock interviews (from a job workspace) run on a deterministic interviewer and do not need AI.</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          {onOpenSettings && (
            <button type="button" className="btn btn-primary" onClick={onOpenSettings}>
              Open Settings
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Back
          </button>
        </div>
      </div>
    )
  }

  const busy = thinking || Boolean(finishing) || restoring
  const lastInterviewer = [...turns].reverse().find((t) => t.role === 'interviewer')
  const currentSay = restoring ? 'Restoring your interview…' : turns.length === 0 && thinking ? 'The interviewer is joining…' : lastInterviewer?.content ?? ''
  const stage = lastInterviewer?.stage ? { label: STAGE_LABEL[lastInterviewer.stage], index: 0, total: 0 } : { label: 'Starting', index: 0, total: 0 }
  const transcript: RoomTurn[] = turns.map((t, i) => ({ id: `${i}`, role: t.role, text: t.content, html: t.role === 'interviewer' ? renderMarkdownRich(t.content) : undefined, code: t.code, diagram: t.diagram, note: t.kind === 'code' ? 'shared code' : t.kind === 'diagram' ? 'shared a diagram' : t.kind === 'hint' ? 'asked for a hint' : undefined }))
  const statusLine = voice.state === 'speaking' ? 'Interviewer speaking…' : voice.state === 'processing' || thinking ? 'Processing response…' : voice.state === 'listening' ? `Listening… ${settings.autoSend ? `pause for ${settings.endOfSpeechSec} seconds when you are done` : 'press the microphone when you are done'}` : ended ? 'The interview has ended.' : voiceOn ? 'Your turn. Speak, or type your answer.' : 'Your turn. Type your answer.'
  const workLabel = round.design ? 'Whiteboard' : round.coding ? 'Code editor' : undefined

  const composer = (
    <form
      className="room-composer"
      onSubmit={(e) => {
        e.preventDefault()
        void send('answer')
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
          <button type="button" className={`room-mic${voice.listening ? ' is-live' : ''}`} onClick={() => (voice.listening ? voice.stopListening() : (voice.cancelSpeech(), voice.startListening(input)))} disabled={busy || ended} aria-pressed={voice.listening} title={voice.listening ? 'Stop listening' : 'Answer by voice'}>
            <span className="room-mic-icon" aria-hidden="true" />
            <span className="sr-only">{voice.listening ? 'Stop listening' : 'Answer by voice'}</span>
          </button>
        )}
        <label className="room-composer-field">
          <span className="sr-only">Your answer</span>
          <textarea
            ref={textareaRef}
            className="input-field jiv-answer"
            placeholder={clarifyMode ? 'What would you like clarified?' : voice.listening ? 'Listening… speak naturally; pauses are fine.' : ended ? 'The interview is over' : 'Think aloud: type or speak your answer'}
            value={voice.listening && voice.interim ? `${input}${input && !input.endsWith(' ') ? ' ' : ''}${voice.interim}` : input}
            onChange={(e) => {
              if (voice.listening) voice.stopListening()
              setInput(e.target.value)
            }}
            disabled={busy || ended}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void send('answer')
              }
            }}
          />
        </label>
      </div>
      <div className="room-composer-actions">
        <button type="submit" className="btn btn-primary" disabled={busy || ended || (!input.trim() && !voice.interim)}>
          {clarifyMode ? 'Ask' : 'Send'}
        </button>
        {round.coding && (
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy || ended || !code.trim()} onClick={shareCode}>
            Share code
          </button>
        )}
        {round.design && (
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy || ended || !diagram.trim()} onClick={shareDiagram}>
            Share diagram
          </button>
        )}
        {error && !thinking && !finishing && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={retryInterviewer}>
            Retry interviewer
          </button>
        )}
        <span className="hidden sm:inline text-xs text-muted-foreground ml-auto">Ctrl/⌘ + Enter to send · feedback comes after the interview</span>
      </div>
    </form>
  )

  const workspace = round.coding && runnerLanguage ? <AlgoEditor initialLanguage={language} initialCode={code} onCodeChange={setCode} onLanguageChange={setLanguage} height="100%" /> : round.coding ? <textarea className="iv-scratch" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} placeholder={`Write your ${(RUNNER_LANGUAGES.some((l) => l.id === language) ? language : language || 'code').toUpperCase()} here…`} aria-label="Code scratchpad" /> : round.design ? <MermaidEditor value={diagram} onChange={setDiagram} /> : undefined

  return (
    <>
      <InterviewRoom
        ariaLabel="Mock interview session"
        title={title}
        subtitle={`${round.label} · ${setup.level} · ${setup.minutes} min · ${persona.blurb.split(',')[0]}`}
        stage={stage}
        remainingMs={remaining}
        timeUp={remaining <= 0}
        voiceState={thinking ? 'processing' : voice.state}
        voiceMode={voice.mode}
        voiceEnabled={voiceAllowed}
        currentSay={currentSay}
        transcript={transcript}
        statusLine={statusLine}
        controls={{
          muted: !settings.enabled,
          onToggleMute: () => {
            if (settings.enabled) voice.cancelSpeech()
            updateSettings({ ...settings, enabled: !settings.enabled })
          },
          captions: settings.captions,
          onToggleCaptions: () => updateSettings({ ...settings, captions: !settings.captions }),
          onRepeat: repeat,
          onClarify: !ended
            ? () => {
                setClarifyMode(true)
                textareaRef.current?.focus()
              }
            : undefined,
          onLeave: cancel,
          onEnd: () => void finish(false),
          endLabel: ended ? 'Get feedback' : 'End interview',
          disabled: Boolean(finishing) || restoring,
          fullscreen,
          onToggleFullscreen: toggleFullscreen,
        }}
        composer={composer}
        workspace={workspace}
        workspaceLabel={workLabel}
        banner={
          banner ? (
            <div className="iv-banner" role="status">
              {banner}
            </div>
          ) : null
        }
        error={error}
        diagnostics={voiceConfig?.diagnostics ? <p className="room-diag">dev · tts {voice.lastLatency.ttsMs ?? '—'} ms · stt {voice.lastLatency.sttMs ?? '—'} ms · turn {lastTurnMs.current ?? '—'} ms · engine {voice.mode}</p> : null}
      />
      {finishing && (
        <div className="iv-overlay" role="status" aria-live="polite">
          <div className="iv-overlay-card surface">
            <p className="font-bold">{finishing}</p>
            <p className="mt-1 text-sm text-muted-foreground">Reviewing every answer and writing specific feedback. This takes about half a minute.</p>
          </div>
        </div>
      )}
    </>
  )
}
