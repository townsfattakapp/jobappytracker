import { useMemo } from 'react'
import {
  type JobApplication,
  type RoadmapDay,
  type Goal,
  type DsaProblem,
  type DsaAttemptSummary,
  type LeetCodeConfig,
  type RevisionItem,
  type KnowledgeWorkspace,
  STATUS_ORDER,
  isOverdue,
  formatDate,
  todayKey,
} from './types'
import type { ViewMode } from './Sidebar'

interface DashboardProps {
  applications: JobApplication[]
  roadmap: RoadmapDay[]
  goals: Goal[]
  dsaProblems: DsaProblem[]
  dsaAttemptSummaries: DsaAttemptSummary[]
  leetCodeConfig?: LeetCodeConfig
  revisionItems?: RevisionItem[]
  knowledgeWorkspaces?: KnowledgeWorkspace[]
  onNavigate?: (view: ViewMode) => void
  onAddApplication?: () => void
}

export default function Dashboard({
  applications,
  roadmap,
  goals,
  dsaProblems,
  dsaAttemptSummaries,
  leetCodeConfig,
  revisionItems = [],
  knowledgeWorkspaces = [],
  onNavigate,
  onAddApplication,
}: DashboardProps) {
  const stats = useMemo(() => {
    const total = applications.length
    const applied = applications.filter((a) => a.status !== 'Wishlist').length
    const screening = applications.filter((a) =>
      ['Assessment', 'Interview', 'HR Round', 'Offer'].includes(a.status),
    ).length
    const interviews = applications.filter((a) => ['Interview', 'HR Round', 'Offer'].includes(a.status)).length
    const offers = applications.filter((a) => a.status === 'Offer').length

    return {
      total,
      funnel: [
        { label: 'Applied', count: applied, color: 'bg-ig-blue' },
        { label: 'Screen / assessment', count: screening, color: 'bg-ig-purple' },
        { label: 'Interview', count: interviews, color: 'bg-ig-magenta' },
        { label: 'Offer', count: offers, color: 'bg-ig-orange' },
      ],
      statusCounts: STATUS_ORDER.map((status) => ({
        status,
        count: applications.filter((a) => a.status === status).length,
      })),
    }
  }, [applications])

  const attention = useMemo(() => {
    const today = todayKey()
    const overdue = applications.filter((a) => isOverdue(a.followUpDate) && !['Rejected', 'Withdrawn'].includes(a.status))
    const upcomingInterviews = applications
      .flatMap((a) =>
        (a.interviewRounds || [])
          .filter((r) => r.date && r.date >= today && r.passed === null)
          .map((r) => ({ app: a, round: r })),
      )
      .sort((x, y) => (x.round.date || '').localeCompare(y.round.date || ''))
      .slice(0, 5)
    return { overdue: overdue.slice(0, 5), overdueCount: overdue.length, upcomingInterviews }
  }, [applications])

  const roadmapStats = useMemo(() => {
    let completedTime = 0
    let totalTime = 0
    let completedTasks = 0
    let totalTasks = 0
    let streak = 0

    const today = todayKey()
    const pastDays = roadmap
      .filter((d) => d.date.slice(0, 10) <= today && d.tasks.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date))

    // Streak: consecutive most-recent planned days that were fully completed.
    for (let i = pastDays.length - 1; i >= 0; i--) {
      const day = pastDays[i]
      if (day.tasks.every((t) => t.status === 'Completed' || t.status === 'Skipped')) {
        streak++
      } else {
        break
      }
    }

    roadmap.forEach((day) => {
      day.tasks.forEach((task) => {
        totalTasks++
        totalTime += task.estDurationMinutes
        if (task.status === 'Completed') {
          completedTasks++
          completedTime += task.actualDurationMinutes || task.estDurationMinutes
        }
      })
    })

    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
    return { completedTime, totalTime, progress, streak, completedTasks, totalTasks }
  }, [roadmap])

  const dsaStats = useMemo(() => {
    const today = todayKey()
    const totalProblems = dsaProblems.length
    const attempted = dsaProblems.filter((p) => p.status !== 'Unattempted').length
    const solved = dsaProblems.filter((p) => p.status === 'Solved').length
    const indySolved = dsaAttemptSummaries.filter((a) => a.outcome === 'Solved').length
    const revisionDue =
      revisionItems.filter((r) => r.dueDate.slice(0, 10) <= today).length +
      knowledgeWorkspaces.filter((w) => w.nextRevisionDate && w.nextRevisionDate.slice(0, 10) <= today).length
    return { totalProblems, attempted, solved, indySolved, revisionDue }
  }, [dsaProblems, dsaAttemptSummaries, revisionItems, knowledgeWorkspaces])

  if (applications.length === 0 && goals.length === 0) {
    return (
      <div className="py-16 px-6 text-center flex flex-col items-center justify-center surface rounded-3xl animate-fade">
        <span className="text-6xl mb-4 block" aria-hidden="true">🚀</span>
        <h2 className="text-2xl font-display font-bold mb-2">Welcome to JobAppy</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Track every application in one place, then build a daily prep plan so interviews never catch you off guard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" className="btn btn-primary" onClick={onAddApplication}>
            Add your first application
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onNavigate?.('roadmap')}>
            Create a learning goal
          </button>
        </div>
      </div>
    )
  }

  const maxFunnel = Math.max(stats.funnel[0].count, 1)

  return (
    <div className="animate-rise w-full min-w-0 flex flex-col gap-5 sm:gap-6">
      {(attention.overdueCount > 0 || attention.upcomingInterviews.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attention.overdueCount > 0 && (
            <div className="surface rounded-2xl p-4 sm:p-5 border-destructive/30">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-display font-semibold text-foreground">Follow-ups overdue</h2>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                  {attention.overdueCount}
                </span>
              </div>
              <ul className="space-y-2">
                {attention.overdue.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold text-foreground">{a.company}</span>
                      <span className="text-muted-foreground"> · {a.role}</span>
                    </span>
                    <span className="shrink-0 text-destructive font-medium">{formatDate(a.followUpDate)}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => onNavigate?.('list')}>
                Open applications
              </button>
            </div>
          )}
          {attention.upcomingInterviews.length > 0 && (
            <div className="surface rounded-2xl p-4 sm:p-5 border-primary/30">
              <h2 className="text-base font-display font-semibold text-foreground mb-3">Upcoming interviews</h2>
              <ul className="space-y-2">
                {attention.upcomingInterviews.map(({ app, round }) => (
                  <li key={round.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold text-foreground">{app.company}</span>
                      <span className="text-muted-foreground"> · {round.name || 'Interview'}</span>
                    </span>
                    <span className="shrink-0 text-primary font-medium">{formatDate(round.date)}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => onNavigate?.('prepKit')}>
                Prep notes
              </button>
            </div>
          )}
        </section>
      )}

      {goals.length > 0 && (
        <section className="surface rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--card))] to-primary/5">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground sm:text-xl">Roadmap progress</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('today')}>
              Today’s plan
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Completion" value={`${roadmapStats.progress}%`} tone="text-primary" />
            <Stat label="Current streak" value={String(roadmapStats.streak)} unit="days" tone="text-emerald-500" />
            <Stat label="Tasks completed" value={String(roadmapStats.completedTasks)} unit={`/ ${roadmapStats.totalTasks}`} />
            <Stat label="Time invested" value={String(Math.round(roadmapStats.completedTime / 60))} unit="hours" />
          </div>
        </section>
      )}

      {dsaProblems.length > 0 && (
        <section className="surface rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--card))] to-emerald-500/5">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground sm:text-xl">DSA progress</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('dsa')}>
              Practice
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Stat label="LeetCode solved" value={String(leetCodeConfig?.totalSolved || 0)} unit={leetCodeConfig?.username ? '' : 'not linked'} />
            <Stat label="Attempted" value={String(dsaStats.attempted)} unit={`/ ${dsaStats.totalProblems}`} tone="text-amber-500" />
            <Stat label="Solved" value={String(dsaStats.solved)} tone="text-emerald-500" />
            <Stat label="Independent" value={String(dsaStats.indySolved)} unit="attempts" tone="text-emerald-600" />
            <Stat label="Revision due" value={String(dsaStats.revisionDue)} tone={dsaStats.revisionDue > 0 ? 'text-destructive' : 'text-foreground'} />
          </div>
        </section>
      )}

      <section className="surface rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-display font-semibold mb-4 text-foreground sm:mb-6 sm:text-xl">Pipeline funnel</h2>
        {stats.total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No applications yet.{' '}
            <button type="button" className="text-primary font-semibold hover:underline" onClick={onAddApplication}>
              Add one
            </button>{' '}
            to see your funnel.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {stats.funnel.map((step) => {
              const percentage = Math.round((step.count / maxFunnel) * 100) || 0
              return (
                <div key={step.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">{step.label}</span>
                    <span className="text-muted-foreground font-medium">
                      {step.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div className={`h-full ${step.color} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="surface rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-display font-semibold mb-4 text-foreground sm:mb-6 sm:text-xl">Status breakdown</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {stats.statusCounts.map(({ status, count }) => (
            <div key={status} className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-[hsl(var(--card))] p-3 text-center sm:p-4">
              <span className="mb-1 text-xl font-bold text-foreground sm:text-2xl">{count}</span>
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">{status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, unit, tone = 'text-foreground' }: { label: string; value: string; unit?: string; tone?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-[hsl(var(--card))]">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${tone}`}>{value}</span>
        {unit ? <span className="text-sm font-medium text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  )
}
