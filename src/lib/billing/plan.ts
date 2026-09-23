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
  { id: 'quarter', name: '90 days', days: 90, priceInr: 199, mrpInr: 499 },
  { id: 'half', name: '180 days', days: 180, priceInr: 424, mrpInr: 699, badge: 'Most popular' },
  { id: 'year', name: '1 year', days: 365, priceInr: 799, mrpInr: 1999, badge: 'Best value' },
]

export const PRODUCT_NAME = 'Prep Pro'

export const PLAN_FEATURES = [
  'Every learning track: DSA, Java, JavaScript, React, Node, SQL, system design, CS fundamentals, DevOps',
  'Personal day-by-day plan with spaced revision',
  'AI lessons, worked examples, diagrams, quizzes and the AI tutor, using your own OpenAI or Groq key',
  'Realistic AI mock interviews with voice, timers and a scorecard',
  'Code runner for Java, Python, C++, Go, TypeScript and JavaScript',
  'Job tracker with Gmail sync and interview prep notes',
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
