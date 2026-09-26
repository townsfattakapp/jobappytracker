/**
 * Job taxonomy shared by the admin panel, the learner Jobs module and the
 * matching code. Role categories are the bridge between a job and the
 * curriculum: each category points at the career paths (and through them the
 * tracks) that prepare a learner for it. Only categories the curriculum can
 * support exist here; JobAppy is not a general job board.
 */

export interface RoleCategory {
  id: string
  label: string
  /** Career path ids from src/data/careerPaths.ts, most relevant first. */
  careerPathIds: string[]
  /** Title fragments that suggest this category (lower-case). */
  hints: string[]
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  { id: 'software-engineer', label: 'Software Engineer / SDE', careerPathIds: ['path-swe-interviews', 'path-full-stack'], hints: ['software engineer', 'sde', 'software developer', 'member of technical staff', 'swe'] },
  { id: 'frontend', label: 'Frontend', careerPathIds: ['path-frontend'], hints: ['frontend', 'front-end', 'front end', 'ui engineer', 'web developer'] },
  { id: 'backend', label: 'Backend', careerPathIds: ['path-java-backend', 'path-python-backend'], hints: ['backend', 'back-end', 'back end', 'api engineer', 'server-side'] },
  { id: 'full-stack', label: 'Full Stack', careerPathIds: ['path-full-stack'], hints: ['full stack', 'full-stack', 'fullstack', 'mern', 'mean'] },
  { id: 'java', label: 'Java', careerPathIds: ['path-java-backend'], hints: ['java', 'spring'] },
  { id: 'nodejs', label: 'Node.js', careerPathIds: ['path-full-stack'], hints: ['node', 'node.js', 'nodejs', 'express', 'nestjs'] },
  { id: 'react-nextjs', label: 'React / Next.js', careerPathIds: ['path-frontend'], hints: ['react', 'next.js', 'nextjs'] },
  { id: 'mobile', label: 'Mobile', careerPathIds: ['path-mobile', 'path-android', 'path-ios', 'path-flutter'], hints: ['mobile', 'android', 'ios', 'flutter', 'react native', 'kotlin', 'swift'] },
  { id: 'devops-cloud', label: 'DevOps / Cloud', careerPathIds: ['path-devops-engineer', 'path-cloud-engineer'], hints: ['devops', 'cloud', 'sre', 'site reliability', 'platform engineer', 'infrastructure', 'kubernetes'] },
  { id: 'data-analyst', label: 'Data Analyst', careerPathIds: ['path-data-analyst'], hints: ['data analyst', 'business analyst', 'bi analyst', 'analytics'] },
  { id: 'data-scientist', label: 'Data Scientist', careerPathIds: ['path-data-scientist'], hints: ['data scientist', 'applied scientist'] },
  { id: 'data-engineer', label: 'Data Engineer', careerPathIds: ['path-data-engineer'], hints: ['data engineer', 'analytics engineer', 'etl', 'pipeline'] },
  { id: 'ai-ml', label: 'AI / ML Engineer', careerPathIds: ['path-ai-engineer', 'path-ml-engineer', 'path-genai-engineer'], hints: ['machine learning', 'ml engineer', 'ai engineer', 'llm', 'generative ai', 'deep learning', 'nlp'] },
  { id: 'cybersecurity', label: 'Cybersecurity', careerPathIds: ['path-cybersecurity'], hints: ['security', 'appsec', 'cyber', 'penetration', 'soc analyst'] },
]

export const ROLE_CATEGORY_IDS = ROLE_CATEGORIES.map((c) => c.id)

export function roleCategoryById(id: string | null | undefined): RoleCategory | undefined {
  return ROLE_CATEGORIES.find((c) => c.id === id)
}

/** Best-guess category for a title; used to prefill the admin form only. */
export function suggestRoleCategory(title: string): RoleCategory | undefined {
  const t = title.toLowerCase()
  let best: { cat: RoleCategory; len: number } | undefined
  for (const cat of ROLE_CATEGORIES) {
    for (const hint of cat.hints) {
      if (t.includes(hint) && (!best || hint.length > best.len)) best = { cat, len: hint.length }
    }
  }
  return best?.cat
}

export const JOB_LEVELS = [
  { id: 'intern', label: 'Intern' },
  { id: 'entry', label: 'Entry level (0–2 yrs)' },
  { id: 'mid', label: 'Mid level (2–5 yrs)' },
  { id: 'senior', label: 'Senior (5+ yrs)' },
  { id: 'lead', label: 'Lead / Staff' },
] as const
export type JobLevel = (typeof JOB_LEVELS)[number]['id']

export const EMPLOYMENT_TYPES = [
  { id: 'full_time', label: 'Full-time' },
  { id: 'part_time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]['id']

export const WORK_MODES = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
] as const
export type WorkMode = (typeof WORK_MODES)[number]['id']

export const REGIONS = [
  { id: 'india', label: 'India' },
  { id: 'international', label: 'Outside India' },
] as const
export type JobRegion = (typeof REGIONS)[number]['id']

export const REGION_PREFERENCES = [
  { id: 'any', label: 'Anywhere' },
  { id: 'india', label: 'India only' },
  { id: 'international', label: 'Outside India only' },
] as const
export type RegionPreference = (typeof REGION_PREFERENCES)[number]['id']

export const JOB_STATUSES = ['draft', 'published', 'expired', 'archived'] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const SOURCE_TYPES = [
  { id: 'manual', label: 'Manual (added by admin)' },
  { id: 'career_page', label: 'Company career page' },
  { id: 'ats_api', label: 'ATS public feed (Greenhouse, Lever, Ashby…)' },
  { id: 'provider', label: 'Approved job provider' },
  { id: 'partner', label: 'Hiring partner' },
] as const
export type SourceType = (typeof SOURCE_TYPES)[number]['id']

export const SALARY_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED', 'CAD', 'AUD'] as const

export function labelOf<T extends { id: string; label: string }>(list: readonly T[], id: string | null | undefined): string {
  return list.find((x) => x.id === id)?.label ?? (id || '—')
}

/** Years-of-experience band each level usually implies; used for preference ranking only. */
export function levelForExperience(years: number | null | undefined): JobLevel[] {
  if (years == null || Number.isNaN(years)) return []
  if (years < 1) return ['intern', 'entry']
  if (years < 2) return ['entry']
  if (years < 5) return ['mid', 'entry']
  if (years < 8) return ['senior', 'mid']
  return ['lead', 'senior']
}

/**
 * Admin-editable overrides for role families: switch a family off (its jobs
 * are treated as irrelevant during ingestion and hidden from filters) or add
 * title keywords that should map to it. Stored in platform_settings.roleFamilies.
 */
export interface RoleFamilyConfig {
  disabled: string[]
  extraHints: Record<string, string[]>
}

export const DEFAULT_ROLE_FAMILY_CONFIG: RoleFamilyConfig = { disabled: [], extraHints: {} }

export function normalizeRoleFamilyConfig(value: unknown): RoleFamilyConfig {
  const out: RoleFamilyConfig = { disabled: [], extraHints: {} }
  if (!value || typeof value !== 'object') return out
  const v = value as Record<string, unknown>
  if (Array.isArray(v.disabled)) out.disabled = v.disabled.filter((id): id is string => typeof id === 'string' && ROLE_CATEGORY_IDS.includes(id))
  if (v.extraHints && typeof v.extraHints === 'object') {
    for (const [id, hints] of Object.entries(v.extraHints as Record<string, unknown>)) {
      if (!ROLE_CATEGORY_IDS.includes(id) || !Array.isArray(hints)) continue
      const clean = hints.map((h) => String(h).trim().toLowerCase()).filter((h) => h.length >= 3 && h.length <= 40)
      if (clean.length) out.extraHints[id] = Array.from(new Set(clean))
    }
  }
  return out
}

/** Role categories after applying the admin configuration. */
export function effectiveRoleCategories(config?: RoleFamilyConfig): RoleCategory[] {
  if (!config) return ROLE_CATEGORIES
  return ROLE_CATEGORIES.filter((c) => !config.disabled.includes(c.id)).map((c) => (config.extraHints[c.id] ? { ...c, hints: [...c.hints, ...config.extraHints[c.id]] } : c))
}
