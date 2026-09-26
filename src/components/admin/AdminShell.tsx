'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import BrandLogo from '../BrandLogo'
import type { PlatformRole } from '../../lib/db/schema'

interface ShellActor {
  email: string
  name: string
  roles: PlatformRole[]
}

const NAV: { href: string; label: string; roles: PlatformRole[] }[] = [
  { href: '/admin', label: 'Overview', roles: ['admin', 'content_editor', 'jobs_editor', 'support'] },
  { href: '/admin/jobs', label: 'Jobs', roles: ['admin', 'jobs_editor', 'support'] },
  { href: '/admin/companies', label: 'Companies', roles: ['admin', 'jobs_editor', 'support'] },
  { href: '/admin/sources', label: 'Job sources', roles: ['admin', 'jobs_editor', 'support'] },
  { href: '/admin/catalog', label: 'Company catalog', roles: ['admin', 'jobs_editor', 'support'] },
  { href: '/admin/ingestion', label: 'Ingestion', roles: ['admin', 'jobs_editor', 'support'] },
  { href: '/admin/duplicates', label: 'Duplicates', roles: ['admin', 'jobs_editor', 'support'] },
  { href: '/admin/users', label: 'Users & roles', roles: ['admin', 'support'] },
  { href: '/admin/plans', label: 'Plans', roles: ['admin', 'support'] },
  { href: '/admin/subscriptions', label: 'Subscriptions', roles: ['admin', 'support'] },
  { href: '/admin/billing', label: 'Billing status', roles: ['admin', 'support'] },
  { href: '/admin/ai', label: 'AI configuration', roles: ['admin', 'support'] },
  { href: '/admin/launch', label: 'Launch readiness', roles: ['admin', 'support'] },
  { href: '/admin/settings', label: 'Platform settings', roles: ['admin', 'support'] },
  { href: '/admin/audit', label: 'Audit log', roles: ['admin', 'support'] },
]

function canSee(actor: ShellActor, roles: PlatformRole[]) {
  return actor.roles.includes('admin') || roles.some((r) => actor.roles.includes(r))
}

export default function AdminShell({ actor, children }: { actor: ShellActor; children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const items = NAV.filter((n) => canSee(actor, n.roles))
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  const nav = (
    <nav aria-label="Admin sections" className="admin-nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`admin-nav-link${isActive(item.href) ? ' is-active' : ''}`} onClick={() => setOpen(false)}>
          {item.label}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="admin-root bg-background text-foreground">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <BrandLogo size={30} />
          <span className="admin-brand-tag">Admin</span>
        </div>
        {nav}
        <div className="admin-account">
          <div className="admin-account-email" title={actor.email}>
            {actor.email}
          </div>
          <div className="admin-account-roles">{actor.roles.join(', ') || 'no roles'}</div>
          <Link href="/app" className="btn btn-ghost btn-sm mt-3 w-full">
            Back to Prep
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="btn btn-ghost btn-sm md:hidden" aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen((o) => !o)}>
            Menu
          </button>
          <div className="admin-topbar-title">Admin control center</div>
          <Link href="/app" className="btn btn-ghost btn-sm md:hidden">
            Prep
          </Link>
        </header>
        {open && (
          <div id="admin-mobile-nav" className="admin-mobile-nav md:hidden">
            {nav}
          </div>
        )}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
