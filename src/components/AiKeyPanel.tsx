import { useEffect, useState } from 'react'
import { invalidateAiStatus } from '../lib/aiGatewayClient'

interface AiKeyPanelProps {
  signedIn: boolean
  onSignIn: () => void
  onToast: (message: string) => void
}

type Provider = 'groq' | 'openai' | 'gemini' | 'mistral' | 'openrouter'

const PROVIDER_META: Record<Provider, { label: string; placeholder: string; consoleUrl: string; blurb: string }> = {
  groq: { label: 'Groq', placeholder: 'gsk_…', consoleUrl: 'https://console.groq.com/keys', blurb: 'Free tier, very fast. Recommended to start.' },
  gemini: { label: 'Google Gemini', placeholder: 'AIza…', consoleUrl: 'https://aistudio.google.com/app/apikey', blurb: 'Free tier available; Gemini Flash models.' },
  mistral: { label: 'Mistral', placeholder: 'API key', consoleUrl: 'https://console.mistral.ai/api-keys', blurb: 'European provider; Mistral Small.' },
  openrouter: { label: 'OpenRouter', placeholder: 'sk-or-…', consoleUrl: 'https://openrouter.ai/keys', blurb: 'One key for many models.' },
  openai: { label: 'OpenAI', placeholder: 'sk-…', consoleUrl: 'https://platform.openai.com/api-keys', blurb: 'Pay as you go; GPT-4o mini is inexpensive.' },
}

/** Settings block: the learner's own AI key, stored encrypted on their account. */
export default function AiKeyPanel({ signedIn, onSignIn, onToast }: AiKeyPanelProps) {
  const [saved, setSaved] = useState<{ provider: Provider; hint: string } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [provider, setProvider] = useState<Provider>('groq')
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!signedIn) {
      setSaved(null)
      setLoaded(true)
      return
    }
    let cancelled = false
    fetch('/api/ai/key', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { key?: { provider: Provider; hint: string } | null } | null) => {
        if (cancelled) return
        setSaved(data?.key ?? null)
        if (data?.key) setProvider(data.key.provider)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [signedIn])

  const save = async () => {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/ai/key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, key }) })
      const data = (await res.json().catch(() => ({}))) as { error?: string; key?: { provider: Provider; hint: string }; verified?: boolean }
      if (!res.ok || !data.key) throw new Error(data.error || 'Could not save the key')
      setSaved(data.key)
      setKey('')
      invalidateAiStatus()
      onToast(data.verified ? `${PROVIDER_META[provider].label} key verified and saved` : `${PROVIDER_META[provider].label} key saved (could not verify it right now)`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the key')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Remove your AI key from this account? AI features stop until you add one again.')) return
    setBusy(true)
    try {
      await fetch('/api/ai/key', { method: 'DELETE' })
      setSaved(null)
      invalidateAiStatus()
      onToast('AI key removed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="surface rounded-2xl p-6 border border-border space-y-5">
      <div>
        <h2 className="text-xl font-bold border-b border-border pb-2 mb-3">Your AI key</h2>
        <p className="text-sm text-muted-foreground">
          AI lessons, examples, quizzes, the tutor, mock interviews and email analysis run on your own OpenAI or Groq account, so you control the spend and there are no shared limits. The key is encrypted at rest and only ever sent to the provider you chose.
        </p>
      </div>

      {!signedIn ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Sign in to add a key to your account. It then works on every device you use.</p>
          <button type="button" className="btn btn-primary" onClick={onSignIn}>
            Sign in
          </button>
        </div>
      ) : (
        <>
          {loaded && saved && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm">
                <span className="font-semibold text-emerald-500">Connected:</span> {PROVIDER_META[saved.provider].label} key ending <code className="font-mono">{saved.hint}</code>
              </p>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => void remove()}>
                Remove key
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(PROVIDER_META) as Provider[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setProvider(id)}
                className={`text-left rounded-xl border p-3 transition-colors ${provider === id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                aria-pressed={provider === id}
              >
                <p className="font-semibold">{PROVIDER_META[id].label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{PROVIDER_META[id].blurb}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold" htmlFor="ai-key">
              {saved ? `Replace with a new ${PROVIDER_META[provider].label} key` : `${PROVIDER_META[provider].label} API key`}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="ai-key"
                type={show ? 'text' : 'password'}
                className="input-field font-mono text-sm sm:flex-1"
                placeholder={PROVIDER_META[provider].placeholder}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="btn btn-ghost" onClick={() => setShow((v) => !v)}>
                {show ? 'Hide' : 'Show'}
              </button>
              <button type="button" className="btn btn-primary" disabled={busy || !key.trim()} onClick={() => void save()}>
                {busy ? 'Checking…' : 'Save key'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create one at{' '}
              <a href={PROVIDER_META[provider].consoleUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {PROVIDER_META[provider].consoleUrl.replace('https://', '')}
              </a>
              . We check it with the provider before saving.
            </p>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
