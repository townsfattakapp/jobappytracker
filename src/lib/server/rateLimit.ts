import { NextResponse } from 'next/server'
import { logEvent } from './log'

/**
 * Pluggable rate limiter backend interface.
 * When durable distributed infrastructure (Redis / Upstash / KV) is configured,
 * it serves as the global authoritative limiter across multi-instance / serverless nodes.
 * Otherwise, the in-memory sliding-window limiter is used as a per-instance fallback,
 * and distributed enforcement is marked NOT CONFIGURED.
 */
export interface RateLimitBackend {
  readonly name: string
  readonly isDistributed: boolean
  rateLimit(
    key: string,
    limit: number,
    windowMs: number,
    now?: number,
  ): { allowed: boolean; remaining: number; retryAfterMs: number }
  clear?(key?: string): void
  getTimestamps?(key: string): number[]
}

class InMemoryRateLimitBackend implements RateLimitBackend {
  readonly name = 'in_memory'
  readonly isDistributed = false
  public buckets = new Map<string, number[]>()
  private lastSweep = 0

  rateLimit(
    key: string,
    limit: number,
    windowMs: number,
    now = Date.now(),
  ): { allowed: boolean; remaining: number; retryAfterMs: number } {
    if (now - this.lastSweep > windowMs) {
      for (const [k, times] of this.buckets) {
        if (!times.length || times[times.length - 1] < now - windowMs) this.buckets.delete(k)
      }
      this.lastSweep = now
    }
    const times = (this.buckets.get(key) ?? []).filter((t) => t > now - windowMs)
    if (times.length >= limit) {
      this.buckets.set(key, times)
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(1000, times[0] + windowMs - now) }
    }
    times.push(now)
    this.buckets.set(key, times)
    return { allowed: true, remaining: limit - times.length, retryAfterMs: 0 }
  }

  clear(key?: string): void {
    if (key) {
      this.buckets.delete(key)
    } else {
      this.buckets.clear()
    }
  }

  getTimestamps(key: string): number[] {
    return this.buckets.get(key) ?? []
  }
}

const defaultBackend = new InMemoryRateLimitBackend()
let activeBackend: RateLimitBackend = defaultBackend

export function setRateLimitBackend(backend: RateLimitBackend): void {
  activeBackend = backend
}

export function resetRateLimitBackend(): void {
  activeBackend = defaultBackend
}

/**
 * Checks whether distributed rate limiting infrastructure (e.g. Upstash Redis, Redis) is configured.
 * In this deployment environment without distributed external infrastructure, returns NOT CONFIGURED.
 */
export function isDistributedRateLimitConfigured(): boolean {
  return activeBackend.isDistributed
}

export function distributedRateLimitStatus(): {
  status: 'READY' | 'NOT CONFIGURED'
  backend: string
  isDistributed: boolean
  detail: string
} {
  if (activeBackend.isDistributed) {
    return {
      status: 'READY',
      backend: activeBackend.name,
      isDistributed: true,
      detail: `Distributed rate limiting enabled via ${activeBackend.name}.`,
    }
  }
  return {
    status: 'NOT CONFIGURED',
    backend: 'in_memory',
    isDistributed: false,
    detail:
      'In-memory sliding-window limiter active per process/instance. Distributed external rate-limit infrastructure (e.g. Redis / Upstash) is NOT CONFIGURED; multi-instance serverless deployments enforce limits independently per node.',
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  return activeBackend.rateLimit(key, limit, windowMs, now)
}

export function clientKey(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return `ip:${fwd || req.headers.get('x-real-ip') || 'unknown'}`
}

export function rateLimited(
  req: Request,
  scope: string,
  limit: number,
  windowMs: number,
  userId?: string | null,
): NextResponse | null {
  const key = `${scope}:${clientKey(req, userId)}`
  const result = rateLimit(key, limit, windowMs)
  if (result.allowed) return null
  logEvent('warn', 'security.rate_limited', {
    scope,
    key: key.startsWith(`${scope}:u:`) ? 'user' : 'ip',
    retryAfterMs: result.retryAfterMs,
  })
  return NextResponse.json(
    { error: 'Too many requests. Please wait a moment and try again.', code: 'rate_limited' },
    { status: 429, headers: { 'retry-after': String(Math.ceil(result.retryAfterMs / 1000)) } },
  )
}

// ---------------------------------------------------------------------------
// Authentication Abuse Protection
// ---------------------------------------------------------------------------

/**
 * Credential Authentication Abuse Protection parameters:
 * - IP burst protection: 15 sign-in attempts per 60 seconds per IP.
 * - Target email protection: 5 failed attempts per 15 minutes per email (prevents dictionary attacks on an account).
 * - Signup abuse protection: 5 sign-ups per 10 minutes per IP.
 */
export const AUTH_LIMITS = {
  SIGNIN_IP_LIMIT: 15,
  SIGNIN_IP_WINDOW_MS: 60_000,
  FAILED_EMAIL_LIMIT: 5,
  FAILED_EMAIL_WINDOW_MS: 15 * 60_000,
  SIGNUP_IP_LIMIT: 5,
  SIGNUP_IP_WINDOW_MS: 10 * 60_000,
} as const

const isLoopback = (ip: string) => ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === '::ffff:127.0.0.1'

export function checkAuthRateLimit(
  ip: string,
  email?: string,
  now = Date.now(),
): { allowed: boolean; retryAfterMs: number; scope?: string } {
  const normIp = (ip || 'unknown').trim().toLowerCase()
  // 1. Check IP burst limiter (higher ceiling on loopback for local e2e runs)
  const ipKey = `auth.signin.ip:${normIp}`
  const ipLimit = isLoopback(normIp) ? 200 : AUTH_LIMITS.SIGNIN_IP_LIMIT
  const ipResult = rateLimit(ipKey, ipLimit, AUTH_LIMITS.SIGNIN_IP_WINDOW_MS, now)
  if (!ipResult.allowed) {
    logEvent('warn', 'security.rate_limited', { scope: 'auth.signin.ip', ip: normIp, retryAfterMs: ipResult.retryAfterMs })
    return { allowed: false, retryAfterMs: ipResult.retryAfterMs, scope: 'auth.signin.ip' }
  }

  // 2. Check target email failed attempts limiter if email supplied
  if (email) {
    const normEmail = email.trim().toLowerCase()
    const emailKey = `auth.failed.email:${normEmail}`
    const times = activeBackend.getTimestamps?.(emailKey) ?? []
    const recent = times.filter((t: number) => t > now - AUTH_LIMITS.FAILED_EMAIL_WINDOW_MS)
    if (recent.length >= AUTH_LIMITS.FAILED_EMAIL_LIMIT) {
      const retryAfterMs = Math.max(1000, recent[0] + AUTH_LIMITS.FAILED_EMAIL_WINDOW_MS - now)
      logEvent('warn', 'security.rate_limited', { scope: 'auth.failed.email', email: '[target]', retryAfterMs })
      return { allowed: false, retryAfterMs, scope: 'auth.failed.email' }
    }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export function recordAuthFailure(_ip: string, email?: string, now = Date.now()): void {
  if (email) {
    const normEmail = email.trim().toLowerCase()
    const emailKey = `auth.failed.email:${normEmail}`
    rateLimit(emailKey, 9999, AUTH_LIMITS.FAILED_EMAIL_WINDOW_MS, now)
  }
}

export function recordAuthSuccess(_ip: string, email?: string): void {
  if (email) {
    const normEmail = email.trim().toLowerCase()
    activeBackend.clear?.(`auth.failed.email:${normEmail}`)
  }
}

export function checkSignupRateLimit(ip: string, now = Date.now()): { allowed: boolean; retryAfterMs: number } {
  const normIp = (ip || 'unknown').trim().toLowerCase()
  const key = `auth.signup.ip:${normIp}`
  const limit = isLoopback(normIp) ? 100 : AUTH_LIMITS.SIGNUP_IP_LIMIT
  const res = rateLimit(key, limit, AUTH_LIMITS.SIGNUP_IP_WINDOW_MS, now)
  if (!res.allowed) {
    logEvent('warn', 'security.rate_limited', { scope: 'auth.signup.ip', ip: normIp, retryAfterMs: res.retryAfterMs })
  }
  return res
}

/** Test helper: clears all buckets. */
export function resetRateLimits(): void {
  activeBackend.clear?.()
}
