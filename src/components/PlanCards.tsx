'use client'

import { PLANS, type Plan } from '../lib/billing/plan'
import { CURRENCY_INFO, type Currency, type PricedPlan } from '../lib/billing/currency'
import { usePricing } from '../lib/billing/usePricing'

interface PlanCardsProps {
  /** Called with the chosen plan and its currency; when omitted, cards link to `href`. */
  onSelect?: (plan: Plan, currency: Currency) => void
  href?: string
  busyPlanId?: string | null
  disabled?: boolean
  compact?: boolean
  /** Label for the button; `priced` carries the formatted price in the visitor's currency. */
  ctaLabel?: (plan: Plan, priced: PricedPlan) => string
  /** Hide the currency switcher (it is shown once per page by default). */
  hideSwitcher?: boolean
}

/**
 * The three passes in the visitor's currency: the price paid, the regular
 * price struck through, the per-month equivalent and the discount. Prices are
 * fixed points per currency (never live conversion) and the choice sticks.
 */
export default function PlanCards({ onSelect, href = '/app', busyPlanId = null, disabled = false, compact = false, ctaLabel, hideSwitcher = false }: PlanCardsProps) {
  const { pricing, setCurrency } = usePricing()
  return (
    <div className={`plan-cards ${compact ? 'is-compact' : ''}`}>
      {!hideSwitcher && (
        <div className="plan-currency">
          <label>
            <span>Prices in</span>
            <select className="input-field" value={pricing.currency} onChange={(e) => void setCurrency(e.target.value as Currency)} aria-label="Currency">
              {pricing.options.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.code} · {CURRENCY_INFO[o.code].label}
                </option>
              ))}
            </select>
          </label>
          {pricing.currency !== 'INR' && <span className="plan-currency-note">Charged in {pricing.currency} through Razorpay; the price shown is the price you pay.</span>}
        </div>
      )}
      <div className={`plan-grid ${compact ? 'is-compact' : ''}`}>
        {PLANS.map((plan) => {
          const priced = pricing.plans.find((p) => p.id === plan.id) ?? pricing.plans[0]
          const label = ctaLabel ? ctaLabel(plan, priced) : `Get ${plan.name}`
          const busy = busyPlanId === plan.id
          return (
            <div key={plan.id} className={`plan-card ${plan.badge ? 'is-featured' : ''}`}>
              {plan.badge && <span className="plan-badge">{plan.badge}</span>}
              <p className="plan-name">{plan.name}</p>
              <p className="plan-price">
                <span className="plan-mrp" aria-label={`Regular price ${priced.regularLabel}`}>
                  {priced.regularLabel}
                </span>
                <span className="plan-amount text-gradient">{priced.priceLabel}</span>
              </p>
              <p className="plan-meta">
                {plan.days} days of access · about {priced.perMonthLabel} a month · {priced.discount}% off the regular price
              </p>
              {onSelect ? (
                <button type="button" className={`btn ${plan.badge ? 'btn-primary' : 'btn-ghost'} w-full mt-4`} disabled={disabled || busy} onClick={() => onSelect(plan, pricing.currency)}>
                  {busy ? 'Opening secure checkout…' : label}
                </button>
              ) : (
                <a href={href} className={`btn ${plan.badge ? 'btn-primary' : 'btn-ghost'} w-full mt-4`}>
                  {label}
                </a>
              )}
              <p className="plan-fine">One payment · no auto-renew · {pricing.methods}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
