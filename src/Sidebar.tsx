import BrandLogo from './components/BrandLogo'
import type { AppUser } from './lib/cloudSync'

export type ViewMode =
  | 'home'
  | 'today'
  | 'board'
  | 'list'
  | 'dashboard'
  | 'prepKit'
  | 'roadmap'
  | 'dsa'
  | 'labs'
  | 'mock'
  | 'tracks'
  | 'systemDesign'
  | 'topicWorkspace'
  | 'settings'
  | 'jobs'
  | 'jobDetail'
  | 'resume'

export const NAV_SECTIONS: { category: string; items: { id: ViewMode; label: string; icon: string }[] }[] = [
  {
    category: 'Career Plan',
    items: [
      { id: 'home', label: 'Command Center', icon: '🏠' },
      { id: 'today', label: 'Today', icon: '☀️' },
      { id: 'roadmap', label: 'Goals & Roadmap', icon: '🗺️' },
      { id: 'tracks', label: 'Explore', icon: '🧭' },
    ],
  },
  {
    category: 'Job Tracker',
    items: [
      { id: 'jobs', label: 'Job Discovery', icon: '🔎' },
      { id: 'resume', label: 'Resume', icon: '📄' },
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'board', label: 'Kanban Board', icon: '🗂️' },
      { id: 'list', label: 'Applications', icon: '📋' },
    ],
  },
  {
    category: 'Engineering Hub',
    items: [
      { id: 'dsa', label: 'DSA Practice', icon: '🧩' },
      { id: 'systemDesign', label: 'System Design', icon: '🏗️' },
      { id: 'labs', label: 'Engineering Labs', icon: '🧪' },
      { id: 'mock', label: 'Mock Interviews', icon: '🎙️' },
    ],
  },
  {
    category: 'Resources',
    items: [{ id: 'prepKit', label: 'Prep Notes', icon: '📝' }],
  },
]

/** Views that are reached from another view and should highlight their parent in navigation. */
export function navParent(view: ViewMode): ViewMode {
  if (view === 'topicWorkspace') return 'tracks'
  if (view === 'jobDetail') return 'jobs'
  return view
}

interface SidebarProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  user: AppUser | null
  syncing: boolean
  syncError: string
  onSignIn: () => void
  onSignOut: () => void
  /** Views to leave out of navigation (feature flags). */
  hiddenViews?: ViewMode[]
  /** Set when the signed-in account may open the admin control center. */
  adminHref?: string | null
}

export default function Sidebar({ view, setView, theme, setTheme, user, syncing, syncError, onSignIn, onSignOut, hiddenViews = [], adminHref = null }: SidebarProps) {
  const active = navParent(view)

  return (
    <aside className="w-[280px] h-screen shrink-0 border-r border-border/40 bg-card/80 backdrop-blur-2xl flex-col justify-between p-5 fixed left-0 top-0 z-40 hidden md:flex overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div>
        <button
          type="button"
          onClick={() => setView('today')}
          className="flex items-center gap-3 px-3 mb-10 mt-2 text-left hover:opacity-80 transition-opacity"
          aria-label="Go to Today"
        >
          <BrandLogo size={36} />
        </button>

        <nav className="flex flex-col gap-8" aria-label="Primary">
          {NAV_SECTIONS.map((section) => (
            <div key={section.category}>
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                {section.category}
              </h3>
              <div className="flex flex-col gap-1.5">
                {section.items.filter((item) => !hiddenViews.includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    aria-current={active === item.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active === item.id
                        ? 'nav-active'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    <span className="w-5 text-center text-lg leading-none" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200"
          >
            <span className="w-5 text-center" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            aria-current={view === 'settings' ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              view === 'settings'
                ? 'nav-active'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
            onClick={() => setView('settings')}
          >
            <span className="w-5 text-center" aria-hidden="true">
              ⚙️
            </span>
            Settings
          </button>
          {adminHref && (
            <a
              href={adminHref}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200"
            >
              <span className="w-5 text-center" aria-hidden="true">
                🛡️
              </span>
              Admin panel
            </a>
          )}
        </div>

        {user ? (
          <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${syncError ? 'bg-amber-500' : syncing ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-foreground">
                {syncError ? 'Sync paused' : syncing ? 'Syncing…' : 'Cloud synced'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground truncate mb-2" title={user.email}>
              {user.email}
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
            <p className="text-xs font-semibold text-foreground mb-1">Local only</p>
            <p className="text-xs text-muted-foreground mb-2">Data stays in this browser.</p>
            <button type="button" onClick={onSignIn} className="btn btn-primary btn-sm w-full" aria-label="Sign in">
              Sign in to sync
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
