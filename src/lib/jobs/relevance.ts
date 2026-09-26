import { levelForExperience, roleCategoryById, type WorkMode } from './taxonomy'
import type { JobDto, LearnerJobPreferences } from './types'

/**
 * Preference-based relevance ranking (Phase 1). Every point comes with a
 * plain-language reason so the UI can explain why a job is shown first. This
 * is a ranking aid over factual job fields; it says nothing about hiring
 * chances and is never presented as a match percentage.
 */

export interface RelevanceReason {
  kind: 'role' | 'skill' | 'experience' | 'region' | 'location' | 'workMode' | 'level' | 'employmentType' | 'salary' | 'freshness'
  text: string
  /** Positive supports the job; negative flags a mismatch the learner chose to filter by. */
  weight: number
}

export interface Relevance {
  score: number
  reasons: RelevanceReason[]
  /** True when a hard preference (region, work mode, employment type) is violated. */
  excluded: boolean
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#. ]+/g, ' ').replace(/\s+/g, ' ').trim()

/** Skill match tolerant of "Node.js" vs "node" and "React.js" vs "react". */
export function skillsMatch(a: string, b: string): boolean {
  const x = norm(a).replace(/\.js$/, '').replace(/js$/, '')
  const y = norm(b).replace(/\.js$/, '').replace(/js$/, '')
  if (!x || !y) return false
  return x === y || (x.length > 3 && y.length > 3 && (x.includes(y) || y.includes(x)))
}

export function rankJob(job: JobDto, prefs: LearnerJobPreferences | null | undefined, now: Date = new Date()): Relevance {
  const reasons: RelevanceReason[] = []
  let excluded = false
  if (!prefs) return { score: 0, reasons, excluded }

  if (prefs.roleCategories.length) {
    if (prefs.roleCategories.includes(job.roleCategory)) {
      reasons.push({ kind: 'role', text: `Matches your target role: ${roleCategoryById(job.roleCategory)?.label ?? job.roleCategory}`, weight: 40 })
    } else {
      // Sibling categories (e.g. Java ↔ Backend) share career paths; give partial credit.
      const jobPaths = new Set(roleCategoryById(job.roleCategory)?.careerPathIds ?? [])
      const overlap = prefs.roleCategories.some((id) => (roleCategoryById(id)?.careerPathIds ?? []).some((p) => jobPaths.has(p)))
      if (overlap) reasons.push({ kind: 'role', text: 'Related to one of your target roles (shares a career path)', weight: 15 })
    }
  }

  if (prefs.skills.length) {
    const required = job.requiredSkills.filter((s) => prefs.skills.some((p) => skillsMatch(p, s)))
    const preferred = job.preferredSkills.filter((s) => prefs.skills.some((p) => skillsMatch(p, s)))
    if (required.length) {
      const share = required.length / Math.max(1, job.requiredSkills.length)
      reasons.push({ kind: 'skill', text: `You listed ${required.length} of ${job.requiredSkills.length} required skills: ${required.slice(0, 4).join(', ')}`, weight: Math.round(30 * share) })
    }
    if (preferred.length) reasons.push({ kind: 'skill', text: `Preferred skills you listed: ${preferred.slice(0, 3).join(', ')}`, weight: Math.min(10, preferred.length * 3) })
  }

  if (prefs.experienceYears != null) {
    const y = prefs.experienceYears
    const min = job.experienceMin ?? 0
    const max = job.experienceMax ?? Number.POSITIVE_INFINITY
    if (y >= min && y <= max) reasons.push({ kind: 'experience', text: `Your ${y} yrs of experience is inside the ${min}–${Number.isFinite(max) ? max : `${min}+`} yr range`, weight: 12 })
    else if (y < min) reasons.push({ kind: 'experience', text: `Asks for ${min}+ yrs; you listed ${y}`, weight: -8 })
    else reasons.push({ kind: 'experience', text: `You may be above the ${max} yr upper range`, weight: -3 })
    if (!prefs.levels.length && levelForExperience(y).includes(job.level)) reasons.push({ kind: 'level', text: 'Level fits your experience', weight: 6 })
  }

  if (prefs.regionPreference !== 'any') {
    if (prefs.regionPreference === job.region) reasons.push({ kind: 'region', text: prefs.regionPreference === 'india' ? 'In India, as you prefer' : 'Outside India, as you prefer', weight: 8 })
    else if (job.workMode !== 'remote') {
      excluded = true
      reasons.push({ kind: 'region', text: 'Outside your preferred region', weight: -100 })
    } else if (job.remoteEligibility === 'worldwide') reasons.push({ kind: 'region', text: 'Remote and open to applicants worldwide', weight: 2 })
    else if (job.remoteEligibility === 'country' || job.remoteEligibility === 'region') {
      // The source limits this remote role to specific countries that are not the preferred region.
      excluded = true
      reasons.push({ kind: 'region', text: `Remote but limited to ${job.eligibleCountries.join(', ') || 'another region'}`, weight: -100 })
    } else reasons.push({ kind: 'region', text: 'Remote role outside your preferred region; the listing does not say which countries it hires from', weight: -4 })
  }

  if (prefs.locations.length && job.locationCity) {
    const city = norm(job.locationCity)
    const hit = prefs.locations.find((l) => norm(l) === city || city.includes(norm(l)) || norm(l).includes(city))
    if (hit) reasons.push({ kind: 'location', text: `In ${job.locationCity}, one of your preferred locations`, weight: 10 })
  }

  if (prefs.workModes.length) {
    if (prefs.workModes.includes(job.workMode as WorkMode)) reasons.push({ kind: 'workMode', text: `${job.workMode === 'onsite' ? 'On-site' : job.workMode === 'hybrid' ? 'Hybrid' : 'Remote'} matches your work-mode preference`, weight: 8 })
    else {
      excluded = true
      reasons.push({ kind: 'workMode', text: 'Work mode is not one you selected', weight: -100 })
    }
  }

  if (prefs.levels.length) {
    if (prefs.levels.includes(job.level)) reasons.push({ kind: 'level', text: 'Level matches your target', weight: 8 })
    else reasons.push({ kind: 'level', text: 'Different level than you targeted', weight: -6 })
  }

  if (prefs.employmentTypes.length) {
    if (prefs.employmentTypes.includes(job.employmentType)) reasons.push({ kind: 'employmentType', text: 'Employment type matches', weight: 4 })
    else {
      excluded = true
      reasons.push({ kind: 'employmentType', text: 'Employment type is not one you selected', weight: -100 })
    }
  }

  if (prefs.salaryMin != null && job.salaryMax != null && job.salaryCurrency && prefs.salaryCurrency === job.salaryCurrency) {
    if (job.salaryMax >= prefs.salaryMin) reasons.push({ kind: 'salary', text: 'Advertised range reaches your minimum', weight: 5 })
    else reasons.push({ kind: 'salary', text: 'Advertised range is below your minimum', weight: -10 })
  }

  const posted = job.lastVerifiedAt || job.postedAt
  if (posted) {
    const days = (now.getTime() - new Date(posted).getTime()) / 86_400_000
    if (days >= 0 && days < 7) reasons.push({ kind: 'freshness', text: 'Posted or verified this week', weight: 4 })
  }

  const score = reasons.reduce((sum, r) => sum + r.weight, 0)
  return { score, reasons, excluded }
}

/** Sorts by relevance (desc), then most recently posted; drops hard-excluded jobs when preferences exist. */
export function rankJobs(jobs: JobDto[], prefs: LearnerJobPreferences | null | undefined, now: Date = new Date()): { job: JobDto; relevance: Relevance }[] {
  const ranked = jobs.map((job) => ({ job, relevance: rankJob(job, prefs, now) })).filter((r) => !r.relevance.excluded)
  ranked.sort((a, b) => {
    if (b.relevance.score !== a.relevance.score) return b.relevance.score - a.relevance.score
    const ad = new Date(a.job.postedAt || a.job.createdAt).getTime()
    const bd = new Date(b.job.postedAt || b.job.createdAt).getTime()
    return bd - ad
  })
  return ranked
}
