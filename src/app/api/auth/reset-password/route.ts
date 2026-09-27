import { NextResponse } from 'next/server'
import { MIN_PASSWORD_LENGTH } from '../../../../lib/authErrors'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { resetPassword } from '../../../../lib/server/passwordReset'

export const dynamic = 'force-dynamic'

/** Consumes the token from the reset link and sets the new password. */
export async function POST(req: Request) {
  const burst = rateLimited(req, 'auth.reset', 10, 10 * 60_000)
  if (burst) return burst
  const body = (await req.json().catch(() => ({}))) as { email?: string; token?: string; password?: string }
  const email = String(body.email || '').trim().toLowerCase()
  const token = String(body.token || '').trim()
  const password = String(body.password || '')
  if (!email || !token) return NextResponse.json({ error: 'This reset link is incomplete. Open the link from the email again.' }, { status: 400 })
  const result = await resetPassword(email, token, password, MIN_PASSWORD_LENGTH)
  if (result === 'weak_password') return NextResponse.json({ error: `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 })
  if (result === 'expired') return NextResponse.json({ error: 'This reset link has expired. Request a new one from the sign-in screen.' }, { status: 400 })
  if (result === 'invalid') return NextResponse.json({ error: 'This reset link is not valid any more. Request a new one from the sign-in screen.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
