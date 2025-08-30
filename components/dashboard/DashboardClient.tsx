"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardClient() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for 1 second then show dashboard
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-300">Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">NEXURAL DASHBOARD</h1>
          <p className="text-gray-400">Signal & Bot Performance Tracking</p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">+24.5%</div>
                <div className="text-sm text-gray-400">Total Return</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">68.5%</div>
                <div className="text-sm text-gray-400">Signal Win Rate</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">72.3%</div>
                <div className="text-sm text-gray-400">Bot Win Rate</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">$125,847</div>
                <div className="text-sm text-gray-400">Account Balance</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bot Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Active Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Zenith Mean Reversion</div>
                    <div className="text-sm text-gray-400">Mean Reversion Strategy</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+24.5%</div>
                    <Badge className="bg-green-500/20 text-green-400">Running</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Reversal Recognition</div>
                    <div className="text-sm text-gray-400">Pattern Recognition</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+18.3%</div>
                    <Badge className="bg-green-500/20 text-green-400">Running</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Quantum Engine</div>
                    <div className="text-sm text-gray-400">AI Momentum</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+27.4%</div>
                    <Badge className="bg-green-500/20 text-green-400">Running</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">BTC/USDT</div>
                    <div className="text-sm text-gray-400">Long • 2h ago</div>
                  </div>
                  <div className="text-green-400 font-bold">+$2,847</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">ETH/USDT</div>
                    <div className="text-sm text-gray-400">Short • 4h ago</div>
                  </div>
                  <div className="text-green-400 font-bold">+$1,234</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">SOL/USDT</div>
                    <div className="text-sm text-gray-400">Long • 6h ago</div>
                  </div>
                  <div className="text-red-400 font-bold">-$456</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Context Panel (Your Addition) */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Market Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">$115,566</div>
                <div className="text-sm text-gray-400 mb-1">Bitcoin Price</div>
                <div className="text-xs text-green-400">+2.13% (24h)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">60</div>
                <div className="text-sm text-gray-400 mb-1">Fear & Greed Index</div>
                <div className="text-xs text-orange-400">Greed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">$645.31</div>
                <div className="text-sm text-gray-400 mb-1">SPY Price</div>
                <div className="text-xs text-green-400">+1.54% (24h)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}