import type { CurriculumSnapshot } from '../curriculum/registry'
import { isPlaceholderTopic } from '../curriculum/placeholders'
import { ROUNDS, type InterviewRound, type SyllabusArea } from './config'

/** Topics quoted per track in a whole-area syllabus; spread evenly across the track so the prompt stays small. */
const TOPICS_PER_AREA = 6
/** Areas (tracks) a whole-area round can list; the largest family has 20 tracks. */
const MAX_AREAS = 20

function spread<T>(list: T[], n: number): T[] {
  if (list.length <= n) return list
  const out: T[] = []
  for (let i = 0; i < n; i++) out.push(list[Math.floor((i * list.length) / n)])
  return out
}

export function familyRoundId(family: string): string {
  return `family-${family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

/**
 * The syllabus of a learning-track family: one area per track, each with a handful of
 * its real topics. Placeholder topics and the "X interview questions" lists are left out.
 */
export function familySyllabus(cur: CurriculumSnapshot, family: string): SyllabusArea[] {
  const areas: SyllabusArea[] = []
  for (const track of cur.tracks) {
    if (track.source === 'personal' || (track.family || 'Other tracks') !== family) continue
    const topics = cur.topics.filter((t) => t.track.id === track.id && !isPlaceholderTopic(t.topic.title) && !/interview questions$/i.test(t.topic.title))
    if (!topics.length) continue
    areas.push({ title: track.title, topics: spread(topics, TOPICS_PER_AREA).map((t) => t.topic.title) })
  }
  return areas.slice(0, MAX_AREAS)
}

/**
 * The interview catalogue: the built-in rounds, then one whole-area round per
 * learning-track family (every track of "Data Engineering" in one interview,
 * rotating the starting track from session to session), then one round per track.
 */
export function buildCurriculumRounds(cur: CurriculumSnapshot): InterviewRound[] {
  const tracks = cur.tracks.filter((t) => t.source !== 'personal')
  const families = Array.from(new Set(tracks.map((t) => t.family || 'Other tracks'))).sort()
  const familyRounds: InterviewRound[] = []
  for (const family of families) {
    const syllabus = familySyllabus(cur, family)
    if (syllabus.length < 2) continue
    familyRounds.push({
      id: familyRoundId(family),
      label: `${family}: whole-area interview`,
      group: 'Curriculum',
      family,
      blurb: `One interview across all ${syllabus.length} ${family} tracks. Each session starts from a different track, so a series of sessions covers the area end to end.`,
      brief: `Run a broad technical interview across the whole ${family} area, following the syllabus below. Ask conceptual and scenario questions that reveal whether the candidate understands each area in practice: how it works, when to use it, trade-offs and failure modes. Breadth first; go deeper only where an answer invites it.`,
      dimensions: ['Breadth across the area', 'Depth of understanding', 'Practical application', 'Trade-offs and judgement', 'Communication'],
      syllabus,
    })
  }
  const trackRounds: InterviewRound[] = cur.tracks
    .filter((t) => !ROUNDS.some((r) => r.id === t.id || r.label === t.title))
    .map((t) => ({
      id: t.id,
      label: t.title,
      group: 'Curriculum',
      family: t.family || 'Other tracks',
      blurb: t.description || `Test your knowledge on ${t.title}`,
      brief: `Run a technical interview on ${t.title}. Ask deep, conceptual questions about ${t.title} topics. Cover practical scenarios, trade-offs, and best practices. Push for the "why" behind their answers.`,
      dimensions: ['Core concepts', 'Practical application', 'Trade-offs and architecture', 'Problem solving', 'Communication'],
    }))
  return [...ROUNDS, ...familyRounds, ...trackRounds]
}
