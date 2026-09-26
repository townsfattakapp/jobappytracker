import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { ValidationError } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { resolveAccess } from '../../../../lib/server/entitlements'
import { abandonSession, attachAiSummary, completeSession, getSession, recordPlanAdded, rephraseFollowUp, submitTurn, toSessionDto } from '../../../../lib/server/interviews'
import { coachSummary, refineFollowUp } from '../../../../lib/server/aiEnrich'
import type { TurnRecord } from '../../../../lib/interview/jobInterview'
import { logEvent } from '../../../../lib/server/log'

export const dynamic = 'force-dynamic'

/** One interview session (owner only; anyone else gets 404). Historical sessions stay readable after the job expires. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    const row = await getSession(db, access.userId, id)
    if (!row) {
      logEvent('warn', 'security.interview_ownership', { userId: access.userId, sessionId: id })
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }
    return NextResponse.json({ session: toSessionDto(row) })
  } catch (error) {
    return errorResponse(error, 'GET /api/interviews/[id]')
  }
}

/** Body: { action: 'turn', questionId, kind: 'answer'|'skip', text?, code?, language?, diagram? } | { action: 'complete' } | { action: 'abandon' } | { action: 'plan_added', taskCount }. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const access = await resolveAccess()
    if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const { id } = await ctx.params
    const owned = await getSession(db, access.userId, id)
    if (!owned) {
      logEvent('warn', 'security.interview_ownership', { userId: access.userId, sessionId: id })
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }
    const body = (await readJson(req)) as Record<string, unknown>
    if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object')
    const now = new Date()
    switch (body.action) {
      case 'turn': {
        let row = await submitTurn(db, access.userId, id, { questionId: String(body.questionId ?? ''), kind: body.kind === 'skip' ? 'skip' : 'answer', text: typeof body.text === 'string' ? body.text : '', code: typeof body.code === 'string' ? body.code : null, language: typeof body.language === 'string' ? body.language : null, diagram: typeof body.diagram === 'string' ? body.diagram : null }, now)
        const dto = toSessionDto(row, now)
        const next = dto.next
        if (next.type === 'follow_up' && dto.entitlements.adaptive) {
          // Deterministic intent and wording are already stored; the gateway may only rephrase.
          const turns = row.turns as TurnRecord[]
          const answerTurn = [...turns].reverse().find((t) => t.questionId === next.question.id && t.role === 'candidate')
          const note = await refineFollowUp(access.userId, next.question, answerTurn?.text ?? '', { intent: next.intent, prompt: next.prompt })
          if (note) row = (await rephraseFollowUp(db, access.userId, id, note.text, now)) ?? row
        }
        return NextResponse.json({ session: toSessionDto(row, now) })
      }
      case 'complete': {
        let row = await completeSession(db, access.userId, id, now)
        const report = row.report as { aiSummary?: unknown; detailed?: boolean } | null
        if (report && report.detailed && !report.aiSummary) {
          const note = await coachSummary(access.userId, row.report as never, (row.jobSnapshot as { title: string }).title)
          if (note) row = (await attachAiSummary(db, access.userId, id, note, now)) ?? row
        }
        return NextResponse.json({ session: toSessionDto(row, now) })
      }
      case 'abandon':
        return NextResponse.json({ session: toSessionDto(await abandonSession(db, access.userId, id, now), now) })
      case 'plan_added':
        if (!access.can('interview.curriculumMapping')) return NextResponse.json({ error: 'Weakness mapping is not included in your plan.', code: 'upgrade', feature: 'interview.curriculumMapping' }, { status: 402 })
        return NextResponse.json({ session: toSessionDto(await recordPlanAdded(db, access.userId, id, Number(body.taskCount) || 0, now), now) })
      default:
        throw new ValidationError('Unsupported action', 'action')
    }
  } catch (error) {
    return errorResponse(error, 'POST /api/interviews/[id]')
  }
}
