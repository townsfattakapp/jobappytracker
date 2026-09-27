import type { JobProvider } from '../types'
import { adzunaProvider } from './adzuna'
import { amazonProvider } from './amazon'
import { ashbyProvider } from './ashby'
import { atlassianProvider } from './atlassian'
import { eightfoldProvider } from './eightfold'
import { fixtureProvider } from './fixture'
import { greenhouseProvider } from './greenhouse'
import { kekaProvider } from './keka'
import { leverProvider } from './lever'
import { oracleCloudProvider } from './oraclecloud'
import { smartRecruitersProvider } from './smartrecruiters'
import { workdayProvider } from './workday'
import { fixturesAllowed } from '../../server/stage'

/**
 * Registered providers. Adding a provider means adding one adapter file and one line here.
 * Greenhouse, Lever, Ashby and SmartRecruiters are documented public job-board APIs; Amazon Jobs,
 * Eightfold, Workday, Oracle Cloud HCM and Atlassian are the JSON endpoints the companies' own
 * careers pages call (unofficial, may change).
 */
export const PROVIDERS: JobProvider[] = [greenhouseProvider, leverProvider, ashbyProvider, smartRecruitersProvider, amazonProvider, eightfoldProvider, workdayProvider, oracleCloudProvider, atlassianProvider, kekaProvider, adzunaProvider, fixtureProvider]

export const PROVIDER_IDS = ['manual', ...PROVIDERS.map((p) => p.id)] as const

export function providerById(id: string | null | undefined): JobProvider | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

/** Providers an admin may choose for a source; the fixture one is development-only. */
export function selectableProviders(): { id: string; label: string; configHelp: string }[] {
  const list = PROVIDERS.filter((p) => p.id !== 'fixture' || fixturesAllowed())
  return [{ id: 'manual', label: 'Manual (admin adds jobs)', configHelp: 'No automated ingestion.' }, ...list.map((p) => ({ id: p.id, label: p.label, configHelp: p.configHelp }))]
}
