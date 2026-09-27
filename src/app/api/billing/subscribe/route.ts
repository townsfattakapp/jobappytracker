import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { subscriptions } from '../../../../lib/db/schema'
import { createOrder, isCurrencyRejected, isRazorpayConfigured, razorpayConfig } from '../../../../lib/server/razorpay'
import { planById, PRODUCT_NAME } from '../../../../lib/billing/plan'
import { formatPrice, isCurrency, priceOf, type Currency } from '../../../../lib/billing/currency'
import { currencyFromRequest } from '../../../../lib/server/currency'
import { logEvent } from '../../../../lib/server/log'

export const dynamic = 'force-dynamic'

/** Creates a Razorpay order for a plan and returns what Checkout needs. */
export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to choose a plan.' }, { status: 401 })
  if (!isRazorpayConfigured()) return NextResponse.json({ error: 'Payments are not configured on this deployment yet.' }, { status: 503 })

  const body = (await req.json().catch(() => null)) as { planId?: unknown; currency?: unknown } | null
  const plan = planById(typeof body?.planId === 'string' ? body.planId : null)
  if (!plan) return NextResponse.json({ error: 'Choose a valid plan.' }, { status: 400 })

  const requested: Currency = isCurrency(body?.currency) ? body.currency : currencyFromRequest(req).currency
  try {
    const email = session.user?.email || ''
    let currency: Currency = requested
    let order
    try {
      order = await createOrder(plan, userId, email, currency)
    } catch (err) {
      // A currency the Razorpay account has not enabled yet: charge in INR rather than block the purchase.
      if (currency === 'INR' || !isCurrencyRejected(err)) throw err
      logEvent('warn', 'billing.currency_fallback', { requested: currency, reason: err instanceof Error ? err.message : String(err) })
      currency = 'INR'
      order = await createOrder(plan, userId, email, currency)
    }
    await db.insert(subscriptions).values({ id: order.id, userId, planId: plan.id, status: 'created', amountPaise: order.amount, currency: order.currency }).onConflictDoNothing()
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      requestedCurrency: requested,
      keyId: razorpayConfig().keyId,
      name: PRODUCT_NAME,
      description: `${PRODUCT_NAME} · ${plan.name} · ${formatPrice(priceOf(plan, currency).price, currency)}`,
      email,
      userName: session.user?.name || '',
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not start the payment' }, { status: 502 })
  }
}
