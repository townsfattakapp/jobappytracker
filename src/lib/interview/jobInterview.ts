import { getCurriculum } from '../curriculum/registry'
import { resolveTopic, type PrepBlueprint, type PrepItem, type TopicPointer } from '../jobs/prepare'
import type { ResumeAnalysisReport } from '../jobs/resumeAnalysis'
import { sameSkill } from '../jobs/skills'
import type { JobDto } from '../jobs/types'
import type { ResumeProfile } from '../resume/extract'

/**
 * Job-specific mock interview engine (Phase 6).
 *
 * Deterministic and evidence-grounded: every question carries its
 * provenance (curriculum quiz bank, job requirement, resume project or
 * generated role practice) and the concepts a strong answer covers. The
 * interviewer reacts to each answer with rule-based follow-ups (clarify,
 * example, trade-off, probe a missed concept, challenge, simplify) inside a
 * per-question and per-section budget. The report is computed from the
 * stored evidence only, so it can never claim something the learner did not
 * say, and weaknesses map back to canonical curriculum topics.
 *
 * Nothing here calls an AI provider. Generated prompts are labelled
 * "Recommended practice based on this role"; they are never presented as a
 * company's real interview questions.
 */

export const INTERVIEW_VERSION = 'jobiv-1'
export const PRACTICE_LABEL = 'Recommended practice based on this role'

export type InterviewMode = 'full' | 'weak_areas' | 'section' | 'missed_concepts' | 'preview'
export type Focus = 'balanced' | 'technical' | 'coding' | 'design' | 'behavioral' | 'resume'
export type Difficulty = 'foundational' | 'standard' | 'advanced'
export type TechnicalDepth = 'overview' | 'standard' | 'deep'
export type SectionId = 'intro' | 'resume' | 'fundamentals' | 'technical' | 'coding' | 'design' | 'behavioral' | 'wrapup'
export type QuestionKind = 'intro' | 'resume' | 'technical' | 'coding' | 'design' | 'behavioral' | 'wrapup'
export type QuestionProvenance = 'curriculum' | 'job' | 'resume' | 'generated'
export type FollowUpIntent = 'clarify' | 'example' | 'tradeoff' | 'probe_missing' | 'challenge' | 'simplify'
export type AnswerQuality = 'none' | 'thin' | 'partial' | 'solid' | 'strong'

export const INTERVIEW_DURATIONS = [15, 20, 30, 45, 60] as const
export const FOCUS_OPTIONS: { id: Focus; label: string }[] = [
  { id: 'balanced', label: 'Balanced (as derived from the job)' },
  { id: 'technical', label: 'Technical depth' },
  { id: 'coding', label: 'Coding / DSA' },
  { id: 'design', label: 'System design' },
  { id: 'behavioral', label: 'Behavioural' },
  { id: 'resume', label: 'Resume and projects' },
]
export const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'foundational', label: 'Foundational', hint: 'Entry level: definitions, basic usage, one example' },
  { id: 'standard', label: 'Standard', hint: 'Mid level: trade-offs, production use, follow-ups' },
  { id: 'advanced', label: 'Advanced', hint: 'Senior level: scale, failure modes, deeper probing' },
]
export const DEPTHS: { id: TechnicalDepth; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep dive' },
]
export const PROVENANCE_LABEL: Record<QuestionProvenance, string> = { curriculum: 'Curriculum', job: 'Job requirement', resume: 'Resume project', generated: 'Generated role practice' }
export const SECTION_TITLES: Record<SectionId, string> = {
  intro: 'Introduction',
  resume: 'Resume and project discussion',
  fundamentals: 'Role fundamentals',
  technical: 'Technical deep dive',
  coding: 'Coding / DSA',
  design: 'System design',
  behavioral: 'Behavioural',
  wrapup: 'Candidate questions and wrap-up',
}

export interface InterviewConfig {
  minutes: number
  focus: Focus
  difficulty: Difficulty
  includeCoding: boolean
  includeDesign: boolean
  includeBehavioral: boolean
  technicalDepth: TechnicalDepth
}

export interface JobSnapshot {
  id: string
  title: string
  companyName: string
  level: JobDto['level']
  roleCategory: string
  requiredSkills: string[]
  preferredSkills: string[]
  descriptionExcerpt: string
  status: string
}

export interface ContextItem {
  title: string
  kind: PrepItem['kind']
  status: PrepItem['status']
  ref: TopicPointer | null
  skill: string | null
}

export interface InterviewContext {
  version: string
  job: JobSnapshot
  experienceYears: number | null
  resume: {
    projects: { name: string; technologies: string[]; description: string }[]
    employment: { title: string | null; company: string | null; bullets: string[] }[]
    skills: string[]
  } | null
  evidence: { demonstrated: string[]; weak: string[]; missing: string[] }
  compatibility: { score: number; strongAlignment: string[]; missingRequirements: string[] } | null
  blueprint: {
    available: boolean
    dsaDepth: PrepBlueprint['dsa']['depth']
    designDepth: PrepBlueprint['systemDesign']['depth']
    must: ContextItem[]
    revise: ContextItem[]
    strong: ContextItem[]
    fundamentals: ContextItem[]
    dsa: ContextItem[]
    design: ContextItem[]
    behavioral: { title: string; reason: string; fromResume: boolean }[]
  }
  progress: Record<string, 'done' | 'started' | 'none'>
  gaps: string[]
  missingInputs: string[]
}

export interface InterviewQuestion {
  id: string
  /** Stable key used to avoid repeating the same question across attempts. */
  key: string
  sectionId: SectionId
  kind: QuestionKind
  prompt: string
  provenance: QuestionProvenance
  /** Human-readable origin, e.g. the resume line or topic the question came from. */
  sourceNote: string
  expectedConcepts: string[]
  ref: TopicPointer | null
  area: string
  minutes: number
  maxFollowUps: number
  tool: 'text' | 'code' | 'diagram'
  language?: string
  skippable: boolean
  /** Concept names an interviewer may probe first (missed concepts from a previous attempt). */
  focusConcepts?: string[]
}

export interface InterviewSection {
  id: SectionId
  title: string
  minutes: number
  questionIds: string[]
}

export interface InterviewPlan {
  version: string
  sections: InterviewSection[]
  questions: InterviewQuestion[]
  plannedMinutes: number
  seed: number
  label: string
}

export interface AnswerEvidence {
  words: number
  conceptsHit: string[]
  conceptsMissed: string[]
  hasExample: boolean
  hasTradeoff: boolean
  hasStructure: boolean
  hasComplexity: boolean
  hasEdgeCases: boolean
  hasDryRun: boolean
  hasCode: boolean
  hasDiagram: boolean
  gaveUp: boolean
  quality: AnswerQuality
}

export interface TurnRecord {
  id: string
  questionId: string
  role: 'candidate' | 'interviewer'
  kind: 'answer' | 'skip' | 'follow_up' | 'follow_up_answer'
  text: string
  code?: string | null
  language?: string | null
  diagram?: string | null
  intent?: FollowUpIntent
  evidence?: AnswerEvidence
  at: string
  /** Follow-ups: true when the wording was rephrased by the AI gateway; the deterministic wording is kept alongside. */
  aiRefined?: boolean
  deterministicText?: string
}

export interface SessionState {
  index: number
  followUps: Record<string, number>
  intents: Record<string, FollowUpIntent[]>
}

export interface FollowUp {
  intent: FollowUpIntent
  prompt: string
}

export interface SessionEntitlements {
  adaptive: boolean
  detailed: boolean
  curriculumMapping: boolean
  preview: boolean
}

export interface QuestionFeedback {
  questionId: string
  prompt: string
  provenance: QuestionProvenance
  sectionId: SectionId
  sectionTitle: string
  area: string
  answer: string
  skipped: boolean
  followUps: { prompt: string; answer: string }[]
  evidence: string[]
  strength: string | null
  weakness: string | null
  betterApproach: string
  conceptsHit: string[]
  conceptsMissed: string[]
  ref: TopicPointer | null
  quality: AnswerQuality
}

export interface Weakness {
  id: string
  title: string
  concepts: string[]
  ref: TopicPointer | null
  questionIds: string[]
  severity: 'missed' | 'weak'
  area: string
}

export interface AreaMetric {
  area: string
  sectionId: SectionId
  demonstrated: number
  total: number
}

export type Rating = 'strong' | 'adequate' | 'weak' | 'not_observed'

export interface InterviewReport {
  version: string
  summary: string
  strongAreas: string[]
  needsImprovement: string[]
  missedConcepts: { concept: string; area: string; ref: TopicPointer | null }[]
  communication: { clarity: Rating; structure: Rating; reasoning: Rating; note: string }
  coding: { approach: Rating; correctness: Rating; complexity: Rating; edgeCases: Rating; note: string } | null
  systemDesign: { requirements: Rating; architecture: Rating; tradeoffs: Rating; scalability: Rating; reliability: Rating; note: string } | null
  behavioral: { examples: Rating; completeness: Rating; note: string } | null
  questions: QuestionFeedback[]
  weaknesses: Weakness[]
  metrics: AreaMetric[]
  sectionsCompleted: string[]
  sectionsTotal: number
  questionsAnswered: number
  questionsTotal: number
  followUpsAsked: number
  detailed: boolean
  /** Optional AI coaching note written from the evidence above (Phase 6.5). */
  aiSummary?: { text: string; provider: string; requestId: string } | null
}

export interface AttemptComparison {
  rows: { area: string; before: string; after: string; change: 'improved' | 'same' | 'worse' | 'new' }[]
  areasImproved: string[]
  areasStillWeak: string[]
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ENGINEERING_ROLES = new Set(['software-engineer', 'backend', 'frontend', 'full-stack', 'java', 'nodejs', 'react-nextjs', 'mobile'])

const toItem = (i: PrepItem): ContextItem => ({ title: i.title, kind: i.kind, status: i.status, ref: i.ref, skill: i.kind === 'skill' ? i.title.replace(/ \(preferred\)$/, '') : null })

export function buildInterviewContext(input: {
  job: JobDto
  blueprint: PrepBlueprint | null
  profile: ResumeProfile | null
  analysis: ResumeAnalysisReport | null
  compatibility: { score: number; strongAlignment: string[]; missingRequirements: string[] } | null
  progress: Record<string, 'done' | 'started' | 'none'>
}): InterviewContext {
  const { job, blueprint, profile, analysis } = input
  const missingInputs: string[] = []
  if (!profile) missingInputs.push('resume')
  if (!analysis) missingInputs.push('resume analysis')
  if (!blueprint) missingInputs.push('preparation blueprint')
  if (!input.compatibility) missingInputs.push('compatibility analysis')
  const demonstrated = analysis ? analysis.skillsAlignment.filter((r) => r.status === 'demonstrated').map((r) => r.skill) : []
  const weak = analysis ? analysis.skillsAlignment.filter((r) => r.status === 'weak').map((r) => r.skill) : []
  const missing = analysis ? analysis.skillsAlignment.filter((r) => r.status === 'missing').map((r) => r.skill) : []
  const years = profile?.totalExperienceMonths != null ? Math.round((profile.totalExperienceMonths / 12) * 10) / 10 : null
  const mentionsDesign = /\b(system design|distributed|scalab|architecture|high availability|microservices)\b/i.test(`${job.description} ${job.requiredSkills.join(' ')}`)
  const fallbackDsa: PrepBlueprint['dsa']['depth'] = !ENGINEERING_ROLES.has(job.roleCategory) ? 'none' : job.level === 'intern' || job.level === 'entry' ? 'core' : job.level === 'mid' ? 'standard' : 'advanced'
  const fallbackDesign: PrepBlueprint['systemDesign']['depth'] = job.level === 'lead' ? 'senior' : job.level === 'senior' ? 'standard' : job.level === 'mid' ? (mentionsDesign ? 'standard' : 'basics') : mentionsDesign ? 'basics' : 'none'
  return {
    version: INTERVIEW_VERSION,
    job: {
      id: job.id,
      title: job.title,
      companyName: job.company?.name ?? '',
      level: job.level,
      roleCategory: job.roleCategory,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      descriptionExcerpt: job.description.slice(0, 600),
      status: job.status,
    },
    experienceYears: years,
    resume: profile
      ? {
          projects: profile.projects.slice(0, 6).map((p) => ({ name: p.name, technologies: p.technologies, description: p.description.slice(0, 240) })),
          employment: profile.employment.slice(0, 6).map((e) => ({ title: e.title, company: e.company, bullets: e.bullets.slice(0, 8) })),
          skills: profile.skills.map((s) => s.name),
        }
      : null,
    evidence: { demonstrated, weak, missing },
    compatibility: input.compatibility,
    blueprint: {
      available: Boolean(blueprint),
      dsaDepth: blueprint?.dsa.depth ?? fallbackDsa,
      designDepth: blueprint?.systemDesign.depth ?? (ENGINEERING_ROLES.has(job.roleCategory) || job.roleCategory === 'devops-cloud' || job.roleCategory === 'data-engineer' ? fallbackDesign : mentionsDesign ? 'basics' : 'none'),
      must: (blueprint?.mustPrepare ?? []).map(toItem),
      revise: (blueprint?.revise ?? []).map(toItem),
      strong: (blueprint?.alreadyStrong ?? []).map(toItem),
      fundamentals: (blueprint?.csFundamentals ?? []).map(toItem),
      dsa: (blueprint?.dsa.items ?? []).map(toItem),
      design: (blueprint?.systemDesign.items ?? []).map(toItem),
      behavioral: (blueprint?.behavioral ?? []).map((b) => ({ title: b.title, reason: b.reason, fromResume: b.provenance.includes('resume') })),
    },
    progress: input.progress,
    gaps: Array.from(new Set([...missing, ...(blueprint?.mustPrepare ?? []).map((i) => i.title.replace(/ \(preferred\)$/, ''))])),
    missingInputs,
  }
}

// ---------------------------------------------------------------------------
// Derived configuration
// ---------------------------------------------------------------------------

export interface DerivedConfig {
  config: InterviewConfig
  rationale: string[]
  codingRelevant: boolean
  designRelevant: boolean
  sections: { id: SectionId; title: string; included: boolean; why: string }[]
}

export function deriveInterviewConfig(context: InterviewContext, opts: { allowCoding?: boolean; allowDesign?: boolean; maxMinutes?: number } = {}): DerivedConfig {
  const { job, blueprint } = context
  const rationale: string[] = []
  const difficulty: Difficulty = job.level === 'intern' || job.level === 'entry' ? 'foundational' : job.level === 'mid' ? 'standard' : 'advanced'
  rationale.push(`${DIFFICULTIES.find((d) => d.id === difficulty)!.label} difficulty from the ${job.level}-level listing.`)
  const technicalDepth: TechnicalDepth = difficulty === 'foundational' ? 'overview' : difficulty === 'standard' ? 'standard' : 'deep'
  const codingRelevant = blueprint.dsaDepth !== 'none'
  const designRelevant = blueprint.designDepth !== 'none'
  const includeCoding = codingRelevant && opts.allowCoding !== false
  const includeDesign = designRelevant && opts.allowDesign !== false
  rationale.push(codingRelevant ? `Coding round included at ${blueprint.dsaDepth} depth (${job.roleCategory} role).` : `No coding round: DSA-style problems are not typical for ${job.roleCategory} roles.`)
  rationale.push(designRelevant ? `System design at ${blueprint.designDepth} depth for a ${job.level}-level role.` : `No system-design section for a ${job.level}-level ${job.roleCategory} role.`)
  if (codingRelevant && opts.allowCoding === false) rationale.push('Coding section is not included in your plan.')
  if (designRelevant && opts.allowDesign === false) rationale.push('System-design section is not included in your plan.')
  let minutes = includeCoding && includeDesign ? 45 : includeCoding || includeDesign ? 30 : 30
  if (difficulty === 'foundational' && !includeCoding) minutes = 20
  if (opts.maxMinutes && minutes > opts.maxMinutes) minutes = (INTERVIEW_DURATIONS as readonly number[]).filter((d) => d <= opts.maxMinutes!).pop() ?? 15
  const config: InterviewConfig = { minutes, focus: 'balanced', difficulty, includeCoding, includeDesign, includeBehavioral: true, technicalDepth }
  const sections: DerivedConfig['sections'] = [
    { id: 'intro', title: SECTION_TITLES.intro, included: true, why: 'Short opening.' },
    { id: 'resume', title: SECTION_TITLES.resume, included: Boolean(context.resume && (context.resume.projects.length || context.resume.employment.some((e) => e.bullets.length))), why: context.resume ? 'Questions come only from projects and bullets in your resume.' : 'Upload a resume to add project questions.' },
    { id: 'fundamentals', title: SECTION_TITLES.fundamentals, included: true, why: `Fundamentals interviewers expect for ${job.roleCategory} roles.` },
    { id: 'technical', title: SECTION_TITLES.technical, included: true, why: 'Skills the listing names, weighted towards your gaps.' },
    { id: 'coding', title: SECTION_TITLES.coding, included: includeCoding, why: rationale[1] },
    { id: 'design', title: SECTION_TITLES.design, included: includeDesign, why: rationale[2] },
    { id: 'behavioral', title: SECTION_TITLES.behavioral, included: true, why: 'Ownership, collaboration, debugging, failure, impact.' },
    { id: 'wrapup', title: SECTION_TITLES.wrapup, included: true, why: 'Your questions for the interviewer.' },
  ]
  return { config, rationale, codingRelevant, designRelevant, sections }
}

export function normalizeConfig(raw: unknown, derived: DerivedConfig, opts: { allowCoding: boolean; allowDesign: boolean; maxMinutes: number }): InterviewConfig {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const base = derived.config
  const minutesRaw = Number(b.minutes)
  const allowed = (INTERVIEW_DURATIONS as readonly number[]).filter((d) => d <= Math.max(15, opts.maxMinutes))
  const minutes = allowed.includes(minutesRaw) ? minutesRaw : Math.min(base.minutes, allowed[allowed.length - 1] ?? 15)
  const focus = FOCUS_OPTIONS.some((f) => f.id === b.focus) ? (b.focus as Focus) : base.focus
  const difficulty = DIFFICULTIES.some((d) => d.id === b.difficulty) ? (b.difficulty as Difficulty) : base.difficulty
  const technicalDepth = DEPTHS.some((d) => d.id === b.technicalDepth) ? (b.technicalDepth as TechnicalDepth) : base.technicalDepth
  const includeCoding = typeof b.includeCoding === 'boolean' ? b.includeCoding && derived.codingRelevant && opts.allowCoding : base.includeCoding && opts.allowCoding
  const includeDesign = typeof b.includeDesign === 'boolean' ? b.includeDesign && derived.designRelevant && opts.allowDesign : base.includeDesign && opts.allowDesign
  const includeBehavioral = typeof b.includeBehavioral === 'boolean' ? b.includeBehavioral : base.includeBehavioral
  return { minutes, focus, difficulty, includeCoding, includeDesign, includeBehavioral, technicalDepth }
}

// ---------------------------------------------------------------------------
// Question sources
// ---------------------------------------------------------------------------

const STOP = new Set(['the', 'and', 'that', 'with', 'from', 'this', 'when', 'what', 'which', 'your', 'have', 'into', 'than', 'then', 'they', 'them', 'their', 'there', 'about', 'because', 'between', 'while', 'where', 'would', 'could', 'should', 'each', 'other', 'also', 'used', 'using', 'uses', 'use', 'like', 'such', 'more', 'most', 'some', 'only', 'very', 'over', 'under', 'after', 'before', 'through', 'being', 'been', 'does', 'done', 'make', 'makes', 'made', 'need', 'needs', 'these', 'those', 'will', 'must', 'many', 'much', 'well', 'just', 'both', 'same', 'different', 'example', 'means', 'value', 'values', 'data', 'time', 'way', 'system', 'systems', 'application', 'applications', 'code', 'method', 'methods', 'function', 'functions', 'object', 'objects', 'class', 'classes', 'type', 'types', 'number', 'numbers', 'result', 'results', 'thing', 'things', 'part', 'parts', 'case', 'cases', 'allows', 'allow', 'provides', 'provide', 'ensures', 'ensure', 'instead', 'without', 'within', 'across', 'every', 'often', 'usually', 'always', 'never', 'still', 'again'])

const tokens = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(Boolean)

/** Key terms from a reference answer: distinct, meaningful words in order of appearance. */
export function keyTerms(text: string, limit = 6): string[] {
  const out: string[] = []
  for (const t of tokens(text)) {
    if (t.length < 4 || STOP.has(t) || /^\d+$/.test(t)) continue
    if (out.some((o) => o === t || (o.length > 4 && t.startsWith(o.slice(0, 5))))) continue
    out.push(t)
    if (out.length >= limit) break
  }
  return out
}

const stem = (t: string) => t.replace(/(ies)$/, 'i').replace(/(ing|ed|es|s)$/, '')

function conceptHit(concept: string, answerTokens: Set<string>, answerText: string): boolean {
  const c = concept.toLowerCase().trim()
  if (!c) return false
  if (answerText.includes(c)) return true
  const parts = tokens(c).filter((p) => !STOP.has(p))
  if (!parts.length) return false
  const significant = parts.filter((p) => p.length >= 4)
  const check = (p: string) => {
    if (answerTokens.has(p)) return true
    if (p.length < 4) return false
    const s = stem(p)
    for (const a of answerTokens) if (a.length >= 4 && (a.startsWith(s) || s.startsWith(stem(a)) && stem(a).length >= 5)) return true
    return false
  }
  if (significant.length) return significant.some(check)
  return parts.some((p) => answerTokens.has(p))
}

interface Candidate {
  key: string
  prompt: string
  provenance: QuestionProvenance
  sourceNote: string
  expectedConcepts: string[]
  ref: TopicPointer | null
  area: string
  tool?: 'text' | 'code' | 'diagram'
  language?: string
}

function topicConcepts(ref: TopicPointer): string[] {
  const t = getCurriculum().byId.get(ref.topicId)?.topic
  if (!t) return [ref.topicTitle]
  const subs = (t.subtopics || []).map((s) => s.title).filter(Boolean).slice(0, 6)
  return subs.length ? subs : [ref.topicTitle]
}

/** Curriculum questions for a topic: quiz questions with key terms from their reference answers, then generated topic prompts. */
function topicCandidates(item: ContextItem, depth: TechnicalDepth, difficulty: Difficulty): Candidate[] {
  const out: Candidate[] = []
  const ref = item.ref
  const label = item.skill ?? item.title
  if (ref) {
    const topic = getCurriculum().byId.get(ref.topicId)?.topic
    const quiz = topic?.quiz ?? []
    quiz.slice(0, 4).forEach((q, i) => {
      const concepts = keyTerms(q.answer, difficulty === 'foundational' ? 4 : 6)
      out.push({ key: `curriculum:${ref.topicId}:${i}`, prompt: q.question, provenance: 'curriculum', sourceNote: `${ref.trackTitle} → ${ref.topicTitle} (quiz question)`, expectedConcepts: concepts.length ? concepts : topicConcepts(ref).slice(0, 4), ref, area: ref.topicTitle })
    })
    const concepts = topicConcepts(ref)
    out.push({ key: `topic:${ref.topicId}:explain`, prompt: depth === 'overview' ? `Explain ${ref.topicTitle} in your own words and describe one place you have used it.` : `Walk me through ${ref.topicTitle}: how it works, where you have used it, and one mistake people make with it.`, provenance: item.skill ? 'job' : 'generated', sourceNote: item.skill ? `The listing names ${label}; mapped to ${ref.trackTitle} → ${ref.topicTitle}` : `${PRACTICE_LABEL}: ${ref.trackTitle} → ${ref.topicTitle}`, expectedConcepts: concepts.slice(0, depth === 'overview' ? 3 : 5), ref, area: ref.topicTitle })
    if (depth !== 'overview') out.push({ key: `topic:${ref.topicId}:scale`, prompt: `What goes wrong with ${ref.topicTitle} under load or at scale, and how would you detect and handle it?`, provenance: 'generated', sourceNote: `${PRACTICE_LABEL}: ${ref.trackTitle} → ${ref.topicTitle}`, expectedConcepts: [...concepts.slice(0, 3), 'monitoring', 'failure handling'], ref, area: ref.topicTitle })
  } else if (item.skill) {
    out.push({ key: `job:${item.skill.toLowerCase()}:usage`, prompt: `The listing requires ${item.skill}. Describe how you have used ${item.skill} and what problems it solved for you.`, provenance: 'job', sourceNote: `Required skill in the listing: ${item.skill}`, expectedConcepts: [item.skill, 'problem', 'design decision', 'result'], ref: null, area: item.skill })
    if (depth !== 'overview') out.push({ key: `job:${item.skill.toLowerCase()}:tradeoff`, prompt: `When would you not use ${item.skill}? Compare it with an alternative you know.`, provenance: 'job', sourceNote: `Required skill in the listing: ${item.skill}`, expectedConcepts: [item.skill, 'alternative', 'trade-off', 'cost'], ref: null, area: item.skill })
  }
  return out
}

const CODING_BANK: { match: RegExp; key: string; prompt: string; concepts: string[]; tier: Difficulty }[] = [
  { match: /array|hash|two pointer|prefix/i, key: 'two-sum', prompt: 'Given an array of integers and a target, return the indices of two numbers that add up to the target. Explain your approach before coding, then code it, then state complexity and edge cases.', concepts: ['hash map', 'single pass', 'time complexity', 'edge cases', 'dry run'], tier: 'foundational' },
  { match: /string|sliding|window/i, key: 'longest-unique-substring', prompt: 'Find the length of the longest substring without repeating characters. Explain the approach, code it, and analyse complexity.', concepts: ['sliding window', 'set', 'time complexity', 'edge cases', 'dry run'], tier: 'standard' },
  { match: /sort|interval|greedy/i, key: 'merge-intervals', prompt: 'Merge all overlapping intervals in a list. Explain the approach, code it, and analyse complexity.', concepts: ['sorting', 'merge', 'time complexity', 'edge cases', 'dry run'], tier: 'standard' },
  { match: /recursion|backtrack|subset/i, key: 'subsets', prompt: 'Generate all subsets of a set of distinct integers. Explain the recursion, code it, and analyse complexity.', concepts: ['recursion', 'backtracking', 'time complexity', 'edge cases', 'dry run'], tier: 'foundational' },
  { match: /tree|binary|bst/i, key: 'level-order', prompt: 'Return the level-order traversal of a binary tree as a list of levels. Explain, code, and analyse complexity.', concepts: ['queue', 'breadth-first', 'time complexity', 'edge cases', 'dry run'], tier: 'standard' },
  { match: /graph|bfs|dfs/i, key: 'islands', prompt: 'Count the number of islands in a grid of land and water cells. Explain, code, and analyse complexity.', concepts: ['depth-first', 'visited', 'time complexity', 'edge cases', 'dry run'], tier: 'standard' },
  { match: /dynamic|dp|memo/i, key: 'coin-change', prompt: 'Given coin denominations and an amount, return the fewest coins needed (or -1). Explain the recurrence, code it, and analyse complexity.', concepts: ['recurrence', 'memoization', 'time complexity', 'edge cases', 'dry run'], tier: 'advanced' },
  { match: /heap|priority|top k|frequent/i, key: 'top-k-frequent', prompt: 'Return the k most frequent elements of an array. Explain, code, and analyse complexity.', concepts: ['heap', 'frequency map', 'time complexity', 'edge cases', 'dry run'], tier: 'standard' },
  { match: /trie|prefix tree/i, key: 'trie-prefix', prompt: 'Implement a trie with insert and startsWith. Explain, code, and analyse complexity.', concepts: ['trie node', 'prefix', 'time complexity', 'edge cases', 'dry run'], tier: 'advanced' },
  { match: /linked list|stack|queue/i, key: 'valid-parentheses', prompt: 'Check whether a string of brackets is balanced. Explain, code, and analyse complexity.', concepts: ['stack', 'matching', 'time complexity', 'edge cases', 'dry run'], tier: 'foundational' },
]

const TIER_ORDER: Difficulty[] = ['foundational', 'standard', 'advanced']

function codingCandidates(context: InterviewContext, difficulty: Difficulty, language: string): Candidate[] {
  const items = context.blueprint.dsa.length ? context.blueprint.dsa : []
  const out: Candidate[] = []
  const tierIndex = TIER_ORDER.indexOf(difficulty)
  const push = (bank: (typeof CODING_BANK)[number], ref: TopicPointer | null, area: string) => {
    if (out.some((c) => c.key === `coding:${bank.key}`)) return
    out.push({ key: `coding:${bank.key}`, prompt: bank.prompt, provenance: 'generated', sourceNote: `${PRACTICE_LABEL}: ${ref ? `${ref.trackTitle} → ${ref.topicTitle}` : 'DSA practice'}`, expectedConcepts: bank.concepts, ref, area, tool: 'code', language })
  }
  for (const item of items) {
    const hay = `${item.title} ${item.ref?.topicTitle ?? ''}`
    for (const bank of CODING_BANK) if (bank.match.test(hay) && Math.abs(TIER_ORDER.indexOf(bank.tier) - tierIndex) <= 1) push(bank, item.ref, item.ref?.topicTitle ?? item.title)
  }
  if (!out.length) {
    const ref = resolveTopic(difficulty === 'foundational' ? 'arrays' : difficulty === 'standard' ? 'trees' : 'dynamic programming', ['track-dsa'])
    for (const bank of CODING_BANK) if (bank.tier === difficulty) push(bank, ref, ref?.topicTitle ?? 'Coding')
  }
  return out
}

function designCandidates(context: InterviewContext): Candidate[] {
  const depth = context.blueprint.designDepth
  const domain = /payment|ledger|billing/i.test(context.job.descriptionExcerpt) ? 'a payments service' : /chat|messag/i.test(context.job.descriptionExcerpt) ? 'a chat service' : /feed|social/i.test(context.job.descriptionExcerpt) ? 'a news feed' : /search/i.test(context.job.descriptionExcerpt) ? 'a search feature' : /e-?commerce|order|cart|inventory/i.test(context.job.descriptionExcerpt) ? 'an order-management service' : 'a notification service'
  const ref = context.blueprint.design[0]?.ref ?? resolveTopic(depth === 'basics' ? 'scalability basics' : 'system design', ['track-hld', 'track-distributed-systems'])
  const note = `${PRACTICE_LABEL}: ${depth} depth${ref ? `; ${ref.trackTitle} → ${ref.topicTitle}` : ''}`
  if (depth === 'basics') {
    return [
      { key: 'design:basics:api', prompt: `Design the API and main components for ${domain} used by the ${context.job.title} team. Cover the endpoints, the data model, how components talk to each other, and how errors are handled. Sketch it if it helps.`, provenance: 'generated', sourceNote: note, expectedConcepts: ['requirements', 'api', 'data model', 'components', 'error handling'], ref, area: 'System design', tool: 'diagram' },
      { key: 'design:basics:interaction', prompt: `Describe how a request flows through ${domain}: client, service, database and any cache. Where would you add validation and logging?`, provenance: 'generated', sourceNote: note, expectedConcepts: ['request flow', 'validation', 'database', 'cache', 'logging'], ref, area: 'System design', tool: 'diagram' },
    ]
  }
  if (depth === 'standard') {
    return [
      { key: 'design:standard:service', prompt: `Design ${domain} for tens of thousands of users. Cover requirements, service boundaries, database choice, caching, reliability and the trade-offs you are making.`, provenance: 'generated', sourceNote: note, expectedConcepts: ['requirements', 'service boundaries', 'database choice', 'caching', 'load balancing', 'failure handling', 'trade-off'], ref, area: 'System design', tool: 'diagram' },
      { key: 'design:standard:async', prompt: `Part of ${domain} must process work asynchronously. Design the queueing, retries and idempotency, and explain what happens when a consumer crashes mid-task.`, provenance: 'generated', sourceNote: note, expectedConcepts: ['queue', 'retry', 'idempotency', 'dead letter', 'monitoring', 'trade-off'], ref, area: 'System design', tool: 'diagram' },
    ]
  }
  return [
    { key: 'design:senior:scale', prompt: `Design ${domain} at large scale across regions. Cover capacity, consistency model, replication, caching, observability and how the system degrades under partial failure.`, provenance: 'generated', sourceNote: note, expectedConcepts: ['capacity', 'consistency', 'replication', 'sharding', 'caching', 'observability', 'failure handling', 'trade-off'], ref, area: 'System design', tool: 'diagram' },
    { key: 'design:senior:migration', prompt: `${domain[0].toUpperCase()}${domain.slice(1)} must move from a single database to a sharded setup without downtime. Design the migration and the rollback plan, and discuss consistency during the cut-over.`, provenance: 'generated', sourceNote: note, expectedConcepts: ['dual write', 'backfill', 'consistency', 'rollback', 'monitoring', 'trade-off'], ref, area: 'System design', tool: 'diagram' },
  ]
}

const BEHAVIORAL_PROMPTS: Record<string, { key: string; prompt: string }[]> = {
  ownership: [
    { key: 'own-1', prompt: 'Tell me about something you owned end to end. What did owning it mean in practice, and what was the result?' },
    { key: 'own-2', prompt: 'Describe a time you took responsibility for a problem that was not strictly yours. What did you do and how did it end?' },
  ],
  collaboration: [
    { key: 'col-1', prompt: 'Tell me about working with someone outside your role (product, QA, another team) to get something shipped. What did you do specifically?' },
    { key: 'col-2', prompt: 'Describe a time you had to get agreement from people with different priorities. How did you approach it, and what happened?' },
  ],
  debugging: [
    { key: 'dbg-1', prompt: 'Walk me through a production problem you debugged: the symptom, how you narrowed it down, the fix and what you changed to prevent it.' },
    { key: 'dbg-2', prompt: 'Tell me about a bug that was hard to reproduce. How did you find it, and what did you learn?' },
  ],
  disagreement: [
    { key: 'dis-1', prompt: 'Tell me about a technical disagreement with a teammate or reviewer. How did you resolve it, and what was the outcome?' },
    { key: 'dis-2', prompt: 'Describe a time you were asked to do something you thought was wrong. What did you do?' },
  ],
  failure: [
    { key: 'fail-1', prompt: 'Tell me about a failure you were responsible for. What happened, what did you do afterwards, and what changed?' },
    { key: 'fail-2', prompt: 'Describe an estimate or plan of yours that turned out badly wrong. How did you handle it?' },
  ],
  prioritization: [
    { key: 'pri-1', prompt: 'Tell me about a time you had more work than time. How did you decide what to do first, and what did you drop?' },
    { key: 'pri-2', prompt: 'Describe a situation where you had to balance speed against quality. What did you choose and why?' },
  ],
  learning: [
    { key: 'lrn-1', prompt: 'Tell me about a technology or skill you had to learn quickly for a task. How did you go about it, and how did it turn out?' },
    { key: 'lrn-2', prompt: 'Describe feedback you received that changed how you work.' },
  ],
  impact: [
    { key: 'imp-1', prompt: 'What is the piece of work you are proudest of? What was your specific contribution and what was the measurable result?' },
    { key: 'imp-2', prompt: 'Tell me about a change you made that had an effect beyond your own tasks.' },
  ],
}
const BEHAVIORAL_CONCEPTS = ['situation', 'your action', 'result', 'reflection']
const AREA_FOR_BEHAVIORAL: { re: RegExp; area: string }[] = [
  { re: /ownership/i, area: 'ownership' },
  { re: /team|communication|collaborat/i, area: 'collaboration' },
  { re: /debug|production/i, area: 'debugging' },
  { re: /disagree|conflict/i, area: 'disagreement' },
  { re: /fail|learning/i, area: 'failure' },
  { re: /priorit/i, area: 'prioritization' },
  { re: /impact|result/i, area: 'impact' },
  { re: /decision|trade/i, area: 'prioritization' },
]

function behavioralCandidates(context: InterviewContext): Candidate[] {
  const out: Candidate[] = []
  const areas = new Set<string>()
  for (const b of context.blueprint.behavioral) {
    const area = AREA_FOR_BEHAVIORAL.find((a) => a.re.test(b.title))?.area
    if (!area || areas.has(area)) continue
    areas.add(area)
    const quote = b.fromResume && context.resume ? /“([^”]+)”/.exec(b.reason)?.[1] ?? null : null
    for (const p of BEHAVIORAL_PROMPTS[area] ?? []) out.push({ key: `behavioral:${p.key}`, prompt: quote ? `${p.prompt} (Your resume mentions “${quote.slice(0, 80)}${quote.length > 80 ? '…' : ''}”; feel free to use it.)` : p.prompt, provenance: quote ? 'resume' : 'generated', sourceNote: quote ? `Grounded in your resume: “${quote.slice(0, 80)}”` : `${PRACTICE_LABEL}: ${area}`, expectedConcepts: BEHAVIORAL_CONCEPTS, ref: null, area: `Behavioural: ${area}` })
  }
  for (const area of ['ownership', 'collaboration', 'debugging', 'disagreement', 'failure', 'prioritization', 'learning', 'impact']) {
    if (areas.has(area)) continue
    for (const p of BEHAVIORAL_PROMPTS[area]) out.push({ key: `behavioral:${p.key}`, prompt: p.prompt, provenance: 'generated', sourceNote: `${PRACTICE_LABEL}: ${area}`, expectedConcepts: BEHAVIORAL_CONCEPTS, ref: null, area: `Behavioural: ${area}` })
  }
  return out
}

function resumeCandidates(context: InterviewContext): Candidate[] {
  const out: Candidate[] = []
  const r = context.resume
  if (!r) return out
  for (const p of r.projects) {
    const tech = p.technologies.slice(0, 3)
    const techText = tech.length ? tech.join(', ') : 'the stack you chose'
    out.push({ key: `resume:project:${p.name}:why`, prompt: `You listed ${p.name} on your resume. Why did you choose ${techText}, and what alternative did you consider?`, provenance: 'resume', sourceNote: `Resume project: ${p.name}${p.description ? ` (“${p.description.slice(0, 80)}”)` : ''}`, expectedConcepts: [...tech, 'decision', 'alternative', 'trade-off'], ref: null, area: `Project: ${p.name}` })
    out.push({ key: `resume:project:${p.name}:problem`, prompt: `In ${p.name}, what was the hardest problem you ran into, and how did you solve it?`, provenance: 'resume', sourceNote: `Resume project: ${p.name}`, expectedConcepts: [...tech.slice(0, 2), 'problem', 'root cause', 'fix'], ref: null, area: `Project: ${p.name}` })
    out.push({ key: `resume:project:${p.name}:redesign`, prompt: `If you rebuilt ${p.name} today, what would you redesign and why?`, provenance: 'resume', sourceNote: `Resume project: ${p.name}`, expectedConcepts: [...tech.slice(0, 2), 'redesign', 'trade-off', 'lesson'], ref: null, area: `Project: ${p.name}` })
  }
  for (const e of r.employment) {
    const who = e.title || e.company || 'your role'
    for (const b of e.bullets) {
      if (/\b(incident|on-call|outage|debug|fixed|bug|latency|root cause)\b/i.test(b)) out.push({ key: `resume:bullet:${b.slice(0, 40)}`, prompt: `Your resume says “${b.slice(0, 120)}” (${who}). Walk me through one concrete case: the symptom, how you found the cause, and what you changed afterwards.`, provenance: 'resume', sourceNote: `Resume bullet (${who}): “${b.slice(0, 100)}”`, expectedConcepts: ['symptom', 'root cause', 'fix', 'prevention'], ref: null, area: `Experience: ${who}` })
      else if (/\b(built|designed|migrat|implemented|maintained|owned|led)\b/i.test(b) && /\d/.test(b)) out.push({ key: `resume:bullet:${b.slice(0, 40)}`, prompt: `Your resume says “${b.slice(0, 120)}” (${who}). What design decisions did that involve, and how do you know the numbers you quote?`, provenance: 'resume', sourceNote: `Resume bullet (${who}): “${b.slice(0, 100)}”`, expectedConcepts: ['design decision', 'measurement', 'trade-off', 'result'], ref: null, area: `Experience: ${who}` })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export interface ComposeOptions {
  mode: InterviewMode
  seed: number
  /** Question keys asked in earlier attempts; skipped when an alternative exists. */
  excludeKeys?: string[]
  /** For weak_areas / missed_concepts: areas and concepts from the parent report. */
  focusAreas?: string[]
  focusConcepts?: string[]
  focusRefs?: TopicPointer[]
  /** For mode 'section'. */
  sectionId?: SectionId
  entitlements: SessionEntitlements
  /** Editor language for coding questions. */
  language?: string
}

const QUESTION_MINUTES: Record<QuestionKind, number> = { intro: 2, resume: 4, technical: 4, coding: 12, design: 10, behavioral: 4, wrapup: 1 }

function rotate<T extends { key: string }>(list: T[], seed: number, exclude: Set<string>): T[] {
  if (!list.length) return list
  const fresh = list.filter((c) => !exclude.has(c.key))
  const base = fresh.length ? fresh : list
  const offset = seed % base.length
  return [...base.slice(offset), ...base.slice(0, offset)]
}

export function composeInterview(context: InterviewContext, config: InterviewConfig, opts: ComposeOptions): InterviewPlan {
  const exclude = new Set(opts.excludeKeys ?? [])
  const maxFollowUps = !opts.entitlements.adaptive || opts.mode === 'preview' ? 0 : config.difficulty === 'advanced' ? 2 : 1
  let n = 0
  const questions: InterviewQuestion[] = []
  const sections: InterviewSection[] = []
  const language = opts.language ?? 'javascript'
  const depth = config.technicalDepth
  const toQuestion = (c: Candidate, sectionId: SectionId, kind: QuestionKind, extra: Partial<InterviewQuestion> = {}): InterviewQuestion => ({
    id: `q${++n}`,
    key: c.key,
    sectionId,
    kind,
    prompt: c.prompt,
    provenance: c.provenance,
    sourceNote: c.sourceNote,
    expectedConcepts: c.expectedConcepts,
    ref: c.ref,
    area: c.area,
    minutes: kind === 'coding' && config.difficulty === 'advanced' ? 15 : kind === 'design' && context.blueprint.designDepth === 'senior' ? 15 : QUESTION_MINUTES[kind],
    maxFollowUps: kind === 'intro' || kind === 'wrapup' ? 0 : maxFollowUps,
    tool: c.tool ?? 'text',
    language: c.language,
    skippable: kind !== 'intro',
    ...extra,
  })
  const addSection = (id: SectionId, qs: InterviewQuestion[]) => {
    if (!qs.length) return
    questions.push(...qs)
    sections.push({ id, title: SECTION_TITLES[id], minutes: qs.reduce((s, q) => s + q.minutes, 0), questionIds: qs.map((q) => q.id) })
  }

  // Candidate pools.
  const techItems = [...context.blueprint.must, ...context.blueprint.revise, ...context.blueprint.strong].filter((i) => i.kind === 'skill')
  const fallbackTech: ContextItem[] = techItems.length ? [] : [...context.job.requiredSkills, ...context.job.preferredSkills].map((s) => ({ title: s, kind: 'skill', status: 'must', ref: resolveTopic(s, []), skill: s }))
  const technicalPool = [...techItems, ...fallbackTech].flatMap((i) => topicCandidates(i, depth, config.difficulty).map((c) => ({ ...c, gap: i.status === 'must' || context.gaps.some((g) => sameSkill(g, i.skill ?? i.title)) })))
  // Gaps first, then revise, then strong; keep the order stable before rotation.
  technicalPool.sort((a, b) => Number(b.gap) - Number(a.gap))
  const fundamentalsPool = context.blueprint.fundamentals.flatMap((i) => topicCandidates(i, depth, config.difficulty))
  const resumePool = resumeCandidates(context)
  const behavioralPool = behavioralCandidates(context)
  const codingPool = config.includeCoding ? codingCandidates(context, config.difficulty, language) : []
  const designPool = config.includeDesign ? designCandidates(context) : []

  const intro: Candidate = { key: 'intro', prompt: `Tell me briefly about your background and what draws you to this ${context.job.title} role${context.job.companyName ? ` at ${context.job.companyName}` : ''}.`, provenance: 'generated', sourceNote: 'Opening', expectedConcepts: [], ref: null, area: 'Introduction' }
  const wrapup: Candidate = { key: 'wrapup', prompt: 'That is all from my side. What questions do you have for me, and is there anything you would like to add about your answers?', provenance: 'generated', sourceNote: 'Wrap-up', expectedConcepts: [], ref: null, area: 'Wrap-up' }

  const focused = (pool: (Candidate & { gap?: boolean })[]) => {
    if (opts.mode === 'weak_areas' && (opts.focusAreas?.length || opts.focusRefs?.length)) {
      const areas = new Set(opts.focusAreas ?? [])
      const refs = new Set((opts.focusRefs ?? []).map((r) => r.topicId))
      const hit = pool.filter((c) => areas.has(c.area) || (c.ref && refs.has(c.ref.topicId)))
      return hit.length ? hit : pool
    }
    if (opts.mode === 'missed_concepts' && opts.focusConcepts?.length) {
      const wanted = opts.focusConcepts.map((c) => c.toLowerCase())
      const hit = pool.filter((c) => c.expectedConcepts.some((e) => wanted.includes(e.toLowerCase())))
      return hit.length ? hit : pool
    }
    return pool
  }

  // Preview: three questions, no follow-ups, no coding/design.
  if (opts.mode === 'preview') {
    const first = rotate(resumePool, opts.seed, exclude)[0]
    const tech = rotate(focused(technicalPool), opts.seed, exclude)[0]
    const beh = rotate(behavioralPool, opts.seed, exclude)[0]
    if (first) addSection('resume', [toQuestion(first, 'resume', 'resume', { maxFollowUps: 0 })])
    else addSection('intro', [toQuestion(intro, 'intro', 'intro')])
    if (tech) addSection('technical', [toQuestion(tech, 'technical', 'technical', { maxFollowUps: 0 })])
    if (beh) addSection('behavioral', [toQuestion(beh, 'behavioral', 'behavioral', { maxFollowUps: 0 })])
    return { version: INTERVIEW_VERSION, sections, questions, plannedMinutes: questions.reduce((s, q) => s + q.minutes, 0), seed: opts.seed, label: 'Preview interview' }
  }

  // Missed-concept drills: one question per missed concept when a candidate covers it, plus explicit concept prompts.
  if (opts.mode === 'missed_concepts' && opts.focusConcepts?.length) {
    const qs: InterviewQuestion[] = []
    const pools = [...technicalPool, ...fundamentalsPool, ...codingPool, ...designPool]
    for (const concept of opts.focusConcepts.slice(0, 8)) {
      const hit = rotate(pools.filter((c) => c.expectedConcepts.some((e) => e.toLowerCase() === concept.toLowerCase())), opts.seed, exclude)[0]
      const ref = hit?.ref ?? opts.focusRefs?.[0] ?? null
      const c: Candidate = hit && !exclude.has(hit.key) ? hit : { key: `concept:${concept.toLowerCase()}`, prompt: `Explain ${concept}${ref ? ` in the context of ${ref.topicTitle}` : ''}: what it is, when it matters, and one concrete example of using it.`, provenance: ref ? 'curriculum' : 'generated', sourceNote: ref ? `${ref.trackTitle} → ${ref.topicTitle}` : `${PRACTICE_LABEL}: missed concept from your last attempt`, expectedConcepts: [concept, 'example', 'when it matters'], ref, area: ref?.topicTitle ?? concept }
      qs.push(toQuestion(c, c.tool === 'code' ? 'coding' : c.tool === 'diagram' ? 'design' : 'technical', c.tool === 'code' ? 'coding' : c.tool === 'diagram' ? 'design' : 'technical', { focusConcepts: [concept] }))
    }
    addSection('technical', qs)
    return { version: INTERVIEW_VERSION, sections, questions, plannedMinutes: questions.reduce((s, q) => s + q.minutes, 0), seed: opts.seed, label: 'Missed concepts drill' }
  }

  // Single section re-attempt.
  if (opts.mode === 'section' && opts.sectionId) {
    const id = opts.sectionId
    const budget = config.minutes
    const pool = id === 'resume' ? resumePool : id === 'fundamentals' ? fundamentalsPool : id === 'technical' ? technicalPool : id === 'coding' ? codingPool : id === 'design' ? designPool : id === 'behavioral' ? behavioralPool : []
    const kind: QuestionKind = id === 'fundamentals' ? 'technical' : id === 'intro' ? 'intro' : id === 'wrapup' ? 'wrapup' : (id as QuestionKind)
    const qs: InterviewQuestion[] = []
    let used = 0
    for (const c of rotate(pool, opts.seed, exclude)) {
      const q = toQuestion(c, id, kind)
      if (used + q.minutes > budget && qs.length) break
      qs.push(q)
      used += q.minutes
      if (qs.length >= 8) break
    }
    addSection(id, qs)
    return { version: INTERVIEW_VERSION, sections, questions, plannedMinutes: used, seed: opts.seed, label: `${SECTION_TITLES[id]} only` }
  }

  // Full (or weak-areas) interview: fixed opening and closing, expensive rounds first, the rest shared by focus weights.
  const budget = config.minutes
  const fixedMinutes = QUESTION_MINUTES.intro + QUESTION_MINUTES.wrapup
  const codingQ = config.includeCoding ? rotate(codingPool, opts.seed, exclude).slice(0, 1).map((c) => toQuestion(c, 'coding', 'coding')) : []
  const designQ = config.includeDesign ? rotate(designPool, opts.seed, exclude).slice(0, 1).map((c) => toQuestion(c, 'design', 'design')) : []
  const heavy = [...codingQ, ...designQ].reduce((s, q) => s + q.minutes, 0)
  let remaining = Math.max(0, budget - fixedMinutes - heavy)
  const weights: Record<'resume' | 'fundamentals' | 'technical' | 'behavioral', number> = { resume: 0.2, fundamentals: 0.15, technical: 0.4, behavioral: config.includeBehavioral ? 0.25 : 0 }
  if (config.focus === 'technical') Object.assign(weights, { resume: 0.1, fundamentals: 0.2, technical: 0.55, behavioral: config.includeBehavioral ? 0.15 : 0 })
  if (config.focus === 'behavioral') Object.assign(weights, { resume: 0.2, fundamentals: 0.1, technical: 0.2, behavioral: 0.5 })
  if (config.focus === 'resume') Object.assign(weights, { resume: 0.5, fundamentals: 0.1, technical: 0.25, behavioral: config.includeBehavioral ? 0.15 : 0 })
  if (config.focus === 'coding' || config.focus === 'design') Object.assign(weights, { resume: 0.1, fundamentals: 0.15, technical: 0.5, behavioral: config.includeBehavioral ? 0.25 : 0 })
  if (opts.mode === 'weak_areas') Object.assign(weights, { resume: 0.05, fundamentals: 0.25, technical: 0.6, behavioral: 0.1 })
  if (!resumePool.length) {
    weights.technical += weights.resume
    weights.resume = 0
  }
  if (!fundamentalsPool.length) {
    weights.technical += weights.fundamentals
    weights.fundamentals = 0
  }
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1
  const pick = (pool: Candidate[], kind: QuestionKind, sectionId: SectionId, minutesAvail: number, min = 0): InterviewQuestion[] => {
    const out: InterviewQuestion[] = []
    let used = 0
    for (const c of rotate(pool, opts.seed, exclude)) {
      const q = toQuestion(c, sectionId, kind)
      if (used + q.minutes > minutesAvail && out.length >= min) break
      if (out.some((o) => o.area === q.area && kind !== 'behavioral' && kind !== 'technical')) continue
      out.push(q)
      used += q.minutes
      if (out.length >= 6) break
    }
    return out
  }
  const minutesFor = (k: keyof typeof weights) => Math.round((remaining * weights[k]) / total)
  const resumeQ = weights.resume ? pick(resumePool, 'resume', 'resume', Math.max(QUESTION_MINUTES.resume, minutesFor('resume')), 1) : []
  const fundamentalsQ = weights.fundamentals ? pick(fundamentalsPool, 'technical', 'fundamentals', Math.max(QUESTION_MINUTES.technical, minutesFor('fundamentals')), 1) : []
  const technicalQ = pick(focused(technicalPool), 'technical', 'technical', Math.max(QUESTION_MINUTES.technical, minutesFor('technical')), 1)
  const behavioralQ = config.includeBehavioral ? pick(behavioralPool, 'behavioral', 'behavioral', Math.max(QUESTION_MINUTES.behavioral, minutesFor('behavioral')), 1) : []
  remaining = 0

  addSection('intro', [toQuestion(intro, 'intro', 'intro')])
  addSection('resume', resumeQ)
  addSection('fundamentals', fundamentalsQ)
  addSection('technical', technicalQ)
  addSection('coding', codingQ)
  addSection('design', designQ)
  addSection('behavioral', behavioralQ)
  addSection('wrapup', [toQuestion(wrapup, 'wrapup', 'wrapup')])
  return { version: INTERVIEW_VERSION, sections, questions, plannedMinutes: questions.reduce((s, q) => s + q.minutes, 0), seed: opts.seed, label: opts.mode === 'weak_areas' ? 'Weak areas re-attempt' : 'Full interview' }
}

// ---------------------------------------------------------------------------
// Answer analysis and follow-ups
// ---------------------------------------------------------------------------

const RE = {
  gaveUp: /\b(i (do not|don't|dont) know|not sure|no idea|never (used|heard)|can't answer|cannot answer|skip this|pass on this)\b/i,
  example: /\b(for example|for instance|e\.g\.|in my (project|team|role|last|previous|current)|at my (last|previous|current)|we (built|used|had|ran|shipped|migrated|chose)|i (built|used|wrote|implemented|led|owned|fixed|migrated|designed|set up|debugged|added|chose)|when i|one time|in production)\b/i,
  tradeoff: /\b(trade-?offs?|however|but\b|instead|versus|vs\.?|at the cost|downside|drawback|whereas|on the other hand|depends on|the cost of|slower|faster but|simpler but|more complex)\b/i,
  situation: /\b(when|while|during|at the time|the situation|context|we had|there was|my team|the project|last (year|month|quarter))\b/i,
  action: /\b(i|we) (decided|built|did|took|led|started|wrote|proposed|owned|fixed|changed|talked|asked|set up|introduced|paired|reviewed|measured|split|pushed|escalated|investigated|refactored|added|removed|organi[sz]ed)\b/i,
  result: /\b(result|outcome|as a result|improved|reduced|increased|led to|so that|shipped|delivered|cut|saved|went from|\d+\s?%|\d+x|faster|slower|fewer|more reliable|no longer)\b/i,
  reflection: /\b(learn(ed|t)|lesson|next time|in hindsight|would (do|have done) differently|looking back|takeaway|i realised|i realized|since then)\b/i,
  complexity: /\bo\s*\(|\b(time|space) complexity|\b(linear|logarithmic|quadratic|constant|log n|n log n|amortized)\b/i,
  edge: /\b(edge cases?|empty|null|negative|overflow|duplicates?|boundary|single element|large input|invalid input|zero|unicode|cycle|disconnected)\b/i,
  dryRun: /\b(for input|for the input|for example input|walk(ing)? through|dry[- ]run|trace|step by step|returns?|output would|would return|gives)\b/i,
}

export function analyzeAnswer(question: InterviewQuestion, answer: { text: string; code?: string | null; diagram?: string | null }): AnswerEvidence {
  const text = (answer.text || '').trim()
  const code = (answer.code || '').trim()
  const diagram = (answer.diagram || '').trim()
  const hay = `${text}\n${code}\n${diagram}`.toLowerCase()
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0
  const answerTokens = new Set(tokens(hay))
  const gaveUp = RE.gaveUp.test(text) && words < 40
  const hasExample = RE.example.test(text)
  const hasTradeoff = RE.tradeoff.test(text)
  const situation = RE.situation.test(text)
  const action = RE.action.test(text)
  const result = RE.result.test(text)
  const reflection = RE.reflection.test(text)
  const hasStructure = situation && action && result
  const hasComplexity = RE.complexity.test(hay)
  const hasEdgeCases = RE.edge.test(hay)
  const hasDryRun = RE.dryRun.test(text)
  const hasCode = code.length > 20 || /```/.test(text)
  const hasDiagram = diagram.length > 20 && !/^flowchart LR\s+Client --> LB\[Load balancer\]/.test(diagram)
  const conceptsHit: string[] = []
  const conceptsMissed: string[] = []
  for (const c of question.expectedConcepts) {
    let hit = conceptHit(c, answerTokens, hay)
    if (!hit && question.kind === 'behavioral') hit = (c === 'situation' && situation) || (c === 'your action' && action) || (c === 'result' && result) || (c === 'reflection' && reflection)
    if (!hit && question.kind === 'coding') hit = (c === 'time complexity' && hasComplexity) || (c === 'edge cases' && hasEdgeCases) || (c === 'dry run' && hasDryRun)
    if (!hit && (c === 'trade-off' || c === 'alternative') && hasTradeoff) hit = true
    if (!hit && c === 'example' && hasExample) hit = true
    ;(hit ? conceptsHit : conceptsMissed).push(c)
  }
  const expected = question.expectedConcepts.length
  const ratio = expected ? conceptsHit.length / expected : words >= 40 ? 0.6 : words >= 15 ? 0.3 : 0
  let quality: AnswerQuality
  if (!text && !hasCode && !hasDiagram) quality = 'none'
  else if (gaveUp || (words < 15 && !hasCode && !hasDiagram)) quality = 'thin'
  else if (ratio >= 0.75 && (words >= 60 || hasCode || hasDiagram) && (question.kind === 'behavioral' ? hasStructure : question.kind === 'coding' ? hasCode : true)) quality = 'strong'
  else if (ratio >= 0.5) quality = 'solid'
  else if (ratio > 0 || words >= 40) quality = 'partial'
  else quality = 'thin'
  return { words, conceptsHit, conceptsMissed, hasExample, hasTradeoff, hasStructure, hasComplexity, hasEdgeCases, hasDryRun, hasCode, hasDiagram, gaveUp, quality }
}

export function mergeEvidence(list: AnswerEvidence[]): AnswerEvidence | null {
  if (!list.length) return null
  const first = list[0]
  const merged: AnswerEvidence = { ...first, conceptsHit: [], conceptsMissed: [] }
  const hits = new Set<string>()
  for (const e of list) {
    for (const c of e.conceptsHit) hits.add(c)
    merged.words += e === first ? 0 : e.words
    for (const k of ['hasExample', 'hasTradeoff', 'hasStructure', 'hasComplexity', 'hasEdgeCases', 'hasDryRun', 'hasCode', 'hasDiagram'] as const) merged[k] = merged[k] || e[k]
  }
  merged.conceptsHit = Array.from(hits)
  merged.conceptsMissed = Array.from(new Set(list.flatMap((e) => e.conceptsMissed))).filter((c) => !hits.has(c))
  const order: AnswerQuality[] = ['none', 'thin', 'partial', 'solid', 'strong']
  merged.quality = list.reduce((best, e) => (order.indexOf(e.quality) > order.indexOf(best) ? e.quality : best), 'none' as AnswerQuality)
  merged.gaveUp = list.every((e) => e.gaveUp)
  return merged
}

/** The interviewer's reaction to an answer; null moves on to the next question. */
export function decideFollowUp(question: InterviewQuestion, evidence: AnswerEvidence, asked: FollowUpIntent[], adaptive: boolean): FollowUp | null {
  if (!adaptive || asked.length >= question.maxFollowUps || question.kind === 'intro' || question.kind === 'wrapup') return null
  const has = (i: FollowUpIntent) => asked.includes(i)
  const missed = evidence.conceptsMissed.filter((c) => !['example', 'when it matters', 'dry run'].includes(c))
  if (evidence.gaveUp && !has('simplify')) {
    const c = missed[0] ?? question.area
    return { intent: 'simplify', prompt: `No problem, let's simplify. Forget the full answer: how would you explain ${c} to a teammate in two sentences, and where does it show up in practice?` }
  }
  if ((evidence.quality === 'thin' || evidence.quality === 'none') && !has('clarify')) return { intent: 'clarify', prompt: 'Could you go one level deeper? Start with what you would do first and why, then what you would look at next.' }
  if (question.kind === 'coding') {
    if (!evidence.hasComplexity && !has('probe_missing')) return { intent: 'probe_missing', prompt: 'What is the time and space complexity of your approach, and could it be better?' }
    if (!evidence.hasEdgeCases && !has('challenge')) return { intent: 'challenge', prompt: 'Which inputs would break this? Think about empty input, duplicates and very large sizes, and say how your code handles each.' }
    if (evidence.quality === 'strong' && !has('tradeoff')) return { intent: 'tradeoff', prompt: 'If the input did not fit in memory, what would change in your approach?' }
    return null
  }
  if (question.kind === 'design') {
    if (missed.length && !has('probe_missing')) return { intent: 'probe_missing', prompt: `You covered ${evidence.conceptsHit.slice(0, 2).join(' and ') || 'the outline'}. Where does ${missed[0]} fit into this design?` }
    if (!evidence.hasTradeoff && !has('tradeoff')) return { intent: 'tradeoff', prompt: 'What is the main trade-off in that choice, and when would you choose the alternative?' }
    if (evidence.quality === 'strong' && !has('challenge')) return { intent: 'challenge', prompt: 'What breaks first at ten times the load, and how would you know before users do?' }
    return null
  }
  if (question.kind === 'behavioral' || question.kind === 'resume') {
    if (!evidence.hasExample && !has('example')) return { intent: 'example', prompt: 'Can you give one concrete example from your own work, with what you did specifically?' }
    if (question.kind === 'behavioral' && !evidence.hasStructure && !has('probe_missing')) {
      const gap = !RE.result.test('') && evidence.conceptsMissed.includes('result') ? 'What was the outcome, in concrete terms?' : evidence.conceptsMissed.includes('your action') ? 'What did you personally do, as opposed to the team?' : 'What was the situation before you got involved?'
      return { intent: 'probe_missing', prompt: gap }
    }
    if (question.kind === 'resume' && missed.length && !has('probe_missing')) {
      const meta: Record<string, string> = { decision: 'What was the key decision you made there, and what was the alternative you rejected?', alternative: 'What alternative did you consider, and why did you not take it?', 'trade-off': 'What did that choice cost you: what got worse so something else could get better?', problem: 'What was the hardest problem in it, and how did you get past it?', 'root cause': 'How did you find the root cause, step by step?', fix: 'What exactly was the fix, and how did you verify it?', redesign: 'If you rebuilt it today, what would you change first?', lesson: 'What did that teach you that you still apply?', symptom: 'What did the problem look like from the outside before you dug in?', prevention: 'What did you change so it could not happen again?', 'design decision': 'Which design decision mattered most there, and why?', measurement: 'How did you measure that; where do the numbers come from?', result: 'What was the outcome in concrete terms?' }
      const tech = missed.filter((c) => !(c in meta))
      const prompt = tech.length ? `You mentioned ${evidence.conceptsHit.slice(0, 2).join(' and ') || 'the project'}. How did ${tech[0]} come into it?` : meta[missed[0]]
      return { intent: 'probe_missing', prompt }
    }
    if (evidence.quality === 'strong' && !has('challenge')) return { intent: 'challenge', prompt: question.kind === 'behavioral' ? 'What would you do differently if the same situation came up tomorrow?' : 'If a teammate had disagreed with that decision, what would have convinced you to change it?' }
    return null
  }
  // technical
  if (missed.length && (evidence.quality === 'partial' || evidence.quality === 'solid') && !has('probe_missing')) return { intent: 'probe_missing', prompt: `You covered ${evidence.conceptsHit.slice(0, 2).join(' and ') || 'the basics'}. Where does ${missed[0]} fit in?` }
  if (!evidence.hasTradeoff && evidence.quality !== 'thin' && !has('tradeoff')) return { intent: 'tradeoff', prompt: 'What is the trade-off of that approach, and when would you not use it?' }
  if (!evidence.hasExample && !has('example')) return { intent: 'example', prompt: 'Where have you actually used this? Walk me through one concrete case.' }
  if (evidence.quality === 'strong' && !has('challenge')) return { intent: 'challenge', prompt: 'Suppose that assumption is wrong in production. What would you see, and what would you change?' }
  return null
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const rate = (n: number, total: number): Rating => (total === 0 ? 'not_observed' : n / total >= 0.7 ? 'strong' : n / total >= 0.4 ? 'adequate' : 'weak')
const flag = (b: boolean): Rating => (b ? 'strong' : 'weak')

const BETTER: Record<QuestionKind, (q: InterviewQuestion) => string> = {
  intro: () => 'Two or three sentences: current role, the work most relevant to this listing, and one reason you want this role.',
  resume: (q) => `Structure it as problem → decision (and the alternative you rejected) → outcome → what you would redesign. Name the specific technologies (${q.expectedConcepts.filter((c) => !['decision', 'alternative', 'trade-off', 'problem', 'root cause', 'fix', 'redesign', 'lesson', 'symptom', 'prevention', 'design decision', 'measurement', 'result'].includes(c)).join(', ') || 'from your resume'}) and one concrete number or observation.`,
  technical: (q) => `Define ${q.area} in one sentence, then cover the concepts a strong answer names (${q.expectedConcepts.slice(0, 5).join(', ')}), give one example from your own work, and end with a failure mode or trade-off.`,
  coding: () => 'State the approach and why it works, then code it, then time and space complexity, then edge cases (empty, duplicates, large inputs), then dry-run one example out loud.',
  design: () => 'Requirements and scale first, then components and data flow, then the data store and caching choices with their trade-offs, then failure handling and how you would observe the system.',
  behavioral: () => 'Situation in one sentence, your specific actions (not the team\'s) in two or three, the measurable result, and what you learned.',
  wrapup: () => 'Ask about the team, the work in the first months, or how success is measured; then close briefly.',
}

function strengthText(q: InterviewQuestion, e: AnswerEvidence): string | null {
  const bits: string[] = []
  if (e.conceptsHit.length) bits.push(`named ${e.conceptsHit.slice(0, 4).join(', ')}`)
  if (e.hasExample) bits.push('gave a concrete example')
  if (e.hasTradeoff) bits.push('reasoned about trade-offs')
  if (q.kind === 'coding' && e.hasCode) bits.push('wrote code')
  if (q.kind === 'coding' && e.hasComplexity) bits.push('stated complexity')
  if (q.kind === 'design' && e.hasDiagram) bits.push('sketched the architecture')
  if (q.kind === 'behavioral' && e.hasStructure) bits.push('told a complete situation → action → result story')
  if (!bits.length) return null
  return `You ${bits.join(', ')}.`
}

function weaknessText(q: InterviewQuestion, e: AnswerEvidence, skipped: boolean): string | null {
  if (skipped) return 'Skipped.'
  if (e.quality === 'none') return 'No answer was given.'
  const bits: string[] = []
  if (e.gaveUp) bits.push('you said you did not know')
  else if (e.quality === 'thin') bits.push('the answer was too short to show your reasoning')
  if (e.conceptsMissed.length) bits.push(`did not mention ${e.conceptsMissed.slice(0, 4).join(', ')}`)
  if ((q.kind === 'technical' || q.kind === 'design') && !e.hasTradeoff && e.quality !== 'thin') bits.push('no trade-off or failure mode was discussed')
  if ((q.kind === 'resume' || q.kind === 'behavioral') && !e.hasExample) bits.push('no concrete example from your own work')
  if (q.kind === 'behavioral' && !e.hasStructure && e.quality !== 'thin') bits.push('the story was missing the situation, your own action or the result')
  if (q.kind === 'coding' && !e.hasCode) bits.push('no code was shared')
  if (q.kind === 'coding' && !e.hasComplexity) bits.push('complexity was not stated')
  if (q.kind === 'coding' && !e.hasEdgeCases) bits.push('edge cases were not covered')
  if (q.kind === 'design' && !e.hasDiagram && e.quality !== 'thin') bits.push('no diagram or component sketch was shared')
  if (!bits.length) return null
  return `${bits[0][0].toUpperCase()}${bits.join('; ').slice(1)}.`
}

export function buildReport(plan: InterviewPlan, turns: TurnRecord[], entitlements: SessionEntitlements, timing: { plannedMinutes: number; actualMinutes: number }): InterviewReport {
  const feedback: QuestionFeedback[] = []
  const byQuestion = new Map<string, TurnRecord[]>()
  for (const t of turns) {
    if (!byQuestion.has(t.questionId)) byQuestion.set(t.questionId, [])
    byQuestion.get(t.questionId)!.push(t)
  }
  const sectionTitle = (id: SectionId) => plan.sections.find((s) => s.id === id)?.title ?? SECTION_TITLES[id]
  let answered = 0
  let followUpsAsked = 0
  for (const q of plan.questions) {
    const ts = byQuestion.get(q.id) ?? []
    if (!ts.length) continue
    const candidateTurns = ts.filter((t) => t.role === 'candidate' && t.kind !== 'skip')
    const skipped = ts.some((t) => t.kind === 'skip') && !candidateTurns.length
    const evidence = mergeEvidence(candidateTurns.map((t) => t.evidence).filter((e): e is AnswerEvidence => Boolean(e))) ?? analyzeAnswer(q, { text: '' })
    if (!skipped) answered += 1
    const followUps: { prompt: string; answer: string }[] = []
    for (let i = 0; i < ts.length; i++) {
      if (ts[i].kind === 'follow_up') {
        followUpsAsked += 1
        const reply = ts.slice(i + 1).find((t) => t.kind === 'follow_up_answer')
        followUps.push({ prompt: ts[i].text, answer: reply?.text ?? '' })
      }
    }
    const main = candidateTurns.find((t) => t.kind === 'answer')
    const evidenceLines: string[] = []
    if (evidence.conceptsHit.length) evidenceLines.push(`Concepts named: ${evidence.conceptsHit.join(', ')}`)
    if (evidence.conceptsMissed.length) evidenceLines.push(`Not mentioned: ${evidence.conceptsMissed.join(', ')}`)
    evidenceLines.push(`${evidence.words} words${evidence.hasCode ? ', code shared' : ''}${evidence.hasDiagram ? ', diagram shared' : ''}${evidence.hasExample ? ', example given' : ''}${evidence.hasTradeoff ? ', trade-off discussed' : ''}`)
    feedback.push({
      questionId: q.id,
      prompt: q.prompt,
      provenance: q.provenance,
      sectionId: q.sectionId,
      sectionTitle: sectionTitle(q.sectionId),
      area: q.area,
      answer: main ? `${main.text}${main.code ? `\n\n\`\`\`${main.language || ''}\n${main.code}\n\`\`\`` : ''}${main.diagram ? `\n\nDiagram:\n\`\`\`mermaid\n${main.diagram}\n\`\`\`` : ''}` : '',
      skipped,
      followUps,
      evidence: evidenceLines,
      strength: skipped ? null : strengthText(q, evidence),
      weakness: weaknessText(q, evidence, skipped),
      betterApproach: BETTER[q.kind](q),
      conceptsHit: evidence.conceptsHit,
      conceptsMissed: evidence.conceptsMissed,
      ref: q.ref,
      quality: skipped ? 'none' : evidence.quality,
    })
  }
  const scored = feedback.filter((f) => f.sectionId !== 'intro' && f.sectionId !== 'wrapup')

  // Area metrics: distinct concepts demonstrated per area.
  const areaMap = new Map<string, { sectionId: SectionId; hit: Set<string>; all: Set<string> }>()
  for (const f of scored) {
    const q = plan.questions.find((x) => x.id === f.questionId)!
    const e = areaMap.get(f.area) ?? { sectionId: f.sectionId, hit: new Set(), all: new Set() }
    for (const c of q.expectedConcepts) e.all.add(c)
    for (const c of f.conceptsHit) e.hit.add(c)
    areaMap.set(f.area, e)
  }
  const metrics: AreaMetric[] = Array.from(areaMap.entries()).map(([area, e]) => ({ area, sectionId: e.sectionId, demonstrated: e.hit.size, total: e.all.size }))
  const strongAreas = metrics.filter((m) => m.total > 0 && m.demonstrated / m.total >= 0.6).map((m) => `${m.area} (${m.demonstrated}/${m.total} concepts)`)
  const needsImprovement = metrics.filter((m) => m.total > 0 && m.demonstrated / m.total < 0.5).map((m) => `${m.area} (${m.demonstrated}/${m.total} concepts)`)
  const missedConcepts = scored.flatMap((f) => f.conceptsMissed.filter((c) => !['example', 'when it matters', 'dry run', 'situation', 'your action', 'result', 'reflection'].includes(c)).map((c) => ({ concept: c, area: f.area, ref: f.ref })))
  const seenMissed = new Set<string>()
  const missedUnique = missedConcepts.filter((m) => {
    const k = `${m.area}|${m.concept}`
    if (seenMissed.has(k)) return false
    seenMissed.add(k)
    return true
  })

  // Communication.
  const nonSkipped = scored.filter((f) => !f.skipped)
  const avgWords = nonSkipped.length ? nonSkipped.reduce((s, f) => s + (byQuestion.get(f.questionId) ?? []).filter((t) => t.role === 'candidate').reduce((w, t) => w + (t.evidence?.words ?? 0), 0), 0) / nonSkipped.length : 0
  const thin = nonSkipped.filter((f) => f.quality === 'thin' || f.quality === 'none').length
  const withExample = nonSkipped.filter((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasExample)).length
  const withReasoning = nonSkipped.filter((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasTradeoff || t.evidence?.hasComplexity)).length
  const communication: InterviewReport['communication'] = {
    clarity: nonSkipped.length === 0 ? 'not_observed' : thin / nonSkipped.length > 0.5 ? 'weak' : avgWords >= 50 ? 'strong' : 'adequate',
    structure: rate(withExample, nonSkipped.length),
    reasoning: rate(withReasoning, nonSkipped.length),
    note: nonSkipped.length ? `Average answer ${Math.round(avgWords)} words; ${thin} of ${nonSkipped.length} answers too short to judge; examples in ${withExample}, explicit reasoning (trade-offs or complexity) in ${withReasoning}.` : 'No answers to assess.',
  }

  const codingQs = scored.filter((f) => f.sectionId === 'coding' && !f.skipped)
  const coding = codingQs.length
    ? (() => {
        const ev = codingQs.map((f) => mergeEvidence((byQuestion.get(f.questionId) ?? []).map((t) => t.evidence).filter((e): e is AnswerEvidence => Boolean(e)))!).filter(Boolean)
        const any = (k: keyof AnswerEvidence) => ev.some((e) => e[k] === true)
        return {
          approach: rate(codingQs.reduce((s, f) => s + f.conceptsHit.filter((c) => !['time complexity', 'edge cases', 'dry run'].includes(c)).length, 0), codingQs.reduce((s, f) => s + plan.questions.find((q) => q.id === f.questionId)!.expectedConcepts.filter((c) => !['time complexity', 'edge cases', 'dry run'].includes(c)).length, 0)),
          correctness: (any('hasDryRun') && any('hasCode') ? 'adequate' : any('hasCode') ? 'weak' : 'not_observed') as Rating,
          complexity: flag(any('hasComplexity')),
          edgeCases: flag(any('hasEdgeCases')),
          note: `Correctness is judged from the walk-through you described${any('hasDryRun') ? '' : ' (no dry run was given)'}; the code was not executed by the interviewer.`,
        }
      })()
    : null
  const designQs = scored.filter((f) => f.sectionId === 'design' && !f.skipped)
  const designHits = new Set(designQs.flatMap((f) => f.conceptsHit.map((c) => c.toLowerCase())))
  const systemDesign = designQs.length
    ? {
        requirements: flag(designHits.has('requirements') || designHits.has('capacity')),
        architecture: flag(['components', 'service boundaries', 'api', 'request flow', 'sharding', 'replication', 'queue'].some((c) => designHits.has(c)) || designQs.some((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasDiagram))),
        tradeoffs: flag(designQs.some((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasTradeoff)) || designHits.has('trade-off')),
        scalability: flag(['caching', 'load balancing', 'sharding', 'capacity', 'database choice', 'replication'].some((c) => designHits.has(c))),
        reliability: flag(['failure handling', 'retry', 'idempotency', 'dead letter', 'monitoring', 'observability', 'rollback', 'error handling'].some((c) => designHits.has(c))),
        note: `Concepts covered: ${Array.from(designHits).join(', ') || 'none'}.`,
      }
    : null
  const behQs = scored.filter((f) => f.sectionId === 'behavioral' && !f.skipped)
  const behavioral = behQs.length
    ? {
        examples: rate(behQs.filter((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasExample)).length, behQs.length),
        completeness: rate(behQs.filter((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasStructure)).length, behQs.length),
        note: `${behQs.filter((f) => byQuestion.get(f.questionId)!.some((t) => t.evidence?.hasStructure)).length} of ${behQs.length} stories had a situation, your own action and a result.`,
      }
    : null

  // Weaknesses mapped to curriculum, merged by topic.
  const wmap = new Map<string, Weakness>()
  for (const f of scored) {
    const weakQ = f.skipped || f.quality === 'none' || f.quality === 'thin' || f.quality === 'partial' || f.conceptsMissed.length >= Math.max(2, Math.ceil((plan.questions.find((q) => q.id === f.questionId)!.expectedConcepts.length || 0) / 2))
    if (!weakQ) continue
    const key = f.ref ? `ref:${f.ref.topicId}` : `area:${f.area}`
    const w = wmap.get(key) ?? { id: key, title: f.ref ? f.ref.topicTitle : f.area, concepts: [], ref: f.ref, questionIds: [], severity: 'weak', area: f.area }
    for (const c of f.conceptsMissed) if (!w.concepts.includes(c)) w.concepts.push(c)
    w.questionIds.push(f.questionId)
    if (f.skipped || f.quality === 'none' || f.quality === 'thin') w.severity = 'missed'
    wmap.set(key, w)
  }
  const weaknesses = Array.from(wmap.values())
  const sectionsCompleted = plan.sections.filter((s) => s.questionIds.some((id) => byQuestion.has(id))).map((s) => s.title)
  const summaryBits: string[] = []
  summaryBits.push(`${answered} of ${plan.questions.length} questions answered in ${timing.actualMinutes} of ${timing.plannedMinutes} planned minutes${followUpsAsked ? `, ${followUpsAsked} follow-up${followUpsAsked === 1 ? '' : 's'}` : ''}.`)
  if (strongAreas.length) summaryBits.push(`Demonstrated: ${strongAreas.slice(0, 3).join('; ')}.`)
  if (needsImprovement.length) summaryBits.push(`Needs work: ${needsImprovement.slice(0, 3).join('; ')}.`)
  if (!strongAreas.length && !needsImprovement.length) summaryBits.push('Too few substantive answers to identify strong or weak areas; try answering each question in full.')
  const detailed = entitlements.detailed && !entitlements.preview
  return {
    version: INTERVIEW_VERSION,
    summary: summaryBits.join(' '),
    strongAreas,
    needsImprovement,
    missedConcepts: detailed ? missedUnique : [],
    communication,
    coding: detailed ? coding : null,
    systemDesign: detailed ? systemDesign : null,
    behavioral: detailed ? behavioral : null,
    questions: detailed ? feedback : [],
    weaknesses: entitlements.curriculumMapping && !entitlements.preview ? weaknesses : [],
    metrics,
    sectionsCompleted,
    sectionsTotal: plan.sections.length,
    questionsAnswered: answered,
    questionsTotal: plan.questions.length,
    followUpsAsked,
    detailed,
  }
}

export function compareAttempts(previous: AreaMetric[] | null, current: AreaMetric[]): AttemptComparison {
  const rows: AttemptComparison['rows'] = []
  const areasImproved: string[] = []
  const areasStillWeak: string[] = []
  for (const m of current) {
    const p = previous?.find((x) => x.area === m.area) ?? null
    const after = `${m.demonstrated}/${m.total}`
    const before = p ? `${p.demonstrated}/${p.total}` : '—'
    const change: AttemptComparison['rows'][number]['change'] = !p ? 'new' : m.demonstrated > p.demonstrated ? 'improved' : m.demonstrated < p.demonstrated ? 'worse' : 'same'
    rows.push({ area: m.area, before, after, change })
    if (change === 'improved') areasImproved.push(m.area)
    if (m.total > 0 && m.demonstrated / m.total < 0.5) areasStillWeak.push(m.area)
  }
  return { rows, areasImproved, areasStillWeak }
}

/** Facts for the readiness view; never a probability. */
export interface InterviewReadiness {
  completed: number
  latest: { at: string; areasDemonstrated: number; areasTotal: number; weakAreas: number; questionsAnswered: number; questionsTotal: number } | null
  areasImproved: string[]
  reattemptRecommended: boolean
}

export function interviewReadiness(history: { status: string; completedAt: string | null; report: { metrics: AreaMetric[]; weaknessCount: number; questionsAnswered: number; questionsTotal: number } | null; mode: InterviewMode }[]): InterviewReadiness {
  const done = history.filter((h) => h.status === 'completed' && h.report && h.mode !== 'preview').sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
  const latest = done[done.length - 1] ?? null
  const prev = done[done.length - 2] ?? null
  if (!latest || !latest.report) return { completed: done.length, latest: null, areasImproved: [], reattemptRecommended: false }
  const m = latest.report.metrics
  const demonstrated = m.filter((x) => x.total > 0 && x.demonstrated / x.total >= 0.6).length
  const cmp = compareAttempts(prev?.report?.metrics ?? null, m)
  return {
    completed: done.length,
    latest: { at: latest.completedAt ?? '', areasDemonstrated: demonstrated, areasTotal: m.length, weakAreas: latest.report.weaknessCount, questionsAnswered: latest.report.questionsAnswered, questionsTotal: latest.report.questionsTotal },
    areasImproved: cmp.areasImproved,
    reattemptRecommended: latest.report.weaknessCount > 0,
  }
}
