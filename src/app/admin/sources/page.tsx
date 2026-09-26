import Link from 'next/link'
import SourcesPanel from '../../../components/admin/SourcesPanel'
import { PageHeader, Pagination, param } from '../../../components/admin/ui'
import { selectableProviders } from '../../../lib/ingestion/providers'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { allActiveCompanies, listSources } from '../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export default async function AdminSourcesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireAdminPage('jobs_editor', 'support')
  const sp = await searchParams
  const q = param(sp, 'q')
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const [result, companies] = await Promise.all([listSources({ q: q || undefined, page, pageSize: 25 }), allActiveCompanies()])
  return (
    <>
      <PageHeader
        title="Job sources"
        description="Where listings come from. Automated ingestion only runs for provider sources you have checked and marked as allowed; manual sources are provenance records for jobs the team adds."
        actions={
          <Link href="/admin/ingestion" className="btn btn-ghost btn-sm">
            Ingestion health
          </Link>
        }
      />
      <form method="get" className="admin-filters" role="search" aria-label="Filter sources">
        <input name="q" defaultValue={q} placeholder="Search name or slug" className="input-field" aria-label="Search sources" />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ghost btn-sm">
            Apply
          </button>
          {q && (
            <Link href="/admin/sources" className="btn btn-link btn-sm">
              Clear
            </Link>
          )}
        </div>
      </form>
      <SourcesPanel items={result.items} companies={companies} providers={selectableProviders()} canDelete={actor.roles.includes('admin')} canEdit={actor.roles.includes('admin') || actor.roles.includes('jobs_editor')} />
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/sources" params={{ q }} />
    </>
  )
}
