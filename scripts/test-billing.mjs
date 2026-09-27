// Unit checks for pass entitlement rules, plan maths and Razorpay signatures.
// Run: node scripts/test-billing.mjs
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { build } from 'esbuild'
import fs from 'node:fs'
fs.mkdirSync('scratch/learning-tests', { recursive: true })
await build({
  entryPoints: { entitlement: 'src/lib/billing/entitlement.ts', plan: 'src/lib/billing/plan.ts', razorpay: 'src/lib/server/razorpay.ts', currency: 'src/lib/billing/currency.ts', reqCurrency: 'src/lib/server/currency.ts', interview: 'src/lib/interview/config.ts' },
  outdir: 'scratch/learning-tests',
  bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent',
})
const { computeEntitlement, extendedUntil } = await import('../scratch/learning-tests/entitlement.mjs')
const { PLANS, planById, discountPercent, perMonth, amountPaise } = await import('../scratch/learning-tests/plan.mjs')
const { verifyPaymentSignature, verifyWebhookSignature, isCurrencyRejected } = await import('../scratch/learning-tests/razorpay.mjs')
const { CURRENCIES, PLAN_PRICES, priceOf, amountMinor, formatPrice, perMonthIn, discountPercentIn, currencyForCountry, isCurrency, pricingFor } = await import('../scratch/learning-tests/currency.mjs')
const { currencyFromRequest, currencyCookie } = await import('../scratch/learning-tests/reqCurrency.mjs')
const { normalizeScorecard, roundById, roundForTrack, buildInterviewerMessages, buildScorecardMessages } = await import('../scratch/learning-tests/interview.mjs')

const now = new Date('2026-09-23T00:00:00Z')
const days = (n) => new Date(now.getTime() + n * 86_400_000)

// Plans: the three passes with list prices
assert.deepEqual(PLANS.map((p) => [p.id, p.days, p.priceInr, p.mrpInr]), [['quarter', 90, 299, 499], ['half', 180, 599, 799], ['year', 365, 999, 1499]])
assert.equal(discountPercent(planById('quarter')), 40)
assert.equal(discountPercent(planById('year')), 33)
assert.equal(amountPaise(planById('half')), 59900)
assert.ok(perMonth(planById('year')) < perMonth(planById('quarter')), 'the longer pass costs less per month')
console.log('PASS: plans are 90 days ₹299 (₹499), 180 days ₹599 (₹799), 1 year ₹999 (₹1499)')

// Currencies: fixed price points per currency, every plan priced in every currency, discount always real
assert.deepEqual([...CURRENCIES], ['INR', 'USD', 'AED', 'GBP', 'EUR'])
for (const c of CURRENCIES) {
  for (const p of PLANS) {
    const pp = priceOf(p, c)
    assert.ok(pp.price > 0 && pp.regular > pp.price, `${c} ${p.id} is discounted`)
    assert.equal(amountMinor(p, c), Math.round(pp.price * 100))
    assert.ok(discountPercentIn(p, c) >= 25 && discountPercentIn(p, c) <= 45, `${c} ${p.id} discount ${discountPercentIn(p, c)}% is in range`)
  }
  assert.ok(perMonthIn(planById('year'), c) < perMonthIn(planById('quarter'), c), `${c}: the longer pass costs less per month`)
}
assert.deepEqual(PLAN_PRICES.INR.quarter, { price: 299, regular: 499 })
assert.deepEqual(PLAN_PRICES.USD, { quarter: { price: 5.99, regular: 9.99 }, half: { price: 10.99, regular: 14.99 }, year: { price: 16.99, regular: 24.99 } })
assert.deepEqual(PLAN_PRICES.AED, { quarter: { price: 22, regular: 37 }, half: { price: 40, regular: 55 }, year: { price: 62, regular: 92 } })
assert.equal(amountMinor(planById('quarter'), 'USD'), 599)
assert.equal(amountMinor(planById('year'), 'AED'), 6200)
assert.equal(amountMinor(planById('half'), 'INR'), amountPaise(planById('half')))
assert.equal(formatPrice(299, 'INR'), '₹299')
assert.equal(formatPrice(5.99, 'USD'), '$5.99')
assert.equal(formatPrice(4.99, 'GBP'), '£4.99')
assert.match(formatPrice(22, 'AED'), /AED\s?22$/)
assert.match(formatPrice(15.99, 'EUR'), /€\s?15\.99$/)
assert.equal(currencyForCountry('IN'), 'INR'); assert.equal(currencyForCountry(null), 'INR'); assert.equal(currencyForCountry(''), 'INR')
assert.equal(currencyForCountry('US'), 'USD'); assert.equal(currencyForCountry('CA'), 'USD'); assert.equal(currencyForCountry('SG'), 'USD')
assert.equal(currencyForCountry('AE'), 'AED'); assert.equal(currencyForCountry('GB'), 'GBP'); assert.equal(currencyForCountry('DE'), 'EUR'); assert.equal(currencyForCountry('fr'), 'EUR')
assert.equal(isCurrency('USD'), true); assert.equal(isCurrency('BTC'), false); assert.equal(isCurrency(1), false)
const priced = pricingFor('USD', 'US')
assert.equal(priced.plans.length, 3); assert.equal(priced.plans[0].priceLabel, '$5.99'); assert.equal(priced.plans[0].regularLabel, '$9.99'); assert.equal(priced.plans[0].minor, 599)
assert.equal(priced.options.length, 5); assert.equal(priced.methods, 'international cards')
assert.equal(pricingFor('INR').methods, 'UPI, cards, net banking')
// Request → currency: the saved choice wins, then the country header, then INR
const req = (h) => new Request('http://x/api/billing/pricing', { headers: h })
assert.deepEqual(currencyFromRequest(req({})), { currency: 'INR', country: null, chosen: false })
assert.deepEqual(currencyFromRequest(req({ 'x-vercel-ip-country': 'US' })), { currency: 'USD', country: 'US', chosen: false })
assert.deepEqual(currencyFromRequest(req({ 'x-vercel-ip-country': 'AE' })), { currency: 'AED', country: 'AE', chosen: false })
assert.deepEqual(currencyFromRequest(req({ 'x-vercel-ip-country': 'US', cookie: 'a=b; prep-currency=INR; c=d' })), { currency: 'INR', country: 'US', chosen: true })
assert.deepEqual(currencyFromRequest(req({ 'x-vercel-ip-country': 'IN', cookie: 'prep-currency=USD' })), { currency: 'USD', country: 'IN', chosen: true })
assert.equal(currencyFromRequest(req({ cookie: 'prep-currency=XYZ' })).currency, 'INR', 'an unsupported saved currency is ignored')
assert.match(currencyCookie('AED'), /^prep-currency=AED; Path=\/; Max-Age=31536000; SameSite=Lax/)
assert.equal(isCurrencyRejected(new Error('Currency is not supported')), true)
assert.equal(isCurrencyRejected(new Error('Authentication failed')), false)
console.log('PASS: passes are priced in INR, USD, AED, GBP and EUR with fixed points; the visitor country or saved choice picks the currency')

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
