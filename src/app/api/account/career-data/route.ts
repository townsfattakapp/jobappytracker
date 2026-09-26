import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { deleteLearnerCareerData } from '../../../../lib/server/accountData'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'

export const dynamic = 'force-dynamic'

/** Body: { confirm: 'DELETE' }. Removes the signed-in learner's resumes, analyses, outreach, preparations, job preferences and usage counters. */
export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.', code: 'sign_in' }, { status: 401 })
    const body = (await readJson(req).catch(() => ({}))) as { confirm?: string }
    if (body?.confirm !== 'DELETE') return NextResponse.json({ error: 'Send { "confirm": "DELETE" } to remove your Career OS data.' }, { status: 400 })
    return NextResponse.json({ deleted: await deleteLearnerCareerData(session.user.id) })
  } catch (error) {
    return errorResponse(error, 'DELETE /api/account/career-data')
  }
}
