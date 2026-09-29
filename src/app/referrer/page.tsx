import type { Metadata } from 'next'
import { auth } from '../../lib/auth'
import ReferrerPortal from '../../components/referrer/ReferrerPortal'
import ReferralSteps from '../../components/referrer/ReferralSteps'
import BrandLogo from '../../components/BrandLogo'

export const metadata: Metadata = { title: 'Referrer portal · Prep by EVOLW', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/** The referrer portal. Signed-out visitors get a sign-in prompt; the invite token, when present, is handed to the client. */
export default async function ReferrerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const token = typeof sp.token === 'string' ? sp.token : null
  const session = await auth()
  if (!session?.user?.id) {
    const next = token ? `/referrer?token=${encodeURIComponent(token)}` : '/referrer'
    return (
      <main className="referrer-shell">
        <div className="referrer-portal"><div className="surface referrer-card referral-hero">
          <a href="/?home=1" aria-label="Prep home"><BrandLogo size={32} /></a>
          <h1 className="font-display text-2xl font-bold">Referrer portal</h1>
          <p className="text-sm text-muted-foreground">Help candidates by reviewing referral requests for your company. You choose which requests to accept and set your own availability. Your name and personal email stay private unless you choose to share your identity.</p>
          <p className="text-sm text-muted-foreground">Create an account or sign in using the personal email that received your invitation. No work email is required. Then accept your invitation, complete your profile, confirm your personal email and wait for our team to verify your employment.</p>
          <ReferralSteps steps={[
            { title: 'Join with personal email', detail: 'Use the address that received your invitation.' },
            { title: 'Get verified', detail: 'Confirm your email and complete an employment review.' },
            { title: 'Help on your terms', detail: 'Choose requests and submit through your employer.' },
          ]} />
          <div className="referral-actions"><a href={`/app?mode=signin&next=${encodeURIComponent(next)}`} className="btn btn-primary">
            Sign in
          </a>
          <a href={`/app?mode=signup&next=${encodeURIComponent(next)}`} className="btn btn-ghost">Create account</a></div>
          {!token && <a href="mailto:hello@evolw.in?subject=Join%20the%20JobAppy%20referrer%20network" className="btn btn-link">Request an invitation</a>}
          <p className="referral-trust">JobAppy is independent of your employer. A request never guarantees a referral, interview or job.</p>
        </div></div>
      </main>
    )
  }
  return (
    <main className="referrer-shell">
      <ReferrerPortal email={session.user.email ?? ''} inviteToken={token} />
    </main>
  )
}
