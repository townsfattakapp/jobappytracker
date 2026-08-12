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
  const [mobileListOpen, setMobileListOpen] = useState(false)

  useEffect(() => {
    if (activeNoteId && !prepNotes.some((n) => n.id === activeNoteId)) {
      setActiveNoteId(prepNotes[0]?.id ?? null)
    }
    if (!activeNoteId && prepNotes.length > 0) {
      setActiveNoteId(prepNotes[0].id)
    }
  }, [prepNotes, activeNoteId])

  const activeNote = prepNotes.find((n) => n.id === activeNoteId) ?? null

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
    setMobileListOpen(false)
  }

  return (
    <div className="prep-kit animate-rise">
      {/* Mobile note switcher */}
      <div className="prep-kit-mobile-bar lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm flex-1 justify-start truncate"
            onClick={() => setMobileListOpen((v) => !v)}
            aria-expanded={mobileListOpen}
          >
            {activeNote?.title || 'Select a note'} · {prepNotes.length} notes
          </button>
          <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={createNote}>
            + New
          </button>
        </div>
        {mobileListOpen ? (
          <div className="prep-kit-mobile-list">
            {prepNotes.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              prepNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={`prep-kit-note-item ${
                    activeNoteId === note.id ? 'prep-kit-note-item-active' : ''
                  }`}
                  onClick={() => {
                    setActiveNoteId(note.id)
                    setMobileListOpen(false)
                  }}
                >
                  <span className="truncate font-semibold">{note.title || 'Untitled Note'}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="prep-kit-shell">
        {/* Desktop sidebar */}
        <aside className="prep-kit-sidebar">
          <div className="prep-kit-sidebar-head">
            <h2 className="font-display text-lg font-semibold text-foreground">Prep Notes</h2>
            <button type="button" onClick={createNote} className="btn btn-ghost btn-sm">
              + New
            </button>
          </div>
          <div className="prep-kit-sidebar-scroll">
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
                  className={`prep-kit-note-item ${
                    activeNoteId === note.id ? 'prep-kit-note-item-active' : ''
                  }`}
                >
                  <p className="truncate font-semibold text-foreground">
                    {note.title || 'Untitled Note'}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()} · {note.attachments.length}{' '}
                    file(s)
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="prep-kit-editor-pane">
          {activeNote ? (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              applications={applications}
              onUpdate={onSaveNote}
              onDelete={() => {
                if (confirm('Delete this note?')) {
                  onDeleteNote(activeNote.id)
                  setActiveNoteId(null)
                }
              }}
              onToast={onToast}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">No note selected</p>
                <p className="mt-1 text-sm">Create a note to start prepping.</p>
                <button type="button" className="btn btn-primary mt-4" onClick={createNote}>
                  Create note
                </button>
              </div>
            </div>
          )}
        </section>
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
  const scrollRef = useRef<HTMLDivElement>(null)
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
    editorProps: {
      attributes: {
        class: 'tiptap prep-kit-tiptap focus:outline-none',
      },
    },
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

      const nextTitle =
        !title.trim() || title === 'Untitled Note' ? result.titleSuggestion : title
      if (nextTitle !== title) setTitle(nextTitle)

      onUpdate({
        ...noteRef.current,
        title: nextTitle,
        content: editor.getHTML(),
        updatedAt: new Date().toISOString(),
      })

      onToast?.('Prep generated with Groq AI')
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
    <div className="prep-kit-editor">
      <div className="prep-kit-editor-top">
        <div className="flex items-start gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-display min-w-0 flex-1 border-none bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground sm:text-2xl"
            placeholder="Note title"
          />
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-ghost btn-sm shrink-0 text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        </div>

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

        <div className="prep-kit-ai-actions">
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
          <p className="mt-2 text-sm text-muted-foreground">Groq is writing your prep…</p>
        ) : null}
        {aiError ? <p className="mt-2 text-sm font-medium text-destructive">{aiError}</p> : null}
      </div>

      <div ref={scrollRef} className="prep-kit-editor-scroll">
        <div className="prep-kit-editor-body">
          <EditorContent editor={editor} />
        </div>

        <div className="prep-kit-attachments">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attachments ({note.attachments.length})
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
            {note.attachments.map((att) => (
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
            {note.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Attach resumes, JDs, or offer letters — stored on this device.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
