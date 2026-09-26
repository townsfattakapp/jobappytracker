import type { JobProvider, RawJob } from '../types'
import { fetchJson, ISO3_COUNTRY, positiveInt } from './shared'

/**
 * Amazon Jobs site search (the JSON endpoint behind amazon.jobs/en/search):
 * GET https://www.amazon.jobs/en/search.json?offset=&result_limit=100&sort=recent&country=IND&category[]=software-development
 * Not a documented public API: it is what the careers site itself calls, so the
 * shape is validated and a change on Amazon's side surfaces as a failed run.
 * Config: { countries?: ISO3[], categories?: string[], perCountry?: number, indiaLimit?: number }.
 */
interface AmazonJob {
  id?: string
  id_icims?: string
  title?: string
  description?: string
  description_short?: string
  basic_qualifications?: string
  preferred_qualifications?: string
  normalized_location?: string
  location?: string
  city?: string
  state?: string
  country_code?: string
  posted_date?: string
  updated_time?: string
  job_schedule_type?: string
  job_category?: string
  job_family?: string
  job_path?: string
  url_next_step?: string
  team?: { label?: string; id?: string } | null
  business_category?: string
  is_intern?: boolean
}

interface AmazonSearchResponse {
  error?: unknown
  hits?: number
  jobs?: AmazonJob[]
}

export const AMAZON_DEFAULT_COUNTRIES = ['IND', 'USA', 'CAN', 'GBR', 'IRL', 'DEU', 'AUS', 'SGP', 'ARE', 'JPN', 'NLD', 'POL', 'ESP', 'CZE', 'LUX', 'ITA', 'FRA', 'SWE', 'BRA', 'MEX', 'ISR', 'ZAF', 'ROU', 'PRT', 'CRI', 'COL', 'AUT', 'CHE', 'BEL', 'DNK', 'SVK']
export const AMAZON_DEFAULT_CATEGORIES = ['software-development', 'machine-learning-science', 'data-science', 'solutions-architect', 'systems-quality-security-engineering', 'operations-it-support-engineering', 'research-science', 'business-intelligence']
const PAGE = 100

/** "September 25, 2026" is a calendar date, so it is stored as that day at 00:00 UTC whatever the server's zone. */
const parsePostedDate = (value: string | undefined): string | null => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()
}

export const amazonProvider: JobProvider = {
  id: 'amazon',
  label: 'Amazon Jobs site search (unofficial JSON)',
  configHelp: 'config.countries = ISO3 codes (default: India first, then major hubs); config.categories = amazon.jobs category slugs; config.perCountry / config.indiaLimit cap listings per country.',
  async fetchJobs(source, ctx) {
    const countries = (Array.isArray(source.config.countries) ? source.config.countries : AMAZON_DEFAULT_COUNTRIES).map((c) => String(c).toUpperCase()).filter((c) => /^[A-Z]{3}$/.test(c))
    const categories = (Array.isArray(source.config.categories) ? source.config.categories : AMAZON_DEFAULT_CATEGORIES).map((c) => String(c)).filter((c) => /^[a-z0-9-]+$/.test(c))
    if (!countries.length || !categories.length) throw new Error('Amazon source needs at least one country (ISO3) and one category slug')
    const perCountry = positiveInt(source.config.perCountry, 300, 2000)
    const indiaLimit = positiveInt(source.config.indiaLimit, 900, 3000)
    const categoryQuery = categories.map((c) => `category%5B%5D=${encodeURIComponent(c)}`).join('&')
    const seen = new Set<string>()
    const out: RawJob[] = []
    for (const country of countries) {
      const limit = country === 'IND' ? indiaLimit : perCountry
      let offset = 0
      let hits = 0
      let fetched = 0
      while (offset < limit) {
        const url = `https://www.amazon.jobs/en/search.json?offset=${offset}&result_limit=${Math.min(PAGE, limit - offset)}&sort=recent&country=${country}&${categoryQuery}`
        const body = await fetchJson<AmazonSearchResponse>(ctx, url, {}, `amazon.jobs search (${country}, offset ${offset})`)
        if (body.error) throw new Error(`amazon.jobs search returned an error for ${country}: ${JSON.stringify(body.error).slice(0, 120)}`)
        const jobs = Array.isArray(body.jobs) ? body.jobs : []
        if (offset === 0) hits = Number(body.hits) || 0
        for (const j of jobs) {
          const externalId = String(j.id_icims || j.id || '').trim()
          if (!externalId || !j.title || seen.has(externalId)) continue
          seen.add(externalId)
          fetched += 1
          const countryName = ISO3_COUNTRY[String(j.country_code || country).toUpperCase()] || null
          const sections = [j.description || j.description_short || '', j.basic_qualifications ? `<h3>Basic qualifications</h3>${j.basic_qualifications}` : '', j.preferred_qualifications ? `<h3>Preferred qualifications</h3>${j.preferred_qualifications}` : '']
          out.push({
            externalId,
            title: j.title,
            descriptionHtml: sections.filter(Boolean).join('\n'),
            location: j.normalized_location || j.location || [j.city, j.state, countryName].filter(Boolean).join(', ') || null,
            locations: [],
            countries: countryName ? [countryName] : [],
            workplaceType: null,
            employmentType: j.job_schedule_type || null,
            department: j.job_category || j.job_family || null,
            postedAt: parsePostedDate(j.posted_date),
            updatedAt: null,
            sourceUrl: j.job_path ? `https://www.amazon.jobs${j.job_path}` : `https://www.amazon.jobs/en/jobs/${externalId}`,
            applyUrl: j.url_next_step || null,
            raw: { team: j.team?.label || null, businessCategory: j.business_category || null, category: j.job_category || null, intern: Boolean(j.is_intern), updated: j.updated_time || null },
          })
        }
        offset += PAGE
        if (jobs.length < PAGE || offset >= hits) break
      }
      ctx.log(`amazon.jobs ${country}: ${hits} hit(s), ${fetched} taken (limit ${limit})`)
    }
    ctx.log(`${out.length} Amazon listings across ${countries.length} country code(s), categories ${categories.join(', ')}`)
    return out
  },
}
