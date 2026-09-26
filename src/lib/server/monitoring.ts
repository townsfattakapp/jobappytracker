import { logError, logEvent, newErrorId } from './log'

/**
 * Application-side Monitoring & Observability Abstraction.
 *
 * Provides a unified dispatch surface for mission-critical subsystem events:
 * - API failures (unhandled 500s, route exceptions)
 * - Ingestion failures (feed timeouts, provider syntax errors, parse failures)
 * - Billing webhook failures (signature mismatch, duplicate drift, gateway rejections)
 * - AI provider failures (provider rate limits, authentication rejections, timeouts, fallback triggers)
 * - Resume processing failures (corrupt PDFs, schema mismatches, parsing exceptions)
 * - Auth & Security events (rate limit breaches, brute force lockouts, unauthorized access)
 *
 * Designed to cleanly attach to external observability collectors (Sentry, Datadog,
 * OpenTelemetry, CloudWatch, Axiom) without altering business logic across endpoints.
 * When no external telemetry provider is configured, it falls back to structured,
 * redacted JSON logging via logEvent / logError.
 */

export type MonitoringCategory =
  | 'api'
  | 'ingestion'
  | 'billing'
  | 'ai'
  | 'resume'
  | 'security'

export type MonitoringSeverity = 'info' | 'warn' | 'error' | 'fatal'

export interface MonitoringPayload {
  category: MonitoringCategory
  event: string
  severity: MonitoringSeverity
  errorId?: string
  message: string
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface MonitoringBackend {
  name: string
  isConfigured(): boolean
  captureEvent(payload: MonitoringPayload): void | Promise<void>
  captureException(error: unknown, context?: Record<string, unknown>): void | Promise<void>
}

/** Default structured logger backend. */
class StructuredLogBackend implements MonitoringBackend {
  readonly name = 'structured-logger'

  isConfigured(): boolean {
    return true
  }

  captureEvent(payload: MonitoringPayload): void {
    const level = payload.severity === 'fatal' || payload.severity === 'error' ? 'error' : payload.severity === 'warn' ? 'warn' : 'info'
    logEvent(level, `${payload.category}.${payload.event}`, {
      errorId: payload.errorId,
      message: payload.message,
      ...(payload.metadata || {}),
    })
  }

  captureException(error: unknown, context: Record<string, unknown> = {}): void {
    logError('system.unhandled_exception', error, context)
  }
}

class MonitoringManager {
  private backends: MonitoringBackend[] = [new StructuredLogBackend()]

  /** Register an external monitoring adapter (e.g. Sentry, Datadog, OpenTelemetry). */
  public registerBackend(backend: MonitoringBackend): void {
    this.backends.push(backend)
  }

  /** Dispatch a structured event across all configured monitoring backends. */
  public dispatch(category: MonitoringCategory, event: string, severity: MonitoringSeverity, message: string, metadata: Record<string, unknown> = {}, errorId?: string): string {
    const eid = errorId || (severity === 'error' || severity === 'fatal' ? newErrorId() : undefined)
    const payload: MonitoringPayload = {
      category,
      event,
      severity,
      errorId: eid,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    }

    for (const backend of this.backends) {
      try {
        if (backend.isConfigured()) {
          void backend.captureEvent(payload)
        }
      } catch (err) {
        console.error(`[monitoring] backend ${backend.name} failed to process event:`, err)
      }
    }

    return eid || ''
  }

  /** API unhandled error tracking */
  public notifyApiFailure(route: string, error: unknown, meta: Record<string, unknown> = {}): string {
    const errorId = newErrorId()
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack?.slice(0, 1000) : undefined
    this.dispatch('api', 'unhandled_route_error', 'error', message, { route, stack, ...meta }, errorId)
    return errorId
  }

  /** Job feed ingestion failure tracking */
  public notifyIngestionFailure(sourceSlug: string, error: unknown, meta: Record<string, unknown> = {}): string {
    const errorId = newErrorId()
    const message = error instanceof Error ? error.message : String(error)
    this.dispatch('ingestion', 'source_feed_failed', 'error', message, { sourceSlug, ...meta }, errorId)
    return errorId
  }

  /** Billing webhook & checkout failure tracking */
  public notifyBillingWebhookFailure(provider: string, reason: string, meta: Record<string, unknown> = {}): void {
    this.dispatch('billing', 'webhook_rejected', 'warn', `Billing webhook rejected: ${reason}`, { provider, reason, ...meta })
  }

  /** AI provider failure & fallback tracking */
  public notifyAiFailure(provider: string, feature: string, error: unknown, meta: Record<string, unknown> = {}): string {
    const errorId = newErrorId()
    const message = error instanceof Error ? error.message : String(error)
    this.dispatch('ai', 'provider_call_failed', 'warn', message, { provider, feature, ...meta }, errorId)
    return errorId
  }

  /** Resume parsing and analysis failure tracking */
  public notifyResumeProcessingFailure(reason: string, error?: unknown, meta: Record<string, unknown> = {}): string {
    const errorId = newErrorId()
    const message = error instanceof Error ? error.message : reason
    this.dispatch('resume', 'processing_failed', 'error', message, { reason, ...meta }, errorId)
    return errorId
  }

  /** Authentication & security abuse tracking */
  public notifySecurityEvent(event: string, severity: 'warn' | 'error', meta: Record<string, unknown> = {}): void {
    this.dispatch('security', event, severity, `Security alert: ${event}`, meta)
  }

  /** Reports external monitoring integration readiness. */
  public externalMonitoringStatus(): { configured: boolean; provider: string; activeBackends: string[]; notice: string } {
    const externalEnv = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.DATADOG_API_KEY
    return {
      configured: Boolean(externalEnv),
      provider: externalEnv ? 'EXTERNAL' : 'NOT CONFIGURED',
      activeBackends: this.backends.map((b) => b.name),
      notice: 'Application-side monitoring abstraction active. External collector (e.g. Sentry DSN or Datadog agent) is NOT CONFIGURED.',
    }
  }
}

export const monitoring = new MonitoringManager()
