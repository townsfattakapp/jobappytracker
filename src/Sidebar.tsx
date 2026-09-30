import BrandLogo, { BrandMark } from './components/BrandLogo'
import type { AppUser } from './lib/cloudSync'

export type ViewMode =
  | 'home'
  | 'today'
  | 'board'
  | 'referrals'
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
    category: 'Daily Focus',
    items: [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'today', label: "Today's Tasks", icon: '☀️' },
      { id: 'roadmap', label: 'Career Roadmap', icon: '🗺️' },
    ],
  },
  {
    category: 'Job Hunt',
    items: [
      { id: 'jobs', label: 'Explore Jobs', icon: '🔎' },
      { id: 'resume', label: 'Resume & ATS', icon: '📄' },
      { id: 'board', label: 'Application Tracker', icon: '🗂️' },
      { id: 'referrals', label: 'Referrals', icon: '🤝' },
    ],
  },
  {
    category: 'Interview & Prep',
    items: [
      { id: 'mock', label: 'Mock Interviews', icon: '🎙️' },
      { id: 'dsa', label: 'DSA Practice', icon: '🧩' },
      { id: 'systemDesign', label: 'System Design', icon: '🏗️' },
      { id: 'labs', label: 'Engineering Labs', icon: '🧪' },
      { id: 'tracks', label: 'All Curriculum', icon: '🧭' },
    ],
  },
  {
    category: 'Workspace',
    items: [{ id: 'prepKit', label: 'Prep Notes', icon: '📝' }],
  },
]

/** Views that are reached from another view and should highlight their parent in navigation. */
export function navParent(view: ViewMode): ViewMode {
  if (view === 'topicWorkspace') return 'tracks'
  if (view === 'jobDetail') return 'jobs'
  if (view === 'dashboard' || view === 'list') return 'board'
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
  /** Expand / Collapse drawer state */
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({
  view,
  setView,
  theme,
  setTheme,
  user,
  syncing,
  syncError,
  onSignIn,
  onSignOut,
  hiddenViews = [],
  adminHref = null,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const active = navParent(view)

  return (
    <aside
      className={`h-screen shrink-0 border-r border-border/40 bg-card/80 backdrop-blur-2xl flex-col justify-between fixed left-0 top-0 z-40 hidden md:flex overflow-y-auto overflow-x-hidden custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px] px-2.5 py-4' : 'w-[280px] p-5'
      }`}
      aria-label="Sidebar navigation"
    >
      <div>
        {/* Top Header: Brand Logo / Mark + Toggle Button */}
        <div className={`flex items-center mb-6 mt-1 ${collapsed ? 'flex-col gap-3 justify-center' : 'justify-between px-1'}`}>
          <button
            type="button"
            onClick={() => setView('today')}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
            aria-label="Go to Today"
          >
            {collapsed ? <BrandMark size={32} /> : <BrandLogo size={36} />}
          </button>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all ${
                collapsed ? 'w-8 h-8 flex items-center justify-center' : ''
              }`}
              title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className="w-4 h-4 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </div>

        <nav className={`flex flex-col ${collapsed ? 'gap-4' : 'gap-7'}`} aria-label="Primary">
          {NAV_SECTIONS.map((section, idx) => {
            const items = section.items.filter((item) => !hiddenViews.includes(item.id))
            if (items.length === 0) return null
            return (
              <div key={section.category}>
                {!collapsed ? (
                  <h3 className="px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2.5">
                    {section.category}
                  </h3>
                ) : (
                  idx > 0 && <div className="w-6 h-px bg-border/60 mx-auto my-2" />
                )}
                <div className={`flex flex-col ${collapsed ? 'gap-2' : 'gap-1.5'}`}>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setView(item.id)}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active === item.id ? 'page' : undefined}
                      className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                        collapsed
                          ? 'w-11 h-11 mx-auto justify-center'
                          : 'w-full gap-3 px-3 py-2.5'
                      } ${
                        active === item.id
                          ? 'nav-active'
                          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                    >
                      <span className="text-center text-lg leading-none shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      <div className={`flex flex-col mt-6 ${collapsed ? 'gap-3' : 'gap-4'}`}>
        <div className={`flex flex-col ${collapsed ? 'gap-2' : 'gap-1.5'}`}>
          <a
            href="/referrer"
            title="Referrer Portal (Earn Referral Bonuses)"
            aria-label="Referrer Portal"
            className={`flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200 ${
              collapsed
                ? 'w-11 h-11 mx-auto justify-center'
                : 'w-full gap-3 px-3 py-2.5'
            }`}
          >
            <span className="text-center text-lg leading-none shrink-0" aria-hidden="true">
              💼
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 truncate">Referrer Portal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Earn
                </span>
              </>
            )}
          </a>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className={`flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200 ${
              collapsed
                ? 'w-11 h-11 mx-auto justify-center'
                : 'w-full gap-3 px-3 py-2.5'
            }`}
          >
            <span className="text-center text-lg leading-none shrink-0" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <button
            type="button"
            aria-current={view === 'settings' ? 'page' : undefined}
            onClick={() => setView('settings')}
            title="Settings"
            aria-label="Settings"
            className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
              collapsed
                ? 'w-11 h-11 mx-auto justify-center'
                : 'w-full gap-3 px-3 py-2.5'
            } ${
              view === 'settings'
                ? 'nav-active'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <span className="text-center text-lg leading-none shrink-0" aria-hidden="true">
              ⚙️
            </span>
            {!collapsed && <span>Settings</span>}
          </button>
          {adminHref && (
            <a
              href={adminHref}
              title="Admin panel"
              aria-label="Admin panel"
              className={`flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200 ${
                collapsed
                  ? 'w-11 h-11 mx-auto justify-center'
                  : 'w-full gap-3 px-3 py-2.5'
              }`}
            >
              <span className="text-center text-lg leading-none shrink-0" aria-hidden="true">
                🛡️
              </span>
              {!collapsed && <span>Admin panel</span>}
            </a>
          )}
        </div>

        {/* User Card */}
        {user ? (
          !collapsed ? (
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
            <button
              type="button"
              onClick={onSignOut}
              className="flex flex-col items-center justify-center p-1.5 bg-muted/50 rounded-xl border border-border/50 hover:border-destructive/40 transition-colors mx-auto"
              title={`Signed in as ${user.email}. Click to sign out.`}
              aria-label="Sign out"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                    syncError ? 'bg-amber-500' : syncing ? 'bg-primary animate-pulse' : 'bg-emerald-500'
                  }`}
                  aria-hidden="true"
                />
              </div>
            </button>
          )
        ) : (
          !collapsed ? (
            <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
              <p className="text-xs font-semibold text-foreground mb-1">Local only</p>
              <p className="text-xs text-muted-foreground mb-2">Data stays in this browser.</p>
              <button type="button" onClick={onSignIn} className="btn btn-primary btn-sm w-full" aria-label="Sign in">
                Sign in to sync
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="w-11 h-11 mx-auto rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
              title="Sign in to sync"
              aria-label="Sign in to sync"
            >
              <span className="text-base" aria-hidden="true">☁️</span>
            </button>
          )
        )}

        {/* Bottom Expand / Collapse helper */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center rounded-xl text-xs font-medium text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all ${
              collapsed
                ? 'w-11 h-9 mx-auto justify-center'
                : 'w-full gap-2 px-3 py-2'
            }`}
            title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
            {!collapsed && <span className="text-[11px]">Collapse</span>}
            {!collapsed && (
              <kbd className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                Ctrl+B
              </kbd>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}
