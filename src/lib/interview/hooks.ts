import { useMemo } from 'react'
import { useCurriculum } from '../curriculum/registry'
import { ROUNDS, type InterviewRound } from './config'

export function useInterviewRounds(): InterviewRound[] {
  const cur = useCurriculum()
  return useMemo(() => {
    const custom: InterviewRound[] = cur.tracks
      .filter((t) => !ROUNDS.some((r) => r.id === t.id || r.label === t.title))
      .map((t) => ({
        id: t.id,
        label: t.title,
        group: 'Curriculum',
        blurb: t.description || `Test your knowledge on ${t.title}`,
        brief: `Run a technical interview on ${t.title}. Ask deep, conceptual questions about ${t.title} topics. Cover practical scenarios, trade-offs, and best practices. Push for the "why" behind their answers.`,
        dimensions: ['Core concepts', 'Practical application', 'Trade-offs and architecture', 'Problem solving', 'Communication']
      }))
    return [...ROUNDS, ...custom]
  }, [cur])
}

export function useRoundById(id: string | undefined | null): InterviewRound {
  const rounds = useInterviewRounds()
  return useMemo(() => rounds.find((r) => r.id === id) || rounds[0], [rounds, id])
}
