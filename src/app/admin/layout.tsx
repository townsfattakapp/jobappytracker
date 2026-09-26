import type { Metadata } from 'next'
import AdminShell from '../../components/admin/AdminShell'
import { requireAdminPage } from '../../lib/server/adminPage'

export const metadata: Metadata = {
  title: 'Admin · Prep by EVOLW',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireAdminPage()
  return (
    <AdminShell actor={{ email: actor.email, name: actor.name, roles: actor.roles }}>
      {children}
    </AdminShell>
  )
}
