import SettingsForm from '../../../components/admin/SettingsForm'
import { PageHeader } from '../../../components/admin/ui'
import { requireAdminPage } from '../../../lib/server/adminPage'
import { getFeatureFlags, getRoleFamilyConfig } from '../../../lib/server/settings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const actor = await requireAdminPage('admin', 'support')
  const [flags, roleFamilies] = await Promise.all([getFeatureFlags(), getRoleFamilyConfig()])
  return (
    <>
      <PageHeader title="Platform settings" description="Feature flags and role families. Plan entitlements and usage limits are managed under Plans. Changes apply immediately and are audited." />
      <SettingsForm flags={flags} roleFamilies={roleFamilies} canEdit={actor.roles.includes('admin')} />
    </>
  )
}
