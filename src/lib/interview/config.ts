import type { AIMessage } from '../aiGatewayClient'
import type { InterviewDimension, InterviewTurn, MockInterviewSummary } from '../../types'

export type RoundGroup = 'Coding' | 'Design' | 'Behavioural' | 'Technical' | 'Curriculum' | string

export interface InterviewRound {
  id: string
  label: string
  group: RoundGroup
  /** Learning-track family for browsing the curriculum interview catalogue. */
  family?: string
  /** One-line description shown on the setup card. */
  blurb: string
  /** What a good interviewer covers; injected into the interviewer brief. */
  brief: string
  /** Learner works in the code editor during this round. */
  coding?: boolean
  /** Learner sketches a Mermaid diagram during this round. */
  design?: boolean
  defaultLanguage?: string
  dimensions: string[]
}

export const ROUNDS: InterviewRound[] = [
  {
    id: 'dsa',
    label: 'DSA coding',
    group: 'Coding',
    blurb: 'One or two algorithm problems, solved live in the editor with complexity discussion.',
    brief:
      'Run a data-structures and algorithms coding round. Pick problems of the requested difficulty in the style of product-company interviews (arrays, strings, hashing, two pointers, trees, graphs, DP, heaps). Give the problem statement with an example. Expect the candidate to clarify, think aloud, write working code in the editor, walk through a dry run, state time and space complexity, and handle edge cases. Push for a better approach when the first one is brute force. Ask a second problem only if time allows.',
    coding: true,
    defaultLanguage: 'java',
    dimensions: ['Problem solving', 'Code quality', 'Complexity analysis', 'Edge cases and testing', 'Communication'],
  },
  {
    id: 'system-design',
    label: 'System design (HLD)',
    group: 'Design',
    blurb: 'Design a product at scale: requirements, architecture, data, trade-offs.',
    brief:
      'Run a high-level system design round for a well-known product (for example a URL shortener, news feed, chat, ride matching, file storage, rate limiter, notification system, or a payments ledger). Start with a short prompt, then expect the candidate to gather functional and non-functional requirements, estimate scale, propose a high-level architecture, choose data stores, and deep dive into one or two components (consistency, caching, sharding, queues, failure handling). Probe trade-offs; ask "what breaks at 10x?". The candidate can share a Mermaid diagram; comment on it.',
    design: true,
    dimensions: ['Requirements and scoping', 'High-level architecture', 'Deep dive and trade-offs', 'Scalability and reliability', 'Communication'],
  },
  {
    id: 'lld',
    label: 'Low-level design',
    group: 'Design',
    blurb: 'Classes, interfaces and patterns for a bounded problem such as a parking lot.',
    brief:
      'Run a low-level (object-oriented) design round: a bounded problem such as a parking lot, elevator, library, splitwise, vending machine, or a cache with eviction. Expect requirements, entities and relationships, class or interface sketches with responsibilities, use of suitable patterns (strategy, observer, factory, state), concurrency considerations where relevant, and extensibility. The candidate can share code or a class diagram.',
    coding: true,
    defaultLanguage: 'java',
    dimensions: ['Requirements and modelling', 'Class design and patterns', 'Extensibility', 'Concurrency and edge cases', 'Communication'],
  },
  {
    id: 'behavioral',
    label: 'Behavioural (STAR)',
    group: 'Behavioural',
    blurb: 'Leadership-principle style questions about ownership, conflict and impact.',
    brief:
      'Run a behavioural round in the style of product-company hiring managers. Ask about ownership, conflict, failure, ambiguity, mentoring, disagree-and-commit, delivering under pressure, and impact. Expect STAR-structured answers with concrete details and numbers; probe for the candidate\'s personal contribution ("what did you do, specifically?"), the outcome, and what they would do differently. Do not accept vague or hypothetical answers.',
    dimensions: ['Structure (STAR)', 'Impact and results', 'Ownership', 'Self-awareness', 'Communication'],
  },
  {
    id: 'java',
    label: 'Core Java',
    group: 'Technical',
    blurb: 'JVM, collections, concurrency, streams and design questions.',
    brief:
      'Run a Core Java technical round: JVM memory and garbage collection, equals/hashCode, collections internals (HashMap, ConcurrentHashMap), generics, immutability, exceptions, Java 8+ features (streams, Optional, records), concurrency (threads, executors, synchronized vs locks, volatile, CompletableFuture) and a small coding exercise. Probe for the "why" behind each answer.',
    coding: true,
    defaultLanguage: 'java',
    dimensions: ['Depth of knowledge', 'Accuracy', 'Practical experience', 'Code and problem solving', 'Communication'],
  },
  {
    id: 'javascript',
    label: 'JavaScript & TypeScript',
    group: 'Technical',
    blurb: 'Event loop, closures, prototypes, async, and TypeScript types.',
    brief:
      'Run a JavaScript and TypeScript technical round: event loop and microtasks, closures and scope, this binding, prototypes and classes, promises and async/await, error handling, modules, common output-prediction snippets, and TypeScript generics, narrowing, utility types. Include one small coding exercise (debounce, deep clone, promise pool, or similar).',
    coding: true,
    defaultLanguage: 'javascript',
    dimensions: ['Depth of knowledge', 'Accuracy', 'Practical experience', 'Code and problem solving', 'Communication'],
  },
  {
    id: 'react',
    label: 'React & Next.js',
    group: 'Technical',
    blurb: 'Rendering, hooks, state, performance and Next.js data fetching.',
    brief:
      'Run a React and Next.js round: reconciliation and rendering, hooks rules and pitfalls (useEffect dependencies, stale closures), state management choices, memoisation, performance profiling, accessibility, testing, and Next.js app router concepts (server components, data fetching, caching, streaming). Ask the candidate to sketch a component or hook in the editor when useful.',
    coding: true,
    defaultLanguage: 'typescript',
    dimensions: ['Depth of knowledge', 'Accuracy', 'Practical experience', 'Code and problem solving', 'Communication'],
  },
  {
    id: 'node',
    label: 'Node.js & backend',
    group: 'Technical',
    blurb: 'Event loop, streams, APIs, auth, caching and reliability.',
    brief:
      'Run a Node.js and backend round: event loop phases, streams and backpressure, clustering, REST and API design, authentication and authorization, validation, caching, rate limiting, idempotency, message queues, observability, and failure handling. Include a short design or coding exercise such as a middleware, a retry with backoff, or an idempotent endpoint.',
    coding: true,
    defaultLanguage: 'javascript',
    dimensions: ['Depth of knowledge', 'Accuracy', 'Practical experience', 'Code and problem solving', 'Communication'],
  },
  {
    id: 'sql',
    label: 'SQL & databases',
    group: 'Technical',
    blurb: 'Joins, window functions, indexes, transactions and schema design.',
    brief:
      'Run a SQL and databases round: joins and aggregation, window functions, query-writing exercises against a small schema you describe, indexing and query plans, normalisation, transactions and isolation levels, locking, and schema design for a given feature. Expect the candidate to write SQL in the editor and explain how it executes.',
    coding: true,
    defaultLanguage: 'sql',
    dimensions: ['Query writing', 'Indexing and performance', 'Transactions and consistency', 'Schema design', 'Communication'],
  },
  {
    id: 'cs',
    label: 'CS fundamentals',
    group: 'Technical',
    blurb: 'Operating systems, networking, DBMS and OOP basics.',
    brief:
      'Run a computer-science fundamentals round: processes and threads, scheduling, memory management and virtual memory, deadlocks, TCP vs UDP, what happens when you type a URL, HTTP and TLS, DNS, DBMS concepts (ACID, indexing, normalisation), and OOP principles. Favour "explain how it works" questions with follow-ups.',
    dimensions: ['Depth of knowledge', 'Accuracy', 'Reasoning', 'Breadth', 'Communication'],
  },
  {
    id: 'devops',
    label: 'DevOps & cloud',
    group: 'Technical',
    blurb: 'CI/CD, containers, Kubernetes, cloud, observability and security.',
    brief:
      'Run a DevOps and cloud round: CI/CD pipeline design, Docker and image hygiene, Kubernetes primitives and rollouts, infrastructure as code, cloud networking basics, secrets management, observability (logs, metrics, traces, SLOs), incident response, and security basics. Include one scenario question such as "a deploy doubled p99 latency, walk me through it".',
    dimensions: ['Depth of knowledge', 'Accuracy', 'Operational judgement', 'Security awareness', 'Communication'],
  },
]

export function roundById(id: string | undefined | null): InterviewRound {
  return ROUNDS.find((r) => r.id === id) || ROUNDS[0]
}

/** Best-fit round for a learning track title (used when a plan task says "Take Mock Interview"). */
export function roundForTrack(title: string | undefined | null): string {
  const t = (title || '').toLowerCase()
  if (/dsa|algorithm|competitive/.test(t)) return 'dsa'
  if (/high-level|hld|system design/.test(t)) return 'system-design'
  if (/low-level|lld|object/.test(t)) return 'lld'
  if (/\bjava\b|core java/.test(t) && !/javascript/.test(t)) return 'java'
  if (/javascript|typescript/.test(t)) return 'javascript'
  if (/react|next/.test(t)) return 'react'
  if (/node|backend/.test(t)) return 'node'
  if (/sql|database|postgres/.test(t)) return 'sql'
  if (/devops|cloud|docker|ci/.test(t)) return 'devops'
  if (/cs |fundamental|operating|network/.test(t)) return 'cs'
  if (/behav|hr|star/.test(t)) return 'behavioral'
  return 'dsa'
}

export const LEVELS = [
  { id: 'Easy', label: 'Easy', hint: 'Entry level, warm-ups and fundamentals' },
  { id: 'Medium', label: 'Medium', hint: 'SDE-1 / SDE-2 bar at product companies' },
  { id: 'Hard', label: 'Hard', hint: 'Senior bar, ambiguity and depth' },
] as const

export type Level = (typeof LEVELS)[number]['id']

export const DURATIONS = [20, 30, 45] as const
export type Duration = (typeof DURATIONS)[number]

export interface Persona {
  id: 'supportive' | 'standard' | 'bar-raiser'
  name: string
  title: string
  /** Shown to the learner. */
  blurb: string
  /** Given to the model. */
  style: string
}

export const PERSONAS: Persona[] = [
  {
    id: 'supportive',
    name: 'Ananya',
    title: 'Senior Software Engineer',
    blurb: 'Encouraging, nudges you along, good for a first mock.',
    style: 'Warm and encouraging. Acknowledge good points briefly, nudge gently when the candidate is stuck, and keep the atmosphere relaxed while still covering the material.',
  },
  {
    id: 'standard',
    name: 'Rahul',
    title: 'Staff Engineer',
    blurb: 'Neutral and professional, like a typical on-site round.',
    style: 'Neutral and professional. Do not reveal whether answers are right or wrong; probe with follow-ups, ask for justification and move on when satisfied, exactly like a real on-site interviewer.',
  },
  {
    id: 'bar-raiser',
    name: 'Meera',
    title: 'Engineering Manager, bar raiser',
    blurb: 'Skeptical and demanding; expect pushback and deep follow-ups.',
    style: 'Skeptical and demanding. Challenge assumptions, ask "why" repeatedly, interrupt hand-waving, insist on specifics and numbers, and raise the bar when the candidate does well. Stay respectful.',
  },
]

export function personaById(id: string | undefined | null): Persona {
  return PERSONAS.find((p) => p.id === id) || PERSONAS[1]
}

export interface InterviewSetup {
  roundId: string
  level: Level
  minutes: Duration
  personaId: Persona['id']
  voice: boolean
  candidateName?: string
}

/** What the interviewer model must return on every turn. */
export interface InterviewerTurn {
  say: string
  stage: 'intro' | 'question' | 'follow_up' | 'closing' | 'done'
  question: number
  note: string
}

function questionBudget(round: InterviewRound, minutes: number): string {
  if (round.group === 'Design') return '1 design problem, explored in depth'
  if (round.group === 'Coding') return minutes >= 45 ? '2 problems' : '1 problem, a second only if time clearly allows'
  if (round.group === 'Behavioural') return minutes >= 45 ? '4 to 5 questions' : minutes >= 30 ? '3 to 4 questions' : '2 to 3 questions'
  return minutes >= 45 ? '6 to 8 questions with follow-ups' : minutes >= 30 ? '4 to 6 questions with follow-ups' : '3 to 4 questions with follow-ups'
}

export function buildInterviewerSystemPrompt(setup: InterviewSetup): string {
  const round = roundById(setup.roundId)
  const persona = personaById(setup.personaId)
  const name = setup.candidateName?.trim() || 'the candidate'
  return [
    `You are ${persona.name}, ${persona.title} at a product-based technology company, conducting a live ${round.label} interview round with ${name}.`,
    `Level: ${setup.level}. Planned length: ${setup.minutes} minutes. Plan for ${questionBudget(round, setup.minutes)}.`,
    `Interviewer style: ${persona.style}`,
    `Round brief: ${round.brief}`,
    '',
    'How to behave:',
    '- Sound like a real person speaking in an interview: short turns of two to five sentences, no headings, no bullet lists, no lectures. Code snippets only when you must show one.',
    '- Open with a one-line greeting and a one-line description of how the round will go, then ask the first question in the same turn.',
    '- Ask exactly one question at a time. Wait for the answer. Probe vague answers with specific follow-ups. Never answer your own question or give the solution unless the candidate explicitly gives up on it, and even then only outline it.',
    '- When the candidate asks for a hint, give the smallest useful nudge and record it in your note. Do not volunteer hints otherwise.',
    '- If the candidate shares code or a diagram, read it carefully, point at concrete lines or components, ask about bugs, edge cases, complexity and trade-offs.',
    '- Each user message ends with a bracketed status line with the time remaining. When fewer than 3 minutes remain, or all planned questions are done, move to closing: thank them, ask if they have a question for you, answer it briefly, and then end.',
    '- Stay in character. Do not mention that you are an AI, do not grade out loud, and do not summarise performance during the interview.',
    '',
    'Respond ONLY with a JSON object of this shape:',
    '{"say": "<what you say to the candidate, plain text with optional markdown code fences>", "stage": "intro" | "question" | "follow_up" | "closing" | "done", "question": <number of the current question starting at 1>, "note": "<one private line for the hiring committee about the candidate\'s last answer; empty string on the first turn>"}',
    'Use stage "done" only for your final farewell turn.',
  ].join('\n')
}

export function formatTurnForModel(turn: InterviewTurn): string {
  let text = turn.content.trim()
  if (turn.kind === 'hint') text = text || 'Could I get a hint?'
  if (turn.code?.trim()) {
    text += `\n\n\`\`\`${turn.language || ''}\n${turn.code.trim()}\n\`\`\``
  }
  if (turn.diagram?.trim()) {
    text += `\n\nDiagram (Mermaid):\n\`\`\`mermaid\n${turn.diagram.trim()}\n\`\`\``
  }
  return text
}

export function buildInterviewerMessages(setup: InterviewSetup, turns: InterviewTurn[], remainingMinutes: number): AIMessage[] {
  const messages: AIMessage[] = [{ role: 'system', content: buildInterviewerSystemPrompt(setup) }]
  if (turns.length === 0) {
    messages.push({ role: 'user', content: `[The candidate has joined the call. Time remaining: ${remainingMinutes} minutes. Begin.]` })
    return messages
  }
  turns.forEach((turn, i) => {
    if (turn.role === 'interviewer') {
      messages.push({ role: 'assistant', content: JSON.stringify({ say: turn.content, stage: turn.stage || 'question', question: turn.question || 1, note: turn.note || '' }) })
    } else {
      const last = i === turns.length - 1
      const status = last ? `\n\n[Time remaining: ${remainingMinutes} minutes${remainingMinutes < 3 ? '. Wrap up now.' : ''}]` : ''
      messages.push({ role: 'user', content: formatTurnForModel(turn) + status })
    }
  })
  return messages
}

export interface Scorecard {
  overall: number
  verdict: MockInterviewSummary['verdict']
  summary: string
  dimensions: InterviewDimension[]
  strengths: string[]
  improvements: string[]
  modelAnswers: { question: string; answer: string }[]
  recommendedTopics: string[]
  nextSteps: string[]
}

export const VERDICTS: NonNullable<MockInterviewSummary['verdict']>[] = ['Strong hire', 'Hire', 'Lean hire', 'Lean no hire', 'No hire']

export function buildScorecardMessages(setup: InterviewSetup, turns: InterviewTurn[], hintsUsed: number, elapsedMinutes: number): AIMessage[] {
  const round = roundById(setup.roundId)
  const persona = personaById(setup.personaId)
  const transcript = turns
    .map((t) => {
      if (t.role === 'interviewer') return `INTERVIEWER (${persona.name}): ${t.content}${t.note ? `\n  [private note: ${t.note}]` : ''}`
      return `CANDIDATE${t.kind === 'hint' ? ' (asked for a hint)' : ''}: ${formatTurnForModel(t)}`
    })
    .join('\n\n')
  const system = [
    'You are the hiring committee reviewer at a product-based technology company. You read a mock interview transcript and write an honest, specific, useful scorecard for the candidate.',
    `Round: ${round.label} (${round.group}). Level: ${setup.level}. Planned ${setup.minutes} minutes, actual ${elapsedMinutes} minutes. Hints requested: ${hintsUsed}.`,
    `Score these dimensions from 1 to 5: ${round.dimensions.join('; ')}.`,
    'Be calibrated: 5 means clearly above the bar for the level, 3 means borderline, 1 means well below. Short or missing answers score low. Quote or paraphrase what the candidate actually said when giving feedback. Model answers should be concise but complete enough to learn from (code allowed in markdown fences).',
    'Respond ONLY with a JSON object of this shape:',
    JSON.stringify({
      overall: '<0-100 integer>',
      verdict: `<one of: ${VERDICTS.join(' | ')}>`,
      summary: '<3-4 sentence overall assessment addressed to the candidate>',
      dimensions: [{ name: '<dimension>', score: '<1-5 integer>', comment: '<one or two specific sentences>' }],
      strengths: ['<specific strength>'],
      improvements: ['<specific, actionable improvement>'],
      modelAnswers: [{ question: '<question asked>', answer: '<what a strong answer looks like>' }],
      recommendedTopics: ['<topic to revise>'],
      nextSteps: ['<what to do before the next mock>'],
    }),
  ].join('\n')
  return [
    { role: 'system', content: system },
    { role: 'user', content: `TRANSCRIPT\n\n${transcript || '(The candidate did not answer anything.)'}` },
  ]
}

function toInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function toStrings(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (typeof v === 'string' ? v : typeof v === 'object' && v ? JSON.stringify(v) : String(v ?? '')))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, limit)
}

/** Coerces whatever the model returned into a well-formed scorecard. */
export function normalizeScorecard(raw: Record<string, unknown>, round: InterviewRound): Scorecard {
  const dimensions: InterviewDimension[] = Array.isArray(raw.dimensions)
    ? (raw.dimensions as Record<string, unknown>[])
        .filter((d) => d && typeof d === 'object')
        .map((d) => ({ name: String(d.name || '').trim() || 'Dimension', score: toInt(d.score, 3, 1, 5), comment: String(d.comment || '').trim() }))
        .slice(0, 8)
    : []
  for (const name of round.dimensions) {
    if (!dimensions.some((d) => d.name.toLowerCase() === name.toLowerCase())) dimensions.push({ name, score: 3, comment: '' })
  }
  const verdictRaw = String(raw.verdict || '').trim()
  const verdict = VERDICTS.find((v) => v.toLowerCase() === verdictRaw.toLowerCase())
  const avg = dimensions.length ? dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length : 3
  const overall = toInt(raw.overall, Math.round(((avg - 1) / 4) * 100), 0, 100)
  const modelAnswers = Array.isArray(raw.modelAnswers)
    ? (raw.modelAnswers as Record<string, unknown>[])
        .filter((m) => m && typeof m === 'object')
        .map((m) => ({ question: String(m.question || '').trim(), answer: String(m.answer || '').trim() }))
        .filter((m) => m.question && m.answer)
        .slice(0, 8)
    : []
  return {
    overall,
    verdict: verdict || (overall >= 85 ? 'Strong hire' : overall >= 70 ? 'Hire' : overall >= 55 ? 'Lean hire' : overall >= 40 ? 'Lean no hire' : 'No hire'),
    summary: String(raw.summary || '').trim(),
    dimensions,
    strengths: toStrings(raw.strengths),
    improvements: toStrings(raw.improvements),
    modelAnswers,
    recommendedTopics: toStrings(raw.recommendedTopics),
    nextSteps: toStrings(raw.nextSteps, 5),
  }
}

export function verdictTone(verdict: MockInterviewSummary['verdict'] | undefined): 'good' | 'ok' | 'bad' {
  if (verdict === 'Strong hire' || verdict === 'Hire') return 'good'
  if (verdict === 'Lean hire') return 'ok'
  return 'bad'
}

/** Text-only version of an interviewer line for speech synthesis. */
export function speakableText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' Take a look at the snippet I shared. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
