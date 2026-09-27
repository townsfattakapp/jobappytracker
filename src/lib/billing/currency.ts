import { PLANS, type Plan } from './plan'

/**
 * Pass prices in the currencies Razorpay is asked to charge. Each currency has
 * deliberate price points (no live conversion): the same three passes, priced
 * once per currency by the owner. INR mirrors plan.ts; the others were set on
 * 2026-09-28 from the rupee prices at that day's rates, rounded to clean points.
 * Settlement is always in INR on the Razorpay side.
 */
export const CURRENCIES = ['INR', 'USD', 'AED', 'GBP', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

export const CURRENCY_INFO: Record<Currency, { label: string; symbol: string; locale: string; methods: string }> = {
  INR: { label: 'Indian rupee', symbol: '₹', locale: 'en-IN', methods: 'UPI, cards, net banking' },
  USD: { label: 'US dollar', symbol: '$', locale: 'en-US', methods: 'international cards' },
  AED: { label: 'UAE dirham', symbol: 'AED', locale: 'en-AE', methods: 'international cards' },
  GBP: { label: 'British pound', symbol: '£', locale: 'en-GB', methods: 'international cards' },
  EUR: { label: 'Euro', symbol: '€', locale: 'en-IE', methods: 'international cards' },
}

export interface PricePoint {
  price: number
  regular: number
}

export const PLAN_PRICES: Record<Currency, Record<Plan['id'], PricePoint>> = {
  INR: Object.fromEntries(PLANS.map((p) => [p.id, { price: p.priceInr, regular: p.mrpInr }])) as Record<Plan['id'], PricePoint>,
  USD: { quarter: { price: 5.99, regular: 9.99 }, half: { price: 10.99, regular: 14.99 }, year: { price: 16.99, regular: 24.99 } },
  AED: { quarter: { price: 22, regular: 37 }, half: { price: 40, regular: 55 }, year: { price: 62, regular: 92 } },
  GBP: { quarter: { price: 4.99, regular: 7.99 }, half: { price: 8.99, regular: 12.99 }, year: { price: 13.99, regular: 19.99 } },
  EUR: { quarter: { price: 5.49, regular: 8.99 }, half: { price: 9.99, regular: 13.99 }, year: { price: 15.99, regular: 22.99 } },
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value)
}

export function priceOf(plan: Pick<Plan, 'id'>, currency: Currency): PricePoint {
  return PLAN_PRICES[currency][plan.id]
}

/** Minor units (paise, cents, fils) as Razorpay expects them. */
export function amountMinor(plan: Pick<Plan, 'id'>, currency: Currency): number {
  return Math.round(priceOf(plan, currency).price * 100)
}

export function formatPrice(amount: number, currency: Currency): string {
  const info = CURRENCY_INFO[currency]
  const whole = Math.abs(amount - Math.round(amount)) < 0.005
  try {
    return new Intl.NumberFormat(info.locale, { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${info.symbol}${whole ? Math.round(amount) : amount.toFixed(2)}`
  }
}

export function perMonthIn(plan: Plan, currency: Currency): number {
  const monthly = priceOf(plan, currency).price / (plan.days / 30)
  return currency === 'INR' ? Math.round(monthly) : Math.round(monthly * 100) / 100
}

export function discountPercentIn(plan: Plan, currency: Currency): number {
  const p = priceOf(plan, currency)
  return Math.round((1 - p.price / p.regular) * 100)
}

const EURO_COUNTRIES = new Set(['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK'])

/** Currency for a visitor's country (ISO 3166-1 alpha-2); India stays INR, unknown countries get USD. */
export function currencyForCountry(country: string | null | undefined): Currency {
  const c = (country || '').toUpperCase()
  if (!c) return 'INR'
  if (c === 'IN') return 'INR'
  if (c === 'AE') return 'AED'
  if (c === 'GB') return 'GBP'
  if (EURO_COUNTRIES.has(c)) return 'EUR'
  return 'USD'
}

export interface PricedPlan {
  id: Plan['id']
  name: string
  days: number
  badge?: string
  price: number
  regular: number
  minor: number
  priceLabel: string
  regularLabel: string
  perMonthLabel: string
  discount: number
}

export interface Pricing {
  currency: Currency
  country: string | null
  options: { code: Currency; label: string }[]
  methods: string
  plans: PricedPlan[]
}

export function pricingFor(currency: Currency, country: string | null = null): Pricing {
  return {
    currency,
    country,
    options: CURRENCIES.map((code) => ({ code, label: CURRENCY_INFO[code].label })),
    methods: CURRENCY_INFO[currency].methods,
    plans: PLANS.map((plan) => {
      const p = priceOf(plan, currency)
      return { id: plan.id, name: plan.name, days: plan.days, badge: plan.badge, price: p.price, regular: p.regular, minor: amountMinor(plan, currency), priceLabel: formatPrice(p.price, currency), regularLabel: formatPrice(p.regular, currency), perMonthLabel: formatPrice(perMonthIn(plan, currency), currency), discount: discountPercentIn(plan, currency) }
    }),
  }
}
