// Upload validation and filename safety from the server resume module.
// The module imports the app database, so only the pure helpers are bundled
// (esbuild tree-shakes what the test imports; the db module is stubbed).
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: { resumes: 'src/lib/server/resumes.ts' },
  outdir: 'scratch/resume-server-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['drizzle-orm', 'drizzle-orm/*', 'pg', 'pdf-parse', 'next/*', 'next-auth', 'next-auth/*'],
  plugins: [{ name: 'stub-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const db = {}' })) } }],
  logLevel: 'silent',
})
const { sniffResume, safeFilename, MAX_RESUME_BYTES } = await import('../scratch/resume-server-tests/resumes.mjs')

test('upload validation reads the bytes, not the declared type', () => {
  assert.equal(sniffResume(new TextEncoder().encode('%PDF-1.4 fake'), 'text/plain', 'x.txt'), 'pdf')
  assert.equal(sniffResume(new TextEncoder().encode('Plain resume text'), 'text/plain', 'resume.txt'), 'text')
  assert.throws(() => sniffResume(new TextEncoder().encode('<html>'), 'application/pdf', 'resume.pdf'), /Upload a PDF/)
  assert.throws(() => sniffResume(new Uint8Array(0), 'application/pdf', 'r.pdf'), /empty/)
  assert.throws(() => sniffResume(new Uint8Array(MAX_RESUME_BYTES + 1), 'application/pdf', 'r.pdf'), /2 MB or smaller/)
  assert.throws(() => sniffResume(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0]), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'r.docx'), /DOCX is not supported/)
  assert.throws(() => sniffResume(new Uint8Array([65, 0, 66]), 'text/plain', 'r.txt'), /plain text/)
})

test('stored filenames cannot carry paths or header-breaking characters', () => {
  assert.equal(safeFilename('../../etc/passwd'), 'etc_passwd'.replace('etc_passwd', 'passwd'))
  assert.equal(safeFilename('C:\\Users\\me\\My Resume (final).pdf'), 'My Resume (final).pdf')
  assert.equal(safeFilename('weird"name\r\n.pdf'), 'weird_name_.pdf')
  assert.equal(safeFilename(''), 'resume')
  assert.ok(safeFilename('a'.repeat(300) + '.pdf').length <= 120)
})
