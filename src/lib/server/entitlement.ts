import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { db } from '../db'
import { subscriptions, users } from '../db/schema'
import { computeEntitlement, extendedUntil, type Entitlement } from '../billing/entitlement'
import { planById } from '../billing/plan'

/** Emails that always have access (operators, testers): BILLING_ALLOWLIST="a@x.com,b@y.com". */
function allowlisted(email: string | null | undefined): boolean {
  if (!email) return false
  const list = (process.env.BILLING_ALLOWLIST || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}

/** The furthest paid-until date across all paid passes, and the latest plan. */
export async function paidState(userId: string): Promise<{ paidUntil: Date | null; planId: string | null }> {
  const rows = await db.query.subscriptions.findMany({
    where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'paid')),
    orderBy: [desc(subscriptions.currentEnd)],
  })
  const paidUntil = rows.reduce<Date | null>((max, r) => (r.currentEnd && (!max || r.currentEnd > max) ? r.currentEnd : max), null)
  return { paidUntil, planId: rows[0]?.planId ?? null }
}

export async function getEntitlement(userId: string, email?: string | null): Promise<Entitlement> {
  let userEmail = email
  if (userEmail === undefined) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { email: true } })
    userEmail = user?.email
  }
  const { paidUntil, planId } = await paidState(userId)
  return computeEntitlement(paidUntil, planId, new Date(), allowlisted(userEmail))
}

/**
 * Marks an order as paid and extends access by the plan length. Idempotent:
 * the checkout handler and the webhook may both call it for the same order.
 */
export async function grantOrder(orderId: string, paymentId: string | null): Promise<boolean> {
  const row = await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, orderId) })
  if (!row) return false
  if (row.status === 'paid') return true
  const plan = planById(row.planId)
  if (!plan) return false
  const { paidUntil } = await paidState(row.userId)
  const now = new Date()
  const start = paidUntil && paidUntil > now ? paidUntil : now
  await db
    .update(subscriptions)
    .set({ status: 'paid', currentStart: start, currentEnd: extendedUntil(paidUntil, plan.days, now), lastPaymentId: paymentId ?? row.lastPaymentId, updatedAt: now })
    .where(and(eq(subscriptions.id, orderId), eq(subscriptions.status, row.status)))
  return true
}

export const SIGN_IN_MESSAGE = 'Sign in to use this feature.'
export const SUBSCRIBE_MESSAGE = 'Choose a plan to unlock the learning platform, AI and the code runner.'

/**
 * Gate for paid API routes. Resolves to the session and entitlement, or a
 * ready-made error response (401 when signed out, 402 without paid access).
 */
export async function requireAccess(): Promise<{ userId: string; email: string; entitlement: Entitlement } | NextResponse> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: SIGN_IN_MESSAGE, code: 'sign_in' }, { status: 401 })
  const entitlement = await getEntitlement(userId, session.user?.email)
  if (!entitlement.access) return NextResponse.json({ error: SUBSCRIBE_MESSAGE, code: 'subscribe', entitlement }, { status: 402 })
  return { userId, email: session.user?.email || '', entitlement }
}
