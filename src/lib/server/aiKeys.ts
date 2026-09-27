import { and, asc, eq } from 'drizzle-orm'
import { db } from '../db'
import { userAiKeys } from '../db/schema'
import { decryptSecret, encryptSecret } from './crypto'
import { logEvent } from './log'

export type AiProvider = 'groq' | 'openai' | 'gemini' | 'mistral' | 'openrouter'

/** A learner may keep several keys for ONE provider (for example Groq keys from two accounts); the gateway rotates through them. */
export const MAX_KEYS_PER_USER = 5

export const PROVIDERS: Record<AiProvider, { label: string; pattern: RegExp; modelsUrl: string; consoleUrl: string; header: (key: string) => Record<string, string> }> = {
  groq: { label: 'Groq', pattern: /^gsk_[A-Za-z0-9_-]{16,}$/, modelsUrl: 'https://api.groq.com/openai/v1/models', consoleUrl: 'https://console.groq.com/keys', header: (key) => ({ Authorization: `Bearer ${key}` }) },
  openai: { label: 'OpenAI', pattern: /^sk-[A-Za-z0-9_-]{16,}$/, modelsUrl: 'https://api.openai.com/v1/models', consoleUrl: 'https://platform.openai.com/api-keys', header: (key) => ({ Authorization: `Bearer ${key}` }) },
  gemini: { label: 'Google Gemini', pattern: /^AIza[A-Za-z0-9_-]{20,}$/, modelsUrl: 'https://generativelanguage.googleapis.com/v1beta/models', consoleUrl: 'https://aistudio.google.com/app/apikey', header: (key) => ({ 'x-goog-api-key': key }) },
  mistral: { label: 'Mistral', pattern: /^[A-Za-z0-9]{24,}$/, modelsUrl: 'https://api.mistral.ai/v1/models', consoleUrl: 'https://console.mistral.ai/api-keys', header: (key) => ({ Authorization: `Bearer ${key}` }) },
  openrouter: { label: 'OpenRouter', pattern: /^sk-or-[A-Za-z0-9_-]{16,}$/, modelsUrl: 'https://openrouter.ai/api/v1/models', consoleUrl: 'https://openrouter.ai/keys', header: (key) => ({ Authorization: `Bearer ${key}` }) },
}

export function isProvider(value: unknown): value is AiProvider {
  return typeof value === 'string' && value in PROVIDERS
}

export type KeyStatus = 'active' | 'cooling' | 'invalid'

export interface UserAiKeySummary {
  id: string
  provider: AiProvider
  hint: string
  label: string | null
  status: KeyStatus
  /** When a rate-limited key becomes eligible again (ISO); null when it is not cooling down. */
  cooldownUntil: string | null
  lastUsedAt: string | null
  lastError: string | null
  position: number
}

type Row = typeof userAiKeys.$inferSelect

function summarize(row: Row, now = new Date()): UserAiKeySummary {
  const cooling = row.status === 'cooling' && row.cooldownUntil && row.cooldownUntil.getTime() > now.getTime()
  return {
    id: row.id,
    provider: row.provider as AiProvider,
    hint: row.keyHint,
    label: row.label ?? null,
    status: row.status === 'invalid' ? 'invalid' : cooling ? 'cooling' : 'active',
    cooldownUntil: cooling ? row.cooldownUntil!.toISOString() : null,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    lastError: row.lastError ?? null,
    position: row.position,
  }
}

async function rowsFor(userId: string): Promise<Row[]> {
  const rows = await db.select().from(userAiKeys).where(eq(userAiKeys.userId, userId)).orderBy(asc(userAiKeys.position), asc(userAiKeys.createdAt))
  return rows.filter((r) => isProvider(r.provider))
}

/**
 * Every usable key of the learner's provider in rotation order: active keys first, then keys whose cooldown has
 * passed; invalid keys are left out. Keys still cooling down are appended last so a request is never refused while a
 * key exists (the provider answers 429 again at worst, and the gateway then moves on).
 */
export async function getUserAiKeys(userId: string, now = new Date()): Promise<{ provider: AiProvider; keys: { id: string; key: string; hint: string }[] } | null> {
  const rows = await rowsFor(userId)
  if (!rows.length) return null
  const provider = rows[0].provider as AiProvider
  const usable = rows.filter((r) => r.provider === provider && r.status !== 'invalid')
  const ready = usable.filter((r) => !(r.status === 'cooling' && r.cooldownUntil && r.cooldownUntil.getTime() > now.getTime()))
  const cooling = usable.filter((r) => !ready.includes(r))
  const keys: { id: string; key: string; hint: string }[] = []
  for (const r of [...ready, ...cooling]) {
    try {
      keys.push({ id: r.id, key: decryptSecret(r.encryptedKey), hint: r.keyHint })
    } catch {
      // A key that cannot be decrypted (rotated secret) is skipped, never reported as the learner's fault.
    }
  }
  return keys.length ? { provider, keys } : null
}

/** First usable key, for callers that need a single one. */
export async function getUserAiKey(userId: string): Promise<{ provider: AiProvider; key: string; hint: string } | null> {
  const pool = await getUserAiKeys(userId)
  return pool ? { provider: pool.provider, ...pool.keys[0] } : null
}

export async function listUserAiKeys(userId: string): Promise<UserAiKeySummary[]> {
  return (await rowsFor(userId)).map((r) => summarize(r))
}

/** First key as a one-line summary (older callers); null when the learner has none. */
export async function getUserAiKeySummary(userId: string): Promise<{ provider: AiProvider; hint: string } | null> {
  const [first] = await listUserAiKeys(userId)
  return first ? { provider: first.provider, hint: first.hint } : null
}

/** Checks the key against the provider. Network trouble counts as "unverified", not invalid. */
export async function validateProviderKey(provider: AiProvider, key: string): Promise<{ ok: true; verified: boolean } | { ok: false; reason: string }> {
  const meta = PROVIDERS[provider]
  if (!meta.pattern.test(key)) return { ok: false, reason: `That does not look like a ${meta.label} key.` }
  try {
    const res = await fetch(meta.modelsUrl, { headers: meta.header(key), signal: AbortSignal.timeout(8000) })
    if (res.status === 401 || res.status === 403) return { ok: false, reason: `${meta.label} rejected this key. Check it and try again.` }
    return { ok: true, verified: res.ok }
  } catch {
    return { ok: true, verified: false }
  }
}

/**
 * Adds a key. Keys of a different provider than the ones already stored are replaced (one provider per learner, so
 * sensitive requests never fan out); a key of the same provider joins the rotation. Re-adding an existing key
 * (same last characters and provider) refreshes it instead of duplicating it.
 */
export async function addUserAiKey(userId: string, provider: AiProvider, key: string, label: string | null = null): Promise<{ added: UserAiKeySummary; keys: UserAiKeySummary[]; replacedProvider: AiProvider | null }> {
  const hint = `…${key.slice(-4)}`
  const encryptedKey = encryptSecret(key)
  const now = new Date()
  const existing = await rowsFor(userId)
  let replacedProvider: AiProvider | null = null
  if (existing.length && existing[0].provider !== provider) {
    replacedProvider = existing[0].provider as AiProvider
    await db.delete(userAiKeys).where(eq(userAiKeys.userId, userId))
    existing.length = 0
  }
  const same = existing.find((r) => r.keyHint === hint && decryptSafely(r.encryptedKey) === key)
  let id: string
  if (same) {
    id = same.id
    await db.update(userAiKeys).set({ encryptedKey, label: label ?? same.label, status: 'active', cooldownUntil: null, lastError: null, updatedAt: now }).where(eq(userAiKeys.id, id))
  } else {
    if (existing.length >= MAX_KEYS_PER_USER) throw new Error(`You can keep up to ${MAX_KEYS_PER_USER} keys; remove one first.`)
    id = crypto.randomUUID()
    const position = existing.length ? Math.max(...existing.map((r) => r.position)) + 1 : 0
    await db.insert(userAiKeys).values({ id, userId, provider, encryptedKey, keyHint: hint, label, position, status: 'active', createdAt: now, updatedAt: now })
  }
  const keys = await listUserAiKeys(userId)
  return { added: keys.find((k) => k.id === id)!, keys, replacedProvider }
}

function decryptSafely(encrypted: string): string | null {
  try {
    return decryptSecret(encrypted)
  } catch {
    return null
  }
}

/** Kept for older callers: replaces every stored key with this one. */
export async function setUserAiKey(userId: string, provider: AiProvider, key: string): Promise<{ provider: AiProvider; hint: string }> {
  await db.delete(userAiKeys).where(eq(userAiKeys.userId, userId))
  const { added } = await addUserAiKey(userId, provider, key)
  return { provider, hint: added.hint }
}

export async function deleteUserAiKey(userId: string, id?: string): Promise<void> {
  if (id) await db.delete(userAiKeys).where(and(eq(userAiKeys.userId, userId), eq(userAiKeys.id, id)))
  else await db.delete(userAiKeys).where(eq(userAiKeys.userId, userId))
}

/** Default cooldown when the provider does not say when the quota resets: long enough to skip a daily-limit key for the rest of a session. */
export const DEFAULT_COOLDOWN_MS = 60 * 60_000

/**
 * Records what a call did with a pooled key so the rotation learns: a rate limit puts the key on cooldown (Retry-After
 * when the provider sends one, an hour otherwise), an authentication failure marks it invalid, a success clears both.
 */
export async function recordKeyOutcome(id: string, outcome: 'ok' | 'rate_limit' | 'auth', detail: { message?: string; retryAfterMs?: number | null } = {}, now = new Date()): Promise<void> {
  if (outcome === 'ok') {
    await db.update(userAiKeys).set({ status: 'active', cooldownUntil: null, lastError: null, lastUsedAt: now, updatedAt: now }).where(eq(userAiKeys.id, id))
    return
  }
  if (outcome === 'rate_limit') {
    const until = new Date(now.getTime() + Math.min(24 * 60 * 60_000, Math.max(60_000, detail.retryAfterMs ?? DEFAULT_COOLDOWN_MS)))
    await db.update(userAiKeys).set({ status: 'cooling', cooldownUntil: until, lastError: (detail.message ?? 'rate limited').slice(0, 200), lastUsedAt: now, updatedAt: now }).where(eq(userAiKeys.id, id))
    logEvent('info', 'ai.key_cooldown', { keyId: id, until: until.toISOString() })
    return
  }
  await db.update(userAiKeys).set({ status: 'invalid', lastError: (detail.message ?? 'rejected by the provider').slice(0, 200), lastUsedAt: now, updatedAt: now }).where(eq(userAiKeys.id, id))
  logEvent('warn', 'ai.key_invalid', { keyId: id })
}
