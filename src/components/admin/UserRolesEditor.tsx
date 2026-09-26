'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PLATFORM_ROLES, type PlatformRole } from '../../lib/db/schema'
import { api } from '../../lib/adminClient'
import { Pill } from './ui'

export default function UserRolesEditor({ userId, email, roles, canEdit, isSelf }: { userId: string; email: string; roles: PlatformRole[]; canEdit: boolean; isSelf: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<PlatformRole[]>(roles)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canEdit) return <>{roles.length ? roles.map((r) => <Pill key={r} tone="info">{r}</Pill>) : <span className="text-muted-foreground text-sm">learner</span>}</>

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await api(`/api/admin/users/${userId}/roles`, { method: 'PUT', json: { roles: draft } })
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save roles')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {roles.length ? roles.map((r) => <Pill key={r} tone="info">{r}</Pill>) : <span className="text-muted-foreground text-sm">learner</span>}
      <button type="button" className="btn btn-link btn-sm" onClick={() => { setDraft(roles); setError(null); setOpen(true) }} aria-label={`Edit roles for ${email}`}>
        Edit
      </button>
      {open && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby={`roles-${userId}`}>
          <div className="admin-modal">
            <h2 id={`roles-${userId}`} className="admin-modal-title">
              Roles for {email}
            </h2>
            {isSelf && <p className="admin-help">You cannot remove your own admin role.</p>}
            {error && (
              <div className="admin-alert admin-alert-error" role="alert">
                {error}
              </div>
            )}
            <div className="admin-check-grid">
              {PLATFORM_ROLES.map((r) => (
                <label key={r} className="admin-check">
                  <input type="checkbox" checked={draft.includes(r)} disabled={isSelf && r === 'admin'} onChange={(e) => setDraft((d) => (e.target.checked ? [...d, r] : d.filter((x) => x !== r)))} />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <div className="admin-form-footer">
              <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
                {busy ? 'Saving…' : 'Save roles'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
