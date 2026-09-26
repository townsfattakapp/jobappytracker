import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { companies, jobDuplicates, jobIngestionRuns, jobSources, jobs } from '../db/schema'
import { ingestSource, sweepLifecycle, type IngestionResult, type SweepResult } from '../ingestion/engine'
import { runScheduledIngestion, type SchedulerReport } from '../ingestion/scheduler'
import { recordAudit } from './audit'
import { getRoleFamilyConfig } from './settings'

/** Admin-facing ingestion operations on the app database, all audited. */

export async function runSourceIngestion(sourceId: string, actorId: string): Promise<IngestionResult | null> {
  const source = await db.query.jobSources.findFirst({ where: eq(jobSources.id, sourceId) })
  if (!source) return null
  const roleFamilies = await getRoleFamilyConfig()
  const result = await ingestSource(db, source, { roleFamilies, triggeredBy: actorId })
  await recordAudit({ actorId, action: 'ingestion.run', entityType: 'job_source', entityId: sourceId, after: { runId: result.runId, status: result.status, fetched: result.fetched, created: result.created, updated: result.updated, irrelevant: result.irrelevant, duplicates: result.duplicates, error: result.error } })
  return result
}

export async function runLifecycleSweep(actorId: string | null): Promise<SweepResult> {
  const result = await sweepLifecycle(db)
  if (result.stale || result.expired) await recordAudit({ actorId, action: 'ingestion.sweep', entityType: 'job', after: result })
  return result
}

export interface IngestionRunRow {
  id: string
  sourceId: string
  sourceName: string
  triggeredBy: string | null
  startedAt: string
  finishedAt: string | null
  status: string
  fetched: number
  created: number
  updated: number
  unchanged: number
  irrelevant: number
  duplicates: number
  error: string | null
  log: string[]
  trigger: string
  attempts: number
  durationMs: number | null
}

export async function listIngestionRuns(opts: { sourceId?: string; limit?: number } = {}): Promise<IngestionRunRow[]> {
  const rows = await db
    .select({ run: jobIngestionRuns, sourceName: jobSources.name })
    .from(jobIngestionRuns)
    .innerJoin(jobSources, eq(jobSources.id, jobIngestionRuns.sourceId))
    .where(opts.sourceId ? eq(jobIngestionRuns.sourceId, opts.sourceId) : undefined)
    .orderBy(desc(jobIngestionRuns.startedAt))
    .limit(Math.min(200, opts.limit ?? 50))
  return rows.map(({ run, sourceName }) => ({
    id: run.id,
    sourceId: run.sourceId,
    sourceName,
    triggeredBy: run.triggeredBy,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt ? run.finishedAt.toISOString() : null,
    status: run.status,
    fetched: run.fetched,
    created: run.created,
    updated: run.updated,
    unchanged: run.unchanged,
    irrelevant: run.irrelevant,
    duplicates: run.duplicates,
    error: run.error,
    log: run.log || [],
    trigger: run.trigger,
    attempts: run.attempts,
    durationMs: run.durationMs,
  }))
}

export interface ProviderHealthRow {
  id: string
  name: string
  provider: string
  status: string
  ingestionAllowed: boolean
  autoPublish: boolean
  companyName: string | null
  lastRunAt: string | null
  lastRunStatus: string | null
  lastError: string | null
  lastSuccessAt: string | null
  scheduleEnabled: boolean
  running: boolean
  jobCount: number
  liveJobs: number
}

export async function providerHealth(): Promise<ProviderHealthRow[]> {
  const rows = await db
    .select({
      source: jobSources,
      companyName: companies.name,
      jobCount: sql<number>`(select count(*)::int from ${jobs} where ${jobs.sourceId} = ${jobSources.id})`,
      liveJobs: sql<number>`(select count(*)::int from ${jobs} where ${jobs.sourceId} = ${jobSources.id} and ${jobs.status} = 'published')`,
    })
    .from(jobSources)
    .leftJoin(companies, eq(companies.id, jobSources.companyId))
    .where(sql`${jobSources.provider} <> 'manual'`)
    .orderBy(jobSources.name)
  return rows.map((r) => ({
    id: r.source.id,
    name: r.source.name,
    provider: r.source.provider,
    status: r.source.status,
    ingestionAllowed: r.source.ingestionAllowed,
    autoPublish: r.source.autoPublish,
    companyName: r.companyName,
    lastRunAt: r.source.lastRunAt ? r.source.lastRunAt.toISOString() : null,
    lastRunStatus: r.source.lastRunStatus,
    lastError: r.source.lastError,
    lastSuccessAt: r.source.lastSuccessAt ? r.source.lastSuccessAt.toISOString() : null,
    scheduleEnabled: r.source.scheduleEnabled,
    running: Boolean(r.source.lockedAt && Date.now() - r.source.lockedAt.getTime() < 15 * 60_000),
    jobCount: r.jobCount,
    liveJobs: r.liveJobs,
  }))
}

export interface DuplicateRow {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  sourceName: string | null
  externalId: string | null
  title: string
  applyUrl: string
  seenAt: string
}

export async function listDuplicates(opts: { page?: number; pageSize?: number } = {}): Promise<{ items: DuplicateRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25))
  const rows = await db
    .select({ dup: jobDuplicates, jobTitle: jobs.title, companyName: companies.name, sourceName: jobSources.name })
    .from(jobDuplicates)
    .innerJoin(jobs, eq(jobs.id, jobDuplicates.jobId))
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .leftJoin(jobSources, eq(jobSources.id, jobDuplicates.sourceId))
    .orderBy(desc(jobDuplicates.seenAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(jobDuplicates)
  return {
    items: rows.map((r) => ({ id: r.dup.id, jobId: r.dup.jobId, jobTitle: r.jobTitle, companyName: r.companyName, sourceName: r.sourceName, externalId: r.dup.externalId, title: r.dup.title, applyUrl: r.dup.applyUrl, seenAt: r.dup.seenAt.toISOString() })),
    total: count,
    page,
    pageSize,
  }
}

export async function lifecycleCounts(): Promise<Record<string, number>> {
  const rows = await db.select({ lifecycle: jobs.lifecycle, count: sql<number>`count(*)::int` }).from(jobs).groupBy(jobs.lifecycle)
  return Object.fromEntries(rows.map((r) => [r.lifecycle, r.count]))
}

/** Scheduled pass over every enabled provider source with retries, overlap protection and the sweep; audited. */
export async function runScheduler(actorId: string | null, opts: { sourceIds?: string[] }): Promise<SchedulerReport> {
  const roleFamilies = await getRoleFamilyConfig()
  const report = await runScheduledIngestion(db, { roleFamilies, triggeredBy: actorId ?? 'cron', sourceIds: opts.sourceIds })
  await recordAudit({ actorId, action: 'ingestion.schedule', entityType: 'job_source', after: { sources: report.sources.map((s) => ({ id: s.sourceId, status: s.status, attempts: s.attempts, durationMs: s.durationMs, reason: s.reason ?? null })), sweep: report.sweep } })
  return report
}
