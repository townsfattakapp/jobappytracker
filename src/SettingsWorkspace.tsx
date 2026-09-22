import { useEffect, useRef, useState } from 'react'
import {
  getClientGroqApiKey,
  setClientGroqApiKey,
  getClientOpenAIApiKey,
  setClientOpenAIApiKey,
  isServerAiConfigured,
} from './lib/aiGatewayClient'
import { isGmailConfigured } from './lib/gmail'
import type { AppUser } from './lib/cloudSync'
import { CODE_LANGUAGES, useCodeLanguage, type CodeLanguage } from './lib/preferences'

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
}: SettingsWorkspaceProps) {
  const [groqKey, setGroqKey] = useState('')
  const [openAiKey, setOpenAiKey] = useState('')
  const [showKeys, setShowKeys] = useState(false)
  const [serverAi, setServerAi] = useState<boolean | null>(null)
  const [codeLanguage, setCodeLanguage] = useCodeLanguage()
  const backupInput = useRef<HTMLInputElement>(null)
  const historyInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setGroqKey(getClientGroqApiKey())
    setOpenAiKey(getClientOpenAIApiKey())
    let cancelled = false
    isServerAiConfigured().then((v) => {
      if (!cancelled) setServerAi(v)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveKeys = () => {
    setClientGroqApiKey(groqKey)
    setClientOpenAIApiKey(openAiKey)
    onToast(groqKey.trim() || openAiKey.trim() ? 'AI keys saved in this browser' : 'AI keys removed')
  }

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

      <section className="surface rounded-2xl p-6 border border-border space-y-6">
        <div>
          <h2 className="text-xl font-bold border-b border-border pb-2 mb-3">AI providers</h2>
          <p className="text-sm text-muted-foreground">
            AI powers email analysis, prep notes, the tutor, mock interviews and the lab mentor.
            {serverAi === true
              ? user
                ? ' This deployment includes AI for signed-in users, so keys below are optional.'
                : ' This deployment includes AI once you sign in. Or add your own key below.'
              : serverAi === false
                ? ' Add your own key below to enable it.'
                : ''}
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold" htmlFor="groq-key">
              Groq API key (recommended, free tier)
            </label>
            <input
              id="groq-key"
              type={showKeys ? 'text' : 'password'}
              className="input-field w-full md:w-2/3 font-mono text-sm"
              placeholder="gsk_…"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Create one at{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                console.groq.com
              </a>
              . Fast and free for personal use.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold" htmlFor="openai-key">
              OpenAI API key (optional fallback)
            </label>
            <input
              id="openai-key"
              type={showKeys ? 'text' : 'password'}
              className="input-field w-full md:w-2/3 font-mono text-sm"
              placeholder="sk-…"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={handleSaveKeys}>
            Save keys
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowKeys((v) => !v)}>
            {showKeys ? 'Hide keys' : 'Show keys'}
          </button>
          <span className="text-xs text-muted-foreground">Keys stay in this browser’s local storage and are sent only to your chosen provider.</span>
        </div>
      </section>

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
    </div>
  )
}
