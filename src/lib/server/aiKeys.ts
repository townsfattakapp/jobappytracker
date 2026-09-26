import { eq } from 'drizzle-orm'
import { db } from '../db'
import { userAiKeys } from '../db/schema'
import { decryptSecret, encryptSecret } from './crypto'

export type AiProvider = 'groq' | 'openai' | 'gemini' | 'mistral' | 'openrouter'

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

export async function getUserAiKey(userId: string): Promise<{ provider: AiProvider; key: string; hint: string } | null> {
  const row = await db.query.userAiKeys.findFirst({ where: eq(userAiKeys.userId, userId) })
  if (!row || !isProvider(row.provider)) return null
  try {
    return { provider: row.provider, key: decryptSecret(row.encryptedKey), hint: row.keyHint }
  } catch {
    return null
  }
}

export async function getUserAiKeySummary(userId: string): Promise<{ provider: AiProvider; hint: string } | null> {
  const row = await db.query.userAiKeys.findFirst({ where: eq(userAiKeys.userId, userId), columns: { provider: true, keyHint: true } })
  return row && isProvider(row.provider) ? { provider: row.provider, hint: row.keyHint } : null
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

export async function setUserAiKey(userId: string, provider: AiProvider, key: string): Promise<{ provider: AiProvider; hint: string }> {
  const hint = `…${key.slice(-4)}`
  const encryptedKey = encryptSecret(key)
  await db
    .insert(userAiKeys)
    .values({ userId, provider, encryptedKey, keyHint: hint })
    .onConflictDoUpdate({ target: userAiKeys.userId, set: { provider, encryptedKey, keyHint: hint, updatedAt: new Date() } })
  return { provider, hint }
}

export async function deleteUserAiKey(userId: string): Promise<void> {
  await db.delete(userAiKeys).where(eq(userAiKeys.userId, userId))
}
