import { db } from '../db'
import { recordAudit } from './audit'
import { notify } from './notifications'
import type { ReferralDeps } from './referrals'

/** The production wiring of the referral service: the shared database, the real notifier and the audit log. */
export function referralDeps(): ReferralDeps {
  return {
    db,
    notify: (userId, email, kind, data) => notify(userId, email, kind, data),
    audit: (input) => recordAudit(input),
  }
}
