"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, GitBranch, Crosshair, Zap, Atom, Play, Pause, TrendingUp, Activity, Target, BarChart3, Sparkles, ArrowRight, CheckCircle, Clock, DollarSign, Settings, Shield, Rocket, Brain, Eye, Filter, Search, Star, Award, Users, Calendar, TrendingDown, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, Download, Share2, Bookmark, Heart, MessageSquare, ThumbsUp, Layers, Database, Wifi, Lock, Gauge, LineChart, PieChart, RotateCcw, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

// Enhanced trading bots with more comprehensive data
const tradingBots = [
  {
    id: "quantum",
    name: "Q",
    title: "Quantum Momentum Engine",
    description:
      "Analyzes market momentum across multiple timeframes to identify high-probability trend continuations with quantum-inspired algorithms.",
    longDescription: "The Quantum Momentum Engine represents the pinnacle of algorithmic trading technology, utilizing quantum-inspired computational methods to analyze market momentum patterns across multiple timeframes simultaneously. This sophisticated bot employs advanced pattern recognition algorithms that can identify subtle market shifts before they become apparent to traditional analysis methods.",
    icon: Cpu,
    category: "Momentum",
    accuracy: 87,
    trades: 2847,
    winRate: 73,
    avgReturn: 2.4,
    maxDrawdown: 8.2,
    sharpeRatio: 1.85,
    timeframe: "1m-4h",
    complexity: 5,
    riskLevel: "Medium-High",
    minCapital: 1000,
    maxCapital: 100000,
    status: "Active",
    version: "v3.2.1",
    lastUpdate: "2024-12-01",
    features: [
      "Multi-timeframe momentum analysis",
      "Quantum-inspired pattern recognition",
      "Dynamic position sizing",
      "Real-time trend confirmation",
      "Advanced risk management",
      "Machine learning adaptation",
      "Market regime detection",
      "Volatility-adjusted entries",
    ],
    useCases: ["Trend Following", "Momentum Trading", "Breakout Strategies", "Swing Trading"],
    performance: {
      daily: 85,
      weekly: 78,
      monthly: 92,
      yearly: 88,
      allTime: 156,
    },
    monthlyReturns: [
      { month: "Jan", return: 12.5 },
      { month: "Feb", return: 8.3 },
      { month: "Mar", return: -2.1 },
      { month: "Apr", return: 15.7 },
      { month: "May", return: 9.2 },
      { month: "Jun", return: 11.8 },
      { month: "Jul", return: 6.4 },
      { month: "Aug", return: 13.9 },
      { month: "Sep", return: 7.6 },
      { month: "Oct", return: 10.3 },
      { month: "Nov", return: 14.2 },
      { month: "Dec", return: 8.7 },
    ],
    gradient: "from-blue-500/20 via-cyan-500/20 to-blue-600/20",
    glowColor: "shadow-blue-500/50",
    rating: 4.8,
    reviews: 342,
    deployments: 1247,
    favorites: 892,
    tags: ["AI", "Quantum", "High-Frequency", "Momentum", "Advanced"],
    pros: [
      "Exceptional trend detection accuracy",
      "Low latency execution",
      "Adaptive to market conditions",
      "Strong risk management",
      "Consistent performance",
    ],
    cons: [
      "Requires higher minimum capital",
      "Complex parameter tuning",
      "May struggle in sideways markets",
    ],
    technicalSpecs: {
      algorithm: "Quantum-inspired Neural Networks",
      dataPoints: "50+ technical indicators",
      executionSpeed: "< 10ms",
      backtestPeriod: "5 years",
      optimizationFreq: "Daily",
    },
  },
  {
    id: "reversal",
    name: "R",
    title: "Reversal Recognition Matrix",
    description:
      "Detects potential market reversals by identifying key exhaustion points and divergences in price action using advanced pattern recognition.",
    longDescription: "The Reversal Recognition Matrix is a sophisticated trading algorithm designed to identify potential market turning points with unprecedented accuracy. By analyzing exhaustion patterns, divergences, and market microstructure, this bot can detect reversal opportunities that traditional indicators often miss.",
    icon: GitBranch,
    category: "Reversal",
    accuracy: 82,
    trades: 1923,
    winRate: 69,
    avgReturn: 3.1,
    maxDrawdown: 12.5,
    sharpeRatio: 1.62,
    timeframe: "5m-1d",
    complexity: 4,
    riskLevel: "Medium",
    minCapital: 500,
    maxCapital: 50000,
    status: "Active",
    version: "v2.8.3",
    lastUpdate: "2024-11-28",
    features: [
      "Exhaustion point detection",
      "Divergence analysis",
      "Support/resistance mapping",
      "Volume confirmation signals",
      "Multi-indicator convergence",
      "Pattern recognition AI",
      "Market sentiment analysis",
      "Reversal probability scoring",
    ],
    useCases: ["Reversal Trading", "Counter-trend", "Swing Trading", "Mean Reversion"],
    performance: {
      daily: 79,
      weekly: 84,
      monthly: 81,
      yearly: 85,
      allTime: 142,
    },
    monthlyReturns: [
      { month: "Jan", return: 9.2 },
      { month: "Feb", return: 11.7 },
      { month: "Mar", return: 5.3 },
      { month: "Apr", return: -1.8 },
      { month: "May", return: 13.4 },
      { month: "Jun", return: 8.9 },
      { month: "Jul", return: 12.1 },
      { month: "Aug", return: 6.7 },
      { month: "Sep", return: 9.8 },
      { month: "Oct", return: 14.3 },
      { month: "Nov", return: 7.2 },
      { month: "Dec", return: 10.5 },
    ],
    gradient: "from-purple-500/20 via-pink-500/20 to-purple-600/20",
    glowColor: "shadow-purple-500/50",
    rating: 4.6,
    reviews: 287,
    deployments: 934,
    favorites: 671,
    tags: ["Reversal", "Pattern Recognition", "Counter-trend", "AI"],
    pros: [
      "Excellent reversal detection",
      "Works well in volatile markets",
      "Strong risk-reward ratios",
      "Adaptive algorithms",
    ],
    cons: [
      "Lower trade frequency",
      "Requires patience",
      "Can be whipsawed in trends",
    ],
    technicalSpecs: {
      algorithm: "Deep Learning Pattern Recognition",
      dataPoints: "40+ reversal indicators",
      executionSpeed: "< 15ms",
      backtestPeriod: "4 years",
      optimizationFreq: "Weekly",
    },
  },
  {
    id: "execution",
    name: "X",
    title: "Execution Precision Protocol",
    description:
      "Focuses on sniper-like entries and exits, minimizing slippage and maximizing risk-to-reward ratios with institutional-grade execution.",
    longDescription: "The Execution Precision Protocol is engineered for traders who demand institutional-grade execution quality. This bot specializes in precise market timing, utilizing advanced order routing algorithms and liquidity analysis to ensure optimal trade execution with minimal slippage.",
    icon: Crosshair,
    category: "Execution",
    accuracy: 91,
    trades: 3456,
    winRate: 76,
    avgReturn: 1.8,
    maxDrawdown: 5.7,
    sharpeRatio: 2.14,
    timeframe: "1m-1h",
    complexity: 5,
    riskLevel: "Low-Medium",
    minCapital: 2000,
    maxCapital: 200000,
    status: "Active",
    version: "v4.1.0",
    lastUpdate: "2024-12-05",
    features: [
      "Precision entry/exit timing",
      "Slippage minimization",
      "Smart order routing",
      "Liquidity analysis",
      "Execution cost optimization",
      "Market impact modeling",
      "Latency arbitrage",
      "Order flow analysis",
    ],
    useCases: ["Scalping", "High-frequency", "Precision Trading", "Arbitrage"],
    performance: {
      daily: 93,
      weekly: 89,
      monthly: 91,
      yearly: 90,
      allTime: 178,
    },
    monthlyReturns: [
      { month: "Jan", return: 7.8 },
      { month: "Feb", return: 9.1 },
      { month: "Mar", return: 6.4 },
      { month: "Apr", return: 8.7 },
      { month: "May", return: 5.9 },
      { month: "Jun", return: 7.3 },
      { month: "Jul", return: 8.8 },
      { month: "Aug", return: 6.2 },
      { month: "Sep", return: 9.4 },
      { month: "Oct", return: 7.6 },
      { month: "Nov", return: 8.3 },
      { month: "Dec", return: 6.8 },
    ],
    gradient: "from-green-500/20 via-emerald-500/20 to-green-600/20",
    glowColor: "shadow-green-500/50",
    rating: 4.9,
    reviews: 456,
    deployments: 1589,
    favorites: 1203,
    tags: ["Precision", "Low-Latency", "Institutional", "Scalping"],
    pros: [
      "Exceptional execution quality",
      "Minimal slippage",
      "High win rate",
      "Low drawdown",
      "Consistent returns",
    ],
    cons: [
      "Lower individual trade profits",
      "Requires stable connection",
      "High complexity setup",
    ],
    technicalSpecs: {
      algorithm: "Advanced Order Flow Analysis",
      dataPoints: "Real-time market microstructure",
      executionSpeed: "< 5ms",
      backtestPeriod: "3 years",
      optimizationFreq: "Real-time",
    },
  },
  {
    id: "oracle",
    name: "O",
    title: "Oracle Volatility Scanner",
    description:
      "Scans for unusual volatility spikes and breakout opportunities, capitalizing on rapid market movements with predictive analytics.",
    longDescription: "The Oracle Volatility Scanner is a cutting-edge algorithm that specializes in detecting and capitalizing on volatility events. Using predictive analytics and real-time market scanning, this bot identifies unusual volatility spikes before they fully materialize, providing traders with early entry opportunities.",
    icon: Zap,
    category: "Volatility",
    accuracy: 84,
    trades: 2134,
    winRate: 71,
    avgReturn: 2.9,
    maxDrawdown: 11.3,
    sharpeRatio: 1.73,
    timeframe: "1m-2h",
    complexity: 4,
    riskLevel: "Medium-High",
    minCapital: 750,
    maxCapital: 75000,
    status: "Active",
    version: "v3.0.7",
    lastUpdate: "2024-11-30",
    features: [
      "Volatility spike detection",
      "Breakout prediction",
      "News event correlation",
      "Market sentiment analysis",
      "Rapid execution protocols",
      "Volatility forecasting",
      "Event-driven trading",
      "Risk-adjusted positioning",
    ],
    useCases: ["Volatility Trading", "News Trading", "Breakout Strategies", "Event Trading"],
    performance: {
      daily: 86,
      weekly: 82,
      monthly: 84,
      yearly: 83,
      allTime: 134,
    },
    monthlyReturns: [
      { month: "Jan", return: 11.3 },
      { month: "Feb", return: 6.8 },
      { month: "Mar", return: 14.2 },
      { month: "Apr", return: 9.7 },
      { month: "May", return: -3.1 },
      { month: "Jun", return: 12.8 },
      { month: "Jul", return: 8.4 },
      { month: "Aug", return: 15.6 },
      { month: "Sep", return: 7.9 },
      { month: "Oct", return: 13.1 },
      { month: "Nov", return: 9.2 },
      { month: "Dec", return: 11.7 },
    ],
    gradient: "from-yellow-500/20 via-orange-500/20 to-yellow-600/20",
    glowColor: "shadow-yellow-500/50",
    rating: 4.7,
    reviews: 298,
    deployments: 876,
    favorites: 743,
    tags: ["Volatility", "Breakout", "News Trading", "Predictive"],
    pros: [
      "Excellent volatility detection",
      "Fast reaction to market events",
      "High profit potential",
      "News integration",
    ],
    cons: [
      "Higher risk exposure",
      "Sensitive to false breakouts",
      "Requires active monitoring",
    ],
    technicalSpecs: {
      algorithm: "Volatility Prediction Models",
      dataPoints: "Real-time volatility metrics",
      executionSpeed: "< 8ms",
      backtestPeriod: "4 years",
      optimizationFreq: "Daily",
    },
  },
  {
    id: "zenith",
    name: "Z",
    title: "Zenith Mean Reversion",
    description:
      "Identifies over-extended assets and trades the statistical probability of price returning to its historical mean with advanced statistical models.",
    longDescription: "The Zenith Mean Reversion bot employs sophisticated statistical models to identify over-extended price movements and capitalize on the natural tendency of prices to revert to their historical means. This strategy is particularly effective in range-bound markets and during periods of market overreaction.",
    icon: Atom,
    category: "Mean Reversion",
    accuracy: 79,
    trades: 1876,
    winRate: 68,
    avgReturn: 2.2,
    maxDrawdown: 9.8,
    sharpeRatio: 1.54,
    timeframe: "15m-4h",
    complexity: 3,
    riskLevel: "Medium",
    minCapital: 500,
    maxCapital: 40000,
    status: "Active",
    version: "v2.5.2",
    lastUpdate: "2024-11-25",
    features: [
      "Statistical mean analysis",
      "Over-extension detection",
      "Probability modeling",
      "Historical pattern matching",
      "Risk-adjusted positioning",
      "Regression analysis",
      "Z-score calculations",
      "Bollinger Band integration",
    ],
    useCases: ["Mean Reversion", "Statistical Arbitrage", "Range Trading", "Pairs Trading"],
    performance: {
      daily: 77,
      weekly: 81,
      monthly: 79,
      yearly: 80,
      allTime: 128,
    },
    monthlyReturns: [
      { month: "Jan", return: 8.4 },
      { month: "Feb", return: 6.7 },
      { month: "Mar", return: 9.1 },
      { month: "Apr", return: 7.3 },
      { month: "May", return: 5.8 },
      { month: "Jun", return: 8.9 },
      { month: "Jul", return: 6.2 },
      { month: "Aug", return: 7.6 },
      { month: "Sep", return: 8.8 },
      { month: "Oct", return: 5.4 },
      { month: "Nov", return: 9.3 },
      { month: "Dec", return: 7.1 },
    ],
    gradient: "from-red-500/20 via-rose-500/20 to-red-600/20",
    glowColor: "shadow-red-500/50",
    rating: 4.4,
    reviews: 234,
    deployments: 567,
    favorites: 423,
    tags: ["Mean Reversion", "Statistical", "Range Trading", "Conservative"],
    pros: [
      "Consistent in ranging markets",
      "Lower risk profile",
      "Good for beginners",
      "Stable returns",
    ],
    cons: [
      "Struggles in strong trends",
      "Lower profit potential",
      "Requires patience",
    ],
    technicalSpecs: {
      algorithm: "Statistical Mean Reversion Models",
      dataPoints: "30+ statistical indicators",
      executionSpeed: "< 20ms",
      backtestPeriod: "6 years",
      optimizationFreq: "Weekly",
    },
  },
]

const categories = ["All", "Momentum", "Reversal", "Execution", "Volatility", "Mean Reversion"]
const sortOptions = ["Performance", "Accuracy", "Win Rate", "Popularity", "Newest", "Rating"]
const riskLevels = ["All", "Low", "Low-Medium", "Medium", "Medium-High", "High"]

const stats = [
  { label: "Active Bots", value: "5", icon: Activity, change: "+2", trend: "up" },
  { label: "Total Trades", value: "12.2K+", icon: BarChart3, change: "+1.2K", trend: "up" },
  { label: "Avg Accuracy", value: "84.6%", icon: Target, change: "+2.1%", trend: "up" },
  { label: "Combined ROI", value: "247%", icon: TrendingUp, change: "+18%", trend: "up" },
]

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Quantitative Trader",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "The Quantum bot has transformed my trading. Consistent 15%+ monthly returns with minimal drawdown.",
    bot: "Quantum Momentum Engine",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Portfolio Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Execution Precision Protocol delivers institutional-grade performance. Best slippage control I've seen.",
    bot: "Execution Precision Protocol",
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "Hedge Fund Analyst",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    text: "Oracle's volatility detection is phenomenal. Caught every major market move this quarter.",
    bot: "Oracle Volatility Scanner",
  },
]

export default function BotsPageClient() {
  const [selectedBot, setSelectedBot] = useState(tradingBots[0])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Performance")
  const [riskFilter, setRiskFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [minCapital, setMinCapital] = useState([500])
  const [maxCapital, setMaxCapital] = useState([200000])
  const [minAccuracy, setMinAccuracy] = useState([70])
  const [selectedView, setSelectedView] = useState("overview")
  const [expandedBot, setExpandedBot] = useState<string | null>(null)
  const [favoritesBots, setFavoritesBots] = useState<string[]>([])
  const [comparisonBots, setComparisonBots] = useState<string[]>([])

  // Auto-rotation logic
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const filteredBots = getFilteredBots()
        const nextIndex = (prev + 1) % filteredBots.length
        setSelectedBot(filteredBots[nextIndex])
        return nextIndex
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoRotating, selectedCategory, searchQuery, riskFilter, sortBy])

  const getFilteredBots = () => {
    let filtered = tradingBots

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((bot) => bot.category === selectedCategory)
    }

    // Risk filter
    if (riskFilter !== "All") {
      filtered = filtered.filter((bot) => bot.riskLevel.includes(riskFilter))
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((bot) =>
        bot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Capital filter
    filtered = filtered.filter((bot) => 
      bot.minCapital >= minCapital[0] && bot.maxCapital <= maxCapital[0]
    )

    // Accuracy filter
    filtered = filtered.filter((bot) => bot.accuracy >= minAccuracy[0])

    // Sort
    switch (sortBy) {
      case "Performance":
        filtered.sort((a, b) => b.performance.yearly - a.performance.yearly)
        break
      case "Accuracy":
        filtered.sort((a, b) => b.accuracy - a.accuracy)
        break
      case "Win Rate":
        filtered.sort((a, b) => b.winRate - a.winRate)
        break
      case "Popularity":
        filtered.sort((a, b) => b.deployments - a.deployments)
        break
      case "Rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "Newest":
        filtered.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
        break
    }

    return filtered
  }

  const filteredBots = getFilteredBots()

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const newFilteredBots = getFilteredBots()
    if (newFilteredBots.length > 0) {
      setSelectedBot(newFilteredBots[0])
      setCurrentIndex(0)
    }
  }

  const handleBotSelect = (bot: typeof tradingBots[0]) => {
    setSelectedBot(bot)
    setIsAutoRotating(false)
    const botIndex = filteredBots.findIndex((b) => b.id === bot.id)
    setCurrentIndex(botIndex)
  }

  const toggleFavorite = (botId: string) => {
    setFavoritesBots(prev => 
      prev.includes(botId) 
        ? prev.filter(id => id !== botId)
        : [...prev, botId]
    )
  }

  const toggleComparison = (botId: string) => {
    setComparisonBots(prev => {
      if (prev.includes(botId)) {
        return prev.filter(id => id !== botId)
      } else if (prev.length < 3) {
        return [...prev, botId]
      }
      return prev
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-400"
      case "Low-Medium": return "text-yellow-400"
      case "Medium": return "text-orange-400"
      case "Medium-High": return "text-red-400"
      case "High": return "text-red-500"
      default: return "text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-600"
      case "Beta": return "bg-yellow-600"
      case "Maintenance": return "bg-red-600"
      default: return "bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Floating geometric shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute w-20 h-20 border border-primary/10 rounded-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge
                variant="outline"
                className="mb-6 px-6 py-3 text-sm font-mono border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                WORLD-CLASS AI TRADING BOTS
              </Badge>

              <h1 className="text-6xl md:text-8xl font-bold mb-8 font-mono leading-tight">
                <span className="text-white">NEXURAL</span>{" "}
                <span className="bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent">
                  TRADING BOTS
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 max-w-5xl mx-auto mb-12 leading-relaxed">
                Experience the future of algorithmic trading with our proprietary suite of AI-powered bots. 
                Each bot is engineered for institutional-grade performance, powered by advanced machine learning 
                algorithms and real-time market analysis.
              </p>

              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                    className="text-center group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                      <div className={`text-xs flex items-center justify-center gap-1 ${
                        stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold px-8 py-4 text-lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Deploy Bot Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary px-8 py-4 text-lg bg-transparent"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
