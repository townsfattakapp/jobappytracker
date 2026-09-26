'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ApiError } from '../../lib/adminClient'
import { FEATURES, LIMIT_KEYS } from '../../lib/entitlements/features'
import { cancelRenewal, completeFixtureCheckout, fetchBillingState, fetchPlans, formatMoney, startCheckout, STATUS_LABEL, verifyRazorpayCheckout, type BillingStateResponse, type PlansResponse, type PublicPlan } from '../../lib/billing/pricingClient'

type Interval = 'month' | 'year'

const featureLabel = (key: string) => FEATURES.find((f) => f.key === key)?.label ?? key

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (payload: unknown) => void) => void }
  }
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load the payment window'))
    document.head.appendChild(s)
  })
}

/** Public pricing: monthly/annual toggle, plans from the admin-managed table, the caller's current plan and a verified checkout flow. */
export default function PricingView() {
  const [data, setData] = useState<PlansResponse | null>(null)
  const [state, setState] = useState<BillingStateResponse | null>(null)
  const [interval, setInterval_] = useState<Interval>('month')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [fixture, setFixture] = useState<{ token: string; plan: PublicPlan } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = async () => {
    const plans = await fetchPlans()
    setData(plans)
    if (plans.current.signedIn) setState(await fetchBillingState().catch(() => null))
  }
  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : 'Could not load plans'))
  }, [])

  const waitForActive = async (): Promise<boolean> => {
    for (let i = 0; i < 20; i++) {
      const s = await fetchBillingState()
      if (s.subscription?.grantsAccess) {
        setState(s)
        return true
      }
      await new Promise((r) => setTimeout(r, 400))
    }
    return false
  }

  const upgrade = async (plan: PublicPlan) => {
    setError(null)
    setNotice(null)
    setBusy(plan.id)
    try {
      const res = await startCheckout(plan.id, interval)
      if (res.session.mode === 'fixture') {
        setFixture({ token: res.session.checkoutToken, plan })
        return
      }
      await loadRazorpay()
      const Razorpay = window.Razorpay!
      const checkout = new Razorpay({
        key: res.session.keyId,
        subscription_id: res.session.providerSubscriptionId,
        name: 'Prep by EVOLW',
        description: res.session.description,
        prefill: { email: res.email, name: res.name },
        theme: { color: '#c13584' },
        handler: async (payload: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          try {
            await verifyRazorpayCheckout(payload)
            await waitForActive()
            setNotice('Your plan is active.')
            await load()
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Payment could not be verified')
          }
        },
      })
      checkout.open()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not start checkout')
    } finally {
      setBusy(null)
    }
  }

  const completeFixture = async (outcome: 'success' | 'failed') => {
    if (!fixture) return
    setBusy('fixture')
    setError(null)
    try {
      const res = await completeFixtureCheckout(fixture.token, outcome)
      if (outcome === 'success') {
        const ok = await waitForActive()
        setNotice(ok ? `${fixture.plan.displayName} is active on your account.` : 'Payment recorded; activation is still processing.')
      } else setNotice(`Test payment failed as requested (${res.subscription?.status ?? 'no change'}). Nothing was unlocked.`)
      setFixture(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test checkout failed')
    } finally {
      setBusy(null)
    }
  }

  const cancel = async () => {
    if (!state?.subscription) return
    if (!window.confirm('Cancel renewal? You keep access until the end of the current billing period.')) return
    setBusy('cancel')
    setError(null)
    try {
      await cancelRenewal(state.subscription.id)
      setNotice('Renewal cancelled. Your access continues until the end of the current period.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel renewal')
    } finally {
      setBusy(null)
    }
  }

  if (error && !data) return <p className="text-destructive" role="alert">{error}</p>
  if (!data) return <p className="text-muted-foreground">Loading plans…</p>

  const current = data.current
  const sub = state?.subscription ?? null

  return (
    <div>
      <div className="pricing-toggle" role="group" aria-label="Billing period">
        <button type="button" className="pref-chip" aria-pressed={interval === 'month'} onClick={() => setInterval_('month')}>
          Monthly
        </button>
        <button type="button" className="pref-chip" aria-pressed={interval === 'year'} onClick={() => setInterval_('year')}>
          Annual
        </button>
        <span className="text-xs text-muted-foreground">Billed {interval === 'month' ? 'every month' : 'once a year'}; cancel renewal any time.</span>
      </div>
      {data.billing.testMode && <p className="pricing-note">Test mode: no real charges. Checkout completes through a simulated, signed payment provider.</p>}
      {!data.billing.configured && <p className="pricing-note">Payments are not configured on this deployment yet; plans are shown for information.</p>}
      {notice && (
        <p className="admin-alert admin-alert-ok mt-3" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="admin-alert admin-alert-error mt-3" role="alert">
          {error}
        </p>
      )}

      <div className="pricing-grid">
        {data.plans.map((plan) => {
          const price = interval === 'year' ? plan.annualPriceMinor : plan.monthlyPriceMinor
          const isCurrent = current.planId === plan.id
          const free = plan.isDefault || (plan.monthlyPriceMinor === 0 && plan.annualPriceMinor === 0)
          const soldThisInterval = free || price > 0
          return (
            <section key={plan.id} className={`pricing-card${plan.highlighted ? ' is-highlighted' : ''}${isCurrent ? ' is-current' : ''}`} aria-label={plan.displayName}>
              <div className="pricing-card-head">
                <h2 className="pricing-card-name">{plan.displayName}</h2>
                {plan.highlighted && <span className="job-chip job-chip-accent">Recommended</span>}
                {isCurrent && <span className="job-chip job-chip-fresh">Current plan</span>}
              </div>
              <p className="pricing-price">
                {free ? 'Free' : soldThisInterval ? formatMoney(price, plan.currency) : 'Not available'}
                {!free && soldThisInterval && <span className="pricing-period"> / {interval === 'year' ? 'year' : 'month'}</span>}
              </p>
              {plan.trialDays > 0 && <p className="text-xs text-muted-foreground">{plan.trialDays}-day trial</p>}
              {plan.description && <p className="pricing-desc">{plan.description}</p>}
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>{featureLabel(f)}</li>
                ))}
              </ul>
              <details className="admin-details mt-2">
                <summary>Usage limits</summary>
                <ul className="pricing-limits">
                  {LIMIT_KEYS.map((l) => (
                    <li key={l.key}>
                      {l.label}: <strong>{plan.limits[l.key] === 0 && l.key === 'jobFeed' ? 'unlimited' : plan.limits[l.key] ?? 0}</strong>
                    </li>
                  ))}
                </ul>
              </details>
              <div className="pricing-cta">
                {isCurrent ? (
                  current.source === 'subscription' && sub && sub.status !== 'cancel_at_period_end' ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={cancel} disabled={busy !== null}>
                      {busy === 'cancel' ? 'Cancelling…' : 'Cancel renewal'}
                    </button>
                  ) : current.source === 'legacy_pass' ? (
                    <span className="text-xs text-muted-foreground">Included by your pass{current.accessEndsAt ? ` until ${new Date(current.accessEndsAt).toLocaleDateString()}` : ''}</span>
                  ) : current.source === 'allowlist' ? (
                    <span className="text-xs text-muted-foreground">Complimentary access</span>
                  ) : sub?.status === 'cancel_at_period_end' ? (
                    <span className="text-xs text-muted-foreground">Renewal cancelled; access until {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'period end'}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Your current plan</span>
                  )
                ) : free ? (
                  <span className="text-xs text-muted-foreground">Included with every account</span>
                ) : !current.signedIn ? (
                  <Link href="/app?mode=signup" className="btn btn-primary btn-sm">
                    Create an account to upgrade
                  </Link>
                ) : !data.billing.configured || !soldThisInterval ? (
                  <button type="button" className="btn btn-primary btn-sm" disabled>
                    Upgrade unavailable
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => upgrade(plan)} disabled={busy !== null} aria-label={`Upgrade to ${plan.displayName}`}>
                    {busy === plan.id ? 'Starting…' : `Upgrade to ${plan.displayName}`}
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {sub && (
        <section className="pricing-account" aria-labelledby="pricing-account">
          <h2 id="pricing-account" className="job-section-title">
            Your subscription
          </h2>
          <dl className="job-facts">
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
            {sub.lastPaymentError && (
              <div>
                <dt className="job-fact-label">Last payment</dt>
                <dd className="job-fact-value text-destructive">{sub.lastPaymentError}</dd>
              </div>
            )}
          </dl>
          <p className="job-source-note">
            Manage usage and details in <Link href="/app" className="underline">Settings → Billing</Link>.
          </p>
        </section>
      )}

      {fixture && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fixture-title">
          <div className="admin-modal">
            <h2 id="fixture-title" className="admin-modal-title">
              Test checkout · {fixture.plan.displayName}
            </h2>
            <p className="admin-help">This deployment uses a simulated payment provider. No card is charged. Choosing an outcome sends a signed webhook to the server, which verifies it before changing anything.</p>
            <div className="admin-form-footer">
              <button type="button" className="btn btn-primary" onClick={() => completeFixture('success')} disabled={busy !== null}>
                {busy === 'fixture' ? 'Processing…' : 'Complete test payment'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => completeFixture('failed')} disabled={busy !== null}>
                Simulate failed payment
              </button>
              <button type="button" className="btn btn-link" onClick={() => setFixture(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
