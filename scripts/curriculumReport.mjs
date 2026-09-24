import { build } from 'esbuild'
import fs from 'node:fs'

const outdir = `scratch/learning-tests/report-${process.pid}`
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

const { allCurriculums } = await import(`../${outdir}/curriculum.mjs`)

const families = {}
for (const t of allCurriculums) {
  if (!families[t.family]) families[t.family] = { categories: {}, total: 0 }
  families[t.family].total++
  if (!families[t.family].categories[t.category || t.kind]) families[t.family].categories[t.category || t.kind] = []
  families[t.family].categories[t.category || t.kind].push(t.title)
}

let md = '# Curriculum Coverage Report\n\n'
md += `Total Tracks: ${allCurriculums.length}\n\n`

for (const [family, data] of Object.entries(families).sort((a,b) => a[0].localeCompare(b[0]))) {
  md += `## ${family} (${data.total})\n\n`
  for (const [category, tracks] of Object.entries(data.categories).sort((a,b) => a[0].localeCompare(b[0]))) {
    md += `### ${category}\n`
    for (const title of tracks.sort()) {
      md += `- ${title}\n`
    }
    md += '\n'
  }
}

fs.writeFileSync('docs/curriculum-coverage.md', md)
console.log('Generated docs/curriculum-coverage.md')
