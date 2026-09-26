import type { CompatibilityReport } from './compatibility'
import type { JobCurriculumMap } from './curriculumMap'
import type { ResumeAnalysisReport } from './resumeAnalysis'
import { roleCategoryById } from './taxonomy'
import type { JobDto, LearnerJobPreferences } from './types'

/**
 * Application strategy: an actionable plan assembled from facts (job,
 * resume evidence, curriculum progress) and JobAppy recommendations. Each
 * item states where it comes from. It never promises an interview.
 */

export type StrategyProvenance = 'job' | 'resume' | 'curriculum' | 'recommendation'

export interface StrategyItem {
  text: string
  provenance: StrategyProvenance
  /** Optional curriculum track to open. */
  trackId?: string
}

export interface ApplicationStrategy {
  requirementsSummary: StrategyItem[]
  strongestExperience: StrategyItem[]
  importantGaps: StrategyItem[]
  resumeChecklist: StrategyItem[]
  curriculumChecklist: StrategyItem[]
  projectsToEmphasise: StrategyItem[]
  applicationSequence: StrategyItem[]
  interviewPriorities: StrategyItem[]
  followUp: StrategyItem[]
  /** What the strategy could not use because it was not available. */
  missingInputs: string[]
}

export function buildApplicationStrategy(input: {
  job: JobDto
  prefs: LearnerJobPreferences | null
  compatibility: CompatibilityReport | null
  resume: ResumeAnalysisReport | null
  curriculum: JobCurriculumMap | null
}): ApplicationStrategy {
  const { job, prefs, compatibility, resume, curriculum } = input
  const missingInputs: string[] = []
  if (!resume) missingInputs.push('resume analysis')
  if (!compatibility) missingInputs.push('compatibility analysis')
  if (!prefs) missingInputs.push('job preferences')

  const requirementsSummary: StrategyItem[] = []
  requirementsSummary.push({ text: `${roleCategoryById(job.roleCategory)?.label ?? job.roleCategory} role at ${job.company.name}, ${job.level} level, ${job.employmentType.replace('_', '-')}, ${job.workMode}${job.locationCity ? ` in ${job.locationCity}` : ''}.`, provenance: 'job' })
  if (job.requiredSkills.length) requirementsSummary.push({ text: `Required: ${job.requiredSkills.join(', ')}.`, provenance: 'job' })
  if (job.preferredSkills.length) requirementsSummary.push({ text: `Nice to have: ${job.preferredSkills.join(', ')}.`, provenance: 'job' })
  if (job.experienceMin != null || job.experienceMax != null) requirementsSummary.push({ text: `Experience: ${job.experienceMin ?? 0}${job.experienceMax != null ? `–${job.experienceMax}` : '+'} years.`, provenance: 'job' })
  if (job.expiresAt) requirementsSummary.push({ text: `Closes ${new Date(job.expiresAt).toDateString()}.`, provenance: 'job' })

  const strongestExperience: StrategyItem[] = []
  if (resume) {
    for (const m of resume.strongMatches.slice(0, 5)) strongestExperience.push({ text: `${m.skill}: “${m.evidence.quote.slice(0, 110)}${m.evidence.quote.length > 110 ? '…' : ''}”`, provenance: 'resume' })
    if (resume.experienceAlignment.resumeYears != null) strongestExperience.push({ text: resume.experienceAlignment.verdict, provenance: 'resume' })
  } else if (compatibility) {
    for (const s of compatibility.strongAlignment.slice(0, 4)) strongestExperience.push({ text: s, provenance: 'resume' })
  }
  if (!strongestExperience.length) strongestExperience.push({ text: 'Upload a resume and run the resume analysis to see which of your experiences match this listing.', provenance: 'recommendation' })

  const importantGaps: StrategyItem[] = []
  const gapSkills = resume ? resume.missingOrWeak.filter((g) => g.requirement === 'required') : []
  const preferredGaps = resume ? resume.missingOrWeak.filter((g) => g.requirement === 'preferred') : []
  for (const g of gapSkills.slice(0, 5)) importantGaps.push({ text: `${g.skill} (required) is ${g.status === 'missing' ? 'not demonstrated' : 'only listed, not shown in use'} in your resume.`, provenance: 'resume', trackId: g.trackIds[0] })
  for (const g of preferredGaps.slice(0, 3)) importantGaps.push({ text: `${g.skill} (preferred) is ${g.status === 'missing' ? 'not demonstrated' : 'only listed, not shown in use'} in your resume.`, provenance: 'resume', trackId: g.trackIds[0] })
  if (!resume && compatibility) for (const m of compatibility.missingRequirements.slice(0, 5)) importantGaps.push({ text: `${m} is not in your saved profile.`, provenance: 'resume' })
  if (compatibility && /short/.test(compatibility.experienceAlignment)) importantGaps.push({ text: compatibility.experienceAlignment, provenance: 'resume' })
  if (!importantGaps.length) importantGaps.push({ text: resume ? 'Every skill the listing names has evidence in your resume.' : 'Run the analyses to find gaps.', provenance: resume ? 'resume' : 'recommendation' })

  const resumeChecklist: StrategyItem[] = []
  if (resume) {
    for (const s of resume.improvements.filter((i) => i.kind !== 'gap').slice(0, 6)) resumeChecklist.push({ text: `${s.title}: ${s.action}`, provenance: 'recommendation' })
    if (!resumeChecklist.length) resumeChecklist.push({ text: 'No resume changes suggested; make sure the version you send is the one analysed here.', provenance: 'recommendation' })
  } else resumeChecklist.push({ text: 'Run “Analyze resume for this job” to get resume-specific items.', provenance: 'recommendation' })

  const curriculumChecklist: StrategyItem[] = []
  for (const t of curriculum?.tracks ?? []) {
    if (t.gapStatus === 'covered') continue
    curriculumChecklist.push({ text: `${t.gapStatus === 'learning' ? 'Finish' : 'Start'} ${t.track.title}${t.skills.length ? ` (${t.skills.join(', ')})` : ''}.`, provenance: 'curriculum', trackId: t.track.id })
  }
  if (!curriculumChecklist.length) curriculumChecklist.push({ text: curriculum?.tracks.length ? 'Every relevant track is covered; do a quick revision pass before interviews.' : 'No JobAppy track maps to this listing.', provenance: 'curriculum' })

  const projectsToEmphasise: StrategyItem[] = (resume?.projectRelevance ?? []).slice(0, 3).map((p) => ({ text: `${p.name} — uses ${p.matchedSkills.join(', ')}.`, provenance: 'resume' }))
  if (!projectsToEmphasise.length) projectsToEmphasise.push({ text: resume ? 'None of your listed projects uses the skills this job names.' : 'Projects are read from your resume once it is analysed.', provenance: resume ? 'resume' : 'recommendation' })

  const applicationSequence: StrategyItem[] = [
    { text: 'Read the full description on the company page and note anything not captured here.', provenance: 'recommendation' },
    { text: gapSkills.length ? `Decide whether to apply now or after closing the ${gapSkills.length} required gap${gapSkills.length === 1 ? '' : 's'} above; applying with honest gaps is fine when the rest is strong.` : 'Apply now; the requirements are covered.', provenance: 'recommendation' },
    { text: 'Update the resume using the checklist, keeping every claim factual, then export a fresh copy.', provenance: 'recommendation' },
    { text: `Apply through the official link (${new URL(job.applyUrl).hostname}) and add the job to your tracker with the date.`, provenance: 'job' },
    { text: 'Record the version of the resume you sent in the tracker notes.', provenance: 'recommendation' },
  ]

  const interviewPriorities: StrategyItem[] = []
  for (const s of job.requiredSkills.slice(0, 4)) interviewPriorities.push({ text: `Be ready to talk about ${s} in depth${resume?.strongMatches.some((m) => m.skill === s) ? ' using the work already on your resume' : ''}.`, provenance: 'job' })
  if (job.roleCategory === 'backend' || job.roleCategory === 'software-engineer' || job.roleCategory === 'full-stack' || job.roleCategory === 'java' || job.roleCategory === 'nodejs') interviewPriorities.push({ text: 'Revise data structures, algorithms and system design; most engineering loops include them.', provenance: 'curriculum', trackId: 'track-dsa' })
  if (job.roleCategory === 'frontend' || job.roleCategory === 'react-nextjs') interviewPriorities.push({ text: 'Practise a small UI build and performance/accessibility questions.', provenance: 'curriculum', trackId: 'track-react' })
  if (job.roleCategory.startsWith('data') || job.roleCategory === 'ai-ml') interviewPriorities.push({ text: 'Expect SQL and statistics questions alongside your projects.', provenance: 'curriculum', trackId: 'track-sql' })
  if (job.roleCategory === 'devops-cloud') interviewPriorities.push({ text: 'Expect scenario questions on incidents, CI/CD and infrastructure as code.', provenance: 'curriculum', trackId: 'track-devops' })
  interviewPriorities.push({ text: 'Prepare two stories from your resume that show ownership and a measurable outcome.', provenance: 'recommendation' })

  const followUp: StrategyItem[] = [
    { text: 'If there is no reply after 7–10 days, one polite follow-up to the recruiter or hiring manager is reasonable.', provenance: 'recommendation' },
    { text: 'Keep the tracker status current (Applied → Under review → Interview) so follow-ups are timed from real dates.', provenance: 'recommendation' },
    { text: 'Following this plan improves how well your application reflects your experience; it does not guarantee an interview or shortlist.', provenance: 'recommendation' },
  ]

  return { requirementsSummary, strongestExperience, importantGaps, resumeChecklist, curriculumChecklist, projectsToEmphasise, applicationSequence, interviewPriorities, followUp, missingInputs }
}
