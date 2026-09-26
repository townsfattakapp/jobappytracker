import Link from 'next/link'
import type { ReactNode } from 'react'

/** Small presentational building blocks shared by the admin pages (server-safe). */

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="admin-page-header">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {description && <p className="admin-page-description">{description}</p>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'default' | 'warn' | 'good' }) {
  return (
    <div className={`admin-stat${tone === 'warn' ? ' is-warn' : tone === 'good' ? ' is-good' : ''}`}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {hint && <div className="admin-stat-hint">{hint}</div>}
    </div>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
  return <span className={`admin-pill admin-pill-${tone}`}>{children}</span>
}

export function statusTone(status: string): 'neutral' | 'good' | 'warn' | 'bad' | 'info' {
  switch (status) {
    case 'published':
    case 'active':
      return 'good'
    case 'draft':
    case 'paused':
      return 'info'
    case 'expired':
      return 'warn'
    case 'archived':
    case 'hidden':
      return 'bad'
    default:
      return 'neutral'
  }
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-title">{title}</div>
      {description && <p className="admin-empty-description">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Query-string pagination that keeps the other filters. */
export function Pagination({ page, pageSize, total, basePath, params }: { page: number; pageSize: number; total: number; basePath: string; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const href = (p: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
    q.set('page', String(p))
    return `${basePath}?${q.toString()}`
  }
  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <span className="admin-pagination-info">
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="btn btn-ghost btn-sm">
            Previous
          </Link>
        ) : (
          <span className="btn btn-ghost btn-sm" aria-disabled="true">
            Previous
          </span>
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className="btn btn-ghost btn-sm">
            Next
          </Link>
        ) : (
          <span className="btn btn-ghost btn-sm" aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')

/** Deterministic (locale-independent) so server and client render the same text. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Reads ?key=value search params (App Router passes them as a promise). */
export function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key]
  return Array.isArray(v) ? v[0] || '' : v || ''
}
