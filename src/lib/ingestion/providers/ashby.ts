import type { JobProvider, RawJob } from '../types'

/**
 * Ashby Job Board API (public, documented): GET https://api.ashbyhq.com/posting-api/job-board/{board}
 * Config: { board: "ashby" }.
 */
interface AshbyJob {
  id: string
  title: string
  department?: string
  team?: string
  employmentType?: string
  location?: string
  secondaryLocations?: { location?: string; address?: { postalAddress?: { addressCountry?: string; addressLocality?: string } } }[]
  publishedAt?: string
  isListed?: boolean
  isRemote?: boolean
  workplaceType?: string
  address?: { postalAddress?: { addressCountry?: string; addressLocality?: string; addressRegion?: string } }
  jobUrl: string
  applyUrl?: string
  descriptionHtml?: string
  descriptionPlain?: string
}

export const ashbyProvider: JobProvider = {
  id: 'ashby',
  label: 'Ashby job board',
  configHelp: 'config.board = the board name from jobs.ashbyhq.com/<board>.',
  async fetchJobs(source, ctx) {
    const board = String(source.config.board || '').trim()
    if (!/^[a-z0-9-]+$/i.test(board)) throw new Error('Ashby source needs config.board (letters, digits, dashes)')
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`
    ctx.log(`GET ${url}`)
    const res = await ctx.fetch(url, { headers: { accept: 'application/json', 'user-agent': 'JobAppy-ingestion/1.0 (+https://prep.evolw.in)' } })
    if (!res.ok) throw new Error(`Ashby responded ${res.status} for board ${board}`)
    const body = (await res.json()) as { jobs?: AshbyJob[] }
    const jobs = (Array.isArray(body.jobs) ? body.jobs : []).filter((j) => j.isListed !== false)
    ctx.log(`${jobs.length} listed jobs on board ${board}`)
    return jobs.map<RawJob>((j) => {
      const countries = [j.address?.postalAddress?.addressCountry, ...(j.secondaryLocations || []).map((s) => s.address?.postalAddress?.addressCountry)].filter((c): c is string => Boolean(c))
      const wp = (j.workplaceType || '').toLowerCase()
      return {
        externalId: j.id,
        title: j.title,
        descriptionHtml: j.descriptionHtml || '',
        descriptionText: j.descriptionPlain || null,
        location: j.location || null,
        locations: (j.secondaryLocations || []).map((s) => s.location || '').filter(Boolean),
        countries,
        workplaceType: j.isRemote || wp === 'remote' ? 'remote' : wp === 'hybrid' ? 'hybrid' : wp === 'onsite' ? 'onsite' : null,
        employmentType: j.employmentType || null,
        department: j.department || j.team || null,
        postedAt: j.publishedAt || null,
        updatedAt: null,
        sourceUrl: j.jobUrl,
        applyUrl: j.applyUrl || j.jobUrl,
        raw: { department: j.department || null, team: j.team || null, isRemote: Boolean(j.isRemote), employmentType: j.employmentType || null },
      }
    })
  },
}
