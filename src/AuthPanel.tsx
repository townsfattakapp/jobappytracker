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
  /** Initial mode for the form (signin or signup). */
  initialMode?: 'signin' | 'signup'
  /** Called when user toggles between signin and signup. */
  onModeChange?: (mode: 'signin' | 'signup') => void
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
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function UserIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function EyeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function AlertCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

function CloseIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function SpinnerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
  initialMode,
  onModeChange,
}: AuthPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = (next: boolean) => {
    setInternalOpen(next)
    onOpenChange?.(next)
  }

  const [mode, setMode] = useState<'signin' | 'signup'>(() => {
    if (initialMode) return initialMode
    return readLastEmail() ? 'signin' : 'signup'
  })

  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode)
    }
  }, [initialMode])

  const handleModeChange = (next: 'signin' | 'signup') => {
    setMode(next)
    setError(null)
    setUnverified(false)
    onModeChange?.(next)
  }

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
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
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
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please check your credentials.'
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
      setError('Google sign-in could not start. Please try again.')
    }
  }

  const inboxContent = pendingEmail ? (
    <div className="w-full flex flex-col items-center text-center py-2 animate-fade">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mb-4 shadow-sm">
        📬
      </div>
      <h2 id="auth-title" className="font-display text-2xl font-bold text-foreground tracking-tight">
        Check your inbox
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
        We sent a verification link to <strong className="font-semibold text-foreground">{pendingEmail}</strong>. Click the link to activate your account.
      </p>

      <div className="my-5 w-full p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground text-left space-y-2">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <span>💡</span> Quick tips:
        </p>
        <p>• The activation link remains active for 24 hours.</p>
        <p>• If it does not arrive within a minute, please check your spam folder.</p>
      </div>

      {error && (
        <div className="mb-4 w-full flex items-start gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm" role="alert">
          <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="w-full space-y-2.5">
        <button
          type="button"
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          onClick={() => {
            setPendingEmail(null)
            handleModeChange('signin')
            setError(null)
          }}
        >
          I have confirmed — Sign in →
        </button>

        <button
          type="button"
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm border border-border/80 bg-card hover:bg-muted/40 text-foreground transition-all disabled:opacity-60"
          disabled={resendState !== 'idle'}
          onClick={() => void resend(pendingEmail)}
        >
          {resendState === 'sending' ? 'Sending link…' : resendState === 'sent' ? '✓ Link sent again' : 'Resend confirmation link'}
        </button>
      </div>
    </div>
  ) : null

  const formContent = inboxContent ?? (
    <div className="w-full flex flex-col items-stretch">
      {/* Segmented Mode Selector - 100% full width end-to-end */}
      <div
        className="w-full grid grid-cols-2 p-1 rounded-2xl bg-muted/50 border border-border/50 mb-5"
        role="tablist"
        aria-label="Sign in or create account"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 text-center ${
            mode === 'signin'
              ? 'bg-card text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleModeChange('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 text-center ${
            mode === 'signup'
              ? 'bg-card text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleModeChange('signup')}
        >
          Create account
        </button>
      </div>

      {/* Google OAuth Button */}
      {options?.google && (
        <div className="w-full mb-5">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border/80 bg-card hover:bg-muted/30 text-foreground font-semibold text-sm transition-all duration-150 shadow-sm hover:border-border hover:shadow disabled:opacity-60"
            onClick={() => void google()}
            disabled={googleBusy || busy}
          >
            <GoogleIcon />
            <span>{googleBusy ? 'Connecting to Google…' : 'Continue with Google'}</span>
          </button>
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              or continue with email
            </span>
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <form className="flex flex-col gap-4 w-full" onSubmit={submit} noValidate>
        {mode === 'signup' && (
          <div className="w-full">
            <label htmlFor="auth-name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Full name <span className="font-normal text-muted-foreground/60 normal-case">(optional)</span>
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <UserIcon />
              </div>
              <input
                id="auth-name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input/80 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-sm placeholder:text-muted-foreground/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div className="w-full">
          <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Email address
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <MailIcon />
            </div>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input/80 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-sm placeholder:text-muted-foreground/50"
              autoComplete="email"
              autoFocus={!email}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            {mode === 'signup' && (
              <span className="text-[11px] text-muted-foreground font-medium">
                Min. {MIN_PASSWORD_LENGTH} characters
              </span>
            )}
          </div>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <LockIcon />
            </div>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Enter your password'}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-input/80 bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-sm placeholder:text-muted-foreground/50"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              autoFocus={Boolean(email)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && (
          <div className="w-full flex items-start gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm" role="alert">
            <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-medium">
              <p>{error}</p>
              {unverified && (
                <button
                  type="button"
                  className="mt-1 font-semibold underline hover:no-underline block"
                  disabled={resendState !== 'idle'}
                  onClick={() => void resend(email.trim().toLowerCase())}
                >
                  {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Sent — check your inbox' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit button - 100% full width end-to-end */}
        <div className="w-full pt-1">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all duration-150 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            disabled={busy || googleBusy}
          >
            {busy ? (
              <>
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                <span>Please wait…</span>
              </>
            ) : mode === 'signin' ? (
              <span>Sign in to Prep →</span>
            ) : (
              <span>Create account →</span>
            )}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground leading-relaxed">
        {mode === 'signup' && options?.emailConfirmation
          ? 'We will send a verification link to confirm your email before activating.'
          : 'Passwords are cryptographically salted and hashed. Cloud sync protects your work.'}
      </p>
    </div>
  )

  const modal =
    isOpen && !inline && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-fade">
            <button
              type="button"
              className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl animate-scale-in"
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Close dialog"
              >
                <CloseIcon />
              </button>

              <div className="mb-6 text-center pr-6">
                <h2 id="auth-modal-title" className="font-display text-2xl font-bold text-foreground tracking-tight">
                  {mode === 'signin' ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                  {mode === 'signin'
                    ? 'Sign in to sync your goals, notes, and attempts.'
                    : 'Start your preparation journey with full cloud sync.'}
                </p>
              </div>

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
