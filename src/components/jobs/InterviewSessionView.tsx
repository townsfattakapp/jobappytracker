import { useEffect, useMemo, useRef, useState } from 'react'
import AlgoEditor from '../compiler/AlgoEditor'
import MermaidEditor from '../MermaidEditor'
import { ApiError } from '../../lib/adminClient'
import { PROVENANCE_LABEL, SECTION_TITLES, type InterviewQuestion } from '../../lib/interview/jobInterview'
import { abandonInterview, completeInterview, sendInterviewTurn } from '../../lib/jobs/interviewClient'
import { normalizeRunnerLanguage, STARTER_CODE } from '../../lib/codeRunner'
import type { NextStep, SessionDto } from '../../lib/server/interviews'

interface Props {
  session: SessionDto
  onSessionChanged: (s: SessionDto) => void
  onFinished: (s: SessionDto) => void
  onLeave: () => void
}

const DEFAULT_DIAGRAM = `flowchart LR
  Client --> API[API service]
  API --> DB[(Database)]`

function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * Focused interview environment: one question at a time, section and
 * progress, approximate time left, answer area (text, code editor or
 * diagram), skip and end. No scores or recommendations are shown until the
 * interview ends. State lives on the server, so a refresh resumes here.
 */
export default function InterviewSessionView({ session, onSessionChanged, onFinished, onLeave }: Props) {
  const plannedMs = session.config.minutes * 60_000
  const startedAt = useMemo(() => Date.now() - session.elapsedMs, [session.id, session.elapsedMs])
  const [remaining, setRemaining] = useState(plannedMs - session.elapsedMs)
  const [text, setText] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [diagram, setDiagram] = useState(DEFAULT_DIAGRAM)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pane, setPane] = useState<'answer' | 'work'>('answer')
  const finishing = useRef(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const next: NextStep = session.next
  const question: InterviewQuestion | null = next.type === 'done' ? null : next.question
  const answeredIds = useMemo(() => new Set(session.turns.filter((t) => t.role === 'candidate').map((t) => t.questionId)), [session.turns])

  useEffect(() => {
    const tick = window.setInterval(() => setRemaining(plannedMs - (Date.now() - startedAt)), 1000)
    return () => window.clearInterval(tick)
  }, [plannedMs, startedAt])

  useEffect(() => {
    if (question?.tool === 'code') {
      const lang = normalizeRunnerLanguage(question.language || 'javascript')
      setLanguage(lang)
      setCode(STARTER_CODE[lang] || '')
      setPane('work')
    } else if (question?.tool === 'diagram') {
      setDiagram(DEFAULT_DIAGRAM)
      setPane('work')
    } else setPane('answer')
    setText('')
    textRef.current?.focus()
  }, [question?.id, question?.tool, question?.language])

  const finish = async () => {
    if (finishing.current) return
    finishing.current = true
    setBusy('finish')
    setError(null)
    try {
      const { session: done } = await completeInterview(session.id)
      onFinished(done)
    } catch (e) {
      finishing.current = false
      setError(e instanceof ApiError ? e.message : 'Could not finish the interview')
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => {
    if (remaining <= 0 && !finishing.current) void finish()
  }, [remaining])

  useEffect(() => {
    if (next.type === 'done' && !finishing.current) void finish()
  }, [next.type])

  const submit = async (kind: 'answer' | 'skip') => {
    if (!question || busy) return
    setBusy(kind)
    setError(null)
    try {
      const shareCode = question.tool === 'code' && code.trim() && code.trim() !== (STARTER_CODE[normalizeRunnerLanguage(language)] || '').trim()
      const shareDiagram = question.tool === 'diagram' && diagram.trim() && diagram.trim() !== DEFAULT_DIAGRAM.trim()
      const { session: updated } = await sendInterviewTurn(session.id, { questionId: question.id, kind, text: kind === 'answer' ? text : '', code: kind === 'answer' && shareCode ? code : null, language: kind === 'answer' && shareCode ? language : null, diagram: kind === 'answer' && shareDiagram ? diagram : null })
      setText('')
      onSessionChanged(updated)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send your answer')
    } finally {
      setBusy(null)
    }
  }

  const leave = async () => {
    if (!window.confirm('Leave this interview? It will be marked as abandoned and no report will be generated.')) return
    try {
      await abandonInterview(session.id)
    } catch {
      // still leave
    }
    onLeave()
  }

  const urgency = remaining <= 60_000 ? 'is-critical' : remaining <= 5 * 60_000 ? 'is-warning' : ''
  const sectionIndex = question ? session.plan.sections.findIndex((s) => s.id === question.sectionId) : session.plan.sections.length
  const progressPct = Math.round((next.type === 'done' ? session.plan.questions.length : next.index) / Math.max(1, session.plan.questions.length) * 100)

  return (
    <div className="iv-shell jiv-shell animate-rise" aria-label="Mock interview session">
      <header className="iv-header surface">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Mock interview · {session.job.title}</p>
          <p className="font-bold leading-tight truncate">
            {question ? `Section ${sectionIndex + 1} of ${session.plan.sections.length}: ${SECTION_TITLES[question.sectionId]}` : 'Finishing…'}
          </p>
          <p className="text-xs text-muted-foreground">
            Question {Math.min(next.type === 'done' ? session.plan.questions.length : next.index + 1, session.plan.questions.length)} of {session.plan.questions.length} · {session.plan.label}
          </p>
        </div>
        <div className="iv-controls">
          <span className={`iv-timer ${urgency}`} role="timer" title="Approximate time remaining">
            {clock(remaining)}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={leave} disabled={busy !== null}>
            Leave
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={finish} disabled={busy !== null}>
            {busy === 'finish' ? 'Finishing…' : 'End interview'}
          </button>
        </div>
      </header>
      <div className="jiv-progress" aria-hidden="true">
        <div className="jiv-progress-bar" style={{ width: `${progressPct}%` }} />
      </div>
      <ol className="jiv-sections" aria-label="Interview sections">
        {session.plan.sections.map((s, i) => (
          <li key={s.id} className={`jiv-section${i === sectionIndex ? ' is-current' : s.questionIds.every((id) => answeredIds.has(id)) ? ' is-done' : ''}`}>
            {s.title}
          </li>
        ))}
      </ol>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}

      {question && (
        <section className="jiv-question surface" aria-labelledby="jiv-question-title">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`prov prov-${question.provenance === 'curriculum' ? 'curriculum' : question.provenance === 'job' ? 'job' : question.provenance === 'resume' ? 'resume' : 'recommendation'}`}>{PROVENANCE_LABEL[question.provenance]}</span>
            {question.provenance === 'generated' && <span className="text-xs text-muted-foreground">Recommended practice based on this role</span>}
            {next.type === 'follow_up' && <span className="job-chip job-chip-accent">Follow-up</span>}
          </div>
          <h2 id="jiv-question-title" className="jiv-prompt">
            {next.type === 'follow_up' ? next.prompt : question.prompt}
          </h2>
          {next.type === 'follow_up' && <p className="text-xs text-muted-foreground">On: {question.prompt}</p>}
          {question.tool !== 'text' && (
            <div className="iv-tabs mt-2" role="tablist" aria-label="Answer area">
              <button type="button" role="tab" aria-selected={pane === 'answer'} className={`iv-toggle${pane === 'answer' ? ' is-on' : ''}`} onClick={() => setPane('answer')}>
                Explanation
              </button>
              <button type="button" role="tab" aria-selected={pane === 'work'} className={`iv-toggle${pane === 'work' ? ' is-on' : ''}`} onClick={() => setPane('work')}>
                {question.tool === 'code' ? 'Code editor' : 'Diagram'}
              </button>
            </div>
          )}
          {pane === 'work' && question.tool === 'code' && (
            <div className="mt-3">
              <AlgoEditor key={question.id} initialLanguage={language} initialCode={code} onCodeChange={setCode} onLanguageChange={setLanguage} height="380px" />
            </div>
          )}
          {pane === 'work' && question.tool === 'diagram' && (
            <div className="mt-3">
              <MermaidEditor value={diagram} onChange={setDiagram} />
            </div>
          )}
          <label className={`admin-field mt-3${pane === 'work' ? ' jiv-compact' : ''}`}>
            <span>{question.tool === 'code' ? 'Explain your approach, complexity and edge cases' : question.tool === 'diagram' ? 'Explain the design, its trade-offs and failure handling' : 'Your answer'}</span>
            <textarea id="jiv-answer" ref={textRef} className="input-field jiv-answer" rows={pane === 'work' ? 4 : 8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Answer as you would out loud: what, why, an example, and the trade-off." />
          </label>
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <button type="button" className="btn btn-primary" onClick={() => submit('answer')} disabled={busy !== null || (!text.trim() && question.tool === 'text')}>
              {busy === 'answer' ? 'Sending…' : next.type === 'follow_up' ? 'Answer follow-up' : 'Submit answer'}
            </button>
            {question.skippable && next.type !== 'follow_up' && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => submit('skip')} disabled={busy !== null}>
                Skip question
              </button>
            )}
            <span className="text-xs text-muted-foreground">Feedback appears after the interview, not during it.</span>
          </div>
        </section>
      )}
    </div>
  )
}
