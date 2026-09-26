// Read-only migration preflight shared by the production runner and the tests.
// Compares the database ledger with the migration journal, lists pending
// files, scans them for destructive statements and reports what a run would
// do. It never writes.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

export const DESTRUCTIVE = /\b(DROP TABLE|DROP COLUMN|DROP SCHEMA|TRUNCATE|DELETE FROM|RENAME|ALTER COLUMN [^;]* TYPE)\b/i

export function loadJournal(root = process.cwd()) {
  const dir = path.join(root, 'src/lib/db/migrations')
  const journal = JSON.parse(readFileSync(path.join(dir, 'meta/_journal.json'), 'utf8'))
  return journal.entries.map((e) => {
    const rawSql = readFileSync(path.join(dir, `${e.tag}.sql`), 'utf8')
    const sql = rawSql.replace(/\r\n/g, '\n')
    return { idx: e.idx, tag: e.tag, when: e.when, sql, hash: createHash('sha256').update(sql).digest('hex'), destructive: (sql.match(DESTRUCTIVE) || []).map((m) => m.toUpperCase()) }
  })
}

/**
 * @param query async (sql, params) => rows   read-only query function
 */
export async function preflight(query, opts = {}) {
  const entries = loadJournal(opts.root)
  const hasSchema = (await query("select 1 from information_schema.schemata where schema_name = 'drizzle'")).length > 0
  const ledger = hasSchema ? await query('select id, hash, created_at from drizzle.__drizzle_migrations order by created_at') : []
  const applied = ledger.map((r) => Number(r.created_at))
  const appliedSet = new Set(applied)
  const pending = entries.filter((e) => !appliedSet.has(e.when))
  const unknown = applied.filter((ts) => !entries.some((e) => e.when === ts))
  const hashMismatch = ledger.filter((r) => { const e = entries.find((x) => x.when === Number(r.created_at)); return e && r.hash && r.hash !== e.hash })
  const tables = (await query("select table_name from information_schema.tables where table_schema = 'public' order by table_name")).map((r) => r.table_name)
  const users = tables.includes('users') ? Number((await query('select count(*)::int as n from users'))[0].n) : null
  const ordered = entries.every((e, i) => i === 0 || entries[i - 1].when < e.when)
  const problems = []
  if (!ordered) problems.push('journal timestamps are not strictly increasing')
  if (unknown.length) problems.push(`database has ${unknown.length} ledger row(s) unknown to this checkout (database is ahead or from another branch): ${unknown.join(', ')}`)
  if (hashMismatch.length) problems.push(`ledger hash differs from the checked-in SQL for: ${hashMismatch.map((r) => r.created_at).join(', ')}`)
  const gaps = pending.filter((p) => applied.some((ts) => ts > p.when))
  if (gaps.length) problems.push(`pending migrations older than an applied one (out of order): ${gaps.map((g) => g.tag).join(', ')}`)
  const destructive = pending.filter((p) => p.destructive.length)
  return { appliedCount: ledger.length, journalCount: entries.length, pending: pending.map((p) => ({ tag: p.tag, when: p.when, destructive: p.destructive })), destructive: destructive.map((d) => ({ tag: d.tag, statements: d.destructive })), unknown, hashMismatch: hashMismatch.length, tables, users, problems, ok: problems.length === 0 }
}

export function formatPreflight(report, target) {
  const lines = [`Migration preflight for ${target}`, `  ledger: ${report.appliedCount} applied · journal: ${report.journalCount} · pending: ${report.pending.length}`, `  public tables: ${report.tables.length}${report.users != null ? ` · users: ${report.users}` : ''}`]
  for (const p of report.pending) lines.push(`  pending ${p.tag}${p.destructive.length ? `  !! destructive: ${p.destructive.join(', ')}` : ''}`)
  if (report.destructive.length) lines.push('  WARNING: pending migrations contain destructive statements; review before approval.')
  for (const p of report.problems) lines.push(`  PROBLEM: ${p}`)
  lines.push(report.ok ? (report.pending.length ? '  Status: pending migrations are additive and in order; a backup must exist before approval.' : '  Status: database is up to date.') : '  Status: BLOCKED until the problems above are resolved.')
  return lines.join('\n')
}
