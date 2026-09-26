import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { jobApplications, notificationLog, outreachContacts, users } from '../db/schema'
import { logError, logEvent } from './log'
import { isMailerConfigured, renderEmail, sendMail, siteUrl } from './mailer'

/**
 * Transactional notification foundation. Every event is rendered through
 * the existing branded template and recorded in notification_log. Delivery
 * happens only when the mailer is configured (Resend or SMTP); otherwise
 * the event is logged as skipped, so nothing is sent from development.
 */

export type NotificationKind = 'subscription.activated' | 'payment.failed' | 'subscription.cancelled' | 'renewal.reminder' | 'application.reminder' | 'outreach.follow_up'

export interface Notification {
  kind: NotificationKind
  subject: string
  title: string
  intro: string
  ctaLabel: string
  ctaUrl: string
  outro: string
}

export function buildNotification(kind: NotificationKind, data: Record<string, string | number | null | undefined>): Notification {
  const base = siteUrl()
  switch (kind) {
    case 'subscription.activated':
      return { kind, subject: `Your ${data.plan} plan is active`, title: `${data.plan} is active`, intro: `Thanks for subscribing. Your ${data.plan} plan is active${data.periodEnd ? ` and renews on ${data.periodEnd}` : ''}.`, ctaLabel: 'Open Prep', ctaUrl: `${base}/app`, outro: 'You can change or cancel renewal any time from Settings → Billing.' }
    case 'payment.failed':
      return { kind, subject: 'Payment for your plan did not go through', title: 'Payment failed', intro: `A payment for your ${data.plan} plan failed${data.reason ? ` (${data.reason})` : ''}. Your access continues for a short grace period while the provider retries.`, ctaLabel: 'Review billing', ctaUrl: `${base}/pricing`, outro: 'If the problem persists, update your payment method with the provider.' }
    case 'subscription.cancelled':
      return { kind, subject: 'Renewal cancelled', title: 'Your plan will not renew', intro: `Renewal of your ${data.plan} plan is cancelled. You keep access until ${data.periodEnd || 'the end of the current period'}.`, ctaLabel: 'See plans', ctaUrl: `${base}/pricing`, outro: 'You can start a new subscription whenever you like.' }
    case 'renewal.reminder':
      return { kind, subject: `Your ${data.plan} plan renews soon`, title: 'Renewal coming up', intro: `Your ${data.plan} plan renews on ${data.periodEnd}.`, ctaLabel: 'Manage billing', ctaUrl: `${base}/pricing`, outro: 'No action is needed if you want to continue.' }
    case 'application.reminder':
      return { kind, subject: `Follow up: ${data.company}`, title: `Follow up with ${data.company}`, intro: `Your tracker has a follow-up due for ${data.role} at ${data.company}.`, ctaLabel: 'Open tracker', ctaUrl: `${base}/app`, outro: 'Reminders come from the follow-up dates you set.' }
    case 'outreach.follow_up':
      return { kind, subject: `Outreach follow-up: ${data.contact}`, title: `Follow up with ${data.contact}`, intro: `You planned to follow up with ${data.contact}${data.company ? ` about ${data.company}` : ''} today.`, ctaLabel: 'Open the job workspace', ctaUrl: `${base}/app`, outro: 'You decide whether and how to send it; JobAppy never messages anyone for you.' }
  }
}

/** Renders, records and (when configured) sends one notification. Never throws. */
export async function notify(userId: string | null, email: string | null, kind: NotificationKind, data: Record<string, string | number | null | undefined>): Promise<'sent' | 'skipped' | 'failed'> {
  const n = buildNotification(kind, data)
  const configured = isMailerConfigured() && Boolean(email)
  let status: 'sent' | 'skipped' | 'failed' = 'skipped'
  let error: string | null = null
  if (configured) {
    try {
      const { html, text } = renderEmail({ title: n.title, intro: n.intro, ctaLabel: n.ctaLabel, ctaUrl: n.ctaUrl, outro: n.outro })
      await sendMail({ to: email!, subject: n.subject, html, text })
      status = 'sent'
    } catch (err) {
      status = 'failed'
      error = err instanceof Error ? err.message : String(err)
      logError('notification.failed', err, { kind, userId })
    }
  }
  try {
    await db.insert(notificationLog).values({ id: crypto.randomUUID(), userId, kind, channel: configured ? 'email' : 'skipped', subject: n.subject, status, error })
  } catch (err) {
    logError('notification.log_failed', err, { kind })
  }
  if (!configured) logEvent('info', 'notification.skipped', { kind, userId, reason: 'mailer not configured' })
  return status
}

/** Follow-ups due today (tracker follow-up dates and outreach follow-up dates); a cron or admin can send them. */
export async function dueReminders(day = new Date().toISOString().slice(0, 10)): Promise<{ applications: { userId: string; email: string; company: string; role: string }[]; outreach: { userId: string; email: string; contact: string; jobId: string }[] }> {
  const apps = await db
    .select({ userId: jobApplications.userId, email: users.email, company: jobApplications.company, role: jobApplications.role })
    .from(jobApplications)
    .innerJoin(users, eq(users.id, jobApplications.userId))
    .where(and(eq(jobApplications.followUpDate, day), sql`${jobApplications.status} not in ('Rejected','Withdrawn','Offer')`))
  const outreach = await db
    .select({ userId: outreachContacts.userId, email: users.email, contact: outreachContacts.name, jobId: outreachContacts.jobId })
    .from(outreachContacts)
    .innerJoin(users, eq(users.id, outreachContacts.userId))
    .where(and(eq(outreachContacts.followUpDate, day), sql`${outreachContacts.status} not in ('closed','referral_received')`))
  return { applications: apps, outreach }
}

export async function runReminderPass(day?: string): Promise<{ applications: number; outreach: number; sent: number; skipped: number }> {
  const due = await dueReminders(day)
  let sent = 0
  let skipped = 0
  for (const a of due.applications) {
    const r = await notify(a.userId, a.email, 'application.reminder', { company: a.company, role: a.role })
    if (r === 'sent') sent += 1
    else skipped += 1
  }
  for (const o of due.outreach) {
    const r = await notify(o.userId, o.email, 'outreach.follow_up', { contact: o.contact, company: null })
    if (r === 'sent') sent += 1
    else skipped += 1
  }
  return { applications: due.applications.length, outreach: due.outreach.length, sent, skipped }
}
