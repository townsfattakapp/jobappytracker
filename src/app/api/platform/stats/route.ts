import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '../../../../lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public, anonymous numbers for the home page. Every figure is read from the
 * database (nothing is typed in by hand): published openings, companies with
 * at least one opening, and learner accounts (synthetic test accounts on
 * example.invalid excluded). Cached in memory for five minutes per instance.
 */
interface Stats {
  openings: number
  companies: number
  indiaOpenings: number
  learners: number
  updatedAt: string
}

let cache: { at: number; value: Stats } | null = null
const TTL_MS = 5 * 60_000

async function readStats(): Promise<Stats> {
  const rows = await db.execute<{ openings: number; companies: number; india: number; learners: number }>(sql`
    select
      (select count(*)::int from jobs j join companies c on c.id = j."companyId" where j.status = 'published' and c.status = 'active' and (j."expiresAt" is null or j."expiresAt" > now())) as openings,
      (select count(distinct j."companyId")::int from jobs j join companies c on c.id = j."companyId" where j.status = 'published' and c.status = 'active' and (j."expiresAt" is null or j."expiresAt" > now())) as companies,
      (select count(*)::int from jobs j join companies c on c.id = j."companyId" where j.status = 'published' and c.status = 'active' and j.region = 'india' and (j."expiresAt" is null or j."expiresAt" > now())) as india,
      (select count(*)::int from users where email not like '%@example.invalid') as learners
  `)
  const r = (Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows)[0] as { openings: number; companies: number; india: number; learners: number }
  return { openings: Number(r.openings), companies: Number(r.companies), indiaOpenings: Number(r.india), learners: Number(r.learners), updatedAt: new Date().toISOString() }
}

export async function GET() {
  try {
    if (!cache || Date.now() - cache.at > TTL_MS) cache = { at: Date.now(), value: await readStats() }
    return NextResponse.json(cache.value, { headers: { 'cache-control': 'public, max-age=300, stale-while-revalidate=600' } })
  } catch {
    return NextResponse.json({ openings: null, companies: null, indiaOpenings: null, learners: null, updatedAt: null }, { status: 200 })
  }
}
