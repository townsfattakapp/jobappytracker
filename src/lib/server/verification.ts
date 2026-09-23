import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt, isNull, lt } from 'drizzle-orm'
import { db } from '../db'
import { users, verificationTokens } from '../db/schema'
import { isMailerConfigured, renderEmail, sendMail, siteUrl } from './mailer'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verificationLink(email: string, token: string): string {
  const url = new URL('/api/auth/verify-email', siteUrl())
  url.searchParams.set('email', email)
  url.searchParams.set('token', token)
  return url.toString()
}

/** Issues a fresh single-use token for the email, replacing any older ones. */
export async function createVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
  await db.insert(verificationTokens).values({ identifier: email, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) })
  return token
}

export async function sendVerificationEmail(email: string, name?: string | null): Promise<void> {
  const token = await createVerificationToken(email)
  const link = verificationLink(email, token)
  const first = (name || '').trim().split(/\s+/)[0]
  const { html, text } = renderEmail({
    title: 'Confirm your email',
    intro: `${first ? `Hi ${first}, welcome` : 'Welcome'} to Prep. Confirm this address to activate your account and start your interview plan.`,
    ctaLabel: 'Confirm email',
    ctaUrl: link,
    outro: 'The link is valid for 24 hours. If you did not create an account, you can ignore this email.',
  })
  await sendMail({ to: email, subject: 'Confirm your email for Prep by EVOLW', html, text })
}

export type VerifyResult = 'verified' | 'already' | 'invalid' | 'expired'

/** Consumes a token from the confirmation link and marks the account verified. */
export async function consumeVerificationToken(email: string, token: string): Promise<VerifyResult> {
  const [user] = await db.select({ id: users.id, emailVerified: users.emailVerified }).from(users).where(eq(users.email, email))
  if (!user) return 'invalid'
  if (user.emailVerified) {
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
    return 'already'
  }
  const hashed = hashToken(token)
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, hashed)))
  if (!row) return 'invalid'
  if (row.expires.getTime() < Date.now()) {
    await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, hashed)))
    return 'expired'
  }
  await db.update(users).set({ emailVerified: new Date() }).where(and(eq(users.id, user.id), isNull(users.emailVerified)))
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
  return 'verified'
}

/**
 * Resends the confirmation email for an unverified account. Silently does
 * nothing for unknown or verified emails so the endpoint cannot be used to
 * probe accounts, and rate-limits to one email a minute per address.
 */
export async function resendVerification(email: string): Promise<'sent' | 'cooldown' | 'noop'> {
  if (!isMailerConfigured()) return 'noop'
  const [user] = await db.select({ id: users.id, name: users.name, emailVerified: users.emailVerified }).from(users).where(eq(users.email, email))
  if (!user || user.emailVerified) return 'noop'
  const [recent] = await db
    .select({ expires: verificationTokens.expires })
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, email), gt(verificationTokens.expires, new Date(Date.now() + TOKEN_TTL_MS - RESEND_COOLDOWN_MS))))
  if (recent) return 'cooldown'
  await sendVerificationEmail(email, user.name)
  return 'sent'
}

/** Housekeeping: drop expired tokens (called opportunistically). */
export async function pruneExpiredTokens(): Promise<void> {
  await db.delete(verificationTokens).where(lt(verificationTokens.expires, new Date()))
}
