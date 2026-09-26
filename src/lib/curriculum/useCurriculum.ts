'use client'

import { useSyncExternalStore } from 'react'
import { getCurriculum, subscribeCurriculum, type CurriculumSnapshot } from './registry'

/** React hook: the current curriculum, re-rendering when tracks change. */
export function useCurriculum(): CurriculumSnapshot {
  return useSyncExternalStore(subscribeCurriculum, getCurriculum, getCurriculum)
}
