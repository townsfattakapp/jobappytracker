import { useState, useMemo } from 'react'
import type { EngineeringLab, LabAttemptSummary } from './types'

interface LabWorkspaceProps {
  labs: EngineeringLab[]
  attemptSummaries: LabAttemptSummary[]
  onSelectLab: (labId: string) => void
}

export default function LabWorkspace({ labs, onSelectLab }: LabWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      if (searchQuery && !lab.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterDifficulty !== 'All' && lab.difficulty !== filterDifficulty) return false
      if (filterStatus !== 'All' && lab.status !== filterStatus) return false
      return true
    })
  }, [labs, filterDifficulty, filterStatus, searchQuery])

  const stats = useMemo(() => {
    const total = labs.length
    const done = labs.filter(l => l.status === 'Done').length
    const inProgress = labs.filter(l => l.status === 'In Progress' || l.status === 'In Review').length
    return { total, done, inProgress }
  }, [labs])

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-emerald-500'
      case 'Intermediate': return 'text-amber-500'
      case 'Advanced': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'In Review': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="animate-rise flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Engineering Labs</h1>
          <p className="text-muted-foreground">Realistic simulations for debugging, architecture, and deployment.</p>
        </div>
        
        <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Completed</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats.done}<span className="text-sm text-muted-foreground font-medium">/{stats.total}</span></span>
          </div>
          <div className="w-px h-10 bg-border mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-amber-500 font-medium uppercase tracking-wider mb-1">In Progress</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats.inProgress}</span>
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
            placeholder="Search tickets..." 
            className="input-field !pl-10 w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select className="input-field max-w-[150px]" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
            <option value="All">Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          
          <select className="input-field max-w-[150px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
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

      {filteredLabs.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
          <span className="text-3xl mb-4 block">🎫</span>
          No tickets found matching your filters.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredLabs.map(lab => (
            <div 
              key={lab.id} 
              className="surface rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all border border-border group"
              onClick={() => onSelectLab(lab.id)}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded tracking-widest uppercase">{lab.ticketId}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusBadge(lab.status)}`}>
                  {lab.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{lab.title}</h3>

              <div className="flex items-center gap-2 text-xs font-medium mt-auto pt-2">
                <span className={getDifficultyColor(lab.difficulty)}>{lab.difficulty}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">⏱️ {lab.estDurationMinutes}m</span>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-border/50 pt-3 mt-1">
                {lab.techStack.slice(0, 3).map(tech => (
                  <span key={tech} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                    {tech}
                  </span>
                ))}
                {lab.techStack.length > 3 && (
                  <span className="text-[10px] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground font-medium">
                    +{lab.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface rounded-2xl overflow-hidden border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Ticket</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Title</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Difficulty</th>
                <th className="px-6 py-4 font-medium text-muted-foreground hidden md:table-cell">Stack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLabs.map(lab => (
                <tr 
                  key={lab.id}
                  onClick={() => onSelectLab(lab.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded tracking-widest uppercase">
                      {lab.ticketId}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">
                    {lab.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusBadge(lab.status)}`}>
                      {lab.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${getDifficultyColor(lab.difficulty)}`}>{lab.difficulty}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:flex flex-wrap gap-1">
                    {lab.techStack.slice(0, 2).map(tech => (
                      <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {tech}
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
