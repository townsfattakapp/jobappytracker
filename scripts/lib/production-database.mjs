import pg from 'pg';

export function productionDatabaseConfig(env) {
  const connectionString = env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL_NON_POOLING || env.DATABASE_URL;
  if (!connectionString) throw new Error('A database connection string is required for production migrations.');

  // Resolve URL SSL options first: pg otherwise replaces an explicit CA with
  // the sslmode options from the connection string.
  const config = new pg.Client({ connectionString, ssl: true }).connectionParameters;
  if (env.DATABASE_SSL_CA) {
    config.ssl = {
      ...(typeof config.ssl === 'object' ? config.ssl : {}),
      ca: env.DATABASE_SSL_CA.replace(/\\n/g, '\n'),
      rejectUnauthorized: true,
    };
  }
  // pg keeps password non-enumerable on ConnectionParameters.
  return { ...config, password: config.password, connectionTimeoutMillis: 10000 };
}

export function migrationFailureMessage(error) {
  const seen = new Set();
  let code;
  while (error && !seen.has(error)) {
    seen.add(error);
    if (typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code)) code = error.code;
    error = error.cause;
  }
  const hints = {
    SELF_SIGNED_CERT_IN_CHAIN: 'Set DATABASE_SSL_CA to the database provider CA certificate (PEM) in Vercel.',
    DEPTH_ZERO_SELF_SIGNED_CERT: 'Set DATABASE_SSL_CA to the database provider CA certificate (PEM) in Vercel.',
    UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Set DATABASE_SSL_CA to the database provider CA certificate (PEM) in Vercel.',
    '42501': 'The migration role needs permission to create the drizzle schema and apply migrations.',
    '28P01': 'Check the credentials in the selected Vercel database environment variable.',
    ENOTFOUND: 'Check the database hostname in the selected Vercel database environment variable.',
    ECONNREFUSED: 'Check the database endpoint, port, and network access from Vercel.',
    ETIMEDOUT: 'Check database network access from Vercel and the direct connection endpoint.',
  };
  return `Migration failed${code ? ` (${code})` : ''}. ${hints[code] || 'Check the migration database configuration, connectivity, and database server logs.'}`;
}
