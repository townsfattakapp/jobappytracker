import { chatWithAI, extractJsonObject } from './aiGatewayClient'

export type TopicContext = {
  title: string
  track?: string
  subtopics?: string[]
  /** Plain-text excerpt of the learner's notes, used to keep generations on-topic. */
  notes?: string
  /** Wording such as "Java", "SQL (PostgreSQL dialect)" or "TypeScript with React (TSX)". */
  language: string
}

function contextBlock(ctx: TopicContext): string {
  return [
    `Topic: ${ctx.title}`,
    ctx.track ? `Track: ${ctx.track}` : '',
    ctx.subtopics?.length ? `Sub-parts: ${ctx.subtopics.join(', ')}` : '',
    `Preferred programming language: ${ctx.language} (all code must be in this language).`,
    ctx.notes ? `Learner's notes (for context, do not repeat verbatim):\n${ctx.notes.slice(0, 2500)}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

async function generate<T extends Record<string, unknown>>(system: string, user: string): Promise<T> {
  const text = await chatWithAI({
    temperature: 0.4,
    json: true,
    messages: [
      { role: 'system', content: `${system}\nRespond with ONLY a JSON object. No markdown fences, no commentary.` },
      { role: 'user', content: user },
    ],
  })
  return extractJsonObject<T>(text)
}

export type GeneratedExample = {
  title: string
  problemStatement: string
  inputOutput: string
  explanation: string
  implementationCode: string
  timeComplexity?: string
  spaceComplexity?: string
  commonMistakes?: string
}

export async function generateExamples(ctx: TopicContext, count = 3): Promise<GeneratedExample[]> {
  const data = await generate<{ examples: GeneratedExample[] }>(
    `You write worked examples for software-engineering learners. Each example must be concrete, small, and fully traced.`,
    `${contextBlock(ctx)}

Return JSON: {"examples": [ { "title", "problemStatement", "inputOutput", "explanation", "implementationCode", "timeComplexity", "spaceComplexity", "commonMistakes" } ]}
Rules:
- exactly ${count} examples, ordered from simplest to hardest
- problemStatement: 1–3 sentences
- inputOutput: a sample input and its expected output, one per line
- explanation: step-by-step reasoning in plain words (use "1." "2." numbering inside the string, separated by newlines)
- implementationCode: complete, runnable ${ctx.language} code with brief comments (plain text, no markdown fences). Format it exactly as a developer would: one statement per line, real newline characters between lines, 4-space indentation. Never put a whole program on one line.
- commonMistakes: one sentence`,
  )
  return Array.isArray(data.examples) ? data.examples.filter((e) => e && e.title) : []
}

export type GeneratedDiagram = { title: string; type: string; mermaidCode: string; caption: string }

export async function generateDiagram(ctx: TopicContext, request?: string): Promise<GeneratedDiagram> {
  const data = await generate<GeneratedDiagram>(
    `You produce Mermaid diagrams that explain programming concepts visually. Only use Mermaid syntax that renders in Mermaid v11: flowchart TD/LR, sequenceDiagram, classDiagram, stateDiagram-v2. Keep node labels short and quote labels that contain punctuation.`,
    `${contextBlock(ctx)}
${request ? `What the learner wants to see: ${request}` : 'Choose the most helpful diagram for understanding this topic (e.g. a flowchart of the algorithm, a state diagram, or a class diagram).'}

Return JSON: {"title": string, "type": one of "Flowchart" | "Sequence" | "Class" | "State" | "Architecture" | "General", "mermaidCode": string, "caption": one sentence explaining what the diagram shows}
Rules for mermaidCode: start with the diagram keyword on its own line, use \\n for line breaks, at most 25 nodes, no HTML, no comments.`,
  )
  if (!data.mermaidCode) throw new Error('The AI did not return a diagram. Try again with a more specific request.')
  return data
}

export type GeneratedMistake = { mistake: string; why: string; fix: string }

export async function generateMistakes(ctx: TopicContext, count = 5): Promise<GeneratedMistake[]> {
  const data = await generate<{ mistakes: GeneratedMistake[] }>(
    `You list the mistakes real learners and interview candidates make with a topic, with the reason and the fix.`,
    `${contextBlock(ctx)}

Return JSON: {"mistakes": [ { "mistake": string, "why": string, "fix": string } ]}
Rules: exactly ${count} items, each field one sentence, ordered from most common to least common, include at least one ${ctx.language}-specific pitfall.`,
  )
  return Array.isArray(data.mistakes) ? data.mistakes.filter((m) => m && m.mistake) : []
}

export type GeneratedFlashcard = { front: string; back: string }

export async function generateFlashcards(ctx: TopicContext, count = 8): Promise<GeneratedFlashcard[]> {
  const data = await generate<{ cards: GeneratedFlashcard[] }>(
    `You write spaced-repetition flashcards. Fronts are precise questions; backs are short, complete answers.`,
    `${contextBlock(ctx)}

Return JSON: {"cards": [ { "front": string, "back": string } ]}
Rules: exactly ${count} cards; mix definitions, "when would you use", complexity, and one code-reading card in ${ctx.language} (put the code inline in the front using backticks); backs at most 2 sentences.`,
  )
  return Array.isArray(data.cards) ? data.cards.filter((c) => c && c.front && c.back) : []
}

export type GeneratedProblem = { title: string; prompt: string; starterCode: string; hint: string }

export async function generatePracticeProblems(ctx: TopicContext, count = 3): Promise<GeneratedProblem[]> {
  const data = await generate<{ problems: GeneratedProblem[] }>(
    `You set small coding exercises that can be solved in a single file and run without external input.`,
    `${contextBlock(ctx)}

Return JSON: {"problems": [ { "title": string, "prompt": string, "starterCode": string, "hint": string } ]}
Rules:
- exactly ${count} problems, easy → medium → harder
- prompt: the task plus 2 sample inputs/outputs, as plain text with newlines
- starterCode: ${ctx.language} code with a function signature, a TODO comment where the solution goes, and a main/entry point that prints the result for the samples (plain text, no fences). If the language is SQL, starterCode is a small schema with sample rows plus a query skeleton ending in a TODO. If it is shell, YAML or Dockerfile, starterCode is a config or script skeleton with TODO markers.
- hint: one sentence`,
  )
  return Array.isArray(data.problems) ? data.problems.filter((p) => p && p.title) : []
}
