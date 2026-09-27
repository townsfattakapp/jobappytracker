// Browser end-to-end for multi-currency pass pricing, against a local dev server:
//   1 the pricing API answers INR with no country, USD/AED/GBP/EUR by country, and rejects unknown currencies
//   2 the public /pricing page shows rupee prices first and every card follows the currency switcher
//   3 the choice is remembered across a reload (cookie) and wins over the visitor's country
//   4 the signed-out landing page repeats the chosen price in its copy
//   BASE_URL=http://localhost:3001 node scripts/e2e-pricing.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const SHOTS = process.env.E2E_SHOTS_DIR || 'scratch/pricing-e2e'
fs.mkdirSync(SHOTS, { recursive: true })
let n = 0
const pass = (msg) => console.log(`PASS ${++n}: ${msg}`)

// 1 · API
const get = async (headers = {}) => (await fetch(`${BASE}/api/billing/pricing`, { headers })).json()
let p = await get()
assert.equal(p.currency, 'INR'); assert.equal(p.chosen, false)
assert.deepEqual(p.plans.map((x) => [x.id, x.priceLabel, x.regularLabel, x.minor]), [['quarter', '₹299', '₹499', 29900], ['half', '₹599', '₹799', 59900], ['year', '₹999', '₹1,499', 99900]])
p = await get({ 'x-vercel-ip-country': 'US' })
assert.equal(p.currency, 'USD'); assert.equal(p.plans[0].priceLabel, '$5.99'); assert.equal(p.plans[0].minor, 599); assert.equal(p.plans[2].priceLabel, '$16.99')
p = await get({ 'x-vercel-ip-country': 'AE' })
assert.equal(p.currency, 'AED'); assert.equal(p.plans[0].minor, 2200); assert.match(p.plans[1].priceLabel, /AED\s?40/)
p = await get({ 'x-vercel-ip-country': 'GB' })
assert.equal(p.currency, 'GBP'); assert.equal(p.plans[0].priceLabel, '£4.99')
p = await get({ 'x-vercel-ip-country': 'DE' })
assert.equal(p.currency, 'EUR'); assert.equal(p.plans[2].minor, 1599)
p = await get({ 'x-vercel-ip-country': 'IN' })
assert.equal(p.currency, 'INR')
p = await get({ 'x-vercel-ip-country': 'US', cookie: 'prep-currency=INR' })
assert.equal(p.currency, 'INR'); assert.equal(p.chosen, true)
let res = await fetch(`${BASE}/api/billing/pricing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'BTC' }) })
assert.equal(res.status, 400)
res = await fetch(`${BASE}/api/billing/pricing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'AED' }) })
assert.equal(res.status, 200); assert.match(res.headers.get('set-cookie') || '', /prep-currency=AED/)
for (const c of ['INR', 'USD', 'AED', 'GBP', 'EUR']) {
  const q = await get({ cookie: `prep-currency=${c}` })
  for (const plan of q.plans) assert.ok(plan.regular > plan.price && plan.discount >= 25, `${c} ${plan.id} shows a real discount`)
}
pass('pricing API: INR by default, USD/AED/GBP/EUR by country, saved choice wins, unknown currency rejected')

// 2 · /pricing page follows the switcher
const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
  const amounts = () => page.locator('.plan-amount').allTextContents()
  const mrps = () => page.locator('.plan-mrp').allTextContents()
  await page.waitForFunction(() => document.querySelectorAll('.plan-amount').length === 3)
  assert.deepEqual(await amounts(), ['₹299', '₹599', '₹999'])
  assert.deepEqual(await mrps(), ['₹499', '₹799', '₹1,499'])
  assert.equal(await page.locator('.plan-currency select').first().inputValue(), 'INR')
  await page.screenshot({ path: `${SHOTS}/01-pricing-inr.png`, fullPage: false })
  await page.locator('.plan-currency select').first().selectOption('USD')
  await page.waitForFunction(() => document.querySelector('.plan-amount')?.textContent === '$5.99')
  assert.deepEqual(await amounts(), ['$5.99', '$10.99', '$16.99'])
  assert.deepEqual(await mrps(), ['$9.99', '$14.99', '$24.99'])
  const meta = await page.locator('.plan-meta').first().textContent()
  assert.match(meta, /about \$2 a month · 40% off/)
  const cta = await page.locator('.plan-card .btn').first().textContent()
  assert.match(cta, /\$5\.99/)
  assert.match(await page.locator('.plan-fine').first().textContent(), /international cards/)
  assert.match(await page.locator('.plan-currency-note').textContent(), /Charged in USD/)
  await page.screenshot({ path: `${SHOTS}/02-pricing-usd.png`, fullPage: false })
  pass('/pricing: rupee prices first, every card and CTA switches to dollars together')

  // 3 · remembered across reload, and wins over the country header
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelector('.plan-amount')?.textContent === '$5.99')
  assert.equal(await page.locator('.plan-currency select').first().inputValue(), 'USD')
  await ctx.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'AE' })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelector('.plan-amount')?.textContent === '$5.99')
  await page.locator('.plan-currency select').first().selectOption('AED')
  await page.waitForFunction(() => /AED/.test(document.querySelector('.plan-amount')?.textContent || ''))
  assert.match((await amounts()).join(' '), /22.*40.*62/)
  await page.screenshot({ path: `${SHOTS}/03-pricing-aed.png`, fullPage: false })
  pass('the chosen currency survives a reload and beats the detected country')

  // 4 · landing copy follows the currency too
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const fromLine = () => [...document.querySelectorAll('.lp-fineprint')].map((el) => el.textContent || '').find((t) => t.includes('Passes from')) || ''
  await page.waitForFunction(`(${fromLine.toString()})().includes('AED')`)
  assert.match(await page.locator('.lp-fineprint', { hasText: 'Passes from' }).textContent(), /Passes from AED\s?22/)
  assert.match(await page.locator('h3', { hasText: 'gets you' }).textContent(), /What AED\s?22 for 90 days gets you/)
  await page.locator('.plan-currency select').first().selectOption('INR')
  await page.waitForFunction(`(${fromLine.toString()})().includes('₹299')`)
  await page.screenshot({ path: `${SHOTS}/04-landing-inr.png`, fullPage: false })
  pass('landing page copy repeats the chosen price and switches back to rupees')
} finally {
  await browser.close()
}
console.log(`Pricing e2e passed (${n} checks). Screenshots in ${SHOTS}/`)
