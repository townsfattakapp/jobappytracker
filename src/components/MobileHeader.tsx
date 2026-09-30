import { useState, useEffect } from 'react'
import BrandLogo from './BrandLogo'
import { NAV_SECTIONS, navParent, type ViewMode } from '../Sidebar'
import type { AppUser } from '../lib/cloudSync'

interface MobileHeaderProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  user: AppUser | null
  syncing?: boolean
  onSignIn: () => void
  onSignOut: () => void
  hiddenViews?: ViewMode[]
  adminHref?: string | null
}

const LABELS = new Map<ViewMode, string>(
  NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.id, i.label] as [ViewMode, string]))
)
LABELS.set('settings', 'Settings')
LABELS.set('topicWorkspace', 'Topic Workspace')
LABELS.set('jobDetail', 'Job Details')
LABELS.set('dashboard', 'Pipeline Stats')
LABELS.set('list', 'Applications Table')

export default function MobileHeader({
  view,
  setView,
  theme,
  setTheme,
  user,
  syncing,
  onSignIn,
  onSignOut,
  hiddenViews = [],
  adminHref = null,
}: MobileHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const active = navParent(view)
  const currentTitle = LABELS.get(view) || 'JobAppy'

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <>
      <header
        className="mobile-header fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 h-14 flex items-center justify-between px-3 md:hidden transition-colors"
        aria-label="Mobile header"
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2.5 px-2 py-1.5 -ml-1 rounded-xl hover:bg-muted/70 active:scale-95 transition-all text-left min-w-0"
          aria-label="Open all views menu"
          aria-expanded={drawerOpen}
        >
          <BrandLogo size={26} wordmark={false} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-display font-bold text-sm text-foreground truncate max-w-[150px] xs:max-w-[190px]">
                {currentTitle}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">▾</span>
            </div>
            {syncing && (
              <span className="text-[10px] text-primary animate-pulse font-medium">Syncing…</span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-xl border border-border/60 bg-card/60 flex items-center justify-center text-sm hover:bg-muted active:scale-95 transition-all"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/70 bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 active:scale-95 transition-all"
            aria-label="Open all views drawer"
          >
            <span className="text-sm leading-none" aria-hidden="true">☰</span>
            <span>All Views</span>
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md md:hidden flex flex-col justify-start"
          onClick={() => setDrawerOpen(false)}
          role="presentation"
        >
          <div
            className="bg-card border-b border-border/80 shadow-2xl flex flex-col max-h-[92dvh] overflow-y-auto animate-slide-down w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="All application views"
          >
            {/* Drawer top header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 sticky top-0 bg-card/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={28} />
                <span className="font-display font-bold text-sm tracking-tight text-foreground">
                  All Views & Tools
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Categorized views list */}
            <div className="p-3.5 flex flex-col gap-5">
              {NAV_SECTIONS.map((section) => {
                const availableItems = section.items.filter((item) => !hiddenViews.includes(item.id))
                if (availableItems.length === 0) return null

                return (
                  <div key={section.category}>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70 px-2.5 mb-1.5">
                      {section.category}
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {availableItems.map((item) => {
                        const isCurrent = active === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setView(item.id)
                              setDrawerOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                              isCurrent
                                ? 'bg-primary/15 text-primary font-bold shadow-sm'
                                : 'text-foreground/90 hover:bg-muted/80 active:bg-muted'
                            }`}
                          >
                            <span className="w-6 text-center text-lg leading-none" aria-hidden="true">
                              {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10">
                                Current
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Preferences & Admin */}
              <div className="pt-2 border-t border-border/60">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70 px-2.5 mb-1.5">
                  Preferences & Tools
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setView('settings')
                      setDrawerOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      view === 'settings'
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-foreground/90 hover:bg-muted/80'
                    }`}
                  >
                    <span className="w-6 text-center text-lg leading-none" aria-hidden="true">
                      ⚙️
                    </span>
                    <span className="flex-1">Settings</span>
                  </button>

                  {adminHref && (
                    <a
                      href={adminHref}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/90 hover:bg-muted/80 transition-all text-left"
                    >
                      <span className="w-6 text-center text-lg leading-none" aria-hidden="true">
                        🛡️
                      </span>
                      <span className="flex-1">Admin Control Center</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/90 hover:bg-muted/80 transition-all text-left"
                  >
                    <span className="w-6 text-center text-lg leading-none" aria-hidden="true">
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </span>
                    <span className="flex-1">
                      {theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Account section */}
              <div className="pt-2 border-t border-border/60">
                {user ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-bold text-foreground truncate">{user.name || user.email}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false)
                        onSignOut()
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false)
                      onSignIn()
                    }}
                    className="w-full py-2.5 px-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>☁️</span>
                    <span>Sign in to sync your progress</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
