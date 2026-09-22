// Unit checks for entitlement rules and Razorpay signature verification.
// Run: node scripts/test-billing.mjs
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { build } from 'esbuild'
import fs from 'node:fs'
fs.mkdirSync('scratch/learning-tests', { recursive: true })
await build({
  entryPoints: { entitlement: 'src/lib/billing/entitlement.ts', razorpay: 'src/lib/server/razorpay.ts' },
  outdir: 'scratch/learning-tests',
  bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent',
})
const { computeEntitlement } = await import('../scratch/learning-tests/entitlement.mjs')
const { verifyCheckoutSignature, verifyWebhookSignature, mapSubscription } = await import('../scratch/learning-tests/razorpay.mjs')

const now = new Date('2026-09-23T00:00:00Z')
const days = (n) => new Date(now.getTime() + n * 86_400_000)

// Trial
let e = computeEntitlement(days(-2), null, now, 7)
assert.equal(e.status, 'trial'); assert.equal(e.access, true); assert.equal(e.daysLeft, 5)
e = computeEntitlement(days(-8), null, now, 7)
assert.equal(e.status, 'expired'); assert.equal(e.access, false)
console.log('PASS: trial counts down and expires')

// Active and cancelling
const sub = (status, extra = {}) => ({ id: 'sub_1', status, currentEnd: days(20).toISOString(), chargeAt: days(20).toISOString(), cancelledAt: null, ...extra })
e = computeEntitlement(days(-30), sub('active'), now)
assert.equal(e.status, 'active'); assert.equal(e.access, true); assert.equal(e.renewsAt, days(20).toISOString())
e = computeEntitlement(days(-30), sub('authenticated'), now)
assert.equal(e.access, true)
e = computeEntitlement(days(-30), sub('cancelled'), now)
assert.equal(e.status, 'cancelling'); assert.equal(e.access, true); assert.equal(e.daysLeft, 20)
e = computeEntitlement(days(-30), sub('cancelled', { currentEnd: days(-1).toISOString() }), now)
assert.equal(e.status, 'expired'); assert.equal(e.access, false)
e = computeEntitlement(days(-30), sub('halted'), now)
assert.equal(e.status, 'past_due'); assert.equal(e.access, true)
e = computeEntitlement(days(-30), sub('halted', { currentEnd: days(-1).toISOString() }), now)
assert.equal(e.access, false)
console.log('PASS: active, cancelling, past-due and lapsed subscriptions')

// Signatures
const secret = 'test_secret'
const sig = createHmac('sha256', secret).update('pay_1|sub_1').digest('hex')
assert.equal(verifyCheckoutSignature('pay_1', 'sub_1', sig, secret), true)
assert.equal(verifyCheckoutSignature('pay_1', 'sub_2', sig, secret), false)
assert.equal(verifyCheckoutSignature('pay_1', 'sub_1', sig, ''), false)
const body = JSON.stringify({ event: 'subscription.charged' })
const wsig = createHmac('sha256', 'whsec').update(body).digest('hex')
assert.equal(verifyWebhookSignature(body, wsig, 'whsec'), true)
assert.equal(verifyWebhookSignature(body + ' ', wsig, 'whsec'), false)
assert.equal(verifyWebhookSignature(body, null, 'whsec'), false)
console.log('PASS: checkout and webhook signatures verify and reject')

// Entity mapping
const mapped = mapSubscription({ id: 'sub_9', plan_id: 'plan_1', status: 'active', current_start: 1_790_000_000, current_end: 1_792_600_000, charge_at: 1_792_600_000 })
assert.equal(mapped.currentEnd.toISOString(), new Date(1_792_600_000 * 1000).toISOString())
assert.equal(mapped.cancelledAt, null)
console.log('PASS: Razorpay entity maps to a row')
console.log('Billing tests passed.')
