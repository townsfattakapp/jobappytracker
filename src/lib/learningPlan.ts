import type {
  Goal,
  RoadmapDay,
  StudyTask,
  KnowledgeWorkspace,
  RevisionItem,
} from "../types";
import { getCurriculum, type TopicRef } from "./curriculum/registry";
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dayDate = (value?: string | null) => (value ?? "").slice(0, 10);
export const addDays = (value: string, n: number) => {
  const d = new Date(`${dayDate(value)}T12:00:00`);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

/** Every topic across built-in, shared and personal tracks, in curriculum order. */
export function allTopics(): TopicRef[] {
  return getCurriculum().topics;
}

/** Looks a topic or concept id up across every track. */
export function findTopicRef(id: string | undefined | null): TopicRef | undefined {
  return id ? getCurriculum().byId.get(id) : undefined;
}

/** Activities a learner can attach to any topic. Availability per track comes from `activityApplies`. */
export const activities = [
  "Learn Concept",
  "Read Detailed Lesson",
  "Study Worked Examples",
  "Write Personal Notes",
  "Practice Coding",
  "Solve DSA / LeetCode Problems",
  "Create Code Examples",
  "Draw Diagram / Flowchart",
  "Complete Quiz",
  "Complete HLD / LLD Exercise",
  "Complete Engineering Lab",
  "Complete Project Task",
  "Work on Project",
  "Take Mock Interview",
  "Revise Topic",
  "Create Custom Activity",
];

/** Whether an activity makes sense for a track, from its metadata rather than its title. */
export function activityApplies(activity: string, ref: TopicRef | undefined, extras: { hasQuiz?: boolean; hasLesson?: boolean } = {}): boolean {
  const supports = ref?.track.supports || {};
  const kind = ref?.track.kind;
  if (activity === "Complete Quiz") return Boolean(extras.hasQuiz);
  if (activity === "Read Detailed Lesson") return Boolean(extras.hasLesson);
  if (activity === "Solve DSA / LeetCode Problems") return Boolean(supports.leetcode);
  if (activity === "Complete HLD / LLD Exercise") return Boolean(supports.design);
  if (activity === "Complete Engineering Lab") return Boolean(supports.labs);
  if (activity === "Practice Coding" || activity === "Create Code Examples") return supports.coding !== false && Boolean(supports.coding || supports.practice || kind === "language" || kind === "framework" || !ref);
  if (activity === "Complete Project Task" || activity === "Work on Project") return Boolean(supports.project || kind === "projects" || !ref);
  return true;
}

export function makeDay(goal: Goal, date: string): RoadmapDay {
  return {
    id: `${goal.id}:${date}`,
    goalId: goal.id,
    date,
    dayNumber:
      Math.round(
        (Date.parse(date) - Date.parse(dayDate(goal.startDate || goal.createdAt || date))) / 86400000,
      ) + 1,
    tasks: [],
  };
}
export function restDay(goal: Goal, day: RoadmapDay) {
  return (
    day.isRestDay ??
    (goal.restDays ?? []).includes(new Date(`${dayDate(day.date)}T12:00:00`).getDay())
  );
}
export function dayStatus(goal: Goal, day: RoadmapDay) {
  if (!day.tasks.length) return restDay(goal, day) ? "Rest" : "Empty";
  if (day.tasks.every((t) => t.status === "Completed")) return "Completed";
  if (
    dayDate(day.date) < dateKey() &&
    day.tasks.some((t) => t.status !== "Completed" && t.status !== "Skipped")
  )
    return "Overdue";
  if (
    day.tasks.some((t) => t.status === "Completed" || t.status === "InProgress")
  )
    return "Partial";
  return "Planned";
}

/** Topic ids a goal includes for a track (explicit selection minus exclusions and known topics). */
function goalIncludes(goal: Goal, ref: TopicRef): boolean {
  const selection = goal.tracks.find((t) => t.trackId === ref.track.id);
  if (!selection) return false;
  if (selection.topicIds && !selection.topicIds.includes(ref.topic.id)) return false;
  if (selection.excludedTopicIds?.includes(ref.topic.id)) return false;
  if (goal.knownTopicIds?.includes(ref.topic.id)) return false;
  return true;
}

export function proposeDay(
  goal: Goal,
  day: RoadmapDay,
  roadmap: RoadmapDay[],
  workspaces: KnowledgeWorkspace[],
  revisions: RevisionItem[] = [],
): StudyTask[] {
  const { tracks, topics } = getCurriculum();
  let remaining = Math.max(
    0,
    goal.hoursPerDay * 60 -
      day.tasks.reduce((s, t) => s + t.estDurationMinutes, 0),
  );
  const result: StudyTask[] = [];
  const scheduled = roadmap
    .filter((d) => d.goalId === goal.id)
    .flatMap((d) => d.tasks);
  // Practice revisions (DSA problems, design exercises) attach to whichever goal track supports them.
  const trackFor = (entityType: RevisionItem["entityType"]) =>
    goal.tracks
      .map((t) => tracks.find((x) => x.id === t.trackId))
      .find((t) => t && (entityType === "DSA" ? t.supports?.leetcode : entityType === "SystemDesign" ? t.supports?.design : false));
  for (const revision of revisions) {
    const track = trackFor(revision.entityType);
    if (
      !track ||
      dayDate(revision.dueDate) > dayDate(day.date) ||
      remaining < 15
    )
      continue;
    if (
      scheduled.some(
        (t) =>
          t.linkedActivityId === revision.entityId &&
          t.activity === "Revise Topic",
      )
    )
      continue;
    const minutes = Math.min(20, remaining);
    remaining -= minutes;
    result.push({
      id: crypto.randomUUID(),
      dayId: day.id,
      title: `Revise: ${revision.topic || revision.entityType}`,
      type: revision.entityType === "DSA" ? "DSA" : "SystemDesign",
      activity: "Revise Topic",
      linkedActivityId: revision.entityId,
      trackId: track.id,
      status: "Pending",
      priority: "High",
      estDurationMinutes: minutes,
      actualDurationMinutes: 0,
    });
  }
  const priorityOf = (x: TopicRef) => ({ High: 0, Medium: 1, Low: 2 })[goal.tracks.find((t) => t.trackId === x.track.id)!.priority];
  const ranked = topics.filter((x) => goalIncludes(goal, x)).sort((a, b) => priorityOf(a) - priorityOf(b));
  ranked.sort(
    (a, b) =>
      (a.topic.prerequisites?.length || 0) -
      (b.topic.prerequisites?.length || 0),
  );
  const due = ranked.filter((x) =>
    workspaces.some(
      (w) =>
        w.topicId === x.topic.id &&
        w.nextRevisionDate &&
        dayDate(w.nextRevisionDate) <= dayDate(day.date),
    ),
  );
  for (const x of [...due, ...ranked]) {
    const revision = due.includes(x);
    const ws = workspaces.find((w) => w.topicId === x.topic.id);
    if (
      remaining < 15 ||
      result.some((t) => t.topicId === x.topic.id) ||
      day.tasks.some((t) => t.topicId === x.topic.id)
    )
      continue;
    if (
      !revision &&
      (ws?.learningStatus === "Mastered" ||
        scheduled.some(
          (t) => t.topicId === x.topic.id && t.activity === "Learn Concept",
        ))
    )
      continue;
    if (
      !revision &&
      x.topic.prerequisites?.some(
        (id) =>
          !workspaces.some(
            (w) => w.topicId === id && w.learningStatus === "Mastered",
          ) &&
          !result.some((t) => t.topicId === id) &&
          !roadmap
            .filter(
              (d) =>
                d.goalId === goal.id && dayDate(d.date) <= dayDate(day.date),
            )
            .some((d) =>
              d.tasks.some((t) => t.topicId === id && t.status !== "Skipped"),
            ),
      )
    )
      continue;
    const prerequisites = (x.track.prerequisites || []).filter((id) =>
      goal.tracks.some((t) => t.trackId === id),
    );
    if (
      prerequisites.some((id) =>
        topics
          .filter((t) => t.track.id === id)
          .some(
            (t) =>
              !workspaces.some(
                (w) =>
                  w.topicId === t.topic.id && w.learningStatus === "Mastered",
              ),
          ),
      )
    )
      continue;
    const minutes = Math.min(revision ? 20 : 30, remaining);
    remaining -= minutes;
    result.push({
      id: crypto.randomUUID(),
      dayId: day.id,
      title: `${revision ? "Revise Topic" : "Learn Concept"}: ${x.topic.title}`,
      type: revision ? "Revision" : "Concept",
      activity: revision ? "Revise Topic" : "Learn Concept",
      topicId: x.topic.id,
      trackId: x.track.id,
      categoryId: x.category.id,
      status: "Pending",
      priority: goal.tracks.find((t) => t.trackId === x.track.id)!.priority,
      estDurationMinutes: minutes,
      actualDurationMinutes: 0,
    });
  }
  return result;
}
