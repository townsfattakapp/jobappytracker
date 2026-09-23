import { useState } from 'react'
import PlanCards from './PlanCards'
import { planById, PRODUCT_NAME, type Plan } from '../lib/billing/plan'
import { formatDate, PAYMENT_CANCELLED, purchasePlan, type BillingState } from '../lib/billing/client'
import type { Entitlement } from '../lib/billing/entitlement'

interface SubscriptionPanelProps {
  billing: BillingState | null
  signedIn: boolean
  onSignIn: () => void
  onChange: (entitlement: Entitlement) => void
  onToast: (message: string) => void
}

/** Settings block: current pass and the option to extend it. */
export default function SubscriptionPanel({ billing, signedIn, onSignIn, onChange, onToast }: SubscriptionPanelProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPlans, setShowPlans] = useState(false)
  const entitlement = billing?.entitlement ?? null
  const plan = planById(entitlement?.planId)

  const buy = async (chosen: Plan) => {
    setError(null)
    setBusy(chosen.id)
    try {
      onChange(await purchasePlan(chosen.id))
      setShowPlans(false)
      onToast(`${chosen.name} added to your pass`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start the payment'
      if (message !== PAYMENT_CANCELLED) setError(message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="surface rounded-2xl p-6 border border-border space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <h2 className="text-xl font-bold">Your plan</h2>
        {entitlement && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${entitlement.access ? 'bg-emerald-500/15 text-emerald-500' : 'bg-destructive/15 text-destructive'}`}>
            {entitlement.complimentary ? 'Complimentary' : entitlement.access ? 'Active' : 'Expired'}
          </span>
        )}
      </div>

      {!signedIn ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{PRODUCT_NAME} passes start at ₹199 for 90 days. Create an account to choose one.</p>
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pass</p>
              <p className="font-semibold mt-1">{entitlement.complimentary ? 'Complimentary access' : plan ? `${PRODUCT_NAME} · ${plan.name}` : 'None yet'}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{entitlement.access ? 'Access until' : 'Ended'}</p>
              <p className="font-semibold mt-1">{entitlement.complimentary ? 'No end date' : formatDate(entitlement.endsAt) || '—'}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Days left</p>
              <p className="font-semibold mt-1">{entitlement.complimentary ? '∞' : entitlement.daysLeft}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {entitlement.complimentary
              ? 'This account has been granted access by the team.'
              : entitlement.access
                ? 'Passes never auto-renew. Buying another one adds its days to the end of your current pass.'
                : 'Your pass has ended. Choose a plan below to continue; everything you saved is still here.'}
          </p>

          {!entitlement.complimentary && (
            <div className="space-y-3">
              {!showPlans && (
                <button type="button" className="btn btn-primary" onClick={() => setShowPlans(true)}>
                  {entitlement.access ? 'Extend my pass' : 'Choose a plan'}
                </button>
              )}
              {showPlans && (
                <>
                  <PlanCards onSelect={(p) => void buy(p)} busyPlanId={busy} disabled={Boolean(busy) || !billing?.configured} compact ctaLabel={(p) => (entitlement.access ? `Add ${p.name}` : `Get ${p.name}`)} />
                  {!billing?.configured && <p className="text-xs text-muted-foreground">Payments are not configured on this deployment yet.</p>}
                </>
              )}
            </div>
          )}
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
