import Link from 'next/link'
import BrandLogo from '../BrandLogo'

interface Props {
  title: string
  subtitle?: string
  lastUpdated: string
  badge?: string
  children: React.ReactNode
}

export default function LegalPageLayout({ title, subtitle, lastUpdated, badge, children }: Props) {
  return (
    <div className="legal-page">
      <header className="legal-nav-header">
        <Link href="/" aria-label="Prep by EVOLW Home">
          <BrandLogo size={32} />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/pricing" className="btn btn-ghost btn-sm">
            Pricing
          </Link>
          <Link href="/app" className="btn btn-primary btn-sm">
            Open Prep
          </Link>
        </nav>
      </header>

      <main className="legal-main">
        <header className="legal-header">
          {badge && <span className="legal-badge mb-2">{badge}</span>}
          <h1 className="legal-title">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>}
          <div className="legal-meta">
            <span>Last revised: {lastUpdated}</span>
            <span>·</span>
            <span>Prep by EVOLW</span>
          </div>
        </header>

        <article className="legal-content">{children}</article>
      </main>

      <footer className="legal-footer">
        <nav className="legal-footer-nav" aria-label="Legal navigation">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/refund">Refund Policy</Link>
          <Link href="/contact">Contact &amp; Support</Link>
          <Link href="/data-deletion">Data Controls &amp; Deletion</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Evolw. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
