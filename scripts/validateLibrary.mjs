// Validates every track in src/data/curriculum/library against the authoring
// rules (see library/AUTHORING.md) and checks ids stay unique across the
// whole curriculum. Run: node scripts/validateLibrary.mjs [trackId ...]
import { build } from 'esbuild'
import fs from 'node:fs'

const outdir = `scratch/learning-tests/validate-${process.pid}`
fs.mkdirSync(outdir, { recursive: true })
await build({
  entryPoints: { curriculum: 'src/data/curriculum/index.ts' },
  outdir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  logLevel: 'silent',
})
const { allCurriculums: registered, coreCurriculums } = await import(`../${outdir}/curriculum.mjs`)
// Extra track files can be validated before they are registered in library/index.ts:
//   node scripts/validateLibrary.mjs src/data/curriculum/library/rust.ts
const files = process.argv.slice(2).filter((a) => a.endsWith('.ts'))
const only = new Set(process.argv.slice(2).filter((a) => !a.endsWith('.ts')))
let allCurriculums = registered
if (files.length) {
  await build({
    entryPoints: Object.fromEntries(files.map((f, i) => [`extra-${i}`, f])),
    outdir,
    bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent',
  })
  const extra = []
  for (let i = 0; i < files.length; i++) {
    const mod = await import(`../${outdir}/extra-${i}.mjs?${Date.now()}`)
    for (const value of Object.values(mod)) if (value && typeof value === 'object' && value.id && value.levels) extra.push(value)
  }
  const extraIds = new Set(extra.map((t) => t.id))
  allCurriculums = [...registered.filter((t) => !extraIds.has(t.id)), ...extra]
  for (const t of extra) only.add(t.id)
}
const coreIds = new Set(coreCurriculums.map((t) => t.id))
const FAMILIES = new Set([
  'Software Engineering Interviews', 'Programming Languages', 'Backend Frameworks', 'AI & Generative AI', 'Data Science', 'Data Analytics & BI',
  'Data Engineering', 'Mobile Development', 'Frontend & Web', 'Cloud, DevOps & Platform', 'Cybersecurity', 'Computer Science', 'Personal',
])
const MODES = new Set(['concept', 'react', 'node', 'sql', 'devops', 'cs', 'hld', 'lld', 'data', 'tool', 'math', 'security'])

const errors = []
const err = (track, msg) => errors.push(`[${track}] ${msg}`)
const ids = new Map()
const trackIds = new Set()
let checked = 0

for (const track of allCurriculums) {
  if (trackIds.has(track.id)) err(track.id, 'duplicate track id')
  trackIds.add(track.id)
  const walkIds = (id, where) => {
    if (ids.has(id)) err(track.id, `duplicate id ${id} (${where}; also ${ids.get(id)})`)
    else ids.set(id, where)
  }
  for (const level of track.levels) {
    walkIds(level.id, 'level')
    for (const cat of level.categories) {
      walkIds(cat.id, cat.title)
      for (const mod of cat.modules) {
        walkIds(mod.id, mod.title)
        for (const topic of mod.topics) {
          walkIds(topic.id, topic.title)
          for (const sub of topic.subtopics) {
            walkIds(sub.id, sub.title)
            for (const task of sub.tasks) walkIds(task.id, task.title)
          }
        }
      }
    }
  }
  if (coreIds.has(track.id)) continue
  if (only.size && !only.has(track.id)) continue
  checked += 1
  const t = track.id
  if (!/^track-[a-z0-9-]+$/.test(track.id)) err(t, 'id must be track-<slug>')
  if (!track.title) err(t, 'missing title')
  if (!track.description || track.description.length < 40) err(t, 'description under 40 chars')
  if (!FAMILIES.has(track.family)) err(t, `unknown family "${track.family}"`)
  if (!track.kind) err(t, 'missing kind')
  if (!MODES.has(track.explainMode || 'concept')) err(t, `unknown explainMode "${track.explainMode}"`)
  if (!track.tags?.length) err(t, 'missing tags')
  for (const pre of track.prerequisites || []) if (!allCurriculums.some((x) => x.id === pre)) err(t, `prerequisite track "${pre}" does not exist`)
  const cats = track.levels.flatMap((l) => l.categories)
  if (cats.length < 5 || cats.length > 14) err(t, `${cats.length} categories (need 5–14)`)
  const topicTitles = new Map()
  const conceptTitles = new Map()
  let topicCount = 0
  for (const cat of cats) {
    const topics = cat.modules.flatMap((m) => m.topics)
    if (topics.length < 3 || topics.length > 9) err(t, `category "${cat.title}" has ${topics.length} topics (need 3–9)`)
    for (const topic of topics) {
      topicCount += 1
      const key = topic.title.trim().toLowerCase()
      if (topicTitles.has(key)) err(t, `topic title repeated: "${topic.title}" (${cat.title} and ${topicTitles.get(key)})`)
      else topicTitles.set(key, cat.title)
      const d = topic.description || ''
      if (d.length < 60 || d.length > 320) err(t, `"${topic.title}": description ${d.length} chars (need 60–320)`)
      if (/^(learn|understand|study|introduction to|basics of) /i.test(d)) err(t, `"${topic.title}": description starts with filler ("${d.slice(0, 30)}…")`)
      if (topic.subtopics.length < 3 || topic.subtopics.length > 6) err(t, `"${topic.title}": ${topic.subtopics.length} concepts (need 3–6)`)
      for (const sub of topic.subtopics) {
        const words = sub.title.trim().split(/\s+/).length
        if (words < 1 || words > 9) err(t, `"${topic.title}" concept "${sub.title}": ${words} words (need 1–9)`)
        if (/^(basics|fundamentals|advanced topics|miscellaneous|introduction|overview)$/i.test(sub.title.trim())) err(t, `"${topic.title}" concept "${sub.title}" is generic`)
        const ck = sub.title.trim().toLowerCase()
        if (conceptTitles.has(ck) && conceptTitles.get(ck) !== topic.title) err(t, `concept "${sub.title}" repeated in "${topic.title}" and "${conceptTitles.get(ck)}"`)
        else conceptTitles.set(ck, topic.title)
      }
      const quiz = topic.quiz || []
      if (quiz.length < 2 || quiz.length > 4) err(t, `"${topic.title}": ${quiz.length} quiz items (need 2–4)`)
      for (const q of quiz) if (!q.question || !q.answer || q.answer.length > 240) err(t, `"${topic.title}": quiz item malformed or answer too long`)
      for (const pre of topic.prerequisites || []) if (!ids.has(pre)) err(t, `"${topic.title}": prerequisite ${pre} unresolved`)
    }
  }
  if (topicCount < 25 || topicCount > 90) err(t, `${topicCount} topics (need 25–90)`)
}

if (errors.length) {
  console.log(errors.slice(0, 200).join('\n'))
  if (errors.length > 200) console.log(`… ${errors.length - 200} more`)
  console.log(`\nFAILED: ${errors.length} problem${errors.length === 1 ? '' : 's'} across ${checked} library track${checked === 1 ? '' : 's'}`)
  process.exit(1)
}
console.log(`OK: ${checked} library track${checked === 1 ? '' : 's'} valid, ${allCurriculums.length} tracks total, ${ids.size} unique ids`)
