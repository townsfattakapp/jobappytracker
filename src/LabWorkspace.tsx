import { useState, useMemo } from 'react'
import type { EngineeringLab, LabAttemptSummary } from './types'

interface LabWorkspaceProps {
  labs: EngineeringLab[]
  attemptSummaries: LabAttemptSummary[]
  onSelectLab: (labId: string) => void
}

const CATEGORIES = [
  'All Domains',
  'Distributed Systems',
  'Databases & Cache',
  'Production Incidents',
  'Security & Auth',
  'DevOps & Cloud',
  'Frontend & Web'
] as const

export default function LabWorkspace({ labs, onSelectLab }: LabWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All Domains')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All')
  const [filterSeverity, setFilterSeverity] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = lab.title.toLowerCase().includes(query)
        const matchesTicket = lab.ticketId.toLowerCase().includes(query)
        const matchesStack = lab.techStack.some(t => t.toLowerCase().includes(query))
        const matchesScenario = lab.scenario.toLowerCase().includes(query)
        if (!matchesTitle && !matchesTicket && !matchesStack && !matchesScenario) return false
      }
      if (selectedCategory !== 'All Domains' && lab.category !== selectedCategory) return false
      if (filterDifficulty !== 'All' && lab.difficulty !== filterDifficulty) return false
      if (filterSeverity !== 'All' && !lab.severity?.startsWith(filterSeverity)) return false
      if (filterStatus !== 'All' && lab.status !== filterStatus) return false
      return true
    })
  }, [labs, selectedCategory, filterDifficulty, filterSeverity, filterStatus, searchQuery])

  const stats = useMemo(() => {
    const total = labs.length
    const done = labs.filter(l => l.status === 'Done').length
    const inProgress = labs.filter(l => l.status === 'In Progress' || l.status === 'In Review').length

    // Category breakdown
    const categoryCounts: Record<string, { total: number; done: number }> = {}
    for (const cat of CATEGORIES.slice(1)) {
      const catLabs = labs.filter(l => l.category === cat)
      categoryCounts[cat] = {
        total: catLabs.length,
        done: catLabs.filter(l => l.status === 'Done').length
      }
    }

    return { total, done, inProgress, categoryCounts }
  }, [labs])

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
      case 'Easy':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'Intermediate':
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'Advanced':
      case 'Hard':
        return 'text-destructive bg-destructive/10 border-destructive/20'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null
    if (severity.startsWith('P0')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          P0 Outage
        </span>
      )
    }
    if (severity.startsWith('P1')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          P1 High
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
        P2 Moderate
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      case 'In Progress':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      case 'In Review':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
      default:
        return 'bg-muted/60 text-muted-foreground border-border/50'
    }
  }

  return (
    <div className="animate-rise flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-card via-card/90 to-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Interactive Production Sim
            </span>
            <span className="text-xs text-muted-foreground">• 20 Production Labs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
            Engineering Labs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Triage real P0/P1 incidents, inspect production logs, debug deadlocks, fix cache stampedes, and submit production-ready pull requests.
          </p>
        </div>

        {/* Global Progress Metrics */}
        <div className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-muted/40 border border-border/70 backdrop-blur-sm relative z-10 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Solved</span>
            <span className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
              {stats.done}
              <span className="text-sm text-muted-foreground font-medium">/{stats.total}</span>
            </span>
          </div>
          <div className="w-px h-10 bg-border/60 mx-1" />
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider mb-1">In Progress</span>
            <span className="text-2xl sm:text-3xl font-bold text-foreground leading-none">{stats.inProgress}</span>
          </div>
          <div className="w-px h-10 bg-border/60 mx-1" />
          <div className="flex flex-col">
            <span className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">Coverage</span>
            <span className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
              {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Domain Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(category => {
          const isActive = selectedCategory === category
          const count = category === 'All Domains'
            ? labs.length
            : labs.filter(l => l.category === category).length

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground shadow-md'
                  : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <span>{category}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="surface rounded-2xl p-4 sm:p-5 border border-border/80 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="w-full xl:w-96 relative group flex items-center">
          <svg className="w-4 h-4 absolute left-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets, tech stack, error logs..."
            className="input-field !pl-10 !py-2.5 w-full text-xs sm:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* Severity Filter */}
          <select
            className="input-field text-xs py-2 px-3 min-w-[130px]"
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Moderate)</option>
          </select>

          {/* Difficulty Filter */}
          <select
            className="input-field text-xs py-2 px-3 min-w-[130px]"
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Status Filter */}
          <select
            className="input-field text-xs py-2 px-3 min-w-[120px]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/60 border border-border/50 p-1 rounded-xl ml-auto xl:ml-2">
            <button
              type="button"
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setViewMode('list')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List / Grid */}
      {filteredLabs.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground border border-dashed border-border/80 rounded-3xl bg-card/30">
          <span className="text-4xl mb-3 block">🎫</span>
          <h3 className="text-lg font-semibold text-foreground mb-1">No engineering labs found</h3>
          <p className="text-xs text-muted-foreground mb-4">Try clearing your filters or search keywords.</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All Domains')
              setFilterDifficulty('All')
              setFilterSeverity('All')
              setFilterStatus('All')
            }}
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLabs.map(lab => (
            <div
              key={lab.id}
              className="surface rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 cursor-pointer hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 border border-border/80 group relative overflow-hidden"
              onClick={() => onSelectLab(lab.id)}
            >
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                lab.severity?.startsWith('P0') ? 'bg-red-500' : lab.severity?.startsWith('P1') ? 'bg-amber-500' : 'bg-primary/40'
              }`} />

              <div className="flex flex-col gap-3">
                {/* Header: Ticket ID & Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg tracking-wider border border-border/60">
                      {lab.ticketId}
                    </span>
                    {getSeverityBadge(lab.severity)}
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusBadge(lab.status)}`}>
                    {lab.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {lab.title}
                </h3>

                {/* Scenario / Impact excerpt */}
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {lab.impact || lab.scenario}
                </p>
              </div>

              {/* Footer: Metadata & Tech Stack */}
              <div className="flex flex-col gap-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyColor(lab.difficulty)}`}>
                      {lab.difficulty}
                    </span>
                    <span className="text-muted-foreground text-[11px]">⏱️ {lab.estDurationMinutes}m</span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {lab.category || lab.type}
                  </span>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {lab.techStack.slice(0, 3).map(tech => (
                      <span key={tech} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                        {tech}
                      </span>
                    ))}
                    {lab.techStack.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground font-medium">
                        +{lab.techStack.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Solve Ticket →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface rounded-3xl overflow-hidden border border-border/80 shadow-md">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/50 border-b border-border/80">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground">Ticket</th>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground">Title</th>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground">Domain</th>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground">Severity</th>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground">Level</th>
                <th className="px-5 py-3.5 font-semibold text-muted-foreground hidden lg:table-cell">Stack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLabs.map(lab => (
                <tr
                  key={lab.id}
                  onClick={() => onSelectLab(lab.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-4 font-mono font-bold text-foreground">
                    {lab.ticketId}
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground group-hover:text-primary transition-colors max-w-xs sm:max-w-md truncate">
                    {lab.title}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                    {lab.category || lab.type}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getSeverityBadge(lab.severity)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusBadge(lab.status)}`}>
                      {lab.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyColor(lab.difficulty)}`}>
                      {lab.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {lab.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
