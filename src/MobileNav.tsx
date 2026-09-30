import { useEffect, useState } from 'react'
import { NAV_SECTIONS, navParent, type ViewMode } from './Sidebar'
import type { AppUser } from './lib/cloudSync'

interface MobileNavProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  user: AppUser | null
  onSignIn: () => void
  onSignOut: () => void
  hiddenViews?: ViewMode[]
  adminHref?: string | null
}

const GROUPS: { label: string; icon: string; matches: ViewMode[]; defaultView: ViewMode }[] = [
  { label: 'Home', icon: '🏠', matches: ['home', 'today'], defaultView: 'home' },
  { label: 'Career', icon: '🗺️', matches: ['roadmap', 'tracks', 'topicWorkspace'], defaultView: 'roadmap' },
  { label: 'Jobs', icon: '🚀', matches: ['jobs', 'jobDetail', 'resume', 'dashboard', 'board', 'list', 'referrals'], defaultView: 'jobs' },
  { label: 'Engineer', icon: '💻', matches: ['dsa', 'systemDesign', 'labs', 'mock'], defaultView: 'dsa' },
  { label: 'More', icon: '☰', matches: ['prepKit', 'settings'], defaultView: 'prepKit' },
]

const LABELS = new Map<ViewMode, string>(NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.id, i.label] as [ViewMode, string])))
LABELS.set('settings', 'Settings')
LABELS.set('dashboard', 'Pipeline Stats')
LABELS.set('list', 'Applications Table')

const ICONS = new Map<ViewMode, string>(NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.id, i.icon] as [ViewMode, string])))
ICONS.set('settings', '⚙️')
ICONS.set('dashboard', '📊')
ICONS.set('list', '📋')

export default function MobileNav({ view, setView, theme, setTheme, user, onSignIn, onSignOut, hiddenViews = [], adminHref = null }: MobileNavProps) {
  const [sheet, setSheet] = useState<string | null>(null)
  const active = navParent(view)

  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheet(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])

  const openGroup = GROUPS.find((g) => g.label === sheet)
  const sheetItems: ViewMode[] = openGroup
    ? openGroup.label === 'More'
      ? ['prepKit', 'settings']
      : openGroup.matches.filter((m) => m !== 'topicWorkspace' && m !== 'jobDetail' && !hiddenViews.includes(m))
    : []

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-t border-border/50 md:hidden pb-safe"
        aria-label="Primary"
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {GROUPS.map((group) => {
            const isActive = group.matches.includes(active)
            const single = group.matches.length === 1
            return (
              <button
                key={group.label}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  if (single) {
                    setView(hiddenViews.includes(group.defaultView) ? group.matches.find((m) => !hiddenViews.includes(m) && m !== 'jobDetail' && m !== 'topicWorkspace') || group.defaultView : group.defaultView)
                    setSheet(null)
                  } else if (isActive || group.label === 'More') {
                    setSheet(sheet === group.label ? null : group.label)
                  } else {
                    setView(hiddenViews.includes(group.defaultView) ? group.matches.find((m) => !hiddenViews.includes(m) && m !== 'jobDetail' && m !== 'topicWorkspace') || group.defaultView : group.defaultView)
                    setSheet(null)
                  }
                }}
                className={`flex flex-col items-center justify-center min-w-[3.6rem] h-14 rounded-xl transition-all relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <span className="text-xl leading-none mb-1 inline-block" aria-hidden="true">
                    {group.icon}
                  </span>
                  {!single && (
                    <span
                      className={`absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-primary' : 'bg-muted-foreground/40'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-semibold">{group.label}</span>
                  {!single && <span className="text-[8px] opacity-60 leading-none">▾</span>}
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      {sheet && openGroup && (
        <div
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm md:hidden flex flex-col justify-end px-3 pb-[5.5rem]"
          onClick={() => setSheet(null)}
          role="presentation"
        >
          <div
            className="bg-card border border-border/60 rounded-2xl p-3 shadow-2xl flex flex-col gap-1 animate-slide-up max-h-[calc(100dvh-7rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`${openGroup.label} menu`}
          >
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{openGroup.label} Views</h3>
              <span className="text-[10px] font-medium text-muted-foreground/70">Tap any view to jump</span>
            </div>
            {sheetItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setView(item)
                  setSheet(null)
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-3 ${
                  active === item ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                  {ICONS.get(item) || '📄'}
                </span>
                <span className="flex-1">{LABELS.get(item) || item}</span>
                {active === item && (
                  <span className="text-[10px] uppercase font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                    Active
                  </span>
                )}
              </button>
            ))}
            {openGroup.label === 'More' && (
              <>
                <a
                  href="/referrer"
                  className="w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-foreground hover:bg-muted flex items-center gap-3"
                >
                  <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                    💼
                  </span>
                  <span className="flex-1">Referrer Portal</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Earn
                  </span>
                </a>
                {adminHref && (
                  <a
                    href={adminHref}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-foreground hover:bg-muted flex items-center gap-3"
                  >
                    <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                      🛡️
                    </span>
                    <span className="flex-1">Admin Control Center</span>
                  </a>
                )}
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl font-medium hover:bg-muted text-foreground flex items-center gap-3"
                >
                  <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </span>
                  <span>{theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}</span>
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSheet(null)
                      onSignOut()
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-destructive hover:bg-destructive/10 flex items-center gap-3"
                  >
                    <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                      🚪
                    </span>
                    <span>Sign out ({user.email})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSheet(null)
                      onSignIn()
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-primary hover:bg-primary/10 flex items-center gap-3"
                  >
                    <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                      ☁️
                    </span>
                    <span>Sign in to sync progress</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
