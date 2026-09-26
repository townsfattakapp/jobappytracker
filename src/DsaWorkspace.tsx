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

export default function DsaWorkspace({
  problems,
  attemptSummaries = [],
  revisionItems = [],
  leetCodeConfig,
  setLeetCodeConfig,
  setDsaProblems,
  onSelectProblem
}: DsaWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPattern, setSelectedPattern] = useState<string>('All')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterLeetCode, setFilterLeetCode] = useState<string>('All')
  const [curatedTrack, setCuratedTrack] = useState<'All' | 'Blind75' | 'NeedReview' | 'LC'>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedBlueprintPattern, setSelectedBlueprintPattern] = useState<string | null>(null)

  // Extract all unique patterns from problems
  const patterns = useMemo(() => {
    const pSet = new Set<string>()
    problems.forEach(p => {
      if (p.pattern) pSet.add(p.pattern)
      else if (p.tags && p.tags.length > 0) pSet.add(p.tags[0])
    })
    return ['All', ...Array.from(pSet).sort()]
  }, [problems])

  // Pattern mastery metrics
  const patternStats = useMemo(() => {
    const map = new Map<string, { total: number; solved: number }>()
    problems.forEach(p => {
      const pat = p.pattern || (p.tags && p.tags[0]) || 'General'
      if (!map.has(pat)) map.set(pat, { total: 0, solved: 0 })
      const s = map.get(pat)!
      s.total++
      if (p.status === 'Solved' || p.leetCodeStatus === 'Accepted') s.solved++
    })
    return map
  }, [problems])

  // Revision problem IDs
  const revisionProblemIds = useMemo(() => {
    const now = new Date().toISOString()
    return new Set(
      revisionItems
        .filter(r => r.entityType === 'DSA' && r.dueDate <= now)
        .map(r => r.entityId)
    )
  }, [revisionItems])

  // Filtering
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const pat = p.pattern || (p.tags && p.tags[0]) || 'General'
      
      // Curated Tracks
      if (curatedTrack === 'NeedReview' && !revisionProblemIds.has(p.id)) return false
      if (curatedTrack === 'LC' && p.leetCodeStatus !== 'Accepted') return false

      // Search query (title, tags, companies)
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = p.title.toLowerCase().includes(q)
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q))
        const matchesPattern = pat.toLowerCase().includes(q)
        const matchesCompany = (p.companies || []).some(c => c.toLowerCase().includes(q))
        if (!matchesTitle && !matchesTags && !matchesPattern && !matchesCompany) return false
      }

      // Pattern Filter
      if (selectedPattern !== 'All' && pat !== selectedPattern) return false

      // Difficulty Filter
      if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) return false

      // Status Filter
      if (filterStatus !== 'All' && p.status !== filterStatus) return false

      // LeetCode Filter
      if (filterLeetCode === 'Accepted' && p.leetCodeStatus !== 'Accepted') return false
      if (filterLeetCode === 'Unsynced' && p.leetCodeStatus === 'Accepted') return false

      return true
    })
  }, [problems, selectedPattern, filterDifficulty, filterStatus, filterLeetCode, curatedTrack, searchQuery, revisionProblemIds])

  // Overall statistics
  const stats = useMemo(() => {
    const total = problems.length
    const solved = problems.filter(p => p.status === 'Solved').length
    const lcAccepted = problems.filter(p => p.leetCodeStatus === 'Accepted').length
    const patternsPracticed = Array.from(patternStats.values()).filter(s => s.solved > 0).length
    const totalPatterns = patternStats.size
    const attemptsCount = attemptSummaries.length
    return {
      total,
      solved,
      lcAccepted,
      patternsPracticed,
      totalPatterns,
      attemptsCount,
      percentSolved: total > 0 ? Math.round((solved / total) * 100) : 0
    }
  }, [problems, patternStats, attemptSummaries])

  const getProblemStatusColor = (status: string) => {
    switch (status) {
      case 'Solved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Attempted': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'Hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  // Active blueprint for modal
  const activeBlueprint = useMemo(() => {
    if (!selectedBlueprintPattern) return null
    const matched = problems.find(p => (p.pattern || (p.tags && p.tags[0])) === selectedBlueprintPattern)
    return {
      pattern: selectedBlueprintPattern,
      blueprint: matched?.patternBlueprint || {
        whenToUse: 'Look for core mathematical invariants, sorted sequences, or monotonic intervals.',
        coreTemplate: '// Standard canonical template\nwhile (left < right) { ... }',
        pitfalls: 'Mind boundary checks and null pointers.'
      }
    }
  }, [selectedBlueprintPattern, problems])

  return (
    <div className="animate-rise flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Pattern-Mastery Curriculum
            </span>
            <span className="text-xs text-muted-foreground">• 50+ High-Frequency Interview Problems</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Algorithms & Data Structures
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Master 18 core algorithmic patterns, track structured attempts with complexity analysis, and sync your live LeetCode submissions.
          </p>
        </div>

        {/* Global Progress Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="surface rounded-xl p-3 border border-border flex flex-col min-w-[110px]">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Solved</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-foreground leading-none">{stats.solved}</span>
              <span className="text-xs text-muted-foreground">/{stats.total}</span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${stats.percentSolved}%` }} />
            </div>
          </div>

          <div className="surface rounded-xl p-3 border border-border flex flex-col min-w-[110px]">
            <span className="text-[11px] text-amber-500 font-medium uppercase tracking-wider flex items-center gap-1">
              <span>LC Accepted</span>
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-amber-500 leading-none">{stats.lcAccepted}</span>
              <span className="text-xs text-muted-foreground">verified</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-2">
              {leetCodeConfig.username ? `@${leetCodeConfig.username}` : 'Not connected'}
            </span>
          </div>

          <div className="surface rounded-xl p-3 border border-border flex flex-col min-w-[110px]">
            <span className="text-[11px] text-primary font-medium uppercase tracking-wider">Patterns</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-primary leading-none">{stats.patternsPracticed}</span>
              <span className="text-xs text-muted-foreground">/{stats.totalPatterns}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-2">
              {Math.round((stats.patternsPracticed / Math.max(1, stats.totalPatterns)) * 100)}% covered
            </span>
          </div>

          <div className="surface rounded-xl p-3 border border-border flex flex-col min-w-[110px]">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Attempts</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-foreground leading-none">{stats.attemptsCount}</span>
              <span className="text-xs text-muted-foreground">logged</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-2">
              {revisionProblemIds.size > 0 ? `⚠️ ${revisionProblemIds.size} due review` : 'All caught up'}
            </span>
          </div>
        </div>
      </div>

      {/* LeetCode Sync Integration Hub */}
      <LeetCodeConnect 
        config={leetCodeConfig}
        setConfig={setLeetCodeConfig}
        problems={problems}
        setProblems={setDsaProblems}
      />

      {/* Pattern Mastery Selector Carousel */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Algorithmic Patterns</h2>
            <span className="text-xs text-muted-foreground">Select a pattern to filter or view its blueprint</span>
          </div>
          {selectedPattern !== 'All' && (
            <button
              onClick={() => setSelectedBlueprintPattern(selectedPattern)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              📖 View {selectedPattern} Blueprint
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {patterns.map(pat => {
            const isSelected = selectedPattern === pat
            const pStat = pat === 'All' ? null : patternStats.get(pat)
            const pPct = pStat && pStat.total > 0 ? Math.round((pStat.solved / pStat.total) * 100) : 0

            return (
              <button
                key={pat}
                onClick={() => setSelectedPattern(pat)}
                className={`snap-start shrink-0 px-3.5 py-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  isSelected 
                    ? 'bg-primary/10 border-primary text-foreground shadow-sm shadow-primary/10 ring-1 ring-primary/30' 
                    : 'surface border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2 justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {pat === 'All' ? '⚡ All Patterns' : pat}
                  </span>
                  {pStat && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      {pStat.solved}/{pStat.total}
                    </span>
                  )}
                </div>
                {pStat && (
                  <div className="w-28 bg-muted/60 h-1 rounded-full overflow-hidden mt-0.5">
                    <div 
                      className={`h-full rounded-full transition-all ${pPct === 100 ? 'bg-emerald-500' : isSelected ? 'bg-primary' : 'bg-muted-foreground/60'}`} 
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface rounded-2xl p-4 sm:p-5 border border-border flex flex-col gap-4">
        {/* Curated Track Presets */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border/60">
          <span className="text-xs text-muted-foreground font-medium mr-1">Curated Presets:</span>
          <button
            onClick={() => setCuratedTrack('All')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
              curatedTrack === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            All ({problems.length})
          </button>
          <button
            onClick={() => setCuratedTrack('LC')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              curatedTrack === 'LC' ? 'bg-amber-500 text-white border-amber-500' : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <span>LC Accepted ({stats.lcAccepted})</span>
          </button>
          <button
            onClick={() => setCuratedTrack('NeedReview')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
              curatedTrack === 'NeedReview' ? 'bg-rose-500 text-white border-rose-500' : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <span>Due for Spaced Review ({revisionProblemIds.size})</span>
          </button>
        </div>

        {/* Search & Dynamic Selectors */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="w-full xl:w-96 relative group flex items-center">
            <svg className="w-5 h-5 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search problem, pattern, or company (e.g. Google, Tree)..." 
              className="input-field !pl-10 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            <select 
              className="input-field max-w-[140px] text-xs h-9 py-1"
              value={filterDifficulty} 
              onChange={e => setFilterDifficulty(e.target.value)}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select 
              className="input-field max-w-[140px] text-xs h-9 py-1"
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Unattempted">Unattempted</option>
              <option value="Attempted">Attempted</option>
              <option value="Solved">Solved</option>
            </select>

            <select 
              className="input-field max-w-[140px] text-xs h-9 py-1"
              value={filterLeetCode} 
              onChange={e => setFilterLeetCode(e.target.value)}
            >
              <option value="All">LeetCode Sync</option>
              <option value="Accepted">Accepted on LC</option>
              <option value="Unsynced">Unsynced</option>
            </select>
            
            {/* Grid / List Switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg ml-auto xl:ml-2 border border-border">
              <button 
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Problems Display */}
      {filteredProblems.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
          <span className="text-4xl">🔍</span>
          <p className="font-semibold text-foreground">No problems found matching your criteria.</p>
          <p className="text-xs max-w-sm">Try clearing your search query or selecting "All Patterns".</p>
          <button 
            onClick={() => {
              setSearchQuery('')
              setSelectedPattern('All')
              setFilterDifficulty('All')
              setFilterStatus('All')
              setFilterLeetCode('All')
              setCuratedTrack('All')
            }}
            className="btn btn-secondary text-xs mt-2"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map(p => {
            const pat = p.pattern || (p.tags && p.tags[0]) || 'General'
            const isDueRevision = revisionProblemIds.has(p.id)

            return (
              <div 
                key={p.id} 
                className="surface rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all border border-border group relative overflow-hidden"
                onClick={() => onSelectProblem(p.id)}
              >
                {/* Top Badge Row */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {pat}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.leetCodeStatus === 'Accepted' && (
                      <span className="text-[10px] font-bold bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1" title="Verified Accepted on LeetCode">
                        <span>LC</span>
                        <span>✓</span>
                      </span>
                    )}
                    {isDueRevision && (
                      <span className="text-[10px] font-bold bg-rose-500/15 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/30" title="Due for spaced repetition review">
                        Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Title & Preview */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Companies Tags */}
                {p.companies && p.companies.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-muted-foreground">Asked at:</span>
                    {p.companies.slice(0, 3).map(c => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">
                        {c}
                      </span>
                    ))}
                    {p.companies.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{p.companies.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Bottom Status & Solve CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto text-xs">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getProblemStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                  <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Solve Studio →
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List / High-Density Table View */
        <div className="surface rounded-2xl overflow-hidden border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Problem</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Pattern</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Asked By</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProblems.map(p => {
                const pat = p.pattern || (p.tags && p.tags[0]) || 'General'

                return (
                  <tr 
                    key={p.id}
                    onClick={() => onSelectProblem(p.id)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{p.title}</span>
                        {p.leetCodeStatus === 'Accepted' && (
                          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">LC ✓</span>
                        )}
                        {revisionProblemIds.has(p.id) && (
                          <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/20">Review</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {pat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getProblemStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(p.companies || []).slice(0, 2).map(c => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-semibold text-primary group-hover:underline">
                        Open Studio →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pattern Blueprint Modal */}
      {activeBlueprint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface rounded-2xl max-w-2xl w-full border border-border shadow-2xl p-6 flex flex-col gap-5 animate-rise max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Algorithmic Blueprint</span>
                <h3 className="text-2xl font-bold font-display text-foreground">{activeBlueprint.pattern}</h3>
              </div>
              <button 
                onClick={() => setSelectedBlueprintPattern(null)}
                className="btn btn-ghost p-1.5 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm text-foreground">
              <div className="flex flex-col gap-1.5 bg-muted/40 p-4 rounded-xl border border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">💡 When to Recognize & Use</span>
                <p className="leading-relaxed">{activeBlueprint.blueprint.whenToUse}</p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">⚙️ Canonical Invariant / Template</span>
                <pre className="bg-muted p-4 rounded-xl text-xs font-mono overflow-x-auto text-foreground/90 border border-border">
                  {activeBlueprint.blueprint.coreTemplate}
                </pre>
              </div>

              <div className="flex flex-col gap-1.5 bg-destructive/5 p-4 rounded-xl border border-destructive/20 text-destructive">
                <span className="text-xs font-bold uppercase tracking-wider">⚠️ Common Interview Pitfalls & Edge Cases</span>
                <p className="text-xs leading-relaxed text-destructive/90">{activeBlueprint.blueprint.pitfalls}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button 
                onClick={() => setSelectedBlueprintPattern(null)}
                className="btn btn-primary text-xs px-4"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
