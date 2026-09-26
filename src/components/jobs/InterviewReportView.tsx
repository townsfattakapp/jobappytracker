import { useMemo, useState } from 'react'
import LockedFeature from '../LockedFeature'
import InterviewTimeline from '../interview/InterviewTimeline'
import { ApiError } from '../../lib/adminClient'
import { compareAttempts, PROVENANCE_LABEL, SECTION_TITLES, type InterviewReport, type QuestionFeedback, type Rating, type SectionId, type Weakness } from '../../lib/interview/jobInterview'
import { recordInterviewPlan } from '../../lib/jobs/interviewClient'
import { buildPreparationPlan, PLAN_DURATIONS, type PlanDuration, type PlanPreview } from '../../lib/jobs/prepPlan'
import type { PrepBlueprint, PrepItem } from '../../lib/jobs/prepare'
import type { HistoryItem, SessionDto } from '../../lib/server/interviews'
import type { Goal, RoadmapDay } from '../../types'

interface Props {
  session: SessionDto
  previous: HistoryItem | null
  can: (feature: string) => boolean
  goals: Goal[]
  roadmap: RoadmapDay[]
  onOpenTopic: (topicId: string) => void
  onAddPlan: (roadmap: RoadmapDay[]) => Promise<void>
  onPracticeAgain: (opts: { mode: 'full' | 'weak_areas' | 'section' | 'missed_concepts'; sectionId?: SectionId }) => void
  onPlanRecorded: (s: SessionDto) => void
  onUpgrade: () => void
  onBack: () => void
}

const RATING: Record<Rating, string> = { strong: 'Strong', adequate: 'Adequate', weak: 'Needs work', not_observed: 'Not observed' }
const QUALITY: Record<string, string> = { none: 'No answer', thin: 'Too short', partial: 'Partial', solid: 'Solid', strong: 'Strong' }

function RatingRow({ label, value }: { label: string; value: Rating }) {
  return (
    <div className="jiv-rating">
      <span>{label}</span>
      <span className={`jiv-rating-value is-${value}`}>{RATING[value]}</span>
    </div>
  )
}

/** Weaknesses become a pseudo-blueprint so the existing 7/14/30-day plan engine schedules them without duplicating anything. */
function weaknessBlueprint(jobId: string, weaknesses: Weakness[]): PrepBlueprint {
  const plannable: PrepItem[] = weaknesses.filter((w) => w.ref).map((w, i) => ({ id: `weakness-${i}`, title: w.title, kind: 'topic', status: w.severity === 'missed' ? 'must' : 'revise', reason: `Interview weakness: ${w.concepts.join(', ') || 'thin answer'}`, provenance: ['recommendation', 'curriculum'], ref: w.ref }))
  return { version: 'interview-weaknesses', jobId, level: 'mid', mustPrepare: [], revise: [], alreadyStrong: [], dsa: { depth: 'none', why: '', items: [] }, frameworks: [], csFundamentals: [], systemDesign: { depth: 'none', why: '', items: [] }, projects: [], behavioral: [], interviewKit: [], missingInputs: [], plannable }
}

/** Rating for a section from the qualities of its answers (evidence only). */
function sectionRating(qs: QuestionFeedback[]): Rating {
  const answered = qs.filter((q) => !q.skipped)
  if (!answered.length) return 'not_observed'
  const score = answered.reduce((s, q) => s + (q.quality === 'strong' ? 1 : q.quality === 'solid' ? 0.75 : q.quality === 'partial' ? 0.4 : 0), 0) / answered.length
  return score >= 0.7 ? 'strong' : score >= 0.4 ? 'adequate' : 'weak'
}

function QuestionCard({ q, open, onToggle, onOpenTopic }: { q: QuestionFeedback; open: boolean; onToggle: () => void; onOpenTopic: (topicId: string) => void }) {
  return (
    <details className="jiv-q" open={open} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open !== open) onToggle() }}>
      <summary>
        <span className={`jiv-quality is-${q.quality}`}>{QUALITY[q.quality]}</span>
        <span className="jiv-q-prompt">{q.prompt}</span>
        <span className="text-xs text-muted-foreground">
          {q.sectionTitle} · {PROVENANCE_LABEL[q.provenance]}
          {q.clarifications ? ` · ${q.clarifications} clarification${q.clarifications === 1 ? '' : 's'}` : ''}
        </span>
      </summary>
      <div className="jiv-q-body">
        <div>
          <h5>Your answer</h5>
          <pre className="jiv-answer-text">{q.skipped ? '(skipped)' : q.answer || '(empty)'}</pre>
          {q.followUps.map((f, i) => (
            <div key={i} className="mt-2">
              <p className="text-xs font-semibold">Follow-up: {f.prompt}</p>
              <pre className="jiv-answer-text">{f.answer || '(no answer)'}</pre>
            </div>
          ))}
        </div>
        <div className="room-fb">
          <h5>What the interviewer was evaluating</h5>
          <p className="text-sm">{q.evaluating.length ? q.evaluating.join(', ') : 'Clarity, structure and a concrete example.'}</p>
          <h5 className="mt-2">What was demonstrated</h5>
          <p className="text-sm">{q.strength ?? 'Nothing specific could be credited from this answer.'}</p>
          <h5 className="mt-2">What was missing</h5>
          <p className="text-sm">{q.weakness ?? 'Nothing was flagged.'}</p>
          <h5 className="mt-2">Stronger reasoning approach</h5>
          <p className="text-sm">{q.betterApproach}</p>
          <h5 className="mt-2">Evidence observed</h5>
          <ul className="jiv-list">
            {q.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {q.ref && (
            <p className="text-sm mt-2">
              <strong>Curriculum:</strong> {q.ref.trackTitle} → {q.ref.topicTitle}{' '}
              <button type="button" className="btn btn-link btn-sm" onClick={() => onOpenTopic(q.ref!.topicId)} aria-label={`Open ${q.ref.topicTitle}`}>
                Open
              </button>
            </p>
          )}
        </div>
      </div>
    </details>
  )
}

/** Post-interview debrief: evidence-based, no score or hiring probability, with replay, weakness mapping and re-attempts. */
export default function InterviewReportView({ session, previous, can, goals, roadmap, onOpenTopic, onAddPlan, onPracticeAgain, onPlanRecorded, onUpgrade, onBack }: Props) {
  const report: InterviewReport | null = session.report
  const [duration, setDuration] = useState<PlanDuration>(7)
  const [preview, setPreview] = useState<PlanPreview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openQ, setOpenQ] = useState<string | null>(null)
  const activeGoal = goals.find((g) => g.status === 'Active') || goals[0] || null
  const comparison = useMemo(() => (report && previous ? compareAttempts(previous.metrics, report.metrics) : null), [report, previous])
  const grouped = useMemo(() => {
    if (!report) return { strong: [] as QuestionFeedback[], weak: [] as QuestionFeedback[], resume: [] as QuestionFeedback[], problemSolving: 'not_observed' as Rating }
    const scored = report.questions.filter((q) => q.sectionId !== 'intro' && q.sectionId !== 'wrapup')
    const strong = scored.filter((q) => q.quality === 'strong' || q.quality === 'solid')
    const weak = scored.filter((q) => q.skipped || q.quality === 'none' || q.quality === 'thin' || q.quality === 'partial')
    const resume = report.questions.filter((q) => q.sectionId === 'resume')
    const reasoning = scored.filter((q) => !q.skipped)
    const withReasoning = reasoning.filter((q) => /trade-off discussed|code shared|diagram shared/.test(q.evidence.join(' ')) || q.conceptsHit.some((c) => /trade-off|complexity|edge cases|alternative|failure handling/.test(c)))
    const problemSolving: Rating = !reasoning.length ? 'not_observed' : withReasoning.length / reasoning.length >= 0.6 ? 'strong' : withReasoning.length / reasoning.length >= 0.3 ? 'adequate' : 'weak'
    return { strong, weak, resume, problemSolving }
  }, [report])
  if (!report) return <p className="text-sm text-muted-foreground">No report for this interview.</p>
  const plannableWeaknesses = report.weaknesses.filter((w) => w.ref)
  const minutes = session.durationSeconds ? Math.max(1, Math.round(session.durationSeconds / 60)) : session.config.minutes

  const makePreview = () => {
    if (!activeGoal) return
    setPreview(buildPreparationPlan({ job: { id: session.jobId ?? session.job.id }, blueprint: weaknessBlueprint(session.jobId ?? session.job.id, report.weaknesses), goal: activeGoal, roadmap, days: duration }))
  }
  const confirm = async () => {
    if (!preview) return
    setBusy(true)
    setError(null)
    try {
      await onAddPlan(preview.roadmap)
      const { session: updated } = await recordInterviewPlan(session.id, preview.tasks.length)
      onPlanRecorded(updated)
      setPreview(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not add the plan')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5" aria-label="Interview report">
      <section className="job-section" aria-labelledby="jiv-report-title">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 id="jiv-report-title" className="job-section-title">
              Interview report <span className="job-personal-label">Evidence-based</span>
            </h3>
            <p className="job-section-sub">
              {session.plan.label} · {new Date(session.completedAt ?? session.startedAt).toLocaleString()} · {minutes} min · {report.questionsAnswered} of {report.questionsTotal} questions answered · {report.followUpsAsked} follow-up{report.followUpsAsked === 1 ? '' : 's'}
              {report.clarificationsAsked ? ` · ${report.clarificationsAsked} clarification${report.clarificationsAsked === 1 ? '' : 's'} asked` : ''} · {report.voiceUsed ? 'answered by voice' : 'answered in text'}
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
            Back to interviews
          </button>
        </div>
        <h4 className="prep-group-title mt-3">Overall interview summary</h4>
        <p className="text-sm">{report.summary}</p>
        <p className="job-source-note">Statements below describe what your answers contained. There is no hiring probability or overall score by design.</p>
        {report.aiSummary && (
          <div className="ai-note" role="note">
            <span className="ai-note-label">AI coach note · written from the evidence in this report · {report.aiSummary.provider}</span>
            <p>{report.aiSummary.text}</p>
          </div>
        )}
        <div className="jiv-two-col mt-3">
          <div>
            <h4 className="prep-group-title">Technical strengths</h4>
            {report.strongAreas.length ? (
              <ul className="jiv-list">
                {report.strongAreas.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No area reached the bar yet.</p>
            )}
          </div>
          <div>
            <h4 className="prep-group-title">Technical weaknesses</h4>
            {report.needsImprovement.length ? (
              <ul className="jiv-list is-weak">
                {report.needsImprovement.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing flagged.</p>
            )}
          </div>
        </div>
        {report.metrics.length > 0 && (
          <div className="admin-table-wrap mt-3">
            <table className="admin-table" aria-label="Concepts demonstrated by area">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Section</th>
                  {comparison && <th>Previous attempt</th>}
                  <th>Concepts demonstrated</th>
                </tr>
              </thead>
              <tbody>
                {report.metrics.map((m) => {
                  const row = comparison?.rows.find((r) => r.area === m.area)
                  return (
                    <tr key={m.area}>
                      <td>{m.area}</td>
                      <td className="text-xs text-muted-foreground">{SECTION_TITLES[m.sectionId]}</td>
                      {comparison && <td>{row?.before ?? '—'}</td>}
                      <td>
                        {m.demonstrated}/{m.total}
                        {row && row.change === 'improved' && <span className="job-chip job-chip-fresh ml-2">improved</span>}
                        {row && row.change === 'worse' && <span className="job-chip job-chip-stale ml-2">lower</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {report.detailed ? (
        <>
          <section className="job-section" aria-labelledby="jiv-comm">
            <h3 id="jiv-comm" className="job-section-title">
              Communication
            </h3>
            <div className="jiv-ratings">
              <RatingRow label="Clarity" value={report.communication.clarity} />
              <RatingRow label="Structure and examples" value={report.communication.structure} />
              <RatingRow label="Reasoning" value={report.communication.reasoning} />
            </div>
            <p className="job-section-sub">{report.communication.note}</p>
          </section>
          <section className="job-section" aria-labelledby="jiv-ps">
            <h3 id="jiv-ps" className="job-section-title">
              Problem-solving
            </h3>
            <div className="jiv-ratings">
              <RatingRow label="Reasoning about trade-offs, complexity and failure" value={grouped.problemSolving} />
            </div>
            <p className="job-section-sub">Judged from whether answers reasoned about alternatives, costs, complexity, edge cases or failure modes, and from code or diagrams shared.</p>
          </section>
          {report.coding && (
            <section className="job-section" aria-labelledby="jiv-coding">
              <h3 id="jiv-coding" className="job-section-title">
                Coding
              </h3>
              <div className="jiv-ratings">
                <RatingRow label="Approach" value={report.coding.approach} />
                <RatingRow label="Correctness reasoning" value={report.coding.correctness} />
                <RatingRow label="Complexity" value={report.coding.complexity} />
                <RatingRow label="Edge cases" value={report.coding.edgeCases} />
              </div>
              <p className="job-section-sub">{report.coding.note}</p>
            </section>
          )}
          {report.systemDesign && (
            <section className="job-section" aria-labelledby="jiv-design">
              <h3 id="jiv-design" className="job-section-title">
                System design
              </h3>
              <div className="jiv-ratings">
                <RatingRow label="Requirements" value={report.systemDesign.requirements} />
                <RatingRow label="Architecture" value={report.systemDesign.architecture} />
                <RatingRow label="Trade-offs" value={report.systemDesign.tradeoffs} />
                <RatingRow label="Scalability" value={report.systemDesign.scalability} />
                <RatingRow label="Reliability" value={report.systemDesign.reliability} />
              </div>
              <p className="job-section-sub">{report.systemDesign.note}</p>
            </section>
          )}
          {report.behavioral && (
            <section className="job-section" aria-labelledby="jiv-beh">
              <h3 id="jiv-beh" className="job-section-title">
                Behavioural
              </h3>
              <div className="jiv-ratings">
                <RatingRow label="Concrete examples" value={report.behavioral.examples} />
                <RatingRow label="Complete stories" value={report.behavioral.completeness} />
              </div>
              <p className="job-section-sub">{report.behavioral.note}</p>
            </section>
          )}
          {grouped.resume.length > 0 && (
            <section className="job-section" aria-labelledby="jiv-resume">
              <h3 id="jiv-resume" className="job-section-title">
                Resume and project discussion
              </h3>
              <div className="jiv-ratings">
                <RatingRow label="Depth on your own projects" value={sectionRating(grouped.resume)} />
              </div>
              <p className="job-section-sub">
                {grouped.resume.filter((q) => !q.skipped).length} of {grouped.resume.length} project questions answered; examples in {grouped.resume.filter((q) => /example given/.test(q.evidence.join(' '))).length}, decisions or trade-offs named in {grouped.resume.filter((q) => q.conceptsHit.some((c) => /decision|trade-off|alternative/.test(c))).length}.
              </p>
            </section>
          )}
          {report.missedConcepts.length > 0 && (
            <section className="job-section" aria-labelledby="jiv-missed">
              <h3 id="jiv-missed" className="job-section-title">
                Missed concepts
              </h3>
              <p className="job-section-sub">Required by the question or the job, absent or weak in your answer.</p>
              <ul className="jiv-chips mt-2">
                {report.missedConcepts.map((m) => (
                  <li key={`${m.area}-${m.concept}`} className="job-chip job-chip-stale">
                    {m.concept} <span className="text-muted-foreground">· {m.area}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="job-section" aria-labelledby="jiv-answers">
            <h3 id="jiv-answers" className="job-section-title">
              Strong and weak answers
            </h3>
            <div className="jiv-two-col mt-2">
              <div>
                <h4 className="prep-group-title">Strong answers</h4>
                {grouped.strong.length ? (
                  <ul className="jiv-list">
                    {grouped.strong.map((q) => (
                      <li key={q.questionId}>
                        <button type="button" className="cc-link" onClick={() => setOpenQ(q.questionId)}>
                          {q.prompt.length > 110 ? `${q.prompt.slice(0, 110)}…` : q.prompt}
                        </button>{' '}
                        <span className="text-xs text-muted-foreground">· {q.sectionTitle}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No answer reached solid or strong yet.</p>
                )}
              </div>
              <div>
                <h4 className="prep-group-title">Weak answers</h4>
                {grouped.weak.length ? (
                  <ul className="jiv-list is-weak">
                    {grouped.weak.map((q) => (
                      <li key={q.questionId}>
                        <button type="button" className="cc-link" onClick={() => setOpenQ(q.questionId)}>
                          {q.prompt.length > 110 ? `${q.prompt.slice(0, 110)}…` : q.prompt}
                        </button>{' '}
                        <span className="text-xs text-muted-foreground">· {q.skipped ? 'skipped' : QUALITY[q.quality].toLowerCase()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No thin, partial or skipped answers.</p>
                )}
              </div>
            </div>
          </section>
          <section className="job-section" aria-labelledby="jiv-questions">
            <h3 id="jiv-questions" className="job-section-title">
              Question-level feedback
            </h3>
            <p className="job-section-sub">Question → your answer → what the interviewer was evaluating → what was demonstrated → what was missing → a stronger reasoning approach → curriculum mapping. Recorded at the time you answered; never rewritten.</p>
            <div className="jiv-qlist mt-3">
              {report.questions.map((q) => (
                <QuestionCard key={q.questionId} q={q} open={openQ === q.questionId} onToggle={() => setOpenQ(openQ === q.questionId ? null : q.questionId)} onOpenTopic={onOpenTopic} />
              ))}
            </div>
          </section>
          {report.timeline && report.timeline.length > 0 && (
            <section className="job-section" aria-labelledby="jiv-replay">
              <h3 id="jiv-replay" className="job-section-title">
                Interview replay
              </h3>
              <p className="job-section-sub">Timeline of the interview with the transcript and feedback for each section. Audio is not stored; replay is the transcript and timing.</p>
              {can('interview.replay') ? (
                <div className="mt-3">
                  <InterviewTimeline plan={session.plan} turns={session.turns} timeline={report.timeline} feedback={report.questions} startedAt={session.startedAt} onOpenTopic={onOpenTopic} />
                </div>
              ) : (
                <LockedFeature title="Interview replay" description="Review the full transcript section by section with the feedback for each question." onUpgrade={onUpgrade} signedIn compact />
              )}
            </section>
          )}
        </>
      ) : (
        <LockedFeature title="Detailed feedback" description="Question-level evidence, strengths, weaknesses, better approaches, communication, coding and design breakdowns, replay and weakness mapping to your curriculum." onUpgrade={onUpgrade} signedIn />
      )}

      {can('interview.curriculumMapping') && !session.entitlements.preview ? (
        <section className="job-section" aria-labelledby="jiv-weak">
          <h3 id="jiv-weak" className="job-section-title">
            Weaknesses mapped to your curriculum
          </h3>
          {report.weaknesses.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No weaknesses detected in this attempt.</p>
          ) : (
            <div className="prep-list mt-3">
              {report.weaknesses.map((w) => (
                <div key={w.id} className={`prep-item is-${w.severity === 'missed' ? 'must' : 'revise'}`}>
                  <div className="min-w-0 flex-1">
                    <div className="prep-item-title">
                      {w.title}
                      {w.ref && <span className="prep-item-ref"> · {w.ref.trackTitle} → {w.ref.topicTitle}</span>}
                    </div>
                    <div className="prep-item-reason">
                      {w.concepts.length ? `Missed: ${w.concepts.join(', ')}` : 'Answer too thin to show the concepts'} · {w.questionIds.length} question{w.questionIds.length === 1 ? '' : 's'}
                      {!w.ref && ' · no curriculum topic maps to this area yet'}
                    </div>
                  </div>
                  {w.ref && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenTopic(w.ref!.topicId)} aria-label={`Open ${w.ref.topicTitle}`}>
                      Open
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {plannableWeaknesses.length > 0 && (
            <div className="mt-4">
              <h4 className="prep-group-title">Add weaknesses to learning plan</h4>
              <p className="job-section-sub">Schedules the mapped topics into your existing roadmap using your goal&apos;s hours per day and rest days. Steps already on your calendar or completed are skipped. Preview first, then confirm.</p>
              {!activeGoal ? (
                <p className="text-sm mt-2">You need an active learning goal first (Goals &amp; Roadmap).</p>
              ) : (
                <>
                  <div className="pref-chips mt-3" role="group" aria-label="Plan duration">
                    {PLAN_DURATIONS.map((d) => (
                      <button key={d} type="button" className="pref-chip" aria-pressed={duration === d} onClick={() => { setDuration(d); setPreview(null) }}>
                        {d}-day
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={makePreview}>
                      Preview weakness plan
                    </button>
                    {session.planAddedAt && (
                      <span className="text-xs text-muted-foreground">
                        Added {session.planAddedTaskCount} task{session.planAddedTaskCount === 1 ? '' : 's'} on {new Date(session.planAddedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {preview && (
                    <div className="plan-preview" role="region" aria-label="Weakness plan preview">
                      <p className="text-sm">
                        <strong>{preview.days}-day preview:</strong> {preview.tasks.length} new task{preview.tasks.length === 1 ? '' : 's'} for {preview.topicsPlanned} of {preview.topicsRequested} topic{preview.topicsRequested === 1 ? '' : 's'}
                        {preview.topicsAlreadyPlanned ? `; ${preview.topicsAlreadyPlanned} already on your calendar or completed` : ''}
                        {preview.topicsUnscheduled ? `; ${preview.topicsUnscheduled} did not fit at ${activeGoal.hoursPerDay} h/day` : ''}.
                      </p>
                      {preview.byDay.length > 0 && (
                        <ul className="jiv-list mt-2">
                          {preview.byDay.slice(0, 10).map((d) => (
                            <li key={d.date}>
                              {d.date}: {d.count} task{d.count === 1 ? '' : 's'}, {d.minutes} min
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button type="button" className="btn btn-primary btn-sm" onClick={confirm} disabled={busy || preview.tasks.length === 0}>
                          {busy ? 'Adding…' : 'Add weaknesses to learning plan'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="text-sm text-destructive mt-2" role="alert">
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      ) : (
        !session.entitlements.preview && <LockedFeature title="Weakness mapping and learning plan" description="Map interview weaknesses to exact curriculum topics and add them to your roadmap with a preview." onUpgrade={onUpgrade} signedIn compact />
      )}

      <section className="job-section" aria-labelledby="jiv-again">
        <h3 id="jiv-again" className="job-section-title">
          Practice again
        </h3>
        {can('interview.reattempt') ? (
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onPracticeAgain({ mode: 'full' })}>
              Full interview again
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPracticeAgain({ mode: 'weak_areas' })} disabled={report.weaknesses.length === 0}>
              Weak areas only
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPracticeAgain({ mode: 'missed_concepts' })} disabled={report.missedConcepts.length === 0 && report.weaknesses.every((w) => !w.concepts.length)}>
              Previously missed concepts
            </button>
            {session.plan.sections
              .filter((s) => !['intro', 'wrapup'].includes(s.id))
              .map((s) => (
                <button key={s.id} type="button" className="btn btn-ghost btn-sm" onClick={() => onPracticeAgain({ mode: 'section', sectionId: s.id })}>
                  {s.title} only
                </button>
              ))}
          </div>
        ) : (
          <LockedFeature title="Re-attempts" description="Practise the full interview again, weak areas only, one section, or previously missed concepts. Questions rotate between attempts." onUpgrade={onUpgrade} signedIn compact />
        )}
      </section>
    </div>
  )
}
