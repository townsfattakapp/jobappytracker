/**
 * Feature entitlements. A feature key names something the product can gate; a
 * tier is what an account currently has. The default tier → features map below
 * can be overridden by admins through platform settings (`entitlements` key),
 * so the frontend never hardcodes "paid users get X".
 *
 * Tiers today: `free` (signed-in or guest without a pass) and `pro` (an active
 * pass or the operator allowlist, i.e. the existing Entitlement.access flag).
 */

/** Seed plan ids. At runtime the tier is the id of the learner's plan (admin-managed); do not compare against these in application code. */
export const TIERS = ['free', 'pro'] as const
export type Tier = string

export interface FeatureDef {
  key: string
  label: string
  description: string
}

export const FEATURES: FeatureDef[] = [
  { key: 'jobs.discovery', label: 'Job discovery', description: 'Browse relevant openings, open details, use the official apply link and track applications.' },
  { key: 'jobs.personalizedFeed', label: 'Personalised job feed', description: 'The full feed ranked by preferences with feed sections and reasons; free accounts see a limited, newest-first list.' },
  { key: 'jobs.advancedFilters', label: 'Advanced job filters', description: 'Filter by level, employment type and salary in addition to role, region and work mode.' },
  { key: 'jobs.matching', label: 'Personalised job matching', description: 'Explainable compatibility analysis per job.' },
  { key: 'jobs.curriculumGaps', label: 'Curriculum gap analysis', description: 'Map a job to completed and missing curriculum and add gaps to the plan.' },
  { key: 'resume.profile', label: 'Resume profile', description: 'Upload resumes, keep versions and see the extracted profile.' },
  { key: 'jobs.resumeAnalysis', label: 'Resume vs job description', description: 'Analyse the learner resume against a specific job with evidence-based suggestions.' },
  { key: 'jobs.applicationStrategy', label: 'Application strategy', description: 'Preparation checklist and application sequence for a job.' },
  { key: 'jobs.networkingBasic', label: 'Networking guidance', description: 'Contact categories, LinkedIn search queries and connection / recruiter drafts.' },
  { key: 'jobs.referrals', label: 'Personalised referral drafts', description: 'Referral, hiring-manager, follow-up and thank-you drafts grounded in the learner resume.' },
  { key: 'jobs.outreachTracker', label: 'Outreach tracker', description: 'Save contacts, statuses, notes and follow-up dates per job.' },
  { key: 'jobs.preparationBasic', label: 'Preparation overview', description: 'Must-prepare / already-strong overview from curriculum progress.' },
  { key: 'jobs.preparation', label: 'Job preparation blueprint', description: 'Full job-specific blueprint with projects, behavioural areas and 7/14/30-day plans.' },
  { key: 'jobs.interviewKit', label: 'Job-specific interview kit', description: 'Recommended practice topics and questions for the role, linked to the curriculum.' },
  { key: 'jobs.readinessAdvanced', label: 'Advanced readiness view', description: 'Full readiness breakdown across curriculum, resume, preparation, outreach and application.' },
  { key: 'tracker.basic', label: 'Application tracker', description: 'Track applications on the board and list.' },
  { key: 'mock.integrations', label: 'Mock interview integrations', description: 'Start a mock interview from a job.' },
  { key: 'interview.jobPreview', label: 'Job interview preview', description: 'A short three-question job-specific mock interview with summary feedback.' },
  { key: 'interview.jobFull', label: 'Full job-specific mock interviews', description: 'Complete role-adapted interviews for a job: resume, fundamentals, technical, behavioural and wrap-up.' },
  { key: 'interview.adaptive', label: 'Adaptive follow-up questions', description: 'The interviewer reacts to each answer: clarifies, asks for examples, probes trade-offs and missed concepts.' },
  { key: 'interview.coding', label: 'Coding round in job interviews', description: 'Live coding / DSA section when the role calls for it.' },
  { key: 'interview.systemDesign', label: 'System-design round in job interviews', description: 'System-design section at the depth the role and level call for.' },
  { key: 'interview.feedbackDetailed', label: 'Detailed interview feedback', description: 'Question-level evidence, strengths, weaknesses and better approaches after each interview.' },
  { key: 'interview.curriculumMapping', label: 'Interview weakness mapping', description: 'Map interview weaknesses to curriculum topics and add them to the learning plan.' },
  { key: 'interview.reattempt', label: 'Interview re-attempts', description: 'Practice again: full, weak areas only, one section or missed concepts.' },
  { key: 'interview.history', label: 'Interview history', description: 'Attempt history per job with factual comparisons between attempts.' },
  { key: 'ai.highLimits', label: 'Higher AI usage limits', description: 'Larger daily AI allowance.' },
]

export const FEATURE_KEYS = FEATURES.map((f) => f.key)

/** Default entitlements; admins override these in Platform settings. */
export const DEFAULT_TIER_FEATURES: Record<'free' | 'pro', string[]> = {
  free: ['jobs.discovery', 'tracker.basic', 'resume.profile', 'jobs.networkingBasic', 'jobs.preparationBasic', 'interview.jobPreview'],
  pro: FEATURE_KEYS,
}

/** Feature flags that switch whole modules on or off for everyone. */
export interface FeatureFlags {
  jobsModule: boolean
  adminPanel: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = { jobsModule: true, adminPanel: true }

export function normalizeTierFeatures(value: unknown): Record<'free' | 'pro', string[]> {
  const out: Record<'free' | 'pro', string[]> = { free: [...DEFAULT_TIER_FEATURES.free], pro: [...DEFAULT_TIER_FEATURES.pro] }
  if (!value || typeof value !== 'object') return out
  for (const tier of TIERS) {
    const list = (value as Record<string, unknown>)[tier]
    if (Array.isArray(list)) out[tier] = list.filter((k): k is string => typeof k === 'string' && FEATURE_KEYS.includes(k))
  }
  // Pro always includes everything free has.
  out.pro = Array.from(new Set([...out.free, ...out.pro]))
  return out
}

export function normalizeFeatureFlags(value: unknown): FeatureFlags {
  const flags = { ...DEFAULT_FEATURE_FLAGS }
  if (!value || typeof value !== 'object') return flags
  const v = value as Record<string, unknown>
  if (typeof v.jobsModule === 'boolean') flags.jobsModule = v.jobsModule
  if (typeof v.adminPanel === 'boolean') flags.adminPanel = v.adminPanel
  return flags
}

/** Numeric limits per plan; admins edit them on the plan. Index signature keeps it storable as JSON. */
export interface TierLimits {
  [key: string]: number
  /** Maximum jobs a free learner sees in the feed (0 = unlimited). */
  jobFeed: number
  /** Compatibility analyses per day (server-counted). */
  analysesPerDay: number
  /** Resume-vs-job analyses per day (server-counted). */
  resumeAnalysesPerDay: number
  /** Outreach message drafts per day (server-counted). */
  messageDraftsPerDay: number
  /** Preparation plans added to the calendar per day (server-counted). */
  preparationPlansPerDay: number
  /** Job-specific mock interviews started per day (server-counted). */
  interviewsPerDay: number
  /** Job-specific mock interviews started per calendar month (server-counted). */
  interviewsPerMonth: number
  /** Longest interview a learner on this plan can configure, in minutes. */
  interviewMaxMinutes: number
}

export const LIMIT_KEYS: { key: keyof TierLimits; label: string }[] = [
  { key: 'jobFeed', label: 'Jobs shown in the feed (0 = unlimited)' },
  { key: 'analysesPerDay', label: 'Compatibility analyses per day' },
  { key: 'resumeAnalysesPerDay', label: 'Resume analyses per day' },
  { key: 'messageDraftsPerDay', label: 'Outreach message drafts per day' },
  { key: 'preparationPlansPerDay', label: 'Preparation plans per day' },
  { key: 'interviewsPerDay', label: 'Job mock interviews per day' },
  { key: 'interviewsPerMonth', label: 'Job mock interviews per month' },
  { key: 'interviewMaxMinutes', label: 'Longest job mock interview (minutes)' },
]

export const DEFAULT_TIER_LIMITS: Record<'free' | 'pro', TierLimits> = {
  free: { jobFeed: 12, analysesPerDay: 0, resumeAnalysesPerDay: 0, messageDraftsPerDay: 3, preparationPlansPerDay: 0, interviewsPerDay: 1, interviewsPerMonth: 3, interviewMaxMinutes: 15 },
  pro: { jobFeed: 0, analysesPerDay: 100, resumeAnalysesPerDay: 50, messageDraftsPerDay: 60, preparationPlansPerDay: 20, interviewsPerDay: 10, interviewsPerMonth: 120, interviewMaxMinutes: 60 },
}

export function normalizeTierLimits(value: unknown): Record<'free' | 'pro', TierLimits> {
  const out: Record<'free' | 'pro', TierLimits> = { free: { ...DEFAULT_TIER_LIMITS.free }, pro: { ...DEFAULT_TIER_LIMITS.pro } }
  if (!value || typeof value !== 'object') return out
  for (const tier of TIERS) {
    const v = (value as Record<string, unknown>)[tier]
    if (!v || typeof v !== 'object') continue
    const t = v as Record<string, unknown>
    if (typeof t.jobFeed === 'number' && Number.isFinite(t.jobFeed) && t.jobFeed >= 0) out[tier].jobFeed = Math.floor(t.jobFeed)
    if (typeof t.analysesPerDay === 'number' && Number.isFinite(t.analysesPerDay) && t.analysesPerDay >= 0) out[tier].analysesPerDay = Math.floor(t.analysesPerDay)
    if (typeof t.resumeAnalysesPerDay === 'number' && Number.isFinite(t.resumeAnalysesPerDay) && t.resumeAnalysesPerDay >= 0) out[tier].resumeAnalysesPerDay = Math.floor(t.resumeAnalysesPerDay)
    if (typeof t.messageDraftsPerDay === 'number' && Number.isFinite(t.messageDraftsPerDay) && t.messageDraftsPerDay >= 0) out[tier].messageDraftsPerDay = Math.floor(t.messageDraftsPerDay)
    if (typeof t.preparationPlansPerDay === 'number' && Number.isFinite(t.preparationPlansPerDay) && t.preparationPlansPerDay >= 0) out[tier].preparationPlansPerDay = Math.floor(t.preparationPlansPerDay)
  }
  return out
}

/** Feature keys that need a paid tier by default; used for the "locked" UI copy. */
export const FEATURE_LABELS: Record<string, string> = Object.fromEntries(FEATURES.map((f) => [f.key, f.label]))

export function tierFor(hasPaidAccess: boolean): Tier {
  return hasPaidAccess ? 'pro' : 'free'
}

export function hasFeature(features: string[] | null | undefined, key: string): boolean {
  return Boolean(features?.includes(key))
}
