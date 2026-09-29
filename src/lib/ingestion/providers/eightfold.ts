import type { JobProvider, RawJob } from '../types'
import { epochSecondsToIso, fetchJson, hostToken, mapConcurrent, positiveInt, sleep, workLocationOption } from './shared'

/**
 * Eightfold-hosted careers sites (Microsoft, Netflix and others). Two API
 * flavours exist and both are what the site's own search page calls, not a
 * documented public API:
 *   pcsx      GET https://{host}/api/pcsx/search?domain=&query=&location=&start=&num=10  → data.positions / data.count
 *             GET https://{host}/api/pcsx/position_details?position_id=&domain=&hl=en   → data.jobDescription …
 *   apply-v2  GET https://{host}/api/apply/v2/jobs?domain=&query=&location=&start=&num=10 → positions / count
 *             GET https://{host}/api/apply/v2/jobs/{id}?domain=                          → job_description …
 * Pages hold at most 10 positions and the description only comes from the
 * detail call, so runs are capped per search (config.maxPerSearch) and the
 * sites answer bursts with 429, so requests go a few at a time with retries.
 * Config: { host, domain, api: 'pcsx' | 'apply-v2', searches?: [{ query, location }], maxPerSearch?, concurrency?, requestIntervalMs? }.
 */
interface EightfoldPosition {
  id: number | string
  name?: string
  displayJobId?: string | number
  display_job_id?: string | number
  atsJobId?: string
  ats_job_id?: string
  location?: string
  locations?: string[]
  standardizedLocations?: string[]
  department?: string
  business_unit?: string
  postedTs?: number
  creationTs?: number
  t_create?: number
  t_update?: number
  workLocationOption?: string
  work_location_option?: string
  locationFlexibility?: string | null
  location_flexibility?: string | null
  positionUrl?: string
  publicUrl?: string
  canonicalPositionUrl?: string
  jobDescription?: string
  job_description?: string
  efcustomTextEmploymentType?: string
  type?: string
}

export interface EightfoldSearch {
  query: string
  location: string
}

export const EIGHTFOLD_DEFAULT_SEARCHES: EightfoldSearch[] = [
  { query: '', location: 'India' },
  { query: 'software engineer', location: '' },
  { query: 'data scientist machine learning', location: '' },
]
const PAGE = 10

export function parseEightfoldToken(token: string): { host: string; domain: string; api: 'pcsx' | 'apply-v2' } {
  const [host, domain, api] = token.split('|').map((s) => s.trim())
  if (!host || !domain) throw new Error('Eightfold token must be "host|domain|api"')
  return { host: hostToken(host), domain: hostToken(domain), api: api === 'apply-v2' ? 'apply-v2' : 'pcsx' }
}

export function eightfoldSearchUrl(cfg: { host: string; domain: string; api: 'pcsx' | 'apply-v2' }, search: EightfoldSearch, start: number, num = PAGE): string {
  const q = `domain=${encodeURIComponent(cfg.domain)}&query=${encodeURIComponent(search.query)}&location=${encodeURIComponent(search.location)}&start=${start}&num=${num}`
  return cfg.api === 'pcsx' ? `https://${cfg.host}/api/pcsx/search?${q}&sort_by=relevance` : `https://${cfg.host}/api/apply/v2/jobs?${q}`
}

export function eightfoldDetailUrl(cfg: { host: string; domain: string; api: 'pcsx' | 'apply-v2' }, id: string | number): string {
  return cfg.api === 'pcsx' ? `https://${cfg.host}/api/pcsx/position_details?position_id=${encodeURIComponent(String(id))}&domain=${encodeURIComponent(cfg.domain)}&hl=en` : `https://${cfg.host}/api/apply/v2/jobs/${encodeURIComponent(String(id))}?domain=${encodeURIComponent(cfg.domain)}`
}

function unwrapSearch(api: 'pcsx' | 'apply-v2', body: unknown): { positions: EightfoldPosition[]; count: number } {
  const root = (api === 'pcsx' ? (body as { data?: unknown })?.data : body) as { positions?: EightfoldPosition[]; count?: number } | undefined
  if (!root || !Array.isArray(root.positions)) throw new Error(`Eightfold ${api} search response had no positions array`)
  return { positions: root.positions, count: Number(root.count) || root.positions.length }
}

function unwrapDetail(api: 'pcsx' | 'apply-v2', body: unknown): EightfoldPosition {
  const root = (api === 'pcsx' ? (body as { data?: unknown })?.data : body) as EightfoldPosition | undefined
  if (!root || typeof root !== 'object') throw new Error(`Eightfold ${api} detail response was empty`)
  return root
}

export const eightfoldProvider: JobProvider = {
  id: 'eightfold',
  label: 'Eightfold careers site (unofficial JSON)',
  configHelp: 'config.host = the careers site host (apply.careers.microsoft.com), config.domain = the Eightfold domain parameter (microsoft.com), config.api = pcsx or apply-v2; optional config.searches [{ query, location }], config.maxPerSearch, config.concurrency, config.requestIntervalMs (minimum time between requests, including retries).',
  async fetchJobs(source, ctx) {
    const intervalMs = Math.max(0, Math.min(30_000, Number(source.config.requestIntervalMs) || 0))
    const originalFetch = ctx.fetch
    let nextRequest = Promise.resolve()
    let lastStarted = 0
    let accessDenied = false
    // Serialize request starts, not responses; retry attempts use the same limiter.
    ctx = { ...ctx, fetch: async (input, init) => {
      const slot = nextRequest.then(async () => {
        if (accessDenied) throw new Error('Eightfold scan stopped after HTTP 403; remaining requests deferred')
        const wait = lastStarted + intervalMs - Date.now()
        if (wait > 0) await sleep(wait)
        if (accessDenied) throw new Error('Eightfold scan stopped after HTTP 403; remaining requests deferred')
        lastStarted = Date.now()
      })
      nextRequest = slot.catch(() => {})
      await slot
      const response = await originalFetch(input, init)
      if (response.status === 403) accessDenied = true
      return response
    } }
    const incomplete = (reason: string) => {
      ctx.log(reason)
      ctx.reportIncomplete?.(reason)
    }
    const cfg = { host: hostToken(source.config.host), domain: hostToken(source.config.domain), api: source.config.api === 'apply-v2' ? ('apply-v2' as const) : ('pcsx' as const) }
    const searches: EightfoldSearch[] = (Array.isArray(source.config.searches) && source.config.searches.length ? source.config.searches : EIGHTFOLD_DEFAULT_SEARCHES).map((s: unknown) => ({ query: String((s as EightfoldSearch)?.query ?? ''), location: String((s as EightfoldSearch)?.location ?? '') }))
    const maxPerSearch = positiveInt(source.config.maxPerSearch, 200, 3000)
    // The sites rate-limit bursts (HTTP 429), so pages and details are fetched a few at a time.
    const concurrency = positiveInt(source.config.concurrency, 3, 8)
    const seen = new Map<string, EightfoldPosition>()
    for (const search of searches) {
      if (accessDenied) {
        incomplete('Eightfold search deferred after HTTP 403')
        break
      }
      const first = unwrapSearch(cfg.api, await fetchJson(ctx, eightfoldSearchUrl(cfg, search, 0), {}, `Eightfold search ${cfg.host}`))
      const total = Math.min(first.count, maxPerSearch)
      if (first.count > maxPerSearch) incomplete(`Eightfold search "${search.query}" location "${search.location}" capped at ${maxPerSearch} of ${first.count} positions`)
      const starts: number[] = []
      for (let start = PAGE; start < total; start += PAGE) starts.push(start)
      const pages = await mapConcurrent(starts, concurrency, async (start) => {
        if (accessDenied) throw new Error('Eightfold search page deferred after HTTP 403')
        return unwrapSearch(cfg.api, await fetchJson(ctx, eightfoldSearchUrl(cfg, search, start), {}, `Eightfold search ${cfg.host} (start ${start})`)).positions
      })
      if (pages.failures.length) incomplete(`${pages.failures.length} search page(s) failed: ${pages.failures.slice(0, 3).map((f) => f.error).join(' · ')}`)
      const positions = [first.positions, ...pages.results].flat().slice(0, total)
      if (!pages.failures.length && positions.length < total) incomplete(`Eightfold search returned ${positions.length} of ${total} expected positions`)
      let taken = 0
      for (const p of positions) {
        const id = String(p.id ?? '').trim()
        if (!id || !p.name || seen.has(id)) continue
        seen.set(id, p)
        taken += 1
      }
      ctx.log(`Eightfold ${cfg.host} query "${search.query}" location "${search.location}": ${first.count} position(s), ${taken} new (cap ${maxPerSearch})${pages.failures.length ? `, ${pages.failures.length} page(s) failed` : ''}`)
    }
    const details = await mapConcurrent(Array.from(seen.values()), concurrency, async (p) => {
      if (accessDenied) throw new Error('Eightfold detail deferred after HTTP 403')
      const detail = unwrapDetail(cfg.api, await fetchJson(ctx, eightfoldDetailUrl(cfg, p.id), {}, `Eightfold detail ${p.id}`))
      if (String(detail.id) !== String(p.id)) throw new Error(`Eightfold detail ${p.id} returned a missing or mismatched id`)
      return detail
    })
    if (details.failures.length) incomplete(`${details.failures.length} detail call(s) failed: ${details.failures.slice(0, 3).map((f) => f.error).join(' · ')}`)
    const byId = new Map(details.results.map((d) => [String(d.id), d]))
    const out: RawJob[] = []
    for (const p of seen.values()) {
      const d = byId.get(String(p.id)) ?? p
      const description = d.jobDescription || d.job_description || ''
      if (!description) {
        if (byId.has(String(p.id))) incomplete(`Eightfold detail ${p.id} returned no description`)
        continue
      }
      const locations = Array.from(new Set([...(p.locations || []), ...(d.locations || []), ...(p.standardizedLocations || [])].filter(Boolean)))
      const primary = d.location || p.location || locations[0] || null
      const publicUrl = d.publicUrl || d.canonicalPositionUrl || p.canonicalPositionUrl || null
      const relative = d.positionUrl || p.positionUrl || null
      const sourceUrl = publicUrl && /^https?:\/\//.test(publicUrl) ? publicUrl : relative ? `https://${cfg.host}${relative.startsWith('/') ? '' : '/'}${relative}` : `https://${cfg.host}/careers/job/${p.id}`
      out.push({
        externalId: String(p.id),
        title: (d.name || p.name || '').trim(),
        descriptionHtml: description,
        location: primary,
        locations: locations.filter((l) => l !== primary),
        countries: [],
        workplaceType: workLocationOption(d.workLocationOption || d.work_location_option || p.workLocationOption || p.work_location_option || d.locationFlexibility || d.location_flexibility),
        employmentType: d.efcustomTextEmploymentType || d.type || null,
        department: d.department || p.department || d.business_unit || p.business_unit || null,
        postedAt: epochSecondsToIso(d.postedTs || p.postedTs || d.t_create || p.t_create || d.creationTs || p.creationTs),
        updatedAt: epochSecondsToIso(d.t_update || p.t_update),
        sourceUrl,
        applyUrl: sourceUrl,
        raw: { displayJobId: String(d.displayJobId || d.display_job_id || d.atsJobId || d.ats_job_id || ''), api: cfg.api, workLocationOption: d.workLocationOption || d.work_location_option || null },
      })
    }
    ctx.log(`${out.length} Eightfold listings with descriptions from ${cfg.host}`)
    return out
  },
}
