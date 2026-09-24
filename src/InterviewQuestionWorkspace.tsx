import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type KnowledgeWorkspace as IWorkspace,
  type InterviewQuestionDef,
  type CurriculumTrack,
  type CurriculumTopic,
} from "./types";
import { getCurriculum } from "./lib/curriculum/registry";
import RichTextEditor from "./components/RichTextEditor.tsx";
import { chatWithAI } from "./lib/aiGatewayClient";

interface InterviewQuestionWorkspaceProps {
  questionId: string;
  workspaces: IWorkspace[];
  onSaveWorkspace: (ws: IWorkspace) => void;
  onBack: () => void;
}

export default function InterviewQuestionWorkspace({
  questionId,
  workspaces,
  onSaveWorkspace,
  onBack,
}: InterviewQuestionWorkspaceProps) {
  const [mode, setMode] = useState<"Learn" | "Interview">("Learn");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);

  // Find curriculum details and question definition
  const { track, topic, question } = useMemo(() => {
    let q: InterviewQuestionDef | null = null;
    let t: CurriculumTrack | null = null;
    let top: CurriculumTopic | null = null;

    for (const tr of getCurriculum().tracks) {
      for (const level of tr.levels) {
        for (const cat of level.categories) {
          for (const mod of cat.modules) {
            for (const tp of mod.topics) {
              for (const st of tp.subtopics) {
                if (st.questions) {
                  for (const ques of st.questions) {
                    if (ques.id === questionId) {
                      q = ques;
                      t = tr;
                      top = tp;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return { track: t, topic: top, question: q };
  }, [questionId]);

  const workspace = useMemo(() => {
    return (
      workspaces.find((w) => w.questionId === questionId || w.topicId === questionId) ||
      ({
        topicId: questionId,
        questionId,
        learningStatus: "Not Started",
        notes: [],
        examples: [],
        diagrams: [],
        codeSnippets: [],
        mistakes: [],
        flashcards: [],
        linkedActivities: [],
        userAnswers: [],
        customResources: [],
      } as IWorkspace)
    );
  }, [questionId, workspaces]);

  const handleUpdate = (updates: Partial<IWorkspace>) => {
    onSaveWorkspace({
      ...workspace,
      lastStudiedAt: new Date().toISOString(),
      ...updates,
    });
  };

  const evaluateAnswer = async () => {
    if (!userAnswer.trim() || !question) return;
    setEvaluating(true);
    setEvaluationFeedback(null);
    try {
      const response = await chatWithAI({
        messages: [
          { role: 'system', content: 'You are an expert technical interviewer. Evaluate the user answer against the standard technical explanation. Point out any inaccuracies and give constructive feedback in a concise paragraph.' },
          { role: 'user', content: `Question: ${question.title}\nStandard Explanation: ${question.detailedExplanation}\n\nMy Answer: ${userAnswer}` }
        ]
      });
      setEvaluationFeedback(response);
      
      handleUpdate({
        userAnswers: [
          ...(workspace.userAnswers || []),
          { mode: 'Interview', answer: userAnswer, feedback: response, date: new Date().toISOString() }
        ]
      });
    } catch (e) {
      setEvaluationFeedback(e instanceof Error ? e.message : 'Failed to evaluate. Check your AI keys in Settings.');
    } finally {
      setEvaluating(false);
    }
  };

  if (!question) {
    return (
      <div className="p-8 text-center animate-fade">
        <h2 className="text-xl font-bold mb-4">Question Not Found</h2>
        <button className="btn btn-primary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade bg-background max-w-5xl mx-auto p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
        <div>
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2 mb-4 font-medium transition-colors"
          >
            ← Back
          </button>
          <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
            {track?.title} • {topic?.title}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            {question.title}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
              {question.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground border border-border">
              {question.type}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs / Modes */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-muted/30 border border-border rounded-lg w-max">
        <button
          onClick={() => setMode("Learn")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            mode === "Learn"
              ? "bg-[hsl(var(--card))] shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Learn Mode
        </button>
        <button
          onClick={() => setMode("Interview")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            mode === "Interview"
              ? "bg-[hsl(var(--card))] shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Interview Mode
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10 space-y-8">
        {mode === "Learn" ? (
          <div className="space-y-6">
            <div className="surface p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold mb-2">Simple Explanation</h3>
              <p className="text-muted-foreground leading-relaxed">
                {question.beginnerExplanation || "No beginner explanation provided."}
              </p>
            </div>
            
            <div className="surface p-6 rounded-2xl border border-border bg-muted/10">
              <h3 className="text-lg font-bold mb-2">Detailed Technical Explanation</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {question.detailedExplanation || "No detailed explanation provided."}
              </p>
            </div>

            <div className="surface p-6 rounded-2xl border border-border border-l-4 border-l-primary">
              <h3 className="text-lg font-bold mb-2">Interview-Ready Answer</h3>
              <p className="text-foreground leading-relaxed italic">
                "{question.interviewAnswer || "Not provided."}"
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="surface p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold mb-4">Draft Your Answer</h3>
              <textarea
                className="input-field min-h-[150px] resize-y mb-4"
                placeholder="Type your answer here as if you were in an interview..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <button 
                  className="btn btn-primary"
                  onClick={evaluateAnswer}
                  disabled={evaluating || !userAnswer.trim()}
                >
                  {evaluating ? "Evaluating..." : "Evaluate with AI"}
                </button>
              </div>
              
              {evaluationFeedback && (
                <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-500/10 text-amber-900 dark:text-amber-100">
                  <h4 className="font-bold mb-2">Feedback</h4>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{evaluationFeedback}</p>
                </div>
              )}
            </div>

            {(workspace.userAnswers || []).length > 0 && (
              <div className="surface p-6 rounded-2xl border border-border">
                <h3 className="font-bold mb-4">Past Attempts</h3>
                <div className="space-y-4">
                  {(workspace.userAnswers || []).map((ans, i) => (
                    <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="text-xs text-muted-foreground mb-1">
                        {new Date(ans.date).toLocaleString()}
                      </div>
                      <p className="text-sm mb-2 text-foreground font-medium">"{ans.answer}"</p>
                      {ans.feedback && (
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">{ans.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Personal Notes Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">Personal Notes</h2>
          {workspace.notes.map((note) => (
            <div key={note.id} className="surface p-4 rounded-xl border border-border mb-4">
              <RichTextEditor
                initialTitle={note.title}
                initialContent={note.content}
                attachments={note.attachments || []}
                onUpdate={(title, content, attachments) => {
                  const updatedNotes = workspace.notes.map((n) =>
                    n.id === note.id ? { ...n, title, content, attachments, updatedAt: new Date().toISOString() } : n
                  );
                  handleUpdate({ notes: updatedNotes });
                }}
              />
            </div>
          ))}
          <button
            className="btn btn-secondary border border-border"
            onClick={() => {
              const newNote = {
                id: uuidv4(),
                title: "New Note",
                content: "",
                attachments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              handleUpdate({ notes: [...workspace.notes, newNote] });
            }}
          >
            + Add Personal Note
          </button>
        </div>
      </div>
    </div>
  );
}

