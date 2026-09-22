import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { config } from 'dotenv';
import path from 'path';

config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function main() {
  console.log("Starting migration...");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') });
  console.log("Migration complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed!", err);
  process.exit(1);
});
