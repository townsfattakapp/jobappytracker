import { useState, useMemo } from 'react'
import type { SystemDesignExercise, SystemDesignAttemptSummary } from './types'

interface SystemDesignWorkspaceProps {
  exercises: SystemDesignExercise[]
  attemptSummaries: SystemDesignAttemptSummary[]
  onSelectExercise: (id: string) => void
}

export default function SystemDesignWorkspace({ exercises, attemptSummaries, onSelectExercise }: SystemDesignWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const filtered = useMemo(() => {
    return exercises.filter(e => {
      if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterType !== 'All' && e.type !== filterType) return false
      return true
    })
  }, [exercises, filterType, searchQuery])

  const stats = useMemo(() => {
    const total = exercises.length
    const solved = exercises.filter(e => e.status === 'Solved').length
    const attempted = exercises.filter(e => e.status === 'Attempted').length
    return { total, solved, attempted }
  }, [exercises])

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500'
      case 'Medium': return 'text-amber-500'
      case 'Hard': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'Solved') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (status === 'Attempted') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <div className="animate-rise flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold text-foreground">System Design</h1>
          <p className="text-muted-foreground">Practice High-Level (HLD) and Low-Level (LLD) architectural design.</p>
        </div>
        
        <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Solved</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats.solved}<span className="text-sm text-muted-foreground font-medium">/{stats.total}</span></span>
          </div>
          <div className="w-px h-10 bg-border mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-amber-500 font-medium uppercase tracking-wider mb-1">Attempted</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats.attempted}</span>
          </div>
        </div>
      </div>

      <div className="surface rounded-2xl p-4 sm:p-5 border border-border flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="w-full xl:w-96 relative group flex items-center">
          <svg className="w-5 h-5 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search exercises..." 
            className="input-field !pl-10 w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select className="input-field max-w-[200px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="HLD">HLD (Architecture & Scale)</option>
            <option value="LLD">LLD (OOP & Patterns)</option>
          </select>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg ml-auto xl:ml-2">
            <button 
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button 
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('list')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
          <span className="text-3xl mb-4 block">🏗️</span>
          No exercises found matching your filters.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(ex => {
            const attempts = attemptSummaries.filter(a => a.exerciseId === ex.id)
            return (
              <div 
                key={ex.id} 
                className="group surface p-5 rounded-2xl border border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer flex flex-col gap-4"
                onClick={() => onSelectExercise(ex.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                    {ex.title}
                  </h3>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider ${ex.type === 'HLD' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-teal-500/10 text-teal-500 border-teal-500/20'}`}>
                    {ex.type}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ex.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${getDifficultyColor(ex.difficulty)}`}>{ex.difficulty}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(ex.status)}`}>
                      {ex.status}
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {attempts.length > 0 ? `${attempts.length} attempt${attempts.length > 1 ? 's' : ''}` : 'No attempts'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="surface rounded-2xl overflow-hidden border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Type</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Title</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Difficulty</th>
                <th className="px-6 py-4 font-medium text-muted-foreground hidden md:table-cell">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(ex => (
                <tr 
                  key={ex.id}
                  onClick={() => onSelectExercise(ex.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider ${ex.type === 'HLD' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-teal-500/10 text-teal-500 border-teal-500/20'}`}>
                      {ex.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">
                    {ex.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(ex.status)}`}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${getDifficultyColor(ex.difficulty)}`}>{ex.difficulty}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:flex flex-wrap gap-1">
                    {ex.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {tag}
                      </span>
                    ))}
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
