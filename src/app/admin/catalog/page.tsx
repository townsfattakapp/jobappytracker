import CatalogPanel from '../../../components/admin/CatalogPanel'
import { PageHeader, StatCard } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { catalogStatus } from '../../../lib/server/catalog'

export const dynamic = 'force-dynamic'

export default async function AdminCatalogPage() {
  const actor = await requireAdminPage('admin', 'jobs_editor', 'support')
  const status = await catalogStatus()
  return (
    <>
      <PageHeader title="Company source catalog" description="Curated product and technology companies relevant to Indian software, data, AI and cloud careers, with the official careers page for each. Only companies with a public, documented job-board feed (Greenhouse, Lever, Ashby) that answered a read-only identity check are configured for ingestion; everything else is Unsupported and keeps its careers link. Nothing is scraped." />
      <div className="admin-stat-grid mb-6">
        <StatCard label="Companies in catalog" value={status.total} hint={`${status.seeded} seeded into the database`} />
        <StatCard label="Healthy" value={status.counts.Healthy} tone={status.counts.Healthy ? 'good' : 'default'} hint="last ingestion run succeeded" />
        <StatCard label="Configured" value={status.counts.Configured} hint="verified feed, not run yet" />
        <StatCard label="Degraded" value={status.counts.Degraded} tone={status.counts.Degraded ? 'warn' : 'default'} hint="feed or last run failed" />
        <StatCard label="Unsupported / not configured" value={status.counts.Unsupported + status.counts['Not configured']} hint="official careers link only" />
      </div>
      <CatalogPanel initial={status} canEdit={actor.roles.includes('admin') || actor.roles.includes('jobs_editor')} />
    </>
  )
}
