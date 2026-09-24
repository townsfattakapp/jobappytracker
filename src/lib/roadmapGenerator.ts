import { addDays, dayDate, makeDay } from "./learningPlan";
import type {
  CurriculumTrack,
  CurriculumTaskDef,
  CurriculumTopic,
  Goal,
  GoalTrack,
  RoadmapDay,
  StudyTask,
} from "../types";
import { getCurriculum } from "./curriculum/registry";

/** Share of each study day reserved for spaced revision of earlier topics. */
const REVISION_SHARE = 0.2;
const REVISION_OFFSETS_DAYS = [3, 7, 14];
const REVISION_MINUTES = 20;
const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 } as const;

type QueueItem = {
  trackId: string;
  categoryId: string;
  topicId: string;
  topicTitle: string;
  subtopicId: string;
  def: CurriculumTaskDef;
  /** True for the last task of a topic; triggers spaced revision. */
  closesTopic: boolean;
  priority: Goal["tracks"][number]["priority"];
};

type TrackQueue = {
  trackId: string;
  weight: number;
  consumed: number;
  items: QueueItem[];
  prerequisites: string[];
  order: number;
};

function currentTracks(tracks?: CurriculumTrack[]): CurriculumTrack[] {
  return tracks && tracks.length ? tracks : getCurriculum().tracks;
}

/** Topics of a track that a goal actually includes: explicit selection minus exclusions and known topics. */
export function selectedTopics(goal: Pick<Goal, "knownTopicIds">, selection: GoalTrack, track: CurriculumTrack): CurriculumTopic[] {
  const include = selection.topicIds ? new Set(selection.topicIds) : null;
  const exclude = new Set([...(selection.excludedTopicIds || []), ...(goal.knownTopicIds || [])]);
  const out: CurriculumTopic[] = [];
  for (const level of track.levels)
    for (const category of level.categories)
      for (const module of category.modules)
        for (const topic of module.topics) {
          if (include && !include.has(topic.id)) continue;
          if (exclude.has(topic.id)) continue;
          out.push(topic);
        }
  return out;
}

/** Orders topics so every prerequisite (within the selection) comes first, keeping curriculum order otherwise. */
export function orderByPrerequisites(topics: CurriculumTopic[]): CurriculumTopic[] {
  const ids = new Set(topics.map((t) => t.id));
  const placed = new Set<string>();
  const out: CurriculumTopic[] = [];
  const visiting = new Set<string>();
  const byId = new Map(topics.map((t) => [t.id, t]));
  const visit = (topic: CurriculumTopic) => {
    if (placed.has(topic.id) || visiting.has(topic.id)) return;
    visiting.add(topic.id);
    for (const pre of topic.prerequisites || []) {
      const p = ids.has(pre) ? byId.get(pre) : undefined;
      if (p) visit(p);
    }
    visiting.delete(topic.id);
    placed.add(topic.id);
    out.push(topic);
  };
  for (const topic of topics) visit(topic);
  return out;
}

function categoryOf(track: CurriculumTrack, topicId: string): string {
  for (const level of track.levels)
    for (const category of level.categories)
      for (const module of category.modules)
        if (module.topics.some((t) => t.id === topicId)) return category.id;
  return "";
}

function buildQueues(goal: Goal, tracks: CurriculumTrack[], skipTaskIds?: Set<string>): TrackQueue[] {
  const selected = new Set(goal.tracks.map((t) => t.trackId));
  return goal.tracks
    .map((selection, index) => {
      const track = tracks.find((t) => t.id === selection.trackId);
      if (!track) return null;
      const items: QueueItem[] = [];
      for (const topic of orderByPrerequisites(selectedTopics(goal, selection, track))) {
        const categoryId = categoryOf(track, topic.id);
        const defs = topicStepDefs(topic).filter(({ def }) => !skipTaskIds?.has(def.id));
        defs.forEach(({ sub, def }, i) =>
          items.push({
            trackId: track.id,
            categoryId,
            topicId: topic.id,
            topicTitle: topic.title,
            subtopicId: sub.id,
            def,
            closesTopic: i === defs.length - 1,
            priority: selection.priority,
          }),
        );
      }
      const queue: TrackQueue = {
        trackId: track.id,
        weight: PRIORITY_WEIGHT[selection.priority] || 2,
        consumed: 0,
        items,
        prerequisites: (track.prerequisites || []).filter((id) => selected.has(id)),
        order: selection.order ?? index,
      };
      return queue;
    })
    .filter((q): q is TrackQueue => q !== null)
    .sort((a, b) => a.order - b.order);
}

function taskFrom(item: QueueItem, day: RoadmapDay, minutes: number): StudyTask {
  return {
    id: crypto.randomUUID(),
    dayId: day.id,
    title: `${item.def.title}: ${item.topicTitle}`,
    type: item.def.type,
    activity: item.def.title,
    status: "Pending",
    priority: item.priority,
    estDurationMinutes: minutes,
    actualDurationMinutes: 0,
    topicId: item.topicId,
    trackId: item.trackId,
    categoryId: item.categoryId,
    subtopicId: item.subtopicId,
    curriculumTaskId: item.def.id,
    description: item.def.description,
    completionCriteria: criteriaFor(item.def.title, item.topicTitle),
  };
}

/** Curriculum steps for a topic, minus same-day "review" steps (spaced revision covers those). */
export function topicStepDefs(topic: CurriculumTopic): { sub: CurriculumTopic["subtopics"][number]; def: CurriculumTaskDef }[] {
  return topic.subtopics.flatMap((sub) =>
    sub.tasks.filter((def) => def.type !== "Revision" && !/^review/i.test(def.title)).map((def) => ({ sub, def })),
  );
}

/** What "done" means for each kind of step, so cards do not all read the same. */
export function criteriaFor(activity: string, topicTitle: string): string {
  const a = activity.toLowerCase();
  if (a.includes("learn")) return `Understand the idea behind ${topicTitle}; write a 3-line summary note in your own words.`;
  if (a.includes("example")) return `Trace two worked examples step by step; save one to the Examples tab.`;
  if (a.includes("snippet") || a.includes("code")) return `Implement ${topicTitle} from memory in the Practice tab and run it.`;
  if (a.includes("problem")) return `Solve 2–3 problems on ${topicTitle}; log each attempt with what tripped you up.`;
  if (a.includes("exercise") || a.includes("apply")) return `Complete a hands-on exercise on ${topicTitle} and note what you would do differently.`;
  if (a.includes("revis") || a.includes("review")) return `Re-read your notes and pitfalls for ${topicTitle}; add a flashcard for anything you forgot.`;
  if (a.includes("diagram")) return `Draw a diagram that explains ${topicTitle} without words.`;
  if (a.includes("design")) return `Produce a design for ${topicTitle}: requirements, components, trade-offs.`;
  if (a.includes("plan")) return `Write the plan for ${topicTitle}: scope, steps, what done looks like.`;
  if (a.includes("build")) return `Build the next working slice of ${topicTitle} and commit it.`;
  if (a.includes("document")) return `Review the work on ${topicTitle}, fix rough edges and write a short README.`;
  if (a.includes("quiz")) return `Answer every quiz question before checking; turn misses into flashcards.`;
  if (a.includes("note")) return `Write personal notes on ${topicTitle} that you could revise from in five minutes.`;
  if (a.includes("mock")) return `Complete the mock interview and record two things to improve.`;
  return `Finish “${activity.toLowerCase()}” for ${topicTitle} and record what you learned.`;
}

/** Builds the standard step tasks for one topic on one day (used by the day planner's quick picker). */
export function buildTopicTasks(
  day: RoadmapDay,
  info: { track: CurriculumTrack; categoryId: string; topic: CurriculumTopic },
  priority: StudyTask["priority"],
  defIds?: string[],
): StudyTask[] {
  return topicStepDefs(info.topic)
    .filter(({ def }) => !defIds || defIds.includes(def.id))
    .map(({ sub, def }) =>
      taskFrom(
        {
          trackId: info.track.id,
          categoryId: info.categoryId,
          topicId: info.topic.id,
          topicTitle: info.topic.title,
          subtopicId: sub.id,
          def,
          closesTopic: false,
          priority,
        },
        day,
        def.estDurationMinutes || 30,
      ),
    );
}

function isStudyDay(goal: Goal, day: RoadmapDay): boolean {
  return !(goal.restDays || []).includes(new Date(`${dayDate(day.date)}T12:00:00`).getDay());
}

/** Fills study days with queued steps and spaced revisions. Shared by full generation and re-planning. */
function schedule(
  goal: Goal,
  days: RoadmapDay[],
  used: number[],
  queues: TrackQueue[],
  opts: { markRestDays: boolean; startIndex?: number },
): number {
  const budget = Math.max(15, Math.round(goal.hoursPerDay * 60));
  const learnBudget = Math.max(15, Math.round(budget * (1 - REVISION_SHARE)));
  const pendingRevisions: { dayIndex: number; item: QueueItem }[] = [];
  let added = 0;
  if (opts.markRestDays)
    for (const day of days)
      if (!isStudyDay(goal, day)) {
        day.isRestDay = true;
        day.notes = day.notes || "Rest Day";
      }

  const finished = (trackId: string) => {
    const q = queues.find((x) => x.trackId === trackId);
    return !q || q.items.length === 0;
  };
  const nextQueue = (): TrackQueue | null => {
    const eligible = queues.filter((q) => q.items.length && q.prerequisites.every(finished));
    const pool = eligible.length ? eligible : queues.filter((q) => q.items.length);
    if (!pool.length) return null;
    return pool.reduce((best, q) => (q.consumed / q.weight < best.consumed / best.weight ? q : best));
  };

  let dayIndex = opts.startIndex ?? 0;
  let currentTopic: { trackId: string; topicId: string } | null = null;
  while (dayIndex < days.length) {
    let queue: TrackQueue | null = null;
    if (currentTopic) {
      const q = queues.find((x) => x.trackId === currentTopic!.trackId);
      if (q && q.items[0]?.topicId === currentTopic.topicId) queue = q;
    }
    if (!queue) queue = nextQueue();
    if (!queue) break;
    const item = queue.items[0];
    const minutes = Math.min(item.def.estDurationMinutes || 30, budget);
    while (dayIndex < days.length && (days[dayIndex].isRestDay || used[dayIndex] + minutes > learnBudget)) dayIndex++;
    if (dayIndex >= days.length) break;
    const day = days[dayIndex];
    day.tasks.push(taskFrom(item, day, minutes));
    used[dayIndex] += minutes;
    queue.consumed += minutes;
    queue.items.shift();
    added += 1;
    currentTopic = { trackId: item.trackId, topicId: item.topicId };
    if (item.closesTopic) {
      currentTopic = null;
      for (const offset of REVISION_OFFSETS_DAYS) pendingRevisions.push({ dayIndex: dayIndex + offset, item });
    }
  }

  pendingRevisions.sort((a, b) => a.dayIndex - b.dayIndex);
  for (const revision of pendingRevisions) {
    let target = revision.dayIndex;
    while (target < days.length && (days[target].isRestDay || used[target] + REVISION_MINUTES > budget)) target++;
    if (target >= days.length) continue;
    const day = days[target];
    day.tasks.push({
      id: crypto.randomUUID(),
      dayId: day.id,
      title: `Revise Topic: ${revision.item.topicTitle}`,
      type: "Revision",
      activity: "Revise Topic",
      status: "Pending",
      priority: revision.item.priority,
      estDurationMinutes: REVISION_MINUTES,
      actualDurationMinutes: 0,
      topicId: revision.item.topicId,
      trackId: revision.item.trackId,
      categoryId: revision.item.categoryId,
      completionCriteria: criteriaFor("Revise Topic", revision.item.topicTitle),
    });
    used[target] += REVISION_MINUTES;
    added += 1;
  }
  return added;
}

/**
 * Builds a full roadmap from the goal's curriculum selection:
 * - follows each included topic's steps in order (learn → examples → practice), prerequisites first
 * - interleaves tracks by priority weight, honouring track prerequisites and track order
 * - fills at most `hoursPerDay`, keeping a slice of each day for spaced revision (+3, +7, +14 days)
 * - only the goal's chosen rest days are rest days; empty study days stay empty (never auto-marked)
 */
export function generateRoadmap(goal: Goal, tracks?: CurriculumTrack[]): RoadmapDay[] {
  const all = currentTracks(tracks);
  const days: RoadmapDay[] = [];
  for (let i = 0; i < goal.durationDays; i++) days.push(makeDay(goal, addDays(goal.startDate, i)));
  const used = days.map(() => 0);
  schedule(goal, days, used, buildQueues(goal, all), { markRestDays: true });
  return days;
}

/**
 * Re-plans only what is unplanned: schedules every curriculum step of the goal's
 * selection that is not already on the roadmap (completed, in progress, skipped
 * or manually scheduled tasks are all kept where they are), from `fromDate`
 * onward, into the time each day still has free. Nothing existing is moved.
 */
export function fillRoadmap(
  goal: Goal,
  roadmap: RoadmapDay[],
  fromDate: string,
  tracks?: CurriculumTrack[],
): { roadmap: RoadmapDay[]; added: number } {
  const all = currentTracks(tracks);
  const goalEnd = addDays(goal.startDate, goal.durationDays - 1);
  const start = fromDate > goal.startDate ? fromDate : goal.startDate;
  const remainingDays = Math.round((Date.parse(goalEnd) - Date.parse(start)) / 86400000) + 1;
  if (remainingDays <= 0) return { roadmap, added: 0 };

  const existing = roadmap.filter((d) => d.goalId === goal.id);
  const already = new Set<string>();
  for (const day of existing) for (const task of day.tasks) if (task.curriculumTaskId && task.status !== "Skipped") already.add(task.curriculumTaskId);

  const byDate = new Map<string, RoadmapDay>();
  for (const day of existing) byDate.set(dayDate(day.date), day);
  const window: RoadmapDay[] = [];
  for (let i = 0; i < remainingDays; i++) {
    const date = addDays(start, i);
    const day = byDate.get(date);
    window.push(day ? { ...day, tasks: [...day.tasks] } : makeDay(goal, date));
  }
  const used = window.map((d) => d.tasks.reduce((n, t) => n + t.estDurationMinutes, 0));
  for (const day of window) if (day.isRestDay === undefined && !isStudyDay(goal, day)) day.isRestDay = true;
  const added = schedule(goal, window, used, buildQueues(goal, all, already), { markRestDays: false });

  const untouched = roadmap.filter((d) => d.goalId !== goal.id || !window.some((w) => dayDate(w.date) === dayDate(d.date)));
  const merged = [...untouched, ...window.filter((d) => d.tasks.length || byDate.has(dayDate(d.date)) || d.isRestDay)];
  merged.sort((a, b) => dayDate(a.date).localeCompare(dayDate(b.date)));
  return { roadmap: merged, added };
}

/**
 * Schedules one newly added track into an existing roadmap from today onward,
 * filling only the time each day still has free. Existing tasks are never moved.
 */
export function scheduleTrackIntoRoadmap(
  goal: Goal,
  roadmap: RoadmapDay[],
  trackId: string,
  fromDate: string,
  tracks?: CurriculumTrack[],
): { roadmap: RoadmapDay[]; added: number } {
  const selection = goal.tracks.find((t) => t.trackId === trackId) || { trackId, priority: "Medium" as const };
  return fillRoadmap({ ...goal, tracks: [selection] }, roadmap, fromDate, tracks);
}

export type TrackEstimate = {
  trackId: string;
  title: string;
  topics: number;
  minutes: number;
};

/** Effort per track from the curriculum's own task estimates (optionally for a goal's selection only). */
export function estimateTrack(track: CurriculumTrack, selection?: GoalTrack, goal?: Pick<Goal, "knownTopicIds">): TrackEstimate {
  const topics = selection ? selectedTopics(goal || {}, selection, track) : track.levels.flatMap((l) => l.categories.flatMap((c) => c.modules.flatMap((m) => m.topics)));
  let minutes = 0;
  for (const topic of topics) for (const sub of topic.subtopics) for (const def of sub.tasks) minutes += def.estDurationMinutes || 30;
  return { trackId: track.id, title: track.title, topics: topics.length, minutes };
}

/** Days needed to finish the selection at the goal's pace (learning time only, revision excluded). */
export function estimateDays(goal: Pick<Goal, "hoursPerDay" | "restDays" | "knownTopicIds" | "tracks">, tracks?: CurriculumTrack[]): { minutes: number; topics: number; days: number } {
  const all = currentTracks(tracks);
  let minutes = 0;
  let topics = 0;
  for (const selection of goal.tracks) {
    const track = all.find((t) => t.id === selection.trackId);
    if (!track) continue;
    const est = estimateTrack(track, selection, goal);
    minutes += est.minutes;
    topics += est.topics;
  }
  const studyDaysPerWeek = 7 - (goal.restDays || []).length;
  const perDay = Math.max(15, goal.hoursPerDay * 60 * (1 - REVISION_SHARE));
  const studyDays = Math.ceil(minutes / perDay);
  const days = studyDaysPerWeek > 0 ? Math.ceil((studyDays * 7) / studyDaysPerWeek) : Infinity;
  return { minutes, topics, days };
}

export type RoadmapSummary = {
  studyDays: number;
  restDays: number;
  tasks: number;
  learnMinutes: number;
  reviseMinutes: number;
  topicsCovered: number;
  topicsTotal: number;
  /** Day number on which the last learning task lands (0 when nothing scheduled). */
  lastLearningDay: number;
  emptyStudyDays: number;
};

export function summarizeRoadmap(goal: Goal, days: RoadmapDay[], tracks?: CurriculumTrack[]): RoadmapSummary {
  const all = currentTracks(tracks);
  let topicsTotal = 0;
  for (const selection of goal.tracks) {
    const track = all.find((x) => x.id === selection.trackId);
    if (track) topicsTotal += estimateTrack(track, selection, goal).topics;
  }
  const covered = new Set<string>();
  let learnMinutes = 0;
  let reviseMinutes = 0;
  let tasks = 0;
  let lastLearningDay = 0;
  let studyDays = 0;
  let restDays = 0;
  let emptyStudyDays = 0;
  for (const day of days) {
    if (day.isRestDay) {
      restDays += 1;
      continue;
    }
    studyDays += 1;
    if (!day.tasks.length) emptyStudyDays += 1;
    for (const task of day.tasks) {
      tasks += 1;
      if (task.activity === "Revise Topic") {
        reviseMinutes += task.estDurationMinutes;
      } else {
        learnMinutes += task.estDurationMinutes;
        if (task.topicId) covered.add(task.topicId);
        lastLearningDay = Math.max(lastLearningDay, day.dayNumber);
      }
    }
  }
  return { studyDays, restDays, tasks, learnMinutes, reviseMinutes, topicsCovered: covered.size, topicsTotal, lastLearningDay, emptyStudyDays };
}
