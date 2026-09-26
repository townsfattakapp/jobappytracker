import type { JobProvider, RawJob } from '../types'
import { fetchJson, hostToken, mapConcurrent, positiveInt, WORKDAY_INDIA_COUNTRY_ID, workLocationOption } from './shared'

/**
 * Workday-hosted careers sites (Adobe, NVIDIA, Salesforce, PayPal, Autodesk,
 * Mastercard, …). The site's own search page calls
 *   POST https://{host}/wday/cxs/{tenant}/{site}/jobs  { appliedFacets, limit ≤ 20, offset, searchText } → jobPostings / total
 *   GET  https://{host}/wday/cxs/{tenant}/{site}{externalPath}                                             → jobPostingInfo
 * These endpoints are not a documented public API; the shape is validated and
 * a change surfaces as a failed run. Descriptions need one detail call per job,
 * so each search is capped (config.maxPerSearch).
 * Config: { host, tenant, site, searches?: [{ label, searchText?, appliedFacets? }], maxPerSearch?, concurrency? }.
 */
interface WorkdayPosting {
  title?: string
  externalPath?: string
  locationsText?: string
  postedOn?: string
  bulletFields?: string[]
}

interface WorkdayList {
  total?: number
  jobPostings?: WorkdayPosting[]
}

interface WorkdayInfo {
  id?: string
  title?: string
  jobDescription?: string
  location?: string
  additionalLocations?: string[]
  postedOn?: string
  startDate?: string
  timeType?: string
  jobReqId?: string
  jobPostingId?: string
  remoteType?: string
  country?: { descriptor?: string; id?: string }
  externalUrl?: string
}

export interface WorkdaySearch {
  label: string
  searchText?: string
  appliedFacets?: Record<string, string[]>
}

export const WORKDAY_DEFAULT_SEARCHES: WorkdaySearch[] = [
  { label: 'India (country facet)', appliedFacets: { locationCountry: [WORKDAY_INDIA_COUNTRY_ID] } },
  { label: 'India (text)', searchText: 'India' },
  { label: 'software engineering', searchText: 'software engineer' },
  { label: 'data and AI', searchText: 'data machine learning' },
]
const PAGE = 20

export function parseWorkdayToken(token: string): { host: string; tenant: string; site: string } {
  const [host, tenant, site] = token.split('/').map((s) => s.trim())
  if (!host || !tenant || !site) throw new Error('Workday token must be "host/tenant/site"')
  if (!/^[A-Za-z0-9_-]+$/.test(tenant) || !/^[A-Za-z0-9_-]+$/.test(site)) throw new Error('Workday tenant and site are letters, digits, dashes and underscores')
  return { host: hostToken(host), tenant, site }
}

export function workdayListRequest(cfg: { host: string; tenant: string; site: string }, search: WorkdaySearch, offset: number, limit = PAGE): { url: string; init: RequestInit } {
  return {
    url: `https://${cfg.host}/wday/cxs/${encodeURIComponent(cfg.tenant)}/${encodeURIComponent(cfg.site)}/jobs`,
    init: { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ appliedFacets: search.appliedFacets ?? {}, limit, offset, searchText: search.searchText ?? '' }) },
  }
}

export const workdayProvider: JobProvider = {
  id: 'workday',
  label: 'Workday careers site (unofficial JSON)',
  configHelp: 'config.host = the myworkdayjobs host (adobe.wd5.myworkdayjobs.com), config.tenant and config.site from the careers URL (/wday/cxs/{tenant}/{site}); optional config.searches, config.maxPerSearch, config.concurrency.',
  async fetchJobs(source, ctx) {
    const cfg = { host: hostToken(source.config.host), tenant: String(source.config.tenant || '').trim(), site: String(source.config.site || '').trim() }
    if (!/^[A-Za-z0-9_-]+$/.test(cfg.tenant) || !/^[A-Za-z0-9_-]+$/.test(cfg.site)) throw new Error('Workday source needs config.tenant and config.site (letters, digits, dashes, underscores)')
    const searches: WorkdaySearch[] = Array.isArray(source.config.searches) && source.config.searches.length ? (source.config.searches as WorkdaySearch[]).map((s) => ({ label: String(s.label || s.searchText || 'search'), searchText: s.searchText ? String(s.searchText) : undefined, appliedFacets: s.appliedFacets && typeof s.appliedFacets === 'object' ? s.appliedFacets : undefined })) : WORKDAY_DEFAULT_SEARCHES
    const maxPerSearch = positiveInt(source.config.maxPerSearch, 200, 3000)
    const concurrency = positiveInt(source.config.concurrency, 6, 12)
    const seen = new Map<string, WorkdayPosting>()
    for (const search of searches) {
      const first = workdayListRequest(cfg, search, 0)
      let page0: WorkdayList
      try {
        page0 = await fetchJson<WorkdayList>(ctx, first.url, first.init, `Workday ${cfg.tenant}/${cfg.site} list`)
      } catch (error) {
        // Tenants without that facet answer 400; the text searches still cover them.
        if (search.appliedFacets && Object.keys(search.appliedFacets).length && /responded 400/.test(error instanceof Error ? error.message : '')) {
          ctx.log(`Workday ${cfg.tenant}/${cfg.site} "${search.label}": facet not offered by this tenant (400), skipped`)
          continue
        }
        throw error
      }
      if (!Array.isArray(page0.jobPostings)) throw new Error(`Workday ${cfg.tenant}/${cfg.site} list response had no jobPostings array`)
      const total = Math.min(Number(page0.total) || page0.jobPostings.length, maxPerSearch)
      const offsets: number[] = []
      for (let offset = PAGE; offset < total; offset += PAGE) offsets.push(offset)
      const pages = await mapConcurrent(offsets, concurrency, async (offset) => {
        const req = workdayListRequest(cfg, search, offset)
        const body = await fetchJson<WorkdayList>(ctx, req.url, req.init, `Workday ${cfg.tenant}/${cfg.site} list (offset ${offset})`)
        return Array.isArray(body.jobPostings) ? body.jobPostings : []
      })
      let taken = 0
      for (const p of [page0.jobPostings, ...pages.results].flat()) {
        if (!p.externalPath || !p.title || seen.has(p.externalPath)) continue
        seen.set(p.externalPath, p)
        taken += 1
      }
      ctx.log(`Workday ${cfg.tenant}/${cfg.site} "${search.label}": ${page0.total ?? '?'} posting(s), ${taken} new (cap ${maxPerSearch})${pages.failures.length ? `, ${pages.failures.length} page(s) failed` : ''}`)
    }
    const details = await mapConcurrent(Array.from(seen.values()), concurrency, async (p) => {
      const body = await fetchJson<{ jobPostingInfo?: WorkdayInfo }>(ctx, `https://${cfg.host}/wday/cxs/${encodeURIComponent(cfg.tenant)}/${encodeURIComponent(cfg.site)}${p.externalPath}`, {}, `Workday detail ${p.externalPath}`)
      if (!body.jobPostingInfo) throw new Error(`no jobPostingInfo for ${p.externalPath}`)
      return { posting: p, info: body.jobPostingInfo }
    })
    if (details.failures.length) ctx.log(`${details.failures.length} detail call(s) failed: ${details.failures.slice(0, 3).map((f) => f.error).join(' · ')}`)
    const out: RawJob[] = []
    for (const { posting, info } of details.results) {
      if (!info.jobDescription) continue
      const externalId = (info.jobReqId || posting.bulletFields?.[0] || info.jobPostingId || posting.externalPath || '').toString().trim()
      if (!externalId) continue
      const country = info.country?.descriptor || null
      out.push({
        externalId,
        title: (info.title || posting.title || '').trim(),
        descriptionHtml: info.jobDescription,
        location: info.location || posting.locationsText || null,
        locations: (info.additionalLocations || []).filter(Boolean),
        countries: country ? [country] : [],
        workplaceType: workLocationOption(info.remoteType),
        employmentType: info.timeType || null,
        department: null,
        postedAt: info.startDate ? new Date(`${info.startDate}T00:00:00.000Z`).toISOString() : null,
        updatedAt: null,
        sourceUrl: info.externalUrl || `https://${cfg.host}/${encodeURIComponent(cfg.site)}${posting.externalPath}`,
        applyUrl: info.externalUrl || null,
        raw: { postedOn: info.postedOn || posting.postedOn || null, country, tenant: cfg.tenant, site: cfg.site },
      })
    }
    ctx.log(`${out.length} Workday listings with descriptions from ${cfg.tenant}/${cfg.site}`)
    return out
  },
}
