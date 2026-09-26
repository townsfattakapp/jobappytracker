import { build } from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'

const outdir = 'scratch/curriculum-manifest-build'
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

const coreIds = new Set([
  'track-dsa',
  'track-java',
  'track-js',
  'track-react',
  'track-node',
  'track-sql',
  'track-hld',
  'track-lld',
  'track-cs',
  'track-devops',
])

const libraryTracks = allCurriculums.filter((t) => !coreIds.has(t.id))

console.log(`Processing ${libraryTracks.length} library tracks...`)

// Create compact manifest with metadata, categories, and topic ids/titles
const manifest = libraryTracks.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  family: t.family,
  kind: t.kind,
  icon: t.icon,
  tags: t.tags || [],
  languages: t.languages || [],
  explainMode: t.explainMode,
  code: t.code,
  supports: t.supports || {},
  prerequisites: t.prerequisites || [],
  source: 'builtin',
  status: 'published',
  version: t.version || 2,
  categories: t.levels.flatMap((l) =>
    l.categories.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      topics: c.modules.flatMap((m) =>
        m.topics.map((top) => ({
          id: top.id,
          title: top.title,
        })),
      ),
    })),
  ),
}))

const jsonStr = JSON.stringify(manifest)
fs.writeFileSync('src/data/curriculum/libraryManifest.json', jsonStr)
console.log(`src/data/curriculum/libraryManifest.json written (${(jsonStr.length / (1024 * 1024)).toFixed(2)} MB)`)

// Map trackId to file in src/data/curriculum/library
const libraryFiles = fs
  .readdirSync('src/data/curriculum/library')
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')

const lines = [
  "import type { CurriculumTrack } from '../../types'",
  '',
  'export const libraryLoaders: Record<string, () => Promise<any>> = {',
]

for (const t of manifest) {
  const bareSlug = t.id.replace(/^track-/, '')
  const found = libraryFiles.find(
    (f) => f === bareSlug + '.ts' || f.replace(/-/g, '') === bareSlug.replace(/-/g, '') + '.ts',
  )
  if (!found) {
    console.error(`Warning: could not find file for track ${t.id} (slug: ${bareSlug})`)
    continue
  }
  const modFile = found.replace('.ts', '')
  lines.push(`  '${t.id}': () => import('./library/${modFile}'),`)
}

lines.push('}')
lines.push('')
lines.push('export async function loadLibraryTrack(trackId: string): Promise<CurriculumTrack | null> {')
lines.push('  const loader = libraryLoaders[trackId]')
lines.push('  if (!loader) return null')
lines.push('  try {')
lines.push('    const mod = await loader()')
lines.push('    for (const key of Object.keys(mod)) {')
lines.push('      const val = mod[key]')
lines.push("      if (val && typeof val === 'object' && val.id === trackId) return val as CurriculumTrack")
lines.push('    }')
lines.push("    if (mod.default && typeof mod.default === 'object' && mod.default.id === trackId) return mod.default as CurriculumTrack")
lines.push('  } catch (err) {')
lines.push('    console.error(`Failed to dynamically load curriculum track ${trackId}:`, err)')
lines.push('  }')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync('src/data/curriculum/loaders.ts', lines.join('\n'))
console.log(`src/data/curriculum/loaders.ts written with ${manifest.length} loaders`)
