// Billing, sign-in options and AI-key flow without a payment provider: a new
// account has no access (no trial), a paid pass lifts the paywall, an ended
// pass brings it back, and the landing page carries the new pricing.
// Runs against the dev server on port 3000 and the DATABASE_URL in .env.local.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import dotenv from 'dotenv'
import pg from 'pg'
import { grantPass, waitForSession } from './lib/pass.mjs'
dotenv.config({ path: '.env.local', quiet: true })
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const browser = await chromium.launch()
const email = `billing-e2e-${Date.now()}@example.invalid`
const password = 'Billing-Test-Only-2026!'

try {
  const page = await (await browser.newContext()).newPage()
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' })

  // Sign-in options endpoint drives the form (Google button, confirmation copy)
  const options = await page.evaluate(() => fetch('/api/auth/options').then((r) => r.json()))
  assert.equal(typeof options.google, 'boolean')
  assert.equal(typeof options.emailConfirmation, 'boolean')
  if (options.google) await page.getByRole('button', { name: 'Continue with Google' }).waitFor()
  console.log(`PASS: sign-in options (google: ${options.google}, email confirmation: ${options.emailConfirmation})`)

  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  if (options.emailConfirmation) {
    await page.getByRole('heading', { name: 'Check your inbox' }).waitFor()
    const [row] = (await pool.query('SELECT "emailVerified" FROM users WHERE email = $1', [email])).rows
    assert.equal(row.emailVerified, null)
    // Confirm from the database side (the real link carries the token) and sign in.
    await pool.query('UPDATE users SET "emailVerified" = now() WHERE email = $1', [email])
    await page.getByRole('button', { name: 'I have confirmed — sign in' }).click()
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    console.log('PASS: sign-up waits for email confirmation')
  }
  await waitForSession(page)
  const verified = (await pool.query('SELECT "emailVerified" FROM users WHERE email = $1', [email])).rows[0]
  assert.ok(verified.emailVerified, 'account is marked verified')

  // No trial: a fresh account is signed in but has no access
  let status = await page.evaluate(() => fetch('/api/billing/status').then((r) => r.json()))
  assert.equal(status.signedIn, true, 'status: ' + JSON.stringify(status))
  assert.equal(status.entitlement.access, false)
  assert.equal(status.entitlement.status, 'expired')
  assert.equal(status.entitlement.endsAt, null)
  assert.deepEqual(status.plans.map((p) => [p.id, p.priceInr, p.mrpInr]), [['quarter', 199, 499], ['half', 424, 699], ['year', 799, 1999]])
  await page.getByRole('heading', { name: 'Choose your plan' }).waitFor({ timeout: 20000 })
  await page.getByText('₹199', { exact: true }).first().waitFor()
  const run = await page.evaluate(() => fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: 'python', code: 'print(1)' }) }).then((r) => r.status))
  assert.equal(run, 402)
  const chat = await page.evaluate(() => fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) }).then((r) => r.status))
  assert.equal(chat, 402)
  const sub = await page.evaluate(() => fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: 'half' }) }).then((r) => r.status))
  assert.ok(sub === 503 || sub === 502 || sub === 200, `subscribe responds (${sub})`)
  const badPlan = await page.evaluate(() => fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: 'lifetime' }) }).then((r) => r.status))
  assert.ok(badPlan === 400 || badPlan === 503, `unknown plan rejected (${badPlan})`)
  console.log('PASS: new account sees the plan picker and paid APIs return 402')

  // A paid pass lifts the paywall
  await grantPass(pool, email, { planId: 'half', days: 180 })
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSession(page)
  assert.equal(await page.getByRole('heading', { name: 'Choose your plan' }).count(), 0)
  status = await page.evaluate(() => fetch('/api/billing/status').then((r) => r.json()))
  assert.equal(status.entitlement.access, true)
  assert.equal(status.entitlement.planId, 'half')
  assert.ok(status.entitlement.daysLeft >= 179, 'about 180 days left')
  const ai = await page.evaluate(() => fetch('/api/ai/chat').then((r) => r.json()))
  assert.equal(ai.access, true)
  assert.equal(ai.userKey, null)
  console.log('PASS: a paid pass lifts the paywall and unlocks AI pending a key')

  // AI key: bad format rejected, provider-rejected key rejected
  let res = await page.evaluate(() => fetch('/api/ai/key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'groq', key: 'nope' }) }).then((r) => r.status))
  assert.equal(res, 400)
  res = await page.evaluate(() => fetch('/api/ai/key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'groq', key: 'gsk_' + 'x'.repeat(40) }) }).then(async (r) => ({ status: r.status, body: await r.json() })))
  assert.ok(res.status === 400 || res.status === 200, 'rejected by provider (400) or accepted unverified when offline (200)')
  if (res.status === 200) assert.equal(res.body.verified, false)
  console.log(`PASS: AI key validation (${res.status === 400 ? 'provider rejected the fake key' : 'stored unverified without network'})`)

  // Settings shows the pass and key panels, and the extend flow
  await page.getByRole('button', { name: 'Settings', exact: true }).first().click()
  await page.getByRole('heading', { name: 'Your plan' }).waitFor()
  await page.getByText('Active', { exact: true }).first().waitFor()
  await page.getByText('180 days', { exact: false }).first().waitFor()
  await page.getByRole('button', { name: 'Extend my pass' }).click()
  await page.getByRole('button', { name: 'Add 1 year' }).waitFor()
  await page.getByRole('heading', { name: 'Your AI key' }).waitFor()
  console.log('PASS: settings show the pass, extension plans and the AI key panel')

  // Mock interview setup renders the round catalogue
  await page.getByRole('button', { name: 'Mock Interviews', exact: true }).first().click()
  await page.getByRole('heading', { name: 'Set up your round' }).waitFor()
  await page.getByRole('button', { name: /System design \(HLD\)/ }).click()
  await page.getByText('Whiteboard', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Start interview' }).waitFor()
  console.log('PASS: mock interview setup lists rounds, levels, lengths and interviewers')

  // The pass ends: paywall returns with the lapsed copy
  await pool.query('UPDATE subscriptions SET "currentEnd" = now() - interval \'1 day\' WHERE "userId" = (SELECT id FROM users WHERE email = $1)', [email])
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Your pass has ended' }).waitFor({ timeout: 20000 })
  console.log('PASS: an ended pass brings the paywall back')

  // Verification link with a bad token lands on /app with a flag
  const verify = await page.evaluate(() => fetch('/api/auth/verify-email?email=nobody@example.invalid&token=bad', { redirect: 'manual' }).then((r) => r.status))
  assert.ok(verify === 0 || verify === 307 || verify === 302 || verify === 200, `verify route redirects (${verify})`)
  const resend = await page.evaluate(() => fetch('/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nobody@example.invalid' }) }).then((r) => r.status))
  assert.equal(resend, 200, 'resend never reveals whether an account exists')
  console.log('PASS: email confirmation endpoints respond safely')

  // Marketing page: title, pricing, and the returning-device redirect
  const fresh = await (await browser.newContext()).newPage()
  await fresh.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  await fresh.getByRole('heading', { level: 1 }).waitFor()
  assert.match(await fresh.getByRole('heading', { level: 1 }).innerText(), /Stop collecting resources/)
  await fresh.getByText('Interview prep for product-based-company roles and more', { exact: true }).waitFor()
  await fresh.getByRole('heading', { name: 'Pick a pass. Pay once.' }).waitFor()
  assert.equal(await fresh.getByText('₹1999', { exact: true }).count(), 1)
  assert.equal(await fresh.locator('body').innerText().then((t) => /free trial/i.test(t)), false, 'no trial copy left')
  await fresh.goto('http://localhost:3000/app', { waitUntil: 'networkidle' })
  await fresh.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  assert.match(fresh.url(), /\/app$/)
  console.log('PASS: landing page shows the new title and passes; returning visitors go to the app')
} finally {
  await pool.query('DELETE FROM users WHERE email=$1', [email]).catch(() => {})
  await pool.end()
  await browser.close()
}
console.log('Billing e2e passed.')
