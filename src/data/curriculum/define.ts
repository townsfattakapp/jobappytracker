import type { CurriculumCategory, CurriculumTaskDef, CurriculumTopic, CurriculumTrack } from '../../types'

/**
 * Compact authoring format for learning tracks.
 *
 * A track is written as categories → topics → concepts. Ids are derived from
 * the track id and the titles, so they are stable across releases as long as
 * titles do not change (rename with `retitle` on a topic instead of editing
 * the title, and user data keeps pointing at the same topic). The same rule
 * applies to personal tracks built in the app.
 */

export type TaskStyle = 'code' | 'practice' | 'design' | 'project' | 'reading'

export interface TopicSpec {
  title: string
  /** One or two specific sentences: what it is and why it matters. */
  description: string
  /** Individually teachable concepts (3 to 6). Each becomes a concept card with its own tasks. */
  concepts: string[]
  /** Question/answer pairs for the quiz and flashcards (2 to 4). */
  quiz?: [string, string][]
  /** Titles of topics in the same track that should come first. */
  prereqs?: string[]
  /** Overrides the category or track task style. */
  style?: TaskStyle
  /** Keeps an older id when a topic is renamed: the slug of the previous title. */
  retitle?: string
}

export interface CategorySpec {
  title: string
  description?: string
  style?: TaskStyle
  topics: TopicSpec[]
}

export interface TrackSpec extends Omit<CurriculumTrack, 'levels' | 'prerequisites' | 'id'> {
  id: string
  prerequisites?: string[]
  style?: TaskStyle
  categories: CategorySpec[]
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Task templates per style. Titles matter: the roadmap and the workspace key behaviour off them. */
const TEMPLATES: Record<TaskStyle, [string, CurriculumTaskDef['type'], number][][]> = {
  code: [
    [['Learn Concept', 'Concept', 30], ['Review Notes', 'Revision', 15]],
    [['Study Examples', 'Concept', 30], ['Write Code Snippets', 'Practice', 45]],
    [['Solve Problems', 'Practice', 60]],
  ],
  practice: [
    [['Learn Concept', 'Concept', 30], ['Review Notes', 'Revision', 15]],
    [['Study Examples', 'Concept', 30], ['Practice Exercise', 'Practice', 45]],
    [['Apply It', 'Practice', 45]],
  ],
  design: [
    [['Learn Concept', 'Concept', 30], ['Review Notes', 'Revision', 15]],
    [['Study Examples', 'Concept', 30], ['Draw Diagram', 'Practice', 45]],
    [['Design Exercise', 'Practice', 60]],
  ],
  project: [
    [['Plan the Work', 'Concept', 30]],
    [['Build It', 'Project', 120]],
    [['Review and Document', 'Revision', 30]],
  ],
  reading: [
    [['Learn Concept', 'Concept', 30], ['Review Notes', 'Revision', 15]],
    [['Study Examples', 'Concept', 30]],
    [['Complete Quiz', 'Assessment', 20]],
  ],
}

function buildTopic(trackId: string, category: string, spec: TopicSpec, style: TaskStyle): CurriculumTopic {
  const trackSlug = slug(trackId.replace(/^track-/, ''))
  const base = `${trackSlug}-${slug(category)}-${spec.retitle ? slug(spec.retitle) : slug(spec.title)}`
  let n = 0
  const concepts = spec.concepts.length ? spec.concepts : ['Fundamentals']
  const template = TEMPLATES[style]
  return {
    id: `top-${base}`,
    title: spec.title,
    description: spec.description,
    quiz: spec.quiz?.map(([question, answer]) => ({ question, answer })),
    subtopics: concepts.map((title, i) => {
      const tasks = (template[Math.min(i, template.length - 1)] || template[template.length - 1]).map(([t, type, minutes]) => {
        n += 1
        return { id: `tsk-${base}-${n}`, title: t, type, estDurationMinutes: minutes } as CurriculumTaskDef
      })
      return { id: `sub-${base}-${i + 1}`, title, tasks }
    }),
  }
}

/** Builds a full CurriculumTrack from the compact spec with deterministic ids. */
export function defineTrack(spec: TrackSpec): CurriculumTrack {
  const { categories, style = 'code', prerequisites = [], ...meta } = spec
  const trackSlug = slug(spec.id.replace(/^track-/, ''))
  const titleToId = new Map<string, string>()
  const built: CurriculumCategory[] = categories.map((cat) => {
    const topics = cat.topics.map((t) => {
      const topic = buildTopic(spec.id, cat.title, t, t.style || cat.style || style)
      titleToId.set(t.title.toLowerCase(), topic.id)
      return topic
    })
    return {
      id: `cat-${trackSlug}-${slug(cat.title)}`,
      title: cat.title,
      description: cat.description,
      modules: [{ id: `mod-${trackSlug}-${slug(cat.title)}`, title: 'Concepts & Practice', topics }],
    }
  })
  // Resolve topic prerequisites by title within the track.
  for (const cat of categories) {
    for (const t of cat.topics) {
      if (!t.prereqs?.length) continue
      const id = titleToId.get(t.title.toLowerCase())
      const topic = built.flatMap((c) => c.modules[0].topics).find((x) => x.id === id)
      if (!topic) continue
      const ids = t.prereqs.map((p) => titleToId.get(p.toLowerCase())).filter((x): x is string => Boolean(x))
      if (ids.length) topic.prerequisites = ids
    }
  }
  return {
    ...meta,
    id: spec.id,
    prerequisites,
    source: meta.source || 'builtin',
    status: meta.status || 'published',
    version: meta.version || 1,
    levels: [{ id: `lvl-${trackSlug}`, name: meta.level && meta.level !== 'All Levels' ? meta.level : 'All Levels', categories: built }],
  }
}

/** Rebuilds a compact spec from a track (used by the in-app editor). Ids are regenerated from titles. */
export function specFromTrack(track: CurriculumTrack): TrackSpec {
  const categories: CategorySpec[] = track.levels.flatMap((level) =>
    level.categories.map((cat) => ({
      title: cat.title,
      description: cat.description,
      topics: cat.modules.flatMap((mod) =>
        mod.topics.map((topic) => ({
          title: topic.title,
          description: topic.description || '',
          concepts: topic.subtopics.map((s) => s.title),
          quiz: topic.quiz?.map((q) => [q.question, q.answer] as [string, string]),
        })),
      ),
    })),
  )
  const { levels: _levels, prerequisites, ...meta } = track
  void _levels
  return { ...meta, id: track.id, prerequisites, categories }
}

/** Counts used by pickers and reports. */
export function countTrack(track: CurriculumTrack): { categories: number; topics: number; concepts: number; minutes: number; described: number; quizzed: number } {
  let categories = 0
  let topics = 0
  let concepts = 0
  let minutes = 0
  let described = 0
  let quizzed = 0
  for (const level of track.levels)
    for (const cat of level.categories) {
      categories += 1
      for (const mod of cat.modules)
        for (const topic of mod.topics) {
          topics += 1
          if (topic.description && topic.description.length >= 30) described += 1
          if (topic.quiz?.length) quizzed += 1
          for (const sub of topic.subtopics) {
            concepts += 1
            for (const task of sub.tasks) minutes += task.estDurationMinutes || 30
          }
        }
    }
  return { categories, topics, concepts, minutes, described, quizzed }
}
