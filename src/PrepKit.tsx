import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { type PrepNote, type Attachment } from './types'
import { saveAttachmentFile, getAttachmentFile, deleteAttachmentFile } from './db'

interface PrepKitProps {
  prepNotes: PrepNote[]
  onSaveNote: (note: PrepNote) => void
  onDeleteNote: (id: string) => void
}

export default function PrepKit({ prepNotes, onSaveNote, onDeleteNote }: PrepKitProps) {
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
    <div className="flex flex-col sm:flex-row h-[75vh] w-full surface rounded-2xl overflow-hidden animate-rise">
      <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border bg-[hsl(var(--card))] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Prep Notes</h2>
          <button onClick={createNote} className="btn btn-ghost btn-sm">
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {prepNotes.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Create a note to start prepping.
            </p>
          ) : (
            prepNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                  activeNoteId === note.id ? 'bg-[hsl(var(--primary)/0.1)]' : 'hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-foreground truncate">
                  {note.title || 'Untitled Note'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {new Date(note.updatedAt).toLocaleDateString()} · {note.attachments.length}{' '}
                  attachment(s)
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[hsl(var(--card))] relative">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onUpdate={(updated) => onSaveNote(updated)}
            onDelete={() => {
              if (confirm('Delete this note?')) {
                onDeleteNote(activeNote.id)
                setActiveNoteId(null)
              }
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a note
          </div>
        )}
      </div>
    </div>
  )
}

function NoteEditor({
  note,
  onUpdate,
  onDelete,
}: {
  note: PrepNote
  onUpdate: (n: PrepNote) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(note.title)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Paste from ChatGPT, or start typing...',
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      onUpdate({ ...note, content: editor.getHTML(), updatedAt: new Date().toISOString() })
    },
  })

  // Debounce title saving to prevent lagging while typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (title !== note.title) {
        onUpdate({ ...note, title, updatedAt: new Date().toISOString() })
      }
    }, 500)
    return () => clearTimeout(t)
  }, [title, note, onUpdate])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newAttachment: Attachment = {
      id: uuidv4(),
      filename: file.name,
      size: file.size,
      type: file.type,
    }

    // Save to IndexedDB
    await saveAttachmentFile(newAttachment.id, file)

    // Update note with attachment reference
    onUpdate({
      ...note,
      attachments: [...note.attachments, newAttachment],
      updatedAt: new Date().toISOString(),
    })
    
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
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
      ...note,
      attachments: note.attachments.filter((a) => a.id !== id),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-5 pb-3 flex items-center justify-between shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-display font-semibold bg-transparent border-none outline-none text-foreground w-full mr-4 placeholder:text-muted-foreground"
          placeholder="Note Title"
        />
        <button onClick={onDelete} className="btn btn-ghost text-destructive hover:bg-destructive/10 shrink-0">
          Delete
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[200px]">
          <EditorContent editor={editor} />
        </div>

        {/* Attachments Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Attachments ({note.attachments.length})
            </h3>
            <button
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
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    📄
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{att.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(att.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button
                    onClick={() => handleDownload(att)}
                    className="btn btn-ghost btn-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-muted-foreground hover:text-destructive px-2 py-1 rounded"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            {note.attachments.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No files attached. Safe to upload PDFs up to any size.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
