import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import type {
  Goal,
  StudyTask,
  KnowledgeWorkspace,
  DsaProblem,
  EngineeringLab,
  SystemDesignExercise,
} from "../types";
import { allCurriculums } from "../data/curriculum";
import { activities, topics } from "../lib/learningPlan";
export interface PickerContext {
  date: string;
  goalId?: string;
  trackId?: string;
  categoryId?: string;
  topicId?: string;
  subtopicId?: string;
  activity?: string;
  curriculumTaskId?: string;
  task?: StudyTask;
}
export default function LearningTaskPicker({
  context,
  goals,
  workspaces,
  onSave,
  onClose,
  problems,
  labs,
  exercises,
}: {
  context: PickerContext;
  problems: DsaProblem[];
  labs: EngineeringLab[];
  exercises: SystemDesignExercise[];
  goals: Goal[];
  workspaces: KnowledgeWorkspace[];
  onSave: (goalId: string, date: string, tasks: StudyTask[]) => void;
  onClose: () => void;
}) {
  const initial = topics.find(
    (x) => x.topic.id === (context.topicId || context.task?.topicId),
  );
  const [source, setSource] = useState(
      context.task && !initial ? "custom" : "tracks",
    ),
    [step, setStep] = useState(1);
  const [track, setTrack] = useState(
      initial?.track.id || context.trackId || "",
    ),
    [category, setCategory] = useState(
      initial?.category.id || context.categoryId || "",
    ),
    [topic, setTopic] = useState(initial?.topic.id || ""),
    [subtopic, setSubtopic] = useState(context.task?.subtopicId || "");
  const [search, setSearch] = useState(""),
    [level, setLevel] = useState(""),
    [filter, setFilter] = useState("");
  const [goalId, setGoalId] = useState(
      context.goalId ||
        goals.find((g) => g.status === "Active")?.id ||
        goals[0]?.id ||
        "",
    ),
    [date, setDate] = useState(context.date);
  const [selected, setSelected] = useState<string[]>([
    context.activity || context.task?.activity || (context.task && !initial ? "Create Custom Activity" : "Learn Concept"),
  ]);
  const [durations, setDurations] = useState<Record<string, number>>({
    [context.task?.activity || (context.task && !initial ? "Create Custom Activity" : "Learn Concept")]:
      context.task?.estDurationMinutes || 30,
  });
  const [title, setTitle] = useState(context.task?.title || ""),
    [priority, setPriority] = useState<StudyTask["priority"]>(
      context.task?.priority || "Medium",
    ),
    [description, setDescription] = useState(context.task?.description || ""),
    [criteria, setCriteria] = useState(context.task?.completionCriteria || "");
  const [links, setLinks] = useState<Record<string, string>>({
    [context.task?.activity || ""]: context.task?.linkedActivityId || "",
  });
  const busy = useRef(false);
  const [error, setError] = useState("");
  const info = topics.find((x) => x.topic.id === topic);
  const available = activities
    .filter(
      (a) =>
        a !== "Complete Quiz" ||
        !!info?.topic.quiz?.length ||
        !!workspaces.find((w) => w.topicId === topic)?.flashcards.length,
    )
    .filter((a) => a !== "Read Detailed Lesson" || !!info?.topic.description)
    .filter(
      (a) => !a.includes("HLD") || /design/i.test(info?.track.title || ""),
    )
    .filter(
      (a) =>
        !a.includes("LeetCode") ||
        /DSA|Competitive/i.test(info?.track.title || ""),
    )
    .filter(
      (a) =>
        !a.includes("Engineering") ||
        /engineering|devops|cloud|backend/i.test(info?.track.title || ""),
    );
  const matches = topics
    .filter(
      (x) =>
        (!track || x.track.id === track) &&
        (!category || x.category.id === category) &&
        (!level || x.level.name === level) &&
        `${x.track.title} ${x.category.title} ${x.module.title} ${x.topic.title}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .filter((x) => {
      const ws = workspaces.find((w) => w.topicId === x.topic.id);
      return (
        !filter ||
        (filter === "Bookmarked"
          ? ws?.bookmarked
          : filter === "Recently studied"
            ? !!ws?.lastStudiedAt
            : filter === "In progress"
              ? ws?.learningStatus === "Learning" ||
                ws?.learningStatus === "Practicing"
              : !ws || ws.learningStatus === "Not Started")
      );
    });
  function save() {
    if (busy.current) return;
    if (
      selected.some(
        (a) =>
          !Number.isFinite(durations[a] ?? 30) ||
          (durations[a] ?? 30) < 1 ||
          (durations[a] ?? 30) > 1440,
      )
    ) {
      setError("Choose a duration between 1 and 1440 minutes.");
      return;
    }
    busy.current = true;
    try {
      const chosen =
        source === "custom" ? ["Create Custom Activity"] : selected;
      onSave(
        goalId,
        date,
        chosen.map((activity, index) => ({
          ...context.task,
          id:
            (index === 0 ? context.task?.id : undefined) || crypto.randomUUID(),
          dayId: "",
          title:
            title.trim() ||
            (info
              ? `${activity}: ${subtopic ? info.topic.subtopics.find((s) => s.id === subtopic)?.title : info.topic.title}`
              : activity),
          type:
            activity === "Revise Topic"
              ? "Revision"
              : context.task?.type || "Concept",
          activity,
          linkedActivityId: links[activity] || undefined,
          trackId: info?.track.id,
          categoryId: info?.category.id,
          topicId: info?.topic.id,
          subtopicId: subtopic || undefined,
          curriculumTaskId: context.curriculumTaskId || undefined,
          estDurationMinutes: durations[activity] || 30,
          actualDurationMinutes: context.task?.actualDurationMinutes || 0,
          status: context.task?.status || "Pending",
          priority,
          description,
          completionCriteria:
            criteria ||
            `Finish ${activity.toLowerCase()} and record what you learned.`,
        })),
      );
      onClose();
    } catch (e) {
      setError(String(e));
      busy.current = false;
    }
  }
  return createPortal(
    <div
      className="fixed inset-0 z-[90] bg-background/90 overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add learning tasks"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const elements = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), input, select, textarea",
            ),
          ).filter((el) => el.getClientRects().length > 0);
          const first = elements[0],
            last = elements[elements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div className="surface max-w-3xl mx-auto p-6 rounded-xl space-y-6 animate-slide-up shadow-2xl relative my-4 sm:my-8">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            {context.task ? "Edit / Reschedule Task" : "+ Add Task"} <span className="text-muted-foreground ml-2">· Step {step} of 3</span>
          </h2>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {info
            ? `${info.track.title} > ${info.category.title} > ${info.topic.title}`
            : "Choose a source > Select activities > Assign to day"}
        </p>
        {step === 1 && (
          <>
            <label className="block">
              Task source
              <select
                className="input-field"
                value={source}
                onChange={(e) => {setSource(e.target.value);setSelected(e.target.value === "custom" ? ["Create Custom Activity"] : ["Learn Concept"])}}
              >
                <option value="tracks">Choose from Learning Tracks</option>
                <option value="custom">Create Custom Task</option>
              </select>
            </label>
            {source === "tracks" && (
              <>
                <label className="block">
                  Search tracks, categories and topics
                  <input
                    className="input-field"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setTrack("");
                      setCategory("");
                    }}
                  />
                </label>
                <div className="flex gap-3">
                  <label>
                    Level
                    <select
                      className="input-field"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      {[
                        "",
                        "Beginner",
                        "Intermediate",
                        "Advanced",
                        "Interview Ready",
                        "Mastery",
                      ].map((v) => (
                        <option key={v} value={v}>
                          {v || "All levels"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Topics
                    <select
                      className="input-field"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      {[
                        "",
                        "Recently studied",
                        "Bookmarked",
                        "In progress",
                        "Recommended next",
                      ].map((v) => (
                        <option key={v} value={v}>
                          {v || "All topics"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  Learning Track
                  <select
                    aria-label="Learning Track"
                    className="input-field"
                    value={track}
                    onChange={(e) => {
                      setTrack(e.target.value);
                      setCategory("");
                      setTopic("");
                      setSubtopic("");
                    }}
                  >
                    <option value="">All learning tracks</option>
                    {allCurriculums.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Category
                  <select
                    aria-label="Category"
                    className="input-field"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setTopic("");
                      setSubtopic("");
                    }}
                  >
                    <option value="">All categories</option>
                    {allCurriculums
                      .filter((t) => !track || t.id === track)
                      .flatMap((t) => t.levels.flatMap((l) => l.categories))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {matches.map((x) => (
                    <details
                      key={x.topic.id}
                      open={topic === x.topic.id}
                      className="border border-border rounded p-2"
                    >
                      <summary>
                        <button
                          className="btn"
                          onClick={() => {
                            setTopic(x.topic.id);
                            setTrack(x.track.id);
                            setCategory(x.category.id);
                            setSubtopic("");
                          }}
                        >
                          {x.topic.title}
                        </button>
                        <small>
                          {" "}
                          {x.category.title} · {x.level.name}
                        </small>
                      </summary>
                      <p>
                        {x.topic.description ||
                          "Content not available yet. You can still schedule a personal activity."}
                      </p>
                      <label>
                        Subtopic
                        <select
                          aria-label="Subtopic"
                          className="input-field"
                          value={topic === x.topic.id ? subtopic : ""}
                          onChange={(e) => {
                            setTopic(x.topic.id);
                            setSubtopic(e.target.value);
                          }}
                        >
                          <option value="">Entire topic</option>
                          {x.topic.subtopics.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </details>
                  ))}
                  {!matches.length && (
                    <p>Content not available yet. Create a custom task.</p>
                  )}
                </div>
              </>
            )}
            <button
              className="btn btn-primary"
              disabled={source === "tracks" && !topic}
              onClick={() => setStep(2)}
            >
              Choose Activities
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h3>What would you like to do?</h3>
            {(source === "custom" ? ["Create Custom Activity"] : available).map(
              (a) => (
                <div
                  key={a}
                  className="flex items-center justify-between gap-3 p-2"
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={source === "custom" || selected.includes(a)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, a]
                            : selected.filter((v) => v !== a),
                        )
                      }
                    />{" "}
                    {a}
                  </label>
                  <label>
                    Minutes
                    <input
                      aria-label={`${a} duration`}
                      className="input-field w-24"
                      type="number"
                      min="1"
                      max="1440"
                      value={durations[a] ?? 30}
                      onChange={(e) =>
                        setDurations({
                          ...durations,
                          [a]: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              ),
            )}
            <p>
              Total planned time:{" "}
              {(source === "custom"
                ? ["Create Custom Activity"]
                : selected
              ).reduce((n, a) => n + (durations[a] || 30), 0)}{" "}
              minutes
            </p>
            <button
              className="btn btn-primary"
              disabled={source !== "custom" && !selected.length}
              onClick={() => setStep(3)}
            >
              Review Assignment
            </button>
          </>
        )}
        {step === 3 && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <label className="block">
              Goal
              <select
                aria-label="Goal"
                required
                className="input-field"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
              >
                {goals.map((g) => (
                  <option value={g.id} key={g.id}>
                    {g.targetRole} · {g.status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Scheduled date
              <input
                required
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="block">
              Task title {selected.length > 1 ? "(optional shared title)" : ""}
              <input
                required={source === "custom"}
                className="input-field"
                value={title}
                placeholder={
                  info
                    ? `${selected[0]}: ${info.topic.title}`
                    : "Name your task"
                }
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="block">
              Priority
              <select
                className="input-field"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as StudyTask["priority"])
                }
              >
                {["High", "Medium", "Low"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            {selected
              .filter((a) => /LeetCode|HLD|Engineering Lab/.test(a))
              .map((a) => (
                <label className="block" key={a}>
                  {a} ? linked activity
                  <select
                    required
                    className="input-field"
                    value={links[a] || ""}
                    onChange={(e) =>
                      setLinks({ ...links, [a]: e.target.value })
                    }
                  >
                    <option value="">
                      Choose the exact problem or exercise
                    </option>
                    {(a.includes("LeetCode")
                      ? problems
                      : a.includes("HLD")
                        ? exercises
                        : labs
                    ).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            <label className="block">
              Description
              <textarea
                className="input-field"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block">
              Completion criteria
              <input
                className="input-field"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </label>
            <p>
              {selected.join(" · ")} ·{" "}
              {selected.reduce((n, a) => n + (durations[a] || 30), 0)} minutes
            </p>
            <button
              className="btn btn-primary"
              disabled={!goalId}
              type="submit"
            >
              {context.task
                ? "Save Changes"
                : selected.length > 1
                  ? "Add Multiple Tasks"
                  : date === context.date
                    ? "Add to This Day"
                    : "Add to Another Day"}
            </button>
          </form>
        )}
        {step > 1 && (
          <button className="btn" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    </div>,
    document.body,
  );
}
