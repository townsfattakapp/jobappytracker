import Link from 'next/link'
import { EmptyState, PageHeader, Pagination, formatDateTime, param } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { listDuplicates } from '../../../lib/server/ingestion'

export const dynamic = 'force-dynamic'

export default async function AdminDuplicatesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage('jobs_editor', 'support')
  const sp = await searchParams
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const result = await listDuplicates({ page, pageSize: 50 })
  return (
    <>
      <PageHeader title="Duplicates" description="Listings ingestion skipped because an existing job already carries the same fingerprint (company, normalised title, city and apply link). The kept job is linked." />
      {result.items.length === 0 ? (
        <EmptyState title="No duplicates recorded" description="When two sources return the same opening, the second one lands here." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Seen</th>
                <th>Skipped listing</th>
                <th>From source</th>
                <th>Kept job</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((d) => (
                <tr key={d.id}>
                  <td className="whitespace-nowrap">{formatDateTime(d.seenAt)}</td>
                  <td>
                    <div className="font-semibold">{d.title}</div>
                    <div className="text-xs text-muted-foreground break-all">
                      {d.externalId ? `#${d.externalId} · ` : ''}
                      {d.applyUrl}
                    </div>
                  </td>
                  <td>{d.sourceName || '—'}</td>
                  <td>
                    <Link href={`/admin/jobs/${d.jobId}`} className="admin-row-link">
                      {d.jobTitle}
                    </Link>
                    <div className="text-xs text-muted-foreground">{d.companyName}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/duplicates" params={{}} />
    </>
  )
}
