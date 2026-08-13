import { useMemo } from 'react'
import { type JobApplication, STATUS_ORDER } from './types'

interface DashboardProps {
  applications: JobApplication[]
}

export default function Dashboard({ applications }: DashboardProps) {
  const stats = useMemo(() => {
    const total = applications.length
    const applied = applications.filter((a) => a.status !== 'Wishlist').length
    const screening = applications.filter((a) => 
      ['Assessment', 'Interview', 'HR Round', 'Offer', 'Rejected'].includes(a.status)
    ).length
    const interviews = applications.filter((a) => 
      ['Interview', 'HR Round', 'Offer'].includes(a.status)
    ).length
    const offers = applications.filter((a) => a.status === 'Offer').length

    return {
      total,
      funnel: [
        { label: 'Applied', count: applied, color: 'bg-blue-500' },
        { label: 'Screen/Assessment', count: screening, color: 'bg-indigo-500' },
        { label: 'Interview', count: interviews, color: 'bg-teal-500' },
        { label: 'Offer', count: offers, color: 'bg-emerald-500' },
      ],
      statusCounts: STATUS_ORDER.map(status => ({
        status,
        count: applications.filter(a => a.status === status).length
      }))
    }
  }, [applications])

  if (applications.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No applications to analyze yet.
      </div>
    )
  }

  const maxFunnel = stats.funnel[0].count || 1

  return (
    <div className="animate-rise w-full min-w-0 flex flex-col gap-5 sm:gap-6">
      <section className="surface rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-display font-semibold mb-4 text-foreground sm:mb-6 sm:text-xl">Pipeline Funnel</h2>
        <div className="flex flex-col gap-4">
          {stats.funnel.map((step) => {
            const percentage = Math.round((step.count / maxFunnel) * 100) || 0
            return (
              <div key={step.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-foreground">{step.label}</span>
                  <span className="text-muted-foreground font-medium">{step.count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="surface rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-display font-semibold mb-4 text-foreground sm:mb-6 sm:text-xl">Status Breakdown</h2>
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
