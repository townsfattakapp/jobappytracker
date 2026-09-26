// Security helpers: best-effort rate limiting (window, retry-after, per-user vs per-IP keys), cron bearer
// authentication (constant-time compare, unset = 404), and the production migration approval gate.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: { rateLimit: 'src/lib/server/rateLimit.ts', cronAuth: 'src/lib/server/cronAuth.ts' },
  outdir: 'scratch/security-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  plugins: [{ name: 'next-stub', setup(b) { b.onResolve({ filter: /^next\/server$/ }, () => ({ path: 'next-server', namespace: 'stub' })); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export class NextResponse extends Response { static json(body, init) { return new Response(JSON.stringify(body), { ...init, headers: { "content-type": "application/json", ...(init && init.headers) } }) } }' })) } }],
  logLevel: 'silent',
})
const {
  rateLimit,
  rateLimited,
  clientKey,
  resetRateLimits,
  checkAuthRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
  checkSignupRateLimit,
  isDistributedRateLimitConfigured,
  distributedRateLimitStatus,
  AUTH_LIMITS,
} = await import('../scratch/security-tests/rateLimit.mjs')
const { cronAuthorized } = await import('../scratch/security-tests/cronAuth.mjs')

test('rate limit: sliding window, retry-after, separate keys per user and per IP, reset', async () => {
  resetRateLimits()
  const t0 = 1_000_000
  for (let i = 0; i < 3; i++) assert.equal(rateLimit('k', 3, 1000, t0 + i).allowed, true)
  const blocked = rateLimit('k', 3, 1000, t0 + 10)
  assert.equal(blocked.allowed, false)
  assert.ok(blocked.retryAfterMs >= 990 && blocked.retryAfterMs <= 1000)
  assert.equal(rateLimit('k', 3, 1000, t0 + 1001).allowed, true, 'window slides')
  assert.equal(rateLimit('other', 3, 1000, t0 + 10).allowed, true, 'independent keys')
  const req = new Request('http://x/api/test', { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } })
  assert.equal(clientKey(req), 'ip:203.0.113.9')
  assert.equal(clientKey(req, 'u1'), 'u:u1')
  resetRateLimits()
  let res = null
  for (let i = 0; i < 6; i++) res = rateLimited(req, 'auth.resend', 5, 60_000)
  assert.ok(res && res.status === 429)
  assert.match(res.headers.get('retry-after') ?? '', /^\d+$/)
  assert.equal((await res.json()).code, 'rate_limited')
  assert.equal(rateLimited(new Request('http://x/api/test', { headers: { 'x-forwarded-for': '198.51.100.2' } }), 'auth.resend', 5, 60_000), null, 'another client is unaffected')
})

test('credential auth abuse protection: email brute force lockout, IP burst protection, success resets email failures', () => {
  resetRateLimits()
  const t0 = 2_000_000
  const ip = '198.51.100.50'
  const email = 'user@example.com'

  // Normal sign-in attempts within limit pass
  assert.equal(checkAuthRateLimit(ip, email, t0).allowed, true)

  // 4 failed attempts on the email still allow the 5th try
  for (let i = 0; i < 4; i++) {
    recordAuthFailure(ip, email, t0 + i * 1000)
    assert.equal(checkAuthRateLimit(ip, email, t0 + (i + 1) * 1000).allowed, true)
  }

  // 5th failure trips the email account protection
  recordAuthFailure(ip, email, t0 + 4000)
  const lockedEmail = checkAuthRateLimit(ip, email, t0 + 5000)
  assert.equal(lockedEmail.allowed, false)
  assert.equal(lockedEmail.scope, 'auth.failed.email')
  assert.ok(lockedEmail.retryAfterMs > 0)

  // Another target email from same IP is still allowed
  assert.equal(checkAuthRateLimit(ip, 'other@example.com', t0 + 5000).allowed, true)

  // Successful sign-in clears the failure counter for the email
  recordAuthSuccess(ip, email)
  assert.equal(checkAuthRateLimit(ip, email, t0 + 6000).allowed, true, 'success resets email failure counter')

  // IP burst protection blocks automated attacks from a single IP
  resetRateLimits()
  for (let i = 0; i < AUTH_LIMITS.SIGNIN_IP_LIMIT; i++) {
    assert.equal(checkAuthRateLimit(ip, `victim${i}@example.com`, t0 + i * 100).allowed, true)
  }
  const blockedIp = checkAuthRateLimit(ip, 'victim99@example.com', t0 + 2000)
  assert.equal(blockedIp.allowed, false)
  assert.equal(blockedIp.scope, 'auth.signin.ip')

  // Signup abuse limiter limits new accounts per IP
  resetRateLimits()
  for (let i = 0; i < AUTH_LIMITS.SIGNUP_IP_LIMIT; i++) {
    assert.equal(checkSignupRateLimit(ip, t0 + i * 100).allowed, true)
  }
  assert.equal(checkSignupRateLimit(ip, t0 + 2000).allowed, false)
  assert.equal(checkSignupRateLimit('203.0.113.1', t0 + 2000).allowed, true, 'different IP allowed')

  // Distributed status abstraction correctly marks in-memory fallback as NOT CONFIGURED
  assert.equal(isDistributedRateLimitConfigured(), false)
  const status = distributedRateLimitStatus()
  assert.equal(status.status, 'NOT CONFIGURED')
  assert.equal(status.isDistributed, false)
  assert.match(status.detail, /NOT CONFIGURED/)
})

test('cron authentication: unset secret hides the endpoint, wrong or missing bearer is refused, exact bearer passes', () => {
  assert.deepEqual(cronAuthorized(new Headers(), ''), { ok: false, reason: 'not_configured' })
  assert.deepEqual(cronAuthorized(new Headers(), 'secret-1'), { ok: false, reason: 'missing' })
  assert.deepEqual(cronAuthorized(new Headers({ authorization: 'Bearer nope' }), 'secret-1'), { ok: false, reason: 'mismatch' })
  assert.deepEqual(cronAuthorized(new Headers({ authorization: 'Bearer secret-1' }), 'secret-1'), { ok: true, reason: null })
})

