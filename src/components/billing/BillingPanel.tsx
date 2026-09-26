import { useEffect, useState } from 'react'
import { cancelRenewal, fetchBillingState, fetchUsage, formatMoney, STATUS_LABEL, type BillingStateResponse, type UsageResponse } from '../../lib/billing/pricingClient'
import { api } from '../../lib/adminClient'
import { FEATURES } from '../../lib/entitlements/features'

interface Props {
  signedIn: boolean
  onSignIn: () => void
  onToast: (message: string) => void
  onChanged?: () => void
}

/** Settings → Billing: plan, cycle, status, renewal, usage and the actions the provider actually supports. */
export default function BillingPanel({ signedIn, onSignIn, onToast, onChanged }: Props) {
  const [state, setState] = useState<BillingStateResponse | null>(null)
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const [s, u] = await Promise.all([fetchBillingState(), fetchUsage()])
      setState(s)
      setUsage(u)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load billing')
    }
  }
  useEffect(() => {
    if (signedIn) void load()
  }, [signedIn])

  if (!signedIn) {
    return (
      <section className="surface rounded-2xl p-6 border border-border space-y-3">
        <h2 className="text-xl font-bold">Billing</h2>
        <p className="text-sm text-muted-foreground">Sign in to see your plan and usage.</p>
        <button type="button" className="btn btn-primary" onClick={onSignIn}>
          Sign in
        </button>
      </section>
    )
  }

  const sub = state?.subscription ?? null
  const plan = state?.plan ?? null

  const cancel = async () => {
    if (!sub) return
    if (!window.confirm('Cancel renewal? You keep access until the end of the current billing period.')) return
    setBusy(true)
    try {
      await cancelRenewal(sub.id)
      onToast('Renewal cancelled')
      await load()
      onChanged?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel renewal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="surface rounded-2xl p-6 border border-border space-y-4" aria-labelledby="billing-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <h2 id="billing-title" className="text-xl font-bold">
          Billing
        </h2>
        {plan && <span className="job-chip job-chip-accent">{plan.displayName}</span>}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {!state ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <dl className="job-facts">
            <div>
              <dt className="job-fact-label">Current plan</dt>
              <dd className="job-fact-value">{plan?.displayName ?? '—'}</dd>
            </div>
            <div>
              <dt className="job-fact-label">Source</dt>
              <dd className="job-fact-value">{state.planSource === 'subscription' ? 'Subscription' : state.planSource === 'legacy_pass' ? 'Prepaid pass' : state.planSource === 'allowlist' ? 'Complimentary' : 'Included'}</dd>
            </div>
            {sub && (
              <>
                <div>
                  <dt className="job-fact-label">Status</dt>
                  <dd className="job-fact-value">{STATUS_LABEL[sub.status] ?? sub.status}</dd>
                </div>
                <div>
                  <dt className="job-fact-label">Billing cycle</dt>
                  <dd className="job-fact-value">{sub.interval === 'year' ? 'Annual' : 'Monthly'}</dd>
                </div>
                <div>
                  <dt className="job-fact-label">{sub.status === 'cancel_at_period_end' ? 'Access until' : 'Next renewal'}</dt>
                  <dd className="job-fact-value">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'Unknown'}</dd>
                </div>
                {plan && !plan.isDefault && (
                  <div>
                    <dt className="job-fact-label">Price</dt>
                    <dd className="job-fact-value">{formatMoney(sub.interval === 'year' ? plan.annualPriceMinor : plan.monthlyPriceMinor, plan.currency)} / {sub.interval}</dd>
                  </div>
                )}
              </>
            )}
            {state.planSource === 'legacy_pass' && state.accessEndsAt && (
              <div>
                <dt className="job-fact-label">Pass ends</dt>
                <dd className="job-fact-value">{new Date(state.accessEndsAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
          {sub?.lastPaymentError && <p className="text-sm text-destructive">Last payment problem: {sub.lastPaymentError}</p>}
          <div className="flex flex-wrap gap-2">
            <a href="/pricing" className="btn btn-ghost btn-sm">
              {plan?.isDefault ? 'Upgrade' : 'Change plan'}
            </a>
            {sub && sub.grantsAccess && sub.status !== 'cancel_at_period_end' && state.planSource === 'subscription' && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={cancel} disabled={busy}>
                {busy ? 'Cancelling…' : 'Cancel renewal'}
              </button>
            )}
          </div>
          {usage && (
            <div>
              <h3 className="text-sm font-bold mt-2">Usage today</h3>
              <p className="text-xs text-muted-foreground">Counts reset at midnight UTC ({new Date(usage.resetsAt).toLocaleString()}).</p>
              <div className="admin-table-wrap mt-2">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Used</th>
                      <th>Limit</th>
                      <th>Resets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.meters.map((m) => (
                      <tr key={m.key}>
                        <td>
                          {m.label}
                          {!m.included && <span className="text-xs text-muted-foreground"> · not in your plan</span>}
                        </td>
                        <td>{m.used}</td>
                        <td>{m.limit}</td>
                        <td>{m.resets}</td>
                      </tr>
                    ))}
                    <tr>
                      <td>{usage.feed.label}</td>
                      <td>—</td>
                      <td>{usage.feed.limit === 0 ? 'unlimited' : usage.feed.limit}</td>
                      <td>per request</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-bold">Career OS data</h3>
            <p className="text-xs text-muted-foreground mt-1">Delete your resumes, resume analyses, outreach contacts, job preparations, job preferences and usage counters. Learning data, applications and the account itself stay; shared listings are never affected.</p>
            <button
              type="button"
              className="btn btn-danger btn-sm mt-2"
              onClick={async () => {
                if (!window.confirm('Delete all your Career OS data (resumes, analyses, outreach, preparations, job preferences)? This cannot be undone.')) return
                try {
                  const res = await api<{ deleted: Record<string, number> }>('/api/account/career-data', { method: 'DELETE', json: { confirm: 'DELETE' } })
                  onToast(`Deleted ${Object.values(res.deleted).reduce((a, b) => a + b, 0)} Career OS records`)
                } catch (err) {
                  onToast(err instanceof Error ? err.message : 'Deletion failed')
                }
              }}
            >
              Delete my Career OS data
            </button>
          </div>
          {plan && (
            <details className="admin-details">
              <summary>Plan features</summary>
              <ul className="pricing-features mt-2">
                {plan.features.map((f) => (
                  <li key={f}>{FEATURES.find((x) => x.key === f)?.label ?? f}</li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  )
}
