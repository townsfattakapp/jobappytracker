'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../lib/adminClient'
import type { FeatureFlags } from '../../lib/entitlements/features'
import { ROLE_CATEGORIES, type RoleFamilyConfig } from '../../lib/jobs/taxonomy'

interface Props {
  flags: FeatureFlags
  roleFamilies: RoleFamilyConfig
  canEdit: boolean
}

export default function SettingsForm({ flags, roleFamilies, canEdit }: Props) {
  const router = useRouter()
  const [draftFlags, setDraftFlags] = useState<FeatureFlags>(flags)
  const [draftFamilies, setDraftFamilies] = useState<RoleFamilyConfig>(roleFamilies)
  const [hintText, setHintText] = useState<Record<string, string>>(Object.fromEntries(ROLE_CATEGORIES.map((c) => [c.id, (roleFamilies.extraHints[c.id] || []).join(', ')])))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const toggleFamily = (id: string) => setDraftFamilies((f) => ({ ...f, disabled: f.disabled.includes(id) ? f.disabled.filter((x) => x !== id) : [...f.disabled, id] }))

  const save = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const extraHints: Record<string, string[]> = {}
      for (const [id, text] of Object.entries(hintText)) {
        const list = text.split(',').map((s) => s.trim()).filter(Boolean)
        if (list.length) extraHints[id] = list
      }
      const result = await api<Props>('/api/admin/settings', { method: 'PUT', json: { flags: draftFlags, roleFamilies: { disabled: draftFamilies.disabled, extraHints } } })
      setDraftFlags(result.flags)
      setDraftFamilies(result.roleFamilies)
      setMessage({ kind: 'ok', text: 'Settings saved' })
      router.refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-form">
      {message && (
        <div className={`admin-alert ${message.kind === 'ok' ? 'admin-alert-ok' : 'admin-alert-error'}`} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </div>
      )}
      <fieldset className="admin-fieldset" disabled={!canEdit}>
        <legend>Feature flags</legend>
        <label className="admin-check">
          <input type="checkbox" checked={draftFlags.jobsModule} onChange={(e) => setDraftFlags((f) => ({ ...f, jobsModule: e.target.checked }))} />
          <span>
            Job discovery module <small className="text-muted-foreground">· hides the Jobs section for learners and stops the jobs API</small>
          </span>
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={draftFlags.adminPanel} onChange={(e) => setDraftFlags((f) => ({ ...f, adminPanel: e.target.checked }))} />
          <span>
            Admin panel <small className="text-muted-foreground">· when off, only environment-bootstrapped admins can open it</small>
          </span>
        </label>
      </fieldset>

      <div className="admin-card">
        <div className="font-semibold">Plan entitlements and usage limits</div>
        <p className="admin-help">Every gate reads the learner's plan. Edit features, limits, prices and provider ids under <a className="underline" href="/admin/plans">Plans</a>.</p>
      </div>

      <fieldset className="admin-fieldset" disabled={!canEdit}>
        <legend>Role families</legend>
        <p className="admin-help">Switch a family off to stop ingesting and showing its jobs. Extra keywords (comma separated) map more titles to a family during ingestion.</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Enabled</th>
                <th>Extra title keywords</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_CATEGORIES.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="font-semibold">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.hints.slice(0, 4).join(', ')}</div>
                  </td>
                  <td>
                    <input type="checkbox" aria-label={`${c.label} enabled`} checked={!draftFamilies.disabled.includes(c.id)} onChange={() => toggleFamily(c.id)} />
                  </td>
                  <td>
                    <input className="input-field" aria-label={`Extra keywords for ${c.label}`} value={hintText[c.id] || ''} onChange={(e) => setHintText((h) => ({ ...h, [c.id]: e.target.value }))} placeholder="e.g. quant developer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {canEdit && (
        <div className="admin-form-footer">
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  )
}
