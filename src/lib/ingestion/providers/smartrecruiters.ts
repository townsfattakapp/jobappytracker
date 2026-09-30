import type { JobProvider, RawJob } from '../types'
import { fetchJson, ISO2_COUNTRY, mapConcurrent, positiveInt } from './shared'

/**
 * SmartRecruiters Posting API (public, documented, no key needed; ServiceNow,
 * Swiggy, Freshworks, …):
 *   GET https://api.smartrecruiters.com/v1/companies/{company}/postings?limit=100&offset=N[&country=in] → totalFound, content[]
 *   GET https://api.smartrecruiters.com/v1/companies/{company}/postings/{id}                          → jobAd.sections
 * Every description needs one detail call, so the listed countries (India by
 * default) are read in full and the rest of the world is capped (config.maxGlobal).
 * Config: { company: "ServiceNow", countries?: ["in"], maxGlobal?, concurrency? }.
 */
interface SrPosting {
  id: string
  name?: string
  refNumber?: string
  releasedDate?: string
  location?: { city?: string; region?: string; country?: string; remote?: boolean; hybrid?: boolean; fullLocation?: string }
  department?: { label?: string }
  function?: { label?: string }
  typeOfEmployment?: { label?: string }
  experienceLevel?: { label?: string }
  company?: { identifier?: string; name?: string }
}

interface SrPage {
  totalFound?: number
  content?: SrPosting[]
}

interface SrDetail extends SrPosting {
  postingUrl?: string
  applyUrl?: string
  jobAd?: { sections?: Record<string, { title?: string; text?: string }> }
}

const PAGE = 100
/** Section order of a SmartRecruiters job ad; company blurb last so the role comes first. */
const SECTIONS = ['jobDescription', 'qualifications', 'additionalInformation', 'companyDescription']

export function smartRecruitersListUrl(company: string, offset: number, limit = PAGE, country?: string): string {
  return `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company)}/postings?limit=${limit}&offset=${offset}${country ? `&country=${encodeURIComponent(country)}` : ''}`
}

export const smartRecruitersProvider: JobProvider = {
  id: 'smartrecruiters',
  label: 'SmartRecruiters postings (public API)',
  configHelp: 'config.company = the company identifier from careers.smartrecruiters.com/<company> (case matters); optional config.countries (ISO alpha-2, default ["in"]), config.maxGlobal, config.concurrency.',
  async fetchJobs(source, ctx) {
    const company = String(source.config.company || '').trim()
    if (!/^[A-Za-z0-9_-]+$/.test(company)) throw new Error('SmartRecruiters source needs config.company (letters, digits, dashes, underscores)')
    const countries = (Array.isArray(source.config.countries) ? source.config.countries : ['in']).map((c) => String(c).toLowerCase()).filter((c) => /^[a-z]{2}$/.test(c))
    const maxGlobal = positiveInt(source.config.maxGlobal, 300, 3000)
    const concurrency = positiveInt(source.config.concurrency, 4, 8)
    const seen = new Map<string, SrPosting>()

    const readPages = async (country: string | undefined, cap: number, label: string) => {
      let offset = 0
      let total = 0
      let taken = 0
      do {
        const url = smartRecruitersListUrl(company, offset, Math.min(PAGE, cap - offset), country)
        const body = await fetchJson<SrPage>(ctx, url, { headers: { accept: 'application/json' } }, `SmartRecruiters ${company} list (${label}, offset ${offset})`)
        if (!Array.isArray(body.content)) throw new Error(`SmartRecruiters ${company} list response had no content array`)
        if (offset === 0) total = Number(body.totalFound) || body.content.length
        for (const p of body.content) {
          if (!p?.id || !p.name || seen.has(p.id)) continue
          seen.set(p.id, p)
          taken += 1
        }
        offset += PAGE
        if (!body.content.length) break
      } while (offset < Math.min(total, cap))
      ctx.log(`SmartRecruiters ${company} "${label}": ${total} posting(s), ${taken} new (cap ${cap})`)
      if (total > cap) ctx.reportIncomplete?.(`SmartRecruiters ${label} capped at ${cap}`)
    }
    for (const country of countries) await readPages(country, 3000, country.toUpperCase())
    await readPages(undefined, maxGlobal, 'worldwide')

    const details = await mapConcurrent(Array.from(seen.values()), concurrency, async (p) => {
      const detail = await fetchJson<SrDetail>(ctx, `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company)}/postings/${encodeURIComponent(p.id)}`, { headers: { accept: 'application/json' } }, `SmartRecruiters detail ${p.id}`)
      return { posting: p, detail }
    })
    if (details.failures.length) ctx.log(`${details.failures.length} detail call(s) failed: ${details.failures.slice(0, 3).map((f) => f.error).join(' · ')}`)

    const out: RawJob[] = []
    if (details.failures.length) ctx.reportIncomplete?.('SmartRecruiters detail pages failed')
    for (const { posting, detail } of details.results) {
      const sections = detail.jobAd?.sections || {}
      const html = SECTIONS.map((key) => {
        const s = sections[key]
        return s?.text?.trim() ? `${s.title ? `<h3>${s.title}</h3>` : ''}${s.text}` : ''
      })
        .filter(Boolean)
        .join('\n')
      if (!html) { ctx.reportIncomplete?.('SmartRecruiters detail missing description'); continue }
      const loc = detail.location || posting.location || {}
      const countryName = loc.country ? ISO2_COUNTRY[loc.country.toUpperCase()] : undefined
      const location = loc.fullLocation?.replace(/\s*,\s*,\s*/g, ', ').trim() || [loc.city, loc.region, countryName].filter(Boolean).join(', ') || null
      out.push({
        externalId: posting.id,
        title: (detail.name || posting.name || '').trim(),
        descriptionHtml: html,
        location,
        locations: [],
        countries: countryName ? [countryName] : [],
        workplaceType: loc.remote ? 'remote' : loc.hybrid ? 'hybrid' : loc.remote === false && loc.hybrid === false ? 'onsite' : null,
        employmentType: detail.typeOfEmployment?.label || posting.typeOfEmployment?.label || null,
        department: detail.department?.label || detail.function?.label || posting.department?.label || null,
        postedAt: detail.releasedDate || posting.releasedDate || null,
        updatedAt: null,
        sourceUrl: detail.postingUrl || `https://jobs.smartrecruiters.com/${encodeURIComponent(company)}/${encodeURIComponent(posting.id)}`,
        applyUrl: detail.applyUrl || null,
        raw: { refNumber: detail.refNumber || posting.refNumber || null, experienceLevel: detail.experienceLevel?.label || null, function: detail.function?.label || null, company: detail.company?.name || null },
      })
    }
    ctx.log(`${out.length} SmartRecruiters listings with descriptions from ${company}`)
    return out
  },
}
