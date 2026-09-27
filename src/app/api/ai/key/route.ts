import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { addUserAiKey, deleteUserAiKey, isProvider, listUserAiKeys, MAX_KEYS_PER_USER, PROVIDERS, validateProviderKey } from '../../../../lib/server/aiKeys'

export const dynamic = 'force-dynamic'

/**
 * The learner's own AI provider keys: stored encrypted, shown only by their last characters. Several keys of ONE
 * provider form a pool the gateway rotates through when a key is rate limited (e.g. Groq free-tier keys from two
 * accounts). `key` mirrors the first key for older clients.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const keys = await listUserAiKeys(session.user.id)
  return NextResponse.json({
    key: keys[0] ? { provider: keys[0].provider, hint: keys[0].hint } : null,
    provider: keys[0]?.provider ?? null,
    keys,
    maxKeys: MAX_KEYS_PER_USER,
    providers: Object.fromEntries(Object.entries(PROVIDERS).map(([id, p]) => [id, { label: p.label, consoleUrl: p.consoleUrl }])),
  })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { provider?: unknown; key?: unknown; label?: unknown } | null
  const provider = body?.provider
  const key = typeof body?.key === 'string' ? body.key.trim() : ''
  const label = typeof body?.label === 'string' ? body.label.trim().slice(0, 60) || null : null
  if (!isProvider(provider)) return NextResponse.json({ error: 'Choose Groq, OpenAI, Google Gemini, Mistral or OpenRouter.' }, { status: 400 })
  if (!key) return NextResponse.json({ error: 'Paste your API key.' }, { status: 400 })
  if (key.length > 400) return NextResponse.json({ error: 'That key is too long.' }, { status: 400 })

  const check = await validateProviderKey(provider, key)
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })

  try {
    const saved = await addUserAiKey(session.user.id, provider, key, label)
    return NextResponse.json({ key: { provider, hint: saved.added.hint }, added: saved.added, keys: saved.keys, replacedProvider: saved.replacedProvider, verified: check.verified })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the key.' }, { status: 400 })
  }
}

/** DELETE removes every key; DELETE ?id=<keyId> removes one key of the pool. */
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id') || undefined
  await deleteUserAiKey(session.user.id, id)
  return NextResponse.json({ ok: true, keys: await listUserAiKeys(session.user.id) })
}
