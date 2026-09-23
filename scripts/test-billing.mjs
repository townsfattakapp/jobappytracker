// Unit checks for pass entitlement rules, plan maths and Razorpay signatures.
// Run: node scripts/test-billing.mjs
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { build } from 'esbuild'
import fs from 'node:fs'
fs.mkdirSync('scratch/learning-tests', { recursive: true })
await build({
  entryPoints: { entitlement: 'src/lib/billing/entitlement.ts', plan: 'src/lib/billing/plan.ts', razorpay: 'src/lib/server/razorpay.ts', interview: 'src/lib/interview/config.ts' },
  outdir: 'scratch/learning-tests',
  bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent',
})
const { computeEntitlement, extendedUntil } = await import('../scratch/learning-tests/entitlement.mjs')
const { PLANS, planById, discountPercent, perMonth, amountPaise } = await import('../scratch/learning-tests/plan.mjs')
const { verifyPaymentSignature, verifyWebhookSignature } = await import('../scratch/learning-tests/razorpay.mjs')
const { normalizeScorecard, roundById, roundForTrack, buildInterviewerMessages, buildScorecardMessages } = await import('../scratch/learning-tests/interview.mjs')

const now = new Date('2026-09-23T00:00:00Z')
const days = (n) => new Date(now.getTime() + n * 86_400_000)

// Plans: the three passes with list prices
assert.deepEqual(PLANS.map((p) => [p.id, p.days, p.priceInr, p.mrpInr]), [['quarter', 90, 199, 499], ['half', 180, 424, 699], ['year', 365, 799, 1999]])
assert.equal(discountPercent(planById('quarter')), 60)
assert.equal(discountPercent(planById('year')), 60)
assert.equal(amountPaise(planById('half')), 42400)
assert.ok(Math.abs(perMonth(planById('year')) - perMonth(planById('quarter'))) <= 1, 'per-month figure is about ₹66 on both ends')
console.log('PASS: plans are 90 days ₹199 (₹499), 180 days ₹424 (₹699), 1 year ₹799 (₹1999)')

// Entitlement: no trial, access only while paid
let e = computeEntitlement(null, null, now)
assert.equal(e.status, 'expired'); assert.equal(e.access, false); assert.equal(e.endsAt, null); assert.equal(e.daysLeft, 0)
e = computeEntitlement(days(20), 'quarter', now)
assert.equal(e.status, 'active'); assert.equal(e.access, true); assert.equal(e.daysLeft, 20); assert.equal(e.planId, 'quarter')
e = computeEntitlement(days(-1), 'quarter', now)
assert.equal(e.status, 'expired'); assert.equal(e.access, false); assert.equal(e.endsAt, days(-1).toISOString())
e = computeEntitlement(null, null, now, true)
assert.equal(e.access, true); assert.equal(e.complimentary, true)
console.log('PASS: new accounts have no access; paid passes grant it until they end; allowlist is complimentary')

// Extension maths: adds to the end of an active pass, restarts from now otherwise
assert.equal(extendedUntil(days(10), 90, now).toISOString(), days(100).toISOString())
assert.equal(extendedUntil(days(-10), 90, now).toISOString(), days(90).toISOString())
assert.equal(extendedUntil(null, 365, now).toISOString(), days(365).toISOString())
console.log('PASS: buying again extends the current pass')

// Signatures
const secret = 'test_secret'
const sig = createHmac('sha256', secret).update('order_1|pay_1').digest('hex')
assert.equal(verifyPaymentSignature('order_1', 'pay_1', sig, secret), true)
assert.equal(verifyPaymentSignature('order_2', 'pay_1', sig, secret), false)
assert.equal(verifyPaymentSignature('order_1', 'pay_1', sig, ''), false)
const body = JSON.stringify({ event: 'payment.captured' })
const wsig = createHmac('sha256', 'whsec').update(body).digest('hex')
assert.equal(verifyWebhookSignature(body, wsig, 'whsec'), true)
assert.equal(verifyWebhookSignature(body + ' ', wsig, 'whsec'), false)
assert.equal(verifyWebhookSignature(body, null, 'whsec'), false)
console.log('PASS: checkout and webhook signatures verify and reject')

// Mock interview: rounds, prompts and scorecard normalisation
assert.equal(roundForTrack('DSA & Competitive Programming'), 'dsa')
assert.equal(roundForTrack('React and Next.js'), 'react')
assert.equal(roundForTrack('Core Java'), 'java')
assert.equal(roundForTrack('JavaScript & TypeScript'), 'javascript')
assert.equal(roundForTrack('High-Level System Design'), 'system-design')
const setup = { roundId: 'dsa', level: 'Medium', minutes: 30, personaId: 'bar-raiser', voice: false, candidateName: 'Asha' }
let msgs = buildInterviewerMessages(setup, [], 30)
assert.equal(msgs[0].role, 'system'); assert.match(msgs[0].content, /Meera/); assert.match(msgs[0].content, /JSON/); assert.match(msgs[0].content, /Asha/)
assert.equal(msgs.length, 2)
const turns = [
  { role: 'interviewer', content: 'Hi Asha. Two Sum?', stage: 'question', question: 1, note: '' },
  { role: 'candidate', content: 'Use a hash map.', kind: 'answer', code: 'return {}', language: 'java' },
]
msgs = buildInterviewerMessages(setup, turns, 2)
assert.equal(msgs.length, 3)
assert.match(msgs[2].content, /```java/); assert.match(msgs[2].content, /Wrap up now/)
assert.equal(JSON.parse(msgs[1].content).say, 'Hi Asha. Two Sum?')
const score = buildScorecardMessages(setup, turns, 1, 12)
assert.match(score[0].content, /Hints requested: 1/); assert.match(score[1].content, /CANDIDATE/)
const card = normalizeScorecard({ overall: '72', verdict: 'hire', summary: 'ok', dimensions: [{ name: 'Problem solving', score: 4, comment: 'good' }], strengths: ['x'], improvements: [], modelAnswers: [{ question: 'q', answer: 'a' }], recommendedTopics: ['Hashing'] }, roundById('dsa'))
assert.equal(card.overall, 72); assert.equal(card.verdict, 'Hire'); assert.equal(card.dimensions.length, 5)
assert.equal(card.dimensions.find((d) => d.name === 'Problem solving').score, 4)
const fallback = normalizeScorecard({}, roundById('behavioral'))
assert.equal(fallback.dimensions.length, 5); assert.ok(fallback.verdict); assert.ok(fallback.overall >= 0 && fallback.overall <= 100)
console.log('PASS: interview prompts carry persona, code and time; scorecards normalise')
console.log('Billing tests passed.')
