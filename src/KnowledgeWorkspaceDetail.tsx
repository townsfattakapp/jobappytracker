import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type KnowledgeWorkspace,
  type TopicNote,
  type TopicDiagram,
  type TopicExample,
  type TopicCodeSnippet,
  type CurriculumTrack,
  type CurriculumTopic,
  type CurriculumSubtopic,
} from "./types";
import { allCurriculums } from "./data/curriculum";
import RichTextEditor from "./components/RichTextEditor.tsx";
import MermaidEditor from "./components/MermaidEditor.tsx";
import AITutor from "./components/AITutor.tsx";
import CodeEditor from "./components/CodeEditor.tsx";
import { AI_SETUP_HINT, chatWithAI, isAiAvailable } from "./lib/aiGatewayClient";
import { highlightCode, renderMarkdown } from "./lib/markdown";
import { ensureReadableCode } from "./lib/formatCode";
import { CODE_LANGUAGES, LANGUAGE_IDS, useCodeLanguage } from "./lib/preferences";
import { generateDiagram, generateExamples, generateFlashcards, generateMistakes, generatePracticeProblems, type TopicContext } from "./lib/aiLearning";
import AlgoEditor from "./components/compiler/AlgoEditor.tsx";
import FlashcardDeck from "./components/FlashcardDeck.tsx";
import UMLVisualEditor from "./components/diagrams/UMLVisualEditor.tsx";
import UmlLearningMode from "./components/diagrams/UmlLearningMode.tsx";
import { getUmlTemplates } from "./data/umlTemplates.ts";

/** Static, syntax-coloured code for read-only views (no editor instance needed). */
function CodeView({ code, language }: { code: string; language?: string }) {
  const { html, language: lang } = highlightCode(ensureReadableCode(code, language), language);
  return (
    <div className="code-card">
      <div className="code-card-head"><span>{lang}</span></div>
      <pre><code className={`hljs language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}

const LANGUAGE_LABELS: Record<string, string> = { java: 'Java', javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', cpp: 'C++', go: 'Go' };

/** Splits "1. do this 2. do that" or one-step-per-line text into an ordered list. */
function parseSteps(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const numbered = lines.filter((l) => /^\d+[.)]\s+/.test(l));
  if (numbered.length >= 2 && numbered.length >= lines.length - 1) return numbered.map((l) => l.replace(/^\d+[.)]\s+/, ''));
  const inline = trimmed.split(/\s*(?=\b\d+[.)]\s)/).map((x) => x.trim()).filter(Boolean);
  if (inline.length >= 2 && inline.every((x) => /^\d+[.)]\s/.test(x))) return inline.map((l) => l.replace(/^\d+[.)]\s+/, ''));
  return [];
}

function ExampleItem({ example, onUpdate, onDelete, onPractice }: { example: TopicExample; onUpdate: (e: TopicExample) => void; onDelete: () => void; onPractice?: (code: string, language: string, title: string) => void }) {
  const isNew = example.title === 'New Example' && !example.explanation;
  const [editing, setEditing] = useState(isNew);
  const [draft, setDraft] = useState<TopicExample>(example);
  const [copied, setCopied] = useState(false);
  const rawCode = example.implementationCode || (example as TopicExample & { codeSnippet?: string }).codeSnippet || '';
  const lang = example.implementationLanguage || 'javascript';
  const code = ensureReadableCode(rawCode, lang);
  const steps = parseSteps(example.explanation || '');

  if (!editing) {
    return (
      <article className="surface rounded-2xl border border-border overflow-hidden group">
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            <h3 className="font-bold text-lg leading-snug">{example.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {example.timeComplexity && <span className="example-chip">⏱ Time {example.timeComplexity}</span>}
              {example.spaceComplexity && <span className="example-chip">▦ Space {example.spaceComplexity}</span>}
              {code && <span className="example-chip is-lang">{LANGUAGE_LABELS[lang] || lang}</span>}
            </div>
          </div>
          <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(example); setEditing(true); }}>Edit</button>
            <button className="btn btn-ghost btn-sm text-destructive" onClick={onDelete}>Delete</button>
          </div>
        </header>

        <div className="px-5 pt-4 pb-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-5 min-w-0">
            {example.problemStatement && (
              <section>
                <p className="example-label">Problem</p>
                <p className="whitespace-pre-wrap leading-relaxed">{example.problemStatement}</p>
              </section>
            )}
            {example.explanation && (
              <section>
                <p className="example-label">Step by step</p>
                {steps.length ? (
                  <ol className="example-steps">
                    {steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{example.explanation}</p>
                )}
              </section>
            )}
          </div>
          <div className="space-y-4 min-w-0">
            {example.inputOutput && (
              <section>
                <p className="example-label">Input → output</p>
                <pre className="example-io">{example.inputOutput}</pre>
              </section>
            )}
            {example.commonMistakes && (
              <section className="example-watch">
                <span className="font-semibold text-[hsl(var(--ig-orange))]">Watch out: </span>
                {example.commonMistakes}
              </section>
            )}
          </div>
        </div>

        {code && (
          <div className="example-code px-5 pb-5">
            <div className="example-code-head">
              <span>Code · {LANGUAGE_LABELS[lang] || lang}</span>
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="example-tool"
                  onClick={() => {
                    navigator.clipboard?.writeText(code).then(() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    });
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                {onPractice && (
                  <button type="button" className="example-tool is-primary" onClick={() => onPractice(code, lang, example.title)} title="Open this code in the Practice runner">
                    ▶ Try in Practice
                  </button>
                )}
              </span>
            </div>
            <CodeView code={code} language={lang} />
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="surface p-5 rounded-xl border border-primary/50 shadow-md flex flex-col gap-4 bg-muted/10">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h3 className="font-bold">{isNew ? 'Create Example' : 'Edit Example'}</h3>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (JSON.stringify(draft) !== JSON.stringify(example)) {
              if (!confirm("Discard unsaved changes?")) return;
            }
            if (isNew) onDelete(); else setEditing(false);
          }}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={!draft.title.trim()} onClick={() => { onUpdate(draft); setEditing(false); }}>Save Example</button>
        </div>
      </div>
      <label className="block">
        <span className="label-quiet">Title</span>
        <input className="input-field" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Reading an integer using Scanner" />
      </label>
      <label className="block">
        <span className="label-quiet">Problem statement / context</span>
        <textarea className="input-field min-h-[80px]" value={draft.problemStatement || ''} onChange={e => setDraft({ ...draft, problemStatement: e.target.value })} placeholder="Describe the problem being solved..." />
      </label>
      <label className="block">
        <span className="label-quiet">Sample input → output</span>
        <textarea className="input-field min-h-[60px] font-mono text-sm" value={draft.inputOutput || ''} onChange={e => setDraft({ ...draft, inputOutput: e.target.value })} placeholder={"Input: [2, 7, 11, 15], target 9\nOutput: [0, 1]"} />
      </label>
      <label className="block">
        <span className="label-quiet">Step-by-step explanation</span>
        <textarea className="input-field min-h-[120px]" value={draft.explanation || ''} onChange={e => setDraft({ ...draft, explanation: e.target.value })} placeholder="Explain how the solution works..." />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="label-quiet">Language</span>
          <select className="input-field" value={draft.implementationLanguage || 'javascript'} onChange={e => setDraft({ ...draft, implementationLanguage: e.target.value })}>
            {['javascript', 'typescript', 'java', 'python', 'cpp', 'go', 'sql'].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label-quiet">Time complexity</span>
          <input className="input-field" value={draft.timeComplexity || ''} onChange={e => setDraft({ ...draft, timeComplexity: e.target.value })} placeholder="O(n)" />
        </label>
        <label className="block">
          <span className="label-quiet">Space complexity</span>
          <input className="input-field" value={draft.spaceComplexity || ''} onChange={e => setDraft({ ...draft, spaceComplexity: e.target.value })} placeholder="O(1)" />
        </label>
      </div>
      <div className="block">
        <span className="label-quiet">Code</span>
        <CodeEditor value={draft.implementationCode || ''} language={draft.implementationLanguage || 'javascript'} onChange={val => setDraft({ ...draft, implementationCode: val })} minHeight="220px" />
      </div>
      <label className="block">
        <span className="label-quiet">Common mistake (optional)</span>
        <input className="input-field" value={draft.commonMistakes || ''} onChange={e => setDraft({ ...draft, commonMistakes: e.target.value })} placeholder="What usually goes wrong here?" />
      </label>
    </div>
  );
}

function DiagramItem({ diagram, onUpdate, onDelete }: { diagram: any, onUpdate: (e: any) => void, onDelete: () => void }) {
  const [editing, setEditing] = useState(diagram.title === 'New Diagram');
  const [draft, setDraft] = useState(diagram);

  // New Diagram Wizard State
  const [wizardStep, setWizardStep] = useState(diagram.title === 'New Diagram' ? 1 : 4);

  if (!editing) {
    return (
      <div className="surface p-5 rounded-xl border border-border flex flex-col gap-4 group">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-lg">{diagram.title}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded uppercase font-bold tracking-wider border border-primary/20">
              {diagram.type || 'General'} Diagram • {diagram.creationMethod === 'visual' ? 'Visual Editor' : 'Code Editor'}
            </span>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="btn btn-ghost btn-sm" onClick={() => { 
               // Trigger AITutor externally or show a mini AI modal
               // For now, prompt AITutor with context
               const promptStr = `Explain this ${diagram.type} diagram:\n\n${diagram.mermaidCode}`;
               alert(`AI Tutor prompt copied: ${promptStr}`);
            }}>Ask AI</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(diagram); setEditing(true); setWizardStep(4); }}>Edit</button>
            <button className="btn btn-ghost btn-sm text-destructive" onClick={onDelete}>Delete</button>
          </div>
        </div>
        {diagram.creationMethod === 'visual' && diagram.visualState ? (
          <UMLVisualEditor initialState={diagram.visualState} onSave={() => {}} readOnly />
        ) : (
          <MermaidEditor value={diagram.mermaidCode} onChange={() => {}} readOnly />
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="surface p-5 rounded-xl border border-primary/50 shadow-md flex flex-col gap-4 bg-muted/10">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h3 className="font-bold">
          {diagram.title === 'New Diagram' 
            ? `Create Diagram (Step ${wizardStep} of 4)` 
            : 'Edit Diagram'}
        </h3>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (draft.mermaidCode !== diagram.mermaidCode || draft.title !== diagram.title || draft.visualState !== diagram.visualState) {
              if (!confirm("Discard unsaved changes?")) return;
            }
            if (diagram.title === 'New Diagram') {
              onDelete();
            } else {
              setEditing(false);
            }
          }}>Cancel</button>
          {wizardStep === 4 && (
            <button className="btn btn-primary btn-sm" onClick={() => { onUpdate(draft); setEditing(false); }}>Save Diagram</button>
          )}
        </div>
      </div>

      {wizardStep === 1 && (
        <div className="space-y-4 animate-fade">
          <h4 className="font-semibold text-lg">Choose Diagram Type</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Class', 'Sequence', 'Use Case', 'Activity', 'State', 'General'].map(type => (
              <button
                key={type}
                className="p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 text-left transition-colors font-medium"
                onClick={() => { setDraft({ ...draft, type }); setWizardStep(2); }}
              >
                {type} Diagram
              </button>
            ))}
          </div>
        </div>
      )}

      {wizardStep === 2 && (
        <div className="space-y-4 animate-fade">
          <h4 className="font-semibold text-lg">Choose Creation Method</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              className="p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 text-left transition-colors"
              onClick={() => { setDraft({ ...draft, creationMethod: 'visual' }); setWizardStep(3); }}
            >
              <h5 className="font-bold mb-2 flex items-center gap-2"><span className="text-xl">🖱️</span> Visual Drag-and-Drop Editor</h5>
              <p className="text-sm text-muted-foreground">Add classes and elements using a visual canvas and automatically sync relationships.</p>
            </button>
            <button
              className="p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 text-left transition-colors"
              onClick={() => { setDraft({ ...draft, creationMethod: 'code' }); setWizardStep(3); }}
            >
              <h5 className="font-bold mb-2 flex items-center gap-2"><span className="text-xl">⌨️</span> Code Editor (Mermaid)</h5>
              <p className="text-sm text-muted-foreground">Write standard Mermaid syntax to generate the diagram. Ideal for pasting from AI.</p>
            </button>
            <button
              className="p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 text-left transition-colors sm:col-span-2"
              onClick={() => { setDraft({ ...draft, creationMethod: 'template' }); setWizardStep(3); }}
            >
              <h5 className="font-bold mb-2 flex items-center gap-2"><span className="text-xl">📋</span> Start from Template</h5>
              <p className="text-sm text-muted-foreground">Choose from Parking Lot, Library System, Authentication Flow, and more.</p>
            </button>
          </div>
          <button className="btn btn-ghost" onClick={() => setWizardStep(1)}>Back</button>
        </div>
      )}

      {wizardStep === 3 && (
        <div className="space-y-4 animate-fade">
          <h4 className="font-semibold text-lg">Name Your Diagram</h4>
          <label className="block">
            <span className="label-quiet">Diagram Title</span>
            <input className="input-field" autoFocus value={draft.title === 'New Diagram' ? '' : draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Parking Lot Class Diagram" />
          </label>
          
          {draft.creationMethod === 'template' && (
            <div className="mt-4 space-y-2">
              <span className="label-quiet">Select Template</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getUmlTemplates().map((tpl: any, idx) => (
                  <button
                    key={idx}
                    className="p-3 border border-border rounded-xl hover:border-primary text-left text-sm"
                    onClick={() => {
                      setDraft({
                        ...draft,
                        title: draft.title === 'New Diagram' || !draft.title ? tpl.title : draft.title,
                        type: tpl.type,
                        creationMethod: tpl.creationMethod,
                        mermaidCode: tpl.mermaidCode,
                      });
                      setWizardStep(4);
                    }}
                  >
                    <span className="font-semibold block">{tpl.title}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">{tpl.type} Diagram</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button className="btn btn-ghost" onClick={() => setWizardStep(2)}>Back</button>
            {draft.creationMethod !== 'template' && (
              <button 
                className="btn btn-primary" 
                disabled={!draft.title || draft.title === 'New Diagram'}
                onClick={() => setWizardStep(4)}
              >
                Continue to Editor
              </button>
            )}
          </div>
        </div>
      )}

      {wizardStep === 4 && (
        <div className="space-y-4 animate-fade">
          <label className="block">
            <span className="label-quiet">Title</span>
            <input className="input-field" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Diagram Title" />
          </label>
          <div className="block">
            <span className="label-quiet flex justify-between items-center">
              Editor 
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {draft.creationMethod === 'visual' ? 'Visual Mode' : 'Code Mode'}
              </span>
            </span>
            {draft.creationMethod === 'visual' ? (
              <UMLVisualEditor 
                initialState={draft.visualState} 
                onSave={state => setDraft({ ...draft, visualState: state })} 
              />
            ) : (
              <MermaidEditor 
                value={draft.mermaidCode} 
                onChange={code => setDraft({ ...draft, mermaidCode: code })} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const RUNNABLE = new Set(['javascript', 'typescript', 'java', 'python', 'cpp', 'go']);

function CodeSnippetItem({ codeSnippet, onUpdate, onDelete }: { codeSnippet: TopicCodeSnippet; onUpdate: (e: TopicCodeSnippet) => void; onDelete: () => void }) {
  const isNew = codeSnippet.title === 'Practice Solution' && !codeSnippet.code;
  const [editing, setEditing] = useState(isNew);
  const [draft, setDraft] = useState<TopicCodeSnippet>(codeSnippet);
  const runnable = RUNNABLE.has((draft.language || '').toLowerCase());

  if (!editing) {
    return (
      <div className="surface p-5 rounded-xl border border-border flex flex-col gap-3 group">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-lg">{codeSnippet.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{codeSnippet.language || 'javascript'}</p>
          </div>
          <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button className="btn btn-primary btn-sm" onClick={() => { setDraft(codeSnippet); setEditing(true); }}>Open in editor</button>
            <button className="btn btn-ghost btn-sm text-destructive" onClick={onDelete}>Delete</button>
          </div>
        </div>
        {codeSnippet.description && (
          <p className="whitespace-pre-wrap text-sm rounded-lg bg-muted/40 border border-border px-3 py-2">{codeSnippet.description}</p>
        )}
        {codeSnippet.code ? (
          <CodeView code={codeSnippet.code} language={codeSnippet.language || 'javascript'} />
        ) : (
          <p className="text-sm text-muted-foreground">No code yet. Open the editor to start.</p>
        )}
      </div>
    );
  }

  return (
    <div className="surface p-5 rounded-xl border border-primary/50 shadow-md flex flex-col gap-4 bg-muted/10">
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border pb-3">
        <h3 className="font-bold">{isNew ? 'New practice solution' : 'Edit practice solution'}</h3>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (draft.code !== codeSnippet.code || draft.title !== codeSnippet.title || draft.description !== codeSnippet.description) {
              if (!confirm("Discard unsaved changes?")) return;
            }
            if (isNew) onDelete(); else setEditing(false);
          }}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onUpdate(draft); setEditing(false); }}>Save</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_12rem] gap-3">
        <label className="block">
          <span className="label-quiet">Title</span>
          <input className="input-field" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Two Sum with a hash map" />
        </label>
        <label className="block">
          <span className="label-quiet">Language</span>
          <select className="input-field" value={draft.language || 'javascript'} onChange={e => setDraft({ ...draft, language: e.target.value })}>
            {['javascript', 'typescript', 'java', 'python', 'cpp', 'go', 'html', 'css', 'sql'].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="label-quiet">Task / notes (what this code should do)</span>
        <textarea className="input-field min-h-[60px]" value={draft.description || ''} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Describe the exercise or what you are practising..." />
      </label>
      <div className="block">
        <span className="label-quiet">{runnable ? 'Code (write, then Run to see the output)' : 'Code'}</span>
        {runnable ? (
          <AlgoEditor
            initialLanguage={draft.language || 'javascript'}
            initialCode={draft.code || ''}
            height="460px"
            onCodeChange={(val) => setDraft((d) => ({ ...d, code: val }))}
            onLanguageChange={(lang) => setDraft((d) => ({ ...d, language: lang }))}
          />
        ) : (
          <CodeEditor value={draft.code || ''} language={draft.language || 'javascript'} onChange={val => setDraft({ ...draft, code: val })} minHeight="300px" />
        )}
      </div>
    </div>
  );
}

function MistakeItem({ mistake, onUpdate, onDelete }: { mistake: string, onUpdate: (e: string) => void, onDelete: () => void }) {
  const [editing, setEditing] = useState(mistake === '');
  const [draft, setDraft] = useState(mistake);

  if (!editing) {
    return (
      <div className="surface p-4 rounded-xl border border-border flex justify-between items-start gap-4 group">
        <div className="flex-1 mt-1">
          {(() => {
            const m = mistake.match(/^(.*?)\s+— Why:\s+(.*?)\s+— Fix:\s+(.*)$/s);
            if (!m) return <p className="whitespace-pre-wrap">{mistake}</p>;
            return (
              <div className="space-y-1.5">
                <p className="font-semibold">{m[1]}</p>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-amber-500">Why: </span>{m[2]}</p>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-emerald-500">Fix: </span>{m[3]}</p>
              </div>
            );
          })()}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(mistake); setEditing(true); }}>Edit</button>
          <button className="btn btn-ghost btn-sm text-destructive" onClick={onDelete}>Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-4 rounded-xl border border-primary/50 shadow-md flex flex-col gap-3 bg-muted/10">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h4 className="font-bold text-sm">{mistake === '' ? 'New Pitfall' : 'Edit Pitfall'}</h4>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (draft !== mistake) {
              if (!confirm("Discard unsaved changes?")) return;
            }
            if (mistake === '') {
              onDelete();
            } else {
              setEditing(false);
            }
          }}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onUpdate(draft); setEditing(false); }}>Save</button>
        </div>
      </div>
      <textarea className="input-field min-h-[60px]" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Describe the common mistake..." />
    </div>
  );
}


/** Days until the next revision, based on how confident the learner feels. */
function revisionGapDays(confidence?: number): number {
  switch (confidence) {
    case 5: return 30;
    case 4: return 14;
    case 3: return 7;
    case 2: return 3;
    default: return 1;
  }
}

function addDaysKey(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayKeyLocal(): string {
  return addDaysKey(0);
}

function AiGenerateButton({ label, busy, onClick, className = '' }: { label: string; busy: boolean; onClick: () => void; className?: string }) {
  return (
    <button type="button" className={`btn btn-primary btn-sm ${className}`} disabled={busy} onClick={onClick}>
      {busy ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
          Generating…
        </span>
      ) : (
        `✨ ${label}`
      )}
    </button>
  );
}

interface KnowledgeWorkspaceDetailProps {
  initialActivity?: string;
  initialTab?:
    "Concepts" | "Examples" | "Diagrams" | "Practice" | "Mistakes" | "Revision";
  onSchedule?: (activity?: string) => void;
  topicId: string;
  workspaces: KnowledgeWorkspace[];
  onSaveWorkspace: (ws: KnowledgeWorkspace) => void;
  onBack: () => void;
}

export default function KnowledgeWorkspaceDetail({
  topicId,
  initialTab = "Concepts",
  onSchedule,
  workspaces,
  onSaveWorkspace,
  onBack,
}: KnowledgeWorkspaceDetailProps) {
  const [activeTab, setActiveTab] = useState<
    "Concepts" | "Examples" | "Diagrams" | "Practice" | "Mistakes" | "Revision"
  >(initialTab);
  const [showTutor, setShowTutor] = useState(false);

  // Find or create workspace
  const workspace = useMemo(() => {
    return (
      workspaces.find((w) => w.topicId === topicId) ||
      ({
        topicId,
        learningStatus: "Not Started",
        notes: [],
        examples: [],
        diagrams: [],
        codeSnippets: [],
        mistakes: [],
        flashcards: [],
        linkedActivities: [],
        customResources: [],
      } as KnowledgeWorkspace)
    );
  }, [topicId, workspaces]);

  // Find curriculum details for breadcrumbs and title
  const curriculumInfo = useMemo(() => {
    let foundTrack: CurriculumTrack | null = null;
    let foundTopic: CurriculumTopic | null = null;
    let foundSubtopic: CurriculumSubtopic | null = null;
    let foundTitle = topicId;

    for (const track of allCurriculums) {
      for (const level of track.levels) {
        for (const cat of level.categories) {
          for (const mod of cat.modules) {
            for (const topic of mod.topics) {
              if (topic.id === topicId) {
                foundTrack = track;
                foundTopic = topic;
                foundTitle = topic.title;
                break;
              }
              for (const sub of topic.subtopics) {
                if (sub.id === topicId) {
                  foundTrack = track;
                  foundTopic = topic;
                  foundSubtopic = sub;
                  foundTitle = sub.title;
                  break;
                }
              }
            }
          }
        }
      }
    }

    return {
      track: foundTrack,
      topic: foundTopic,
      subtopic: foundSubtopic,
      title: foundTitle,
    };
  }, [topicId]);

  const handleUpdate = (updates: Partial<KnowledgeWorkspace>) => {
    onSaveWorkspace({
      ...workspace,
      lastStudiedAt: new Date().toISOString(),
      ...updates,
    });
  };

  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [codeLanguage, setCodeLanguage] = useCodeLanguage();
  const explainWithAi = async () => {
    setExplainError(null);
    if (!(await isAiAvailable())) {
      setExplainError(AI_SETUP_HINT);
      return;
    }
    setExplaining(true);
    try {
      const parts = curriculumInfo.topic?.subtopics.map((s) => s.title).join(", ") || "";
      const text = await chatWithAI({
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: [
              "You are a patient senior engineer teaching a junior developer who is preparing for interviews.",
              `All code must be in ${codeLanguage}. Never switch languages.`,
              "Start from zero: assume the reader has never heard the term. Prefer plain words over jargon; define any jargon the first time it appears.",
              "Write GitHub-flavoured Markdown with real line breaks. Use exactly these H2 sections in this order:",
              `## What is ${curriculumInfo.title}?`,
              "(2–3 plain-language sentences that define it, then one everyday analogy in **bold** on its own line.)",
              "## Why it matters",
              "(Where it shows up in real software and interviews. 3 bullets.)",
              "## Real-world example",
              "(One concrete story from a product people know, e.g. a food-delivery app or a payment system, showing the concept in action. 1 short paragraph.)",
              "## How it works, step by step",
              "(A numbered list from the simplest case to the general case.)",
              `## Example in ${codeLanguage}`,
              "(One fenced code block with the language tag and comments, then a 3–4 line walkthrough.)",
              "## Common mistakes",
              "(Bullets: mistake → why it happens → fix.)",
              "## Interview questions",
              "(3 questions, each followed by a one-line model answer.)",
              "## Quick recap",
              "(3 bullets a learner can revise from in one minute.)",
              "Use short paragraphs and bullet lists (each bullet on its own line). No tables. No preamble or closing remarks.",
            ].join("\n"),
          },
          {
            role: "user",
            content: `Topic: "${curriculumInfo.title}" from the track "${curriculumInfo.track?.title || "software engineering"}". Sub-parts to cover: ${parts || "core concept, examples, pitfalls"}.`,
          },
        ],
      });
      const html = renderMarkdown(text);
      const note: TopicNote = {
        id: uuidv4(),
        title: `AI explanation: ${curriculumInfo.title} (${codeLanguage})`,
        content: html,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      handleUpdate({ notes: [note, ...workspace.notes], learningStatus: workspace.learningStatus === "Not Started" ? "Learning" : workspace.learningStatus });
    } catch (err) {
      setExplainError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setExplaining(false);
    }
  };

  // AI generation for the other tabs. Everything lands in the workspace as editable, deletable items.
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [diagramRequest, setDiagramRequest] = useState("");
  const topicContext = (): TopicContext => ({
    title: curriculumInfo.title,
    track: curriculumInfo.track?.title,
    subtopics: curriculumInfo.topic?.subtopics.map((s) => s.title),
    notes: workspace.notes.map((n) => n.content.replace(/<[^>]+>/g, " ")).join("\n").slice(0, 2500),
    language: codeLanguage,
  });
  const runGenerate = async (kind: "examples" | "diagram" | "mistakes" | "flashcards" | "problems") => {
    setAiError(null);
    if (!(await isAiAvailable())) {
      setAiError(AI_SETUP_HINT);
      return;
    }
    setAiBusy(kind);
    try {
      const ctx = topicContext();
      const now = new Date().toISOString();
      if (kind === "examples") {
        const items = await generateExamples(ctx);
        if (!items.length) throw new Error("The AI returned no examples. Try again.");
        handleUpdate({
          examples: [
            ...workspace.examples,
            ...items.map((e) => ({
              id: uuidv4(),
              title: e.title,
              problemStatement: e.problemStatement || "",
              inputOutput: e.inputOutput || "",
              explanation: e.explanation || "",
              implementationCode: ensureReadableCode(e.implementationCode || "", LANGUAGE_IDS[codeLanguage]),
              implementationLanguage: LANGUAGE_IDS[codeLanguage],
              timeComplexity: e.timeComplexity,
              spaceComplexity: e.spaceComplexity,
              commonMistakes: e.commonMistakes,
            })),
          ],
        });
      } else if (kind === "diagram") {
        const d = await generateDiagram(ctx, diagramRequest.trim() || undefined);
        const type = (["Flowchart", "Sequence", "Class", "State", "Architecture"].includes(d.type) ? d.type : "General") as TopicDiagram["type"];
        handleUpdate({
          diagrams: [
            ...workspace.diagrams,
            { id: uuidv4(), title: d.title || `${curriculumInfo.title} diagram`, type, mermaidCode: d.mermaidCode, creationMethod: "ai", createdAt: now, updatedAt: now },
          ],
        });
        setDiagramRequest("");
      } else if (kind === "mistakes") {
        const items = await generateMistakes(ctx);
        if (!items.length) throw new Error("The AI returned no mistakes. Try again.");
        handleUpdate({ mistakes: [...workspace.mistakes, ...items.map((m) => `${m.mistake} — Why: ${m.why} — Fix: ${m.fix}`)] });
      } else if (kind === "flashcards") {
        const cards = await generateFlashcards(ctx);
        if (!cards.length) throw new Error("The AI returned no flashcards. Try again.");
        handleUpdate({
          flashcards: [...workspace.flashcards, ...cards.map((c) => ({ id: uuidv4(), front: c.front, back: c.back, easeFactor: 2.5, interval: 0, dueDate: todayKeyLocal() }))],
        });
      } else if (kind === "problems") {
        const items = await generatePracticeProblems(ctx);
        if (!items.length) throw new Error("The AI returned no problems. Try again.");
        handleUpdate({
          codeSnippets: [
            ...workspace.codeSnippets,
            ...items.map((p) => ({
              id: uuidv4(),
              title: p.title,
              language: LANGUAGE_IDS[codeLanguage],
              code: p.starterCode || "",
              description: `${p.prompt}${p.hint ? `\n\nHint: ${p.hint}` : ""}`,
            })),
          ],
        });
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setAiBusy(null);
    }
  };

  const todayStr = todayKeyLocal();
  const quizItems = (curriculumInfo.topic?.quiz || []).concat(workspace.flashcards.map((c) => ({ question: c.front, answer: c.back })));
  const flashcardsDue = workspace.flashcards.filter((c) => !c.dueDate || c.dueDate.slice(0, 10) <= todayStr).length;
  const revisionDue = Boolean(workspace.nextRevisionDate && workspace.nextRevisionDate.slice(0, 10) <= todayStr);
  const tabCounts: Record<string, number> = {
    Concepts: workspace.notes.length,
    Examples: workspace.examples.length,
    Diagrams: workspace.diagrams.length,
    Practice: workspace.codeSnippets.length + quizItems.length,
    Mistakes: workspace.mistakes.filter(Boolean).length,
    Revision: flashcardsDue + (revisionDue ? 1 : 0),
  };

  // NOTE: Simple render implementations for now to complete the structure
  const renderConcepts = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider">Concept Explanations & Notes</h3>
        <button className="btn btn-primary btn-sm" onClick={() => onSchedule?.()}>
          + Add Task / Schedule
        </button>
      </div>

      {curriculumInfo.topic?.description && (
        <div className="surface p-6 rounded-xl border border-border shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">Overview</p>
          <p className="whitespace-pre-line text-lg leading-relaxed">{curriculumInfo.topic.description}</p>
        </div>
      )}

      <div className={`rounded-xl border p-5 text-sm ${curriculumInfo.topic?.description ? "border-primary/25 bg-primary/5" : "border-dashed border-border"}`}>
        <p className="font-semibold text-foreground">
          {curriculumInfo.topic?.description ? "Go deeper with an AI lesson" : "No authored lesson for this topic yet."}
        </p>
        <p className="text-muted-foreground mt-1">
          {curriculumInfo.topic?.description
            ? `Get a full explanation from zero: definition, why it matters, a real-world example, step-by-step walkthrough and code in ${codeLanguage}. It is saved as a note you can edit.`
            : "Learn it from the resources below or ask the AI to explain it from zero, then capture what you understood as a note."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn btn-primary btn-sm" disabled={explaining} onClick={() => void explainWithAi()}>
            {explaining ? "Writing explanation…" : `✨ Explain this topic with AI in ${codeLanguage}`}
          </button>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            Code language
            <select
              aria-label="Preferred code language"
              className="input-field !w-auto !py-1 !px-2 text-xs"
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value as (typeof CODE_LANGUAGES)[number])}
            >
              {CODE_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTutor(true)}>Ask the tutor a question</button>
        </div>
        {explainError && <p className="mt-2 text-sm text-destructive" role="alert">{explainError}</p>}
      </div>

      {curriculumInfo.topic && curriculumInfo.topic.subtopics.length > 0 && (
        <details className="surface rounded-xl border border-border p-4">
          <summary className="cursor-pointer font-semibold">What this topic covers ({curriculumInfo.topic.subtopics.length} parts)</summary>
          <ul className="mt-3 space-y-3">
            {curriculumInfo.topic.subtopics.map((sub) => (
              <li key={sub.id} className="text-sm">
                <p className="font-medium text-foreground">{sub.title}</p>
                {sub.description && <p className="text-muted-foreground">{sub.description}</p>}
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {sub.tasks.map((t) => (
                    <li key={t.id} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {t.title} · {t.estDurationMinutes} min
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      )}

      {curriculumInfo.topic?.subtopics
        .flatMap((s) => s.tasks.flatMap((t) => t.links || []))
        .map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline flex items-center gap-2"
          >
            <span className="text-xl">🔗</span> {link.title}
          </a>
        ))}

      <div className="flex flex-col gap-4">
        {workspace.notes.map((note) => (
          <div
            key={note.id}
            className="surface p-6 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-shadow"
          >
            <RichTextEditor
              initialTitle={note.title}
              initialContent={note.content}
              attachments={note.attachments || []}
              onUpdate={(title, content, attachments) => {
                const updatedNotes = workspace.notes.map((n) =>
                  n.id === note.id
                    ? {
                        ...n,
                        title,
                        content,
                        attachments,
                        updatedAt: new Date().toISOString(),
                      }
                    : n,
                );
                handleUpdate({ notes: updatedNotes });
              }}
              onDelete={() => {
                if (confirm("Delete this note?")) {
                  handleUpdate({
                    notes: workspace.notes.filter((n) => n.id !== note.id),
                  });
                }
              }}
            />
          </div>
        ))}
      </div>
      <button
        className="btn btn-ghost border border-dashed border-border w-full py-4 text-primary"
        onClick={() => {
          const newNote: TopicNote = {
            id: uuidv4(),
            title: "New Concept Note",
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
  );

  const [diagramTab, setDiagramTab] = useState<'my-diagrams' | 'learn'>('my-diagrams');

  const renderDiagrams = () => (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          className={`font-semibold pb-2 border-b-2 transition-colors ${diagramTab === 'my-diagrams' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setDiagramTab('my-diagrams')}
        >
          My Diagrams
        </button>
        <button 
          className={`font-semibold pb-2 border-b-2 transition-colors ${diagramTab === 'learn' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setDiagramTab('learn')}
        >
          Learn UML & Patterns
        </button>
      </div>

      {diagramTab === 'my-diagrams' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6">
            {workspace.diagrams.map((diagram) => (
              <DiagramItem
                key={diagram.id}
                diagram={diagram}
                onUpdate={(updated) => handleUpdate({ diagrams: workspace.diagrams.map(x => x.id === updated.id ? updated : x) })}
                onDelete={() => {
                  if (confirm("Delete this diagram? Your notes and learning work will be kept.")) {
                    handleUpdate({ diagrams: workspace.diagrams.filter(x => x.id !== diagram.id) })
                  }
                }}
              />
            ))}
          </div>
          <button
            className="btn btn-ghost border border-dashed border-border w-full py-4 text-primary"
            onClick={() => {
              const newDiag: TopicDiagram = {
                id: uuidv4(),
                title: "New Diagram",
                mermaidCode: "",
                creationMethod: "visual",
                type: "General",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              handleUpdate({ diagrams: [...workspace.diagrams, newDiag] });
            }}
          >
            + Create Diagram
          </button>
          <div className="rounded-xl border border-dashed border-border p-4 space-y-3">
            <p className="text-sm font-semibold">Generate a diagram with AI</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="input-field"
                value={diagramRequest}
                onChange={(e) => setDiagramRequest(e.target.value)}
                placeholder={`Optional: what to show, e.g. "flowchart of how ${curriculumInfo.title} works"`}
              />
              <AiGenerateButton label="Generate diagram" busy={aiBusy === "diagram"} onClick={() => void runGenerate("diagram")} className="shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground">Creates a Mermaid diagram you can edit afterwards. Leave the request empty to let the AI pick the best view.</p>
            {aiError && <p className="text-sm text-destructive" role="alert">{aiError}</p>}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[600px]">
          <UmlLearningMode />
        </div>
      )}
    </div>
  );

  const renderMistakes = () => (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider mb-2">Common Mistakes & Pitfalls</h3>
      <div className="flex flex-col gap-3">
        {workspace.mistakes.map((m, idx) => (
          <MistakeItem
            key={idx}
            mistake={m}
            onUpdate={(updated) => {
              const newM = [...workspace.mistakes];
              newM[idx] = updated;
              handleUpdate({ mistakes: newM });
            }}
            onDelete={() => {
              if (confirm("Delete this mistake?")) {
                const newM = [...workspace.mistakes];
                newM.splice(idx, 1);
                handleUpdate({ mistakes: newM });
              }
            }}
          />
        ))}
      </div>
      <button
        className="btn btn-ghost border border-dashed border-border w-full py-4 text-primary mt-2"
        onClick={() => handleUpdate({ mistakes: [...workspace.mistakes, ""] })}
      >
        + Add Pitfall
      </button>
      <div className="flex flex-wrap items-center gap-3">
        <AiGenerateButton label="Generate common mistakes" busy={aiBusy === "mistakes"} onClick={() => void runGenerate("mistakes")} />
        <span className="text-xs text-muted-foreground">Each with why it happens and how to fix it.</span>
      </div>
      {aiError && <p className="text-sm text-destructive" role="alert">{aiError}</p>}
    </div>
  );

  return (
    <div className={`animate-rise flex flex-col gap-6 max-w-6xl mx-auto w-full pb-24 transition-[padding] duration-300 lg:pr-[var(--tutor-pad,0px)]`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="btn btn-ghost px-3">
          ← Back
        </button>
        <div className="flex flex-col">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {curriculumInfo.track?.title}{" "}
            {curriculumInfo.topic ? `> ${curriculumInfo.topic.title}` : ""}
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            {curriculumInfo.title}
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Knowledge Workspace
            </span>
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowTutor(!showTutor)}
            className={`btn ${showTutor ? "bg-primary/20 text-primary" : "btn-ghost border border-border"} flex items-center gap-2`}
          >
            <span className="text-lg">🤖</span>{" "}
            {showTutor ? "Hide Tutor" : "Ask AI Tutor"}
          </button>
        </div>
      </div>

      {/* Learning Status Bar */}
      <div className="surface rounded-xl p-4 border border-border flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <span className="whitespace-nowrap">Status:</span>
            <select
              className="input-field min-w-[140px]"
              value={workspace.learningStatus}
              onChange={(e) =>
                handleUpdate({ learningStatus: e.target.value as any })
              }
            >
              <option value="Not Started">Not Started</option>
              <option value="Learning">Learning</option>
              <option value="Practicing">Practicing</option>
              <option value="Needs Revision">Needs Revision</option>
              <option value="Mastered">Mastered</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <span className="whitespace-nowrap">Confidence:</span>
            <select
              className="input-field min-w-[120px]"
              value={workspace.confidenceRating?.toString() || ""}
              onChange={(e) =>
                handleUpdate({
                  confidenceRating: e.target.value ? (parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5) : undefined,
                })
              }
            >
              <option value="">--</option>
              <option value="1">1 (Low)</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 (High)</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm border border-border"
            onClick={() => onSchedule?.("Revise Topic")}
          >
            Schedule Revision
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSchedule?.()}
          >
            Add to Today
          </button>
          <button
            className="btn"
            onClick={() => handleUpdate({ bookmarked: !workspace.bookmarked })}
          >
            {workspace.bookmarked ? "Remove Bookmark" : "Bookmark Topic"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="workspace-tabs flex border-b border-border overflow-x-auto no-scrollbar">
        {(
          [
            "Concepts",
            "Examples",
            "Diagrams",
            "Practice",
            "Mistakes",
            "Revision",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${tab === "Revision" && (revisionDue || flashcardsDue) ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                {tabCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {/* Content Area with optional sidebar for AI Tutor */}
      <div className="mt-2 flex gap-6 relative">
        <div className="flex-1 min-w-0 transition-all duration-300">
          {activeTab === "Concepts" && renderConcepts()}
          {activeTab === "Examples" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider">Worked examples</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {workspace.examples.length
                      ? `${workspace.examples.length} example${workspace.examples.length === 1 ? "" : "s"} · traced step by step, with code you can copy or run.`
                      : "Small, fully traced problems with code. Generate a set or write your own."}
                  </p>
                </div>
                <AiGenerateButton label={`Generate 3 worked examples in ${codeLanguage}`} busy={aiBusy === "examples"} onClick={() => void runGenerate("examples")} />
              </div>
              {aiError && <p className="text-sm text-destructive" role="alert">{aiError}</p>}
              {workspace.examples.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No worked examples yet. Generate three in {codeLanguage}, or add one by hand below.
                </div>
              )}
              {workspace.examples.map((example) => (
                <ExampleItem
                  key={example.id}
                  example={example}
                  onUpdate={(updated) => handleUpdate({ examples: workspace.examples.map(x => x.id === updated.id ? updated : x) })}
                  onDelete={() => {
                    if (confirm("Delete this example?")) {
                      handleUpdate({ examples: workspace.examples.filter(x => x.id !== example.id) })
                    }
                  }}
                  onPractice={(code, language, title) => {
                    handleUpdate({
                      codeSnippets: [
                        ...workspace.codeSnippets,
                        { id: uuidv4(), title: `Try: ${title}`, language, code, description: "Copied from the worked example. Edit it, run it, and break it on purpose." },
                      ],
                    });
                    setActiveTab("Practice");
                  }}
                />
              ))}
              <button
                className="btn btn-ghost border border-dashed border-border w-full py-4 text-primary"
                onClick={() =>
                  handleUpdate({
                    examples: [
                      ...workspace.examples,
                      {
                        id: uuidv4(),
                        title: "New Example",
                        problemStatement: "",
                        inputOutput: "",
                        explanation: "",
                      },
                    ],
                  })
                }
              >
                + Add Worked Example
              </button>
            </div>
          )}
          {activeTab === "Diagrams" && renderDiagrams()}
          {activeTab === "Practice" && (
            <div className="space-y-8">
              {quizItems.length > 0 ? (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider">Quiz yourself</h3>
                    <span className="text-xs text-muted-foreground">{Object.values(workspace.quizAnswers || {}).filter(Boolean).length} / {quizItems.length} answered</span>
                  </div>
                  {quizItems.map((q, i) => (
                    <div key={`${i}-${q.question}`} className="surface rounded-xl border border-border p-4 space-y-2">
                      <label className="block">
                        <span className="font-medium">{i + 1}. {q.question}</span>
                        <textarea
                          className="input-field mt-2"
                          placeholder="Write your answer before checking…"
                          value={workspace.quizAnswers?.[String(i)] || ""}
                          onChange={(e) => handleUpdate({ quizAnswers: { ...workspace.quizAnswers, [String(i)]: e.target.value } })}
                        />
                      </label>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary font-medium">Check answer</summary>
                        <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{q.answer}</p>
                      </details>
                    </div>
                  ))}
                </section>
              ) : (
                <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-4">
                  No quiz for this topic yet. Add flashcards in the Revision tab and they appear here as quiz questions.
                </p>
              )}

              <section className="space-y-4">
                <h3 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider">Code practice</h3>
                {curriculumInfo.topic?.subtopics
                  .flatMap((s) => s.tasks.flatMap((t) => t.links || []))
                  .map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="block text-primary underline">
                      {l.title}
                    </a>
                  ))}
                {workspace.codeSnippets.length === 0 && (
                  <p className="text-sm text-muted-foreground">Write a solution or implementation from memory, run it in the editor, and keep it here for revision.</p>
                )}
                {workspace.codeSnippets.map((code) => (
                  <CodeSnippetItem
                    key={code.id}
                    codeSnippet={code}
                    onUpdate={(updated) => handleUpdate({ codeSnippets: workspace.codeSnippets.map((x) => (x.id === updated.id ? updated : x)) })}
                    onDelete={() => {
                      if (confirm("Delete this code snippet?")) {
                        handleUpdate({ codeSnippets: workspace.codeSnippets.filter((x) => x.id !== code.id) });
                      }
                    }}
                  />
                ))}
                <button
                  className="btn btn-ghost border border-dashed border-border w-full py-4 text-primary"
                  onClick={() =>
                    handleUpdate({
                      codeSnippets: [...workspace.codeSnippets, { id: uuidv4(), title: "Practice Solution", language: LANGUAGE_IDS[codeLanguage], code: "", description: "" }],
                    })
                  }
                >
                  + Create Code Example / Solution
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <AiGenerateButton label={`Generate 3 practice problems in ${codeLanguage}`} busy={aiBusy === "problems"} onClick={() => void runGenerate("problems")} />
                  <span className="text-xs text-muted-foreground">Starter code with a TODO; write the solution and press Run.</span>
                </div>
                {aiError && <p className="text-sm text-destructive" role="alert">{aiError}</p>}
                {onSchedule && (
                  <button className="btn btn-ghost btn-sm" onClick={() => onSchedule("Solve DSA / LeetCode Problems")}>
                    Schedule problem-solving for this topic
                  </button>
                )}
              </section>
            </div>
          )}
          {activeTab === "Mistakes" && renderMistakes()}
          {activeTab === "Revision" && (
            <div className="space-y-8 animate-fade">
              <div className={`surface p-6 rounded-xl border flex flex-col gap-4 ${revisionDue ? "border-amber-500/40 bg-amber-500/5" : "border-primary/20 bg-primary/5"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-primary">Revision plan</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workspace.lastRevisionDate ? `Last revised ${workspace.lastRevisionDate.slice(0, 10)}. ` : "Not revised yet. "}
                      {workspace.nextRevisionDate
                        ? revisionDue
                          ? `Revision is due (${workspace.nextRevisionDate.slice(0, 10)}).`
                          : `Next revision on ${workspace.nextRevisionDate.slice(0, 10)}.`
                        : "Mark it revised to start a spaced schedule."}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const gap = revisionGapDays(workspace.confidenceRating);
                      handleUpdate({
                        lastRevisionDate: todayKeyLocal(),
                        nextRevisionDate: addDaysKey(gap),
                        learningStatus: workspace.learningStatus === "Needs Revision" ? "Practicing" : workspace.learningStatus,
                      });
                    }}
                  >
                    ✓ Mark revised today
                  </button>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="block">
                    <span className="label-quiet">Next revision date</span>
                    <input
                      className="input-field"
                      type="date"
                      value={workspace.nextRevisionDate?.slice(0, 10) || ""}
                      onChange={(e) => handleUpdate({ nextRevisionDate: e.target.value })}
                    />
                  </label>
                  {onSchedule && (
                    <button className="btn btn-ghost" onClick={() => onSchedule("Revise Topic")}>
                      Add a revision task to my plan
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Gaps follow your confidence rating: 1 → 1 day, 2 → 3 days, 3 → 1 week, 4 → 2 weeks, 5 → 1 month.</p>
              </div>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Flashcards</h3>
                  <span className="text-xs text-muted-foreground">Space to flip · 1 / 2 / 3 to grade</span>
                </div>
                <FlashcardDeck
                  cards={workspace.flashcards}
                  onChange={(flashcards) => handleUpdate({ flashcards })}
                  onGenerate={() => void runGenerate("flashcards")}
                  generating={aiBusy === "flashcards"}
                />
                {aiError && <p className="text-sm text-destructive" role="alert">{aiError}</p>}
              </section>

              <section className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-semibold text-lg">Quick recap</h3>
                {workspace.notes.length === 0 && workspace.mistakes.length === 0 && workspace.examples.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing captured yet. Notes, examples and mistakes you add in the other tabs show up here for a fast review.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {workspace.notes.map((n) => (
                      <button key={n.id} type="button" className="surface rounded-xl border border-border p-3 text-left hover:border-primary/40" onClick={() => setActiveTab("Concepts")}>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Note</p>
                        <p className="font-medium truncate">{n.title || "Untitled note"}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.content.replace(/<[^>]+>/g, " ").trim() || "Empty"}</p>
                      </button>
                    ))}
                    {workspace.examples.map((ex) => (
                      <button key={ex.id} type="button" className="surface rounded-xl border border-border p-3 text-left hover:border-primary/40" onClick={() => setActiveTab("Examples")}>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Example</p>
                        <p className="font-medium truncate">{ex.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ex.explanation || ex.problemStatement || "No explanation yet"}</p>
                      </button>
                    ))}
                    {workspace.mistakes.filter(Boolean).map((m, i) => (
                      <button key={i} type="button" className="surface rounded-xl border border-amber-500/30 p-3 text-left hover:border-amber-500/60" onClick={() => setActiveTab("Mistakes")}>
                        <p className="text-[11px] uppercase tracking-wider text-amber-500">Pitfall</p>
                        <p className="text-sm line-clamp-3">{m}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {showTutor && (
                      <AITutor
              contextTitle={curriculumInfo.title || topicId}
              contextBody={JSON.stringify(
                workspace.notes.map((n) => n.title + "\n" + n.content),
              )}
              mode="general"
              onClose={() => setShowTutor(false)}
            />
        )}
      </div>
    </div>
  );
}
