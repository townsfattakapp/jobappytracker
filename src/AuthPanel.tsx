import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { pingAppwrite } from './lib/appwrite'
import { signIn, signUp, type AppUser } from './lib/cloudSync'

interface AuthPanelProps {
  user: AppUser | null
  syncing: boolean
  onSignedIn: (user: AppUser) => void
  onSignOut: () => void
  onToast: (message: string) => void
}

export default function AuthPanel({
  user,
  syncing,
  onSignedIn,
  onSignOut,
  onToast,
}: AuthPanelProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [pingBusy, setPingBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || password.length < 8) {
      onToast('Use a valid email and password (8+ chars)')
      return
    }
    setBusy(true)
    try {
      const next =
        mode === 'signup'
          ? await signUp(email.trim(), password, name.trim() || undefined)
          : await signIn(email.trim(), password)
      onSignedIn(next)
      setOpen(false)
      setPassword('')
      onToast(mode === 'signup' ? 'Account created — syncing…' : 'Signed in — syncing…')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auth failed'
      onToast(message)
    } finally {
      setBusy(false)
    }
  }

  const runPing = async () => {
    setPingBusy(true)
    try {
      const result = await pingAppwrite()
      onToast(result.ok ? `✓ ${result.message}` : `Ping failed: ${result.message}`)
    } finally {
      setPingBusy(false)
    }
  }

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-title"
              className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-[hsl(var(--card))] p-5 shadow-lg sm:p-6"
              style={{ maxHeight: '90vh' }}
            >
              <h2 id="auth-title" className="font-display text-2xl text-foreground">
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sync your pipeline to Appwrite so it follows you across devices.
              </p>

              <form className="mt-5 flex flex-col gap-4" onSubmit={submit}>
                {mode === 'signup' ? (
                  <div>
                    <label htmlFor="auth-name" className="label-quiet">
                      Name
                    </label>
                    <input
                      id="auth-name"
                      className="input-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                      autoComplete="name"
                    />
                  </div>
                ) : null}

                <div>
                  <label htmlFor="auth-email" className="label-quiet">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    className="input-field"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="auth-password" className="label-quiet">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    className="input-field"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    No account?{' '}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => setMode('signup')}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have one?{' '}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => setMode('signin')}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>,
          document.body,
        )
      : null

  if (user) {
    return (
      <div className="flex max-w-full flex-wrap items-center gap-2">
        <span className="max-w-[14rem] truncate text-sm text-muted-foreground sm:max-w-xs">
          {syncing ? 'Syncing…' : `Cloud · ${user.email || user.name || 'signed in'}`}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={runPing} disabled={pingBusy}>
          {pingBusy ? 'Pinging…' : 'Send a ping'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={runPing} disabled={pingBusy}>
          {pingBusy ? 'Pinging…' : 'Send a ping'}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setMode('signup')
            setOpen(true)
          }}
        >
          Cloud sync
        </button>
      </div>
      {modal}
    </>
  )
}
