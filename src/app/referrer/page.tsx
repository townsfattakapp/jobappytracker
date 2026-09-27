import type { Metadata } from 'next'
import { auth } from '../../lib/auth'
import ReferrerPortal from '../../components/referrer/ReferrerPortal'

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
        <div className="surface referrer-card">
          <h1 className="font-display text-2xl font-bold">Referrer portal</h1>
          <p className="text-sm text-muted-foreground">Sign in with the account you use for JobAppy, then come back to this page. If you are accepting an invitation, keep this link.</p>
          <a href={`/app?mode=signin&next=${encodeURIComponent(next)}`} className="btn btn-primary mt-3">
            Sign in
          </a>
        </div>
      </main>
    )
  }
  return (
    <main className="referrer-shell">
      <ReferrerPortal email={session.user.email ?? ''} inviteToken={token} />
    </main>
  )
}
