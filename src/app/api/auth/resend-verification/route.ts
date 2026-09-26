import { NextResponse } from 'next/server'
import { rateLimited } from '../../../../lib/server/rateLimit'
import { resendVerification } from '../../../../lib/server/verification'

export const dynamic = 'force-dynamic'

/** Sends a fresh confirmation email. Always answers 200 so it cannot be used to probe accounts. */
export async function POST(req: Request) {
  const burst = rateLimited(req, 'auth.resend', 5, 10 * 60_000)
  if (burst) return burst
  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = String(body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  try {
    const result = await resendVerification(email)
    return NextResponse.json({ ok: true, cooldown: result === 'cooldown' })
  } catch (err) {
    console.error('resend-verification failed', err)
    return NextResponse.json({ error: 'Could not send the email right now. Try again in a minute.' }, { status: 500 })
  }
}
