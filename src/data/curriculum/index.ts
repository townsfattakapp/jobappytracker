import { CurriculumTrack } from '../../types'
import { trackdsaCurriculum } from './dsa'
import { trackjavaCurriculum } from './java'
import { trackjsCurriculum } from './js'
import { trackreactCurriculum } from './react'
import { tracknodeCurriculum } from './node'
import { tracksqlCurriculum } from './sql'
import { trackhldCurriculum } from './hld'
import { tracklldCurriculum } from './lld'
import { trackcsCurriculum } from './cs'
import { trackdevopsCurriculum } from './devops'

export const allCurriculums: CurriculumTrack[] = [
  trackdsaCurriculum,
  trackjavaCurriculum,
  trackjsCurriculum,
  trackreactCurriculum,
  tracknodeCurriculum,
  tracksqlCurriculum,
  trackhldCurriculum,
  tracklldCurriculum,
  trackcsCurriculum,
  trackdevopsCurriculum
]
