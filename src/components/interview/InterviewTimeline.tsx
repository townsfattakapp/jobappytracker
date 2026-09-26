import { useState } from 'react'
import { formatOffset } from '../../lib/interview/conversation'
import type { InterviewPlan, InterviewReport, QuestionFeedback, TurnRecord } from '../../lib/interview/jobInterview'

/**
 * Replay of a completed interview: the section timeline built from stored
 * turn timestamps, and for each section the transcript and the feedback for
 * its questions. No audio is stored, so replay means transcript and timing.
 */
interface Props {
  plan: InterviewPlan
  turns: TurnRecord[]
  timeline: NonNullable<InterviewReport['timeline']>
  feedback: QuestionFeedback[]
  startedAt: string
  onOpenTopic?: (topicId: string) => void
}

const KIND_NOTE: Partial<Record<TurnRecord['kind'], string>> = { clarification_request: 'asked for clarification', clarification: 'clarified', nudge: 'silence', follow_up: 'follow-up', follow_up_answer: 'follow-up answer', candidate_question: 'your question', closing_answer: 'answer', farewell: 'closing', opening: 'opening', transition: 'transition', skip: 'skipped' }

export default function InterviewTimeline({ plan, turns, timeline, feedback, startedAt, onOpenTopic }: Props) {
  const [open, setOpen] = useState<string | null>(timeline[0]?.sectionId ?? null)
  const start = new Date(startedAt).getTime()
  if (!timeline.length) return <p className="text-sm text-muted-foreground">No timeline was recorded for this interview.</p>
  return (
    <ol className="room-timeline" aria-label="Interview timeline">
      {timeline.map((entry) => {
        const isOpen = open === entry.sectionId
        const sectionTurns = turns.filter((t) => entry.questionIds.includes(t.questionId))
        const sectionFeedback = feedback.filter((f) => entry.questionIds.includes(f.questionId))
        const questions = plan.questions.filter((q) => entry.questionIds.includes(q.id))
        return (
          <li key={entry.sectionId} className={`room-timeline-item${isOpen ? ' is-open' : ''}`}>
            <button type="button" className="room-timeline-head" onClick={() => setOpen(isOpen ? null : entry.sectionId)} aria-expanded={isOpen}>
              <span className="room-timeline-time">{formatOffset(entry.offsetMs)}</span>
              <span className="room-timeline-title">{entry.title}</span>
              <span className="room-timeline-meta">
                {questions.length} question{questions.length === 1 ? '' : 's'} · {entry.turns} turn{entry.turns === 1 ? '' : 's'}
              </span>
            </button>
            {isOpen && (
              <div className="room-timeline-body">
                <div className="room-timeline-transcript" aria-label={`${entry.title} transcript`}>
                  {sectionTurns.map((t) => (
                    <div key={t.id} className={`room-replay-turn is-${t.role}`}>
                      <span className="room-replay-meta">
                        {formatOffset(new Date(t.at).getTime() - start)} · {t.role === 'candidate' ? 'You' : 'Interviewer'}
                        {KIND_NOTE[t.kind] ? ` · ${KIND_NOTE[t.kind]}` : ''}
                        {t.input === 'voice' ? ' · spoken' : ''}
                      </span>
                      <p className="whitespace-pre-wrap">{t.kind === 'skip' ? '(skipped)' : t.lead ? `${t.lead} ${t.text}` : t.text}</p>
                      {t.code && (
                        <pre className="jiv-answer-text">
                          <code>{t.code}</code>
                        </pre>
                      )}
                      {t.diagram && <pre className="jiv-answer-text">{t.diagram}</pre>}
                    </div>
                  ))}
                </div>
                {sectionFeedback.length > 0 && (
                  <div className="room-timeline-feedback">
                    <h5>Feedback for this section</h5>
                    {sectionFeedback.map((f) => (
                      <div key={f.questionId} className="room-timeline-fb">
                        <p className="font-semibold text-sm">{f.prompt}</p>
                        <p className="text-xs text-muted-foreground">Evaluating: {f.evaluating.length ? f.evaluating.join(', ') : 'communication and structure'}</p>
                        {f.strength && <p className="text-sm">Demonstrated: {f.strength}</p>}
                        {f.weakness && <p className="text-sm">Missing: {f.weakness}</p>}
                        <p className="text-sm">Stronger approach: {f.betterApproach}</p>
                        {f.ref && onOpenTopic && (
                          <button type="button" className="btn btn-link btn-sm" onClick={() => onOpenTopic(f.ref!.topicId)}>
                            Open {f.ref.trackTitle} → {f.ref.topicTitle}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
