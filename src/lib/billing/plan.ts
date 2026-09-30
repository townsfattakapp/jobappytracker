/**
 * Paid access is sold as fixed-length passes (one payment, no auto-renew).
 * Prices are in rupees for display and paise for Razorpay.
 */
export interface Plan {
  id: 'quarter' | 'half' | 'year'
  name: string
  days: number
  priceInr: number
  /** List price shown struck through. */
  mrpInr: number
  badge?: string
}

export const PLANS: Plan[] = [
  { id: 'quarter', name: '90 days', days: 90, priceInr: 299, mrpInr: 499 },
  { id: 'half', name: '180 days', days: 180, priceInr: 599, mrpInr: 799, badge: 'Most popular' },
  { id: 'year', name: '1 year', days: 365, priceInr: 999, mrpInr: 1499, badge: 'Best value' },
]

export const PRODUCT_NAME = 'Prep Pro'

export const PLAN_FEATURES = [
  'Company-specific interview war rooms: ATS gap scan & 7-day tactical battle plans',
  'Resume Bullet Surgery: tailored STAR-format rewrites with production metrics',
  'Interactive AI mock interviews with voice, real-time critique and retry coaching drills',
  'Turnkey AI access included out of the box — zero API key setup required',
  '157 complete engineering tracks: DSA, Java, Spring Boot, React, Node, System Design, DevOps',
  'Code runner for Java, Python, C++, Go, TypeScript and JavaScript',
  'Job discovery & application tracker with Gmail sync and company interview notes',
  'Cloud sync across every device',
]

export function planById(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export function discountPercent(plan: Plan): number {
  return Math.round((1 - plan.priceInr / plan.mrpInr) * 100)
}

export function perMonth(plan: Plan): number {
  return Math.round(plan.priceInr / (plan.days / 30))
}

export function amountPaise(plan: Plan): number {
  return plan.priceInr * 100
}
