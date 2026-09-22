/**
 * Client-side entry point for running code from the editor.
 *
 * JavaScript executes locally in a Web Worker (instant, offline, no quota).
 * Every other language is sent to /api/run, which talks to a sandbox.
 */

export type RunnerLanguage =
  "javascript" | "typescript" | "java" | "python" | "cpp" | "go";

export const RUNNER_LANGUAGES: { id: RunnerLanguage; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
];

export interface RunResult {
  stdout: string;
  stderr: string;
  compileError: string;
  exitCode: number;
  engine: string;
  timeMs: number;
}

export function normalizeRunnerLanguage(
  value: string | undefined,
): RunnerLanguage {
  const v = (value || "").toLowerCase().trim();
  if (v === "c++" || v === "cpp" || v === "c") return "cpp";
  if (v === "js" || v === "node") return "javascript";
  if (v === "ts") return "typescript";
  if (v === "py") return "python";
  if (v === "golang") return "go";
  return (
    RUNNER_LANGUAGES.some((l) => l.id === v) ? v : "javascript"
  ) as RunnerLanguage;
}

/** Starter programs so a learner never stares at an empty editor. */
export const STARTER_CODE: Record<RunnerLanguage, string> = {
  java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        // Read input with in.nextLine() / in.nextInt()
        System.out.println("Hello from Java");
    }
}
`,
  javascript: `// console.log() output appears in the panel below.
// readline() returns the next line of the Input box.
const nums = [2, 7, 11, 15];
console.log("Hello from JavaScript", nums);
`,
  typescript: `const greet = (name: string): string => \`Hello from \${name}\`;
console.log(greet("TypeScript"));
`,
  python: `import sys

def main():
    # Read input with input() or sys.stdin
    print("Hello from Python")

main()
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout << "Hello from C++" << endl;
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from Go")
}
`,
};

const JS_TIMEOUT_MS = 5000;

const WORKER_SOURCE = `
const inspect = (v) => {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return v.toString();
  if (typeof v === 'bigint') return v + 'n';
  if (v instanceof Error) return v.stack || String(v);
  if (v instanceof Map) return 'Map(' + v.size + ') ' + JSON.stringify([...v]);
  if (v instanceof Set) return 'Set(' + v.size + ') ' + JSON.stringify([...v]);
  try { const s = JSON.stringify(v, null, 1); return s === undefined ? String(v) : s.replace(/\\n\\s*/g, ' '); } catch { return String(v); }
};
self.onmessage = async (e) => {
  const { code, stdin } = e.data;
  const out = [], err = [];
  const lines = String(stdin || '').split(/\\r?\\n/);
  let li = 0;
  const fmt = (args) => args.map(inspect).join(' ');
  self.readline = () => (li < lines.length ? lines[li++] : '');
  self.input = self.readline;
  self.STDIN = String(stdin || '');
  self.console = {
    log: (...a) => out.push(fmt(a)),
    info: (...a) => out.push(fmt(a)),
    debug: (...a) => out.push(fmt(a)),
    table: (...a) => out.push(fmt(a)),
    dir: (...a) => out.push(fmt(a)),
    warn: (...a) => err.push('[warn] ' + fmt(a)),
    error: (...a) => err.push(fmt(a)),
    assert: (c, ...a) => { if (!c) err.push('Assertion failed' + (a.length ? ': ' + fmt(a) : '')); },
  };
  let exitCode = 0;
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    await new AsyncFunction(code)();
    await new Promise((r) => setTimeout(r, 30));
  } catch (ex) {
    err.push(inspect(ex));
    exitCode = 1;
  }
  self.postMessage({ stdout: out.join('\\n'), stderr: err.join('\\n'), exitCode });
};
`;

function runJavaScriptLocally(code: string, stdin: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const started = performance.now();
    let worker: Worker;
    try {
      const url = URL.createObjectURL(
        new Blob([WORKER_SOURCE], { type: "text/javascript" }),
      );
      worker = new Worker(url);
      URL.revokeObjectURL(url);
    } catch {
      resolve({
        stdout: "",
        stderr: "Your browser blocked the local JavaScript sandbox.",
        compileError: "",
        exitCode: 1,
        engine: "browser",
        timeMs: 0,
      });
      return;
    }
    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve({
        stdout: "",
        stderr: `Timed out after ${JS_TIMEOUT_MS / 1000}s. Is there an infinite loop?`,
        compileError: "",
        exitCode: 124,
        engine: "browser",
        timeMs: Math.round(performance.now() - started),
      });
    }, JS_TIMEOUT_MS);
    worker.onmessage = (
      e: MessageEvent<{ stdout: string; stderr: string; exitCode: number }>,
    ) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve({
        ...e.data,
        compileError: "",
        engine: "browser",
        timeMs: Math.round(performance.now() - started),
      });
    };
    worker.onerror = (e) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve({
        stdout: "",
        stderr: e.message || "Script error",
        compileError: "",
        exitCode: 1,
        engine: "browser",
        timeMs: Math.round(performance.now() - started),
      });
    };
    worker.postMessage({ code, stdin });
  });
}

export async function runCode(
  language: RunnerLanguage,
  code: string,
  stdin = "",
): Promise<RunResult> {
  if (language === "javascript") return runJavaScriptLocally(code, stdin);
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code, stdin }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<RunResult> & {
    error?: string;
  };
  if (!res.ok || data.error)
    throw new Error(data.error || `Code runner failed (${res.status})`);
  return {
    stdout: data.stdout ?? "",
    stderr: data.stderr ?? "",
    compileError: data.compileError ?? "",
    exitCode: data.exitCode ?? 0,
    engine: data.engine ?? "server",
    timeMs: data.timeMs ?? 0,
  };
}
