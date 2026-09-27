import type { JobProvider, RawJob } from '../types'
import { fetchJson, positiveInt } from './shared'

/**
 * Atlassian's careers page loads every open role from one JSON endpoint:
 *   GET https://www.atlassian.com/endpoint/careers/listings
 *   → [{ id, title, type, locations[], category, overview, responsibilities, qualifications, applyUrl, portalJobPost: { portalUrl, updatedDate } }]
 * Unofficial (it is what the page itself calls); the shape is validated and a
 * change surfaces as a failed run. Config: { maxListings? }.
 */
interface AtlassianListing {
  id?: number | string
  title?: string
  type?: string
  locations?: string[]
  category?: string
  overview?: string
  responsibilities?: string
  qualifications?: string
  applyUrl?: string
  portalJobPost?: { portalUrl?: string; updatedDate?: string }
}

export const ATLASSIAN_LISTINGS_URL = 'https://www.atlassian.com/endpoint/careers/listings'

const section = (title: string, html: string | undefined) => (html && html.trim() ? `<h3>${title}</h3>${html}` : '')

/** "2026-09-22 12:42 AM" → ISO, or null when the format is not what the page shows today. */
export function parseAtlassianDate(value: string | undefined): string | null {
  if (!value) return null
  const d = new Date(value.replace(' ', 'T').replace(/T(\d{1,2}:\d{2}) (AM|PM)$/i, (_, t, ap) => `T${t} ${ap}`))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export const atlassianProvider: JobProvider = {
  id: 'atlassian',
  label: 'Atlassian careers listings (unofficial JSON)',
  configHelp: 'No token: the provider reads atlassian.com/endpoint/careers/listings. Optional config.maxListings.',
  async fetchJobs(source, ctx) {
    const max = positiveInt(source.config.maxListings, 2000, 5000)
    const body = await fetchJson<unknown>(ctx, ATLASSIAN_LISTINGS_URL, { headers: { accept: 'application/json' } }, 'Atlassian listings')
    if (!Array.isArray(body)) throw new Error('Atlassian listings response was not an array')
    const listings = (body as AtlassianListing[]).slice(0, max)
    ctx.log(`${body.length} Atlassian listing(s)`)
    const out: RawJob[] = []
    const seen = new Set<string>()
    for (const l of listings) {
      const id = l?.id === undefined || l.id === null ? '' : String(l.id).trim()
      if (!id || !l.title || seen.has(id)) continue
      const html = [l.overview?.trim() || '', section('Responsibilities', l.responsibilities), section('Qualifications', l.qualifications)].filter(Boolean).join('\n')
      if (!html) continue
      seen.add(id)
      const locations = (l.locations || []).map((s) => String(s).trim()).filter(Boolean)
      const sourceUrl = l.portalJobPost?.portalUrl || l.applyUrl || `https://www.atlassian.com/company/careers/details/${id}`
      out.push({
        externalId: id,
        title: l.title.trim(),
        descriptionHtml: html,
        location: locations[0] || null,
        locations: locations.slice(1),
        countries: [],
        workplaceType: locations.some((s) => /remote/i.test(s)) ? 'remote' : null,
        employmentType: l.type || null,
        department: l.category || null,
        postedAt: null,
        updatedAt: parseAtlassianDate(l.portalJobPost?.updatedDate),
        sourceUrl,
        applyUrl: l.applyUrl || sourceUrl,
        raw: { category: l.category || null, type: l.type || null },
      })
    }
    ctx.log(`${out.length} Atlassian listings with descriptions`)
    return out
  },
}
