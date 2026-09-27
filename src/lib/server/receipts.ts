import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { subscriptions, users } from '../db/schema'
import { planById } from '../billing/plan'
import { notify } from './notifications'
import { logError } from './log'

/**
 * Receipts for one-time passes. A receipt is derived from the paid order row
 * (nothing is stored twice): number, plan, period, amount and the Razorpay
 * payment id. It is emailed when the order is granted and can be opened again
 * from Settings → Billing.
 */
export interface Receipt {
  id: string
  number: string
  issuedAt: string
  paidAt: string | null
  plan: string
  planId: string
  days: number
  /** Amount paid, in major units of `currency`. */
  amount: number
  currency: string
  paymentId: string | null
  periodStart: string | null
  periodEnd: string | null
  buyerEmail: string
  buyerName: string | null
  seller: { name: string; email: string; website: string; address: string | null; gstin: string | null }
}

export function receiptNumber(orderId: string, createdAt: Date): string {
  const d = createdAt.toISOString().slice(0, 10).replace(/-/g, '')
  return `PREP-${d}-${orderId.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}`
}

export function seller(): Receipt['seller'] {
  return {
    name: (process.env.BUSINESS_NAME || 'Evolw').trim(),
    email: (process.env.BUSINESS_EMAIL || 'hello@evolw.in').trim(),
    website: 'https://www.evolw.in',
    address: (process.env.BUSINESS_ADDRESS || '').trim() || null,
    gstin: (process.env.BUSINESS_GSTIN || '').trim() || null,
  }
}

function toReceipt(row: typeof subscriptions.$inferSelect, user: { email: string | null; name: string | null }): Receipt | null {
  const plan = planById(row.planId)
  if (!plan || row.status !== 'paid') return null
  return {
    id: row.id,
    number: receiptNumber(row.id, row.createdAt),
    issuedAt: row.updatedAt.toISOString(),
    paidAt: row.updatedAt.toISOString(),
    plan: plan.name,
    planId: plan.id,
    days: plan.days,
    // The amount fixed at order time; only orders older than that column fall back to the plan's current price.
    amount: row.amountPaise != null ? Math.round(row.amountPaise) / 100 : plan.priceInr,
    currency: row.currency || 'INR',
    paymentId: row.lastPaymentId ?? null,
    periodStart: row.currentStart?.toISOString() ?? null,
    periodEnd: row.currentEnd?.toISOString() ?? null,
    buyerEmail: user.email ?? '',
    buyerName: user.name ?? null,
    seller: seller(),
  }
}

export async function listReceipts(userId: string): Promise<Receipt[]> {
  const rows = await db
    .select({ order: subscriptions, email: users.email, name: users.name })
    .from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'paid')))
    .orderBy(desc(subscriptions.updatedAt))
  return rows.map((r) => toReceipt(r.order, { email: r.email, name: r.name })).filter((r): r is Receipt => r !== null)
}

export async function getReceipt(userId: string, orderId: string): Promise<Receipt | null> {
  const [row] = await db
    .select({ order: subscriptions, email: users.email, name: users.name })
    .from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.id, orderId)))
  return row ? toReceipt(row.order, { email: row.email, name: row.name }) : null
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—')
const fmtMoney = (n: number, currency: string) => {
  const whole = Math.abs(n - Math.round(n)) < 0.005
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(n)
  } catch {
    return `${currency} ${n}`
  }
}

export function receiptRows(r: Receipt): [string, string][] {
  const rows: [string, string][] = [
    ['Receipt number', r.number],
    ['Date', fmtDate(r.paidAt)],
    ['Billed to', r.buyerName ? `${r.buyerName} · ${r.buyerEmail}` : r.buyerEmail],
    ['Item', `Prep pass · ${r.plan} (${r.days} days of access)`],
    ['Access period', `${fmtDate(r.periodStart)} to ${fmtDate(r.periodEnd)}`],
    ['Amount paid', `${fmtMoney(r.amount, r.currency)} (${r.currency}, inclusive of all charges)`],
    ['Payment', r.paymentId ? `Razorpay · ${r.paymentId}` : 'Razorpay'],
    ['Seller', `${r.seller.name} · ${r.seller.email}${r.seller.address ? ` · ${r.seller.address}` : ''}`],
  ]
  if (r.seller.gstin) rows.push(['GSTIN', r.seller.gstin])
  return rows
}

/** Emails the receipt for a granted order (idempotent per order id: the notification log records the kind and order). */
export async function sendPassReceipt(orderId: string, siteBase?: string): Promise<'sent' | 'skipped' | 'failed'> {
  try {
    const [row] = await db.select({ order: subscriptions, email: users.email, name: users.name }).from(subscriptions).innerJoin(users, eq(users.id, subscriptions.userId)).where(eq(subscriptions.id, orderId))
    if (!row) return 'skipped'
    const receipt = toReceipt(row.order, { email: row.email, name: row.name })
    if (!receipt || !receipt.buyerEmail) return 'skipped'
    return await notify(row.order.userId, receipt.buyerEmail, 'payment.receipt', { number: receipt.number, plan: receipt.plan, days: receipt.days, amount: fmtMoney(receipt.amount, receipt.currency), paymentId: receipt.paymentId, periodEnd: fmtDate(receipt.periodEnd), orderId, base: siteBase ?? null }, receiptRows(receipt))
  } catch (error) {
    logError('receipt.send_failed', error, { orderId })
    return 'failed'
  }
}

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c)

/** Printable receipt page (owner only; the route checks the session). */
export function receiptHtml(r: Receipt): string {
  const rows = receiptRows(r)
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Receipt ${esc(r.number)} · Prep by EVOLW</title>
<style>
  body{margin:0;background:#f5f4fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1b2a}
  .sheet{max-width:640px;margin:32px auto;background:#fff;border:1px solid #e6e4f2;border-radius:18px;padding:32px}
  .brand{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6b6980;font-weight:700}
  h1{font-size:22px;margin:6px 0 4px}
  .muted{color:#6b6980;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}
  td{padding:9px 0;border-bottom:1px solid #eeedf5;vertical-align:top}
  td:first-child{color:#6b6980;width:38%}
  .total{font-size:20px;font-weight:800;margin-top:18px}
  .actions{margin-top:22px;display:flex;gap:10px}
  .btn{display:inline-block;padding:10px 16px;border-radius:10px;border:1px solid #d9d7e6;text-decoration:none;color:#1c1b2a;font-weight:600;font-size:14px}
  @media print{body{background:#fff}.sheet{border:0;margin:0}.actions{display:none}}
</style></head>
<body><div class="sheet">
  <p class="brand">Prep by EVOLW</p>
  <h1>Payment receipt</h1>
  <p class="muted">${esc(r.number)} · issued ${esc(fmtDate(r.issuedAt))}${r.seller.gstin ? '' : ' · This is a payment receipt for a digital service; it is not a GST tax invoice.'}</p>
  <table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
  <p class="total">Total paid: ${esc(fmtMoney(r.amount, r.currency))}</p>
  <p class="muted">One-time payment; nothing renews automatically. Refunds follow the policy at https://prep.evolw.in/refund. Questions: ${esc(r.seller.email)}.</p>
  <div class="actions"><a class="btn" href="javascript:window.print()">Print or save as PDF</a><a class="btn" href="/app">Back to Prep</a></div>
</div></body></html>`
}
