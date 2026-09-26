import { and, eq, isNotNull, lt, sql } from 'drizzle-orm'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from '../db/schema'
import { canonicalApplyUrl, jobFingerprint } from '../jobs/normalize'
import type { RoleFamilyConfig } from '../jobs/taxonomy'
import { normalizeRawJob, type NormalizedJob } from './normalize'
import { providerById } from './providers'
import type { FetchContext, JobProvider, ProviderSource } from './types'

/**
 * Ingestion engine. Takes a database handle (node-postgres in the app,
 * PGlite in tests), one source and a provider, and stores the relevant
 * listings idempotently:
 *   - (sourceId, externalId) identifies a listing across runs → update in place
 *   - the content fingerprint identifies the same opening across sources → recorded as a duplicate, not inserted
 *   - listings no longer returned by the source are marked stale / expired by the sweep
 * Every run is recorded in job_ingestion_runs with counters and a short log.
 */

export type IngestionDb = PgDatabase<PgQueryResultHKT, typeof schema>

export interface IngestionOptions {
  now?: Date
  fetchImpl?: typeof fetch
  roleFamilies?: RoleFamilyConfig
  triggeredBy?: string | null
  /** Provider override (tests inject one directly). */
  provider?: JobProvider
}

export interface IngestionResult {
  runId: string
  status: 'success' | 'failed'
  fetched: number
  created: number
  updated: number
  unchanged: number
  irrelevant: number
  duplicates: number
  expired: number
  error: string | null
  log: string[]
}

type SourceRow = typeof schema.jobSources.$inferSelect

const { jobs, jobSources, jobIngestionRuns, jobDuplicates } = schema

function contentSignature(n: NormalizedJob): string {
  return JSON.stringify([n.title, n.description, n.roleCategory, n.level, n.employmentType, n.workMode, n.locationCity, n.locationCountry, n.region, n.remoteEligibility, n.eligibleCountries, n.experienceMin, n.experienceMax, n.requiredSkills, n.preferredSkills, n.applyUrl, n.sourceUrl])
}

export async function ingestSource(db: IngestionDb, source: SourceRow, opts: IngestionOptions = {}): Promise<IngestionResult> {
  const now = opts.now ?? new Date()
  const log: string[] = []
  const runId = crypto.randomUUID()
  const counters = { fetched: 0, created: 0, updated: 0, unchanged: 0, irrelevant: 0, duplicates: 0, expired: 0 }
  await db.insert(jobIngestionRuns).values({ id: runId, sourceId: source.id, triggeredBy: opts.triggeredBy ?? null, startedAt: now, status: 'running' })

  const finish = async (status: 'success' | 'failed', error: string | null): Promise<IngestionResult> => {
    await db.update(jobIngestionRuns).set({ ...counters, status, error, log, finishedAt: new Date() }).where(eq(jobIngestionRuns.id, runId))
    await db.update(jobSources).set({ lastRunAt: now, lastRunStatus: status, lastError: error, updatedAt: new Date() }).where(eq(jobSources.id, source.id))
    return { runId, status, ...counters, error, log }
  }

  try {
    if (!source.ingestionAllowed) throw new Error('Source is not marked as allowed for automated ingestion')
    if (source.status !== 'active') throw new Error('Source is paused')
    if (!source.companyId) throw new Error('Source has no company assigned; ingested jobs need a company')
    const provider = opts.provider ?? providerById(source.provider)
    if (!provider) throw new Error(`No provider registered for "${source.provider}"`)
    const timeoutMs = Math.max(1000, Number(process.env.INGESTION_FETCH_TIMEOUT_MS) || 20_000)
    const baseFetch = opts.fetchImpl ?? fetch
    const fetchWithTimeout: typeof fetch = (input, init) => baseFetch(input, { ...(init || {}), signal: (init && init.signal) || AbortSignal.timeout(timeoutMs) })
    const ctx: FetchContext = { fetch: fetchWithTimeout, log: (line) => log.push(line) }
    const providerSource: ProviderSource = { id: source.id, name: source.name, provider: source.provider, baseUrl: source.baseUrl, config: source.config || {} }
    const rawJobs = await provider.fetchJobs(providerSource, ctx)
    counters.fetched = rawJobs.length

    const seenExternalIds = new Set<string>()
    for (const raw of rawJobs) {
      if (seenExternalIds.has(raw.externalId)) continue
      seenExternalIds.add(raw.externalId)
      const n = normalizeRawJob(raw, opts.roleFamilies)
      if (!n.relevance.relevant) {
        counters.irrelevant += 1
        continue
      }
      let applyUrl: string
      try {
        applyUrl = canonicalApplyUrl(n.applyUrl)
      } catch {
        counters.irrelevant += 1
        log.push(`skip ${raw.externalId}: bad apply url`)
        continue
      }
      const fingerprint = jobFingerprint({ companyId: source.companyId, title: n.title, locationCity: n.locationCity, applyUrl })
      const signature = contentSignature({ ...n, applyUrl })
      const values = {
        title: n.title,
        normalizedTitle: n.normalizedTitle,
        roleCategory: n.roleCategory!,
        description: n.description,
        requiredSkills: n.requiredSkills,
        preferredSkills: n.preferredSkills,
        experienceMin: n.experienceMin,
        experienceMax: n.experienceMax,
        level: n.level,
        employmentType: n.employmentType,
        workMode: n.workMode,
        locationCity: n.locationCity,
        locationCountry: n.locationCountry,
        region: n.region,
        remoteEligibility: n.remoteEligibility,
        eligibleCountries: n.eligibleCountries,
        applyUrl,
        sourceUrl: n.sourceUrl,
        rawMetadata: { ...n.rawMetadata, signature },
      }

      const existing = await db.query.jobs.findFirst({ where: and(eq(jobs.sourceId, source.id), eq(jobs.externalId, raw.externalId)) })
      if (existing) {
        const previousSignature = (existing.rawMetadata as { signature?: string } | null)?.signature
        const revived = existing.status === 'expired' || existing.lifecycle === 'expired' || existing.lifecycle === 'stale'
        const changed = previousSignature !== signature
        const patch: Partial<typeof jobs.$inferInsert> = { lastSeenAt: now, updatedAt: now }
        if (revived) {
          patch.lifecycle = 'verified'
          patch.expiresAt = null
          if (existing.status === 'expired') patch.status = source.autoPublish ? 'published' : 'draft'
        } else if (existing.lifecycle === 'discovered' || existing.lifecycle === 'active') patch.lifecycle = 'verified'
        if (changed) {
          Object.assign(patch, values, { fingerprint: existing.fingerprint === fingerprint ? fingerprint : await safeFingerprint(db, fingerprint, existing.id) })
          patch.lastVerifiedAt = now
          counters.updated += 1
        } else {
          patch.lastVerifiedAt = now
          counters.unchanged += 1
        }
        await db.update(jobs).set(patch).where(eq(jobs.id, existing.id))
        continue
      }

      const clash = await db.query.jobs.findFirst({ where: eq(jobs.fingerprint, fingerprint) })
      if (clash) {
        counters.duplicates += 1
        await db.insert(jobDuplicates).values({ id: crypto.randomUUID(), jobId: clash.id, sourceId: source.id, externalId: raw.externalId, title: n.title, applyUrl, fingerprint, seenAt: now })
        // The opening is still live according to this source.
        await db.update(jobs).set({ lastSeenAt: now, updatedAt: now }).where(eq(jobs.id, clash.id))
        continue
      }

      const posted = n.postedAt ? new Date(n.postedAt) : null
      await db.insert(jobs).values({
        id: crypto.randomUUID(),
        companyId: source.companyId,
        sourceId: source.id,
        externalId: raw.externalId,
        careerPathIds: [],
        trackIds: [],
        requirementsSummary: null,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        salaryPeriod: null,
        fingerprint,
        status: source.autoPublish ? 'published' : 'draft',
        lifecycle: 'discovered',
        postedAt: posted && !Number.isNaN(posted.getTime()) ? posted : now,
        expiresAt: null,
        lastVerifiedAt: now,
        firstSeenAt: now,
        lastSeenAt: now,
        createdBy: null,
        createdAt: now,
        updatedAt: now,
        ...values,
      })
      counters.created += 1
    }

    // Listings this source no longer returns are no longer verifiable: mark stale now; the sweep expires them later.
    const missing = await db
      .select({ id: jobs.id, externalId: jobs.externalId })
      .from(jobs)
      .where(and(eq(jobs.sourceId, source.id), isNotNull(jobs.externalId), sql`${jobs.lifecycle} in ('discovered','active','verified')`, sql`${jobs.status} <> 'archived'`))
    const gone = missing.filter((m) => m.externalId && !seenExternalIds.has(m.externalId))
    for (const m of gone) await db.update(jobs).set({ lifecycle: 'stale', updatedAt: now }).where(eq(jobs.id, m.id))
    if (gone.length) log.push(`${gone.length} listing(s) no longer returned; marked stale`)

    log.push(`done: ${counters.created} created, ${counters.updated} updated, ${counters.unchanged} unchanged, ${counters.irrelevant} irrelevant, ${counters.duplicates} duplicates`)
    return finish('success', null)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log.push(`failed: ${message}`)
    return finish('failed', message)
  }
}

/** When an updated listing's new fingerprint collides with another job, keep the old fingerprint so the unique index holds. */
async function safeFingerprint(db: IngestionDb, wanted: string, ownId: string): Promise<string> {
  const clash = await db.query.jobs.findFirst({ where: eq(jobs.fingerprint, wanted) })
  if (!clash || clash.id === ownId) return wanted
  const own = await db.query.jobs.findFirst({ where: eq(jobs.id, ownId) })
  return own?.fingerprint ?? wanted
}

export interface SweepOptions {
  now?: Date
  /** Days without being seen/verified before a published job is marked stale. */
  staleAfterDays?: number
  /** Days without being seen/verified before a job is expired. */
  expireAfterDays?: number
}

export interface SweepResult {
  stale: number
  expired: number
}

/**
 * Lifecycle sweep, safe to run any time:
 *   - past expiresAt → expired
 *   - not seen/verified for expireAfterDays → expired
 *   - not seen/verified for staleAfterDays → stale (still visible, flagged)
 * Manually added jobs use lastVerifiedAt; ingested jobs use lastSeenAt.
 */
export async function sweepLifecycle(db: IngestionDb, opts: SweepOptions = {}): Promise<SweepResult> {
  const now = opts.now ?? new Date()
  const staleAfter = new Date(now.getTime() - (opts.staleAfterDays ?? 7) * 86_400_000)
  const expireAfter = new Date(now.getTime() - (opts.expireAfterDays ?? 21) * 86_400_000)
  const lastSignal = sql`coalesce(${jobs.lastSeenAt}, ${jobs.lastVerifiedAt}, ${jobs.postedAt}, ${jobs.createdAt})`
  const expiredByDate = await db
    .update(jobs)
    .set({ status: 'expired', lifecycle: 'expired', updatedAt: now })
    .where(and(sql`${jobs.status} in ('published','draft')`, isNotNull(jobs.expiresAt), lt(jobs.expiresAt, now)))
    .returning({ id: jobs.id })
  const expiredByAge = await db
    .update(jobs)
    .set({ status: 'expired', lifecycle: 'expired', updatedAt: now })
    .where(and(eq(jobs.status, 'published'), sql`${lastSignal} < ${expireAfter}`))
    .returning({ id: jobs.id })
  const stale = await db
    .update(jobs)
    .set({ lifecycle: 'stale', updatedAt: now })
    .where(and(eq(jobs.status, 'published'), sql`${jobs.lifecycle} in ('discovered','active','verified')`, sql`${lastSignal} < ${staleAfter}`))
    .returning({ id: jobs.id })
  return { stale: stale.length, expired: expiredByDate.length + expiredByAge.length }
}
