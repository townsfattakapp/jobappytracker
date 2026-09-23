/** Access facts for an account, computed from paid passes (no trial). */
export interface Entitlement {
  status: 'active' | 'expired'
  /** True when the account may use the paid features right now. */
  access: boolean
  /** When paid access ends (ISO), or null when the account never paid. */
  endsAt: string | null
  daysLeft: number
  /** Plan of the most recent pass. */
  planId: string | null
  /** Set when access comes from the operator allowlist rather than a payment. */
  complimentary?: boolean
}

const DAY = 86_400_000

export function computeEntitlement(paidUntil: Date | null, planId: string | null, now: Date = new Date(), complimentary = false): Entitlement {
  if (complimentary) return { status: 'active', access: true, endsAt: null, daysLeft: 3650, planId, complimentary: true }
  if (paidUntil && paidUntil.getTime() > now.getTime()) {
    return { status: 'active', access: true, endsAt: paidUntil.toISOString(), daysLeft: Math.max(1, Math.ceil((paidUntil.getTime() - now.getTime()) / DAY)), planId }
  }
  return { status: 'expired', access: false, endsAt: paidUntil ? paidUntil.toISOString() : null, daysLeft: 0, planId }
}

/** New paid period: extends current access if still active, otherwise starts now. */
export function extendedUntil(currentPaidUntil: Date | null, days: number, now: Date = new Date()): Date {
  const base = currentPaidUntil && currentPaidUntil.getTime() > now.getTime() ? currentPaidUntil : now
  return new Date(base.getTime() + days * DAY)
}
