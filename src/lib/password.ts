import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const COST = 16384

function derive(password: string, salt: Buffer, length: number, cost: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, length, { N: cost }, (err, key) => (err ? reject(err) : resolve(key)))
  })
}

/** Hash a password with scrypt. Format: scrypt$N$saltHex$hashHex */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = await derive(password, salt, KEY_LENGTH, COST)
  return `scrypt$${COST}$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false
  const [scheme, costRaw, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
  const cost = Number(costRaw) || COST
  const expected = Buffer.from(hashHex, 'hex')
  const derived = await derive(password, Buffer.from(saltHex, 'hex'), expected.length, cost)
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}
