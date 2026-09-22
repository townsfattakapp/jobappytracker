import { NextResponse } from "next/server";
import { requireAccess } from "../../../lib/server/entitlement";

export const maxDuration = 60;

/**
 * Runs a code snippet on a remote sandbox.
 *
 * Providers, in order:
 *  1. A self-hosted Piston instance when CODE_RUNNER_URL is set
 *     (e.g. https://piston.example.com/api/v2). The public Piston API went
 *     whitelist-only in February 2026, so it is no longer used by default.
 *  2. Wandbox (https://wandbox.org), a free public compiler service.
 *
 * JavaScript normally runs in the browser (see src/lib/codeRunner.ts); this
 * route still accepts it for completeness.
 */

type Language = "javascript" | "typescript" | "java" | "python" | "cpp" | "go";

const LANGUAGES: Language[] = [
  "javascript",
  "typescript",
  "java",
  "python",
  "cpp",
  "go",
];
const MAX_CODE = 64_000;
const MAX_STDIN = 16_000;
const MAX_OUTPUT = 20_000;

interface RunResult {
  stdout: string;
  stderr: string;
  compileError: string;
  exitCode: number;
  engine: string;
  timeMs: number;
}

// --- Wandbox ---------------------------------------------------------------

const WANDBOX = "https://wandbox.org/api";
const WANDBOX_LANG: Record<Language, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  python: "Python",
  cpp: "C++",
  go: "Go",
};
const WANDBOX_PREFERRED: Record<Language, string> = {
  javascript: "nodejs-20.17.0",
  typescript: "typescript-5.6.2",
  java: "openjdk-jdk-22+36",
  python: "cpython-3.13.8",
  cpp: "gcc-13.2.0",
  go: "go-1.23.2",
};
const WANDBOX_OPTIONS: Partial<Record<Language, string>> = {
  cpp: "warning,gnu++2b",
};

let compilerCache: { at: number; byLanguage: Record<string, string> } | null =
  null;

async function wandboxCompilers(): Promise<Record<string, string>> {
  if (compilerCache && Date.now() - compilerCache.at < 6 * 60 * 60 * 1000)
    return compilerCache.byLanguage;
  const res = await fetch(`${WANDBOX}/list.json`, {
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Could not load the compiler list");
  const list = (await res.json()) as Array<{ name: string; language: string }>;
  const byLanguage: Record<string, string> = {};
  for (const c of list) {
    // list.json is ordered newest first per language; keep the first non-"head" build.
    if (!byLanguage[c.language] && !/head/i.test(c.name))
      byLanguage[c.language] = c.name;
  }
  compilerCache = { at: Date.now(), byLanguage };
  return byLanguage;
}

/** Wandbox always compiles `prog.java`, so a public top-level class must lose its modifier. */
function prepareJava(code: string) {
  return code.replace(/^(\s*)public\s+(final\s+)?class\s+/m, "$1$2class ");
}

async function runWandbox(
  language: Language,
  code: string,
  stdin: string,
): Promise<RunResult> {
  const source = language === "java" ? prepareJava(code) : code;
  const attempt = async (compiler: string) => {
    const res = await fetch(`${WANDBOX}/compile.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler,
        code: source,
        stdin,
        options: WANDBOX_OPTIONS[language] ?? "",
      }),
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok)
      throw new Error(
        text.includes("Unknown compiler")
          ? "Unknown compiler"
          : `Sandbox returned ${res.status}`,
      );
    return JSON.parse(text) as {
      status?: string;
      signal?: string;
      compiler_error?: string;
      program_output?: string;
      program_error?: string;
    };
  };

  let compiler = WANDBOX_PREFERRED[language];
  let data;
  try {
    data = await attempt(compiler);
  } catch (err) {
    if (!(err instanceof Error && err.message === "Unknown compiler"))
      throw err;
    const latest = (await wandboxCompilers())[WANDBOX_LANG[language]];
    if (!latest)
      throw new Error(
        `No ${WANDBOX_LANG[language]} compiler is available right now`,
        { cause: err },
      );
    compiler = latest;
    data = await attempt(compiler);
  }

  const exitCode = data.signal
    ? 137
    : Number.parseInt(data.status ?? "0", 10) || 0;
  return {
    stdout: (data.program_output ?? "").slice(0, MAX_OUTPUT),
    stderr: [
      (data.program_error ?? "").slice(0, MAX_OUTPUT),
      data.signal ? `Process killed by ${data.signal}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    compileError: (data.compiler_error ?? "").slice(0, MAX_OUTPUT),
    exitCode,
    engine: `wandbox · ${compiler}`,
    timeMs: 0,
  };
}

// --- Self-hosted Piston ----------------------------------------------------

const PISTON_FILE: Record<Language, string> = {
  javascript: "main.js",
  typescript: "main.ts",
  java: "Main.java",
  python: "main.py",
  cpp: "main.cpp",
  go: "main.go",
};
const PISTON_LANG: Record<Language, string> = {
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  python: "python",
  cpp: "c++",
  go: "go",
};

async function runPiston(
  base: string,
  language: Language,
  code: string,
  stdin: string,
): Promise<RunResult> {
  const res = await fetch(`${base.replace(/\/$/, "")}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: PISTON_LANG[language],
      version: "*",
      files: [{ name: PISTON_FILE[language], content: code }],
      stdin,
      run_timeout: 10_000,
      compile_timeout: 20_000,
    }),
    signal: AbortSignal.timeout(45_000),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    message?: string;
    compile?: { stdout?: string; stderr?: string; code?: number | null };
    run?: {
      stdout?: string;
      stderr?: string;
      code?: number | null;
      signal?: string | null;
    };
  };
  if (!res.ok || data.message)
    throw new Error(data.message || `Sandbox returned ${res.status}`);
  const compileError =
    data.compile && data.compile.code
      ? `${data.compile.stdout ?? ""}${data.compile.stderr ?? ""}`
      : "";
  return {
    stdout: (data.run?.stdout ?? "").slice(0, MAX_OUTPUT),
    stderr: [
      (data.run?.stderr ?? "").slice(0, MAX_OUTPUT),
      data.run?.signal ? `Process killed by ${data.run.signal}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    compileError: compileError.slice(0, MAX_OUTPUT),
    exitCode: data.run?.code ?? (compileError ? 1 : 0),
    engine: "piston (self-hosted)",
    timeMs: 0,
  };
}

// --- Route -----------------------------------------------------------------

export async function POST(req: Request) {
  // The sandbox is a paid feature: signed-in accounts on a trial or subscription.
  const gate = await requireAccess();
  if (gate instanceof NextResponse) return gate;
  let body: { language?: unknown; code?: unknown; stdin?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const language =
    typeof body.language === "string"
      ? (body.language.toLowerCase() as Language)
      : null;
  if (!language || !LANGUAGES.includes(language)) {
    return NextResponse.json(
      { error: `Unsupported language. Use one of: ${LANGUAGES.join(", ")}` },
      { status: 400 },
    );
  }
  const code = typeof body.code === "string" ? body.code : "";
  const stdin = typeof body.stdin === "string" ? body.stdin : "";
  if (!code.trim())
    return NextResponse.json(
      { error: "Nothing to run: the editor is empty" },
      { status: 400 },
    );
  if (code.length > MAX_CODE)
    return NextResponse.json(
      { error: `Code is too long (max ${MAX_CODE / 1000}k characters)` },
      { status: 413 },
    );
  if (stdin.length > MAX_STDIN)
    return NextResponse.json({ error: "Input is too long" }, { status: 413 });

  const started = Date.now();
  try {
    const piston = process.env.CODE_RUNNER_URL?.trim();
    const result = piston
      ? await runPiston(piston, language, code, stdin)
      : await runWandbox(language, code, stdin);
    return NextResponse.json({ ...result, timeMs: Date.now() - started });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Code runner failed";
    const timedOut = /abort|timeout/i.test(message);
    return NextResponse.json(
      {
        error: timedOut
          ? "The sandbox took too long to respond. Try again in a moment."
          : `Code runner unavailable: ${message}`,
      },
      { status: 502 },
    );
  }
}
