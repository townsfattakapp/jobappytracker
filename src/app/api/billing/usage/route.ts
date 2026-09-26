import { NextResponse } from 'next/server'
import { LIMIT_KEYS } from '../../../../lib/entitlements/features'
import { errorResponse } from '../../../../lib/server/apiErrors'
import { resolveAccess, usageToday } from '../../../../lib/server/entitlements'

export const dynamic = 'force-dynamic'

/** Metered features: used today, the plan's limit and when it resets. Internal metrics are never exposed. */
const METERS: { key: string; limitKey: string; label: string; feature: string }[] = [
  { key: 'jobs.analysis', limitKey: 'analysesPerDay', label: 'Compatibility analyses', feature: 'jobs.matching' },
  { key: 'resume.analysis', limitKey: 'resumeAnalysesPerDay', label: 'Resume analyses', feature: 'jobs.resumeAnalysis' },
  { key: 'jobs.drafts', limitKey: 'messageDraftsPerDay', label: 'Networking drafts', feature: 'jobs.networkingBasic' },
  { key: 'jobs.prepPlans', limitKey: 'preparationPlansPerDay', label: 'Job preparation plans', feature: 'jobs.preparation' },
]

export async function GET() {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const now = new Date()
    const meters = await Promise.all(
      METERS.map(async (m) => ({
        key: m.key,
        label: m.label,
        used: await usageToday(access.userId!, m.key, now),
        limit: access.limits[m.limitKey] ?? 0,
        included: access.can(m.feature),
        resets: 'midnight UTC',
      })),
    )
    const feedLimit = LIMIT_KEYS.find((l) => l.key === 'jobFeed')
    return NextResponse.json({ plan: access.config.plan, meters, feed: { limit: access.limits.jobFeed ?? 0, label: feedLimit?.label ?? 'Jobs shown in the feed' }, resetsAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString() })
  } catch (error) {
    return errorResponse(error, 'GET /api/billing/usage')
  }
}
