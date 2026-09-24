import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import path from 'path';
import { confirmDevelopmentDatabase, loadDevelopmentDatabaseEnv } from './lib/development-database.mjs';

async function main() {
  loadDevelopmentDatabaseEnv();
  const target = confirmDevelopmentDatabase(process.env, process.argv.slice(2));
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  try {
    console.log(`Starting confirmed development migration: ${target}`);
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') });
    console.log('Development migration complete. No curriculum data was seeded.');
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  // Connection errors may contain connection details; never dump the URL or config.
  console.error('Migration failed:', err.code ? `Database error ${err.code}` : err.message);
  process.exitCode = 1;
});
