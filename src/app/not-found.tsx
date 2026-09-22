import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="surface max-w-md w-full rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-3">🧭</span>
        <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">JobAppy lives on a single page. Head back to your workspace.</p>
        <Link href="/" className="btn btn-primary">
          Open JobAppy
        </Link>
      </div>
    </div>
  )
}
