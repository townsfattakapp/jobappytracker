import { findTrack, getCurriculum, searchCurriculum, type TopicRef } from '../curriculum/registry'
import { PLACEHOLDER_TOPIC } from '../curriculum/placeholders'
import type { ResumeProfile } from '../resume/extract'
import type { JobApplication, KnowledgeWorkspace, RoadmapDay } from '../../types'
import type { CompatibilityReport } from './compatibility'
import type { JobCurriculumMap } from './curriculumMap'
import type { ResumeAnalysisReport } from './resumeAnalysis'
import { sameSkill, skillDef } from './skills'
import type { JobLevel } from './taxonomy'
import type { JobDto } from './types'
import type { InterviewReadiness } from '../interview/jobInterview'

/**
 * "Prepare for this job": a deterministic preparation blueprint built from
 * the listing, the learner's curriculum progress, resume evidence and level.
 * Every item that maps to the curriculum references an existing track/topic
 * (never a new concept), so clicking it opens the real Knowledge Workspace.
 */

export const BLUEPRINT_VERSION = 'prep-1'

export type PrepProvenance = 'job' | 'resume' | 'curriculum' | 'recommendation'

export interface TopicPointer {
  trackId: string
  trackTitle: string
  topicId: string
  topicTitle: string
  /** First concept (subtopic) of the topic, for deep links. */
  subtopicId: string | null
  categoryTitle: string
}

export interface PrepItem {
  id: string
  title: string
  kind: 'skill' | 'topic' | 'dsa' | 'cs' | 'system_design' | 'project' | 'behavioral'
  /** must = needs work; revise = studied before, revisit; strong = evidence already there. */
  status: 'must' | 'revise' | 'strong'
  reason: string
  provenance: PrepProvenance[]
  ref: TopicPointer | null
}

export interface KitQuestion {
  prompt: string
  /** 'curriculum' when the prompt is a quiz question from the curriculum; 'generated' otherwise. */
  source: 'curriculum' | 'generated'
}

export interface KitSection {
  id: string
  title: string
  items: { title: string; ref: TopicPointer | null; questions: KitQuestion[] }[]
}

export interface PrepBlueprint {
  version: string
  jobId: string
  level: JobLevel
  mustPrepare: PrepItem[]
  revise: PrepItem[]
  alreadyStrong: PrepItem[]
  dsa: { depth: 'none' | 'core' | 'standard' | 'advanced'; why: string; items: PrepItem[] }
  frameworks: PrepItem[]
  csFundamentals: PrepItem[]
  systemDesign: { depth: 'none' | 'basics' | 'standard' | 'senior'; why: string; items: PrepItem[] }
  projects: PrepItem[]
  behavioral: PrepItem[]
  interviewKit: KitSection[]
  /** Inputs that were not available; the blueprint is weaker without them. */
  missingInputs: string[]
  /** Items the plan can schedule (must + revise with a curriculum reference), deduplicated by topic. */
  plannable: PrepItem[]
}

export interface LearnerProgress {
  roadmap: RoadmapDay[]
  knowledgeWorkspaces: KnowledgeWorkspace[]
}

const ENGINEERING_ROLES = new Set(['software-engineer', 'backend', 'frontend', 'full-stack', 'java', 'nodejs', 'react-nextjs', 'mobile'])
const DATA_ROLES = new Set(['data-analyst', 'data-scientist', 'data-engineer', 'ai-ml'])

function pointer(ref: TopicRef): TopicPointer {
  return { trackId: ref.track.id, trackTitle: ref.track.title, topicId: ref.topic.id, topicTitle: ref.topic.title, subtopicId: ref.topic.subtopics[0]?.id ?? null, categoryTitle: ref.category.title }
}

/** Curriculum rows that are scaffolding rather than substance: never the topic a candidate should prepare. */
const SETUP_TOPIC = /\b(install|installation|installing|setup|set up|getting started|environment|introduction to|what is|why (should i )?learn|overview|hello world|first program|tooling|ide)\b/i
const INTERVIEW_TOPIC = /interview questions/i

/** Words a listing uses that the curriculum names differently. */
const TOPIC_HINTS: Record<string, RegExp> = {
  'dynamic programming': /memoization|1d.2d dp/i,
  trees: /^binary trees$/i,
  arrays: /^arrays and strings$/i,
  rabbitmq: /queue|messag|pub.?sub|broker/i,
  sqs: /queue|messag/i,
  'message queues': /queue|messag/i,
  kafka: /kafka|stream|log/i,
  redis: /redis|cach/i,
  memcached: /cach/i,
  docker: /container|docker|image/i,
  kubernetes: /kubernetes|k8s|pod|deployment/i,
  terraform: /terraform|infrastructure as code|iac/i,
  grpc: /grpc|protobuf|rpc/i,
  graphql: /graphql|schema|resolver/i,
  oauth: /oauth|auth|token/i,
  jwt: /jwt|auth|token/i,
  testing: /testing|test|tdd|mock/i,
  etl: /etl|pipeline|batch/i,
  spark: /spark|rdd|dataframe|partition/i,
  airflow: /airflow|dag|orchestrat/i,
  azure: /azure/i,
  aws: /aws|s3|lambda|ec2|iam/i,
  gcp: /gcp|google cloud|bigquery|gke/i,
  microservices: /microservice|service boundar|api gateway/i,
  'system design': /scalab|design|architect/i,
}

/** Ranks a topic for a query: real subject matter about the query first, curriculum placeholders and setup pages last. */
const WORD_SPLIT = /[^a-z0-9+#.]+/

function topicScore(title: string, query: string, options: { preferShort?: boolean } = {}): number {
  const t = title.toLowerCase()
  const q = query.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').trim()
  const words = q.split(WORD_SPLIT).filter((w) => w.length > 1)
  const titleWords = t.split(WORD_SPLIT).filter(Boolean)
  const has = (w: string) => titleWords.some((tw) => tw === w || tw === `${w}s` || tw === `${w}es` || w === `${tw}s`)
  let score = 0
  const all = words.length > 0 && words.every(has)
  if (all) score += 40
  else if (words.some(has)) score += 20
  // Across unrelated tracks, prefer the topic that is about the subject itself ("Kubernetes fundamentals")
  // over one that mentions it in passing ("Kubernetes executor and the Helm chart").
  if (all && options.preferShort) score += Math.max(0, 12 - 3 * Math.max(0, titleWords.length - words.length))
  const hint = TOPIC_HINTS[q]
  if (hint && hint.test(t)) score += 25
  if (INTERVIEW_TOPIC.test(t)) score += 15
  if (PLACEHOLDER_TOPIC.test(t)) score -= 100
  if (SETUP_TOPIC.test(t)) score -= 30
  return score
}

/**
 * Best existing topic for a phrase inside the given tracks: the search hits and the tracks' own topics are ranked so
 * that substantive topics about the skill win over installation pages and "Advanced topic N" placeholders; the first
 * usable topic of the first track is the last resort.
 */
const OVERVIEW_TOPIC = /^what is\b/i

/** Words of a track title that name its subject: "Core Java, OOP and Collections" → core, java, oop, collections. */
function trackSubjectWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/\bapache\b/g, ' ')
    .split(WORD_SPLIT)
    .filter(Boolean)
}

/**
 * When the phrase names a whole track ("Airflow" for Apache Airflow, "Java" for Core Java, OOP and Collections),
 * the entry point is the track's overview: "What is X?" when the track has one, otherwise the track's interview
 * questions (whose lesson opens with "What is X?" and then works through the questions), otherwise the first real
 * topic that is not an installation step. A learner asked to prepare "Airflow" should land on what Airflow is, not
 * on a random topic that happens to contain the word.
 */
function trackEntryTopic(query: string, trackId: string): TopicRef | null {
  const words = trackSubjectWords(query).filter((w) => w.length > 1)
  const track = findTrack(trackId)
  if (!track || !words.length) return null
  const titleWords = trackSubjectWords(track.title)
  if (!words.every((w) => titleWords.includes(w))) return null
  const topics = getCurriculum().topics.filter((ref) => ref.track.id === trackId && !PLACEHOLDER_TOPIC.test(ref.topic.title))
  return topics.find((ref) => OVERVIEW_TOPIC.test(ref.topic.title)) ?? topics.find((ref) => INTERVIEW_TOPIC.test(ref.topic.title)) ?? topics.find((ref) => !SETUP_TOPIC.test(ref.topic.title)) ?? topics[0] ?? null
}

export function resolveTopic(query: string, trackIds: string[]): TopicPointer | null {
  const existing = trackIds.filter((id) => findTrack(id))
  if (!existing.length) return null
  for (const id of existing) {
    const entry = trackEntryTopic(query, id)
    if (entry) return pointer(entry)
  }
  const candidates = new Map<string, TopicRef>()
  for (const hit of searchCurriculum(query, { trackIds: existing, limit: 12 })) candidates.set(hit.ref.topic.id, hit.ref)
  for (const ref of getCurriculum().topics) if (ref.track.id === existing[0]) candidates.set(ref.topic.id, ref)
  const rank = (refs: Iterable<TopicRef>, preferShort = false) =>
    Array.from(refs)
      .map((ref, index) => ({ ref, score: topicScore(ref.topic.title, query, { preferShort }) - index * 0.01 }))
      .filter((r) => !PLACEHOLDER_TOPIC.test(r.ref.topic.title))
      .sort((a, b) => b.score - a.score)
  const best = rank(candidates.values())[0]
  if (best) return pointer(best.ref)
  // The preferred tracks only hold placeholder topics (43 library tracks are still unwritten):
  // fall back to a real topic about the same subject anywhere in the curriculum, or to nothing.
  // A placeholder is never shown to a learner.
  const fallback = rank(searchCurriculum(query, { limit: 12 }).map((hit) => hit.ref), true).find((r) => r.score >= 20)
  return fallback ? pointer(fallback.ref) : null
}

function topicProgress(topicId: string, progress: LearnerProgress): 'done' | 'started' | 'none' {
  const ws = progress.knowledgeWorkspaces.find((w) => w.topicId === topicId)
  if (ws?.learningStatus === 'Mastered') return 'done'
  const tasks = progress.roadmap.flatMap((d) => d.tasks).filter((t) => t.topicId === topicId)
  if (tasks.length && tasks.every((t) => t.status === 'Completed' || t.status === 'Skipped') && tasks.some((t) => t.status === 'Completed')) return 'done'
  if (tasks.some((t) => t.status === 'Completed' || t.status === 'InProgress') || (ws && ws.learningStatus !== 'Not Started')) return 'started'
  return 'none'
}

export function buildPrepBlueprint(input: {
  job: JobDto
  curriculum: JobCurriculumMap | null
  compatibility: CompatibilityReport | null
  resume: ResumeAnalysisReport | null
  profile: ResumeProfile | null
  progress: LearnerProgress
}): PrepBlueprint {
  const { job, curriculum, resume, profile, progress } = input
  const missingInputs: string[] = []
  if (!resume) missingInputs.push('resume analysis')
  if (!input.compatibility) missingInputs.push('compatibility analysis')
  let n = 0
  const id = (kind: string) => `${kind}-${++n}`
  const seenTopics = new Set<string>()

  const skillStatus = (skill: string): { status: PrepItem['status']; reason: string; provenance: PrepProvenance[] } => {
    const row = resume?.skillsAlignment.find((r) => sameSkill(r.skill, skill))
    const track = curriculum?.tracks.find((t) => t.skills.some((s) => sameSkill(s, skill)))
    if (row?.status === 'demonstrated' && (!track || track.gapStatus !== 'not_covered')) return { status: 'strong', reason: `Demonstrated in your resume (“${row.evidence?.quote.slice(0, 70) ?? ''}”)${track ? ` and ${track.gapStatus === 'covered' ? 'covered' : 'in progress'} in your curriculum` : ''}.`, provenance: ['job', 'resume', 'curriculum'] }
    if (row?.status === 'demonstrated') return { status: 'revise', reason: 'Demonstrated in your resume but not yet studied in JobAppy; a quick revision pass keeps it interview-ready.', provenance: ['job', 'resume'] }
    if (row?.status === 'weak') return { status: 'revise', reason: `Listed in your resume (“${row.evidence?.quote.slice(0, 60) ?? ''}”) but not shown in use; revise it and be ready to describe where you used it${track ? ` (${track.track.title})` : ''}.`, provenance: track ? ['job', 'resume', 'curriculum'] : ['job', 'resume'] }
    if (track?.gapStatus === 'covered') return { status: 'revise', reason: `Covered in ${track.track.title}; revisit before interviews${row ? ' and show it in a resume bullet' : ''}.`, provenance: ['job', 'curriculum'] }
    if (track?.gapStatus === 'learning') return { status: 'revise', reason: `In progress in ${track.track.title}; finish it before interviews.`, provenance: ['job', 'curriculum'] }
    return { status: 'must', reason: resume ? `Named in the listing, not demonstrated in your resume and not covered in your curriculum yet.` : 'Named in the listing and not covered in your curriculum yet.', provenance: resume ? ['job', 'resume', 'curriculum'] : ['job', 'curriculum'] }
  }

  const skillItem = (skill: string, requirement: 'required' | 'preferred'): PrepItem => {
    const def = skillDef(skill)
    const mapTracks = curriculum?.tracks.filter((t) => t.skills.some((s) => sameSkill(s, skill))).map((t) => t.track.id) ?? []
    const ref = resolveTopic(skill, [...mapTracks, ...(def?.trackIds ?? [])])
    const st = skillStatus(skill)
    if (ref) {
      const p = topicProgress(ref.topicId, progress)
      if (st.status === 'must' && p === 'done') st.status = 'revise'
      if (ref) seenTopics.add(ref.topicId)
    }
    return { id: id('skill'), title: `${skill}${requirement === 'preferred' ? ' (preferred)' : ''}`, kind: 'skill', status: st.status, reason: st.reason, provenance: st.provenance, ref }
  }

  const skillItems = [...job.requiredSkills.map((s) => skillItem(s, 'required')), ...job.preferredSkills.map((s) => skillItem(s, 'preferred'))]
  const mustPrepare = skillItems.filter((i) => i.status === 'must')
  const revise = skillItems.filter((i) => i.status === 'revise')
  const alreadyStrong = skillItems.filter((i) => i.status === 'strong')

  // Frameworks / languages: skill items that resolve to a language/framework track.
  const frameworks = skillItems.filter((i) => {
    const track = i.ref ? findTrack(i.ref.trackId) : null
    return track && (track.kind === 'language' || track.kind === 'framework')
  })

  // DSA.
  const dsaRelevant = ENGINEERING_ROLES.has(job.roleCategory)
  const dsaDepth: PrepBlueprint['dsa']['depth'] = !dsaRelevant ? 'none' : job.level === 'intern' || job.level === 'entry' ? 'core' : job.level === 'mid' ? 'standard' : 'advanced'
  const dsaQueries = dsaDepth === 'none' ? [] : dsaDepth === 'core' ? ['arrays', 'strings', 'hashing', 'recursion', 'sorting'] : dsaDepth === 'standard' ? ['arrays', 'hashing', 'trees', 'graphs', 'dynamic programming'] : ['graphs', 'dynamic programming', 'heaps', 'tries', 'advanced algorithms']
  const dsaItems: PrepItem[] = []
  for (const q of dsaQueries) {
    const ref = resolveTopic(q, ['track-dsa'])
    if (!ref || seenTopics.has(ref.topicId)) continue
    seenTopics.add(ref.topicId)
    const p = topicProgress(ref.topicId, progress)
    dsaItems.push({ id: id('dsa'), title: ref.topicTitle, kind: 'dsa', status: p === 'done' ? 'revise' : p === 'started' ? 'revise' : 'must', reason: `${job.level} ${job.roleCategory} interviews commonly include ${q}; ${p === 'done' ? 'you have completed this topic, revise it' : p === 'started' ? 'you have started it' : 'not started yet'}.`, provenance: ['recommendation', 'curriculum'], ref })
  }
  const dsaWhy = !dsaRelevant ? 'Coding-round style DSA is not typical for this role family.' : `${job.level === 'intern' || job.level === 'entry' ? 'Entry-level' : job.level === 'mid' ? 'Mid-level' : 'Senior'} engineering loops usually include ${dsaDepth === 'core' ? 'core data-structure problems' : dsaDepth === 'standard' ? 'standard problems including trees and graphs' : 'harder algorithmic problems'}.`

  // CS fundamentals by role family.
  const csByRole: Record<string, { q: string; tracks: string[] }[]> = {
    backend: [{ q: 'indexes transactions', tracks: ['track-dbms', 'track-sql'] }, { q: 'design patterns', tracks: ['track-lld'] }, { q: 'processes threads', tracks: ['track-operating-systems', 'track-cs'] }, { q: 'http tcp', tracks: ['track-computer-networks', 'track-cs'] }],
    frontend: [{ q: 'http caching', tracks: ['track-computer-networks', 'track-cs'] }, { q: 'web performance', tracks: ['track-web-performance'] }, { q: 'accessibility', tracks: ['track-web-accessibility'] }],
    'data-analyst': [{ q: 'joins aggregation', tracks: ['track-sql', 'track-sql-analytics'] }, { q: 'statistics', tracks: ['track-statistics-analysts', 'track-probability-statistics'] }],
    'data-scientist': [{ q: 'probability', tracks: ['track-probability-statistics'] }, { q: 'sql joins', tracks: ['track-sql'] }],
    'data-engineer': [{ q: 'data modeling', tracks: ['track-data-modeling'] }, { q: 'sql window functions', tracks: ['track-advanced-sql', 'track-sql'] }],
    'ai-ml': [{ q: 'probability', tracks: ['track-probability-statistics', 'track-math-ai'] }, { q: 'model evaluation', tracks: ['track-model-evaluation', 'track-machine-learning'] }],
    'devops-cloud': [{ q: 'linux processes', tracks: ['track-linux', 'track-operating-systems'] }, { q: 'networking dns', tracks: ['track-networking', 'track-computer-networks'] }],
    mobile: [{ q: 'object oriented design', tracks: ['track-lld'] }, { q: 'http networking', tracks: ['track-computer-networks', 'track-cs'] }],
    cybersecurity: [{ q: 'networking', tracks: ['track-computer-networks', 'track-networking'] }, { q: 'operating systems', tracks: ['track-operating-systems', 'track-linux-security'] }],
  }
  const csList = csByRole[job.roleCategory] ?? csByRole.backend
  const csFundamentals: PrepItem[] = []
  for (const { q, tracks } of csList) {
    const ref = resolveTopic(q, tracks)
    if (!ref || seenTopics.has(ref.topicId)) continue
    seenTopics.add(ref.topicId)
    const p = topicProgress(ref.topicId, progress)
    csFundamentals.push({ id: id('cs'), title: ref.topicTitle, kind: 'cs', status: p === 'none' ? 'must' : 'revise', reason: `Fundamentals interviewers expect for ${job.roleCategory} roles (${ref.trackTitle}).`, provenance: ['recommendation', 'curriculum'], ref })
  }

  // System design: depth follows level and the listing's own words, never assumed for entry level.
  const mentionsDesign = /\b(system design|distributed|scalab|architecture|high availability|microservices)\b/i.test(`${job.description} ${job.requiredSkills.join(' ')} ${job.preferredSkills.join(' ')}`)
  let sdDepth: PrepBlueprint['systemDesign']['depth']
  if (job.level === 'lead') sdDepth = 'senior'
  else if (job.level === 'senior') sdDepth = 'standard'
  else if (job.level === 'mid') sdDepth = mentionsDesign ? 'standard' : 'basics'
  else sdDepth = mentionsDesign ? 'basics' : 'none'
  if (!ENGINEERING_ROLES.has(job.roleCategory) && job.roleCategory !== 'devops-cloud' && job.roleCategory !== 'data-engineer') sdDepth = mentionsDesign ? 'basics' : 'none'
  const sdQueries = sdDepth === 'none' ? [] : sdDepth === 'basics' ? ['scalability basics', 'caching'] : sdDepth === 'standard' ? ['scalability', 'caching', 'load balancing', 'database sharding'] : ['distributed systems', 'consistency', 'message queues', 'system design interview']
  const systemDesignItems: PrepItem[] = []
  for (const q of sdQueries) {
    const ref = resolveTopic(q, ['track-hld', 'track-distributed-systems'])
    if (!ref || seenTopics.has(ref.topicId)) continue
    seenTopics.add(ref.topicId)
    const p = topicProgress(ref.topicId, progress)
    systemDesignItems.push({ id: id('sd'), title: ref.topicTitle, kind: 'system_design', status: p === 'none' ? 'must' : 'revise', reason: sdDepth === 'basics' ? 'Basic design vocabulary is enough at this level.' : 'Design rounds at this level go into trade-offs and scale.', provenance: ['recommendation', 'curriculum'], ref })
  }
  const sdWhy = sdDepth === 'none' ? `No system-design round is assumed for a ${job.level}-level ${job.roleCategory} role${mentionsDesign ? '' : ' (the listing does not mention it)'}.` : sdDepth === 'basics' ? `The listing ${mentionsDesign ? 'mentions design/scale' : 'is mid-level'}; prepare the basics, not a senior-level design round.` : `Design rounds are standard for ${job.level}-level roles.`

  // Projects: only existing resume projects.
  const projects: PrepItem[] = (resume?.projectRelevance ?? []).map((p) => ({ id: id('project'), title: p.name, kind: 'project', status: 'strong', reason: `Uses ${p.matchedSkills.join(', ')} from the listing; be ready to walk through decisions, trade-offs and results.`, provenance: ['resume', 'job'], ref: null }))
  if (profile && !projects.length && profile.projects.length) projects.push({ id: id('project'), title: profile.projects[0].name, kind: 'project', status: 'revise', reason: 'Your most recent listed project; none of your projects uses the skills this listing names, so prepare to relate it to the role honestly.', provenance: ['resume'], ref: null })

  // Behavioural areas grounded in resume bullets when they exist.
  const bullets = profile?.employment.flatMap((e) => e.bullets.map((b) => ({ b, role: e.title || e.company || 'a role' }))) ?? []
  const pick = (re: RegExp) => bullets.find((x) => re.test(x.b))
  const behavioralAreas: { title: string; re: RegExp; fallback: string }[] = [
    { title: 'Project decisions and trade-offs', re: /\b(design|chose|migrat|architect|decid)/i, fallback: 'Pick one project and prepare the decision you made, the alternative, and why.' },
    { title: 'Production issues and debugging', re: /\b(incident|on-call|outage|debug|fixed|bug|latency|root cause)/i, fallback: 'Prepare one debugging story: symptom, how you narrowed it down, the fix, the prevention.' },
    { title: 'Ownership', re: /\b(owned|led|responsible|drove|maintained)/i, fallback: 'Prepare an example of something you owned end to end.' },
    { title: 'Teamwork and communication', re: /\b(team|collaborat|mentor|review|stakeholder|cross-functional)/i, fallback: 'Prepare an example of working with others across roles.' },
    { title: 'Failure and learning', re: /\b(fail|learn|mistake|improv|retro)/i, fallback: 'Prepare one honest failure and what changed afterwards.' },
    { title: 'Impact and results', re: /\d/, fallback: 'Prepare the measurable results of your work; if you do not have numbers, describe scope honestly.' },
  ]
  const behavioral: PrepItem[] = behavioralAreas.map((a) => {
    const hit = pick(a.re)
    return { id: id('behavioral'), title: a.title, kind: 'behavioral', status: hit ? 'revise' : 'must', reason: hit ? `From your resume (${hit.role}): “${hit.b.slice(0, 90)}${hit.b.length > 90 ? '…' : ''}”. Turn it into a two-minute story.` : a.fallback, provenance: hit ? ['resume', 'recommendation'] : ['recommendation'], ref: null }
  })

  // Interview kit: recommended practice, never presented as real company questions.
  const kit: KitSection[] = []
  const kitItem = (item: PrepItem) => {
    if (!item.ref) return null
    const ref = getCurriculum().byId.get(item.ref.topicId)
    const quiz = (ref?.topic.quiz ?? []).slice(0, 2).map((q) => ({ prompt: q.question, source: 'curriculum' as const }))
    const subject = item.kind === 'skill' ? item.title.replace(/\s*\(.*?\)\s*$/, '') : item.ref.topicTitle
    const generated: KitQuestion[] = quiz.length
      ? []
      : INTERVIEW_TOPIC.test(item.ref.topicTitle)
        ? [
            { prompt: `Work through the ${item.ref.trackTitle} interview questions in the curriculum; answer each aloud in under two minutes.`, source: 'generated' },
            { prompt: `Which ${subject} question would you find hardest today, and what is your honest answer to it?`, source: 'generated' },
          ]
        : [
            { prompt: `Explain ${item.ref.topicTitle} in your own words, then describe where you have used ${subject}.`, source: 'generated' },
            { prompt: `What goes wrong with ${subject} at scale or under load, and how would you handle it?`, source: 'generated' },
          ]
    return { title: item.title, ref: item.ref, questions: [...quiz, ...generated] }
  }
  const section = (sid: string, title: string, items: PrepItem[]) => {
    const list = items.map(kitItem).filter((x): x is NonNullable<typeof x> => Boolean(x))
    if (list.length) kit.push({ id: sid, title, items: list })
  }
  section('technical', 'Technical topics from the listing', [...mustPrepare, ...revise, ...alreadyStrong].filter((i) => i.kind === 'skill' && !frameworks.includes(i)))
  section('frameworks', 'Framework and language questions', frameworks)
  if (dsaItems.length) section('dsa', 'DSA topics', dsaItems)
  if (csFundamentals.length) section(DATA_ROLES.has(job.roleCategory) ? 'data' : 'fundamentals', DATA_ROLES.has(job.roleCategory) ? 'Database and statistics questions' : job.roleCategory === 'frontend' || job.roleCategory === 'react-nextjs' ? 'Frontend fundamentals' : 'Backend and database fundamentals', csFundamentals)
  if (systemDesignItems.length) section('system_design', 'System-design areas', systemDesignItems)
  if (projects.length) kit.push({ id: 'projects', title: 'Project discussion', items: projects.map((p) => ({ title: p.title, ref: null, questions: [{ prompt: `Walk through ${p.title}: the problem, your design decisions and the result.`, source: 'generated' }, { prompt: `What would you change in ${p.title} if you built it again?`, source: 'generated' }] })) })
  kit.push({ id: 'behavioral', title: 'Behavioural preparation', items: behavioral.map((b) => ({ title: b.title, ref: null, questions: [{ prompt: b.reason, source: 'generated' }] })) })

  const plannable: PrepItem[] = []
  const planned = new Set<string>()
  for (const item of [...mustPrepare, ...dsaItems, ...csFundamentals, ...systemDesignItems, ...revise]) {
    if (!item.ref || planned.has(item.ref.topicId) || item.status === 'strong') continue
    planned.add(item.ref.topicId)
    plannable.push(item)
  }

  return {
    version: BLUEPRINT_VERSION,
    jobId: job.id,
    level: job.level,
    mustPrepare,
    revise,
    alreadyStrong,
    dsa: { depth: dsaDepth, why: dsaWhy, items: dsaItems },
    frameworks,
    csFundamentals,
    systemDesign: { depth: sdDepth, why: sdWhy, items: systemDesignItems },
    projects,
    behavioral,
    interviewKit: kit,
    missingInputs,
    plannable,
  }
}

// ---------------------------------------------------------------------------
// Readiness
// ---------------------------------------------------------------------------

export interface ReadinessArea {
  id: string
  label: string
  done: number
  total: number
  detail: string
  provenance: PrepProvenance | 'you'
}

export interface Readiness {
  areas: ReadinessArea[]
  /** "8 of 11 identified preparation areas completed." */
  headline: string
  preparationDone: number
  preparationTotal: number
}

export function computeReadiness(input: {
  jobId: string
  blueprint: PrepBlueprint | null
  curriculum: JobCurriculumMap | null
  resume: ResumeAnalysisReport | null
  suggestionState: Record<string, string> | null
  progress: LearnerProgress
  completedItemIds: string[]
  application: JobApplication | null
  outreach: { status: string }[]
  /** Facts from job-specific mock interviews (Phase 6); never a probability. */
  interviews?: InterviewReadiness | null
}): Readiness {
  const { blueprint, curriculum, resume, progress } = input
  const areas: ReadinessArea[] = []
  if (curriculum && curriculum.tracks.length) {
    const covered = curriculum.tracks.filter((t) => t.gapStatus === 'covered').length
    areas.push({ id: 'curriculum', label: 'Curriculum coverage', done: covered, total: curriculum.tracks.length, detail: `${covered} of ${curriculum.tracks.length} relevant tracks covered`, provenance: 'curriculum' })
  }
  if (resume) {
    const required = resume.skillsAlignment.filter((r) => r.requirement === 'required')
    const shown = required.filter((r) => r.status === 'demonstrated').length
    areas.push({ id: 'skills', label: 'Required skills demonstrated', done: shown, total: required.length, detail: `${shown} of ${required.length} required skills demonstrated in your resume; ${required.length - shown} still missing`, provenance: 'resume' })
    const suggestions = resume.improvements.filter((s) => s.kind !== 'gap')
    const doneSuggestions = suggestions.filter((s) => input.suggestionState?.[s.id] === 'completed').length
    if (suggestions.length) areas.push({ id: 'resume', label: 'Resume recommendations completed', done: doneSuggestions, total: suggestions.length, detail: `${doneSuggestions} of ${suggestions.length} resume recommendations marked done`, provenance: 'recommendation' })
  }
  let preparationDone = 0
  let preparationTotal = 0
  if (blueprint) {
    const items = [...blueprint.mustPrepare, ...blueprint.revise, ...blueprint.dsa.items, ...blueprint.csFundamentals, ...blueprint.systemDesign.items, ...blueprint.behavioral]
    const seen = new Set<string>()
    for (const item of items) {
      const key = item.ref?.topicId ?? item.id
      if (seen.has(key)) continue
      seen.add(key)
      preparationTotal += 1
      const manual = input.completedItemIds.includes(item.id)
      const byTask = item.ref ? progress.roadmap.flatMap((d) => d.tasks).some((t) => t.prepJobId === input.jobId && t.topicId === item.ref!.topicId && t.status === 'Completed') : false
      const byWorkspace = item.ref ? progress.knowledgeWorkspaces.some((w) => w.topicId === item.ref!.topicId && w.learningStatus === 'Mastered') : false
      if (manual || byTask || byWorkspace) preparationDone += 1
    }
    areas.push({ id: 'preparation', label: 'Preparation areas completed', done: preparationDone, total: preparationTotal, detail: `${preparationDone} of ${preparationTotal} identified preparation areas completed`, provenance: 'curriculum' })
    const prepTasks = progress.roadmap.flatMap((d) => d.tasks).filter((t) => t.prepJobId === input.jobId)
    if (prepTasks.length) areas.push({ id: 'tasks', label: 'Preparation tasks completed', done: prepTasks.filter((t) => t.status === 'Completed').length, total: prepTasks.length, detail: `${prepTasks.filter((t) => t.status === 'Completed').length} of ${prepTasks.length} scheduled preparation tasks completed`, provenance: 'curriculum' })
  }
  areas.push({ id: 'application', label: 'Application status', done: input.application ? 1 : 0, total: 1, detail: input.application ? `Tracked as ${input.application.status}` : 'Not in your tracker yet', provenance: 'recommendation' })
  const active = input.outreach.filter((o) => o.status !== 'not_contacted' && o.status !== 'closed').length
  areas.push({ id: 'networking', label: 'Networking status', done: active, total: Math.max(input.outreach.length, 1), detail: input.outreach.length ? `${active} of ${input.outreach.length} saved contacts have been contacted` : 'No contacts saved yet', provenance: 'you' })
  if (input.interviews) {
    const iv = input.interviews
    areas.push({ id: 'interview', label: 'Mock interview completed', done: iv.completed > 0 ? 1 : 0, total: 1, detail: iv.completed ? `${iv.completed} job-specific interview${iv.completed === 1 ? '' : 's'} completed; last ${iv.latest?.questionsAnswered ?? 0} of ${iv.latest?.questionsTotal ?? 0} questions answered` : 'No job-specific mock interview yet', provenance: 'you' })
    if (iv.latest) {
      areas.push({ id: 'interviewAreas', label: 'Technical areas demonstrated', done: iv.latest.areasDemonstrated, total: iv.latest.areasTotal, detail: `${iv.latest.areasDemonstrated} of ${iv.latest.areasTotal} interview areas demonstrated in the latest attempt${iv.areasImproved.length ? `; improved since the previous attempt: ${iv.areasImproved.slice(0, 3).join(', ')}` : ''}`, provenance: 'you' })
      areas.push({ id: 'interviewWeak', label: 'Weak areas remaining', done: Math.max(0, iv.latest.areasTotal - iv.latest.weakAreas), total: iv.latest.areasTotal, detail: iv.latest.weakAreas ? `${iv.latest.weakAreas} weak area${iv.latest.weakAreas === 1 ? '' : 's'} mapped to your curriculum${iv.reattemptRecommended ? '; re-attempt recommended after studying them' : ''}` : 'No weak areas in the latest attempt', provenance: 'you' })
    }
  }
  const headline = blueprint ? `${preparationDone} of ${preparationTotal} identified preparation areas completed.` : 'Generate the preparation blueprint to see your readiness.'
  return { areas, headline, preparationDone, preparationTotal }
}
