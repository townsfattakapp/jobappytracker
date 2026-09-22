import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useIsDark } from "../../lib/useTheme";
import {
  normalizeRunnerLanguage,
  runCode,
  RUNNER_LANGUAGES,
  STARTER_CODE,
  type RunnerLanguage,
  type RunResult,
} from "../../lib/codeRunner";

interface AlgoEditorProps {
  initialLanguage?: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  readOnly?: boolean;
  /** Total component height (CSS length). */
  height?: string;
}

type Status = "idle" | "running" | "ok" | "error";

export default function AlgoEditor({
  initialLanguage = "javascript",
  initialCode = "",
  onCodeChange,
  onLanguageChange,
  readOnly = false,
  height = "600px",
}: AlgoEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<RunnerLanguage>(() =>
    normalizeRunnerLanguage(initialLanguage),
  );
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const isDark = useIsDark();
  const runRef = useRef<() => void>(() => {});
  const outputRef = useRef<HTMLDivElement>(null);

  // Follow the language chosen in the surrounding form (e.g. the DSA attempt logger).
  useEffect(() => {
    setLanguage(normalizeRunnerLanguage(initialLanguage));
  }, [initialLanguage]);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const updateCode = (value: string) => {
    setCode(value);
    onCodeChange?.(value);
  };

  const changeLanguage = (next: RunnerLanguage) => {
    setLanguage(next);
    onLanguageChange?.(next);
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  const insertTemplate = () => {
    if (
      code.trim() &&
      !window.confirm("Replace the current code with the starter template?")
    )
      return;
    updateCode(STARTER_CODE[language]);
  };

  const run = async () => {
    if (status === "running") return;
    if (!code.trim()) {
      setError(
        "Nothing to run yet. Write some code or insert the starter template.",
      );
      setStatus("error");
      setConsoleOpen(true);
      return;
    }
    setStatus("running");
    setError(null);
    setConsoleOpen(true);
    try {
      const res = await runCode(language, code, stdin);
      setResult(res);
      setStatus(res.exitCode === 0 && !res.compileError ? "ok" : "error");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Code runner failed");
      setStatus("error");
    }
  };
  runRef.current = () => void run();

  const onMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      runRef.current(),
    );
  };

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = 0;
  }, [result, error]);

  const isEmpty = !code.trim();
  const hasOutput = Boolean(
    result?.stdout || result?.stderr || result?.compileError,
  );

  return (
    <div className="runner" style={{ height }} data-status={status}>
      {/* Toolbar */}
      <div className="runner-toolbar">
        <label className="runner-lang">
          <span className="sr-only">Language</span>
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as RunnerLanguage)}
            disabled={readOnly}
            aria-label="Code language"
          >
            {RUNNER_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <span
          className="runner-engine"
          title={
            language === "javascript"
              ? "JavaScript runs inside your browser"
              : "Runs on a remote sandbox"
          }
        >
          {language === "javascript" ? "Runs in browser" : "Runs in sandbox"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={insertTemplate}
                className="runner-tool"
                title="Insert a starter program"
              >
                {isEmpty ? "Start from template" : "Template"}
              </button>
              <button
                type="button"
                onClick={() => setShowStdin((v) => !v)}
                className={`runner-tool ${showStdin || stdin ? "is-active" : ""}`}
                aria-pressed={showStdin}
              >
                Input{stdin ? " •" : ""}
              </button>
              <button
                type="button"
                onClick={() => void run()}
                disabled={status === "running"}
                className="runner-run"
                title="Run (Ctrl+Enter)"
              >
                {status === "running" ? (
                  <>
                    <span className="runner-spinner" aria-hidden="true" />{" "}
                    Running
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                      aria-hidden="true"
                    >
                      <path d="M7 5v14l12-7z" />
                    </svg>
                    Run
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="runner-editor">
        <Editor
          height="100%"
          language={language}
          theme={isDark ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => updateCode(value ?? "")}
          onMount={onMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily:
              "var(--font-mono), JetBrains Mono, ui-monospace, monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            readOnly,
            padding: { top: 14, bottom: 14 },
            lineNumbersMinChars: 3,
            renderLineHighlight: "gutter",
            smoothScrolling: true,
            tabSize: language === "python" || language === "go" ? 4 : 2,
            automaticLayout: true,
          }}
        />
        {isEmpty && !readOnly && (
          <div className="runner-placeholder" aria-hidden="true">
            Write your {RUNNER_LANGUAGES.find((l) => l.id === language)?.label}{" "}
            solution here, or{" "}
            <button
              type="button"
              onClick={insertTemplate}
              className="underline decoration-dotted underline-offset-2 pointer-events-auto"
            >
              start from a template
            </button>
            .
          </div>
        )}
      </div>

      {/* Stdin */}
      {showStdin && !readOnly && (
        <div className="runner-stdin">
          <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Program input (stdin)</span>
            {stdin && (
              <button
                type="button"
                onClick={() => setStdin("")}
                className="runner-tool"
              >
                Clear
              </button>
            )}
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={3}
            placeholder={
              language === "javascript"
                ? "One value per line. Read it with readline() in your code."
                : "One value per line, exactly as you would type it into the terminal."
            }
            spellCheck={false}
          />
        </div>
      )}

      {/* Console */}
      {!readOnly && (
        <div className={`runner-console ${consoleOpen ? "is-open" : ""}`}>
          <button
            type="button"
            className="runner-console-head"
            onClick={() => setConsoleOpen((v) => !v)}
            aria-expanded={consoleOpen}
          >
            <span className="flex items-center gap-2">
              <span
                className={`runner-chevron ${consoleOpen ? "is-open" : ""}`}
                aria-hidden="true"
              >
                ▸
              </span>
              Output
              {status === "ok" && result && (
                <span className="runner-badge is-ok">
                  ✓ Exit 0 · {result.timeMs} ms
                </span>
              )}
              {status === "error" && result && (
                <span className="runner-badge is-err">
                  ✕ Exit {result.exitCode}
                </span>
              )}
              {status === "error" && !result && (
                <span className="runner-badge is-err">✕ Failed</span>
              )}
              {status === "running" && (
                <span className="runner-badge">Running…</span>
              )}
            </span>
            <span className="flex items-center gap-2 text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
              {result?.engine && (
                <span className="hidden sm:inline">{result.engine}</span>
              )}
              {(hasOutput || error) && (
                <span
                  role="button"
                  tabIndex={0}
                  className="runner-tool"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResult(null);
                    setError(null);
                    setStatus("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setResult(null);
                      setError(null);
                      setStatus("idle");
                    }
                  }}
                >
                  Clear
                </span>
              )}
            </span>
          </button>
          {consoleOpen && (
            <div className="runner-output" ref={outputRef} aria-live="polite">
              {status === "running" && (
                <p className="runner-muted">Compiling and running your code…</p>
              )}
              {status !== "running" && error && (
                <pre className="runner-line is-err">{error}</pre>
              )}
              {status !== "running" && result && (
                <>
                  {result.compileError && (
                    <>
                      <p className="runner-label is-err">Compile error</p>
                      <pre className="runner-line is-err">
                        {result.compileError}
                      </pre>
                    </>
                  )}
                  {result.stdout && (
                    <pre className="runner-line">{result.stdout}</pre>
                  )}
                  {result.stderr && (
                    <>
                      {result.stdout && (
                        <p className="runner-label is-err">stderr</p>
                      )}
                      <pre className="runner-line is-err">{result.stderr}</pre>
                    </>
                  )}
                  {!hasOutput && (
                    <p className="runner-muted">
                      Program finished with no output. Print something to see it
                      here.
                    </p>
                  )}
                </>
              )}
              {status === "idle" && !result && !error && (
                <p className="runner-muted">
                  Press <kbd>Run</kbd> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to
                  see your program&apos;s output here.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
