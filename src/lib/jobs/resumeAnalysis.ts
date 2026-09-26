import { extractSkills, sameSkill, skillDef } from './skills'
import type { JobDto } from './types'
import type { Evidence, ResumeProfile } from '../resume/extract'
import type { JobCurriculumMap } from './curriculumMap'

/**
 * Resume-vs-job analysis. Every claim is grounded in resume evidence (line
 * numbers + quote) or explicitly marked as absent. Suggestions never propose
 * adding a skill or experience the resume does not already show; when a
 * requirement is missing, the suggestion points at the curriculum instead.
 */

export const ANALYSIS_VERSION = 'evidence-1'

export type Provenance = 'job' | 'resume' | 'curriculum' | 'recommendation'

export interface SkillAlignmentRow {
  skill: string
  requirement: 'required' | 'preferred'
  status: 'demonstrated' | 'weak' | 'missing'
  evidence: Evidence | null
  /** Curriculum track that teaches it, when JobAppy has one. */
  trackIds: string[]
}

export interface Suggestion {
  id: string
  kind: 'section' | 'bullet' | 'keyword' | 'gap' | 'project'
  /** Short title shown in the workspace. */
  title: string
  /** Why this matters, always referencing the job and the resume. */
  why: string
  /** What the learner can do; grounded in existing resume facts. */
  action: string
  provenance: Provenance[]
  evidence: Evidence | null
  /** Curriculum tracks to learn from when the requirement is missing. */
  trackIds: string[]
}

export interface ResumeAnalysisReport {
  version: string
  jobId: string
  resumeId: string
  strongMatches: { skill: string; evidence: Evidence }[]
  missingOrWeak: { skill: string; requirement: 'required' | 'preferred'; status: 'weak' | 'missing'; trackIds: string[] }[]
  skillsAlignment: SkillAlignmentRow[]
  experienceAlignment: { jobMin: number | null; jobMax: number | null; resumeYears: number | null; verdict: string; evidence: Evidence | null }
  projectRelevance: { name: string; matchedSkills: string[]; score: number; evidence: Evidence }[]
  improvements: Suggestion[]
  keywords: { term: string; inResume: boolean; evidence: Evidence | null }[]
  curriculumGaps: { trackId: string; title: string; status: 'covered' | 'learning' | 'not_covered'; skills: string[] }[]
  summary: { demonstrated: number; weak: number; missing: number; requiredTotal: number }
  /** Optional AI reasoning over the deterministic facts (Phase 6.5); null when AI was unavailable or its output failed validation. */
  aiInsights?: { items: string[]; provider: string; requestId: string } | null
}

const ACTION_VERBS = /^(built|designed|developed|led|implemented|migrated|reduced|improved|owned|shipped|created|automated|optimi[sz]ed|delivered|architected|scaled|launched|maintained|integrated|deployed|wrote|tested|refactored|mentored|increased|decreased|cut|drove)\b/i
const HAS_NUMBER = /\d/

function findEvidence(profile: ResumeProfile, skill: string, text: string): { status: 'demonstrated' | 'weak' | 'missing'; evidence: Evidence | null } {
  const hit = profile.skills.find((s) => sameSkill(s.name, skill))
  const inEmployment = profile.employment.find((e) => e.bullets.some((b) => extractSkills(b).some((x) => sameSkill(x, skill))))
  const inProjects = profile.projects.find((p) => p.technologies.some((t) => sameSkill(t, skill)))
  if (inEmployment) {
    const bullet = inEmployment.bullets.find((b) => extractSkills(b).some((x) => sameSkill(x, skill)))!
    return { status: 'demonstrated', evidence: { lines: inEmployment.evidence.lines, quote: bullet.slice(0, 200) } }
  }
  if (inProjects) return { status: 'demonstrated', evidence: inProjects.evidence }
  if (hit) return { status: 'weak', evidence: hit.evidence }
  // Unknown to the lexicon: literal word search in the resume text.
  const def = skillDef(skill)
  if (!def) {
    const lines = text.split('\n')
    const idx = lines.findIndex((l) => l.toLowerCase().includes(skill.toLowerCase()))
    if (idx >= 0) return { status: 'weak', evidence: { lines: [idx + 1], quote: lines[idx].trim().slice(0, 200) } }
  }
  return { status: 'missing', evidence: null }
}

/** Job-description terms worth checking: the job's skills plus lexicon skills found in its text. */
export function jobKeywords(job: JobDto): string[] {
  return Array.from(new Set([...job.requiredSkills, ...job.preferredSkills, ...extractSkills(`${job.title}\n${job.requirementsSummary || ''}\n${job.description}`, 40)]))
}

export function analyzeResumeForJob(job: JobDto, resumeId: string, profile: ResumeProfile, resumeText: string, curriculum: JobCurriculumMap | null): ResumeAnalysisReport {
  const rows: SkillAlignmentRow[] = []
  const consider = (skill: string, requirement: 'required' | 'preferred') => {
    if (rows.some((r) => sameSkill(r.skill, skill))) return
    const found = findEvidence(profile, skill, resumeText)
    rows.push({ skill, requirement, status: found.status, evidence: found.evidence, trackIds: (skillDef(skill)?.trackIds || []).slice(0, 2) })
  }
  for (const s of job.requiredSkills) consider(s, 'required')
  for (const s of job.preferredSkills) consider(s, 'preferred')

  const strongMatches = rows.filter((r) => r.status === 'demonstrated' && r.evidence).map((r) => ({ skill: r.skill, evidence: r.evidence! }))
  const missingOrWeak = rows.filter((r) => r.status !== 'demonstrated').map((r) => ({ skill: r.skill, requirement: r.requirement, status: r.status as 'weak' | 'missing', trackIds: r.trackIds }))

  // Experience.
  const resumeYears = profile.totalExperienceMonths != null ? Math.round((profile.totalExperienceMonths / 12) * 10) / 10 : null
  let verdict: string
  if (resumeYears == null) verdict = 'Your resume has no dated employment entries, so years of experience could not be compared.'
  else if (job.experienceMin == null && job.experienceMax == null) verdict = `The listing does not state years of experience; your resume shows about ${resumeYears} years of dated employment.`
  else if (resumeYears >= (job.experienceMin ?? 0) && (job.experienceMax == null || resumeYears <= job.experienceMax)) verdict = `Your ${resumeYears} years of dated employment sit inside the ${job.experienceMin ?? 0}–${job.experienceMax ?? `${job.experienceMin}+`} year range the listing states.`
  else if (job.experienceMin != null && resumeYears < job.experienceMin) verdict = `The listing asks for ${job.experienceMin}+ years; your resume shows about ${resumeYears}. Internships, freelance work and long-running projects only count if they are dated on the resume.`
  else verdict = `Your resume shows about ${resumeYears} years, above the ${job.experienceMax} year upper range the listing states.`
  const expEvidence = profile.employment.length ? profile.employment[0].evidence : null

  // Projects.
  const jobSkills = Array.from(new Set([...job.requiredSkills, ...job.preferredSkills]))
  const projectRelevance = profile.projects
    .map((p) => {
      const matched = jobSkills.filter((s) => p.technologies.some((t) => sameSkill(t, s)) || p.description.toLowerCase().includes(s.toLowerCase()))
      return { name: p.name, matchedSkills: matched, score: matched.length, evidence: p.evidence }
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)

  // Keywords.
  const keywords = jobKeywords(job).map((term) => {
    const found = findEvidence(profile, term, resumeText)
    return { term, inResume: found.status !== 'missing', evidence: found.evidence }
  })

  // Curriculum gaps (from the Phase 2 map).
  const curriculumGaps = (curriculum?.tracks ?? []).map((t) => ({ trackId: t.track.id, title: t.track.title, status: t.gapStatus, skills: t.skills }))

  // Suggestions.
  const improvements: Suggestion[] = []
  let n = 0
  const id = (kind: string) => `${kind}-${++n}`
  for (const r of rows) {
    if (r.status === 'missing') {
      const tracks = curriculum?.tracks.filter((t) => r.trackIds.includes(t.track.id) || t.skills.some((s) => sameSkill(s, r.skill))) ?? []
      improvements.push({
        id: id('gap'),
        kind: 'gap',
        title: `${r.skill} is not demonstrated`,
        why: `${r.skill} is ${r.requirement === 'required' ? 'a required skill' : 'a preferred skill'} in this job description but is not demonstrated in your current resume.`,
        action: tracks.length
          ? `Do not add ${r.skill} to your resume unless you have used it. JobAppy covers it in ${tracks.map((t) => t.track.title).join(', ')}; you can add ${tracks.length === 1 ? 'that track' : 'those tracks'} to your learning plan.`
          : `Do not add ${r.skill} to your resume unless you have used it. JobAppy has no track for it yet; look for a course or a small project first.`,
        provenance: tracks.length ? ['job', 'resume', 'curriculum'] : ['job', 'resume'],
        evidence: null,
        trackIds: tracks.map((t) => t.track.id),
      })
    } else if (r.status === 'weak') {
      improvements.push({
        id: id('bullet'),
        kind: 'bullet',
        title: `Show ${r.skill} in context`,
        why: `${r.skill} appears in your resume (“${r.evidence?.quote.slice(0, 80)}”) but only as a listed skill, while the job description ${r.requirement === 'required' ? 'requires' : 'prefers'} it.`,
        action: `If you used ${r.skill} in a role or project, add one bullet there saying what you did with it and the outcome. Keep it to work you actually did.`,
        provenance: ['job', 'resume', 'recommendation'],
        evidence: r.evidence,
        trackIds: r.trackIds,
      })
    }
  }
  // Bullet quality: employment bullets without an action verb or any number.
  for (const e of profile.employment) {
    const weakBullets = e.bullets.filter((b) => !ACTION_VERBS.test(b) || !HAS_NUMBER.test(b)).slice(0, 3)
    for (const b of weakBullets) {
      improvements.push({
        id: id('bullet'),
        kind: 'bullet',
        title: `Sharpen a bullet under ${e.title || e.company || 'a role'}`,
        why: `“${b.slice(0, 90)}${b.length > 90 ? '…' : ''}” ${!ACTION_VERBS.test(b) ? 'does not start with what you did' : 'has no measurable outcome'}.`,
        action: !ACTION_VERBS.test(b) ? 'Start with the action you took (built, migrated, reduced…) and keep the rest as it is.' : 'Add the real scale or result if you know it (users, latency, cost, time saved). Leave it out rather than estimate.',
        provenance: ['resume', 'recommendation'],
        evidence: { lines: e.evidence.lines, quote: b.slice(0, 200) },
        trackIds: [],
      })
    }
  }
  if (!profile.sections.some((s) => s.name === 'skills')) {
    improvements.push({ id: id('section'), kind: 'section', title: 'Add a skills section', why: 'The resume has no skills section, so recruiters and parsers cannot see your stack at a glance. This job lists specific skills.', action: `List the technologies you have actually used; from this resume that includes ${profile.skills.slice(0, 6).map((s) => s.name).join(', ') || 'the tools mentioned in your experience'}.`, provenance: ['resume', 'recommendation'], evidence: null, trackIds: [] })
  }
  if (!profile.projects.length) {
    improvements.push({ id: id('section'), kind: 'section', title: 'No projects section', why: 'The job names concrete skills; a projects section is where resumes usually show them in use.', action: 'If you have built anything with the required stack (including course or personal work), describe it with what it does and the technologies used. Skip this if you have not.', provenance: ['resume', 'recommendation'], evidence: null, trackIds: [] })
  }
  for (const p of projectRelevance.slice(0, 2)) {
    improvements.push({ id: id('project'), kind: 'project', title: `Emphasise “${p.name}”`, why: `It uses ${p.matchedSkills.join(', ')}, which this job asks for.`, action: 'Move it near the top of your projects and make sure the bullet names those technologies and the result.', provenance: ['job', 'resume', 'recommendation'], evidence: p.evidence, trackIds: [] })
  }
  const applicableKeywords = keywords.filter((k) => k.inResume && !job.requiredSkills.some((s) => sameSkill(s, k.term)) && !job.preferredSkills.some((s) => sameSkill(s, k.term)))
  if (applicableKeywords.length) {
    improvements.push({ id: id('keyword'), kind: 'keyword', title: 'Terms you share with the job description', why: `The description also mentions ${applicableKeywords.slice(0, 5).map((k) => k.term).join(', ')}, and your resume already shows them.`, action: 'Use the same wording where it is accurate so screening does not miss them. Do not add terms you cannot back up.', provenance: ['job', 'resume'], evidence: applicableKeywords[0].evidence, trackIds: [] })
  }

  return {
    version: ANALYSIS_VERSION,
    jobId: job.id,
    resumeId,
    strongMatches,
    missingOrWeak,
    skillsAlignment: rows,
    experienceAlignment: { jobMin: job.experienceMin, jobMax: job.experienceMax, resumeYears, verdict, evidence: expEvidence },
    projectRelevance,
    improvements,
    keywords,
    curriculumGaps,
    summary: {
      demonstrated: rows.filter((r) => r.status === 'demonstrated').length,
      weak: rows.filter((r) => r.status === 'weak').length,
      missing: rows.filter((r) => r.status === 'missing').length,
      requiredTotal: rows.filter((r) => r.requirement === 'required').length,
    },
  }
}
