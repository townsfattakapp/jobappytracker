import Link from 'next/link'
import { EmptyState, PageHeader, Pagination, formatDateTime, param } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { listAudit } from '../../../lib/server/audit'

export const dynamic = 'force-dynamic'

const ENTITY_TYPES = ['job', 'company', 'job_source', 'user', 'platform_settings']

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage('admin', 'support')
  const sp = await searchParams
  const entityType = param(sp, 'entityType')
  const entityId = param(sp, 'entityId')
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const result = await listAudit({ entityType: entityType || undefined, entityId: entityId || undefined, page, pageSize: 50 })
  return (
    <>
      <PageHeader title="Audit log" description="Every admin change with the state before and after. Nothing here can be edited." />
      <form method="get" className="admin-filters" aria-label="Filter audit log">
        <select name="entityType" defaultValue={entityType} className="input-field" aria-label="Entity type">
          <option value="">All entities</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input name="entityId" defaultValue={entityId} placeholder="Entity id" className="input-field" aria-label="Entity id" />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ghost btn-sm">
            Apply
          </button>
          {(entityType || entityId) && (
            <Link href="/admin/audit" className="btn btn-link btn-sm">
              Clear
            </Link>
          )}
        </div>
      </form>
      {result.items.length === 0 ? (
        <EmptyState title="No audit entries" description="Changes made through the admin panel will show up here." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap">{formatDateTime(entry.createdAt)}</td>
                  <td>{entry.actor?.email ?? 'system'}</td>
                  <td>
                    <code className="admin-code">{entry.action}</code>
                  </td>
                  <td className="text-muted-foreground">
                    {entry.entityType}
                    {entry.entityId ? ` · ${entry.entityId}` : ''}
                  </td>
                  <td>
                    <details>
                      <summary className="cursor-pointer text-sm">Before / after</summary>
                      <pre className="admin-pre">{JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/audit" params={{ entityType, entityId }} />
    </>
  )
}
