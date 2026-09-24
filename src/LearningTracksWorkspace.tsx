import { useMemo, useState } from "react";
import type { CareerPath, CurriculumTrack, Goal } from "./types";
import type { PickerContext } from "./components/LearningTaskPicker";
import type { ViewMode } from "./Sidebar";
import { searchCurriculum, trackCategories, tracksByFamily, useCurriculum } from "./lib/curriculum/registry";
import { countTrack } from "./data/curriculum/define";
import { careerPaths } from "./data/careerPaths";

type Tab = "paths" | "skills";
type Level = "" | "Beginner" | "Intermediate" | "Advanced";

function hours(minutes: number): string {
  const h = minutes / 60;
  return h >= 10 ? `${Math.round(h)} h` : `${Math.round(h * 2) / 2} h`;
}

/**
 * Explore: career paths (editable templates) and every skill in the library,
 * grouped by field with search and filters. Tracks, categories, topics and
 * concepts open the learning workspace or schedule tasks into the active goal.
 */
export default function LearningTracksWorkspace({
  setView,
  setSelectedTopicId,
  onSchedule,
  goals,
  onGoals,
  onTrackAdded,
  onUsePath,
  onEditCurriculum,
}: {
  setView: (v: ViewMode) => void;
  setSelectedTopicId: (id: string) => void;
  onSchedule: (context: Partial<PickerContext>) => void;
  goals: Goal[];
  onGoals: (goals: Goal[]) => void;
  /** Called after a track is added to the active goal so the roadmap can schedule it. */
  onTrackAdded?: (goalId: string, trackId: string) => void;
  /** Start a new goal from a career path template. */
  onUsePath?: (path: CareerPath) => void;
  /** Open the curriculum builder for the active goal. */
  onEditCurriculum?: (goalId: string) => void;
}) {
  const curriculum = useCurriculum();
  const [tab, setTab] = useState<Tab>(() => (goals.length ? "skills" : "paths"));
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("");
  const [kind, setKind] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState<Level>("");
  const [status, setStatus] = useState("");
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [openFamilies, setOpenFamilies] = useState<Set<string>>(new Set());

  const activeGoal = goals.find((g) => g.status === "Active") || goals[0];
  const goalId = activeGoal?.id || "";
  const inGoal = (trackId: string) => Boolean(activeGoal?.tracks.some((t) => t.trackId === trackId));

  const families = useMemo(() => tracksByFamily(curriculum.tracks), [curriculum]);
  const languages = useMemo(() => Array.from(new Set(curriculum.tracks.flatMap((t) => t.languages || []))).sort(), [curriculum]);
  const hits = useMemo(() => (query.trim() ? searchCurriculum(query, { limit: 40, family: family || undefined }) : []), [query, family, curriculum]);

  const matches = (t: CurriculumTrack) => {
    if (family && (t.source === "personal" ? "Personal" : t.family) !== family) return false;
    if (kind && t.kind !== kind) return false;
    if (language && !(t.languages || []).includes(language)) return false;
    if (level && (t.level || "All Levels") !== "All Levels" && t.level !== level) return false;
    if (status === "In my goal" && !inGoal(t.id)) return false;
    if (status === "Not started" && inGoal(t.id)) return false;
    const c = countTrack(t);
    if (status === "Short (under 20 h)" && c.minutes > 20 * 60) return false;
    if (status === "Long (over 60 h)" && c.minutes <= 60 * 60) return false;
    return true;
  };

  const toggleGoal = (trackId: string) => {
    if (!activeGoal) return;
    const added = inGoal(trackId);
    onGoals(
      goals.map((g) =>
        g.id !== activeGoal.id
          ? g
          : { ...g, updatedAt: new Date().toISOString(), tracks: added ? g.tracks.filter((t) => t.trackId !== trackId) : [...g.tracks, { trackId, priority: "Medium", order: g.tracks.length }] },
      ),
    );
    if (!added) onTrackAdded?.(activeGoal.id, trackId);
  };

  const openTopic = (id: string) => {
    setSelectedTopicId(id);
    setView("topicWorkspace");
  };

  return (
    <div className="animate-rise max-w-6xl mx-auto w-full space-y-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Explore</h1>
        <p className="text-muted-foreground">
          {curriculum.tracks.length} learning tracks across {families.length} fields. Career paths are templates you can edit; skills are the building blocks of any goal.
        </p>
      </div>

      <div className="iv-tabs max-w-md" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "paths"} className={tab === "paths" ? "is-active" : ""} onClick={() => setTab("paths")}>
          Career paths
        </button>
        <button type="button" role="tab" aria-selected={tab === "skills"} className={tab === "skills" ? "is-active" : ""} onClick={() => setTab("skills")}>
          Browse skills
        </button>
      </div>

      {activeGoal && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>
            Active goal: <strong>{activeGoal.name || activeGoal.targetRole}</strong> · {activeGoal.tracks.length} track{activeGoal.tracks.length === 1 ? "" : "s"}
          </span>
          <span className="flex gap-2">
            {onEditCurriculum && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEditCurriculum(activeGoal.id)}>
                Build my curriculum
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView("roadmap")}>
              Roadmap
            </button>
          </span>
        </div>
      )}

      {tab === "paths" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careerPaths.map((p) => {
            const tracks = p.tracks.map((t) => curriculum.trackById.get(t.trackId)).filter((t): t is CurriculumTrack => Boolean(t));
            const minutes = tracks.reduce((n, t) => n + countTrack(t).minutes, 0);
            return (
              <article key={p.id} className="surface rounded-2xl border border-border p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{p.family}</p>
                    <h2 className="text-lg font-display font-bold">
                      <span aria-hidden="true">{p.icon}</span> {p.title}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <p className="text-xs text-muted-foreground">
                  {tracks.length} tracks · ≈ {hours(minutes)}
                  {p.languages?.length ? ` · ${p.languages.join(", ")}` : ""}
                </p>
                <ol className="text-xs space-y-1 list-decimal pl-4">
                  {tracks.slice(0, 6).map((t) => (
                    <li key={t.id}>
                      <button type="button" className="hover:text-primary text-left" onClick={() => {
                          setExpandedTrackId(t.id);
                          setTab("skills");
                        }}>
                        {t.title}
                      </button>
                    </li>
                  ))}
                  {tracks.length > 6 && <li className="list-none text-muted-foreground">+ {tracks.length - 6} more</li>}
                </ol>
                <div className="mt-auto flex flex-wrap gap-2">
                  {onUsePath && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => onUsePath(p)}>
                      Start a goal from this
                    </button>
                  )}
                  {activeGoal && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        const missing = tracks.filter((t) => !inGoal(t.id));
                        if (!missing.length) return;
                        onGoals(
                          goals.map((g) =>
                            g.id !== activeGoal.id
                              ? g
                              : { ...g, updatedAt: new Date().toISOString(), tracks: [...g.tracks, ...missing.map((t, i) => ({ trackId: t.id, priority: (p.tracks.find((x) => x.trackId === t.id)?.priority || "Medium") as Goal["tracks"][number]["priority"], order: g.tracks.length + i }))] },
                          ),
                        );
                        for (const t of missing) onTrackAdded?.(activeGoal.id, t.id);
                      }}
                    >
                      Add its tracks to my goal
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "skills" && (
        <>
          <div className="surface rounded-2xl border border-border p-4 space-y-3">
            <div className="relative flex items-center">
              <svg className="w-5 h-5 absolute left-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search every topic and concept, e.g. Python decorators, Spring Boot security, RAG evaluation" className="input-field !pl-10 w-full" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search topics" />
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              <select className="input-field" value={family} onChange={(e) => setFamily(e.target.value)} aria-label="Career field">
                <option value="">All fields</option>
                {families.map((f) => (
                  <option key={f.family} value={f.family}>
                    {f.family}
                  </option>
                ))}
              </select>
              <select className="input-field" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Track type">
                <option value="">Any type</option>
                <option value="language">Programming language</option>
                <option value="framework">Framework</option>
                <option value="domain">Subject</option>
                <option value="tooling">Tool or platform</option>
                <option value="projects">Projects</option>
                <option value="interview">Interview prep</option>
                <option value="custom">My tracks</option>
              </select>
              <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Programming language">
                <option value="">Any language</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select className="input-field" value={level} onChange={(e) => setLevel(e.target.value as Level)} aria-label="Skill level">
                <option value="">Any level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status or duration">
                <option value="">Any status</option>
                <option value="In my goal">In my goal</option>
                <option value="Not started">Not in my goal</option>
                <option value="Short (under 20 h)">Short (under 20 h)</option>
                <option value="Long (over 60 h)">Long (over 60 h)</option>
              </select>
            </div>
          </div>

          {query.trim() ? (
            <div className="space-y-2">
              {hits.length === 0 && (
                <div className="cb-empty">
                  <p>No topic matches "{query}".</p>
                  {onEditCurriculum && activeGoal && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEditCurriculum(activeGoal.id)}>
                      Add it as a custom topic
                    </button>
                  )}
                </div>
              )}
              {hits.map((h) => (
                <div key={`${h.ref.topic.id}:${h.concept?.id || ""}`} className="surface rounded-xl border border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{h.concept ? `${h.concept.title} · ${h.ref.topic.title}` : h.ref.topic.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.ref.track.title} › {h.ref.category.title}
                      {h.ref.topic.description ? ` — ${h.ref.topic.description.slice(0, 100)}${h.ref.topic.description.length > 100 ? "…" : ""}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => openTopic(h.concept?.id || h.ref.topic.id)}>
                      Open
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSchedule({ trackId: h.ref.track.id, categoryId: h.ref.category.id, topicId: h.ref.topic.id, subtopicId: h.concept?.id, goalId })}>
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {families
                .filter((f) => !family || f.family === family)
                .map((f) => {
                  const list = f.tracks.filter(matches);
                  if (!list.length) return null;
                  const open = openFamilies.has(f.family) || Boolean(family) || Boolean(kind || language || level || status);
                  return (
                    <section key={f.family} className="surface rounded-2xl border border-border overflow-hidden">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                        aria-expanded={open}
                        onClick={() =>
                          setOpenFamilies((prev) => {
                            const next = new Set(prev);
                            next.has(f.family) ? next.delete(f.family) : next.add(f.family);
                            return next;
                          })
                        }
                      >
                        <span>
                          <span className="font-display font-bold text-lg">{f.family}</span>
                          <span className="block text-xs text-muted-foreground">
                            {list.length} track{list.length === 1 ? "" : "s"} · {list.filter((t) => inGoal(t.id)).length} in your goal
                          </span>
                        </span>
                        <span className="text-muted-foreground" aria-hidden="true">
                          {open ? "−" : "+"}
                        </span>
                      </button>
                      {open && (
                        <div className="border-t border-border divide-y divide-border">
                          {list.map((track) => {
                            const c = countTrack(track);
                            const expanded = expandedTrackId === track.id;
                            return (
                              <div key={track.id}>
                                <div className="px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="font-semibold">
                                      <span aria-hidden="true">{track.icon || "📘"}</span> {track.title}
                                      {track.source === "personal" && <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">yours</span>}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{track.description}</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                      {c.categories} categories · {c.topics} topics · {c.concepts} concepts · ≈ {hours(c.minutes)}
                                      {track.languages?.length ? ` · ${track.languages.join(", ")}` : ""}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpandedTrackId(expanded ? null : track.id)} aria-expanded={expanded}>
                                      {expanded ? "Collapse" : "Explore"}
                                    </button>
                                    {activeGoal && (
                                      <button type="button" className={`btn btn-sm ${inGoal(track.id) ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "btn-primary"}`} onClick={() => toggleGoal(track.id)}>
                                        {inGoal(track.id) ? "✓ In goal" : "Add to goal"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {expanded && (
                                  <div className="px-5 pb-4 space-y-2 bg-[hsl(var(--background))]">
                                    {trackCategories(track).map((cat) => (
                                      <details key={cat.id} className="group border border-border rounded-xl bg-[hsl(var(--card))] overflow-hidden">
                                        <summary className="flex items-center justify-between gap-3 p-3 cursor-pointer list-none">
                                          <span className="font-semibold text-sm">
                                            {cat.title} <small className="text-muted-foreground font-normal">({cat.modules.reduce((n, m) => n + m.topics.length, 0)})</small>
                                          </span>
                                          <button
                                            type="button"
                                            className="btn btn-ghost text-xs px-2 py-1 h-auto"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              onSchedule({ trackId: track.id, categoryId: cat.id, goalId });
                                            }}
                                          >
                                            + Add tasks
                                          </button>
                                        </summary>
                                        <div className="border-t border-border/50 p-3 space-y-2">
                                          {cat.modules
                                            .flatMap((m) => m.topics)
                                            .map((topic) => (
                                              <div key={topic.id} className="rounded-lg border border-transparent hover:border-border p-2">
                                                <div className="flex items-center justify-between gap-2">
                                                  <button type="button" className="text-sm font-medium text-left hover:text-primary" onClick={() => openTopic(topic.id)}>
                                                    {topic.title}
                                                  </button>
                                                  <button type="button" className="text-primary text-xs hover:underline shrink-0" onClick={() => onSchedule({ trackId: track.id, categoryId: cat.id, topicId: topic.id, goalId })}>
                                                    + Schedule
                                                  </button>
                                                </div>
                                                {topic.description && <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {topic.subtopics.map((sub) => (
                                                    <button key={sub.id} type="button" className="cb-chip" onClick={() => openTopic(sub.id)} title="Open this concept">
                                                      {sub.title}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </details>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
