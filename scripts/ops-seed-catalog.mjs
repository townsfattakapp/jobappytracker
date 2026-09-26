// Operations: seed the company source catalog into a database, verify every
// feed read-only, enable the scheduled pass for verified feeds, and run one
// full ingestion pass so Job Discovery has real listings from day one.
//
//   node scripts/ops-seed-catalog.mjs --target=HOST:PORT/DATABASE [--admin-email=you@example.com] [--skip-ingest] [--ingest-only] [--parallel=6]
//
// --ingest-only skips seeding / verification and only runs the pass over the
// sources that are already scheduled; --parallel runs that many source groups
// concurrently (each source still holds its own lock), which matters against a
// hosted database with high round-trip latency.
//
// The target must match DATABASE_URL (same double-check as the migration
// runner). DATABASE_SSL_CA (PEM) is honoured for hosted databases. Uses the
// application's own catalog, ingestion engine and scheduler (bundled with
// esbuild), so what runs here is exactly what the admin panel and the cron
// run. Optional: --admin-email grants the admin role to an existing account
// and adds any feature keys missing from the highlighted paid plan.
import { build } from 'esbuild'
import { mkdirSync, readFileSync } from 'node:fs'
import { loadDevelopmentDatabaseEnv } from './lib/development-database.mjs'

loadDevelopmentDatabaseEnv()
const args = process.argv.slice(2)
const arg = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is required')
const url = new URL(connectionString)
const target = `${url.hostname.toLowerCase()}:${url.port || '5432'}${url.pathname}`
if (arg('target') !== target) {
  console.error(`Refusing: --target must name the exact database (${target}). No connection was opened.`)
  process.exit(3)
}

mkdirSync('scratch/ops-seed', { recursive: true })
await build({
  entryPoints: { catalog: 'src/lib/server/catalog.ts', scheduler: 'src/lib/ingestion/scheduler.ts', settings: 'src/lib/server/settings.ts', schema: 'src/lib/db/schema.ts', features: 'src/lib/entitlements/features.ts' },
  outdir: 'scratch/ops-seed',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer', '@electric-sql/pglite'],
  // The app's db singleton reads DATABASE_URL without SSL options; give it a pool built here instead.
  plugins: [{ name: 'ops-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') || a.importer.includes('ingestion') ? { path: 'ops-db', namespace: 'ops' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'ops' }, () => ({ contents: 'export const db = globalThis.__opsDb', loader: 'js' })) } }],
  logLevel: 'silent',
})
const pg = (await import('pg')).default
const { drizzle } = await import('drizzle-orm/node-postgres')
const { eq, sql } = await import('drizzle-orm')
const schema = await import('../scratch/ops-seed/schema.mjs')
const ssl = process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true } : /localhost|127\.0\.0\.1/.test(url.hostname) ? false : true
const parallel = Math.max(1, Math.min(12, Number(arg('parallel')) || 1))
const pool = new pg.Pool({ connectionString, ssl, max: 4 + parallel * 2, connectionTimeoutMillis: 15000 })
globalThis.__opsDb = drizzle(pool, { schema })
const db = globalThis.__opsDb

const catalog = await import('../scratch/ops-seed/catalog.mjs')
const { runScheduledIngestion } = await import('../scratch/ops-seed/scheduler.mjs')
const { getRoleFamilyConfig } = await import('../scratch/ops-seed/settings.mjs')
const { FEATURE_KEYS } = await import('../scratch/ops-seed/features.mjs')

const t0 = Date.now()
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`)
try {
  const adminEmail = arg('admin-email')
  if (adminEmail) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.email, adminEmail) })
    if (!user) throw new Error(`No account with email ${adminEmail}; sign up first, then re-run.`)
    const existing = await db.query.userRoles.findFirst({ where: sql`${schema.userRoles.userId} = ${user.id} and ${schema.userRoles.role} = 'admin'` })
    if (existing) log(`admin role already granted to ${adminEmail}`)
    else {
      await db.insert(schema.userRoles).values({ userId: user.id, role: 'admin', grantedBy: 'ops-seed' })
      log(`admin role granted to ${adminEmail}`)
    }
    const plans = await db.query.billingPlans.findMany()
    for (const plan of plans) {
      if (plan.isDefault) continue
      const have = new Set(plan.features)
      const missing = FEATURE_KEYS.filter((k) => !have.has(k))
      if (missing.length) {
        await db.update(schema.billingPlans).set({ features: [...plan.features, ...missing], updatedAt: new Date() }).where(eq(schema.billingPlans.id, plan.id))
        log(`plan ${plan.id}: added feature keys ${missing.join(', ')}`)
      } else log(`plan ${plan.id}: all ${plan.features.length} feature keys present`)
    }
  }

  if (!args.includes('--ingest-only')) {
    const seed = await catalog.seedCatalog(null)
    log(`catalog seeded: ${JSON.stringify(seed)}`)
    const verified = await catalog.verifyCatalogFeeds(null, { timeoutMs: 20_000 })
    const ok = verified.filter((v) => v.status === 'verified')
    log(`feeds verified: ${ok.length} ok, ${verified.length - ok.length} failed ${verified.filter((v) => v.status !== 'verified').map((v) => `${v.slug}(${v.httpStatus ?? v.note})`).join(' ')}`)
    const scheduled = await catalog.scheduleCatalog(null, true)
    log(`scheduled pass enabled for ${scheduled} sources`)
  }

  if (!args.includes('--skip-ingest')) {
    const roleFamilies = await getRoleFamilyConfig()
    const enabled = await db.query.jobSources.findMany({ where: sql`${schema.jobSources.status} = 'active' and ${schema.jobSources.ingestionAllowed} = true and ${schema.jobSources.scheduleEnabled} = true and ${schema.jobSources.provider} <> 'manual'`, columns: { id: true } })
    const groups = Array.from({ length: parallel }, () => [])
    enabled.forEach((s, i) => groups[i % parallel].push(s.id))
    log(`ingesting ${enabled.length} scheduled sources in ${parallel} parallel group(s)`)
    const reports = await Promise.all(groups.filter((g) => g.length).map((sourceIds, gi) => runScheduledIngestion(db, { roleFamilies, triggeredBy: 'ops-seed', budgetMs: 0, maxAttempts: 2, sourceIds, sweep: gi === 0 })))
    const outcomes = reports.flatMap((r) => r.sources)
    for (const s of outcomes) log(`${s.status.padEnd(7)} ${s.sourceName.padEnd(48)} ${s.result ? `fetched ${s.result.fetched} created ${s.result.created} updated ${s.result.updated} irrelevant ${s.result.irrelevant} dup ${s.result.duplicates}` : s.reason ?? ''} (${s.durationMs} ms)`)
    log(`pass finished: ${outcomes.filter((s) => s.status === 'success').length} succeeded, ${outcomes.filter((s) => s.status === 'failed').length} failed, sweep ${JSON.stringify(reports[0]?.sweep)}`)
  }

  const [{ n: published }] = (await pool.query("select count(*)::int as n from jobs where status = 'published'")).rows
  const regions = (await pool.query("select region, \"workMode\", count(*)::int as n from jobs where status = 'published' group by region, \"workMode\" order by n desc")).rows
  const top = (await pool.query("select c.name, count(*)::int as n from jobs j join companies c on c.id = j.\"companyId\" where j.status = 'published' group by c.name order by n desc limit 15")).rows
  log(`published jobs: ${published}`)
  log(`by region / work mode: ${regions.map((r) => `${r.region}/${r.workMode}=${r.n}`).join(', ')}`)
  log(`top companies: ${top.map((r) => `${r.name} ${r.n}`).join(', ')}`)
} finally {
  await pool.end()
}
