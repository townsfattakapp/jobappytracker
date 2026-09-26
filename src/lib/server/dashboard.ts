import { and, desc, eq, inArray, lte, ne, sql } from 'drizzle-orm'
import { db } from '../db'
import { jobPreparations, jobs, outreachContacts } from '../db/schema'
import { jobFreshness } from '../jobs/normalize'
import { rankJobs } from '../jobs/relevance'
import type { JobDto, LearnerJobPreferences } from '../jobs/types'
import { listSessions, toHistoryItem, type HistoryItem } from './interviews'
import { getPreferences, listJobsPublic } from './jobs'
import { currentResume } from './resumes'

/**
 * One request for the Career Command Center: everything the dashboard shows
 * from server-held data, so the page needs no request waterfall. Learner
 * curriculum state (goals, roadmap, workspaces, applications) lives in the
 * synced Storage document and is summarised on the client.
 */
export interface DashboardJob {
  id: string
  title: string
  companyName: string
  level: string
  workMode: string
  locationCity: string | null
  locationCountry: string | null
  postedAt: string | null
  lastVerifiedAt: string | null
  freshness: string
  reasons: string[]
}

export interface DashboardData {
  preferencesSet: boolean
  resume: { id: string; title: string } | null
  recommendedJobs: DashboardJob[]
  recentlyVerifiedJobs: DashboardJob[]
  followUpsDue: { id: string; jobId: string; jobTitle: string; companyName: string; name: string; followUpDate: string; status: string }[]
  preparations: { jobId: string; jobTitle: string; companyName: string; addedTaskCount: number; completedItemIds: number; updatedAt: string }[]
  networking: { contacts: number; active: number }
  interviews: { completed: number; latest: HistoryItem | null; weakAreas: number; jobTitle: string | null }
}

const toDashboardJob = (job: JobDto, reasons: string[], now: Date): DashboardJob => ({ id: job.id, title: job.title, companyName: job.company.name, level: job.level, workMode: job.workMode, locationCity: job.locationCity, locationCountry: job.locationCountry, postedAt: job.postedAt, lastVerifiedAt: job.lastVerifiedAt, freshness: jobFreshness(job, now), reasons })

export async function dashboardFor(userId: string, opts: { personalised: boolean }): Promise<DashboardData> {
  const now = new Date()
  const [prefs, resume, pool, sessions] = await Promise.all([getPreferences(userId), currentResume(userId), listJobsPublic({ page: 1, pageSize: 60 }), listSessions(db, userId)])
  const recommended = ((): DashboardJob[] => {
    if (!prefs || !opts.personalised) return pool.items.slice(0, 5).map((j) => toDashboardJob(j, [], now))
    return rankJobs(pool.items, prefs as LearnerJobPreferences, now)
      .slice(0, 5)
      .map((r) => toDashboardJob(r.job, r.relevance.reasons.filter((x) => x.weight > 0).slice(0, 2).map((x) => x.text), now))
  })()
  const recentlyVerified = [...pool.items]
    .filter((j) => j.lastVerifiedAt)
    .sort((a, b) => (b.lastVerifiedAt ?? '').localeCompare(a.lastVerifiedAt ?? ''))
    .slice(0, 5)
    .map((j) => toDashboardJob(j, [], now))
  const soon = new Date(now.getTime() + 2 * 86_400_000).toISOString().slice(0, 10)
  const due = await db
    .select({ id: outreachContacts.id, jobId: outreachContacts.jobId, name: outreachContacts.name, followUpDate: outreachContacts.followUpDate, status: outreachContacts.status, jobTitle: jobs.title, companyName: sql<string>`(select name from companies c where c.id = ${jobs.companyId})` })
    .from(outreachContacts)
    .innerJoin(jobs, eq(jobs.id, outreachContacts.jobId))
    .where(and(eq(outreachContacts.userId, userId), lte(outreachContacts.followUpDate, soon), ne(outreachContacts.status, 'closed')))
    .orderBy(outreachContacts.followUpDate)
    .limit(10)
  const [contactCounts] = await db.select({ contacts: sql<number>`count(*)::int`, active: sql<number>`count(*) filter (where status not in ('not_contacted','closed'))::int` }).from(outreachContacts).where(eq(outreachContacts.userId, userId))
  const preps = await db
    .select({ jobId: jobPreparations.jobId, addedTaskCount: jobPreparations.addedTaskCount, completedItemIds: jobPreparations.completedItemIds, updatedAt: jobPreparations.updatedAt, jobTitle: jobs.title, companyName: sql<string>`(select name from companies c where c.id = ${jobs.companyId})` })
    .from(jobPreparations)
    .innerJoin(jobs, eq(jobs.id, jobPreparations.jobId))
    .where(eq(jobPreparations.userId, userId))
    .orderBy(desc(jobPreparations.updatedAt))
    .limit(5)
  const completed = sessions.filter((s) => s.status === 'completed').map(toHistoryItem)
  const latest = completed[0] ?? null
  const latestJobTitle = latest ? latest.job.title : null
  return {
    preferencesSet: Boolean(prefs && (prefs.roleCategories.length || prefs.skills.length)),
    resume: resume ? { id: resume.id, title: resume.title } : null,
    recommendedJobs: recommended,
    recentlyVerifiedJobs: recentlyVerified,
    followUpsDue: due.map((d) => ({ id: d.id, jobId: d.jobId, jobTitle: d.jobTitle, companyName: d.companyName, name: d.name, followUpDate: d.followUpDate ?? '', status: d.status })),
    preparations: preps.map((p) => ({ jobId: p.jobId, jobTitle: p.jobTitle, companyName: p.companyName, addedTaskCount: p.addedTaskCount, completedItemIds: (p.completedItemIds ?? []).length, updatedAt: p.updatedAt.toISOString() })),
    networking: { contacts: contactCounts?.contacts ?? 0, active: contactCounts?.active ?? 0 },
    interviews: { completed: completed.length, latest, weakAreas: latest?.weaknessCount ?? 0, jobTitle: latestJobTitle },
  }
}

/** Jobs referenced by the learner's tracker entries that still exist (used to keep application cards honest). */
export async function existingJobIds(ids: string[]): Promise<string[]> {
  if (!ids.length) return []
  const rows = await db.select({ id: jobs.id }).from(jobs).where(inArray(jobs.id, ids.slice(0, 200)))
  return rows.map((r) => r.id)
}
