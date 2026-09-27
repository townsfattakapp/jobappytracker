// Learner AI key pool (migration 0013): several keys per learner for one provider, provider switch replaces the
// pool, duplicate keys are refreshed rather than duplicated, rate limits put a key on cooldown, auth failures mark
// it invalid, and getUserAiKeys returns keys in rotation order. Runs on an in-memory PGlite database with the
// repository migrations; the encryption secret is a test value.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

process.env.AI_KEY_ENCRYPTION_SECRET = 'test-secret-for-ai-keys-suite-0123456789'

await build({
  entryPoints: { aiKeys: 'src/lib/server/aiKeys.ts', schema: 'src/lib/db/schema.ts' },
  outdir: 'scratch/ai-keys-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next/*', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [{ name: 'swap-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export let db = globalThis.__aiKeysDb' })) } }],
  logLevel: 'silent',
})
const schema = await import('../scratch/ai-keys-tests/schema.mjs')

// One database for the whole file: the bundled module captures `db` when it is first imported.
const client = new PGlite()
const db = drizzle(client, { schema })
const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
globalThis.__aiKeysDb = db
await client.query("insert into users (id, email, name) values ('u1', 'u1@example.invalid', 'U1'), ('u2', 'u2@example.invalid', 'U2'), ('u3', 'u3@example.invalid', 'U3')")
const keys = await import('../scratch/ai-keys-tests/aiKeys.mjs')
test.after(() => client.close())

test('keys of one provider pool up, a provider switch replaces them, duplicates refresh, and the pool lists in order', async () => {
  {
    const a = await keys.addUserAiKey('u1', 'groq', 'gsk_first_key_000000000000000000', 'main account')
    assert.equal(a.keys.length, 1)
    assert.equal(a.added.hint, '…0000')
    assert.equal(a.added.label, 'main account')
    assert.equal(a.replacedProvider, null)
    const b = await keys.addUserAiKey('u1', 'groq', 'gsk_second_key_00000000000000000002')
    assert.equal(b.keys.length, 2)
    assert.deepEqual(b.keys.map((k) => k.position), [0, 1])
    // Same key again refreshes, never duplicates.
    const again = await keys.addUserAiKey('u1', 'groq', 'gsk_first_key_000000000000000000', 'renamed')
    assert.equal(again.keys.length, 2)
    assert.equal(again.added.id, a.added.id)
    assert.equal(again.added.label, 'renamed')
    // Rotation order and decrypted material.
    const pool = await keys.getUserAiKeys('u1')
    assert.equal(pool.provider, 'groq')
    assert.deepEqual(pool.keys.map((k) => k.key), ['gsk_first_key_000000000000000000', 'gsk_second_key_00000000000000000002'])
    assert.deepEqual(await keys.getUserAiKey('u1'), { provider: 'groq', id: a.added.id, key: 'gsk_first_key_000000000000000000', hint: '…0000' })
    assert.deepEqual(await keys.getUserAiKeySummary('u1'), { provider: 'groq', hint: '…0000' })
    // Another learner is isolated.
    assert.equal(await keys.getUserAiKeys('u2'), null)
    // Switching provider replaces the whole pool.
    const sw = await keys.addUserAiKey('u1', 'gemini', 'AIzaSyExampleExampleExampleExample01')
    assert.equal(sw.replacedProvider, 'groq')
    assert.equal(sw.keys.length, 1)
    assert.equal(sw.keys[0].provider, 'gemini')
    // Cap.
    for (let i = 2; i <= 5; i++) await keys.addUserAiKey('u1', 'gemini', `AIzaSyExampleExampleExampleExample0${i}`)
    await assert.rejects(() => keys.addUserAiKey('u1', 'gemini', 'AIzaSyExampleExampleExampleExample06'), /up to 5 keys/)
    // Delete one, then all.
    const list = await keys.listUserAiKeys('u1')
    await keys.deleteUserAiKey('u1', list[0].id)
    assert.equal((await keys.listUserAiKeys('u1')).length, 4)
    await keys.deleteUserAiKey('u1')
    assert.equal((await keys.listUserAiKeys('u1')).length, 0)
    // Stored material is encrypted at rest.
    await keys.addUserAiKey('u2', 'groq', 'gsk_plain_text_never_stored_000000')
    const raw = (await client.query('select "encryptedKey" from user_ai_keys')).rows[0].encryptedKey
    assert.ok(!raw.includes('gsk_plain_text'), 'ciphertext only')
  }
})

test('a rate-limited key cools down and moves to the back of the rotation; a rejected key drops out; success clears both', async () => {
  {
    const k1 = (await keys.addUserAiKey('u3', 'groq', 'gsk_key_one_000000000000000000001')).added
    const k2 = (await keys.addUserAiKey('u3', 'groq', 'gsk_key_two_000000000000000000002')).added
    const k3 = (await keys.addUserAiKey('u3', 'groq', 'gsk_key_three_0000000000000000003')).added
    const now = new Date('2026-09-27T10:00:00Z')
    await keys.recordKeyOutcome(k1.id, 'rate_limit', { message: 'provider is rate limiting', retryAfterMs: 90_000 }, now)
    let pool = await keys.getUserAiKeys('u3', now)
    assert.deepEqual(pool.keys.map((k) => k.id), [k2.id, k3.id, k1.id], 'cooling key goes last but is still available')
    let list = await keys.listUserAiKeys('u3', now)
    const cooling = list.find((k) => k.id === k1.id)
    assert.equal(cooling.status, 'cooling')
    assert.equal(cooling.cooldownUntil, '2026-09-27T10:01:30.000Z')
    // After the cooldown the key is active again in its original position.
    pool = await keys.getUserAiKeys('u3', new Date('2026-09-27T10:05:00Z'))
    assert.deepEqual(pool.keys.map((k) => k.id), [k1.id, k2.id, k3.id])
    // No Retry-After: an hour by default.
    await keys.recordKeyOutcome(k2.id, 'rate_limit', {}, now)
    list = await keys.listUserAiKeys('u3', now)
    assert.equal(list.find((k) => k.id === k2.id).cooldownUntil, '2026-09-27T11:00:00.000Z')
    // A rejected key drops out of the rotation entirely and says why.
    await keys.recordKeyOutcome(k3.id, 'auth', { message: 'provider rejected the API key (401)' }, now)
    pool = await keys.getUserAiKeys('u3', now)
    assert.deepEqual(pool.keys.map((k) => k.id), [k1.id, k2.id])
    list = await keys.listUserAiKeys('u3', now)
    assert.equal(list.find((k) => k.id === k3.id).status, 'invalid')
    assert.match(list.find((k) => k.id === k3.id).lastError, /401/)
    // Success clears the state.
    await keys.recordKeyOutcome(k1.id, 'ok', {}, now)
    list = await keys.listUserAiKeys('u3', now)
    assert.equal(list.find((k) => k.id === k1.id).status, 'active')
    assert.equal(list.find((k) => k.id === k1.id).lastUsedAt, now.toISOString())
    // When every key is invalid there is no pool.
    await keys.recordKeyOutcome(k1.id, 'auth', {}, now)
    await keys.recordKeyOutcome(k2.id, 'auth', {}, now)
    assert.equal(await keys.getUserAiKeys('u3', now), null)
  }
})
