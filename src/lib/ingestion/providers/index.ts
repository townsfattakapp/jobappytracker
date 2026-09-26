import type { JobProvider } from '../types'
import { ashbyProvider } from './ashby'
import { fixtureProvider } from './fixture'
import { greenhouseProvider } from './greenhouse'
import { leverProvider } from './lever'
import { fixturesAllowed } from '../../server/stage'

/** Registered providers. Adding a provider means adding one adapter file and one line here. */
export const PROVIDERS: JobProvider[] = [greenhouseProvider, leverProvider, ashbyProvider, fixtureProvider]

export const PROVIDER_IDS = ['manual', ...PROVIDERS.map((p) => p.id)] as const

export function providerById(id: string | null | undefined): JobProvider | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

/** Providers an admin may choose for a source; the fixture one is development-only. */
export function selectableProviders(): { id: string; label: string; configHelp: string }[] {
  const list = PROVIDERS.filter((p) => p.id !== 'fixture' || fixturesAllowed())
  return [{ id: 'manual', label: 'Manual (admin adds jobs)', configHelp: 'No automated ingestion.' }, ...list.map((p) => ({ id: p.id, label: p.label, configHelp: p.configHelp }))]
}
