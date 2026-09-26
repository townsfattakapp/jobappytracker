// Phase 5: plans, subscription lifecycle, webhook signature verification and
// idempotency, entitlement activation/revocation, checkout authorization,
// fixture token safety, cron authentication, log redaction, notification
// templates. The subscription service runs on a disposable PGlite database
// migrated with the real migration files.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-secret-for-billing-fixture'
delete process.env.RAZORPAY_KEY_ID
await build({
  entryPoints: {
    plans: 'src/lib/server/plans.ts',
    subscriptions: 'src/lib/server/subscriptions.ts',
    fixture: 'src/lib/billing/providers/fixture.ts',
    razorpay: 'src/lib/billing/providers/razorpay.ts',
    providers: 'src/lib/billing/providers/index.ts',
    cronAuth: 'src/lib/server/cronAuth.ts',
    log: 'src/lib/server/log.ts',
    schema: 'src/lib/db/schema.ts',
  },
  outdir: 'scratch/billing5-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [{ name: 'stub-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const db = {}' })) } }],
  logLevel: 'silent',
})
const plans = await import('../scratch/billing5-tests/plans.mjs')
const subs = await import('../scratch/billing5-tests/subscriptions.mjs')
const fixture = await import('../scratch/billing5-tests/fixture.mjs')
const razorpay = await import('../scratch/billing5-tests/razorpay.mjs')
const providers = await import('../scratch/billing5-tests/providers.mjs')
const { cronAuthorized } = await import('../scratch/billing5-tests/cronAuth.mjs')
const log = await import('../scratch/billing5-tests/log.mjs')
const schema = await import('../scratch/billing5-tests/schema.mjs')
import { createHmac } from 'node:crypto'

async function freshDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
  for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
  await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
  await db.insert(schema.users).values([{ id: 'u1', email: 'one@example.invalid' }, { id: 'u2', email: 'two@example.invalid' }])
  return { client, db }
}
const NOW = new Date('2026-09-25T12:00:00Z')
const learner = { userId: 'u1', email: 'one@example.invalid', name: 'One' }

async function checkoutAndPay(db, userId = 'u1', interval = 'month', now = NOW) {
  const { subscription, session } = await subs.startCheckout(db, fixture.fixtureProvider, { ...learner, userId, planId: 'pro', interval }, now)
  assert.equal(session.mode, 'fixture')
  const token = fixture.readFixtureToken(session.checkoutToken)
  const delivery = fixture.buildFixtureWebhook({ providerSubscriptionId: token.providerSubscriptionId, outcome: 'success', eventId: `evt-${subscription.id}-1`, periodDays: interval === 'year' ? 365 : 30, now })
  const outcome = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody, new Headers({ 'x-fixture-signature': delivery.signature }), now)
  return { subscription, token, outcome }
}

test('plans are seeded as editable fixtures and validated on save', async () => {
  const { client, db } = await freshDb()
  try {
    const list = await plans.listPlans(db)
    assert.deepEqual(list.map((p) => p.id), ['free', 'pro'])
    assert.equal(list[0].isDefault, true)
    assert.ok(list[1].features.includes('jobs.matching') && !list[0].features.includes('jobs.matching'))
    const input = plans.parsePlanInput({ id: 'Team-Plus', displayName: 'Team Plus', monthlyPriceMinor: '49900', features: ['jobs.matching', 'bogus'], limits: { analysesPerDay: 500, nope: 1 }, providerPlanIds: { monthly: 'plan_x', other: 'y' }, currency: 'inr' })
    assert.equal(input.id, 'team-plus')
    assert.deepEqual(input.features, ['jobs.matching'])
    assert.equal(input.limits.analysesPerDay, 500)
    assert.equal(input.limits.nope, undefined)
    assert.deepEqual(input.providerPlanIds, { monthly: 'plan_x' })
    assert.equal(input.currency, 'INR')
    assert.throws(() => plans.parsePlanInput({ id: 'bad id!' }), /Plan id/)
    assert.throws(() => plans.parsePlanInput({ id: 'x', monthlyPriceMinor: -5 }), /Monthly price/)
    const saved = await plans.savePlan(db, { ...input, isDefault: true })
    assert.equal(saved.isDefault, true)
    assert.equal((await plans.getPlan(db, 'free')).isDefault, false, 'only one default plan')
    assert.equal((await plans.defaultPlan(db)).id, 'team-plus')
  } finally {
    await client.close()
  }
})

test('entitlements resolve from trusted subscription state, legacy passes, allowlist and the default plan', async () => {
  const { client, db } = await freshDb()
  try {
    let r = await subs.resolvePlanForUser(db, 'u1', learner.email, NOW)
    assert.deepEqual([r.plan.id, r.source], ['free', 'default'])
    r = await subs.resolvePlanForUser(db, null, null, NOW)
    assert.equal(r.source, 'default')
    // Pending checkout grants nothing until a verified webhook arrives.
    const started = await subs.startCheckout(db, fixture.fixtureProvider, { ...learner, planId: 'pro', interval: 'month' }, NOW)
    const subscription = started.subscription
    const token = fixture.readFixtureToken(started.session.checkoutToken)
    assert.equal(subscription.status, 'pending')
    r = await subs.resolvePlanForUser(db, 'u1', learner.email, NOW)
    assert.equal(r.plan.id, 'free', 'a started checkout does not unlock anything')
    const delivery = fixture.buildFixtureWebhook({ providerSubscriptionId: token.providerSubscriptionId, outcome: 'success', eventId: 'evt-1', periodDays: 30, now: NOW })
    const ok = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody, new Headers({ 'x-fixture-signature': delivery.signature }), NOW)
    assert.equal(ok.status, 'processed')
    r = await subs.resolvePlanForUser(db, 'u1', learner.email, NOW)
    assert.deepEqual([r.plan.id, r.source], ['pro', 'subscription'])
    assert.ok(r.plan.features.includes('jobs.resumeAnalysis'))
    assert.equal(r.accessEndsAt, new Date(NOW.getTime() + 30 * 86_400_000).toISOString())
    // Another account is untouched.
    assert.equal((await subs.resolvePlanForUser(db, 'u2', 'two@example.invalid', NOW)).plan.id, 'free')
    // Legacy pass still honoured.
    await db.insert(schema.subscriptions).values({ id: 'order_1', userId: 'u2', planId: 'quarter', status: 'paid', currentEnd: new Date(NOW.getTime() + 5 * 86_400_000) })
    assert.deepEqual((await subs.resolvePlanForUser(db, 'u2', 'two@example.invalid', NOW)).source, 'legacy_pass')
    // Allowlist.
    process.env.BILLING_ALLOWLIST = 'ops@example.invalid'
    assert.equal((await subs.resolvePlanForUser(db, 'u2', 'ops@example.invalid', NOW)).source, 'allowlist')
    delete process.env.BILLING_ALLOWLIST
  } finally {
    await client.close()
  }
})

test('webhooks: invalid signatures are rejected, deliveries are idempotent, duplicates change nothing', async () => {
  const { client, db } = await freshDb()
  try {
    const { token } = await subs.startCheckout(db, fixture.fixtureProvider, { ...learner, planId: 'pro', interval: 'month' }, NOW).then(async (r) => ({ token: fixture.readFixtureToken(r.session.checkoutToken) }))
    const delivery = fixture.buildFixtureWebhook({ providerSubscriptionId: token.providerSubscriptionId, outcome: 'success', eventId: 'evt-dup', periodDays: 30, now: NOW })
    const bad = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody, new Headers({ 'x-fixture-signature': 'deadbeef' }), NOW)
    assert.deepEqual(bad, { status: 'rejected', reason: 'invalid_signature' })
    const tampered = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody.replace('subscription.activated', 'subscription.expired'), new Headers({ 'x-fixture-signature': delivery.signature }), NOW)
    assert.equal(tampered.status, 'rejected', 'a modified body fails the signature')
    const none = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody, new Headers(), NOW)
    assert.equal(none.status, 'rejected')
    assert.equal((await db.query.billingEvents.findMany()).length, 0, 'rejected deliveries are not recorded as events')
    const first = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody, new Headers({ 'x-fixture-signature': delivery.signature }), NOW)
    assert.equal(first.status, 'processed')
    const again = await subs.processWebhook(db, fixture.fixtureProvider, delivery.rawBody, new Headers({ 'x-fixture-signature': delivery.signature }), NOW)
    assert.equal(again.status, 'duplicate')
    const events = await db.query.billingEvents.findMany()
    assert.equal(events.length, 1)
    assert.equal(events[0].status, 'processed')
    const rows = await db.query.billingSubscriptions.findMany()
    assert.equal(rows.length, 1)
    assert.equal(rows[0].status, 'active')
    // Unknown subscription id is ignored but recorded.
    const stray = fixture.buildFixtureWebhook({ providerSubscriptionId: 'fxsub_unknown', outcome: 'success', eventId: 'evt-stray', periodDays: 30, now: NOW })
    const ignored = await subs.processWebhook(db, fixture.fixtureProvider, stray.rawBody, new Headers({ 'x-fixture-signature': stray.signature }), NOW)
    assert.equal(ignored.status, 'ignored')
    assert.equal((await db.query.billingEvents.findMany()).length, 2)
  } finally {
    await client.close()
  }
})

test('lifecycle: failed payment → past_due with grace, renewal recovers, cancel renewal keeps access to period end, expiry revokes', async () => {
  const { client, db } = await freshDb()
  try {
    const { token } = await checkoutAndPay(db)
    const fire = async (outcome, eventId, now) => {
      const d = fixture.buildFixtureWebhook({ providerSubscriptionId: token.providerSubscriptionId, outcome, eventId, periodDays: 30, now })
      return subs.processWebhook(db, fixture.fixtureProvider, d.rawBody, new Headers({ 'x-fixture-signature': d.signature }), now)
    }
    const day = (n) => new Date(NOW.getTime() + n * 86_400_000)
    // Failed payment at renewal time.
    await fire('failed', 'evt-fail', day(30))
    let sub = await subs.currentSubscription(db, 'u1', day(31))
    assert.equal(sub.status, 'past_due')
    assert.equal(sub.lastPaymentError, 'Test card declined')
    assert.equal(sub.grantsAccess, true, 'grace period keeps access')
    assert.equal((await subs.resolvePlanForUser(db, 'u1', learner.email, day(31))).plan.id, 'pro')
    assert.equal((await subs.resolvePlanForUser(db, 'u1', learner.email, day(30 + subs.PAST_DUE_GRACE_DAYS + 1))).plan.id, 'free', 'grace ends')
    // Provider retries and charges: renewal.
    await fire('renewal', 'evt-renew', day(32))
    sub = await subs.currentSubscription(db, 'u1', day(32))
    assert.equal(sub.status, 'active')
    assert.equal(sub.lastPaymentError, null)
    assert.equal(sub.currentPeriodEnd, day(62).toISOString())
    // Learner cancels renewal: access continues until period end.
    const cancelled = await subs.cancelRenewal(db, fixture.fixtureProvider, 'u1', sub.id, day(33))
    assert.equal(cancelled.status, 'cancel_at_period_end')
    assert.equal(cancelled.cancelAtPeriodEnd, true)
    assert.equal(cancelled.grantsAccess, true)
    assert.equal((await subs.resolvePlanForUser(db, 'u1', learner.email, day(40))).plan.id, 'pro')
    await assert.rejects(() => subs.cancelRenewal(db, fixture.fixtureProvider, 'u1', sub.id, day(34)), /not renewing/)
    await assert.rejects(() => subs.cancelRenewal(db, fixture.fixtureProvider, 'u2', sub.id, day(34)), /not found/, 'another account cannot cancel it')
    // Period ends: sweep expires it and entitlements revert.
    assert.equal(await subs.expireLapsed(db, day(63)), 1)
    sub = await subs.currentSubscription(db, 'u1', day(63))
    assert.equal(sub.status, 'expired')
    assert.equal((await subs.resolvePlanForUser(db, 'u1', learner.email, day(63))).plan.id, 'free')
    assert.equal(await subs.expireLapsed(db, day(64)), 0, 'sweep is idempotent')
    // A charge after cancellation at cycle end would reactivate only if the provider actually charged; a provider "cancelled" after expiry is ignored.
    const late = await fire('failed', 'evt-late', day(70))
    assert.equal(late.status, 'ignored')
  } finally {
    await client.close()
  }
})

test('checkout authorization: only paid, active plans; no double subscription; fixture tokens cannot be forged or reused across accounts', async () => {
  const { client, db } = await freshDb()
  try {
    await assert.rejects(() => subs.startCheckout(db, fixture.fixtureProvider, { ...learner, planId: 'free', interval: 'month' }, NOW), /needs no checkout/)
    await assert.rejects(() => subs.startCheckout(db, fixture.fixtureProvider, { ...learner, planId: 'nope', interval: 'month' }, NOW), /valid plan/)
    const { token } = await checkoutAndPay(db)
    await assert.rejects(() => subs.startCheckout(db, fixture.fixtureProvider, { ...learner, planId: 'pro', interval: 'month' }, NOW), /already on this plan/)
    const forged = fixture.issueFixtureToken({ ...token, userId: 'u2' }, 'wrong-secret')
    assert.equal(fixture.readFixtureToken(forged), null, 'token signed with another secret is rejected')
    const expired = fixture.issueFixtureToken({ ...token, exp: Date.now() - 1 })
    assert.equal(fixture.readFixtureToken(expired), null)
    assert.equal(fixture.readFixtureToken('garbage.value'), null)
    // Provider selection: Razorpay only when configured; fixture never in production.
    assert.equal(providers.activeProvider().id, 'fixture')
    process.env.NODE_ENV = 'production'
    assert.equal(fixture.fixtureEnabled(), false)
    assert.equal(providers.activeProvider(), null, 'no provider in production without Razorpay keys')
    process.env.NODE_ENV = 'test'
  } finally {
    await client.close()
  }
})

test('Razorpay adapter: webhook and checkout signatures verify only with the right secret and normalise events', () => {
  const secret = 'whsec_test'
  const body = JSON.stringify({ event: 'subscription.charged', created_at: 1790000000, payload: { subscription: { entity: { id: 'sub_123', status: 'active', current_start: 1790000000, current_end: 1792592000 } }, payment: { entity: { id: 'pay_1', status: 'captured' } } } })
  const sig = createHmac('sha256', secret).update(body).digest('hex')
  const ok = razorpay.parseRazorpayWebhook(body, sig, secret)
  assert.equal(ok.ok, true)
  assert.deepEqual([ok.event.type, ok.event.providerSubscriptionId, ok.event.paymentId], ['subscription.charged', 'sub_123', 'pay_1'])
  assert.equal(ok.event.periodEnd.toISOString(), new Date(1792592000 * 1000).toISOString())
  assert.deepEqual(razorpay.parseRazorpayWebhook(body, sig, 'other'), { ok: false, reason: 'invalid_signature' })
  assert.deepEqual(razorpay.parseRazorpayWebhook(body, null, secret), { ok: false, reason: 'invalid_signature' })
  assert.deepEqual(razorpay.parseRazorpayWebhook(body, sig, ''), { ok: false, reason: 'not_configured' })
  const halted = JSON.stringify({ event: 'subscription.halted', payload: { subscription: { entity: { id: 'sub_123', status: 'halted' } } } })
  assert.equal(razorpay.parseRazorpayWebhook(halted, createHmac('sha256', secret).update(halted).digest('hex'), secret).event.type, 'subscription.payment_failed')
  const unknown = JSON.stringify({ event: 'payment.captured', payload: {} })
  assert.equal(razorpay.parseRazorpayWebhook(unknown, createHmac('sha256', secret).update(unknown).digest('hex'), secret).event.type, 'ignored')
  const checkoutSig = createHmac('sha256', 'key_secret').update('pay_1|sub_123').digest('hex')
  assert.equal(razorpay.verifySubscriptionCheckoutSignature('pay_1', 'sub_123', checkoutSig, 'key_secret'), true)
  assert.equal(razorpay.verifySubscriptionCheckoutSignature('pay_1', 'sub_999', checkoutSig, 'key_secret'), false)
  assert.equal(razorpay.verifySubscriptionCheckoutSignature('pay_1', 'sub_123', checkoutSig, ''), false)
})

test('cron authentication and log redaction', () => {
  assert.deepEqual(cronAuthorized(new Headers(), ''), { ok: false, reason: 'not_configured' })
  assert.deepEqual(cronAuthorized(new Headers(), 's3cret'), { ok: false, reason: 'missing' })
  assert.deepEqual(cronAuthorized(new Headers({ authorization: 'Bearer nope' }), 's3cret'), { ok: false, reason: 'mismatch' })
  assert.deepEqual(cronAuthorized(new Headers({ authorization: 'Bearer s3cret' }), 's3cret'), { ok: true, reason: null })
  const lines = []
  const orig = console.log
  console.log = (l) => lines.push(l)
  try {
    log.logEvent('info', 'test.event', { userId: 'u1', password: 'p', authorization: 'Bearer x', resumeText: 'secret resume', nested: { webhookSecret: 'w', ok: 1 }, long: 'a'.repeat(1000) })
  } finally {
    console.log = orig
  }
  const parsed = JSON.parse(lines[0])
  assert.equal(parsed.event, 'test.event')
  assert.equal(parsed.password, '[redacted]')
  assert.equal(parsed.authorization, '[redacted]')
  assert.equal(parsed.resumeText, '[redacted]')
  assert.equal(parsed.nested.webhookSecret, '[redacted]')
  assert.equal(parsed.nested.ok, 1)
  assert.ok(parsed.long.length < 450)
  assert.match(log.newErrorId(), /^E-[0-9A-F]{8}$/)
})
