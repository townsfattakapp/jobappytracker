import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import path from 'path';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for production migrations.');
  
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, ssl: true });
  try {
    console.log('Starting production migration on Vercel...');
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') });
    console.log('Production migration complete.');
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err.code ? `Database error ${err.code}` : err.message);
  process.exitCode = 1;
});
