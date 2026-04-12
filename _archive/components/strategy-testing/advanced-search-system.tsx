"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  X,
  Star,
  ArrowRight,
  Command,
  Hash,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Search result types
export interface SearchResult {
  id: string
  title: string
  description: string
  category: 'strategy' | 'performance' | 'data' | 'settings' | 'ai' | 'chart' | 'analysis'
  type: 'navigation' | 'data' | 'action' | 'insight'
  path?: string
  metadata?: {
    tab?: string
    subTab?: string
    value?: string | number
    date?: string
    relevance?: number
  }
  tags?: string[]
  icon?: React.ComponentType<any>
}

// Advanced search context
interface SearchContextType {
  query: string
  setQuery: (query: string) => void
  results: SearchResult[]
  isSearching: boolean
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  searchHistory: string[]
  favorites: string[]
  addToFavorites: (query: string) => void
  executeSearch: (query: string) => Promise<SearchResult[]>
  navigateToResult: (result: SearchResult) => void
}

export interface SearchFilters {
  categories: string[]
  types: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  sortBy: 'relevance' | 'date' | 'alphabetical'
  includeHidden: boolean
}

// Mock search data - in real app this would come from your data sources
const mockSearchData: SearchResult[] = [
  // Navigation items
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    description: 'Main portfolio overview and quick actions',
    category: 'strategy',
    type: 'navigation',
    path: '/dashboard/portfolio-overview',
    metadata: { tab: 'dashboard', subTab: 'portfolio-overview' },
    tags: ['home', 'portfolio', 'overview'],
    icon: BarChart3
  },
  {
    id: 'nav-testing-lab',
    title: 'Testing Lab',
    description: 'Strategy building and backtesting environment',
    category: 'strategy',
    type: 'navigation',
    path: '/testing-lab/strategy-builder',
    metadata: { tab: 'testing-lab', subTab: 'strategy-builder' },
    tags: ['strategy', 'backtest', 'testing'],
    icon: Zap
  },
  // Performance data
  {
    id: 'perf-sharpe',
    title: 'Sharpe Ratio: 2.34',
    description: 'Current portfolio Sharpe ratio - excellent performance',
    category: 'performance',
    type: 'data',
    metadata: { value: 2.34, relevance: 0.95 },
    tags: ['performance', 'risk', 'ratio']
  },
  {
    id: 'perf-returns',
    title: 'YTD Returns: +18.6%',
    description: 'Year-to-date portfolio returns',
    category: 'performance',
    type: 'data',
    metadata: { value: 18.6, relevance: 0.92 },
    tags: ['returns', 'performance', 'ytd']
  },
  // AI insights
  {
    id: 'ai-insight-risk',
    title: 'Portfolio Risk Analysis',
    description: 'AI detected moderate risk with TSLA overweight position',
    category: 'ai',
    type: 'insight',
    metadata: { tab: 'ai-assistant', subTab: 'ai-insights' },
    tags: ['ai', 'risk', 'analysis', 'portfolio']
  },
  // Strategy data
  {
    id: 'strategy-momentum',
    title: 'Momentum Strategy',
    description: 'High-performing momentum strategy with 68% win rate',
    category: 'strategy',
    type: 'data',
    metadata: { value: 68, relevance: 0.88 },
    tags: ['strategy', 'momentum', 'performance']
  },
  // Charts and analytics
  {
    id: 'chart-equity-curve',
    title: 'Equity Curve Chart',
    description: 'Portfolio equity progression over time',
    category: 'chart',
    type: 'navigation',
    path: '/analytics/performance-dashboard',
    metadata: { tab: 'analytics', subTab: 'performance-dashboard' },
    tags: ['chart', 'equity', 'performance']
  }
]

// Search utility functions
const fuzzySearch = (query: string, text: string): number => {
  const normalizedQuery = query.toLowerCase()
  const normalizedText = text.toLowerCase()
  
  // Exact match gets highest score
  if (normalizedText.includes(normalizedQuery)) {
    return 1.0
  }
  
  // Character-by-character fuzzy matching
  let queryIndex = 0
  let textIndex = 0
  let matches = 0
  
  while (queryIndex < normalizedQuery.length && textIndex < normalizedText.length) {
    if (normalizedQuery[queryIndex] === normalizedText[textIndex]) {
      matches++
      queryIndex++
    }
    textIndex++
  }
  
  return matches / normalizedQuery.length
}

const searchItems = (query: string, items: SearchResult[], filters: SearchFilters): SearchResult[] => {
  if (!query.trim()) return []
  
  const results = items.map(item => {
    // Calculate relevance score
    const titleScore = fuzzySearch(query, item.title) * 2
    const descScore = fuzzySearch(query, item.description)
    const tagScore = item.tags?.some(tag => fuzzySearch(query, tag) > 0.7) ? 1 : 0
    
    const relevanceScore = (titleScore + descScore + tagScore) / 3
    
    return {
      ...item,
      metadata: {
        ...item.metadata,
        relevance: relevanceScore
      }
    }
  }).filter(item => {
    // Apply filters
    const passesRelevance = (item.metadata?.relevance ?? 0) > 0.1
    const passesCategory = filters.categories.length === 0 || filters.categories.includes(item.category)
    const passesType = filters.types.length === 0 || filters.types.includes(item.type)
    
    return passesRelevance && passesCategory && passesType
  })
  
  // Sort results
  return results.sort((a, b) => {
    switch (filters.sortBy) {
      case 'relevance':
        return (b.metadata?.relevance ?? 0) - (a.metadata?.relevance ?? 0)
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'date':
        return new Date(b.metadata?.date ?? 0).getTime() - new Date(a.metadata?.date ?? 0).getTime()
      default:
        return 0
    }
  }).slice(0, 20) // Limit results
}

interface AdvancedSearchSystemProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (tab: string, subTab?: string) => void
}

export default function AdvancedSearchSystem({ isOpen, onClose, onNavigate }: AdvancedSearchSystemProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    types: [],
    sortBy: 'relevance',
    includeHidden: false
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])
  
  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus-search-history')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved).slice(0, 10))
      } catch (e) {
        console.warn('Failed to load search history')
      }
    }
    
    const savedFavorites = localStorage.getItem('nexus-search-favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.warn('Failed to load search favorites')
      }
    }
  }, [])
  
  // Perform search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true)
        const searchResults = searchItems(query, mockSearchData, filters)
        setResults(searchResults)
        setSelectedIndex(0)
        setIsSearching(false)
      } else {
        setResults([])
      }
    }, 300)
    
    return () => clearTimeout(delayedSearch)
  }, [query, filters])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])
  
  const handleSelectResult = (result: SearchResult) => {
    // Add to search history
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('nexus-search-history', JSON.stringify(newHistory))
    }
    
    // Navigate to result
    if (result.metadata?.tab && onNavigate) {
      onNavigate(result.metadata.tab, result.metadata.subTab)
    }
    
    onClose()
  }
  
  const addToFavorites = (searchQuery: string) => {
    if (!favorites.includes(searchQuery)) {
      const newFavorites = [...favorites, searchQuery]
      setFavorites(newFavorites)
      localStorage.setItem('nexus-search-favorites', JSON.stringify(newFavorites))
    }
  }
  
  const categories = [
    { id: 'strategy', label: 'Strategy', icon: Zap, color: 'text-blue-400' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-green-400' },
    { id: 'ai', label: 'AI & ML', icon: Users, color: 'text-purple-400' },
    { id: 'data', label: 'Data', icon: BarChart3, color: 'text-yellow-400' },
    { id: 'chart', label: 'Charts', icon: BarChart3, color: 'text-orange-400' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' }
  ]
  
  const quickFilters = [
    'portfolio performance',
    'sharpe ratio',
    'drawdown',
    'strategy builder',
    'backtest results',
    'ai insights',
    'risk analysis'
  ]
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center pt-20">
      <div className="w-full max-w-3xl mx-4 bg-[#0f1320] border border-[#2a2a3e] rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#606078]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search dashboard, strategies, performance, AI insights..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white placeholder-[#606078] focus:outline-none focus:border-[#00bbff] focus:ring-1 focus:ring-[#00bbff]"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#606078] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Filters */}
          {!query && (
            <div className="flex flex-wrap gap-2">
              {quickFilters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setQuery(filter)}
                  className="px-3 py-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm text-[#a0a0b8] hover:text-white hover:border-[#00bbff] transition-all duration-200"
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-[#1a1a2e] border-b border-[#2a2a3e]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        const isSelected = filters.categories.includes(category.id)
                        setFilters({
                          ...filters,
                          categories: isSelected 
                            ? filters.categories.filter(c => c !== category.id)
                            : [...filters.categories, category.id]
                        })
                      }}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                        filters.categories.includes(category.id)
                          ? 'bg-[#00bbff] text-white'
                          : 'bg-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:bg-[#3a3a4e]'
                      }`}
                    >
                      <category.icon className={`w-4 h-4 ${category.color}`} />
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Sort By</h4>
                <div className="flex gap-2">
                  {['relevance', 'alphabetical', 'date'].map(sort => (
                    <button
                      key={sort}
                      onClick={() => setFilters({ ...filters, sortBy: sort as any })}
                      className={`px-3 py-1 rounded-lg text-sm capitalize transition-all duration-200 ${
                        filters.sortBy === sort
                          ? 'bg-[#00bbff] text-white'
                          : 'bg-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:bg-[#3a3a4e]'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#00bbff] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#a0a0b8]">Searching...</p>
            </div>
          ) : query && results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-[#3a3a4e] mx-auto mb-4" />
              <p className="text-[#a0a0b8] mb-2">No results found for "{query}"</p>
              <p className="text-sm text-[#606078]">Try adjusting your search terms or filters</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => {
                const IconComponent = result.icon || FileText
                const isSelected = index === selectedIndex
                
                return (
                  <div
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#00bbff]/10 border-l-2 border-[#00bbff]' 
                        : 'hover:bg-[#1a1a2e] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.category === 'ai' ? 'bg-purple-500/20 text-purple-400' :
                        result.category === 'performance' ? 'bg-green-500/20 text-green-400' :
                        result.category === 'strategy' ? 'bg-blue-500/20 text-blue-400' :
                        result.category === 'chart' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium truncate">{result.title}</h3>
                          {result.metadata?.value && (
                            <span className="text-xs px-2 py-1 bg-[#2a2a3e] text-[#a0a0b8] rounded">
                              {result.metadata.value}
                            </span>
                          )}
                        </div>
                        <p className="text-[#a0a0b8] text-sm line-clamp-2">{result.description}</p>
                        
                        {result.tags && (
                          <div className="flex items-center gap-2 mt-2">
                            {result.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs px-2 py-1 bg-[#1a1a2e] text-[#606078] rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToFavorites(query)
                          }}
                          className="text-[#606078] hover:text-yellow-400 transition-colors"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <ArrowRight className="w-4 h-4 text-[#606078]" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : !query && (searchHistory.length > 0 || favorites.length > 0) ? (
            <div className="p-4 space-y-4">
              {searchHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {searchHistory.map(search => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="w-full text-left p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all duration-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {favorites.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Favorite Searches
                  </h3>
                  <div className="space-y-1">
                    {favorites.map(search => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="w-full text-left p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all duration-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-[#1a1a2e] border-t border-[#2a2a3e]">
          <div className="flex items-center justify-between text-xs text-[#606078]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                + K to search
              </span>
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>ESC to close</span>
            </div>
            {results.length > 0 && (
              <span>{results.length} results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

