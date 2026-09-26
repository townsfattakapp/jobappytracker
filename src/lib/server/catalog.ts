import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import { companies, jobSources, jobs } from '../db/schema'
import { CATALOG_PROVENANCE, CATALOG_SOURCE_SLUG, COMPANY_CATALOG, type CatalogCompany, type CatalogFeedProvider } from '../../data/companyCatalog'
import { recordAudit } from './audit'
import { runSourceIngestion } from './ingestion'
import { logEvent } from './log'

/**
 * Company source catalog: idempotent seeding of curated companies and their
 * official listing sources, read-only feed verification against the public
 * board APIs, and a factual status per company for the admin panel.
 *
 * Statuses:
 *   Configured     verified public feed, ingestion allowed, never run yet
 *   Healthy        last ingestion run succeeded
 *   Degraded       last ingestion run failed, or the feed stopped answering
 *   Unsupported    the careers portal has no public feed JobAppy can use
 *   Not configured supported provider but the feed is not verified / not allowed
 */
export type CatalogStatus = 'Configured' | 'Healthy' | 'Degraded' | 'Unsupported' | 'Not configured'

export interface CatalogRow {
  slug: string
  name: string
  careersUrl: string
  website: string
  headquarters: string
  industry: string
  indiaRelevance: CatalogCompany['indiaRelevance']
  roleFamilies: string[]
  portal: CatalogCompany['portal']
  feed: { provider: CatalogFeedProvider; token: string; verifiedAt: string; jobsAtVerification: number; note?: string } | null
  seeded: boolean
  companyId: string | null
  sourceId: string | null
  status: CatalogStatus
  ingestionAllowed: boolean
  verificationStatus: string | null
  verifiedAt: string | null
  verificationNote: string | null
  lastVerifiedJobCount: number | null
  lastRunAt: string | null
  lastRunStatus: string | null
  lastSuccessAt: string | null
  lastError: string | null
  scheduleEnabled: boolean
  liveJobs: number
  provenance: string
  notes: string | null
}

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)

function feedConfig(entry: CatalogCompany): Record<string, unknown> {
  if (!entry.feed) return {}
  return entry.feed.provider === 'lever' ? { site: entry.feed.token } : { board: entry.feed.token }
}

/** Upserts catalog companies and their sources. Never touches admin-created companies or jobs; re-running only refreshes catalog fields. */
export async function seedCatalog(actorId: string | null): Promise<{ companiesCreated: number; companiesUpdated: number; sourcesCreated: number; sourcesUpdated: number }> {
  const now = new Date()
  const out = { companiesCreated: 0, companiesUpdated: 0, sourcesCreated: 0, sourcesUpdated: 0 }
  for (const entry of COMPANY_CATALOG) {
    let company = await db.query.companies.findFirst({ where: eq(companies.catalogSlug, entry.slug) })
    if (!company) company = await db.query.companies.findFirst({ where: eq(companies.slug, entry.slug) })
    const companyValues = { name: entry.name, website: entry.website, careersUrl: entry.careersUrl, headquarters: entry.headquarters, industry: entry.industry, catalogSlug: entry.slug, indiaRelevance: entry.indiaRelevance, roleFamilies: entry.roleFamilies, provenance: CATALOG_PROVENANCE, updatedAt: now }
    if (company) {
      await db.update(companies).set(companyValues).where(eq(companies.id, company.id))
      out.companiesUpdated += 1
    } else {
      ;[company] = await db.insert(companies).values({ id: crypto.randomUUID(), slug: entry.slug, status: 'active', createdAt: now, ...companyValues }).returning()
      out.companiesCreated += 1
    }
    const sourceSlug = CATALOG_SOURCE_SLUG(entry.slug)
    const existing = await db.query.jobSources.findFirst({ where: eq(jobSources.slug, sourceSlug) })
    const supported = Boolean(entry.feed)
    const sourceValues = {
      name: `${entry.name} careers${entry.feed ? ` (${entry.feed.provider})` : ''}`,
      type: supported ? 'ats_api' : 'career_page',
      baseUrl: entry.careersUrl,
      termsUrl: null,
      // Public, documented job-board APIs intended for embedding a company's own listings; nothing else is ingested.
      ingestionAllowed: supported,
      notes: entry.feed ? `Official ${entry.feed.provider} job board (${entry.feed.token}); verified ${entry.feed.verifiedAt} with ${entry.feed.jobsAtVerification} listing(s).${entry.feed.note ? ` ${entry.feed.note}` : ''}` : `Not configured: ${entry.name} publishes openings on its own careers portal (${entry.careersUrl}); no public feed JobAppy can use. ${entry.notes ?? ''}`.trim(),
      provider: entry.feed ? entry.feed.provider : 'manual',
      config: feedConfig(entry),
      companyId: company.id,
      autoPublish: supported,
      // Verified feeds are runnable immediately but join the scheduled pass only when an admin enables it (see scheduleCatalog).
      scheduleEnabled: false,
      catalogPortal: entry.portal,
      verificationStatus: entry.feed ? 'verified' : 'unsupported',
      verifiedAt: entry.feed ? new Date(`${entry.feed.verifiedAt}T00:00:00.000Z`) : null,
      verificationNote: entry.feed ? `Catalog probe on ${entry.feed.verifiedAt}: ${entry.feed.jobsAtVerification} listing(s), identity confirmed.` : 'No public feed; official careers link kept.',
      lastVerifiedJobCount: entry.feed ? entry.feed.jobsAtVerification : null,
      updatedAt: now,
    }
    if (existing) {
      // Keep admin decisions (status, ingestionAllowed, autoPublish) and run history; refresh catalog facts only.
      await db.update(jobSources).set({ name: sourceValues.name, baseUrl: sourceValues.baseUrl, notes: sourceValues.notes, provider: sourceValues.provider, config: sourceValues.config, companyId: sourceValues.companyId, catalogPortal: sourceValues.catalogPortal, verificationStatus: existing.verificationStatus === 'unverified' ? sourceValues.verificationStatus : existing.verificationStatus, verifiedAt: existing.verifiedAt ?? sourceValues.verifiedAt, verificationNote: existing.verificationNote ?? sourceValues.verificationNote, lastVerifiedJobCount: existing.lastVerifiedJobCount ?? sourceValues.lastVerifiedJobCount, updatedAt: now }).where(eq(jobSources.id, existing.id))
      out.sourcesUpdated += 1
    } else {
      await db.insert(jobSources).values({ id: crypto.randomUUID(), slug: sourceSlug, status: 'active', createdAt: now, ...sourceValues })
      out.sourcesCreated += 1
    }
  }
  await recordAudit({ actorId, action: 'catalog.seed', entityType: 'company_catalog', entityId: CATALOG_PROVENANCE, after: out })
  logEvent('info', 'catalog.seeded', { actorId, ...out })
  return out
}

const PROBES: Record<CatalogFeedProvider, (token: string) => string> = {
  greenhouse: (t) => `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(t)}/jobs`,
  lever: (t) => `https://api.lever.co/v0/postings/${encodeURIComponent(t)}?mode=json&limit=1`,
  ashby: (t) => `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(t)}`,
}

export interface VerifyResult {
  slug: string
  provider: CatalogFeedProvider
  status: 'verified' | 'failed'
  httpStatus: number | null
  count: number | null
  note: string
}

/** Read-only probe of every seeded supported feed; updates verification fields. Never ingests. */
export async function verifyCatalogFeeds(actorId: string | null, opts: { fetchImpl?: typeof fetch; slugs?: string[]; timeoutMs?: number } = {}): Promise<VerifyResult[]> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const results: VerifyResult[] = []
  const now = new Date()
  for (const entry of COMPANY_CATALOG) {
    if (!entry.feed) continue
    if (opts.slugs && !opts.slugs.includes(entry.slug)) continue
    const source = await db.query.jobSources.findFirst({ where: eq(jobSources.slug, CATALOG_SOURCE_SLUG(entry.slug)) })
    if (!source) continue
    let result: VerifyResult
    try {
      const res = await fetchImpl(PROBES[entry.feed.provider](entry.feed.token), { headers: { accept: 'application/json', 'user-agent': 'JobAppy-catalog-verify/1.0 (+https://prep.evolw.in)' }, signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000) })
      if (res.ok) {
        const body = (await res.json().catch(() => null)) as { jobs?: unknown[] } | unknown[] | null
        const count = Array.isArray(body) ? body.length : Array.isArray((body as { jobs?: unknown[] })?.jobs) ? (body as { jobs: unknown[] }).jobs.length : null
        result = { slug: entry.slug, provider: entry.feed.provider, status: 'verified', httpStatus: res.status, count, note: `Feed answered ${res.status} with ${count ?? 'an unknown number of'} listing(s).` }
      } else result = { slug: entry.slug, provider: entry.feed.provider, status: 'failed', httpStatus: res.status, count: null, note: `Feed answered ${res.status}.` }
    } catch (error) {
      result = { slug: entry.slug, provider: entry.feed.provider, status: 'failed', httpStatus: null, count: null, note: `Probe failed: ${error instanceof Error ? error.message : 'unknown error'}` }
    }
    await db.update(jobSources).set({ verificationStatus: result.status, verifiedAt: result.status === 'verified' ? now : source.verifiedAt, verificationNote: `${now.toISOString().slice(0, 10)}: ${result.note}`, lastVerifiedJobCount: result.count ?? source.lastVerifiedJobCount, updatedAt: now }).where(eq(jobSources.id, source.id))
    results.push(result)
  }
  await recordAudit({ actorId, action: 'catalog.verify', entityType: 'company_catalog', entityId: CATALOG_PROVENANCE, after: { verified: results.filter((r) => r.status === 'verified').length, failed: results.filter((r) => r.status === 'failed').length } })
  return results
}

/** Runs ingestion for the verified, allowed catalog sources (optionally a subset). */
export async function ingestCatalog(actorId: string, slugs?: string[]): Promise<{ slug: string; status: string; fetched: number; created: number; irrelevant: number; error: string | null }[]> {
  const out: { slug: string; status: string; fetched: number; created: number; irrelevant: number; error: string | null }[] = []
  for (const entry of COMPANY_CATALOG) {
    if (!entry.feed || (slugs && !slugs.includes(entry.slug))) continue
    const source = await db.query.jobSources.findFirst({ where: eq(jobSources.slug, CATALOG_SOURCE_SLUG(entry.slug)) })
    if (!source || !source.ingestionAllowed || source.status !== 'active' || source.verificationStatus !== 'verified') continue
    const result = await runSourceIngestion(source.id, actorId)
    if (result) out.push({ slug: entry.slug, status: result.status, fetched: result.fetched, created: result.created, irrelevant: result.irrelevant, error: result.error })
  }
  return out
}

/** Adds every verified, allowed catalog source to (or removes it from) the scheduled ingestion pass. */
export async function scheduleCatalog(actorId: string | null, enabled: boolean, slugs?: string[]): Promise<number> {
  const targets = COMPANY_CATALOG.filter((c) => c.feed && (!slugs || slugs.includes(c.slug))).map((c) => CATALOG_SOURCE_SLUG(c.slug))
  if (!targets.length) return 0
  const rows = await db.update(jobSources).set({ scheduleEnabled: enabled, updatedAt: new Date() }).where(and(inArray(jobSources.slug, targets), eq(jobSources.verificationStatus, 'verified'), eq(jobSources.ingestionAllowed, true))).returning({ id: jobSources.id })
  await recordAudit({ actorId, action: 'catalog.schedule', entityType: 'company_catalog', entityId: CATALOG_PROVENANCE, after: { enabled, sources: rows.length } })
  return rows.length
}

export function deriveStatus(entry: CatalogCompany, source: typeof jobSources.$inferSelect | null): CatalogStatus {
  if (!entry.feed) return 'Unsupported'
  if (!source) return 'Not configured'
  if (source.verificationStatus === 'failed') return 'Degraded'
  if (source.verificationStatus !== 'verified' || !source.ingestionAllowed || source.status !== 'active') return 'Not configured'
  if (source.lastRunStatus === 'failed') return 'Degraded'
  if (source.lastRunStatus === 'success') return 'Healthy'
  return 'Configured'
}

export async function catalogStatus(): Promise<{ rows: CatalogRow[]; counts: Record<CatalogStatus, number>; total: number; seeded: number }> {
  const slugs = COMPANY_CATALOG.map((c) => CATALOG_SOURCE_SLUG(c.slug))
  const sources = await db.query.jobSources.findMany({ where: inArray(jobSources.slug, slugs) })
  const catalogCompanies = await db.query.companies.findMany({ where: inArray(companies.catalogSlug, COMPANY_CATALOG.map((c) => c.slug)) })
  const companyIds = catalogCompanies.map((c) => c.id)
  const live = companyIds.length ? await db.select({ companyId: jobs.companyId, n: sql<number>`count(*)::int` }).from(jobs).where(and(inArray(jobs.companyId, companyIds), eq(jobs.status, 'published'))).groupBy(jobs.companyId) : []
  const rows: CatalogRow[] = COMPANY_CATALOG.map((entry) => {
    const company = catalogCompanies.find((c) => c.catalogSlug === entry.slug) ?? null
    const source = sources.find((s) => s.slug === CATALOG_SOURCE_SLUG(entry.slug)) ?? null
    return {
      slug: entry.slug,
      name: entry.name,
      careersUrl: entry.careersUrl,
      website: entry.website,
      headquarters: entry.headquarters,
      industry: entry.industry,
      indiaRelevance: entry.indiaRelevance,
      roleFamilies: entry.roleFamilies,
      portal: entry.portal,
      feed: entry.feed,
      seeded: Boolean(company && source),
      companyId: company?.id ?? null,
      sourceId: source?.id ?? null,
      status: deriveStatus(entry, source),
      ingestionAllowed: source?.ingestionAllowed ?? false,
      verificationStatus: source?.verificationStatus ?? null,
      verifiedAt: iso(source?.verifiedAt),
      verificationNote: source?.verificationNote ?? null,
      lastVerifiedJobCount: source?.lastVerifiedJobCount ?? null,
      lastRunAt: iso(source?.lastRunAt),
      lastRunStatus: source?.lastRunStatus ?? null,
      lastSuccessAt: iso(source?.lastSuccessAt),
      lastError: source?.lastError ?? null,
      scheduleEnabled: source?.scheduleEnabled ?? false,
      liveJobs: company ? (live.find((l) => l.companyId === company.id)?.n ?? 0) : 0,
      provenance: CATALOG_PROVENANCE,
      notes: entry.notes ?? null,
    }
  })
  const counts: Record<CatalogStatus, number> = { Configured: 0, Healthy: 0, Degraded: 0, Unsupported: 0, 'Not configured': 0 }
  for (const r of rows) counts[r.status] += 1
  return { rows, counts, total: rows.length, seeded: rows.filter((r) => r.seeded).length }
}
