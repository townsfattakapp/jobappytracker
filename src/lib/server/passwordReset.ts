import { createHash, randomBytes } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { users, verificationTokens } from '../db/schema'
import { hashPassword } from '../password'
import { isMailerConfigured, renderEmail, sendMail, siteUrl } from './mailer'
import { logEvent } from './log'

/**
 * Forgot-password flow. A single-use token (stored hashed, one hour) is
 * emailed as a link to /reset-password; consuming it sets the new password
 * hash and removes every reset token for the address. The request endpoint
 * always answers the same way so it cannot be used to find accounts.
 */
const TOKEN_TTL_MS = 60 * 60 * 1000
const IDENTIFIER_PREFIX = 'reset:'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function resetLink(email: string, token: string): string {
  const url = new URL('/reset-password', siteUrl())
  url.searchParams.set('email', email)
  url.searchParams.set('token', token)
  return url.toString()
}

export async function createResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const identifier = IDENTIFIER_PREFIX + email
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
  await db.insert(verificationTokens).values({ identifier, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) })
  return token
}

export type RequestResetResult = 'sent' | 'no_account' | 'no_password' | 'mailer_off'

/** Emails a reset link when the address belongs to a password account. Callers must not reveal which outcome happened. */
export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  const [user] = await db.select({ id: users.id, name: users.name, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email))
  if (!user) return 'no_account'
  if (!user.passwordHash) return 'no_password' // Google sign-in accounts have no password to reset
  if (!isMailerConfigured()) {
    logEvent('warn', 'auth.reset_requested_without_mailer', { userId: user.id })
    return 'mailer_off'
  }
  const token = await createResetToken(email)
  const first = (user.name || '').trim().split(/\s+/)[0]
  const { html, text } = renderEmail({
    title: 'Reset your password',
    intro: `${first ? `Hi ${first}, someone` : 'Someone'} asked to reset the password of your Prep account. If that was you, choose a new password with the button below.`,
    ctaLabel: 'Choose a new password',
    ctaUrl: resetLink(email, token),
    outro: 'The link works once and expires in one hour. If you did not ask for this, ignore the email; your password stays as it is.',
  })
  await sendMail({ to: email, subject: 'Reset your Prep password', html, text })
  logEvent('info', 'auth.reset_email_sent', { userId: user.id })
  return 'sent'
}

export type ResetResult = 'reset' | 'invalid' | 'expired' | 'weak_password'

export async function resetPassword(email: string, token: string, password: string, minLength: number): Promise<ResetResult> {
  if (password.length < minLength) return 'weak_password'
  const identifier = IDENTIFIER_PREFIX + email
  const hashed = hashToken(token)
  const [row] = await db.select().from(verificationTokens).where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, hashed)))
  if (!row) return 'invalid'
  if (row.expires.getTime() < Date.now()) {
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
    return 'expired'
  }
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email))
  if (!user) return 'invalid'
  await db.update(users).set({ passwordHash: await hashPassword(password), emailVerified: new Date() }).where(eq(users.id, user.id))
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
  logEvent('info', 'auth.password_reset', { userId: user.id })
  return 'reset'
}
