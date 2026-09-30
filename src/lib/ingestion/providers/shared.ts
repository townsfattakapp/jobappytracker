import type { FetchContext } from '../types'

/**
 * Helpers shared by the careers-site adapters (Amazon Jobs, Eightfold,
 * Workday). Those sites expose the JSON endpoints their own job-search pages
 * call; they are not documented public APIs and can change without notice,
 * so every adapter validates the shape it receives and fails loudly.
 */
export const BROWSER_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 JobAppy-ingestion/1.0 (+https://prep.evolw.in)',
}

const RETRY_STATUSES = new Set([429, 502, 503, 504])
const MAX_ATTEMPTS = 4

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Fetches JSON; a 429 / 5xx answer is retried with a backoff (Retry-After when the site sends it). */
export async function fetchJson<T>(ctx: FetchContext, url: string, init: RequestInit = {}, label = url): Promise<T> {
  let res: Response | null = null
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      res = await ctx.fetch(url, { ...init, headers: { ...BROWSER_HEADERS, ...(init.headers as Record<string, string> | undefined) } })
    } catch (error) {
      if (error instanceof Error && ('status' in error && error.status === 'PROTECTED' || /AbortError|TimeoutError/.test(error.name))) throw error
      // A timed-out or reset connection (Node's undici occasionally drops one under load) is retried once before giving up.
      if (attempt >= 2) throw error
      ctx.log(`${label} failed (${error instanceof Error ? error.name : 'error'}); retrying once`)
      await sleep(1000)
      continue
    }
    if (res.ok || !RETRY_STATUSES.has(res.status) || attempt === MAX_ATTEMPTS) break
    const retryAfter = Number(res.headers?.get?.('retry-after')) || 0
    const wait = Math.min(30_000, retryAfter > 0 ? retryAfter * 1000 : 1500 * 2 ** (attempt - 1))
    ctx.log(`${label} responded ${res.status}; retrying in ${Math.round(wait / 1000)} s (attempt ${attempt} of ${MAX_ATTEMPTS})`)
    await sleep(wait)
  }
  if (!res) throw new Error(`${label} did not answer`)
  if (!res.ok) throw new Error(`${label} responded ${res.status}`)
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`${label} did not return JSON (${text.slice(0, 60).replace(/\s+/g, ' ')}…)`)
  }
}

/** Runs `fn` over `items` with at most `limit` in flight; failures of single items are collected, not fatal. */
export async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<{ results: R[]; failures: { index: number; error: string }[] }> {
  const results: R[] = []
  const failures: { index: number; error: string }[] = []
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      try {
        results[index] = await fn(items[index], index)
      } catch (error) {
        failures.push({ index, error: error instanceof Error ? error.message : String(error) })
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker))
  return { results: results.filter((r) => r !== undefined), failures }
}

export function positiveInt(value: unknown, fallback: number, max: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : fallback
}

export function hostToken(value: unknown): string {
  const host = String(value || '').trim().toLowerCase()
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) throw new Error(`invalid host "${host}"`)
  return host
}

export function epochSecondsToIso(value: unknown): string | null {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  const ms = n < 1e12 ? n * 1000 : n
  const d = new Date(ms)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function workLocationOption(value: unknown): 'remote' | 'hybrid' | 'onsite' | null {
  const v = String(value || '').toLowerCase()
  if (!v) return null
  if (/remote/.test(v)) return 'remote'
  if (/hybrid|flex/.test(v)) return 'hybrid'
  if (/on-?site|office/.test(v)) return 'onsite'
  return null
}

/** Workday reference ids are shared across tenants; this one is the country "India". */
export const WORKDAY_INDIA_COUNTRY_ID = 'c4f78be1a8f14da0ab49ce1162348a5e'

export const ISO3_COUNTRY: Record<string, string> = {
  IND: 'India', USA: 'United States', CAN: 'Canada', GBR: 'United Kingdom', IRL: 'Ireland', DEU: 'Germany', AUS: 'Australia', SGP: 'Singapore', ARE: 'United Arab Emirates', JPN: 'Japan', NLD: 'Netherlands', POL: 'Poland', ESP: 'Spain', CZE: 'Czech Republic', LUX: 'Luxembourg', ITA: 'Italy', FRA: 'France', SWE: 'Sweden', BRA: 'Brazil', MEX: 'Mexico', ISR: 'Israel', ZAF: 'South Africa', ROU: 'Romania', PRT: 'Portugal', CHN: 'China', TWN: 'Taiwan', KOR: 'South Korea', PHL: 'Philippines', VNM: 'Vietnam', IDN: 'Indonesia', SAU: 'Saudi Arabia', EGY: 'Egypt', NZL: 'New Zealand', CRI: 'Costa Rica', COL: 'Colombia', ARG: 'Argentina', CHL: 'Chile', AUT: 'Austria', CHE: 'Switzerland', BEL: 'Belgium', DNK: 'Denmark', FIN: 'Finland', NOR: 'Norway', SVK: 'Slovakia', HUN: 'Hungary', GRC: 'Greece', TUR: 'Türkiye', NGA: 'Nigeria', KEN: 'Kenya', MAR: 'Morocco', JOR: 'Jordan', LTU: 'Lithuania', LVA: 'Latvia', EST: 'Estonia', BGR: 'Bulgaria', SRB: 'Serbia', HRV: 'Croatia', SVN: 'Slovenia', UKR: 'Ukraine', HKG: 'Hong Kong', MYS: 'Malaysia', THA: 'Thailand', BGD: 'Bangladesh', PAK: 'Pakistan', LKA: 'Sri Lanka', NPL: 'Nepal',
}

/** ISO 3166-1 alpha-2 codes as SmartRecruiters and Oracle Cloud HCM report them, for the countries the catalog hires in. */
export const ISO2_COUNTRY: Record<string, string> = {
  IN: 'India', US: 'United States', CA: 'Canada', GB: 'United Kingdom', IE: 'Ireland', DE: 'Germany', AU: 'Australia', SG: 'Singapore', AE: 'United Arab Emirates', JP: 'Japan', NL: 'Netherlands', PL: 'Poland', ES: 'Spain', CZ: 'Czech Republic', LU: 'Luxembourg', IT: 'Italy', FR: 'France', SE: 'Sweden', BR: 'Brazil', MX: 'Mexico', IL: 'Israel', ZA: 'South Africa', RO: 'Romania', PH: 'Philippines', MY: 'Malaysia', HK: 'Hong Kong', CH: 'Switzerland', PT: 'Portugal', AR: 'Argentina', CO: 'Colombia', NZ: 'New Zealand', KR: 'South Korea', CN: 'China', TW: 'Taiwan', VN: 'Vietnam', ID: 'Indonesia', TH: 'Thailand', BE: 'Belgium', AT: 'Austria', DK: 'Denmark', FI: 'Finland', NO: 'Norway', HU: 'Hungary', BG: 'Bulgaria', GR: 'Greece', TR: 'Turkey', EG: 'Egypt', NG: 'Nigeria', KE: 'Kenya', SA: 'Saudi Arabia', QA: 'Qatar', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka', CL: 'Chile', PE: 'Peru', UA: 'Ukraine', RS: 'Serbia', HR: 'Croatia', SK: 'Slovakia', LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia',
}
