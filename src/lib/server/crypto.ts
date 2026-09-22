import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * AES-256-GCM for secrets at rest (the learner's AI provider keys).
 * The key is derived from AI_KEY_ENCRYPTION_SECRET, falling back to the auth
 * secret so a single well-kept secret is enough for a small deployment.
 */
function key(): Buffer {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('AI_KEY_ENCRYPTION_SECRET (or AUTH_SECRET) must be set to store API keys')
  return createHash('sha256').update(secret).digest()
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`
}

export function decryptSecret(stored: string): string {
  const [version, iv, tag, ct] = stored.split(':')
  if (version !== 'v1' || !iv || !tag || !ct) throw new Error('Unrecognised secret format')
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]).toString('utf8')
}
