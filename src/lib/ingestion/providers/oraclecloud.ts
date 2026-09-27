import type { JobProvider, RawJob } from '../types'
import { fetchJson, hostToken, ISO2_COUNTRY, mapConcurrent, positiveInt, workLocationOption } from './shared'

/**
 * Oracle Cloud HCM candidate-experience sites (Oracle itself, JPMorgan Chase, …).
 * The site's own search page calls
 *   GET https://{host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations
 *       &finder=findReqs;siteNumber={site},limit=25,offset=N,sortBy=POSTING_DATES_DESC[,location=India][,keyword=…]   → items[0].TotalJobsCount / requisitionList
 *   GET https://{host}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails/{id}?expand=all&onlyData=true   → ExternalDescriptionStr …
 * Not a documented public API for this use; the shape is validated and a change
 * surfaces as a failed run. Each search is capped (config.maxPerSearch) because
 * every description is one detail call.
 * Config: { host, site, searches?: [{ label, location?, keyword? }], maxPerSearch?, concurrency? }.
 */
interface OracleRequisition {
  Id?: string | number
  Title?: string
  PostedDate?: string
  PrimaryLocation?: string
  PrimaryLocationCountry?: string
  WorkplaceType?: string | null
  JobFamily?: string | null
  JobFunction?: string | null
  ShortDescriptionStr?: string | null
  secondaryLocations?: { Name?: string; CountryCode?: string }[]
}

interface OracleList {
  items?: { TotalJobsCount?: number; requisitionList?: OracleRequisition[] }[]
}

interface OracleDetail extends OracleRequisition {
  ExternalDescriptionStr?: string | null
  ExternalQualificationsStr?: string | null
  ExternalResponsibilitiesStr?: string | null
  CorporateDescriptionStr?: string | null
  ExternalPostedStartDate?: string | null
  ExternalPostedEndDate?: string | null
  JobSchedule?: string | null
  Category?: string | null
}

export interface OracleSearch {
  label: string
  location?: string
  keyword?: string
}

export const ORACLE_DEFAULT_SEARCHES: OracleSearch[] = [
  { label: 'India', location: 'India' },
  { label: 'software (worldwide)', keyword: 'software' },
  { label: 'data (worldwide)', keyword: 'data' },
]
const PAGE = 25

export function parseOracleToken(token: string): { host: string; site: string } {
  const [host, site] = token.split('/').map((s) => s.trim())
  if (!host || !site) throw new Error('Oracle Cloud token must be "host/site" (eeho.fa.us2.oraclecloud.com/CX_1)')
  if (!/^[A-Za-z0-9_]+$/.test(site)) throw new Error('Oracle Cloud site number is letters, digits and underscores (CX_1)')
  return { host: hostToken(host), site }
}

export function oracleListUrl(cfg: { host: string; site: string }, search: OracleSearch, offset: number, limit = PAGE): string {
  const finder = [`findReqs;siteNumber=${cfg.site}`, `limit=${limit}`, `offset=${offset}`, 'sortBy=POSTING_DATES_DESC']
  if (search.location) finder.push(`location=${encodeURIComponent(search.location)}`)
  if (search.keyword) finder.push(`keyword=${encodeURIComponent(search.keyword)}`)
  return `https://${cfg.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations&finder=${finder.join(',')}`
}

export function oracleDetailUrl(cfg: { host: string }, id: string): string {
  return `https://${cfg.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails/${encodeURIComponent(id)}?expand=all&onlyData=true`
}

export function oracleJobUrl(cfg: { host: string; site: string }, id: string): string {
  return `https://${cfg.host}/hcmUI/CandidateExperience/en/sites/${cfg.site}/job/${encodeURIComponent(id)}`
}

const section = (title: string, html: string | null | undefined) => (html && html.trim() ? `<h3>${title}</h3>${html}` : '')

export const oracleCloudProvider: JobProvider = {
  id: 'oraclecloud',
  label: 'Oracle Cloud HCM careers site (unofficial JSON)',
  configHelp: 'config.host = the *.oraclecloud.com host of the careers site, config.site = the site number from its URL (/sites/CX_1); optional config.searches [{ label, location?, keyword? }], config.maxPerSearch, config.concurrency.',
  async fetchJobs(source, ctx) {
    const cfg = { host: hostToken(source.config.host), site: String(source.config.site || '').trim() }
    if (!/^[A-Za-z0-9_]+$/.test(cfg.site)) throw new Error('Oracle Cloud source needs config.site (letters, digits, underscores)')
    const searches: OracleSearch[] = Array.isArray(source.config.searches) && source.config.searches.length ? (source.config.searches as OracleSearch[]).map((s) => ({ label: String(s.label || s.location || s.keyword || 'search'), location: s.location ? String(s.location) : undefined, keyword: s.keyword ? String(s.keyword) : undefined })) : ORACLE_DEFAULT_SEARCHES
    const maxPerSearch = positiveInt(source.config.maxPerSearch, 200, 3000)
    const concurrency = positiveInt(source.config.concurrency, 4, 8)
    const seen = new Map<string, OracleRequisition>()
    for (const search of searches) {
      const page0 = await fetchJson<OracleList>(ctx, oracleListUrl(cfg, search, 0), {}, `Oracle ${cfg.site} list "${search.label}"`)
      const first = page0.items?.[0]
      if (!first || !Array.isArray(first.requisitionList)) throw new Error(`Oracle ${cfg.site} list response had no requisitionList`)
      const total = Math.min(Number(first.TotalJobsCount) || first.requisitionList.length, maxPerSearch)
      const offsets: number[] = []
      for (let offset = PAGE; offset < total; offset += PAGE) offsets.push(offset)
      const pages = await mapConcurrent(offsets, concurrency, async (offset) => {
        const body = await fetchJson<OracleList>(ctx, oracleListUrl(cfg, search, offset), {}, `Oracle ${cfg.site} list "${search.label}" (offset ${offset})`)
        return body.items?.[0]?.requisitionList ?? []
      })
      let taken = 0
      for (const r of [first.requisitionList, ...pages.results].flat()) {
        const id = r?.Id === undefined || r.Id === null ? '' : String(r.Id).trim()
        if (!id || !r.Title || seen.has(id)) continue
        seen.set(id, r)
        taken += 1
      }
      ctx.log(`Oracle ${cfg.site} "${search.label}": ${first.TotalJobsCount ?? '?'} posting(s), ${taken} new (cap ${maxPerSearch})${pages.failures.length ? `, ${pages.failures.length} page(s) failed` : ''}`)
    }
    const details = await mapConcurrent(Array.from(seen.entries()), concurrency, async ([id, listing]) => {
      const detail = await fetchJson<OracleDetail>(ctx, oracleDetailUrl(cfg, id), {}, `Oracle detail ${id}`)
      if (!detail || typeof detail !== 'object' || detail.Id === undefined) throw new Error(`no requisition in detail ${id}`)
      return { id, listing, detail }
    })
    if (details.failures.length) ctx.log(`${details.failures.length} detail call(s) failed: ${details.failures.slice(0, 3).map((f) => f.error).join(' · ')}`)
    const out: RawJob[] = []
    for (const { id, listing, detail } of details.results) {
      const html = [detail.ExternalDescriptionStr?.trim() || '', section('Responsibilities', detail.ExternalResponsibilitiesStr), section('Qualifications', detail.ExternalQualificationsStr), section('About the company', detail.CorporateDescriptionStr)].filter(Boolean).join('\n')
      if (!html) continue
      const countryCode = (detail.PrimaryLocationCountry || listing.PrimaryLocationCountry || '').toUpperCase()
      const country = ISO2_COUNTRY[countryCode]
      const secondary = (detail.secondaryLocations || listing.secondaryLocations || []).map((l) => l.Name || '').filter(Boolean)
      out.push({
        externalId: id,
        title: (detail.Title || listing.Title || '').trim(),
        descriptionHtml: html,
        location: detail.PrimaryLocation || listing.PrimaryLocation || null,
        locations: secondary,
        countries: country ? [country] : [],
        workplaceType: workLocationOption(detail.WorkplaceType || listing.WorkplaceType),
        employmentType: detail.JobSchedule || null,
        department: detail.Category || listing.JobFamily || listing.JobFunction || null,
        postedAt: detail.ExternalPostedStartDate || (listing.PostedDate ? `${listing.PostedDate}T00:00:00.000Z` : null),
        updatedAt: null,
        sourceUrl: oracleJobUrl(cfg, id),
        applyUrl: null,
        raw: { jobFunction: detail.JobFunction || listing.JobFunction || null, country: countryCode || null, site: cfg.site, postingEndDate: detail.ExternalPostedEndDate || null },
      })
    }
    ctx.log(`${out.length} Oracle Cloud listings with descriptions from ${cfg.host}/${cfg.site}`)
    return out
  },
}
