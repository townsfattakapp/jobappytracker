import Link from 'next/link'
import IngestionPanel from '../../../components/admin/IngestionPanel'
import { PageHeader, StatCard } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { lifecycleCounts, listIngestionRuns, providerHealth } from '../../../lib/server/ingestion'

export const dynamic = 'force-dynamic'

export default async function AdminIngestionPage() {
  const actor = await requireAdminPage('jobs_editor', 'support')
  const [providers, runs, lifecycle] = await Promise.all([providerHealth(), listIngestionRuns({ limit: 40 }), lifecycleCounts()])
  const canRun = actor.roles.includes('admin') || actor.roles.includes('jobs_editor')
  return (
    <>
      <PageHeader
        title="Ingestion"
        description="Provider sources, their last runs and the job lifecycle. Runs only fetch from sources you marked as allowed; nothing is scraped."
        actions={
          <Link href="/admin/sources" className="btn btn-ghost btn-sm">
            Manage sources
          </Link>
        }
      />
      <section className="admin-section" aria-label="Lifecycle">
        <h2 className="admin-section-title">Job lifecycle</h2>
        <div className="admin-stat-grid">
          <StatCard label="Discovered" value={lifecycle.discovered ?? 0} hint="Ingested, not yet seen twice" />
          <StatCard label="Active / verified" value={(lifecycle.active ?? 0) + (lifecycle.verified ?? 0)} tone="good" />
          <StatCard label="Stale" value={lifecycle.stale ?? 0} tone={lifecycle.stale ? 'warn' : 'default'} hint="Not seen recently; still visible with a warning" />
          <StatCard label="Expired" value={lifecycle.expired ?? 0} hint="Hidden from learners" />
        </div>
      </section>
      <IngestionPanel providers={providers} runs={runs} canRun={canRun} />
    </>
  )
}
