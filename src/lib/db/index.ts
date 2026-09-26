import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema';

const { Pool } = pkg;

// This will throw if DATABASE_URL is not set at runtime, which is expected.
// Serverless: every warm function instance keeps its own small pool, so the
// hosted database's connection limit is shared across instances. Connection
// attempts time out instead of hanging a request when the database is saturated.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Math.max(1, Number(process.env.DATABASE_POOL_MAX) || 5),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
});

export const db = drizzle(pool, { schema });
