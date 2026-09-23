// Test helper: grant a paid pass to an account directly in the database, the
// way a verified Razorpay order would. There is no trial, so every e2e script
// that signs up a fresh account calls this before using paid features.
export async function grantPass(pool, email, { planId = 'quarter', days = 90 } = {}) {
  await pool.query(
    `INSERT INTO subscriptions (id, "userId", "planId", status, "currentStart", "currentEnd", "lastPaymentId")
     VALUES ($1, (SELECT id FROM users WHERE email = $2), $3, 'paid', now(), now() + ($4 || ' days')::interval, $5)`,
    [`order_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, email, planId, String(days), `pay_e2e_${Date.now()}`],
  )
}

/** Polls the session endpoint from the page until the account is signed in. */
export async function waitForSession(page, timeoutMs = 45000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const session = await page.evaluate(() => fetch('/api/auth/session').then((r) => r.json()).catch(() => null))
    if (session && session.user && session.user.id) return session
    await page.waitForTimeout(500)
  }
  throw new Error('Signed-in session did not appear in time')
}

/** Sign-up on /app, grant a pass, and reload so the paywall is gone. */
export async function signUpWithPass(page, pool, email, password, opts = {}) {
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await waitForSession(page)
  await grantPass(pool, email, opts)
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSession(page)
}
