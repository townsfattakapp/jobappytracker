import { addDays, dayDate, makeDay } from "./learningPlan";
import type {
  CurriculumTrack,
  CurriculumTaskDef,
  CurriculumTopic,
  Goal,
  RoadmapDay,
  StudyTask,
} from "../types";
import { allCurriculums } from "../data/curriculum";

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
};

function buildQueues(goal: Goal, tracks: CurriculumTrack[]): TrackQueue[] {
  const selected = new Set(goal.tracks.map((t) => t.trackId));
  return goal.tracks
    .map((selection) => {
      const track = tracks.find((t) => t.id === selection.trackId);
      if (!track) return null;
      const items: QueueItem[] = [];
      for (const level of track.levels)
        for (const category of level.categories)
          for (const module of category.modules)
            for (const topic of module.topics) {
              const defs = topicStepDefs(topic);
              defs.forEach(({ sub, def }, index) =>
                items.push({
                  trackId: track.id,
                  categoryId: category.id,
                  topicId: topic.id,
                  topicTitle: topic.title,
                  subtopicId: sub.id,
                  def,
                  closesTopic: index === defs.length - 1,
                  priority: selection.priority,
                }),
              );
            }
      const queue: TrackQueue = {
        trackId: track.id,
        weight: PRIORITY_WEIGHT[selection.priority] || 2,
        consumed: 0,
        items,
        prerequisites: track.prerequisites.filter((id) => selected.has(id)),
      };
      return queue;
    })
    .filter((q): q is TrackQueue => q !== null);
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
  if (a.includes("revis") || a.includes("review")) return `Re-read your notes and pitfalls for ${topicTitle}; add a flashcard for anything you forgot.`;
  if (a.includes("diagram")) return `Draw a diagram that explains ${topicTitle} without words.`;
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
  return !goal.restDays.includes(new Date(`${dayDate(day.date)}T12:00:00`).getDay());
}

/**
 * Builds a full roadmap from the goal's tracks:
 * - follows each topic's curriculum tasks in order (learn → examples → code → problems)
 * - interleaves tracks by priority weight, honouring track prerequisites
 * - fills at most `hoursPerDay`, keeping a slice of each day for spaced revision (+3, +7, +14 days)
 * - marks weekly rest days so the calendar shows them
 */
export function generateRoadmap(
  goal: Goal,
  tracks: CurriculumTrack[] = allCurriculums,
): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  for (let i = 0; i < goal.durationDays; i++) {
    const day = makeDay(goal, addDays(goal.startDate, i));
    if (!isStudyDay(goal, day)) {
      day.isRestDay = true;
      day.notes = "Rest Day";
    }
    days.push(day);
  }
  const budget = Math.max(15, Math.round(goal.hoursPerDay * 60));
  const learnBudget = Math.max(15, Math.round(budget * (1 - REVISION_SHARE)));
  const used = days.map(() => 0);
  const queues = buildQueues(goal, tracks.length ? tracks : allCurriculums);
  const pendingRevisions: { dayIndex: number; item: QueueItem }[] = [];

  const finished = (trackId: string) => {
    const q = queues.find((x) => x.trackId === trackId);
    return !q || q.items.length === 0;
  };
  const nextQueue = (): TrackQueue | null => {
    const eligible = queues.filter(
      (q) => q.items.length && q.prerequisites.every(finished),
    );
    const pool = eligible.length ? eligible : queues.filter((q) => q.items.length);
    if (!pool.length) return null;
    return pool.reduce((best, q) =>
      q.consumed / q.weight < best.consumed / best.weight ? q : best,
    );
  };

  let dayIndex = 0;
  let currentTopic: { trackId: string; topicId: string } | null = null;
  while (dayIndex < days.length) {
    // Keep a topic's tasks together instead of bouncing between tracks mid-topic.
    let queue: TrackQueue | null = null;
    if (currentTopic) {
      const q = queues.find((x) => x.trackId === currentTopic!.trackId);
      if (q && q.items[0]?.topicId === currentTopic.topicId) queue = q;
    }
    if (!queue) queue = nextQueue();
    if (!queue) break;
    const item = queue.items[0];
    const minutes = Math.min(item.def.estDurationMinutes || 30, budget);

    // Find the first study day with room for this task.
    while (
      dayIndex < days.length &&
      (days[dayIndex].isRestDay || used[dayIndex] + minutes > learnBudget)
    ) {
      dayIndex++;
    }
    if (dayIndex >= days.length) break;

    const day = days[dayIndex];
    day.tasks.push(taskFrom(item, day, minutes));
    used[dayIndex] += minutes;
    queue.consumed += minutes;
    queue.items.shift();
    currentTopic = { trackId: item.trackId, topicId: item.topicId };
    if (item.closesTopic) {
      currentTopic = null;
      for (const offset of REVISION_OFFSETS_DAYS) {
        pendingRevisions.push({ dayIndex: dayIndex + offset, item });
      }
    }
  }

  // Spaced revision: place each review on its target day or the next study day with room.
  pendingRevisions.sort((a, b) => a.dayIndex - b.dayIndex);
  for (const revision of pendingRevisions) {
    let target = revision.dayIndex;
    while (
      target < days.length &&
      (days[target].isRestDay || used[target] + REVISION_MINUTES > budget)
    ) {
      target++;
    }
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
  }

  return days;
}

export type TrackEstimate = {
  trackId: string;
  title: string;
  topics: number;
  minutes: number;
};

/** Effort per track from the curriculum's own task estimates. */
export function estimateTrack(track: CurriculumTrack): TrackEstimate {
  let topics = 0;
  let minutes = 0;
  for (const level of track.levels)
    for (const category of level.categories)
      for (const module of category.modules)
        for (const topic of module.topics) {
          topics += 1;
          for (const sub of topic.subtopics)
            for (const def of sub.tasks) minutes += def.estDurationMinutes || 30;
        }
  return { trackId: track.id, title: track.title, topics, minutes };
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

export function summarizeRoadmap(
  goal: Goal,
  days: RoadmapDay[],
  tracks: CurriculumTrack[] = allCurriculums,
): RoadmapSummary {
  const selected = goal.tracks
    .map((t) => tracks.find((x) => x.id === t.trackId))
    .filter((t): t is CurriculumTrack => Boolean(t));
  const topicsTotal = selected.reduce((n, t) => n + estimateTrack(t).topics, 0);
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
  return {
    studyDays,
    restDays,
    tasks,
    learnMinutes,
    reviseMinutes,
    topicsCovered: covered.size,
    topicsTotal,
    lastLearningDay,
    emptyStudyDays,
  };
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
  tracks: CurriculumTrack[] = allCurriculums,
): { roadmap: RoadmapDay[]; added: number } {
  const goalEnd = addDays(goal.startDate, goal.durationDays - 1);
  const start = fromDate > goal.startDate ? fromDate : goal.startDate;
  const remainingDays =
    Math.round((Date.parse(goalEnd) - Date.parse(start)) / 86400000) + 1;
  if (remainingDays <= 0) return { roadmap, added: 0 };

  const selection = goal.tracks.find((t) => t.trackId === trackId) || {
    trackId,
    priority: "Medium" as const,
  };
  const generated = generateRoadmap(
    { ...goal, startDate: start, durationDays: remainingDays, tracks: [selection] },
    tracks,
  );
  const budget = Math.max(15, Math.round(goal.hoursPerDay * 60));
  const byDate = new Map<string, RoadmapDay>();
  for (const day of roadmap) if (day.goalId === goal.id) byDate.set(dayDate(day.date), day);
  const next = roadmap.filter((d) => d.goalId !== goal.id);
  const days = generated.map((g) => {
    const existing = byDate.get(dayDate(g.date));
    return existing ? { ...existing, tasks: [...existing.tasks] } : { ...g, tasks: [] };
  });
  // Keep days of this goal that fall outside the generated window untouched.
  for (const [date, day] of byDate) if (!days.some((d) => dayDate(d.date) === date)) days.push(day);
  days.sort((a, b) => dayDate(a.date).localeCompare(dayDate(b.date)));

  let added = 0;
  let cursor = 0;
  const used = days.map((d) => d.tasks.reduce((n, t) => n + t.estDurationMinutes, 0));
  for (const g of generated) {
    for (const task of g.tasks) {
      let i = Math.max(cursor, days.findIndex((d) => dayDate(d.date) === dayDate(g.date)));
      while (i < days.length && (days[i].isRestDay || used[i] + task.estDurationMinutes > budget)) i++;
      if (i >= days.length) break;
      days[i].tasks.push({ ...task, id: crypto.randomUUID(), dayId: days[i].id });
      used[i] += task.estDurationMinutes;
      cursor = i;
      added += 1;
    }
  }
  return { roadmap: [...next, ...days], added };
}
