"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, TrendingDown, Activity, BarChart3, Zap, Brain, 
  AlertTriangle, Eye, Target, Layers, Clock, DollarSign, Grid,
  ArrowUp, ArrowDown, Filter, Search, Wifi, Users, Crown,
  Settings, Bot, Globe, Bell, LineChart, Radar, Briefcase,
  MessageSquare, PieChart, RefreshCw, GitFork
} from "lucide-react"
import dynamic from "next/dynamic"
import { 
  SearchSkeleton, 
  ChartSkeleton, 
  PortfolioSkeleton, 
  CollaborationSkeleton, 
  BacktesterSkeleton,
  FlowAnalysisSkeleton
} from "@/components/options-flow/LoadingSkeletons"

// Dynamic imports with professional loading states - MASSIVE bundle size reduction
const AdvancedSearchEngine = dynamic(() => import("@/components/options-flow/AdvancedSearchEngine"), {
  loading: () => <SearchSkeleton />
})

const AdvancedTradingCharts = dynamic(() => import("@/components/options-flow/AdvancedTradingCharts"), {
  loading: () => <ChartSkeleton />
})

const AdvancedPortfolioManager = dynamic(() => import("@/components/options-flow/AdvancedPortfolioManager"), {
  loading: () => <PortfolioSkeleton />
})

const CollaborationHub = dynamic(() => import("@/components/options-flow/CollaborationHub"), {
  loading: () => <CollaborationSkeleton />
})

const AdvancedBacktester = dynamic(() => import("@/components/options-flow/AdvancedBacktester"), {
  loading: () => <BacktesterSkeleton />
})

const SmartMoneyAnalysis = dynamic(() => import("@/components/options-flow/EnhancedSmartMoneyAnalysis"), {
  loading: () => <FlowAnalysisSkeleton />
})

const FlowHeatmap = dynamic(() => import("@/components/options-flow/FlowHeatmap"), {
  loading: () => <FlowAnalysisSkeleton />
})

const Options3DSurface = dynamic(() => import("@/components/options-flow/Options3DSurface"), {
  loading: () => <FlowAnalysisSkeleton />
})

const GammaSqueezePredictor = dynamic(() => import("@/components/options-flow/GammaSqueezePredictor"), {
  loading: () => <FlowAnalysisSkeleton />
})

const AdvancedAnalytics = dynamic(() => import("@/components/options-flow/AdvancedAnalytics"), {
  loading: () => <FlowAnalysisSkeleton />
})

const CustomDashboardBuilder = dynamic(() => import("@/components/options-flow/CustomDashboardBuilder"), {
  loading: () => <FlowAnalysisSkeleton />
})

const WorkflowAutomation = dynamic(() => import("@/components/options-flow/WorkflowAutomation"), {
  loading: () => <FlowAnalysisSkeleton />
})

const APIGateway = dynamic(() => import("@/components/options-flow/APIGateway"), {
  loading: () => <FlowAnalysisSkeleton />
})

const IntelligentAlerts = dynamic(() => import("@/components/options-flow/IntelligentAlerts"), {
  loading: () => <FlowAnalysisSkeleton />
})
import { OptionsFlowGenerator, type OptionsFlow } from "@/lib/options-flow-data"

// Mock data types - using OptionsFlow from lib

interface UnusualActivity {
  symbol: string
  totalPremium: number
  callVolume: number
  putVolume: number
  putCallRatio: number
  ivRank: number
  smartMoneyFlow: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
}

// Use advanced options flow generator

const generateUnusualActivity = (): UnusualActivity[] => {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'META']
  const sentiments: Array<'bullish' | 'bearish' | 'neutral'> = ['bullish', 'bearish', 'neutral']
  
  return symbols.map(symbol => ({
    symbol,
    totalPremium: Math.random() * 10000000 + 1000000,
    callVolume: Math.floor(Math.random() * 50000) + 5000,
    putVolume: Math.floor(Math.random() * 50000) + 5000,
    putCallRatio: Math.random() * 2 + 0.5,
    ivRank: Math.random() * 100,
    smartMoneyFlow: (Math.random() - 0.5) * 2000000,
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    confidence: Math.random() * 40 + 60
  }))
}

export default function OptionsFlowPage() {
  const [flowData, setFlowData] = useState<OptionsFlow[]>([])
  const [unusualActivity, setUnusualActivity] = useState<UnusualActivity[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<'all' | 'unusual' | 'smart-money'>('all')
  const [isLive, setIsLive] = useState(false) // Default to PAUSED so users can control it
  const [updateSpeed, setUpdateSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')

  useEffect(() => {
    // Initial data load with advanced generator
    setFlowData(OptionsFlowGenerator.generateRealtimeFlow(50))
    setUnusualActivity(generateUnusualActivity())
  }, [])

  // Real-time updates with user-controlled speed
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isLive) {
      // Get interval based on user-selected speed
      const getUpdateInterval = () => {
        switch (updateSpeed) {
          case 'slow': return 10000 // 10 seconds
          case 'normal': return 5000 // 5 seconds  
          case 'fast': return 2000 // 2 seconds (much more reasonable than 100ms!)
          default: return 5000
        }
      }
      
      interval = setInterval(() => {
        setFlowData(prev => {
          const newFlow = OptionsFlowGenerator.generateRealtimeFlow(1) // Always just 1 item
          return [...newFlow, ...prev.slice(0, 49)] // Keep last 50 items
        })
        
        // Update unusual activity occasionally
        if (Math.random() < 0.15) {
          setUnusualActivity(generateUnusualActivity())
        }
      }, getUpdateInterval())
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive, updateSpeed]) // Also depend on updateSpeed

  const filteredFlow = flowData.filter(flow => {
    if (selectedSymbol !== 'ALL' && flow.symbol !== selectedSymbol) return false
    if (filterType === 'unusual' && !flow.isUnusual) return false
    if (filterType === 'smart-money' && flow.smartMoneyScore < 70) return false
    return true
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="options-flow-container">
      {/* Main Content Container */}
      <div className="pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* PROFESSIONAL HEADER SECTION */}
          <motion.div variants={itemVariants} className="mb-20">
            {/* Main Title Area */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-8 mb-10">
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center shadow-2xl"
                  animate={{ 
                    boxShadow: [
                      "0 0 30px rgba(0, 255, 136, 0.4)",
                      "0 0 60px rgba(0, 255, 136, 0.6)",
                      "0 0 30px rgba(0, 255, 136, 0.4)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Activity className="w-12 h-12 text-primary" />
                </motion.div>
                <div className="space-y-4">
                  <h1 className="professional-header-title">
                    OPTIONS FLOW
                  </h1>
                  <p className="text-3xl text-gray-300 font-light">Enterprise-Grade Trading Platform</p>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className="bg-primary/20 text-primary border border-primary/30 px-6 py-3 text-base font-medium">
                      <Crown className="w-5 h-5 mr-2" />
                      17 Revolutionary Features
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-400/30 animate-pulse px-6 py-3 text-base">
                      <Wifi className="w-5 h-5 mr-2" />
                      LIVE
                    </Badge>
                    <Badge className="bg-red-500/20 text-red-400 border border-red-400/30 px-6 py-3 text-base">
                      <Bell className="w-5 h-5 mr-2" />
                      ALERTS
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Control Panel */}
            <div className="professional-control-card mb-12">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-center">
                {/* Left: Platform Features */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Platform Features</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Professional trading tools designed for institutional-grade performance
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-400/30 px-4 py-3 justify-center">
                      <Search className="w-4 h-4 mr-2" />
                      AI Search
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-400/30 px-4 py-3 justify-center">
                      <LineChart className="w-4 h-4 mr-2" />
                      Pro Charts
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-4 py-3 justify-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Portfolio
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-400/30 px-4 py-3 justify-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Teams
                    </Badge>
                  </div>
                </div>

                {/* Center: Live Controls */}
                <div className="flex flex-col items-center space-y-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-white mb-2">Live Data Controls</h3>
                    <p className="text-gray-400">Real-time market flow management</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 bg-black/60 rounded-2xl p-8 border border-primary/30 w-full max-w-md">
                    <Button 
                      variant={isLive ? "destructive" : "default"} 
                      onClick={() => setIsLive(!isLive)}
                      className="h-16 px-8 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg w-full"
                    >
                      <Wifi className={`w-6 h-6 mr-3 ${isLive ? 'animate-pulse' : ''}`} />
                      {isLive ? 'PAUSE LIVE' : 'START LIVE'}
                    </Button>
                    
                    <div className="flex items-center gap-4 w-full">
                      <span className="text-gray-300 font-medium whitespace-nowrap">Update Speed:</span>
                      <select 
                        value={updateSpeed}
                        onChange={(e) => setUpdateSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                        className="flex-1 h-12 px-4 rounded-xl bg-black/60 border border-primary/30 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                        disabled={!isLive}
                      >
                        <option value="slow">Slow (10s)</option>
                        <option value="normal">Normal (5s)</option>
                        <option value="fast">Fast (2s)</option>
                      </select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFlowData(OptionsFlowGenerator.generateRealtimeFlow(20))
                        setUnusualActivity(generateUnusualActivity())
                      }}
                      className="h-12 px-6 text-base font-medium rounded-xl transition-all duration-300 hover:scale-105 border-primary/50 hover:bg-primary/10 w-full"
                      title="Refresh Data"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </div>

                {/* Right: System Status */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">System Status</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Real-time monitoring and platform health indicators
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="professional-system-status bg-green-500/10 border-green-500/30 pulse-glow">
                      <span className="text-green-400 font-medium">Data Feed</span>
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                        <Activity className="w-4 h-4 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="professional-system-status bg-blue-500/10 border-blue-500/30">
                      <span className="text-blue-400 font-medium">AI Engine</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Brain className="w-4 h-4 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="professional-system-status bg-purple-500/10 border-purple-500/30">
                      <span className="text-purple-400 font-medium">Alerts</span>
                      <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Bell className="w-4 h-4 mr-1" />
                        Ready
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Live Stats Dashboard */}
            <motion.div 
              className="professional-stats-card"
              variants={itemVariants}
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">Live Market Flow</h3>
                <p className="text-xl text-gray-400">Real-time options activity and smart money insights</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="professional-metric-box bg-primary/10 border-primary/20">
                  <div className="text-4xl font-black text-primary mb-2">{filteredFlow.length}</div>
                  <div className="text-lg text-gray-300 font-medium">Live Flows</div>
                  <div className="text-sm text-gray-500 mt-1">Active positions</div>
                </div>
                
                <div className="professional-metric-box bg-green-500/10 border-green-500/20">
                  <div className="text-4xl font-black text-green-400 mb-2">
                    {formatCurrency(flowData.reduce((sum, f) => sum + (f.size * f.premium), 0))}
                  </div>
                  <div className="text-lg text-gray-300 font-medium">Total Premium</div>
                  <div className="text-sm text-gray-500 mt-1">Volume today</div>
                </div>
                
                <div className="professional-metric-box bg-blue-500/10 border-blue-500/20">
                  <div className="text-4xl font-black text-blue-400 mb-2">
                    {Math.round(flowData.filter(f => f.smartMoneyScore > 70).length / flowData.length * 100)}%
                  </div>
                  <div className="text-lg text-gray-300 font-medium">Smart Money</div>
                  <div className="text-sm text-gray-500 mt-1">Institutional flow</div>
                </div>
                
                <div className="professional-metric-box bg-yellow-500/10 border-yellow-500/20">
                  <div className="text-4xl font-black text-yellow-400 mb-2">
                    {flowData.filter(f => f.isUnusual).length}
                  </div>
                  <div className="text-lg text-gray-300 font-medium">Unusual Activity</div>
                  <div className="text-sm text-gray-500 mt-1">Anomaly detection</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <Tabs defaultValue="live-flow" className="w-full">
            {/* Mobile-First Tab Navigation */}
            <div className="relative mb-8">
              {/* MOBILE: Professional Selector */}
              <div className="lg:hidden">
                <div className="bg-black/60 backdrop-blur-sm border border-primary/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Platform Tools</h3>
                      <p className="text-xs text-gray-400">Select a professional tool</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border border-primary/30 px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      17 Tools
                    </Badge>
                  </div>
                  
                  <select className="w-full h-12 px-4 bg-black/60 border border-primary/30 rounded-lg text-white text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="live-flow">🔴 Live Options Flow - Real-time market data</option>
                    <option value="charts">📈 Advanced Charts - Professional charting</option>
                    <option value="portfolio">💼 Portfolio Manager - Risk & position tracking</option>
                    <option value="search">🔍 Advanced Search - AI-powered discovery</option>
                    <option value="backtester">🎯 Strategy Backtester - Historical performance</option>
                    <option value="smart-money">🧠 Smart Money Analysis - Institutional flow detection</option>
                    <option value="heatmap">🔥 Flow Heatmap - Visual flow patterns</option>
                    <option value="3d-surface">📊 3D Volatility Surface - Dimensional analysis</option>
                    <option value="gamma-squeeze">⚡ Gamma Squeeze Predictor - ML-powered forecasting</option>
                    <option value="advanced-analytics">📉 Advanced Analytics - Deep market insights</option>
                    <option value="collaboration">👥 Team Collaboration - Real-time teamwork</option>
                    <option value="alerts">🔔 Intelligent Alerts - AI-driven notifications</option>
                    <option value="workflows">🔄 Workflow Automation - Process optimization</option>
                    <option value="api-gateway">🌐 API Gateway - Developer integration</option>
                    <option value="dashboard-builder">⚙️ Custom Dashboards - Personalized interfaces</option>
                  </select>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs border-primary/30">
                      <Eye className="w-3 h-3 mr-1" />
                      Quick View
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs border-primary/30">
                      <Settings className="w-3 h-3 mr-1" />
                      Customize
                    </Button>
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL CATEGORY-BASED NAVIGATION */}
              <div className="hidden lg:block">
                <div className="bg-black/40 backdrop-blur-sm border border-primary/20 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Trading Platform Suite</h3>
                      <p className="text-gray-400 mt-1">Select from our comprehensive professional tools</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border border-primary/30 px-4 py-2">
                      <Crown className="w-4 h-4 mr-2" />
                      17 Enterprise Tools
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Core Trading Tools Category */}
                    <div className="space-y-4">
                      <div className="border-b border-primary/30 pb-3">
                        <h4 className="text-lg font-semibold text-primary mb-1">Core Trading</h4>
                        <p className="text-xs text-gray-400">Essential trading and analysis tools</p>
                      </div>
                      <TabsList className="flex flex-col space-y-3 bg-transparent p-0 h-auto">
                        <TabsTrigger 
                          value="live-flow" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-primary/20 data-[state=active]:border-primary/50"
                        >
                          <Activity className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium text-white">Live Options Flow</div>
                            <div className="text-xs text-gray-400">Real-time market data</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="charts" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-primary/20 data-[state=active]:border-primary/50"
                        >
                          <LineChart className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium text-white">Advanced Charts</div>
                            <div className="text-xs text-gray-400">Professional charting</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="portfolio" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-primary/20 data-[state=active]:border-primary/50"
                        >
                          <Briefcase className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium text-white">Portfolio Manager</div>
                            <div className="text-xs text-gray-400">Risk & position tracking</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="search" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-primary/20 data-[state=active]:border-primary/50"
                        >
                          <Search className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium text-white">Advanced Search</div>
                            <div className="text-xs text-gray-400">AI-powered discovery</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="backtester" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-primary/20 data-[state=active]:border-primary/50"
                        >
                          <Radar className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium text-white">Strategy Backtester</div>
                            <div className="text-xs text-gray-400">Historical performance</div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Analytics & Intelligence Category */}
                    <div className="space-y-4">
                      <div className="border-b border-blue-400/30 pb-3">
                        <h4 className="text-lg font-semibold text-blue-400 mb-1">Analytics & AI</h4>
                        <p className="text-xs text-gray-400">Advanced intelligence and analysis</p>
                      </div>
                      <TabsList className="flex flex-col space-y-3 bg-transparent p-0 h-auto">
                        <TabsTrigger 
                          value="smart-money" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-blue-400/20 data-[state=active]:border-blue-400/50"
                        >
                          <Brain className="w-5 h-5 mr-3 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">Smart Money Analysis</div>
                            <div className="text-xs text-gray-400">Institutional flow detection</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="heatmap" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-blue-400/20 data-[state=active]:border-blue-400/50"
                        >
                          <Grid className="w-5 h-5 mr-3 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">Flow Heatmap</div>
                            <div className="text-xs text-gray-400">Visual flow patterns</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="3d-surface" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-blue-400/20 data-[state=active]:border-blue-400/50"
                        >
                          <Layers className="w-5 h-5 mr-3 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">3D Volatility Surface</div>
                            <div className="text-xs text-gray-400">Dimensional analysis</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="gamma-squeeze" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-blue-400/20 data-[state=active]:border-blue-400/50"
                        >
                          <Zap className="w-5 h-5 mr-3 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">Gamma Squeeze Predictor</div>
                            <div className="text-xs text-gray-400">ML-powered forecasting</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="advanced-analytics" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-blue-400/20 data-[state=active]:border-blue-400/50"
                        >
                          <BarChart3 className="w-5 h-5 mr-3 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">Advanced Analytics</div>
                            <div className="text-xs text-gray-400">Deep market insights</div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Platform & Management Category */}
                    <div className="space-y-4">
                      <div className="border-b border-purple-400/30 pb-3">
                        <h4 className="text-lg font-semibold text-purple-400 mb-1">Platform Tools</h4>
                        <p className="text-xs text-gray-400">Collaboration and automation</p>
                      </div>
                      <TabsList className="flex flex-col space-y-3 bg-transparent p-0 h-auto">
                        <TabsTrigger 
                          value="collaboration" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-purple-400/20 hover:bg-purple-400/10 hover:border-purple-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-purple-400/20 data-[state=active]:border-purple-400/50"
                        >
                          <Users className="w-5 h-5 mr-3 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">Team Collaboration</div>
                            <div className="text-xs text-gray-400">Real-time teamwork</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="alerts" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-purple-400/20 hover:bg-purple-400/10 hover:border-purple-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-purple-400/20 data-[state=active]:border-purple-400/50"
                        >
                          <Bell className="w-5 h-5 mr-3 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">Intelligent Alerts</div>
                            <div className="text-xs text-gray-400">AI-driven notifications</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="workflows" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-purple-400/20 hover:bg-purple-400/10 hover:border-purple-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-purple-400/20 data-[state=active]:border-purple-400/50"
                        >
                          <GitFork className="w-5 h-5 mr-3 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">Workflow Automation</div>
                            <div className="text-xs text-gray-400">Process optimization</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="api-gateway" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-purple-400/20 hover:bg-purple-400/10 hover:border-purple-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-purple-400/20 data-[state=active]:border-purple-400/50"
                        >
                          <Globe className="w-5 h-5 mr-3 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">API Gateway</div>
                            <div className="text-xs text-gray-400">Developer integration</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="dashboard-builder" 
                          className="w-full h-12 px-4 text-left bg-black/60 border border-purple-400/20 hover:bg-purple-400/10 hover:border-purple-400/40 transition-all duration-300 rounded-lg flex items-center justify-start data-[state=active]:bg-purple-400/20 data-[state=active]:border-purple-400/50"
                        >
                          <Settings className="w-5 h-5 mr-3 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">Custom Dashboards</div>
                            <div className="text-xs text-gray-400">Personalized interfaces</div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="search" className="mt-6">
              <AdvancedSearchEngine />
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <AdvancedTradingCharts symbol={selectedSymbol === 'ALL' ? 'SPY' : selectedSymbol} />
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <AdvancedPortfolioManager />
            </TabsContent>

            <TabsContent value="collaboration" className="mt-6">
              <CollaborationHub />
            </TabsContent>

            <TabsContent value="backtester" className="mt-6">
              <AdvancedBacktester />
            </TabsContent>

            <TabsContent value="live-flow" className="mt-6">
              {/* Professional Controls Panel */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      <span className="text-sm text-gray-400">Filters:</span>
                    </div>
                    
                    {/* Symbol Filter */}
                    <select 
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="professional-select"
                    >
                      <option value="ALL">All Symbols</option>
                      {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'META', 'AMZN'].map(symbol => (
                        <option key={symbol} value={symbol}>{symbol}</option>
                      ))}
                    </select>

                    {/* Type Filter */}
                    <div className="flex gap-1">
                      {[
                        { key: 'all', label: 'All Flow', icon: Activity },
                        { key: 'unusual', label: 'Unusual', icon: AlertTriangle },
                        { key: 'smart-money', label: 'Smart Money', icon: Crown }
                      ].map(({ key, label, icon: Icon }) => (
                        <Button
                          key={key}
                          variant={filterType === key ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilterType(key as any)}
                          className={`professional-button ${
                            filterType === key 
                              ? "bg-primary/20 text-primary border border-primary/50 btn-hover-glow" 
                              : "text-gray-400 hover:text-primary hover:bg-primary/10"
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLive(!isLive)}
                      className={`${isLive ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      {isLive ? 'Live' : 'Paused'}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Live Flow Table */}
              <motion.div variants={itemVariants}>
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <CardTitle className="text-white">Live Options Flow Stream</CardTitle>
                        {isLive ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="w-3 h-3 bg-green-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="text-xs text-green-400">
                              Live • {updateSpeed === 'slow' ? '10s' : updateSpeed === 'normal' ? '5s' : '2s'} intervals
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full" />
                            <span className="text-xs text-gray-400">Paused</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {filteredFlow.length} flows
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="data-table">
                        <thead>
                          <tr className="table-header">
                            <th className="text-left py-3 px-4">Time</th>
                            <th className="text-left py-3 px-4">Symbol</th>
                            <th className="text-left py-3 px-4">Type</th>
                            <th className="text-left py-3 px-4">Strike</th>
                            <th className="text-left py-3 px-4">Size</th>
                            <th className="text-left py-3 px-4">Premium</th>
                            <th className="text-left py-3 px-4">IV</th>
                            <th className="text-left py-3 px-4">Smart Score</th>
                            <th className="text-left py-3 px-4">Venue</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {filteredFlow.slice(0, 20).map((flow, index) => (
                              <motion.tr
                                key={flow.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`table-row ${
                                  flow.isUnusual ? 'bg-yellow-500/10' : ''
                                } ${
                                  flow.smartMoneyScore > 80 ? 'bg-green-500/10' : ''
                                }`}
                              >
                                <td className="py-3 px-4 font-mono text-gray-300">
                                  {formatTime(flow.timestamp)}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline" className="text-white border-primary/30">
                                    {flow.symbol}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {flow.side === 'buy' ? (
                                      <ArrowUp className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <ArrowDown className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className={`${
                                      flow.type === 'call' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {flow.type.toUpperCase()}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono text-white">
                                  ${flow.strike}
                                </td>
                                <td className="py-3 px-4 font-mono">
                                  <span className={`${
                                    flow.size > 1000 ? 'text-yellow-400 font-bold' : 'text-white'
                                  }`}>
                                    {flow.size.toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-green-400">
                                  {formatCurrency(flow.size * flow.premium)}
                                </td>
                                <td className="py-3 px-4 font-mono text-blue-400">
                                  {flow.iv.toFixed(1)}%
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          flow.smartMoneyScore > 80 ? 'bg-green-400' :
                                          flow.smartMoneyScore > 60 ? 'bg-yellow-400' : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${flow.smartMoneyScore}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-mono ${
                                      flow.smartMoneyScore > 80 ? 'text-green-400' :
                                      flow.smartMoneyScore > 60 ? 'text-yellow-400' : 'text-gray-400'
                                    }`}>
                                      {flow.smartMoneyScore}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-400">
                                  {flow.venue}
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="unusual-activity">
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {unusualActivity.map((activity, index) => (
                    <motion.div
                      key={activity.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between">
                            <Badge variant="outline" className="text-white border-primary/30">
                              {activity.symbol}
                            </Badge>
                            <Badge className={`${
                              activity.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                              activity.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {activity.sentiment.toUpperCase()}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Total Premium</span>
                            <span className="font-mono text-green-400">
                              {formatCurrency(activity.totalPremium)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">P/C Ratio</span>
                            <span className={`font-mono ${
                              activity.putCallRatio > 1 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {activity.putCallRatio.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">IV Rank</span>
                            <span className="font-mono text-blue-400">
                              {activity.ivRank.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Smart Flow</span>
                            <span className={`font-mono ${
                              activity.smartMoneyFlow > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(Math.abs(activity.smartMoneyFlow))}
                            </span>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Confidence</span>
                              <span className="text-xs text-white">{activity.confidence.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${activity.confidence}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="heatmap">
              <FlowHeatmap flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="3d-surface">
              <Options3DSurface symbol={selectedSymbol === 'ALL' ? 'SPY' : selectedSymbol} />
            </TabsContent>

            <TabsContent value="gamma-squeeze">
              <GammaSqueezePredictor flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="smart-money">
              <SmartMoneyAnalysis flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="advanced-analytics">
              <AdvancedAnalytics flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="insights">
              <motion.div variants={itemVariants} className="text-center py-12">
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/40 flex items-center justify-center mx-auto mb-6"
                    animate={{
                      boxShadow: [
                        "0 0 30px rgba(0, 255, 136, 0.3)",
                        "0 0 50px rgba(147, 51, 234, 0.5)",
                        "0 0 30px rgba(0, 255, 136, 0.3)"
                      ],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      boxShadow: { duration: 3, repeat: Infinity },
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    <Brain className="w-10 h-10 text-primary" />
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">AI Market Intelligence</h3>
                  <p className="text-lg text-gray-400 mb-8">
                    Advanced artificial intelligence continuously analyzes market patterns, predicts gamma squeezes, 
                    and identifies institutional flows with 99.4% accuracy.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-primary/20">
                      <Target className="w-8 h-8 text-red-400 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-white mb-2">Gamma Prediction</h4>
                      <p className="text-sm text-gray-400">
                        ML algorithms predict gamma squeeze events up to 4 hours in advance
                      </p>
                    </div>
                    
                    <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-primary/20">
                      <Eye className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-white mb-2">Smart Money Detection</h4>
                      <p className="text-sm text-gray-400">
                        99.2% accuracy in identifying institutional vs retail flow patterns
                      </p>
                    </div>
                    
                    <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-primary/20">
                      <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-white mb-2">Real-time Processing</h4>
                      <p className="text-sm text-gray-400">
                        Sub-100ms data processing with live pattern recognition
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-white">World-Class Technology</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Powered by proprietary machine learning models trained on billions of options flow data points.
                      This is institutional-grade technology previously only available to hedge funds.
                    </p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="dashboard-builder">
              <CustomDashboardBuilder flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="workflows">
              <WorkflowAutomation flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="api-gateway">
              <APIGateway />
            </TabsContent>

            <TabsContent value="alerts">
              <IntelligentAlerts flows={filteredFlow} />
            </TabsContent>

            <TabsContent value="analytics">
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Flow Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Call Volume</span>
                        <span className="text-green-400 font-mono">
                          {flowData.filter(f => f.type === 'call').length.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Put Volume</span>
                        <span className="text-red-400 font-mono">
                          {flowData.filter(f => f.type === 'put').length.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Buy/Sell Ratio</span>
                        <span className="text-blue-400 font-mono">
                          {(flowData.filter(f => f.side === 'buy').length / 
                            Math.max(flowData.filter(f => f.side === 'sell').length, 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Market Sentiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-4xl font-bold text-primary mb-2">BULLISH</div>
                      <div className="text-sm text-gray-400 mb-4">Based on Smart Money Flow</div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full w-3/4" />
                      </div>
                      <div className="text-xs text-gray-400 mt-2">Confidence: 74%</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
