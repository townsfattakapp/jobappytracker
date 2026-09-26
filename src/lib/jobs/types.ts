import type { EmploymentType, JobLevel, JobRegion, JobStatus, RegionPreference, SourceType, WorkMode } from './taxonomy'

/** Company as returned by the API (dates are ISO strings). */
export interface CompanyDto {
  id: string
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
  createdAt: string
  updatedAt: string
}

export interface JobSourceDto {
  id: string
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
  lastRunAt: string | null
  lastRunStatus: 'success' | 'failed' | null
  lastError: string | null
  createdAt: string
  updatedAt: string
}

export type JobLifecycle = 'discovered' | 'active' | 'verified' | 'stale' | 'expired'
export type RemoteEligibility = 'unknown' | 'country' | 'region' | 'worldwide' | 'not_remote'

/** Job as stored, with the joined company and source, dates as ISO strings. */
export interface JobDto {
  id: string
  companyId: string
  sourceId: string | null
  title: string
  normalizedTitle: string
  roleCategory: string
  careerPathIds: string[]
  trackIds: string[]
  description: string
  requirementsSummary: string | null
  requiredSkills: string[]
  preferredSkills: string[]
  experienceMin: number | null
  experienceMax: number | null
  level: JobLevel
  employmentType: EmploymentType
  workMode: WorkMode
  locationCity: string | null
  locationCountry: string | null
  region: JobRegion
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  salaryPeriod: 'year' | 'month' | null
  applyUrl: string
  sourceUrl: string | null
  externalId: string | null
  fingerprint: string
  status: JobStatus
  postedAt: string | null
  expiresAt: string | null
  lastVerifiedAt: string | null
  createdBy: string | null
  lifecycle: JobLifecycle
  firstSeenAt: string | null
  lastSeenAt: string | null
  remoteEligibility: RemoteEligibility
  eligibleCountries: string[]
  createdAt: string
  updatedAt: string
  company: Pick<CompanyDto, 'id' | 'name' | 'slug' | 'website' | 'careersUrl' | 'logoUrl' | 'headquarters'>
  source: Pick<JobSourceDto, 'id' | 'name' | 'type' | 'baseUrl'> | null
}

/** What the admin form submits; every field validated by parseJobInput. */
export interface JobInput {
  companyId: string
  sourceId: string | null
  title: string
  roleCategory: string
  careerPathIds: string[]
  trackIds: string[]
  description: string
  requirementsSummary: string | null
  requiredSkills: string[]
  preferredSkills: string[]
  experienceMin: number | null
  experienceMax: number | null
  level: JobLevel
  employmentType: EmploymentType
  workMode: WorkMode
  locationCity: string | null
  locationCountry: string | null
  region: JobRegion
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  salaryPeriod: 'year' | 'month' | null
  applyUrl: string
  sourceUrl: string | null
  externalId: string | null
  status: JobStatus
  postedAt: string | null
  expiresAt: string | null
  remoteEligibility: RemoteEligibility
  eligibleCountries: string[]
}

export interface LearnerJobPreferences {
  roleCategories: string[]
  skills: string[]
  experienceYears: number | null
  locations: string[]
  regionPreference: RegionPreference
  workModes: WorkMode[]
  levels: JobLevel[]
  employmentTypes: EmploymentType[]
  salaryMin: number | null
  salaryCurrency: string | null
  updatedAt?: string
}

export function emptyPreferences(): LearnerJobPreferences {
  return {
    roleCategories: [],
    skills: [],
    experienceYears: null,
    locations: [],
    regionPreference: 'any',
    workModes: [],
    levels: [],
    employmentTypes: [],
    salaryMin: null,
    salaryCurrency: null,
  }
}

export function hasPreferences(p: LearnerJobPreferences | null | undefined): boolean {
  if (!p) return false
  return Boolean(
    p.roleCategories.length || p.skills.length || p.experienceYears != null || p.locations.length || p.regionPreference !== 'any' || p.workModes.length || p.levels.length || p.employmentTypes.length || p.salaryMin != null,
  )
}

/** Filters accepted by GET /api/jobs. */
export interface JobListFilters {
  q?: string
  roleCategory?: string
  region?: JobRegion | ''
  workMode?: WorkMode | ''
  level?: JobLevel | ''
  employmentType?: EmploymentType | ''
  companyId?: string
  page?: number
  pageSize?: number
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
