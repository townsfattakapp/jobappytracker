import ReferralsPanel from '../../../components/admin/ReferralsPanel'
import { PageHeader } from '../../../components/admin/ui'
import { db } from '../../../lib/db'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { allActiveCompanies } from '../../../lib/server/jobs'
import { referralDeps } from '../../../lib/server/referralDeps'
import { adminListInvites, adminListDisclosures, adminListReferrers, adminListRequests, companyCoverage, getReferralSettings, referralMetrics } from '../../../lib/server/referrals'

export const dynamic = 'force-dynamic'

export default async function AdminReferralsPage() {
  const actor = await requireAdminPage('admin', 'support')
  const deps = referralDeps()
  const [metrics, requests, referrers, coverage, disclosures, settings, companies, invites] = await Promise.all([referralMetrics(deps), adminListRequests(deps), adminListReferrers(deps), companyCoverage(deps), adminListDisclosures(deps), getReferralSettings(db), allActiveCompanies(), adminListInvites(deps)])
  return (
    <>
      <PageHeader title="Referral network" description="Verified referrers, requests, company coverage and policy, identity disclosures and the beta settings. Coverage is real only where a verified referrer with capacity exists; unknown policies stay unknown." />
      <ReferralsPanel initial={{ metrics, requests, referrers, coverage, disclosures, settings, invites }} companies={companies} canEdit={actor.roles.includes('admin')} />
    </>
  )
}
