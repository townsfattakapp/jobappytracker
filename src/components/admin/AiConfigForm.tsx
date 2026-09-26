'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../lib/adminClient'
import type { AiPolicy } from '../../lib/ai/policy'
import { AI_FEATURES, type AiFeature, type AiProviderId } from '../../lib/ai/types'

interface Props {
  policy: AiPolicy
  adapters: { id: AiProviderId; label: string; models: string[]; configured: boolean }[]
  canEdit: boolean
}

export default function AiConfigForm({ policy, adapters, canEdit }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<AiPolicy>(policy)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [probe, setProbe] = useState<Record<string, string>>({})

  const move = (id: AiProviderId, dir: -1 | 1) => {
    const order = [...draft.providerOrder]
    const i = order.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= order.length) return
    ;[order[i], order[j]] = [order[j], order[i]]
    setDraft({ ...draft, providerOrder: order })
  }
  const toggleSensitive = (id: AiProviderId) => setDraft({ ...draft, sensitiveProviders: draft.sensitiveProviders.includes(id) ? draft.sensitiveProviders.filter((x) => x !== id) : [...draft.sensitiveProviders, id] })
  const setFeature = (key: AiFeature, patch: Partial<AiPolicy['features'][AiFeature]>) => setDraft({ ...draft, features: { ...draft.features, [key]: { ...draft.features[key], ...patch } } })

  const save = async () => {
    setBusy('save')
    setMessage(null)
    try {
      const res = await api<{ policy: AiPolicy }>('/api/admin/ai', { method: 'PUT', json: { policy: draft } })
      setDraft(res.policy)
      setMessage({ kind: 'ok', text: 'AI policy saved' })
      router.refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setBusy(null)
    }
  }
  const runProbe = async (id: AiProviderId) => {
    setBusy(`probe:${id}`)
    try {
      const res = await api<{ ok: boolean; model?: string; latencyMs?: number; kind?: string; errorId?: string; message?: string }>('/api/admin/ai', { method: 'PUT', json: { action: 'probe', provider: id } })
      setProbe((p) => ({ ...p, [id]: res.ok ? `OK · ${res.model} · ${res.latencyMs} ms` : `Failed · ${res.kind} · ${res.errorId}` }))
      router.refresh()
    } catch (err) {
      setProbe((p) => ({ ...p, [id]: err instanceof Error ? err.message : 'Probe failed' }))
    } finally {
      setBusy(null)
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
        <legend>Gateway</legend>
        <label className="admin-check">
          <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} /> <span>AI gateway enabled <small className="text-muted-foreground">· off = every feature uses its deterministic engine only</small></span>
        </label>
        <div className="admin-grid-3 mt-2">
          <label className="admin-field">
            <span>Timeout per attempt (ms)</span>
            <input className="input-field" inputMode="numeric" value={draft.timeoutMs} onChange={(e) => setDraft({ ...draft, timeoutMs: Number(e.target.value) || 0 })} aria-label="AI timeout ms" />
          </label>
          <label className="admin-field">
            <span>Retries per provider (0–3)</span>
            <input className="input-field" inputMode="numeric" value={draft.maxRetries} onChange={(e) => setDraft({ ...draft, maxRetries: Number(e.target.value) || 0 })} aria-label="AI retries" />
          </label>
          <label className="admin-field">
            <span>Daily calls per learner (0 = unlimited)</span>
            <input className="input-field" inputMode="numeric" value={draft.dailyCallsPerUser} onChange={(e) => setDraft({ ...draft, dailyCallsPerUser: Number(e.target.value) || 0 })} aria-label="AI daily calls per learner" />
          </label>
        </div>
      </fieldset>
      <fieldset className="admin-fieldset" disabled={!canEdit}>
        <legend>Provider priority and sensitive-data routing</legend>
        <p className="admin-help">Requests fall back down this list. Sensitive requests (resume, interview answers, drafts) go to one provider only: the learner&apos;s own key, otherwise the first configured provider ticked below (none ticked = the first configured provider). They never fall back to a second provider.</p>
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Provider order">
            <thead>
              <tr>
                <th>#</th>
                <th>Provider</th>
                <th>Configured</th>
                <th>May receive sensitive content</th>
                <th>Order</th>
                <th>Probe</th>
              </tr>
            </thead>
            <tbody>
              {draft.providerOrder.map((id, i) => {
                const a = adapters.find((x) => x.id === id)
                return (
                  <tr key={id}>
                    <td>{i + 1}</td>
                    <td className="font-semibold">{a?.label ?? id}</td>
                    <td>{a?.configured ? 'yes' : 'no'}</td>
                    <td>
                      <input type="checkbox" checked={draft.sensitiveProviders.includes(id)} onChange={() => toggleSensitive(id)} aria-label={`${a?.label ?? id} may receive sensitive content`} />
                    </td>
                    <td className="whitespace-nowrap">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(id, -1)} aria-label={`Move ${a?.label ?? id} up`}>
                        ↑
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(id, 1)} aria-label={`Move ${a?.label ?? id} down`}>
                        ↓
                      </button>
                    </td>
                    <td className="text-xs">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runProbe(id)} disabled={busy !== null || !a?.configured} aria-label={`Probe ${a?.label ?? id}`}>
                        {busy === `probe:${id}` ? 'Probing…' : 'Send test prompt'}
                      </button>
                      {probe[id] && <div className="mt-1">{probe[id]}</div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </fieldset>
      <fieldset className="admin-fieldset" disabled={!canEdit}>
        <legend>Features</legend>
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="AI feature policy">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Enabled</th>
                <th>Provider order override (comma separated ids)</th>
                <th>Model overrides (provider=model, comma separated)</th>
              </tr>
            </thead>
            <tbody>
              {AI_FEATURES.map((f) => {
                const fp = draft.features[f.key]
                return (
                  <tr key={f.key}>
                    <td>
                      {f.label}
                      <div className="text-xs text-muted-foreground">
                        {f.key}
                        {f.sensitive ? ' · sensitive' : ''}
                      </div>
                    </td>
                    <td>
                      <input type="checkbox" checked={fp.enabled} onChange={(e) => setFeature(f.key, { enabled: e.target.checked })} aria-label={`${f.label} enabled`} />
                    </td>
                    <td>
                      <input className="input-field" value={fp.providers.join(', ')} onChange={(e) => setFeature(f.key, { providers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) as AiProviderId[] })} placeholder="global order" aria-label={`${f.label} providers`} />
                    </td>
                    <td>
                      <input
                        className="input-field"
                        value={Object.entries(fp.models)
                          .map(([p, m]) => `${p}=${m}`)
                          .join(', ')}
                        onChange={(e) => setFeature(f.key, { models: Object.fromEntries(e.target.value.split(',').map((s) => s.trim()).filter((s) => s.includes('=')).map((s) => s.split('=').map((x) => x.trim()) as [string, string])) as Partial<Record<AiProviderId, string>> })}
                        placeholder="groq=llama-3.3-70b-versatile"
                        aria-label={`${f.label} models`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </fieldset>
      {canEdit && (
        <div className="admin-form-footer">
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy !== null}>
            {busy === 'save' ? 'Saving…' : 'Save AI policy'}
          </button>
        </div>
      )}
    </div>
  )
}
