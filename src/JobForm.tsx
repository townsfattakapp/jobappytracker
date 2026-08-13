import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  type JobApplication,
  type NewJobApplication,
  type Status,
  type Contact,
  type InterviewRound,
  STATUS_ORDER,
} from './types'

interface JobFormProps {
  open: boolean
  initial?: JobApplication | null
  prefill?: Partial<NewJobApplication> | null
  onClose: () => void
  onSave: (data: NewJobApplication, id?: string) => void
}

const emptyForm: NewJobApplication = {
  company: '',
  role: '',
  jobUrl: '',
  location: '',
  salary: '',
  appliedDate: '',
  source: '',
  notes: '',
  status: 'Wishlist',
  followUpDate: '',
  pinned: false,
  interviewRounds: [],
  contacts: [],
}

function toForm(app: JobApplication): NewJobApplication {
  return {
    company: app.company,
    role: app.role,
    jobUrl: app.jobUrl,
    location: app.location,
    salary: app.salary ?? '',
    appliedDate: app.appliedDate ?? '',
    source: app.source ?? '',
    notes: app.notes,
    status: app.status,
    followUpDate: app.followUpDate ?? '',
    pinned: app.pinned,
    interviewRounds: app.interviewRounds || [],
    contacts: app.contacts || [],
  }
}

export default function JobForm({ open, initial, prefill, onClose, onSave }: JobFormProps) {
  const [form, setForm] = useState<NewJobApplication>(emptyForm)
  const [activeTab, setActiveTab] = useState<'details' | 'contacts' | 'interviews'>('details')
  const editing = Boolean(initial)

  useEffect(() => {
    if (!open) return
    const baseForm = { ...emptyForm, appliedDate: new Date().toISOString().split('T')[0] }
    if (initial) {
      setForm(toForm(initial))
    } else if (prefill) {
      setForm({ ...baseForm, ...prefill })
    } else {
      setForm(baseForm)
    }
    setActiveTab('details')
  }, [open, initial, prefill])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const today = new Date().toISOString().split('T')[0]
    onSave(
      {
        ...form,
        salary: form.salary || null,
        source: form.source || null,
        appliedDate: form.appliedDate || (form.status === 'Wishlist' ? null : today),
        followUpDate: form.followUpDate || null,
        jobUrl: form.jobUrl.trim(),
      },
      initial?.id,
    )
  }

  const addContact = () => {
    setForm({
      ...form,
      contacts: [...(form.contacts || []), { id: uuidv4(), name: '', role: '', email: '', linkedin: '' }],
    })
  }

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setForm({
      ...form,
      contacts: (form.contacts || []).map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  const removeContact = (id: string) => {
    setForm({ ...form, contacts: (form.contacts || []).filter((c) => c.id !== id) })
  }

  const addInterview = () => {
    setForm({
      ...form,
      interviewRounds: [
        ...(form.interviewRounds || []),
        { id: uuidv4(), name: '', date: new Date().toISOString().split('T')[0], notes: '', passed: true },
      ],
    })
  }

  const updateInterview = (id: string, field: keyof InterviewRound, value: any) => {
    setForm({
      ...form,
      interviewRounds: (form.interviewRounds || []).map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      ),
    })
  }

  const removeInterview = (id: string) => {
    setForm({ ...form, interviewRounds: (form.interviewRounds || []).filter((r) => r.id !== id) })
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center animate-fade">
      <button
        type="button"
        className="absolute inset-0 bg-[hsl(var(--ink)/0.5)] backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col w-full h-[95dvh] rounded-t-3xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl surface animate-slide-up bg-[hsl(var(--card))] overflow-hidden"
      >
        <div className="px-5 pt-5 sm:px-6 sm:pt-6 pb-2 shrink-0 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-medium text-muted-foreground">
              {editing ? 'Edit application' : 'New application'}
            </p>
            <h2 className="font-display mt-1 text-3xl font-semibold tracking-tight">
              {editing ? form.company || 'Update role' : 'Track a role'}
            </h2>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="px-5 sm:px-6 shrink-0 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {(['details', 'contacts', 'interviews'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-4 py-2 font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'contacts' && form.contacts && form.contacts.length > 0 && ` (${form.contacts.length})`}
              {tab === 'interviews' && form.interviewRounds && form.interviewRounds.length > 0 && ` (${form.interviewRounds.length})`}
            </button>
          ))}
        </div>
        <div className="w-full h-px bg-border shrink-0"></div>

        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 min-h-[300px] custom-scrollbar">
          <div className={activeTab === 'details' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Company">
                <input
                  required
                  className="input-field"
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </Field>
              <Field label="Role">
                <input
                  required
                  className="input-field"
                  value={form.role || ''}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Frontend Engineer"
                />
              </Field>
              <Field label="Job URL" className="sm:col-span-2">
                <input
                  type="url"
                  className="input-field"
                  value={form.jobUrl || ''}
                  onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              <Field label="Location">
                <input
                  className="input-field"
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Remote · NYC"
                />
              </Field>
              <Field label="Salary">
                <input
                  className="input-field"
                  value={form.salary || ''}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="₹15 LPA"
                />
              </Field>
              <Field label="Applied Date">
                <input
                  type="date"
                  className="input-field"
                  value={form.appliedDate || ''}
                  onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
                />
              </Field>
              <Field label="Source">
                <input
                  className="input-field"
                  value={form.source || ''}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="LinkedIn, Referral..."
                />
              </Field>
              <Field label="Status">
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Follow-up Date">
                <input
                  type="date"
                  className="input-field"
                  value={form.followUpDate || ''}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <textarea
                  className="input-field min-h-[5rem] resize-y"
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Important details..."
                />
              </Field>
            </div>
          </div>

          <div className={activeTab === 'contacts' ? 'block' : 'hidden'}>
            <div className="flex flex-col gap-4">
              {(!form.contacts || form.contacts.length === 0) && (
                <p className="text-muted-foreground text-center py-8">No contacts added yet.</p>
              )}
              {form.contacts?.map((contact) => (
                <div key={contact.id} className="p-4 rounded-xl border border-border bg-[hsl(var(--card))] relative flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                    aria-label="Remove contact"
                  >
                    &times;
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <input
                      className="input-field text-sm"
                      placeholder="Name"
                      value={contact.name || ''}
                      onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                    />
                    <input
                      className="input-field text-sm"
                      placeholder="Role (e.g. Recruiter)"
                      value={contact.role || ''}
                      onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                    />
                    <input
                      className="input-field text-sm"
                      placeholder="Email"
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                    />
                    <input
                      className="input-field text-sm"
                      placeholder="LinkedIn URL"
                      type="url"
                      value={contact.linkedin || ''}
                      onChange={(e) => updateContact(contact.id, 'linkedin', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost border-dashed border-2 py-3 text-muted-foreground"
                onClick={addContact}
              >
                + Add Contact
              </button>
            </div>
          </div>

          <div className={activeTab === 'interviews' ? 'block' : 'hidden'}>
            <div className="flex flex-col gap-4">
              {(!form.interviewRounds || form.interviewRounds.length === 0) && (
                <p className="text-muted-foreground text-center py-8">No interview rounds logged yet.</p>
              )}
              {form.interviewRounds?.map((round) => (
                <div key={round.id} className="p-4 rounded-xl border border-border bg-[hsl(var(--card))] relative flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => removeInterview(round.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                    aria-label="Remove round"
                  >
                    &times;
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <input
                      className="input-field text-sm"
                      placeholder="Round Name (e.g. Tech Screen)"
                      value={round.name || ''}
                      onChange={(e) => updateInterview(round.id, 'name', e.target.value)}
                    />
                    <input
                      className="input-field text-sm"
                      type="date"
                      value={round.date || ''}
                      onChange={(e) => updateInterview(round.id, 'date', e.target.value)}
                    />
                    <div className="sm:col-span-2">
                      <textarea
                        className="input-field text-sm min-h-[4rem] resize-y"
                        placeholder="Interview notes..."
                        value={round.notes || ''}
                        onChange={(e) => updateInterview(round.id, 'notes', e.target.value)}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(round.passed)}
                        onChange={(e) => updateInterview(round.id, 'passed', e.target.checked)}
                        className="w-4 h-4 rounded border-input"
                      />
                      Passed
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost border-dashed border-2 py-3 text-muted-foreground"
                onClick={addInterview}
              >
                + Add Interview Round
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-4 border-t border-border flex shrink-0 justify-end gap-3 bg-[hsl(var(--card))]">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary min-w-[120px]">
            {editing ? 'Save changes' : 'Add application'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label-quiet">{label}</span>
      {children}
    </label>
  )
}
