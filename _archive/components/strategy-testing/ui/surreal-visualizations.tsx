"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  ComposedChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// 🎨 SURREAL COLOR PALETTES
export const SURREAL_PALETTES = {
  neon: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff4500', '#9400d3'],
  ocean: ['#001f3f', '#0074d9', '#39cccc', '#2ecc40', '#01ff70', '#7fdbff'],
  fire: ['#ff4136', '#ff851b', '#ffdc00', '#ff6b35', '#f012be', '#b10dc9'],
  aurora: ['#00c9ff', '#92fe9d', '#fa709a', '#fee140', '#a8edea', '#fed6e3'],
  cyberpunk: ['#00ffff', '#ff0080', '#8000ff', '#ff8000', '#00ff80', '#ff0040'],
  galaxy: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
} as const

// 🌟 ANIMATED GRADIENT BACKGROUND
export const AnimatedGradientBackground = ({ palette = 'aurora', className = '' }: {
  palette?: keyof typeof SURREAL_PALETTES
  className?: string
}) => {
  return (
    <div className={cn("absolute inset-0 opacity-10", className)}>
      <div 
        className="w-full h-full animate-gradient-shift"
        style={{
          background: `linear-gradient(45deg, ${SURREAL_PALETTES[palette].join(', ')})`,
          backgroundSize: '400% 400%',
        }}
      />
    </div>
  )
}

// 🎯 SURREAL PERFORMANCE CHART
interface SurrealPerformanceChartProps {
  data: Array<{
    date: string
    portfolio: number
    benchmark: number
    drawdown: number
    volume?: number
  }>
  height?: number
  showVolume?: boolean
  palette?: keyof typeof SURREAL_PALETTES
}

export const SurrealPerformanceChart: React.FC<SurrealPerformanceChartProps> = ({
  data,
  height = 400,
  showVolume = true,
  palette = 'aurora'
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)
  const colors = SURREAL_PALETTES[palette]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl"
      >
        <div className="text-cyan-400 font-mono text-sm mb-2">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-mono">
              {entry.name}: {entry.value?.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    )
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl overflow-hidden">
      <AnimatedGradientBackground palette={palette} />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            animate={{
              x: [0, Math.random() * 400],
              y: [0, Math.random() * 300],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Portfolio Performance
          </h3>
          <p className="text-slate-400 font-mono text-sm">Real-time performance visualization</p>
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[1]} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={colors[1]} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[2]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[2]} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.6)" 
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)" 
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Portfolio Area */}
            <Area
              type="monotone"
              dataKey="portfolio"
              stroke={colors[0]}
              strokeWidth={3}
              fill="url(#portfolioGradient)"
              name="Portfolio"
            />
            
            {/* Benchmark Line */}
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke={colors[1]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Benchmark"
            />
            
            {/* Drawdown Area (negative) */}
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke={colors[2]}
              strokeWidth={2}
              fill="url(#drawdownGradient)"
              name="Drawdown"
            />
            
            {/* Volume Bars */}
            {showVolume && (
              <Bar
                dataKey="volume"
                fill={colors[3]}
                opacity={0.3}
                name="Volume"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 🌊 LIQUID RISK GAUGE
interface LiquidRiskGaugeProps {
  value: number
  max: number
  label: string
  color?: string
  size?: number
}

export const LiquidRiskGauge: React.FC<LiquidRiskGaugeProps> = ({
  value,
  max,
  label,
  color = '#00ffff',
  size = 200
}) => {
  const percentage = (value / max) * 100
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="relative flex flex-col items-center">
      <div 
        className="relative rounded-full border-4 border-cyan-500/30 overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Animated liquid fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-cyan-600 opacity-80"
          initial={{ height: 0 }}
          animate={{ height: `${animatedValue}%` }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Liquid wave animation */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-50, 50, -50] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: `${animatedValue}%` }}
          />
        </div>
        
        {/* Value display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">
              {value.toFixed(1)}
            </div>
            <div className="text-xs text-cyan-300 font-mono">
              / {max}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-400 font-mono">{percentage.toFixed(1)}%</div>
      </div>
    </div>
  )
}

// 🎭 3D CORRELATION MATRIX
interface CorrelationMatrixProps {
  data: Array<{
    asset1: string
    asset2: string
    correlation: number
  }>
  size?: number
}

export const SurrealCorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  data,
  size = 400
}) => {
  const assets = useMemo(() => {
    const assetSet = new Set<string>()
    data.forEach(d => {
      assetSet.add(d.asset1)
      assetSet.add(d.asset2)
    })
    return Array.from(assetSet)
  }, [data])

  const getCorrelation = (asset1: string, asset2: string) => {
    if (asset1 === asset2) return 1
    const correlation = data.find(d => 
      (d.asset1 === asset1 && d.asset2 === asset2) ||
      (d.asset1 === asset2 && d.asset2 === asset1)
    )
    return correlation?.correlation || 0
  }

  const getColor = (correlation: number) => {
    if (correlation > 0.7) return '#00ff00'
    if (correlation > 0.3) return '#ffff00'
    if (correlation > -0.3) return '#ffffff'
    if (correlation > -0.7) return '#ff8000'
    return '#ff0000'
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-purple-900/30 rounded-2xl p-6">
      <AnimatedGradientBackground palette="cyberpunk" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
          Asset Correlation Matrix
        </h3>
        
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${assets.length + 1}, 1fr)` }}>
          {/* Header row */}
          <div></div>
          {assets.map(asset => (
            <div key={asset} className="text-xs text-center text-cyan-400 font-mono p-2">
              {asset}
            </div>
          ))}
          
          {/* Data rows */}
          {assets.map(asset1 => (
            <React.Fragment key={asset1}>
              <div className="text-xs text-cyan-400 font-mono p-2">{asset1}</div>
              {assets.map(asset2 => {
                const correlation = getCorrelation(asset1, asset2)
                return (
                  <motion.div
                    key={`${asset1}-${asset2}`}
                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-mono font-bold relative overflow-hidden"
                    style={{ backgroundColor: getColor(correlation) + '20' }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.random() * 0.5 }}
                  >
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{ backgroundColor: getColor(correlation) }}
                    />
                    <span className="relative z-10 text-white">
                      {correlation.toFixed(2)}
                    </span>
                  </motion.div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

// 🚀 REAL-TIME TRADING FLOW
interface TradingFlowProps {
  trades: Array<{
    id: string
    symbol: string
    side: 'buy' | 'sell'
    quantity: number
    price: number
    timestamp: number
  }>
}

export const SurrealTradingFlow: React.FC<TradingFlowProps> = ({ trades }) => {
  const [visibleTrades, setVisibleTrades] = useState<typeof trades>([])

  useEffect(() => {
    const interval = setInterval(() => {
      if (trades.length > 0) {
        const newTrade = trades[Math.floor(Math.random() * trades.length)]
        setVisibleTrades(prev => [
          { ...newTrade, id: Date.now().toString() },
          ...prev.slice(0, 9)
        ])
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [trades])

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900/30 rounded-2xl p-6 h-96 overflow-hidden">
      <AnimatedGradientBackground palette="neon" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent mb-6">
          Live Trading Flow
        </h3>
        
        <div className="space-y-2">
          <AnimatePresence>
            {visibleTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1 - (index * 0.1), x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg backdrop-blur-sm border",
                  trade.side === 'buy' 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-red-500/10 border-red-500/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    trade.side === 'buy' ? "bg-green-400" : "bg-red-400"
                  )} />
                  <div>
                    <div className="font-mono font-bold text-white">
                      {trade.symbol}
                    </div>
                    <div className="text-xs text-slate-400">
                      {trade.side.toUpperCase()} {trade.quantity}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold text-white">
                    ${trade.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// 🌌 PORTFOLIO UNIVERSE MAP
interface PortfolioUniverseProps {
  positions: Array<{
    symbol: string
    weight: number
    return: number
    risk: number
    sector: string
  }>
}

export const PortfolioUniverse: React.FC<PortfolioUniverseProps> = ({ positions }) => {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

  const sectorColors = {
    'Technology': '#00ffff',
    'Healthcare': '#00ff00',
    'Finance': '#ffff00',
    'Energy': '#ff8000',
    'Consumer': '#ff00ff',
    'Industrial': '#8000ff',
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-purple-900/30 rounded-2xl p-6 h-96">
      <AnimatedGradientBackground palette="galaxy" />
      
      <div className="relative z-10 h-full">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Portfolio Universe
        </h3>
        
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="risk" 
              name="Risk"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="return" 
              name="Return"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
                    <div className="text-purple-400 font-mono font-bold">{data.symbol}</div>
                    <div className="text-white text-sm">Return: {data.return.toFixed(2)}%</div>
                    <div className="text-white text-sm">Risk: {data.risk.toFixed(2)}%</div>
                    <div className="text-white text-sm">Weight: {data.weight.toFixed(2)}%</div>
                    <div className="text-slate-400 text-xs">{data.sector}</div>
                  </div>
                )
              }}
            />
            <Scatter 
              data={positions} 
              fill="#8884d8"
              shape={(props: any) => {
                const { cx, cy, payload } = props
                const size = Math.max(payload.weight * 2, 8)
                const color = sectorColors[payload.sector as keyof typeof sectorColors] || '#ffffff'
                
                return (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill={color}
                    fillOpacity={0.6}
                    stroke={color}
                    strokeWidth={2}
                    whileHover={{ scale: 1.5 }}
                    onClick={() => setSelectedPosition(payload.symbol)}
                    className="cursor-pointer"
                  />
                )
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Components are already exported above
