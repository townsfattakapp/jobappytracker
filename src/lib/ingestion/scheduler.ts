import { and, eq, isNull, lt, or, sql } from 'drizzle-orm'
import * as schema from '../db/schema'
import { logError } from '../server/log'
import type { RoleFamilyConfig } from '../jobs/taxonomy'
import { ingestSource, sweepLifecycle, type IngestionDb, type IngestionResult, type SweepResult } from './engine'
import type { JobProvider } from './types'

/**
 * Scheduled ingestion runner. Deploy-ready (a cron only has to call
 * runScheduledIngestion) but exercised locally through the admin panel and
 * tests. Guarantees:
 *   - one run per source at a time (database lock with a stale-lock timeout)
 *   - transient failures are retried with backoff; permanent ones are not
 *   - a failing source never stops the others or touches their jobs
 *   - every attempt's outcome, duration and counts are recorded
 */

const { jobSources, jobIngestionRuns } = schema

export interface SchedulerOptions {
  now?: () => Date
  fetchImpl?: typeof fetch
  roleFamilies?: RoleFamilyConfig
  triggeredBy?: string | null
  /** Provider override for tests. */
  provider?: JobProvider
  /** Maximum attempts per source (1 = no retry). */
  maxAttempts?: number
  /** Base delay between attempts in ms (doubles each attempt). */
  backoffMs?: number
  /** Locks older than this are considered abandoned (a crashed run). */
  lockTimeoutMs?: number
  /** Only run these source ids (default: every enabled, allowed, active provider source). */
  sourceIds?: string[]
  sleep?: (ms: number) => Promise<void>
  /** Run the lifecycle sweep after the sources (default true). */
  sweep?: boolean
  /**
   * Wall-clock budget for one pass in milliseconds (0 = unlimited). Sources are
   * visited least-recently-run first; once the budget is spent the remaining
   * sources are reported as skipped and picked up by the next pass, so a
   * serverless cron with a function time limit still covers a large catalog.
   */
  budgetMs?: number
}

export interface ScheduledSourceOutcome {
  sourceId: string
  sourceName: string
  status: 'success' | 'failed' | 'skipped'
  attempts: number
  durationMs: number
  reason?: string
  result?: IngestionResult
}

export interface SchedulerReport {
  startedAt: string
  finishedAt: string
  sources: ScheduledSourceOutcome[]
  sweep: SweepResult | null
  /** Sources left for the next pass because the time budget was spent. */
  deferred: number
}

const TRANSIENT = /\b(timeout|timed out|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|fetch failed|responded (429|5\d\d)|socket hang up|network)\b/i

/** Transient errors are worth retrying; configuration errors are not. */
export function isTransientError(message: string | null | undefined): boolean {
  return Boolean(message && TRANSIENT.test(message))
}

/** Takes the per-source lock; returns a token or null when another run holds it. */
export async function acquireSourceLock(db: IngestionDb, sourceId: string, now: Date, lockTimeoutMs: number): Promise<string | null> {
  const token = crypto.randomUUID()
  const staleBefore = new Date(now.getTime() - lockTimeoutMs)
  const rows = await db
    .update(jobSources)
    .set({ lockedAt: now, lockToken: token })
    .where(and(eq(jobSources.id, sourceId), or(isNull(jobSources.lockedAt), lt(jobSources.lockedAt, staleBefore))))
    .returning({ id: jobSources.id })
  return rows.length ? token : null
}

export async function releaseSourceLock(db: IngestionDb, sourceId: string, token: string): Promise<void> {
  await db.update(jobSources).set({ lockedAt: null, lockToken: null }).where(and(eq(jobSources.id, sourceId), eq(jobSources.lockToken, token)))
}

export async function runScheduledIngestion(db: IngestionDb, opts: SchedulerOptions = {}): Promise<SchedulerReport> {
  const now = opts.now ?? (() => new Date())
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)))
  const maxAttempts = Math.max(1, opts.maxAttempts ?? 3)
  const backoffMs = opts.backoffMs ?? 1000
  const lockTimeoutMs = opts.lockTimeoutMs ?? 15 * 60_000
  const startedAt = now()
  const where = opts.sourceIds?.length ? sql`${jobSources.id} in ${opts.sourceIds}` : and(eq(jobSources.status, 'active'), eq(jobSources.ingestionAllowed, true), eq(jobSources.scheduleEnabled, true), sql`${jobSources.provider} <> 'manual'`)
  const sources = (await db.select().from(jobSources).where(where).orderBy(jobSources.name)).sort((a, b) => (a.lastRunAt?.getTime() ?? 0) - (b.lastRunAt?.getTime() ?? 0))
  const outcomes: ScheduledSourceOutcome[] = []
  const budgetMs = Math.max(0, opts.budgetMs ?? 0)
  const passStart = Date.now()
  let deferred = 0

  for (const source of sources) {
    if (budgetMs && Date.now() - passStart >= budgetMs) {
      deferred += 1
      continue
    }
    const t0 = Date.now()
    const token = await acquireSourceLock(db, source.id, now(), lockTimeoutMs)
    if (!token) {
      outcomes.push({ sourceId: source.id, sourceName: source.name, status: 'skipped', attempts: 0, durationMs: 0, reason: 'another run holds the lock for this source' })
      await db.insert(jobIngestionRuns).values({ id: crypto.randomUUID(), sourceId: source.id, triggeredBy: opts.triggeredBy ?? 'scheduler', startedAt: now(), finishedAt: now(), status: 'skipped', trigger: 'scheduled', attempts: 0, durationMs: 0, error: 'another run holds the lock for this source' })
      continue
    }
    try {
      let attempt = 0
      let last: IngestionResult | null = null
      while (attempt < maxAttempts) {
        attempt += 1
        const attemptStart = Date.now()
        let result: IngestionResult
        try {
          result = await ingestSource(db, source, { now: now(), fetchImpl: opts.fetchImpl, roleFamilies: opts.roleFamilies, triggeredBy: opts.triggeredBy ?? 'scheduler', provider: opts.provider })
        } catch (error) {
          // ingestSource records its own failures; this only guards against unexpected throws.
          const message = error instanceof Error ? error.message : String(error)
          logError('ingestion.unexpected_failure', error, { sourceId: source.id, sourceName: source.name })
          result = { runId: '', status: 'failed', fetched: 0, created: 0, updated: 0, unchanged: 0, irrelevant: 0, duplicates: 0, expired: 0, error: message, log: [message] }
        }
        const durationMs = Date.now() - attemptStart
        if (result.runId) await db.update(jobIngestionRuns).set({ trigger: 'scheduled', attempts: attempt, durationMs }).where(eq(jobIngestionRuns.id, result.runId))
        last = result
        if (result.status === 'success') {
          await db.update(jobSources).set({ lastSuccessAt: now() }).where(eq(jobSources.id, source.id))
          break
        }
        if (!isTransientError(result.error) || attempt >= maxAttempts) break
        await sleep(backoffMs * 2 ** (attempt - 1))
      }
      outcomes.push({ sourceId: source.id, sourceName: source.name, status: last?.status ?? 'failed', attempts: attempt, durationMs: Date.now() - t0, reason: last?.error ?? undefined, result: last ?? undefined })
    } finally {
      await releaseSourceLock(db, source.id, token)
    }
  }

  const sweep = opts.sweep === false ? null : await sweepLifecycle(db, { now: now() })
  return { startedAt: startedAt.toISOString(), finishedAt: now().toISOString(), sources: outcomes, sweep, deferred }
}
