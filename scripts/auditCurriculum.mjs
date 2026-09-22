// Audits the learning-track curriculum: counts every level, category, module,
// topic, concept and task, and flags gaps (empty containers, missing
// descriptions, duplicate ids, broken prerequisites, topics without quiz or
// practice work). Run: node scripts/auditCurriculum.mjs [--json]
import { build } from 'esbuild'
import fs from 'node:fs'

fs.mkdirSync('scratch/learning-tests', { recursive: true })
await build({
  entryPoints: { curriculum: 'src/data/curriculum/index.ts' },
  outdir: 'scratch/learning-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  logLevel: 'silent',
})
const { allCurriculums } = await import('../scratch/learning-tests/curriculum.mjs')

const problems = []
const ids = new Map()
const topicIds = new Set()
const rows = []
const seenTitles = new Map()

const note = (severity, track, where, msg) => problems.push({ severity, track, where, msg })
const checkId = (id, where) => {
  if (!id) return note('error', where.split(' > ')[0], where, 'missing id')
  if (ids.has(id)) note('error', where.split(' > ')[0], where, `duplicate id "${id}" (also at ${ids.get(id)})`)
  else ids.set(id, where)
}

for (const track of allCurriculums) {
  const t = { track: track.title, id: track.id, levels: 0, categories: 0, modules: 0, topics: 0, concepts: 0, tasks: 0, minutes: 0, questions: 0, quizzes: 0, emptyTopics: 0, noDescription: 0 }
  checkId(track.id, track.title)
  if (!track.description) note('warn', track.title, track.title, 'track has no description')
  if (!track.levels?.length) note('error', track.title, track.title, 'track has no levels')
  for (const level of track.levels ?? []) {
    t.levels += 1
    const lw = `${track.title} > ${level.name}`
    checkId(level.id, lw)
    if (!level.categories?.length) note('error', track.title, lw, 'level has no categories')
    for (const cat of level.categories ?? []) {
      t.categories += 1
      const cw = `${lw} > ${cat.title}`
      checkId(cat.id, cw)
      if (!cat.modules?.length) note('error', track.title, cw, 'category has no modules')
      for (const mod of cat.modules ?? []) {
        t.modules += 1
        const mw = `${cw} > ${mod.title}`
        checkId(mod.id, mw)
        if (!mod.topics?.length) note('error', track.title, mw, 'module has no topics')
        for (const topic of mod.topics ?? []) {
          t.topics += 1
          const tw = `${mw} > ${topic.title}`
          checkId(topic.id, tw)
          topicIds.add(topic.id)
          const key = `${track.id}::${topic.title.trim().toLowerCase()}`
          if (seenTitles.has(key)) note('warn', track.title, tw, `topic title repeated (also at ${seenTitles.get(key)})`)
          else seenTitles.set(key, tw)
          if (!topic.description) t.noDescription += 1
          if (!topic.quiz?.length) t.quizzes += 0
          else t.quizzes += 1
          if (!topic.subtopics?.length) {
            t.emptyTopics += 1
            note('error', track.title, tw, 'topic has no concepts (subtopics)')
          }
          let topicTasks = 0
          for (const sub of topic.subtopics ?? []) {
            t.concepts += 1
            const sw = `${tw} > ${sub.title}`
            checkId(sub.id, sw)
            if (!sub.tasks?.length) note('warn', track.title, sw, 'concept has no tasks')
            for (const task of sub.tasks ?? []) {
              t.tasks += 1
              topicTasks += 1
              t.minutes += task.estDurationMinutes || 0
              if (!task.title || !task.type) note('error', track.title, sw, `task ${task.id} missing title or type`)
              if (!task.estDurationMinutes) note('warn', track.title, sw, `task "${task.title}" has no duration`)
            }
            t.questions += sub.questions?.length ?? 0
          }
          if (topic.subtopics?.length && topicTasks === 0) note('error', track.title, tw, 'topic has concepts but zero tasks (nothing to schedule)')
        }
      }
    }
  }
  rows.push(t)
}

// Prerequisites must point at real topics.
for (const track of allCurriculums) {
  for (const level of track.levels ?? [])
    for (const cat of level.categories ?? [])
      for (const mod of cat.modules ?? [])
        for (const topic of mod.topics ?? [])
          for (const pre of topic.prerequisites ?? [])
            if (!topicIds.has(pre)) note('warn', track.title, `${track.title} > ${topic.title}`, `prerequisite "${pre}" is not a known topic id`)
}

const totals = rows.reduce((a, r) => {
  for (const k of ['levels', 'categories', 'modules', 'topics', 'concepts', 'tasks', 'minutes', 'questions', 'quizzes', 'emptyTopics', 'noDescription']) a[k] = (a[k] || 0) + r[k]
  return a
}, {})

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ rows, totals, problems }, null, 2))
} else {
  const pad = (s, n) => String(s).padEnd(n)
  console.log(pad('Track', 34) + pad('Lvls', 5) + pad('Cats', 5) + pad('Mods', 5) + pad('Topics', 7) + pad('Concepts', 9) + pad('Tasks', 6) + pad('Hours', 6) + pad('Quiz', 5) + pad('Q&A', 5) + pad('NoDesc', 7) + 'Empty')
  for (const r of rows) console.log(pad(r.track, 34) + pad(r.levels, 5) + pad(r.categories, 5) + pad(r.modules, 5) + pad(r.topics, 7) + pad(r.concepts, 9) + pad(r.tasks, 6) + pad((r.minutes / 60).toFixed(0), 6) + pad(r.quizzes, 5) + pad(r.questions, 5) + pad(r.noDescription, 7) + r.emptyTopics)
  console.log(pad('TOTAL', 34) + pad(totals.levels, 5) + pad(totals.categories, 5) + pad(totals.modules, 5) + pad(totals.topics, 7) + pad(totals.concepts, 9) + pad(totals.tasks, 6) + pad((totals.minutes / 60).toFixed(0), 6) + pad(totals.quizzes, 5) + pad(totals.questions, 5) + pad(totals.noDescription, 7) + totals.emptyTopics)
  const errors = problems.filter((p) => p.severity === 'error')
  const warns = problems.filter((p) => p.severity === 'warn')
  console.log(`\n${errors.length} errors, ${warns.length} warnings`)
  for (const p of [...errors, ...warns].slice(0, 60)) console.log(`  [${p.severity}] ${p.where}: ${p.msg}`)
  if (problems.length > 60) console.log(`  … ${problems.length - 60} more (use --json)`)
}
process.exitCode = problems.some((p) => p.severity === 'error') ? 1 : 0
