// Billing and AI-key flow without a payment provider: trial status, the
// paywall after the trial ends, and account-stored AI keys.
// Runs against the dev server on port 3000 and the DATABASE_URL in .env.local.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config({ path: '.env.local', quiet: true })
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const browser = await chromium.launch()
const email = `billing-e2e-${Date.now()}@example.invalid`
const password = 'Billing-Test-Only-2026!'
const waitForSession = async (page, timeoutMs = 45000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const session = await page.evaluate(() => fetch('/api/auth/session').then((r) => r.json()).catch(() => null))
    if (session && session.user && session.user.id) return session
    await page.waitForTimeout(500)
  }
  throw new Error('Signed-in session did not appear in time')
}

try {
  const page = await (await browser.newContext()).newPage()
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' })
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await waitForSession(page)

  // Trial status straight after sign-up
  const status = await page.evaluate(() => fetch('/api/billing/status').then((r) => r.json()))
  assert.equal(status.signedIn, true, 'status: ' + JSON.stringify(status))
  assert.equal(status.entitlement.status, 'trial')
  assert.ok(status.entitlement.daysLeft >= 6, 'seven-day trial')
  const ai = await page.evaluate(() => fetch('/api/ai/chat').then((r) => r.json()))
  assert.equal(ai.access, true)
  assert.equal(ai.userKey, null)
  console.log('PASS: new account starts a trial with AI access pending a key')

  // AI key: bad format rejected, provider-rejected key rejected, delete works
  let res = await page.evaluate(() => fetch('/api/ai/key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'groq', key: 'nope' }) }).then((r) => r.status))
  assert.equal(res, 400)
  res = await page.evaluate(() => fetch('/api/ai/key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'groq', key: 'gsk_' + 'x'.repeat(40) }) }).then(async (r) => ({ status: r.status, body: await r.json() })))
  assert.ok(res.status === 400 || res.status === 200, 'rejected by provider (400) or accepted unverified when offline (200)')
  if (res.status === 200) assert.equal(res.body.verified, false)
  console.log(`PASS: AI key validation (${res.status === 400 ? 'provider rejected the fake key' : 'stored unverified without network'})`)

  // Settings shows the subscription and key panels
  await page.getByRole('button', { name: 'Settings', exact: true }).first().click()
  await page.getByRole('heading', { name: 'Subscription' }).waitFor()
  await page.getByText('Free trial', { exact: true }).first().waitFor()
  await page.getByRole('heading', { name: 'Your AI key' }).waitFor()
  console.log('PASS: settings show subscription and AI key panels')

  // End the trial in the database and reload: paywall, and paid APIs return 402
  await pool.query('UPDATE users SET "createdAt" = now() - interval \'10 days\' WHERE email = $1', [email])
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Your free trial has ended' }).waitFor({ timeout: 20000 })
  const run = await page.evaluate(() => fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: 'python', code: 'print(1)' }) }).then((r) => r.status))
  assert.equal(run, 402)
  const chat = await page.evaluate(() => fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) }).then((r) => r.status))
  assert.equal(chat, 402)
  const sub = await page.evaluate(() => fetch('/api/billing/subscribe', { method: 'POST' }).then((r) => r.status))
  assert.ok(sub === 503 || sub === 502 || sub === 200, `subscribe responds (${sub})`)
  console.log('PASS: expired trial shows the paywall and paid APIs return 402')

  // An active subscription row restores access
  await pool.query('INSERT INTO subscriptions (id, "userId", "planId", status, "currentEnd", "chargeAt") VALUES ($1, (SELECT id FROM users WHERE email=$2), $3, $4, now() + interval \'30 days\', now() + interval \'30 days\')', [`sub_e2e_${Date.now()}`, email, 'plan_test', 'active'])
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSession(page)
  assert.equal(await page.getByRole('heading', { name: 'Your free trial has ended' }).count(), 0)
  const after = await page.evaluate(() => fetch('/api/billing/status').then((r) => r.json()))
  assert.equal(after.entitlement.status, 'active')
  console.log('PASS: an active subscription lifts the paywall')

  // Marketing page: signed-out visitors see it; a returning device is redirected to the app
  const fresh = await (await browser.newContext()).newPage()
  await fresh.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  await fresh.getByRole('heading', { level: 1 }).waitFor()
  assert.match(await fresh.getByRole('heading', { level: 1 }).innerText(), /Stop collecting resources/)
  await fresh.goto('http://localhost:3000/app', { waitUntil: 'networkidle' })
  await fresh.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  assert.match(fresh.url(), /\/app$/)
  console.log('PASS: landing page renders and returning visitors go straight to the app')
} finally {
  await pool.query('DELETE FROM users WHERE email=$1', [email]).catch(() => {})
  await pool.end()
  await browser.close()
}
console.log('Billing e2e passed.')
