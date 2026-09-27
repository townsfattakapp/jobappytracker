import { redirect } from 'next/navigation'

/** Invitation links land here and continue to the portal with the token; the portal accepts it once the user is signed in. */
export default async function ReferrerInvitePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const token = typeof sp.token === 'string' ? sp.token : ''
  redirect(token ? `/referrer?token=${encodeURIComponent(token)}` : '/referrer')
}
