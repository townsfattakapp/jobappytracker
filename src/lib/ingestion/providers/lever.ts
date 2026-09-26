import type { JobProvider, RawJob } from '../types'

/**
 * Lever Postings API (public JSON feed of a company's published postings):
 * GET https://api.lever.co/v0/postings/{site}?mode=json
 * Config: { site: "acme" }.
 */
interface LeverPosting {
  id: string
  text: string
  categories?: { location?: string; team?: string; department?: string; commitment?: string; allLocations?: string[] }
  workplaceType?: string
  country?: string
  createdAt?: number
  updatedAt?: number
  hostedUrl: string
  applyUrl?: string
  descriptionPlain?: string
  description?: string
  lists?: { text: string; content: string }[]
  additionalPlain?: string
}

export const leverProvider: JobProvider = {
  id: 'lever',
  label: 'Lever postings feed',
  configHelp: 'config.site = the company slug from jobs.lever.co/<site>.',
  async fetchJobs(source, ctx) {
    const site = String(source.config.site || '').trim()
    if (!/^[a-z0-9-]+$/i.test(site)) throw new Error('Lever source needs config.site (letters, digits, dashes)')
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`
    ctx.log(`GET ${url}`)
    const res = await ctx.fetch(url, { headers: { accept: 'application/json', 'user-agent': 'JobAppy-ingestion/1.0 (+https://prep.evolw.in)' } })
    if (!res.ok) throw new Error(`Lever responded ${res.status} for site ${site}`)
    const body = (await res.json()) as LeverPosting[]
    const postings = Array.isArray(body) ? body : []
    ctx.log(`${postings.length} postings for ${site}`)
    return postings.map<RawJob>((p) => {
      const lists = (p.lists || []).map((l) => `${l.text}\n${l.content}`).join('\n')
      const workplace = (p.workplaceType || '').toLowerCase()
      return {
        externalId: p.id,
        title: p.text,
        descriptionHtml: [p.description || '', lists, p.additionalPlain || ''].filter(Boolean).join('\n'),
        descriptionText: p.descriptionPlain ? [p.descriptionPlain, (p.lists || []).map((l) => `${l.text}\n${l.content.replace(/<[^>]+>/g, ' ')}`).join('\n'), p.additionalPlain || ''].filter(Boolean).join('\n') : null,
        location: p.categories?.location || null,
        locations: p.categories?.allLocations || [],
        countries: p.country ? [p.country] : [],
        workplaceType: workplace === 'remote' ? 'remote' : workplace === 'hybrid' ? 'hybrid' : workplace === 'on-site' || workplace === 'onsite' ? 'onsite' : null,
        employmentType: p.categories?.commitment || null,
        department: p.categories?.team || p.categories?.department || null,
        postedAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
        sourceUrl: p.hostedUrl,
        applyUrl: p.applyUrl || p.hostedUrl,
        raw: { team: p.categories?.team || null, commitment: p.categories?.commitment || null, workplaceType: p.workplaceType || null },
      }
    })
  },
}
