import { PageHeader, Pill } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { launchHealth, type HealthStatus } from '../../../lib/server/health'

export const dynamic = 'force-dynamic'

const TONE: Record<HealthStatus, 'good' | 'warn' | 'neutral' | 'info'> = { healthy: 'good', degraded: 'warn', not_configured: 'neutral', unknown: 'info' }
const LABEL: Record<HealthStatus, string> = { healthy: 'Healthy', degraded: 'Degraded', not_configured: 'Not configured', unknown: 'Unknown' }

export default async function LaunchReadinessPage() {
  await requireAdminPage('admin', 'support')
  const checks = await launchHealth()
  return (
    <>
      <PageHeader title="Launch readiness" description="Factual system health from live checks. Nothing here is assumed; a status is Unknown when the check could not run or has no data." />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Status</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold whitespace-nowrap">{c.label}</td>
                <td>
                  <Pill tone={TONE[c.status]}>{LABEL[c.status]}</Pill>
                </td>
                <td>{c.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="admin-help mt-4">The written readiness report with READY / BLOCKED / NOT CONFIGURED / NOT TESTED / REQUIRES MANUAL ACTION items is in docs/launch-readiness.md.</p>
    </>
  )
}
