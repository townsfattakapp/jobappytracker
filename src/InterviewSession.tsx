import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { InterviewTurn, MockInterviewSummary } from './types'
import { saveInterviewSessionTranscript } from './db'
import { aiUnavailableReason, chatWithAI, extractJsonObject } from './lib/aiGatewayClient'
import {
  buildInterviewerMessages,
  buildScorecardMessages,
  normalizeScorecard,
  personaById,
  speakableText,
  type InterviewSetup,
  type InterviewerTurn,
} from './lib/interview/config'
import { useRoundById } from './lib/interview/hooks'
import { listen, speak, sttSupported, stopSpeaking, ttsSupported, type Listener } from './lib/interview/speech'
import { renderMarkdownRich } from './lib/markdown'
import AlgoEditor from './components/compiler/AlgoEditor'
import MermaidEditor from './components/MermaidEditor'
import { normalizeRunnerLanguage, RUNNER_LANGUAGES, STARTER_CODE } from './lib/codeRunner'

interface InterviewSessionProps {
  setup: InterviewSetup
  onEndSession: (summary: MockInterviewSummary) => void
  onCancel: () => void
  onOpenSettings?: () => void
}

const DEFAULT_DIAGRAM = `flowchart LR
  Client --> LB[Load balancer]
  LB --> API[API servers]
  API --> Cache[(Cache)]
  API --> DB[(Primary DB)]`

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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

export default function InterviewSession({ setup, onEndSession, onCancel, onOpenSettings }: InterviewSessionProps) {
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
  const [voiceOn, setVoiceOn] = useState(() => setup.voice && ttsSupported())
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [pane, setPane] = useState<'chat' | 'work'>('chat')
  const [remaining, setRemaining] = useState(plannedMs)
  const [banner, setBanner] = useState<string | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(3)

  const startedAt = useRef(Date.now())
  const sessionId = useRef(uuidv4())
  const started = useRef(false)
  const finished = useRef(false)
  const warned = useRef<Set<number>>(new Set())
  const listener = useRef<Listener | null>(null)
  const cancelSpeech = useRef<() => void>(() => {})
  const transcriptRef = useRef<HTMLDivElement>(null)
  const turnsRef = useRef<InterviewTurn[]>([])
  const voiceRef = useRef(voiceOn)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  turnsRef.current = turns
  voiceRef.current = voiceOn

  const remainingMinutes = useCallback(() => Math.max(0, Math.round((plannedMs - (Date.now() - startedAt.current)) / 60_000)), [plannedMs])

  const say = useCallback((text: string) => {
    if (!voiceRef.current) return
    cancelSpeech.current()
    cancelSpeech.current = speak(speakableText(text), { onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false) })
  }, [])

  const askInterviewer = useCallback(
    async (history: InterviewTurn[]) => {
      setThinking(true)
      setError(null)
      try {
        const raw = await chatWithAI({ messages: buildInterviewerMessages(setup, history, remainingMinutes()), json: true, temperature: 0.6 })
        const parsed = parseInterviewer(raw)
        const turn: InterviewTurn = { role: 'interviewer', content: parsed.say, stage: parsed.stage, question: parsed.question, note: parsed.note, at: Date.now() - startedAt.current }
        setTurns([...history, turn])
        say(parsed.say)
        if (parsed.stage === 'done') setEnded(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The interviewer could not respond. Try again.')
      } finally {
        setThinking(false)
      }
    },
    [setup, remainingMinutes, say],
  )

  // Countdown before kickoff
  useEffect(() => {
    if (countdown === null) return
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(null)
        startedAt.current = Date.now() // reset start time when countdown ends
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Kick off: check AI, then let the interviewer open the round.
  useEffect(() => {
    if (countdown !== null) return // Wait for countdown to finish
    if (started.current) return
    started.current = true
    ;(async () => {
      const reason = await aiUnavailableReason()
      if (reason) {
        setUnavailable(reason)
        return
      }
      await askInterviewer([])
    })()
  }, [countdown, askInterviewer])

  // Auto-save transcript during the session
  useEffect(() => {
    if (turns.length === 0 || finished.current) return
    saveInterviewSessionTranscript({
      id: sessionId.current,
      transcript: turns,
      roundId: round.id,
      level: setup.level,
      personaId: persona.id,
      plannedMinutes: setup.minutes,
      startedAt: new Date(startedAt.current).toISOString(),
    }).catch(() => {})
  }, [turns, round, setup, persona])

  // Countdown with spoken warnings and auto wrap-up.
  useEffect(() => {
    const tick = window.setInterval(() => {
      const left = plannedMs - (Date.now() - startedAt.current)
      setRemaining(left)
      const minutesLeft = Math.ceil(left / 60_000)
      for (const mark of [5, 1]) {
        if (minutesLeft === mark && left > 0 && !warned.current.has(mark)) {
          warned.current.add(mark)
          setBanner(mark === 5 ? 'Five minutes left. Start wrapping up your current answer.' : 'One minute left. The interview will end automatically.')
          window.setTimeout(() => setBanner(null), 8000)
        }
      }
    }, 1000)
    return () => window.clearInterval(tick)
  }, [plannedMs])

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
  }, [turns, thinking, interim])

  useEffect(
    () => () => {
      stopSpeaking()
      listener.current?.stop()
    },
    [],
  )

  const stopListening = () => {
    listener.current?.stop()
    listener.current = null
    setListening(false)
    setInterim('')
  }

  const toggleListening = () => {
    if (listening) {
      stopListening()
      return
    }
    cancelSpeech.current()
    const base = input
    const started = listen({
      onText: (finalText, interimText) => {
        setInput(`${base}${base && !base.endsWith(' ') && finalText ? ' ' : ''}${finalText}`)
        setInterim(interimText)
      },
      onEnd: (err) => {
        setListening(false)
        setInterim('')
        listener.current = null
        if (err) setError(err)
      },
    })
    if (!started) {
      setError('Dictation is not available in this browser. Chrome and Edge support it; you can always type.')
      return
    }
    listener.current = started
    setListening(true)
  }

  const send = async (kind: InterviewTurn['kind'], overrides: Partial<InterviewTurn> = {}) => {
    if (thinking || finishing || ended) return
    stopListening()
    cancelSpeech.current()
    const content = kind === 'hint' ? (input.trim() ? `${input.trim()} — could I get a hint?` : 'Could I get a hint?') : input.trim()
    const turn: InterviewTurn = { role: 'candidate', content, kind, at: Date.now() - startedAt.current, ...overrides }
    if (!turn.content && !turn.code && !turn.diagram) return
    if (kind === 'hint') setHintsUsed((n) => n + 1)
    const history = [...turnsRef.current, turn]
    setTurns(history)
    setInput('')
    setPane('chat')
    await askInterviewer(history)
  }

  const shareCode = () => void send('code', { content: input.trim() || 'Here is my code so far.', code, language })
  const shareDiagram = () => void send('diagram', { content: input.trim() || 'Here is my design so far.', diagram })

  const retryInterviewer = () => void askInterviewer(turnsRef.current)

  const finish = useCallback(
    async (auto = false) => {
      if (finished.current) return
      const history = turnsRef.current
      const answered = history.filter((t) => t.role === 'candidate').length
      if (!auto && answered === 0 && !window.confirm('You have not answered anything yet. End the interview anyway?')) return
      finished.current = true
      stopListening()
      cancelSpeech.current()
      stopSpeaking()
      setFinishing('Saving the transcript…')
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000))
      const id = sessionId.current
      await saveInterviewSessionTranscript({
        id,
        transcript: history,
        roundId: round.id,
        level: setup.level,
        personaId: persona.id,
        plannedMinutes: setup.minutes,
        startedAt: new Date(startedAt.current).toISOString(),
      })
      const questionsAsked = history.reduce((max, t) => Math.max(max, t.role === 'interviewer' ? t.question || 0 : 0), 0)
      const base: MockInterviewSummary = {
        id,
        date: new Date().toISOString(),
        category: round.label,
        difficulty: setup.level,
        durationMinutes: elapsedMinutes,
        strengths: [],
        improvementAreas: [],
        recommendedRevisionTopics: [],
        roundId: round.id,
        personaId: persona.id,
        plannedMinutes: setup.minutes,
        hintsUsed,
        questionsAsked,
      }
      if (answered === 0) {
        onEndSession({ ...base, incomplete: true, summary: 'The interview ended before any answer was given.' })
        return
      }
      setFinishing('The hiring committee is reviewing your answers…')
      try {
        const raw = await chatWithAI({ messages: buildScorecardMessages(setup, history, hintsUsed, elapsedMinutes), json: true, temperature: 0.2 })
        const card = normalizeScorecard(extractJsonObject<Record<string, unknown>>(raw), round)
        onEndSession({
          ...base,
          strengths: card.strengths,
          improvementAreas: card.improvements,
          recommendedRevisionTopics: card.recommendedTopics,
          overallScore: card.overall,
          verdict: card.verdict,
          summary: card.summary,
          dimensions: card.dimensions,
          modelAnswers: card.modelAnswers,
          nextSteps: card.nextSteps,
          rating: (Math.min(5, Math.max(1, Math.round(card.overall / 20))) || 1) as 1 | 2 | 3 | 4 | 5,
        })
      } catch (err) {
        onEndSession({ ...base, incomplete: true, summary: `The scorecard could not be generated (${err instanceof Error ? err.message : 'AI error'}). The transcript is saved.` })
      }
    },
    [round, setup, persona.id, hintsUsed, onEndSession],
  )

  // Time is up: let the interviewer's last words play, then score.
  useEffect(() => {
    if (remaining <= 0 && !finished.current && !unavailable) void finish(true)
  }, [remaining, finish, unavailable])

  const busy = thinking || Boolean(finishing)
  const urgency = remaining <= 60_000 ? 'is-critical' : remaining <= 5 * 60_000 ? 'is-warning' : ''
  const currentQuestion = turns.reduce((max, t) => Math.max(max, t.role === 'interviewer' ? t.question || 0 : 0), 0)
  const workLabel = round.design ? 'Whiteboard' : round.coding ? 'Editor' : 'Notes'

  if (unavailable) {
    return (
      <div className="animate-rise max-w-xl mx-auto w-full surface rounded-2xl border border-border p-6 sm:p-8 text-center">
        <div className="iv-avatar mx-auto" aria-hidden="true">
          {persona.name[0]}
        </div>
        <h1 className="mt-4 text-2xl font-display font-bold">The interviewer needs AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">{unavailable}</p>
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

  return (
    <div className="animate-rise iv-shell">
      <header className="iv-header surface">
        <div className="iv-who">
          <div className={`iv-avatar ${speaking ? 'is-speaking' : thinking ? 'is-thinking' : ''}`} aria-hidden="true">
            {persona.name[0]}
          </div>
          <div className="min-w-0">
            <p className="font-bold leading-tight truncate">
              {persona.name} <span className="text-muted-foreground font-medium">· {persona.title}</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {round.label} · {setup.level} · {setup.minutes} min{currentQuestion ? ` · Question ${currentQuestion}` : ''}
              {hintsUsed ? ` · ${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}` : ''}
            </p>
          </div>
        </div>
        <div className="iv-controls">
          <span className={`iv-timer ${urgency}`} role="timer" aria-live="off" title="Time remaining">
            {formatClock(remaining)}
          </span>
          {ttsSupported() && (
            <button
              type="button"
              className={`iv-icon-btn ${voiceOn ? 'is-on' : ''}`}
              onClick={() => {
                if (voiceOn) cancelSpeech.current()
                setVoiceOn((v) => !v)
              }}
              aria-pressed={voiceOn}
              title={voiceOn ? 'Mute the interviewer' : 'Hear the interviewer'}
            >
              {voiceOn ? '🔊' : '🔇'}
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={Boolean(finishing)}
            onClick={() => {
              if (turns.some((t) => t.role === 'candidate') && !window.confirm('Leave without a scorecard? This session will not be saved.')) return
              stopSpeaking()
              onCancel()
            }}
          >
            Leave
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={Boolean(finishing) || thinking} onClick={() => void finish(false)}>
            {ended ? 'Get scorecard' : 'End & score'}
          </button>
        </div>
      </header>

      {banner && (
        <div className="iv-banner" role="status">
          ⏱ {banner}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex flex-wrap items-center justify-between gap-2" role="alert">
          <span>{error}</span>
          {!thinking && !finishing && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={retryInterviewer}>
              Retry
            </button>
          )}
        </div>
      )}

      <div className="iv-tabs lg:hidden" role="tablist">
        <button type="button" role="tab" aria-selected={pane === 'chat'} className={pane === 'chat' ? 'is-active' : ''} onClick={() => setPane('chat')}>
          Conversation
        </button>
        <button type="button" role="tab" aria-selected={pane === 'work'} className={pane === 'work' ? 'is-active' : ''} onClick={() => setPane('work')}>
          {workLabel}
        </button>
      </div>

      <div className="iv-body">
        <section className={`iv-chat surface ${pane === 'chat' ? '' : 'hidden lg:flex'}`} aria-label="Conversation">
          <div ref={transcriptRef} className="iv-transcript">
            {turns.length === 0 && thinking && <p className="text-sm text-muted-foreground text-center py-8">{persona.name} is joining the call…</p>}
            {turns.map((t, i) => (
              <div key={i} className={`iv-turn ${t.role === 'candidate' ? 'is-candidate' : 'is-interviewer'}`}>
                <span className="iv-turn-who">{t.role === 'candidate' ? 'You' : persona.name}{t.kind === 'hint' ? ' · asked for a hint' : ''}</span>
                {t.role === 'interviewer' ? (
                  <div className="iv-bubble tutor-bubble prose-tiptap" dangerouslySetInnerHTML={{ __html: renderMarkdownRich(t.content) }} />
                ) : (
                  <div className="iv-bubble">
                    {t.content && <p className="whitespace-pre-wrap">{t.content}</p>}
                    {t.code && (
                      <pre className="iv-code">
                        <code>{t.code}</code>
                      </pre>
                    )}
                    {t.diagram && (
                      <pre className="iv-code">
                        <code>{t.diagram}</code>
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
            {thinking && turns.length > 0 && (
              <div className="iv-turn is-interviewer">
                <span className="iv-turn-who">{persona.name}</span>
                <div className="iv-bubble iv-typing" aria-label="Interviewer is thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {ended && !finishing && (
              <div className="iv-ended">
                The interview has ended. Get your scorecard to see how it went.
                <button type="button" className="btn btn-primary btn-sm ml-3" onClick={() => void finish(false)}>
                  Get scorecard
                </button>
              </div>
            )}
          </div>

          <form
            className="iv-composer"
            onSubmit={(e) => {
              e.preventDefault()
              void send('answer')
            }}
          >
            <div className="relative">
              <textarea
                ref={inputRef}
                className="input-field iv-input"
                placeholder={listening ? 'Listening… speak your answer' : ended ? 'The interview is over' : 'Think aloud: type or dictate your answer'}
                value={interim ? `${input}${input && !input.endsWith(' ') ? ' ' : ''}${interim}` : input}
                onChange={(e) => {
                  if (!listening) setInput(e.target.value)
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
              {sttSupported() && (
                <button
                  type="button"
                  className={`iv-mic ${listening ? 'is-live' : ''}`}
                  onClick={toggleListening}
                  disabled={busy || ended}
                  aria-pressed={listening}
                  title={listening ? 'Stop dictating' : 'Dictate your answer'}
                >
                  {listening ? '■' : '🎙'}
                </button>
              )}
            </div>
            <div className="iv-actions">
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy || ended || turns.length === 0} onClick={() => void send('hint')} title="Ask the interviewer for a nudge (counted on your scorecard)">
                Ask for a hint
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
              <span className="hidden sm:inline text-xs text-muted-foreground ml-auto">Ctrl/⌘ + Enter to send</span>
              <button type="submit" className="btn btn-primary btn-sm px-6" disabled={busy || ended || (!input.trim() && !interim)}>
                Send
              </button>
            </div>
          </form>
        </section>

        <aside className={`iv-work ${pane === 'work' ? '' : 'hidden lg:flex'}`} aria-label={workLabel}>
          {round.coding && runnerLanguage ? (
            <div className="iv-work-panel surface">
              <div className="iv-work-head">
                <span>Your editor</span>
                <span className="text-xs text-muted-foreground">Run it, then share it with {persona.name}</span>
              </div>
              <AlgoEditor initialLanguage={language} initialCode={code} onCodeChange={setCode} onLanguageChange={setLanguage} height="100%" />
            </div>
          ) : round.coding ? (
            <div className="iv-work-panel surface">
              <div className="iv-work-head">
                <span>{RUNNER_LANGUAGES.some((l) => l.id === language) ? 'Your editor' : `${language.toUpperCase()} scratchpad`}</span>
                <span className="text-xs text-muted-foreground">Share it when it is ready</span>
              </div>
              <textarea className="iv-scratch" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} placeholder={`Write your ${language.toUpperCase()} here…`} />
            </div>
          ) : round.design ? (
            <div className="iv-work-panel surface">
              <div className="iv-work-head">
                <span>Whiteboard (Mermaid)</span>
                <span className="text-xs text-muted-foreground">Sketch the architecture, then share it</span>
              </div>
              <div className="iv-board">
                <MermaidEditor value={diagram} onChange={setDiagram} />
              </div>
            </div>
          ) : (
            <div className="iv-work-panel surface iv-tips">
              <div className="iv-work-head">
                <span>How to do well</span>
              </div>
              <ul>
                {round.group === 'Behavioural' ? (
                  <>
                    <li>Answer with STAR: situation, task, action, result. Spend most of the time on the action.</li>
                    <li>Say “I”, not “we”. The interviewer wants your specific contribution.</li>
                    <li>Quantify the result and end with what you learned.</li>
                    <li>Have two or three stories ready that show ownership, conflict and failure.</li>
                  </>
                ) : (
                  <>
                    <li>Start with the one-line answer, then the mechanism, then a real example.</li>
                    <li>If you do not know, say what you do know and reason from first principles.</li>
                    <li>Mention trade-offs and when you would not use the approach.</li>
                    <li>Ask for a hint rather than guessing wildly; it costs less on the scorecard.</li>
                  </>
                )}
              </ul>
              <textarea className="iv-scratch mt-3" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scratch notes for yourself (not shared)…" />
            </div>
          )}
        </aside>
      </div>

      {countdown !== null && (
        <div className="iv-overlay" role="alert" aria-live="polite">
          <div className="iv-overlay-card surface" style={{ transform: `scale(${1 + (3 - countdown) * 0.1})`, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <h2 className="text-6xl font-black text-primary mb-2">
              {countdown > 0 ? countdown : 'Go!'}
            </h2>
            <p className="font-bold">{persona.name} is ready for you.</p>
            <p className="text-sm text-muted-foreground mt-1">Take a deep breath.</p>
          </div>
        </div>
      )}

      {finishing && (
        <div className="iv-overlay" role="status" aria-live="polite">
          <div className="iv-overlay-card surface">
            <div className="iv-avatar is-thinking mx-auto" aria-hidden="true">
              {persona.name[0]}
            </div>
            <p className="mt-4 font-bold">{finishing}</p>
            <p className="mt-1 text-sm text-muted-foreground">Scoring every dimension, writing model answers and picking topics to revise. This takes about half a minute.</p>
          </div>
        </div>
      )}
    </div>
  )
}
