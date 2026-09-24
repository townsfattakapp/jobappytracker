import { chatWithAI, extractJsonObject } from './aiGatewayClient'
import { getCurriculum, trackCategories, type CurriculumSnapshot } from './curriculum/registry'
import type { CurriculumTrack, ExperienceLevel, GoalTrack } from '../types'

/**
 * AI Goal Builder: turns a natural-language goal into a curriculum proposal
 * that references real track and topic ids. Two calls keep the prompts small:
 * 1. pick tracks from the catalogue (ids, titles, families, descriptions);
 * 2. for the picked tracks, choose categories to include or skip, using the
 *    learner's stated knowledge.
 * Anything the model names that does not exist becomes a "proposed topic" the
 * learner must approve; it is never silently created.
 */

export interface SuggestedTrack {
  trackId: string
  priority: GoalTrack['priority']
  reason: string
  /** Category ids to include (undefined = whole track). */
  categoryIds?: string[]
  /** Category ids the learner already knows (skipped). */
  knownCategoryIds?: string[]
}

export interface ProposedTopic {
  title: string
  description: string
  forTrackId?: string
}

export interface GoalSuggestion {
  name: string
  description: string
  targetRole: string
  outcome: 'career' | 'language' | 'framework' | 'interview' | 'project' | 'custom'
  experienceLevel: ExperienceLevel
  hoursPerDay: number | null
  languages: string[]
  tracks: SuggestedTrack[]
  proposedTopics: ProposedTopic[]
  /** Essential questions the model still needs answered (empty when it had enough). */
  questions: string[]
  sequenceNotes: string
  estimatedWeeks: number | null
  practiceIdeas: string[]
}

export interface GoalBuilderInput {
  description: string
  answers?: Record<string, string>
  hoursPerDay?: number
  experienceLevel?: ExperienceLevel
}

function catalogue(snapshot: CurriculumSnapshot): string {
  return snapshot.tracks
    .filter((t) => t.source !== 'personal')
    .map((t) => `${t.id} | ${t.title} | ${t.family || 'Other'} | ${t.description.slice(0, 110)}${t.prerequisites?.length ? ` | after: ${t.prerequisites.join(', ')}` : ''}`)
    .join('\n')
}

function categoriesFor(track: CurriculumTrack): string {
  return trackCategories(track)
    .map((c) => `${c.id} | ${c.title}${c.description ? ` — ${c.description.slice(0, 80)}` : ''} (${c.modules.reduce((n, m) => n + m.topics.length, 0)} topics)`)
    .join('\n')
}

const PRIORITIES = new Set(['High', 'Medium', 'Low'])

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v.trim() : fallback
}

function strings(v: unknown, limit = 12): string[] {
  return Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean).slice(0, limit) : []
}

export async function suggestCurriculum(input: GoalBuilderInput): Promise<GoalSuggestion> {
  const snapshot = getCurriculum()
  const answers = Object.entries(input.answers || {})
    .filter(([, v]) => v && v.trim())
    .map(([q, v]) => `- ${q}: ${v.trim()}`)
    .join('\n')
  const stage1 = await chatWithAI({
    json: true,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: [
          'You are a curriculum advisor for software and data careers. You map a learner\'s goal onto the learning tracks in the catalogue below.',
          'Rules: use ONLY track ids from the catalogue. Pick 3 to 10 tracks in a sensible study order (prerequisites first). Do not include tracks the learner already knows unless they asked to revise them. Prefer the most specific tracks (e.g. "SQL for Analytics" over generic ones when the goal is analytics).',
          'If the goal is missing an essential fact (target role, hours per day, current experience, deadline), list up to 3 short questions in "questions" but still make your best proposal.',
          'If the learner needs something the catalogue lacks, put it in "proposedTopics" with the closest track id; never invent track ids.',
          'Respond ONLY with JSON: {"name": string, "description": string, "targetRole": string, "outcome": "career"|"language"|"framework"|"interview"|"project"|"custom", "experienceLevel": "Beginner"|"Intermediate"|"Advanced", "hoursPerDay": number|null, "languages": string[], "tracks": [{"trackId": string, "priority": "High"|"Medium"|"Low", "reason": string}], "knownTrackIds": string[], "proposedTopics": [{"title": string, "description": string, "forTrackId": string}], "questions": string[], "sequenceNotes": string, "estimatedWeeks": number|null, "practiceIdeas": string[]}',
          '',
          'CATALOGUE (id | title | family | description | prerequisites):',
          catalogue(snapshot),
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          `Goal: ${input.description.trim()}`,
          input.hoursPerDay ? `Hours per day available: ${input.hoursPerDay}` : '',
          input.experienceLevel ? `Experience level: ${input.experienceLevel}` : '',
          answers ? `Answers to earlier questions:\n${answers}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
  })
  const raw = extractJsonObject<Record<string, unknown>>(stage1)
  const known = new Set(strings(raw.knownTrackIds))
  const tracks: SuggestedTrack[] = []
  const seen = new Set<string>()
  const proposed: ProposedTopic[] = []
  if (Array.isArray(raw.tracks)) {
    for (const item of raw.tracks as Record<string, unknown>[]) {
      const id = str(item?.trackId)
      if (!id || seen.has(id)) continue
      if (!snapshot.trackById.has(id)) {
        proposed.push({ title: str(item?.trackId), description: str(item?.reason, 'Suggested by the AI but not in the catalogue.') })
        continue
      }
      if (known.has(id)) continue
      seen.add(id)
      const priority = str(item?.priority, 'Medium')
      tracks.push({ trackId: id, priority: (PRIORITIES.has(priority) ? priority : 'Medium') as GoalTrack['priority'], reason: str(item?.reason) })
      if (tracks.length >= 10) break
    }
  }
  if (Array.isArray(raw.proposedTopics)) {
    for (const item of raw.proposedTopics as Record<string, unknown>[]) {
      const title = str(item?.title)
      if (!title) continue
      const forTrackId = str(item?.forTrackId)
      proposed.push({ title, description: str(item?.description), forTrackId: snapshot.trackById.has(forTrackId) ? forTrackId : undefined })
      if (proposed.length >= 8) break
    }
  }

  // Stage 2: category-level trimming for tracks where the learner has partial knowledge.
  const mentionsKnowledge = /\b(know|familiar|already|comfortable|experienced|skip|worked with|years?)\b/i.test(`${input.description} ${answers}`)
  if (tracks.length && mentionsKnowledge) {
    const listing = tracks
      .map((t) => snapshot.trackById.get(t.trackId)!)
      .map((t) => `TRACK ${t.id} (${t.title})\n${categoriesFor(t)}`)
      .join('\n\n')
    try {
      const stage2 = await chatWithAI({
        json: true,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: [
              'You refine a curriculum for a learner. For each track below, decide which categories they already know (skip) and which to include, based only on what the learner said. When unsure, include the category.',
              'Use ONLY the category ids given. Respond ONLY with JSON: {"tracks": [{"trackId": string, "includeCategoryIds": string[], "knownCategoryIds": string[]}]}',
              '',
              listing,
            ].join('\n'),
          },
          { role: 'user', content: `Goal: ${input.description.trim()}${answers ? `\nAnswers:\n${answers}` : ''}` },
        ],
      })
      const refined = extractJsonObject<{ tracks?: { trackId?: string; includeCategoryIds?: string[]; knownCategoryIds?: string[] }[] }>(stage2)
      for (const r of refined.tracks || []) {
        const target = tracks.find((t) => t.trackId === r.trackId)
        const track = target && snapshot.trackById.get(target.trackId)
        if (!target || !track) continue
        const valid = new Set(trackCategories(track).map((c) => c.id))
        const knownIds = (r.knownCategoryIds || []).filter((id) => valid.has(id))
        const includeIds = (r.includeCategoryIds || []).filter((id) => valid.has(id) && !knownIds.includes(id))
        if (knownIds.length) target.knownCategoryIds = knownIds
        if (includeIds.length && includeIds.length < valid.size) target.categoryIds = includeIds
      }
    } catch {
      // Refinement is optional; the track-level proposal stands.
    }
  }

  const levelRaw = str(raw.experienceLevel, 'Intermediate')
  const outcomeRaw = str(raw.outcome, 'custom')
  return {
    name: str(raw.name, 'My learning goal'),
    description: str(raw.description),
    targetRole: str(raw.targetRole, 'Software Engineer'),
    outcome: (['career', 'language', 'framework', 'interview', 'project', 'custom'].includes(outcomeRaw) ? outcomeRaw : 'custom') as GoalSuggestion['outcome'],
    experienceLevel: (['Beginner', 'Intermediate', 'Advanced'].includes(levelRaw) ? levelRaw : 'Intermediate') as ExperienceLevel,
    hoursPerDay: typeof raw.hoursPerDay === 'number' && raw.hoursPerDay > 0 ? Math.min(12, raw.hoursPerDay) : null,
    languages: strings(raw.languages, 4),
    tracks,
    proposedTopics: proposed,
    questions: strings(raw.questions, 3),
    sequenceNotes: str(raw.sequenceNotes),
    estimatedWeeks: typeof raw.estimatedWeeks === 'number' && raw.estimatedWeeks > 0 ? Math.round(raw.estimatedWeeks) : null,
    practiceIdeas: strings(raw.practiceIdeas, 6),
  }
}

/** Converts a suggestion into goal track selections (category choices become topic id lists). */
export function selectionFromSuggestion(suggestion: GoalSuggestion): { tracks: GoalTrack[]; knownTopicIds: string[] } {
  const snapshot = getCurriculum()
  const tracks: GoalTrack[] = []
  const known: string[] = []
  suggestion.tracks.forEach((s, index) => {
    const track = snapshot.trackById.get(s.trackId)
    if (!track) return
    const entry: GoalTrack = { trackId: s.trackId, priority: s.priority, order: index }
    if (s.categoryIds?.length) {
      const include = new Set(s.categoryIds)
      entry.topicIds = trackCategories(track)
        .filter((c) => include.has(c.id))
        .flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id)))
    }
    if (s.knownCategoryIds?.length) {
      const knownSet = new Set(s.knownCategoryIds)
      known.push(...trackCategories(track).filter((c) => knownSet.has(c.id)).flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id))))
    }
    tracks.push(entry)
  })
  return { tracks, knownTopicIds: known }
}
