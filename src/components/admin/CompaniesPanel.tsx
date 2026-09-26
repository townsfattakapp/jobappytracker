'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/adminClient'
import { parseCompanyInput, ValidationError } from '../../lib/jobs/normalize'
import type { CompanyDto } from '../../lib/jobs/types'
import { EmptyState, Pill, formatDate, statusTone } from './ui'

type Row = CompanyDto & { jobCount: number }

type Draft = { name: string; slug: string; website: string; careersUrl: string; logoUrl: string; headquarters: string; industry: string; size: string; description: string; status: string }

const empty: Draft = { name: '', slug: '', website: '', careersUrl: '', logoUrl: '', headquarters: '', industry: '', size: '', description: '', status: 'active' }

const fromRow = (c: CompanyDto): Draft => ({
  name: c.name,
  slug: c.slug,
  website: c.website ?? '',
  careersUrl: c.careersUrl ?? '',
  logoUrl: c.logoUrl ?? '',
  headquarters: c.headquarters ?? '',
  industry: c.industry ?? '',
  size: c.size ?? '',
  description: c.description ?? '',
  status: c.status,
})

export default function CompaniesPanel({ items, canEdit, canDelete }: { items: Row[]; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const open = (row?: Row) => {
    setError(null)
    setNotice(null)
    setEditing({ id: row?.id ?? null, draft: row ? fromRow(row) : empty })
  }
  const close = () => setEditing(null)
  const set = (key: keyof Draft, value: string) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setError(null)
    let body
    try {
      body = parseCompanyInput(editing.draft)
    } catch (err) {
      if (err instanceof ValidationError) return setError({ message: err.message, field: err.field ?? null })
      throw err
    }
    setBusy(true)
    try {
      if (editing.id) await api(`/api/admin/companies/${editing.id}`, { method: 'PUT', json: body })
      else await api('/api/admin/companies', { method: 'POST', json: body })
      setNotice(editing.id ? 'Company updated' : `Added ${body.name}`)
      setEditing(null)
      router.refresh()
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Save failed', field: err instanceof ApiError ? err.field : null })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete ${row.name}? Only possible when it has no jobs.`)) return
    setError(null)
    try {
      await api(`/api/admin/companies/${row.id}`, { method: 'DELETE' })
      setNotice(`Deleted ${row.name}`)
      router.refresh()
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Delete failed', field: null })
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {canEdit && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => open()}>
            Add company
          </button>
        )}
        {notice && (
          <span className="text-sm text-muted-foreground" role="status">
            {notice}
          </span>
        )}
      </div>
      {error && !editing && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error.message}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No companies yet" description="Add the employers whose openings you want to publish." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Careers page</th>
                <th>HQ</th>
                <th>Jobs</th>
                <th>Status</th>
                <th>Updated</th>
                {canEdit && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="font-semibold">{row.name}</div>
                    <div className="text-xs text-muted-foreground">{row.slug}</div>
                  </td>
                  <td>
                    {row.careersUrl ? (
                      <a href={row.careersUrl} target="_blank" rel="noreferrer noopener" className="admin-row-link">
                        {new URL(row.careersUrl).hostname}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{row.headquarters || '—'}</td>
                  <td>{row.jobCount}</td>
                  <td>
                    <Pill tone={statusTone(row.status)}>{row.status}</Pill>
                  </td>
                  <td className="whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                  {canEdit && (
                    <td className="text-right whitespace-nowrap">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => open(row)} aria-label={`Edit ${row.name}`}>
                        Edit
                      </button>
                      {canDelete && row.jobCount === 0 && (
                        <button type="button" className="btn btn-link btn-sm text-destructive" onClick={() => remove(row)} aria-label={`Delete ${row.name}`}>
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="company-dialog-title">
          <form onSubmit={submit} className="admin-modal" noValidate>
            <h2 id="company-dialog-title" className="admin-modal-title">
              {editing.id ? 'Edit company' : 'Add company'}
            </h2>
            {error && (
              <div className="admin-alert admin-alert-error" role="alert">
                {error.message}
              </div>
            )}
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Name</span>
                <input className="input-field" value={editing.draft.name} onChange={(e) => set('name', e.target.value)} required aria-invalid={error?.field === 'name' ? 'true' : undefined} />
              </label>
              <label className="admin-field">
                <span>Slug (auto from name)</span>
                <input className="input-field" value={editing.draft.slug} onChange={(e) => set('slug', e.target.value)} placeholder="acme" aria-invalid={error?.field === 'slug' ? 'true' : undefined} />
              </label>
            </div>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Website</span>
                <input className="input-field" value={editing.draft.website} onChange={(e) => set('website', e.target.value)} placeholder="https://acme.com" aria-invalid={error?.field === 'Website' ? 'true' : undefined} />
              </label>
              <label className="admin-field">
                <span>Careers page</span>
                <input className="input-field" value={editing.draft.careersUrl} onChange={(e) => set('careersUrl', e.target.value)} placeholder="https://acme.com/careers" aria-invalid={error?.field === 'Careers URL' ? 'true' : undefined} />
              </label>
            </div>
            <div className="admin-grid-3">
              <label className="admin-field">
                <span>Headquarters</span>
                <input className="input-field" value={editing.draft.headquarters} onChange={(e) => set('headquarters', e.target.value)} placeholder="Hyderabad, India" />
              </label>
              <label className="admin-field">
                <span>Industry</span>
                <input className="input-field" value={editing.draft.industry} onChange={(e) => set('industry', e.target.value)} />
              </label>
              <label className="admin-field">
                <span>Size</span>
                <input className="input-field" value={editing.draft.size} onChange={(e) => set('size', e.target.value)} placeholder="1,000–5,000" />
              </label>
            </div>
            <label className="admin-field">
              <span>Logo URL</span>
              <input className="input-field" value={editing.draft.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Description</span>
              <textarea className="input-field" rows={3} value={editing.draft.description} onChange={(e) => set('description', e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select className="input-field" value={editing.draft.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <div className="admin-form-footer">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Saving…' : editing.id ? 'Save changes' : 'Add company'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={close}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
