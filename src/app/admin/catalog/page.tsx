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
      <PageHeader title="Company source catalog" description="Curated product and technology companies relevant to Indian software, data, AI and cloud careers, with the official careers page for each. Ingestion is configured only where a read-only identity check answered: a public, documented job-board feed (Greenhouse, Lever, Ashby) or the JSON endpoint the company's own careers site calls (Amazon Jobs, Eightfold sites such as Microsoft and Netflix, Workday tenants such as Adobe, NVIDIA, Salesforce, PayPal, Autodesk, Mastercard). Those site endpoints are unofficial and can change without notice; a change shows up here as a failed run. Everything else (Google, Meta, Apple) is Unsupported and keeps its careers link. No HTML is scraped." />
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
