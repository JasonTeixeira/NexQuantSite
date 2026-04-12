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
    <div className="min-h-screen bg-black text-white">
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

        {/* Advanced Filters & Search */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Search and Quick Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search bots by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12 text-lg"
                  />
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                          {category !== "All" && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {tradingBots.filter((bot) => bot.category === category).length}
                            </Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary h-12 px-6"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced
                    {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Panel */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-3">
                        <Label className="text-gray-300">Risk Level</Label>
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {riskLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-gray-300">Min Capital: ${minCapital[0].toLocaleString()}</Label>
                        <Slider
                          value={minCapital}
                          onValueChange={setMinCapital}
                          max={10000}
                          min={100}
                          step={100}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-gray-300">Max Capital: ${maxCapital[0].toLocaleString()}</Label>
                        <Slider
                          value={maxCapital}
                          onValueChange={setMaxCapital}
                          max={500000}
                          min={1000}
                          step={1000}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-gray-300">Min Accuracy: {minAccuracy[0]}%</Label>
                        <Slider
                          value={minAccuracy}
                          onValueChange={setMinAccuracy}
                          max={95}
                          min={60}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                      <div className="text-sm text-gray-400">
                        Showing {filteredBots.length} of {tradingBots.length} bots
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory("All")
                          setRiskFilter("All")
                          setSearchQuery("")
                          setMinCapital([500])
                          setMaxCapital([200000])
                          setMinAccuracy([70])
                        }}
                        className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Filters
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View Toggle */}
              <div className="flex justify-center">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-1">
                  <div className="flex gap-1">
                    <Button
                      variant={selectedView === "overview" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedView("overview")}
                      className={selectedView === "overview" ? "bg-primary text-black" : "text-gray-400 hover:text-white"}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Overview
                    </Button>
                    <Button
                      variant={selectedView === "detailed" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedView("detailed")}
                      className={selectedView === "detailed" ? "bg-primary text-black" : "text-gray-400 hover:text-white"}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Detailed
                    </Button>
                    <Button
                      variant={selectedView === "comparison" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedView("comparison")}
                      className={selectedView === "comparison" ? "bg-primary text-black" : "text-gray-400 hover:text-white"}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Compare ({comparisonBots.length})
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Bot Showcase */}
        {selectedView === "overview" && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Auto-rotation Controls */}
              <div className="flex items-center justify-center gap-6 mb-16">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary"
                >
                  {isAutoRotating ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Auto-Rotation
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Auto-Rotation
                    </>
                  )}
                </Button>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Showing {currentIndex + 1} of {filteredBots.length} bots
                </div>
                <div className="flex gap-2">
                  {filteredBots.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-primary' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Featured Bot Display */}
              <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
                {/* Bot Details */}
                <motion.div
                  key={selectedBot.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <div className="flex items-start gap-6">
                    <div
                      className={`w-24 h-24 bg-gradient-to-br ${selectedBot.gradient} backdrop-blur-sm border border-gray-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <selectedBot.icon className="w-12 h-12 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-7xl font-mono font-bold text-gray-800">{selectedBot.name}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-primary/50 text-primary">
                            {selectedBot.category}
                          </Badge>
                          <Badge className={getStatusColor(selectedBot.status)}>
                            {selectedBot.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(selectedBot.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-400 ml-2">
                            {selectedBot.rating} ({selectedBot.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedBot.deployments.toLocaleString()} deployments
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {selectedBot.favorites.toLocaleString()} favorites
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-4xl font-bold text-white mb-4 font-mono">{selectedBot.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">{selectedBot.longDescription}</p>

                    {/* Enhanced Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Risk Level</div>
                        <div className={`text-lg font-semibold ${getRiskColor(selectedBot.riskLevel)}`}>
                          {selectedBot.riskLevel}
                        </div>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Complexity</div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < selectedBot.complexity ? "bg-primary" : "bg-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">{selectedBot.complexity}/5</span>
                        </div>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Min Capital</div>
                        <div className="text-lg font-semibold text-white">
                          ${selectedBot.minCapital.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Version</div>
                        <div className="text-lg font-semibold text-white">{selectedBot.version}</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Features */}
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedBot.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          className="flex items-center gap-3 p-3 bg-gray-900/20 rounded-lg hover:bg-gray-900/40 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBot.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 bg-primary text-black hover:bg-primary/90 font-semibold py-3" size="lg">
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy {selectedBot.name} Bot
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => toggleFavorite(selectedBot.id)}
                      className={`border-gray-700 hover:border-primary/50 ${
                        favoritesBots.includes(selectedBot.id) ? 'text-red-400 border-red-400' : 'text-gray-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favoritesBots.includes(selectedBot.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Enhanced Performance Metrics */}
                <motion.div
                  key={`${selectedBot.id}-metrics`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-1">{selectedBot.accuracy}%</div>
                          <div className="text-sm text-gray-400">Accuracy</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-1">{selectedBot.winRate}%</div>
                          <div className="text-sm text-gray-400">Win Rate</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-1">
                            {selectedBot.trades.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">Total Trades</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-1">{selectedBot.avgReturn}%</div>
                          <div className="text-sm text-gray-400">Avg Return</div>
                        </div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">{selectedBot.maxDrawdown}%</div>
                          <div className="text-sm text-gray-400">Max Drawdown</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-400 mb-1">{selectedBot.sharpeRatio}</div>
                          <div className="text-sm text-gray-400">Sharpe Ratio</div>
                        </div>
                      </div>

                      {/* Performance Chart */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-semibold text-gray-300">Performance by Timeframe:</h5>
                        {Object.entries(selectedBot.performance).map(([period, value]) => (
                          <div key={period} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400 capitalize">{period}</span>
                              <span className="text-primary font-semibold">{value}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-primary to-green-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(value, 100)}%` }}
                                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-gray-800" />

                      {/* Technical Specifications */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-300">Technical Specifications:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Algorithm:</span>
                            <span className="text-white">{selectedBot.technicalSpecs.algorithm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data Points:</span>
                            <span className="text-white">{selectedBot.technicalSpecs.dataPoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Execution Speed:</span>
                            <span className="text-green-400">{selectedBot.technicalSpecs.executionSpeed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Backtest Period:</span>
                            <span className="text-white">{selectedBot.technicalSpecs.backtestPeriod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Optimization:</span>
                            <span className="text-white">{selectedBot.technicalSpecs.optimizationFreq}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            Timeframe: {selectedBot.timeframe}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            Updated: {selectedBot.lastUpdate}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Performance Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pros & Cons */}
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Pros & Cons
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h6 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Advantages
                        </h6>
                        <ul className="space-y-1">
                          {selectedBot.pros.map((pro, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                              <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Considerations
                        </h6>
                        <ul className="space-y-1">
                          {selectedBot.cons.map((con, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Bot Selection Grid */}
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">All Trading Bots</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Explore our complete suite of AI-powered trading bots. Each bot is designed for specific market conditions and trading strategies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBots.map((bot, index) => (
                    <motion.div
                      key={bot.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className={`cursor-pointer group ${selectedBot.id === bot.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => handleBotSelect(bot)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`bg-gradient-to-br ${bot.gradient} backdrop-blur-sm border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl ${bot.glowColor} hover:shadow-xl h-full`}
                      >
                        <CardHeader className="relative">
                          {selectedBot.id === bot.id && (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-black">
                              Featured
                            </Badge>
                          )}
                          
                          {/* Bot Icon and Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <bot.icon className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(bot.id)
                                }}
                                className={`p-2 ${favoritesBots.includes(bot.id) ? 'text-red-400' : 'text-gray-400'} hover:text-red-400`}
                              >
                                <Heart className={`w-4 h-4 ${favoritesBots.includes(bot.id) ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleComparison(bot.id)
                                }}
                                className={`p-2 ${comparisonBots.includes(bot.id) ? 'text-primary' : 'text-gray-400'} hover:text-primary`}
                                disabled={!comparisonBots.includes(bot.id) && comparisonBots.length >= 3}
                              >
                                <Layers className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-5xl font-mono font-bold text-gray-700 mb-3 group-hover:text-primary transition-colors">
                            {bot.name}
                          </div>

                          <CardTitle className="text-xl font-bold text-white mb-2 font-mono line-clamp-2 group-hover:text-primary transition-colors">
                            {bot.title}
                          </CardTitle>

                          {/* Rating and Reviews */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(bot.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {bot.rating} ({bot.reviews})
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{bot.description}</p>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-primary">{bot.accuracy}%</div>
                              <div className="text-xs text-gray-400">Accuracy</div>
                            </div>
                            <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-primary">{bot.winRate}%</div>
                              <div className="text-xs text-gray-400">Win Rate</div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Users className="w-3 h-3" />
                              {bot.deployments.toLocaleString()}
                            </div>
                            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              {bot.category}
                            </Badge>
                          </div>

                          {/* Risk Level */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Risk Level:</span>
                            <span className={`text-xs font-semibold ${getRiskColor(bot.riskLevel)}`}>
                              {bot.riskLevel}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-primary text-black hover:bg-primary/90 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Deploy bot logic
                              }}
                            >
                              Deploy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedBot(expandedBot === bot.id ? null : bot.id)
                              }}
                            >
                              {expandedBot === bot.id ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                            </Button>
                          </div>
                        </CardContent>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedBot === bot.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-gray-800"
                            >
                              <CardContent className="pt-4 space-y-3">
                                <div className="text-xs text-gray-400">
                                  <strong>Use Cases:</strong> {bot.useCases.join(", ")}
                                </div>
                                <div className="text-xs text-gray-400">
                                  <strong>Min Capital:</strong> ${bot.minCapital.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">
                                  <strong>Timeframe:</strong> {bot.timeframe}
                                </div>
                                <div className="text-xs text-gray-400">
                                  <strong>Last Updated:</strong> {bot.lastUpdate}
                                </div>
                                <div className="flex flex-wrap gap-1 pt-2">
                                  {bot.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs bg-gray-800 text-gray-400">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Detailed View */}
        {selectedView === "detailed" && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Detailed Bot Analysis</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Comprehensive performance metrics, technical specifications, and detailed analysis for each trading bot.
                </p>
              </div>

              <div className="space-y-12">
                {filteredBots.map((bot, index) => (
                  <motion.div
                    key={bot.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${bot.gradient} rounded-xl flex items-center justify-center`}>
                              <bot.icon className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold text-white mb-2">{bot.title}</CardTitle>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-primary/50 text-primary">
                                  {bot.category}
                                </Badge>
                                <Badge className={getStatusColor(bot.status)}>
                                  {bot.status}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(bot.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-400 ml-2">
                                    {bot.rating} ({bot.reviews} reviews)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFavorite(bot.id)}
                              className={`${favoritesBots.includes(bot.id) ? 'text-red-400 border-red-400' : 'text-gray-400 border-gray-700'}`}
                            >
                              <Heart className={`w-4 h-4 ${favoritesBots.includes(bot.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleComparison(bot.id)}
                              className={`${comparisonBots.includes(bot.id) ? 'text-primary border-primary' : 'text-gray-400 border-gray-700'}`}
                              disabled={!comparisonBots.includes(bot.id) && comparisonBots.length >= 3}
                            >
                              <Layers className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                            <TabsTrigger value="technical">Technical</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-6 mt-6">
                            <div className="grid lg:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <p className="text-gray-300 leading-relaxed">{bot.longDescription}</p>
                                
                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                                  <div className="grid grid-cols-1 gap-2">
                                    {bot.features.slice(0, 6).map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                        {feature}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-3">Use Cases</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {bot.useCases.map((useCase) => (
                                      <Badge key={useCase} variant="secondary" className="bg-gray-800 text-gray-300">
                                        {useCase}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">{bot.accuracy}%</div>
                                    <div className="text-sm text-gray-400">Accuracy</div>
                                  </div>
                                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">{bot.winRate}%</div>
                                    <div className="text-sm text-gray-400">Win Rate</div>
                                  </div>
                                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">{bot.avgReturn}%</div>
                                    <div className="text-sm text-gray-400">Avg Return</div>
                                  </div>
                                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-400 mb-1">{bot.maxDrawdown}%</div>
                                    <div className="text-sm text-gray-400">Max Drawdown</div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Risk Level:</span>
                                    <span className={`font-semibold ${getRiskColor(bot.riskLevel)}`}>{bot.riskLevel}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Min Capital:</span>
                                    <span className="text-white">${bot.minCapital.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Max Capital:</span>
                                    <span className="text-white">${bot.maxCapital.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Timeframe:</span>
                                    <span className="text-white">{bot.timeframe}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Deployments:</span>
                                    <span className="text-white">{bot.deployments.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="performance" className="space-y-6 mt-6">
                            <div className="grid lg:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Performance by Timeframe</h4>
                                <div className="space-y-4">
                                  {Object.entries(bot.performance).map(([period, value]) => (
                                    <div key={period} className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 capitalize">{period}</span>
                                        <span className="text-primary font-semibold">{value}%</span>
                                      </div>
                                      <div className="w-full bg-gray-800 rounded-full h-2">
                                        <div
                                          className="bg-gradient-to-r from-primary to-green-400 h-2 rounded-full"
                                          style={{ width: `${Math.min(value, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Monthly Returns</h4>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  {bot.monthlyReturns.map((month) => (
                                    <div key={month.month} className="bg-gray-800/30 rounded p-2 text-center">
                                      <div className="text-gray-400 mb-1">{month.month}</div>
                                      <div className={`font-semibold ${
                                        month.return > 0 ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        {month.return > 0 ? '+' : ''}{month.return}%
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-green-400 mb-1">{bot.sharpeRatio}</div>
                                <div className="text-sm text-gray-400">Sharpe Ratio</div>
                              </div>
                              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-primary mb-1">{bot.trades.toLocaleString()}</div>
                                <div className="text-sm text-gray-400">Total Trades</div>
                              </div>
                              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-blue-400 mb-1">{bot.deployments.toLocaleString()}</div>
                                <div className="text-sm text-gray-400">Deployments</div>
                              </div>
                              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-purple-400 mb-1">{bot.favorites.toLocaleString()}</div>
                                <div className="text-sm text-gray-400">Favorites</div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="technical" className="space-y-6 mt-6">
                            <div className="grid lg:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Technical Specifications</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Algorithm:</span>
                                    <span className="text-white text-right max-w-xs">{bot.technicalSpecs.algorithm}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Data Points:</span>
                                    <span className="text-white">{bot.technicalSpecs.dataPoints}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Execution Speed:</span>
                                    <span className="text-green-400">{bot.technicalSpecs.executionSpeed}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Backtest Period:</span>
                                    <span className="text-white">{bot.technicalSpecs.backtestPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Optimization:</span>
                                    <span className="text-white">{bot.technicalSpecs.optimizationFreq}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Version:</span>
                                    <span className="text-white">{bot.version}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Last Update:</span>
                                    <span className="text-white">{bot.lastUpdate}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Complexity Analysis</h4>
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-gray-400">Complexity Level</span>
                                      <span className="text-white">{bot.complexity}/5</span>
                                    </div>
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`flex-1 h-2 rounded ${
                                            i < bot.complexity ? "bg-primary" : "bg-gray-700"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h5 className="text-white font-semibold">Advantages</h5>
                                    <ul className="space-y-1">
                                      {bot.pros.map((pro, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                          {pro}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-3">
                                    <h5 className="text-white font-semibold">Considerations</h5>
                                    <ul className="space-y-1">
                                      {bot.cons.map((con, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                          {con}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-semibold text-white mb-4">Tags & Categories</h4>
                              <div className="flex flex-wrap gap-2">
                                {bot.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="reviews" className="space-y-6 mt-6">
                            <div className="grid lg:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">User Reviews</h4>
                                <div className="space-y-4">
                                  {testimonials
                                    .filter(t => t.bot === bot.title)
                                    .map((testimonial) => (
                                      <div key={testimonial.id} className="bg-gray-800/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                          <Avatar className="w-10 h-10">
                                            <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                                            <AvatarFallback className="bg-primary/20 text-primary">
                                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-white font-semibold">{testimonial.name}</span>
                                              <span className="text-gray-400 text-sm">{testimonial.role}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`w-4 h-4 ${
                                                    i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                            <p className="text-gray-300 text-sm">{testimonial.text}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Rating Breakdown</h4>
                                <div className="space-y-3">
                                  {[5, 4, 3, 2, 1].map((rating) => {
                                    const percentage = rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 8 : rating === 2 ? 2 : 0
                                    return (
                                      <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-12">
                                          <span className="text-sm text-gray-400">{rating}</span>
                                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        </div>
                                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                                          <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                        <span className="text-sm text-gray-400 w-12">{percentage}%</span>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-1">{bot.rating}</div>
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(bot.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <div className="text-sm text-gray-400">Based on {bot.reviews} reviews</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="flex gap-4 pt-6 border-t border-gray-800">
                          <Button className="flex-1 bg-primary text-black hover:bg-primary/90 font-semibold">
                            <Rocket className="w-4 h-4 mr-2" />
                            Deploy {bot.name} Bot
                          </Button>
                          <Button variant="outline" className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary">
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                          </Button>
                          <Button variant="outline" className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Backtest
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Comparison View */}
        {selectedView === "comparison" && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Bot Comparison</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                  Compare up to 3 trading bots side by side to find the perfect match for your trading strategy.
                </p>
                {comparisonBots.length === 0 && (
                  <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8">
                    <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select bots from the grid above to start comparing</p>
                  </div>
                )}
              </div>

              {comparisonBots.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-4 px-4 text-gray-400 font-semibold">Feature</th>
                        {comparisonBots.map((botId) => {
                          const bot = tradingBots.find(b => b.id === botId)
                          return (
                            <th key={botId} className="text-center py-4 px-4 min-w-64">
                              <div className="flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${bot?.gradient} rounded-lg flex items-center justify-center`}>
                                  {bot?.icon && <bot.icon className="w-6 h-6 text-primary" />}
                                </div>
                                <div>
                                  <div className="text-white font-semibold">{bot?.title}</div>
                                  <Badge variant="outline" className="border-primary/50 text-primary text-xs mt-1">
                                    {bot?.category}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleComparison(botId)}
                                  className="text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Accuracy", key: "accuracy", suffix: "%" },
                        { label: "Win Rate", key: "winRate", suffix: "%" },
                        { label: "Avg Return", key: "avgReturn", suffix: "%" },
                        { label: "Max Drawdown", key: "maxDrawdown", suffix: "%" },
                        { label: "Sharpe Ratio", key: "sharpeRatio", suffix: "" },
                        { label: "Risk Level", key: "riskLevel", suffix: "" },
                        { label: "Min Capital", key: "minCapital", prefix: "$", format: "number" },
                        { label: "Complexity", key: "complexity", suffix: "/5" },
                        { label: "Timeframe", key: "timeframe", suffix: "" },
                        { label: "Total Trades", key: "trades", suffix: "", format: "number" },
                        { label: "Rating", key: "rating", suffix: "/5" },
                        { label: "Deployments", key: "deployments", suffix: "", format: "number" },
                      ].map((metric) => (
                        <tr key={metric.key} className="border-b border-gray-800/50">
                          <td className="py-4 px-4 text-gray-300 font-medium">{metric.label}</td>
                          {comparisonBots.map((botId) => {
                            const bot = tradingBots.find(b => b.id === botId)
                            const value = bot?.[metric.key as keyof typeof bot]
                            let displayValue: string | number = ""
                            
                            if (typeof value === "string" || typeof value === "number") {
                              if (metric.format === "number" && typeof value === "number") {
                                displayValue = value.toLocaleString()
                              } else {
                                displayValue = value
                              }
                            } else {
                              displayValue = "N/A"
                            }
                            
                            return (
                              <td key={botId} className="py-4 px-4 text-center">
                                <span className={`font-semibold ${
                                  metric.key === "riskLevel" ? getRiskColor(value as string) : "text-white"
                                }`}>
                                  {metric.prefix}{displayValue}{metric.suffix}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {comparisonBots.length > 0 && (
                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    onClick={() => setComparisonBots([])}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Comparison
                  </Button>
                  <Button className="bg-primary text-black hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Export Comparison
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
                <span className="text-primary">TRADER</span> TESTIMONIALS
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                See what professional traders and institutions are saying about our AI-powered trading bots.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-primary/50 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-semibold">{testimonial.name}</div>
                          <div className="text-gray-400 text-sm">{testimonial.role}</div>
                          <Badge variant="outline" className="border-primary/50 text-primary text-xs mt-1">
                            {testimonial.bot}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-12 text-center relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-2 text-sm font-mono border-primary/50 text-primary bg-primary/10"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  START TRADING TODAY
                </Badge>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-mono">
                  Ready to Deploy AI Trading Bots?
                </h2>
                <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of traders who trust Nexural's AI-powered bots for consistent, profitable trading 
                  across all market conditions. Start with our free trial and experience institutional-grade performance.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
                    <p className="text-gray-400 text-sm">Advanced risk controls and position sizing</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                    <p className="text-gray-400 text-sm">Machine learning algorithms that adapt</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gauge className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
                    <p className="text-gray-400 text-sm">Institutional-grade execution and results</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold px-10 py-4 text-lg">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary px-10 py-4 text-lg bg-transparent"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary px-10 py-4 text-lg bg-transparent"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Pricing
                  </Button>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                  <p>✓ No setup fees • ✓ 30-day money-back guarantee • ✓ 24/7 support</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
