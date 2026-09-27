'use client'

import { useEffect, useState } from 'react'
import PlanCards from '../PlanCards'
import { PLAN_FEATURES, PRODUCT_NAME, type Plan } from '../../lib/billing/plan'
import { usePricing } from '../../lib/billing/usePricing'
import { BILLING_CHANGED_EVENT, fetchBillingState, formatDate, PAYMENT_CANCELLED, purchasePlan, type BillingState } from '../../lib/billing/client'
import { completeFixtureCheckout, fetchPlans, startCheckout } from '../../lib/billing/pricingClient'

/** What an account gets without paying; kept in one place so the home page, /pricing and the paywall say the same thing. */
export const FREE_INCLUDES = [
  'Job Discovery with a sample of live openings and the companies hiring',
  'Resume versions, kept privately in your account',
  'Application tracker, follow-up reminders and the general curriculum browser',
  'One short general mock interview a day',
]

/**
 * The public pricing surface: the same three passes that the home page, the
 * paywall and Settings → Billing sell, bought with the same Razorpay order
 * flow. There is one price list (src/lib/billing/plan.ts) and no other plan.
 * On deployments that run the simulated payment provider (development,
 * staging), a "Test checkout" button exercises the signed-webhook path
 * without a card; production never shows it.
 */
export default function PassPricing() {
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [testMode, setTestMode] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [fixture, setFixture] = useState<{ token: string; label: string } | null>(null)
  const { pricing } = usePricing()

  useEffect(() => {
    let cancelled = false
    const load = () =>
      fetchBillingState()
        .then((s) => {
          if (!cancelled) setBilling(s)
        })
        .catch(() => undefined)
    void load()
    fetchPlans()
      .then((p) => {
        if (!cancelled) setTestMode(Boolean(p.billing.testMode))
      })
      .catch(() => undefined)
    const onChange = () => void load()
    window.addEventListener(BILLING_CHANGED_EVENT, onChange)
    return () => {
      cancelled = true
      window.removeEventListener(BILLING_CHANGED_EVENT, onChange)
    }
  }, [])

  const signedIn = Boolean(billing?.signedIn)
  const entitlement = billing?.entitlement ?? null

  const buy = async (plan: Plan, currency: string) => {
    setError(null)
    setNotice(null)
    setBusy(plan.id)
    try {
      const next = await purchasePlan(plan.id, currency)
      setBilling((b) => (b ? { ...b, entitlement: next } : b))
      setNotice(`${plan.name} added. Your access now runs until ${formatDate(next.endsAt) || 'the end of the pass'}. A receipt is on its way to your email.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start the payment'
      if (message !== PAYMENT_CANCELLED) setError(message)
    } finally {
      setBusy(null)
    }
  }

  /** Simulated provider only: starts the signed-webhook checkout for the paid plan. */
  const startTest = async () => {
    setError(null)
    setNotice(null)
    setBusy('test')
    try {
      const res = await startCheckout('pro', 'month')
      if (res.session.mode !== 'fixture') throw new Error('The test checkout is only available with the simulated payment provider.')
      setFixture({ token: res.session.checkoutToken, label: PRODUCT_NAME })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the test checkout')
    } finally {
      setBusy(null)
    }
  }

  const completeTest = async (outcome: 'success' | 'failed') => {
    if (!fixture) return
    setBusy('test')
    setError(null)
    try {
      await completeFixtureCheckout(fixture.token, outcome)
      let active = false
      for (let i = 0; i < 15 && outcome === 'success'; i++) {
        const s = await fetchBillingState().catch(() => null)
        if (s?.entitlement?.access) {
          setBilling(s)
          active = true
          break
        }
        await new Promise((r) => setTimeout(r, 400))
      }
      setNotice(outcome === 'success' ? (active ? `${fixture.label} is active on your account.` : 'Payment recorded; activation is still processing.') : 'Test payment failed as requested. Nothing was unlocked.')
      window.dispatchEvent(new Event(BILLING_CHANGED_EVENT))
      setFixture(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete the test checkout')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="pass-pricing">
      {signedIn && entitlement && (
        <p className="pass-pricing-status" role="status">
          {entitlement.complimentary
            ? 'This account has complimentary access.'
            : entitlement.access
              ? `Your pass is active until ${formatDate(entitlement.endsAt) || '—'} (${entitlement.daysLeft} days left). Buying another pass adds its days to the end.`
              : entitlement.endsAt
                ? 'Your pass has ended. Everything you saved is still here; pick a pass to continue.'
                : 'You are on the free plan. Pick a pass to unlock everything below.'}
        </p>
      )}
      {signedIn ? (
        <PlanCards onSelect={(p, c) => void buy(p, c)} busyPlanId={busy} disabled={Boolean(busy) || !billing?.configured} ctaLabel={(p, priced) => (entitlement?.access ? `Add ${p.name}` : `Get ${p.name} for ${priced.priceLabel}`)} />
      ) : (
        <PlanCards href="/app?mode=signup" ctaLabel={(p, priced) => `Get ${p.name} for ${priced.priceLabel}`} />
      )}
      {signedIn && billing && !billing.configured && !testMode && <p className="pass-pricing-note">Payments are not configured on this deployment yet.</p>}
      {signedIn && testMode && (
        <div className="pass-pricing-note">
          This deployment uses a simulated payment provider.{' '}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void startTest()} disabled={busy !== null}>
            Test checkout
          </button>
        </div>
      )}
      {notice && (
        <p className="pass-pricing-status" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="pass-pricing-grid">
        <section className="pass-pricing-card" aria-labelledby="included-title" id="included">
          <h2 id="included-title">Every pass includes</h2>
          <ul className="lp-checks">
            {PLAN_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="pass-pricing-note">
            Passes: {pricing.plans.map((p) => `${p.name} ${p.priceLabel}`).join(' · ')}. One Razorpay payment ({pricing.methods}), charged in {pricing.currency}, a receipt by email, nothing renews by itself. Buying another pass while one is active adds the days to the end.
          </p>
        </section>
        <section className="pass-pricing-card" aria-labelledby="free-title">
          <h2 id="free-title">Free, without a pass</h2>
          <ul className="lp-checks">
            {FREE_INCLUDES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="pass-pricing-note">
            Create a free account to try {PRODUCT_NAME} before paying. Refunds: duplicate charges and any failure to deliver access are refunded in full; see the <a href="/refund">refund policy</a>. Questions: <a href="mailto:hello@evolw.in">hello@evolw.in</a>.
          </p>
        </section>
      </div>
      {fixture && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fixture-title">
          <div className="admin-modal">
            <h2 id="fixture-title" className="admin-modal-title">
              Test checkout · {fixture.label}
            </h2>
            <p className="admin-help">This deployment uses a simulated payment provider. No card is charged. Choosing an outcome sends a signed webhook to the server, which verifies it before changing anything.</p>
            <div className="admin-form-footer">
              <button type="button" className="btn btn-primary" onClick={() => void completeTest('success')} disabled={busy !== null}>
                {busy === 'test' ? 'Processing…' : 'Complete test payment'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void completeTest('failed')} disabled={busy !== null}>
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
