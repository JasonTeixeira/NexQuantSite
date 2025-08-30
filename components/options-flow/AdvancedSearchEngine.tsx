"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, Filter, History, Star, Zap, Brain, Target,
  TrendingUp, Volume2, Clock, ArrowUpRight, ArrowDownRight,
  Mic, X, ChevronDown, ChevronRight, Layers, BarChart3,
  Eye, Crown, Activity, AlertTriangle
} from "lucide-react"

interface SearchSuggestion {
  id: string
  type: 'symbol' | 'strategy' | 'pattern' | 'filter'
  text: string
  description: string
  category: string
  relevance: number
}

interface SearchResult {
  id: string
  symbol: string
  type: 'unusual-activity' | 'smart-money' | 'gamma-squeeze' | 'large-flow'
  title: string
  description: string
  metrics: {
    premium: number
    volume: number
    iv: number
    smartScore: number
  }
  timestamp: Date
  confidence: number
  tags: string[]
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: any
  createdAt: Date
  lastUsed: Date
  useCount: number
  favorite: boolean
}

interface AdvancedSearchEngineProps {
  className?: string
  onResultSelect?: (result: SearchResult) => void
}

export default function AdvancedSearchEngine({ className = "", onResultSelect }: AdvancedSearchEngineProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'filters' | 'saved'>('search')
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Advanced filter states
  const [filters, setFilters] = useState({
    symbols: [] as string[],
    minPremium: 0,
    maxPremium: 10000000,
    minVolume: 0,
    maxVolume: 1000000,
    minIV: 0,
    maxIV: 500,
    timeframe: 'all',
    smartMoneyScore: [0, 100] as [number, number],
    optionType: 'all', // calls, puts, all
    expiration: 'all',
    unusual: false,
    darkPool: false,
    afterHours: false
  })

  // Mock data - in real implementation, this would come from your data layer
  useEffect(() => {
    const mockSavedSearches: SavedSearch[] = [
      {
        id: '1',
        name: 'High IV SPY Options',
        query: 'SPY IV>100 volume>10000',
        filters: { minIV: 100, minVolume: 10000, symbols: ['SPY'] },
        createdAt: new Date(Date.now() - 86400000),
        lastUsed: new Date(Date.now() - 3600000),
        useCount: 23,
        favorite: true
      },
      {
        id: '2', 
        name: 'Tech Gamma Squeeze Watch',
        query: 'AAPL OR MSFT OR GOOGL gamma>80',
        filters: { symbols: ['AAPL', 'MSFT', 'GOOGL'] },
        createdAt: new Date(Date.now() - 86400000 * 3),
        lastUsed: new Date(Date.now() - 7200000),
        useCount: 15,
        favorite: false
      },
      {
        id: '3',
        name: 'Smart Money Alerts',
        query: 'smart-money>85 premium>1000000',
        filters: { smartMoneyScore: [85, 100], minPremium: 1000000 },
        createdAt: new Date(Date.now() - 86400000 * 7),
        lastUsed: new Date(Date.now() - 86400000),
        useCount: 42,
        favorite: true
      }
    ]
    setSavedSearches(mockSavedSearches)
    
    setRecentSearches([
      'TSLA unusual activity',
      'SPY gamma squeeze risk', 
      'AAPL smart money flow',
      'QQQ high IV options',
      'NVDA earnings play'
    ])
  }, [])

  // Generate intelligent suggestions based on query
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    const q = query.toLowerCase()
    
    const suggestions: SearchSuggestion[] = []
    
    // Symbol suggestions
    const symbols = [
      'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'META', 'AMZN', 'NFLX',
      'CRM', 'UBER', 'LYFT', 'ZOOM', 'SHOP', 'SQ', 'PYPL', 'ADBE', 'AMD', 'INTC'
    ]
    symbols.forEach(symbol => {
      if (symbol.toLowerCase().includes(q)) {
        suggestions.push({
          id: `symbol-${symbol}`,
          type: 'symbol',
          text: symbol,
          description: `Options flow for ${symbol}`,
          category: 'Symbols',
          relevance: symbol.toLowerCase().indexOf(q) === 0 ? 1 : 0.8
        })
      }
    })

    // Strategy suggestions
    const strategies = [
      { text: 'unusual activity', desc: 'Find options with abnormal volume patterns' },
      { text: 'smart money flow', desc: 'Detect institutional trading patterns' },
      { text: 'gamma squeeze risk', desc: 'Identify potential gamma squeeze setups' },
      { text: 'high IV rank', desc: 'Options with elevated implied volatility' },
      { text: 'earnings play', desc: 'Pre-earnings options positioning' },
      { text: 'dark pool activity', desc: 'Large block trades from dark pools' }
    ]
    strategies.forEach(strategy => {
      if (strategy.text.includes(q) || q.includes(strategy.text.split(' ')[0])) {
        suggestions.push({
          id: `strategy-${strategy.text}`,
          type: 'strategy',
          text: strategy.text,
          description: strategy.desc,
          category: 'Strategies',
          relevance: 0.9
        })
      }
    })

    // Pattern suggestions
    const patterns = [
      { text: 'bullish flow', desc: 'Heavy call buying activity' },
      { text: 'bearish flow', desc: 'Heavy put buying activity' },
      { text: 'straddle play', desc: 'Equal call and put positioning' },
      { text: 'iron condor setup', desc: 'Range-bound options strategy' },
      { text: 'covered call writing', desc: 'Conservative income strategy' }
    ]
    patterns.forEach(pattern => {
      if (pattern.text.includes(q)) {
        suggestions.push({
          id: `pattern-${pattern.text}`,
          type: 'pattern',
          text: pattern.text,
          description: pattern.desc,
          category: 'Patterns',
          relevance: 0.7
        })
      }
    })

    // Advanced filter suggestions
    if (q.includes('volume') || q.includes('vol')) {
      suggestions.push({
        id: 'filter-volume',
        type: 'filter',
        text: 'volume > 10,000',
        description: 'Filter by minimum option volume',
        category: 'Filters',
        relevance: 0.6
      })
    }

    if (q.includes('premium') || q.includes('$')) {
      suggestions.push({
        id: 'filter-premium',
        type: 'filter',
        text: 'premium > $1M',
        description: 'Filter by minimum premium value',
        category: 'Filters',
        relevance: 0.6
      })
    }

    return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 8)
  }

  // Handle search input change
  useEffect(() => {
    if (searchQuery.length > 1) {
      setSuggestions(generateSuggestions(searchQuery))
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  // Execute search
  const executeSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return

    setIsSearching(true)
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 10)
      return updated
    })

    // Simulate search API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          symbol: 'AAPL',
          type: 'unusual-activity',
          title: 'AAPL Unusual Call Activity Detected',
          description: 'Heavy call buying in AAPL Jan 2024 $200 strikes with 5x normal volume',
          metrics: { premium: 2400000, volume: 15420, iv: 87.3, smartScore: 92 },
          timestamp: new Date(Date.now() - 300000),
          confidence: 94,
          tags: ['tech', 'unusual-volume', 'bullish']
        },
        {
          id: '2',
          symbol: 'SPY',
          type: 'gamma-squeeze',
          title: 'SPY Gamma Squeeze Risk Alert',
          description: 'High gamma concentration at $480 strike creating potential squeeze scenario',
          metrics: { premium: 8900000, volume: 45230, iv: 23.4, smartScore: 78 },
          timestamp: new Date(Date.now() - 600000),
          confidence: 89,
          tags: ['spy', 'gamma-squeeze', 'high-risk']
        },
        {
          id: '3',
          symbol: 'TSLA',
          type: 'smart-money',
          title: 'TSLA Institutional Flow Detected',
          description: 'Large block purchases of TSLA puts by institutional players',
          metrics: { premium: 5600000, volume: 23400, iv: 145.7, smartScore: 96 },
          timestamp: new Date(Date.now() - 900000),
          confidence: 97,
          tags: ['tsla', 'institutional', 'bearish', 'large-blocks']
        }
      ]

      setResults(mockResults)
      setIsSearching(false)
    }, 1200)
  }

  // Voice search functionality
  const startVoiceSearch = () => {
    setIsVoiceActive(true)
    // In real implementation, integrate with Web Speech API
    setTimeout(() => {
      setSearchQuery("AAPL unusual activity")
      setIsVoiceActive(false)
    }, 2000)
  }

  // Save current search
  const saveCurrentSearch = () => {
    if (!searchQuery.trim()) return

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: `Search: ${searchQuery.substring(0, 30)}...`,
      query: searchQuery,
      filters: filters,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 1,
      favorite: false
    }

    setSavedSearches(prev => [newSavedSearch, ...prev])
  }

  const formatMetric = (value: number, type: string) => {
    switch (type) {
      case 'premium':
        return `$${(value / 1000000).toFixed(1)}M`
      case 'volume':
        return value.toLocaleString()
      case 'iv':
        return `${value.toFixed(1)}%`
      case 'smartScore':
        return `${value}/100`
      default:
        return value.toString()
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'unusual-activity': return AlertTriangle
      case 'smart-money': return Crown  
      case 'gamma-squeeze': return Target
      case 'large-flow': return Activity
      default: return Eye
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'unusual-activity': return 'text-yellow-400'
      case 'smart-money': return 'text-purple-400'
      case 'gamma-squeeze': return 'text-red-400'
      case 'large-flow': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Advanced Search Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 30px rgba(147, 51, 234, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Search className="w-6 h-6 text-blue-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Search & Discovery</h2>
            <p className="text-gray-400">AI-powered options flow intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400 border border-green-400/30">
            {results.length} Results
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-400/30">
            {savedSearches.length} Saved
          </Badge>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-primary/20 mb-6">
          <TabsTrigger value="search">Smart Search</TabsTrigger>
          <TabsTrigger value="filters">Advanced Filters</TabsTrigger>
          <TabsTrigger value="saved">Saved Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Input & Suggestions */}
            <div className="lg:col-span-2">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 mb-6">
                <CardContent className="p-6">
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search options flow... (e.g., 'AAPL unusual activity', 'SPY gamma squeeze', 'smart money tech')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                        className="pl-12 pr-24 py-4 text-lg bg-black/60 border-primary/30 focus:border-primary/60"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={startVoiceSearch}
                          className={`p-2 ${isVoiceActive ? 'text-red-400 animate-pulse' : 'text-gray-400 hover:text-primary'}`}
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => executeSearch()}
                          disabled={isSearching || !searchQuery.trim()}
                          className="bg-primary/20 text-primary hover:bg-primary/30"
                        >
                          {isSearching ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Zap className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            'Search'
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Live Suggestions */}
                    {suggestions.length > 0 && (
                      <motion.div
                        className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-primary/20 rounded-xl overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {suggestions.map((suggestion) => (
                          <motion.button
                            key={suggestion.id}
                            className="w-full px-4 py-3 text-left hover:bg-primary/10 border-b border-primary/10 last:border-b-0 transition-colors duration-200"
                            onClick={() => {
                              setSearchQuery(suggestion.text)
                              setSuggestions([])
                              executeSearch(suggestion.text)
                            }}
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-medium">{suggestion.text}</div>
                                <div className="text-gray-400 text-sm">{suggestion.description}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="ghost" onClick={saveCurrentSearch} disabled={!searchQuery.trim()}>
                      <Star className="w-4 h-4 mr-2" />
                      Save Search
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")}>
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              {results.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Search Results ({results.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {results.map((result, index) => {
                        const ResultIcon = getResultIcon(result.type)
                        return (
                          <motion.div
                            key={result.id}
                            className="p-4 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onResultSelect?.(result)}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <ResultIcon className={`w-6 h-6 mt-1 ${getResultColor(result.type)}`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-white font-semibold">{result.title}</h3>
                                    <Badge className="bg-primary/20 text-primary text-xs">
                                      {result.confidence}% confidence
                                    </Badge>
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">{result.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {result.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">{result.symbol}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(result.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-700">
                              <div className="text-center">
                                <div className="text-sm font-bold text-green-400">
                                  {formatMetric(result.metrics.premium, 'premium')}
                                </div>
                                <div className="text-xs text-gray-400">Premium</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-blue-400">
                                  {formatMetric(result.metrics.volume, 'volume')}
                                </div>
                                <div className="text-xs text-gray-400">Volume</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-yellow-400">
                                  {formatMetric(result.metrics.iv, 'iv')}
                                </div>
                                <div className="text-xs text-gray-400">IV</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-purple-400">
                                  {formatMetric(result.metrics.smartScore, 'smartScore')}
                                </div>
                                <div className="text-xs text-gray-400">Smart Score</div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent & Quick Searches */}
            <div className="lg:col-span-1">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-400" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      className="w-full p-2 text-left rounded-lg bg-black/20 hover:bg-primary/10 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                      onClick={() => {
                        setSearchQuery(search)
                        executeSearch(search)
                      }}
                      whileHover={{ x: 4 }}
                    >
                      {search}
                    </motion.button>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Filters */}
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Quick Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Unusual Activity', query: 'unusual volume>5x' },
                    { label: 'Smart Money Flow', query: 'smart-money>90' },
                    { label: 'High IV Rank', query: 'IV>100 rank>80' },
                    { label: 'Gamma Squeeze Risk', query: 'gamma-squeeze risk>85' },
                    { label: 'Earnings Plays', query: 'earnings within:7days' },
                    { label: 'Dark Pool Activity', query: 'dark-pool large-blocks' }
                  ].map((filter, index) => (
                    <motion.button
                      key={index}
                      className="w-full p-2 text-left rounded-lg bg-black/20 hover:bg-primary/10 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                      onClick={() => {
                        setSearchQuery(filter.query)
                        executeSearch(filter.query)
                      }}
                      whileHover={{ x: 4 }}
                    >
                      {filter.label}
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="filters">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Symbol Selection */}
                <div>
                  <label className="text-white font-semibold mb-2 block">Symbols</label>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Add symbols (e.g., AAPL, MSFT)"
                      className="bg-black/60 border-primary/30"
                    />
                    <div className="flex flex-wrap gap-1">
                      {filters.symbols.map(symbol => (
                        <Badge key={symbol} className="bg-primary/20 text-primary">
                          {symbol}
                          <X className="w-3 h-3 ml-1 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Premium Range */}
                <div>
                  <label className="text-white font-semibold mb-2 block">Premium Range</label>
                  <div className="space-y-2">
                    <Input 
                      type="number"
                      placeholder="Min premium ($)"
                      value={filters.minPremium}
                      onChange={(e) => setFilters({...filters, minPremium: Number(e.target.value)})}
                      className="bg-black/60 border-primary/30"
                    />
                    <Input 
                      type="number"
                      placeholder="Max premium ($)"
                      value={filters.maxPremium}
                      onChange={(e) => setFilters({...filters, maxPremium: Number(e.target.value)})}
                      className="bg-black/60 border-primary/30"
                    />
                  </div>
                </div>

                {/* Volume Range */}
                <div>
                  <label className="text-white font-semibold mb-2 block">Volume Range</label>
                  <div className="space-y-2">
                    <Input 
                      type="number"
                      placeholder="Min volume"
                      value={filters.minVolume}
                      onChange={(e) => setFilters({...filters, minVolume: Number(e.target.value)})}
                      className="bg-black/60 border-primary/30"
                    />
                    <Input 
                      type="number"
                      placeholder="Max volume"
                      value={filters.maxVolume}
                      onChange={(e) => setFilters({...filters, maxVolume: Number(e.target.value)})}
                      className="bg-black/60 border-primary/30"
                    />
                  </div>
                </div>

                {/* Additional filters would go here... */}
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button onClick={() => executeSearch()} className="bg-primary/20 text-primary hover:bg-primary/30">
                  Apply Filters
                </Button>
                <Button variant="ghost" onClick={() => setFilters({
                  symbols: [],
                  minPremium: 0,
                  maxPremium: 10000000,
                  minVolume: 0,
                  maxVolume: 1000000,
                  minIV: 0,
                  maxIV: 500,
                  timeframe: 'all',
                  smartMoneyScore: [0, 100],
                  optionType: 'all',
                  expiration: 'all',
                  unusual: false,
                  darkPool: false,
                  afterHours: false
                })}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Saved Searches ({savedSearches.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedSearches.map((saved) => (
                <motion.div
                  key={saved.id}
                  className="p-4 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    setSearchQuery(saved.query)
                    executeSearch(saved.query)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{saved.name}</h3>
                        {saved.favorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                      </div>
                      <p className="text-gray-400 text-sm font-mono mb-2">{saved.query}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Used {saved.useCount} times</span>
                        <span>Last used: {saved.lastUsed.toLocaleDateString()}</span>
                        <span>Created: {saved.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
