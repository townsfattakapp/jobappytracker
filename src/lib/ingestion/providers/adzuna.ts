import type { JobProvider, RawJob } from '../types'
import { fetchJson, positiveInt, sleep } from './shared'

/**
 * Adzuna Jobs API (licensed aggregator, documented, keyed): the fallback for
 * employers whose careers portals expose no feed of their own. Adzuna's own
 * `company` filter answers an HTML 400 for most names, so the adapter runs a
 * keyword search sorted by date and keeps only results whose employer name
 * matches the configured pattern. Descriptions are Adzuna's snippets; the
 * apply link goes through Adzuna to the original posting.
 *   GET https://api.adzuna.com/v1/api/jobs/{country}/search/{page}?app_id=…&app_key=…&what=…&results_per_page=50&sort_by=date
 * Config: { country: "in", query: "PhonePe", match: "phonepe" (case-insensitive regex on the employer name), pages?: 4, maxDaysOld?: 60 }.
 * Credentials come from ADZUNA_APP_ID / ADZUNA_APP_KEY and never from the source row.
 */
interface AdzunaResult {
  id?: string | number
  title?: string
  description?: string
  redirect_url?: string
  created?: string
  company?: { display_name?: string }
  location?: { display_name?: string; area?: string[] }
  category?: { label?: string; tag?: string }
  contract_type?: string
  contract_time?: string
  salary_min?: number
  salary_max?: number
}

interface AdzunaPage {
  count?: number
  results?: AdzunaResult[]
}

const PAGE = 50
const COUNTRY_NAMES: Record<string, string> = { in: 'India', us: 'United States', gb: 'United Kingdom', au: 'Australia', ca: 'Canada', de: 'Germany', sg: 'Singapore', nl: 'Netherlands', fr: 'France', pl: 'Poland' }

export function parseAdzunaToken(token: string): { country: string; query: string; match: string } {
  // The employer regex may itself contain "|" alternatives, so everything after the second separator is the match.
  const [country, query, ...rest] = token.split('|').map((s) => s.trim())
  const match = rest.join('|')
  if (!country || !query) throw new Error('Adzuna token must be "country|query|match" (in|PhonePe|phonepe)')
  if (!/^[a-z]{2}$/.test(country)) throw new Error('Adzuna country is a two-letter code (in)')
  return { country, query, match: match || query }
}

export function adzunaCredentials(env: NodeJS.ProcessEnv = process.env): { appId: string; appKey: string } | null {
  const appId = (env.ADZUNA_APP_ID || '').trim()
  const appKey = (env.ADZUNA_APP_KEY || '').trim()
  return appId && appKey ? { appId, appKey } : null
}

export function adzunaSearchUrl(cfg: { country: string; query: string; maxDaysOld?: number }, page: number, creds: { appId: string; appKey: string }, perPage = PAGE): string {
  const params = new URLSearchParams({ app_id: creds.appId, app_key: creds.appKey, results_per_page: String(perPage), sort_by: 'date', what: cfg.query, 'content-type': 'application/json' })
  if (cfg.maxDaysOld) params.set('max_days_old', String(cfg.maxDaysOld))
  return `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(cfg.country)}/search/${page}?${params.toString()}`
}

function employerMatcher(match: string): RegExp {
  try {
    return new RegExp(match, 'i')
  } catch {
    return new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  }
}

export const adzunaProvider: JobProvider = {
  id: 'adzuna',
  label: 'Adzuna aggregator (licensed API)',
  configHelp: 'config.country (two-letter, e.g. in), config.query (keyword searched), config.match (regex the employer name must match); optional config.pages (default 4 × 50 results), config.maxDaysOld. Needs ADZUNA_APP_ID and ADZUNA_APP_KEY in the environment.',
  async fetchJobs(source, ctx) {
    const creds = adzunaCredentials()
    if (!creds) throw new Error('Adzuna credentials are not configured (ADZUNA_APP_ID / ADZUNA_APP_KEY)')
    const country = String(source.config.country || 'in').trim().toLowerCase()
    const query = String(source.config.query || '').trim()
    const match = String(source.config.match || query).trim()
    if (!/^[a-z]{2}$/.test(country) || !query) throw new Error('Adzuna source needs config.country and config.query')
    const pages = positiveInt(source.config.pages, 4, 20)
    const maxDaysOld = source.config.maxDaysOld ? positiveInt(source.config.maxDaysOld, 60, 365) : undefined
    const re = employerMatcher(match)
    const seen = new Set<string>()
    const out: RawJob[] = []
    let scanned = 0
    let total = 0
    for (let page = 1; page <= pages; page += 1) {
      const url = adzunaSearchUrl({ country, query, maxDaysOld }, page, creds)
      const body = await fetchJson<AdzunaPage>(ctx, url, { headers: { accept: 'application/json' } }, `Adzuna ${country} "${query}" page ${page}`)
      const results = Array.isArray(body.results) ? body.results : []
      if (page === 1) total = Number(body.count) || results.length
      scanned += results.length
      for (const r of results) {
        const id = r?.id === undefined || r.id === null ? '' : String(r.id).trim()
        const employer = r.company?.display_name || ''
        if (!id || !r.title || !r.redirect_url || seen.has(id) || !re.test(employer)) continue
        seen.add(id)
        const area = (r.location?.area || []).filter(Boolean)
        const countryName = COUNTRY_NAMES[country] ?? area[0] ?? null
        const snippet = (r.description || '').replace(/\s+/g, ' ').trim()
        out.push({
          externalId: id,
          title: r.title.trim(),
          descriptionText: snippet ? `${snippet}\n\nSummary from Adzuna. Open the listing for the full description and to apply with ${employer}.` : null,
          descriptionHtml: null,
          location: r.location?.display_name || area.slice(1).reverse().join(', ') || null,
          locations: area.slice(1),
          countries: countryName ? [countryName] : [],
          workplaceType: /remote|work from home/i.test(`${r.title} ${r.location?.display_name || ''}`) ? 'remote' : null,
          employmentType: r.contract_time === 'part_time' ? 'part_time' : r.contract_type === 'contract' ? 'contract' : r.contract_time === 'full_time' || r.contract_type === 'permanent' ? 'full_time' : null,
          department: r.category?.label || null,
          postedAt: r.created || null,
          updatedAt: null,
          sourceUrl: r.redirect_url,
          applyUrl: r.redirect_url,
          raw: { via: 'adzuna', employer, salaryMin: r.salary_min ?? null, salaryMax: r.salary_max ?? null, category: r.category?.tag || null },
        })
      }
      if (results.length < PAGE || scanned >= total) break
      await sleep(1100)
    }
    ctx.log(`Adzuna ${country} "${query}": ${total} keyword matches, ${scanned} scanned, ${out.length} by employer /${match}/i`)
    return out
  },
}
