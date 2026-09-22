import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { getEntitlement } from '../../../../lib/server/entitlement'
import { isRazorpayConfigured, razorpayConfig } from '../../../../lib/server/razorpay'
import { PLAN } from '../../../../lib/billing/plan'

export const dynamic = 'force-dynamic'

/** Current plan state for the signed-in user plus what the checkout needs. */
export async function GET() {
  const session = await auth()
  const configured = isRazorpayConfigured()
  const plan = { name: PLAN.name, priceInr: PLAN.priceInr, period: PLAN.period, trialDays: PLAN.trialDays }
  if (!session?.user?.id) return NextResponse.json({ signedIn: false, configured, plan, entitlement: null })
  const entitlement = await getEntitlement(session.user.id)
  return NextResponse.json({ signedIn: true, configured, keyId: configured ? razorpayConfig().keyId : null, plan, entitlement })
}
