import { fixtureProvider } from './fixture'
import { razorpayProvider } from './razorpay'
import type { BillingProvider } from './types'

export const PROVIDERS: BillingProvider[] = [razorpayProvider, fixtureProvider]

export function providerById(id: string): BillingProvider | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

/**
 * The provider new checkouts use: Razorpay when configured, otherwise the
 * fixture provider outside production, otherwise none (billing not configured).
 */
export function activeProvider(): BillingProvider | null {
  if (razorpayProvider.isConfigured()) return razorpayProvider
  if (fixtureProvider.isConfigured()) return fixtureProvider
  return null
}
