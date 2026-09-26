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
}

const GROUPS: { label: string; icon: string; matches: ViewMode[]; defaultView: ViewMode }[] = [
  { label: 'Home', icon: '🏠', matches: ['home', 'today'], defaultView: 'home' },
  { label: 'Career', icon: '🗺️', matches: ['roadmap', 'tracks', 'topicWorkspace'], defaultView: 'roadmap' },
  { label: 'Jobs', icon: '🚀', matches: ['jobs', 'jobDetail', 'resume', 'dashboard', 'board', 'list'], defaultView: 'jobs' },
  { label: 'Engineer', icon: '💻', matches: ['dsa', 'systemDesign', 'labs', 'mock'], defaultView: 'dsa' },
  { label: 'More', icon: '☰', matches: ['prepKit', 'settings'], defaultView: 'prepKit' },
]

const LABELS = new Map<ViewMode, string>(NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.id, i.label] as [ViewMode, string])))
LABELS.set('settings', 'Settings')

export default function MobileNav({ view, setView, theme, setTheme, user, onSignIn, onSignOut, hiddenViews = [] }: MobileNavProps) {
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
                className={`flex flex-col items-center justify-center min-w-[3.6rem] h-14 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="text-xl leading-none mb-1" aria-hidden="true">
                  {group.icon}
                </span>
                <span className="text-[10px] font-semibold">{group.label}</span>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">{openGroup.label}</h3>
            {sheetItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setView(item)
                  setSheet(null)
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                  active === item ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                }`}
              >
                {LABELS.get(item) || item}
              </button>
            ))}
            {openGroup.label === 'More' && (
              <>
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium hover:bg-muted text-foreground"
                >
                  {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSheet(null)
                      onSignOut()
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10"
                  >
                    Sign out ({user.email})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSheet(null)
                      onSignIn()
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-primary hover:bg-primary/10"
                  >
                    ☁️ Sign in to sync
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
