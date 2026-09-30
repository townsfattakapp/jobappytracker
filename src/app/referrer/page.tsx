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
          <h1 className="font-display text-2xl font-bold">Referrer Portal: Verified Endorsement Network</h1>
          <p className="text-sm text-muted-foreground">Help top candidates land roles through verified employee referrals and end-to-end qualification screening. As a verified employee, you maintain referral quality by testing candidate qualifications before submitting internal endorsements. You choose which requests to screen and set your own availability. Your name and personal email stay private unless you choose to share your identity.</p>
          <p className="text-sm text-muted-foreground">Create an account or sign in using your personal email. No work email is required. Once signed in, you can apply directly to become a verified referrer in 60 seconds, or accept an invitation token.</p>
          <ReferralSteps steps={[
            { title: '1. Join with personal email', detail: 'Sign up securely while our team confirms your employer affiliation.' },
            { title: '2. Screen & test candidates', detail: 'Review pre-screened candidates and test domain qualifications.' },
            { title: '3. Internal endorsement', detail: 'Submit qualified candidates to your employer’s internal portal and claim your referral bonus.' },
          ]} />
          <div className="referral-actions">
            <a href={`/app?mode=signup&next=${encodeURIComponent(next)}`} className="btn btn-primary">
              Apply as a Referrer
            </a>
            <a href={`/app?mode=signin&next=${encodeURIComponent(next)}`} className="btn btn-ghost">
              Sign in
            </a>
          </div>
          <p className="referral-trust">JobAppy upholds strict candidate qualification standards. Internal endorsements are submitted by verified employees in accordance with their employer’s referral policies.</p>
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
