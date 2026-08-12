import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { type JobApplication, type PrepNote, type Attachment } from './types'
import { saveAttachmentFile, getAttachmentFile, deleteAttachmentFile } from './db'
import { hasGroqApiKey } from './lib/groq'
import { generatePrepContent, PREP_AI_ACTIONS, type PrepAiAction } from './lib/groqPrep'

interface PrepKitProps {
  prepNotes: PrepNote[]
  applications: JobApplication[]
  onSaveNote: (note: PrepNote) => void
  onDeleteNote: (id: string) => void
  onToast?: (message: string) => void
}

export default function PrepKit({
  prepNotes,
  applications,
  onSaveNote,
  onDeleteNote,
  onToast,
}: PrepKitProps) {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    prepNotes.length > 0 ? prepNotes[0].id : null,
  )

  const activeNote = prepNotes.find((n) => n.id === activeNoteId)

  const createNote = () => {
    const newNote: PrepNote = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSaveNote(newNote)
    setActiveNoteId(newNote.id)
  }

  return (
    <div className="flex h-[75vh] w-full flex-col overflow-hidden rounded-2xl surface animate-rise sm:flex-row">
      <div className="flex w-full flex-col border-b border-border bg-[hsl(var(--card))] sm:w-1/3 sm:border-b-0 sm:border-r">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Prep Notes</h2>
          <button type="button" onClick={createNote} className="btn btn-ghost btn-sm">
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {prepNotes.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Create a note, then generate interview prep with Groq AI.
            </p>
          ) : (
            prepNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full border-b border-border px-4 py-3 text-left transition-colors ${
                  activeNoteId === note.id ? 'bg-[hsl(var(--primary)/0.1)]' : 'hover:bg-muted'
                }`}
              >
                <p className="truncate font-semibold text-foreground">
                  {note.title || 'Untitled Note'}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()} · {note.attachments.length}{' '}
                  attachment(s)
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col bg-[hsl(var(--card))]">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            applications={applications}
            onUpdate={(updated) => onSaveNote(updated)}
            onDelete={() => {
              if (confirm('Delete this note?')) {
                onDeleteNote(activeNote.id)
                setActiveNoteId(null)
              }
            }}
            onToast={onToast}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select or create a note
          </div>
        )}
      </div>
    </div>
  )
}

function NoteEditor({
  note,
  applications,
  onUpdate,
  onDelete,
  onToast,
}: {
  note: PrepNote
  applications: JobApplication[]
  onUpdate: (n: PrepNote) => void
  onDelete: () => void
  onToast?: (message: string) => void
}) {
  const [title, setTitle] = useState(note.title)
  const [appId, setAppId] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef(note)
  noteRef.current = note

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
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write prep notes, or generate them with Groq AI…',
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      const current = noteRef.current
      onUpdate({ ...current, content: editor.getHTML(), updatedAt: new Date().toISOString() })
    },
  })

  useEffect(() => {
    const t = setTimeout(() => {
      const current = noteRef.current
      if (title !== current.title) {
        onUpdate({ ...current, title, updatedAt: new Date().toISOString() })
      }
    }, 500)
    return () => clearTimeout(t)
  }, [title, onUpdate])

  const runAi = async (action: PrepAiAction) => {
    setAiError(null)
    if (!hasGroqApiKey()) {
      setAiError('Groq key missing — add it in Paste email, or set VITE_GROQ_API_KEY')
      return
    }
    if (!editor) return

    setAiBusy(true)
    try {
      const result = await generatePrepContent({
        action,
        application: selectedApp,
        noteTitle: title,
        noteHtml: editor.getHTML(),
      })

      if (action === 'improve-note') {
        editor.commands.setContent(result.html)
      } else if (!editor.getText().trim()) {
        editor.commands.setContent(result.html)
      } else {
        editor.commands.setContent(`${editor.getHTML()}<hr/>${result.html}`)
      }

      if (!title.trim() || title === 'Untitled Note') {
        setTitle(result.titleSuggestion)
        onUpdate({
          ...noteRef.current,
          title: result.titleSuggestion,
          content: editor.getHTML(),
          updatedAt: new Date().toISOString(),
        })
      } else {
        onUpdate({
          ...noteRef.current,
          content: editor.getHTML(),
          updatedAt: new Date().toISOString(),
        })
      }

      onToast?.('Prep generated with Groq AI')
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

    onUpdate({
      ...noteRef.current,
      attachments: [...noteRef.current.attachments, newAttachment],
      updatedAt: new Date().toISOString(),
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async (attachment: Attachment) => {
    const file = await getAttachmentFile(attachment.id)
    if (!file) {
      alert('File not found in local storage.')
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
    onUpdate({
      ...noteRef.current,
      attachments: noteRef.current.attachments.filter((a) => a.id !== id),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-display mr-4 w-full border-none bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Note Title"
        />
        <button
          type="button"
          onClick={onDelete}
          className="btn btn-ghost shrink-0 text-destructive hover:bg-destructive/10"
        >
          Delete
        </button>
      </div>

      <div className="shrink-0 space-y-3 border-b border-border px-6 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="min-w-0 flex-1">
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
        </div>

        <div className="flex flex-wrap gap-2">
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
          <p className="text-sm text-muted-foreground">Groq is writing your prep…</p>
        ) : null}
        {aiError ? <p className="text-sm font-medium text-destructive">{aiError}</p> : null}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base min-h-[200px]">
          <EditorContent editor={editor} />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Attachments ({note.attachments.length})
            </h3>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-sm text-primary"
            >
              + Add File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="flex flex-col gap-2">
            {note.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
              >
                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    📄
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{att.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(att.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-1">
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
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            {note.attachments.length === 0 && (
              <p className="text-sm italic text-muted-foreground">
                No files attached. Safe to upload PDFs up to any size.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
