import PlansPanel from '../../../components/admin/PlansPanel'
import { PageHeader } from '../../../components/admin/ui'
import { db } from '../../../lib/db'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { listPlans } from '../../../lib/server/plans'

export const dynamic = 'force-dynamic'

export default async function AdminPlansPage() {
  const actor = await requireAdminPage('admin', 'support')
  const plans = await listPlans(db)
  return (
    <>
      <PageHeader title="Plans" description="Product tiers, prices, entitlements, usage limits and provider plan ids. Every gate in the product reads the learner's plan from here; plans are deactivated, never deleted. The seeded plans are development fixtures, not final pricing." />
      <PlansPanel plans={plans} canEdit={actor.roles.includes('admin')} />
    </>
  )
}
