import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import { productionDatabaseConfig, migrationFailureMessage } from './lib/production-database.mjs';

test('provider CA survives URL sslmode parsing and credentials are retained', () => {
  const config = productionDatabaseConfig({
    DATABASE_URL: 'postgresql://user:secret@localhost:5432/app?sslmode=verify-full',
    DATABASE_SSL_CA: 'BEGIN\\ncertificate\\nEND',
  });
  const client = new pg.Client(config);
  assert.equal(client.connectionParameters.password, 'secret');
  assert.equal(client.ssl.ca, 'BEGIN\ncertificate\nEND');
  assert.equal(client.ssl.rejectUnauthorized, true);
});

test('direct migration URL takes precedence and missing configuration fails', () => {
  const env = {
    POSTGRES_URL_NON_POOLING: 'postgresql://user:secret@direct:5432/app',
    DATABASE_URL_NON_POOLING: 'postgresql://user:secret@other:5432/app',
    DATABASE_URL: 'postgresql://user:secret@pooled:5432/app',
  };
  assert.equal(productionDatabaseConfig(env).host, 'direct');
  delete env.POSTGRES_URL_NON_POOLING;
  assert.equal(productionDatabaseConfig(env).host, 'other');
  delete env.DATABASE_URL_NON_POOLING;
  assert.equal(productionDatabaseConfig(env).host, 'pooled');
  assert.throws(() => productionDatabaseConfig({}), /connection string is required/);
});

test('nested database errors report safe codes and actionable guidance', () => {
  const cause = Object.assign(new Error('secret password and database hostname'), { code: 'SELF_SIGNED_CERT_IN_CHAIN' });
  const error = new Error('SQL containing private data', { cause });
  assert.match(migrationFailureMessage(error), /SELF_SIGNED_CERT_IN_CHAIN.*DATABASE_SSL_CA/);
  assert.doesNotMatch(migrationFailureMessage(error), /secret|hostname|private data/);
  cause.cause = error;
  assert.match(migrationFailureMessage(error), /SELF_SIGNED_CERT_IN_CHAIN/);
  assert.doesNotMatch(migrationFailureMessage(new Error('secret')), /secret/);
});
