import { sql } from 'drizzle-orm'
import { db } from '../db'
import { activeProvider, PROVIDERS } from '../billing/providers'
import { objectStoreConfigured } from '../resume/storage'
import { providerHealth } from './ingestion'
import { isMailerConfigured } from './mailer'
import { webhookHealth } from './subscriptions'
import { aiProviderHealth, getAiPolicy } from './ai'
import { fixturesAllowed, isStaging } from './stage'

/**
 * Launch-readiness checks. Every status comes from a real probe or a real
 * configuration read; nothing is assumed healthy.
 */
export type HealthStatus = 'healthy' | 'degraded' | 'not_configured' | 'unknown'

export interface HealthCheck {
  id: string
  label: string
  status: HealthStatus
  detail: string
}

const EXPECTED_MIGRATIONS = 13

export async function launchHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  // Deployment stage: staging fixtures must never be on in production.
  const stage = (process.env.APP_STAGE || '').trim() || 'production (unset)'
  checks.push({ id: 'stage', label: 'Deployment stage', status: isStaging() ? 'degraded' : process.env.NODE_ENV === 'production' ? 'healthy' : 'unknown', detail: isStaging() ? 'APP_STAGE=staging: development fixtures (ingestion, billing, AI) are enabled; never set this on production' : `APP_STAGE ${stage}; NODE_ENV ${process.env.NODE_ENV}; fixtures ${fixturesAllowed() ? 'allowed (non-production build)' : 'disabled'}` })

  // Database.
  try {
    const [{ count }] = await db.execute<{ count: number }>(sql`select count(*)::int as count from drizzle.__drizzle_migrations`).then((r) => (Array.isArray(r) ? r : r.rows) as { count: number }[])
    checks.push({ id: 'database', label: 'Database', status: count >= EXPECTED_MIGRATIONS ? 'healthy' : 'degraded', detail: `${count} of ${EXPECTED_MIGRATIONS} migrations recorded${count < EXPECTED_MIGRATIONS ? '; run the pending migrations' : ''}` })
  } catch (error) {
    checks.push({ id: 'database', label: 'Database', status: 'degraded', detail: `Query failed: ${error instanceof Error ? error.message : 'unknown error'}` })
  }

  // Ingestion and providers.
  try {
    const sources = await providerHealth()
    const allowed = sources.filter((s) => s.ingestionAllowed && s.status === 'active')
    const failing = allowed.filter((s) => s.lastRunStatus === 'failed')
    const stale = allowed.filter((s) => !s.lastSuccessAt || Date.now() - new Date(s.lastSuccessAt).getTime() > 2 * 86_400_000)
    if (!allowed.length) checks.push({ id: 'ingestion', label: 'Job ingestion', status: 'not_configured', detail: 'No provider source is allowed and active' })
    else checks.push({ id: 'ingestion', label: 'Job ingestion', status: failing.length ? 'degraded' : stale.length ? 'degraded' : 'healthy', detail: `${allowed.length} source(s) enabled; ${failing.length} failing last run; ${stale.length} without a successful sync in 48 h` })
    checks.push({ id: 'cron', label: 'Scheduled runs', status: (process.env.CRON_SECRET || '').trim() ? 'healthy' : 'not_configured', detail: (process.env.CRON_SECRET || '').trim() ? 'CRON_SECRET set; cron endpoints accept authorised calls (a platform cron still has to be pointed at them)' : 'CRON_SECRET not set; cron endpoints answer 404 and ingestion runs only from the admin panel' })
    checks.push({ id: 'providers', label: 'Provider health', status: sources.length === 0 ? 'not_configured' : sources.some((s) => s.lastRunStatus === 'failed') ? 'degraded' : sources.some((s) => s.lastRunStatus === 'success') ? 'healthy' : 'unknown', detail: sources.length ? sources.map((s) => `${s.name}: ${s.lastRunStatus ?? 'never run'}`).join(' · ') : 'No provider sources' })
  } catch (error) {
    checks.push({ id: 'ingestion', label: 'Job ingestion', status: 'unknown', detail: error instanceof Error ? error.message : 'check failed' })
  }

  // Billing.
  const provider = activeProvider()
  const razorpay = PROVIDERS.find((p) => p.id === 'razorpay')
  const webhookSecret = Boolean((process.env.RAZORPAY_WEBHOOK_SECRET || '').trim())
  try {
    const wh = await webhookHealth(db)
    const failed = (wh.counts.failed ?? 0) + (wh.counts.rejected ?? 0)
    if (!provider) checks.push({ id: 'billing', label: 'Billing provider', status: 'not_configured', detail: 'No payment provider configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)' })
    else if (provider.id === 'fixture') checks.push({ id: 'billing', label: 'Billing provider', status: 'degraded', detail: 'Test-mode fixture provider; real payments are not possible' })
    else checks.push({ id: 'billing', label: 'Billing provider', status: razorpay?.isConfigured() && webhookSecret ? 'healthy' : 'degraded', detail: webhookSecret ? 'Razorpay keys and webhook secret set' : 'Razorpay keys set but RAZORPAY_WEBHOOK_SECRET missing: webhooks will be rejected' })
    checks.push({ id: 'webhooks', label: 'Billing webhooks (7 days)', status: failed ? 'degraded' : wh.lastReceivedAt ? 'healthy' : 'unknown', detail: wh.lastReceivedAt ? `${Object.entries(wh.counts).map(([k, v]) => `${k} ${v}`).join(', ') || 'no events'}; last received ${new Date(wh.lastReceivedAt).toISOString()}` : 'No webhook has ever been received' })
  } catch (error) {
    checks.push({ id: 'webhooks', label: 'Billing webhooks', status: 'unknown', detail: error instanceof Error ? error.message : 'check failed' })
  }

  // AI gateway.
  try {
    const [policy, providers] = await Promise.all([getAiPolicy(), aiProviderHealth()])
    const configured = providers.filter((p) => p.configured && p.id !== 'fixture')
    const fixtureOnly = providers.some((p) => p.configured && p.id === 'fixture') && !configured.length
    const degraded = configured.filter((p) => p.status === 'degraded')
    checks.push({ id: 'ai', label: 'AI gateway', status: !policy.enabled ? 'not_configured' : !configured.length ? (fixtureOnly ? 'degraded' : 'not_configured') : degraded.length ? 'degraded' : configured.some((p) => p.status === 'healthy') ? 'healthy' : 'unknown', detail: !policy.enabled ? 'Gateway switched off; deterministic engines only' : !configured.length ? (fixtureOnly ? 'Only the development fixture provider is configured' : 'No provider key set; every AI feature falls back to its deterministic engine') : `${configured.map((p) => `${p.label}: ${p.status}`).join(' · ')}` })
  } catch (error) {
    checks.push({ id: 'ai', label: 'AI gateway', status: 'unknown', detail: error instanceof Error ? error.message : 'check failed' })
  }

  // Email.
  checks.push({ id: 'email', label: 'Email delivery', status: isMailerConfigured() ? 'healthy' : 'not_configured', detail: isMailerConfigured() ? 'Mailer configured (Resend or SMTP with EMAIL_FROM)' : 'No mailer; sign-ups auto-verify and notifications are logged as skipped' })

  // Resume processing.
  try {
    const rows = await db.execute<{ total: number; warned: number }>(sql`select count(*)::int as total, count(*) filter (where jsonb_array_length(warnings) > 0)::int as warned from resume_profiles`).then((r) => (Array.isArray(r) ? r : r.rows) as { total: number; warned: number }[])
    const { total, warned } = rows[0] ?? { total: 0, warned: 0 }
    const store = (process.env.RESUME_STORE || 'database').trim()
    checks.push({ id: 'resumes', label: 'Resume processing', status: store === 'object' && !objectStoreConfigured() ? 'degraded' : total === 0 ? 'unknown' : warned / Math.max(total, 1) > 0.5 ? 'degraded' : 'healthy', detail: `${total} resume(s) processed, ${warned} with extraction warnings; storage: ${store}${store === 'object' && !objectStoreConfigured() ? ' (not configured)' : ''}` })
  } catch (error) {
    checks.push({ id: 'resumes', label: 'Resume processing', status: 'unknown', detail: error instanceof Error ? error.message : 'check failed' })
  }

  // Failed background operations (last 24 h).
  try {
    const rows = await db.execute<{ runs: number; notifications: number }>(sql`select (select count(*)::int from job_ingestion_runs where status = 'failed' and "startedAt" > now() - interval '24 hours') as runs, (select count(*)::int from notification_log where status = 'failed' and "createdAt" > now() - interval '24 hours') as notifications`).then((r) => (Array.isArray(r) ? r : r.rows) as { runs: number; notifications: number }[])
    const { runs, notifications } = rows[0] ?? { runs: 0, notifications: 0 }
    checks.push({ id: 'background', label: 'Failed background operations (24 h)', status: runs + notifications > 0 ? 'degraded' : 'healthy', detail: `${runs} failed ingestion run(s), ${notifications} failed notification(s)` })
  } catch (error) {
    checks.push({ id: 'background', label: 'Failed background operations', status: 'unknown', detail: error instanceof Error ? error.message : 'check failed' })
  }

  return checks
}
