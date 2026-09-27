import { NextResponse } from 'next/server'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { requestPasswordReset } from '../../../../lib/server/passwordReset'
import { isMailerConfigured } from '../../../../lib/server/mailer'

export const dynamic = 'force-dynamic'

/** Sends a reset link when the address has a password account. Always answers the same 200 so it cannot probe accounts. */
export async function POST(req: Request) {
  const burst = rateLimited(req, 'auth.forgot', 5, 10 * 60_000)
  if (burst) return burst
  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = String(body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter the email address of your account.' }, { status: 400 })
  if (!isMailerConfigured()) return NextResponse.json({ error: 'Password reset by email is not switched on yet. Write to hello@evolw.in from your account email and we will reset it for you.' }, { status: 503 })
  try {
    await requestPasswordReset(email)
  } catch (err) {
    console.error('forgot-password failed', err)
  }
  return NextResponse.json({ ok: true, message: 'If that address has a Prep account with a password, a reset link is on its way. It works once and expires in one hour.' })
}
