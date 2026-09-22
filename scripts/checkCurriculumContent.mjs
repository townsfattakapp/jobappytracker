import { build } from 'esbuild'
import fs from 'node:fs'
fs.mkdirSync('scratch/learning-tests', { recursive: true })
const tracks = ['dsa', 'java', 'js', 'react', 'node', 'sql', 'hld', 'lld', 'cs', 'devops']
await build({
  entryPoints: Object.fromEntries(tracks.flatMap((t) => [[`raw-${t}`, `src/data/curriculum/${t}.ts`], [`content-${t}`, `src/data/curriculum/content/${t}.ts`]])),
  outdir: 'scratch/learning-tests',
  bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, logLevel: 'silent',
})
let problems = 0
for (const t of tracks) {
  const raw = Object.values(await import(`../scratch/learning-tests/raw-${t}.mjs`))[0]
  const content = Object.values(await import(`../scratch/learning-tests/content-${t}.mjs`))[0]
  const cats = new Map()
  for (const l of raw.levels) for (const c of l.categories) cats.set(c.title, new Set(c.modules.flatMap((m) => m.topics.map((x) => x.title))))
  const covered = new Set()
  for (const [cat, entries] of Object.entries(content.topics)) {
    if (!cats.has(cat)) { console.log(`[${t}] unknown category "${cat}"`); problems++; continue }
    for (const e of entries) {
      if (!cats.get(cat).has(e[0])) { console.log(`[${t}] "${cat}" has no topic "${e[0]}"`); problems++ }
      else covered.add(`${cat}::${e[0]}`)
      if (e[2].length !== 3) { console.log(`[${t}] "${e[0]}" concepts != 3`); problems++ }
      if (e[3].length < 2) { console.log(`[${t}] "${e[0]}" quiz < 2`); problems++ }
    }
  }
  for (const cat of Object.keys(content.add ?? {})) if (!cats.has(cat)) { console.log(`[${t}] add: unknown category "${cat}"`); problems++ }
  for (const key of Object.keys(content.retitle ?? {})) { const [cat, title] = key.split(' > '); if (!cats.get(cat)?.has(title)) { console.log(`[${t}] retitle: no topic "${key}"`); problems++ } }
  let missing = 0
  for (const [cat, set] of cats) for (const title of set) if (!covered.has(`${cat}::${title}`)) { missing++; console.log(`[${t}] not covered: ${cat} > ${title}`) }
  const added = Object.values(content.add ?? {}).reduce((a, b) => a + b.length, 0)
  console.log(`== ${t}: ${covered.size} covered, ${missing} missing, ${added} added`)
}
console.log(problems ? `PROBLEMS: ${problems}` : 'ALL CONTENT KEYS MATCH')
process.exitCode = problems ? 1 : 0
