"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, BookOpen, Video, MessageCircle, Users, Star, Clock, ChevronRight, Play, Download, ExternalLink, Filter, Grid, List, Bookmark, ThumbsUp, Eye, HelpCircle, Lightbulb, FileText, Headphones, Monitor, Smartphone, Code, BarChart3, TrendingUp, Shield, Zap, Database, Brain, Lock, X, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface HelpContent {
  id: string
  title: string
  type: 'article' | 'video' | 'tutorial' | 'faq' | 'guide'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  description: string
  content: string
  tags: string[]
  author: string
  publishDate: string
  views: number
  likes: number
  rating: number
  featured?: boolean
  videoUrl?: string
  downloadUrl?: string
}

interface HelpSystemProps {
  isOpen: boolean
  onClose: () => void
}

const mockHelpContent: HelpContent[] = [
  {
    id: "getting-started",
    title: "Getting Started with Nexural Trading Platform",
    type: "guide",
    category: "basics",
    difficulty: "beginner",
    duration: "15 min",
    description: "Complete guide to setting up your account and making your first trade on the Nexural Trading platform.",
    content: `
# Getting Started with Nexural Trading Platform

Welcome to Nexural Trading, the premier algorithmic trading platform. This guide will walk you through everything you need to know to get started.

## Account Setup

1. **Create Your Account**
   - Visit the signup page
   - Verify your email address
   - Complete KYC verification

2. **Security Setup**
   - Enable 2FA authentication
   - Set up backup codes
   - Configure API keys

## First Steps

### Dashboard Overview
Your dashboard provides real-time insights into:
- Portfolio performance
- Active strategies
- Market conditions
- Risk metrics

### Making Your First Trade
1. Navigate to the Strategy Lab
2. Select a pre-built strategy or create your own
3. Configure risk parameters
4. Deploy to live trading

## Best Practices

- Start with paper trading
- Use proper position sizing
- Monitor performance regularly
- Keep learning and adapting
    `,
    tags: ["setup", "beginner", "account", "first-trade"],
    author: "Nexural Trading Team",
    publishDate: "2024-01-15",
    views: 15420,
    likes: 892,
    rating: 4.8,
    featured: true
  },
  {
    id: "strategy-lab-tutorial",
    title: "Mastering the Strategy Lab",
    type: "video",
    category: "strategy-lab",
    difficulty: "intermediate",
    duration: "25 min",
    description: "Deep dive into the Strategy Lab features, from basic ingredient selection to advanced strategy building.",
    content: `
# Mastering the Strategy Lab

Learn how to use our powerful Strategy Lab to build, test, and deploy professional trading strategies.

## Video Chapters

1. **Introduction to Strategy Lab** (0:00 - 3:00)
2. **Understanding Ingredients** (3:00 - 8:00)
3. **Building Your First Strategy** (8:00 - 15:00)
4. **Backtesting and Optimization** (15:00 - 22:00)
5. **Deployment and Monitoring** (22:00 - 25:00)

## Key Takeaways

- Strategy Lab contains 150+ professional ingredients
- Combine ingredients to create custom strategies
- Always backtest before live deployment
- Monitor performance and adjust as needed
    `,
    tags: ["strategy-lab", "video", "tutorial", "building"],
    author: "Alex Chen",
    publishDate: "2024-01-12",
    views: 8930,
    likes: 456,
    rating: 4.9,
    videoUrl: "https://example.com/strategy-lab-tutorial",
    featured: true
  },
  {
    id: "risk-management",
    title: "Advanced Risk Management Techniques",
    type: "article",
    category: "risk-management",
    difficulty: "advanced",
    duration: "20 min",
    description: "Professional risk management strategies used by institutional traders and hedge funds.",
    content: `
# Advanced Risk Management Techniques

Risk management is the cornerstone of successful trading. This guide covers advanced techniques used by professionals.

## Position Sizing Methods

### Kelly Criterion
The Kelly Criterion helps determine optimal position sizes based on win rate and risk-reward ratio.

\`\`\`python
def kelly_position_size(win_rate, avg_win, avg_loss, capital):
    win_loss_ratio = avg_win / abs(avg_loss)
    kelly_percent = win_rate - ((1 - win_rate) / win_loss_ratio)
    return max(0, min(0.1, kelly_percent * 0.25)) * capital
\`\`\`

### Volatility-Based Sizing
Adjust position sizes based on market volatility to maintain consistent risk levels.

## Portfolio Risk Metrics

- **Value at Risk (VaR)**: Maximum expected loss over a specific time period
- **Conditional VaR**: Expected loss beyond the VaR threshold
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Sharpe Ratio**: Risk-adjusted returns

## Dynamic Hedging

Implement dynamic hedging strategies to protect against adverse market movements:

1. **Delta Hedging**: Neutralize directional risk
2. **Gamma Hedging**: Manage convexity risk
3. **Vega Hedging**: Control volatility exposure
    `,
    tags: ["risk-management", "advanced", "position-sizing", "hedging"],
    author: "Sarah Kim",
    publishDate: "2024-01-10",
    views: 5670,
    likes: 234,
    rating: 4.7
  },
  {
    id: "api-integration",
    title: "API Integration Guide",
    type: "tutorial",
    category: "development",
    difficulty: "intermediate",
    duration: "30 min",
    description: "Step-by-step guide to integrating with Nexural Trading APIs for custom applications and automated trading.",
    content: `
# API Integration Guide

Learn how to integrate with Nexural Trading APIs to build custom applications and automate your trading.

## Authentication

All API requests require authentication using API keys:

\`\`\`javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
\`\`\`

## Market Data API

### Get Real-time Prices
\`\`\`javascript
const response = await fetch('/api/market/prices', {
  method: 'GET',
  headers: headers
})
const prices = await response.json()
\`\`\`

### Subscribe to WebSocket Feed
\`\`\`javascript
const ws = new WebSocket('wss://api.nexuraltrading.com/ws')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Price update:', data)
}
\`\`\`

## Trading API

### Place Order
\`\`\`javascript
const order = {
  symbol: 'BTC/USDT',
  side: 'buy',
  amount: 0.1,
  type: 'market'
}

const response = await fetch('/api/trading/orders', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(order)
})
\`\`\`

## Error Handling

Always implement proper error handling:

\`\`\`javascript
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`)
  }
  const data = await response.json()
} catch (error) {
  console.error('API error:', error)
}
\`\`\`
    `,
    tags: ["api", "development", "integration", "automation"],
    author: "Mike Johnson",
    publishDate: "2024-01-08",
    views: 3420,
    likes: 156,
    rating: 4.6,
    downloadUrl: "/downloads/api-guide.pdf"
  },
  {
    id: "mobile-app-guide",
    title: "Mobile App Complete Guide",
    type: "tutorial",
    category: "mobile",
    difficulty: "beginner",
    duration: "12 min",
    description: "Everything you need to know about using the Nexural Trading mobile app for trading on the go.",
    content: `
# Mobile App Complete Guide

Trade anywhere, anytime with the Nexural Trading mobile app. This guide covers all mobile-specific features.

## Installation

1. Download from App Store or Google Play
2. Log in with your existing credentials
3. Enable biometric authentication
4. Set up push notifications

## Mobile-Specific Features

### Quick Trade
Execute trades with just a few taps using our streamlined mobile interface.

### Push Notifications
Stay informed with real-time alerts for:
- Price movements
- Order fills
- Strategy performance
- Market news

### Offline Mode
View your portfolio and recent activity even without internet connection.

## Mobile Trading Tips

1. **Use Touch ID/Face ID** for quick secure access
2. **Enable notifications** for important alerts
3. **Use quick actions** for faster trading
4. **Monitor on the go** with widget support
    `,
    tags: ["mobile", "app", "trading", "notifications"],
    author: "Lisa Wang",
    publishDate: "2024-01-05",
    views: 7890,
    likes: 345,
    rating: 4.5
  }
]

const categories = [
  { id: "all", name: "All Topics", icon: BookOpen },
  { id: "basics", name: "Getting Started", icon: Lightbulb },
  { id: "strategy-lab", name: "Strategy Lab", icon: Brain },
  { id: "risk-management", name: "Risk Management", icon: Shield },
  { id: "development", name: "Development", icon: Code },
  { id: "mobile", name: "Mobile", icon: Smartphone },
  { id: "advanced", name: "Advanced", icon: TrendingUp }
]

const contentTypes = [
  { id: "all", name: "All Types", icon: FileText },
  { id: "article", name: "Articles", icon: FileText },
  { id: "video", name: "Videos", icon: Video },
  { id: "tutorial", name: "Tutorials", icon: Monitor },
  { id: "guide", name: "Guides", icon: BookOpen },
  { id: "faq", name: "FAQ", icon: HelpCircle }
]

export default function HelpSystem({ isOpen, onClose }: HelpSystemProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedContent, setSelectedContent] = useState<HelpContent | null>(null)
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([])

  const filteredContent = mockHelpContent.filter(content => {
    const matchesSearch = !searchTerm || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || content.category === selectedCategory
    const matchesType = selectedType === "all" || content.type === selectedType
    const matchesDifficulty = selectedDifficulty === "all" || content.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty
  })

  const toggleBookmark = (contentId: string) => {
    setBookmarkedItems(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText
      case 'video': return Video
      case 'tutorial': return Monitor
      case 'guide': return BookOpen
      case 'faq': return HelpCircle
      default: return FileText
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Main Help Panel */}
        <div className="flex-1 bg-gray-900 border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Help Center</h1>
                  <p className="text-sm text-white/60">Find answers and learn how to use Nexural Trading</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
              <Input
                type="text"
                placeholder="Search help articles, tutorials, and guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-black/50 border-primary/30 text-white placeholder:text-white/50 focus:border-primary"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-black/50 border-primary/30 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-800">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32 bg-black/50 border-primary/30 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-white hover:bg-gray-800">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-36 bg-black/50 border-primary/30 text-white">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">All Levels</SelectItem>
                  <SelectItem value="beginner" className="text-white hover:bg-gray-800">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-white hover:bg-gray-800">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-white hover:bg-gray-800">Advanced</SelectItem>
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
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {/* Featured Content */}
            {selectedCategory === "all" && !searchTerm && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Featured Content
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockHelpContent.filter(content => content.featured).map((content) => (
                    <Card key={content.id} className="bg-white/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setSelectedContent(content)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            {(() => {
                              const IconComponent = getTypeIcon(content.type)
                              return <IconComponent className="w-5 h-5 text-primary" />
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1 truncate">{content.title}</h3>
                            <p className="text-sm text-white/60 mb-2 line-clamp-2">{content.description}</p>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <Badge className={`text-xs ${getDifficultyColor(content.difficulty)}`}>
                                {content.difficulty}
                              </Badge>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{content.duration}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Content */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {searchTerm ? `Search Results (${filteredContent.length})` : 'All Content'}
              </h2>
              <div className="text-sm text-white/60">
                {filteredContent.length} items
              </div>
            </div>

            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredContent.map((content) => (
                <motion.div
                  key={content.id}
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
                            const IconComponent = getTypeIcon(content.type)
                            return <IconComponent className="w-6 h-6 text-primary" />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {content.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                            <Badge className={`text-xs ${getDifficultyColor(content.difficulty)}`}>
                              {content.difficulty}
                            </Badge>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{content.duration}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(content.id)
                          }}
                          className="text-white/40 hover:text-yellow-400"
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarkedItems.includes(content.id) ? 'fill-current text-yellow-400' : ''}`} />
                        </Button>
                      </div>

                      <p className="text-sm text-white/60 mb-4 flex-1 line-clamp-3">
                        {content.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{content.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{content.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>{content.rating}</span>
                          </div>
                        </div>
                        <span>{content.publishDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedContent(content)}
                          className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                        >
                          {content.type === 'video' ? (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Watch
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3 mr-1" />
                              Read
                            </>
                          )}
                        </Button>
                        {content.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white/70 mb-2">No content found</h3>
                <p className="text-white/50">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Content Detail Panel */}
        <AnimatePresence>
          {selectedContent && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-1/2 bg-gray-800 border-l border-gray-700 flex flex-col"
            >
              {/* Content Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const IconComponent = getTypeIcon(selectedContent.type)
                        return <IconComponent className="w-6 h-6 text-primary" />
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-white mb-2">{selectedContent.title}</h1>
                      <div className="flex items-center gap-3 text-sm text-white/60 mb-2">
                        <Badge className={`text-xs ${getDifficultyColor(selectedContent.difficulty)}`}>
                          {selectedContent.difficulty}
                        </Badge>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{selectedContent.duration}</span>
                        <span>•</span>
                        <span>By {selectedContent.author}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{selectedContent.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{selectedContent.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{selectedContent.rating} rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContent(null)} className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => toggleBookmark(selectedContent.id)}
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${bookmarkedItems.includes(selectedContent.id) ? 'fill-current' : ''}`} />
                    {bookmarkedItems.includes(selectedContent.id) ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  {selectedContent.downloadUrl && (
                    <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Content Body */}
              <ScrollArea className="flex-1 p-6">
                {selectedContent.type === 'video' && selectedContent.videoUrl && (
                  <div className="mb-6">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-gray-700">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                        <p className="text-white/60">Video Player</p>
                        <p className="text-sm text-white/40">Duration: {selectedContent.duration}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-white/80 leading-relaxed">
                    {selectedContent.content}
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.tags.map((tag) => (
                      <Badge key={tag} className="bg-primary/10 text-primary border border-primary/30 text-xs">
                        {tag}
                      </Badge>
                    ))}
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
