import Link from 'next/link'
import { desc, eq, sql } from 'drizzle-orm'
import { EmptyState, PageHeader, Pagination, Pill, formatDateTime, param } from '../../../components/admin/ui'
import { db } from '../../../lib/db'
import { billingSubscriptions, SUBSCRIPTION_STATUSES, users } from '../../../lib/db/schema'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { toDto } from '../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage('admin', 'support')
  const sp = await searchParams
  const status = param(sp, 'status')
  const page = Math.max(1, Number(param(sp, 'page')) || 1)
  const pageSize = 25
  const where = status ? eq(billingSubscriptions.status, status as (typeof SUBSCRIPTION_STATUSES)[number]) : undefined
  const rows = await db.select({ sub: billingSubscriptions, email: users.email }).from(billingSubscriptions).innerJoin(users, eq(users.id, billingSubscriptions.userId)).where(where).orderBy(desc(billingSubscriptions.updatedAt)).limit(pageSize).offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(billingSubscriptions).where(where)
  const byStatus = await db.select({ status: billingSubscriptions.status, count: sql<number>`count(*)::int` }).from(billingSubscriptions).groupBy(billingSubscriptions.status)
  return (
    <>
      <PageHeader title="Subscriptions" description="Read-only view of subscription state as verified by provider webhooks. There are no payment mutation controls by design; refunds and forced changes happen in the provider dashboard and arrive here as events." />
      <div className="flex flex-wrap gap-2 mb-4">
        {byStatus.map((b) => (
          <Link key={b.status} href={`/admin/subscriptions?status=${b.status}`} className="job-chip">
            {b.status}: {b.count}
          </Link>
        ))}
        {status && (
          <Link href="/admin/subscriptions" className="btn btn-link btn-sm">
            Clear
          </Link>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No subscriptions" description="Subscriptions appear here once a learner completes checkout." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Cycle</th>
                <th>Period end</th>
                <th>Provider</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ sub, email }) => {
                const d = toDto(sub)
                return (
                  <tr key={sub.id}>
                    <td>{email}</td>
                    <td>{d.planId}</td>
                    <td>
                      <Pill tone={d.grantsAccess ? 'good' : d.status === 'pending' ? 'info' : 'bad'}>{d.status}</Pill>
                      {d.lastPaymentError && <div className="text-xs text-destructive">{d.lastPaymentError}</div>}
                    </td>
                    <td>{d.interval}</td>
                    <td className="whitespace-nowrap">{formatDateTime(d.currentPeriodEnd)}</td>
                    <td>
                      {d.provider}
                      <div className="text-xs text-muted-foreground">{sub.providerSubscriptionId}</div>
                    </td>
                    <td className="whitespace-nowrap">{formatDateTime(d.updatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={count} basePath="/admin/subscriptions" params={{ status }} />
    </>
  )
}
