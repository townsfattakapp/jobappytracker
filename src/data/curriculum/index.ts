import type { CurriculumTrack } from '../../types'
import { coreCurriculums } from './core'
import { libraryTracks } from './library'

export { coreCurriculums }
export { libraryTracks }

/** Every track shipped with the app: the ten core tracks plus the extended library. */
export const allCurriculums: CurriculumTrack[] = [...coreCurriculums, ...libraryTracks]

