import { careerPaths } from '../../data/careerPaths'
import { getCurriculum, topicIdsOf } from '../curriculum/registry'
import type { CurriculumTrack, Goal, KnowledgeWorkspace, RoadmapDay } from '../../types'
import { skillDef } from './skills'
import { roleCategoryById } from './taxonomy'
import type { JobDto } from './types'

/**
 * Maps a job onto the learner's curriculum. Runs on the client because
 * curriculum progress (roadmap tasks, knowledge workspaces) lives in the
 * learner's synced Storage document, not in a server table.
 */

export interface TrackAlignment {
  track: CurriculumTrack
  /** Why this track is relevant to the job. */
  because: string[]
  /** Skills from the listing that this track covers. */
  skills: string[]
  inGoal: boolean
  topicsTotal: number
  topicsStarted: number
  topicsCompleted: number
  /** 0–100 share of the track's topics with any completed roadmap task or a non-"Not Started" workspace. */
  progress: number
  /** covered: most topics done; learning: in a goal or started; not_covered: nothing yet. */
  gapStatus: 'covered' | 'learning' | 'not_covered'
}

/** A track counts as covered once this share of its topics is complete. */
export const COVERED_THRESHOLD = 0.7
/** Upper bound on tracks shown for one job (skill-backed tracks are always kept). */
export const MAX_TRACKS = 8

export interface JobCurriculumMap {
  tracks: TrackAlignment[]
  /** Tracks not yet in any active goal that the learner could add to close gaps. */
  gapTrackIds: string[]
  /** Skills from the listing with no matching track in the library. */
  uncoveredSkills: string[]
  careerPathTitles: string[]
}

const norm = (s: string) => s.toLowerCase().replace(/\.js$/, '').replace(/[^a-z0-9+# ]+/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * 'strong' when the skill names the track itself (title or taught language),
 * 'tag' when it only appears in the track's tags (e.g. "sql" on an analytics
 * track), which is only relevant when the track belongs to the job's field.
 */
function trackCoversSkill(track: CurriculumTrack, skill: string): 'strong' | 'tag' | null {
  const s = norm(skill)
  if (!s) return null
  const same = (h: string) => h === s || (s.length > 3 && h.length > 3 && (h.includes(s) || s.includes(h)))
  if ([track.title, ...(track.languages || [])].map(norm).some(same)) return 'strong'
  if ((track.tags || []).map(norm).some(same)) return 'tag'
  return null
}

export function mapJobToCurriculum(job: JobDto, learner: { goals: Goal[]; roadmap: RoadmapDay[]; knowledgeWorkspaces: KnowledgeWorkspace[] }): JobCurriculumMap {
  const curriculum = getCurriculum()
  const category = roleCategoryById(job.roleCategory)
  const pathIds = new Set<string>([...(job.careerPathIds || []), ...(category?.careerPathIds ?? [])])
  const paths = careerPaths.filter((p) => pathIds.has(p.id))
  const because = new Map<string, Set<string>>()
  const skillsByTrack = new Map<string, Set<string>>()
  const add = (trackId: string, reason: string) => {
    if (!curriculum.trackById.has(trackId)) return
    if (!because.has(trackId)) because.set(trackId, new Set())
    because.get(trackId)!.add(reason)
  }

  // Path tracks: every High-priority track of the primary path (first match), only High from the others.
  paths.forEach((path, index) => {
    for (const t of path.tracks) if (t.priority === 'High' || (index === 0 && t.priority === 'Medium')) add(t.trackId, `Part of the ${path.title} path`)
  })
  for (const trackId of job.trackIds || []) add(trackId, 'Pinned for this listing')

  const pathTrackIds = new Set(because.keys())
  const allSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])]
  const covered = new Set<string>()
  const addSkillTrack = (trackId: string, skill: string) => {
    if (!curriculum.trackById.has(trackId)) return
    add(trackId, `Covers ${skill}`)
    if (!skillsByTrack.has(trackId)) skillsByTrack.set(trackId, new Set())
    skillsByTrack.get(trackId)!.add(skill)
    covered.add(skill)
  }
  for (const skill of allSkills) {
    // The skill lexicon names the tracks that teach a skill; that mapping wins.
    const def = skillDef(skill)
    if (def?.trackIds?.length) {
      for (const trackId of def.trackIds) addSkillTrack(trackId, skill)
      continue
    }
    // Unknown skill: only a track whose title or taught language names it.
    for (const track of curriculum.tracks) {
      if (track.source === 'personal') continue
      if (trackCoversSkill(track, skill) === 'strong') addSkillTrack(track.id, skill)
    }
  }

  const goalTrackIds = new Set(learner.goals.filter((g) => g.status !== 'Archived').flatMap((g) => g.tracks.map((t) => t.trackId)))
  const completedTopics = new Set<string>()
  const startedTopics = new Set<string>()
  for (const day of learner.roadmap)
    for (const task of day.tasks) {
      if (!task.topicId) continue
      if (task.status === 'Completed') completedTopics.add(task.topicId)
      else if (task.status === 'InProgress') startedTopics.add(task.topicId)
    }
  for (const ws of learner.knowledgeWorkspaces) {
    if (ws.learningStatus === 'Mastered') completedTopics.add(ws.topicId)
    else if (ws.learningStatus !== 'Not Started') startedTopics.add(ws.topicId)
  }

  const tracks: TrackAlignment[] = []
  for (const [trackId, reasons] of because) {
    const track = curriculum.trackById.get(trackId)!
    const topicIds = topicIdsOf(track)
    const completed = topicIds.filter((id) => completedTopics.has(id)).length
    const started = topicIds.filter((id) => !completedTopics.has(id) && startedTopics.has(id)).length
    const share = topicIds.length ? completed / topicIds.length : 0
    const gapStatus: TrackAlignment['gapStatus'] = share >= COVERED_THRESHOLD ? 'covered' : goalTrackIds.has(trackId) || completed > 0 || started > 0 ? 'learning' : 'not_covered'
    tracks.push({
      track,
      because: Array.from(reasons),
      skills: Array.from(skillsByTrack.get(trackId) ?? []),
      inGoal: goalTrackIds.has(trackId),
      topicsTotal: topicIds.length,
      topicsStarted: started,
      topicsCompleted: completed,
      progress: topicIds.length ? Math.round((completed / topicIds.length) * 100) : 0,
      gapStatus,
    })
  }
  // Tracks on the job's career path first, then by how many listed skills they cover, then the ones the learner is already on.
  tracks.sort((a, b) => b.skills.length - a.skills.length || Number(pathTrackIds.has(b.track.id)) - Number(pathTrackIds.has(a.track.id)) || Number(b.inGoal) - Number(a.inGoal) || a.track.title.localeCompare(b.track.title))
  // Keep the list actionable: every skill-backed track plus the most relevant path tracks, at most MAX_TRACKS.
  const limited = tracks.slice(0, Math.max(MAX_TRACKS, tracks.filter((t) => t.skills.length > 0).length))

  return {
    tracks: limited,
    gapTrackIds: limited.filter((t) => t.gapStatus !== 'covered' && !t.inGoal).map((t) => t.track.id),
    uncoveredSkills: allSkills.filter((s) => !covered.has(s)),
    careerPathTitles: paths.map((p) => p.title),
  }
}
