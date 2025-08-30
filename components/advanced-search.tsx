"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, Clock, Star, Eye, TrendingUp, Users, FileText, Video, BookOpen, Code, BarChart3, Database, Brain, Shield, Zap, Lock, ChevronDown, ChevronRight, Calendar, Tag, User, DollarSign, Bookmark, ExternalLink, Grid, List, SortAsc, SortDesc } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SearchResult {
  id: string
  title: string
  type: 'strategy' | 'article' | 'video' | 'tutorial' | 'tool' | 'user' | 'marketplace'
  category: string
  description: string
  author: string
  publishDate: string
  rating: number
  views: number
  likes: number
  price?: number
  tags: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: string
  featured?: boolean
  thumbnail?: string
}

interface AdvancedSearchProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

const mockSearchResults: SearchResult[] = [
  {
    id: "momentum-breakout",
    title: "Adaptive Momentum Breakout Strategy",
    type: "strategy",
    category: "momentum",
    description: "Multi-timeframe momentum strategy with dynamic parameter adjustment based on market regime detection.",
    author: "Alex Chen",
    publishDate: "2024-01-15",
    rating: 4.8,
    views: 12450,
    likes: 892,
    price: 299,
    tags: ["momentum", "breakout", "adaptive", "multi-timeframe"],
    difficulty: "advanced",
    featured: true
  },
  {
    id: "risk-management-guide",
    title: "Professional Risk Management Techniques",
    type: "article",
    category: "education",
    description: "Comprehensive guide to institutional-grade risk management strategies and position sizing methods.",
    author: "Sarah Kim",
    publishDate: "2024-01-12",
    rating: 4.9,
    views: 8930,
    likes: 567,
    tags: ["risk-management", "position-sizing", "professional"],
    difficulty: "intermediate",
    duration: "20 min"
  },
  {
    id: "api-tutorial",
    title: "Nexural Trading API Integration Masterclass",
    type: "video",
    category: "development",
    description: "Complete video tutorial on integrating with Nexural Trading APIs for automated trading and custom applications.",
    author: "Mike Johnson",
    publishDate: "2024-01-10",
    rating: 4.7,
    views: 5670,
    likes: 234,
    tags: ["api", "development", "automation", "integration"],
    difficulty: "intermediate",
    duration: "45 min"
  },
  {
    id: "ml-predictor",
    title: "Machine Learning Price Predictor",
    type: "tool",
    category: "ai",
    description: "Advanced ML model for cryptocurrency price prediction using LSTM networks and sentiment analysis.",
    author: "Dr. Lisa Wang",
    publishDate: "2024-01-08",
    rating: 4.6,
    views: 3420,
    likes: 156,
    price: 199,
    tags: ["machine-learning", "prediction", "lstm", "sentiment"],
    difficulty: "advanced"
  },
  {
    id: "trading-bot-basic",
    title: "Build Your First Trading Bot",
    type: "tutorial",
    category: "automation",
    description: "Step-by-step tutorial for creating a simple trading bot using Python and the Nexural Trading platform.",
    author: "John Smith",
    publishDate: "2024-01-05",
    rating: 4.5,
    views: 15670,
    likes: 789,
    tags: ["bot", "python", "automation", "beginner"],
    difficulty: "beginner",
    duration: "30 min"
  }
]

const searchCategories = [
  { id: "all", name: "All Categories", icon: Search },
  { id: "strategies", name: "Strategies", icon: TrendingUp },
  { id: "education", name: "Education", icon: BookOpen },
  { id: "tools", name: "Tools", icon: Code },
  { id: "marketplace", name: "Marketplace", icon: DollarSign },
  { id: "community", name: "Community", icon: Users }
]

const contentTypes = [
  { id: "all", name: "All Types" },
  { id: "strategy", name: "Strategies" },
  { id: "article", name: "Articles" },
  { id: "video", name: "Videos" },
  { id: "tutorial", name: "Tutorials" },
  { id: "tool", name: "Tools" },
  { id: "user", name: "Users" }
]

const sortOptions = [
  { id: "relevance", name: "Relevance" },
  { id: "newest", name: "Newest First" },
  { id: "oldest", name: "Oldest First" },
  { id: "rating", name: "Highest Rated" },
  { id: "views", name: "Most Viewed" },
  { id: "likes", name: "Most Liked" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" }
]

export default function AdvancedSearch({ isOpen, onClose, initialQuery = "" }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [ratingRange, setRatingRange] = useState([0, 5])
  const [dateRange, setDateRange] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const [onlyFree, setOnlyFree] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "momentum strategy",
    "risk management",
    "API integration",
    "machine learning"
  ])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredResults = mockSearchResults.filter(result => {
    const matchesQuery = !searchQuery || 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || result.category === selectedCategory
    const matchesType = selectedType === "all" || result.type === selectedType
    const matchesDifficulty = selectedDifficulty === "all" || result.difficulty === selectedDifficulty
    const matchesPrice = !result.price || (result.price >= priceRange[0] && result.price <= priceRange[1])
    const matchesRating = result.rating >= ratingRange[0] && result.rating <= ratingRange[1]
    const matchesFeatured = !onlyFeatured || result.featured
    const matchesFree = !onlyFree || !result.price
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => result.tags.includes(tag))

    return matchesQuery && matchesCategory && matchesType && matchesDifficulty && 
           matchesPrice && matchesRating && matchesFeatured && matchesFree && matchesTags
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      case 'oldest':
        return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'views':
        return b.views - a.views
      case 'likes':
        return b.likes - a.likes
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      default:
        return 0
    }
  })

  const allTags = Array.from(new Set(mockSearchResults.flatMap(result => result.tags)))

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strategy': return TrendingUp
      case 'article': return FileText
      case 'video': return Video
      case 'tutorial': return BookOpen
      case 'tool': return Code
      case 'user': return User
      default: return FileText
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)])
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  useEffect(() => {
    if (searchQuery) {
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Search Panel */}
        <div className="flex-1 bg-gray-900 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Advanced Search</h1>
                  <p className="text-sm text-white/60">Find exactly what you're looking for</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search strategies, articles, tutorials, tools, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-12 bg-black/50 border-primary/30 text-white placeholder:text-white/50 focus:border-primary h-12"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-black h-8"
              >
                Search
              </Button>

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setSuggestions([])
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <Search className="w-4 h-4 inline mr-2 text-primary" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchQuery && (
              <div className="mb-4">
                <p className="text-sm text-white/60 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(search)}
                      className="border-primary/30 text-primary hover:bg-primary/10 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {showFilters && <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-black/50 border-primary/30 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {searchCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-800">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-black/50 border-primary/30 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id} className="text-white hover:bg-gray-800">
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{filteredResults.length} results found</span>
              {searchQuery && (
                <span>for "{searchQuery}"</span>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 flex">
            {/* Main Results */}
            <div className="flex-1 p-6">
              <ScrollArea className="h-full">
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredResults.map((result) => (
                    <motion.div
                      key={result.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group"
                    >
                      <Card className="bg-white/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                        <CardContent className="p-4 h-full flex flex-col">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              {(() => {
                                const IconComponent = getTypeIcon(result.type)
                                return <IconComponent className="w-6 h-6 text-primary" />
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                                  {result.title}
                                </h3>
                                {result.featured && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                                <Badge className="text-xs bg-primary/10 text-primary border border-primary/30">
                                  {result.type}
                                </Badge>
                                {result.difficulty && (
                                  <Badge className={`text-xs ${getDifficultyColor(result.difficulty)}`}>
                                    {result.difficulty}
                                  </Badge>
                                )}
                                {result.price && (
                                  <Badge className="text-xs bg-green-400/10 text-green-400 border border-green-400/30">
                                    ${result.price}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-white/60 mb-4 flex-1 line-clamp-3">
                            {result.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{result.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{result.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{result.likes}</span>
                              </div>
                            </div>
                            <span>by {result.author}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {result.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-white/5 border-white/20 text-white/60">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 mt-auto">
                            <Button size="sm" className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredResults.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white/70 mb-2">No results found</h3>
                    <p className="text-white/50">Try adjusting your search query or filters</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Advanced Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-80 bg-gray-800 border-l border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Advanced Filters</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Content Type */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Content Type</h3>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-black/50 border-primary/30 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {contentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id} className="text-white hover:bg-gray-800">
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Difficulty Level</h3>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="bg-black/50 border-primary/30 text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-800">All Levels</SelectItem>
                        <SelectItem value="beginner" className="text-white hover:bg-gray-800">Beginner</SelectItem>
                        <SelectItem value="intermediate" className="text-white hover:bg-gray-800">Intermediate</SelectItem>
                        <SelectItem value="advanced" className="text-white hover:bg-gray-800">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Minimum Rating</h3>
                    <div className="space-y-3">
                      <Slider
                        value={ratingRange}
                        onValueChange={setRatingRange}
                        max={5}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span>{ratingRange[0]} stars</span>
                        <span>{ratingRange[1]} stars</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Toggles */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Quick Filters</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="featured" className="text-sm text-white/80">Featured Only</label>
                        <Switch
                          id="featured"
                          checked={onlyFeatured}
                          onCheckedChange={setOnlyFeatured}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="free" className="text-sm text-white/80">Free Only</label>
                        <Switch
                          id="free"
                          checked={onlyFree}
                          onCheckedChange={setOnlyFree}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2 py-1 rounded text-xs border transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-white/5 text-white/60 border-white/20 hover:border-primary/30'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="pt-4 border-t border-gray-700">
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => {
                        setSelectedCategory("all")
                        setSelectedType("all")
                        setSelectedDifficulty("all")
                        setPriceRange([0, 1000])
                        setRatingRange([0, 5])
                        setOnlyFeatured(false)
                        setOnlyFree(false)
                        setSelectedTags([])
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
