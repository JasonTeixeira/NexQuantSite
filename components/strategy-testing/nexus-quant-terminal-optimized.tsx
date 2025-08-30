"use client"

import { useState, useRef, useEffect, useMemo, useCallback, memo, Suspense, lazy, Fragment } from "react"
import { 
  TrendingUpIcon, 
  BarChart3Icon, 
  ActivityIcon, 
  SettingsIcon,
  Shield,
  Database,
  BrainCircuitIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RealTimeDataProvider } from "./phase1/real-time-data-provider"
import { AuthProvider } from "./phase1/auth-provider"
import LiveMarketTicker from "./realtime/live-market-ticker"

// Lazy load heavy components
const EnhancedAITerminal = lazy(() => import("./enhanced-ai-terminal"))
const WorldClassAIInsights = lazy(() => import("./ui/world-class-ai-insights"))
const UnifiedStrategySystem = lazy(() => import("./ui/unified-strategy-system"))

const NexusQuantTerminalOptimized = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiCommand, setAiCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Market data for ticker
  const marketData = [
    { symbol: "AAPL", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "MSFT", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "GOOGL", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "AMZN", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "TSLA", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "NVDA", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "META", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "SPY", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
    { symbol: "QQQ", price: "$0.00", change: "+0.00 (+0.00%)", status: "connected" },
  ]

  const sidebarItems = [
    { id: "overview", label: "AI Overview", icon: BrainCircuitIcon },
    { id: "assistant", label: "AI Assistant", icon: BrainCircuitIcon },
    { id: "analysis", label: "Strategy Analysis", icon: BarChart3Icon },
    { id: "insights", label: "AI Insights", icon: TrendingUpIcon },
    { id: "trading", label: "Trading", icon: ActivityIcon },
    { id: "strategy", label: "Strategy", icon: Shield },
    { id: "intelligence", label: "Market Intelligence", icon: Database },
    { id: "security", label: "Data & Security", icon: Shield },
  ]

  const renderContent = () => {
    switch(activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {/* AI Performance Card */}
            <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#0f1320] border-cyan-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-400 text-base">AI Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Accuracy Rate</span>
                    <span className="text-green-400 font-semibold">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Strategies Analyzed</span>
                    <span className="text-white font-semibold">1000+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Response Time</span>
                    <span className="text-orange-400 font-semibold">&lt;50ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Intelligence Card */}
            <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#0f1320] border-purple-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-400 text-base">Market Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    Stay updated with AI-curated market insights and opportunities
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-1">
                    View Insights →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Optimization Card */}
            <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#0f1320] border-pink-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-pink-400 text-base">Optimize Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    Use ML to find optimal parameters for your trading strategies
                  </p>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm py-1">
                    Optimize →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Connect Data Sources Card */}
            <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#0f1320] border-blue-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 text-base">Connect Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    Securely connect your API keys to access premium market data
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1">
                    Connect →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ready to Trade Card - Spans 2 columns */}
            <Card className="lg:col-span-2 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 text-lg">Ready to supercharge your trading?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Let's start by analyzing your portfolio or exploring market opportunities. 
                  Click on any action above or ask me anything in the terminal below.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    🎯 Analyze Portfolio
                  </Button>
                  <Button variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/30">
                    🚀 Run Backtest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case "assistant":
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading AI Assistant...</div>}>
            <EnhancedAITerminal />
          </Suspense>
        )
      
      case "insights":
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading AI Insights...</div>}>
            <WorldClassAIInsights />
          </Suspense>
        )
      
      case "strategy":
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Strategy System...</div>}>
            <UnifiedStrategySystem />
          </Suspense>
        )
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-[#1a1a2e] border-cyan-700/30 p-8">
              <CardContent className="text-center">
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                <p className="text-gray-400">This section is being optimized for production.</p>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  const handleAICommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiCommand.trim()) return
    
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setAiCommand("")
    }, 1500)
  }

  return (
    <AuthProvider>
      <RealTimeDataProvider>
        <div className="h-screen w-screen flex flex-col bg-[#0a0a0f] text-white">
          {/* Top Header - Fixed Height */}
          <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-cyan-400 font-semibold">NexusQuant</span>
                <Badge className="bg-green-900/50 text-green-400 border-green-600 text-xs">
                  LIVE
                </Badge>
              </div>
            </div>

            {/* Market Ticker */}
            <div className="flex-1 mx-8 overflow-hidden">
              <LiveMarketTicker data={marketData} />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-[#0f1320] border-r border-gray-800 flex flex-col transition-all duration-300`}>
              <div className="p-3 border-b border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-full justify-start text-gray-400 hover:text-white"
                >
                  {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {sidebarOpen && <span className="ml-2">Collapse</span>}
                </Button>
              </div>
              
              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id 
                        ? 'bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-400' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm">{item.label}</span>}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Content Area - Scrollable */}
              <div className="flex-1 overflow-auto">
                {renderContent()}
              </div>

              {/* AI Command Bar - Fixed at Bottom */}
              <div className="h-16 border-t border-gray-800 bg-[#0f1320] px-4 py-2 flex-shrink-0">
                <form onSubmit={handleAICommand} className="flex gap-2 h-full items-center">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400">
                      <BrainCircuitIcon className="h-4 w-4" />
                    </div>
                    <Input
                      value={aiCommand}
                      onChange={(e) => setAiCommand(e.target.value)}
                      placeholder="Ask AI anything... (e.g., 'Analyze AAPL momentum' or 'Find high IV options')"
                      className="w-full bg-[#1a1a2e] border-gray-700 text-white pl-10 pr-4 h-10 focus:border-cyan-500"
                      disabled={isProcessing}
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-10 px-6"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing
                      </span>
                    ) : (
                      'Execute'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </RealTimeDataProvider>
    </AuthProvider>
  )
}

export default NexusQuantTerminalOptimized
