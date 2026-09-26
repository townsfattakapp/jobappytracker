import type { CurriculumTrack } from '../../types'
import { applyContent } from './enrich'
import { trackdsaCurriculum } from './dsa'
import { trackjavaCurriculum } from './java'
import { trackjsCurriculum } from './js'
import { trackreactCurriculum } from './react'
import { tracknodeCurriculum } from './node'
import { tracksqlCurriculum } from './sql'
import { trackhldCurriculum } from './hld'
import { tracklldCurriculum } from './lld'
import { trackcsCurriculum } from './cs'
import { trackdevopsCurriculum } from './devops'
import { dsaContent } from './content/dsa'
import { javaContent } from './content/java'
import { jsContent } from './content/js'
import { reactContent } from './content/react'
import { nodeContent } from './content/node'
import { sqlContent } from './content/sql'
import { hldContent } from './content/hld'
import { lldContent } from './content/lld'
import { csContent } from './content/cs'
import { devopsContent } from './content/devops'

type Meta = Partial<Pick<CurriculumTrack, 'family' | 'kind' | 'tags' | 'languages' | 'explainMode' | 'code' | 'supports' | 'icon' | 'prerequisites'>>

function withMeta(track: CurriculumTrack, meta: Meta): CurriculumTrack {
  return { ...track, ...meta, prerequisites: meta.prerequisites ?? track.prerequisites, source: 'builtin', status: 'published', version: track.version || 2 }
}

/** The ten original tracks: generated structure + authored content + metadata that drives AI prompts and activity pickers. */
export const coreCurriculums: CurriculumTrack[] = [
  withMeta(applyContent(trackdsaCurriculum, dsaContent), {
    family: 'Software Engineering Interviews', kind: 'interview', icon: '🧩',
    tags: ['dsa', 'algorithms', 'data structures', 'leetcode', 'competitive programming'],
    languages: ['Java', 'Python', 'C++', 'Go', 'TypeScript', 'JavaScript'],
    explainMode: 'concept', supports: { coding: true, leetcode: true },
  }),
  withMeta(applyContent(trackjavaCurriculum, javaContent), {
    family: 'Programming Languages', kind: 'language', icon: '☕', tags: ['java', 'oop', 'collections', 'jvm', 'concurrency'], languages: ['Java'],
    explainMode: 'concept', code: { label: 'Java', id: 'java', fixed: true }, supports: { coding: true },
  }),
  withMeta(applyContent(trackjsCurriculum, jsContent), {
    family: 'Programming Languages', kind: 'language', icon: '🟨', tags: ['javascript', 'typescript', 'es6', 'async', 'types'], languages: ['JavaScript', 'TypeScript'],
    explainMode: 'concept', code: { label: 'JavaScript, or TypeScript when the topic is TypeScript', id: 'typescript', fixed: true }, supports: { coding: true },
  }),
  withMeta(applyContent(trackreactCurriculum, reactContent), {
    family: 'Frontend & Web', kind: 'framework', icon: '⚛️', tags: ['react', 'next.js', 'hooks', 'frontend', 'ssr'], languages: ['TypeScript'], prerequisites: ['track-js'],
    explainMode: 'react', code: { label: 'TypeScript with React (TSX)', id: 'typescript', fixed: true }, supports: { coding: true, labs: true, project: true },
  }),
  withMeta(applyContent(tracknodeCurriculum, nodeContent), {
    family: 'Backend Frameworks', kind: 'framework', icon: '🟩', tags: ['node.js', 'express', 'backend', 'api', 'rest'], languages: ['TypeScript', 'JavaScript'], prerequisites: ['track-js'],
    explainMode: 'node', code: { label: 'TypeScript on Node.js', id: 'typescript', fixed: true }, supports: { coding: true, labs: true, project: true },
  }),
  withMeta(applyContent(tracksqlCurriculum, sqlContent), {
    family: 'Programming Languages', kind: 'language', icon: '🗄️', tags: ['sql', 'postgresql', 'mysql', 'database', 'queries', 'indexes'], languages: ['SQL'],
    explainMode: 'sql', code: { label: 'SQL (PostgreSQL dialect)', id: 'sql', fixed: true }, supports: { coding: true },
  }),
  withMeta(applyContent(trackhldCurriculum, hldContent), {
    family: 'Software Engineering Interviews', kind: 'interview', icon: '🏗️', tags: ['system design', 'hld', 'architecture', 'scalability', 'distributed'],
    explainMode: 'hld', code: { label: 'pseudo-code only', id: 'plaintext', fixed: true }, supports: { design: true },
  }),
  withMeta(applyContent(tracklldCurriculum, lldContent), {
    family: 'Software Engineering Interviews', kind: 'interview', icon: '📐', tags: ['lld', 'object-oriented design', 'design patterns', 'uml'], languages: ['Java', 'Python', 'C++', 'TypeScript'],
    explainMode: 'lld', supports: { coding: true, design: true },
  }),
  withMeta(applyContent(trackcsCurriculum, csContent), {
    family: 'Computer Science', kind: 'domain', icon: '🧠', tags: ['operating systems', 'networking', 'dbms', 'cs fundamentals'],
    explainMode: 'cs', code: { label: 'pseudo-code, or short C-style snippets only where they help', id: 'cpp', fixed: true }, supports: {},
  }),
  withMeta(applyContent(trackdevopsCurriculum, devopsContent), {
    family: 'Cloud, DevOps & Platform', kind: 'domain', icon: '🚀', tags: ['devops', 'ci/cd', 'docker', 'kubernetes', 'security', 'cloud'],
    explainMode: 'devops', code: { label: 'shell, YAML or Dockerfile, whichever fits', id: 'bash', fixed: true }, supports: { labs: true, project: true },
  }),
]
