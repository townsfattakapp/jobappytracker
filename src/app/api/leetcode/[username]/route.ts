import { NextResponse } from 'next/server'

/**
 * Proxies LeetCode's public GraphQL endpoint so the browser avoids CORS
 * and the app does not depend on a third-party mirror.
 */
const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

const QUERY = `
  query profile($username: String!, $limit: Int!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
    recentAcSubmissionList(username: $username, limit: $limit) {
      id title titleSlug timestamp lang
    }
  }
`

export async function GET(_req: Request, context: { params: Promise<{ username: string }> }) {
  const { username: raw } = await context.params
  const username = decodeURIComponent(raw || '').trim()
  if (!/^[A-Za-z0-9_.-]{1,40}$/.test(username)) {
    return NextResponse.json({ error: 'Invalid LeetCode username' }, { status: 400 })
  }

  try {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (compatible; PrepByEvolw/1.0)',
      },
      body: JSON.stringify({ query: QUERY, variables: { username, limit: 50 } }),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ error: `LeetCode responded with ${res.status}` }, { status: 502 })
    }
    const data = await res.json()
    const user = data?.data?.matchedUser
    if (!user) return NextResponse.json({ error: 'LeetCode user not found' }, { status: 404 })

    const all = (user.submitStatsGlobal?.acSubmissionNum || []).find(
      (row: { difficulty: string; count: number }) => row.difficulty === 'All',
    )
    const submissions = (data?.data?.recentAcSubmissionList || []).map(
      (s: { id: string; title: string; titleSlug: string; timestamp: string; lang: string }) => ({
        id: String(s.id),
        title: s.title,
        titleSlug: s.titleSlug,
        timestamp: Number(s.timestamp) * 1000,
        lang: s.lang,
      }),
    )
    return NextResponse.json({ username: user.username, totalSolved: all?.count ?? 0, submissions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LeetCode request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
