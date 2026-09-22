import type { TopicDiagram } from '../types'

/**
 * Prompt templates for the "Explain this topic with AI" note, chosen per track.
 *
 * - DSA and the language tracks: a from-zero lesson with code.
 * - React, Node, SQL, DevOps, CS fundamentals: the same lesson shape with the
 *   track's own language (TSX, Node TypeScript, SQL, shell/YAML, pseudo-code)
 *   and extra sections that matter for that field (request flow, query
 *   results, pipeline diagram, mental-model diagram, numbers to remember).
 * - HLD: an interview-style system design walkthrough with diagrams.
 * - LLD: an object design with class and sequence diagrams and a code skeleton.
 */

export type ExplainMode = 'concept' | 'react' | 'node' | 'sql' | 'devops' | 'cs' | 'hld' | 'lld'

export interface CodeProfile {
  /** Human wording used in prompts and button labels. */
  label: string
  /** Highlighter / editor id for generated snippets. */
  id: string
  /** True when the track dictates the language and the picker is hidden. */
  fixed: boolean
}

const PREFERRED_IDS: Record<string, string> = { Java: 'java', JavaScript: 'javascript', TypeScript: 'typescript', Python: 'python', 'C++': 'cpp', Go: 'go' }

export function explainModeForTrack(trackId?: string): ExplainMode {
  switch (trackId) {
    case 'track-hld':
      return 'hld'
    case 'track-lld':
      return 'lld'
    case 'track-react':
      return 'react'
    case 'track-node':
      return 'node'
    case 'track-sql':
      return 'sql'
    case 'track-devops':
      return 'devops'
    case 'track-cs':
      return 'cs'
    default:
      return 'concept'
  }
}

/** Which language the AI should write in for a track, given the learner's preference. */
export function trackCodeProfile(trackId: string | undefined, preferred: string): CodeProfile {
  switch (trackId) {
    case 'track-java':
      return { label: 'Java', id: 'java', fixed: true }
    case 'track-js':
      return { label: 'JavaScript, or TypeScript when the topic is TypeScript', id: 'typescript', fixed: true }
    case 'track-react':
      return { label: 'TypeScript with React (TSX)', id: 'typescript', fixed: true }
    case 'track-node':
      return { label: 'TypeScript on Node.js', id: 'typescript', fixed: true }
    case 'track-sql':
      return { label: 'SQL (PostgreSQL dialect)', id: 'sql', fixed: true }
    case 'track-devops':
      return { label: 'shell, YAML or Dockerfile, whichever fits', id: 'bash', fixed: true }
    case 'track-cs':
      return { label: 'pseudo-code, or short C-style snippets only where they help', id: 'cpp', fixed: true }
    case 'track-hld':
      return { label: 'pseudo-code only', id: 'plaintext', fixed: true }
    default:
      return { label: preferred, id: PREFERRED_IDS[preferred] || preferred.toLowerCase(), fixed: false }
  }
}

/** Short label for buttons ("TSX", "SQL", "Java"). */
export function shortLanguageLabel(profile: CodeProfile): string {
  if (profile.id === 'sql') return 'SQL'
  if (profile.id === 'bash') return 'shell and YAML'
  if (profile.id === 'plaintext') return 'diagrams'
  if (profile.label.includes('TSX')) return 'TSX'
  if (profile.label.includes('Node')) return 'TypeScript'
  if (profile.label.startsWith('JavaScript')) return 'JavaScript'
  if (profile.label.startsWith('pseudo')) return 'pseudo-code'
  return profile.label
}

export interface ExplainInput {
  mode: ExplainMode
  /** Title of the workspace: a topic, or a concept part of a topic. */
  title: string
  /** Parent topic title when the workspace is a concept part. */
  parentTitle?: string
  trackTitle?: string
  parts: string[]
  /** Wording from trackCodeProfile().label. */
  language: string
}

const MERMAID_RULES = [
  'Diagrams: use fenced ```mermaid blocks only. Allowed diagram types: flowchart LR, flowchart TD, sequenceDiagram, classDiagram, stateDiagram-v2.',
  'Mermaid rules: node ids are single words (letters, digits, underscore); every label goes in square brackets with double quotes, e.g. API["API gateway"]; at most 25 nodes; declare sequenceDiagram participants first; no HTML, no notes, no comments, no styling.',
]

const COMMON = ['Write GitHub-flavoured Markdown with real line breaks. Short paragraphs, bullets on their own lines. No preamble or closing remarks.']

function lessonSections(input: ExplainInput, extras: { after: string; sections: string[] }[], codeSection: string[]): string[] {
  const base: string[][] = [
    [`## What is ${input.title}?`, '(2–3 plain-language sentences that define it, then one everyday analogy in **bold** on its own line.)'],
    ['## Why it matters', '(Where it shows up in real products and in interviews. 3 bullets.)'],
    ['## Real-world example', '(One concrete story from a product people know, showing the concept in action. 1 short paragraph.)'],
    ['## How it works, step by step', '(A numbered list from the simplest case to the general case.)'],
    codeSection,
    ['## Common mistakes', '(Bullets: mistake → why it happens → fix.)'],
    ['## Interview questions', '(3 questions, each followed by a one-line model answer.)'],
    ['## Quick recap', '(3 bullets a learner can revise from in one minute.)'],
  ]
  const out: string[] = []
  for (const section of base) {
    out.push(...section)
    for (const extra of extras) if (section.some((line) => line.startsWith(extra.after))) out.push(...extra.sections)
  }
  return out
}

export function buildExplainPrompt(input: ExplainInput): { system: string; user: string; noteTitle: string } {
  const subject = input.parentTitle ? `${input.title} (part of ${input.parentTitle})` : input.title
  const parts = input.parts.length ? input.parts.join(', ') : 'core concept, examples, pitfalls'
  const user = (kind: string) => `${kind}: "${subject}" from the track "${input.trackTitle || 'software engineering'}". Sub-parts the curriculum lists: ${parts}.`

  if (input.mode === 'hld') {
    const design = input.parentTitle || input.title
    return {
      noteTitle: `AI design walkthrough: ${input.title}`,
      system: [
        'You are a staff engineer coaching a candidate for a system design interview at a product company (Google, Amazon, Uber, Razorpay, Swiggy level).',
        'Produce the complete design a strong candidate would present, not a definition. Be concrete: name real numbers, technologies and trade-offs.',
        ...MERMAID_RULES,
        'Tables are allowed for estimates, data model and APIs. No full programs; short pseudo-code only where it clarifies.',
        'Use exactly these H2 sections in this order:',
        '## Problem and scope',
        '(Functional requirements as 5–7 bullets, non-functional requirements as bullets with target numbers: latency, availability, consistency, durability, scale. Then "Out of scope" bullets.)',
        '## Back-of-envelope estimation',
        '(A table: users, daily active users, read and write QPS, storage per year, bandwidth. Show the arithmetic in one line per row. State assumptions.)',
        '## High-level architecture',
        '(One ```mermaid flowchart LR of clients, edge (CDN, load balancer, API gateway), services, queues, caches and storage. Then one paragraph walking a request through it.)',
        '## Core components',
        '(Bullets: component → responsibility → technology choice and why.)',
        '## Data model',
        '(A table of entities with their key fields and the store each lives in, then 2–3 bullets on keys, indexes and partitioning.)',
        '## API design',
        '(4–6 endpoints: method, path, key parameters, response, and a note on idempotency or pagination where relevant.)',
        '## Key flow',
        '(Name the most important write path in the heading text after a colon, e.g. "## Key flow: upload and sync". One ```mermaid sequenceDiagram of that flow, then bullets explaining each step and failure handling.)',
        `## Deep dive: ${input.title}`,
        `(The part of the design the interviewer will push on. ${input.parentTitle ? `Explain ${input.title} inside the ${design} design in depth: algorithm, data structures, sizes, edge cases.` : 'Pick the two hardest sub-parts and go deep: algorithm, data structures, sizes, edge cases.'})`,
        '## Scaling, reliability and trade-offs',
        '(Bullets: each bottleneck → fix. Cover caching, sharding or partitioning, replication, consistency versus availability, rate limiting, failure recovery, cost.)',
        '## Common mistakes in interviews',
        '(Bullets: mistake → why it costs points → what to say instead.)',
        '## How to present this in 45 minutes',
        '(A timeline: minutes 0–5 requirements, 5–10 estimates, … through to trade-offs and questions.)',
        '## Quick recap',
        '(5 bullets a candidate can revise from in two minutes.)',
        ...COMMON,
      ].join('\n'),
      user: `${user('Design topic')} Target: a product-company system design round.`,
    }
  }

  if (input.mode === 'lld') {
    return {
      noteTitle: `AI object design: ${input.title} (${input.language.split(',')[0].trim()})`,
      system: [
        'You are a staff engineer coaching a candidate for a low-level design (object-oriented design) interview at a product company.',
        `All code must be in ${input.language}. Never switch languages.`,
        'Produce the design a strong candidate would present: entities, responsibilities, diagrams, patterns, a code skeleton and edge cases. Be concrete.',
        ...MERMAID_RULES,
        'Use exactly these H2 sections in this order:',
        '## Problem and requirements',
        '(Functional requirements as bullets, constraints and assumptions as bullets, clarifying questions a candidate should ask.)',
        '## Core entities and responsibilities',
        '(Bullets: class or interface → what it owns → what it must never do.)',
        '## Class diagram',
        '(One ```mermaid classDiagram with the main classes, key fields and methods, and relationships: inheritance, composition, association.)',
        '## Key interactions',
        '(Name the main use case in the heading after a colon. One ```mermaid sequenceDiagram of it, then bullets explaining the steps.)',
        '## Design patterns applied',
        '(Bullets: pattern → where it is used → why it fits; also one pattern that would be over-engineering here.)',
        `## Code skeleton in ${input.language}`,
        '(One fenced code block with the language tag: interfaces and classes with fields and method signatures, and the single most important method fully implemented with comments.)',
        '## Edge cases and concurrency',
        '(Bullets: invalid inputs, race conditions, invariants, how each is handled.)',
        '## Extensibility and trade-offs',
        '(Bullets: what changes easily, what would hurt, alternatives considered.)',
        '## Common mistakes in interviews',
        '(Bullets: mistake → why it costs points → what to do instead.)',
        '## How to present this in 45 minutes',
        '(A timeline from requirements to code.)',
        '## Quick recap',
        '(5 bullets a candidate can revise from in two minutes.)',
        ...COMMON,
      ].join('\n'),
      user: `${user('Design problem')} Target: a product-company LLD round.`,
    }
  }

  // Lesson-shaped tracks: same skeleton, track-specific language, extra sections and rules.
  const profiles: Record<Exclude<ExplainMode, 'hld' | 'lld'>, { persona: string; code: string[]; extras: { after: string; sections: string[] }[]; rules: string[]; suffix: string }> = {
    concept: {
      persona: 'You are a patient senior engineer teaching a junior developer who is preparing for interviews.',
      code: [`## Example in ${input.language.split(',')[0].trim()}`, '(One fenced code block with the language tag and comments, then a 3–4 line walkthrough.)'],
      extras: [],
      rules: ['No tables.'],
      suffix: input.language,
    },
    react: {
      persona: 'You are a senior frontend engineer teaching React and Next.js for product-company interviews.',
      code: ['## Example component', '(One fenced ```tsx block: a small, complete component or hook using the concept, with comments, then a 3–4 line walkthrough.)'],
      extras: [
        { after: '## How it works', sections: ['## How React handles it under the hood', '(Rendering, reconciliation, or the Next.js server/client boundary as it applies. 3–5 bullets.)'] },
        { after: '## Example component', sections: ['## Performance and pitfalls', '(Re-renders, stale closures, hook rules, hydration or caching issues relevant here, each with the fix.)'] },
      ],
      rules: ['All code is TypeScript with React (TSX). Use function components and hooks; App Router conventions for Next.js. No class components.', 'No tables.'],
      suffix: 'TSX',
    },
    node: {
      persona: 'You are a senior backend engineer teaching Node.js and API design for product-company interviews.',
      code: ['## Example in TypeScript (Node.js)', '(One fenced ```ts block: a small, complete example, e.g. an Express or Fastify handler or a module, with comments, then a 3–4 line walkthrough.)'],
      extras: [
        { after: '## How it works', sections: ['## Request flow', '(One ```mermaid sequenceDiagram showing the path of a request through the pieces involved, then 2–3 bullets.)'] },
        { after: '## Example in TypeScript', sections: ['## Production concerns', '(Error handling, validation, security, observability and scaling notes specific to this topic. Bullets.)'] },
      ],
      rules: [...MERMAID_RULES, 'All code is TypeScript running on Node.js. No tables.'],
      suffix: 'TypeScript',
    },
    sql: {
      persona: 'You are a senior database engineer teaching SQL and PostgreSQL for product-company interviews.',
      code: ['## Schema and sample data', '(One fenced ```sql block with a small CREATE TABLE and INSERTs, 3–6 rows.)', '## Queries and results', '(2–3 fenced ```sql queries that demonstrate the concept, each followed by its result as a small Markdown table and one sentence on what to notice.)'],
      extras: [{ after: '## Queries and results', sections: ['## Performance and indexing', '(What the planner does, which index helps, and how to check with EXPLAIN. Bullets.)'] }],
      rules: ['All code is SQL in the PostgreSQL dialect; mention MySQL differences in one line where they matter. Tables are allowed for query results.'],
      suffix: 'SQL',
    },
    devops: {
      persona: 'You are a senior platform engineer teaching DevOps, CI/CD, containers and security for product-company interviews.',
      code: ['## Hands-on: commands and configuration', '(Fenced blocks with the right language tag: ```bash for commands, ```yaml for pipelines or Compose, ```dockerfile for Dockerfiles. Each block followed by 1–2 lines on what it does and the expected output.)'],
      extras: [
        { after: '## How it works', sections: ['## Workflow diagram', '(One ```mermaid flowchart LR of the pipeline, deployment or request path involved, then 2 bullets.)'] },
        { after: '## Hands-on', sections: ['## Troubleshooting and failure modes', '(What breaks in practice, how to diagnose it, and the fix. Bullets.)', '## Security considerations', '(Least privilege, secrets, image hygiene or network exposure as relevant. Bullets.)'] },
      ],
      rules: [...MERMAID_RULES, 'Use real tool names and flags. No tables.'],
      suffix: 'shell and YAML',
    },
    cs: {
      persona: 'You are a computer science professor who explains operating systems, networks, databases and architecture with concrete mental models, for product-company interviews.',
      code: ['## Worked trace', '(Trace one concrete scenario step by step with actual values, e.g. a TCP handshake, a page fault, a scheduling round. Numbered list. Pseudo-code or a short C-style snippet only if it clarifies.)'],
      extras: [
        { after: '## How it works', sections: ['## Mental model diagram', '(One ```mermaid diagram: flowchart or sequenceDiagram or stateDiagram-v2, whichever fits, then 2 bullets.)'] },
        { after: '## Worked trace', sections: ['## Numbers to remember', '(Bullets: the latencies, sizes, limits or defaults an interviewer expects you to know, with units.)'] },
      ],
      rules: [...MERMAID_RULES, 'Prefer diagrams and traces over code. No tables.'],
      suffix: 'CS',
    },
  }
  const profile = profiles[input.mode as Exclude<ExplainMode, 'hld' | 'lld'>] || profiles.concept
  const sections = lessonSections(input, profile.extras, profile.code)
  return {
    noteTitle: `AI explanation: ${input.title} (${profile.suffix.split(',')[0].trim()})`,
    system: [
      profile.persona,
      `Code language: ${input.language}. Never switch languages.`,
      'Start from zero: assume the reader has never heard the term. Prefer plain words over jargon; define any jargon the first time it appears.',
      'Use exactly these H2 sections in this order:',
      ...sections,
      ...profile.rules,
      ...COMMON,
    ].join('\n'),
    user: user('Topic'),
  }
}

export interface ExtractedDiagram {
  title: string
  type: NonNullable<TopicDiagram['type']>
  mermaidCode: string
}

function diagramType(code: string, mode: ExplainMode): ExtractedDiagram['type'] {
  const head = code.trim().split('\n')[0].toLowerCase()
  if (head.startsWith('sequencediagram')) return 'Sequence'
  if (head.startsWith('classdiagram')) return 'Class'
  if (head.startsWith('statediagram')) return 'State'
  if (head.startsWith('flowchart') || head.startsWith('graph')) return mode === 'hld' ? 'Architecture' : 'Flowchart'
  return 'General'
}

/**
 * Pulls ```mermaid fences out of the markdown so they can live in the Diagrams
 * tab (which renders them), leaving a pointer in the note where each one was.
 */
export function extractMermaidBlocks(markdown: string, mode: ExplainMode): { markdown: string; diagrams: ExtractedDiagram[] } {
  const diagrams: ExtractedDiagram[] = []
  let lastHeading = 'Diagram'
  const lines = markdown.split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const heading = line.match(/^#{1,6}\s+(.+)$/)
    if (heading) lastHeading = heading[1].replace(/^Key flow:\s*/i, '').replace(/^Key interactions:\s*/i, '').trim()
    if (/^```\s*mermaid\s*$/i.test(line.trim())) {
      const body: string[] = []
      let j = i + 1
      while (j < lines.length && !/^```\s*$/.test(lines[j].trim())) {
        body.push(lines[j])
        j += 1
      }
      const code = body.join('\n').trim()
      if (code) {
        const title = lastHeading
        diagrams.push({ title, type: diagramType(code, mode), mermaidCode: code })
        out.push(`> 📐 **Diagram: ${title}** — open the **Diagrams** tab to view and edit it.`)
      }
      i = j
      continue
    }
    out.push(line)
  }
  return { markdown: out.join('\n'), diagrams }
}
