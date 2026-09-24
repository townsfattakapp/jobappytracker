import { createPortal } from "react-dom";
import { useMemo, useRef, useState } from "react";
import type {
  Goal,
  StudyTask,
  KnowledgeWorkspace,
  DsaProblem,
  EngineeringLab,
  SystemDesignExercise,
} from "../types";
import { activities, activityApplies, findTopicRef } from "../lib/learningPlan";
import { searchCurriculum, tracksByFamily, useCurriculum, type TopicRef } from "../lib/curriculum/registry";

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

const MAX_BROWSE = 150;

/**
 * Add Task: search or browse every track (built-in, shared and personal),
 * pick a topic or concept, choose activities that apply to that track, then
 * assign the tasks to a goal and a date. Search results open the actual
 * curriculum concept ("Python decorators" lands on the Python track's topic).
 */
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
  const curriculum = useCurriculum();
  const initial = findTopicRef(context.topicId || context.task?.topicId);
  const [source, setSource] = useState(context.task && !initial ? "custom" : "tracks"),
    [step, setStep] = useState(1);
  const [track, setTrack] = useState(initial?.track.id || context.trackId || ""),
    [category, setCategory] = useState(initial?.category.id || context.categoryId || ""),
    [topic, setTopic] = useState(initial?.topic.id || ""),
    [subtopic, setSubtopic] = useState(context.subtopicId || context.task?.subtopicId || "");
  const [search, setSearch] = useState(""),
    [family, setFamily] = useState(""),
    [filter, setFilter] = useState("");
  const [goalId, setGoalId] = useState(context.goalId || goals.find((g) => g.status === "Active")?.id || goals[0]?.id || ""),
    [date, setDate] = useState(context.date);
  const defaultActivity = context.activity || context.task?.activity || (context.task && !initial ? "Create Custom Activity" : "Learn Concept");
  const [selected, setSelected] = useState<string[]>([defaultActivity]);
  const [durations, setDurations] = useState<Record<string, number>>({ [defaultActivity]: context.task?.estDurationMinutes || 30 });
  const [title, setTitle] = useState(context.task?.title || ""),
    [priority, setPriority] = useState<StudyTask["priority"]>(context.task?.priority || "Medium"),
    [description, setDescription] = useState(context.task?.description || ""),
    [criteria, setCriteria] = useState(context.task?.completionCriteria || "");
  const [links, setLinks] = useState<Record<string, string>>({ [context.task?.activity || ""]: context.task?.linkedActivityId || "" });
  const busy = useRef(false);
  const [error, setError] = useState("");

  const info = findTopicRef(topic);
  const ws = workspaces.find((w) => w.topicId === topic);
  const available = activities.filter((a) => a !== "Create Custom Activity" && activityApplies(a, info, { hasQuiz: Boolean(info?.topic.quiz?.length || ws?.flashcards.length), hasLesson: Boolean(info?.topic.description) }));

  const families = useMemo(() => tracksByFamily(curriculum.tracks), [curriculum]);
  const trackObj = track ? curriculum.trackById.get(track) : undefined;
  const categories = trackObj ? trackObj.levels.flatMap((l) => l.categories) : [];

  const matchesFilter = (x: TopicRef) => {
    const w = workspaces.find((v) => v.topicId === x.topic.id);
    return (
      !filter ||
      (filter === "Bookmarked"
        ? w?.bookmarked
        : filter === "Recently studied"
          ? !!w?.lastStudiedAt
          : filter === "In progress"
            ? w?.learningStatus === "Learning" || w?.learningStatus === "Practicing"
            : !w || w.learningStatus === "Not Started")
    );
  };

  const hits = useMemo(() => (search.trim() ? searchCurriculum(search, { limit: 40, family: family || undefined, trackIds: track ? [track] : undefined }) : []), [search, family, track, curriculum]);
  const browse = useMemo(() => {
    if (search.trim()) return [];
    return curriculum.topics
      .filter((x) => (!track || x.track.id === track) && (!category || x.category.id === category) && (!family || x.track.family === family || (family === "Personal" && x.track.source === "personal")))
      .filter(matchesFilter);
  }, [search, track, category, family, filter, curriculum, workspaces]);

  const choose = (x: TopicRef, conceptId?: string) => {
    setTopic(x.topic.id);
    setTrack(x.track.id);
    setCategory(x.category.id);
    setSubtopic(conceptId || "");
  };

  function save() {
    if (busy.current) return;
    if (selected.some((a) => !Number.isFinite(durations[a] ?? 30) || (durations[a] ?? 30) < 1 || (durations[a] ?? 30) > 1440)) {
      setError("Choose a duration between 1 and 1440 minutes.");
      return;
    }
    busy.current = true;
    try {
      const chosen = source === "custom" ? ["Create Custom Activity"] : selected;
      onSave(
        goalId,
        date,
        chosen.map((activity, index) => ({
          ...context.task,
          id: (index === 0 ? context.task?.id : undefined) || crypto.randomUUID(),
          dayId: "",
          title: title.trim() || (info ? `${activity}: ${subtopic ? info.topic.subtopics.find((s) => s.id === subtopic)?.title : info.topic.title}` : activity),
          type: activity === "Revise Topic" ? "Revision" : activity.includes("Project") ? "Project" : activity.includes("Quiz") ? "Assessment" : activity.includes("Mock") ? "Interview" : context.task?.type || "Concept",
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
          completionCriteria: criteria || `Finish ${activity.toLowerCase()} and record what you learned.`,
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
          const elements = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input, select, textarea")).filter((el) => el.getClientRects().length > 0);
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
          {info ? `${info.track.title} > ${info.category.title} > ${info.topic.title}${subtopic ? ` > ${info.topic.subtopics.find((s) => s.id === subtopic)?.title || ""}` : ""}` : "Choose a source > Select activities > Assign to day"}
        </p>
        {step === 1 && (
          <>
            <label className="block">
              Task source
              <select
                className="input-field"
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setSelected(e.target.value === "custom" ? ["Create Custom Activity"] : ["Learn Concept"]);
                }}
              >
                <option value="tracks">Choose from Learning Tracks</option>
                <option value="custom">Create Custom Task</option>
              </select>
            </label>
            {source === "tracks" && (
              <>
                <label className="block">
                  Search all skills, topics and concepts
                  <input className="input-field" placeholder="e.g. Python decorators, Rust ownership, Spring Boot security, Power BI DAX" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search topics" />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label>
                    Career field
                    <select
                      className="input-field"
                      value={family}
                      onChange={(e) => {
                        setFamily(e.target.value);
                        setTrack("");
                        setCategory("");
                      }}
                      aria-label="Career field"
                    >
                      <option value="">All fields</option>
                      {families.map((f) => (
                        <option key={f.family} value={f.family}>
                          {f.family}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
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
                      {families
                        .filter((f) => !family || f.family === family)
                        .map((f) => (
                          <optgroup key={f.family} label={f.family}>
                            {f.tracks.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                    </select>
                  </label>
                  <label>
                    Category
                    <select
                      aria-label="Category"
                      className="input-field"
                      value={category}
                      disabled={!track}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setTopic("");
                        setSubtopic("");
                      }}
                    >
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  Topics
                  <select className="input-field" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Topic status filter">
                    {["", "Recently studied", "Bookmarked", "In progress", "Recommended next"].map((v) => (
                      <option key={v} value={v}>
                        {v || "All topics"}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {search.trim() ? (
                    hits.length ? (
                      hits.map((h) => {
                        const active = topic === h.ref.topic.id && (h.concept ? subtopic === h.concept.id : !subtopic);
                        return (
                          <button
                            key={`${h.ref.topic.id}:${h.concept?.id || ""}`}
                            type="button"
                            className={`w-full text-left border rounded-lg p-3 transition-colors ${active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                            onClick={() => choose(h.ref, h.concept?.id)}
                            aria-pressed={active}
                          >
                            <span className="font-medium block">{h.concept ? `${h.concept.title}` : h.ref.topic.title}</span>
                            <small className="text-muted-foreground">
                              {h.ref.track.title} › {h.ref.category.title}
                              {h.concept ? ` › ${h.ref.topic.title}` : ""}
                            </small>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No topic matches. Switch to "Create Custom Task", or add the topic to your curriculum from Goals.</p>
                    )
                  ) : (
                    <>
                      {!track && !category && browse.length > MAX_BROWSE && (
                        <p className="text-xs text-muted-foreground">
                          {browse.length} topics available. Type to search, or pick a field, track and category to browse.
                        </p>
                      )}
                      {browse.slice(0, MAX_BROWSE).map((x) => (
                        <details key={x.topic.id} open={topic === x.topic.id} className="border border-border rounded-lg p-2">
                          <summary className="cursor-pointer">
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => choose(x)}>
                              {x.topic.title}
                            </button>
                            <small className="text-muted-foreground">
                              {" "}
                              {x.track.title} · {x.category.title}
                            </small>
                          </summary>
                          <p className="text-sm text-muted-foreground px-2 pt-1">{x.topic.description || "Content not available yet. You can still schedule a personal activity."}</p>
                          <label className="block px-2 pb-1">
                            Concept
                            <select
                              aria-label="Subtopic"
                              className="input-field"
                              value={topic === x.topic.id ? subtopic : ""}
                              onChange={(e) => {
                                choose(x, e.target.value || undefined);
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
                      {!browse.length && <p className="text-sm text-muted-foreground">Content not available yet. Create a custom task.</p>}
                    </>
                  )}
                </div>
              </>
            )}
            <button className="btn btn-primary" disabled={source === "tracks" && !topic} onClick={() => setStep(2)}>
              Choose Activities
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h3>What would you like to do?</h3>
            {(source === "custom" ? ["Create Custom Activity"] : available).map((a) => (
              <div key={a} className="flex items-center justify-between gap-3 p-2">
                <label>
                  <input type="checkbox" checked={source === "custom" || selected.includes(a)} onChange={(e) => setSelected(e.target.checked ? [...selected, a] : selected.filter((v) => v !== a))} /> {a}
                </label>
                <label>
                  Minutes
                  <input aria-label={`${a} duration`} className="input-field w-24" type="number" min="1" max="1440" value={durations[a] ?? 30} onChange={(e) => setDurations({ ...durations, [a]: Number(e.target.value) })} />
                </label>
              </div>
            ))}
            <p>Total planned time: {(source === "custom" ? ["Create Custom Activity"] : selected).reduce((n, a) => n + (durations[a] || 30), 0)} minutes</p>
            <button className="btn btn-primary" disabled={source !== "custom" && !selected.length} onClick={() => setStep(3)}>
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
              <select aria-label="Goal" required className="input-field" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                {goals.map((g) => (
                  <option value={g.id} key={g.id}>
                    {g.name || g.targetRole} · {g.status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Scheduled date
              <input required type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              Task title {selected.length > 1 ? "(optional shared title)" : ""}
              <input required={source === "custom"} className="input-field" value={title} placeholder={info ? `${selected[0]}: ${info.topic.title}` : "Name your task"} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block">
              Priority
              <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value as StudyTask["priority"])}>
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
                  <select required className="input-field" value={links[a] || ""} onChange={(e) => setLinks({ ...links, [a]: e.target.value })}>
                    <option value="">Choose the exact problem or exercise</option>
                    {(a.includes("LeetCode") ? problems : a.includes("HLD") ? exercises : labs).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            <label className="block">
              Description
              <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label className="block">
              Completion criteria
              <input className="input-field" value={criteria} onChange={(e) => setCriteria(e.target.value)} />
            </label>
            <p>
              {selected.join(" · ")} · {selected.reduce((n, a) => n + (durations[a] || 30), 0)} minutes
            </p>
            <button className="btn btn-primary" disabled={!goalId} type="submit">
              {context.task ? "Save Changes" : selected.length > 1 ? "Add Multiple Tasks" : date === context.date ? "Add to This Day" : "Add to Another Day"}
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
