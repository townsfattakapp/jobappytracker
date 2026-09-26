import { useMemo, useState } from 'react'
import LockedFeature from '../LockedFeature'
import { ApiError } from '../../lib/adminClient'
import type { CompatibilityReport } from '../../lib/jobs/compatibility'
import type { JobCurriculumMap } from '../../lib/jobs/curriculumMap'
import { fetchPreparation, requestPreparationInputs, savePreparation } from '../../lib/jobs/prepClient'
import { buildPrepBlueprint, computeReadiness, type PrepItem, type Readiness } from '../../lib/jobs/prepare'
import { buildPreparationPlan, PLAN_DURATIONS, type PlanDuration, type PlanPreview } from '../../lib/jobs/prepPlan'
import type { JobDto } from '../../lib/jobs/types'
import type { StoredAnalysisDto } from '../../lib/resume/client'
import type { PreparationDto } from '../../lib/server/outreach'
import type { HistoryItem } from '../../lib/server/interviews'
import { interviewReadiness } from '../../lib/interview/jobInterview'
import type { Goal, JobApplication, KnowledgeWorkspace, RoadmapDay } from '../../types'

interface Props {
  job: JobDto
  signedIn: boolean
  can: (feature: string) => boolean
  curriculum: JobCurriculumMap | null
  compatibility: CompatibilityReport | null
  resumeAnalysis: StoredAnalysisDto | null
  goals: Goal[]
  roadmap: RoadmapDay[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
  application: JobApplication | null
  outreachCount: { total: number; active: number }
  preparation: PreparationDto | null
  interviewHistory: HistoryItem[]
  onPreparationChanged: (p: PreparationDto | null) => void
  onOpenTopic: (topicId: string) => void
  onOpenTrack: (trackId: string) => void
  onAddPlan: (roadmap: RoadmapDay[]) => Promise<void>
  onSignIn: () => void
  onUpgrade: () => void
}

const PROV: Record<string, string> = { job: 'From job description', resume: 'From your resume', curriculum: 'From your curriculum', recommendation: 'JobAppy recommendation', you: 'From you' }

function ItemRow({ item, onOpenTopic, done, onToggleDone }: { item: PrepItem; onOpenTopic: (id: string) => void; done: boolean; onToggleDone?: () => void }) {
  return (
    <div className={`prep-item is-${item.status}${done ? ' is-done' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="prep-item-title">
          {item.title}
          {item.ref && <span className="prep-item-ref"> · {item.ref.trackTitle} → {item.ref.topicTitle}</span>}
        </div>
        <div className="prep-item-reason">
          {item.provenance.map((p) => (
            <span key={p} className={`prov prov-${p}`}>
              {PROV[p]}
            </span>
          ))}
          {item.reason}
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
        {item.ref && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenTopic(item.ref!.topicId)} aria-label={`Open ${item.ref.topicTitle}`}>
            Open
          </button>
        )}
        {onToggleDone && (
          <button type="button" className="btn btn-link btn-sm" onClick={onToggleDone} aria-label={`${done ? 'Reopen' : 'Mark prepared'}: ${item.title}`}>
            {done ? 'Reopen' : 'Mark prepared'}
          </button>
        )}
      </div>
    </div>
  )
}

/** "Prepare for this job": blueprint, 7/14/30-day plan with preview and confirmation, interview kit, readiness. */
export default function PrepareTab({ job, signedIn, can, curriculum, compatibility, resumeAnalysis, goals, roadmap, knowledgeWorkspaces, application, outreachCount, preparation, interviewHistory, onPreparationChanged, onOpenTopic, onOpenTrack, onAddPlan, onSignIn, onUpgrade }: Props) {
  const [state, setState] = useState<{ busy: string | null; error: string | null }>({ busy: null, error: null })
  const [duration, setDuration] = useState<PlanDuration>((preparation?.durationDays as PlanDuration) || 14)
  const [preview, setPreview] = useState<PlanPreview | null>(null)
  const progress = useMemo(() => ({ roadmap, knowledgeWorkspaces }), [roadmap, knowledgeWorkspaces])
  const activeGoal = goals.find((g) => g.status === 'Active') || goals[0] || null
  const blueprint = preparation?.blueprint ?? null
  const full = signedIn && can('jobs.preparation')

  // Free overview: curriculum-only view of must-prepare / already-strong.
  const overview = useMemo(() => (!full && curriculum ? buildPrepBlueprint({ job, curriculum, compatibility: null, resume: null, profile: null, progress }) : null), [full, job, curriculum, progress])

  const readiness: Readiness | null = useMemo(
    () =>
      signedIn
        ? computeReadiness({ jobId: job.id, blueprint: blueprint ?? overview, curriculum, resume: resumeAnalysis?.report ?? null, suggestionState: resumeAnalysis?.suggestionState ?? null, progress, completedItemIds: preparation?.completedItemIds ?? [], application, outreach: Array.from({ length: outreachCount.total }, (_, i) => ({ status: i < outreachCount.active ? 'connection_sent' : 'not_contacted' })), interviews: interviewReadiness(interviewHistory.map((h) => ({ status: h.status, completedAt: h.completedAt, mode: h.mode, report: h.status === 'completed' ? { metrics: h.metrics, weaknessCount: h.weaknessCount, questionsAnswered: h.questionsAnswered, questionsTotal: h.questionsTotal } : null }))) })
        : null,
    [signedIn, job.id, blueprint, overview, curriculum, resumeAnalysis, progress, preparation?.completedItemIds, application, outreachCount, interviewHistory],
  )

  const generate = async () => {
    setState({ busy: 'generate', error: null })
    try {
      const inputs = await requestPreparationInputs(job.id)
      const bp = buildPrepBlueprint({ job: inputs.job, curriculum, compatibility, resume: inputs.analysis?.report ?? resumeAnalysis?.report ?? null, profile: inputs.profile, progress })
      const saved = await savePreparation(job.id, { blueprint: bp, durationDays: preparation?.durationDays ?? null })
      onPreparationChanged(saved)
      setPreview(null)
      setState({ busy: null, error: null })
    } catch (err) {
      setState({ busy: null, error: err instanceof ApiError ? err.message : 'Could not build the blueprint' })
    }
  }

  const makePreview = () => {
    if (!blueprint || !activeGoal) return
    setPreview(buildPreparationPlan({ job, blueprint, goal: activeGoal, roadmap, days: duration }))
  }

  const confirmPlan = async () => {
    if (!preview) return
    setState({ busy: 'plan', error: null })
    try {
      const saved = await savePreparation(job.id, { durationDays: preview.days, planAdded: { goalId: preview.goalId, taskCount: preview.tasks.length } })
      await onAddPlan(preview.roadmap)
      onPreparationChanged(saved)
      setPreview(null)
      setState({ busy: null, error: null })
    } catch (err) {
      setState({ busy: null, error: err instanceof ApiError ? err.message : 'Could not add the plan' })
    }
  }

  const toggleDone = async (item: PrepItem) => {
    if (!preparation) return
    const set = new Set(preparation.completedItemIds)
    if (set.has(item.id)) set.delete(item.id)
    else set.add(item.id)
    try {
      onPreparationChanged(await savePreparation(job.id, { completedItemIds: Array.from(set) }))
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Could not save' }))
    }
  }

  const refreshStored = async () => {
    try {
      onPreparationChanged(await fetchPreparation(job.id))
    } catch {
      // keep current state
    }
  }

  const done = (item: PrepItem) => {
    if (preparation?.completedItemIds.includes(item.id)) return true
    if (!item.ref) return false
    return roadmap.flatMap((d) => d.tasks).some((t) => t.prepJobId === job.id && t.topicId === item.ref!.topicId && t.status === 'Completed') || knowledgeWorkspaces.some((w) => w.topicId === item.ref!.topicId && w.learningStatus === 'Mastered')
  }

  const Group = ({ title, items, sub }: { title: string; items: PrepItem[]; sub?: string }) =>
    items.length ? (
      <div className="prep-group">
        <h4 className="prep-group-title">
          {title} · {items.length}
        </h4>
        {sub && <p className="job-section-sub">{sub}</p>}
        <div className="prep-list">
          {items.map((i) => (
            <ItemRow key={i.id} item={i} onOpenTopic={onOpenTopic} done={done(i)} onToggleDone={full && preparation ? () => void toggleDone(i) : undefined} />
          ))}
        </div>
      </div>
    ) : null

  if (!signedIn) return <LockedFeature title="Prepare for this job" description="Sign in to get a job-specific preparation blueprint built from the listing, your curriculum progress and your resume." onSignIn={onSignIn} signedIn={false} />

  return (
    <div className="flex flex-col gap-5">
      {readiness && (
        <section className="job-section" aria-labelledby="prep-readiness">
          <h3 id="prep-readiness" className="job-section-title">
            Readiness for this job
          </h3>
          <p className="readiness-headline">{readiness.headline}</p>
          <p className="job-section-sub">Factual preparation state only; JobAppy does not estimate your chances of selection.</p>
          {can('jobs.readinessAdvanced') ? (
            <div className="readiness-grid">
              {readiness.areas.map((a) => (
                <div key={a.id} className="readiness-area">
                  <div className="readiness-label">
                    <span className={`prov prov-${a.provenance === 'you' ? 'recommendation' : a.provenance}`}>{PROV[a.provenance]}</span>
                    {a.label}
                  </div>
                  <div className="readiness-value">
                    {a.done} / {a.total}
                  </div>
                  <div className="job-progress" role="progressbar" aria-valuenow={a.total ? Math.round((a.done / a.total) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label={a.label}>
                    <span style={{ width: `${a.total ? (a.done / a.total) * 100 : 0}%` }} />
                  </div>
                  <div className="readiness-detail">{a.detail}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="readiness-grid">
                {readiness.areas
                  .filter((a) => a.id === 'curriculum' || a.id === 'application')
                  .map((a) => (
                    <div key={a.id} className="readiness-area">
                      <div className="readiness-label">{a.label}</div>
                      <div className="readiness-value">
                        {a.done} / {a.total}
                      </div>
                      <div className="readiness-detail">{a.detail}</div>
                    </div>
                  ))}
              </div>
              <LockedFeature title="Advanced readiness view" description="Required skills demonstrated, preparation tasks completed, resume recommendations done and networking status, all in one place." onUpgrade={onUpgrade} signedIn compact />
            </>
          )}
        </section>
      )}

      {!full ? (
        <section className="job-section" aria-labelledby="prep-overview">
          <h3 id="prep-overview" className="job-section-title">
            Preparation overview <span className="prov prov-curriculum">From your curriculum</span>
          </h3>
          <p className="job-section-sub">Based on the listing and your curriculum progress only.</p>
          {overview && (
            <>
              <Group title="Must prepare" items={overview.mustPrepare} />
              <Group title="Revise" items={overview.revise} />
              <Group title="Already strong" items={overview.alreadyStrong} />
            </>
          )}
          <LockedFeature title="Full preparation blueprint" description="DSA, framework, fundamentals and system-design depth chosen for this role and level, your projects and behavioural areas from your resume, 7/14/30-day plans on your calendar and a job-specific interview kit." onUpgrade={onUpgrade} signedIn />
        </section>
      ) : !blueprint ? (
        <section className="job-section" aria-labelledby="prep-cta">
          <h3 id="prep-cta" className="job-section-title">
            Prepare for this job
          </h3>
          <p className="job-section-sub">Builds a deterministic blueprint from the job description, your resume evidence, compatibility analysis, curriculum gaps and progress, target role and level. Run the resume analysis first for the fullest result.</p>
          <button type="button" className="btn btn-primary mt-3" onClick={generate} disabled={state.busy !== null}>
            {state.busy === 'generate' ? 'Building…' : 'Prepare for This Job'}
          </button>
          {state.error && (
            <p className="text-sm text-destructive mt-2" role="alert">
              {state.error}
            </p>
          )}
        </section>
      ) : (
        <>
          <section className="job-section" aria-labelledby="prep-blueprint">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h3 id="prep-blueprint" className="job-section-title">
                Preparation blueprint <span className="job-personal-label">Personal to you</span>
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={generate} disabled={state.busy !== null}>
                {state.busy === 'generate' ? 'Rebuilding…' : 'Rebuild with latest data'}
              </button>
            </div>
            {blueprint.missingInputs.length > 0 && <p className="job-source-note">Built without {blueprint.missingInputs.join(', ')}; run those and rebuild for a fuller blueprint.</p>}
            {state.error && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {state.error}
              </p>
            )}
            <Group title="Must prepare" items={blueprint.mustPrepare} sub="Requirements of this job where you need work." />
            <Group title="Revise" items={blueprint.revise} sub="Studied or listed before; revisit before interviews." />
            <Group title="Already strong" items={blueprint.alreadyStrong} sub="Supported by your resume and curriculum progress." />
            <Group title={`DSA preparation · ${blueprint.dsa.depth === 'none' ? 'not needed' : blueprint.dsa.depth}`} items={blueprint.dsa.items} sub={blueprint.dsa.why} />
            <Group title="Framework and language preparation" items={blueprint.frameworks} />
            <Group title="CS fundamentals" items={blueprint.csFundamentals} />
            <Group title={`System design · ${blueprint.systemDesign.depth}`} items={blueprint.systemDesign.items} sub={blueprint.systemDesign.why} />
            {blueprint.systemDesign.depth === 'none' && <p className="job-source-note">{blueprint.systemDesign.why}</p>}
            <Group title="Projects to revise and present" items={blueprint.projects} sub="Only projects from your resume." />
            <Group title="Behavioural preparation" items={blueprint.behavioral} />
          </section>

          <section className="job-section" aria-labelledby="prep-plan">
            <h3 id="prep-plan" className="job-section-title">
              Job-specific preparation plan
            </h3>
            <p className="job-section-sub">Schedules the must-prepare and revise topics into your existing roadmap using your goal's hours per day and rest days. Existing tasks are never moved; steps already on your calendar or completed are skipped. You see a preview first.</p>
            {!activeGoal ? (
              <p className="text-sm mt-3">You need an active learning goal first (Goals &amp; Roadmap). The blueprint above still works without one.</p>
            ) : (
              <>
                <div className="pref-chips mt-3" role="group" aria-label="Plan duration">
                  {PLAN_DURATIONS.map((d) => (
                    <button key={d} type="button" className="pref-chip" aria-pressed={duration === d} onClick={() => { setDuration(d); setPreview(null) }}>
                      {d === 7 ? '7-day sprint' : d === 14 ? '14-day focused plan' : '30-day complete plan'}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={makePreview} disabled={state.busy !== null}>
                    Preview {duration}-day plan
                  </button>
                  {preparation?.planAddedAt && (
                    <span className="text-xs text-muted-foreground">
                      Last added: {preparation.durationDays}-day plan with {preparation.addedTaskCount} tasks on {new Date(preparation.planAddedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {preview && (
                  <div className="plan-preview" role="region" aria-label="Plan preview">
                    <div className="font-semibold">
                      {preview.days}-day preview · {preview.fromDate} → {preview.toDate} · goal “{activeGoal.name || activeGoal.targetRole}”
                    </div>
                    <p className="job-section-sub">
                      {preview.tasks.length} new task{preview.tasks.length === 1 ? '' : 's'} across {preview.byDay.length} day{preview.byDay.length === 1 ? '' : 's'} · {preview.topicsPlanned} of {preview.topicsRequested} topics scheduled
                      {preview.topicsAlreadyPlanned ? ` · ${preview.topicsAlreadyPlanned} already on your calendar` : ''}
                      {preview.topicsUnscheduled ? ` · ${preview.topicsUnscheduled} did not fit at ${activeGoal.hoursPerDay} h/day (choose a longer plan or raise hours per day)` : ''}
                    </p>
                    {preview.byDay.length > 0 && (
                      <ul className="plan-days">
                        {preview.byDay.map((d) => (
                          <li key={d.date}>
                            <span className="font-medium">{d.date}</span> · {d.count} task{d.count === 1 ? '' : 's'} · {d.minutes} min
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="admin-form-footer mt-3">
                      {preview.tasks.length > 0 ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={confirmPlan} disabled={state.busy !== null}>
                          {state.busy === 'plan' ? 'Adding…' : 'Add preparation plan'}
                        </button>
                      ) : (
                        <span className="text-sm">Nothing to add: every step is already scheduled or done.</span>
                      )}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>
                        Discard preview
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="job-section" aria-labelledby="prep-kit">
            <h3 id="prep-kit" className="job-section-title">
              Job-specific interview kit <span className="job-chip">Recommended practice based on this role</span>
            </h3>
            {!can('jobs.interviewKit') ? (
              <LockedFeature title="Job-specific interview kit" description="Practice prompts per topic, linked to the curriculum, for the technical, framework, fundamentals, design, project and behavioural rounds this role is likely to include." onUpgrade={onUpgrade} signedIn compact />
            ) : (
              <>
                <p className="job-section-sub">These are practice prompts derived from the listing and the curriculum, not actual or leaked company interview questions.</p>
                <div className="flex flex-col gap-4 mt-3">
                  {blueprint.interviewKit.map((s) => (
                    <div key={s.id} className="kit-section">
                      <h4 className="prep-group-title">{s.title}</h4>
                      <div className="prep-list">
                        {s.items.map((it) => (
                          <div key={`${s.id}-${it.title}`} className="kit-item">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-sm">
                                {it.title}
                                {it.ref && <span className="prep-item-ref"> · {it.ref.trackTitle}</span>}
                              </div>
                              {it.ref && (
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenTopic(it.ref!.topicId)}>
                                  Open
                                </button>
                              )}
                            </div>
                            <ul className="kit-questions">
                              {it.questions.map((q, i) => (
                                <li key={i}>
                                  {q.prompt} <span className="text-xs text-muted-foreground">({q.source === 'curriculum' ? 'curriculum quiz' : 'generated prompt'})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
          <p className="job-source-note">
            Tracks referenced above:{' '}
            {Array.from(new Set(blueprint.plannable.map((i) => i.ref!.trackId))).map((id) => (
              <button key={id} type="button" className="btn btn-link btn-sm" onClick={() => onOpenTrack(id)}>
                {blueprint.plannable.find((i) => i.ref!.trackId === id)!.ref!.trackTitle}
              </button>
            ))}
            <button type="button" className="btn btn-link btn-sm" onClick={() => void refreshStored()}>
              Refresh saved state
            </button>
          </p>
        </>
      )}
    </div>
  )
}
