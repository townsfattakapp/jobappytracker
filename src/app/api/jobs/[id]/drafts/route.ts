import { NextResponse } from 'next/server'
import { buildDrafts, groundingFrom, MESSAGE_TYPES, type MessageType } from '../../../../../lib/jobs/networking'
import { ValidationError } from '../../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../../lib/server/apiErrors'
import { consumeUsage, isResponse, requireFeature } from '../../../../../lib/server/entitlements'
import { getJob } from '../../../../../lib/server/jobs'
import { currentResume, getAnalysisForJob } from '../../../../../lib/server/resumes'
import { refineDraft } from '../../../../../lib/server/aiEnrich'

export const dynamic = 'force-dynamic'

/**
 * Generates outreach drafts on the server from grounded facts only (the
 * resume never leaves it). Body: { types: MessageType[] }. Connection and
 * recruiter drafts need jobs.networkingBasic; the rest need jobs.referrals.
 * Each call counts one use against messageDraftsPerDay.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireFeature('jobs.networkingBasic')
    if (isResponse(access)) return access
    const { id } = await ctx.params
    const job = await getJob(id, { publicOnly: true })
    if (!job) return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 })
    const body = (await readJson(req)) as { types?: unknown }
    const requested = Array.isArray(body?.types) ? body.types.map(String) : []
    const types = requested.filter((t): t is MessageType => MESSAGE_TYPES.some((m) => m.id === t))
    if (!types.length) throw new ValidationError('Choose at least one message type', 'types')
    const premium = types.filter((t) => !MESSAGE_TYPES.find((m) => m.id === t)!.free)
    if (premium.length && !access.can('jobs.referrals')) return NextResponse.json({ error: 'Personalised referral, hiring-manager, follow-up and thank-you drafts are part of Prep Pro.', code: 'upgrade', feature: 'jobs.referrals' }, { status: 402 })
    const usage = await consumeUsage(access.userId!, 'jobs.drafts', access.limits.messageDraftsPerDay)
    if (!usage.allowed) return NextResponse.json({ error: `You have used today's ${usage.limit} message drafts. They reset at midnight UTC.`, code: 'limit', usage }, { status: 429 })
    const [resume, analysis] = await Promise.all([currentResume(access.userId!), getAnalysisForJob(access.userId!, id)])
    const grounding = groundingFrom(resume?.profile ?? null, analysis?.report ?? null, null)
    const drafts = buildDrafts(job, grounding, types)
    for (const draft of drafts.slice(0, 2)) {
      const note = await refineDraft(access.userId!, draft, job.title)
      draft.refined = note ? { text: note.text, provider: note.provider } : null
    }
    return NextResponse.json({ drafts, grounding, usage: { used: usage.used, limit: usage.limit }, resumeUsed: resume ? { id: resume.id, title: resume.title } : null })
  } catch (error) {
    return errorResponse(error, 'POST /api/jobs/[id]/drafts')
  }
}
