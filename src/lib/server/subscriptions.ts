import { and, desc, eq, sql } from 'drizzle-orm'
import * as schema from '../db/schema'
import type { BillingProvider, CheckoutSession, NormalizedEvent } from '../billing/providers/types'
import { ValidationError } from '../jobs/normalize'
import { logEvent } from './log'
import { defaultPlan, getPlan, legacyPaidPlan, type PlanDto, type PlansDb } from './plans'

/**
 * Provider-independent subscription lifecycle:
 *   pending → trialing | active → past_due → active (recovered) | expired
 *   active → cancel_at_period_end → expired (period ends) | cancelled (provider ended it now)
 * Entitlements derive only from this table (plus legacy passes and the
 * operator allowlist), never from what a browser reports. Every webhook is
 * recorded in billing_events first; the (provider, eventId) unique key makes
 * replays no-ops.
 */

export type SubsDb = PlansDb
const { billingSubscriptions, billingEvents, subscriptions: legacyPasses } = schema
type Row = typeof billingSubscriptions.$inferSelect

/** Days a past_due subscription keeps access before it expires (provider retries usually resolve inside this). */
export const PAST_DUE_GRACE_DAYS = 7

export interface SubscriptionDto {
  id: string
  planId: string
  interval: 'month' | 'year'
  status: schema.SubscriptionStatus
  provider: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  cancelledAt: string | null
  trialEnd: string | null
  lastPaymentAt: string | null
  lastPaymentError: string | null
  createdAt: string
  updatedAt: string
  /** True while the subscription grants its plan's entitlements. */
  grantsAccess: boolean
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)

/** Whether a row grants access at `now`, from its stored state alone. */
export function grantsAccess(row: Pick<Row, 'status' | 'currentPeriodEnd' | 'trialEnd'>, now: Date): boolean {
  const end = row.currentPeriodEnd ?? row.trialEnd
  switch (row.status) {
    case 'active':
    case 'cancel_at_period_end':
    case 'trialing':
      return !end || end.getTime() > now.getTime()
    case 'past_due':
      return Boolean(end && end.getTime() + PAST_DUE_GRACE_DAYS * 86_400_000 > now.getTime())
    default:
      return false
  }
}

export function toDto(row: Row, now = new Date()): SubscriptionDto {
  return {
    id: row.id,
    planId: row.planId,
    interval: row.interval as 'month' | 'year',
    status: row.status,
    provider: row.provider,
    currentPeriodStart: iso(row.currentPeriodStart),
    currentPeriodEnd: iso(row.currentPeriodEnd),
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    cancelledAt: iso(row.cancelledAt),
    trialEnd: iso(row.trialEnd),
    lastPaymentAt: iso(row.lastPaymentAt),
    lastPaymentError: row.lastPaymentError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    grantsAccess: grantsAccess(row, now),
  }
}

/** The learner's most relevant subscription (access-granting first, then newest). */
export async function currentSubscription(db: SubsDb, userId: string, now = new Date()): Promise<SubscriptionDto | null> {
  const rows = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.userId, userId)).orderBy(desc(billingSubscriptions.updatedAt))
  const granting = rows.find((r) => grantsAccess(r, now))
  const chosen = granting ?? rows.find((r) => r.status !== 'pending') ?? rows[0]
  return chosen ? toDto(chosen, now) : null
}

export async function listSubscriptions(db: SubsDb, userId: string): Promise<SubscriptionDto[]> {
  const rows = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.userId, userId)).orderBy(desc(billingSubscriptions.createdAt))
  return rows.map((r) => toDto(r))
}

export interface ResolvedPlan {
  plan: PlanDto
  source: 'subscription' | 'legacy_pass' | 'allowlist' | 'default'
  subscription: SubscriptionDto | null
  /** ISO end of the current paid period when known. */
  accessEndsAt: string | null
}

function allowlisted(email: string | null | undefined): boolean {
  if (!email) return false
  return (process.env.BILLING_ALLOWLIST || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase())
}

/**
 * Trusted resolution of the plan an account is on: allowlist → active
 * subscription → legacy one-time pass → default plan. Read by every gate.
 */
export async function resolvePlanForUser(db: SubsDb, userId: string | null, email: string | null | undefined, now = new Date()): Promise<ResolvedPlan> {
  if (!userId) return { plan: await defaultPlan(db), source: 'default', subscription: null, accessEndsAt: null }
  if (allowlisted(email)) return { plan: await legacyPaidPlan(db), source: 'allowlist', subscription: null, accessEndsAt: null }
  const sub = await currentSubscription(db, userId, now)
  if (sub?.grantsAccess) {
    const plan = (await getPlan(db, sub.planId)) ?? (await legacyPaidPlan(db))
    return { plan, source: 'subscription', subscription: sub, accessEndsAt: sub.currentPeriodEnd ?? sub.trialEnd }
  }
  const [pass] = await db
    .select({ end: sql<Date | null>`max(${legacyPasses.currentEnd})` })
    .from(legacyPasses)
    .where(and(eq(legacyPasses.userId, userId), eq(legacyPasses.status, 'paid')))
  if (pass?.end && new Date(pass.end).getTime() > now.getTime()) return { plan: await legacyPaidPlan(db), source: 'legacy_pass', subscription: sub, accessEndsAt: new Date(pass.end).toISOString() }
  return { plan: await defaultPlan(db), source: 'default', subscription: sub, accessEndsAt: null }
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export async function startCheckout(db: SubsDb, provider: BillingProvider, input: { userId: string; email: string; name: string; planId: string; interval: 'month' | 'year' }, now = new Date()): Promise<{ subscription: SubscriptionDto; session: CheckoutSession }> {
  const plan = await getPlan(db, input.planId)
  if (!plan || !plan.active) throw new ValidationError('Choose a valid plan', 'planId')
  if (plan.isDefault || (plan.monthlyPriceMinor === 0 && plan.annualPriceMinor === 0)) throw new ValidationError('This plan needs no checkout', 'planId')
  const existing = await currentSubscription(db, input.userId, now)
  if (existing?.grantsAccess && existing.planId === plan.id && existing.interval === input.interval && !existing.cancelAtPeriodEnd) throw new ValidationError('You are already on this plan', 'planId')
  const amountMinor = input.interval === 'year' ? plan.annualPriceMinor : plan.monthlyPriceMinor
  if (amountMinor <= 0) throw new ValidationError(`This plan is not sold ${input.interval === 'year' ? 'annually' : 'monthly'}`, 'interval')
  const id = crypto.randomUUID()
  const session = await provider.createCheckout({ userId: input.userId, email: input.email, name: input.name, planId: plan.id, interval: input.interval, subscriptionId: id, amountMinor, currency: plan.currency, providerPlanId: plan.providerPlanIds[input.interval === 'year' ? 'annual' : 'monthly'] ?? null, trialDays: plan.trialDays })
  const [row] = await db
    .insert(billingSubscriptions)
    .values({ id, userId: input.userId, planId: plan.id, interval: input.interval, status: 'pending', provider: provider.id, providerSubscriptionId: session.providerSubscriptionId, createdAt: now, updatedAt: now })
    .returning()
  logEvent('info', 'billing.checkout_started', { userId: input.userId, subscriptionId: id, planId: plan.id, interval: input.interval, provider: provider.id })
  return { subscription: toDto(row, now), session }
}

// ---------------------------------------------------------------------------
// Webhooks and transitions
// ---------------------------------------------------------------------------

export type WebhookOutcome = { status: 'processed' | 'duplicate' | 'ignored' | 'rejected' | 'failed'; reason?: string; subscriptionId?: string | null; eventId?: string }

/** Verifies, records and applies a webhook. Safe to call with the same delivery any number of times. */
export async function processWebhook(db: SubsDb, provider: BillingProvider, rawBody: string, headers: Headers, now = new Date()): Promise<WebhookOutcome> {
  const parsed = provider.parseWebhook(rawBody, headers)
  if (!parsed.ok) {
    logEvent('warn', 'billing.webhook_rejected', { provider: provider.id, reason: parsed.reason })
    return { status: 'rejected', reason: parsed.reason }
  }
  const event = parsed.event
  const inserted = await db
    .insert(billingEvents)
    .values({ id: crypto.randomUUID(), provider: provider.id, eventId: event.eventId, eventType: event.rawType, payload: event.summary, signatureValid: true, status: 'received', receivedAt: now })
    .onConflictDoNothing()
    .returning({ id: billingEvents.id })
  if (!inserted.length) {
    logEvent('info', 'billing.webhook_duplicate', { provider: provider.id, eventId: event.eventId })
    return { status: 'duplicate', eventId: event.eventId }
  }
  const ledgerId = inserted[0].id
  try {
    const result = await applyEvent(db, event, now)
    await db.update(billingEvents).set({ status: result.status, error: result.reason ?? null, subscriptionId: result.subscriptionId ?? null, processedAt: new Date() }).where(eq(billingEvents.id, ledgerId))
    return { ...result, eventId: event.eventId }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await db.update(billingEvents).set({ status: 'failed', error: message, processedAt: new Date() }).where(eq(billingEvents.id, ledgerId))
    logEvent('error', 'billing.webhook_failed', { provider: provider.id, eventId: event.eventId, message })
    return { status: 'failed', reason: message, eventId: event.eventId }
  }
}

export async function applyEvent(db: SubsDb, event: NormalizedEvent, now = new Date()): Promise<WebhookOutcome> {
  if (event.type === 'ignored') return { status: 'ignored', reason: `event ${event.rawType} not handled` }
  if (!event.providerSubscriptionId) return { status: 'ignored', reason: 'no subscription id in event' }
  const row = await db.query.billingSubscriptions.findFirst({ where: and(eq(billingSubscriptions.provider, event.provider), eq(billingSubscriptions.providerSubscriptionId, event.providerSubscriptionId)) })
  if (!row) return { status: 'ignored', reason: 'unknown subscription' }
  const patch: Partial<typeof billingSubscriptions.$inferInsert> = { updatedAt: now }
  const before = row.status
  switch (event.type) {
    case 'subscription.activated':
    case 'subscription.charged':
      patch.status = row.cancelAtPeriodEnd ? 'cancel_at_period_end' : 'active'
      patch.currentPeriodStart = event.periodStart ?? now
      patch.currentPeriodEnd = event.periodEnd ?? new Date(now.getTime() + (row.interval === 'year' ? 365 : 30) * 86_400_000)
      patch.lastPaymentAt = now
      patch.lastPaymentError = null
      break
    case 'subscription.payment_failed':
      if (row.status === 'cancelled' || row.status === 'expired') return { status: 'ignored', reason: `payment failure after ${row.status}`, subscriptionId: row.id }
      patch.status = 'past_due'
      patch.lastPaymentError = event.failureReason ?? 'Payment failed'
      break
    case 'subscription.cancelled':
      // The provider ended it now (or at cycle end if we asked): access ends when the paid period ends.
      patch.status = row.currentPeriodEnd && row.currentPeriodEnd.getTime() > now.getTime() ? 'cancel_at_period_end' : 'cancelled'
      patch.cancelAtPeriodEnd = true
      patch.cancelledAt = row.cancelledAt ?? now
      break
    case 'subscription.completed':
    case 'subscription.expired':
      patch.status = 'expired'
      break
    case 'subscription.paused':
      patch.status = 'past_due'
      patch.lastPaymentError = 'Paused by the provider'
      break
  }
  await db.update(billingSubscriptions).set(patch).where(eq(billingSubscriptions.id, row.id))
  if (patch.status && patch.status !== before) logEvent('info', 'billing.subscription_state', { subscriptionId: row.id, userId: row.userId, from: before, to: patch.status, event: event.rawType })
  return { status: 'processed', subscriptionId: row.id }
}

/** Learner action: stop renewals; access continues to the end of the paid period. */
export async function cancelRenewal(db: SubsDb, provider: BillingProvider | null, userId: string, subscriptionId: string, now = new Date()): Promise<SubscriptionDto> {
  const row = await db.query.billingSubscriptions.findFirst({ where: and(eq(billingSubscriptions.id, subscriptionId), eq(billingSubscriptions.userId, userId)) })
  if (!row) throw new ValidationError('Subscription not found', 'subscriptionId')
  if (!grantsAccess(row, now) || row.status === 'cancel_at_period_end') throw new ValidationError('This subscription is not renewing', 'subscriptionId')
  if (provider && row.providerSubscriptionId) await provider.cancelAtPeriodEnd(row.providerSubscriptionId)
  const [updated] = await db.update(billingSubscriptions).set({ status: 'cancel_at_period_end', cancelAtPeriodEnd: true, cancelledAt: now, updatedAt: now }).where(eq(billingSubscriptions.id, row.id)).returning()
  logEvent('info', 'billing.subscription_state', { subscriptionId: row.id, userId, from: row.status, to: 'cancel_at_period_end', event: 'learner.cancel_renewal' })
  return toDto(updated, now)
}

/** Marks subscriptions whose paid period (plus grace for past_due) has ended as expired. Safe to repeat. */
export async function expireLapsed(db: SubsDb, now = new Date()): Promise<number> {
  const rows = await db.select().from(billingSubscriptions).where(sql`${billingSubscriptions.status} in ('active','trialing','past_due','cancel_at_period_end')`)
  let n = 0
  for (const row of rows) {
    if (grantsAccess(row, now)) continue
    await db.update(billingSubscriptions).set({ status: 'expired', updatedAt: now }).where(eq(billingSubscriptions.id, row.id))
    logEvent('info', 'billing.subscription_state', { subscriptionId: row.id, userId: row.userId, from: row.status, to: 'expired', event: 'sweep' })
    n += 1
  }
  return n
}

/** Admin/ops view of webhook health. */
export async function webhookHealth(db: SubsDb, sinceDays = 7): Promise<{ counts: Record<string, number>; failed: { id: string; provider: string; eventId: string; eventType: string; status: string; error: string | null; receivedAt: string }[]; lastReceivedAt: string | null }> {
  const since = new Date(Date.now() - sinceDays * 86_400_000)
  const rows = await db.select({ status: billingEvents.status, count: sql<number>`count(*)::int` }).from(billingEvents).where(sql`${billingEvents.receivedAt} > ${since}`).groupBy(billingEvents.status)
  const failed = await db.select().from(billingEvents).where(sql`${billingEvents.status} in ('failed','rejected')`).orderBy(desc(billingEvents.receivedAt)).limit(25)
  const [last] = await db.select({ at: sql<Date | null>`max(${billingEvents.receivedAt})` }).from(billingEvents)
  return {
    counts: Object.fromEntries(rows.map((r) => [r.status, r.count])),
    failed: failed.map((f) => ({ id: f.id, provider: f.provider, eventId: f.eventId, eventType: f.eventType, status: f.status, error: f.error, receivedAt: f.receivedAt.toISOString() })),
    lastReceivedAt: last?.at ? new Date(last.at).toISOString() : null,
  }
}
