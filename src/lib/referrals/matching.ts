/**
 * Deterministic referrer matching and fair assignment. Pure: the service
 * loads the candidate rows and their workload, this module ranks them.
 * Nothing here is ever shown to a learner; the learner only learns that
 * matching happened.
 */

export interface MatchJob {
  companyId: string
  roleCategory: string
  locationCity: string | null
  locationCountry: string | null
  region: string
  workMode: string
}

export interface MatchReferrer {
  id: string
  publicId: string
  companyId: string
  verificationStatus: string
  verificationExpiresAt: Date | null
  availability: string
  roleFamilies: string[]
  supportedLocations: string[]
  maxActiveRequests: number
  maxMonthlyRequests: number
  /** Assignments currently pending, in clarification or accepted-but-unsubmitted. */
  activeAssignments: number
  /** Assignments created this calendar month. */
  monthlyAssignments: number
  lastAssignedAt: Date | null
  /** Assignments answered (accepted, declined or submitted) over assignments that reached a decision point; null when none. */
  responseRate: number | null
  /** Requests this referrer already saw (declined, expired, cancelled), never offered again. */
  seenRequestIds: string[]
  /** Learners this referrer declined before; a repeat request from them is not routed here. */
  declinedUserIds: string[]
}

export interface MatchPolicy {
  referralsEnabled: boolean
  policyStatus: string
  manualReviewRequired: boolean
}

export interface MatchInput {
  requestId: string
  learnerUserId: string
  job: MatchJob
  referrers: MatchReferrer[]
  policy: MatchPolicy | null
  /** When the policy is UNKNOWN, an admin decides whether requests may still proceed. */
  allowUnknownPolicy: boolean
  now: Date
}

export interface MatchDecision {
  /** Why no referrer is eligible, when `chosen` is null. */
  blockedReason: 'policy_disabled' | 'policy_unknown' | 'manual_review' | 'no_referrer_available' | null
  eligible: string[]
  chosen: MatchReferrer | null
  /** Per-referrer exclusion reasons for admin diagnostics; never shown to learners. */
  excluded: { id: string; reason: string }[]
}

const ROLE_FAMILY_ALIASES: Record<string, string[]> = {
  'software-engineer': ['software-engineer', 'backend', 'frontend', 'full-stack', 'java', 'nodejs', 'react-nextjs', 'mobile'],
  backend: ['backend', 'software-engineer', 'full-stack', 'java', 'nodejs'],
  frontend: ['frontend', 'software-engineer', 'full-stack', 'react-nextjs'],
  'full-stack': ['full-stack', 'software-engineer', 'backend', 'frontend'],
  java: ['java', 'backend', 'software-engineer'],
  nodejs: ['nodejs', 'backend', 'software-engineer'],
  'react-nextjs': ['react-nextjs', 'frontend', 'software-engineer'],
  mobile: ['mobile', 'software-engineer'],
  'devops-cloud': ['devops-cloud', 'software-engineer'],
  'data-engineer': ['data-engineer', 'data-scientist', 'ai-ml'],
  'data-scientist': ['data-scientist', 'data-engineer', 'ai-ml', 'data-analyst'],
  'ai-ml': ['ai-ml', 'data-scientist', 'data-engineer'],
  'data-analyst': ['data-analyst', 'data-scientist'],
  cybersecurity: ['cybersecurity', 'devops-cloud'],
}

/** A referrer in "engineering" can reasonably refer any engineering family; the aliases keep data and security separate. */
export function roleFamilyCompatible(referrerFamilies: string[], roleCategory: string): { compatible: boolean; exact: boolean } {
  const fams = referrerFamilies.map((f) => f.toLowerCase())
  if (fams.includes('any')) return { compatible: true, exact: false }
  if (fams.includes(roleCategory)) return { compatible: true, exact: true }
  const related = ROLE_FAMILY_ALIASES[roleCategory] ?? [roleCategory]
  return { compatible: fams.some((f) => related.includes(f)), exact: false }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim()

/** "any", the job's city, its country, or "remote" for remote jobs. */
export function locationCompatible(supported: string[], job: MatchJob): { compatible: boolean; exact: boolean } {
  const list = supported.map(norm).filter(Boolean)
  if (!list.length || list.includes('any')) return { compatible: true, exact: false }
  const city = job.locationCity ? norm(job.locationCity) : ''
  const country = job.locationCountry ? norm(job.locationCountry) : ''
  if (city && list.some((l) => l === city || city.includes(l) || l.includes(city))) return { compatible: true, exact: true }
  if (job.workMode === 'remote' && list.includes('remote')) return { compatible: true, exact: true }
  if (country && list.some((l) => l === country)) return { compatible: true, exact: false }
  if (job.region === 'india' && list.includes('india')) return { compatible: true, exact: false }
  return { compatible: false, exact: false }
}

export function referrerEligible(r: MatchReferrer, input: MatchInput): string | null {
  if (r.companyId !== input.job.companyId) return 'different company'
  if (r.verificationStatus !== 'VERIFIED') return `verification ${r.verificationStatus.toLowerCase()}`
  if (r.verificationExpiresAt && r.verificationExpiresAt <= input.now) return 'verification expired'
  if (r.availability !== 'available') return 'paused'
  if (r.activeAssignments >= r.maxActiveRequests) return 'at active capacity'
  if (r.monthlyAssignments >= r.maxMonthlyRequests) return 'at monthly capacity'
  if (r.seenRequestIds.includes(input.requestId)) return 'already reviewed this request'
  if (r.declinedUserIds.includes(input.learnerUserId)) return 'declined this candidate before'
  if (!roleFamilyCompatible(r.roleFamilies, input.job.roleCategory).compatible) return 'role family not covered'
  if (!locationCompatible(r.supportedLocations, input.job).compatible) return 'location not supported'
  return null
}

/**
 * Fair assignment: lower load first (active and monthly share of capacity),
 * then the referrer who was assigned least recently, with a modest bonus for
 * exact role-family and location relevance and for referrers who reliably
 * answer (accepting or declining both count; accepting everyone earns nothing).
 */
export function fairnessScore(r: MatchReferrer, input: MatchInput): number {
  const activeShare = r.maxActiveRequests ? r.activeAssignments / r.maxActiveRequests : 1
  const monthlyShare = r.maxMonthlyRequests ? r.monthlyAssignments / r.maxMonthlyRequests : 1
  const hoursSince = r.lastAssignedAt ? (input.now.getTime() - r.lastAssignedAt.getTime()) / 36e5 : 24 * 30
  const recencyPenalty = hoursSince < 24 ? 0.5 : hoursSince < 72 ? 0.2 : 0
  const relevanceBonus = (roleFamilyCompatible(r.roleFamilies, input.job.roleCategory).exact ? 0.15 : 0) + (locationCompatible(r.supportedLocations, input.job).exact ? 0.1 : 0)
  const responsiveness = r.responseRate === null ? 0 : 0.1 * r.responseRate
  return activeShare + monthlyShare + recencyPenalty - relevanceBonus - responsiveness
}

export function matchReferrer(input: MatchInput): MatchDecision {
  const policy = input.policy
  if (!policy || !policy.referralsEnabled || policy.policyStatus === 'REFERRALS_DISABLED') return { blockedReason: 'policy_disabled', eligible: [], chosen: null, excluded: [] }
  if (policy.policyStatus === 'UNKNOWN' && !input.allowUnknownPolicy) return { blockedReason: 'policy_unknown', eligible: [], chosen: null, excluded: [] }
  if (policy.manualReviewRequired) return { blockedReason: 'manual_review', eligible: [], chosen: null, excluded: [] }
  const excluded: { id: string; reason: string }[] = []
  const eligible: MatchReferrer[] = []
  for (const r of input.referrers) {
    const reason = referrerEligible(r, input)
    if (reason) excluded.push({ id: r.id, reason })
    else eligible.push(r)
  }
  if (!eligible.length) return { blockedReason: 'no_referrer_available', eligible: [], chosen: null, excluded }
  const ranked = eligible
    .map((r) => ({ r, score: fairnessScore(r, input) }))
    .sort((a, b) => a.score - b.score || (a.r.lastAssignedAt?.getTime() ?? 0) - (b.r.lastAssignedAt?.getTime() ?? 0) || a.r.id.localeCompare(b.r.id))
  return { blockedReason: null, eligible: ranked.map((x) => x.r.id), chosen: ranked[0].r, excluded }
}
