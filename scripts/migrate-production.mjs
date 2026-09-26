// Production migration runner with an intentional approval workflow.
//
//   node scripts/migrate-production.mjs --preflight            read-only report (ledger vs journal, pending files, destructive scan)
//   node scripts/migrate-production.mjs --approve=HOST:PORT/DB apply pending migrations, only when the approval matches the
//                                                              connection target AND MIGRATE_PRODUCTION_APPROVED is set to the same value
//
// It is no longer run by the Vercel build hook: deploying code never migrates
// the database by itself. Run the preflight, take a backup, then approve.
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import path from 'node:path'
import { productionDatabaseConfig, migrationFailureMessage } from './lib/production-database.mjs'
import { formatPreflight, preflight } from './lib/migration-preflight.mjs'

export function migrationTarget(env) {
  const connectionString = env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL_NON_POOLING || env.DATABASE_URL
  if (!connectionString) throw new Error('A database connection string is required (POSTGRES_URL_NON_POOLING, DATABASE_URL_NON_POOLING or DATABASE_URL).')
  const url = new URL(connectionString)
  return `${url.hostname.toLowerCase().replace(/\.$/, '')}:${url.port || '5432'}${url.pathname}`
}

/** The approval must be given twice, in the environment and on the command line, and both must name the exact target. */
export function approvalGate(env, args) {
  const target = migrationTarget(env)
  const arg = args.find((a) => a.startsWith('--approve='))
  const approved = env.MIGRATE_PRODUCTION_APPROVED
  if (!arg || !approved) return { ok: false, target, reason: 'Refusing: production migrations need --approve=HOST:PORT/DATABASE on the command line AND MIGRATE_PRODUCTION_APPROVED=HOST:PORT/DATABASE in the environment. No connection was opened.' }
  if (arg.slice('--approve='.length) !== target || approved !== target) return { ok: false, target, reason: `Refusing: approval does not match the connection target ${target}. No connection was opened.` }
  return { ok: true, target, reason: null }
}

async function main() {
  const args = process.argv.slice(2)
  const target = migrationTarget(process.env)
  const pool = new pg.Pool(productionDatabaseConfig(process.env))
  try {
    if (args.includes('--preflight')) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN READ ONLY')
        const report = await preflight(async (sql, params) => (await client.query(sql, params)).rows)
        await client.query('ROLLBACK')
        console.log(formatPreflight(report, target))
        process.exitCode = report.ok ? 0 : 2
      } finally {
        client.release()
      }
      return
    }
    const gate = approvalGate(process.env, args)
    if (!gate.ok) {
      console.error(gate.reason)
      process.exitCode = 3
      return
    }
    const client = await pool.connect()
    let report
    try {
      await client.query('BEGIN READ ONLY')
      report = await preflight(async (sql, params) => (await client.query(sql, params)).rows)
      await client.query('ROLLBACK')
    } finally {
      client.release()
    }
    console.log(formatPreflight(report, target))
    if (!report.ok) {
      console.error('Refusing to migrate: preflight reported problems.')
      process.exitCode = 2
      return
    }
    if (report.destructive.length && !args.includes('--allow-destructive')) {
      console.error('Refusing to migrate: pending migrations contain destructive statements. Re-run with --allow-destructive after review.')
      process.exitCode = 2
      return
    }
    if (!report.pending.length) {
      console.log('Nothing to do.')
      return
    }
    console.log(`Applying ${report.pending.length} approved migration(s) to ${target}...`)
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') })
    console.log('Production migration complete.')
  } finally {
    await pool.end()
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
if (invokedDirectly) {
  main().catch((err) => {
    console.error(migrationFailureMessage(err))
    process.exitCode = 1
  })
}
