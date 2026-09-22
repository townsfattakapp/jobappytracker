import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type JobApplication, type PrepNote } from './types'
import RichTextEditor from './components/RichTextEditor.tsx'

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
            <RichTextEditor
              key={activeNote.id}
              initialTitle={activeNote.title}
              initialContent={activeNote.content}
              attachments={activeNote.attachments}
              applications={applications}
              showAiActions={true}
              onUpdate={(title, content, attachments) => {
                onSaveNote({
                  ...activeNote,
                  title,
                  content,
                  attachments,
                  updatedAt: new Date().toISOString(),
                })
              }}
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
