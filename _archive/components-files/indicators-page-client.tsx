"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Star,
  Users,
  Clock,
  Target,
  ArrowRight,
  Filter,
  SortDesc,
  ExternalLink,
} from "lucide-react"
import { indicators } from "@/lib/indicator-data"
import IndicatorModal from "./IndicatorModal"
import { motion } from "framer-motion"

const IndicatorsPageClient = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null)
  const [sortBy, setSortBy] = useState("name")

  const categories = [
    { id: "all", name: "All Indicators", icon: BarChart3, count: 9, color: "from-blue-500 to-cyan-500" },
    { id: "momentum", name: "Momentum", icon: TrendingUp, count: 3, color: "from-green-500 to-teal-500" },
    { id: "trend", name: "Trend Following", icon: Activity, count: 3, color: "from-cyan-500 to-blue-500" },
    { id: "volatility", name: "Volatility", icon: Zap, count: 3, color: "from-orange-500 to-red-500" },
  ]

  const filteredIndicators = indicators.filter(
    (indicator) =>
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleIndicatorClick = (indicator: any) => {
    setSelectedIndicator(indicator)
  }

  const handleCloseModal = () => {
    setSelectedIndicator(null)
  }

  const getIndicatorsByCategory = (category: string) => {
    if (category === "all") return filteredIndicators
    if (category === "momentum")
      return filteredIndicators.filter((ind) =>
        ["Quantum Flow", "Nexural Oscillator", "Flux Capacitor"].includes(ind.name),
      )
    if (category === "trend")
      return filteredIndicators.filter((ind) =>
        ["Cognitive Trend", "Echo Bands", "Signal-to-Noise Ratio"].includes(ind.name),
      )
    if (category === "volatility")
      return filteredIndicators.filter((ind) =>
        ["Volatility Matrix", "Phase Reversal", "Adaptive RSI"].includes(ind.name),
      )
    return []
  }

  const getCategoryBadge = (indicatorName: string) => {
    if (["Quantum Flow", "Nexural Oscillator", "Flux Capacitor"].includes(indicatorName)) {
      return { name: "Momentum", color: "bg-green-500/20 text-green-300 border-green-500/30" }
    }
    if (["Cognitive Trend", "Echo Bands", "Signal-to-Noise Ratio"].includes(indicatorName)) {
      return { name: "Trend", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" }
    }
    if (["Volatility Matrix", "Phase Reversal", "Adaptive RSI"].includes(indicatorName)) {
      return { name: "Volatility", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" }
    }
    return { name: "Pro", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" }
  }

  const getPlatformTags = (indicatorName: string) => {
    // Define which platforms each indicator supports
    const platformMap: { [key: string]: string[] } = {
      "Quantum Flow": ["TradingView", "NinjaTrader", "QuantTower"],
      "Nexural Oscillator": ["TradingView", "NinjaTrader"],
      "Phase Reversal": ["TradingView", "QuantTower"],
      "Volatility Matrix": ["TradingView", "NinjaTrader", "QuantTower"],
      "Echo Bands": ["TradingView", "NinjaTrader"],
      "Cognitive Trend": ["TradingView", "QuantTower"],
      "Flux Capacitor": ["TradingView", "NinjaTrader", "QuantTower"],
      "Signal-to-Noise Ratio": ["TradingView", "NinjaTrader"],
      "Adaptive RSI": ["TradingView", "QuantTower"],
    }
    return platformMap[indicatorName] || ["TradingView"]
  }

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case "TradingView":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "NinjaTrader":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "QuantTower":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getRandomPerformance = () => ({
    accuracy: (92 + Math.random() * 6).toFixed(1),
    returns: (1.5 + Math.random() * 2).toFixed(1),
    signals: Math.floor(150 + Math.random() * 100),
    users: Math.floor(800 + Math.random() * 500),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-teal-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              Professional Trading Suite
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Advanced Trading
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent block">
                Indicators
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Unlock the power of institutional-grade quantitative analysis with our proprietary suite of AI-enhanced
              trading indicators. Compatible with TradingView, NinjaTrader, and QuantTower platforms.
            </p>

            {/* Key Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-gray-300"
              >
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm">10,000+ Active Traders</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-gray-300"
              >
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-sm">95.7% Accuracy Rate</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-gray-300"
              >
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">Real-time Analysis</span>
              </motion.div>
            </div>

            {/* Enhanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto relative"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search indicators by name, category, or functionality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-20 py-4 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl text-lg backdrop-blur-sm focus:bg-white/15 focus:border-blue-400/50 transition-all duration-300"
                />
                {searchTerm && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm bg-white/10 px-2 py-1 rounded">
                    {filteredIndicators.length} results
                  </div>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                  onClick={() => setSortBy("name")}
                >
                  <SortDesc className="w-3 h-3 mr-1" />
                  Sort A-Z
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                  onClick={() => setSortBy("performance")}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Top Rated
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 text-xs"
                  onClick={() => window.open("https://tradingview.com", "_blank")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on TradingView
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          {/* Enhanced Category Tabs */}
          <div className="flex justify-center mb-12">
            <TabsList className="grid grid-cols-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:text-white transition-all duration-300 relative overflow-hidden group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-data-[state=active]:opacity-20 transition-opacity duration-300`}
                    />
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="hidden sm:inline relative z-10">{category.name}</span>
                    <Badge variant="secondary" className="ml-2 bg-white/10 text-white text-xs relative z-10">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Indicators Grid */}
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {getIndicatorsByCategory(category.id).map((indicator, index) => {
                  const categoryBadge = getCategoryBadge(indicator.name)
                  const platformTags = getPlatformTags(indicator.name)
                  const performance = getRandomPerformance()

                  return (
                    <motion.div
                      key={indicator.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
                        onClick={() => handleIndicatorClick(indicator)}
                      >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardHeader className="pb-4 relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-sm">
                              <BarChart3 className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={`${categoryBadge.color} border font-medium`}>
                                {categoryBadge.name}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-medium"
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Pro
                              </Badge>
                            </div>
                          </div>

                          <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 mb-2">
                            {indicator.name}
                          </CardTitle>

                          <CardDescription className="text-gray-300 leading-relaxed line-clamp-3 mb-3">
                            {indicator.description}
                          </CardDescription>

                          {/* Platform Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {platformTags.map((platform) => (
                              <Badge
                                key={platform}
                                variant="outline"
                                className={`${getPlatformBadgeColor(platform)} border text-xs`}
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 relative z-10">
                          {/* Performance Metrics */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                              <div className="text-lg font-bold text-green-400">{performance.accuracy}%</div>
                              <div className="text-xs text-gray-400">Accuracy</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                              <div className="text-lg font-bold text-blue-400">{performance.returns}x</div>
                              <div className="text-xs text-gray-400">Returns</div>
                            </div>
                          </div>

                          {/* Additional Stats */}
                          <div className="flex justify-between text-xs text-gray-400 mb-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {performance.users} users
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {performance.signals} signals
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-blue-500/20 hover:border-blue-400/50 bg-transparent transition-all duration-300 group-hover:bg-blue-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIndicatorClick(indicator)
                            }}
                          >
                            Explore Indicator
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Platform Performance</h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Real-time metrics from our institutional-grade trading infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">9</div>
                <div className="text-gray-300 font-medium">Professional Indicators</div>
                <div className="text-sm text-gray-400 mt-1">Continuously updated</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                  <Target className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">95.7%</div>
                <div className="text-gray-300 font-medium">Average Accuracy</div>
                <div className="text-sm text-gray-400 mt-1">Backtested results</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
                <div className="text-gray-300 font-medium">Market Coverage</div>
                <div className="text-sm text-gray-400 mt-1">Global markets</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 mb-4">
                  <Zap className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-4xl font-bold text-orange-400 mb-2">&lt;1ms</div>
                <div className="text-gray-300 font-medium">Signal Latency</div>
                <div className="text-sm text-gray-400 mt-1">Ultra-low latency</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-24 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-white/10 rounded-2xl p-12 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-teal-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of professional traders using our advanced indicators across TradingView, NinjaTrader,
                and QuantTower
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent font-semibold"
                  onClick={() => window.open("https://tradingview.com", "_blank")}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View on TradingView
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <IndicatorModal indicator={selectedIndicator} onClose={handleCloseModal} />
    </div>
  )
}

export default IndicatorsPageClient
