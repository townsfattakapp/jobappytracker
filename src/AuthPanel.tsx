import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { signIn, signUp, type AppUser } from './lib/cloudSync'
import { MIN_PASSWORD_LENGTH } from './lib/authErrors'

interface AuthPanelProps {
  user: AppUser | null
  syncing: boolean
  onSignedIn: (user: AppUser) => void
  onSignOut: () => void
  onToast: (message: string) => void
  /** Render the form directly instead of behind a trigger button. */
  inline?: boolean
  /** Controlled modal visibility (used by the sidebar "Sign in" button). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const LAST_EMAIL_KEY = 'jobappy-last-email'

function readLastEmail(): string {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export default function AuthPanel({
  user,
  syncing,
  onSignedIn,
  onSignOut,
  onToast,
  inline = false,
  open,
  onOpenChange,
}: AuthPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = (next: boolean) => {
    setInternalOpen(next)
    onOpenChange?.(next)
  }

  const [mode, setMode] = useState<'signin' | 'signup'>(() => (readLastEmail() ? 'signin' : 'signup'))
  const [email, setEmail] = useState(() => readLastEmail())
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isOpen || inline) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, inline])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    setBusy(true)
    try {
      const next =
        mode === 'signup'
          ? await signUp(cleanEmail, password, name.trim() || undefined)
          : await signIn(cleanEmail, password)
      try {
        localStorage.setItem(LAST_EMAIL_KEY, cleanEmail)
      } catch {
        // ignore
      }
      onSignedIn(next)
      setOpen(false)
      setPassword('')
      onToast(mode === 'signup' ? 'Account created — syncing…' : 'Signed in — syncing…')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Try again.'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  const formContent = (
    <div className="w-full flex flex-col items-stretch">
      {!inline && (
        <>
          <h2 id="auth-title" className="font-display text-2xl text-foreground">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your tracker, notes and learning plan follow you to every device.
          </p>
        </>
      )}

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1" role="tablist" aria-label="Sign in or create account">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              mode === m ? 'bg-[hsl(var(--card))] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              setMode(m)
              setError(null)
            }}
          >
            {m === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form className="mt-4 flex flex-col gap-4 w-full" onSubmit={submit} noValidate>
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
            autoFocus={!email}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="label-quiet">
            Password
          </label>
          <div className="relative">
            <input
              id="auth-password"
              className="input-field pr-16"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              autoFocus={Boolean(email)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          {!inline && (
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Passwords are hashed on the server. There is no password reset yet, so keep it somewhere safe.
      </p>
    </div>
  )

  const modal =
    isOpen && !inline && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center animate-fade">
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
              className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-[hsl(var(--card))] p-5 shadow-lg sm:p-6 animate-slide-up"
              style={{ maxHeight: '90vh' }}
            >
              {formContent}
            </div>
          </div>,
          document.body,
        )
      : null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline max-w-[14rem] truncate text-sm text-muted-foreground">
          {syncing ? 'Syncing…' : `Cloud · ${user.email || user.name || 'signed in'}`}
        </span>
        <button
          type="button"
          className="theme-toggle-fab bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          onClick={onSignOut}
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    )
  }

  if (inline) {
    return formContent
  }

  // Controlled usage: the parent owns the trigger, we only render the modal.
  if (open !== undefined) return modal

  return (
    <>
      <button
        type="button"
        className="theme-toggle-fab bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground"
        title="Enable cloud sync"
        onClick={() => setOpen(true)}
      >
        ☁️
      </button>
      {modal}
    </>
  )
}
