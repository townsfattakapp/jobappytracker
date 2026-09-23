import { NextResponse } from 'next/server'
import { googleEnabled } from '../../../../lib/auth'
import { isMailerConfigured } from '../../../../lib/server/mailer'

export const dynamic = 'force-dynamic'

/** Which sign-in methods this deployment offers; read by the sign-in form. */
export async function GET() {
  return NextResponse.json({ google: googleEnabled, emailConfirmation: isMailerConfigured() })
}
