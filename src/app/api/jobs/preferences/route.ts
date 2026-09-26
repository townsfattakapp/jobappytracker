import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { parsePreferencesInput } from '../../../../lib/jobs/normalize'
import { errorResponse, readJson } from '../../../../lib/server/apiErrors'
import { getPreferences, savePreferences } from '../../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save job preferences.', code: 'sign_in' }, { status: 401 })
    return NextResponse.json({ preferences: await getPreferences(session.user.id) })
  } catch (error) {
    return errorResponse(error, 'GET /api/jobs/preferences')
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save job preferences.', code: 'sign_in' }, { status: 401 })
    const prefs = parsePreferencesInput(await readJson(req))
    return NextResponse.json({ preferences: await savePreferences(session.user.id, prefs) })
  } catch (error) {
    return errorResponse(error, 'PUT /api/jobs/preferences')
  }
}
