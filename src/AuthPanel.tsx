import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { EmailNotVerifiedError, resendVerificationEmail, signIn, signInWithGoogle, signUp, type AppUser } from './lib/cloudSync'
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

interface AuthOptions {
  google: boolean
  emailConfirmation: boolean
}

let optionsCache: Promise<AuthOptions> | null = null

function loadAuthOptions(): Promise<AuthOptions> {
  if (!optionsCache) {
    optionsCache = fetch('/api/auth/options', { cache: 'no-store' })
      .then((res) => (res.ok ? (res.json() as Promise<AuthOptions>) : { google: false, emailConfirmation: false }))
      .catch(() => ({ google: false, emailConfirmation: false }))
  }
  return optionsCache
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
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
  const [googleBusy, setGoogleBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [options, setOptions] = useState<AuthOptions | null>(null)
  /** Email waiting for confirmation; switches the form to the "check your inbox" state. */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [unverified, setUnverified] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    if (!isOpen && !inline) return
    let cancelled = false
    void loadAuthOptions().then((next) => {
      if (!cancelled) setOptions(next)
    })
    return () => {
      cancelled = true
    }
  }, [isOpen, inline])

  useEffect(() => {
    if (!isOpen || inline) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, inline])

  const rememberEmail = (value: string) => {
    try {
      localStorage.setItem(LAST_EMAIL_KEY, value)
    } catch {
      // ignore
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setUnverified(false)
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
      if (mode === 'signup') {
        const result = await signUp(cleanEmail, password, name.trim() || undefined)
        rememberEmail(cleanEmail)
        if (result.verificationSent || !result.user) {
          setPendingEmail(cleanEmail)
          setPassword('')
          setResendState('idle')
          return
        }
        onSignedIn(result.user)
        setOpen(false)
        setPassword('')
        onToast('Account created — syncing…')
        return
      }
      const next = await signIn(cleanEmail, password)
      rememberEmail(cleanEmail)
      onSignedIn(next)
      setOpen(false)
      setPassword('')
      onToast('Signed in — syncing…')
    } catch (err) {
      if (err instanceof EmailNotVerifiedError) {
        setUnverified(true)
        setResendState('idle')
      }
      const message = err instanceof Error ? err.message : 'Sign-in failed. Try again.'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  const resend = async (target: string) => {
    setResendState('sending')
    try {
      await resendVerificationEmail(target)
      setResendState('sent')
      onToast('Confirmation email sent')
    } catch (err) {
      setResendState('idle')
      setError(err instanceof Error ? err.message : 'Could not resend the email')
    }
  }

  const google = async () => {
    setError(null)
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
    } catch {
      setGoogleBusy(false)
      setError('Google sign-in could not start. Try again.')
    }
  }

  const inboxContent = pendingEmail ? (
    <div className="w-full flex flex-col items-stretch text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl" aria-hidden="true">
        ✉️
      </div>
      <h2 id="auth-title" className="font-display text-2xl text-foreground">
        Check your inbox
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a confirmation link to <span className="font-semibold text-foreground">{pendingEmail}</span>. Open it to activate your account, then sign in.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">The link works for 24 hours. Check spam if it has not arrived in a minute.</p>
      {error ? (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col gap-2">
        <button type="button" className="btn btn-primary w-full" disabled={resendState !== 'idle'} onClick={() => void resend(pendingEmail)}>
          {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Email sent again' : 'Resend email'}
        </button>
        <button
          type="button"
          className="btn btn-ghost w-full"
          onClick={() => {
            setPendingEmail(null)
            setMode('signin')
            setError(null)
          }}
        >
          I have confirmed — sign in
        </button>
      </div>
    </div>
  ) : null

  const formContent = inboxContent ?? (
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

      {options?.google && (
        <>
          <button type="button" className="auth-google mt-3" onClick={() => void google()} disabled={googleBusy || busy}>
            <GoogleIcon />
            <span>{googleBusy ? 'Opening Google…' : 'Continue with Google'}</span>
          </button>
          <div className="auth-divider" role="separator">
            <span>or with email</span>
          </div>
        </>
      )}

      <div className={`${options?.google ? 'mt-1' : 'mt-3'} grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1`} role="tablist" aria-label="Sign in or create account">
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
              setUnverified(false)
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
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
            <p>{error}</p>
            {unverified && (
              <button type="button" className="mt-1 underline font-semibold" disabled={resendState !== 'idle'} onClick={() => void resend(email.trim().toLowerCase())}>
                {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Sent — check your inbox' : 'Resend confirmation email'}
              </button>
            )}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          {!inline && (
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy || googleBusy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {mode === 'signup' && options?.emailConfirmation
          ? 'We will email you a confirmation link before the account is active.'
          : 'Passwords are hashed on the server. There is no password reset yet, so keep it somewhere safe.'}
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
