'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/adminClient'
import { parseSourceInput, ValidationError } from '../../lib/jobs/normalize'
import { SOURCE_TYPES, labelOf } from '../../lib/jobs/taxonomy'
import type { CompanyDto, JobSourceDto } from '../../lib/jobs/types'
import { EmptyState, Pill, formatDate, formatDateTime, statusTone } from './ui'

type Row = JobSourceDto & { jobCount: number }
type Draft = { name: string; slug: string; type: string; baseUrl: string; termsUrl: string; ingestionAllowed: boolean; notes: string; status: string; provider: string; config: string; companyId: string; autoPublish: boolean }

const empty: Draft = { name: '', slug: '', type: 'manual', baseUrl: '', termsUrl: '', ingestionAllowed: false, notes: '', status: 'active', provider: 'manual', config: '', companyId: '', autoPublish: false }
const fromRow = (s: JobSourceDto): Draft => ({
  name: s.name,
  slug: s.slug,
  type: s.type,
  baseUrl: s.baseUrl ?? '',
  termsUrl: s.termsUrl ?? '',
  ingestionAllowed: s.ingestionAllowed,
  notes: s.notes ?? '',
  status: s.status,
  provider: s.provider,
  config: Object.keys(s.config || {}).length ? JSON.stringify(s.config, null, 2) : '',
  companyId: s.companyId ?? '',
  autoPublish: s.autoPublish,
})

interface Props {
  items: Row[]
  companies: Pick<CompanyDto, 'id' | 'name' | 'slug'>[]
  providers: { id: string; label: string; configHelp: string }[]
  canEdit: boolean
  canDelete: boolean
}

export default function SourcesPanel({ items, companies, providers, canEdit, canDelete }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const open = (row?: Row) => {
    setError(null)
    setNotice(null)
    setEditing({ id: row?.id ?? null, draft: row ? fromRow(row) : empty })
  }
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setError(null)
    let body
    try {
      body = parseSourceInput(editing.draft)
    } catch (err) {
      if (err instanceof ValidationError) return setError({ message: err.message, field: err.field ?? null })
      throw err
    }
    setBusy('save')
    try {
      if (editing.id) await api(`/api/admin/sources/${editing.id}`, { method: 'PUT', json: body })
      else await api('/api/admin/sources', { method: 'POST', json: body })
      setNotice(editing.id ? 'Source updated' : `Added ${body.name}`)
      setEditing(null)
      router.refresh()
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Save failed', field: err instanceof ApiError ? err.field : null })
    } finally {
      setBusy(null)
    }
  }

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete source ${row.name}? Jobs keep their data but lose the link to this source.`)) return
    try {
      await api(`/api/admin/sources/${row.id}`, { method: 'DELETE' })
      setNotice(`Deleted ${row.name}`)
      router.refresh()
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Delete failed', field: null })
    }
  }

  const runNow = async (row: Row) => {
    setBusy(row.id)
    setError(null)
    try {
      const result = await api<{ status: string; fetched: number; created: number; updated: number; unchanged: number; irrelevant: number; duplicates: number }>('/api/admin/ingestion/run', { method: 'POST', json: { sourceId: row.id } })
      setNotice(`${row.name}: fetched ${result.fetched}, created ${result.created}, updated ${result.updated}, unchanged ${result.unchanged}, irrelevant ${result.irrelevant}, duplicates ${result.duplicates}`)
      router.refresh()
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Run failed', field: null })
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const providerHelp = editing ? providers.find((p) => p.id === editing.draft.provider)?.configHelp : ''

  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {canEdit && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => open()}>
            Add source
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
        <EmptyState title="No sources yet" description="Record where listings come from: company career pages, ATS feeds or approved providers." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Provider</th>
                <th>Ingestion</th>
                <th>Last run</th>
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
                    <div className="text-xs text-muted-foreground">{labelOf(SOURCE_TYPES, row.type)} · {row.baseUrl || row.slug}</div>
                  </td>
                  <td>
                    {row.provider}
                    {row.companyId && <div className="text-xs text-muted-foreground">{companies.find((c) => c.id === row.companyId)?.name || 'company'}</div>}
                  </td>
                  <td>
                    <Pill tone={row.ingestionAllowed ? 'good' : 'neutral'}>{row.ingestionAllowed ? (row.autoPublish ? 'Allowed · auto-publish' : 'Allowed · review') : 'Manual only'}</Pill>
                  </td>
                  <td className="whitespace-nowrap">
                    {row.lastRunAt ? (
                      <>
                        <Pill tone={row.lastRunStatus === 'success' ? 'good' : 'bad'}>{row.lastRunStatus}</Pill>
                        <div className="text-xs text-muted-foreground mt-1">{formatDateTime(row.lastRunAt)}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{row.jobCount}</td>
                  <td>
                    <Pill tone={statusTone(row.status)}>{row.status}</Pill>
                  </td>
                  <td className="whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                  {canEdit && (
                    <td className="text-right whitespace-nowrap">
                      {row.provider !== 'manual' && row.ingestionAllowed && row.status === 'active' && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => runNow(row)} disabled={busy !== null} aria-label={`Run ingestion for ${row.name}`}>
                          {busy === row.id ? 'Running…' : 'Run now'}
                        </button>
                      )}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => open(row)} aria-label={`Edit ${row.name}`}>
                        Edit
                      </button>
                      {canDelete && (
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
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="source-dialog-title">
          <form onSubmit={submit} className="admin-modal" noValidate>
            <h2 id="source-dialog-title" className="admin-modal-title">
              {editing.id ? 'Edit source' : 'Add source'}
            </h2>
            {error && (
              <div className="admin-alert admin-alert-error" role="alert">
                {error.message}
              </div>
            )}
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Name</span>
                <input className="input-field" value={editing.draft.name} onChange={(e) => set('name', e.target.value)} required />
              </label>
              <label className="admin-field">
                <span>Type</span>
                <select className="input-field" value={editing.draft.type} onChange={(e) => set('type', e.target.value)}>
                  {SOURCE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Provider</span>
                <select className="input-field" value={editing.draft.provider} onChange={(e) => set('provider', e.target.value)}>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {providerHelp && <small>{providerHelp}</small>}
              </label>
              <label className="admin-field">
                <span>Company (employer for ingested jobs)</span>
                <select className="input-field" value={editing.draft.companyId} onChange={(e) => set('companyId', e.target.value)} aria-invalid={error?.field === 'companyId' ? 'true' : undefined}>
                  <option value="">None</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {editing.draft.provider !== 'manual' && (
              <label className="admin-field">
                <span>Provider config (JSON)</span>
                <textarea className="input-field font-mono text-xs" rows={4} value={editing.draft.config} onChange={(e) => set('config', e.target.value)} placeholder='{ "board": "acme" }' aria-invalid={error?.field === 'config' ? 'true' : undefined} />
              </label>
            )}
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Base URL</span>
                <input className="input-field" value={editing.draft.baseUrl} onChange={(e) => set('baseUrl', e.target.value)} placeholder="https://boards.greenhouse.io/acme" />
              </label>
              <label className="admin-field">
                <span>Terms of use URL</span>
                <input className="input-field" value={editing.draft.termsUrl} onChange={(e) => set('termsUrl', e.target.value)} />
              </label>
            </div>
            <label className="admin-check">
              <input type="checkbox" checked={editing.draft.ingestionAllowed} onChange={(e) => set('ingestionAllowed', e.target.checked)} />
              <span>Automated ingestion allowed (you have checked the terms permit it)</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={editing.draft.autoPublish} onChange={(e) => set('autoPublish', e.target.checked)} />
              <span>Publish relevant ingested jobs automatically (otherwise they arrive as drafts for review)</span>
            </label>
            <label className="admin-field">
              <span>Notes</span>
              <textarea className="input-field" rows={3} value={editing.draft.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Who approved it, rate limits, contact" />
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select className="input-field" value={editing.draft.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <div className="admin-form-footer">
              <button type="submit" className="btn btn-primary" disabled={busy !== null}>
                {busy === 'save' ? 'Saving…' : editing.id ? 'Save changes' : 'Add source'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
