import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { listReceipts } from '../../../../lib/server/receipts'

export const dynamic = 'force-dynamic'

/** The signed-in learner's receipts (one per paid pass), newest first. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const receipts = await listReceipts(session.user.id)
  return NextResponse.json({ receipts: receipts.map((r) => ({ id: r.id, number: r.number, plan: r.plan, days: r.days, amount: r.amount, currency: r.currency, amountInr: r.currency === 'INR' ? r.amount : null, paidAt: r.paidAt, paymentId: r.paymentId, periodStart: r.periodStart, periodEnd: r.periodEnd, buyerEmail: r.buyerEmail })) })
}
