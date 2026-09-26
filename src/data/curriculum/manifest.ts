import type { CurriculumTrack } from '../../types'
import manifestJson from './libraryManifest.json'

export interface ManifestCategory {
  id: string
  title: string
  description?: string
  topics: { id: string; title: string; description?: string }[]
}

export interface ManifestTrack {
  id: string
  title: string
  description: string
  family?: CurriculumTrack['family']
  kind?: CurriculumTrack['kind']
  icon?: string
  tags?: string[]
  languages?: string[]
  explainMode?: CurriculumTrack['explainMode']
  code?: CurriculumTrack['code']
  supports?: CurriculumTrack['supports']
  prerequisites?: string[]
  source: 'builtin'
  status: 'published'
  version: number
  categories: ManifestCategory[]
}

export function manifestToTrack(m: ManifestTrack): CurriculumTrack {
  const trackSlug = m.id.replace(/^track-/, '')
  return {
    ...m,
    prerequisites: m.prerequisites || [],
    levels: [
      {
        id: `lvl-${trackSlug}`,
        name: 'All Levels',
        categories: m.categories.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          modules: [
            {
              id: `mod-${c.id}`,
              title: 'Concepts & Practice',
              topics: c.topics.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description || '',
                subtopics: [
                  {
                    id: `sub-${t.id}-1`,
                    title: 'Fundamentals',
                    tasks: [
                      { id: `tsk-${t.id}-1`, title: 'Learn Concept', type: 'Concept', estDurationMinutes: 30 },
                      { id: `tsk-${t.id}-2`, title: 'Study Examples', type: 'Concept', estDurationMinutes: 30 },
                      { id: `tsk-${t.id}-3`, title: 'Practice Problems', type: 'Practice', estDurationMinutes: 45 },
                    ],
                  },
                ],
              })),
            },
          ],
        })),
      },
    ],
  }
}

export const libraryManifestTracks: CurriculumTrack[] = (manifestJson as ManifestTrack[]).map(manifestToTrack)
