// Local development database without Docker: an embedded PGlite instance
// exposed over the PostgreSQL wire protocol on 127.0.0.1:55432 (the same
// address as compose.dev.yaml), with the repository migrations applied on
// start. Data lives in scratch/pglite-dev by default and is disposable.
//
//   node scripts/dev-pglite-server.mjs            # start (Ctrl+C to stop)
//   PGLITE_DATA_DIR=... PGLITE_PORT=... node ...  # overrides
//
// Requires the dev-only dependency @electric-sql/pglite-socket
// (`npm install --no-save @electric-sql/pglite-socket`). Never used in production.
import { mkdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

const dataDir = process.env.PGLITE_DATA_DIR || 'scratch/pglite-dev'
const port = Number(process.env.PGLITE_PORT || 55432)
mkdirSync(dataDir, { recursive: true })
const client = await PGlite.create({ dataDir })
const db = drizzle(client)
const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
const tables = await client.query("select count(*)::int as n from information_schema.tables where table_schema = 'public'")
console.log(`PGlite dev database ready: ${tables.rows[0].n} tables, data in ${dataDir}`)
const server = new PGLiteSocketServer({ db: client, port, host: '127.0.0.1', maxConnections: 64 })
server.addEventListener('error', (e) => console.error('pglite-socket error', e.detail ?? e))
await server.start()
console.log(`Listening on 127.0.0.1:${port} (database name and credentials in DATABASE_URL are accepted as-is; nothing is checked)`)
const stop = async () => {
  await server.stop().catch(() => {})
  await client.close().catch(() => {})
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
