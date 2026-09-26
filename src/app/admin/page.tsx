import Link from 'next/link'
import { PageHeader, Pill, StatCard, formatDateTime } from '../../components/admin/ui'
import { requireAdminPage } from '../../lib/server/adminPage'
import { listAudit } from '../../lib/server/audit'
import { adminMetrics } from '../../lib/server/jobs'
import { lifecycleCounts, providerHealth } from '../../lib/server/ingestion'
import { getFeatureFlags } from '../../lib/server/settings'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const actor = await requireAdminPage()
  const [metrics, flags, audit, lifecycle, providers] = await Promise.all([adminMetrics(), getFeatureFlags(), listAudit({ pageSize: 8 }), lifecycleCounts(), providerHealth()])
  const failing = providers.filter((p) => p.lastRunStatus === 'failed').length
  return (
    <>
      <PageHeader title="Overview" description={`Signed in as ${actor.email}. Numbers are live from the database.`} />

      <section aria-label="Learners" className="admin-section">
        <h2 className="admin-section-title">Learners</h2>
        <div className="admin-stat-grid">
          <StatCard label="Accounts" value={metrics.users.total} />
          <StatCard label="New in 7 days" value={metrics.users.last7Days} />
          <StatCard label="Active passes" value={metrics.users.withPass} />
          <StatCard label="Job preferences set" value={metrics.preferencesSet} />
        </div>
      </section>

      <section aria-label="Jobs" className="admin-section">
        <h2 className="admin-section-title">Jobs catalogue</h2>
        <div className="admin-stat-grid">
          <StatCard label="Published" value={metrics.jobs.published} tone="good" />
          <StatCard label="Drafts" value={metrics.jobs.draft} />
          <StatCard label="Expiring in 7 days" value={metrics.jobs.expiringSoon} tone={metrics.jobs.expiringSoon ? 'warn' : 'default'} />
          <StatCard label="Expired / archived" value={`${metrics.jobs.expired} / ${metrics.jobs.archived}`} />
          <StatCard label="Companies" value={metrics.companies} />
          <StatCard label="Job sources" value={metrics.sources} />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href="/admin/jobs/new" className="btn btn-primary btn-sm">
            Add a job
          </Link>
          <Link href="/admin/jobs?status=draft" className="btn btn-ghost btn-sm">
            Review drafts
          </Link>
          <Link href="/admin/companies" className="btn btn-ghost btn-sm">
            Manage companies
          </Link>
        </div>
      </section>

      <section aria-label="Ingestion" className="admin-section">
        <h2 className="admin-section-title">Ingestion</h2>
        <div className="admin-stat-grid">
          <StatCard label="Provider sources" value={providers.length} hint={`${providers.filter((p) => p.ingestionAllowed && p.status === 'active').length} allowed and active`} />
          <StatCard label="Failing sources" value={failing} tone={failing ? 'warn' : 'good'} />
          <StatCard label="Stale jobs" value={lifecycle.stale ?? 0} tone={lifecycle.stale ? 'warn' : 'default'} />
          <StatCard label="Expired jobs" value={lifecycle.expired ?? 0} />
        </div>
        <Link href="/admin/ingestion" className="btn btn-ghost btn-sm mt-4">
          Ingestion health
        </Link>
      </section>

      <section aria-label="Platform" className="admin-section">
        <h2 className="admin-section-title">Platform</h2>
        <div className="admin-card">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Job discovery module</span>
            <Pill tone={flags.jobsModule ? 'good' : 'warn'}>{flags.jobsModule ? 'On' : 'Off'}</Pill>
            <span className="text-sm">Admin panel</span>
            <Pill tone={flags.adminPanel ? 'good' : 'warn'}>{flags.adminPanel ? 'On' : 'Off'}</Pill>
            <Link href="/admin/settings" className="btn btn-ghost btn-sm ml-auto">
              Change
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Recent activity" className="admin-section">
        <h2 className="admin-section-title">Recent admin activity</h2>
        {audit.items.length === 0 ? (
          <div className="admin-card text-sm text-muted-foreground">No admin changes recorded yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Action</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {audit.items.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap">{formatDateTime(entry.createdAt)}</td>
                    <td>{entry.actor?.email ?? 'system'}</td>
                    <td>
                      <code className="admin-code">{entry.action}</code>
                    </td>
                    <td className="text-muted-foreground">
                      {entry.entityType}
                      {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link href="/admin/audit" className="btn btn-link btn-sm mt-2">
          Full audit log
        </Link>
      </section>
    </>
  )
}
