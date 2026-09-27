'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BrandLogo from '../../../components/BrandLogo'
import { confirmReferrerEmail } from '../../../lib/referrals/client'

function Confirm() {
  const params = useSearchParams()
  const token = (params.get('token') || '').trim()
  const [result, setResult] = useState<'pending' | 'verified' | 'invalid' | 'expired' | 'already' | 'error'>('pending')
  useEffect(() => {
    if (!token) {
      setResult('invalid')
      return
    }
    confirmReferrerEmail(token)
      .then((r) => setResult(r.result))
      .catch(() => setResult('error'))
  }, [token])
  const copy: Record<string, [string, string]> = {
    pending: ['Confirming…', 'One moment.'],
    verified: ['Corporate email confirmed', 'Thanks. An admin now reviews your profile; you will be emailed when you are verified. You can close this page.'],
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
