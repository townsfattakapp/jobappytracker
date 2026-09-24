import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import path from 'path';
import { productionDatabaseConfig, migrationFailureMessage } from './lib/production-database.mjs';

async function main() {
  const pool = new pg.Pool(productionDatabaseConfig(process.env));
  try {
    console.log('Starting production migration on Vercel...');
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') });
    console.log('Production migration complete.');
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(migrationFailureMessage(err));
  process.exitCode = 1;
});
