import { addDays, dateKey } from '../learningPlan'
import { fillRoadmap } from '../roadmapGenerator'
import type { CurriculumTrack, Goal, GoalTrack, RoadmapDay, StudyTask } from '../../types'
import type { PrepBlueprint } from './prepare'

/**
 * Job-specific 7 / 14 / 30-day preparation plans. Reuses the existing
 * roadmap engine (fillRoadmap) with a temporary track/topic selection, so it
 * inherits: existing tasks are never moved or duplicated, hours-per-day and
 * rest days are respected, topic prerequisites order the queue, completed
 * steps are skipped. New tasks are tagged with prepJobId for readiness.
 */

export const PLAN_DURATIONS = [7, 14, 30] as const
export type PlanDuration = (typeof PLAN_DURATIONS)[number]

export interface PlanPreview {
  days: PlanDuration
  fromDate: string
  toDate: string
  goalId: string
  roadmap: RoadmapDay[]
  /** Tasks the plan would add (already tagged with prepJobId). */
  tasks: StudyTask[]
  byDay: { date: string; count: number; minutes: number }[]
  topicsPlanned: number
  topicsRequested: number
  /** Topics whose curriculum steps are already on the roadmap or done, so nothing new was needed. */
  topicsAlreadyPlanned: number
  /** Topics that did not fit in the window at the goal's hours per day. */
  topicsUnscheduled: number
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

export function buildPreparationPlan(input: { job: { id: string }; blueprint: PrepBlueprint; goal: Goal; roadmap: RoadmapDay[]; days: PlanDuration; fromDate?: string; tracks?: CurriculumTrack[] }): PlanPreview {
  const { blueprint, goal, roadmap, days } = input
  const fromDate = input.fromDate ?? dateKey()
  const toDate = addDays(fromDate, days - 1)
  const byTrack = new Map<string, { topicIds: string[]; priority: GoalTrack['priority'] }>()
  for (const item of blueprint.plannable) {
    if (!item.ref) continue
    const entry = byTrack.get(item.ref.trackId) ?? { topicIds: [], priority: 'Medium' }
    if (!entry.topicIds.includes(item.ref.topicId)) entry.topicIds.push(item.ref.topicId)
    if (item.status === 'must') entry.priority = 'High'
    byTrack.set(item.ref.trackId, entry)
  }
  const selection: GoalTrack[] = Array.from(byTrack.entries()).map(([trackId, e], order) => ({ trackId, topicIds: e.topicIds, priority: e.priority, order }))
  const topicsRequested = selection.reduce((n, s) => n + (s.topicIds?.length ?? 0), 0)
  const startDate = goal.startDate <= fromDate ? goal.startDate : fromDate
  const pseudoGoal: Goal = { ...goal, startDate, durationDays: daysBetween(startDate, toDate) + 1, tracks: selection }
  const before = new Set(roadmap.flatMap((d) => d.tasks.map((t) => t.id)))
  const result = fillRoadmap(pseudoGoal, roadmap, fromDate, input.tracks)
  const tasks: StudyTask[] = []
  const taggedRoadmap = result.roadmap.map((day) => ({
    ...day,
    tasks: day.tasks.map((t) => {
      if (before.has(t.id)) return t
      const tagged = { ...t, prepJobId: input.job.id }
      tasks.push(tagged)
      return tagged
    }),
  }))
  const plannedTopics = new Set(tasks.map((t) => t.topicId).filter(Boolean))
  const existingTopics = new Set(roadmap.filter((d) => d.goalId === goal.id).flatMap((d) => d.tasks).map((t) => t.topicId).filter(Boolean))
  const requestedIds = selection.flatMap((s) => s.topicIds ?? [])
  const alreadyPlanned = requestedIds.filter((id) => !plannedTopics.has(id) && existingTopics.has(id)).length
  const byDayMap = new Map<string, { count: number; minutes: number }>()
  for (const t of tasks) {
    const day = taggedRoadmap.find((d) => d.tasks.some((x) => x.id === t.id))
    if (!day) continue
    const key = day.date.slice(0, 10)
    const e = byDayMap.get(key) ?? { count: 0, minutes: 0 }
    e.count += 1
    e.minutes += t.estDurationMinutes
    byDayMap.set(key, e)
  }
  return {
    days,
    fromDate,
    toDate,
    goalId: goal.id,
    roadmap: taggedRoadmap,
    tasks,
    byDay: Array.from(byDayMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, e]) => ({ date, ...e })),
    topicsPlanned: plannedTopics.size,
    topicsRequested,
    topicsAlreadyPlanned: alreadyPlanned,
    topicsUnscheduled: Math.max(0, topicsRequested - plannedTopics.size - alreadyPlanned),
  }
}
