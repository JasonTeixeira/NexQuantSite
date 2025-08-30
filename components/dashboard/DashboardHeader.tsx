"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Settings, Wifi } from "lucide-react"

interface DashboardHeaderProps {
  totalReturn: string
  botWinRate: string
  signalWinRate: string
  avgReturn: string
  accountBalance: string
}

export default function DashboardHeader({
  totalReturn,
  botWinRate,
  signalWinRate,
  avgReturn,
  accountBalance,
}: DashboardHeaderProps) {
  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-baseline font-display">
              <span className="text-4xl font-bold text-white">NEX</span>
              <span className="text-4xl font-bold text-primary">URAL</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-400/30 animate-pulse">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="text-sm font-display text-gray-400 tracking-widest uppercase">Enhanced with Market Context</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 font-mono">{totalReturn}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Total Return</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 font-mono">{botWinRate}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Bot Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 font-mono">{signalWinRate}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Signal Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{avgReturn}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Return</div>
          </div>
        </div>

        {/* Account Balance & Actions */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="text-center lg:text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account Balance</div>
            <div className="text-3xl font-bold text-green-400 font-mono">{accountBalance}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:border-primary hover:text-primary bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:border-primary hover:text-primary bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:border-primary hover:text-primary p-2 bg-transparent"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
