'use client'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Prep hit an unexpected error</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Your data is stored on this device. Reloading is safe.
        </p>
        {error.digest ? <p style={{ fontSize: '0.75rem', color: '#999' }}>Ref: {error.digest}</p> : null}
        <button
          type="button"
          onClick={() => retry()}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '0.6rem', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
