'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BrandLogo from '../../../components/BrandLogo'
import { confirmReferrerEmail } from '../../../lib/referrals/client'

function Confirm() {
  const params = useSearchParams()
  const token = (params.get('token') || '').trim()
  const [result, setResult] = useState<'ready' | 'pending' | 'verified' | 'invalid' | 'expired' | 'already' | 'error'>('ready')
  const confirm = async () => {
    if (!token) { setResult('invalid'); return }
    setResult('pending')
    try {
      const response = await confirmReferrerEmail(token)
      setResult(response.result)
      window.history.replaceState(null, '', '/referrer/verify')
    } catch { setResult('error') }
  }
  const copy: Record<string, [string, string]> = {
    ready: ['Confirm your email', 'Select the button below to confirm mailbox ownership. Employment approval is a separate admin review.'],
    pending: ['Confirming…', 'One moment.'],
    verified: ['Email confirmed', 'Thanks. Complete your profile if needed, then wait for an admin to review your employment. Email confirmation alone does not approve you as a referrer.'],
    already: ['Already confirmed', 'This link was used before. Nothing else to do.'],
    expired: ['Link expired', 'Confirmation links work for an hour. Open the referrer portal and send a new one.'],
    invalid: ['Link not valid', 'This confirmation link is not valid. Open the referrer portal and send a new one.'],
    error: ['Could not confirm', 'Something went wrong. Try again from the referrer portal.'],
  }
  const [title, text] = copy[result]
  return (
    <div className="surface max-w-md w-full rounded-2xl p-8 text-center">
      <h1 className="font-display text-2xl font-bold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">{text}</p>
      {(result === 'ready' || result === 'error') && <button type="button" className="btn btn-primary mb-3" onClick={confirm}>Confirm email</button>}
      <a href="/referrer" className="btn btn-primary">
        Open the referrer portal
      </a>
    </div>
  )
}

export default function ReferrerVerifyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-background text-foreground">
      <a href="/?home=1" aria-label="Prep home">
        <BrandLogo size={34} />
      </a>
      <Suspense fallback={null}>
        <Confirm />
      </Suspense>
    </div>
  )
}
