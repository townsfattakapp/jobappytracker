'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="surface max-w-md w-full rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-3">⚠️</span>
        <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your data is saved on this device. Reload to continue where you left off.
        </p>
        {error.digest ? <p className="text-xs text-muted-foreground mb-4 font-mono">Ref: {error.digest}</p> : null}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button type="button" className="btn btn-primary" onClick={() => retry()}>
            Try again
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}
