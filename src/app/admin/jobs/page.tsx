import Link from 'next/link'
import { EmptyState, PageHeader, Pagination, Pill, formatDate, param, statusTone } from '../../../components/admin/ui'
import SweepExpiredButton from '../../../components/admin/SweepExpiredButton'
import { JOB_STATUSES, REGIONS, ROLE_CATEGORIES, WORK_MODES, labelOf } from '../../../lib/jobs/taxonomy'
import type { JobListFilters } from '../../../lib/jobs/types'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { allActiveCompanies, listJobsAdmin } from '../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage('jobs_editor', 'support')
  const sp = await searchParams
  const filters = {
    q: param(sp, 'q'),
    status: param(sp, 'status'),
    roleCategory: param(sp, 'roleCategory'),
    region: param(sp, 'region'),
    workMode: param(sp, 'workMode'),
    companyId: param(sp, 'companyId'),
    lifecycle: param(sp, 'lifecycle'),
    sourceId: param(sp, 'sourceId'),
  }
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const [result, companies] = await Promise.all([
    listJobsAdmin({ ...filters, region: filters.region as JobListFilters['region'], workMode: filters.workMode as JobListFilters['workMode'], page, pageSize: 25 }),
    allActiveCompanies(),
  ])
  const anyFilter = Object.values(filters).some(Boolean)

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Every listing the platform knows about. Learners only see published jobs that have not expired."
        actions={
          <>
            <SweepExpiredButton />
            <Link href="/admin/jobs/new" className="btn btn-primary btn-sm">
              Add a job
            </Link>
          </>
        }
      />

      <form method="get" className="admin-filters" role="search" aria-label="Filter jobs">
        <input name="q" defaultValue={filters.q} placeholder="Search title, company, city, skill" className="input-field" aria-label="Search" />
        <select name="status" defaultValue={filters.status} className="input-field" aria-label="Status">
          <option value="">All statuses</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="roleCategory" defaultValue={filters.roleCategory} className="input-field" aria-label="Role category">
          <option value="">All roles</option>
          {ROLE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select name="region" defaultValue={filters.region} className="input-field" aria-label="Region">
          <option value="">Any region</option>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <select name="workMode" defaultValue={filters.workMode} className="input-field" aria-label="Work mode">
          <option value="">Any work mode</option>
          {WORK_MODES.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
        <select name="lifecycle" defaultValue={filters.lifecycle} className="input-field" aria-label="Lifecycle">
          <option value="">Any lifecycle</option>
          {['discovered', 'active', 'verified', 'stale', 'expired'].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {filters.sourceId && <input type="hidden" name="sourceId" value={filters.sourceId} />}
        <select name="companyId" defaultValue={filters.companyId} className="input-field" aria-label="Company">
          <option value="">Any company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ghost btn-sm">
            Apply
          </button>
          {anyFilter && (
            <Link href="/admin/jobs" className="btn btn-link btn-sm">
              Clear
            </Link>
          )}
        </div>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title={anyFilter ? 'No jobs match these filters' : 'No jobs yet'}
          description={anyFilter ? 'Try clearing a filter.' : 'Add a company first, then create the first listing.'}
          action={
            !anyFilter && (
              <Link href="/admin/jobs/new" className="btn btn-primary btn-sm">
                Add a job
              </Link>
            )
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Lifecycle</th>
                <th>Posted</th>
                <th>Expires</th>
                <th>Last seen / verified</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link href={`/admin/jobs/${job.id}`} className="admin-row-link">
                      {job.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">{labelOf(WORK_MODES, job.workMode)} · {job.level}</div>
                  </td>
                  <td>{job.company.name}</td>
                  <td>{labelOf(ROLE_CATEGORIES, job.roleCategory)}</td>
                  <td>
                    {[job.locationCity, job.locationCountry].filter(Boolean).join(', ') || '—'}
                    <div className="text-xs text-muted-foreground">{labelOf(REGIONS, job.region)}</div>
                  </td>
                  <td>
                    <Pill tone={statusTone(job.status)}>{job.status}</Pill>
                  </td>
                  <td>
                    <Pill tone={job.lifecycle === 'stale' ? 'warn' : job.lifecycle === 'expired' ? 'bad' : job.lifecycle === 'discovered' ? 'info' : 'good'}>{job.lifecycle}</Pill>
                    {job.source && <div className="text-xs text-muted-foreground">{job.source.name}</div>}
                  </td>
                  <td className="whitespace-nowrap">{formatDate(job.postedAt)}</td>
                  <td className="whitespace-nowrap">{formatDate(job.expiresAt)}</td>
                  <td className="whitespace-nowrap">{formatDate(job.lastSeenAt || job.lastVerifiedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/jobs" params={filters} />
    </>
  )
}
