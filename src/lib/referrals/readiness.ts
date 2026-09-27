import type { JobDto } from '../jobs/types'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import type { ResumeProfile } from '../resume/extract'

/**
 * Referral readiness: a factual review of what a referrer will see, built
 * only from data JobAppy already holds (job, resume profile, resume-vs-job
 * analysis, curriculum gaps, preparation, tracker). It never estimates a
 * hiring chance and never suggests adding skills the learner does not have.
 */

export type ReadinessStatus = 'READY' | 'NEEDS_IMPROVEMENT' | 'BLOCKED'
export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface ReadinessCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
}

export interface ReadinessReport {
  version: 1
  status: ReadinessStatus
  checkedAt: string
  checks: ReadinessCheck[]
  /** Required skills the resume shows no evidence for. */
  missingEvidence: string[]
  /** Required skills the resume names without showing them in use. */
  weakEvidence: string[]
  /** Curriculum tracks the learner has not started that the job relies on. */
  curriculumGaps: string[]
  nextSteps: string[]
  summary: string
}

export interface ReadinessInput {
  job: Pick<JobDto, 'status' | 'expiresAt' | 'requiredSkills' | 'preferredSkills' | 'title'> | null
  profile: ResumeProfile | null
  analysis: ResumeAnalysisReport | null
  /** Curriculum tracks the job maps to that the learner has not covered (titles). */
  curriculumGaps?: string[]
  /** Whether the learner has any preparation progress for this job (informational). */
  preparationStarted?: boolean
  /** Another open referral request exists for this job. */
  duplicateRequest?: boolean
  /** The tracker already shows an application for this job (matters when the company restricts already-applied candidates). */
  alreadyApplied?: boolean
  alreadyAppliedRestricted?: boolean
  consentGiven?: boolean
  now?: Date
}

const PASS = (id: string, label: string, detail: string): ReadinessCheck => ({ id, label, status: 'pass', detail })
const WARN = (id: string, label: string, detail: string): ReadinessCheck => ({ id, label, status: 'warn', detail })
const FAIL = (id: string, label: string, detail: string): ReadinessCheck => ({ id, label, status: 'fail', detail })

export function evaluateReadiness(input: ReadinessInput): ReadinessReport {
  const now = input.now ?? new Date()
  const checks: ReadinessCheck[] = []
  const nextSteps: string[] = []
  let blocked = false

  // Structural checks: these block a request outright.
  const job = input.job
  const jobActive = Boolean(job && job.status === 'published' && (!job.expiresAt || new Date(job.expiresAt) > now))
  if (jobActive) checks.push(PASS('job', 'Opening is live', 'The job is published and has not expired.'))
  else {
    checks.push(FAIL('job', 'Opening is live', job ? 'This opening is no longer open; a referrer cannot refer into a closed requisition.' : 'The opening could not be found.'))
    blocked = true
  }
  if (input.duplicateRequest) {
    checks.push(FAIL('duplicate', 'No open request for this job', 'You already have an open referral request for this job. Wait for it to finish or cancel it first.'))
    blocked = true
  } else checks.push(PASS('duplicate', 'No open request for this job', 'This is your only request for this opening.'))
  if (input.alreadyApplied && input.alreadyAppliedRestricted) {
    checks.push(FAIL('applied', 'Not already applied', 'Your tracker shows an application for this job and this company does not accept referrals for candidates who already applied.'))
    blocked = true
  } else if (input.alreadyApplied) checks.push(WARN('applied', 'Not already applied', 'Your tracker shows an application for this job; the referrer will be told so they can check the company rule.'))
  else checks.push(PASS('applied', 'Not already applied', 'No application for this job in your tracker.'))

  // Resume and profile.
  const profile = input.profile
  if (!profile) {
    checks.push(FAIL('resume', 'Resume uploaded', 'Upload a resume under Resume so the referrer has something to review.'))
    nextSteps.push('Upload your current resume.')
  } else {
    checks.push(PASS('resume', 'Resume uploaded', 'A readable resume is on file.'))
    const hasName = Boolean(profile.name)
    const hasWork = profile.employment.length > 0 || profile.projects.length > 0
    const hasSkills = profile.skills.length >= 3 || profile.technologies.length >= 3
    const missing = [!hasName && 'your name', !hasWork && 'work experience or projects', !hasSkills && 'a skills section'].filter(Boolean) as string[]
    if (!missing.length) checks.push(PASS('profile', 'Profile complete', 'Name, experience and skills were read from the resume.'))
    else {
      checks.push(FAIL('profile', 'Profile complete', `The resume is missing ${missing.join(', ')}.`))
      nextSteps.push(`Add ${missing.join(', ')} to the resume and upload it again.`)
    }
  }

  // Evidence for the job's requirements, from the deterministic resume-vs-job analysis.
  const analysis = input.analysis
  let missingEvidence: string[] = []
  let weakEvidence: string[] = []
  if (!analysis) {
    if (profile) {
      checks.push(FAIL('evidence', 'Resume evidence for the requirements', 'Run the resume comparison on this job (Resume tab) so the requirements can be checked against your resume.'))
      nextSteps.push('Open the Resume tab and compare your resume with this opening.')
    }
  } else {
    const required = analysis.skillsAlignment.filter((r) => r.requirement === 'required')
    missingEvidence = required.filter((r) => r.status === 'missing').map((r) => r.skill)
    weakEvidence = required.filter((r) => r.status === 'weak').map((r) => r.skill)
    const demonstrated = required.filter((r) => r.status === 'demonstrated').length
    const total = required.length
    const ratio = total ? demonstrated / total : 1
    const detail = total ? `${demonstrated} of ${total} required skills are shown in use in your resume.` : 'The listing names no specific required skills.'
    if (total && ratio < 0.5) {
      checks.push(FAIL('evidence', 'Resume evidence for the requirements', detail))
      if (missingEvidence.length) nextSteps.push(`If you have used ${missingEvidence.slice(0, 4).join(', ')}, add the concrete work to the resume; if not, this role may not be the right target yet.`)
    } else if (missingEvidence.length || weakEvidence.length) {
      checks.push(WARN('evidence', 'Resume evidence for the requirements', detail))
      if (weakEvidence.length) nextSteps.push(`Show ${weakEvidence.slice(0, 3).join(', ')} in a bullet with what you built, not just in the skills list.`)
    } else checks.push(PASS('evidence', 'Resume evidence for the requirements', detail))
  }

  // Curriculum and preparation are informational unless the gap list is long.
  const gaps = input.curriculumGaps ?? []
  if (gaps.length >= 3) {
    checks.push(WARN('curriculum', 'Curriculum coverage', `Not started yet: ${gaps.slice(0, 4).join(', ')}. A referrer may ask about these in a screen.`))
    nextSteps.push(`Start the ${gaps[0]} track before the interview stage.`)
  } else if (gaps.length) checks.push(WARN('curriculum', 'Curriculum coverage', `Not started yet: ${gaps.join(', ')}.`))
  else checks.push(PASS('curriculum', 'Curriculum coverage', 'The tracks this job relies on are covered or in progress.'))
  checks.push(input.preparationStarted ? PASS('preparation', 'Preparation', 'You have started preparing for this job.') : WARN('preparation', 'Preparation', 'Preparation for this job has not started; it is not required for a request, but referrers notice prepared candidates.'))

  if (input.consentGiven === false) checks.push(WARN('consent', 'Consent', 'You will be asked to consent to sharing your approved resume and introduction with a matched referrer.'))

  const fails = checks.filter((c) => c.status === 'fail')
  const status: ReadinessStatus = blocked ? 'BLOCKED' : fails.length ? 'NEEDS_IMPROVEMENT' : 'READY'
  const summary =
    status === 'READY'
      ? 'Ready for referrer review. A verified referrer will see your resume, introduction and this readiness summary.'
      : status === 'BLOCKED'
        ? fails.map((f) => f.detail).join(' ')
        : `Needs improvement before review: ${fails.map((f) => f.label.toLowerCase()).join(', ')}.`
  return { version: 1, status, checkedAt: now.toISOString(), checks, missingEvidence, weakEvidence, curriculumGaps: gaps, nextSteps, summary }
}
