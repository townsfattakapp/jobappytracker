import { api } from '../adminClient'
import type { AdminInviteDto, AdminReferrerDto, AdminRequestDto, CompanyCoverageRow, CompanyPolicyDto, CreditSummary, JobReferralAvailability, LearnerRequestDto, ReferralMetrics, ReferralSettings, ReferrerAssignmentDto, ReferrerSelfDto } from '../server/referrals'
import type { ReadinessReport } from './readiness'

export type { AdminReferrerDto, AdminRequestDto, CompanyCoverageRow, CompanyPolicyDto, CreditSummary, JobReferralAvailability, LearnerRequestDto, ReadinessReport, ReferralMetrics, ReferralSettings, ReferrerAssignmentDto, ReferrerSelfDto }

/** Copy every referral surface shows; the wording is deliberate and must not drift towards guarantees. */
export const TRUST_LINE = 'Referral requests are reviewed by verified referrers. A request does not guarantee a referral, interview, or job.'
export const PRICING_LINE = 'JobAppy charges for verification, matching and coordination services where applicable, not for a guaranteed hiring outcome.'

export interface JobReferralState {
  availability: JobReferralAvailability | null
  request: LearnerRequestDto | null
  credits: { available: number; held: number; allowance: number } | null
  features: { viewAvailability: boolean; readiness: boolean; request: boolean; reassignment: boolean; history: boolean }
  limits: { monthly: number; active: number; reassignments: number }
  signedIn: boolean
  requireCredits: boolean
}

export function fetchJobReferral(jobId: string): Promise<JobReferralState> {
  return api<JobReferralState>(`/api/jobs/${encodeURIComponent(jobId)}/referral`)
}

export function runReferralReadiness(jobId: string, opts: { resumeId?: string | null; alreadyApplied?: boolean; preparationStarted?: boolean } = {}): Promise<{ request: LearnerRequestDto; report: ReadinessReport }> {
  return api(`/api/jobs/${encodeURIComponent(jobId)}/referral`, { method: 'POST', json: { action: 'readiness', ...opts } })
}

export function submitReferralRequest(jobId: string, body: { requestId: string; introduction: string; whyRole: string; relevantExperience: string; consent: boolean }): Promise<{ request: LearnerRequestDto }> {
  return api(`/api/jobs/${encodeURIComponent(jobId)}/referral`, { method: 'POST', json: { action: 'submit', ...body } })
}

export interface ReferralCenter {
  requests: LearnerRequestDto[]
  credits: CreditSummary
  limits: { monthly: number; active: number; reassignments: number }
  features: { request: boolean; history: boolean; readiness: boolean }
  networkMode: 'invite_only' | 'public' | 'disabled'
}

export function fetchReferralCenter(): Promise<ReferralCenter> {
  return api<ReferralCenter>('/api/referrals')
}

export function fetchReferral(id: string): Promise<{ request: LearnerRequestDto }> {
  return api(`/api/referrals/${encodeURIComponent(id)}`)
}

export function referralAction(id: string, body: { action: 'cancel' } | { action: 'message'; body: string } | { action: 'link_application'; applicationId: string }): Promise<{ request: LearnerRequestDto }> {
  return api(`/api/referrals/${encodeURIComponent(id)}`, { method: 'POST', json: body })
}

// Referrer portal -------------------------------------------------------------

export interface ReferrerPortalData {
  referrer: ReferrerSelfDto | null
  assignments?: ReferrerAssignmentDto[]
  counts?: { pending: number; accepted: number; awaiting: number; completed: number; activeLoad: number; monthlyLoad: number }
  mode: 'invite_only' | 'public' | 'disabled'
}

export function fetchReferrerPortal(): Promise<ReferrerPortalData> {
  return api<ReferrerPortalData>('/api/referrer')
}

export function referrerSelfAction(body: Record<string, unknown>): Promise<{ referrer?: ReferrerSelfDto; sentTo?: string; expiresAt?: string; emailStatus?: 'sent' | 'skipped' | 'failed' | 'unknown' }> {
  return api('/api/referrer', { method: 'POST', json: body })
}

export function fetchAssignment(id: string): Promise<{ assignment: ReferrerAssignmentDto }> {
  return api(`/api/referrer/assignments/${encodeURIComponent(id)}`)
}

export function assignmentAction(id: string, body: Record<string, unknown>): Promise<{ assignment: ReferrerAssignmentDto }> {
  return api(`/api/referrer/assignments/${encodeURIComponent(id)}`, { method: 'POST', json: body })
}

export function confirmReferrerEmail(token: string): Promise<{ result: 'verified' | 'invalid' | 'expired' | 'already' }> {
  return api('/api/referrer/verify', { method: 'POST', json: { token } })
}

// Admin -----------------------------------------------------------------------

export interface AdminReferralConsole {
  invites: AdminInviteDto[]
  metrics: ReferralMetrics
  requests: AdminRequestDto[]
  referrers: AdminReferrerDto[]
  coverage: CompanyCoverageRow[]
  disclosures: { id: string; requestId: string; referrerName: string | null; learnerEmail: string | null; fields: string[]; reason: string; actorRole: string; at: string }[]
  settings: ReferralSettings
}

export function fetchAdminReferrals(params: Record<string, string | undefined> = {}): Promise<AdminReferralConsole> {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
  return api<AdminReferralConsole>(`/api/admin/referrals${q.toString() ? `?${q}` : ''}`)
}

export function adminReferralAction(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return api('/api/admin/referrals', { method: 'POST', json: body })
}

export function adminRequestAction(id: string, body: Record<string, unknown>): Promise<{ request: AdminRequestDto }> {
  return api(`/api/admin/referrals/requests/${encodeURIComponent(id)}`, { method: 'POST', json: body })
}

export function adminReferrerAction(id: string, body: Record<string, unknown>): Promise<{ referrer: AdminReferrerDto }> {
  return api(`/api/admin/referrals/referrers/${encodeURIComponent(id)}`, { method: 'POST', json: body })
}

export const ROLE_FAMILY_OPTIONS: { id: string; label: string }[] = [
  { id: 'software-engineer', label: 'Software engineering (general)' },
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'full-stack', label: 'Full-stack' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'devops-cloud', label: 'DevOps and cloud' },
  { id: 'data-engineer', label: 'Data engineering' },
  { id: 'data-scientist', label: 'Data science' },
  { id: 'ai-ml', label: 'AI and ML' },
  { id: 'data-analyst', label: 'Data analytics' },
  { id: 'cybersecurity', label: 'Security' },
  { id: 'any', label: 'Any role at my company' },
]

export function formatWhen(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
