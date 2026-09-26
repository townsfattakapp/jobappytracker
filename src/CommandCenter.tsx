import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from './lib/adminClient'
import { dateKey } from './lib/learningPlan'
import type { DashboardData } from './lib/server/dashboard'
import type { ViewMode } from './Sidebar'
import type { AppUser } from './lib/cloudSync'
import type { Goal, JobApplication, KnowledgeWorkspace, MockInterviewSummary, OnboardingState, RevisionItem, RoadmapDay } from './types'

interface Props {
  user: AppUser | null
  goals: Goal[]
  roadmap: RoadmapDay[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
  applications: JobApplication[]
  revisionItems: RevisionItem[]
  mockInterviewSummaries: MockInterviewSummary[]
  onboarding: OnboardingState | null
  plan: { displayName: string; isDefault: boolean } | null
  features: string[]
  onNavigate: (view: ViewMode) => void
  onOpenJob: (jobId: string) => void
  onStartOnboarding: () => void
  onSignIn: () => void
}

const ACTIVE = new Set(['Applied', 'Under Review', 'Assessment', 'Interview', 'HR Round', 'Offer'])

function Card({ id, title, children, action, empty }: { id: string; title: string; children?: React.ReactNode; action?: { label: string; onClick: () => void }; empty?: string }) {
  return (
    <section className="cc-card" aria-labelledby={`cc-${id}`}>
      <div className="cc-card-head">
        <h2 id={`cc-${id}`} className="cc-card-title">
          {title}
        </h2>
        {action && (
          <button type="button" className="btn btn-link btn-sm" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {children ?? <p className="cc-empty">{empty}</p>}
    </section>
  )
}

/**
 * Career Command Center: one honest summary of where the learner is, built
 * from the synced learning state and one server request. Every card links to
 * the existing feature it summarises; nothing is estimated or invented.
 */
export default function CommandCenter({ user, goals, roadmap, knowledgeWorkspaces, applications, revisionItems, mockInterviewSummaries, onboarding, plan, features, onNavigate, onOpenJob, onStartOnboarding, onSignIn }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState<string | null>(null)
  const today = dateKey()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    api<{ dashboard: DashboardData }>('/api/dashboard')
      .then((r) => {
        if (!cancelled) setData(r.dashboard)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Could not load your dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const goal = goals.find((g) => g.status === 'Active') ?? goals[0] ?? null
  const goalDays = useMemo(() => (goal ? roadmap.filter((d) => d.goalId === goal.id) : roadmap), [goal, roadmap])
  const allTasks = useMemo(() => goalDays.flatMap((d) => d.tasks), [goalDays])
  const doneTasks = allTasks.filter((t) => t.status === 'Completed').length
  const todayTasks = useMemo(() => goalDays.filter((d) => d.date.slice(0, 10) === today).flatMap((d) => d.tasks), [goalDays, today])
  const upcoming = useMemo(() => goalDays.filter((d) => d.date.slice(0, 10) > today).flatMap((d) => d.tasks.filter((t) => t.status === 'Pending').map((t) => ({ ...t, date: d.date.slice(0, 10) }))).slice(0, 5), [goalDays, today])
  const goalTopicIds = useMemo(() => new Set(allTasks.map((t) => t.topicId).filter(Boolean)), [allTasks])
  const mastered = knowledgeWorkspaces.filter((w) => w.learningStatus === 'Mastered' && (goalTopicIds.size === 0 || goalTopicIds.has(w.topicId))).length
  const revisionDue = revisionItems.filter((r) => r.dueDate.slice(0, 10) <= today).length + knowledgeWorkspaces.filter((w) => w.nextRevisionDate && w.nextRevisionDate.slice(0, 10) <= today).length
  const activeApps = applications.filter((a) => ACTIVE.has(a.status))
  const interviewing = applications.filter((a) => a.status === 'Interview' || a.status === 'HR Round')
  const upcomingRounds = applications.flatMap((a) => a.interviewRounds.filter((r) => r.date && r.date.slice(0, 10) >= today).map((r) => ({ ...r, company: a.company, role: a.role }))).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')).slice(0, 3)
  const appFollowUps = applications.filter((a) => a.followUpDate && a.followUpDate.slice(0, 10) <= today && ACTIVE.has(a.status))
  const setupIncomplete = user && (!onboarding?.completedAt || onboarding.skippedSteps.includes('all'))

  if (!user) {
    return (
      <div className="cc-grid">
        <Card id="signin" title="Career Command Center">
          <p className="cc-text">Sign in to see your goal, today&apos;s learning, recommended jobs, applications, interviews and preparation in one place.</p>
          <button type="button" className="btn btn-primary mt-3" onClick={onSignIn}>
            Sign in
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="cc-grid" aria-busy={loading}>
      {setupIncomplete && (
        <section className="cc-card cc-card-wide" aria-labelledby="cc-setup">
          <h2 id="cc-setup" className="cc-card-title">
            Finish setting up your Career OS
          </h2>
          <p className="cc-text">Three minutes: career target, experience, availability, curriculum and job preferences. Everything can be changed later.</p>
          <button type="button" className="btn btn-primary mt-2" onClick={onStartOnboarding}>
            Start setup
          </button>
        </section>
      )}
      {error && (
        <p className="admin-alert admin-alert-error cc-card-wide" role="alert">
          {error}
        </p>
      )}

      <Card id="goal" title="Career goal" action={{ label: goal ? 'Open roadmap' : 'Create a goal', onClick: () => onNavigate('roadmap') }} empty={goal ? undefined : 'No learning goal yet.'}>
        {goal && (
          <>
            <p className="cc-big">{goal.name || goal.targetRole}</p>
            <p className="cc-text">
              {goal.tracks.length} track{goal.tracks.length === 1 ? '' : 's'} · {goal.hoursPerDay} h/day · {doneTasks} of {allTasks.length} tasks completed
            </p>
            <div className="job-progress" role="progressbar" aria-valuenow={allTasks.length ? Math.round((doneTasks / allTasks.length) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label="Roadmap progress">
              <span style={{ width: `${allTasks.length ? (doneTasks / allTasks.length) * 100 : 0}%` }} />
            </div>
          </>
        )}
      </Card>

      <Card id="curriculum" title="Curriculum progress" action={{ label: 'Explore tracks', onClick: () => onNavigate('tracks') }}>
        <p className="cc-big">{mastered}</p>
        <p className="cc-text">topics mastered{goalTopicIds.size ? ` of ${goalTopicIds.size} in your plan` : ''} · {knowledgeWorkspaces.filter((w) => w.learningStatus !== 'Not Started').length} workspaces started</p>
      </Card>

      <Card id="today" title="Today's learning" action={{ label: 'Open today', onClick: () => onNavigate('today') }} empty={todayTasks.length ? undefined : goal ? 'Nothing scheduled today.' : 'Create a goal to get a daily plan.'}>
        {todayTasks.length > 0 && (
          <ul className="cc-list">
            {todayTasks.slice(0, 4).map((t) => (
              <li key={t.id} className={t.status === 'Completed' ? 'is-done' : ''}>
                {t.title} <span className="text-xs text-muted-foreground">· {t.estDurationMinutes} min</span>
              </li>
            ))}
            {todayTasks.length > 4 && <li className="text-xs text-muted-foreground">+{todayTasks.length - 4} more</li>}
          </ul>
        )}
      </Card>

      <Card id="revision" title="Revision due" action={{ label: 'Revise', onClick: () => onNavigate('today') }}>
        <p className="cc-big">{revisionDue}</p>
        <p className="cc-text">items due today or earlier</p>
      </Card>

      <Card id="recommended" title="Recommended jobs" action={{ label: 'Job discovery', onClick: () => onNavigate('jobs') }} empty={loading ? 'Loading…' : data?.recommendedJobs.length ? undefined : 'No openings yet. Set preferences to get ranked matches.'}>
        {data && data.recommendedJobs.length > 0 && (
          <ul className="cc-list">
            {data.recommendedJobs.map((j) => (
              <li key={j.id}>
                <button type="button" className="cc-link" onClick={() => onOpenJob(j.id)} aria-label={`Open ${j.title} at ${j.companyName}`}>
                  {j.title} · {j.companyName}
                </button>
                {j.reasons[0] && <div className="text-xs text-muted-foreground">{j.reasons[0]}</div>}
              </li>
            ))}
            {!data.preferencesSet && <li className="text-xs text-muted-foreground">Set job preferences for ranked matches.</li>}
          </ul>
        )}
      </Card>

      <Card id="verified" title="Recently verified jobs" action={{ label: 'All jobs', onClick: () => onNavigate('jobs') }} empty={loading ? 'Loading…' : data?.recentlyVerifiedJobs.length ? undefined : 'No verified listings yet.'}>
        {data && data.recentlyVerifiedJobs.length > 0 && (
          <ul className="cc-list">
            {data.recentlyVerifiedJobs.map((j) => (
              <li key={j.id}>
                <button type="button" className="cc-link" onClick={() => onOpenJob(j.id)} aria-label={`Open ${j.title} at ${j.companyName}`}>
                  {j.title} · {j.companyName}
                </button>
                <div className="text-xs text-muted-foreground">verified {j.lastVerifiedAt ? new Date(j.lastVerifiedAt).toLocaleDateString() : '—'}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card id="applications" title="Applications" action={{ label: 'Open tracker', onClick: () => onNavigate('list') }}>
        <p className="cc-big">{activeApps.length}</p>
        <p className="cc-text">active of {applications.length} tracked · {applications.filter((a) => a.status === 'Offer').length} offer{applications.filter((a) => a.status === 'Offer').length === 1 ? '' : 's'}</p>
      </Card>

      <Card id="interviews" title="Interviews" action={{ label: 'Kanban board', onClick: () => onNavigate('board') }} empty={interviewing.length || upcomingRounds.length ? undefined : 'No interviews scheduled.'}>
        {(interviewing.length > 0 || upcomingRounds.length > 0) && (
          <>
            <p className="cc-big">{interviewing.length}</p>
            <p className="cc-text">application{interviewing.length === 1 ? '' : 's'} in interview stages</p>
            {upcomingRounds.length > 0 && (
              <ul className="cc-list">
                {upcomingRounds.map((r) => (
                  <li key={r.id}>
                    {r.name} · {r.company} <span className="text-xs text-muted-foreground">· {r.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>

      <Card id="followups" title="Follow-ups due" action={{ label: 'Applications', onClick: () => onNavigate('list') }} empty={loading ? 'Loading…' : appFollowUps.length || data?.followUpsDue.length ? undefined : 'Nothing due.'}>
        {(appFollowUps.length > 0 || (data && data.followUpsDue.length > 0)) && (
          <ul className="cc-list">
            {appFollowUps.slice(0, 3).map((a) => (
              <li key={a.id}>
                {a.role} · {a.company} <span className="text-xs text-muted-foreground">· follow up by {a.followUpDate}</span>
              </li>
            ))}
            {data?.followUpsDue.slice(0, 3).map((f) => (
              <li key={f.id}>
                <button type="button" className="cc-link" onClick={() => onOpenJob(f.jobId)} aria-label={`Open outreach for ${f.jobTitle}`}>
                  {f.name} · {f.jobTitle}
                </button>
                <span className="text-xs text-muted-foreground"> · {f.followUpDate}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card id="prep" title="Job preparation" action={{ label: 'Jobs', onClick: () => onNavigate('jobs') }} empty={loading ? 'Loading…' : data?.preparations.length ? undefined : 'No preparation blueprint yet. Open a job and choose Prepare for This Job.'}>
        {data && data.preparations.length > 0 && (
          <ul className="cc-list">
            {data.preparations.map((p) => (
              <li key={p.jobId}>
                <button type="button" className="cc-link" onClick={() => onOpenJob(p.jobId)} aria-label={`Open preparation for ${p.jobTitle}`}>
                  {p.jobTitle} · {p.companyName}
                </button>
                <div className="text-xs text-muted-foreground">
                  {p.addedTaskCount} tasks on your calendar · {p.completedItemIds} items marked prepared
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card id="weak" title="Weak areas" action={data?.interviews.latest ? { label: 'Open report', onClick: () => onOpenJob(data.interviews.latest!.jobId ?? '') } : undefined} empty={loading ? 'Loading…' : data?.interviews.latest ? undefined : 'Run a job mock interview to map weak areas to your curriculum.'}>
        {data?.interviews.latest && (
          <>
            <p className="cc-big">{data.interviews.weakAreas}</p>
            <p className="cc-text">
              weak area{data.interviews.weakAreas === 1 ? '' : 's'} from your latest interview for {data.interviews.jobTitle}
              {data.interviews.latest.needsImprovement[0] ? `: ${data.interviews.latest.needsImprovement[0]}` : ''}
            </p>
          </>
        )}
      </Card>

      <Card id="mock" title="Mock interview progress" action={{ label: 'Mock interviews', onClick: () => onNavigate('mock') }}>
        <p className="cc-big">{(data?.interviews.completed ?? 0) + mockInterviewSummaries.length}</p>
        <p className="cc-text">
          {data?.interviews.completed ?? 0} job-specific · {mockInterviewSummaries.length} general
          {data?.interviews.latest ? ` · latest: ${data.interviews.latest.metrics.filter((m) => m.total > 0 && m.demonstrated / m.total >= 0.6).length}/${data.interviews.latest.metrics.length} areas demonstrated` : ''}
        </p>
      </Card>

      <Card id="networking" title="Networking" action={{ label: 'Jobs', onClick: () => onNavigate('jobs') }}>
        <p className="cc-big">{data?.networking.contacts ?? 0}</p>
        <p className="cc-text">contacts saved · {data?.networking.active ?? 0} contacted</p>
      </Card>

      <Card id="upcoming" title="Upcoming tasks" action={{ label: 'Roadmap', onClick: () => onNavigate('roadmap') }} empty={upcoming.length ? undefined : 'Nothing scheduled after today.'}>
        {upcoming.length > 0 && (
          <ul className="cc-list">
            {upcoming.map((t) => (
              <li key={t.id}>
                {t.title} <span className="text-xs text-muted-foreground">· {t.date}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card id="profile" title="Profile and plan" action={{ label: 'Settings', onClick: () => onNavigate('settings') }}>
        <p className="cc-big">{plan?.displayName ?? '—'}</p>
        <p className="cc-text">
          {data?.resume ? `Resume: ${data.resume.title}` : 'No resume yet'} · {data?.preferencesSet ? 'job preferences set' : 'job preferences not set'} · {features.length} features
        </p>
        {plan?.isDefault && (
          <a href="/pricing" className="btn btn-ghost btn-sm mt-2">
            See plans
          </a>
        )}
      </Card>
    </div>
  )
}
