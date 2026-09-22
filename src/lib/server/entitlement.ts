import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { db } from '../db'
import { subscriptions, users } from '../db/schema'
import { computeEntitlement, type Entitlement, type SubscriptionInfo } from '../billing/entitlement'
import { PLAN } from '../billing/plan'

function trialDays(): number {
  const n = Number(process.env.TRIAL_DAYS)
  return Number.isFinite(n) && n >= 0 ? n : PLAN.trialDays
}

export async function latestSubscription(userId: string): Promise<SubscriptionInfo | null> {
  const row = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId), orderBy: [desc(subscriptions.createdAt)] })
  if (!row) return null
  return {
    id: row.id,
    status: row.status,
    currentEnd: row.currentEnd ? row.currentEnd.toISOString() : null,
    chargeAt: row.chargeAt ? row.chargeAt.toISOString() : null,
    cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
  }
}

export async function getEntitlement(userId: string): Promise<Entitlement> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { createdAt: true } })
  const createdAt = user?.createdAt ?? new Date()
  return computeEntitlement(createdAt, await latestSubscription(userId), new Date(), trialDays())
}

export const SIGN_IN_MESSAGE = 'Sign in to use this feature.'
export const SUBSCRIBE_MESSAGE = 'Your free trial has ended. Subscribe to Prep Pro to keep going.'

/**
 * Gate for paid API routes. Resolves to the session and entitlement, or a
 * ready-made error response (401 when signed out, 402 when access has lapsed).
 */
export async function requireAccess(): Promise<{ userId: string; email: string; entitlement: Entitlement } | NextResponse> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: SIGN_IN_MESSAGE, code: 'sign_in' }, { status: 401 })
  const entitlement = await getEntitlement(userId)
  if (!entitlement.access) return NextResponse.json({ error: SUBSCRIBE_MESSAGE, code: 'subscribe', entitlement }, { status: 402 })
  return { userId, email: session.user?.email || '', entitlement }
}
