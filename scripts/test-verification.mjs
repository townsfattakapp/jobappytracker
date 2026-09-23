// Email confirmation round-trip against the DATABASE_URL in .env.local, with
// the Resend API stubbed so no email leaves the machine.
// Run: node scripts/test-verification.mjs
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import fs from 'node:fs'
import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config({ path: '.env.local', quiet: true })
process.env.RESEND_API_KEY = 're_test_stub'
process.env.EMAIL_FROM = 'Prep by EVOLW <hello@evolw.in>'
process.env.NEXT_PUBLIC_SITE_URL = 'https://prep.example.test'

fs.mkdirSync('scratch/learning-tests', { recursive: true })
await build({
  entryPoints: { verification: 'src/lib/server/verification.ts', mailer: 'src/lib/server/mailer.ts' },
  outdir: 'scratch/learning-tests',
  bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent',
  external: ['pg', 'nodemailer'],
})

const sent = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith('https://api.resend.com/')) {
    sent.push(JSON.parse(init.body))
    return new Response(JSON.stringify({ id: 'email_stub' }), { status: 200 })
  }
  return realFetch(url, init)
}

const { isMailerConfigured, renderEmail, siteUrl } = await import('../scratch/learning-tests/mailer.mjs')
const { sendVerificationEmail, consumeVerificationToken, resendVerification } = await import('../scratch/learning-tests/verification.mjs')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const email = `verify-test-${Date.now()}@example.invalid`

try {
  assert.equal(isMailerConfigured(), true)
  assert.equal(siteUrl(), 'https://prep.example.test')
  const rendered = renderEmail({ title: 'T <b>', intro: 'i', ctaLabel: 'Go', ctaUrl: 'https://x.test/?a=1&b=2', outro: 'o' })
  assert.match(rendered.html, /T &lt;b&gt;/)
  assert.match(rendered.text, /Go: https:\/\/x\.test\/\?a=1&b=2/)
  console.log('PASS: mailer configuration and templating')

  await pool.query('INSERT INTO users (id, email, name, "passwordHash") VALUES ($1, $2, $3, $4)', [`verify-${Date.now()}`, email, 'Verify Tester', 'x'])

  await sendVerificationEmail(email, 'Verify Tester')
  assert.equal(sent.length, 1)
  assert.equal(sent[0].to[0], email)
  assert.match(sent[0].subject, /Confirm your email/)
  const link = new URL(sent[0].text.match(/https:\/\/prep\.example\.test\/api\/auth\/verify-email\?[^\s]+/)[0])
  assert.equal(link.searchParams.get('email'), email)
  const token = link.searchParams.get('token')
  assert.ok(token && token.length > 30)
  const [{ token: stored }] = (await pool.query('SELECT token FROM verification_tokens WHERE identifier = $1', [email])).rows
  assert.notEqual(stored, token, 'only a hash of the token is stored')
  console.log('PASS: confirmation email carries a single-use link and only the hash is stored')

  assert.equal(await consumeVerificationToken(email, 'wrong-token'), 'invalid')
  assert.equal(await consumeVerificationToken('nobody@example.invalid', token), 'invalid')
  let [row] = (await pool.query('SELECT "emailVerified" FROM users WHERE email = $1', [email])).rows
  assert.equal(row.emailVerified, null)
  assert.equal(await consumeVerificationToken(email, token), 'verified')
  ;[row] = (await pool.query('SELECT "emailVerified" FROM users WHERE email = $1', [email])).rows
  assert.ok(row.emailVerified)
  assert.equal(await consumeVerificationToken(email, token), 'already')
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM verification_tokens WHERE identifier = $1', [email])).rows[0].n, 0)
  console.log('PASS: wrong tokens are rejected, the right one verifies once and is consumed')

  assert.equal(await resendVerification(email), 'noop', 'verified accounts are not emailed again')
  assert.equal(await resendVerification('nobody@example.invalid'), 'noop')
  await pool.query('UPDATE users SET "emailVerified" = NULL WHERE email = $1', [email])
  assert.equal(await resendVerification(email), 'sent')
  assert.equal(await resendVerification(email), 'cooldown', 'one email a minute')
  assert.equal(sent.length, 2)
  console.log('PASS: resend is silent for unknown or verified accounts and rate-limited otherwise')

  // Expired token
  await pool.query('UPDATE verification_tokens SET expires = now() - interval \'1 hour\' WHERE identifier = $1', [email])
  const link2 = new URL(sent[1].text.match(/https:\/\/prep\.example\.test\/api\/auth\/verify-email\?[^\s]+/)[0])
  assert.equal(await consumeVerificationToken(email, link2.searchParams.get('token')), 'expired')
  console.log('PASS: expired links are refused')
} finally {
  await pool.query('DELETE FROM verification_tokens WHERE identifier = $1', [email]).catch(() => {})
  await pool.query('DELETE FROM users WHERE email = $1', [email]).catch(() => {})
  await pool.end()
}
console.log('Verification tests passed.')
