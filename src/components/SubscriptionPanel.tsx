import { useState } from 'react'
import { PLAN } from '../lib/billing/plan'
import { cancelSubscription, formatDate, startSubscription, type BillingState } from '../lib/billing/client'
import type { Entitlement } from '../lib/billing/entitlement'

interface SubscriptionPanelProps {
  billing: BillingState | null
  signedIn: boolean
  onSignIn: () => void
  onChange: (entitlement: Entitlement) => void
  onToast: (message: string) => void
}

const STATUS_COPY: Record<Entitlement['status'], { label: string; tone: string }> = {
  trial: { label: 'Free trial', tone: 'bg-sky-500/15 text-sky-500' },
  active: { label: 'Active', tone: 'bg-emerald-500/15 text-emerald-500' },
  cancelling: { label: 'Cancelling', tone: 'bg-amber-500/15 text-amber-500' },
  past_due: { label: 'Payment issue', tone: 'bg-amber-500/15 text-amber-500' },
  expired: { label: 'Expired', tone: 'bg-destructive/15 text-destructive' },
}

/** Settings block: plan, status, subscribe and cancel. */
export default function SubscriptionPanel({ billing, signedIn, onSignIn, onChange, onToast }: SubscriptionPanelProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const entitlement = billing?.entitlement ?? null

  const subscribe = async () => {
    setError(null)
    setBusy(true)
    try {
      const next = await startSubscription()
      onChange(next)
      onToast('Welcome to Prep Pro')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start the subscription'
      if (message !== 'Payment cancelled') setError(message)
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    if (!window.confirm('Cancel your subscription? You keep access until the end of the paid month.')) return
    setError(null)
    setBusy(true)
    try {
      const next = await cancelSubscription()
      onChange(next)
      onToast('Subscription will end at the close of this billing period')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="surface rounded-2xl p-6 border border-border space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <h2 className="text-xl font-bold">Subscription</h2>
        {entitlement && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COPY[entitlement.status].tone}`}>{STATUS_COPY[entitlement.status].label}</span>}
      </div>

      {!signedIn ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {PLAN.name} is ₹{PLAN.priceInr}/month after a {PLAN.trialDays}-day free trial. Create an account to start the trial.
          </p>
          <button type="button" className="btn btn-primary" onClick={onSignIn}>
            Sign in or create account
          </button>
        </div>
      ) : !entitlement ? (
        <p className="text-sm text-muted-foreground">Checking your plan…</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Plan</p>
              <p className="font-semibold mt-1">{entitlement.status === 'trial' || entitlement.status === 'expired' ? 'Free trial' : PLAN.name}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Price</p>
              <p className="font-semibold mt-1">₹{PLAN.priceInr} / month</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {entitlement.status === 'trial' ? 'Trial ends' : entitlement.status === 'active' ? 'Renews' : entitlement.status === 'expired' ? 'Ended' : 'Access until'}
              </p>
              <p className="font-semibold mt-1">
                {entitlement.status === 'trial' ? formatDate(entitlement.trialEndsAt) : entitlement.status === 'active' ? formatDate(entitlement.renewsAt) : formatDate(entitlement.endsAt || entitlement.trialEndsAt)}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {entitlement.status === 'trial' && `${entitlement.daysLeft} day${entitlement.daysLeft === 1 ? '' : 's'} of free trial left. Subscribe now and you will not be charged twice; the paid month starts today.`}
            {entitlement.status === 'active' && 'Thank you for supporting Prep. Cancel any time; access continues to the end of the paid month.'}
            {entitlement.status === 'cancelling' && `Your subscription is cancelled and access ends on ${formatDate(entitlement.endsAt)}. Subscribe again any time.`}
            {entitlement.status === 'past_due' && 'Razorpay could not collect the last payment and is retrying. Update your payment method from the Razorpay email, or subscribe again.'}
            {entitlement.status === 'expired' && 'Your trial has ended. Subscribe to keep using the learning platform, AI and the code runner.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {entitlement.status !== 'active' && (
              <button type="button" className="btn btn-primary" disabled={busy || !billing?.configured} onClick={() => void subscribe()}>
                {busy ? 'Opening checkout…' : `Subscribe · ₹${PLAN.priceInr}/month`}
              </button>
            )}
            {(entitlement.status === 'active' || entitlement.status === 'past_due') && (
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void cancel()}>
                Cancel subscription
              </button>
            )}
            {!billing?.configured && <span className="text-xs text-muted-foreground">Payments are not configured on this deployment yet.</span>}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
