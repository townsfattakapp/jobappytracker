/**
 * Shared cron authentication: the caller must present the CRON_SECRET as a
 * bearer token. Without a configured secret every cron route answers 404,
 * so an unconfigured deployment exposes nothing.
 */
export function cronAuthorized(headers: Headers, secret = (process.env.CRON_SECRET || '').trim()): { ok: boolean; reason: 'not_configured' | 'missing' | 'mismatch' | null } {
  if (!secret) return { ok: false, reason: 'not_configured' }
  const presented = (headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!presented) return { ok: false, reason: 'missing' }
  if (presented.length !== secret.length) return { ok: false, reason: 'mismatch' }
  let diff = 0
  for (let i = 0; i < secret.length; i += 1) diff |= presented.charCodeAt(i) ^ secret.charCodeAt(i)
  return diff === 0 ? { ok: true, reason: null } : { ok: false, reason: 'mismatch' }
}
