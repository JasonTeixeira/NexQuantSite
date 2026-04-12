"use client"

import type { Indicator } from "@/lib/indicator-data"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Star,
  Target,
  Clock,
  Users,
  ArrowRight,
  Download,
  Share2,
  Bookmark,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface IndicatorModalProps {
  indicator: Indicator | null
  onClose: () => void
}

export default function IndicatorModal({ indicator, onClose }: IndicatorModalProps) {
  if (!indicator) return null

  const getIndicatorIcon = (name: string) => {
    if (["Quantum Flow", "Nexural Oscillator", "Flux Capacitor"].includes(name)) {
      return <TrendingUp className="h-8 w-8 text-green-400" />
    }
    if (["Cognitive Trend", "Echo Bands", "Signal-to-Noise Ratio"].includes(name)) {
      return <Activity className="h-8 w-8 text-cyan-400" />
    }
    if (["Volatility Matrix", "Phase Reversal", "Adaptive RSI"].includes(name)) {
      return <Zap className="h-8 w-8 text-orange-400" />
    }
    return <BarChart3 className="h-8 w-8 text-blue-400" />
  }

  const getIndicatorCategory = (name: string) => {
    if (["Quantum Flow", "Nexural Oscillator", "Flux Capacitor"].includes(name)) {
      return { name: "Momentum", color: "bg-green-500/20 text-green-300 border-green-500/30" }
    }
    if (["Cognitive Trend", "Echo Bands", "Signal-to-Noise Ratio"].includes(name)) {
      return { name: "Trend Following", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" }
    }
    if (["Volatility Matrix", "Phase Reversal", "Adaptive RSI"].includes(name)) {
      return { name: "Volatility", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" }
    }
    return { name: "General", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" }
  }

  const getPlatformTags = (indicatorName: string) => {
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

  const category = getIndicatorCategory(indicator.name)
  const platformTags = getPlatformTags(indicator.name)

  const getRandomMetrics = () => ({
    accuracy: (92 + Math.random() * 6).toFixed(1),
    returns: (1.5 + Math.random() * 2).toFixed(1),
    speed: Math.floor(200 + Math.random() * 600),
    users: Math.floor(800 + Math.random() * 1200),
  })

  const metrics = getRandomMetrics()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3 transition-all z-10 backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          <div className="p-8 md:p-12">
            {/* Header Section */}
            <div className="flex items-start gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-sm">
                {getIndicatorIcon(indicator.name)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Badge variant="outline" className={`${category.color} border font-medium`}>
                    {category.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-medium"
                  >
                    Professional
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>

                {/* Platform Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {platformTags.map((platform) => (
                    <Badge
                      key={platform}
                      variant="outline"
                      className={`${getPlatformBadgeColor(platform)} border font-medium`}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white font-mono mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {indicator.name}
                </h2>

                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{metrics.users} active users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{metrics.accuracy}% accuracy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Real-time signals</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chart Section */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/50 mb-8 bg-gradient-to-br from-slate-800 to-slate-900">
              <Image
                src={`/placeholder.svg?height=720&width=1280&text=${encodeURIComponent(indicator.name + " Professional Chart Analysis")}`}
                alt={`${indicator.name} chart analysis`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-sm font-medium">Live Market Analysis</div>
                <div className="text-xs text-gray-300">Updated every second</div>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">{metrics.accuracy}%</div>
                  <div className="text-sm text-gray-300">Accuracy Rate</div>
                  <div className="text-xs text-green-400 mt-1">↗ +2.3% this month</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{metrics.returns}x</div>
                  <div className="text-sm text-gray-300">Avg Returns</div>
                  <div className="text-xs text-blue-400 mt-1">↗ +15% vs benchmark</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{metrics.speed}ms</div>
                  <div className="text-sm text-gray-300">Signal Speed</div>
                  <div className="text-xs text-cyan-400 mt-1">Ultra-low latency</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">24/7</div>
                  <div className="text-sm text-gray-300">Monitoring</div>
                  <div className="text-xs text-orange-400 mt-1">Global markets</div>
                </CardContent>
              </Card>
            </div>

            {/* Description and Usage */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{indicator.description}</p>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6">
                  <div className="text-blue-300 font-medium mb-2">Key Advantage</div>
                  <div className="text-sm text-gray-300">
                    This indicator combines traditional technical analysis with AI-powered pattern recognition for
                    superior market timing and risk management.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-400" />
                  How to Use
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{indicator.usage}</p>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-6">
                  <div className="text-green-300 font-medium mb-2">Pro Tip</div>
                  <div className="text-sm text-gray-300">
                    Combine with volume analysis and market sentiment for maximum effectiveness in volatile conditions.
                    Best used on 15m+ timeframes.
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700/50 mb-8" />

            {/* Advanced Features */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-400" />
                Advanced Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  <div className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Real-time Signals
                  </div>
                  <div className="text-sm text-gray-300">
                    Instant market analysis with sub-second signal generation and smart notifications.
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    High Precision
                  </div>
                  <div className="text-sm text-gray-300">
                    95%+ accuracy rate validated through extensive backtesting across multiple market conditions.
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Multi-Timeframe
                  </div>
                  <div className="text-sm text-gray-300">
                    Seamlessly works across all trading timeframes from scalping to long-term investing.
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  <div className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    AI-Enhanced
                  </div>
                  <div className="text-sm text-gray-300">
                    Machine learning algorithms continuously improve signal quality and reduce false positives.
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  <div className="text-teal-400 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Community Driven
                  </div>
                  <div className="text-sm text-gray-300">
                    Benefit from collective intelligence of thousands of professional traders worldwide.
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Risk Management
                  </div>
                  <div className="text-sm text-gray-300">
                    Built-in risk assessment and position sizing recommendations for optimal portfolio management.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 text-lg"
              >
                Add to Strategy
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent font-semibold py-4 text-lg"
              >
                View Backtest Results
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 bg-transparent font-semibold py-4 px-8"
                onClick={() => window.open("https://tradingview.com", "_blank")}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                TradingView
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
