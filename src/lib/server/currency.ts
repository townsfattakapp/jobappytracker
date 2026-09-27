import { currencyForCountry, isCurrency, type Currency } from '../billing/currency'

export const CURRENCY_COOKIE = 'prep-currency'

/**
 * The currency to show and charge a visitor: an explicit choice (cookie set by
 * the pricing switcher) wins, then the country Vercel attaches to the request,
 * then INR. Local development has no country header and therefore stays INR.
 */
export function currencyFromRequest(req: Request): { currency: Currency; country: string | null; chosen: boolean } {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${CURRENCY_COOKIE}=([A-Z]{3})`))
  const country = req.headers.get('x-vercel-ip-country')
  if (match && isCurrency(match[1])) return { currency: match[1], country, chosen: true }
  return { currency: currencyForCountry(country), country, chosen: false }
}

export function currencyCookie(currency: Currency): string {
  return `${CURRENCY_COOKIE}=${currency}; Path=/; Max-Age=31536000; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}
