import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { providerById } from '../../../../../lib/billing/providers'
import { errorResponse } from '../../../../../lib/server/apiErrors'
import { processWebhook } from '../../../../../lib/server/subscriptions'

export const dynamic = 'force-dynamic'

/**
 * Subscription webhooks, one URL per provider (for Razorpay:
 * https://<domain>/api/billing/webhooks/razorpay with the subscription.*
 * events). Signature is verified before anything is parsed; deliveries are
 * recorded and de-duplicated by event id. Always answers 200 for accepted
 * deliveries so providers stop retrying; rejected signatures get 400.
 */
export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  try {
    const { provider: id } = await ctx.params
    const provider = providerById(id)
    if (!provider || !provider.isConfigured()) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const raw = await req.text()
    const outcome = await processWebhook(db, provider, raw, req.headers)
    if (outcome.status === 'rejected') return NextResponse.json({ error: outcome.reason === 'invalid_body' ? 'Invalid body' : 'Invalid signature' }, { status: 400 })
    return NextResponse.json({ ok: true, ...outcome })
  } catch (error) {
    return errorResponse(error, 'POST /api/billing/webhooks/[provider]')
  }
}
