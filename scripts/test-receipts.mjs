// Pass receipts: granting an order once produces exactly one receipt notification (recorded even without a mailer),
// the receipt is derived from the order row, only the buyer can list it, and the email/printable renderings carry the
// number, amount and Razorpay payment id. In-memory PGlite with the repository migrations; no network.
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { readMigrationFiles } from 'drizzle-orm/migrator'

await build({
  entryPoints: { entitlement: 'src/lib/server/entitlement.ts', receipts: 'src/lib/server/receipts.ts', mailer: 'src/lib/server/mailer.ts', notifications: 'src/lib/server/notifications.ts', schema: 'src/lib/db/schema.ts' },
  outdir: 'scratch/receipt-tests',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['react', 'drizzle-orm', 'drizzle-orm/*', '@electric-sql/pglite', 'pg', 'next-auth', 'next-auth/*', 'nodemailer'],
  plugins: [
    { name: 'swap-db', setup(b) { b.onResolve({ filter: /\/db$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'stub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export let db = globalThis.__receiptDb' })) } },
    { name: 'stub-next-server', setup(b) { b.onResolve({ filter: /^next\/server$/ }, () => ({ path: 'next-server', namespace: 'nextstub' })); b.onLoad({ filter: /.*/, namespace: 'nextstub' }, () => ({ contents: 'export class NextResponse { static json(body, init) { return { body, status: init?.status ?? 200 } } }' })) } },
    { name: 'stub-auth', setup(b) { b.onResolve({ filter: /\/auth$/ }, (a) => (a.importer.includes('server') ? { path: a.path, namespace: 'authstub' } : undefined)); b.onLoad({ filter: /.*/, namespace: 'authstub' }, () => ({ contents: 'export const auth = async () => null' })) } },
  ],
  logLevel: 'silent',
})
const schema = await import('../scratch/receipt-tests/schema.mjs')
const client = new PGlite()
const db = drizzle(client, { schema })
const migrations = readMigrationFiles({ migrationsFolder: 'src/lib/db/migrations' })
for (const m of migrations) m.sql = m.sql.flatMap((s) => s.split(/(?=DO \$\$ BEGIN)/))
await db.dialect.migrate(migrations, db.session, { migrationsFolder: 'src/lib/db/migrations' })
globalThis.__receiptDb = db
await client.query("insert into users (id, email, name) values ('u1', 'asha@example.invalid', 'Asha Verma'), ('u2', 'other@example.invalid', 'Other')")
await client.query("insert into subscriptions (id, \"userId\", \"planId\", status, \"createdAt\", \"updatedAt\") values ('order_abc123XYZ', 'u1', 'quarter', 'created', '2026-09-27T10:00:00Z', '2026-09-27T10:00:00Z')")
const { grantOrder } = await import('../scratch/receipt-tests/entitlement.mjs')
const receipts = await import('../scratch/receipt-tests/receipts.mjs')
const { renderEmail } = await import('../scratch/receipt-tests/mailer.mjs')
test.after(() => client.close())

test('granting an order emails one receipt, derived from the order, visible only to the buyer', async () => {
  assert.equal(await grantOrder('order_abc123XYZ', 'pay_R1234567890'), true)
  assert.equal(await grantOrder('order_abc123XYZ', 'pay_R1234567890'), true, 'second delivery is idempotent')
  const log = (await client.query("select kind, channel, status, subject from notification_log where \"userId\" = 'u1'")).rows
  assert.equal(log.length, 1, 'exactly one receipt notification for the two deliveries')
  assert.equal(log[0].kind, 'payment.receipt')
  assert.equal(log[0].channel, 'skipped', 'no mailer configured in tests: recorded, not sent')
  assert.match(log[0].subject, /^Receipt PREP-20260927-ORDERA: your Prep pass \(90 days\)$/)

  const mine = await receipts.listReceipts('u1')
  assert.equal(mine.length, 1)
  const r = mine[0]
  assert.equal(r.number, 'PREP-20260927-ORDERA')
  assert.equal(r.amountInr, 299)
  assert.equal(r.days, 90)
  assert.equal(r.paymentId, 'pay_R1234567890')
  assert.equal(r.buyerEmail, 'asha@example.invalid')
  assert.equal(r.seller.email, 'hello@evolw.in')
  assert.ok(r.periodEnd && new Date(r.periodEnd) > new Date(r.periodStart), 'access period is set')
  assert.equal((await receipts.listReceipts('u2')).length, 0, 'another learner sees nothing')
  assert.equal(await receipts.getReceipt('u2', 'order_abc123XYZ'), null, 'the order id alone does not open it')

  const html = receipts.receiptHtml(r)
  assert.ok(html.includes('PREP-20260927-ORDERA') && html.includes('₹299') && html.includes('pay_R1234567890') && html.includes('not a GST tax invoice'))
  const rows = receipts.receiptRows(r)
  const mail = renderEmail({ title: 't', intro: 'i', ctaLabel: 'c', ctaUrl: 'https://x', outro: 'o', rows })
  assert.ok(mail.html.includes('pay_R1234567890') && mail.text.includes('Amount paid: ₹299'))
})
