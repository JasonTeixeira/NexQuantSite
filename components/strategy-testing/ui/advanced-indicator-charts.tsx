"use client"

import React, { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Brain, 
  Zap, 
  Target, 
  Activity,
  BarChart3,
  Layers,
  Eye,
  Settings,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { 
  AdvancedIndicatorFactory, 
  PriceData, 
  IndicatorResult,
  KalmanTrendFilter,
  HurstExponentCalculator,
  FractalDimensionIndicator,
  RegimeDetectionHMM,
  LiquidityAdjustedMomentum,
  MarketMicrostructureIndicator,
  MultiTimeframeMomentumConvergence
} from '@/lib/advanced-indicators'

// 🎨 INDICATOR ICONS AND COLORS
const INDICATOR_CONFIG = {
  kalmanTrend: { 
    icon: TrendingUp, 
    color: '#00ffff', 
    gradient: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10'
  },
  hurstExponent: { 
    icon: Brain, 
    color: '#ff00ff', 
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10'
  },
  fractalDimension: { 
    icon: Zap, 
    color: '#ffff00', 
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10'
  },
  regimeDetection: { 
    icon: Target, 
    color: '#00ff00', 
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10'
  },
  liquidityMomentum: { 
    icon: Activity, 
    color: '#ff4500', 
    gradient: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10'
  },
  microstructure: { 
    icon: BarChart3, 
    color: '#8a2be2', 
    gradient: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10'
  },
  multiTimeframeMomentum: { 
    icon: Layers, 
    color: '#00ced1', 
    gradient: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10'
  }
}

// 🎯 SIGNAL STRENGTH INDICATOR
const SignalStrengthIndicator = ({ signal, confidence }: { signal?: string, confidence?: number }) => {
  const getSignalColor = (signal?: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-500/20'
      case 'SELL': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const strengthBars = Math.round((confidence || 0) * 5)

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn("text-xs font-bold", getSignalColor(signal))}>
        {signal || 'HOLD'}
      </Badge>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 h-3 rounded-full transition-all duration-300",
              i < strengthBars ? "bg-cyan-400" : "bg-gray-600"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{((confidence || 0) * 100).toFixed(0)}%</span>
    </div>
  )
}

// 🎪 ADVANCED INDICATOR CHART COMPONENT
interface AdvancedIndicatorChartProps {
  indicatorKey: string
  data: IndicatorResult[]
  metadata: any
}

const AdvancedIndicatorChart = ({ indicatorKey, data, metadata }: AdvancedIndicatorChartProps) => {
  const config = INDICATOR_CONFIG[indicatorKey as keyof typeof INDICATOR_CONFIG]
  const Icon = config.icon
  const latestData = data[data.length - 1]

  // 🎨 CUSTOM TOOLTIP
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0a0a0f]/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-cyan-400 text-sm font-semibold">{metadata.name}</p>
          <p className="text-white text-lg font-bold">{data.value.toFixed(4)}</p>
          <SignalStrengthIndicator signal={data.signal} confidence={data.confidence} />
          {data.metadata && (
            <div className="mt-2 text-xs text-gray-400">
              {Object.entries(data.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="text-cyan-300">{
                    typeof value === 'number' ? value.toFixed(4) : String(value)
                  }</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-[#0a0a0f]/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{metadata.name}</CardTitle>
              <p className="text-gray-400 text-sm">{metadata.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {latestData?.value.toFixed(4)}
            </div>
            <SignalStrengthIndicator 
              signal={latestData?.signal} 
              confidence={latestData?.confidence} 
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {metadata.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {metadata.complexity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#606078" 
                fontSize={10}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#606078" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Main indicator line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2}
                dot={false}
                strokeDasharray={indicatorKey === 'regimeDetection' ? "5 5" : "0"}
              />
              
              {/* Signal areas */}
              <Area
                type="monotone"
                dataKey={(entry: IndicatorResult) => entry.signal === 'BUY' ? entry.value : null}
                fill="rgba(34, 197, 94, 0.2)"
                stroke="none"
              />
              <Area
                type="monotone"
                dataKey={(entry: IndicatorResult) => entry.signal === 'SELL' ? entry.value : null}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="none"
              />
              
              {/* Reference lines for specific indicators */}
              {indicatorKey === 'hurstExponent' && (
                <>
                  <ReferenceLine y={0.5} stroke="#666" strokeDasharray="2 2" />
                  <ReferenceLine y={0.6} stroke="#22c55e" strokeDasharray="2 2" />
                  <ReferenceLine y={0.4} stroke="#ef4444" strokeDasharray="2 2" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// 🎭 MAIN ADVANCED INDICATORS DASHBOARD
interface AdvancedIndicatorsDashboardProps {
  priceData: PriceData[]
}

export const AdvancedIndicatorsDashboard = ({ priceData }: AdvancedIndicatorsDashboardProps) => {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'kalmanTrend', 'hurstExponent', 'regimeDetection'
  ])
  const [viewMode, setViewMode] = useState<'grid' | 'tabs'>('grid')

  // 🧮 CALCULATE ALL INDICATORS
  const indicators = useMemo(() => {
    if (!priceData || priceData.length < 100) return {}
    return AdvancedIndicatorFactory.createAllIndicators(priceData)
  }, [priceData])

  const metadata = AdvancedIndicatorFactory.getIndicatorMetadata()

  // 🎯 INDICATOR SELECTION
  const toggleIndicator = (key: string) => {
    setSelectedIndicators(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  if (!priceData || priceData.length < 100) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Insufficient data for advanced indicators</p>
          <p className="text-sm">Need at least 100 data points</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="advanced-indicators">
      {/* 🎛️ CONTROLS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Advanced Indicators</h2>
          <p className="text-gray-400">Institutional-grade technical analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'tabs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tabs')}
            >
              <Layers className="w-4 h-4 mr-2" />
              Tabs
            </Button>
          </div>
        </div>
      </div>

      {/* 🎪 INDICATOR SELECTOR */}
      <Card className="bg-[#0a0a0f]/30 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Indicator Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(metadata).map(([key, meta]) => {
              const config = INDICATOR_CONFIG[key as keyof typeof INDICATOR_CONFIG]
              const Icon = config.icon
              const isSelected = selectedIndicators.includes(key)
              
              return (
                <motion.button
                  key={key}
                  onClick={() => toggleIndicator(key)}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200",
                    isSelected 
                      ? `bg-gradient-to-br ${config.gradient} border-white/20 text-white shadow-lg` 
                      : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-xs font-semibold">{meta.name.split(' ')[0]}</div>
                  <div className="text-xs opacity-75">{meta.complexity}</div>
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 📊 INDICATORS DISPLAY */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {selectedIndicators.map(key => (
              indicators[key] && (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: selectedIndicators.indexOf(key) * 0.1 }}
                >
                  <AdvancedIndicatorChart
                    indicatorKey={key}
                    data={indicators[key]}
                    metadata={metadata[key as keyof typeof metadata]}
                  />
                </motion.div>
              )
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="tabs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Tabs defaultValue={selectedIndicators[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-gray-800/50">
                {selectedIndicators.map(key => {
                  const config = INDICATOR_CONFIG[key as keyof typeof INDICATOR_CONFIG]
                  const Icon = config.icon
                  return (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Icon className="w-4 h-4" />
                      {metadata[key as keyof typeof metadata].name.split(' ')[0]}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              {selectedIndicators.map(key => (
                <TabsContent key={key} value={key} className="mt-6">
                  {indicators[key] && (
                    <AdvancedIndicatorChart
                      indicatorKey={key}
                      data={indicators[key]}
                      metadata={metadata[key as keyof typeof metadata]}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📈 SUMMARY STATS */}
      <Card className="bg-[#0a0a0f]/30 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Market Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedIndicators.map(key => {
              const data = indicators[key]
              if (!data || data.length === 0) return null
              
              const latest = data[data.length - 1]
              const config = INDICATOR_CONFIG[key as keyof typeof INDICATOR_CONFIG]
              
              return (
                <div key={key} className="text-center">
                  <div className={cn("text-2xl font-bold mb-1")} style={{ color: config.color }}>
                    {latest.value.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {metadata[key as keyof typeof metadata].name}
                  </div>
                  <SignalStrengthIndicator 
                    signal={latest.signal} 
                    confidence={latest.confidence} 
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedIndicatorsDashboard
