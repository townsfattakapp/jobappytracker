import { NextResponse } from 'next/server'
import { consumeVerificationToken } from '../../../../lib/server/verification'

export const dynamic = 'force-dynamic'

/** Target of the link in the confirmation email. Lands the learner on /app with a status flag. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').trim().toLowerCase()
  const token = (url.searchParams.get('token') || '').trim()
  const target = new URL('/app', url.origin)
  if (!email || !token) {
    target.searchParams.set('verified', 'invalid')
    return NextResponse.redirect(target)
  }
  const result = await consumeVerificationToken(email, token)
  target.searchParams.set('verified', result === 'verified' || result === 'already' ? '1' : result)
  target.searchParams.set('email', email)
  return NextResponse.redirect(target)
}
