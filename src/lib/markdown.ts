import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  'c++': 'cpp',
  golang: 'go',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Syntax-highlighted HTML for a code string; falls back to auto-detection, then plain text. */
export function highlightCode(code: string, language?: string): { html: string; language: string } {
  const lang = LANGUAGE_ALIASES[(language || '').toLowerCase()] || (language || '').toLowerCase()
  try {
    if (lang && hljs.getLanguage(lang)) {
      return { html: hljs.highlight(code, { language: lang, ignoreIllegals: true }).value, language: lang }
    }
    const auto = hljs.highlightAuto(code)
    return { html: auto.value, language: auto.language || 'text' }
  } catch {
    return { html: escapeHtml(code), language: lang || 'text' }
  }
}

function makeRenderer(codeCards: boolean): InstanceType<typeof MarkdownIt> {
  const md = new MarkdownIt({ html: false, linkify: true, breaks: false })
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const info = token.info.trim().split(/\s+/)[0]
    const { html, language } = highlightCode(token.content, info)
    const pre = `<pre><code class="hljs language-${escapeHtml(language)}">${html}</code></pre>`
    if (!codeCards) return pre
    return `<div class="code-card"><div class="code-card-head"><span>${escapeHtml(language)}</span><button type="button" class="copy-code" data-copy>Copy</button></div>${pre}</div>`
  }
  return md
}

const plain = makeRenderer(false)
const cards = makeRenderer(true)

/** Markdown → HTML for content that goes into the note editor (no interactive chrome). */
export function renderMarkdown(markdown: string): string {
  return plain.render(markdown.trim())
}

/**
 * Adds data-label="<column header>" to every table cell and wraps the table so
 * narrow containers (chat bubbles) can stack each row as a card, while wide
 * containers keep a normal table with horizontal scrolling.
 */
function labelTables(html: string): string {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (_m, inner: string) => {
    const headers = Array.from(inner.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)).map((h) => h[1].replace(/<[^>]+>/g, '').trim())
    let col = 0
    const body = inner.replace(/<tr>|<td([^>]*)>/g, (tag: string, attrs?: string) => {
      if (tag === '<tr>') {
        col = 0
        return tag
      }
      const label = headers[col] ?? ''
      col += 1
      return `<td${attrs ?? ''} data-label="${label.replace(/"/g, '&quot;')}">`
    })
    return `<div class="md-table"><table>${body}</table></div>`
  })
}

/** Markdown → HTML for read-only chat bubbles, with a language label and Copy button on each code block. */
export function renderMarkdownRich(markdown: string): string {
  return labelTables(cards.render(markdown.trim()))
}
