import { NextResponse } from 'next/server'
import { isCurrency, pricingFor } from '../../../../lib/billing/currency'
import { currencyCookie, currencyFromRequest } from '../../../../lib/server/currency'

export const dynamic = 'force-dynamic'

/** The three passes priced in the visitor's currency (detected from the country, or chosen). Public. */
export async function GET(req: Request) {
  const { currency, country, chosen } = currencyFromRequest(req)
  return NextResponse.json({ ...pricingFor(currency, country), chosen })
}

/** Body { currency }: remembers the visitor's choice in a cookie for a year and returns the prices in it. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { currency?: unknown } | null
  if (!body || !isCurrency(body.currency)) return NextResponse.json({ error: 'Choose a supported currency.' }, { status: 400 })
  const { country } = currencyFromRequest(req)
  const res = NextResponse.json({ ...pricingFor(body.currency, country), chosen: true })
  res.headers.append('Set-Cookie', currencyCookie(body.currency))
  return res
}
