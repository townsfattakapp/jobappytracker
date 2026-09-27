import { useState, useRef } from 'react'
import type { AppUser } from './lib/cloudSync'
import type { BillingState } from './lib/billing/client'
import type { Entitlement } from './lib/billing/entitlement'
import { BILLING_CHANGED_EVENT } from './lib/billing/client'
import { isGmailConfigured } from './lib/gmail'
import { CODE_LANGUAGES, useCodeLanguage, type CodeLanguage } from './lib/preferences'
import { api } from './lib/adminClient'
import BillingPanel from './components/billing/BillingPanel'
import SubscriptionPanel from './components/SubscriptionPanel'
import CurriculumStudio from './components/CurriculumStudio'
import AiProvidersPanel from './components/settings/AiProvidersPanel'
import {
  AccountVector,
  CloudSyncVector,
  DataVaultVector,
  SettingsAmbientBackground,
  CardWatermark
} from './components/settings/SettingsVectorArt'

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

type SettingsTab = 'account' | 'sync' | 'ai' | 'data' | 'billing' | 'appearance' | 'admin'



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
  onBillingChange
}: SettingsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [codeLanguage, setCodeLanguage] = useCodeLanguage()
  const tabsContainerRef = useRef<HTMLDivElement>(null)

  const scrollTabs = (offset: number) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const backupInput = useRef<HTMLInputElement>(null)
  const historyInput = useRef<HTMLInputElement>(null)
  const gmailConfigured = isGmailConfigured()



  // Force sync pulse feedback
  const [manualSyncing, setManualSyncing] = useState(false)
  const handleForceSync = () => {
    setManualSyncing(true)
    onRetrySync()
    setTimeout(() => {
      setManualSyncing(false)
      onToast('✨ Cloud state synchronized')
    }, 900)
  }

  return (
    <div className="animate-rise max-w-5xl mx-auto w-full flex flex-col gap-6 pb-12 relative">
      {/* Ambient Minimal Background Illustration */}
      <SettingsAmbientBackground />

      {/* Header Banner */}
      <div className="surface p-6 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Settings &amp; Preferences
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your account identity, multi-device cloud synchronization, AI intelligence providers, and local storage data.
          </p>
        </div>

        {/* Global Status Ribbon */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          {user ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Signed In: {user.email?.split('@')[0]}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Local Browser Mode
            </span>
          )}

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm ${
              syncError
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : syncing || manualSyncing
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {syncError ? '⚠️ Sync Paused' : syncing || manualSyncing ? '🔄 Syncing...' : '🟢 Cloud Ready'}
          </span>
        </div>
      </div>

      {/* Modern Navigation Tabs Bar with Desktop Scroll Chevrons */}
      <div className="relative flex items-center group">
        <button
          type="button"
          onClick={() => scrollTabs(-180)}
          className="hidden md:flex absolute -left-3.5 z-20 w-8 h-8 rounded-full bg-[hsl(var(--card))] border border-border items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground shadow-md transition-all hover:scale-105 active:scale-95"
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
        >
          ‹
        </button>

        <div
          ref={tabsContainerRef}
          className="flex flex-1 overflow-x-auto gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border scrollbar-none snap-x"
        >
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all snap-start ${
              activeTab === 'account'
                ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>👤</span> Account &amp; Identity
          </button>

        <button
          type="button"
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'sync'
              ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>☁️</span> Cloud Sync
          {syncError && <span className="w-2 h-2 rounded-full bg-destructive" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ai'
              ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🧠</span> AI Providers
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'data'
              ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>💾</span> Your Data &amp; Vault
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'billing'
              ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>💳</span> Billing &amp; Pass
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'appearance'
              ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🎨</span> Appearance &amp; Apps
        </button>

        {user && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'bg-[hsl(var(--card))] text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>⚡</span> Admin Tools
          </button>
        )}
        </div>

        <button
          type="button"
          onClick={() => scrollTabs(180)}
          className="hidden md:flex absolute -right-3.5 z-20 w-8 h-8 rounded-full bg-[hsl(var(--card))] border border-border items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground shadow-md transition-all hover:scale-105 active:scale-95"
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
        >
          ›
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACCOUNT & PROFILE                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-6">
          {/* Hero Profile Card */}
          <div className="surface p-6 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Background Watermark Illustration */}
            <CardWatermark variant="account" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 z-10 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg ring-4 ring-primary/20">
                {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : '👨‍💻'}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.name || (user?.email ? user.email.split('@')[0] : 'Guest Learner')}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {user ? 'Verified Profile' : 'Local Storage Mode'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email || 'Data saved in current browser session'}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-muted-foreground">
                  <span>🔒 End-to-End TLS Encryption</span>
                  <span>·</span>
                  <span>🛡️ Zero Third-Party Tracking</span>
                </div>
              </div>
            </div>

            {/* Vector Illustration */}
            <div className="hidden md:flex shrink-0 opacity-90 hover:opacity-100 transition-opacity">
              <AccountVector />
            </div>
          </div>

          {/* Action Row */}
          <div className="surface p-5 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user ? 'Session Control & Authentication' : 'Sync your learning journey across all devices'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user
                  ? 'Sign out securely or switch profiles without losing your progress.'
                  : 'Create a free account to automatically mirror your DSA solutions and system design notes.'}
              </p>
            </div>

            {user ? (
              <button
                type="button"
                className="btn btn-ghost text-destructive border border-destructive/20 hover:bg-destructive/10 text-sm"
                onClick={onSignOut}
              >
                Sign out of account
              </button>
            ) : (
              <button type="button" className="btn btn-primary text-sm px-6" onClick={onSignIn}>
                Sign In or Create Account →
              </button>
            )}
          </div>

          {/* Learning Preferences */}
          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Preferred Programming Language</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sets the default language across the DSA Practice Arena, AI Tutor explanations, starter code, and code reviews.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CODE_LANGUAGES.map(lang => {
                const active = codeLanguage === lang
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setCodeLanguage(lang as CodeLanguage)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      active
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-muted/20 hover:border-border/80 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">
                        {lang === 'Java'
                          ? '☕'
                          : lang === 'Python'
                          ? '🐍'
                          : lang === 'TypeScript'
                          ? '📘'
                          : lang === 'C++'
                          ? '⚡'
                          : '🐹'}
                      </span>
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{lang}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {lang === 'Java'
                          ? 'Enterprise & FAANG'
                          : lang === 'Python'
                          ? 'High Velocity & ML'
                          : lang === 'TypeScript'
                          ? 'Modern Full-Stack'
                          : lang === 'C++'
                          ? 'Low Latency & Perf'
                          : 'Cloud & Go Systems'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLOUD SYNC & DEVICES                                               */}
      {/* ========================================================================= */}
      {activeTab === 'sync' && (
        <div className="flex flex-col gap-6">
          <div className="surface p-6 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <CardWatermark variant="sync" />
            <div className="flex flex-col gap-2 z-10">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Real-Time Cloud Mirror
              </span>
              <h2 className="text-xl font-bold text-foreground">Continuous Multi-Device Sync</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Every DSA attempt, system design canvas, lab milestone, and job application is continuously
                persisted to your secure cloud snapshot with deterministic conflict resolution.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={manualSyncing || syncing}
                  className="btn btn-primary text-xs sm:text-sm flex items-center gap-2 px-5 py-2 font-medium"
                >
                  <span>{manualSyncing || syncing ? '🔄' : '⚡'}</span>
                  {manualSyncing || syncing ? 'Syncing...' : 'Force Cloud Sync Now'}
                </button>
                {syncError && (
                  <button type="button" onClick={onRetrySync} className="btn btn-ghost text-xs text-amber-400">
                    Retry Paused Sync
                  </button>
                )}
              </div>
            </div>

            <div className="hidden md:flex shrink-0 opacity-90 hover:opacity-100 transition-opacity z-10">
              <CloudSyncVector />
            </div>
          </div>

          {/* Sync Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="surface p-5 rounded-2xl border border-border flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sync Engine Status
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    syncError
                      ? 'bg-destructive'
                      : syncing || manualSyncing
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-sm text-foreground">
                  {syncError ? 'Paused (Offline/Error)' : syncing || manualSyncing ? 'Syncing Changes' : 'Active & Connected'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {syncError || 'Local changes mirror automatically to your profile.'}
              </p>
            </div>

            <div className="surface p-5 rounded-2xl border border-border flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Storage Architecture
              </span>
              <p className="font-bold text-sm text-foreground">Hybrid CRDT / Cloud Store</p>
              <p className="text-xs text-muted-foreground mt-1">
                Zero offline disruption. Works 100% offline in IndexedDB and resolves upon reconnecting.
              </p>
            </div>

            <div className="surface p-5 rounded-2xl border border-border flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Device Topology
              </span>
              <p className="font-bold text-sm text-foreground">Multi-Device Ready</p>
              <p className="text-xs text-muted-foreground mt-1">
                Code on desktop, practice quizzes on tablet, review roadmaps on mobile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI PROVIDERS & INTELLIGENCE HUB                                    */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && <AiProvidersPanel user={user} onSignIn={onSignIn} onToast={onToast} />}

      {/* ========================================================================= */}
      {/* TAB 4: DATA VAULT & PRIVACY                                               */}
      {/* ========================================================================= */}
      {activeTab === 'data' && (
        <div className="flex flex-col gap-6">
          <div className="surface p-6 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <CardWatermark variant="data" />
            <div className="flex flex-col gap-2 z-10">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Full Data Ownership
              </span>
              <h2 className="text-xl font-bold text-foreground">Your Data &amp; Privacy Vault</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                You own 100% of your code attempts, blueprints, resume versions, and study notes.
                Export complete backups anytime or restore from previous backup archives.
              </p>
            </div>

            <div className="hidden md:flex shrink-0 opacity-90 hover:opacity-100 transition-opacity z-10">
              <DataVaultVector />
            </div>
          </div>

          {/* Backup & Portability Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="surface p-6 rounded-2xl border border-border flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <h3 className="font-bold text-foreground">Full State Backup (JSON)</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Downloads all applications, daily goals, custom tracks, notes, and curriculum progress.
                  Importing an archive restores your complete learning environment.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                <button type="button" className="btn btn-ghost text-xs border border-border" onClick={onExportBackup}>
                  📥 Export Full Backup
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-xs border border-border text-primary hover:bg-primary/10"
                  onClick={() => backupInput.current?.click()}
                >
                  📤 Import Backup File…
                </button>
                <input
                  ref={backupInput}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) onImportBackup(file)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>

            <div className="surface p-6 rounded-2xl border border-border flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💻</span>
                  <h3 className="font-bold text-foreground">Attempt History (IndexedDB)</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Downloads your actual code snapshots, Mermaid design diagrams, and mock interview transcripts
                  stored locally in this browser profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  className="btn btn-ghost text-xs border border-border"
                  onClick={onExportLocalHistory}
                >
                  📥 Export Code History
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-xs border border-border text-primary hover:bg-primary/10"
                  onClick={() => historyInput.current?.click()}
                >
                  📤 Import Code History…
                </button>
                <input
                  ref={historyInput}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) onImportLocalHistory(file)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="surface p-6 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-destructive flex items-center gap-2">
                <span>⚠️</span> Danger Zone &amp; Data Wipes
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Permanent actions. Make sure you have exported a JSON backup beforehand if you wish to keep your data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-destructive/20">
              <div>
                <p className="text-sm font-semibold text-foreground">Clear Local Device Cache</p>
                <p className="text-xs text-muted-foreground">
                  Removes cached code and attempt files stored on this machine. Your cloud snapshot reloads on next sign-in.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 shrink-0"
                onClick={onClearLocalData}
              >
                Clear Local Cache
              </button>
            </div>

            {user && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-destructive/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">Reset Career OS Records</p>
                  <p className="text-xs text-muted-foreground">
                    Deletes uploaded resumes, job analyses, and outreach records while keeping your DSA and system design progress intact.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 shrink-0"
                  onClick={async () => {
                    if (
                      !window.confirm(
                        'Delete all Career OS records (resumes, job analyses, outreach contacts)? Your learning progress will stay intact.'
                      )
                    ) {
                      return
                    }
                    try {
                      const res = await api<{ deleted: Record<string, number> }>('/api/account/career-data', {
                        method: 'DELETE',
                        json: { confirm: 'DELETE' }
                      })
                      onToast(`Deleted ${Object.values(res.deleted).reduce((a, b) => a + b, 0)} Career OS records`)
                    } catch (err) {
                      onToast(err instanceof Error ? err.message : 'Deletion failed')
                    }
                  }}
                >
                  Delete Career OS Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BILLING & MEMBERSHIP                                               */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="flex flex-col gap-6">
          <BillingPanel
            signedIn={Boolean(user)}
            onSignIn={onSignIn}
            onToast={onToast}
            onChanged={() => window.dispatchEvent(new Event(BILLING_CHANGED_EVENT))}
          />
          {billing?.entitlement?.planId && billing.entitlement.access && (
            <SubscriptionPanel
              billing={billing}
              signedIn={Boolean(user)}
              onSignIn={onSignIn}
              onChange={onBillingChange}
              onToast={onToast}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: APPEARANCE & CONNECTED APPS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-6">
          {/* Theme Selector */}
          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4 relative overflow-hidden">
            <CardWatermark variant="appearance" />
            <div className="z-10">
              <h3 className="text-base font-bold text-foreground">Visual Theme &amp; Contrast</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select your preferred interface aesthetic. Automatically cached in local profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-5 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30'
                    : 'border-border bg-muted/20 hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                    🌙
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Sleek Dark Mode</p>
                    <p className="text-xs text-muted-foreground">High contrast, low eye fatigue</p>
                  </div>
                </div>
                {theme === 'dark' && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-5 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30'
                    : 'border-border bg-muted/20 hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">
                    ☀️
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Clean Light Mode</p>
                    <p className="text-xs text-muted-foreground">Daylight crisp readability</p>
                  </div>
                </div>
                {theme === 'light' && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </button>
            </div>
          </div>

          {/* Connected Integrations */}
          <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Connected Integrations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">External platform integrations and APIs.</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl border border-border flex items-start justify-between gap-4 bg-muted/20">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📬</span>
                  <div>
                    <p className="font-bold text-sm text-foreground">Gmail Inbox Sync</p>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                      {gmailConfigured
                        ? 'Configured and active. Open "Gmail Sync" inside Job Tracker to pull application status updates.'
                        : 'Not configured on this instance. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable automated email parsing.'}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    gmailConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {gmailConfigured ? 'Ready' : 'Not Connected'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-border flex items-start justify-between gap-4 bg-muted/20">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-sm text-foreground">LeetCode Sync</p>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                      Synchronize your solved submissions automatically into the Algorithms &amp; Data Structures workspace.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                  Active in DSA Tab
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: ADMIN STUDIO                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'admin' && user && (
        <div className="surface p-6 rounded-2xl border border-border flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Curriculum &amp; Platform Studio</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Author custom tracks, manage modules, and publish topics.</p>
          </div>
          <CurriculumStudio />
        </div>
      )}
    </div>
  )
}
