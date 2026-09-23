import { useState } from 'react'
import { BrandMark } from './BrandLogo'
import PlanCards from './PlanCards'
import { PLAN_FEATURES, PRODUCT_NAME, type Plan } from '../lib/billing/plan'
import { PAYMENT_CANCELLED, purchasePlan, type BillingState } from '../lib/billing/client'
import type { Entitlement } from '../lib/billing/entitlement'

interface PaywallProps {
  billing: BillingState
  email: string
  onPurchased: (entitlement: Entitlement) => void
  onSignOut: () => void
}

/** Full-screen gate for signed-in accounts without an active pass. */
export default function Paywall({ billing, email, onPurchased, onSignOut }: PaywallProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lapsed = Boolean(billing.entitlement?.endsAt)

  const choose = async (plan: Plan) => {
    setError(null)
    setBusy(plan.id)
    try {
      onPurchased(await purchasePlan(plan.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start the payment'
      if (message !== PAYMENT_CANCELLED) setError(message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-background/85 backdrop-blur-xl flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
      <div className="w-full max-w-3xl bg-card/95 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto">
        <div className="absolute top-0 left-0 w-full h-1 ig-gradient" />
        <div className="flex items-center gap-3 mb-4">
          <BrandMark size={40} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{PRODUCT_NAME}</p>
            <h2 id="paywall-title" className="text-2xl font-display font-bold leading-tight">
              {lapsed ? 'Your pass has ended' : 'Choose your plan'}
            </h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {lapsed ? 'Everything is saved. Pick a pass to pick up where you left off.' : 'One payment for the whole period. Everything below is included, and your data syncs to every device.'}{' '}
          Signed in as <span className="font-semibold text-foreground">{email}</span>.
        </p>

        <PlanCards onSelect={(plan) => void choose(plan)} busyPlanId={busy} disabled={Boolean(busy) || !billing.configured} compact />
        {!billing.configured && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">Payments are being set up on this deployment. Please check back soon.</p>
        )}
        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 text-sm">
          {PLAN_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="text-primary font-bold" aria-hidden="true">
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[11px] text-muted-foreground">
          Payments are processed by Razorpay; card details never touch our servers. AI features use your own OpenAI or Groq key, stored encrypted in your account.
        </p>
        <button type="button" onClick={onSignOut} className="mt-4 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
