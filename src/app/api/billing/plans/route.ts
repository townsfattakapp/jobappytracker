import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { activeProvider } from '../../../../lib/billing/providers'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { resolveAccess } from '../../../../lib/server/entitlements'
import { listPlans } from '../../../../lib/server/plans'

export const dynamic = 'force-dynamic'

/** Public pricing data: active plans plus, for a signed-in caller, the plan they are on and how it was resolved. */
export async function GET() {
  try {
    const [plans, access] = await Promise.all([listPlans(db, { activeOnly: true }), resolveAccess()])
    const provider = activeProvider()
    return NextResponse.json({
      plans: plans.map((p) => ({ id: p.id, displayName: p.displayName, description: p.description, monthlyPriceMinor: p.monthlyPriceMinor, annualPriceMinor: p.annualPriceMinor, currency: p.currency, highlighted: p.highlighted, isDefault: p.isDefault, features: p.features, limits: p.limits, trialDays: p.trialDays })),
      current: { planId: access.config.plan.id, source: access.config.planSource, accessEndsAt: access.config.accessEndsAt, signedIn: access.config.signedIn },
      billing: { provider: provider?.id ?? null, configured: Boolean(provider), testMode: provider?.id === 'fixture' },
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/billing/plans')
  }
}
