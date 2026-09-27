/**
 * Referral credit ledger semantics. A credit pays for JobAppy's verification,
 * matching and coordination of one request; it never buys a referral. The
 * balance is derived from append-only rows:
 *   available = GRANT + REFUND + RELEASE − RESERVE − EXPIRE
 *   held      = RESERVE − CONSUME − RELEASE   (per reservation)
 * CONSUME turns a held reservation into a spent credit and changes nothing
 * about the available balance (it was already taken out by RESERVE).
 */

export const LEDGER_TYPES = ['GRANT', 'RESERVE', 'CONSUME', 'RELEASE', 'REFUND', 'EXPIRE'] as const
export type LedgerType = (typeof LEDGER_TYPES)[number]

export interface LedgerRow {
  type: LedgerType
  amount: number
  reservationId?: string | null
  expiresAt?: Date | string | null
  createdAt?: Date | string
}

export interface CreditBalance {
  available: number
  held: number
  granted: number
  consumed: number
  released: number
  expired: number
}

export function creditBalance(rows: LedgerRow[]): CreditBalance {
  let available = 0
  let granted = 0
  let consumed = 0
  let released = 0
  let expired = 0
  const reservations = new Map<string, number>()
  for (const r of rows) {
    const amount = Math.max(0, Math.floor(r.amount))
    switch (r.type) {
      case 'GRANT':
      case 'REFUND':
        available += amount
        granted += amount
        break
      case 'RESERVE':
        available -= amount
        if (r.reservationId) reservations.set(r.reservationId, (reservations.get(r.reservationId) ?? 0) + amount)
        break
      case 'RELEASE':
        available += amount
        released += amount
        if (r.reservationId) reservations.set(r.reservationId, (reservations.get(r.reservationId) ?? 0) - amount)
        break
      case 'CONSUME':
        consumed += amount
        if (r.reservationId) reservations.set(r.reservationId, (reservations.get(r.reservationId) ?? 0) - amount)
        break
      case 'EXPIRE':
        available -= amount
        expired += amount
        break
    }
  }
  let held = 0
  for (const v of reservations.values()) held += Math.max(0, v)
  return { available: Math.max(0, available), held, granted, consumed, released, expired }
}

/** Outstanding amount of one reservation (0 when it was consumed or released). */
export function reservationOutstanding(rows: LedgerRow[], reservationId: string): number {
  let v = 0
  for (const r of rows) {
    if (r.reservationId !== reservationId) continue
    if (r.type === 'RESERVE') v += r.amount
    if (r.type === 'CONSUME' || r.type === 'RELEASE') v -= r.amount
  }
  return Math.max(0, v)
}

/** "2026-09": the key under which a plan's monthly allowance is granted once. */
export function periodKey(now: Date): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export function endOfPeriod(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
}
