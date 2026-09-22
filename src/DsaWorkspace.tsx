import { useState, useMemo } from 'react'
import type { DsaProblem, DsaAttemptSummary, RevisionItem, LeetCodeConfig } from './types'
import LeetCodeConnect from './components/LeetCodeConnect'

interface DsaWorkspaceProps {
  problems: DsaProblem[]
  attemptSummaries: DsaAttemptSummary[]
  revisionItems: RevisionItem[]
  leetCodeConfig: LeetCodeConfig
  setLeetCodeConfig: (c: LeetCodeConfig) => void
  setDsaProblems: (p: DsaProblem[]) => void
  onSelectProblem: (problemId: string) => void
}

export default function DsaWorkspace({ problems, leetCodeConfig, setLeetCodeConfig, setDsaProblems, onSelectProblem }: DsaWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTopic, setFilterTopic] = useState<string>('All')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const topics = useMemo(() => {
    const t = new Set<string>()
    problems.forEach(p => p.tags.forEach(tag => t.add(tag)))
    return ['All', ...Array.from(t).sort()]
  }, [problems])

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterTopic !== 'All' && !p.tags.includes(filterTopic)) return false
      if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) return false
      if (filterStatus !== 'All' && p.status !== filterStatus) return false
      return true
    })
  }, [problems, filterTopic, filterDifficulty, filterStatus, searchQuery])

  const stats = useMemo(() => {
    const total = problems.length
    const solved = problems.filter(p => p.status === 'Solved').length
    const lcAccepted = problems.filter(p => p.leetCodeStatus === 'Accepted').length
    return { total, solved, lcAccepted }
  }, [problems])

  const getProblemStatusColor = (status: string) => {
    switch (status) {
      case 'Solved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Attempted': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500'
      case 'Medium': return 'text-amber-500'
      case 'Hard': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="animate-rise flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Algorithms & Data Structures</h1>
          <p className="text-muted-foreground">Master patterns, log attempts, and integrate with LeetCode.</p>
        </div>
        
        <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Local Solved</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats.solved}<span className="text-sm text-muted-foreground font-medium">/{stats.total}</span></span>
          </div>
          <div className="w-px h-10 bg-border mx-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-amber-500 font-medium uppercase tracking-wider mb-1">LC Accepted</span>
            <span className="text-2xl font-bold text-foreground leading-none">{stats.lcAccepted}</span>
          </div>
        </div>
      </div>

      <LeetCodeConnect 
        config={leetCodeConfig}
        setConfig={setLeetCodeConfig}
        problems={problems}
        setProblems={setDsaProblems}
      />

      <div className="surface rounded-2xl p-4 sm:p-5 border border-border flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="w-full xl:w-96 relative group flex items-center">
          <svg className="w-5 h-5 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search problems..." 
            className="input-field !pl-10 w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select className="input-field max-w-[160px]" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
            {topics.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
          </select>
          <select className="input-field max-w-[140px]" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
            <option value="All">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select className="input-field max-w-[140px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">Status</option>
            <option value="Unattempted">Unattempted</option>
            <option value="Attempted">Attempted</option>
            <option value="Solved">Solved</option>
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

      {filteredProblems.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
          <span className="text-3xl mb-4 block">🔍</span>
          No problems found matching your filters.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map(p => (
            <div 
              key={p.id} 
              className="surface rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all border border-border group"
              onClick={() => onSelectProblem(p.id)}
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                  {p.title}
                </h3>
                {p.leetCodeStatus === 'Accepted' && (
                  <span className="shrink-0 text-[10px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20" title="Accepted on LeetCode">LC ✓</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={getDifficultyColor(p.difficulty)}>{p.difficulty}</span>
                <span className="text-muted-foreground">•</span>
                <span className={`px-2 py-0.5 rounded-full border ${getProblemStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
                {p.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                    {tag}
                  </span>
                ))}
                {p.tags.length > 3 && (
                  <span className="text-[10px] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground font-medium">
                    +{p.tags.length - 3}
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
                <th className="px-6 py-4 font-medium text-muted-foreground">Problem</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Difficulty</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground hidden md:table-cell">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProblems.map(p => (
                <tr 
                  key={p.id}
                  onClick={() => onSelectProblem(p.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                    {p.title}
                    {p.leetCodeStatus === 'Accepted' && (
                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20" title="Accepted on LeetCode">LC ✓</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${getDifficultyColor(p.difficulty)}`}>{p.difficulty}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getProblemStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map(tag => (
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
