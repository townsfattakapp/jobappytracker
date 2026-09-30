import { useState, useMemo, useEffect } from 'react'
import {
  Building2,
  Search,
  Globe,
  MapPin,
  Star,
  Copy,
  Check,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  X,
  List,
  LayoutGrid,
} from 'lucide-react'
import { COMPANY_CATALOG, type CatalogCompany } from './data/companyCatalog'
import CompanyLogo from './components/jobs/CompanyLogo'
import type { AppUser } from './lib/cloudSync'
import type { ViewMode } from './Sidebar'

interface EnterprisePortalsWorkspaceProps {
  user: AppUser | null
  isSubscribed?: boolean
  onNavigate: (view: ViewMode) => void
  onToast: (msg: string) => void
  onSignIn: () => void
  onUpgrade: () => void
  onAddToTracker?: (companyName: string, careersUrl: string) => void
}

type IndustryCategory =
  | 'all'
  | 'big-tech'
  | 'cloud-saas'
  | 'fintech'
  | 'consulting-it'
  | 'semiconductors'
  | 'industrial-iot'

interface CategoryDef {
  id: IndustryCategory
  label: string
  icon: string
  hint: string
}

const CATEGORIES: CategoryDef[] = [
  { id: 'all', label: 'All Portals', icon: '🏢', hint: 'Browse all 300+ direct corporate career portals' },
  { id: 'big-tech', label: 'FAANG & Big Tech', icon: '🚀', hint: 'Google, Microsoft, Amazon, Apple, Meta, Netflix' },
  { id: 'cloud-saas', label: 'Enterprise Cloud & SaaS', icon: '☁️', hint: 'Salesforce, SAP, Oracle, ServiceNow, Adobe, Workday, Snowflake' },
  { id: 'fintech', label: 'Fintech & Banking', icon: '💳', hint: 'Goldman Sachs, Morgan Stanley, JP Morgan, Visa, PayPal, AmEx' },
  { id: 'consulting-it', label: 'IT Services & Consulting', icon: '💼', hint: 'TCS, Infosys, Wipro, Accenture, Cognizant, Deloitte, Capgemini' },
  { id: 'semiconductors', label: 'Semiconductors & AI', icon: '⚡', hint: 'NVIDIA, Qualcomm, Intel, AMD, Cisco, Synopsys, Broadcom' },
  { id: 'industrial-iot', label: 'Industrial & Smart Tech', icon: '🏭', hint: 'Siemens, Honeywell, Bosch, Schneider Electric, Caterpillar' },
]

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function matchesCategory(c: CatalogCompany, cat: IndustryCategory): boolean {
  if (cat === 'all') return true

  const text = `${c.name} ${c.industry} ${c.slug}`.toLowerCase()

  if (cat === 'big-tech') {
    return ['microsoft', 'google', 'apple', 'amazon', 'meta', 'netflix', 'adobe', 'salesforce'].some(
      (k) => c.slug.includes(k) || text.includes(k),
    )
  }
  if (cat === 'cloud-saas') {
    return (
      text.includes('cloud') ||
      text.includes('saas') ||
      text.includes('enterprise') ||
      text.includes('crm') ||
      text.includes('erp') ||
      text.includes('software') ||
      ['salesforce', 'sap', 'oracle', 'servicenow', 'adobe', 'workday', 'snowflake', 'databricks', 'atlassian'].some((k) =>
        c.slug.includes(k),
      )
    )
  }
  if (cat === 'fintech') {
    return (
      text.includes('fintech') ||
      text.includes('bank') ||
      text.includes('payment') ||
      text.includes('invest') ||
      text.includes('finance') ||
      ['goldman', 'morgan', 'paypal', 'visa', 'mastercard', 'american express', 'jpmorgan', 'barclays'].some((k) =>
        text.includes(k),
      )
    )
  }
  if (cat === 'consulting-it') {
    return (
      text.includes('consulting') ||
      text.includes('it services') ||
      text.includes('digital transformation') ||
      ['tcs', 'infosys', 'wipro', 'accenture', 'cognizant', 'hcl', 'capgemini', 'deloitte', 'kpmg', 'pwc', 'ey'].some((k) =>
        text.includes(k),
      )
    )
  }
  if (cat === 'semiconductors') {
    return (
      text.includes('semiconductor') ||
      text.includes('chip') ||
      text.includes('hardware') ||
      text.includes('electronic design') ||
      ['nvidia', 'qualcomm', 'intel', 'amd', 'cisco', 'synopsys', 'broadcom', 'texas instruments', 'micron'].some((k) =>
        text.includes(k),
      )
    )
  }
  if (cat === 'industrial-iot') {
    return (
      text.includes('industrial') ||
      text.includes('automation') ||
      text.includes('iot') ||
      text.includes('energy') ||
      text.includes('automotive') ||
      ['siemens', 'honeywell', 'bosch', 'schneider', 'caterpillar', 'dupont', 'ge'].some((k) => text.includes(k))
    )
  }

  return true
}

export default function EnterprisePortalsWorkspace({
  user: _user,
  isSubscribed: _isSubscribed,
  onNavigate,
  onToast,
  onSignIn: _onSignIn,
  onUpgrade: _onUpgrade,
  onAddToTracker,
}: EnterprisePortalsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IndustryCategory>('all')
  const [locationFilter, setLocationFilter] = useState<'all' | 'india' | 'global'>('all')
  const [sortBy, setSortBy] = useState<'featured' | 'az' | 'za' | 'industry'>('featured')
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Starred / Favorite portals persisted in localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('prep-starred-portals')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('prep-starred-portals', JSON.stringify(Array.from(favorites)))
    } catch {}
  }, [favorites])

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
        onToast('Removed from target companies')
      } else {
        next.add(slug)
        onToast('Added to your target companies ★')
      }
      return next
    })
  }

  const handleCopyLink = (c: CatalogCompany) => {
    const url = c.careersUrl || c.website || ''
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url)
      setCopiedSlug(c.slug)
      onToast(`Copied ${c.name} careers portal link!`)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    return COMPANY_CATALOG.filter((c) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = c.name.toLowerCase().includes(q)
        const matchIndustry = c.industry.toLowerCase().includes(q)
        const matchHq = c.headquarters.toLowerCase().includes(q)
        const matchSlug = c.slug.toLowerCase().includes(q)
        const matchUrl = (c.careersUrl || '').toLowerCase().includes(q)
        if (!matchName && !matchIndustry && !matchHq && !matchSlug && !matchUrl) {
          return false
        }
      }

      // 2. Category
      if (!matchesCategory(c, selectedCategory)) {
        return false
      }

      // 3. Location
      if (locationFilter === 'india') {
        const hq = c.headquarters.toLowerCase()
        const isIndia =
          c.indiaRelevance === 'strong' ||
          hq.includes('india') ||
          hq.includes('bengaluru') ||
          hq.includes('hyderabad') ||
          hq.includes('pune') ||
          hq.includes('gurugram') ||
          hq.includes('chennai') ||
          hq.includes('noida') ||
          hq.includes('mumbai')
        if (!isIndia) return false
      } else if (locationFilter === 'global') {
        if (c.indiaRelevance === 'strong' && !c.headquarters.includes('US') && !c.headquarters.includes('UK') && !c.headquarters.includes('DE') && !c.headquarters.includes('FR')) {
          return false
        }
      }

      // 4. Letter Filter
      if (activeLetter) {
        const first = c.name.charAt(0).toUpperCase()
        if (activeLetter === '#') {
          if (/^[A-Z]$/i.test(first)) return false
        } else {
          if (first !== activeLetter) return false
        }
      }

      // 5. Starred filter
      if (onlyFavorites && !favorites.has(c.slug)) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name)
      if (sortBy === 'za') return b.name.localeCompare(a.name)
      if (sortBy === 'industry') return a.industry.localeCompare(b.industry) || a.name.localeCompare(b.name)
      // Default: 'featured' -> favorites first, then strong India relevance, then alphabetical
      const aFav = favorites.has(a.slug) ? 1 : 0
      const bFav = favorites.has(b.slug) ? 1 : 0
      if (aFav !== bFav) return bFav - aFav

      const aIndia = a.indiaRelevance === 'strong' ? 1 : 0
      const bIndia = b.indiaRelevance === 'strong' ? 1 : 0
      if (aIndia !== bIndia) return bIndia - aIndia

      return a.name.localeCompare(b.name)
    })
  }, [searchQuery, selectedCategory, locationFilter, activeLetter, onlyFavorites, favorites, sortBy])

  // Count stats
  const totalCount = COMPANY_CATALOG.length
  const indiaCount = useMemo(() => {
    return COMPANY_CATALOG.filter(
      (c) =>
        c.indiaRelevance === 'strong' ||
        c.headquarters.toLowerCase().includes('india') ||
        c.headquarters.toLowerCase().includes('bengaluru') ||
        c.headquarters.toLowerCase().includes('hyderabad'),
    ).length
  }, [])

  return (
    <div className="enterprise-portals-workspace w-full min-w-0 space-y-5 sm:space-y-6">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4 sm:pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Briefcase size={13} />
              <span>Job Discovery</span>
            </button>
            <span>/</span>
            <span className="text-primary font-bold flex items-center gap-1">
              <Building2 size={13} />
              <span>Direct Enterprise Portals</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span>Direct Enterprise Career Portals</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              Verified Directory
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mt-1.5 leading-relaxed">
            Apply directly at the source. Access official corporate career portals of 300+ Fortune 500 tech leaders,
            product companies, and Global Capability Centers (GCCs) without aggregator delays or agency middlemen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="btn btn-ghost btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <Briefcase size={14} />
            <span>Search Live Postings</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('referrals')}
            className="btn btn-primary btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <span>Ask for Referral</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-2.5 sm:p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">{totalCount}+</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Official Portals</div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Globe size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">{indiaCount}+</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">India Hubs & GCCs</div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">100% Direct</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Zero Middlemen</div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Star size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">{favorites.size}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Target Companies</div>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Control Panel */}
      <div className="bg-card border border-border/70 rounded-2xl p-3 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
        {/* Top Search & Layout Toggle Bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, tech, industry, or city (e.g. Google, Cloud, Bengaluru)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border/70 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Location Filter Segments */}
            <div className="inline-flex w-full sm:w-auto rounded-xl p-1 bg-muted/60 border border-border/50 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setLocationFilter('all')}
                className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-medium text-center transition-all ${
                  locationFilter === 'all'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Regions
              </button>
              <button
                type="button"
                onClick={() => setLocationFilter('india')}
                className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-medium text-center transition-all flex items-center justify-center gap-1 ${
                  locationFilter === 'india'
                    ? 'bg-background text-primary shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🇮🇳 India Hubs</span>
              </button>
              <button
                type="button"
                onClick={() => setLocationFilter('global')}
                className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-medium text-center transition-all ${
                  locationFilter === 'global'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Global HQs
              </button>
            </div>

            {/* Target Starred Toggle */}
            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                onlyFavorites
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-background text-muted-foreground border-border/60 hover:text-foreground'
              }`}
              title="Show only starred target companies"
            >
              <Star size={14} className={onlyFavorites ? 'fill-amber-500' : ''} />
              <span>Target List</span>
              <span className="px-1.5 py-0.2 rounded-full bg-muted text-[10px]">{favorites.size}</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-initial py-2 px-2.5 rounded-xl bg-background border border-border/60 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Sort enterprise portals"
            >
              <option value="featured">Featured & Relevant</option>
              <option value="az">Name (A → Z)</option>
              <option value="za">Name (Z → A)</option>
              <option value="industry">By Industry</option>
            </select>

            {/* View Layout Toggle */}
            <div className="inline-flex max-w-full rounded-xl p-1 bg-muted/60 border border-border/50 shrink-0">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'list' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar -mx-1 px-1 touch-pan-x scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                title={cat.hint}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* A-Z Quick Letter Jump Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-1 border-t border-border/40 text-xs font-mono text-muted-foreground custom-scrollbar -mx-1 px-1 touch-pan-x scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveLetter(null)}
            className={`shrink-0 h-7 px-2.5 rounded-lg transition-colors font-sans text-xs font-semibold ${
              activeLetter === null ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 hover:text-foreground hover:bg-muted'
            }`}
          >
            ALL
          </button>
          {ALPHABET.map((letter) => {
            const isActive = activeLetter === letter
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setActiveLetter(isActive ? null : letter)}
                className={`shrink-0 min-w-[28px] h-7 px-1.5 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'hover:text-foreground hover:bg-muted'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Meta Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground px-1">
        <div className="leading-relaxed">
          Showing <strong className="text-foreground font-semibold">{filteredCompanies.length}</strong> enterprise career portals
          {searchQuery && (
            <span>
              {' '}
              matching &ldquo;<span className="text-foreground">{searchQuery}</span>&rdquo;
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span>
              {' '}
              in <span className="text-foreground">{CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
            </span>
          )}
          {locationFilter === 'india' && <span> with active India operations</span>}
          {locationFilter === 'global' && <span> with global headquarters</span>}
          {activeLetter && (
            <span>
              {' '}
              starting with <strong className="text-foreground font-bold">{activeLetter}</strong>
            </span>
          )}
          {onlyFavorites && <span> in your target list</span>}
        </div>

        {(searchQuery || selectedCategory !== 'all' || locationFilter !== 'all' || activeLetter || onlyFavorites) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setLocationFilter('all')
              setActiveLetter(null)
              setOnlyFavorites(false)
            }}
            className="text-primary hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            <span>Reset filters</span>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Companies Directory: Grid or List */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
            <Building2 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No enterprise portals found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any companies matching your current search or filters. Try adjusting your keywords or reset all filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setLocationFilter('all')
              setActiveLetter(null)
              setOnlyFavorites(false)
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredCompanies.map((c) => {
            const isFav = favorites.has(c.slug)
            let displayDomain = ''
            try {
              const targetUrl = c.careersUrl || c.website || ''
              if (targetUrl) {
                displayDomain = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname.replace(
                  /^www\./,
                  '',
                )
              }
            } catch {
              displayDomain = 'Official Portal'
            }

            return (
              <div
                key={c.slug}
                className="bg-card border border-border/70 hover:border-primary/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between group relative min-w-0"
              >
                <div>
                  {/* Card Header: Logo, Name, Domain & Star */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                      <CompanyLogo company={c} size={40} className="rounded-xl shadow-xs shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-base text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                            {c.name}
                          </h3>
                          <span
                            className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap"
                            title="Official verified career portal"
                          >
                            ✓ Official
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                          <Globe size={11} className="opacity-70 shrink-0" />
                          <span className="truncate">{displayDomain}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bookmark Star Button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(c.slug)}
                      className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                        isFav
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-muted/40 text-muted-foreground/60 border-transparent hover:text-foreground hover:bg-muted'
                      }`}
                      title={isFav ? 'Remove target company' : 'Add to target companies'}
                      aria-label="Toggle target company"
                    >
                      <Star size={16} className={isFav ? 'fill-amber-500' : ''} />
                    </button>
                  </div>

                  {/* Industry & Location Tags */}
                  <div className="mt-3 sm:mt-3.5 space-y-1.5">
                    {c.industry && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/50 truncate max-w-full">
                          {c.industry}
                        </span>
                      </div>
                    )}
                    {c.headquarters && (
                      <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <MapPin size={12} className="opacity-70 mt-0.5 shrink-0" />
                        <span className="text-[11px] line-clamp-2 leading-relaxed">{c.headquarters}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-3.5 sm:mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(c)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      title="Copy official careers portal link"
                      aria-label="Copy portal link"
                    >
                      {copiedSlug === c.slug ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                    {onAddToTracker && (
                      <button
                        type="button"
                        onClick={() => onAddToTracker(c.name, c.careersUrl || c.website || '')}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                        title="Add target application to tracker"
                        aria-label="Add to tracker"
                      >
                        <Briefcase size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('referrals')
                        onToast(`Looking for referrals at ${c.name}...`)
                      }}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                      title="Request an internal referral for this company"
                    >
                      Referral 🤝
                    </button>
                  </div>

                  <a
                    href={c.careersUrl || c.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs shrink-0 ml-auto sm:ml-0"
                    title={`Open ${c.name} official careers portal`}
                  >
                    <span>Open Portal</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List / Directory Layout */
        <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 w-10">★</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Locations & Centers</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredCompanies.map((c) => {
                  const isFav = favorites.has(c.slug)
                  return (
                    <tr key={c.slug} className="hover:bg-muted/40 transition-colors group">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(c.slug)}
                          className={`p-1 rounded transition-colors ${
                            isFav ? 'text-amber-500' : 'text-muted-foreground/40 hover:text-foreground'
                          }`}
                        >
                          <Star size={15} className={isFav ? 'fill-amber-500' : ''} />
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <CompanyLogo company={c} size={30} className="rounded-lg shadow-xs shrink-0" />
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{c.name}</span>
                              <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                Official
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground font-normal">
                              {c.careersUrl?.replace(/^https?:\/\//, '').split('/')[0]}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-medium text-foreground/80 border border-border/40">
                          {c.industry}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate" title={c.headquarters}>
                        {c.headquarters}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate('referrals')
                              onToast(`Looking for referrals at ${c.name}...`)
                            }}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            Referral 🤝
                          </button>
                          <a
                            href={c.careersUrl || c.website || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            <span>Open ↗</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
