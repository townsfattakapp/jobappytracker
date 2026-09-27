import { useMemo } from 'react'
import { useCurriculum } from '../curriculum/useCurriculum'
import { type InterviewRound } from './config'
import { buildCurriculumRounds } from './curriculumRounds'

export function useInterviewRounds(): InterviewRound[] {
  const cur = useCurriculum()
  return useMemo(() => buildCurriculumRounds(cur), [cur])
}

export function useRoundById(id: string | undefined | null): InterviewRound {
  const rounds = useInterviewRounds()
  return useMemo(() => rounds.find((r) => r.id === id) || rounds[0], [rounds, id])
}
