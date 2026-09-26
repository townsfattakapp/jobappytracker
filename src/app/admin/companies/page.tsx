import Link from 'next/link'
import CompaniesPanel from '../../../components/admin/CompaniesPanel'
import { PageHeader, Pagination, param } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { listCompanies } from '../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export default async function AdminCompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireAdminPage('jobs_editor', 'support')
  const sp = await searchParams
  const q = param(sp, 'q')
  const status = param(sp, 'status')
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const result = await listCompanies({ q: q || undefined, status: status || undefined, page, pageSize: 25 })
  return (
    <>
      <PageHeader title="Companies" description="Employers whose openings appear in job discovery. Hidden companies keep their jobs but learners cannot see them." />
      <form method="get" className="admin-filters" role="search" aria-label="Filter companies">
        <input name="q" defaultValue={q} placeholder="Search name or slug" className="input-field" aria-label="Search companies" />
        <select name="status" defaultValue={status} className="input-field" aria-label="Status">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ghost btn-sm">
            Apply
          </button>
          {(q || status) && (
            <Link href="/admin/companies" className="btn btn-link btn-sm">
              Clear
            </Link>
          )}
        </div>
      </form>
      <CompaniesPanel items={result.items} canDelete={actor.roles.includes('admin')} canEdit={actor.roles.includes('admin') || actor.roles.includes('jobs_editor')} />
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/companies" params={{ q, status }} />
    </>
  )
}
