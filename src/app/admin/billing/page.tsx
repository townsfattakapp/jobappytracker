import { PageHeader, Pill, StatCard, formatDateTime } from '../../../components/admin/ui'
import { db } from '../../../lib/db'
import { activeProvider } from '../../../lib/billing/providers'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { webhookHealth } from '../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

export default async function AdminBillingPage() {
  await requireAdminPage('admin', 'support')
  const health = await webhookHealth(db)
  const provider = activeProvider()
  return (
    <>
      <PageHeader title="Billing status" description="Provider configuration and webhook event health. Every delivery is recorded before it is applied; duplicates are detected by the provider's event id." />
      <div className="admin-stat-grid mb-6">
        <StatCard label="Active provider" value={provider ? provider.id : 'none'} tone={provider?.id === 'razorpay' ? 'good' : 'warn'} hint={provider?.id === 'fixture' ? 'test mode, no real charges' : provider ? '' : 'RAZORPAY keys missing'} />
        <StatCard label="Processed (7 d)" value={health.counts.processed ?? 0} tone="good" />
        <StatCard label="Duplicates (7 d)" value={health.counts.duplicate ?? 0} />
        <StatCard label="Failed / rejected (7 d)" value={(health.counts.failed ?? 0) + (health.counts.rejected ?? 0)} tone={(health.counts.failed ?? 0) + (health.counts.rejected ?? 0) ? 'warn' : 'default'} />
      </div>
      <p className="admin-help mb-4">Last webhook received: {health.lastReceivedAt ? formatDateTime(health.lastReceivedAt) : 'never'}.</p>
      <h2 className="admin-section-title">Failed billing events</h2>
      {health.failed.length === 0 ? (
        <div className="admin-card text-sm text-muted-foreground">No failed or rejected webhook deliveries recorded.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Provider</th>
                <th>Event</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {health.failed.map((f) => (
                <tr key={f.id}>
                  <td className="whitespace-nowrap">{formatDateTime(f.receivedAt)}</td>
                  <td>{f.provider}</td>
                  <td>
                    {f.eventType}
                    <div className="text-xs text-muted-foreground">{f.eventId}</div>
                  </td>
                  <td>
                    <Pill tone="bad">{f.status}</Pill>
                  </td>
                  <td className="text-xs">{f.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
