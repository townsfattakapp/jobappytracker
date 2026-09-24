import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { InterviewSessionTranscript, MockInterviewSummary } from '../types'
import { getInterviewSessionTranscript } from '../db'
import { personaById, verdictTone } from '../lib/interview/config'
import { useRoundById } from '../lib/interview/hooks'
import { renderMarkdownRich } from '../lib/markdown'

interface InterviewReportProps {
  summary: MockInterviewSummary
  onClose: () => void
  onRetake?: () => void
}

export function VerdictBadge({ verdict, size = 'sm' }: { verdict: MockInterviewSummary['verdict']; size?: 'sm' | 'lg' }) {
  if (!verdict) return null
  return <span className={`iv-verdict is-${verdictTone(verdict)} ${size === 'lg' ? 'is-lg' : ''}`}>{verdict}</span>
}

export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone = score >= 70 ? 'good' : score >= 50 ? 'ok' : 'bad'
  return (
    <svg className={`iv-ring is-${tone}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Overall score ${score} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.28} fontWeight="800" fill="currentColor">
        {score}
      </text>
    </svg>
  )
}

/** Full scorecard for a finished mock interview, with the transcript underneath. */
export default function InterviewReport({ summary, onClose, onRetake }: InterviewReportProps) {
  const [transcript, setTranscript] = useState<InterviewSessionTranscript | null | undefined>(undefined)
  const [showTranscript, setShowTranscript] = useState(false)
  const [openAnswer, setOpenAnswer] = useState<number | null>(0)
  const round = useRoundById(summary.roundId)
  const persona = personaById(summary.personaId)

  useEffect(() => {
    let cancelled = false
    getInterviewSessionTranscript(summary.id)
      .then((t) => {
        if (!cancelled) setTranscript(t ?? null)
      })
      .catch(() => {
        if (!cancelled) setTranscript(null)
      })
    return () => {
      cancelled = true
    }
  }, [summary.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (typeof document === 'undefined') return null

  const turns = transcript?.transcript || []
  const scored = typeof summary.overallScore === 'number' && !summary.incomplete

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="iv-report surface animate-slide-up">
        <div className="iv-report-head">
          <div className="flex items-start gap-4 min-w-0">
            {scored ? <ScoreRing score={summary.overallScore || 0} /> : <div className="iv-avatar" aria-hidden="true">{persona.name[0]}</div>}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Scorecard</p>
              <h2 id="report-title" className="text-xl sm:text-2xl font-display font-bold leading-tight">
                {round.label} · {summary.difficulty}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(summary.date).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · with {persona.name} · {summary.durationMinutes} min
                {summary.questionsAsked ? ` · ${summary.questionsAsked} question${summary.questionsAsked === 1 ? '' : 's'}` : ''}
                {summary.hintsUsed ? ` · ${summary.hintsUsed} hint${summary.hintsUsed === 1 ? '' : 's'}` : ''}
              </p>
              <div className="mt-2">
                <VerdictBadge verdict={summary.verdict} size="lg" />
              </div>
            </div>
          </div>
          <button type="button" className="iv-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="iv-report-body">
          {summary.summary && <p className={`iv-report-summary ${summary.incomplete ? 'is-muted' : ''}`}>{summary.summary}</p>}

          {summary.dimensions && summary.dimensions.length > 0 && (
            <section>
              <h3>Dimensions</h3>
              <ul className="iv-dims">
                {summary.dimensions.map((d) => (
                  <li key={d.name}>
                    <div className="iv-dim-row">
                      <span className="font-semibold">{d.name}</span>
                      <span className="iv-dim-score">{d.score}/5</span>
                    </div>
                    <div className="iv-dim-bar" aria-hidden="true">
                      <span className={`is-${d.score >= 4 ? 'good' : d.score >= 3 ? 'ok' : 'bad'}`} style={{ width: `${(d.score / 5) * 100}%` }} />
                    </div>
                    {d.comment && <p className="text-sm text-muted-foreground mt-1">{d.comment}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(summary.strengths.length > 0 || summary.improvementAreas.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {summary.strengths.length > 0 && (
                <section>
                  <h3 className="text-emerald-500">What went well</h3>
                  <ul className="iv-list">
                    {summary.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </section>
              )}
              {summary.improvementAreas.length > 0 && (
                <section>
                  <h3 className="text-amber-500">What to fix</h3>
                  <ul className="iv-list">
                    {summary.improvementAreas.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {summary.modelAnswers && summary.modelAnswers.length > 0 && (
            <section>
              <h3>Model answers</h3>
              <div className="iv-answers">
                {summary.modelAnswers.map((m, i) => (
                  <div key={i} className={`iv-answer ${openAnswer === i ? 'is-open' : ''}`}>
                    <button type="button" onClick={() => setOpenAnswer(openAnswer === i ? null : i)} aria-expanded={openAnswer === i}>
                      <span>{m.question}</span>
                      <span aria-hidden="true">{openAnswer === i ? '−' : '+'}</span>
                    </button>
                    {openAnswer === i && <div className="tutor-bubble prose-tiptap iv-answer-body" dangerouslySetInnerHTML={{ __html: renderMarkdownRich(m.answer) }} />}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(summary.recommendedRevisionTopics.length > 0 || (summary.nextSteps && summary.nextSteps.length > 0)) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {summary.recommendedRevisionTopics.length > 0 && (
                <section>
                  <h3>Revise next</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.recommendedRevisionTopics.map((t, i) => (
                      <span key={i} className="iv-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {summary.nextSteps && summary.nextSteps.length > 0 && (
                <section>
                  <h3>Before your next mock</h3>
                  <ol className="iv-list is-numbered">
                    {summary.nextSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          )}

          <section>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTranscript((v) => !v)} disabled={transcript === undefined}>
              {transcript === undefined ? 'Loading transcript…' : showTranscript ? 'Hide transcript' : `Show transcript${turns.length ? ` (${turns.length} turns)` : ''}`}
            </button>
            {showTranscript && (
              <div className="iv-transcript is-static mt-3">
                {turns.length === 0 && <p className="text-sm text-muted-foreground">The transcript for this session is not on this device.</p>}
                {turns.map((t, i) => (
                  <div key={i} className={`iv-turn ${t.role === 'candidate' ? 'is-candidate' : 'is-interviewer'}`}>
                    <span className="iv-turn-who">{t.role === 'candidate' ? 'You' : persona.name}</span>
                    {t.role === 'interviewer' ? (
                      <div className="iv-bubble tutor-bubble prose-tiptap" dangerouslySetInnerHTML={{ __html: renderMarkdownRich(t.content) }} />
                    ) : (
                      <div className="iv-bubble">
                        {t.content && <p className="whitespace-pre-wrap">{t.content}</p>}
                        {(t.code || t.diagram) && (
                          <pre className="iv-code">
                            <code>{t.code || t.diagram}</code>
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="iv-report-foot">
          {onRetake && (
            <button type="button" className="btn btn-primary" onClick={onRetake}>
              Retake this round
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
