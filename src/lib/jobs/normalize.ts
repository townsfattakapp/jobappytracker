import {
  EMPLOYMENT_TYPES,
  JOB_LEVELS,
  JOB_STATUSES,
  REGIONS,
  REGION_PREFERENCES,
  ROLE_CATEGORY_IDS,
  SALARY_CURRENCIES,
  SOURCE_TYPES,
  WORK_MODES,
  type EmploymentType,
  type JobLevel,
  type JobRegion,
  type RegionPreference,
  type SourceType,
  type WorkMode,
} from './taxonomy'
import type { JobInput, LearnerJobPreferences } from './types'

/**
 * Pure normalisation, deduplication and validation helpers. Shared by the
 * server (route handlers) and the client (form validation), so nothing here
 * touches the database or Node-only APIs.
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

const TRACKING_PARAMS = /^(utm_|gh_src$|gh_jid$|ref$|source$|src$|fbclid$|gclid$|mc_cid$|mc_eid$|trk$|trackingid$|refid$)/i

/** Keeps scheme, host, path and meaningful query; drops tracking parameters and fragments. */
export function canonicalApplyUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new ValidationError('Application URL is required', 'applyUrl')
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    throw new ValidationError('Application URL is not a valid URL', 'applyUrl')
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new ValidationError('Application URL must use http or https', 'applyUrl')
  const keep = new URLSearchParams()
  for (const [k, v] of url.searchParams) if (!TRACKING_PARAMS.test(k)) keep.append(k, v)
  url.search = keep.toString() ? `?${keep.toString()}` : ''
  url.hash = ''
  url.hostname = url.hostname.toLowerCase()
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) url.pathname = url.pathname.slice(0, -1)
  return url.toString()
}

/** Optional http(s) URL; empty becomes null. */
export function optionalUrl(value: unknown, field: string): string | null {
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
    return url.toString()
  } catch {
    throw new ValidationError(`${field} must be a valid http(s) URL`, field)
  }
}

const SENIORITY_NOISE = /\b(remote|hybrid|on-?site|urgent(ly)? hiring|immediate joiner|walk-?in|work from home|wfh)\b/g

/** Lower-case title without punctuation, location suffixes and hiring noise: "SDE II - Bengaluru (Remote)" → "sde ii". */
export function normalizeTitle(title: string): string {
  let t = title.toLowerCase()
  // Drop anything after a separator that introduces a location or requisition id.
  t = t.replace(/\s+[-–—|:,]\s+.*$/, '')
  t = t.replace(/\(([^)]*)\)/g, ' $1 ')
  t = t.replace(SENIORITY_NOISE, ' ')
  t = t.replace(/[^a-z0-9+#. ]+/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** FNV-1a 64-bit as hex; deterministic across client and server, no crypto dependency. */
export function fnv1a64(input: string): string {
  let hash = 0xcbf29ce484222325n
  const prime = 0x100000001b3n
  const mask = 0xffffffffffffffffn
  for (let i = 0; i < input.length; i += 1) {
    hash ^= BigInt(input.charCodeAt(i))
    hash = (hash * prime) & mask
  }
  return hash.toString(16).padStart(16, '0')
}

/**
 * Stable identity of an opening. Two listings with the same company, the same
 * normalised title, the same city and the same apply URL (host + path) are the
 * same job, whatever the source called it.
 */
export function jobFingerprint(parts: { companyId: string; title: string; locationCity?: string | null; applyUrl: string }): string {
  let urlKey = parts.applyUrl.toLowerCase()
  try {
    const u = new URL(parts.applyUrl)
    urlKey = `${u.hostname.toLowerCase()}${u.pathname.replace(/\/$/, '')}`
  } catch {
    // keep the raw string
  }
  const key = [parts.companyId, normalizeTitle(parts.title), (parts.locationCity || '').trim().toLowerCase(), urlKey].join('|')
  return fnv1a64(key)
}

export type Freshness = 'fresh' | 'aging' | 'stale' | 'expired'

const DAY = 86_400_000

/** How current a listing is, from its verification/posting dates. Anything past expiresAt is expired regardless of status. */
export function jobFreshness(job: { postedAt: string | Date | null; lastVerifiedAt: string | Date | null; expiresAt: string | Date | null; status: string }, now: Date = new Date()): Freshness {
  const toMs = (v: string | Date | null) => (v ? new Date(v).getTime() : NaN)
  const expires = toMs(job.expiresAt)
  if (job.status === 'expired' || (Number.isFinite(expires) && expires <= now.getTime())) return 'expired'
  const reference = Math.max(toMs(job.lastVerifiedAt) || 0, toMs(job.postedAt) || 0)
  if (!reference) return 'stale'
  const ageDays = (now.getTime() - reference) / DAY
  if (ageDays < 14) return 'fresh'
  if (ageDays <= 30) return 'aging'
  return 'stale'
}

// ---------------------------------------------------------------------------
// Input parsing (admin forms and learner preference form)
// ---------------------------------------------------------------------------

function str(value: unknown, field: string, opts: { required?: boolean; max?: number } = {}): string | null {
  const s = typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
  if (!s) {
    if (opts.required) throw new ValidationError(`${field} is required`, field)
    return null
  }
  if (opts.max && s.length > opts.max) throw new ValidationError(`${field} must be at most ${opts.max} characters`, field)
  return s
}

function int(value: unknown, field: string, opts: { min?: number; max?: number } = {}): number | null {
  if (value === '' || value == null) return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isFinite(n) || Math.floor(n) !== n) throw new ValidationError(`${field} must be a whole number`, field)
  if (opts.min != null && n < opts.min) throw new ValidationError(`${field} must be at least ${opts.min}`, field)
  if (opts.max != null && n > opts.max) throw new ValidationError(`${field} must be at most ${opts.max}`, field)
  return n
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string, fallback?: T): T {
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s && fallback !== undefined) return fallback
  if (!(allowed as readonly string[]).includes(s)) throw new ValidationError(`${field} must be one of ${allowed.join(', ')}`, field)
  return s as T
}

/** Accepts an array or a comma/newline separated string; dedupes case-insensitively, keeps first spelling. */
export function stringList(value: unknown, field: string, opts: { max?: number; itemMax?: number } = {}): string[] {
  let items: string[] = []
  if (Array.isArray(value)) items = value.map((v) => String(v ?? ''))
  else if (typeof value === 'string') items = value.split(/[,\n]/)
  else if (value != null) throw new ValidationError(`${field} must be a list`, field)
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of items) {
    const s = raw.trim().replace(/\s+/g, ' ')
    if (!s) continue
    if (opts.itemMax && s.length > opts.itemMax) throw new ValidationError(`${field} entries must be at most ${opts.itemMax} characters`, field)
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  if (opts.max && out.length > opts.max) throw new ValidationError(`${field} may have at most ${opts.max} entries`, field)
  return out
}

function isoDate(value: unknown, field: string): string | null {
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} must be a valid date`, field)
  return d.toISOString()
}

export function parseJobInput(body: unknown): JobInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
  const b = body as Record<string, unknown>
  const title = str(b.title, 'Title', { required: true, max: 160 })!
  const roleCategory = oneOf(b.roleCategory, ROLE_CATEGORY_IDS, 'Role category')
  const experienceMin = int(b.experienceMin, 'Minimum experience', { min: 0, max: 40 })
  const experienceMax = int(b.experienceMax, 'Maximum experience', { min: 0, max: 40 })
  if (experienceMin != null && experienceMax != null && experienceMax < experienceMin) throw new ValidationError('Maximum experience must not be below minimum experience', 'experienceMax')
  const salaryMin = int(b.salaryMin, 'Minimum salary', { min: 0 })
  const salaryMax = int(b.salaryMax, 'Maximum salary', { min: 0 })
  if (salaryMin != null && salaryMax != null && salaryMax < salaryMin) throw new ValidationError('Maximum salary must not be below minimum salary', 'salaryMax')
  const salaryCurrency = salaryMin != null || salaryMax != null ? oneOf(b.salaryCurrency, SALARY_CURRENCIES, 'Salary currency') : str(b.salaryCurrency, 'Salary currency', { max: 3 })
  const salaryPeriod = salaryMin != null || salaryMax != null ? oneOf(b.salaryPeriod, ['year', 'month'] as const, 'Salary period', 'year') : null
  const postedAt = isoDate(b.postedAt, 'Posted date')
  const expiresAt = isoDate(b.expiresAt, 'Expiry date')
  if (postedAt && expiresAt && new Date(expiresAt) < new Date(postedAt)) throw new ValidationError('Expiry date must be after the posted date', 'expiresAt')
  return {
    companyId: str(b.companyId, 'Company', { required: true })!,
    sourceId: str(b.sourceId, 'Source'),
    title,
    roleCategory,
    careerPathIds: stringList(b.careerPathIds, 'Career paths', { max: 10 }),
    trackIds: stringList(b.trackIds, 'Tracks', { max: 30 }),
    description: str(b.description, 'Description', { required: true, max: 20000 })!,
    requirementsSummary: str(b.requirementsSummary, 'Requirements summary', { max: 4000 }),
    requiredSkills: stringList(b.requiredSkills, 'Required skills', { max: 40, itemMax: 60 }),
    preferredSkills: stringList(b.preferredSkills, 'Preferred skills', { max: 40, itemMax: 60 }),
    experienceMin,
    experienceMax,
    level: oneOf(b.level, JOB_LEVELS.map((l) => l.id) as JobLevel[], 'Level'),
    employmentType: oneOf(b.employmentType, EMPLOYMENT_TYPES.map((e) => e.id) as EmploymentType[], 'Employment type'),
    workMode: oneOf(b.workMode, WORK_MODES.map((w) => w.id) as WorkMode[], 'Work mode'),
    locationCity: str(b.locationCity, 'City', { max: 120 }),
    locationCountry: str(b.locationCountry, 'Country', { max: 120 }),
    region: oneOf(b.region, REGIONS.map((r) => r.id) as JobRegion[], 'Region'),
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    applyUrl: canonicalApplyUrl(String(b.applyUrl ?? '')),
    sourceUrl: optionalUrl(b.sourceUrl, 'Source URL'),
    externalId: str(b.externalId, 'External id', { max: 200 }),
    status: oneOf(b.status, JOB_STATUSES, 'Status', 'draft'),
    postedAt,
    expiresAt,
    remoteEligibility: oneOf(b.remoteEligibility, ['unknown', 'country', 'region', 'worldwide', 'not_remote'] as const, 'Remote eligibility', 'unknown'),
    eligibleCountries: stringList(b.eligibleCountries, 'Eligible countries', { max: 30, itemMax: 60 }),
  }
}

export interface CompanyInput {
  name: string
  slug: string
  website: string | null
  careersUrl: string | null
  logoUrl: string | null
  headquarters: string | null
  industry: string | null
  size: string | null
  description: string | null
  status: 'active' | 'hidden'
}

export function parseCompanyInput(body: unknown): CompanyInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
  const b = body as Record<string, unknown>
  const name = str(b.name, 'Name', { required: true, max: 160 })!
  const slugSource = str(b.slug, 'Slug', { max: 160 }) || name
  const slug = slugify(slugSource)
  if (!slug) throw new ValidationError('Slug must contain letters or numbers', 'slug')
  return {
    name,
    slug,
    website: optionalUrl(b.website, 'Website'),
    careersUrl: optionalUrl(b.careersUrl, 'Careers URL'),
    logoUrl: optionalUrl(b.logoUrl, 'Logo URL'),
    headquarters: str(b.headquarters, 'Headquarters', { max: 160 }),
    industry: str(b.industry, 'Industry', { max: 120 }),
    size: str(b.size, 'Size', { max: 60 }),
    description: str(b.description, 'Description', { max: 4000 }),
    status: oneOf(b.status, ['active', 'hidden'] as const, 'Status', 'active'),
  }
}

export interface JobSourceInput {
  name: string
  slug: string
  type: SourceType
  baseUrl: string | null
  termsUrl: string | null
  ingestionAllowed: boolean
  notes: string | null
  status: 'active' | 'paused'
  provider: string
  config: Record<string, unknown>
  companyId: string | null
  autoPublish: boolean
}

export const PROVIDER_CHOICES = ['manual', 'greenhouse', 'lever', 'ashby', 'fixture'] as const

export function parseSourceInput(body: unknown): JobSourceInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
  const b = body as Record<string, unknown>
  const name = str(b.name, 'Name', { required: true, max: 160 })!
  const slug = slugify(str(b.slug, 'Slug', { max: 160 }) || name)
  if (!slug) throw new ValidationError('Slug must contain letters or numbers', 'slug')
  const type = oneOf(b.type, SOURCE_TYPES.map((s) => s.id) as SourceType[], 'Type')
  const ingestionAllowed = b.ingestionAllowed === true || b.ingestionAllowed === 'true' || b.ingestionAllowed === 'on'
  if (ingestionAllowed && type === 'manual') throw new ValidationError('Manual sources cannot be marked for automated ingestion', 'ingestionAllowed')
  const provider = oneOf(b.provider, PROVIDER_CHOICES, 'Provider', 'manual')
  if (ingestionAllowed && provider === 'manual') throw new ValidationError('Choose a provider before allowing automated ingestion', 'provider')
  let config: Record<string, unknown> = {}
  if (b.config !== undefined && b.config !== null && b.config !== '') {
    let parsed: unknown = b.config
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      } catch {
        throw new ValidationError('Provider config must be valid JSON', 'config')
      }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new ValidationError('Provider config must be a JSON object', 'config')
    config = parsed as Record<string, unknown>
  }
  if (provider === 'greenhouse' && !/^[a-z0-9-]+$/i.test(String(config.board || ''))) throw new ValidationError('Greenhouse sources need config.board', 'config')
  if (provider === 'ashby' && !/^[a-z0-9-]+$/i.test(String(config.board || ''))) throw new ValidationError('Ashby sources need config.board', 'config')
  if (provider === 'lever' && !/^[a-z0-9-]+$/i.test(String(config.site || ''))) throw new ValidationError('Lever sources need config.site', 'config')
  const companyId = str(b.companyId, 'Company')
  if (provider !== 'manual' && !companyId) throw new ValidationError('Provider sources need a company so ingested jobs have an employer', 'companyId')
  return {
    name,
    slug,
    type,
    baseUrl: optionalUrl(b.baseUrl, 'Base URL'),
    termsUrl: optionalUrl(b.termsUrl, 'Terms URL'),
    ingestionAllowed,
    notes: str(b.notes, 'Notes', { max: 4000 }),
    status: oneOf(b.status, ['active', 'paused'] as const, 'Status', 'active'),
    provider,
    config,
    companyId,
    autoPublish: b.autoPublish === true || b.autoPublish === 'true' || b.autoPublish === 'on',
  }
}

export function parsePreferencesInput(body: unknown): LearnerJobPreferences {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
  const b = body as Record<string, unknown>
  const roleCategories = stringList(b.roleCategories, 'Target roles', { max: 14 })
  for (const id of roleCategories) if (!ROLE_CATEGORY_IDS.includes(id)) throw new ValidationError(`Unknown role category ${id}`, 'roleCategories')
  const pick = <T extends string>(value: unknown, allowed: readonly T[], field: string): T[] => {
    const list = stringList(value, field)
    for (const v of list) if (!(allowed as readonly string[]).includes(v)) throw new ValidationError(`Unknown ${field} value ${v}`, field)
    return list as T[]
  }
  const salaryMin = int(b.salaryMin, 'Minimum salary', { min: 0 })
  return {
    roleCategories,
    skills: stringList(b.skills, 'Skills', { max: 40, itemMax: 60 }),
    experienceYears: int(b.experienceYears, 'Experience', { min: 0, max: 40 }),
    locations: stringList(b.locations, 'Locations', { max: 15, itemMax: 80 }),
    regionPreference: oneOf(b.regionPreference, REGION_PREFERENCES.map((r) => r.id) as RegionPreference[], 'Region preference', 'any'),
    workModes: pick(b.workModes, WORK_MODES.map((w) => w.id) as WorkMode[], 'workModes'),
    levels: pick(b.levels, JOB_LEVELS.map((l) => l.id) as JobLevel[], 'levels'),
    employmentTypes: pick(b.employmentTypes, EMPLOYMENT_TYPES.map((e) => e.id) as EmploymentType[], 'employmentTypes'),
    salaryMin,
    salaryCurrency: salaryMin != null ? oneOf(b.salaryCurrency, SALARY_CURRENCIES, 'Salary currency', 'INR') : null,
  }
}
