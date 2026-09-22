import { CurriculumTrack } from '../../types'
import { applyContent } from './enrich'
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
import { dsaContent } from './content/dsa'
import { javaContent } from './content/java'
import { jsContent } from './content/js'
import { reactContent } from './content/react'
import { nodeContent } from './content/node'
import { sqlContent } from './content/sql'
import { hldContent } from './content/hld'
import { lldContent } from './content/lld'
import { csContent } from './content/cs'
import { devopsContent } from './content/devops'

/** Generated structure + authored descriptions, concepts, quizzes and extra topics. */
export const allCurriculums: CurriculumTrack[] = [
  applyContent(trackdsaCurriculum, dsaContent),
  applyContent(trackjavaCurriculum, javaContent),
  applyContent(trackjsCurriculum, jsContent),
  applyContent(trackreactCurriculum, reactContent),
  applyContent(tracknodeCurriculum, nodeContent),
  applyContent(tracksqlCurriculum, sqlContent),
  applyContent(trackhldCurriculum, hldContent),
  applyContent(tracklldCurriculum, lldContent),
  applyContent(trackcsCurriculum, csContent),
  applyContent(trackdevopsCurriculum, devopsContent),
]
