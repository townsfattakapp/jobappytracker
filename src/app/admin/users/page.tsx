import Link from 'next/link'
import UserRolesEditor from '../../../components/admin/UserRolesEditor'
import { EmptyState, PageHeader, Pagination, Pill, formatDate, param } from '../../../components/admin/ui'
import { PLATFORM_ROLES } from '../../../lib/db/schema'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { listUsers } from '../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireAdminPage('admin', 'support')
  const sp = await searchParams
  const q = param(sp, 'q')
  const role = param(sp, 'role')
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const result = await listUsers({ q: q || undefined, role: role || undefined, page, pageSize: 25 })
  const canEdit = actor.roles.includes('admin')
  return (
    <>
      <PageHeader title="Users & roles" description="Learner accounts and who can reach this panel. Roles from the PLATFORM_ADMINS and CURRICULUM_ADMINS environment lists are not shown here and cannot be removed." />
      <form method="get" className="admin-filters" role="search" aria-label="Filter users">
        <input name="q" defaultValue={q} placeholder="Search email or name" className="input-field" aria-label="Search users" />
        <select name="role" defaultValue={role} className="input-field" aria-label="Role">
          <option value="">Any role</option>
          {PLATFORM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ghost btn-sm">
            Apply
          </button>
          {(q || role) && (
            <Link href="/admin/users" className="btn btn-link btn-sm">
              Clear
            </Link>
          )}
        </div>
      </form>
      {result.items.length === 0 ? (
        <EmptyState title="No users match" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Verified</th>
                <th>Pass</th>
                <th>Joined</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="font-semibold">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.name || '—'}</div>
                  </td>
                  <td>
                    <Pill tone={u.emailVerified ? 'good' : 'warn'}>{u.emailVerified ? 'Yes' : 'No'}</Pill>
                  </td>
                  <td>
                    <Pill tone={u.hasPass ? 'good' : 'neutral'}>{u.hasPass ? 'Active' : 'None'}</Pill>
                  </td>
                  <td className="whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td>
                    <UserRolesEditor userId={u.id} email={u.email} roles={u.roles} canEdit={canEdit} isSelf={u.id === actor.userId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/users" params={{ q, role }} />
    </>
  )
}
