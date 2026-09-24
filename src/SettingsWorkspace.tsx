import { useRef } from 'react'
import AiKeyPanel from './components/AiKeyPanel'
import SubscriptionPanel from './components/SubscriptionPanel'
import type { BillingState } from './lib/billing/client'
import type { Entitlement } from './lib/billing/entitlement'
import { isGmailConfigured } from './lib/gmail'
import type { AppUser } from './lib/cloudSync'
import { CODE_LANGUAGES, useCodeLanguage, type CodeLanguage } from './lib/preferences'
import CurriculumStudio from './components/CurriculumStudio'

interface SettingsWorkspaceProps {
  user: AppUser | null
  syncing: boolean
  syncError: string
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  onSignIn: () => void
  onSignOut: () => void
  onRetrySync: () => void
  onExportBackup: () => void
  onImportBackup: (file: File) => void
  onExportLocalHistory: () => void
  onImportLocalHistory: (file: File) => void
  onClearLocalData: () => void
  onToast: (message: string) => void
  billing: BillingState | null
  onBillingChange: (entitlement: Entitlement) => void
}

export default function SettingsWorkspace({
  user,
  syncing,
  syncError,
  theme,
  setTheme,
  onSignIn,
  onSignOut,
  onRetrySync,
  onExportBackup,
  onImportBackup,
  onExportLocalHistory,
  onImportLocalHistory,
  onClearLocalData,
  onToast,
  billing,
  onBillingChange,
}: SettingsWorkspaceProps) {
  const [codeLanguage, setCodeLanguage] = useCodeLanguage()
  const backupInput = useRef<HTMLInputElement>(null)
  const historyInput = useRef<HTMLInputElement>(null)

  const gmailConfigured = isGmailConfigured()

  return (
    <div className="animate-rise max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Account, sync, AI providers and your data.</p>
      </div>

      <section className="surface rounded-2xl p-6 border border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">Account &amp; sync</h2>
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">{user.name || user.email}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs font-medium">
                {syncError ? (
                  <span className="text-amber-500">Sync paused: {syncError}</span>
                ) : syncing ? (
                  <span className="text-primary">Syncing…</span>
                ) : (
                  <span className="text-emerald-500">Cloud sync is on. Changes save automatically.</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {syncError ? (
                <button type="button" className="btn btn-ghost" onClick={onRetrySync}>
                  Retry sync
                </button>
              ) : null}
              <button type="button" className="btn btn-ghost text-destructive" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Local-only mode</p>
              <p className="text-sm text-muted-foreground">
                Everything is stored in this browser. Sign in to back it up and use it on other devices.
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={onSignIn}>
              Sign in or create account
            </button>
          </div>
        )}
      </section>

      <SubscriptionPanel billing={billing} signedIn={Boolean(user)} onSignIn={onSignIn} onChange={onBillingChange} onToast={onToast} />

      <section className="surface rounded-2xl p-6 border border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">Learning preferences</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Code language</p>
            <p className="text-sm text-muted-foreground">
              Used for AI explanations, the tutor, new code snippets and the DSA editor. You can still switch per problem.
            </p>
          </div>
          <select
            aria-label="Preferred code language"
            className="input-field !w-auto"
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)}
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="surface rounded-2xl p-6 border border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">Appearance</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Theme</p>
            <p className="text-sm text-muted-foreground">Applies immediately and is remembered on this device.</p>
          </div>
          <div className="flex rounded-xl bg-muted/60 p-1" role="radiogroup" aria-label="Theme">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  theme === t ? 'bg-[hsl(var(--card))] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AiKeyPanel signedIn={Boolean(user)} onSignIn={onSignIn} onToast={onToast} />

      <section className="surface rounded-2xl p-6 border border-border space-y-3">
        <h2 className="text-xl font-bold border-b border-border pb-2">Integrations</h2>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Gmail sync</p>
            <p className="text-sm text-muted-foreground">
              {gmailConfigured
                ? 'Configured. Open “Gmail Sync” from the Job Tracker to connect your inbox (read-only).'
                : 'Not configured on this deployment. Ask the host to set NEXT_PUBLIC_GOOGLE_CLIENT_ID, or use “Paste email”.'}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${gmailConfigured ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
            {gmailConfigured ? 'Ready' : 'Off'}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">LeetCode</p>
            <p className="text-sm text-muted-foreground">Set your username in DSA Practice to pull accepted submissions.</p>
          </div>
        </div>
      </section>

      <section className="surface rounded-2xl p-6 border border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">Your data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-4 space-y-2">
            <p className="font-semibold text-foreground">Full backup (JSON)</p>
            <p className="text-sm text-muted-foreground">Applications, notes, goals, roadmap and progress. Import replaces what is on this device.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onExportBackup}>
                Export backup
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => backupInput.current?.click()}>
                Import backup…
              </button>
              <input
                ref={backupInput}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImportBackup(file)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-border p-4 space-y-2">
            <p className="font-semibold text-foreground">Attempt history (device-local)</p>
            <p className="text-sm text-muted-foreground">Code, design write-ups and interview transcripts stored in this browser’s IndexedDB.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onExportLocalHistory}>
                Export history
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => historyInput.current?.click()}>
                Import history…
              </button>
              <input
                ref={historyInput}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImportLocalHistory(file)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-destructive">Clear data on this device</p>
            <p className="text-sm text-muted-foreground">
              Removes everything stored in this browser{user ? '. Your cloud copy is kept and reloads on next sign-in.' : '. Export a backup first.'}
            </p>
          </div>
          <button type="button" className="btn btn-ghost text-destructive shrink-0" onClick={onClearLocalData}>
            Clear local data
          </button>
        </div>
      </section>

      {user && (
        <section className="surface rounded-2xl p-6 border border-border space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2">Admin Tools</h2>
          <div className="pt-2">
            <CurriculumStudio />
          </div>
        </section>
      )}
    </div>
  )
}
