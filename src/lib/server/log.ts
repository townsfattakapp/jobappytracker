import { randomBytes } from 'node:crypto'

/**
 * Structured application logging. One JSON line per event on stdout/stderr
 * so any log drain can index it. Fields whose names look sensitive are
 * redacted, and callers must never pass resume text, tokens or secrets.
 */

export type LogLevel = 'info' | 'warn' | 'error'

const SENSITIVE = /(secret|token|password|passwd|authorization|cookie|apikey|api_key|signature|content|resumeText|text|draft|ssn|card)/i
const MAX_STRING = 400

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[depth]'
  if (value == null) return value
  if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…[${value.length}]` : value
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1))
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = SENSITIVE.test(k) ? '[redacted]' : redact(v, depth + 1)
  return out
}

/** Short id a support person can search for in the logs. */
export function newErrorId(): string {
  return `E-${randomBytes(4).toString('hex').toUpperCase()}`
}

export function logEvent(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...(redact(fields) as Record<string, unknown>) })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

/** Logs an error with a fresh error id and returns the id for the API response. */
export function logError(event: string, error: unknown, fields: Record<string, unknown> = {}): string {
  const errorId = newErrorId()
  const message = error instanceof Error ? error.message : String(error)
  logEvent('error', event, { errorId, message, ...fields })
  return errorId
}
