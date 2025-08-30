"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { DashboardData, BotPerformance } from "@/lib/dashboard-data"
import { getDashboardData } from "@/lib/dashboard-data"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import PerformanceSection from "@/components/dashboard/PerformanceSection"
import BotSelector from "@/components/dashboard/BotSelector"
import BotShowcase from "@/components/dashboard/BotShowcase"
import SignalsSection from "@/components/dashboard/SignalsSection"
import TradeHistorySection from "@/components/dashboard/TradeHistorySection"
import LoadingOverlay from "@/components/dashboard/LoadingOverlay"
import FloatingActions from "@/components/dashboard/FloatingActions"
import MarketContextPanel from "@/components/dashboard/MarketContextPanel"
import NewsPanel from "@/components/dashboard/NewsPanel"
import GlobalMarketSessions from "@/components/dashboard/GlobalMarketSessions"
import VolatilityDashboard from "@/components/dashboard/VolatilityDashboard"
import CryptoMetrics from "@/components/dashboard/CryptoMetrics"
import MarketTemperatureGauge from "@/components/dashboard/MarketTemperatureGauge"

import { Skeleton } from "@/components/ui/skeleton"

type ViewMode = "bots" | "signals" | "combined"

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {/* Header Skeleton */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <Skeleton className="h-12 w-48 mb-2 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-20 mx-auto mb-2 bg-gray-800" />
                    <Skeleton className="h-4 w-16 mx-auto bg-gray-800" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-10 bg-gray-800" />
              </div>
            </div>
          </div>

          {/* Toggle Skeleton */}
          <div className="flex justify-center">
            <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-800">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 mx-1 bg-gray-800" />
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-xl bg-gray-800" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl bg-gray-800" />
            </div>
          </div>

          {/* Bot Showcase Skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-8 bg-gray-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl bg-gray-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedBot, setSelectedBot] = useState<BotPerformance | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("bots")
  const [timeframe, setTimeframe] = useState("1M")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const result = await getDashboardData()
      setData(result)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleSelectBot = (bot: BotPerformance | null) => {
    setSelectedBot(bot)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const result = await getDashboardData()
    setData(result)
    setIsRefreshing(false)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setSelectedBot(null) // Reset selection when changing modes
  }

  if (isLoading || !data) {
    return (
      <>
        <LoadingOverlay />
        <DashboardSkeleton />
      </>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-black via-transparent to-black z-0" />

      {/* Main Content Container with proper spacing */}
      <div className="relative z-10 pt-32 pb-16">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Dashboard Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <DashboardHeader 
              totalReturn={`${data.headerStats.totalPnlPercent.toFixed(1)}%`}
              botWinRate="68.5%"
              signalWinRate="72.3%"
              avgReturn={`${data.headerStats.totalPnlPercent.toFixed(1)}%`}
              accountBalance={`$${data.headerStats.totalValue.toLocaleString()}`}
            />
          </motion.div>



          {/* Performance Toggle */}
          <motion.div variants={itemVariants} className="flex justify-center mb-16">
            <div className="flex gap-1 bg-black/40 backdrop-blur-sm p-1 rounded-xl border border-primary/20">
              {[
                { key: "bots", label: "Bot Performance" },
                { key: "signals", label: "Signal Performance" },
                { key: "combined", label: "Combined View" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleViewModeChange(key as ViewMode)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    viewMode === key
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "text-gray-400 hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Performance Metrics - Priority #1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Performance Chart - Takes 2 columns */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <PerformanceSection
                data={selectedBot ? selectedBot.performanceHistory : data.performanceOverview}
                selectedBot={selectedBot}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                viewMode={viewMode}
              />
            </motion.div>

            {/* Bot/Signal Selector - Takes 1 column */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <BotSelector
                bots={data.botPerformance}
                selectedBot={selectedBot}
                onSelectBot={handleSelectBot}
                viewMode={viewMode}
              />
            </motion.div>
          </div>

          {/* Content Sections based on view mode - Signal/Bot Focus */}
          <AnimatePresence mode="wait">
            {viewMode === "bots" && (
              <motion.div
                key="bots"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mb-16"
              >
                <BotShowcase bots={data.botPerformance} />
              </motion.div>
            )}

            {viewMode === "signals" && (
              <motion.div
                key="signals"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mb-16"
              >
                <SignalsSection />
              </motion.div>
            )}

            {viewMode === "combined" && (
              <motion.div
                key="combined"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-16 mb-16"
              >
                <BotShowcase bots={data.botPerformance.slice(0, 3)} />
                <SignalsSection />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trade History Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <TradeHistorySection trades={data.recentTrades} selectedBot={selectedBot} />
          </motion.div>

          {/* Bloomberg Terminal Intelligence Grid - Lower Priority */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                🏛️ Market Intelligence Center
              </h2>
              <p className="text-gray-400 text-center">
                Professional market context to understand your bot performance
              </p>
            </div>

            {/* Row 1: Global Markets & Market Context */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GlobalMarketSessions />
              <MarketContextPanel />
            </div>

            {/* Row 2: News & Volatility */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <NewsPanel />
              <VolatilityDashboard />
            </div>

            {/* Row 3: Crypto & Market Temperature */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CryptoMetrics />
              <MarketTemperatureGauge />
            </div>

            {/* Advanced Analytics - Coming Soon */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 text-center">
                <h3 className="text-white text-xl font-bold mb-2">🏢 Sector Rotation Heatmap</h3>
                <p className="text-gray-400 mb-2">Technology +2.34% • Energy -1.23%</p>
                <p className="text-xs text-orange-400">Real-time sector analysis via Alpha Vantage</p>
              </div>
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20 text-center">
                <h3 className="text-white text-xl font-bold mb-2">📅 Economic Calendar</h3>
                <p className="text-gray-400 mb-2">Fed Meeting: Today 2PM EST</p>
                <p className="text-xs text-green-400">High-impact events tracking</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActions onRefresh={handleRefresh} />
    </div>
  )
}
