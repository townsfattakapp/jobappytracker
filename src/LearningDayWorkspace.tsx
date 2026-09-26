import { useMemo, useState } from "react";
import type {
  Goal,
  RoadmapDay,
  StudyTask,
  KnowledgeWorkspace,
  RevisionItem,
} from "./types";
import {
  addDays,
  dateKey,
  dayDate,
  dayStatus,
  makeDay,
  proposeDay,
  restDay,
  allTopics,
} from "./lib/learningPlan";
import { buildTopicTasks, topicStepDefs } from "./lib/roadmapGenerator";
import { useCurriculum } from "./lib/curriculum/useCurriculum";
import type { PickerContext } from "./components/LearningTaskPicker";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type TopicGroup = {
  key: string;
  title: string;
  breadcrumb: string;
  tasks: StudyTask[];
  priority: StudyTask["priority"];
};

/** One card per topic: the day's steps for that topic as a checklist instead of five look-alike cards. */
function groupByTopic(tasks: StudyTask[]): TopicGroup[] {
  const groups = new Map<string, TopicGroup>();
  for (const task of tasks) {
    const info = task.topicId
      ? allTopics().find((x) => x.topic.id === task.topicId)
      : allTopics().find((x) => x.topic.subtopics.some((s) => s.tasks.some((t) => t.id === task.curriculumTaskId)));
    const key = info ? `topic:${info.topic.id}` : `task:${task.id}`;
    const existing = groups.get(key);
    if (existing) {
      existing.tasks.push(task);
      continue;
    }
    groups.set(key, {
      key,
      title: info ? info.topic.title : task.title,
      breadcrumb: info ? `${info.track.title} • ${info.category.title}` : "Custom task",
      tasks: [task],
      priority: task.priority,
    });
  }
  return [...groups.values()];
}

function stepLabel(task: StudyTask, groupTitle: string): string {
  // "Learn Concept: Input/output" -> "Learn Concept" inside the topic card; custom titles stay as-is.
  const suffix = `: ${groupTitle}`;
  return task.title.endsWith(suffix) ? task.title.slice(0, -suffix.length) : task.title;
}

function StepRow({
  task,
  groupTitle,
  date,
  goalId,
  isPast,
  update,
  onStart,
  onPick,
  onDelete,
  onCarryForward,
}: {
  task: StudyTask;
  groupTitle: string;
  date: string;
  goalId: string;
  isPast: boolean;
  update: (id: string, updates: Partial<StudyTask>) => void;
  onStart: (task: StudyTask) => void;
  onPick: (context: PickerContext) => void;
  onDelete: (task: StudyTask) => void;
  onCarryForward: (task: StudyTask) => void;
}) {
  const done = task.status === "Completed";
  return (
    <li data-task className={`flex flex-col gap-2 py-3 ${done ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={done ? "Mark as not completed" : "Mark as completed"}
          aria-pressed={done}
          onClick={() => update(task.id, { status: done ? "Pending" : "Completed" })}
          className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
            done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary/60"
          }`}
        >
          {done && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h4 className={`font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              <span className="sr-only">{task.title}</span>
              <span aria-hidden="true">{stepLabel(task, groupTitle)}</span>
            </h4>
            <span className="text-xs text-muted-foreground">⏱ {task.estDurationMinutes} min</span>
            {task.status === "InProgress" && <span className="text-xs font-semibold text-primary">In progress</span>}
            {task.actualDurationMinutes > 0 && <span className="text-xs text-muted-foreground">{task.actualDurationMinutes} min logged</span>}
          </div>
          {task.completionCriteria && !done && <p className="text-xs text-muted-foreground mt-1">{task.completionCriteria}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onStart(task)}>
            Open
          </button>
          <details className="relative">
            <summary className="btn btn-ghost btn-sm">More</summary>
            <div className="absolute right-0 z-20 mt-2 w-72 surface rounded-xl p-3 space-y-2 shadow-lg">
              <button className="btn btn-ghost btn-sm w-full justify-start" onClick={() => onPick({ date, goalId, task })}>
                Edit / reschedule
              </button>
              <button
                className="btn btn-ghost btn-sm w-full justify-start"
                onClick={() => onPick({ date: addDays(date, 1), goalId, topicId: task.topicId, activity: "Revise Topic" })}
              >
                Schedule revision tomorrow
              </button>
              {isPast && !done && (
                <button className="btn btn-ghost btn-sm w-full justify-start" onClick={() => onCarryForward(task)}>
                  Carry forward to today
                </button>
              )}
              <label className="block">
                Actual study time (minutes)
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  value={task.actualDurationMinutes}
                  onChange={(e) => update(task.id, { actualDurationMinutes: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
              <button className="btn btn-ghost btn-sm w-full justify-start text-destructive" onClick={() => onDelete(task)}>
                Delete task
              </button>
            </div>
          </details>
        </div>
      </div>
    </li>
  );
}

export default function LearningDayWorkspace({
  goals,
  onGoals,
  goalId,
  onGoal,
  roadmap,
  onChange,
  onPick,
  onStart,
  workspaces,
  revisions,
  mode,
  onCreate,
  onTracks,
  selectedDate,
  onDate,
  onDeleteGoal,
  onOpenRevision,
  onEditCurriculum,
  onReplan,
}: {
  goals: Goal[];
  onGoals: (goals: Goal[]) => void;
  goalId: string;
  onGoal: (id: string) => void;
  roadmap: RoadmapDay[];
  onChange: (days: RoadmapDay[]) => void;
  onPick: (context: PickerContext) => void;
  onStart: (task: StudyTask) => void;
  workspaces: KnowledgeWorkspace[];
  revisions: RevisionItem[];
  mode: "today" | "roadmap";
  onCreate: () => void;
  onTracks: () => void;
  selectedDate: string;
  onDate: (date: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  /** Opens the curriculum builder for this goal. */
  onEditCurriculum?: (goalId: string) => void;
  /** Schedules every unplanned topic of the goal into free days from today. */
  onReplan?: (goalId: string) => void;
  /** Opens a topic's Revision tab (used by the flashcards-due banner). */
  onOpenRevision?: (topicId: string) => void;
}) {
  const goal =
    goals.find((g) => g.id === goalId) ||
    goals.find((g) => g.status === "Active") ||
    goals[0];
  const { tracks: allCurriculums, topics } = useCurriculum();
  const [view, setView] = useState("Week"),
    [preview, setPreview] = useState<StudyTask[] | null>(null),
    [message, setMessage] = useState("");
  // Quick picker: choose a track → category → topic → steps for the selected day.
  const [pickTrack, setPickTrack] = useState(""),
    [pickCategory, setPickCategory] = useState(""),
    [pickTopic, setPickTopic] = useState(""),
    [pickSteps, setPickSteps] = useState<string[] | null>(null);
  const pickOptions = useMemo(() => {
    const track = allCurriculums.find((t) => t.id === pickTrack);
    const categories = track ? track.levels.flatMap((l) => l.categories) : [];
    const category = categories.find((c) => c.id === pickCategory);
    const topicList = category ? category.modules.flatMap((m) => m.topics) : [];
    const topic = topicList.find((t) => t.id === pickTopic);
    return { track, categories, category, topicList, topic, steps: topic ? topicStepDefs(topic) : [] };
  }, [pickTrack, pickCategory, pickTopic]);

  if (!goal)
    return (
      <div className="surface rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center animate-fade">
        <span className="text-5xl mb-4" aria-hidden="true">🎯</span>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Create a goal to start learning</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Pick a target role, choose learning tracks, and Prep will lay out a day-by-day study plan you can adjust anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn btn-primary" onClick={onCreate}>
            Create your goal
          </button>
          <button className="btn btn-ghost" onClick={onTracks}>
            Browse learning tracks
          </button>
        </div>
      </div>
    );
  const date = mode === "today" ? dateKey() : selectedDate;
  const day =
    roadmap.find((d) => d.goalId === goal.id && dayDate(d.date) === date) ||
    makeDay(goal, date);
  const setDay = (next: RoadmapDay) =>
    onChange(
      roadmap.some((d) => d === day)
        ? roadmap.map((d) => (d === day ? next : d))
        : [...roadmap, next],
    );
  const update = (id: string, updates: Partial<StudyTask>) =>
    setDay({
      ...day,
      tasks: day.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  const removeTasks = (ids: string[]) => setDay({ ...day, tasks: day.tasks.filter((t) => !ids.includes(t.id)) });
  const moveTasks = (tasks: StudyTask[], targetDate: string) => {
    if (!targetDate || targetDate === date) return;
    const ids = new Set(tasks.map((t) => t.id));
    const target =
      roadmap.find((d) => d.goalId === goal.id && dayDate(d.date) === targetDate) || makeDay(goal, targetDate);
    onChange([
      ...roadmap.filter((d) => d !== day && d !== target),
      { ...day, tasks: day.tasks.filter((t) => !ids.has(t.id)) },
      { ...target, tasks: [...target.tasks, ...tasks.map((t) => ({ ...t, dayId: target.id }))] },
    ]);
  };
  const days = Array.from({ length: goal.durationDays }, (_, i) => {
    const d = addDays(goal.startDate, i);
    return (
      roadmap.find((r) => r.goalId === goal.id && dayDate(r.date) === d) ||
      makeDay(goal, d)
    );
  });
  for (const d of roadmap.filter((d) => d.goalId === goal.id))
    if (!days.some((x) => dayDate(x.date) === dayDate(d.date))) days.push(d);
  days.sort((a, b) => dayDate(a.date).localeCompare(dayDate(b.date)));
  const visible = days.filter(
    (d) =>
      view === "Full Roadmap" ||
      (view === "Today"
        ? dayDate(d.date) === dateKey()
        : view === "Month"
          ? dayDate(d.date).slice(0, 7) === date.slice(0, 7)
          : dayDate(d.date) >=
              addDays(date, -new Date(`${date}T12:00:00`).getDay()) &&
            dayDate(d.date) <=
              addDays(date, 6 - new Date(`${date}T12:00:00`).getDay())),
  );
  const completed = day.tasks.filter((t) => t.status === "Completed").length;
  const plannedMinutes = day.tasks.reduce((s, t) => s + t.estDurationMinutes, 0);
  const studiedMinutes = day.tasks.reduce((s, t) => s + t.actualDurationMinutes, 0);
  const remainingMinutes = Math.max(0, goal.hoursPerDay * 60 - plannedMinutes);
  const isRest = restDay(goal, day);
  const isPast = date < dateKey();
  const groups = groupByTopic(day.tasks);
  const colors: Record<string, string> = {
    Empty: "border-border",
    Rest: "border-purple-500/70 bg-purple-500/10",
    Planned: "border-blue-500/70 bg-blue-500/10",
    Completed: "border-emerald-500/70 bg-emerald-500/10",
    Partial: "border-amber-500/70 bg-amber-500/10",
    Overdue: "border-red-500/70 bg-red-500/10",
  };
  const orphanDays = roadmap.some((d) => !goals.some((g) => g.id === d.goalId));
  const todayStr = dateKey();
  const dueDecks = workspaces
    .map((w) => ({
      topicId: w.topicId,
      title: topics.find((x) => x.topic.id === w.topicId)?.topic.title || w.topicId,
      due: w.flashcards.filter((c) => !c.dueDate || c.dueDate.slice(0, 10) <= todayStr).length,
      revisionDue: Boolean(w.nextRevisionDate && w.nextRevisionDate.slice(0, 10) <= todayStr),
    }))
    .filter((d) => d.due > 0 || d.revisionDue);
  const dueCards = dueDecks.reduce((n, d) => n + d.due, 0);

  const addPickedTopic = () => {
    if (!pickOptions.track || !pickOptions.category || !pickOptions.topic) return;
    const chosen = pickSteps ?? pickOptions.steps.map((s) => s.def.id);
    const already = new Set(day.tasks.map((t) => t.curriculumTaskId).filter(Boolean));
    const priority = goal.tracks.find((t) => t.trackId === pickOptions.track!.id)?.priority || "Medium";
    const fresh = buildTopicTasks(
      day,
      { track: pickOptions.track, categoryId: pickOptions.category.id, topic: pickOptions.topic },
      priority,
      chosen,
    ).filter((t) => !already.has(t.curriculumTaskId));
    if (!fresh.length) {
      setMessage("Those steps are already on this day.");
      return;
    }
    setDay({ ...day, tasks: [...day.tasks, ...fresh] });
    setMessage(`Added ${fresh.length} step${fresh.length > 1 ? "s" : ""} for ${pickOptions.topic.title}.`);
    setPickTopic("");
    setPickSteps(null);
  };

  return (
    <div className="space-y-5 plan-surface">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="min-w-[14rem] flex-1 sm:flex-none">
          Goal
          <select
            aria-label="Goal"
            className="input-field"
            value={goal.id}
            onChange={(e) => {
              onGoal(e.target.value);
              setPreview(null);
            }}
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.targetRole}
                {g.status !== "Active" ? ` · ${g.status}` : ""}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-ghost" onClick={onCreate}>
          New goal
        </button>
        <button className="btn btn-ghost" onClick={onTracks}>
          Learning tracks
        </button>
      </div>
      <details className="surface rounded-xl p-4">
        <summary>Goal schedule and priorities</summary>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              Goal duration (days)
              <input
                className="input-field"
                type="number"
                min="1"
                max="3650"
                value={goal.durationDays}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (n >= 1 && n <= 3650)
                    onGoals(
                      goals.map((g) =>
                        g.id === goal.id
                          ? { ...g, durationDays: n, updatedAt: new Date().toISOString() }
                          : g,
                      ),
                    );
                }}
              />
            </label>
            <label className="block">
              Study hours per day
              <input
                className="input-field"
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                value={goal.hoursPerDay}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (n > 0 && n <= 24)
                    onGoals(
                      goals.map((g) =>
                        g.id === goal.id ? { ...g, hoursPerDay: n } : g,
                      ),
                    );
                }}
              />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Changing the duration keeps every existing task, including dates outside the new range.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              Target role
              <input
                className="input-field"
                value={goal.targetRole}
                onChange={(e) =>
                  onGoals(goals.map((g) => (g.id === goal.id ? { ...g, targetRole: e.target.value, updatedAt: new Date().toISOString() } : g)))
                }
              />
            </label>
            <label className="block">
              Goal status
              <select
                aria-label="Goal status"
                className="input-field"
                value={goal.status}
                onChange={(e) =>
                  onGoals(
                    goals.map((g) =>
                      g.id === goal.id ? { ...g, status: e.target.value as Goal["status"], updatedAt: new Date().toISOString() } : g,
                    ),
                  )
                }
              >
                {["Active", "Paused", "Completed", "Archived"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Weekly rest days (optional)</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((name, index) => (
                <label key={name} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground cursor-pointer hover:bg-muted">
                  <input
                    type="checkbox"
                    className="touch-check"
                    checked={goal.restDays.includes(index)}
                    onChange={(e) =>
                      onGoals(
                        goals.map((g) =>
                          g.id === goal.id
                            ? {
                                ...g,
                                restDays: e.target.checked
                                  ? [...g.restDays, index]
                                  : g.restDays.filter((d) => d !== index),
                              }
                            : g,
                        ),
                      )
                    }
                  />
                  {name.slice(0, 3)}
                </label>
              ))}
            </div>
          </div>
          {goal.tracks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goal.tracks.map((track) => (
                <label className="block" key={track.trackId}>
                  {topics.find((x) => x.track.id === track.trackId)?.track.title || track.trackId} priority
                  <select
                    className="input-field"
                    value={track.priority}
                    onChange={(e) =>
                      onGoals(
                        goals.map((g) =>
                          g.id === goal.id
                            ? {
                                ...g,
                                tracks: g.tracks.map((t) =>
                                  t.trackId === track.trackId
                                    ? { ...t, priority: e.target.value as "High" | "Medium" | "Low" }
                                    : t,
                                ),
                              }
                            : g,
                        ),
                      )
                    }
                  >
                    {["High", "Medium", "Low"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
          {(onEditCurriculum || onReplan) && (
            <div className="rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Curriculum and plan</p>
                <p className="text-sm text-muted-foreground">
                  {goal.tracks.length} track{goal.tracks.length === 1 ? "" : "s"}
                  {goal.knownTopicIds?.length ? ` · ${goal.knownTopicIds.length} topics marked as known` : ""}. Add or remove tracks and topics, then re-plan only the days that are still free.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {onEditCurriculum && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => onEditCurriculum(goal.id)}>
                    Build my curriculum
                  </button>
                )}
                {onReplan && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReplan(goal.id)}>
                    Re-plan unplanned topics
                  </button>
                )}
              </div>
            </div>
          )}
          {onDeleteGoal && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-destructive">Delete this goal</p>
                <p className="text-sm text-muted-foreground">
                  Removes the goal and its {roadmap.filter((d) => d.goalId === goal.id).reduce((n, d) => n + d.tasks.length, 0)} scheduled tasks.
                  Your notes, examples, diagrams and attempts are kept.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost text-destructive shrink-0"
                onClick={() => {
                  if (confirm(`Delete the goal “${goal.targetRole}” and all of its scheduled tasks? Notes and learning work are kept.`))
                    onDeleteGoal(goal.id);
                }}
              >
                Delete goal
              </button>
            </div>
          )}
        </div>
      </details>
      {orphanDays && (
        <div className="surface rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Some older roadmap days have no matching goal. Their tasks are preserved.
          </p>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              onChange(
                roadmap.map((d) =>
                  !goals.some((g) => g.id === d.goalId)
                    ? { ...d, goalId: goal.id }
                    : d,
                ),
              )
            }
          >
            Attach them to this goal
          </button>
        </div>
      )}
      {!goal.tracks.length && (
        <div className="surface rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 border-amber-500/40">
          <p className="text-sm text-foreground">
            No learning tracks selected. Choose tracks for automatic planning, or add tasks manually.
          </p>
          <button className="btn btn-ghost btn-sm" onClick={onTracks}>
            Choose tracks
          </button>
        </div>
      )}
      {mode === "today" && dueDecks.length > 0 && onOpenRevision && (
        <section className="surface rounded-xl p-4 border-amber-500/40 space-y-3" aria-label="Revision due">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="!text-base flex items-center gap-2">
              <span aria-hidden="true">🃏</span>
              {dueCards > 0 ? `${dueCards} flashcard${dueCards === 1 ? "" : "s"} due today` : "Revision due today"}
              <span className="text-xs font-normal text-muted-foreground">across {dueDecks.length} topic{dueDecks.length === 1 ? "" : "s"}</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {dueDecks.slice(0, 8).map((d) => (
              <button key={d.topicId} type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenRevision(d.topicId)}>
                {d.title}
                {d.due > 0 && <span className="ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">{d.due}</span>}
                {d.due === 0 && d.revisionDue && <span className="ml-1 text-[11px] text-amber-500">revise</span>}
              </button>
            ))}
          </div>
        </section>
      )}
      {mode === "roadmap" && (
        <section className="surface rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2>{goal.durationDays}-day calendar</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="view-toggle">
                {["Today", "Week", "Month", "Full Roadmap"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => {
                      setView(v);
                      if (v === "Today") onDate(dateKey());
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <label className="sr-only" htmlFor="plan-date">
                Select date
              </label>
              <input
                id="plan-date"
                aria-label="Select date"
                className="input-field w-auto"
                type="date"
                value={date}
                onChange={(e) => {
                  if (e.target.value) onDate(e.target.value);
                  setPreview(null);
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {visible.map((d) => {
              const status = dayStatus(goal, d);
              const topicCount = groupByTopic(d.tasks).length;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-label={`Day ${d.dayNumber} ${dayDate(d.date)}`}
                  aria-pressed={dayDate(d.date) === date}
                  onClick={() => {
                    onDate(dayDate(d.date));
                    setPreview(null);
                  }}
                  className={`day-cell ${colors[status]} ${dayDate(d.date) === date ? "ring-2 ring-primary" : ""}`}
                >
                  <strong className="text-foreground">Day {d.dayNumber}</strong>
                  <span className="text-muted-foreground">{dayDate(d.date).slice(5)}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayDate(d.date) === dateKey() ? "Today · " : ""}
                    {status}
                    {topicCount ? ` · ${topicCount} topic${topicCount > 1 ? "s" : ""}` : ""}
                  </span>
                </button>
              );
            })}
            {!visible.length && (
              <p className="col-span-full text-sm text-muted-foreground">No days in this range.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Empty · Planned · Partial · Completed · Overdue · Rest. The ring marks the selected day.
          </p>
        </section>
      )}
      <section className="surface rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="!text-2xl">
              Day {day.dayNumber} ·{" "}
              {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1" aria-live="polite">
              {groups.length} topic{groups.length === 1 ? "" : "s"} · {completed} / {day.tasks.length} tasks done · {plannedMinutes} min planned · {studiedMinutes} min logged
              {day.tasks.length ? ` · ${Math.round((completed / day.tasks.length) * 100)}%` : ""}
            </p>
          </div>
          {day.tasks.length > 0 && (
            <div className="w-full sm:w-48">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full ig-gradient-soft transition-all"
                  style={{ width: `${day.tasks.length ? Math.round((completed / day.tasks.length) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={() => onPick({ date, goalId: goal.id })}>
            {isRest ? "☕ Add an optional task" : "+ Add task"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setPreview(proposeDay(goal, day, roadmap, workspaces, revisions));
              setMessage("");
            }}
          >
            ✨ Generate day plan
          </button>
          <button className="btn btn-ghost" onClick={() => setDay({ ...day, isRestDay: !isRest })}>
            {isRest ? "Make it a study day" : "Mark as rest day"}
          </button>
        </div>

        <details className="rounded-xl border border-dashed border-border p-4">
          <summary>Choose what to learn on this day</summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              Track
              <select
                aria-label="Pick track"
                className="input-field"
                value={pickTrack}
                onChange={(e) => {
                  setPickTrack(e.target.value);
                  setPickCategory("");
                  setPickTopic("");
                  setPickSteps(null);
                }}
              >
                <option value="">Choose a track…</option>
                {allCurriculums.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                    {goal.tracks.some((g) => g.trackId === t.id) ? " ✓" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Category
              <select
                aria-label="Pick category"
                className="input-field"
                value={pickCategory}
                disabled={!pickTrack}
                onChange={(e) => {
                  setPickCategory(e.target.value);
                  setPickTopic("");
                  setPickSteps(null);
                }}
              >
                <option value="">Choose a category…</option>
                {pickOptions.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Topic
              <select
                aria-label="Pick topic"
                className="input-field"
                value={pickTopic}
                disabled={!pickCategory}
                onChange={(e) => {
                  setPickTopic(e.target.value);
                  setPickSteps(null);
                }}
              >
                <option value="">Choose a topic…</option>
                {pickOptions.topicList.map((t) => {
                  const ws = workspaces.find((w) => w.topicId === t.id);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.title}
                      {ws?.learningStatus && ws.learningStatus !== "Not Started" ? ` · ${ws.learningStatus}` : ""}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          {pickOptions.topic && (
            <div className="mt-3 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Steps to add</p>
              <div className="flex flex-wrap gap-2">
                {pickOptions.steps.map(({ def }) => {
                  const chosen = (pickSteps ?? pickOptions.steps.map((s) => s.def.id)).includes(def.id);
                  return (
                    <label
                      key={def.id}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm cursor-pointer ${chosen ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
                    >
                      <input
                        type="checkbox"
                        className="touch-check"
                        checked={chosen}
                        onChange={(e) => {
                          const current = pickSteps ?? pickOptions.steps.map((s) => s.def.id);
                          setPickSteps(e.target.checked ? [...current, def.id] : current.filter((id) => id !== def.id));
                        }}
                      />
                      {def.title} · {def.estDurationMinutes} min
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-primary" onClick={addPickedTopic} disabled={(pickSteps ?? pickOptions.steps).length === 0}>
                  Add to this day
                </button>
                <span className="text-xs text-muted-foreground">
                  {(pickSteps ?? pickOptions.steps.map((s) => s.def.id)).length} steps ·{" "}
                  {pickOptions.steps
                    .filter((s) => (pickSteps ?? pickOptions.steps.map((x) => x.def.id)).includes(s.def.id))
                    .reduce((n, s) => n + (s.def.estDurationMinutes || 30), 0)}{" "}
                  min · {remainingMinutes} min free today
                </span>
              </div>
            </div>
          )}
        </details>

        {!day.tasks.length && (
          <div className="py-10 text-center border-2 border-dashed border-border rounded-xl bg-muted/10 animate-fade">
            <span className="text-4xl mb-3 block" aria-hidden="true">{isRest ? "☕" : "📅"}</span>
            <h3 className="mb-1">
              {isRest ? "Rest day. Nothing planned." : "No tasks planned for this day yet."}
            </h3>
            <p className="text-muted-foreground text-sm mb-5 px-4">
              {isRest
                ? "Recharge. You can still add an optional task if you feel like it."
                : "Generate a plan from your tracks, pick a topic above, or add specific tasks yourself."}
            </p>
            {!isRest && (
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setPreview(proposeDay(goal, day, roadmap, workspaces, revisions));
                    setMessage("");
                  }}
                >
                  ✨ Auto-generate plan
                </button>
                <button className="btn btn-secondary" onClick={() => onPick({ date: day.date, goalId: goal.id })}>
                  + Add tasks manually
                </button>
              </div>
            )}
          </div>
        )}

        {groups.map((group) => {
          const doneCount = group.tasks.filter((t) => t.status === "Completed").length;
          const allDone = doneCount === group.tasks.length;
          const next = group.tasks.find((t) => t.status === "InProgress") || group.tasks.find((t) => t.status !== "Completed") || group.tasks[0];
          const minutes = group.tasks.reduce((n, t) => n + t.estDurationMinutes, 0);
          const isRevisionOnly = group.tasks.every((t) => t.activity === "Revise Topic");
          return (
            <article
              key={group.key}
              className={`border rounded-xl p-4 sm:p-5 bg-[hsl(var(--card))] transition-colors ${
                allDone ? "border-emerald-500/40 opacity-90" : isRevisionOnly ? "border-amber-500/40" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-1 truncate">{group.breadcrumb}</p>
                  <h3 className="!text-lg flex items-center gap-2">
                    {isRevisionOnly && <span className="text-amber-500" aria-hidden="true">↻</span>}
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="text-muted-foreground">
                      {doneCount}/{group.tasks.length} steps · {minutes} min
                    </span>
                    <span className={`font-medium ${group.priority === "High" ? "text-destructive" : "text-muted-foreground"}`}>{group.priority} priority</span>
                    {allDone && <span className="font-semibold text-emerald-500">Done</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="btn btn-primary text-sm py-1.5 px-4"
                    onClick={() => {
                      if (next.status !== "Completed") update(next.id, { status: "InProgress" });
                      onStart(next);
                    }}
                  >
                    {allDone ? "Review" : next.status === "InProgress" ? "Resume" : "Start learning"}
                  </button>
                  <details className="relative">
                    <summary className="btn btn-ghost text-sm py-1.5 px-3">Topic</summary>
                    <div className="absolute right-0 z-20 mt-2 w-72 surface rounded-xl p-3 space-y-2 shadow-lg">
                      <label className="block">
                        Move all steps to
                        <input
                          className="input-field"
                          type="date"
                          onChange={(e) => moveTasks(group.tasks, e.target.value)}
                        />
                      </label>
                      <button className="btn btn-ghost btn-sm w-full justify-start" onClick={() => moveTasks(group.tasks, addDays(date, 1))}>
                        Move to tomorrow
                      </button>
                      <button
                        className="btn btn-ghost btn-sm w-full justify-start text-destructive"
                        onClick={() => {
                          if (confirm(`Remove all ${group.tasks.length} steps for “${group.title}” from this day? Notes and learning work are kept.`))
                            removeTasks(group.tasks.map((t) => t.id));
                        }}
                      >
                        Remove topic from this day
                      </button>
                    </div>
                  </details>
                </div>
              </div>
              <ul className="mt-3 divide-y divide-border/60 border-t border-border/60">
                {group.tasks.map((task) => (
                  <StepRow
                    key={task.id}
                    task={task}
                    groupTitle={group.title}
                    date={date}
                    goalId={goal.id}
                    isPast={isPast}
                    update={update}
                    onStart={(t) => {
                      if (t.status !== "Completed") update(t.id, { status: "InProgress" });
                      onStart(t);
                    }}
                    onPick={onPick}
                    onDelete={(t) => {
                      if (confirm("Delete this scheduled task? Your notes and learning work will be kept."))
                        removeTasks([t.id]);
                    }}
                    onCarryForward={(t) => moveTasks([t], dateKey())}
                  />
                ))}
              </ul>
            </article>
          );
        })}
      </section>
      {preview && (
        <section className="surface rounded-xl p-5 sm:p-6 space-y-4" aria-label="Day plan preview">
          <h3 className="!text-xl">Day plan preview</h3>
          <p className="text-sm text-muted-foreground">
            Track prerequisites:{" "}
            {Array.from(
              new Set(
                topics
                  .filter((x) => goal.tracks.some((t) => t.trackId === x.track.id))
                  .flatMap((x) => x.track.prerequisites),
              ),
            ).join("; ") || "none specified."}
          </p>
          <p className="text-sm text-muted-foreground">
            {remainingMinutes} min available today. Existing tasks are kept.
          </p>
          {!preview.length && (
            <p className="text-sm">
              No eligible suggestions. Select learning tracks for this goal, or add a task manually.
            </p>
          )}
          <div className="space-y-2">
            {preview.map((t) => (
              <div className="flex flex-wrap gap-2 items-center" key={t.id}>
                <select
                  aria-label="Suggested topic"
                  className="input-field flex-1 min-w-[12rem]"
                  value={t.topicId}
                  onChange={(e) => {
                    const x = topics.find((x) => x.topic.id === e.target.value)!;
                    setPreview(
                      preview.map((p) =>
                        p.id === t.id
                          ? { ...p, topicId: x.topic.id, trackId: x.track.id, categoryId: x.category.id, title: `${p.activity}: ${x.topic.title}` }
                          : p,
                      ),
                    );
                  }}
                >
                  {topics.map((x) => (
                    <option key={x.topic.id} value={x.topic.id}>
                      {x.track.title} · {x.topic.title}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Suggested duration"
                  className="input-field w-24"
                  type="number"
                  min="1"
                  value={t.estDurationMinutes}
                  onChange={(e) =>
                    setPreview(preview.map((p) => (p.id === t.id ? { ...p, estDurationMinutes: Number(e.target.value) } : p)))
                  }
                />
                <button className="btn btn-ghost btn-sm" onClick={() => setPreview(preview.filter((p) => p.id !== t.id))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm font-medium">
            Total: {preview.reduce((s, t) => s + t.estDurationMinutes, 0)} minutes
            {preview.reduce((s, t) => s + t.estDurationMinutes, 0) > remainingMinutes ? (
              <span className="text-destructive"> · over today’s budget</span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              disabled={
                !preview.length ||
                preview.some((t) => t.estDurationMinutes <= 0) ||
                preview.reduce((s, t) => s + t.estDurationMinutes, 0) > remainingMinutes
              }
              onClick={() => {
                setDay({
                  ...day,
                  tasks: [...day.tasks, ...preview.filter((t) => !day.tasks.some((p) => p.id === t.id))],
                });
                setPreview(null);
                setMessage("Day plan saved");
              }}
            >
              Confirm plan
            </button>
            <button className="btn btn-ghost" onClick={() => onPick({ date, goalId: goal.id })}>
              Add more tasks
            </button>
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>
              Cancel
            </button>
          </div>
        </section>
      )}
      {message && (
        <p role="status" className="text-sm font-medium text-emerald-500">
          {message}
        </p>
      )}
    </div>
  );
}
