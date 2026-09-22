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
    if (!codeCards) {
      // Editor content: plain escaped code. The note editor highlights code blocks itself, and
      // pre-highlighted <span>s make it drop the newline between adjacent spans.
      const language = LANGUAGE_ALIASES[info.toLowerCase()] || info.toLowerCase() || 'plaintext'
      return `<pre><code class="language-${escapeHtml(language)}">${escapeHtml(token.content)}</code></pre>`
    }
    const { html, language } = highlightCode(token.content, info)
    const pre = `<pre><code class="hljs language-${escapeHtml(language)}">${html}</code></pre>`
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

/**
 * Strips syntax-highlighting <span>s out of code blocks in stored note HTML.
 * Older AI notes were saved with highlight.js markup; the editor's HTML parser
 * drops whitespace-only text between adjacent inline elements, which glued the
 * line after every comment onto the comment. Text content is kept verbatim.
 */
export function sanitizeEditorHtml(html: string): string {
  if (!html || !html.includes('<pre')) return html
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_m, attrs: string, inner: string) => `<pre><code${attrs}>${inner.replace(/<\/?span[^>]*>/g, '')}</code></pre>`)
  }
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  let changed = false
  doc.querySelectorAll('pre code').forEach((code) => {
    if (code.querySelector('span')) {
      code.textContent = code.textContent || ''
      changed = true
    }
  })
  return changed ? doc.body.innerHTML : html
}
