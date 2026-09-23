import { discountPercent, perMonth, PLANS, type Plan } from '../lib/billing/plan'

interface PlanCardsProps {
  /** Called with the chosen plan; when omitted, cards link to `href`. */
  onSelect?: (plan: Plan) => void
  href?: string
  busyPlanId?: string | null
  disabled?: boolean
  compact?: boolean
  ctaLabel?: (plan: Plan) => string
}

/** The three passes with list price, discount and per-month equivalent. */
export default function PlanCards({ onSelect, href = '/app', busyPlanId = null, disabled = false, compact = false, ctaLabel }: PlanCardsProps) {
  return (
    <div className={`plan-grid ${compact ? 'is-compact' : ''}`}>
      {PLANS.map((plan) => {
        const label = ctaLabel ? ctaLabel(plan) : `Get ${plan.name}`
        const busy = busyPlanId === plan.id
        return (
          <div key={plan.id} className={`plan-card ${plan.badge ? 'is-featured' : ''}`}>
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            <p className="plan-name">{plan.name}</p>
            <p className="plan-price">
              <span className="plan-mrp">₹{plan.mrpInr}</span>
              <span className="plan-amount text-gradient">₹{plan.priceInr}</span>
            </p>
            <p className="plan-meta">
              <span className="plan-discount">{discountPercent(plan)}% off</span> · about ₹{perMonth(plan)}/month
            </p>
            {onSelect ? (
              <button type="button" className={`btn ${plan.badge ? 'btn-primary' : 'btn-ghost'} w-full mt-4`} disabled={disabled || busy} onClick={() => onSelect(plan)}>
                {busy ? 'Opening secure checkout…' : label}
              </button>
            ) : (
              <a href={href} className={`btn ${plan.badge ? 'btn-primary' : 'btn-ghost'} w-full mt-4`}>
                {label}
              </a>
            )}
            <p className="plan-fine">One payment · no auto-renew · UPI, cards, net banking</p>
          </div>
        )
      })}
    </div>
  )
}
