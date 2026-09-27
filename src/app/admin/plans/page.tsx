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
      <PageHeader title="Plans" description="What the free plan includes and what a pass unlocks: features, usage limits and provider plan ids. Every gate in the product reads the learner's plan from here; a paid pass maps to the Prep Pro tier. The passes learners buy (90 days ₹299, 180 days ₹599, 1 year ₹999) are defined in src/lib/billing/plan.ts and shown on the home page, /pricing and the paywall; the prices here mirror them for reference. Plans are deactivated, never deleted." />
      <PlansPanel plans={plans} canEdit={actor.roles.includes('admin')} />
    </>
  )
}
