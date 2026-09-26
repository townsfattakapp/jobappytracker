import { useCallback, useEffect, useMemo, useState } from 'react'
import LockedFeature from '../LockedFeature'
import InterviewReportView from './InterviewReportView'
import InterviewSessionView from './InterviewSessionView'
import { ApiError } from '../../lib/adminClient'
import { DEPTHS, DIFFICULTIES, FOCUS_OPTIONS, INTERVIEW_DURATIONS, type InterviewConfig, type InterviewMode, type SectionId } from '../../lib/interview/jobInterview'
import type { CompatibilityReport } from '../../lib/jobs/compatibility'
import { deriveInterview, fetchInterviewOverview, fetchInterviewSession, progressSummary, startInterview, type DeriveResponse, type InterviewOverview } from '../../lib/jobs/interviewClient'
import type { JobDto } from '../../lib/jobs/types'
import type { HistoryItem, SessionDto } from '../../lib/server/interviews'
import type { Goal, KnowledgeWorkspace, RoadmapDay } from '../../types'

interface Props {
  job: JobDto
  signedIn: boolean
  can: (feature: string) => boolean
  compatibility: CompatibilityReport | null
  goals: Goal[]
  roadmap: RoadmapDay[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
  hasBlueprint: boolean
  onOpenTopic: (topicId: string) => void
  onAddPlan: (roadmap: RoadmapDay[]) => Promise<void>
  onHistoryChanged: (history: HistoryItem[]) => void
  onSessionActive: (active: boolean) => void
  onGoPrepare: () => void
  onSignIn: () => void
  onUpgrade: () => void
}

const MODE_LABEL: Record<InterviewMode, string> = { full: 'Full interview', weak_areas: 'Weak areas', section: 'One section', missed_concepts: 'Missed concepts', preview: 'Preview' }

function minutesOf(item: HistoryItem): string {
  if (!item.durationSeconds) return `${item.minutes} min planned`
  return `${Math.max(1, Math.round(item.durationSeconds / 60))} min (planned ${item.minutes})`
}

/** "Mock Interview for This Job": derived configuration, setup, session, report and attempt history. */
export default function InterviewTab({ job, signedIn, can, compatibility, goals, roadmap, knowledgeWorkspaces, hasBlueprint, onOpenTopic, onAddPlan, onHistoryChanged, onSessionActive, onGoPrepare, onSignIn, onUpgrade }: Props) {
  const [overview, setOverview] = useState<InterviewOverview | null>(null)
  const [derived, setDerived] = useState<DeriveResponse | null>(null)
  const [config, setConfig] = useState<InterviewConfig | null>(null)
  const [session, setSession] = useState<SessionDto | null>(null)
  const [view, setView] = useState<'setup' | 'session' | 'report'>('setup')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [reattempt, setReattempt] = useState<{ mode: InterviewMode; parentSessionId: string; sectionId?: SectionId } | null>(null)
  const progress = useMemo(() => progressSummary(roadmap, knowledgeWorkspaces), [roadmap, knowledgeWorkspaces])
  const compat = useMemo(() => (compatibility ? { score: compatibility.score, strongAlignment: compatibility.strongAlignment, missingRequirements: compatibility.missingRequirements } : null), [compatibility])
  const allowed = signedIn && (can('interview.jobFull') || can('interview.jobPreview'))
  const full = can('interview.jobFull')

  const load = useCallback(async () => {
    if (!allowed) return
    try {
      const [o, d] = await Promise.all([fetchInterviewOverview(job.id), deriveInterview(job.id, { progress, compatibility: compat })])
      setOverview(o)
      setDerived(d)
      setConfig((c) => c ?? d.derived.config)
      onHistoryChanged(o.history)
      if (o.active) {
        setSession(o.active)
        setView('session')
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load interviews')
    }
  }, [allowed, job.id, progress, compat, onHistoryChanged])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    onSessionActive(view === 'session')
  }, [view, onSessionActive])

  const start = async (opts: { mode: InterviewMode; parentSessionId?: string | null; sectionId?: SectionId | null }) => {
    if (!config) return
    setBusy('start')
    setError(null)
    try {
      const { session: s } = await startInterview(job.id, { progress, compatibility: compat, config, mode: opts.mode, parentSessionId: opts.parentSessionId ?? null, sectionId: opts.sectionId ?? null, language: 'javascript' })
      setSession(s)
      setReattempt(null)
      setView('session')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not start the interview')
    } finally {
      setBusy(null)
    }
  }

  const openReport = async (id: string) => {
    setBusy(id)
    setError(null)
    try {
      const { session: s } = await fetchInterviewSession(id)
      setSession(s)
      setView('report')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not open the report')
    } finally {
      setBusy(null)
    }
  }

  const finished = async (s: SessionDto) => {
    setSession(s)
    setView('report')
    const o = await fetchInterviewOverview(job.id).catch(() => null)
    if (o) {
      setOverview(o)
      onHistoryChanged(o.history)
    }
  }

  if (!signedIn) return <LockedFeature title="Mock interview for this job" description="Sign in to run a role-adapted mock interview built from this listing, your resume and your curriculum progress." onSignIn={onSignIn} signedIn={false} />
  if (!allowed) return <LockedFeature title="Mock interview for this job" description="Job-specific mock interviews with adaptive follow-ups, evidence-based feedback and weakness mapping to your curriculum." onUpgrade={onUpgrade} signedIn />

  if (view === 'session' && session) {
    return (
      <InterviewSessionView
        session={session}
        onSessionChanged={setSession}
        onFinished={finished}
        onLeave={() => {
          setSession(null)
          setView('setup')
          void load()
        }}
      />
    )
  }

  if (view === 'report' && session) {
    const previous = overview?.history.filter((h) => h.id !== session.id && h.status === 'completed' && new Date(h.completedAt ?? h.startedAt) < new Date(session.completedAt ?? session.startedAt))[0] ?? null
    return (
      <InterviewReportView
        session={session}
        previous={previous}
        can={can}
        goals={goals}
        roadmap={roadmap}
        onOpenTopic={onOpenTopic}
        onAddPlan={onAddPlan}
        onPlanRecorded={setSession}
        onPracticeAgain={(opts) => {
          setReattempt({ mode: opts.mode, parentSessionId: session.id, sectionId: opts.sectionId })
          setView('setup')
        }}
        onUpgrade={onUpgrade}
        onBack={() => setView('setup')}
      />
    )
  }

  const d = derived?.derived ?? null
  return (
    <div className="flex flex-col gap-5">
      <section className="job-section" aria-labelledby="jiv-setup">
        <h3 id="jiv-setup" className="job-section-title">
          Mock Interview for This Job <span className="job-personal-label">Recommended practice based on this role</span>
        </h3>
        <p className="job-section-sub">Built from the job description, role family and seniority, the skills it names, your resume evidence, compatibility analysis, curriculum progress and preparation blueprint. Questions carry their source; nothing is presented as a real {job.company?.name || 'company'} interview question.</p>
        {error && (
          <p className="text-sm text-destructive mt-2" role="alert">
            {error}
          </p>
        )}
        {reattempt && (
          <p className="admin-alert admin-alert-ok mt-3" role="status">
            Re-attempt: {MODE_LABEL[reattempt.mode]}{reattempt.sectionId ? ` (${reattempt.sectionId})` : ''}. Questions rotate where alternatives exist; the previous attempt stays in your history.{' '}
            <button type="button" className="btn btn-link btn-sm" onClick={() => setReattempt(null)}>
              Cancel
            </button>
          </p>
        )}
        {!d || !config ? (
          <p className="text-sm text-muted-foreground mt-3">Deriving the interview from this job…</p>
        ) : (
          <>
            {derived && derived.context.missingInputs.length > 0 && (
              <p className="job-source-note">
                Derived without {derived.context.missingInputs.join(', ')}.{' '}
                {!hasBlueprint && (
                  <button type="button" className="btn btn-link btn-sm" onClick={onGoPrepare}>
                    Build the preparation blueprint first
                  </button>
                )}
              </p>
            )}
            <div className="jiv-derived mt-3" role="region" aria-label="Derived configuration">
              <h4 className="prep-group-title">Derived from the job</h4>
              <ul className="jiv-list">
                {d.rationale.map((r) => (
                  <li key={r}>{r}</li>
                ))}
                {derived?.context.gaps.length ? <li>Weighted towards your gaps: {derived.context.gaps.slice(0, 6).join(', ')}.</li> : null}
                {derived?.context.resumeProjects.length ? <li>Project questions only from your resume: {derived.context.resumeProjects.join(', ')}.</li> : null}
              </ul>
              <ol className="jiv-structure mt-2" aria-label="Interview structure">
                {d.sections.map((s) => (
                  <li key={s.id} className={s.included && (s.id !== 'coding' || config.includeCoding) && (s.id !== 'design' || config.includeDesign) && (s.id !== 'behavioral' || config.includeBehavioral) ? '' : 'is-off'} title={s.why}>
                    {s.title}
                  </li>
                ))}
              </ol>
            </div>
            {full ? (
              <div className="jiv-config mt-4" role="group" aria-label="Interview configuration">
                <label className="admin-field">
                  <span>Duration</span>
                  <select className="input-field" value={config.minutes} onChange={(e) => setConfig({ ...config, minutes: Number(e.target.value) })} aria-label="Interview duration">
                    {INTERVIEW_DURATIONS.filter((m) => m <= (overview?.access.maxMinutes ?? 60)).map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Focus</span>
                  <select className="input-field" value={config.focus} onChange={(e) => setConfig({ ...config, focus: e.target.value as InterviewConfig['focus'] })} aria-label="Interview focus">
                    {FOCUS_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Difficulty</span>
                  <select className="input-field" value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value as InterviewConfig['difficulty'] })} aria-label="Difficulty">
                    {DIFFICULTIES.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.label} · {x.hint}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Technical depth</span>
                  <select className="input-field" value={config.technicalDepth} onChange={(e) => setConfig({ ...config, technicalDepth: e.target.value as InterviewConfig['technicalDepth'] })} aria-label="Technical depth">
                    {DEPTHS.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={config.includeCoding} disabled={!d.codingRelevant || !overview?.access.coding} onChange={(e) => setConfig({ ...config, includeCoding: e.target.checked })} /> <span>Include coding / DSA{!d.codingRelevant ? ' (not relevant for this role)' : !overview?.access.coding ? ' (not in your plan)' : ''}</span>
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={config.includeDesign} disabled={!d.designRelevant || !overview?.access.design} onChange={(e) => setConfig({ ...config, includeDesign: e.target.checked })} /> <span>Include system design{!d.designRelevant ? ' (not expected at this level)' : !overview?.access.design ? ' (not in your plan)' : ''}</span>
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={config.includeBehavioral} onChange={(e) => setConfig({ ...config, includeBehavioral: e.target.checked })} /> <span>Include behavioural</span>
                </label>
              </div>
            ) : (
              <p className="text-sm mt-3">Your plan includes a three-question preview with summary feedback. The full interview, adaptive follow-ups, detailed feedback and re-attempts need an upgrade.</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => start(reattempt ? { mode: reattempt.mode, parentSessionId: reattempt.parentSessionId, sectionId: reattempt.sectionId ?? null } : { mode: full ? 'full' : 'preview' })} disabled={busy !== null || (!full && !can('interview.jobPreview'))}>
                {busy === 'start' ? 'Starting…' : reattempt ? `Start ${MODE_LABEL[reattempt.mode].toLowerCase()} re-attempt` : full ? 'Start interview' : 'Start preview interview'}
              </button>
              {overview && (
                <span className="text-xs text-muted-foreground">
                  Interviews used: {overview.limits.day.used}/{overview.limits.day.limit} today · {overview.limits.month.used}/{overview.limits.month.limit} this month
                </span>
              )}
            </div>
            {!full && <LockedFeature title="Full job-specific interviews" description="Complete role-adapted interview with coding and design where relevant, adaptive follow-ups, detailed feedback, weakness mapping, re-attempts and history." onUpgrade={onUpgrade} signedIn compact />}
          </>
        )}
      </section>

      <section className="job-section" aria-labelledby="jiv-history">
        <h3 id="jiv-history" className="job-section-title">
          Interview history
        </h3>
        {!overview || overview.history.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">No attempts yet for this job.</p>
        ) : (
          <div className="admin-table-wrap mt-3">
            <table className="admin-table" aria-label="Interview attempts">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Sections</th>
                  <th>Areas demonstrated</th>
                  <th>Still weak</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {overview.history.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap">{new Date(h.completedAt ?? h.startedAt).toLocaleString()}</td>
                    <td>
                      {MODE_LABEL[h.mode]}
                      {h.status === 'abandoned' && <span className="job-chip job-chip-stale ml-1">abandoned</span>}
                    </td>
                    <td className="whitespace-nowrap">{minutesOf(h)}</td>
                    <td>
                      {h.sectionsCompleted.length}/{h.sectionsTotal}
                    </td>
                    <td>{h.metrics.filter((m) => m.total > 0 && m.demonstrated / m.total >= 0.6).length}/{h.metrics.length}</td>
                    <td>{h.weaknessCount}</td>
                    <td>
                      {h.status === 'completed' && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openReport(h.id)} disabled={busy !== null} aria-label={`Open report from ${new Date(h.completedAt ?? h.startedAt).toLocaleString()}`}>
                          {busy === h.id ? 'Opening…' : 'Open report'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!overview.access.history && overview.historyTotal > overview.history.length && <p className="job-source-note">Only your latest attempt is shown; interview history is part of the paid plan.</p>}
          </div>
        )}
      </section>
    </div>
  )
}
