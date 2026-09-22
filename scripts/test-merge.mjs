// Unit checks for the cloud conflict merge. Run: node scripts/test-merge.mjs
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import fs from 'node:fs'
fs.mkdirSync('scratch/learning-tests', { recursive: true })
await build({ entryPoints: { mergeStorage: 'src/lib/mergeStorage.ts' }, outdir: 'scratch/learning-tests', bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent' })
const { mergeStorage, mergeById } = await import('../scratch/learning-tests/mergeStorage.mjs')

const base = () => ({
  applications: [], version: 1, prepNotes: [], goals: [], roadmap: [], dsaProblems: [], dsaAttemptSummaries: [], revisionItems: [],
  engineeringLabs: [], labAttemptSummaries: [], mockInterviewSummaries: [], leetCodeConfig: { username: '', lastSync: null, totalSolved: 0 },
  systemDesignExercises: [], systemDesignAttemptSummaries: [], knowledgeWorkspaces: [],
})

// Union by id, newer updatedAt wins, local wins without timestamps.
const merged = mergeById(
  [{ id: 'a', v: 'local', updatedAt: '2026-09-22T10:00:00Z' }, { id: 'c', v: 'local-only' }],
  [{ id: 'a', v: 'cloud', updatedAt: '2026-09-22T11:00:00Z' }, { id: 'b', v: 'cloud-only' }],
)
assert.deepEqual(merged.map((x) => x.id).sort(), ['a', 'b', 'c'])
assert.equal(merged.find((x) => x.id === 'a').v, 'cloud')
console.log('PASS: union by id, newer record wins')

// Applications added on both devices survive; goals keep the later edit.
const local = { ...base(), applications: [{ id: 'app1', company: 'Local Co', updatedAt: '2026-09-22T09:00:00Z' }], goals: [{ id: 'g', targetRole: 'Local role', updatedAt: '2026-09-22T12:00:00Z' }] }
const cloud = { ...base(), applications: [{ id: 'app2', company: 'Cloud Co', updatedAt: '2026-09-22T09:30:00Z' }], goals: [{ id: 'g', targetRole: 'Cloud role', updatedAt: '2026-09-22T11:00:00Z' }] }
const out = mergeStorage(local, cloud)
assert.equal(out.applications.length, 2)
assert.equal(out.goals[0].targetRole, 'Local role')
console.log('PASS: both devices\' applications kept, later goal edit wins')

// Roadmap tasks: completion is never lost; notes on the same topic are unioned.
const day = (status) => ({ id: 'g:2026-09-22', goalId: 'g', date: '2026-09-22', dayNumber: 1, tasks: [{ id: 't1', status, title: 'Learn' }] })
const ws = (noteId, content) => ({ topicId: 'top-1', learningStatus: 'Learning', notes: [{ id: noteId, title: 'n', content, attachments: [], createdAt: 'x', updatedAt: '2026-09-22T10:00:00Z' }], examples: [], diagrams: [], codeSnippets: [], flashcards: [], mistakes: ['m1'] })
const out2 = mergeStorage({ ...base(), roadmap: [day('Pending')], knowledgeWorkspaces: [ws('n-local', 'local note')] }, { ...base(), roadmap: [day('Completed')], knowledgeWorkspaces: [{ ...ws('n-cloud', 'cloud note'), mistakes: ['m2'] }] })
assert.equal(out2.roadmap[0].tasks[0].status, 'Completed')
assert.equal(out2.knowledgeWorkspaces.length, 1)
assert.deepEqual(out2.knowledgeWorkspaces[0].notes.map((n) => n.content).sort(), ['cloud note', 'local note'])
assert.deepEqual(out2.knowledgeWorkspaces[0].mistakes.sort(), ['m1', 'm2'])
console.log('PASS: task completion kept, workspace notes and mistakes unioned')

// The serialised history never rides along in a merged snapshot (it is rebuilt from IndexedDB).
assert.equal(mergeStorage({ ...base(), learningHistory: '[]' }, { ...base(), learningHistory: '[]' }).learningHistory, undefined)
console.log('PASS: learningHistory stripped from merges')
console.log('Merge tests passed.')
