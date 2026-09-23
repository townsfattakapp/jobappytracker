import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { getEntitlement } from '../../../../lib/server/entitlement'
import { isRazorpayConfigured, razorpayConfig } from '../../../../lib/server/razorpay'
import { PLANS, PRODUCT_NAME } from '../../../../lib/billing/plan'

export const dynamic = 'force-dynamic'

/** Plans, checkout configuration and the signed-in account's access. */
export async function GET() {
  const session = await auth()
  const configured = isRazorpayConfigured()
  const base = { configured, keyId: configured ? razorpayConfig().keyId : null, product: PRODUCT_NAME, plans: PLANS }
  if (!session?.user?.id) return NextResponse.json({ ...base, signedIn: false, entitlement: null })
  const entitlement = await getEntitlement(session.user.id, session.user.email)
  return NextResponse.json({ ...base, signedIn: true, entitlement })
}
