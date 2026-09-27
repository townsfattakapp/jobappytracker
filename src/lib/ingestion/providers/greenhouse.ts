import type { JobProvider, RawJob } from '../types'

/**
 * Greenhouse Job Board API (public, documented, intended for embedding a
 * company's own board): GET https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true
 * Config: { board: "gitlab" }.
 */
interface GreenhouseJob {
  id: number
  title: string
  content?: string
  absolute_url: string
  updated_at?: string
  first_published?: string
  location?: { name?: string }
  offices?: { name?: string; location?: string | null }[]
  departments?: { name?: string }[]
  requisition_id?: string | null
}

export const greenhouseProvider: JobProvider = {
  id: 'greenhouse',
  label: 'Greenhouse job board',
  configHelp: 'config.board = the board token from the company careers URL (job-boards.greenhouse.io/<board>); config.hostedApply = true sends applicants to the Greenhouse-hosted job page instead of the company page when the latter is unreliable.',
  async fetchJobs(source, ctx) {
    const board = String(source.config.board || '').trim()
    const hostedApply = source.config.hostedApply === true
    if (!/^[a-z0-9-]+$/i.test(board)) throw new Error('Greenhouse source needs config.board (letters, digits, dashes)')
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`
    ctx.log(`GET ${url}`)
    const res = await ctx.fetch(url, { headers: { accept: 'application/json', 'user-agent': 'JobAppy-ingestion/1.0 (+https://prep.evolw.in)' } })
    if (!res.ok) throw new Error(`Greenhouse responded ${res.status} for board ${board}`)
    const body = (await res.json()) as { jobs?: GreenhouseJob[] }
    const jobs = Array.isArray(body.jobs) ? body.jobs : []
    ctx.log(`${jobs.length} listings on board ${board}`)
    return jobs.map<RawJob>((j) => ({
      externalId: String(j.id),
      title: j.title,
      descriptionHtml: j.content || '',
      location: j.location?.name || null,
      locations: (j.offices || []).map((o) => o.name || '').filter(Boolean),
      department: (j.departments || []).map((d) => d.name).filter(Boolean).join(', ') || null,
      postedAt: j.first_published || null,
      updatedAt: j.updated_at || null,
      sourceUrl: j.absolute_url,
      applyUrl: hostedApply ? `https://job-boards.greenhouse.io/${encodeURIComponent(board)}/jobs/${encodeURIComponent(String(j.id))}` : j.absolute_url,
      raw: { requisitionId: j.requisition_id || null, offices: (j.offices || []).map((o) => o.name), departments: (j.departments || []).map((d) => d.name) },
    }))
  },
}
