import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AI_SETUP_HINT,
  chatWithAI,
  isAiAvailable,
  type AIMessage,
} from "../lib/aiGatewayClient";
import { getCodeLanguage } from "../lib/preferences";
import { renderMarkdownRich } from "../lib/markdown";
import {
  useFloatingPanel,
  useIsDesktop,
  type ResizeDir,
} from "../lib/useFloatingPanel";

interface AITutorProps {
  contextTitle: string;
  contextBody: string;
  mode?: "general" | "dsa" | "system-design";
  onClose?: () => void;
}

type TutorMode = NonNullable<AITutorProps["mode"]>;

interface QuickAction {
  label: string;
  hint: string;
  icon: string;
  tone: "purple" | "magenta" | "orange" | "blue" | "yellow";
}

const DSA_HINT_LADDER = [
  "a small conceptual nudge only: what is the core problem, without naming the technique",
  "the relevant pattern or data structure to consider, without the algorithm",
  "an outline of the approach in 3–4 bullets, no code",
  "pseudocode for the approach, still no real code",
  "the full solution with a walkthrough and complexity analysis",
];

const QUICK_ACTIONS: Record<TutorMode, QuickAction[]> = {
  general: [
    {
      label: "Explain from zero",
      hint: "Definition first, then how it works",
      icon: "📖",
      tone: "purple",
    },
    {
      label: "Real-world analogy",
      hint: "Relate it to something everyday",
      icon: "🌍",
      tone: "orange",
    },
    {
      label: "Quiz me",
      hint: "3 quick questions to test recall",
      icon: "🎯",
      tone: "magenta",
    },
    {
      label: "Summarize my notes",
      hint: "Turn what I wrote into key points",
      icon: "📝",
      tone: "blue",
    },
    {
      label: "Interview questions",
      hint: "What interviewers ask about this",
      icon: "💼",
      tone: "yellow",
    },
  ],
  dsa: [
    {
      label: "Which pattern?",
      hint: "Name the technique, not the solution",
      icon: "🧩",
      tone: "purple",
    },
    {
      label: "Review my code",
      hint: "Find bugs and edge cases",
      icon: "🔍",
      tone: "magenta",
    },
    {
      label: "Complexity check",
      hint: "Time and space of my approach",
      icon: "⏱️",
      tone: "orange",
    },
    {
      label: "Trace an example",
      hint: "Walk a tiny input step by step",
      icon: "🧮",
      tone: "blue",
    },
  ],
  "system-design": [
    {
      label: "Review my architecture",
      hint: "Strengths, gaps and missing pieces",
      icon: "🏗️",
      tone: "purple",
    },
    {
      label: "Find the bottlenecks",
      hint: "Where it breaks under load",
      icon: "🚧",
      tone: "orange",
    },
    {
      label: "Trade-offs",
      hint: "What we gain and give up",
      icon: "⚖️",
      tone: "magenta",
    },
    {
      label: "Scale it 10x",
      hint: "What changes at ten times traffic",
      icon: "📈",
      tone: "blue",
    },
  ],
};

const PROMPTS: Record<string, string> = {
  "Explain from zero":
    "Explain this topic from zero: start with a one-line definition, why it matters, then how it works step by step with a short code example.",
  "Real-world analogy":
    "Give me a real-world analogy for this topic, then map each part of the analogy to the technical concept.",
  "Quiz me":
    "Quiz me with 3 questions on this topic, one at a time. Wait for my answer before revealing the next one.",
  "Summarize my notes":
    "Summarize my notes into the 5 most important points, and flag anything that looks wrong or incomplete.",
  "Interview questions":
    "What do interviewers usually ask about this topic? Give 5 questions with a short model answer for each.",
  "Which pattern?":
    "What pattern or data structure does this problem use? Explain how to recognise it, without giving the solution.",
  "Review my code":
    "Review my code for bugs, edge cases and readability. Point at specific lines and suggest fixes.",
  "Complexity check":
    "What is the time and space complexity of my approach? Explain how you derived it.",
  "Trace an example":
    "Give me a small example input and trace my approach through it step by step.",
  "Review my architecture":
    "Review my architecture: what is strong, what is missing, and what would you change first?",
  "Find the bottlenecks":
    "Where are the bottlenecks in this design? Rank them by how soon they would hurt.",
  "Trade-offs":
    "What are the main trade-offs in this design? Compare the alternatives for each decision.",
  "Scale it 10x":
    "How would this design need to change to handle 10x the traffic and data?",
};

const MODE_LABEL: Record<TutorMode, string> = {
  general: "Concept coach",
  dsa: "DSA coach",
  "system-design": "Design reviewer",
};

/** A chat turn; `display` is the short label shown instead of the full prompt text. */
type ChatEntry = AIMessage & { display?: string };

function storageKey(mode: string, title: string) {
  return `jobappy-tutor:${mode}:${title}`;
}

function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div
      className={`tutor-avatar ${size === "sm" ? "w-7 h-7 text-sm" : "w-10 h-10 text-lg"}`}
      aria-hidden="true"
    >
      ✦
    </div>
  );
}

export default function AITutor({
  contextTitle,
  contextBody,
  mode = "general",
  onClose,
}: AITutorProps) {
  const key = storageKey(mode, contextTitle);
  const [messages, setMessages] = useState<ChatEntry[]>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? (JSON.parse(saved) as ChatEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const desktop = useIsDesktop();
  const panel = useFloatingPanel({
    storageKey: "jobappy-tutor-layout",
    enabled: mounted && desktop,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const language = getCodeLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    isAiAvailable().then((v) => {
      if (!cancelled) setAvailable(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(messages.slice(-40)));
    } catch {
      // ignore
    }
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, key, isLoading]);

  // Copy buttons inside rendered code blocks (event delegation, since bubbles are static HTML).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest(
        "button[data-copy]",
      ) as HTMLButtonElement | null;
      if (!button) return;
      const code =
        button.closest(".code-card")?.querySelector("code")?.textContent || "";
      navigator.clipboard?.writeText(code).then(() => {
        button.textContent = "Copied";
        window.setTimeout(() => (button.textContent = "Copy"), 1500);
      });
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  const systemPrompt = useMemo(() => {
    const lines = [
      "You are a friendly, precise tutor for a software engineer preparing for interviews.",
      `Current topic: ${contextTitle}.`,
      `Preferred programming language: ${language}. Use it for every code example unless the learner asks otherwise.`,
      "Answer in GitHub-flavoured Markdown: short paragraphs, bullet lists, fenced code blocks with a language tag. The chat panel is narrow, so never use tables; use bullet lists or short labelled lines instead. Define jargon the first time you use it. Keep answers focused; ask one clarifying question if the request is ambiguous.",
    ];
    if (contextBody)
      lines.push(
        `The learner's current notes/code:\n"""\n${contextBody.slice(0, 6000)}\n"""`,
      );
    if (mode === "dsa")
      lines.push(
        "You are a DSA coach. Never give the full solution unless the learner explicitly asks for the final hint level. Prefer guiding questions and progressively stronger hints.",
      );
    if (mode === "system-design")
      lines.push(
        "You are a staff engineer reviewing a system design. Focus on requirements, bottlenecks, scalability, consistency, and trade-offs. Ask about scale numbers when they are missing.",
      );
    return lines.join("\n");
  }, [contextTitle, contextBody, mode, language]);

  const resetInputHeight = () => {
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const send = async (
    text: string,
    history: ChatEntry[] = messages,
    display?: string,
  ) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setError(null);
    const next: ChatEntry[] = [
      ...history,
      { role: "user", content: trimmed, display },
    ];
    setMessages(next);
    setInput("");
    resetInputHeight();
    setIsLoading(true);
    try {
      if (!(await isAiAvailable())) throw new Error(AI_SETUP_HINT);
      const reply = await chatWithAI({
        messages: [
          { role: "system", content: systemPrompt },
          ...next.slice(-16).map(({ role, content }) => ({ role, content })),
        ],
      });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed");
      setMessages(history);
      setInput(trimmed);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const runAction = (action: QuickAction) =>
    void send(
      PROMPTS[action.label] ?? action.label,
      messages,
      `${action.icon} ${action.label}`,
    );

  const askHint = () => {
    const level = Math.min(hintLevel, DSA_HINT_LADDER.length - 1);
    setHintLevel(level + 1);
    void send(
      `Hint ${level + 1} of ${DSA_HINT_LADDER.length}: give me ${DSA_HINT_LADDER[level]}.`,
      messages,
      `💡 Hint ${level + 1} of ${DSA_HINT_LADDER.length}`,
    );
  };

  const regenerate = () => {
    // Re-ask the last user message, dropping the last assistant reply.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.lastIndexOf(lastUser);
    void send(lastUser.content, messages.slice(0, idx), lastUser.display);
  };

  const copyReply = (idx: number, content: string) => {
    navigator.clipboard?.writeText(content).then(() => {
      setCopiedIdx(idx);
      window.setTimeout(
        () => setCopiedIdx((v) => (v === idx ? null : v)),
        1500,
      );
    });
  };

  const clear = () => {
    setMessages([]);
    setHintLevel(0);
    setError(null);
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  const actions = QUICK_ACTIONS[mode];
  const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf("assistant");
  const canSend = input.trim().length > 0 && !isLoading;

  if (!mounted) return null;

  // Rendered into <body> so page-level stacking contexts (animations, z-index wrappers) cannot trap the drawer under the mobile nav.
  return createPortal(
    <div
      className={`tutor-drawer ${desktop && panel.style ? "is-floating" : ""} ${panel.active ? `is-${panel.active}` : ""} ${panel.expanded ? "is-expanded" : ""}`}
      style={panel.style}
      role="dialog"
      aria-label="AI Tutor"
    >
      {desktop && panel.style && (
        <>
          {(["l", "r", "t", "b", "tl", "tr", "bl", "br"] as ResizeDir[]).map(
            (dir) => (
              <div
                key={dir}
                className={`tutor-handle tutor-handle-${dir}`}
                aria-hidden="true"
                {...panel.handleProps(dir)}
              />
            ),
          )}
        </>
      )}
      <div className="tutor flex flex-col h-full bg-[hsl(var(--card))]">
        {/* Header */}
        <div
          className="tutor-header px-4 py-3 flex items-center gap-3"
          title={desktop ? "Drag to move · double-click to reset" : undefined}
          {...(desktop ? panel.headerProps : {})}
        >
          <Avatar />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">AI Tutor</p>
            <p
              className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0"
              title={contextTitle}
            >
              <span className="truncate">
                {MODE_LABEL[mode]} · {language}
              </span>
              <span
                className={`tutor-status ${available === false ? "is-off" : available ? "is-on" : ""}`}
              >
                {available === null
                  ? "Checking"
                  : available
                    ? "Ready"
                    : "Needs key"}
              </span>
            </p>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="btn btn-ghost btn-sm"
            >
              New chat
            </button>
          )}
          {desktop && panel.style && (
            <button
              type="button"
              onClick={panel.toggleExpanded}
              className="btn btn-ghost btn-sm !px-2.5"
              aria-label={panel.expanded ? "Shrink panel" : "Expand panel"}
              title={panel.expanded ? "Shrink" : "Expand"}
            >
              {panel.expanded ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm !px-2.5"
              aria-label="Close tutor"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Conversation */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"
          ref={scrollRef}
        >
          {available === false && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-foreground">
              {AI_SETUP_HINT}
            </div>
          )}

          {messages.length === 0 && (
            <div className="min-h-full flex flex-col justify-center gap-5">
              <div className="text-center px-2">
                <div className="tutor-hero-ring mx-auto mb-3">
                  <Avatar />
                </div>
                <h3 className="text-lg font-bold leading-snug">
                  Ask me anything about{" "}
                  <span className="text-gradient">{contextTitle}</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  I remember your notes on this topic and write code in{" "}
                  {language}.
                </p>
              </div>

              <div className="tutor-starters">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => runAction(action)}
                    disabled={isLoading}
                    className="tutor-starter"
                    data-tone={action.tone}
                  >
                    <span className="tutor-starter-icon" aria-hidden="true">
                      {action.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">
                        {action.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                        {action.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {mode === "dsa" && (
                <button
                  type="button"
                  onClick={askHint}
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  I'm stuck · give me hint 1 of {DSA_HINT_LADDER.length}
                </button>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                Chat stays in this browser tab ·{" "}
                <kbd className="tutor-kbd">Enter</kbd> sends ·{" "}
                <kbd className="tutor-kbd">Shift</kbd>+
                <kbd className="tutor-kbd">Enter</kbd> new line
              </p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, idx) =>
              msg.role === "user" ? (
                <div key={idx} className="flex justify-end">
                  <div
                    className={`tutor-user max-w-[88%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.display ? "tutor-user-chip" : ""}`}
                    title={msg.display ? msg.content : undefined}
                  >
                    {msg.display ?? msg.content}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-start gap-2">
                  <div className="pt-1 shrink-0">
                    <Avatar size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="tutor-bubble rounded-2xl rounded-tl-md border border-border bg-muted/30 px-4 py-3 text-sm prose-tiptap"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownRich(msg.content),
                      }}
                    />
                    <div className="flex items-center gap-1 mt-1 pl-1">
                      <button
                        type="button"
                        onClick={() => copyReply(idx, msg.content)}
                        className="tutor-tool"
                      >
                        {copiedIdx === idx ? "Copied" : "Copy"}
                      </button>
                      {idx === lastAssistantIdx && !isLoading && (
                        <button
                          type="button"
                          onClick={regenerate}
                          className="tutor-tool"
                        >
                          Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="pt-1 shrink-0">
                  <Avatar size="sm" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-md border border-border bg-muted/30 px-4 py-3 flex items-center gap-1.5"
                  aria-live="polite"
                  aria-label="Tutor is typing"
                >
                  <span className="tutor-dot"></span>
                  <span className="tutor-dot animation-delay-200"></span>
                  <span className="tutor-dot animation-delay-400"></span>
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="tutor-footer p-3 space-y-2">
          {messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
              {mode === "dsa" && hintLevel < DSA_HINT_LADDER.length && (
                <button
                  type="button"
                  onClick={askHint}
                  disabled={isLoading}
                  className="tutor-chip tutor-chip-primary"
                >
                  Next hint {hintLevel + 1}/{DSA_HINT_LADDER.length}
                </button>
              )}
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => runAction(action)}
                  disabled={isLoading}
                  className="tutor-chip"
                >
                  <span aria-hidden="true">{action.icon}</span> {action.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className={`tutor-composer ${isLoading ? "is-busy" : ""}`}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(160, e.target.scrollHeight)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={
                isLoading ? "Thinking…" : `Ask about ${contextTitle}…`
              }
              aria-label="Message the tutor"
              className="tutor-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="tutor-send"
              aria-label="Send"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  d="M12 19V5M5 12l7-7 7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
