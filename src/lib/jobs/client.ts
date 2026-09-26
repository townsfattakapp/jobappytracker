import { api } from '../adminClient'
import type { Freshness } from './normalize'
import type { Relevance } from './relevance'
import type { JobDto, JobListFilters, LearnerJobPreferences } from './types'

/** Job as the learner API returns it: stored fields plus computed freshness and relevance. */
export type LearnerJob = JobDto & { freshness: Freshness; relevance: Relevance | null }

export interface JobListResponse {
  items: LearnerJob[]
  total: number
  page: number
  pageSize: number
  personalised: boolean
  /** Jobs the learner's hard preferences (region, work mode, employment type) filtered out. */
  hiddenByPreferences: number
  tier: string
  /** Free tier: how many published jobs exist beyond the cap (0 when uncapped). */
  beyondCap: number
  capped: boolean
}

export interface AnalysisResponse {
  job: JobDto
  preferences: LearnerJobPreferences | null
  usage: { used: number; limit: number }
}

export interface PlatformConfigResponse {
  flags: { jobsModule: boolean; adminPanel: boolean }
  /** Plan id (admin-managed). */
  tier: string
  plan: { id: string; displayName: string; isDefault: boolean }
  planSource: 'subscription' | 'legacy_pass' | 'allowlist' | 'default'
  accessEndsAt: string | null
  features: string[]
  limits: { jobFeed: number; analysesPerDay: number; [key: string]: number }
  disabledRoleFamilies: string[]
  signedIn: boolean
  canOpenAdmin: boolean
}

export function fetchJobs(filters: JobListFilters & { ranked?: boolean }): Promise<JobListResponse> {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === '' || v === null) continue
    if (k === 'ranked') q.set('ranked', v ? '1' : '0')
    else q.set(k, String(v))
  }
  return api<JobListResponse>(`/api/jobs?${q.toString()}`)
}

export function fetchJob(id: string): Promise<LearnerJob> {
  return api<LearnerJob>(`/api/jobs/${encodeURIComponent(id)}`)
}

export async function fetchPreferences(): Promise<LearnerJobPreferences | null> {
  const res = await api<{ preferences: LearnerJobPreferences | null }>('/api/jobs/preferences')
  return res.preferences
}

export async function savePreferences(prefs: LearnerJobPreferences): Promise<LearnerJobPreferences> {
  const res = await api<{ preferences: LearnerJobPreferences }>('/api/jobs/preferences', { method: 'PUT', json: prefs })
  return res.preferences
}

/** Counts one compatibility analysis against today's limit and returns the inputs for the report. */
export function requestAnalysis(jobId: string): Promise<AnalysisResponse> {
  return api<AnalysisResponse>(`/api/jobs/${encodeURIComponent(jobId)}/analysis`, { method: 'POST', json: {} })
}

export function fetchPlatformConfig(): Promise<PlatformConfigResponse> {
  return api<PlatformConfigResponse>('/api/platform/config')
}
