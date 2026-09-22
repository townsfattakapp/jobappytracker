import { useState } from 'react'
import { BrandMark } from './BrandLogo'
import { PLAN } from '../lib/billing/plan'
import { startSubscription, type BillingState } from '../lib/billing/client'
import type { Entitlement } from '../lib/billing/entitlement'

interface PaywallProps {
  billing: BillingState
  email: string
  onSubscribed: (entitlement: Entitlement) => void
  onSignOut: () => void
}

/** Full-screen gate shown to signed-in accounts whose trial has ended. */
export default function Paywall({ billing, email, onSubscribed, onSignOut }: PaywallProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subscribe = async () => {
    setError(null)
    setBusy(true)
    try {
      const entitlement = await startSubscription()
      onSubscribed(entitlement)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start the subscription'
      if (message !== 'Payment cancelled') setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-background/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
      <div className="w-full max-w-lg bg-card/95 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto">
        <div className="absolute top-0 left-0 w-full h-1 ig-gradient" />
        <div className="flex items-center gap-3 mb-5">
          <BrandMark size={40} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Prep by EVOLW</p>
            <h2 id="paywall-title" className="text-2xl font-display font-bold leading-tight">
              Your free trial has ended
            </h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Keep your plan, notes, attempts and progress for <span className="font-semibold text-foreground">{email}</span> with {PLAN.name}. Cancel any time; access runs to the end of the paid month.
        </p>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-extrabold text-gradient">₹{PLAN.priceInr}</span>
            <span className="text-sm text-muted-foreground">per month · billed via Razorpay</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {PLAN.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-primary font-bold" aria-hidden="true">
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {billing.configured ? (
          <button type="button" className="btn btn-primary w-full text-base py-3" disabled={busy} onClick={() => void subscribe()}>
            {busy ? 'Opening secure checkout…' : `Subscribe · ₹${PLAN.priceInr}/month`}
          </button>
        ) : (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">Payments are being set up on this deployment. Please check back soon.</p>
        )}
        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <p className="mt-4 text-[11px] text-muted-foreground">
          Payments are processed by Razorpay; card details never touch our servers. AI features use your own OpenAI or Groq key, stored encrypted in your account.
        </p>
        <button type="button" onClick={onSignOut} className="mt-5 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
