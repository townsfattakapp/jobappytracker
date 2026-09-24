import type { CurriculumTrack } from '../../types'
import { defineTrack, specFromTrack, type CategorySpec, type TopicSpec, type TrackSpec } from '../../data/curriculum/define'

/**
 * Personal tracks and topics. A learner's custom topics live in their own
 * track ("My topics") inside the synced storage, so every workspace, picker
 * and roadmap treats them exactly like built-in content.
 */

export const PERSONAL_TRACK_ID = 'track-personal'
export const CUSTOM_CATEGORY = 'Custom topics'

function stamp(track: CurriculumTrack): CurriculumTrack {
  return { ...track, source: 'personal', status: track.status || 'draft', updatedAt: new Date().toISOString(), createdAt: track.createdAt || new Date().toISOString() }
}

/** Builds (or rebuilds) a personal track from a spec, keeping ids stable through titles. */
export function buildPersonalTrack(spec: Omit<TrackSpec, 'source'>): CurriculumTrack {
  const track = defineTrack({ ...spec, family: spec.family || 'Personal', kind: spec.kind || 'custom', explainMode: spec.explainMode || 'concept' })
  return stamp({ ...track, status: spec.status || 'draft' })
}

export function emptyPersonalTrack(): CurriculumTrack {
  return buildPersonalTrack({
    id: PERSONAL_TRACK_ID,
    title: 'My topics',
    description: 'Topics you added yourself. They work like any other topic: workspace, notes, examples, flashcards and scheduling.',
    family: 'Personal',
    kind: 'custom',
    icon: '✏️',
    tags: ['personal', 'custom'],
    style: 'practice',
    supports: { coding: true, project: true },
    categories: [{ title: CUSTOM_CATEGORY, topics: [] }],
  })
}

export interface CustomTopicInput {
  title: string
  description?: string
  concepts?: string[]
  /** Category inside the personal track; defaults to "Custom topics". */
  category?: string
  /** Put the topic into another personal track instead of "My topics". */
  trackId?: string
}

/**
 * Adds a custom topic to the learner's personal tracks and returns the new
 * track list plus the topic id (deterministic, so re-adding the same title is
 * a no-op rather than a duplicate).
 */
export function addCustomTopic(tracks: CurriculumTrack[], input: CustomTopicInput): { tracks: CurriculumTrack[]; topicId: string; trackId: string } {
  const trackId = input.trackId || PERSONAL_TRACK_ID
  const existing = tracks.find((t) => t.id === trackId) || (trackId === PERSONAL_TRACK_ID ? emptyPersonalTrack() : null)
  if (!existing) throw new Error('Unknown personal track')
  const spec = specFromTrack(existing)
  const categoryTitle = (input.category || CUSTOM_CATEGORY).trim() || CUSTOM_CATEGORY
  let category = spec.categories.find((c) => c.title.toLowerCase() === categoryTitle.toLowerCase())
  if (!category) {
    category = { title: categoryTitle, topics: [] }
    spec.categories.push(category)
  }
  const title = input.title.trim()
  const concepts = (input.concepts || []).map((c) => c.trim()).filter(Boolean)
  const topic: TopicSpec = {
    title,
    description: (input.description || '').trim() || `${title}: a topic you added to your own curriculum.`,
    concepts: concepts.length ? concepts : ['Core idea', 'Worked example', 'Practice'],
    quiz: [],
  }
  const idx = category.topics.findIndex((t) => t.title.toLowerCase() === title.toLowerCase())
  if (idx >= 0) category.topics[idx] = { ...category.topics[idx], ...topic, concepts: topic.concepts }
  else category.topics.push(topic)
  const rebuilt = buildPersonalTrack({ ...spec, id: trackId, categories: spec.categories.filter((c) => c.topics.length || c.title === CUSTOM_CATEGORY) })
  const topicId = rebuilt.levels[0].categories.flatMap((c) => c.modules[0].topics).find((t) => t.title === title)!.id
  const next = tracks.some((t) => t.id === trackId) ? tracks.map((t) => (t.id === trackId ? rebuilt : t)) : [...tracks, rebuilt]
  return { tracks: next, topicId, trackId }
}

/** Removes a custom topic (by id) from the personal tracks. */
export function removeCustomTopic(tracks: CurriculumTrack[], topicId: string): CurriculumTrack[] {
  return tracks.map((track) => {
    if (!track.levels.some((l) => l.categories.some((c) => c.modules.some((m) => m.topics.some((t) => t.id === topicId))))) return track
    const spec = specFromTrack(track)
    const categories: CategorySpec[] = spec.categories.map((c) => ({ ...c, topics: c.topics.filter((t) => `top-${track.id.replace(/^track-/, '')}-${slugTitle(c.title)}-${slugTitle(t.title)}` !== topicId) }))
    return buildPersonalTrack({ ...spec, id: track.id, categories })
  })
}

function slugTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Creates a new empty personal track the learner can fill in the studio. */
export function newPersonalTrack(title: string, description = ''): CurriculumTrack {
  const id = `track-my-${slugTitle(title) || 'track'}-${Math.random().toString(36).slice(2, 6)}`
  return buildPersonalTrack({
    id,
    title: title.trim() || 'Untitled track',
    description: description.trim() || 'A learning track you are building yourself.',
    family: 'Personal',
    kind: 'custom',
    icon: '🧭',
    tags: ['personal'],
    style: 'practice',
    supports: { coding: true, project: true },
    categories: [{ title: 'Getting started', topics: [] }],
  })
}
