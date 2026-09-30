import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { request } from 'node:https'
import type { JobProvider, RawJob } from './types'

export type Discovery = { provider: string; adapter: string | null; config: Record<string, unknown>; status: 'NOT CONFIGURED' | 'SUPPORTED' | 'UNSUPPORTED' | 'PROTECTED' | 'REQUIRES MANUAL REVIEW'; note: string; checkedAt?: string }
const result = (provider: string, adapter: string | null = null, config: Record<string, unknown> = {}): Discovery => ({ provider, adapter, config, status: adapter ? 'NOT CONFIGURED' : 'UNSUPPORTED', note: 'URL detection only; extraction has not been verified.' })

/** Detect identities from official URLs; never guess a company's board token. */
export function detectCareerSource(value: string): Discovery {
  let u: URL
  try { u = new URL(value) } catch { return result('unsupported/protected') }
  const h = u.hostname.toLowerCase(), p = u.pathname.split('/').filter(Boolean)
  if (/^(boards|job-boards)\.greenhouse\.io$/.test(h)) {
    const board = p[0] === 'embed' ? u.searchParams.get('for') : p[0]
    return result('greenhouse', board ? 'greenhouse' : null, board ? { board } : {})
  }
  if (/^(boards|job-boards)\.eu\.greenhouse\.io$/.test(h)) return result('greenhouse')
  if (h === 'jobs.lever.co' && p[0]) return result('lever', 'lever', { site: p[0] })
  if (h === 'jobs.eu.lever.co') return result('lever')
  if (h === 'jobs.ashbyhq.com' && p[0]) return result('ashby', 'ashby', { board: p[0] })
  if (/^(careers|jobs)\.smartrecruiters\.com$/.test(h) && p[0]) return result('smartrecruiters', 'smartrecruiters', { company: p[0] })
  if (h.endsWith('.myworkdayjobs.com')) {
    const site = p.find((s) => !/^[a-z]{2}-[A-Z]{2}$/.test(s))
    return result('workday', site ? 'workday' : null, { host: h, tenant: h.split('.')[0], site, searches: [{ label: 'All public jobs' }] })
  }
  if (h.endsWith('.myworkdaysite.com')) return result('workday')
  const site = u.pathname.match(/\/CandidateExperience\/[^/]+\/sites\/([^/]+)/i)?.[1]
  if (site) return result('oraclecloud', 'oraclecloud', { host: h, site, searches: [{ label: 'All public jobs' }] })
  if (/oraclecloud\.com$|oracle\.com$|taleo\.net$/.test(h)) return result('oraclecloud')
  if (/successfactors\.(com|eu)$|successfactors\.com\.|successfactors\.jobs$/.test(h)) return result('successfactors')
  return result('static/server-rendered')
}

export class PublicAccessError extends Error {
  constructor(public status: Discovery['status'], message: string) { super(message) }
}
const blocked = (message: string): never => { throw new PublicAccessError('PROTECTED', message) }
const MAX_BYTES = 4_000_000
function publicIPv4(address: string): boolean {
  if (isIP(address) !== 4) return false // Conservative: IPv6-only origins need manual review.
  const [a, b] = address.split('.').map(Number)
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0, 168].includes(b)) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && [18, 19].includes(b)))
}
function validateUrl(value: string): URL {
  const u = new URL(value)
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || isIP(u.hostname) || !u.hostname.includes('.') || /(^|\.)(localhost|local|internal|linkedin\.com|google\.com)$/.test(u.hostname)) blocked('Only public HTTPS career sources are allowed')
  return u
}

/** Respect applicable robots groups; unknown/unavailable policies fail closed. */
export function robotsAllowed(body: string, path: string): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = []
  let group = { agents: [] as string[], rules: [] as { allow: boolean; path: string }[] }
  for (const line of body.split(/\r?\n/)) {
    const m = line.replace(/#.*$/, '').trim().match(/^(user-agent|allow|disallow)\s*:\s*(.*)$/i)
    if (!m) continue
    const key = m[1].toLowerCase(), value = m[2].trim()
    if (key === 'user-agent') {
      if (group.rules.length) { groups.push(group); group = { agents: [], rules: [] } }
      group.agents.push(value.toLowerCase())
    } else if (value) group.rules.push({ allow: key === 'allow', path: value })
  }
  groups.push(group)
  const specific = groups.filter((g) => g.agents.some((a) => a !== '*' && 'jobappy'.includes(a)))
  const selected = specific.length ? specific : groups.filter((g) => g.agents.includes('*'))
  const rules = selected.flatMap((g) => g.rules).filter((r) => new RegExp('^' + r.path.split('*').map((s) => s.replace(/[.+?^{}()|[\]\\]/g, '\\$&')).join('.*')).test(path)).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow))
  return rules[0]?.allow ?? true
}

/** No cookies/auth, browser automation or challenge retries. DNS is pinned to a checked public address. */
export function publicCareersFetch(fetchImpl: typeof fetch = fetch): typeof fetch {
  const policies = new Map<string, Promise<string>>()
  let stopped: unknown
  const read = async (u: URL, init?: RequestInit): Promise<Response> => {
    validateUrl(u.href)
    const headers = new Headers(init?.headers)
    headers.delete('authorization'); headers.delete('cookie')
    headers.set('user-agent', 'JobAppy/1.0 (+https://prep.evolw.in)')
    if (fetchImpl !== fetch) return fetchImpl(u.href, { ...init, headers, redirect: 'manual', signal: init?.signal ?? AbortSignal.timeout(10_000) })
    const addresses = await lookup(u.hostname, { all: true, family: 4 })
    if (!addresses.length || addresses.some((a) => !publicIPv4(a.address))) blocked('Non-public destination rejected')
    return new Promise<Response>((resolve, reject) => {
      const req = request(u, { method: init?.method ?? 'GET', headers: Object.fromEntries(headers), signal: init?.signal ?? AbortSignal.timeout(10_000), lookup: (_host, options, cb) => cb(null, options.all ? addresses : addresses[0].address, 4) }, (res) => {
        const chunks: Buffer[] = []; let size = 0
        res.on('data', (chunk: Buffer) => { size += chunk.length; if (size > MAX_BYTES) req.destroy(new Error('Public response exceeds size limit')); else chunks.push(chunk) })
        res.on('error', reject)
        res.on('end', () => resolve(new Response([204, 304].includes(res.statusCode ?? 200) ? null : Buffer.concat(chunks), { status: res.statusCode, headers: Object.fromEntries(Object.entries(res.headers).filter(([, v]) => v !== undefined).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])) })))
      })
      req.on('error', reject)
      req.end(typeof init?.body === 'string' ? init.body : undefined)
    })
  }
  const guarded = (async (input, init) => {
    let u = validateUrl(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    for (let redirects = 0; redirects < 5; redirects++) {
      if (!policies.has(u.origin)) policies.set(u.origin, (async () => {
        const r = await read(new URL('/robots.txt', u))
        if (r.status === 404 || r.status === 410) return ''
        if (!r.ok) blocked(`Robots policy unavailable (${r.status})`)
        const body = await r.text()
        if (/<html|captcha|access denied/i.test(body)) blocked('Robots policy is protected')
        return body
      })())
      if (!robotsAllowed(await policies.get(u.origin)!, u.pathname + u.search)) blocked('robots.txt disallows this URL')
      const r = await read(u, init)
      if ([401, 403, 429].includes(r.status)) blocked(`Public source returned ${r.status}; automated access stopped`)
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
        if (init?.method && init.method !== 'GET') blocked('Non-GET redirect requires manual review')
        u = validateUrl(new URL(r.headers.get('location')!, u).href); continue
      }
      const body = await r.text()
      if (body.length > MAX_BYTES) throw new Error('Public response exceeds size limit')
      if (/cf-chl-|g-recaptcha|hcaptcha|verify you are human|access denied|enable javascript and cookies to continue/i.test(body)) blocked('Public page contains an access challenge')
      const out = new Response([204, 304].includes(r.status) ? null : body, { status: r.status, headers: r.headers })
      Object.defineProperty(out, 'url', { value: u.href })
      return out
    }
    blocked('Redirect limit reached')
  }) as typeof fetch
  return (async (input, init) => {
    if (stopped) throw stopped
    try { return await guarded(input, init) } catch (error) {
      if (error instanceof PublicAccessError || error instanceof Error && /AbortError|TimeoutError/.test(error.name)) stopped = error
      throw error
    }
  }) as typeof fetch
}

const str = (v: unknown): string | null => typeof v === 'string' && v.trim() ? v.trim() : null
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' ? v as Record<string, unknown> : {}
const array = (v: unknown): unknown[] => Array.isArray(v) ? v : v ? [v] : []
export function structuredJobs(body: string, pageUrl: string): RawJob[] {
  const documents: unknown[] = []
  if (/^\s*[[{]/.test(body)) { try { documents.push(JSON.parse(body)) } catch { /* Not structured JSON. */ } }
  else for (const match of body.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) { try { documents.push(JSON.parse(match[1])) } catch { /* Other scripts are not data sources. */ } }
  const found: RawJob[] = []
  function visit(value: unknown) {
    if (Array.isArray(value)) { value.forEach(visit); return }
    const j = obj(value)
    if (array(j['@type']).includes('JobPosting')) {
      const title = str(j.title), description = str(j.description)
      if (!title || !description) return
      const url = new URL(str(j.url) ?? pageUrl, pageUrl)
      if (url.origin !== new URL(pageUrl).origin || url.protocol !== 'https:') return
      const addresses = array(j.jobLocation).map((l) => obj(obj(l).address))
      const countries = addresses.map((a) => str(a.addressCountry) ?? str(obj(a.addressCountry).name)).filter((s): s is string => !!s)
      const locations = addresses.map((a) => [str(a.addressLocality), str(a.addressRegion), str(a.addressCountry) ?? str(obj(a.addressCountry).name)].filter(Boolean).join(', ')).filter(Boolean)
      const identifier = obj(j.identifier).value ?? j.identifier
      found.push({ externalId: typeof identifier === 'number' ? String(identifier) : str(identifier) ?? url.href, title, descriptionHtml: description, location: locations[0] ?? null, locations, countries, workplaceType: j.jobLocationType === 'TELECOMMUTE' ? 'remote' : null, employmentType: array(j.employmentType).map(str).filter(Boolean).join(', ') || null, department: str(j.department), postedAt: str(j.datePosted), updatedAt: str(j.dateModified), sourceUrl: url.href, applyUrl: url.href, raw: { officialSource: true, requisitionId: typeof identifier === 'number' ? String(identifier) : str(identifier), company: str(obj(j.hiringOrganization).name), requirements: str(j.qualifications), preferredQualifications: str(j.preferredQualifications), skills: str(j.skills), validThrough: str(j.validThrough) } })
    } else for (const key of ['@graph', 'itemListElement', 'item', 'jobs']) if (j[key]) visit(j[key])
  }
  documents.forEach(visit)
  return found
}

export function careerLinks(html: string, base: string): string[] {
  return [...new Set([...html.matchAll(/<(?:a|iframe|link)\b[^>]*(?:href|src)\s*=\s*["']([^"']+)["']/gi)].flatMap((m) => {
    try { const u = new URL(m[1].replace(/&amp;/g, '&'), base); return u.protocol === 'https:' ? [u.href] : [] } catch { return [] }
  }))]
}

export async function discoverCareerSource(url: string, fetchImpl: typeof fetch = fetch): Promise<Discovery> {
  const detected = detectCareerSource(url)
  const safe = publicCareersFetch(fetchImpl)
  try {
    // Even recognisable ATS links must be publicly accessible before enabling extraction.
    const res = await safe(url)
    if (!res.ok) throw new Error(`Career page returned ${res.status}`)
    const body = await res.text(), base = res.url || url
    const redirected = detectCareerSource(base)
    let candidate = redirected.adapter ? redirected : detected
    if (!candidate.adapter) {
      const links = careerLinks(body, base).map((link) => ({ link, detection: detectCareerSource(link) })).filter((v) => v.detection.adapter)
      const identities = new Map(links.map((v) => [JSON.stringify(v.detection.config), v]))
      if (identities.size > 1) return { ...detected, status: 'REQUIRES MANUAL REVIEW', note: 'Multiple ATS board identities linked; company ownership needs review.' }
      if (identities.size === 1) candidate = [...identities.values()][0].detection
    }
    if (candidate.adapter) return { ...candidate, status: 'SUPPORTED', note: 'Public official careers page identifies this adapter; successful ingestion still required.', checkedAt: new Date().toISOString() }
    if (/successfactors|successfactors\.com|sapSF/i.test(body)) candidate = result('successfactors')
    if (structuredJobs(body, base).length) return { ...result(/^\s*[[{]/.test(body) ? 'custom/public careers API' : candidate.provider, 'public-careers', { url: base }), status: 'SUPPORTED', note: 'Public Schema.org JobPosting data found; only explicit public job data will be read.', checkedAt: new Date().toISOString() }
    // Explicit job links only, bounded same-origin traversal; never inspect JS bundles/private APIs.
    const pages = careerLinks(body, base).filter((link) => new URL(link).origin === new URL(base).origin && /\/(jobs?|careers?|positions?|openings?)\/.+/i.test(new URL(link).pathname)).slice(0, 20)
    for (const page of pages.slice(0, 3)) {
      const r = await safe(page)
      if (r.ok && structuredJobs(await r.text(), page).length) return { ...result(candidate.provider, 'public-careers', { url: base }), status: 'SUPPORTED', note: 'Public linked JobPosting pages found; bounded crawl cannot establish full inventory.', checkedAt: new Date().toISOString() }
    }
    return { ...candidate, status: 'UNSUPPORTED', note: 'No supported public feed or JobPosting data found. Official career URL retained.', checkedAt: new Date().toISOString() }
  } catch (error) {
    return { ...detected, status: error instanceof PublicAccessError ? error.status : 'REQUIRES MANUAL REVIEW', note: error instanceof Error ? error.message : String(error), checkedAt: new Date().toISOString() }
  }
}

export const publicCareersProvider: JobProvider = {
  id: 'public-careers', label: 'Public careers structured data', configHelp: '{ url: official careers page or public Schema.org JobPosting feed }',
  async fetchJobs(source, ctx) {
    const safe = source.config.officialSource === true ? ctx.fetch : publicCareersFetch(ctx.fetch)
    const url = String(source.config.url ?? source.baseUrl ?? '')
    const res = await safe(url)
    if (!res.ok) throw new Error(`Public careers responded ${res.status}`)
    const body = await res.text(), base = res.url || url
    const found = structuredJobs(body, base)
    const pages = careerLinks(body, base).filter((link) => new URL(link).origin === new URL(base).origin && /\/(jobs?|careers?|positions?|openings?)\/.+/i.test(new URL(link).pathname))
    for (const page of pages.slice(0, 20)) {
      try {
        const r = await safe(page)
        if (!r.ok) throw new Error(`Job page returned ${r.status}`)
        found.push(...structuredJobs(await r.text(), page))
      } catch (error) { ctx.reportIncomplete?.(error instanceof Error ? error.message : String(error)); if (error instanceof PublicAccessError) throw error }
    }
    // HTML navigation/structured markup cannot prove completeness; never expire unseen jobs from this crawl.
    if (pages.length > 20) ctx.reportIncomplete?.('Public page crawl reached its 20-page limit; unseen jobs retained')
    if (!found.length) throw new Error('No public JobPosting data found; previous jobs retained')
    return found
  },
}
