import { useEffect, useMemo, useState } from 'react'
import LockedFeature from './components/LockedFeature'
import { eligibilityLabel, freshnessLabel, locationLabel, salaryLabel } from './JobsWorkspace'
import type { AppUser } from './lib/cloudSync'
import { ApiError } from './lib/adminClient'
import { fetchJob, requestAnalysis, type LearnerJob } from './lib/jobs/client'
import { computeCompatibility, type CompatibilityReport } from './lib/jobs/compatibility'
import { mapJobToCurriculum, type TrackAlignment } from './lib/jobs/curriculumMap'
import type { Suggestion } from './lib/jobs/resumeAnalysis'
import ResumeAnalysisView, { Prov } from './components/jobs/ResumeAnalysisView'
import { buildApplicationStrategy, type ApplicationStrategy, type StrategyItem } from './lib/jobs/strategy'
import { EMPLOYMENT_TYPES, JOB_LEVELS, ROLE_CATEGORIES, SOURCE_TYPES, WORK_MODES, labelOf } from './lib/jobs/taxonomy'
import type { LearnerJobPreferences } from './lib/jobs/types'
import { fetchResume, fetchResumeAnalysis, fetchResumes, requestStrategyInputs, runResumeAnalysis, setSuggestionState, type ResumeMetaDto, type StoredAnalysisDto } from './lib/resume/client'
import type { ResumeProfile } from './lib/resume/extract'
import { fetchPreparation } from './lib/jobs/prepClient'
import type { PreparationDto, OutreachContactDto } from './lib/server/outreach'
import NetworkingTab from './components/jobs/NetworkingTab'
import PrepareTab from './components/jobs/PrepareTab'
import InterviewTab from './components/jobs/InterviewTab'
import { fetchInterviewOverview } from './lib/jobs/interviewClient'
import type { HistoryItem } from './lib/server/interviews'
import type { Goal, JobApplication, KnowledgeWorkspace, RoadmapDay } from './types'

interface JobDetailProps {
  jobId: string
  user: AppUser | null
  features: string[]
  goals: Goal[]
  roadmap: RoadmapDay[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
  applications: JobApplication[]
  onBack: () => void
  onOpenTrack: (trackId: string) => void
  /** Opens the Knowledge Workspace of an existing curriculum topic. */
  onOpenTopic: (topicId: string) => void
  /** Persists a roadmap returned by a confirmed preparation-plan preview. */
  onAddPlan: (roadmap: RoadmapDay[]) => Promise<void>
  onOpenResumes: () => void
  onOpenTracker: () => void
  onAddToTracker: (job: LearnerJob, analysisId?: string | null) => void
  onAddGaps: (trackIds: string[]) => Promise<{ ok: boolean; message: string }>
  onSignIn: () => void
  onUpgrade: () => void
}

type Tab = 'overview' | 'match' | 'gaps' | 'resume' | 'strategy' | 'networking' | 'prepare' | 'interview' | 'tracker'
const TABS: { id: Tab; label: string; feature?: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'match', label: 'Match', feature: 'jobs.matching' },
  { id: 'gaps', label: 'Curriculum gaps', feature: 'jobs.curriculumGaps' },
  { id: 'resume', label: 'Resume', feature: 'jobs.resumeAnalysis' },
  { id: 'strategy', label: 'Application strategy', feature: 'jobs.applicationStrategy' },
  { id: 'networking', label: 'Networking & Referrals' },
  { id: 'prepare', label: 'Prepare', feature: 'jobs.preparation' },
  { id: 'interview', label: 'Mock interview', feature: 'interview.jobFull' },
  { id: 'tracker', label: 'Tracker' },
]

function formatDate(value: string | null): string {
  if (!value) return 'Not stated'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? 'Not stated' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const GAP_LABEL: Record<TrackAlignment['gapStatus'], string> = { covered: 'Already covered', learning: 'Currently learning', not_covered: 'Not yet covered' }


/** One coherent job workspace: overview → match → curriculum gaps → resume → application strategy → tracker. */
export default function JobDetail({ jobId, user, features, goals, roadmap, knowledgeWorkspaces, applications, onBack, onOpenTrack, onOpenTopic, onAddPlan, onOpenResumes, onOpenTracker, onAddToTracker, onAddGaps, onSignIn, onUpgrade }: JobDetailProps) {
  const [job, setJob] = useState<LearnerJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [report, setReport] = useState<CompatibilityReport | null>(null)
  const [analysisState, setAnalysisState] = useState<{ busy: boolean; error: string | null; usage: { used: number; limit: number } | null }>({ busy: false, error: null, usage: null })
  const [confirmGaps, setConfirmGaps] = useState<TrackAlignment[] | null>(null)
  const [gapsBusy, setGapsBusy] = useState(false)
  const [gapsMessage, setGapsMessage] = useState<string | null>(null)
  const [resumes, setResumes] = useState<ResumeMetaDto[] | null>(null)
  const [resumeAnalysis, setResumeAnalysis] = useState<StoredAnalysisDto | null>(null)
  const [resumeState, setResumeState] = useState<{ busy: boolean; error: string | null; usage: { used: number; limit: number } | null }>({ busy: false, error: null, usage: null })
  const [strategy, setStrategy] = useState<ApplicationStrategy | null>(null)
  const [strategyState, setStrategyState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null })
  const [strategyNarrative, setStrategyNarrative] = useState<{ text: string; provider: string } | null>(null)
  const [preparation, setPreparation] = useState<PreparationDto | null>(null)
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null)
  const [outreach, setOutreach] = useState<OutreachContactDto[]>([])
  const [interviewHistory, setInterviewHistory] = useState<HistoryItem[]>([])
  const [interviewActive, setInterviewActive] = useState(false)
  const can = (key: string) => features.includes(key)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setReport(null)
    setStrategy(null)
    setResumeAnalysis(null)
    fetchJob(jobId)
      .then((j) => {
        if (!cancelled) setJob(j)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError && err.status === 404 ? 'This opening is no longer available. It may have expired or been withdrawn.' : 'Could not load this job. Try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    if (user) {
      fetchResumeAnalysis(jobId)
        .then((a) => {
          if (!cancelled) setResumeAnalysis(a)
        })
        .catch(() => {})
      fetchPreparation(jobId)
        .then((p) => {
          if (!cancelled) setPreparation(p)
        })
        .catch(() => {})
      if (features.includes('interview.jobFull') || features.includes('interview.jobPreview'))
        fetchInterviewOverview(jobId)
          .then((o) => {
            if (!cancelled) setInterviewHistory(o.history)
          })
          .catch(() => {})
      if (features.includes('resume.profile'))
        fetchResumes()
          .then(async (r) => {
            if (cancelled) return
            setResumes(r)
            const current = r.find((x) => x.isCurrent) || r[0]
            if (current) {
              const detail = await fetchResume(current.id)
              if (!cancelled) setResumeProfile(detail.profile)
            } else setResumeProfile(null)
          })
          .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [jobId, user?.$id, user, features])

  const learner = useMemo(() => ({ goals, roadmap, knowledgeWorkspaces }), [goals, roadmap, knowledgeWorkspaces])
  const curriculum = useMemo(() => (job ? mapJobToCurriculum(job, learner) : null), [job, learner])
  const tracked = useMemo(() => (job ? applications.find((a) => a.jobUrl === job.applyUrl || a.jobRef?.jobId === job.id) : undefined), [applications, job])
  const activeGoal = goals.find((g) => g.status === 'Active') || goals[0]
  const currentResume = resumes?.find((r) => r.isCurrent) || resumes?.[0] || null

  const runAnalysis = async () => {
    if (!job) return
    setAnalysisState({ busy: true, error: null, usage: analysisState.usage })
    try {
      const res = await requestAnalysis(job.id)
      const prefs: LearnerJobPreferences | null = res.preferences
      setReport(computeCompatibility(res.job, prefs, curriculum))
      setAnalysisState({ busy: false, error: null, usage: res.usage })
    } catch (err) {
      const message = err instanceof ApiError && err.code === 'limit' ? err.message : err instanceof Error ? err.message : 'Analysis failed'
      setAnalysisState({ busy: false, error: message, usage: analysisState.usage })
    }
  }

  const runResume = async () => {
    if (!job) return
    setResumeState({ busy: true, error: null, usage: resumeState.usage })
    try {
      const res = await runResumeAnalysis(job.id, { resumeId: currentResume?.id, curriculum: curriculum ? { tracks: curriculum.tracks.map((t) => ({ track: { id: t.track.id, title: t.track.title }, gapStatus: t.gapStatus, skills: t.skills })) } : undefined })
      setResumeAnalysis(res.analysis)
      setResumeState({ busy: false, error: null, usage: res.usage })
    } catch (err) {
      setResumeState({ busy: false, error: err instanceof Error ? err.message : 'Analysis failed', usage: resumeState.usage })
    }
  }

  const updateSuggestion = async (s: Suggestion, state: 'saved' | 'dismissed' | 'completed' | null) => {
    if (!job || !resumeAnalysis) return
    try {
      setResumeAnalysis(await setSuggestionState(job.id, resumeAnalysis.id, s.id, state))
    } catch (err) {
      setResumeState((st) => ({ ...st, error: err instanceof Error ? err.message : 'Could not save' }))
    }
  }

  const runStrategy = async () => {
    if (!job) return
    setStrategyState({ busy: true, error: null })
    try {
      const inputs = await requestStrategyInputs(job.id)
      const compat = report ?? computeCompatibility(inputs.job, inputs.preferences, curriculum)
      const analysis = inputs.analysis ?? resumeAnalysis
      setStrategy(buildApplicationStrategy({ job: inputs.job, prefs: inputs.preferences, compatibility: compat, resume: analysis?.report ?? null, curriculum }))
      setStrategyNarrative(inputs.narrative ?? null)
      setStrategyState({ busy: false, error: null })
    } catch (err) {
      setStrategyState({ busy: false, error: err instanceof Error ? err.message : 'Could not build the strategy' })
    }
  }

  const gapTracks = curriculum ? curriculum.tracks.filter((t) => curriculum.gapTrackIds.includes(t.track.id)) : []
  const confirmAddGaps = async () => {
    if (!confirmGaps) return
    setGapsBusy(true)
    try {
      const result = await onAddGaps(confirmGaps.map((t) => t.track.id))
      setGapsMessage(result.message)
      if (result.ok) setConfirmGaps(null)
    } finally {
      setGapsBusy(false)
    }
  }

  if (loading) {
    return (
      <div>
        <button type="button" className="job-back" onClick={onBack}>
          ← Back to jobs
        </button>
        <div className="jobs-list" aria-busy="true" aria-label="Loading job">
          <div className="jobs-skeleton" style={{ height: 180 }} />
          <div className="jobs-skeleton" />
        </div>
      </div>
    )
  }
  if (error || !job) {
    return (
      <div>
        <button type="button" className="job-back" onClick={onBack}>
          ← Back to jobs
        </button>
        <div className="jobs-empty" role="alert">
          <div className="jobs-empty-title">Opening unavailable</div>
          <p className="jobs-empty-text">{error || 'Not found.'}</p>
        </div>
      </div>
    )
  }

  const fresh = freshnessLabel(job.freshness, job.lifecycle)
  const salary = salaryLabel(job)
  const eligibility = eligibilityLabel(job)
  const positives = (job.relevance?.reasons ?? []).filter((r) => r.weight > 0)
  const negatives = (job.relevance?.reasons ?? []).filter((r) => r.weight < 0)
  const locked = (feature: string, title: string, description: string) =>
    !user ? <LockedFeature title={title} description={description} onSignIn={onSignIn} signedIn={false} compact /> : !can(feature) ? <LockedFeature title={title} description={description} onUpgrade={onUpgrade} signedIn compact /> : null

  return (
    <div>
      <button type="button" className="job-back" onClick={onBack} hidden={interviewActive}>
        ← Back to jobs
      </button>
      <div className={`job-detail${interviewActive ? ' is-interview' : ''}`}>
        <div className="job-detail-main">
          <section className="job-hero" aria-labelledby="job-title" hidden={interviewActive}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="job-title" className="job-hero-title">
                  {job.title}
                </h2>
                <p className="job-hero-company">
                  {job.company.website ? (
                    <a href={job.company.website} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
                      {job.company.name}
                    </a>
                  ) : (
                    job.company.name
                  )}
                  {job.company.headquarters ? ` · ${job.company.headquarters}` : ''}
                </p>
              </div>
              <span className={`job-chip ${fresh.tone === 'fresh' ? 'job-chip-fresh' : fresh.tone === 'stale' ? 'job-chip-stale' : ''}`}>{fresh.text}</span>
            </div>
            <dl className="job-facts">
              <div>
                <dt className="job-fact-label">Role</dt>
                <dd className="job-fact-value">{labelOf(ROLE_CATEGORIES, job.roleCategory)}</dd>
              </div>
              <div>
                <dt className="job-fact-label">Level</dt>
                <dd className="job-fact-value">{labelOf(JOB_LEVELS, job.level)}</dd>
              </div>
              <div>
                <dt className="job-fact-label">Location</dt>
                <dd className="job-fact-value">{locationLabel(job)}</dd>
              </div>
              <div>
                <dt className="job-fact-label">Work mode</dt>
                <dd className="job-fact-value">{labelOf(WORK_MODES, job.workMode)}</dd>
              </div>
              {eligibility && (
                <div>
                  <dt className="job-fact-label">Remote eligibility</dt>
                  <dd className="job-fact-value">{eligibility}</dd>
                </div>
              )}
              <div>
                <dt className="job-fact-label">Employment</dt>
                <dd className="job-fact-value">{labelOf(EMPLOYMENT_TYPES, job.employmentType)}</dd>
              </div>
              <div>
                <dt className="job-fact-label">Experience</dt>
                <dd className="job-fact-value">{job.experienceMin == null && job.experienceMax == null ? 'Not stated' : `${job.experienceMin ?? 0}${job.experienceMax != null ? `–${job.experienceMax}` : '+'} yrs`}</dd>
              </div>
              {salary && (
                <div>
                  <dt className="job-fact-label">Salary (as advertised)</dt>
                  <dd className="job-fact-value">{salary}</dd>
                </div>
              )}
              <div>
                <dt className="job-fact-label">Posted</dt>
                <dd className="job-fact-value">{formatDate(job.postedAt)}</dd>
              </div>
              <div>
                <dt className="job-fact-label">{job.lastSeenAt ? 'Last seen at source' : 'Last verified'}</dt>
                <dd className="job-fact-value">{formatDate(job.lastSeenAt || job.lastVerifiedAt)}</dd>
              </div>
            </dl>
          </section>

          <div className="job-tabs" role="tablist" aria-label="Job workspace" hidden={interviewActive}>
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="job-tab" onClick={() => setTab(t.id)}>
                {t.label}
                {t.feature && user && !can(t.feature) && <span className="job-tab-badge">Pro</span>}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <>
              <div className="prep-cta">
                <div>
                  <div className="font-semibold">Prepare for this job</div>
                  <p className="job-section-sub">A job-specific blueprint: what to prepare, revise, present and practise, with a 7/14/30-day plan on your calendar.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setTab('prepare')}>
                  Prepare for This Job
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setTab('interview')}>
                  Mock Interview for This Job
                </button>
              </div>
              <section className="job-section" aria-labelledby="job-skills">
                <h3 id="job-skills" className="job-section-title">
                  Skills the listing asks for <Prov p="job" />
                </h3>
                {job.requiredSkills.length === 0 && job.preferredSkills.length === 0 ? (
                  <p className="job-section-sub">The listing did not name specific skills. Read the description below.</p>
                ) : (
                  <>
                    {job.requiredSkills.length > 0 && (
                      <>
                        <p className="job-section-sub">Required</p>
                        <div className="job-tag-list">
                          {job.requiredSkills.map((s) => (
                            <span key={s} className="job-chip job-chip-accent">
                              {s}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    {job.preferredSkills.length > 0 && (
                      <>
                        <p className="job-section-sub mt-3">Nice to have</p>
                        <div className="job-tag-list">
                          {job.preferredSkills.map((s) => (
                            <span key={s} className="job-chip">
                              {s}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>
              <section className="job-section" aria-labelledby="job-description">
                <h3 id="job-description" className="job-section-title">
                  Job description <Prov p="job" />
                </h3>
                <p className="job-section-sub">As published by {job.company.name}.</p>
                {job.requirementsSummary && (
                  <div className="mt-3 admin-card">
                    <div className="job-fact-label">Requirements summary</div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{job.requirementsSummary}</p>
                  </div>
                )}
                <div className="job-description">{job.description}</div>
              </section>
            </>
          )}

          {tab === 'match' && (
            <section className="job-section" aria-labelledby="job-compat">
              <h3 id="job-compat" className="job-section-title">
                Compatibility analysis <span className="job-personal-label">Personal to you</span>
              </h3>
              {locked('jobs.matching', 'Compatibility analysis', 'See strong alignment, missing requirements, experience fit, curriculum coverage and skills to strengthen, with every point of the alignment score explained.') ??
                (!report ? (
                  <div className="mt-3">
                    <p className="job-section-sub">Deterministic and explainable: it compares your saved preferences and curriculum progress with the listing. It measures alignment, not your chances of being shortlisted.</p>
                    <button type="button" className="btn btn-primary btn-sm mt-3" onClick={runAnalysis} disabled={analysisState.busy}>
                      {analysisState.busy ? 'Analysing…' : 'Analyse my fit'}
                    </button>
                    {analysisState.error && (
                      <p className="text-sm text-destructive mt-2" role="alert">
                        {analysisState.error}
                      </p>
                    )}
                  </div>
                ) : (
                  <CompatibilityView report={report} usage={analysisState.usage} />
                ))}
            </section>
          )}

          {tab === 'gaps' && curriculum && (
            <section className="job-section" aria-labelledby="job-curriculum">
              <h3 id="job-curriculum" className="job-section-title">
                Curriculum to prepare with <Prov p="curriculum" />
              </h3>
              <p className="job-section-sub">
                {curriculum.careerPathTitles.length ? `Based on the ${curriculum.careerPathTitles.join(' and ')} path${curriculum.careerPathTitles.length > 1 ? 's' : ''} and the skills above.` : 'Based on the skills the listing names.'} Progress comes from your roadmap and learning workspaces on this device.
              </p>
              {curriculum.tracks.length === 0 ? (
                <p className="text-sm mt-3">No JobAppy track maps to this listing yet.</p>
              ) : (locked('jobs.curriculumGaps', 'Curriculum gap analysis', 'See which of these tracks you have covered, are learning or have not started, and add the gaps to your learning plan in one step.') ?? null) ? (
                <>
                  <div className="job-track-list">
                    {curriculum.tracks.slice(0, 4).map((t) => (
                      <TrackRow key={t.track.id} t={t} onOpenTrack={onOpenTrack} hideStatus />
                    ))}
                  </div>
                  <div className="mt-3">{locked('jobs.curriculumGaps', 'Curriculum gap analysis', 'See which of these tracks you have covered, are learning or have not started, and add the gaps to your learning plan in one step.')}</div>
                </>
              ) : (
                <>
                  <div className="job-gap-groups">
                    {(['covered', 'learning', 'not_covered'] as const).map((status) => {
                      const items = curriculum.tracks.filter((t) => t.gapStatus === status)
                      if (!items.length) return null
                      return (
                        <div key={status} className="job-gap-group">
                          <div className={`job-gap-heading is-${status}`}>
                            {GAP_LABEL[status]} · {items.length}
                          </div>
                          <div className="job-track-list">
                            {items.map((t) => (
                              <TrackRow key={t.track.id} t={t} onOpenTrack={onOpenTrack} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {gapTracks.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setConfirmGaps(gapTracks)}>
                        Add gaps to learning plan
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {gapTracks.length} track{gapTracks.length === 1 ? '' : 's'} not in your {activeGoal ? 'current goal' : 'plan'}. You confirm before anything changes.
                      </span>
                    </div>
                  )}
                  {gapsMessage && (
                    <p className="text-sm mt-2" role="status">
                      {gapsMessage}
                    </p>
                  )}
                </>
              )}
              {curriculum.uncoveredSkills.length > 0 && <p className="job-source-note">Not covered by a track yet: {curriculum.uncoveredSkills.join(', ')}.</p>}
            </section>
          )}

          {tab === 'resume' && (
            <section className="job-section" aria-labelledby="job-resume">
              <h3 id="job-resume" className="job-section-title">
                Resume vs this job <span className="job-personal-label">Personal to you</span>
              </h3>
              {locked('jobs.resumeAnalysis', 'Resume vs job description', 'Compare your uploaded resume with this listing: demonstrated requirements, missing evidence, project relevance and grounded improvement suggestions.') ??
                (!resumes || resumes.length === 0 ? (
                  <div className="mt-3">
                    <p className="job-section-sub">Upload a resume first. It stays private to your account and is only read when you run an analysis.</p>
                    <button type="button" className="btn btn-primary btn-sm mt-3" onClick={onOpenResumes}>
                      Go to Resume
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-sm">
                        Using <strong>{resumeAnalysis ? resumes.find((r) => r.id === resumeAnalysis.resumeId)?.title || 'a previous resume' : currentResume?.title}</strong>
                        {resumeAnalysis ? ` · analysed ${formatDate(resumeAnalysis.updatedAt)}` : ''}
                      </span>
                      <button type="button" className="btn btn-primary btn-sm" onClick={runResume} disabled={resumeState.busy}>
                        {resumeState.busy ? 'Analysing…' : resumeAnalysis ? 'Re-analyse with current resume' : 'Analyze resume for this job'}
                      </button>
                      <button type="button" className="btn btn-link btn-sm" onClick={onOpenResumes}>
                        Manage resumes
                      </button>
                    </div>
                    {resumeState.error && (
                      <p className="text-sm text-destructive mt-2" role="alert">
                        {resumeState.error}
                      </p>
                    )}
                    {resumeState.usage && <p className="job-source-note">Resume analyses today: {resumeState.usage.used} of {resumeState.usage.limit}.</p>}
                    {resumeAnalysis && <ResumeAnalysisView analysis={resumeAnalysis} onOpenTrack={onOpenTrack} onUpdate={updateSuggestion} onAddGaps={(ids) => setConfirmGaps(curriculum ? curriculum.tracks.filter((t) => ids.includes(t.track.id) && !t.inGoal) : [])} />}
                  </>
                ))}
            </section>
          )}

          {tab === 'strategy' && (
            <section className="job-section" aria-labelledby="job-strategy">
              <h3 id="job-strategy" className="job-section-title">
                Application strategy <span className="job-personal-label">Personal to you</span>
              </h3>
              {locked('jobs.applicationStrategy', 'Application strategy', 'A plan built from the job requirements, your resume evidence, curriculum progress and compatibility analysis: what to prepare, in what order, and how to follow up.') ??
                (!strategy ? (
                  <div className="mt-3">
                    <p className="job-section-sub">Combines the listing with your preferences, resume analysis (if run) and curriculum progress. Every line says where it comes from.</p>
                    <button type="button" className="btn btn-primary btn-sm mt-3" onClick={runStrategy} disabled={strategyState.busy}>
                      {strategyState.busy ? 'Building…' : 'Build my application strategy'}
                    </button>
                    {strategyState.error && (
                      <p className="text-sm text-destructive mt-2" role="alert">
                        {strategyState.error}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {strategyNarrative && (
                      <div className="ai-note" role="note">
                        <span className="ai-note-label">AI guidance · from the facts below · {strategyNarrative.provider}</span>
                        <p>{strategyNarrative.text}</p>
                      </div>
                    )}
                    <StrategyView strategy={strategy} onOpenTrack={onOpenTrack} onRebuild={runStrategy} />
                  </>
                ))}
            </section>
          )}

          {tab === 'networking' && (
            <NetworkingTab
              job={job}
              signedIn={Boolean(user)}
              can={can}
              profile={resumeProfile}
              onSignIn={onSignIn}
              onUpgrade={onUpgrade}
              onOutreachChanged={setOutreach}
            />
          )}

          {tab === 'prepare' && (
            <PrepareTab
              job={job}
              signedIn={Boolean(user)}
              can={can}
              curriculum={curriculum}
              compatibility={report}
              resumeAnalysis={resumeAnalysis}
              goals={goals}
              roadmap={roadmap}
              knowledgeWorkspaces={knowledgeWorkspaces}
              application={tracked ?? null}
              outreachCount={{ total: outreach.length, active: outreach.filter((c) => c.status !== 'not_contacted' && c.status !== 'closed').length }}
              preparation={preparation}
              interviewHistory={interviewHistory}
              onPreparationChanged={setPreparation}
              onOpenTopic={onOpenTopic}
              onOpenTrack={onOpenTrack}
              onAddPlan={onAddPlan}
              onSignIn={onSignIn}
              onUpgrade={onUpgrade}
            />
          )}

          {tab === 'interview' && (
            <InterviewTab
              job={job}
              signedIn={Boolean(user)}
              can={can}
              compatibility={report}
              goals={goals}
              roadmap={roadmap}
              knowledgeWorkspaces={knowledgeWorkspaces}
              hasBlueprint={Boolean(preparation?.blueprint)}
              onOpenTopic={onOpenTopic}
              onAddPlan={onAddPlan}
              onHistoryChanged={setInterviewHistory}
              onSessionActive={setInterviewActive}
              onGoPrepare={() => setTab('prepare')}
              onSignIn={onSignIn}
              onUpgrade={onUpgrade}
            />
          )}

          {tab === 'tracker' && (
            <section className="job-section" aria-labelledby="job-tracker">
              <h3 id="job-tracker" className="job-section-title">
                Application tracker
              </h3>
              {tracked ? (
                <div className="mt-3">
                  <p className="text-sm">
                    Tracked as <strong>{tracked.status}</strong>
                    {tracked.appliedDate ? ` · applied ${formatDate(tracked.appliedDate)}` : ''}
                    {tracked.jobRef?.resumeAnalysisId ? ' · linked to your resume analysis' : ''}.
                  </p>
                  <p className="job-source-note">The tracker keeps the official link ({hostOf(tracked.jobUrl)}) and this job reference; update the status from the board or list.</p>
                  <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={onOpenTracker}>
                    Open applications
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="job-section-sub">Adds this opening to your existing tracker (Wishlist) with the official application link and a reference to this listing{resumeAnalysis ? ' and your resume analysis' : ''}.</p>
                  <button type="button" className="btn btn-primary btn-sm mt-3" onClick={() => onAddToTracker(job, resumeAnalysis?.id ?? null)}>
                    Add to Application Tracker
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="job-detail-side" hidden={interviewActive}>
          <div className="jobs-panel">
            <div className="jobs-panel-title">Apply on the official page</div>
            <p className="jobs-panel-sub">Applications go through {job.company.name}, never through JobAppy.</p>
            <a href={job.applyUrl} target="_blank" rel="noreferrer noopener" className="btn btn-primary w-full mt-3">
              Apply at {hostOf(job.applyUrl)}
            </a>
            {tracked ? (
              <p className="job-source-note">
                Already in your tracker as <strong>{tracked.status}</strong>.
              </p>
            ) : (
              <button type="button" className="btn btn-ghost w-full mt-2" onClick={() => onAddToTracker(job, resumeAnalysis?.id ?? null)}>
                Add to Application Tracker
              </button>
            )}
          </div>
          <div className="jobs-panel">
            <div className="jobs-panel-title">Source</div>
            <dl className="mt-2 flex flex-col gap-2">
              <div>
                <dt className="job-fact-label">Listed by</dt>
                <dd className="text-sm font-medium">{job.source ? `${job.source.name} · ${labelOf(SOURCE_TYPES, job.source.type)}` : 'Added by the JobAppy team'}</dd>
              </div>
              <div>
                <dt className="job-fact-label">Original link</dt>
                <dd className="text-sm font-medium break-all">
                  <a href={job.sourceUrl || job.applyUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
                    {hostOf(job.sourceUrl || job.applyUrl)}
                  </a>
                </dd>
              </div>
              {job.externalId && (
                <div>
                  <dt className="job-fact-label">Requisition id</dt>
                  <dd className="text-sm font-medium">{job.externalId}</dd>
                </div>
              )}
              {job.expiresAt && (
                <div>
                  <dt className="job-fact-label">Closes</dt>
                  <dd className="text-sm font-medium">{formatDate(job.expiresAt)}</dd>
                </div>
              )}
              {job.lifecycle === 'stale' && (
                <div>
                  <dt className="job-fact-label">Note</dt>
                  <dd className="text-sm">This listing was not returned by its source on the last check. Confirm it is still open before applying.</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="jobs-panel">
            <div className="jobs-panel-title">
              <span>Why this is shown to you</span>
              <span className="job-personal-label">Personal</span>
            </div>
            {!user ? (
              <>
                <p className="jobs-panel-sub">Sign in and set job preferences to see how each opening lines up with your targets.</p>
                <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={onSignIn}>
                  Sign in
                </button>
              </>
            ) : !can('jobs.personalizedFeed') ? (
              <p className="jobs-panel-sub">Ranking reasons are part of the Prep Pro personalised feed.</p>
            ) : !job.relevance ? (
              <p className="jobs-panel-sub">Set your job preferences on the Jobs page to get a fit breakdown here.</p>
            ) : positives.length === 0 && negatives.length === 0 ? (
              <p className="jobs-panel-sub">Your preferences do not overlap with this listing yet.</p>
            ) : (
              <>
                <div className="job-reason-list">
                  {positives.map((r) => (
                    <div key={r.text} className="job-reason">
                      <span className="job-reason-dot" aria-hidden="true" />
                      <span>{r.text}</span>
                    </div>
                  ))}
                  {negatives.map((r) => (
                    <div key={r.text} className="job-reason is-negative">
                      <span className="job-reason-dot" aria-hidden="true" />
                      <span>{r.text}</span>
                    </div>
                  ))}
                </div>
                <p className="job-source-note">This compares the listing with your saved preferences only. It is not a prediction of shortlisting or hiring.</p>
              </>
            )}
          </div>
        </aside>
      </div>

      {confirmGaps && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="gaps-title">
          <div className="admin-modal">
            <h2 id="gaps-title" className="admin-modal-title">
              Add these tracks to your learning plan?
            </h2>
            {activeGoal ? (
              <p className="admin-help">
                They will be added to your goal <strong>{activeGoal.name || activeGoal.targetRole}</strong> with Medium priority and scheduled into free time from today. Existing tracks, tasks and topic selections are not changed.
              </p>
            ) : (
              <p className="admin-help">You do not have a learning goal yet. Create one first from Goals &amp; Roadmap; nothing will be added now.</p>
            )}
            {confirmGaps.length === 0 && <p className="admin-help">Every suggested track is already in your goal.</p>}
            <ul className="admin-list">
              {confirmGaps.map((t) => (
                <li key={t.track.id} className="admin-list-item">
                  <span className="font-semibold">{t.track.title}</span>
                  <span className="text-muted-foreground">{t.skills.length ? `covers ${t.skills.join(', ')}` : t.because[0]}</span>
                </li>
              ))}
            </ul>
            {gapsMessage && (
              <p className="text-sm" role="status">
                {gapsMessage}
              </p>
            )}
            <div className="admin-form-footer">
              {activeGoal && confirmGaps.length > 0 && (
                <button type="button" className="btn btn-primary" onClick={confirmAddGaps} disabled={gapsBusy}>
                  {gapsBusy ? 'Adding…' : `Add ${confirmGaps.length} track${confirmGaps.length === 1 ? '' : 's'}`}
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmGaps(null)}>
                {activeGoal && confirmGaps.length > 0 ? 'Cancel' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TrackRow({ t, onOpenTrack, hideStatus }: { t: TrackAlignment; onOpenTrack: (id: string) => void; hideStatus?: boolean }) {
  return (
    <div className="job-track">
      <div className="min-w-0 flex-1">
        <div className="job-track-title">
          {t.track.icon ? `${t.track.icon} ` : ''}
          {t.track.title}
        </div>
        <div className="job-track-sub">
          {t.skills.length ? `Covers ${t.skills.join(', ')}` : t.because[0]}
          {!hideStatus && t.inGoal ? ' · in your goal' : ''}
          {!hideStatus && t.topicsTotal ? ` · ${t.topicsCompleted}/${t.topicsTotal} topics done` : ''}
        </div>
        {!hideStatus && t.topicsTotal > 0 && (
          <div className="job-progress" role="progressbar" aria-valuenow={t.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.track.title} progress`}>
            <span style={{ width: `${t.progress}%` }} />
          </div>
        )}
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenTrack(t.track.id)}>
        Open
      </button>
    </div>
  )
}

function CompatibilityView({ report, usage }: { report: CompatibilityReport; usage: { used: number; limit: number } | null }) {
  return (
    <div className="mt-3 compat">
      <div className="compat-score-row">
        <div className="compat-score" aria-label={`Alignment score ${report.score} out of 100`}>
          <span className="compat-score-value">{report.score}</span>
          <span className="compat-score-max">/100</span>
        </div>
        <div className="min-w-0">
          <div className="font-semibold">Profile / job alignment</div>
          <p className="job-section-sub">A weighted sum of the six checks below. It describes alignment with the listing, not the likelihood of being shortlisted or hired.</p>
        </div>
      </div>
      <table className="compat-table">
        <thead>
          <tr>
            <th>Check</th>
            <th>Points</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {report.breakdown.map((c) => (
            <tr key={c.key}>
              <td className="whitespace-nowrap font-semibold">{c.label}</td>
              <td className="whitespace-nowrap">
                {c.points} / {c.max}
              </td>
              <td>{c.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="compat-grid">
        <div>
          <div className="job-fact-label">Strong alignment</div>
          {report.strongAlignment.length ? (
            <ul className="compat-list">
              {report.strongAlignment.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">Nothing stands out yet; add skills and experience to your preferences.</p>
          )}
        </div>
        <div>
          <div className="job-fact-label">Missing requirements</div>
          {report.missingRequirements.length ? (
            <ul className="compat-list is-gap">
              {report.missingRequirements.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No stated requirement is missing from your profile.</p>
          )}
        </div>
        <div>
          <div className="job-fact-label">Experience</div>
          <p className="text-sm">{report.experienceAlignment}</p>
        </div>
        <div>
          <div className="job-fact-label">Location and work mode</div>
          <p className="text-sm">{report.locationCompatibility}</p>
        </div>
        <div>
          <div className="job-fact-label">Curriculum</div>
          <p className="text-sm">
            Covered: {report.curriculumAlignment.covered.join(', ') || 'none'} · Learning: {report.curriculumAlignment.learning.join(', ') || 'none'} · Not yet: {report.curriculumAlignment.notCovered.join(', ') || 'none'}
          </p>
        </div>
        <div>
          <div className="job-fact-label">Skills to strengthen</div>
          {report.skillsToStrengthen.length ? (
            <ul className="compat-list">
              {report.skillsToStrengthen.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">None from this listing.</p>
          )}
        </div>
      </div>
      {report.missingInputs.length > 0 && <p className="job-source-note">Add {report.missingInputs.join(', ')} to your preferences for a fuller picture.</p>}
      {usage && <p className="job-source-note">Analyses today: {usage.used} of {usage.limit}.</p>}
    </div>
  )
}


function StrategyView({ strategy, onOpenTrack, onRebuild }: { strategy: ApplicationStrategy; onOpenTrack: (id: string) => void; onRebuild: () => void }) {
  const Section = ({ title, items }: { title: string; items: StrategyItem[] }) => (
    <div className="strategy-section">
      <h4>{title}</h4>
      <ul className="strategy-list">
        {items.map((i, idx) => (
          <li key={idx}>
            <Prov p={i.provenance} />
            <span>{i.text}</span>
            {i.trackId && (
              <button type="button" className="btn btn-link btn-sm" onClick={() => onOpenTrack(i.trackId!)}>
                Open track
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="mt-2">
      {strategy.missingInputs.length > 0 && <p className="job-source-note">Built without {strategy.missingInputs.join(', ')}; run those first for a fuller plan, then rebuild.</p>}
      <Section title="Requirements summary" items={strategy.requirementsSummary} />
      <Section title="Strongest relevant experience" items={strategy.strongestExperience} />
      <Section title="Important gaps" items={strategy.importantGaps} />
      <Section title="Resume preparation checklist" items={strategy.resumeChecklist} />
      <Section title="Curriculum revision checklist" items={strategy.curriculumChecklist} />
      <Section title="Projects to emphasise" items={strategy.projectsToEmphasise} />
      <Section title="Suggested application sequence" items={strategy.applicationSequence} />
      <Section title="Interview preparation priorities" items={strategy.interviewPriorities} />
      <Section title="Follow-up guidance" items={strategy.followUp} />
      <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={onRebuild}>
        Rebuild with latest analyses
      </button>
    </div>
  )
}
