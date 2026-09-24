import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import path from 'path';

async function main() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_NON_POOLING || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('A database connection string is required for production migrations.');
  
  const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 10000, ssl: true });
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
