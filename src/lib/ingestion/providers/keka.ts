import type { JobProvider, RawJob } from '../types'
import { fetchJson, hostToken, ISO2_COUNTRY } from './shared'

/**
 * Keka career portals (Keka itself and many Indian companies that host their
 * careers page on {company}.keka.com). The portal's own embed widget calls
 *   GET https://{host}/careers/api/embedjobs/{portal}/active/{identifier}
 * which returns every open job with its full HTML description, locations,
 * department, type and experience in one response. Not a documented public
 * API; the shape is validated and a change surfaces as a failed run.
 * Config: { host, identifier, portal? } (identifier = the UUID in the careers page's embed script URL).
 */
interface KekaLocation {
  name?: string
  city?: string
  state?: string
  countryCode?: string
}

interface KekaJob {
  id?: number | string
  title?: string
  description?: string
  departmentName?: string
  jobLocations?: KekaLocation[]
  jobType?: string
  experience?: string
  jobNumber?: string
  publishedOn?: string
  skillNames?: string[]
}

const COUNTRY_ALIASES: Record<string, string> = { RP: 'Philippines' }

export function parseKekaToken(token: string): { host: string; identifier: string; portal: string } {
  const [host, identifier, portal] = token.split('/').map((s) => s.trim())
  if (!host || !identifier) throw new Error('Keka token must be "host/identifier[/portal]" (hr.keka.com/<uuid>)')
  if (!/^[a-f0-9-]{36}$/i.test(identifier)) throw new Error('Keka identifier is the 36-character UUID from the careers page embed script')
  return { host: hostToken(host), identifier, portal: portal && /^[a-z0-9_-]+$/i.test(portal) ? portal : 'default' }
}

export function kekaListUrl(cfg: { host: string; identifier: string; portal: string }): string {
  return `https://${cfg.host}/careers/api/embedjobs/${encodeURIComponent(cfg.portal)}/active/${encodeURIComponent(cfg.identifier)}`
}

export const kekaProvider: JobProvider = {
  id: 'keka',
  label: 'Keka career portal (unofficial JSON)',
  configHelp: 'config.host = the company careers host (hr.keka.com), config.identifier = the UUID in the careers page embed script URL; optional config.portal (default "default").',
  async fetchJobs(source, ctx) {
    const identifier = String(source.config.identifier || '').trim()
    if (!/^[a-f0-9-]{36}$/i.test(identifier)) throw new Error('Keka source needs config.identifier (the 36-character portal UUID)')
    const portal = String(source.config.portal || 'default').trim()
    if (!/^[a-z0-9_-]+$/i.test(portal)) throw new Error('Keka portal name is letters, digits, dashes and underscores')
    const cfg = { host: hostToken(source.config.host), identifier, portal }
    const url = kekaListUrl(cfg)
    ctx.log(`GET ${url}`)
    const body = await fetchJson<unknown>(ctx, url, { headers: { accept: 'application/json' } }, `Keka ${cfg.host} list`)
    if (!Array.isArray(body)) throw new Error(`Keka ${cfg.host} list response was not an array`)
    const jobs = body as KekaJob[]
    ctx.log(`${jobs.length} Keka listing(s) on ${cfg.host}`)
    const out: RawJob[] = []
    const seen = new Set<string>()
    for (const j of jobs) {
      const id = j?.id === undefined || j.id === null ? '' : String(j.id).trim()
      if (!id || !j.title || seen.has(id) || !j.description?.trim()) continue
      seen.add(id)
      const locations = (j.jobLocations || []).map((l) => [l.city || l.name, l.state, l.countryCode ? (ISO2_COUNTRY[l.countryCode.toUpperCase()] ?? COUNTRY_ALIASES[l.countryCode.toUpperCase()] ?? null) : null].filter(Boolean).join(', ')).filter(Boolean)
      const countries = Array.from(new Set((j.jobLocations || []).map((l) => (l.countryCode ? (ISO2_COUNTRY[l.countryCode.toUpperCase()] ?? COUNTRY_ALIASES[l.countryCode.toUpperCase()] ?? null) : null)).filter((c): c is string => Boolean(c))))
      const published = j.publishedOn ? new Date(j.publishedOn) : null
      out.push({
        externalId: id,
        title: j.title.trim(),
        descriptionHtml: j.description,
        location: locations[0] || null,
        locations: locations.slice(1),
        countries,
        workplaceType: /remote/i.test(locations.join(' ')) ? 'remote' : null,
        employmentType: j.jobType || null,
        department: j.departmentName || null,
        postedAt: published && !Number.isNaN(published.getTime()) ? published.toISOString() : null,
        updatedAt: null,
        sourceUrl: `https://${cfg.host}/careers/jobdetails/${encodeURIComponent(id)}`,
        applyUrl: null,
        raw: { experience: j.experience || null, jobNumber: j.jobNumber || null, skills: (j.skillNames || []).slice(0, 20) },
      })
    }
    ctx.log(`${out.length} Keka listings with descriptions from ${cfg.host}`)
    return out
  },
}
