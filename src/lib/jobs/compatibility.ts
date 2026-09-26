import { sameSkill } from './skills'
import { levelForExperience, roleCategoryById, type JobLevel } from './taxonomy'
import type { JobDto, LearnerJobPreferences } from './types'
import type { JobCurriculumMap } from './curriculumMap'

/**
 * Compatibility engine V1: deterministic, explainable alignment between a
 * learner's profile (preferences + curriculum progress) and one job.
 *
 * The score is a plain weighted sum whose every component is listed in
 * `breakdown`, so the UI can show exactly how it was computed. It describes
 * profile/job alignment only and must never be presented as a probability of
 * being shortlisted or hired.
 */

export interface CompatibilityComponent {
  key: 'role' | 'requiredSkills' | 'preferredSkills' | 'experience' | 'curriculum' | 'location'
  label: string
  /** Points earned. */
  points: number
  /** Maximum points for this component. */
  max: number
  detail: string
}

export interface CompatibilityReport {
  /** 0–100, transparent weighted sum of `breakdown`. */
  score: number
  breakdown: CompatibilityComponent[]
  strongAlignment: string[]
  missingRequirements: string[]
  experienceAlignment: string
  curriculumAlignment: { covered: string[]; learning: string[]; notCovered: string[] }
  locationCompatibility: string
  skillsToStrengthen: string[]
  /** Fields the learner has not filled in; the report is weaker without them. */
  missingInputs: string[]
}

const WEIGHTS = { role: 20, requiredSkills: 30, preferredSkills: 10, experience: 15, curriculum: 15, location: 10 } as const

const LEVEL_ORDER: JobLevel[] = ['intern', 'entry', 'mid', 'senior', 'lead']

export function computeCompatibility(job: JobDto, prefs: LearnerJobPreferences | null, curriculum: JobCurriculumMap | null): CompatibilityReport {
  const breakdown: CompatibilityComponent[] = []
  const missingInputs: string[] = []
  const strong: string[] = []
  const missing: string[] = []

  // Role.
  let rolePoints = 0
  let roleDetail = 'No target roles saved.'
  if (!prefs?.roleCategories.length) missingInputs.push('target roles')
  else if (prefs.roleCategories.includes(job.roleCategory)) {
    rolePoints = WEIGHTS.role
    roleDetail = `${roleCategoryById(job.roleCategory)?.label ?? job.roleCategory} is one of your target roles.`
    strong.push(roleDetail)
  } else {
    const jobPaths = new Set(roleCategoryById(job.roleCategory)?.careerPathIds ?? [])
    const related = prefs.roleCategories.some((id) => (roleCategoryById(id)?.careerPathIds ?? []).some((p) => jobPaths.has(p)))
    rolePoints = related ? Math.round(WEIGHTS.role / 2) : 0
    roleDetail = related ? 'Related to a target role through a shared career path.' : 'Outside your target roles.'
  }
  breakdown.push({ key: 'role', label: 'Target role', points: rolePoints, max: WEIGHTS.role, detail: roleDetail })

  // Skills: a skill counts as demonstrated when the learner listed it or a covering track is complete.
  const learnerSkills = prefs?.skills ?? []
  const coveredTracks = new Set(curriculum?.tracks.filter((t) => t.gapStatus === 'covered').map((t) => t.track.id) ?? [])
  const learningTracks = new Set(curriculum?.tracks.filter((t) => t.gapStatus === 'learning').map((t) => t.track.id) ?? [])
  const trackFor = (skill: string) => curriculum?.tracks.find((t) => t.skills.some((s) => sameSkill(s, skill)))
  const has = (skill: string) => learnerSkills.some((s) => sameSkill(s, skill)) || (trackFor(skill) && coveredTracks.has(trackFor(skill)!.track.id))
  if (!learnerSkills.length) missingInputs.push('skills')

  const reqHave = job.requiredSkills.filter(has)
  const reqMissing = job.requiredSkills.filter((s) => !has(s))
  const reqPoints = job.requiredSkills.length ? Math.round((reqHave.length / job.requiredSkills.length) * WEIGHTS.requiredSkills) : Math.round(WEIGHTS.requiredSkills / 2)
  breakdown.push({ key: 'requiredSkills', label: 'Required skills', points: reqPoints, max: WEIGHTS.requiredSkills, detail: job.requiredSkills.length ? `${reqHave.length} of ${job.requiredSkills.length} required skills demonstrated (${reqHave.join(', ') || 'none'}).` : 'The listing names no required skills; half credit.' })
  if (reqHave.length) strong.push(`Required skills you have: ${reqHave.join(', ')}`)
  for (const s of reqMissing) missing.push(s)

  const prefHave = job.preferredSkills.filter(has)
  const prefPoints = job.preferredSkills.length ? Math.round((prefHave.length / job.preferredSkills.length) * WEIGHTS.preferredSkills) : Math.round(WEIGHTS.preferredSkills / 2)
  breakdown.push({ key: 'preferredSkills', label: 'Preferred skills', points: prefPoints, max: WEIGHTS.preferredSkills, detail: job.preferredSkills.length ? `${prefHave.length} of ${job.preferredSkills.length} preferred skills (${prefHave.join(', ') || 'none'}).` : 'No preferred skills listed; half credit.' })
  if (prefHave.length) strong.push(`Nice-to-have skills you have: ${prefHave.join(', ')}`)

  // Experience.
  let expPoints: number
  let experienceAlignment: string
  if (prefs?.experienceYears == null) {
    missingInputs.push('years of experience')
    expPoints = Math.round(WEIGHTS.experience / 2)
    experienceAlignment = 'Add your years of experience to compare against the listing.'
  } else {
    const y = prefs.experienceYears
    const min = job.experienceMin
    const max = job.experienceMax
    if (min == null && max == null) {
      const fits = levelForExperience(y).includes(job.level)
      expPoints = fits ? WEIGHTS.experience : Math.round(WEIGHTS.experience / 2)
      experienceAlignment = fits ? `The ${job.level} level fits ${y} yrs of experience.` : `The listing is ${job.level} level; ${y} yrs is a ${levelForExperience(y)[0]} profile.`
    } else if (y >= (min ?? 0) && (max == null || y <= max)) {
      expPoints = WEIGHTS.experience
      experienceAlignment = `${y} yrs is inside the ${min ?? 0}–${max ?? `${min ?? 0}+`} yr range.`
    } else if (min != null && y < min) {
      const gap = min - y
      expPoints = gap <= 1 ? Math.round(WEIGHTS.experience * 0.6) : gap <= 2 ? Math.round(WEIGHTS.experience * 0.3) : 0
      experienceAlignment = `The listing asks for ${min}+ yrs; you have ${y} (${gap} yr${gap === 1 ? '' : 's'} short).`
      missing.push(`${min}+ years of experience`)
    } else {
      expPoints = Math.round(WEIGHTS.experience * 0.7)
      experienceAlignment = `You have more experience (${y} yrs) than the ${max} yr upper range; the role may be junior for you.`
    }
    if (expPoints === WEIGHTS.experience) strong.push(experienceAlignment)
  }
  const jobLevelIdx = LEVEL_ORDER.indexOf(job.level)
  if (prefs?.levels.length && !prefs.levels.includes(job.level)) {
    const near = prefs.levels.some((l) => Math.abs(LEVEL_ORDER.indexOf(l) - jobLevelIdx) === 1)
    experienceAlignment += near ? ' Level is one step from your target.' : ' Level differs from your target.'
  }
  breakdown.push({ key: 'experience', label: 'Experience', points: expPoints, max: WEIGHTS.experience, detail: experienceAlignment })

  // Curriculum.
  const covered = curriculum?.tracks.filter((t) => t.gapStatus === 'covered').map((t) => t.track.title) ?? []
  const learning = curriculum?.tracks.filter((t) => t.gapStatus === 'learning').map((t) => t.track.title) ?? []
  const notCovered = curriculum?.tracks.filter((t) => t.gapStatus === 'not_covered').map((t) => t.track.title) ?? []
  const relevantTracks = curriculum?.tracks.length ?? 0
  const curriculumPoints = relevantTracks ? Math.round(((covered.length + learning.length * 0.5) / relevantTracks) * WEIGHTS.curriculum) : Math.round(WEIGHTS.curriculum / 2)
  breakdown.push({ key: 'curriculum', label: 'Curriculum progress', points: curriculumPoints, max: WEIGHTS.curriculum, detail: relevantTracks ? `${covered.length} of ${relevantTracks} relevant tracks covered, ${learning.length} in progress.` : 'No curriculum track maps to this listing.' })
  if (covered.length) strong.push(`Curriculum already covered: ${covered.slice(0, 3).join(', ')}${covered.length > 3 ? '…' : ''}`)

  // Location and work mode.
  let locPoints: number = WEIGHTS.location
  let locationCompatibility = 'No location preferences saved; nothing to check.'
  if (prefs) {
    const notes: string[] = []
    if (prefs.regionPreference !== 'any') {
      if (prefs.regionPreference === job.region) notes.push(`${job.region === 'india' ? 'In India' : 'Outside India'}, as you prefer.`)
      else if (job.workMode === 'remote') {
        if (job.remoteEligibility === 'worldwide') notes.push('Remote and open worldwide.')
        else if (job.remoteEligibility === 'unknown') {
          locPoints -= 4
          notes.push('Remote, but the listing does not say which countries it hires from.')
        } else {
          locPoints -= 8
          notes.push(`Remote, limited to ${job.eligibleCountries.join(', ') || 'a specific region'}; outside your preferred region.`)
        }
      } else {
        locPoints -= 10
        notes.push('Outside your preferred region and not remote.')
      }
    }
    if (prefs.workModes.length) {
      if (prefs.workModes.includes(job.workMode)) notes.push(`${job.workMode === 'onsite' ? 'On-site' : job.workMode === 'hybrid' ? 'Hybrid' : 'Remote'} matches your work-mode preference.`)
      else {
        locPoints = Math.max(0, locPoints - 6)
        notes.push(`${job.workMode} is not a work mode you selected.`)
      }
    }
    if (prefs.locations.length && job.locationCity) {
      const hit = prefs.locations.some((l) => l.toLowerCase() === job.locationCity!.toLowerCase())
      if (hit) notes.push(`${job.locationCity} is one of your preferred cities.`)
    }
    locationCompatibility = notes.join(' ') || 'No location preferences saved; nothing to check.'
    if (!prefs.regionPreference || prefs.regionPreference === 'any') if (!prefs.workModes.length && !prefs.locations.length) missingInputs.push('location preferences')
  } else missingInputs.push('location preferences')
  breakdown.push({ key: 'location', label: 'Location & work mode', points: Math.max(0, locPoints), max: WEIGHTS.location, detail: locationCompatibility })

  const score = Math.max(0, Math.min(100, breakdown.reduce((s, c) => s + c.points, 0)))
  const skillsToStrengthen = Array.from(new Set([...reqMissing, ...job.preferredSkills.filter((s) => !has(s))])).map((s) => {
    const t = trackFor(s)
    return t && learningTracks.has(t.track.id) ? `${s} (in progress: ${t.track.title})` : t ? `${s} (learn with ${t.track.title})` : s
  })

  return {
    score,
    breakdown,
    strongAlignment: strong,
    missingRequirements: missing,
    experienceAlignment,
    curriculumAlignment: { covered, learning, notCovered },
    locationCompatibility,
    skillsToStrengthen,
    missingInputs,
  }
}
