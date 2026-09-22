import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { deleteUserAiKey, getUserAiKeySummary, isProvider, PROVIDERS, setUserAiKey, validateProviderKey } from '../../../../lib/server/aiKeys'

export const dynamic = 'force-dynamic'

/** The learner's own AI provider key: stored encrypted, shown only by its last characters. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const key = await getUserAiKeySummary(session.user.id)
  return NextResponse.json({ key, providers: Object.fromEntries(Object.entries(PROVIDERS).map(([id, p]) => [id, { label: p.label, consoleUrl: p.consoleUrl }])) })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { provider?: unknown; key?: unknown } | null
  const provider = body?.provider
  const key = typeof body?.key === 'string' ? body.key.trim() : ''
  if (!isProvider(provider)) return NextResponse.json({ error: 'Choose Groq or OpenAI.' }, { status: 400 })
  if (!key) return NextResponse.json({ error: 'Paste your API key.' }, { status: 400 })
  if (key.length > 400) return NextResponse.json({ error: 'That key is too long.' }, { status: 400 })

  const check = await validateProviderKey(provider, key)
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })

  const saved = await setUserAiKey(session.user.id, provider, key)
  return NextResponse.json({ key: saved, verified: check.verified })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  await deleteUserAiKey(session.user.id)
  return NextResponse.json({ ok: true })
}
