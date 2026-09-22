import { useEffect, useRef, useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)
import { type Attachment, type JobApplication } from '../types'
import { saveAttachmentFile, getAttachmentFile, deleteAttachmentFile } from '../db'
import { AI_SETUP_HINT, isAiAvailable } from '../lib/aiGatewayClient'
import { generatePrepContent, PREP_AI_ACTIONS, type PrepAiAction } from '../lib/groqPrep'
import { sanitizeEditorHtml } from '../lib/markdown'

export interface RichTextEditorProps {
  initialTitle: string
  initialContent: string
  attachments: Attachment[]
  onUpdate: (title: string, content: string, attachments: Attachment[]) => void
  onDelete?: () => void
  onToast?: (message: string) => void
  placeholder?: string
  showAiActions?: boolean
  applications?: JobApplication[]
  hideTitle?: boolean
}

export default function RichTextEditor({
  initialTitle,
  initialContent,
  attachments,
  onUpdate,
  onDelete,
  onToast,
  placeholder = 'Write notes...',
  showAiActions = false,
  applications = [],
  hideTitle = false,
}: RichTextEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [appId, setAppId] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Use refs to avoid dependency cycles in onUpdate
  const titleRef = useRef(title)
  const contentRef = useRef(initialContent)
  const attachmentsRef = useRef(attachments)

  useEffect(() => {
    titleRef.current = title
  }, [title])

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const updateTimer = useRef<number | null>(null)
  const scheduleUpdate = () => {
    if (updateTimer.current) window.clearTimeout(updateTimer.current)
    updateTimer.current = window.setTimeout(() => {
      updateTimer.current = null
      onUpdateRef.current(titleRef.current, contentRef.current, attachmentsRef.current)
    }, 350)
  }

  const rankedApps = useMemo(() => {
    const priority = new Set(['Interview', 'HR Round', 'Assessment', 'Under Review', 'Applied'])
    return [...applications].sort((a, b) => {
      const ap = priority.has(a.status) ? 0 : 1
      const bp = priority.has(b.status) ? 0 : 1
      if (ap !== bp) return ap - bp
      return a.company.localeCompare(b.company)
    })
  }, [applications])

  const selectedApp = rankedApps.find((a) => a.id === appId) || null

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: { openOnClick: false },
      }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: sanitizeEditorHtml(initialContent),
    editorProps: {
      attributes: {
        class: 'tiptap prep-kit-tiptap prose-tiptap focus:outline-none min-h-[300px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      contentRef.current = html
      scheduleUpdate()
    },
  })

  // Flush any pending debounced edit when the editor unmounts (switching notes) or the page is leaving.
  useEffect(() => {
    const flush = () => {
      if (updateTimer.current) {
        window.clearTimeout(updateTimer.current)
        updateTimer.current = null
        onUpdateRef.current(titleRef.current, contentRef.current, attachmentsRef.current)
      }
    }
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [])


  const runAi = async (action: PrepAiAction) => {
    setAiError(null)
    if (!editor) return
    if (!(await isAiAvailable())) {
      setAiError(AI_SETUP_HINT)
      return
    }

    setAiBusy(true)
    try {
      const result = await generatePrepContent({
        action,
        application: selectedApp,
        noteTitle: title,
        noteHtml: editor.getHTML(),
      })

      if (action === 'improve-note') {
        editor.commands.setContent(sanitizeEditorHtml(result.html))
      } else if (!editor.getText().trim()) {
        editor.commands.setContent(sanitizeEditorHtml(result.html))
      } else {
        editor.commands.setContent(sanitizeEditorHtml(`${editor.getHTML()}<hr/>${result.html}`))
      }
      contentRef.current = editor.getHTML()

      const nextTitle = !title.trim() || title === 'Untitled Note' ? result.titleSuggestion : title
      if (nextTitle !== title) {
        setTitle(nextTitle)
        titleRef.current = nextTitle
      }

      onUpdate(nextTitle, editor.getHTML(), attachmentsRef.current)

      onToast?.('Content generated with AI')
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI generation failed'
      setAiError(message)
    } finally {
      setAiBusy(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newAttachment: Attachment = {
      id: uuidv4(),
      filename: file.name,
      size: file.size,
      type: file.type,
    }

    await saveAttachmentFile(newAttachment.id, file)
    
    const newAttachments = [...attachmentsRef.current, newAttachment]
    attachmentsRef.current = newAttachments
    onUpdate(titleRef.current, contentRef.current, newAttachments)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async (attachment: Attachment) => {
    const file = await getAttachmentFile(attachment.id)
    if (!file) {
      onToast?.('This file was attached on another device and is not available here.')
      return
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRemoveAttachment = async (id: string) => {
    if (!confirm('Remove this attachment?')) return
    await deleteAttachmentFile(id)
    
    const newAttachments = attachmentsRef.current.filter((a) => a.id !== id)
    attachmentsRef.current = newAttachments
    onUpdate(titleRef.current, contentRef.current, newAttachments)
  }

  return (
    <div className="prep-kit-editor">
      <div className="prep-kit-editor-top">
        {!hideTitle && (
          <div className="flex items-start gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                titleRef.current = e.target.value
                scheduleUpdate()
              }}
              className="font-display min-w-0 flex-1 border-none bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground sm:text-2xl"
              placeholder="Note title"
            />
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="btn btn-ghost btn-sm shrink-0 text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {showAiActions && (
          <>
            <label className="mt-3 block">
              <span className="label-quiet">Prep for application</span>
              <select
                className="input-field"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
              >
                <option value="">General prep (no specific role)</option>
                {rankedApps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role} ({app.status})
                  </option>
                ))}
              </select>
            </label>

            <div className="prep-kit-ai-actions mt-3">
              {PREP_AI_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  title={action.description}
                  disabled={aiBusy}
                  onClick={() => void runAi(action.id)}
                >
                  {aiBusy ? '…' : action.label}
                </button>
              ))}
            </div>
            {aiBusy ? (
              <p className="mt-2 text-sm text-muted-foreground">AI is writing your content…</p>
            ) : null}
            {aiError ? <p className="mt-2 text-sm font-medium text-destructive">{aiError}</p> : null}
          </>
        )}
      </div>

      <div ref={scrollRef} className="prep-kit-editor-scroll">
        <div className="prep-kit-editor-body">
          <EditorContent editor={editor} />
        </div>

        <div className="prep-kit-attachments">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attachments ({attachments.length})
            </h3>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-sm text-primary"
            >
              + Add file
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => void handleFileUpload(e)}
            />
          </div>

          <div className="flex flex-col gap-2">
            {attachments.map((att) => (
              <div key={att.id} className="prep-kit-attachment-row">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{att.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {(att.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void handleDownload(att)}
                    className="btn btn-ghost btn-sm"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemoveAttachment(att.id)}
                    className="rounded px-2 py-1 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${att.filename}`}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Attach resumes, diagrams, or PDFs — stored on this device.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
