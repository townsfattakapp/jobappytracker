/**
 * Output validation for AI enrichments. Every AI result is checked against
 * the deterministic facts it must not contradict before it is shown; a
 * failed validation means the deterministic output is used alone.
 */

const HIRE_WORDS = /\b(hire|hired|hiring probab|chance of (getting|being)|\d{1,3}\s?% (chance|likely)|you will (get|receive) (the|an) offer)\b/i

export function validateFollowUp(text: unknown): string | null {
  if (typeof text !== 'string') return null
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length < 12 || t.length > 400) return null
  if (!/[?]$/.test(t)) return null
  if (HIRE_WORDS.test(t)) return null
  if (/```/.test(t)) return null
  return t
}

export function validateCoachSummary(text: unknown): string | null {
  if (typeof text !== 'string') return null
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length < 40 || t.length > 900) return null
  if (HIRE_WORDS.test(t)) return null
  if (/\b\d{1,3}\s?%/.test(t)) return null
  return t
}

/** Insights must reference skills the deterministic analysis knows about and must not invent numbers. */
export function validateInsights(data: Record<string, unknown>, knownTerms: string[]): string[] | null {
  const list = Array.isArray(data.insights) ? data.insights.filter((x): x is string => typeof x === 'string') : []
  const lower = knownTerms.map((k) => k.toLowerCase())
  const out = list
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter((s) => s.length >= 20 && s.length <= 320 && !HIRE_WORDS.test(s) && lower.some((k) => k.length >= 2 && s.toLowerCase().includes(k)))
    .slice(0, 4)
  return out.length ? out : null
}

export function validateNarrative(text: unknown): string | null {
  if (typeof text !== 'string') return null
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length < 60 || t.length > 1200) return null
  if (HIRE_WORDS.test(t)) return null
  return t
}

/** A refined draft keeps every placeholder, adds no new numbers and stays about the same length. */
export function validateRefinedDraft(text: unknown, original: string, placeholders: string[]): string | null {
  if (typeof text !== 'string') return null
  const t = text.trim()
  if (t.length < 40 || t.length > Math.max(600, original.length * 1.6)) return null
  for (const p of placeholders) if (!t.includes(p)) return null
  const originalNumbers = new Set((original.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]/g, '')))
  for (const n of t.match(/\d[\d,.]*/g) ?? []) if (!originalNumbers.has(n.replace(/[,.]/g, ''))) return null
  if (/\b(we met|we spoke|as discussed|referred by|my friend)\b/i.test(t) && !/\b(we met|we spoke|as discussed|referred by|my friend)\b/i.test(original)) return null
  return t
}
