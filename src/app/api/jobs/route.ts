import { NextResponse } from 'next/server'
import { rankJobs } from '../../../lib/jobs/relevance'
import { jobFreshness } from '../../../lib/jobs/normalize'
import type { JobListFilters } from '../../../lib/jobs/types'
import { errorResponse, pageParams } from '../../../lib/server/apiErrors'
import { resolveAccess } from '../../../lib/server/entitlements'
import { allPublicJobs, getPreferences, listJobsPublic } from '../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

/**
 * Learner job list. Only published, unexpired jobs are ever returned.
 *
 * Entitlements (resolved once through resolveAccess, never by plan name):
 *   jobs.discovery        – required to read the list at all
 *   jobs.advancedFilters  – level / employment-type filters; ignored otherwise
 *   jobs.personalizedFeed – preference ranking with reasons and the full feed;
 *                           otherwise newest-first, capped at limits.jobFeed
 */
export async function GET(req: Request) {
  try {
    const access = await resolveAccess()
    if (!access.config.flags.jobsModule) return NextResponse.json({ error: 'Job discovery is switched off right now.', code: 'disabled' }, { status: 503 })
    if (!access.can('jobs.discovery')) return NextResponse.json({ error: 'Job discovery is not available on this account.', code: 'upgrade' }, { status: 402 })
    const url = new URL(req.url)
    const { page, pageSize } = pageParams(url, 20)
    const advanced = access.can('jobs.advancedFilters')
    const filters: JobListFilters = {
      q: url.searchParams.get('q')?.trim() || undefined,
      roleCategory: url.searchParams.get('roleCategory') || undefined,
      region: (url.searchParams.get('region') as JobListFilters['region']) || '',
      workMode: (url.searchParams.get('workMode') as JobListFilters['workMode']) || '',
      level: advanced ? (url.searchParams.get('level') as JobListFilters['level']) || '' : '',
      employmentType: advanced ? (url.searchParams.get('employmentType') as JobListFilters['employmentType']) || '' : '',
      companyId: url.searchParams.get('companyId') || undefined,
    }
    const disabled = new Set(access.config.disabledRoleFamilies)
    const now = new Date()
    const prefs = access.userId ? await getPreferences(access.userId) : null
    const personalised = access.can('jobs.personalizedFeed') && url.searchParams.get('ranked') !== '0' && Boolean(prefs)

    if (personalised) {
      const all = (await allPublicJobs(filters)).filter((j) => !disabled.has(j.roleCategory))
      const ranked = rankJobs(all, prefs, now)
      const start = (page - 1) * pageSize
      const items = ranked.slice(start, start + pageSize).map((r) => ({ ...r.job, freshness: jobFreshness(r.job, now), relevance: r.relevance }))
      return NextResponse.json({ items, total: ranked.length, page, pageSize, personalised: true, hiddenByPreferences: all.length - ranked.length, tier: access.tier, beyondCap: 0, capped: false })
    }

    const cap = access.limits.jobFeed
    const result = await listJobsPublic({ ...filters, page, pageSize })
    let items = result.items.filter((j) => !disabled.has(j.roleCategory))
    let total = result.total
    let beyondCap = 0
    let capped = false
    if (cap > 0) {
      const offset = (page - 1) * pageSize
      const remaining = Math.max(0, cap - offset)
      if (items.length > remaining) items = items.slice(0, remaining)
      capped = result.total > cap
      beyondCap = Math.max(0, result.total - cap)
      total = Math.min(result.total, cap)
    }
    return NextResponse.json({
      ...result,
      items: items.map((j) => ({ ...j, freshness: jobFreshness(j, now), relevance: null })),
      total,
      personalised: false,
      hiddenByPreferences: 0,
      tier: access.tier,
      beyondCap,
      capped,
    })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs')
  }
}
