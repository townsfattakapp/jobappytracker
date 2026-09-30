import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import { companies, jobSources, jobs, jobIngestionRuns } from '../db/schema'
import { CATALOG_PROVENANCE, CATALOG_SOURCE_SLUG, COMPANY_CATALOG, type CatalogCompany, type CatalogFeedProvider } from '../../data/companyCatalog'
import { recordAudit } from './audit'
import { runScheduledIngestion } from '../ingestion/scheduler'
import { getRoleFamilyConfig } from './settings'
import { detectCareerSource, discoverCareerSource, publicCareersFetch, PublicAccessError, type Discovery } from '../ingestion/publicCareers'
import { providerById } from '../ingestion/providers'
import { logEvent } from './log'
import { eightfoldSearchUrl, parseEightfoldToken } from '../ingestion/providers/eightfold'
import { BROWSER_HEADERS } from '../ingestion/providers/shared'
import { parseWorkdayToken, workdayListRequest } from '../ingestion/providers/workday'
import { oracleListUrl, parseOracleToken } from '../ingestion/providers/oraclecloud'
import { smartRecruitersListUrl } from '../ingestion/providers/smartrecruiters'
import { ATLASSIAN_LISTINGS_URL } from '../ingestion/providers/atlassian'
import { kekaListUrl, parseKekaToken } from '../ingestion/providers/keka'
import { adzunaCredentials, adzunaSearchUrl, parseAdzunaToken } from '../ingestion/providers/adzuna'

/**
 * Company source catalog: idempotent seeding of curated companies and their
 * official listing sources, read-only feed verification against the public
 * board APIs, and a factual status per company for the admin panel.
 *
 * Statuses:
 *   Configured     verified public feed, ingestion allowed, never run yet
 *   Healthy        last ingestion run succeeded
 *   Degraded       last ingestion run failed, or the feed stopped answering
 *   Unsupported    the careers portal has neither a public feed nor a readable JSON endpoint
 *   Not configured supported provider but the feed is not verified / not allowed
 */
export type CatalogStatus = 'Configured' | 'Healthy' | 'Degraded' | 'Unsupported' | 'Not configured' | 'Protected' | 'Requires manual review'

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
  providerDetected: string
  extractionSupported: boolean
  extractionStatus: string
  jobsFetched: number | null
  relevantJobs: number | null
  duplicatesRemoved: number | null
  staleJobs: number
  integrated: boolean
}

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)

/** Providers that read a careers site's own (unofficial) JSON endpoint rather than a documented board API. */
export const SITE_PROVIDERS = new Set<CatalogFeedProvider>(['amazon', 'eightfold', 'workday', 'oraclecloud', 'atlassian', 'keka'])

export function feedConfig(entry: CatalogCompany): Record<string, unknown> {
  if (!entry.feed) return {}
  const { provider, token, config } = entry.feed
  const base =
    provider === 'lever' ? { site: token } : provider === 'smartrecruiters' ? { company: token } : provider === 'amazon' || provider === 'atlassian' ? {} : provider === 'eightfold' ? parseEightfoldToken(token) : provider === 'workday' ? parseWorkdayToken(token) : provider === 'oraclecloud' ? parseOracleToken(token) : provider === 'keka' ? parseKekaToken(token) : provider === 'adzuna' ? parseAdzunaToken(token) : { board: token }
  return { ...base, ...(config ?? {}) }
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
      name: entry.feed?.provider === 'adzuna' ? `${entry.name} via Adzuna` : `${entry.name} careers${entry.feed ? ` (${entry.feed.provider})` : ''}`,
      type: supported ? 'ats_api' : 'career_page',
      baseUrl: entry.careersUrl,
      termsUrl: null,
      // Documented job-board APIs, or the JSON endpoint the company's own careers site calls; HTML is never scraped.
      ingestionAllowed: supported,
      notes: entry.feed ? `${entry.feed.provider === 'adzuna' ? 'Licensed aggregator API (Adzuna); snippets and Adzuna redirect links' : SITE_PROVIDERS.has(entry.feed.provider) ? `Careers-site JSON endpoint (${entry.feed.provider}, unofficial)` : `Official ${entry.feed.provider} job board`} (${entry.feed.token}); verified ${entry.feed.verifiedAt} with ${entry.feed.jobsAtVerification} listing(s).${entry.feed.note ? ` ${entry.feed.note}` : ''}` : `Not configured: ${entry.name} publishes openings on its own careers portal (${entry.careersUrl}); no public feed JobAppy can use. ${entry.notes ?? ''}`.trim(),
      provider: entry.feed ? entry.feed.provider : 'manual',
      config: entry.feed ? feedConfig(entry) : { discovery: { ...detectCareerSource(entry.careersUrl), status: 'NOT CONFIGURED', note: 'URL classified; public extraction has not been checked.' } },
      companyId: company.id,
      autoPublish: supported,
      // Verified feeds are runnable immediately but join the scheduled pass only when an admin enables it (see scheduleCatalog).
      scheduleEnabled: false,
      catalogPortal: entry.portal,
      verificationStatus: entry.feed ? 'verified' : 'not_configured',
      verifiedAt: entry.feed ? new Date(`${entry.feed.verifiedAt}T00:00:00.000Z`) : null,
      verificationNote: entry.feed ? `Catalog probe on ${entry.feed.verifiedAt}: ${entry.feed.jobsAtVerification} listing(s), identity confirmed.` : 'Discovery pending; official careers link kept.',
      lastVerifiedJobCount: entry.feed ? entry.feed.jobsAtVerification : null,
      updatedAt: now,
    }
    if (existing && existing.provider === 'manual' && entry.feed) {
      // The catalog gained a feed for a portal that was unsupported: configure it like a new source (there was no admin decision to keep).
      await db.update(jobSources).set({ ...sourceValues, status: 'active' }).where(eq(jobSources.id, existing.id))
      out.sourcesUpdated += 1
    } else if (existing) {
      // Keep admin decisions (status, ingestionAllowed, autoPublish) and run history; refresh catalog facts only.
      await db.update(jobSources).set({ name: sourceValues.name, baseUrl: sourceValues.baseUrl, notes: sourceValues.notes, provider: existing.config?.discovery ? existing.provider : sourceValues.provider, config: existing.config?.discovery ? existing.config : sourceValues.config, companyId: sourceValues.companyId, catalogPortal: sourceValues.catalogPortal, verificationStatus: existing.verificationStatus === 'unverified' && !existing.config?.discovery ? sourceValues.verificationStatus : existing.verificationStatus, verifiedAt: existing.verifiedAt ?? sourceValues.verifiedAt, verificationNote: existing.verificationNote ?? sourceValues.verificationNote, lastVerifiedJobCount: existing.lastVerifiedJobCount ?? sourceValues.lastVerifiedJobCount, updatedAt: now }).where(eq(jobSources.id, existing.id))
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

/** Discover one company at a time from the admin UI; failures remain visible and isolated. */
export async function discoverCatalog(actorId: string | null, slugs: string[], fetchImpl: typeof fetch = fetch) {
  const results: { slug: string; status: string; note: string }[] = []
  for (const entry of COMPANY_CATALOG.filter((c) => slugs.includes(c.slug))) {
    const source = await db.query.jobSources.findFirst({ where: eq(jobSources.slug, CATALOG_SOURCE_SLUG(entry.slug)) })
    if (!source) continue
    let discovery = await discoverCareerSource(entry.careersUrl, fetchImpl)
    // Existing official adapters may use a custom host; retain their proven configuration, never Adzuna as an official feed.
    if (discovery.status === 'UNSUPPORTED' && entry.feed && entry.feed.provider !== 'adzuna') discovery = { ...discovery, provider: entry.feed.provider, adapter: entry.feed.provider, config: feedConfig(entry), status: 'SUPPORTED' }
    let count: number | null = null
    if (discovery.status === 'SUPPORTED' && discovery.adapter) {
      try {
        const provider = providerById(discovery.adapter)!
        const safe = publicCareersFetch(fetchImpl)
        const deadline = AbortSignal.timeout(45_000)
        const issues: string[] = []
        const sample = await provider.fetchJobs({ id: source.id, name: entry.name, provider: discovery.adapter, baseUrl: entry.careersUrl, config: { ...discovery.config, officialSource: true, maxPerSearch: 1, maxGlobal: 1, countries: [], concurrency: 1 } }, { fetch: (url, init) => safe(url, { ...init, signal: deadline }), log: () => {}, reportIncomplete: (reason) => issues.push(reason) })
        if (issues.some((reason) => !/capped|limit/i.test(reason))) throw new Error(`Extraction verification incomplete: ${issues.join('; ')}`)
        count = sample.length
        discovery.note = `Public extraction verified (${count} sampled listings). Integration requires a successful sync.`
      } catch (error) {
        discovery = { ...discovery, status: error instanceof PublicAccessError ? error.status : 'REQUIRES MANUAL REVIEW', note: error instanceof Error ? error.message : String(error) }
      }
    }
    const supported = discovery.status === 'SUPPORTED'
    const now = new Date()
    await db.update(jobSources).set({ provider: supported ? discovery.adapter! : source.provider, config: { ...(supported ? discovery.config : source.config), officialSource: supported || source.config?.officialSource === true, discovery: { ...discovery, checkedAt: now.toISOString() } }, ingestionAllowed: supported && source.status === 'active', autoPublish: supported && (source.provider === 'manual' || source.autoPublish), scheduleEnabled: supported && source.scheduleEnabled, verificationStatus: supported ? 'verified' : discovery.status.toLowerCase().replaceAll(' ', '_'), verifiedAt: supported ? now : source.verifiedAt, verificationNote: discovery.note, lastVerifiedJobCount: count, updatedAt: now }).where(eq(jobSources.id, source.id))
    results.push({ slug: entry.slug, status: discovery.status, note: discovery.note })
  }
  await recordAudit({ actorId, action: 'catalog.discover', entityType: 'company_catalog', entityId: CATALOG_PROVENANCE, after: results })
  return results
}

interface Probe {
  url: string
  init?: RequestInit
  /** Listing count reported by the feed, or null when the shape is unknown. */
  count: (body: unknown) => number | null
}

const jobsLength = (body: unknown): number | null => (Array.isArray(body) ? body.length : Array.isArray((body as { jobs?: unknown[] })?.jobs) ? (body as { jobs: unknown[] }).jobs.length : null)
const numberOrNull = (v: unknown): number | null => (v !== null && v !== undefined && Number.isFinite(Number(v)) ? Number(v) : null)
const API_HEADERS = { accept: 'application/json', 'user-agent': 'JobAppy-catalog-verify/1.0 (+https://prep.evolw.in)' }

/** Read-only, one-listing probes: documented board APIs for the first three, the careers sites' own JSON endpoints for the rest. */
export const PROBES: Record<CatalogFeedProvider, (token: string) => Probe> = {
  greenhouse: (t) => ({ url: `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(t)}/jobs`, init: { headers: API_HEADERS }, count: jobsLength }),
  lever: (t) => ({ url: `https://api.lever.co/v0/postings/${encodeURIComponent(t)}?mode=json&limit=1`, init: { headers: API_HEADERS }, count: jobsLength }),
  ashby: (t) => ({ url: `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(t)}`, init: { headers: API_HEADERS }, count: jobsLength }),
  amazon: () => ({ url: 'https://www.amazon.jobs/en/search.json?offset=0&result_limit=1&sort=recent&country=IND&category%5B%5D=software-development', init: { headers: BROWSER_HEADERS }, count: (b) => numberOrNull((b as { hits?: unknown })?.hits) }),
  eightfold: (t) => {
    const cfg = parseEightfoldToken(t)
    return { url: eightfoldSearchUrl(cfg, { query: '', location: '' }, 0, 1), init: { headers: BROWSER_HEADERS }, count: (b) => numberOrNull(cfg.api === 'pcsx' ? (b as { data?: { count?: unknown } })?.data?.count : (b as { count?: unknown })?.count) }
  },
  workday: (t) => {
    const req = workdayListRequest(parseWorkdayToken(t), { label: 'probe' }, 0, 1)
    return { url: req.url, init: { ...req.init, headers: { ...BROWSER_HEADERS, ...(req.init.headers as Record<string, string>) } }, count: (b) => numberOrNull((b as { total?: unknown })?.total) }
  },
  smartrecruiters: (t) => ({ url: smartRecruitersListUrl(t, 0, 1), init: { headers: API_HEADERS }, count: (b) => numberOrNull((b as { totalFound?: unknown })?.totalFound) }),
  oraclecloud: (t) => ({ url: oracleListUrl(parseOracleToken(t), { label: 'probe' }, 0, 1), init: { headers: BROWSER_HEADERS }, count: (b) => numberOrNull((b as { items?: { TotalJobsCount?: unknown }[] })?.items?.[0]?.TotalJobsCount) }),
  atlassian: () => ({ url: ATLASSIAN_LISTINGS_URL, init: { headers: BROWSER_HEADERS }, count: jobsLength }),
  keka: (t) => ({ url: kekaListUrl(parseKekaToken(t)), init: { headers: { ...BROWSER_HEADERS, accept: 'application/json' } }, count: jobsLength }),
  adzuna: (t) => {
    const creds = adzunaCredentials()
    const cfg = parseAdzunaToken(t)
    return { url: creds ? adzunaSearchUrl(cfg, 1, creds, 1) : 'https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=missing&app_key=missing', init: { headers: { accept: 'application/json' } }, count: (b) => numberOrNull((b as { count?: unknown })?.count) }
  },
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
    if (source.config?.discovery) continue // Dynamic sources use the Detect / verify action and their current adapter.
    try {
      const probe = PROBES[entry.feed.provider](entry.feed.token)
      const res = await fetchImpl(probe.url, { ...(probe.init ?? {}), signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000) })
      if (res.ok) {
        const body = (await res.json().catch(() => null)) as unknown
        const count = probe.count(body)
        result = { slug: entry.slug, provider: entry.feed.provider, status: count === null ? 'failed' : 'verified', httpStatus: res.status, count, note: count === null ? 'Unrecognised public feed shape; verification failed.' : `Feed answered ${res.status} with ${count} listing(s).` }
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
  const started = Date.now()
  for (const entry of COMPANY_CATALOG) {
    if (Date.now() - started > 90_000) break
    if (slugs && !slugs.includes(entry.slug)) continue
    const source = await db.query.jobSources.findFirst({ where: eq(jobSources.slug, CATALOG_SOURCE_SLUG(entry.slug)) })
    if (!source || !source.ingestionAllowed || source.status !== 'active' || source.verificationStatus !== 'verified') continue
    const report = await runScheduledIngestion(db, { sourceIds: [source.id], triggeredBy: actorId, roleFamilies: await getRoleFamilyConfig(), sweep: false, budgetMs: 90_000 })
    const result = report.sources[0]?.result
    if (result) out.push({ slug: entry.slug, status: result.status, fetched: result.fetched, created: result.created, irrelevant: result.irrelevant, error: result.error })
  }
  return out
}

/** Adds every verified, allowed catalog source to (or removes it from) the scheduled ingestion pass. */
export async function scheduleCatalog(actorId: string | null, enabled: boolean, slugs?: string[]): Promise<number> {
  const targets = COMPANY_CATALOG.filter((c) => !slugs || slugs.includes(c.slug)).map((c) => CATALOG_SOURCE_SLUG(c.slug))
  if (!targets.length) return 0
  const rows = await db.update(jobSources).set({ scheduleEnabled: enabled, updatedAt: new Date() }).where(and(inArray(jobSources.slug, targets), eq(jobSources.verificationStatus, 'verified'), eq(jobSources.ingestionAllowed, true))).returning({ id: jobSources.id })
  await recordAudit({ actorId, action: 'catalog.schedule', entityType: 'company_catalog', entityId: CATALOG_PROVENANCE, after: { enabled, sources: rows.length } })
  return rows.length
}

export function deriveStatus(entry: CatalogCompany, source: typeof jobSources.$inferSelect | null): CatalogStatus {
  const discovery = source?.config?.discovery as Discovery | undefined
  if (discovery?.status === 'PROTECTED') return 'Protected'
  if (discovery?.status === 'REQUIRES MANUAL REVIEW') return 'Requires manual review'
  if (discovery?.status === 'UNSUPPORTED') return 'Unsupported'
  if (discovery?.status === 'NOT CONFIGURED') return 'Not configured'
  if (!entry.feed && !discovery?.adapter) return 'Not configured'
  if (!source) return 'Not configured'
  if (source.verificationStatus === 'failed') return 'Degraded'
  if (source.verificationStatus !== 'verified' || !source.ingestionAllowed || source.status !== 'active') return 'Not configured'
  if (discovery?.checkedAt && (!source.lastRunAt || source.lastRunAt < new Date(discovery.checkedAt))) return 'Configured'
  if (source.lastRunStatus === 'failed') return 'Degraded'
  if (source.lastRunStatus === 'success') return 'Healthy'
  return 'Configured'
}

export async function catalogStatus(): Promise<{ rows: CatalogRow[]; counts: Record<CatalogStatus, number>; total: number; seeded: number }> {
  const slugs = COMPANY_CATALOG.map((c) => CATALOG_SOURCE_SLUG(c.slug))
  const sources = await db.query.jobSources.findMany({ where: inArray(jobSources.slug, slugs) })
  const catalogCompanies = await db.query.companies.findMany({ where: inArray(companies.catalogSlug, COMPANY_CATALOG.map((c) => c.slug)) })
  const companyIds = catalogCompanies.map((c) => c.id)
  const sourceIds = sources.map((s) => s.id)
  const runs = sourceIds.length ? await db.selectDistinctOn([jobIngestionRuns.sourceId]).from(jobIngestionRuns).where(and(inArray(jobIngestionRuns.sourceId, sourceIds), sql`${jobIngestionRuns.status} in ('success', 'failed')`)).orderBy(jobIngestionRuns.sourceId, sql`${jobIngestionRuns.startedAt} desc`) : []
  const stale = companyIds.length ? await db.select({ companyId: jobs.companyId, n: sql<number>`count(*)::int` }).from(jobs).where(and(inArray(jobs.companyId, companyIds), eq(jobs.lifecycle, 'stale'))).groupBy(jobs.companyId) : []
  const live = companyIds.length ? await db.select({ companyId: jobs.companyId, n: sql<number>`count(*)::int` }).from(jobs).where(and(inArray(jobs.companyId, companyIds), eq(jobs.status, 'published'))).groupBy(jobs.companyId) : []
  const rows: CatalogRow[] = COMPANY_CATALOG.map((entry) => {
    const company = catalogCompanies.find((c) => c.catalogSlug === entry.slug) ?? null
    const source = sources.find((s) => s.slug === CATALOG_SOURCE_SLUG(entry.slug)) ?? null
    const discovery = source?.config?.discovery as Discovery | undefined
    const run = runs.find((r) => r.sourceId === source?.id)
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
      providerDetected: discovery?.provider ?? (entry.feed?.provider !== 'adzuna' ? entry.feed?.provider : null) ?? detectCareerSource(entry.careersUrl).provider,
      extractionSupported: discovery ? discovery.status === 'SUPPORTED' : Boolean(entry.feed && entry.feed.provider !== 'adzuna'),
      extractionStatus: discovery?.status ?? (entry.feed && entry.feed.provider !== 'adzuna' ? 'CONFIGURED (EXISTING ADAPTER)' : 'NOT CONFIGURED'),
      jobsFetched: run?.fetched ?? null,
      relevantJobs: run ? run.fetched - run.irrelevant : null,
      duplicatesRemoved: run?.duplicates ?? null,
      staleJobs: company ? stale.find((s) => s.companyId === company.id)?.n ?? 0 : 0,
      integrated: source?.lastRunStatus === 'success' && source?.provider !== 'adzuna' && source.ingestionAllowed && (!discovery || discovery.status === 'SUPPORTED' && !!source.lastRunAt && !!discovery.checkedAt && source.lastRunAt >= new Date(discovery.checkedAt)),
    }
  })
  const counts: Record<CatalogStatus, number> = { Configured: 0, Healthy: 0, Degraded: 0, Unsupported: 0, 'Not configured': 0, Protected: 0, 'Requires manual review': 0 }
  for (const r of rows) counts[r.status] += 1
  return { rows, counts, total: rows.length, seeded: rows.filter((r) => r.seeded).length }
}
