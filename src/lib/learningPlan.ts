import type {
  Goal,
  RoadmapDay,
  StudyTask,
  KnowledgeWorkspace,
  RevisionItem,
} from "../types";
import { allCurriculums } from "../data/curriculum";
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dayDate = (value?: string | null) => (value ?? "").slice(0, 10);
export const addDays = (value: string, n: number) => {
  const d = new Date(`${dayDate(value)}T12:00:00`);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};
export const topics = allCurriculums.flatMap((track) =>
  track.levels.flatMap((level) =>
    level.categories.flatMap((category) =>
      category.modules.flatMap((module) =>
        module.topics.map((topic) => ({
          track,
          level,
          category,
          module,
          topic,
        })),
      ),
    ),
  ),
);
export const activities = [
  "Learn Concept",
  "Read Detailed Lesson",
  "Study Worked Examples",
  "Practice Coding",
  "Solve DSA / LeetCode Problems",
  "Write Personal Notes",
  "Create Code Examples",
  "Draw Diagram / Flowchart",
  "Complete Quiz",
  "Complete HLD / LLD Exercise",
  "Complete Engineering Lab",
  "Work on Project",
  "Take Mock Interview",
  "Revise Topic",
  "Create Custom Activity",
];
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
export function proposeDay(
  goal: Goal,
  day: RoadmapDay,
  roadmap: RoadmapDay[],
  workspaces: KnowledgeWorkspace[],
  revisions: RevisionItem[] = [],
): StudyTask[] {
  let remaining = Math.max(
    0,
    goal.hoursPerDay * 60 -
      day.tasks.reduce((s, t) => s + t.estDurationMinutes, 0),
  );
  const result: StudyTask[] = [];
  const scheduled = roadmap
    .filter((d) => d.goalId === goal.id)
    .flatMap((d) => d.tasks);
  for (const revision of revisions) {
    const trackId =
      revision.entityType === "DSA"
        ? "track-dsa"
        : revision.entityType === "SystemDesign"
          ? "track-hld"
          : undefined;
    if (
      !trackId ||
      !goal.tracks.some((t) => t.trackId === trackId) ||
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
      status: "Pending",
      priority: "High",
      estDurationMinutes: minutes,
      actualDurationMinutes: 0,
    });
  }
  const ranked = topics
    .filter((x) => goal.tracks.some((t) => t.trackId === x.track.id))
    .sort(
      (a, b) =>
        ({ High: 0, Medium: 1, Low: 2 })[
          goal.tracks.find((t) => t.trackId === a.track.id)!.priority
        ] -
        { High: 0, Medium: 1, Low: 2 }[
          goal.tracks.find((t) => t.trackId === b.track.id)!.priority
        ],
    );
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
    const prerequisites = x.track.prerequisites.filter((id) =>
      allCurriculums.some((t) => t.id === id),
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
