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

export type NotificationKind =
  | 'subscription.activated'
  | 'payment.receipt'
  | 'payment.failed'
  | 'subscription.cancelled'
  | 'renewal.reminder'
  | 'application.reminder'
  | 'outreach.follow_up'
  // Verified referral network. Subjects and bodies never name a referrer or a learner; identity stays inside the app.
  | 'referral.request_received'
  | 'referral.needs_action'
  | 'referral.assigned'
  | 'referral.clarification'
  | 'referral.learner_replied'
  | 'referral.accepted'
  | 'referral.declined'
  | 'referral.submitted'
  | 'referral.closed'
  | 'referrer.invite'
  | 'referrer.verify_email'
  | 'referrer.verified'
  | 'referrer.status'

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
    case 'payment.receipt':
      return { kind, subject: `Receipt ${data.number}: your Prep pass (${data.plan})`, title: 'Thanks, your pass is active', intro: `Payment of ${data.amount} for the ${data.plan} pass (${data.days} days) is confirmed${data.periodEnd ? `; access runs until ${data.periodEnd}` : ''}. Your receipt is below and stays available under Settings → Billing.`, ctaLabel: 'Open Prep', ctaUrl: `${base}/app`, outro: `One-time payment, nothing renews by itself. Keep the Razorpay payment id for any support or refund request; write to hello@evolw.in.` }
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
    case 'referral.request_received':
      return { kind, subject: `Referral request received: ${data.role} at ${data.company}`, title: 'Referral request received', intro: `Your request for ${data.role} at ${data.company} is being screened and matched with a verified employee. A request does not guarantee a referral, interview or job.`, ctaLabel: 'Open Referral Center', ctaUrl: `${base}/app?view=referrals`, outro: 'You will hear from us at each step.' }
    case 'referral.needs_action':
      return { kind, subject: `Update on your referral request: ${data.role} at ${data.company}`, title: 'Your referral request has an update', intro: `There is a new message or update on your request for ${data.role} at ${data.company}.`, ctaLabel: 'Open Referral Center', ctaUrl: `${base}/app?view=referrals`, outro: 'Everything runs through JobAppy; no personal contact details are shared.' }
    case 'referral.assigned':
      return { kind, subject: `A referral request is waiting for your review: ${data.role}`, title: 'New referral request to review', intro: `A candidate asked for a referral for ${data.role} at ${data.company}. You have about ${data.hours} hours to accept, decline or ask a question; declining is always fine.`, ctaLabel: 'Review in the referrer portal', ctaUrl: `${base}/referrer`, outro: 'You decide. JobAppy never submits a referral on your behalf.' }
    case 'referral.clarification':
      return { kind, subject: `The referrer has a question: ${data.role} at ${data.company}`, title: 'A verified referrer asked a question', intro: `Before deciding, the referrer reviewing your request for ${data.role} at ${data.company} needs a little more information.`, ctaLabel: 'Reply in the Referral Center', ctaUrl: `${base}/app?view=referrals`, outro: 'Replies go through JobAppy.' }
    case 'referral.learner_replied':
      return { kind, subject: `The candidate replied: ${data.role}`, title: 'The candidate replied', intro: `The candidate answered your question on the request for ${data.role} at ${data.company}.`, ctaLabel: 'Continue the review', ctaUrl: `${base}/referrer`, outro: '' }
    case 'referral.accepted':
      return { kind, subject: `Accepted: your referral request for ${data.role} at ${data.company}`, title: 'A verified referrer accepted your request', intro: `The referrer will submit through their employer’s official process and mark it done here. A referral is not an interview; keep preparing.`, ctaLabel: 'Open Referral Center', ctaUrl: `${base}/app?view=referrals`, outro: 'One referral credit was used for JobAppy’s coordination of this request.' }
    case 'referral.declined':
      return { kind, subject: `Matching again: ${data.role} at ${data.company}`, title: 'Your request is being matched again', intro: `The referrer who reviewed your request for ${data.role} at ${data.company} could not take it on. It is being offered to another verified employee; if nobody is available the request closes and your credit is returned.`, ctaLabel: 'Open Referral Center', ctaUrl: `${base}/app?view=referrals`, outro: '' }
    case 'referral.submitted':
      return { kind, subject: `Referral submitted: ${data.role} at ${data.company}`, title: 'Referral submitted by a verified referrer', intro: `A verified referrer has submitted your referral for ${data.role} at ${data.company} through their employer’s process. This is not a guaranteed interview; the company decides what happens next.`, ctaLabel: 'Update your tracker', ctaUrl: `${base}/app?view=referrals`, outro: 'Prepare for the screening round in the meantime.' }
    case 'referral.closed':
      return { kind, subject: `Referral request closed: ${data.role} at ${data.company}`, title: 'Your referral request was closed', intro: `Your request for ${data.role} at ${data.company} was closed (${String(data.reason ?? '').replace(/_/g, ' ')}). Any reserved credit has been returned.`, ctaLabel: 'Open Referral Center', ctaUrl: `${base}/app?view=referrals`, outro: '' }
    case 'referrer.invite':
      return { kind, subject: `You are invited to JobAppy’s verified referrer network (${data.company})`, title: 'Join the verified referrer network', intro: `JobAppy invited you to review referral requests from prepared candidates for ${data.company}. You decide on every request; nothing is submitted on your behalf. The link works for ${data.days} days.`, ctaLabel: 'Accept the invitation', ctaUrl: `${base}/referrer/invite?token=${encodeURIComponent(String(data.token ?? ''))}`, outro: 'Referral requests are reviewed by verified referrers; a request never guarantees a referral, interview or job.' }
    case 'referrer.verify_email':
      return { kind, subject: 'Confirm your corporate email for JobAppy', title: 'Confirm your corporate email', intro: 'Open the link below from this mailbox to confirm it belongs to you. The link works once and expires in an hour.', ctaLabel: 'Confirm email', ctaUrl: `${base}/referrer/verify?token=${encodeURIComponent(String(data.token ?? ''))}`, outro: 'This address is used only for verification and is never shown to candidates.' }
    case 'referrer.verified':
      return { kind, subject: 'You are a verified referrer on JobAppy', title: 'Verification complete', intro: 'An admin verified your referrer profile. Set yourself to Available in the portal to start receiving requests that match your role family and locations.', ctaLabel: 'Open the referrer portal', ctaUrl: `${base}/referrer`, outro: '' }
    case 'referrer.status':
      return { kind, subject: 'Your referrer status changed', title: 'Referrer status update', intro: `Your referrer verification status is now ${String(data.status ?? '').toLowerCase().replace(/_/g, ' ')}. Open the portal for details or contact hello@evolw.in.`, ctaLabel: 'Open the referrer portal', ctaUrl: `${base}/referrer`, outro: '' }
  }
}

/** Renders, records and (when configured) sends one notification. Never throws. */
export async function notify(userId: string | null, email: string | null, kind: NotificationKind, data: Record<string, string | number | null | undefined>, rows?: [string, string][]): Promise<'sent' | 'skipped' | 'failed'> {
  const n = buildNotification(kind, data)
  const configured = isMailerConfigured() && Boolean(email)
  let status: 'sent' | 'skipped' | 'failed' = 'skipped'
  let error: string | null = null
  if (configured) {
    try {
      const { html, text } = renderEmail({ title: n.title, intro: n.intro, ctaLabel: n.ctaLabel, ctaUrl: n.ctaUrl, outro: n.outro, rows })
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
