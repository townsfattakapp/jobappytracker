/**
 * Makes single-line code readable. AI responses in JSON mode sometimes
 * collapse a whole program onto one line; when that happens we rebuild line
 * breaks and indentation for brace-based languages. Code that already has
 * line breaks is returned untouched.
 */

const BRACE_LANGUAGES = new Set(['java', 'javascript', 'typescript', 'js', 'ts', 'cpp', 'c++', 'c', 'go', 'csharp', 'c#', 'kotlin', 'rust', 'swift', 'php', 'scala'])

export function looksCollapsed(code: string): boolean {
  const trimmed = code.trim()
  if (!trimmed) return false
  const lines = trimmed.split('\n').filter((l) => l.trim())
  const longest = Math.max(...lines.map((l) => l.length))
  return longest > 110 && lines.length <= Math.max(2, Math.floor(trimmed.length / 160))
}

/** Reflows brace-language code that lost its newlines. */
export function reflowBraceCode(code: string): string {
  const out: string[] = []
  let line = ''
  let depth = 0
  let i = 0
  let inString: string | null = null
  let parenDepth = 0
  const push = () => {
    const t = line.trim()
    if (t) out.push('    '.repeat(Math.max(0, depth)) + t)
    line = ''
  }
  while (i < code.length) {
    const ch = code[i]
    const next = code[i + 1]
    if (inString) {
      line += ch
      if (ch === '\\' && next !== undefined) {
        line += next
        i += 2
        continue
      }
      if (ch === inString) inString = null
      i += 1
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      line += ch
      i += 1
      continue
    }
    if (ch === '/' && next === '/') {
      // line comment: consume to end of line (or end)
      const end = code.indexOf('\n', i)
      const stop = end === -1 ? code.length : end
      line += code.slice(i, stop)
      push()
      i = stop + 1
      continue
    }
    if (ch === '(') parenDepth += 1
    if (ch === ')') parenDepth = Math.max(0, parenDepth - 1)
    if (ch === '{') {
      line += ' {'
      push()
      depth += 1
      i += 1
      continue
    }
    if (ch === '}') {
      push()
      depth = Math.max(0, depth - 1)
      line = '}'
      // keep "} else {" / "} catch" on one line
      const rest = code.slice(i + 1).match(/^\s*(else|catch|finally|while)\b/)
      if (rest) {
        line += ' '
        i += 1 + rest[0].length - rest[1].length
        continue
      }
      push()
      i += 1
      continue
    }
    if (ch === ';' && parenDepth === 0) {
      line += ';'
      push()
      i += 1
      continue
    }
    if (ch === '\n') {
      push()
      i += 1
      continue
    }
    line += ch
    i += 1
  }
  push()
  return out.join('\n').replace(/[ \t]+$/gm, '').replace(/\s+;/g, ';').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
}

/** Returns code with newlines restored when it was collapsed to a single line. */
export function ensureReadableCode(code: string, language?: string): string {
  if (!code || !looksCollapsed(code)) return code
  const lang = (language || '').toLowerCase()
  if (BRACE_LANGUAGES.has(lang)) return reflowBraceCode(code.replace(/\r/g, ''))
  if (lang === 'python' || lang === 'py') {
    // Best effort: split on statement separators the model may have used.
    return code.replace(/;\s*/g, '\n').replace(/:\s+(?=\S)/g, ':\n    ')
  }
  return code
}
