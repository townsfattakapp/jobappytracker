import { build } from 'esbuild'
import fs from 'node:fs'

const outdir = `scratch/learning-tests/test-engine-${process.pid}`
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

console.log('Running curriculum engine unit tests...')

let failed = false
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    failed = true
  } else {
    console.log(`✅ PASS: ${message}`)
  }
}

assert(allCurriculums.length > 0, 'Should load curriculums')
assert(allCurriculums.some(t => t.id === 'track-dsa'), 'Core tracks should be present')
assert(allCurriculums.some(t => t.id.startsWith('track-')), 'Library tracks should be parsed correctly')

if (failed) process.exit(1)
console.log('All tests passed.')
