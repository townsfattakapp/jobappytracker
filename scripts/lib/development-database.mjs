import { config } from 'dotenv';

// Match next dev's file precedence without overriding the calling shell.
export function loadDevelopmentDatabaseEnv() {
  for (const path of ['.env.development.local', '.env.local', '.env.development', '.env']) {
    config({ path, quiet: true });
  }
}

export function confirmDevelopmentDatabase(env, args) {
  if (env.NODE_ENV === 'production') {
    throw new Error('Development migrations cannot run with NODE_ENV=production.');
  }
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  let url;
  try { url = new URL(env.DATABASE_URL); } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL URL.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || url.pathname.length < 2) {
    throw new Error('DATABASE_URL must specify a PostgreSQL host, user, and database.');
  }
  // Do not permit query parameters to override the host/database being confirmed.
  if ([...url.searchParams.keys()].some(key => key !== 'sslmode')) {
    throw new Error('Only sslmode is supported as a DATABASE_URL query parameter for development migrations.');
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'e60ic1228f.j9g1t394ei.tsdb.cloud.timescale.com') {
    throw new Error('Refusing migrations against the protected hosted tsdb server.');
  }
  const target = `${host}:${url.port || '5432'}${url.pathname}`;
  if (args.length !== 1 || args[0] !== `--confirm-development=${target}`) {
    throw new Error('Explicit development confirmation required: --confirm-development=HOST:PORT/DATABASE must match DATABASE_URL. No connection was opened.');
  }
  return target;
}
