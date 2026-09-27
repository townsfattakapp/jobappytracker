import { useEffect, useState } from 'react'
import type { AppUser } from '../../lib/cloudSync'
import { invalidateAiStatus } from '../../lib/aiGatewayClient'
import { AiProviderVector, CardWatermark } from './SettingsVectorArt'

export type AiProvider = 'groq' | 'openai' | 'gemini' | 'mistral' | 'openrouter'

interface KeySummary {
  id: string
  provider: AiProvider
  hint: string
  label: string | null
  status: 'active' | 'cooling' | 'invalid'
  cooldownUntil: string | null
  lastUsedAt: string | null
  lastError: string | null
  position: number
}

/** Provider facts shown to learners. Models match the gateway defaults in src/lib/ai/adapters.ts. */
export const PROVIDER_META: Record<
  AiProvider,
  { label: string; badge: string; placeholder: string; consoleUrl: string; models: string; blurb: string; freeTier: string; keyPrefix: string; steps: string[] }
> = {
  groq: {
    label: 'Groq Cloud',
    badge: 'Recommended · fastest',
    placeholder: 'gsk_••••••••••••••••••••••••',
    consoleUrl: 'https://console.groq.com/keys',
    models: 'GPT-OSS 120B · Qwen3 · Llama 3.3 70B',
    blurb: 'Very fast answers on a free tier. Good for DSA hints, code reviews and mock interviews.',
    freeTier: 'Free tier with daily token limits per account; add keys from more than one account and JobAppy switches automatically when one runs out.',
    keyPrefix: 'gsk_',
    steps: [
      'Open console.groq.com and sign in (Google or GitHub works). No card is needed for the free tier.',
      'In the left menu choose "API Keys", then "Create API Key".',
      'Give it a name such as "JobAppy" and click Submit.',
      'Copy the key that starts with gsk_ right away; Groq shows it only once.',
      'Paste it below and press Save & verify. To add a second account\'s key, repeat with that account and press Add another key.',
    ],
  },
  openai: {
    label: 'OpenAI',
    badge: 'Paid · strong reasoning',
    placeholder: 'sk-proj-••••••••••••••••••••',
    consoleUrl: 'https://platform.openai.com/api-keys',
    models: 'GPT-4o mini · GPT-4.1 mini',
    blurb: 'Consistent quality for architecture feedback and detailed code critiques.',
    freeTier: 'Pay as you go; new accounts may get trial credit. Usage is billed to your OpenAI account.',
    keyPrefix: 'sk-',
    steps: [
      'Open platform.openai.com, sign in and add a payment method under Settings → Billing (required before keys work).',
      'Go to "API keys" and click "Create new secret key".',
      'Choose a name and the default project, then Create.',
      'Copy the key starting with sk- immediately; it is shown once.',
      'Paste it below and press Save & verify.',
    ],
  },
  gemini: {
    label: 'Google Gemini',
    badge: 'Generous free tier',
    placeholder: 'AIza••••••••••••••••••••••••',
    consoleUrl: 'https://aistudio.google.com/app/apikey',
    models: 'Gemini 2.0 Flash · Gemini 1.5 Flash',
    blurb: 'Fast models with a large context window from Google AI Studio.',
    freeTier: 'Free tier with per-minute and per-day request limits; no card needed.',
    keyPrefix: 'AIza',
    steps: [
      'Open aistudio.google.com/app/apikey and sign in with a Google account.',
      'Click "Create API key" and pick (or create) a Google Cloud project when asked.',
      'Copy the key that starts with AIza.',
      'Paste it below and press Save & verify.',
    ],
  },
  mistral: {
    label: 'Mistral AI',
    badge: 'European provider',
    placeholder: '••••••••••••••••••••••••••••',
    consoleUrl: 'https://console.mistral.ai/api-keys',
    models: 'Mistral Small · Mistral NeMo',
    blurb: 'European open-weight models with strong coding ability.',
    freeTier: 'A free experiment tier exists (rate limited); paid plans lift the limits.',
    keyPrefix: '',
    steps: [
      'Open console.mistral.ai and sign in.',
      'Under Workspace → Billing choose the Experiment (free) or a paid plan.',
      'Go to "API Keys" and click "Create new key"; give it a name and, optionally, an expiry.',
      'Copy the key once it is shown.',
      'Paste it below and press Save & verify.',
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    badge: 'One key, many models',
    placeholder: 'sk-or-••••••••••••••••••••••',
    consoleUrl: 'https://openrouter.ai/keys',
    models: 'Llama 3.3 70B by default; any OpenRouter model can be configured',
    blurb: 'A single key for Claude, GPT, DeepSeek, Llama and 100+ open models.',
    freeTier: 'Some models are free with rate limits; others are billed to your OpenRouter credit balance.',
    keyPrefix: 'sk-or-',
    steps: [
      'Open openrouter.ai and sign in (Google, GitHub or e-mail).',
      'Optionally add credits under Credits; free models work without them.',
      'Go to "Keys" and click "Create Key"; a name and an optional spend limit are enough.',
      'Copy the key that starts with sk-or-.',
      'Paste it below and press Save & verify.',
    ],
  },
}

function cooldownText(iso: string | null): string {
  if (!iso) return ''
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'ready again'
  const minutes = Math.round(ms / 60_000)
  return minutes < 60 ? `back in ${minutes} min` : `back in ${Math.round(minutes / 60)} h`
}

/** Settings tab: the learner's own AI keys (bring your own key), with a pool of several keys per provider. */
export default function AiProvidersPanel({ user, onSignIn, onToast }: { user: AppUser | null; onSignIn: () => void; onToast: (message: string) => void }) {
  const [loaded, setLoaded] = useState(false)
  const [keys, setKeys] = useState<KeySummary[]>([])
  const [maxKeys, setMaxKeys] = useState(5)
  const [provider, setProvider] = useState<AiProvider>('groq')
  const [draft, setDraft] = useState('')
  const [label, setLabel] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stepsOpen, setStepsOpen] = useState(true)

  const savedProvider = keys[0]?.provider ?? null
  const meta = PROVIDER_META[provider]
  const switching = Boolean(savedProvider && savedProvider !== provider)

  useEffect(() => {
    if (!user) {
      setKeys([])
      setLoaded(true)
      return
    }
    let cancelled = false
    fetch('/api/ai/key', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { keys?: KeySummary[]; maxKeys?: number } | null) => {
        if (cancelled) return
        const list = data?.keys ?? []
        setKeys(list)
        if (data?.maxKeys) setMaxKeys(data.maxKeys)
        if (list[0]) setProvider(list[0].provider)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [user])

  const save = async () => {
    setError(null)
    if (switching && !window.confirm(`Switch from ${PROVIDER_META[savedProvider!].label} to ${meta.label}? Your ${PROVIDER_META[savedProvider!].label} key${keys.length > 1 ? 's' : ''} will be removed; JobAppy uses one provider per account.`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/ai/key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, key: draft, label: label.trim() || null }) })
      const data = (await res.json().catch(() => ({}))) as { error?: string; keys?: KeySummary[]; verified?: boolean; replacedProvider?: string | null }
      if (!res.ok || !data.keys) throw new Error(data.error || 'Could not verify and save the key.')
      setKeys(data.keys)
      setDraft('')
      setLabel('')
      invalidateAiStatus()
      onToast(data.verified ? `${meta.label} key verified and saved (${data.keys.length} in your pool)` : `${meta.label} key saved; it could not be verified right now`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the key.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id?: string) => {
    const message = id ? 'Remove this key from your pool?' : 'Remove all your AI keys? AI features pause until you add one again.'
    if (!window.confirm(message)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/ai/key${id ? `?id=${encodeURIComponent(id)}` : ''}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => ({}))) as { keys?: KeySummary[] }
      setKeys(data.keys ?? [])
      invalidateAiStatus()
      onToast(id ? 'Key removed' : 'All AI keys removed')
    } catch {
      onToast('Could not remove the key')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="surface p-6 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <CardWatermark variant="ai" />
        <div className="flex flex-col gap-2 z-10">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Bring your own key</span>
          <h2 className="text-xl font-bold text-foreground">AI providers</h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            The tutor, code reviews, system-design grading, mock-interview follow-ups and resume-versus-job insights run on your own API key. Keys are encrypted at rest and only ever sent to the provider you chose. Several keys of the same provider form a pool: when one is rate limited or out of quota, the next one is used automatically.
          </p>
        </div>
        <div className="hidden md:flex shrink-0 opacity-90 hover:opacity-100 transition-opacity z-10">
          <AiProviderVector />
        </div>
      </div>

      {!user ? (
        <div className="surface p-8 rounded-2xl border border-border text-center flex flex-col items-center gap-3">
          <div className="text-3xl">🔑</div>
          <h3 className="text-lg font-bold text-foreground">Sign in to connect your AI key</h3>
          <p className="text-sm text-muted-foreground max-w-md">Once saved to your profile, the key is encrypted and works on every device you use without re-entering it.</p>
          <button type="button" className="btn btn-primary text-sm px-6 mt-2" onClick={onSignIn}>
            Sign in to configure AI
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {loaded && keys.length > 0 && (
            <section className="surface p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col gap-3" aria-label="Your AI keys">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-400">Connected: {PROVIDER_META[savedProvider!].label}</p>
                    <p className="text-xs text-muted-foreground">
                      {keys.length} key{keys.length > 1 ? 's' : ''} in your pool · used in this order; a rate-limited key is skipped until its cooldown ends.
                    </p>
                  </div>
                </div>
                <button type="button" disabled={busy} onClick={() => void remove()} className="btn btn-ghost text-xs text-destructive hover:bg-destructive/10 border border-destructive/20">
                  Remove all keys
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {keys.map((k, i) => (
                  <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                      <code className="font-mono text-foreground font-semibold">{k.hint}</code>
                      {k.label && <span className="text-muted-foreground truncate">{k.label}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`job-chip ${k.status === 'active' ? 'job-chip-fresh' : k.status === 'cooling' ? '' : 'job-chip-stale'}`}>
                        {k.status === 'active' ? 'Active' : k.status === 'cooling' ? `Rate limited · ${cooldownText(k.cooldownUntil)}` : 'Rejected by provider'}
                      </span>
                      <button type="button" disabled={busy} onClick={() => void remove(k.id)} className="text-xs text-muted-foreground hover:text-destructive" aria-label={`Remove key ${k.hint}`}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {keys.some((k) => k.status === 'invalid') && <p className="text-xs text-muted-foreground">A rejected key was revoked or mistyped on the provider side. Remove it and add a fresh one.</p>}
            </section>
          )}

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-foreground">Choose a provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(PROVIDER_META) as AiProvider[]).map((id) => {
                const active = provider === id
                const m = PROVIDER_META[id]
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setProvider(id)
                      setStepsOpen(true)
                    }}
                    aria-pressed={active}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${active ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-muted/20 hover:border-border/80 hover:bg-muted/40'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-foreground">{m.label}</p>
                        <span className="text-[10px] font-semibold text-primary">{m.badge}</span>
                      </div>
                      {active && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.blurb}</p>
                    <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div>Models: {m.models}</div>
                      <div className="mt-0.5">{m.freeTier}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <section className="surface p-6 rounded-2xl border border-border flex flex-col gap-4" aria-label={`How to get a ${meta.label} key`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">How to get a {meta.label} API key</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Takes about two minutes. The key is created in your own {meta.label} account; JobAppy never sees your password.</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={meta.consoleUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm text-primary">
                  Open {meta.label} console ↗
                </a>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStepsOpen((v) => !v)} aria-expanded={stepsOpen}>
                  {stepsOpen ? 'Hide steps' : 'Show steps'}
                </button>
              </div>
            </div>
            {stepsOpen && (
              <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-sm text-foreground">
                {meta.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
            {provider === 'groq' && (
              <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/30 p-3">
                Free-tier limits are per Groq account. If you hit them, create a key in a second Groq account (another Google or GitHub login) and add it here as well: JobAppy tries your keys in order and switches to the next one as soon as one answers &ldquo;rate limited&rdquo;, then comes back to it when the cooldown ends. Up to {maxKeys} keys.
              </p>
            )}
          </section>

          <section className="surface p-6 rounded-2xl border border-border flex flex-col gap-4" aria-label="Add a key">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {switching ? `Switch to ${meta.label}` : keys.length ? `Add another ${meta.label} key` : `Enter your ${meta.label} API key`}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {switching
                  ? `Saving a ${meta.label} key replaces your ${PROVIDER_META[savedProvider!].label} key${keys.length > 1 ? 's' : ''}: one provider per account, so sensitive content is never spread across providers.`
                  : keys.length >= maxKeys
                    ? `You have ${maxKeys} keys, the maximum. Remove one to add another.`
                    : 'Keys are tested against the provider before they are saved.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">API key</span>
                <div className="relative">
                  <input
                    id="settings-ai-key"
                    type={showKey ? 'text' : 'password'}
                    className="input-field font-mono text-sm w-full pr-16"
                    style={{ width: '100%' }}
                    placeholder={meta.placeholder}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={`${meta.label} API key`}
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1">
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <label className="block flex-1 min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Label <span className="font-normal normal-case text-muted-foreground/70">(optional, e.g. second account)</span>
                  </span>
                  <input className="input-field text-sm w-full" style={{ width: '100%' }} placeholder="Second account" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} aria-label="Key label" />
                </label>
                <button type="button" disabled={busy || !draft.trim() || (!switching && keys.length >= maxKeys)} onClick={() => void save()} className="btn btn-primary text-sm px-6 whitespace-nowrap font-medium sm:self-end">
                  {busy ? 'Verifying…' : keys.length && !switching ? 'Add another key' : 'Save & verify'}
                </button>
              </div>
            </div>
            {meta.keyPrefix && draft.trim() && !draft.trim().startsWith(meta.keyPrefix) && (
              <p className="text-xs text-muted-foreground">{meta.label} keys start with <code className="font-mono">{meta.keyPrefix}</code>; check you copied the whole key.</p>
            )}
            {error && <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">⚠️ {error}</p>}
          </section>
        </div>
      )}
    </div>
  )
}
