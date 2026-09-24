import { useSyncExternalStore } from 'react'
import type { CurriculumCategory, CurriculumLevel, CurriculumModule, CurriculumSubtopic, CurriculumTopic, CurriculumTrack } from '../../types'
import { allCurriculums } from '../../data/curriculum'

/**
 * The single place the app reads learning tracks from. It composes:
 * - built-in tracks shipped with the app (`src/data/curriculum`),
 * - shared tracks published by curriculum admins (fetched from the API),
 * - the learner's personal tracks (part of their synced storage).
 *
 * Components subscribe with `useCurriculum()`; plain functions use
 * `getCurriculum()`. Nothing else should import `allCurriculums` directly.
 */

export interface TopicRef {
  track: CurriculumTrack
  level: CurriculumLevel
  category: CurriculumCategory
  module: CurriculumModule
  topic: CurriculumTopic
  /** Set when the id looked up was a concept (subtopic) rather than the topic. */
  subtopic?: CurriculumSubtopic
}

export interface CurriculumSnapshot {
  version: number
  tracks: CurriculumTrack[]
  trackById: Map<string, CurriculumTrack>
  /** Every topic in every track, in curriculum order. */
  topics: TopicRef[]
  /** Topic and concept ids → ref. */
  byId: Map<string, TopicRef>
}

let shared: CurriculumTrack[] = []
let personal: CurriculumTrack[] = []
let version = 0
let snapshot: CurriculumSnapshot | null = null
const listeners = new Set<() => void>()

function build(): CurriculumSnapshot {
  const ids = new Set<string>()
  const tracks: CurriculumTrack[] = []
  // Personal overrides shared overrides builtin when ids collide (a personal copy of a shared track).
  for (const list of [personal, shared, allCurriculums]) {
    for (const track of list) {
      if (!track || ids.has(track.id) || track.status === 'archived') continue
      ids.add(track.id)
      tracks.push(track)
    }
  }
  const trackById = new Map(tracks.map((t) => [t.id, t]))
  const topics: TopicRef[] = []
  const byId = new Map<string, TopicRef>()
  for (const track of tracks)
    for (const level of track.levels || [])
      for (const category of level.categories || [])
        for (const module of category.modules || [])
          for (const topic of module.topics || []) {
            const ref: TopicRef = { track, level, category, module, topic }
            topics.push(ref)
            if (!byId.has(topic.id)) byId.set(topic.id, ref)
            for (const subtopic of topic.subtopics || []) if (!byId.has(subtopic.id)) byId.set(subtopic.id, { ...ref, subtopic })
          }
  return { version, tracks, trackById, topics, byId }
}

function invalidate() {
  version += 1
  snapshot = null
  for (const fn of listeners) fn()
}

export function getCurriculum(): CurriculumSnapshot {
  if (!snapshot) snapshot = build()
  return snapshot
}

export function setSharedTracks(tracks: CurriculumTrack[]) {
  shared = tracks.map((t) => ({ ...t, source: 'shared' as const }))
  invalidate()
}

export function setPersonalTracks(tracks: CurriculumTrack[]) {
  personal = (tracks || []).map((t) => ({ ...t, source: 'personal' as const }))
  invalidate()
}

export function getPersonalTracks(): CurriculumTrack[] {
  return personal
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** React hook: the current curriculum, re-rendering when tracks change. */
export function useCurriculum(): CurriculumSnapshot {
  return useSyncExternalStore(subscribe, getCurriculum, getCurriculum)
}

export function findTopic(id: string | undefined | null): TopicRef | undefined {
  if (!id) return undefined
  return getCurriculum().byId.get(id)
}

export function findTrack(id: string | undefined | null): CurriculumTrack | undefined {
  if (!id) return undefined
  return getCurriculum().trackById.get(id)
}

/** Topics of a track in curriculum order, optionally limited to a category. */
export function trackTopics(trackId: string, categoryId?: string): TopicRef[] {
  return getCurriculum().topics.filter((t) => t.track.id === trackId && (!categoryId || t.category.id === categoryId))
}

export function trackCategories(track: CurriculumTrack): CurriculumCategory[] {
  return track.levels.flatMap((l) => l.categories)
}

export interface SearchHit {
  ref: TopicRef
  score: number
  /** Which field matched best, for highlighting. */
  matched: 'topic' | 'concept' | 'category' | 'track'
  concept?: CurriculumSubtopic
}

const tokenize = (q: string) =>
  q
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length > 1)

/**
 * Global curriculum search across tracks, categories, topics and concepts.
 * "Python decorators" ranks the Python track's Decorators topic first; a
 * concept-level hit returns the concept so callers can open it directly.
 */
export function searchCurriculum(query: string, opts: { limit?: number; trackIds?: string[]; family?: string } = {}): SearchHit[] {
  const tokens = tokenize(query)
  if (!tokens.length) return []
  const limit = opts.limit ?? 40
  const hits: SearchHit[] = []
  const trackFilter = opts.trackIds?.length ? new Set(opts.trackIds) : null
  for (const ref of getCurriculum().topics) {
    if (trackFilter && !trackFilter.has(ref.track.id)) continue
    if (opts.family && ref.track.family !== opts.family) continue
    const trackText = `${ref.track.title} ${(ref.track.tags || []).join(' ')}`.toLowerCase()
    const categoryText = ref.category.title.toLowerCase()
    const topicText = ref.topic.title.toLowerCase()
    const descText = (ref.topic.description || '').toLowerCase()
    let score = 0
    let matched: SearchHit['matched'] = 'track'
    let concept: CurriculumSubtopic | undefined
    let all = true
    for (const tok of tokens) {
      let best = 0
      if (topicText.includes(tok)) {
        best = topicText === tok ? 12 : topicText.startsWith(tok) ? 9 : 6
        if (best > 0 && matched !== 'concept') matched = 'topic'
      }
      for (const sub of ref.topic.subtopics) {
        const st = sub.title.toLowerCase()
        if (st.includes(tok)) {
          const s = st === tok ? 11 : st.startsWith(tok) ? 8 : 5
          if (s > best) {
            best = s
            matched = 'concept'
            concept = sub
          }
        }
      }
      if (best === 0 && categoryText.includes(tok)) {
        best = 4
        if (matched === 'track') matched = 'category'
      }
      if (best === 0 && trackText.includes(tok)) best = 3
      if (best === 0 && descText.includes(tok)) best = 1
      if (best === 0) all = false
      score += best
    }
    if (!all || score === 0) continue
    if (tokens.length > 1 && topicText.includes(tokens.join(' '))) score += 6
    hits.push({ ref, score, matched, concept: matched === 'concept' ? concept : undefined })
  }
  hits.sort((a, b) => b.score - a.score || a.ref.topic.title.localeCompare(b.ref.topic.title))
  return hits.slice(0, limit)
}

/** Groups tracks by family for browsing. Personal tracks come last. */
export function tracksByFamily(tracks: CurriculumTrack[]): { family: string; tracks: CurriculumTrack[] }[] {
  const order = [
    'Software Engineering Interviews',
    'Programming Languages',
    'Backend Frameworks',
    'Frontend & Web',
    'Mobile Development',
    'AI & Generative AI',
    'Data Science',
    'Data Analytics & BI',
    'Data Engineering',
    'Cloud, DevOps & Platform',
    'Cybersecurity',
    'Computer Science',
    'Personal',
  ]
  const groups = new Map<string, CurriculumTrack[]>()
  for (const t of tracks) {
    const key = t.source === 'personal' ? 'Personal' : t.family || 'Other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }
  return Array.from(groups.entries())
    .sort((a, b) => {
      const ia = order.indexOf(a[0])
      const ib = order.indexOf(b[0])
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    .map(([family, list]) => ({ family, tracks: list }))
}

/** All topic ids of a track (used when a goal selects "everything"). */
export function topicIdsOf(track: CurriculumTrack): string[] {
  return track.levels.flatMap((l) => l.categories.flatMap((c) => c.modules.flatMap((m) => m.topics.map((t) => t.id))))
}
