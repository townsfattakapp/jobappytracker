import type { Metadata } from 'next'
import Link from 'next/link'
import PassPricing from '../../components/billing/PassPricing'
import BrandLogo from '../../components/BrandLogo'

export const metadata: Metadata = {
  title: 'Pricing · Prep by EVOLW',
  description: 'Plans for Prep by EVOLW: what is included, usage limits and billing periods.',
}

export const dynamic = 'force-dynamic'

export default function PricingPage() {
  return (
    <div className="pricing-page bg-background text-foreground">
      <header className="pricing-header">
        <Link href="/app" aria-label="Open Prep">
          <BrandLogo size={34} />
        </Link>
        <nav className="flex gap-2">
          <Link href="/app" className="btn btn-ghost btn-sm">
            Open Prep
          </Link>
        </nav>
      </header>
      <main className="pricing-main">
        <h1 className="pricing-title">Pick a pass. Pay once.</h1>
        <p className="pricing-sub">The same three passes everywhere: 90 days for ₹199, 180 days for ₹424, one year for ₹799. One payment through Razorpay, nothing renews by itself, and the price shown is the price you pay.</p>
        <PassPricing />
      </main>
      <footer className="mt-16 pt-8 pb-12 border-t border-border/50 text-center text-xs text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <Link href="/terms" className="hover:text-foreground underline">Terms of Service</Link>
          <Link href="/refund" className="hover:text-foreground underline">Refund Policy</Link>
          <Link href="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-foreground underline">Support & Contact</Link>
          <Link href="/data-deletion" className="hover:text-foreground underline">Data Deletion</Link>
        </div>
        <p>All payments processed securely via Razorpay. One-time passes, no recurring auto-debit.</p>
      </footer>
    </div>
  )
}
