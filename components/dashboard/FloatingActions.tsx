"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RefreshCw, Settings, BarChart3 } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface FloatingActionsProps {
  onRefresh: () => void
}

export default function FloatingActions({ onRefresh }: FloatingActionsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState([30])
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(true)
  const [enableNotifications, setEnableNotifications] = useState(true)

  const [analyticsData] = useState({
    totalTrades: 1247,
    winRate: 68.5,
    avgProfit: 2.34,
    sharpeRatio: 1.82,
    maxDrawdown: 8.7,
    profitFactor: 1.45,
  })

  return (
    <div className="fixed bottom-8 right-24 flex flex-col gap-4 z-50">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={onRefresh}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-blue-400 text-black shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
      >
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button className="w-12 h-12 rounded-full bg-black/50 border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-primary">Dashboard Settings</DialogTitle>
              <DialogDescription className="text-gray-400">
                Customize your dashboard experience and preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh" className="text-sm font-medium">
                  Auto Refresh
                </Label>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Refresh Interval: {refreshInterval[0]} seconds</Label>
                  <Slider
                    value={refreshInterval}
                    onValueChange={setRefreshInterval}
                    max={300}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="advanced-metrics" className="text-sm font-medium">
                  Show Advanced Metrics
                </Label>
                <Switch id="advanced-metrics" checked={showAdvancedMetrics} onCheckedChange={setShowAdvancedMetrics} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Enable Notifications
                </Label>
                <Switch id="notifications" checked={enableNotifications} onCheckedChange={setEnableNotifications} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      >
        <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
          <DialogTrigger asChild>
            <Button className="w-12 h-12 rounded-full bg-black/50 border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300">
              <BarChart3 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">Advanced Analytics</DialogTitle>
              <DialogDescription className="text-gray-400">
                Detailed performance metrics and trading statistics.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Total Trades</div>
                  <div className="text-2xl font-bold text-primary">{analyticsData.totalTrades.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-green-400">{analyticsData.winRate}%</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Avg Profit</div>
                  <div className="text-2xl font-bold text-primary">${analyticsData.avgProfit}%</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-blue-400">{analyticsData.sharpeRatio}</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
                  <div className="text-2xl font-bold text-red-400">{analyticsData.maxDrawdown}%</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Profit Factor</div>
                  <div className="text-2xl font-bold text-primary">{analyticsData.profitFactor}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
