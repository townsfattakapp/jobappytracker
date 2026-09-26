import type { InterviewConfig, InterviewContext, InterviewPlan, InterviewQuestion, SectionId, TurnRecord } from './jobInterview'
import { SECTION_TITLES } from './jobInterview'

/**
 * Conversational layer for the job-specific interviewer (pure, no AI).
 *
 * The Phase 6 engine decides *what* to ask and how to react to evidence; this
 * module decides *how the interviewer talks*: a realistic opening, neutral
 * acknowledgements that never praise or teach, time-aware transitions between
 * sections, clarification and repeat handling that does not count as an
 * answer, a bounded session memory the interviewer can refer back to, a
 * natural closing with candidate questions, and the replay timeline built
 * from stored turn timestamps. Every phrase pool rotates on a seed so the
 * same wording is not repeated back to back.
 */

export type CandidateIntent = 'repeat' | 'clarify' | 'assumption' | 'thinking' | 'answer'

export interface MemoryFact {
  /** Short, learner-worded fact ("mainly worked on the backend"). */
  text: string
  /** Lower-cased keywords the fact is about, used to decide when it is relevant. */
  terms: string[]
  questionId: string
}

export interface SilenceThresholds {
  /** Milliseconds of silence before "Take your time." (0 disables the nudge). */
  thinkingMs: number
  /** Milliseconds of silence before offering to repeat or clarify (0 disables). */
  clarifyMs: number
}

export const DEFAULT_SILENCE: SilenceThresholds = { thinkingMs: 25_000, clarifyMs: 60_000 }

const pick = <T>(list: readonly T[], seed: number): T => list[Math.abs(seed) % list.length]

/** Picks from a pool while avoiding the phrase used last time. */
export function rotatePhrase(pool: readonly string[], seed: number, last?: string | null): string {
  if (pool.length === 1) return pool[0]
  const first = pick(pool, seed)
  if (first !== last) return first
  return pick(pool, seed + 1)
}

// ---------------------------------------------------------------------------
// Opening
// ---------------------------------------------------------------------------

const ROUND_WORDS: Record<SectionId, string> = {
  intro: 'a short introduction',
  resume: 'your recent work and projects',
  fundamentals: 'role fundamentals',
  technical: 'a technical discussion',
  coding: 'a coding problem',
  design: 'a system design discussion',
  behavioral: 'a few questions about how you work',
  wrapup: 'time for your questions',
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function interviewerTitle(context: Pick<InterviewContext, 'job'>, plan: Pick<InterviewPlan, 'sections'>): string {
  const ids = new Set(plan.sections.map((s) => s.id))
  if (ids.has('design') && !ids.has('coding')) return 'Engineering Interviewer'
  if (ids.has('coding') || ids.has('technical')) return 'Technical Interviewer'
  if (ids.has('behavioral') && !ids.has('technical')) return 'Hiring Manager'
  return /manager|lead/i.test(context.job.title) ? 'Engineering Interviewer' : 'Technical Interviewer'
}

/**
 * Realistic opening generated from the actual configuration. Never claims to
 * represent the company: the interviewer is preparing the learner *for* the
 * role. The final sentence is the intro question itself.
 */
export function buildOpening(context: InterviewContext, config: InterviewConfig, plan: InterviewPlan, candidateName?: string | null): string[] {
  const first = (candidateName || '').trim().split(/\s+/)[0] ?? ''
  // Only a real-looking first name is spoken; an email local part or a handle would sound wrong out loud.
  const name = /^[A-Za-z][A-Za-z'’-]{1,29}$/.test(first) ? first : ''
  const lines: string[] = []
  lines.push(name ? `Hi ${name}, thanks for joining.` : 'Hi, thanks for joining.')
  const kind = plan.sections.some((s) => s.id === 'coding' || s.id === 'technical' || s.id === 'design') ? 'technical interview' : 'interview'
  const label = plan.label.toLowerCase()
  if (plan.sections.length <= 2 || label.includes('only') || label.includes('drill') || label.includes('preview')) lines.push(`I'll be taking you through a ${label.includes('preview') ? 'short practice' : 'focused'} ${kind} today for the ${context.job.title} role you're preparing for.`)
  else lines.push(`I'll be taking you through the ${kind} today for the ${context.job.title} role you're preparing for.`)
  lines.push(`We'll spend around ${config.minutes} minutes together.`)
  const middle = plan.sections.filter((s) => s.id !== 'intro' && s.id !== 'wrapup').map((s) => ROUND_WORDS[s.id])
  if (middle.length) lines.push(`We'll start with your background, then move into ${joinList(middle)}, and leave a few minutes at the end for your questions.`)
  lines.push('Feel free to ask for clarification at any point, and take a moment to think before you answer if you need it.')
  return lines
}

// ---------------------------------------------------------------------------
// Acknowledgements and transitions
// ---------------------------------------------------------------------------

/** Neutral acknowledgements: never "great", "correct" or a lesson. */
export const ACKNOWLEDGEMENTS = ['Okay.', 'I see.', 'Alright.', 'Understood.', 'Thanks.', 'Okay, noted.', 'Right.'] as const
export const THIN_ACKNOWLEDGEMENTS = ['Okay.', 'Alright.', 'I see.', 'Okay, let me follow up on that.'] as const
export const FOLLOW_UP_LEADS = ["Let's dig into that a little more.", "Let's explore that.", 'One more thing on that.', 'Staying on this for a moment.', ''] as const
export const MOVE_ON = ["Alright. Let's move on to the next area.", "Okay. Let's change direction a little.", "Thanks. Let's move on.", "Alright, let's switch to something else.", "Okay. Moving on."] as const

const PRAISE = /\b(great|excellent|perfect|correct|incorrect|well done|good job|nice|awesome|brilliant|exactly right|you should study|you missed|the right answer|that's wrong|you're wrong)\b/i

/** Guards interviewer wording: praise, verdicts and teaching are not allowed during the interview. */
export function isNeutral(text: string): boolean {
  return !PRAISE.test(text)
}

export function acknowledge(seed: number, quality: 'none' | 'thin' | 'partial' | 'solid' | 'strong', last?: string | null): string {
  return rotatePhrase(quality === 'thin' || quality === 'none' ? THIN_ACKNOWLEDGEMENTS : ACKNOWLEDGEMENTS, seed, last)
}

export function followUpLead(seed: number, last?: string | null): string {
  return rotatePhrase(FOLLOW_UP_LEADS, seed, last)
}

const SECTION_INTRO: Record<SectionId, string[]> = {
  intro: [''],
  resume: ["I'd like to spend some time on your recent work.", "Let's talk about what you've built recently.", "Let's go through some of the work on your resume."],
  fundamentals: ["Let's cover some fundamentals for this role.", "I'll ask a few fundamentals next.", "Let's spend a few minutes on fundamentals."],
  technical: ["Let's go deeper technically.", "Let's move into the technical discussion.", 'Now some technical depth.'],
  coding: ["Let's move into the coding section. I'll describe a problem; ask anything you need to before you start, and walk me through your approach before you write code.", "Time for a coding problem. I'll explain it first; clarify anything you like, then talk me through your approach before coding."],
  design: ["Let's move into the design discussion. I'll give you the problem at a high level and you can ask me about requirements as you go.", "Next is system design. I'll keep the brief short on purpose; ask me for the requirements you need."],
  behavioral: ["Let's shift to how you work with others and handle problems.", "I'd like to ask about a few situations from your experience.", "Let's talk about some situations you've been in at work."],
  wrapup: ["That covers everything I wanted to discuss.", "That's everything from my side."],
}

/**
 * Sentence(s) spoken when the interviewer moves from one section to another.
 * Mentions the time only when it is meaningful (after the first third of the
 * interview or when the plan had to be shortened).
 */
export function transition(from: SectionId | null, to: SectionId, opts: { seed: number; remainingMinutes: number; totalMinutes: number; shortened?: boolean; last?: string | null }): string {
  if (to === 'intro' || from === to) return ''
  const parts: string[] = []
  const closer = from && from !== 'intro' ? rotatePhrase(MOVE_ON, opts.seed, opts.last).replace(/Let's move on to the next area\./, '').replace(/Let's move on\./, '').trim() : ''
  const timeAware = opts.remainingMinutes > 0 && (opts.shortened || (opts.remainingMinutes <= opts.totalMinutes * 0.6 && to !== 'wrapup'))
  const intro = rotatePhrase(SECTION_INTRO[to], opts.seed + 3, opts.last)
  if (to === 'wrapup') {
    parts.push(intro)
    return parts.join(' ').trim()
  }
  if (timeAware) {
    const minutes = Math.max(1, opts.remainingMinutes)
    parts.push(opts.shortened ? `We're a little short on time, so I'll keep the next part brief. ${intro}` : `We have about ${minutes} minute${minutes === 1 ? '' : 's'} left, so ${intro.charAt(0).toLowerCase()}${intro.slice(1)}`)
  } else {
    if (closer) parts.push(closer)
    parts.push(intro)
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// Candidate intent: repeat, clarify, assumption, thinking
// ---------------------------------------------------------------------------

const RE_REPEAT = /\b(repeat (that|the question|it|please)|say (that|it) again|come again|could you repeat|can you repeat|pardon|(didn'?t|did not) (catch|hear) (that|the question|you)|one more time|what was the question)\b/i
const RE_CLARIFY = /\b(what do you mean by|can you clarify|could you clarify|clarify what you mean|clarify the question|can you explain the question|what exactly (do you mean|are you asking)|do you mean|are you asking (about|for)|which (kind|type) of|by .{1,30} do you mean|what scale|how (much|many) (traffic|users|data|requests)|what are the (requirements|constraints)|is it ok(ay)? to|should i assume|can i ask (a|one) (quick )?question|quick question)\b/i
/** Short questions about the problem's parameters ("What consistency do you need?", "Which language?") are clarifications, not answers. */
const RE_PARAMETER_QUESTION = /^\s*(what|which|how|is|are|do|does|should|can|could|would|will)\b[^.]{0,80}\b(consisten\w*|latenc\w*|availab\w*|scale|traffic|users?|throughput|qps|retention|storage|budget|constraints?|requirements?|assum\w*|language|input|output|format|edge cases?|duplicates?|empty|size|region\w*|read|write|ratio|sla|uptime|durab\w*)\b[^.]{0,40}\?\s*$/i
const RE_ASSUMPTION = /\b(can i (make an|assume)|i'?ll assume|let me assume|assuming that|is it fine if i assume|may i assume)\b/i
const RE_THINKING = /^\s*(give me a (moment|second|minute)|let me think|one (moment|second)|hold on|thinking|hmm+|um+|let me (gather|collect) my thoughts)\b[^.!?]{0,40}[.!…]*\s*$/i

/** Classifies a candidate message. Short meta requests are handled without counting as an answer. */
export function classifyCandidateMessage(text: string): CandidateIntent {
  const t = (text || '').trim()
  if (!t) return 'answer'
  const words = t.split(/\s+/).length
  if (RE_THINKING.test(t)) return 'thinking'
  if (words <= 40) {
    if (RE_REPEAT.test(t) && !/\b(i (built|used|owned|worked)|for example)\b/i.test(t)) return 'repeat'
    if (RE_ASSUMPTION.test(t) && /\?\s*$/.test(t)) return 'assumption'
    if (RE_CLARIFY.test(t) && (/\?\s*$/.test(t) || words <= 18)) return 'clarify'
    if (words <= 14 && RE_PARAMETER_QUESTION.test(t)) return 'clarify'
    if (RE_ASSUMPTION.test(t) && words <= 20) return 'assumption'
  }
  return 'answer'
}

const DESIGN_REQUIREMENTS: { re: RegExp; answer: string }[] = [
  { re: /scale|traffic|users|qps|load|how many|volume/i, answer: 'Assume tens of thousands of daily active users to start, with traffic that can spike to ten times normal during peaks. Design for that, and tell me what changes if it grows further.' },
  { re: /latency|fast|response time|performance/i, answer: 'Reads should feel instant to users, so aim for well under a second at the 99th percentile; writes can take a little longer.' },
  { re: /consisten|stale|eventual/i, answer: 'Strong consistency where money or ownership is involved; elsewhere, brief staleness is acceptable if you can explain the window.' },
  { re: /availab|downtime|region|sla/i, answer: 'Treat it as a production service: high availability matters more than squeezing cost, and a single region is fine to start.' },
  { re: /storage|retention|how long|data size|retain/i, answer: 'Keep the data for at least a year; the volume grows with usage, so say how you would estimate it.' },
  { re: /auth|security|permission|who can/i, answer: 'Assume users are already authenticated; you decide the authorisation model and mention where it is enforced.' },
  { re: /read|write|ratio/i, answer: 'Reads dominate, roughly ten reads for every write, but writes must not be lost.' },
  { re: /feature|scope|include|out of scope|functional/i, answer: "Focus on the core flow first. I'd rather see one path designed well than every feature listed." },
]

/** Bounded, non-revealing reply to a clarification or repeat request. Design questions reveal requirements progressively. */
export function clarificationReply(question: InterviewQuestion, intent: Exclude<CandidateIntent, 'answer'>, text: string, seed: number): string {
  if (intent === 'thinking') return rotatePhrase(['Take your time.', 'Of course, take a moment.', 'Sure. Take your time.'], seed)
  if (intent === 'assumption') return rotatePhrase(['Yes, go ahead. State the assumption and continue.', "That's fine. Tell me what you're assuming and build on it.", 'Sure. Make the assumption explicit and carry on.'], seed)
  if (intent === 'repeat') return `${rotatePhrase(['Of course.', 'Sure.', 'Certainly.'], seed)} ${question.prompt}`
  // clarify
  if (question.kind === 'design') {
    const req = DESIGN_REQUIREMENTS.find((r) => r.re.test(text))
    if (req) return req.answer
    return "Good question. Take it as an open-ended design: state the requirements you're assuming, and I'll push back where they matter."
  }
  if (question.kind === 'coding') {
    if (/input|empty|null|negative|duplicate|size|constraint|range/i.test(text)) return 'Assume the input can be empty and can contain duplicates and negative values; sizes can be large, so efficiency matters. Handle those explicitly.'
    if (/language|which language|can i use/i.test(text)) return 'Use whichever language you are most comfortable with; I care about the approach and the reasoning.'
    if (/output|return|format/i.test(text)) return 'Return the result in whatever form is natural for the language; just be explicit about what it holds.'
    return "Sure. Restate the problem in your own words so we agree on it, then tell me the assumptions you're making before you code."
  }
  if (question.kind === 'behavioral') return "Sure. I'm asking for a specific situation you were personally in: what was happening, what you did, and how it turned out."
  if (question.kind === 'resume') return `Sure. I'm asking about ${question.area.replace(/^(Project|Experience): /, '')} specifically: your own part in it and the decisions behind it.`
  if (question.kind === 'technical') return `Sure. Take it as a question about ${question.area}: what it is in your words, where you have applied it, and what to watch out for. Start wherever feels natural.`
  return `Sure. ${question.prompt}`
}

// ---------------------------------------------------------------------------
// Session memory
// ---------------------------------------------------------------------------

/** Recognised technology mentions and how the interviewer says them back. */
const TECH_DISPLAY: Record<string, string> = { react: 'React', 'next.js': 'Next.js', nextjs: 'Next.js', node: 'Node', 'node.js': 'Node.js', express: 'Express', java: 'Java', spring: 'Spring', 'spring boot': 'Spring Boot', kotlin: 'Kotlin', python: 'Python', django: 'Django', flask: 'Flask', golang: 'Go', rust: 'Rust', typescript: 'TypeScript', javascript: 'JavaScript', postgres: 'Postgres', postgresql: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB', redis: 'Redis', kafka: 'Kafka', rabbitmq: 'RabbitMQ', docker: 'Docker', kubernetes: 'Kubernetes', aws: 'AWS', gcp: 'GCP', azure: 'Azure', graphql: 'GraphQL', grpc: 'gRPC', microservices: 'microservices', elasticsearch: 'Elasticsearch', terraform: 'Terraform', 'ci/cd': 'CI/CD' }
const TECH_TERMS = Object.keys(TECH_DISPLAY)
const RE_OWNERSHIP = /\b(i (mainly|mostly|primarily) (worked on|owned|handled|built|did|focused on) ([^.,;]{3,60}))/i
const RE_ROLE = /\b(i (am|'m|was|have been) (a|an|the) ([a-z -]{3,40}?(developer|engineer|analyst|architect|manager|intern|lead)))/i
const RE_YEARS = /\b((\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\+?\s*(years?|yrs?) (of )?(experience|in|with|working))\b/i

/** Extracts short, quotable facts from an answer. Only what the learner actually said is stored. */
export function extractFacts(text: string, questionId: string): MemoryFact[] {
  const out: MemoryFact[] = []
  const t = (text || '').replace(/\s+/g, ' ').trim()
  if (!t) return out
  const own = RE_OWNERSHIP.exec(t)
  if (own) out.push({ text: own[1].trim().replace(/\.$/, ''), terms: termsIn(own[4]), questionId })
  const role = RE_ROLE.exec(t)
  if (role) out.push({ text: role[1].trim(), terms: termsIn(role[4]), questionId })
  const years = RE_YEARS.exec(t)
  if (years) out.push({ text: years[1].trim(), terms: ['experience'], questionId })
  const matched = TECH_TERMS.filter((k) => new RegExp(`\\b${k.replace(/[.+/]/g, '\\$&')}\\b`, 'i').test(t))
  // "spring" inside "spring boot" (or "node" inside "node.js") is the same mention.
  const tech = matched.filter((k) => !matched.some((other) => other !== k && other.includes(k)))
  if (tech.length) out.push({ text: `worked with ${joinList(tech.slice(0, 4).map((k) => TECH_DISPLAY[k]))}`, terms: tech, questionId })
  return out.slice(0, 4)
}

function termsIn(s: string): string[] {
  const low = s.toLowerCase()
  const terms = TECH_TERMS.filter((k) => low.includes(k))
  const words = low.split(/[^a-z0-9.+#-]+/).filter((w) => w.length >= 4)
  return Array.from(new Set([...terms, ...words])).slice(0, 8)
}

/** Merges new facts into memory without duplicates; bounded. */
export function remember(memory: MemoryFact[], facts: MemoryFact[]): MemoryFact[] {
  const out = [...memory]
  for (const f of facts) if (!out.some((m) => m.text.toLowerCase() === f.text.toLowerCase())) out.push(f)
  return out.slice(-24)
}

/** A fact the interviewer can naturally refer to before this question, or null. */
export function relevantFact(memory: MemoryFact[], question: InterviewQuestion, alreadyUsed: string[]): MemoryFact | null {
  const hay = `${question.prompt} ${question.area} ${question.expectedConcepts.join(' ')}`.toLowerCase()
  for (const f of [...memory].reverse()) {
    if (alreadyUsed.includes(f.text) || f.questionId === question.id) continue
    if (f.terms.some((t) => t.length >= 4 && hay.includes(t))) return f
  }
  return null
}

/** Prefixes a question with a natural back-reference ("Earlier you mentioned..."). */
export function personalize(prompt: string, fact: MemoryFact, seed: number): string {
  const lead = rotatePhrase([`Earlier you mentioned you ${stripI(fact.text)}.`, `You said earlier that you ${stripI(fact.text)}.`, `Coming back to something you said: you ${stripI(fact.text)}.`], seed)
  return `${lead} ${prompt}`
}

const stripI = (s: string) => s.replace(/^i\s+('m|am)\s+/i, 'are ').replace(/^i\s+(was|have been)\s+/i, 'were ').replace(/^i\s+/i, '')

/** Whether the question asks for something the learner already stated (skip it unless intentionally revisiting). */
export function alreadyAnswered(memory: MemoryFact[], question: InterviewQuestion): boolean {
  if (question.kind !== 'intro') return false
  return memory.some((f) => /developer|engineer|years/.test(f.text))
}

// ---------------------------------------------------------------------------
// Time management
// ---------------------------------------------------------------------------

export interface TimeDecision {
  /** Question ids to drop from the remaining plan. */
  drop: string[]
  /** True when something was shortened at this step. */
  shortened: boolean
  /** True when the interviewer should go straight to wrap-up after the current question. */
  wrapUp: boolean
}

/**
 * Keeps the interview inside its time budget without cutting anyone off:
 * when the remaining questions cannot fit, later optional questions are
 * dropped, keeping at least one question per included section and the
 * wrap-up. Called after every completed question.
 */
export function manageTime(plan: InterviewPlan, state: { index: number; dropped: string[] }, elapsedMs: number, totalMinutes: number): TimeDecision {
  const remainingMs = totalMinutes * 60_000 - elapsedMs
  const dropped = new Set(state.dropped)
  const upcoming = plan.questions.slice(state.index).filter((q) => !dropped.has(q.id))
  const wrapup = upcoming.filter((q) => q.kind === 'wrapup')
  const body = upcoming.filter((q) => q.kind !== 'wrapup')
  if (remainingMs <= 60_000) return { drop: body.map((q) => q.id), shortened: body.length > 0, wrapUp: true }
  const wrapMinutes = wrapup.reduce((s, q) => s + q.minutes, 0)
  let available = remainingMs / 60_000 - wrapMinutes
  const need = body.reduce((s, q) => s + q.minutes, 0)
  if (need <= available) return { drop: [], shortened: false, wrapUp: false }
  // Drop from the end, keeping the first question of every section.
  const keep = new Set<string>()
  for (const s of plan.sections) {
    const first = s.questionIds.find((id) => body.some((q) => q.id === id))
    if (first) keep.add(first)
  }
  const drop: string[] = []
  for (const q of [...body].reverse()) {
    if (need - drop.reduce((s, id) => s + (plan.questions.find((x) => x.id === id)?.minutes ?? 0), 0) <= available) break
    if (keep.has(q.id)) continue
    drop.push(q.id)
  }
  // Still too long: a real interviewer keeps one question per area and runs the heavy rounds shorter rather than skipping
  // a whole area, so a modest overrun is accepted before any kept question goes; beyond that, cut from the end (never the current question).
  let stillNeed = need - drop.reduce((s, id) => s + (plan.questions.find((x) => x.id === id)?.minutes ?? 0), 0)
  for (const q of [...body].reverse()) {
    if (stillNeed <= available * 1.35 || drop.length >= body.length - 1) break
    if (drop.includes(q.id) || q.id === body[0].id) continue
    drop.push(q.id)
    stillNeed -= q.minutes
  }
  return { drop, shortened: drop.length > 0, wrapUp: false }
}

// ---------------------------------------------------------------------------
// Closing
// ---------------------------------------------------------------------------


export const FAREWELL = "Thanks for your time. We'll end the mock interview here. Your feedback is ready to review."
export const TIME_UP_WRAPUP = "We're at time, so let's wrap up here. Before we finish, do you have any questions you would like to ask me?"

const RE_NO_QUESTIONS = /^\s*(no|nope|not really|none|nothing|i'?m good|no questions?|no thanks?|that'?s all|i (don'?t|do not) have any( questions?)?|all good|nothing from my side)\b[\s\S]{0,40}$/i

/** Deterministic answers to candidate questions: general interview and process topics only; never company facts. */
export function answerCandidateQuestion(text: string, jobTitle: string, companyName: string): { answer: string; askedNothing: boolean } {
  const t = (text || '').trim()
  if (!t || RE_NO_QUESTIONS.test(t)) return { answer: '', askedNothing: true }
  const company = companyName ? `${companyName}'s` : "the company's"
  let answer: string
  if (/how (did|have) i (do|done|perform)|feedback|how was (that|my|it)|did i pass|my performance|score|rating|hire/i.test(t)) answer = "I can't share an assessment during the interview itself. The detailed feedback, with what each answer showed and what was missing, opens as soon as we finish."
  else if (/next step|process|what happens (next|after)|how many rounds|timeline|when will i hear/i.test(t)) answer = `I can't speak for ${company} process specifically. In general, a loop like this is followed by a debrief where interviewers compare notes against the role's expectations, and the recruiter shares the outcome and any next round.`
  else if (/team|who (would|will) i work with|day[- ]to[- ]day|typical day|what does the team/i.test(t)) answer = `I don't have inside information about ${company} team. It's a good question to ask a real interviewer: how the team is organised, what a typical week looks like for a ${jobTitle}, and how work gets prioritised.`
  else if (/success|first (90|ninety|30|thirty) days|expect(ations)? (in|for) the first|measured|how is success/i.test(t)) answer = `That's exactly the kind of question worth asking in a real loop. I can't answer for ${company} specifics, but typically a new ${jobTitle} is expected to ship something small within the first month and own a meaningful area within the first quarter.`
  else if (/tech stack|which (technolog|tools)|what (do you|does the team) use|stack/i.test(t)) answer = `The listing itself is the best evidence for the stack; I won't invent details about ${company} internals. Do ask a real interviewer how they make technology choices and what they are moving away from.`
  else if (/remote|hybrid|work from home|office|location|relocat/i.test(t)) answer = `Work arrangements are a fair question for the recruiter or hiring manager; I can't speak for ${company} policy.`
  else if (/salary|compensation|pay|ctc|equity|bonus/i.test(t)) answer = 'Compensation is usually a conversation for the recruiter rather than the technical interview. In a real loop, ask when the process reaches the offer stage.'
  else if (/culture|values|work[- ]life|hours|on[- ]call/i.test(t)) answer = `Culture and on-call expectations are good questions for a real interviewer. I can't describe ${company} culture, so I'd suggest asking for concrete examples rather than adjectives.`
  else if (/improve|what should i (work on|study|learn|focus)|advice|tips?/i.test(t)) answer = "I'll hold specific advice until we're done: the feedback that follows maps each weak spot to what to work on."
  else answer = "That's a reasonable question to bring to a real interviewer. I can't speak for the company, and I'll keep any assessment for the feedback after we finish."
  return { answer, askedNothing: false }
}

// ---------------------------------------------------------------------------
// Replay timeline
// ---------------------------------------------------------------------------

export interface TimelineEntry {
  offsetMs: number
  sectionId: SectionId
  title: string
  questionIds: string[]
  turns: number
}

/** Section timeline from stored turn timestamps; there is no audio, so replay means transcript and timing. */
export function buildTimeline(plan: InterviewPlan, turns: TurnRecord[], startedAt: string): TimelineEntry[] {
  const start = new Date(startedAt).getTime()
  const bySection = new Map<SectionId, TimelineEntry>()
  for (const t of turns) {
    const q = plan.questions.find((x) => x.id === t.questionId)
    if (!q) continue
    const at = Math.max(0, new Date(t.at).getTime() - start)
    const e = bySection.get(q.sectionId)
    if (!e) bySection.set(q.sectionId, { offsetMs: at, sectionId: q.sectionId, title: SECTION_TITLES[q.sectionId], questionIds: [q.id], turns: 1 })
    else {
      e.offsetMs = Math.min(e.offsetMs, at)
      if (!e.questionIds.includes(q.id)) e.questionIds.push(q.id)
      e.turns += 1
    }
  }
  return Array.from(bySection.values()).sort((a, b) => a.offsetMs - b.offsetMs)
}

export function formatOffset(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
