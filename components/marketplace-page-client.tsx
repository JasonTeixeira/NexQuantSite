"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, Star, TrendingUp, TrendingDown, DollarSign, Users, Calendar, BarChart3, Shield, Award, Eye, Download, Heart, MessageCircle, Share2, Play, Pause, Code, Image, FileText, Zap, Target, Activity, Clock, Percent, ArrowUpRight, ArrowDownRight, Crown, Verified, ChevronDown, SortAsc, Grid3X3, List, Plus } from 'lucide-react'

// Mock data for strategies
const mockStrategies = [
  {
    id: 1,
    title: "BTC Momentum Master",
    description: "Advanced momentum strategy for Bitcoin with 73% win rate and 2.4 Sharpe ratio",
    author: {
      name: "Alex Chen",
      avatar: "",
      verified: true,
      level: "Diamond",
      followers: 2847,
      strategies: 12
    },
    price: 299,
    originalPrice: 399,
    category: "Cryptocurrency",
    tags: ["Bitcoin", "Momentum", "High-Frequency"],
    rating: 4.8,
    reviews: 156,
    sales: 1247,
    performance: {
      winRate: 73.2,
      sharpeRatio: 2.4,
      maxDrawdown: -8.5,
      totalReturn: 284.7,
      avgTrade: 2.3,
      profitFactor: 1.85
    },
    images: ["/placeholder.svg?height=300&width=400&text=Strategy+Chart"],
    featured: true,
    bestseller: true,
    createdAt: "2024-01-15",
    lastUpdated: "2024-01-20",
    complexity: "Advanced",
    timeframe: "1h - 4h",
    minCapital: 10000,
    backtestPeriod: "2 years",
    liveResults: true
  },
  {
    id: 2,
    title: "ETH Scalping Pro",
    description: "High-frequency scalping strategy for Ethereum with consistent daily profits",
    author: {
      name: "Sarah Johnson",
      avatar: "",
      verified: true,
      level: "Gold",
      followers: 1523,
      strategies: 8
    },
    price: 199,
    category: "Cryptocurrency",
    tags: ["Ethereum", "Scalping", "Day Trading"],
    rating: 4.6,
    reviews: 89,
    sales: 634,
    performance: {
      winRate: 68.5,
      sharpeRatio: 1.9,
      maxDrawdown: -12.3,
      totalReturn: 156.8,
      avgTrade: 1.8,
      profitFactor: 1.62
    },
    images: ["/placeholder.svg?height=300&width=400&text=ETH+Strategy"],
    featured: false,
    bestseller: false,
    createdAt: "2024-01-10",
    lastUpdated: "2024-01-18",
    complexity: "Intermediate",
    timeframe: "5m - 15m",
    minCapital: 5000,
    backtestPeriod: "18 months",
    liveResults: true
  },
  {
    id: 3,
    title: "S&P 500 Mean Reversion",
    description: "Statistical arbitrage strategy for S&P 500 stocks with low risk profile",
    author: {
      name: "Michael Rodriguez",
      avatar: "",
      verified: false,
      level: "Silver",
      followers: 892,
      strategies: 5
    },
    price: 149,
    category: "Stocks",
    tags: ["S&P 500", "Mean Reversion", "Low Risk"],
    rating: 4.4,
    reviews: 67,
    sales: 423,
    performance: {
      winRate: 71.8,
      sharpeRatio: 1.7,
      maxDrawdown: -6.2,
      totalReturn: 89.4,
      avgTrade: 1.2,
      profitFactor: 1.45
    },
    images: ["/placeholder.svg?height=300&width=400&text=S&P+Strategy"],
    featured: false,
    bestseller: false,
    createdAt: "2024-01-05",
    lastUpdated: "2024-01-15",
    complexity: "Beginner",
    timeframe: "1d",
    minCapital: 25000,
    backtestPeriod: "3 years",
    liveResults: false
  },
  {
    id: 4,
    title: "Forex Carry Trade Elite",
    description: "Professional carry trade strategy for major currency pairs with hedging",
    author: {
      name: "Emma Thompson",
      avatar: "",
      verified: true,
      level: "Diamond",
      followers: 3241,
      strategies: 15
    },
    price: 399,
    category: "Forex",
    tags: ["Carry Trade", "Currency", "Hedging"],
    rating: 4.9,
    reviews: 203,
    sales: 856,
    performance: {
      winRate: 76.3,
      sharpeRatio: 2.1,
      maxDrawdown: -9.8,
      totalReturn: 198.5,
      avgTrade: 2.8,
      profitFactor: 1.92
    },
    images: ["/placeholder.svg?height=300&width=400&text=Forex+Strategy"],
    featured: true,
    bestseller: true,
    createdAt: "2023-12-20",
    lastUpdated: "2024-01-22",
    complexity: "Expert",
    timeframe: "1d - 1w",
    minCapital: 50000,
    backtestPeriod: "5 years",
    liveResults: true
  }
]

const categories = ["All", "Cryptocurrency", "Stocks", "Forex", "Options", "Futures", "Commodities"]
const complexityLevels = ["All", "Beginner", "Intermediate", "Advanced", "Expert"]
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "bestseller", label: "Best Sellers" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "sales", label: "Most Popular" }
]

export default function MarketplacePageClient() {
  const [strategies, setStrategies] = useState(mockStrategies)
  const [filteredStrategies, setFilteredStrategies] = useState(mockStrategies)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedComplexity, setSelectedComplexity] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)

  // Filter and sort strategies
  useEffect(() => {
    let filtered = strategies.filter(strategy => {
      const matchesSearch = strategy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           strategy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === "All" || strategy.category === selectedCategory
      const matchesComplexity = selectedComplexity === "All" || strategy.complexity === selectedComplexity
      const matchesPrice = strategy.price >= priceRange[0] && strategy.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesComplexity && matchesPrice
    })

    // Sort strategies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        case "bestseller":
          return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0)
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "sales":
          return b.sales - a.sales
        default:
          return 0
      }
    })

    setFilteredStrategies(filtered)
  }, [strategies, searchQuery, selectedCategory, selectedComplexity, priceRange, sortBy])

  const StrategyCard = ({ strategy, isListView = false }: { strategy: any, isListView?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group ${isListView ? 'flex' : ''}`}
    >
      <Card className={`bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 ${isListView ? 'flex-row w-full' : ''}`}>
        <div className={`relative ${isListView ? 'w-80 shrink-0' : ''}`}>
          <div className={`relative overflow-hidden ${isListView ? 'h-48' : 'h-48'} bg-gradient-to-br from-gray-800 to-gray-900`}>
            <img 
              src={strategy.images[0] || "/placeholder.svg"} 
              alt={strategy.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {strategy.featured && (
                <Badge className="bg-primary/90 text-black font-semibold">
                  <Crown className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {strategy.bestseller && (
                <Badge className="bg-orange-500/90 text-white font-semibold">
                  <Award className="w-3 h-3 mr-1" />
                  Bestseller
                </Badge>
              )}
            </div>

            {/* Performance indicator */}
            <div className="absolute top-3 right-3">
              <Badge className={`${strategy.performance.totalReturn > 100 ? 'bg-green-500/90' : 'bg-blue-500/90'} text-white`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                +{strategy.performance.totalReturn}%
              </Badge>
            </div>

            {/* Quick actions */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="bg-black/80 hover:bg-black">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="bg-black/80 hover:bg-black">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className={`p-6 ${isListView ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {strategy.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {strategy.description}
              </p>
            </div>
            <div className="text-right ml-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-primary">${strategy.price}</span>
                {strategy.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">${strategy.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{strategy.rating}</span>
                <span>({strategy.reviews})</span>
              </div>
            </div>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-8 h-8 border-2 border-primary/50">
              <AvatarImage src={strategy.author.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-green-400 text-black text-sm font-bold">
                {strategy.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{strategy.author.name}</span>
                {strategy.author.verified && (
                  <Verified className="w-4 h-4 text-blue-400" />
                )}
                <Badge className={`text-xs ${
                  strategy.author.level === 'Diamond' ? 'bg-purple-500/20 text-purple-400' :
                  strategy.author.level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {strategy.author.level}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {strategy.author.followers.toLocaleString()} followers • {strategy.author.strategies} strategies
              </div>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{strategy.performance.winRate}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{strategy.performance.sharpeRatio}</div>
              <div className="text-xs text-gray-500">Sharpe Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{strategy.performance.maxDrawdown}%</div>
              <div className="text-xs text-gray-500">Max Drawdown</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {strategy.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-700 text-gray-400">
                {tag}
              </Badge>
            ))}
            {strategy.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                +{strategy.tags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[90vh]">
                <StrategyDetailModal strategy={strategy} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Sales info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {strategy.sales.toLocaleString()} sales
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Updated {new Date(strategy.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <Badge className={`text-xs ${
              strategy.complexity === 'Expert' ? 'bg-red-500/20 text-red-400' :
              strategy.complexity === 'Advanced' ? 'bg-orange-500/20 text-orange-400' :
              strategy.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {strategy.complexity}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const StrategyDetailModal = ({ strategy }: { strategy: any }) => (
    <ScrollArea className="max-h-[80vh]">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
          {strategy.title}
          {strategy.featured && (
            <Badge className="bg-primary/90 text-black">
              <Crown className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy image */}
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
            <img 
              src={strategy.images[0] || "/placeholder.svg"} 
              alt={strategy.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Strategy Description</h3>
            <p className="text-gray-300 leading-relaxed">
              {strategy.description}. This strategy has been carefully backtested over multiple market conditions 
              and has shown consistent performance across different time periods. The algorithm uses advanced 
              technical indicators combined with machine learning techniques to identify optimal entry and exit points.
            </p>
          </div>

          {/* Performance metrics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{strategy.performance.winRate}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{strategy.performance.sharpeRatio}</div>
                <div className="text-sm text-gray-400">Sharpe Ratio</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{strategy.performance.maxDrawdown}%</div>
                <div className="text-sm text-gray-400">Max Drawdown</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">+{strategy.performance.totalReturn}%</div>
                <div className="text-sm text-gray-400">Total Return</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{strategy.performance.profitFactor}</div>
                <div className="text-sm text-gray-400">Profit Factor</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{strategy.performance.avgTrade}%</div>
                <div className="text-sm text-gray-400">Avg Trade</div>
              </div>
            </div>
          </div>

          {/* Strategy details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Strategy Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Complexity:</span>
                  <Badge className={`${
                    strategy.complexity === 'Expert' ? 'bg-red-500/20 text-red-400' :
                    strategy.complexity === 'Advanced' ? 'bg-orange-500/20 text-orange-400' :
                    strategy.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {strategy.complexity}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timeframe:</span>
                  <span className="text-white">{strategy.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Capital:</span>
                  <span className="text-white">${strategy.minCapital.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Backtest Period:</span>
                  <span className="text-white">{strategy.backtestPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Live Results:</span>
                  <Badge className={strategy.liveResults ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                    {strategy.liveResults ? 'Available' : 'Backtest Only'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white">{strategy.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Reviews ({strategy.reviews})</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((review) => (
                <div key={review} className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-green-400 text-black text-sm">
                        U{review}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">User {review}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">2 days ago</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Excellent strategy! Been using it for 3 months and seeing consistent profits. 
                    The documentation is clear and the support is responsive.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">${strategy.price}</span>
                  {strategy.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">${strategy.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white">{strategy.rating}</span>
                  <span className="text-gray-400">({strategy.reviews} reviews)</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90 text-black font-semibold">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Purchase Strategy
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Code
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Author
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Instant download after purchase</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 border-2 border-primary/50">
                  <AvatarImage src={strategy.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-green-400 text-black font-bold">
                    {strategy.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{strategy.author.name}</span>
                    {strategy.author.verified && (
                      <Verified className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <Badge className={`text-xs ${
                    strategy.author.level === 'Diamond' ? 'bg-purple-500/20 text-purple-400' :
                    strategy.author.level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {strategy.author.level} Trader
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{strategy.author.followers.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{strategy.author.strategies}</div>
                  <div className="text-xs text-gray-500">Strategies</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                  <Users className="w-4 h-4 mr-2" />
                  Follow Author
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <h4 className="font-semibold text-white mb-4">Strategy Stats</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sales:</span>
                  <span className="text-white">{strategy.sales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Views:</span>
                  <span className="text-white">12.4K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Favorites:</span>
                  <span className="text-white">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(strategy.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">{new Date(strategy.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              Strategy Marketplace
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Discover, buy, and sell proven trading strategies from top traders worldwide. 
            Browse thousands of backtested strategies with verified performance metrics.
          </p>
          
          {/* Quick stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2,847</div>
              <div className="text-sm text-gray-500">Active Strategies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">156K+</div>
              <div className="text-sm text-gray-500">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-gray-500">Avg Rating</div>
            </div>
          </div>

          <Button asChild className="bg-primary hover:bg-primary/90 text-black font-semibold">
            <Link href="/marketplace/sell">
              <Plus className="w-4 h-4 mr-2" />
              Start Selling Your Strategies
            </Link>
          </Button>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search strategies, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Quick filters */}
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-700 text-gray-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-primary text-black' : 'text-gray-400'}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-primary text-black' : 'text-gray-400'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-800"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Complexity Level
                      </label>
                      <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {complexityLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={500}
                        step={10}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedCategory("All")
                          setSelectedComplexity("All")
                          setPriceRange([0, 500])
                          setSortBy("featured")
                        }}
                        className="border-gray-700 text-gray-300"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-400">
            Showing {filteredStrategies.length} of {strategies.length} strategies
          </div>
        </div>

        {/* Strategy grid/list */}
        <motion.div
          layout
          className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-6'
          }`}
        >
          <AnimatePresence>
            {filteredStrategies.map((strategy) => (
              <StrategyCard 
                key={strategy.id} 
                strategy={strategy} 
                isListView={viewMode === 'list'} 
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load more */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border-gray-700 text-gray-300">
            Load More Strategies
          </Button>
        </div>
      </div>
    </div>
  )
}
