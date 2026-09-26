'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api } from '../../lib/adminClient'
import { formatMoney } from '../../lib/billing/pricingClient'
import { FEATURES, LIMIT_KEYS } from '../../lib/entitlements/features'
import type { PlanDto } from '../../lib/server/plans'
import { EmptyState, Pill } from './ui'

type Draft = { id: string; name: string; displayName: string; description: string; monthlyPriceMinor: string; annualPriceMinor: string; currency: string; active: boolean; isDefault: boolean; highlighted: boolean; displayOrder: string; features: string[]; limits: Record<string, string>; trialDays: string; providerMonthly: string; providerAnnual: string }

const fromPlan = (p?: PlanDto): Draft => ({
  id: p?.id ?? '',
  name: p?.name ?? '',
  displayName: p?.displayName ?? '',
  description: p?.description ?? '',
  monthlyPriceMinor: String(p?.monthlyPriceMinor ?? 0),
  annualPriceMinor: String(p?.annualPriceMinor ?? 0),
  currency: p?.currency ?? 'INR',
  active: p?.active ?? true,
  isDefault: p?.isDefault ?? false,
  highlighted: p?.highlighted ?? false,
  displayOrder: String(p?.displayOrder ?? 0),
  features: p?.features ?? [],
  limits: Object.fromEntries(LIMIT_KEYS.map((l) => [l.key, String(p?.limits[l.key] ?? 0)])),
  trialDays: String(p?.trialDays ?? 0),
  providerMonthly: p?.providerPlanIds.monthly ?? '',
  providerAnnual: p?.providerPlanIds.annual ?? '',
})

export default function PlansPanel({ plans, canEdit }: { plans: PlanDto[]; canEdit: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, [k]: v } } : e))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    setError(null)
    const d = editing.draft
    const body = { id: d.id, name: d.name, displayName: d.displayName, description: d.description, monthlyPriceMinor: Number(d.monthlyPriceMinor), annualPriceMinor: Number(d.annualPriceMinor), currency: d.currency, active: d.active, isDefault: d.isDefault, highlighted: d.highlighted, displayOrder: Number(d.displayOrder), features: d.features, limits: Object.fromEntries(Object.entries(d.limits).map(([k, v]) => [k, Number(v)])), trialDays: Number(d.trialDays), providerPlanIds: { ...(d.providerMonthly ? { monthly: d.providerMonthly } : {}), ...(d.providerAnnual ? { annual: d.providerAnnual } : {}) } }
    try {
      if (editing.id) await api(`/api/admin/plans/${editing.id}`, { method: 'PUT', json: body })
      else await api('/api/admin/plans', { method: 'POST', json: body })
      setNotice(editing.id ? `Plan ${d.displayName} saved` : `Plan ${d.displayName} created`)
      setEditing(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {canEdit && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { setError(null); setEditing({ id: null, draft: fromPlan() }) }}>
            Add plan
          </button>
        )}
        {notice && (
          <span className="text-sm text-muted-foreground" role="status">
            {notice}
          </span>
        )}
      </div>
      {plans.length === 0 ? (
        <EmptyState title="No plans" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Monthly</th>
                <th>Annual</th>
                <th>Features</th>
                <th>Flags</th>
                <th>Provider ids</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-semibold">{p.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.id} · order {p.displayOrder}
                    </div>
                  </td>
                  <td>{formatMoney(p.monthlyPriceMinor, p.currency)}</td>
                  <td>{formatMoney(p.annualPriceMinor, p.currency)}</td>
                  <td className="text-xs">{p.features.length} feature(s)</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <Pill tone={p.active ? 'good' : 'bad'}>{p.active ? 'active' : 'inactive'}</Pill>
                      {p.isDefault && <Pill tone="info">default</Pill>}
                      {p.highlighted && <Pill tone="neutral">recommended</Pill>}
                      {p.trialDays > 0 && <Pill tone="neutral">{p.trialDays}d trial</Pill>}
                    </div>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {p.providerPlanIds.monthly || '—'} / {p.providerPlanIds.annual || '—'}
                  </td>
                  {canEdit && (
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setError(null); setEditing({ id: p.id, draft: fromPlan(p) }) }} aria-label={`Edit plan ${p.displayName}`}>
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="plan-dialog-title">
          <form onSubmit={submit} className="admin-modal" style={{ maxWidth: 820 }} noValidate>
            <h2 id="plan-dialog-title" className="admin-modal-title">
              {editing.id ? `Edit plan ${editing.draft.displayName}` : 'Add plan'}
            </h2>
            {error && (
              <div className="admin-alert admin-alert-error" role="alert">
                {error}
              </div>
            )}
            <div className="admin-grid-3">
              <label className="admin-field">
                <span>Plan id (slug)</span>
                <input className="input-field" value={editing.draft.id} onChange={(e) => set('id', e.target.value)} disabled={Boolean(editing.id)} required />
              </label>
              <label className="admin-field">
                <span>Internal name</span>
                <input className="input-field" value={editing.draft.name} onChange={(e) => set('name', e.target.value)} />
              </label>
              <label className="admin-field">
                <span>Public display name</span>
                <input className="input-field" value={editing.draft.displayName} onChange={(e) => set('displayName', e.target.value)} required />
              </label>
            </div>
            <label className="admin-field">
              <span>Description</span>
              <textarea className="input-field" rows={2} value={editing.draft.description} onChange={(e) => set('description', e.target.value)} />
            </label>
            <div className="admin-grid-4">
              <label className="admin-field">
                <span>Monthly price (minor units)</span>
                <input className="input-field" inputMode="numeric" value={editing.draft.monthlyPriceMinor} onChange={(e) => set('monthlyPriceMinor', e.target.value)} />
              </label>
              <label className="admin-field">
                <span>Annual price (minor units)</span>
                <input className="input-field" inputMode="numeric" value={editing.draft.annualPriceMinor} onChange={(e) => set('annualPriceMinor', e.target.value)} />
              </label>
              <label className="admin-field">
                <span>Currency</span>
                <input className="input-field" value={editing.draft.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} />
              </label>
              <label className="admin-field">
                <span>Trial days</span>
                <input className="input-field" inputMode="numeric" value={editing.draft.trialDays} onChange={(e) => set('trialDays', e.target.value)} />
              </label>
            </div>
            <div className="admin-grid-4">
              <label className="admin-check">
                <input type="checkbox" checked={editing.draft.active} onChange={(e) => set('active', e.target.checked)} /> <span>Active</span>
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={editing.draft.isDefault} onChange={(e) => set('isDefault', e.target.checked)} /> <span>Default (free) plan</span>
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={editing.draft.highlighted} onChange={(e) => set('highlighted', e.target.checked)} /> <span>Recommended</span>
              </label>
              <label className="admin-field">
                <span>Display order</span>
                <input className="input-field" inputMode="numeric" value={editing.draft.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} />
              </label>
            </div>
            <fieldset className="admin-fieldset">
              <legend>Feature entitlements</legend>
              <div className="admin-check-grid">
                {FEATURES.map((f) => (
                  <label key={f.key} className="admin-check">
                    <input type="checkbox" aria-label={`${f.label} in plan`} checked={editing.draft.features.includes(f.key)} onChange={(e) => set('features', e.target.checked ? [...editing.draft.features, f.key] : editing.draft.features.filter((k) => k !== f.key))} />
                    <span>
                      {f.label} <small className="text-muted-foreground">· {f.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="admin-fieldset">
              <legend>Usage limits</legend>
              <div className="admin-grid-3">
                {LIMIT_KEYS.map((l) => (
                  <label key={l.key} className="admin-field">
                    <span>{l.label}</span>
                    <input className="input-field" inputMode="numeric" aria-label={`${l.label} limit`} value={editing.draft.limits[l.key] ?? '0'} onChange={(e) => set('limits', { ...editing.draft.limits, [l.key]: e.target.value })} />
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="admin-grid-2">
              <label className="admin-field">
                <span>Razorpay plan id (monthly)</span>
                <input className="input-field" value={editing.draft.providerMonthly} onChange={(e) => set('providerMonthly', e.target.value)} placeholder="plan_…" />
              </label>
              <label className="admin-field">
                <span>Razorpay plan id (annual)</span>
                <input className="input-field" value={editing.draft.providerAnnual} onChange={(e) => set('providerAnnual', e.target.value)} placeholder="plan_…" />
              </label>
            </div>
            <div className="admin-form-footer">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save plan'}
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
