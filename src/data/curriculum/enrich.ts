import type { CurriculumCategory, CurriculumTopic, CurriculumTrack } from '../../types'

/**
 * Authored content layered on top of the generated curriculum files.
 *
 * The generated files carry the structure (ids, categories, task templates).
 * Each track's `content/<track>.ts` adds, per category, a tuple per topic:
 *   [title, description, [concept 1, concept 2, concept 3], [[question, answer], ...]]
 * Matching is by category title + topic title, so the generated ids (which
 * user data references) never change. `add` lists new topics appended to a
 * category, built with the same task template and deterministic ids.
 * `retitle` renames a topic without changing its id.
 */

export type TopicContent = [title: string, description: string, concepts: [string, string, string], quiz: [string, string][]]

export interface TrackContent {
  topics: Record<string, TopicContent[]>
  add?: Record<string, TopicContent[]>
  retitle?: Record<string, string>
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function buildTopic(trackId: string, category: string, [title, description, concepts, quiz]: TopicContent): CurriculumTopic {
  const base = `${slug(trackId.replace(/^track-/, ''))}-${slug(category)}-${slug(title)}`
  const task = (n: number, t: string, type: 'Concept' | 'Practice' | 'Revision', minutes: number) => ({ id: `tsk-${base}-${n}`, title: t, type, estDurationMinutes: minutes })
  return {
    id: `top-${base}`,
    title,
    description,
    quiz: quiz.map(([question, answer]) => ({ question, answer })),
    subtopics: [
      { id: `sub-${base}-1`, title: concepts[0], tasks: [task(1, 'Learn Concept', 'Concept', 30), task(2, 'Review Notes', 'Revision', 15)] },
      { id: `sub-${base}-2`, title: concepts[1], tasks: [task(3, 'Study Examples', 'Concept', 30), task(4, 'Write Code Snippets', 'Practice', 45)] },
      { id: `sub-${base}-3`, title: concepts[2], tasks: [task(5, 'Solve Problems', 'Practice', 60)] },
    ],
  }
}

function enrichCategory(trackId: string, category: CurriculumCategory, content: TrackContent): CurriculumCategory {
  const entries = new Map((content.topics[category.title] ?? []).map((e) => [e[0], e]))
  const modules = category.modules.map((mod) => ({
    ...mod,
    topics: mod.topics.map((topic) => {
      const entry = entries.get(topic.title)
      const newTitle = content.retitle?.[`${category.title} > ${topic.title}`]
      if (!entry && !newTitle) return topic
      const next: CurriculumTopic = { ...topic }
      if (newTitle) next.title = newTitle
      if (entry) {
        const [, description, concepts, quiz] = entry
        next.description = description
        if (quiz.length) next.quiz = quiz.map(([question, answer]) => ({ question, answer }))
        next.subtopics = topic.subtopics.map((sub, i) => (concepts[i] ? { ...sub, title: concepts[i] } : sub))
      }
      return next
    }),
  }))
  const additions = (content.add?.[category.title] ?? []).map((e) => buildTopic(trackId, category.title, e))
  if (additions.length && modules.length) {
    const last = modules[modules.length - 1]
    modules[modules.length - 1] = { ...last, topics: [...last.topics, ...additions] }
  }
  return { ...category, modules }
}

export function applyContent(track: CurriculumTrack, content?: TrackContent): CurriculumTrack {
  if (!content) return track
  return {
    ...track,
    levels: track.levels.map((level) => ({
      ...level,
      categories: level.categories.map((category) => enrichCategory(track.id, category, content)),
    })),
  }
}
