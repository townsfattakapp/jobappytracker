'use client'

import { useCallback, useEffect, useState } from 'react'
import { pricingFor, type Currency, type Pricing } from './currency'

const PRICING_EVENT = 'prep:pricing'
let cached: Pricing | null = null

/**
 * The passes priced in the visitor's currency. The first render uses the INR
 * table (so server and client markup agree), then the server's detection or
 * the visitor's saved choice replaces it. Changing the currency anywhere
 * updates every price on the page.
 */
export function usePricing(): { pricing: Pricing; loaded: boolean; setCurrency: (currency: Currency) => Promise<void> } {
  const [pricing, setPricing] = useState<Pricing>(() => cached ?? pricingFor('INR'))
  const [loaded, setLoaded] = useState(Boolean(cached))

  useEffect(() => {
    let cancelled = false
    if (!cached) {
      fetch('/api/billing/pricing', { credentials: 'same-origin' })
        .then((r) => (r.ok ? (r.json() as Promise<Pricing>) : null))
        .then((p) => {
          if (!p || cancelled) return
          cached = p
          setPricing(p)
          setLoaded(true)
          window.dispatchEvent(new Event(PRICING_EVENT))
        })
        .catch(() => setLoaded(true))
    }
    const onChange = () => {
      if (cached) setPricing(cached)
    }
    window.addEventListener(PRICING_EVENT, onChange)
    return () => {
      cancelled = true
      window.removeEventListener(PRICING_EVENT, onChange)
    }
  }, [])

  const setCurrency = useCallback(async (currency: Currency) => {
    const res = await fetch('/api/billing/pricing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency }), credentials: 'same-origin' })
    if (!res.ok) return
    const p = (await res.json()) as Pricing
    cached = p
    setPricing(p)
    window.dispatchEvent(new Event(PRICING_EVENT))
  }, [])

  return { pricing, loaded, setCurrency }
}
