import { and, asc, desc, eq, gt, ilike, isNull, or, sql, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { companies, jobSources, jobs, learnerJobPreferences, users, userRoles, type PlatformRole } from '../db/schema'
import { jobFingerprint, normalizeTitle, ValidationError, type CompanyInput, type JobSourceInput } from '../jobs/normalize'
import type { CompanyDto, JobDto, JobInput, JobListFilters, JobSourceDto, LearnerJobPreferences, Paged } from '../jobs/types'
import { recordAudit } from './audit'

/**
 * Data access for the Jobs module. Route handlers stay thin and every write
 * that an admin can trigger records an audit entry here.
 */

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)

export function toCompanyDto(row: typeof companies.$inferSelect): CompanyDto {
  return { ...row, status: row.status as CompanyDto['status'], createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }
}

export function toSourceDto(row: typeof jobSources.$inferSelect): JobSourceDto {
  return {
    ...row,
    type: row.type as JobSourceDto['type'],
    status: row.status as JobSourceDto['status'],
    config: row.config || {},
    lastRunStatus: row.lastRunStatus as JobSourceDto['lastRunStatus'],
    lastRunAt: iso(row.lastRunAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

type JobRow = typeof jobs.$inferSelect
type CompanyRow = typeof companies.$inferSelect
type SourceRow = typeof jobSources.$inferSelect

export function toJobDto(row: JobRow, company: CompanyRow, source: SourceRow | null): JobDto {
  const { rawMetadata: _raw, ...rest } = row
  return {
    ...rest,
    level: row.level as JobDto['level'],
    employmentType: row.employmentType as JobDto['employmentType'],
    workMode: row.workMode as JobDto['workMode'],
    region: row.region as JobDto['region'],
    salaryPeriod: row.salaryPeriod as JobDto['salaryPeriod'],
    status: row.status as JobDto['status'],
    careerPathIds: row.careerPathIds || [],
    trackIds: row.trackIds || [],
    requiredSkills: row.requiredSkills || [],
    preferredSkills: row.preferredSkills || [],
    postedAt: iso(row.postedAt),
    expiresAt: iso(row.expiresAt),
    lastVerifiedAt: iso(row.lastVerifiedAt),
    lifecycle: row.lifecycle as JobDto['lifecycle'],
    firstSeenAt: iso(row.firstSeenAt),
    lastSeenAt: iso(row.lastSeenAt),
    remoteEligibility: row.remoteEligibility as JobDto['remoteEligibility'],
    eligibleCountries: row.eligibleCountries || [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    company: { id: company.id, name: company.name, slug: company.slug, website: company.website, careersUrl: company.careersUrl, logoUrl: company.logoUrl, headquarters: company.headquarters },
    source: source ? { id: source.id, name: source.name, type: source.type as JobSourceDto['type'], baseUrl: source.baseUrl } : null,
  }
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export async function listCompanies(opts: { q?: string; status?: string; page?: number; pageSize?: number } = {}): Promise<Paged<CompanyDto & { jobCount: number }>> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25))
  const conditions: SQL[] = []
  if (opts.q) conditions.push(or(ilike(companies.name, `%${opts.q}%`), ilike(companies.slug, `%${opts.q}%`))!)
  if (opts.status) conditions.push(eq(companies.status, opts.status))
  const where = conditions.length ? and(...conditions) : undefined
  const rows = await db
    .select({ company: companies, jobCount: sql<number>`(select count(*)::int from ${jobs} where ${jobs.companyId} = ${companies.id})` })
    .from(companies)
    .where(where)
    .orderBy(asc(companies.name))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(companies).where(where)
  return { items: rows.map((r) => ({ ...toCompanyDto(r.company), jobCount: r.jobCount })), total: count, page, pageSize }
}

export async function allActiveCompanies(): Promise<Pick<CompanyDto, 'id' | 'name' | 'slug'>[]> {
  const rows = await db.select({ id: companies.id, name: companies.name, slug: companies.slug }).from(companies).where(eq(companies.status, 'active')).orderBy(asc(companies.name))
  return rows
}

export async function createCompany(input: CompanyInput, actorId: string): Promise<CompanyDto> {
  const existing = await db.query.companies.findFirst({ where: eq(companies.slug, input.slug) })
  if (existing) throw new ValidationError(`A company with slug "${input.slug}" already exists`, 'slug')
  const [row] = await db.insert(companies).values({ id: crypto.randomUUID(), ...input }).returning()
  await recordAudit({ actorId, action: 'company.create', entityType: 'company', entityId: row.id, after: row })
  return toCompanyDto(row)
}

export async function updateCompany(id: string, input: CompanyInput, actorId: string): Promise<CompanyDto | null> {
  const before = await db.query.companies.findFirst({ where: eq(companies.id, id) })
  if (!before) return null
  const clash = await db.query.companies.findFirst({ where: and(eq(companies.slug, input.slug), sql`${companies.id} <> ${id}`) })
  if (clash) throw new ValidationError(`A company with slug "${input.slug}" already exists`, 'slug')
  const [row] = await db.update(companies).set({ ...input, updatedAt: new Date() }).where(eq(companies.id, id)).returning()
  await recordAudit({ actorId, action: 'company.update', entityType: 'company', entityId: id, before, after: row })
  return toCompanyDto(row)
}

export async function deleteCompany(id: string, actorId: string): Promise<'deleted' | 'in_use' | 'missing'> {
  const before = await db.query.companies.findFirst({ where: eq(companies.id, id) })
  if (!before) return 'missing'
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.companyId, id))
  if (count > 0) return 'in_use'
  await db.delete(companies).where(eq(companies.id, id))
  await recordAudit({ actorId, action: 'company.delete', entityType: 'company', entityId: id, before })
  return 'deleted'
}

// ---------------------------------------------------------------------------
// Job sources
// ---------------------------------------------------------------------------

export async function listSources(opts: { q?: string; page?: number; pageSize?: number } = {}): Promise<Paged<JobSourceDto & { jobCount: number }>> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25))
  const where = opts.q ? or(ilike(jobSources.name, `%${opts.q}%`), ilike(jobSources.slug, `%${opts.q}%`)) : undefined
  const rows = await db
    .select({ source: jobSources, jobCount: sql<number>`(select count(*)::int from ${jobs} where ${jobs.sourceId} = ${jobSources.id})` })
    .from(jobSources)
    .where(where)
    .orderBy(asc(jobSources.name))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(jobSources).where(where)
  return { items: rows.map((r) => ({ ...toSourceDto(r.source), jobCount: r.jobCount })), total: count, page, pageSize }
}

export async function allActiveSources(): Promise<Pick<JobSourceDto, 'id' | 'name' | 'type'>[]> {
  const rows = await db.select({ id: jobSources.id, name: jobSources.name, type: jobSources.type }).from(jobSources).where(eq(jobSources.status, 'active')).orderBy(asc(jobSources.name))
  return rows.map((r) => ({ ...r, type: r.type as JobSourceDto['type'] }))
}

export async function createSource(input: JobSourceInput, actorId: string): Promise<JobSourceDto> {
  const existing = await db.query.jobSources.findFirst({ where: eq(jobSources.slug, input.slug) })
  if (existing) throw new ValidationError(`A source with slug "${input.slug}" already exists`, 'slug')
  const [row] = await db.insert(jobSources).values({ id: crypto.randomUUID(), ...input }).returning()
  await recordAudit({ actorId, action: 'source.create', entityType: 'job_source', entityId: row.id, after: row })
  return toSourceDto(row)
}

export async function updateSource(id: string, input: JobSourceInput, actorId: string): Promise<JobSourceDto | null> {
  const before = await db.query.jobSources.findFirst({ where: eq(jobSources.id, id) })
  if (!before) return null
  const clash = await db.query.jobSources.findFirst({ where: and(eq(jobSources.slug, input.slug), sql`${jobSources.id} <> ${id}`) })
  if (clash) throw new ValidationError(`A source with slug "${input.slug}" already exists`, 'slug')
  const [row] = await db.update(jobSources).set({ ...input, updatedAt: new Date() }).where(eq(jobSources.id, id)).returning()
  await recordAudit({ actorId, action: 'source.update', entityType: 'job_source', entityId: id, before, after: row })
  return toSourceDto(row)
}

export async function deleteSource(id: string, actorId: string): Promise<'deleted' | 'missing'> {
  const before = await db.query.jobSources.findFirst({ where: eq(jobSources.id, id) })
  if (!before) return 'missing'
  // Jobs keep their provenance text but the FK is set to null by the schema.
  await db.delete(jobSources).where(eq(jobSources.id, id))
  await recordAudit({ actorId, action: 'source.delete', entityType: 'job_source', entityId: id, before })
  return 'deleted'
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface AdminJobFilters extends JobListFilters {
  status?: string
  lifecycle?: string
  sourceId?: string
}

function jobConditions(f: AdminJobFilters, learnerFacing: boolean): SQL | undefined {
  const conditions: SQL[] = []
  if (learnerFacing) {
    conditions.push(eq(jobs.status, 'published'))
    conditions.push(or(isNull(jobs.expiresAt), gt(jobs.expiresAt, new Date()))!)
    conditions.push(eq(companies.status, 'active'))
  } else if (f.status) conditions.push(eq(jobs.status, f.status))
  if (!learnerFacing && f.lifecycle) conditions.push(eq(jobs.lifecycle, f.lifecycle))
  if (!learnerFacing && f.sourceId) conditions.push(eq(jobs.sourceId, f.sourceId))
  if (f.q) {
    const like = `%${f.q}%`
    conditions.push(or(ilike(jobs.title, like), ilike(companies.name, like), ilike(jobs.locationCity, like), sql`${jobs.requiredSkills}::text ilike ${like}`)!)
  }
  if (f.roleCategory) conditions.push(eq(jobs.roleCategory, f.roleCategory))
  if (f.region) conditions.push(eq(jobs.region, f.region))
  if (f.workMode) conditions.push(eq(jobs.workMode, f.workMode))
  if (f.level) conditions.push(eq(jobs.level, f.level))
  if (f.employmentType) conditions.push(eq(jobs.employmentType, f.employmentType))
  if (f.companyId) conditions.push(eq(jobs.companyId, f.companyId))
  return conditions.length ? and(...conditions) : undefined
}

async function queryJobs(where: SQL | undefined, page: number, pageSize: number): Promise<Paged<JobDto>> {
  const rows = await db
    .select({ job: jobs, company: companies, source: jobSources })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .leftJoin(jobSources, eq(jobSources.id, jobs.sourceId))
    .where(where)
    .orderBy(desc(sql`coalesce(${jobs.postedAt}, ${jobs.createdAt})`), desc(jobs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(jobs).innerJoin(companies, eq(companies.id, jobs.companyId)).where(where)
  return { items: rows.map((r) => toJobDto(r.job, r.company, r.source)), total: count, page, pageSize }
}

/** Admin listing: every status, paginated. */
export function listJobsAdmin(f: AdminJobFilters): Promise<Paged<JobDto>> {
  const page = Math.max(1, f.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, f.pageSize ?? 25))
  return queryJobs(jobConditions(f, false), page, pageSize)
}

/** Learner listing: only published, unexpired jobs from visible companies. */
export function listJobsPublic(f: JobListFilters): Promise<Paged<JobDto>> {
  const page = Math.max(1, f.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, f.pageSize ?? 20))
  return queryJobs(jobConditions(f, true), page, pageSize)
}

/**
 * Learner ranking needs the whole visible set (the score depends on the
 * learner, not the query). Bounded so a large catalogue cannot blow up
 * memory; Phase 2 moves ranking into SQL or a cache.
 */
export async function allPublicJobs(f: JobListFilters, limit = 500): Promise<JobDto[]> {
  const result = await queryJobs(jobConditions(f, true), 1, limit)
  return result.items
}

export async function getJob(id: string, opts: { publicOnly: boolean }): Promise<JobDto | null> {
  const where = opts.publicOnly ? and(eq(jobs.id, id), jobConditions({}, true)) : eq(jobs.id, id)
  const [row] = await db
    .select({ job: jobs, company: companies, source: jobSources })
    .from(jobs)
    .innerJoin(companies, eq(companies.id, jobs.companyId))
    .leftJoin(jobSources, eq(jobSources.id, jobs.sourceId))
    .where(where)
    .limit(1)
  return row ? toJobDto(row.job, row.company, row.source) : null
}

async function assertReferences(input: JobInput) {
  const company = await db.query.companies.findFirst({ where: eq(companies.id, input.companyId) })
  if (!company) throw new ValidationError('Choose a company', 'companyId')
  if (input.sourceId) {
    const source = await db.query.jobSources.findFirst({ where: eq(jobSources.id, input.sourceId) })
    if (!source) throw new ValidationError('Choose a valid source', 'sourceId')
  }
}

function jobValues(input: JobInput) {
  return {
    ...input,
    normalizedTitle: normalizeTitle(input.title),
    fingerprint: jobFingerprint({ companyId: input.companyId, title: input.title, locationCity: input.locationCity, applyUrl: input.applyUrl }),
    postedAt: input.postedAt ? new Date(input.postedAt) : null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  }
}

export async function createJob(input: JobInput, actorId: string): Promise<JobDto> {
  await assertReferences(input)
  const values = jobValues(input)
  const duplicate = await db.query.jobs.findFirst({ where: eq(jobs.fingerprint, values.fingerprint) })
  if (duplicate) throw new ValidationError(`This looks like a duplicate of "${duplicate.title}" (same company, title, city and apply link)`, 'applyUrl')
  const now = new Date()
  const [row] = await db
    .insert(jobs)
    .values({ id: crypto.randomUUID(), ...values, createdBy: actorId, lastVerifiedAt: now, postedAt: values.postedAt ?? now })
    .returning()
  await recordAudit({ actorId, action: 'job.create', entityType: 'job', entityId: row.id, after: row })
  return (await getJob(row.id, { publicOnly: false }))!
}

export async function updateJob(id: string, input: JobInput, actorId: string): Promise<JobDto | null> {
  const before = await db.query.jobs.findFirst({ where: eq(jobs.id, id) })
  if (!before) return null
  await assertReferences(input)
  const values = jobValues(input)
  const duplicate = await db.query.jobs.findFirst({ where: and(eq(jobs.fingerprint, values.fingerprint), sql`${jobs.id} <> ${id}`) })
  if (duplicate) throw new ValidationError(`Another job "${duplicate.title}" already has the same company, title, city and apply link`, 'applyUrl')
  const [row] = await db
    .update(jobs)
    .set({ ...values, updatedAt: new Date(), lastVerifiedAt: new Date() })
    .where(eq(jobs.id, id))
    .returning()
  await recordAudit({ actorId, action: 'job.update', entityType: 'job', entityId: id, before, after: row })
  return getJob(row.id, { publicOnly: false })
}

export type JobTransition = 'publish' | 'unpublish' | 'expire' | 'archive' | 'verify'

export async function transitionJob(id: string, transition: JobTransition, actorId: string): Promise<JobDto | null> {
  const before = await db.query.jobs.findFirst({ where: eq(jobs.id, id) })
  if (!before) return null
  const now = new Date()
  const patch: Partial<typeof jobs.$inferInsert> = { updatedAt: now }
  switch (transition) {
    case 'publish':
      if (before.expiresAt && before.expiresAt <= now) throw new ValidationError('Extend the expiry date before publishing', 'expiresAt')
      patch.status = 'published'
      patch.lastVerifiedAt = now
      if (before.lifecycle === 'expired' || before.lifecycle === 'stale' || before.lifecycle === 'discovered') patch.lifecycle = 'verified'
      if (!before.postedAt) patch.postedAt = now
      break
    case 'unpublish':
      patch.status = 'draft'
      break
    case 'expire':
      patch.status = 'expired'
      patch.lifecycle = 'expired'
      if (!before.expiresAt || before.expiresAt > now) patch.expiresAt = now
      break
    case 'archive':
      patch.status = 'archived'
      break
    case 'verify':
      patch.lastVerifiedAt = now
      patch.lifecycle = 'verified'
      break
  }
  const [row] = await db.update(jobs).set(patch).where(eq(jobs.id, id)).returning()
  await recordAudit({ actorId, action: `job.${transition}`, entityType: 'job', entityId: id, before, after: row })
  return getJob(row.id, { publicOnly: false })
}

/** Marks published jobs whose expiry has passed. Safe to run any time. */
export async function sweepExpiredJobs(actorId: string | null): Promise<number> {
  const now = new Date()
  const rows = await db
    .update(jobs)
    .set({ status: 'expired', updatedAt: now })
    .where(and(eq(jobs.status, 'published'), sql`${jobs.expiresAt} is not null and ${jobs.expiresAt} <= ${now}`))
    .returning({ id: jobs.id })
  if (rows.length) await recordAudit({ actorId, action: 'job.sweep_expired', entityType: 'job', after: { count: rows.length, ids: rows.map((r) => r.id) } })
  return rows.length
}

// ---------------------------------------------------------------------------
// Learner preferences
// ---------------------------------------------------------------------------

export async function getPreferences(userId: string): Promise<LearnerJobPreferences | null> {
  const row = await db.query.learnerJobPreferences.findFirst({ where: eq(learnerJobPreferences.userId, userId) })
  if (!row) return null
  return {
    roleCategories: row.roleCategories || [],
    skills: row.skills || [],
    experienceYears: row.experienceYears,
    locations: row.locations || [],
    regionPreference: row.regionPreference as LearnerJobPreferences['regionPreference'],
    workModes: (row.workModes || []) as LearnerJobPreferences['workModes'],
    levels: (row.levels || []) as LearnerJobPreferences['levels'],
    employmentTypes: (row.employmentTypes || []) as LearnerJobPreferences['employmentTypes'],
    salaryMin: row.salaryMin,
    salaryCurrency: row.salaryCurrency,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function savePreferences(userId: string, prefs: LearnerJobPreferences): Promise<LearnerJobPreferences> {
  const { updatedAt: _ignored, ...values } = prefs
  await db
    .insert(learnerJobPreferences)
    .values({ userId, ...values, updatedAt: new Date() })
    .onConflictDoUpdate({ target: learnerJobPreferences.userId, set: { ...values, updatedAt: new Date() } })
  return (await getPreferences(userId))!
}

// ---------------------------------------------------------------------------
// Users (admin)
// ---------------------------------------------------------------------------

export interface AdminUserRow {
  id: string
  email: string
  name: string | null
  emailVerified: string | null
  createdAt: string
  roles: PlatformRole[]
  hasPass: boolean
}

export async function listUsers(opts: { q?: string; role?: string; page?: number; pageSize?: number } = {}): Promise<Paged<AdminUserRow>> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25))
  const conditions: SQL[] = []
  if (opts.q) conditions.push(or(ilike(users.email, `%${opts.q}%`), ilike(users.name, `%${opts.q}%`))!)
  if (opts.role) conditions.push(sql`exists (select 1 from ${userRoles} where ${userRoles.userId} = ${users.id} and ${userRoles.role} = ${opts.role})`)
  const where = conditions.length ? and(...conditions) : undefined
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      roles: sql<string[]>`coalesce((select json_agg(${userRoles.role} order by ${userRoles.role}) from ${userRoles} where ${userRoles.userId} = ${users.id}), '[]'::json)`,
      hasPass: sql<boolean>`exists (select 1 from subscriptions s where s."userId" = ${users.id} and s.status = 'paid' and s."currentEnd" > now())`,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(where)
  return {
    items: rows.map((r) => ({ ...r, emailVerified: iso(r.emailVerified), createdAt: r.createdAt.toISOString(), roles: (r.roles || []) as PlatformRole[] })),
    total: count,
    page,
    pageSize,
  }
}

export async function setUserRoles(targetUserId: string, roles: PlatformRole[], actorId: string): Promise<PlatformRole[] | null> {
  const target = await db.query.users.findFirst({ where: eq(users.id, targetUserId), columns: { id: true, email: true } })
  if (!target) return null
  const before = (await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, targetUserId))).map((r) => r.role)
  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, targetUserId))
    if (roles.length) await tx.insert(userRoles).values(roles.map((role) => ({ userId: targetUserId, role, grantedBy: actorId })))
  })
  await recordAudit({ actorId, action: 'user.roles', entityType: 'user', entityId: targetUserId, before: { roles: before }, after: { roles, email: target.email } })
  return roles
}

// ---------------------------------------------------------------------------
// Metrics (admin dashboard)
// ---------------------------------------------------------------------------

export interface AdminMetrics {
  users: { total: number; last7Days: number; withPass: number }
  jobs: { draft: number; published: number; expired: number; archived: number; expiringSoon: number }
  companies: number
  sources: number
  preferencesSet: number
}

export async function adminMetrics(): Promise<AdminMetrics> {
  const [u] = await db
    .select({
      total: sql<number>`count(*)::int`,
      last7Days: sql<number>`count(*) filter (where ${users.createdAt} > now() - interval '7 days')::int`,
      withPass: sql<number>`count(*) filter (where exists (select 1 from subscriptions s where s."userId" = ${users.id} and s.status = 'paid' and s."currentEnd" > now()))::int`,
    })
    .from(users)
  const [j] = await db
    .select({
      draft: sql<number>`count(*) filter (where ${jobs.status} = 'draft')::int`,
      published: sql<number>`count(*) filter (where ${jobs.status} = 'published')::int`,
      expired: sql<number>`count(*) filter (where ${jobs.status} = 'expired')::int`,
      archived: sql<number>`count(*) filter (where ${jobs.status} = 'archived')::int`,
      expiringSoon: sql<number>`count(*) filter (where ${jobs.status} = 'published' and ${jobs.expiresAt} is not null and ${jobs.expiresAt} < now() + interval '7 days')::int`,
    })
    .from(jobs)
  const [c] = await db.select({ count: sql<number>`count(*)::int` }).from(companies)
  const [s] = await db.select({ count: sql<number>`count(*)::int` }).from(jobSources)
  const [p] = await db.select({ count: sql<number>`count(*)::int` }).from(learnerJobPreferences)
  return { users: u, jobs: j, companies: c.count, sources: s.count, preferencesSet: p.count }
}
