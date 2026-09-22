import { useState, useMemo } from "react";
import { allCurriculums } from "./data/curriculum";
import type { Goal, CurriculumTrack } from "./types";
import type { PickerContext } from "./components/LearningTaskPicker";
import type { ViewMode } from "./Sidebar";

interface TrackStats {
  catCount: number;
  topicCount: number;
  conceptCount: number;
}

function getTrackStats(track: CurriculumTrack): TrackStats {
  let catCount = 0;
  let topicCount = 0;
  let conceptCount = 0;
  
  track.levels.forEach(lvl => {
    catCount += lvl.categories.length;
    lvl.categories.forEach(cat => {
      cat.modules.forEach(mod => {
        topicCount += mod.topics.length;
        mod.topics.forEach(top => {
          conceptCount += top.subtopics.length;
        });
      });
    });
  });
  
  return { catCount, topicCount, conceptCount };
}

export default function LearningTracksWorkspace({
  setView,
  setSelectedTopicId,
  onSchedule,
  goals,
  onGoals,
  onTrackAdded,
}: {
  setView: (v: ViewMode) => void;
  setSelectedTopicId: (id: string) => void;
  onSchedule: (context: Partial<PickerContext>) => void;
  goals: Goal[];
  onGoals: (goals: Goal[]) => void;
  /** Called after a track is added to the active goal so the roadmap can schedule it. */
  onTrackAdded?: (goalId: string, trackId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  
  const activeGoal = goals.find((g) => g.status === "Active") || goals[0];
  const goalId = activeGoal?.id || "";

  // The actual UI component is huge, I will break it down into modular pieces
  // if needed, but keeping it in one file is easier to manage here.

  const handleToggleGoal = (trackId: string) => {
    if (!activeGoal) return;
    const isAdded = activeGoal.tracks.some(t => t.trackId === trackId);
    
    onGoals(
      goals.map(g => g.id !== activeGoal.id ? g : {
        ...g,
        updatedAt: new Date().toISOString(),
        tracks: isAdded
          ? g.tracks.filter(t => t.trackId !== trackId)
          : [...g.tracks, { trackId, priority: "Medium" }]
      })
    );
    if (!isAdded) onTrackAdded?.(activeGoal.id, trackId);
  };

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return allCurriculums;
    const lowerQ = searchQuery.toLowerCase();
    
    // We filter tracks that match OR have matching children
    return allCurriculums.filter(t => {
      if (t.title.toLowerCase().includes(lowerQ)) return true;
      let hasMatch = false;
      t.levels.forEach(lvl => {
        lvl.categories.forEach(cat => {
          if (cat.title.toLowerCase().includes(lowerQ)) hasMatch = true;
          cat.modules.forEach(mod => {
            mod.topics.forEach(top => {
              if (top.title.toLowerCase().includes(lowerQ)) hasMatch = true;
              top.subtopics.forEach(sub => {
                if (sub.title.toLowerCase().includes(lowerQ)) hasMatch = true;
              });
            });
          });
        });
      });
      return hasMatch;
    });
  }, [searchQuery]);

  return (
    <div className="animate-rise max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Learning Tracks</h1>
        <p className="text-muted-foreground">Explore the complete Zero-to-Mastery curriculum.</p>
      </div>

      <div className="relative flex items-center">
        <svg className="w-5 h-5 absolute left-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search all topics and concepts..."
          className="input-field !pl-10 w-full"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredTracks.map(track => {
          const stats = getTrackStats(track);
          const isExpanded = expandedTrackId === track.id;
          const isAddedToGoal = activeGoal?.tracks.some(t => t.trackId === track.id);

          return (
            <div key={track.id} className="surface rounded-2xl overflow-hidden border border-border shadow-sm">
              <div className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/5">
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">{track.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium mb-3">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{stats.catCount} categories</span>
                    <span>{stats.topicCount} topics</span>
                    <span>{stats.conceptCount} concepts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                    className={`btn flex-1 md:flex-none ${isExpanded ? 'btn-ghost border border-border' : 'btn-secondary'}`}
                  >
                    {isExpanded ? 'Collapse' : 'Explore Curriculum'}
                  </button>
                  {activeGoal && (
                    <button 
                      onClick={() => handleToggleGoal(track.id)}
                      className={`btn flex-1 md:flex-none ${isAddedToGoal ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'btn-primary'}`}
                    >
                      {isAddedToGoal ? '✓ Added to Goal' : 'Add to Goal'}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-[hsl(var(--background))] p-6 space-y-6">
                  {track.levels.map(level => (
                    <div key={level.id} className="space-y-4">
                      {level.categories.map(cat => (
                        <details key={cat.id} className="group border border-border rounded-xl bg-[hsl(var(--card))] overflow-hidden">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors list-none">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 flex items-center justify-center rounded-md bg-muted text-muted-foreground group-open:bg-primary/20 group-open:text-primary transition-colors">
                                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                              <h3 className="font-semibold text-foreground text-lg">{cat.title}</h3>
                            </div>
                            <button 
                              className="btn btn-ghost text-xs px-2 py-1 h-auto"
                              onClick={(e) => { e.preventDefault(); onSchedule({ trackId: track.id, categoryId: cat.id, goalId }); }}
                            >
                              + Add Tasks
                            </button>
                          </summary>
                          
                          <div className="p-4 pt-0 border-t border-border/50 bg-muted/10">
                            {cat.modules.map(mod => (
                              <div key={mod.id} className="mt-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{mod.title}</h4>
                                <div className="space-y-2">
                                  {mod.topics.map(topic => (
                                    <details key={topic.id} className="group/topic ml-2 border-l-2 border-border/50 pl-4 py-1">
                                      <summary className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors list-none text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-border group-open/topic:bg-primary transition-colors"></span>
                                          {topic.title}
                                        </div>
                                        <button 
                                          className="sm:opacity-0 group-hover/topic:opacity-100 focus:opacity-100 text-primary text-xs hover:underline"
                                          onClick={(e) => { e.preventDefault(); onSchedule({ trackId: track.id, categoryId: cat.id, topicId: topic.id, goalId }); }}
                                        >
                                          + Add Topic
                                        </button>
                                      </summary>
                                      
                                      <div className="mt-3 ml-4 space-y-2">
                                        {topic.subtopics.map(sub => (
                                          <div key={sub.id} className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border group/sub">
                                              <div 
                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                                                onClick={() => {
                                                  setSelectedTopicId(sub.id);
                                                  setView('topicWorkspace');
                                                }}
                                              >
                                                <svg className="w-4 h-4 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {sub.title}
                                              </div>
                                              <button 
                                                className="sm:opacity-0 group-hover/sub:opacity-100 focus:opacity-100 btn btn-primary text-[10px] px-2 py-1 h-auto"
                                                onClick={() => onSchedule({ trackId: track.id, categoryId: cat.id, topicId: topic.id, subtopicId: sub.id, goalId })}
                                              >
                                                + Schedule Concept
                                              </button>
                                            </div>
                                            {sub.questions && sub.questions.length > 0 && (
                                              <div className="ml-6 space-y-1">
                                                {sub.questions.map(q => (
                                                  <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border group/q">
                                                    <div 
                                                      className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground cursor-pointer"
                                                      onClick={() => {
                                                        setSelectedTopicId(q.id);
                                                        setView('topicWorkspace'); // the router will need to handle questionId vs topicId
                                                      }}
                                                    >
                                                      <span className="text-amber-500 font-bold">Q:</span>
                                                      {q.title}
                                                    </div>
                                                    <button 
                                                      className="sm:opacity-0 group-hover/q:opacity-100 focus:opacity-100 btn btn-ghost text-[10px] px-2 py-1 h-auto"
                                                      onClick={() => onSchedule({ trackId: track.id, categoryId: cat.id, topicId: topic.id, subtopicId: sub.id, activity: 'Interview Question', curriculumTaskId: q.id, goalId })}
                                                    >
                                                      + Schedule Q
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
