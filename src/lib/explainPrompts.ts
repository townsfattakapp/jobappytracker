import type { TopicDiagram } from '../types'

/**
 * Prompt templates for the "Explain this topic with AI" note.
 *
 * Concept tracks (DSA, Java, JS, …) get a from-zero lesson with code.
 * High-level system design topics get an interview-style design walkthrough
 * (requirements, estimates, architecture and sequence diagrams, data model,
 * APIs, deep dive, trade-offs). Low-level design topics get an object design
 * (class diagram, interactions, patterns, code skeleton).
 */

export type ExplainMode = 'concept' | 'hld' | 'lld'

export interface ExplainInput {
  mode: ExplainMode
  /** Title of the workspace: a topic, or a concept part of a topic. */
  title: string
  /** Parent topic title when the workspace is a concept part. */
  parentTitle?: string
  trackTitle?: string
  parts: string[]
  language: string
}

export function explainModeForTrack(trackId?: string): ExplainMode {
  if (trackId === 'track-hld') return 'hld'
  if (trackId === 'track-lld') return 'lld'
  return 'concept'
}

const MERMAID_RULES = [
  'Diagrams: use fenced ```mermaid blocks only. Allowed diagram types: flowchart LR, flowchart TD, sequenceDiagram, classDiagram, stateDiagram-v2.',
  'Mermaid rules: node ids are single words (letters, digits, underscore); every label goes in square brackets with double quotes, e.g. API["API gateway"]; at most 25 nodes; declare sequenceDiagram participants first; no HTML, no notes, no comments, no styling.',
]

export function buildExplainPrompt(input: ExplainInput): { system: string; user: string; noteTitle: string } {
  const subject = input.parentTitle ? `${input.title} (part of ${input.parentTitle})` : input.title
  const parts = input.parts.length ? input.parts.join(', ') : 'core concept, examples, pitfalls'
  const common = ['Write GitHub-flavoured Markdown with real line breaks. Short paragraphs, bullets on their own lines. No preamble or closing remarks.']

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
        `## Problem and scope`,
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
        `## Key flow`,
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
        ...common,
      ].join('\n'),
      user: `Design topic: "${subject}" from the track "${input.trackTitle || 'High-Level System Design'}". Sub-parts the curriculum lists: ${parts}. Target: a product-company system design round.`,
    }
  }

  if (input.mode === 'lld') {
    return {
      noteTitle: `AI object design: ${input.title} (${input.language})`,
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
        `(One fenced code block with the language tag: interfaces and classes with fields and method signatures, and the single most important method fully implemented with comments.)`,
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
        ...common,
      ].join('\n'),
      user: `Design problem: "${subject}" from the track "${input.trackTitle || 'Low-Level System Design'}". Sub-parts the curriculum lists: ${parts}. Target: a product-company LLD round.`,
    }
  }

  return {
    noteTitle: `AI explanation: ${input.title} (${input.language})`,
    system: [
      'You are a patient senior engineer teaching a junior developer who is preparing for interviews.',
      `All code must be in ${input.language}. Never switch languages.`,
      'Start from zero: assume the reader has never heard the term. Prefer plain words over jargon; define any jargon the first time it appears.',
      'Use exactly these H2 sections in this order:',
      `## What is ${input.title}?`,
      '(2–3 plain-language sentences that define it, then one everyday analogy in **bold** on its own line.)',
      '## Why it matters',
      '(Where it shows up in real software and interviews. 3 bullets.)',
      '## Real-world example',
      '(One concrete story from a product people know, e.g. a food-delivery app or a payment system, showing the concept in action. 1 short paragraph.)',
      '## How it works, step by step',
      '(A numbered list from the simplest case to the general case.)',
      `## Example in ${input.language}`,
      '(One fenced code block with the language tag and comments, then a 3–4 line walkthrough.)',
      '## Common mistakes',
      '(Bullets: mistake → why it happens → fix.)',
      '## Interview questions',
      '(3 questions, each followed by a one-line model answer.)',
      '## Quick recap',
      '(3 bullets a learner can revise from in one minute.)',
      'No tables.',
      ...common,
    ].join('\n'),
    user: `Topic: "${subject}" from the track "${input.trackTitle || 'software engineering'}". Sub-parts to cover: ${parts}.`,
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
