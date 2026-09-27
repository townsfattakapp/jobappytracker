'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BrandLogo from '../../components/BrandLogo'
import { MIN_PASSWORD_LENGTH } from '../../lib/authErrors'

function ResetForm() {
  const params = useSearchParams()
  const email = (params.get('email') || '').trim().toLowerCase()
  const token = (params.get('token') || '').trim()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`)
    if (password !== confirm) return setError('The two passwords do not match.')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, password }) })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error || 'Could not reset the password.')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password.')
    } finally {
      setBusy(false)
    }
  }

  if (!email || !token) {
    return (
      <div className="surface max-w-md w-full rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">This link is incomplete</h1>
        <p className="text-sm text-muted-foreground mb-6">Open the reset link from the email again, or request a new one from the sign-in screen.</p>
        <a href="/app?mode=signin" className="btn btn-primary">
          Back to sign in
        </a>
      </div>
    )
  }
  if (done) {
    return (
      <div className="surface max-w-md w-full rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Password changed</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in with your new password. Every device will ask for it once.</p>
        <a href={`/app?mode=signin&email=${encodeURIComponent(email)}`} className="btn btn-primary">
          Sign in
        </a>
      </div>
    )
  }
  return (
    <form className="surface max-w-md w-full rounded-2xl p-8 flex flex-col gap-4" onSubmit={submit} noValidate>
      <div>
        <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          For <strong>{email}</strong>. The link works once and expires an hour after it was sent.
        </p>
      </div>
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">New password</span>
        <input type={show ? 'text' : 'password'} className="input-field w-full" value={password} onChange={(e) => setPassword(e.target.value)} minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} autoFocus />
      </label>
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Repeat it</span>
        <input type={show ? 'text' : 'password'} className="input-field w-full" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
      </label>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-background text-foreground">
      <a href="/?home=1" aria-label="Prep home">
        <BrandLogo size={34} />
      </a>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  )
}
