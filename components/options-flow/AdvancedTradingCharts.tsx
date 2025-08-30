"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  LineChart, Activity, TrendingUp, TrendingDown, Play, Pause,
  Settings, Zap, BarChart3, Eye, Volume2, Calculator,
  Target, Info, Layers
} from "lucide-react"
import { OptionsFlow } from "@/lib/options-flow-data"

interface AdvancedTradingChartsProps {
  symbol?: string
  flows?: OptionsFlow[]
  className?: string
}

interface ChartDataPoint {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  gamma: number
  delta: number
  theta: number
  vega: number
  optionsVolume: number
}

interface TechnicalIndicator {
  name: string
  enabled: boolean
  color: string
  params: Record<string, number>
  data: number[]
}

const AdvancedTradingCharts = React.memo(({ symbol = "SPY", className = "" }: AdvancedTradingChartsProps) => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('5m')
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'heikin-ashi'>('candlestick')
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  const [showGreeks, setShowGreeks] = useState(false)
  const [showFlow, setShowFlow] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize indicators
  useEffect(() => {
    const defaultIndicators: TechnicalIndicator[] = [
      {
        name: 'Moving Average (20)',
        enabled: true,
        color: '#00FF88',
        params: { period: 20 },
        data: []
      },
      {
        name: 'Moving Average (50)',
        enabled: false,
        color: '#FF6B6B',
        params: { period: 50 },
        data: []
      },
      {
        name: 'Bollinger Bands',
        enabled: false,
        color: '#4ECDC4',
        params: { period: 20, deviation: 2 },
        data: []
      },
      {
        name: 'RSI',
        enabled: false,
        color: '#45B7D1',
        params: { period: 14 },
        data: []
      },
      {
        name: 'MACD',
        enabled: false,
        color: '#96CEB4',
        params: { fast: 12, slow: 26, signal: 9 },
        data: []
      }
    ]
    setIndicators(defaultIndicators)
  }, [])

  // Memoized chart data generation
  const chartData = useMemo(() => {
    const generateChartData = () => {
      const data: ChartDataPoint[] = []
      const now = new Date()
      let currentPrice = symbol === 'SPY' ? 450 : 180

      for (let i = 100; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000)
        const volatility = 0.02
        const randomChange = (Math.random() - 0.5) * volatility * currentPrice
        
        const open = currentPrice
        const close = currentPrice + randomChange
        const high = Math.max(open, close) + Math.random() * 0.01 * currentPrice
        const low = Math.min(open, close) - Math.random() * 0.01 * currentPrice
        const volume = Math.floor(Math.random() * 1000000) + 100000

        data.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
          gamma: Math.random() * 0.1,
          delta: Math.random() * 0.8 + 0.1,
          theta: -Math.random() * 0.05,
          vega: Math.random() * 0.3,
          optionsVolume: Math.floor(Math.random() * 50000) + 5000
        })

        currentPrice = close
      }
      return data
    }

    return generateChartData()
  }, [symbol])

  // Chart rendering with performance optimizations
  const renderChart = useCallback(() => {
    if (!canvasRef.current || chartData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set proper canvas dimensions
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Chart dimensions
    const margin = { top: 20, right: 60, bottom: 60, left: 60 }
    const chartWidth = rect.width - margin.left - margin.right
    const chartHeight = rect.height - margin.top - margin.bottom

    // Calculate price range
    const prices = chartData.map(d => [d.high, d.low]).flat()
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const priceScale = chartHeight / priceRange

    // Time range
    const timeRange = chartData[chartData.length - 1].timestamp.getTime() - chartData[0].timestamp.getTime()
    const timeScale = chartWidth / timeRange

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = margin.top + (chartHeight / 10) * i
      ctx.beginPath()
      ctx.moveTo(margin.left, y)
      ctx.lineTo(margin.left + chartWidth, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = margin.left + (chartWidth / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, margin.top + chartHeight)
      ctx.stroke()
    }

    // Draw candlesticks
    chartData.forEach((dataPoint, index) => {
      const x = margin.left + (dataPoint.timestamp.getTime() - chartData[0].timestamp.getTime()) / timeRange * chartWidth
      const openY = margin.top + (maxPrice - dataPoint.open) * priceScale
      const closeY = margin.top + (maxPrice - dataPoint.close) * priceScale
      const highY = margin.top + (maxPrice - dataPoint.high) * priceScale
      const lowY = margin.top + (maxPrice - dataPoint.low) * priceScale

      const isGreen = dataPoint.close > dataPoint.open
      ctx.strokeStyle = isGreen ? '#00FF88' : '#FF4757'
      ctx.fillStyle = isGreen ? '#00FF88' : '#FF4757'
      ctx.lineWidth = 1

      // Draw wick
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Draw body
      if (chartType === 'candlestick') {
        const bodyHeight = Math.abs(closeY - openY)
        const bodyWidth = Math.max(2, chartWidth / chartData.length * 0.8)
        
        ctx.fillRect(x - bodyWidth / 2, Math.min(openY, closeY), bodyWidth, Math.max(1, bodyHeight))
        
        if (!isGreen) {
          ctx.strokeStyle = '#FF4757'
          ctx.strokeRect(x - bodyWidth / 2, Math.min(openY, closeY), bodyWidth, Math.max(1, bodyHeight))
        }
      }
    })

    // Draw moving averages
    indicators.forEach(indicator => {
      if (!indicator.enabled) return

      ctx.strokeStyle = indicator.color
      ctx.lineWidth = 2
      ctx.beginPath()

      if (indicator.name.includes('Moving Average')) {
        const period = indicator.params.period
        for (let i = period - 1; i < chartData.length; i++) {
          const sum = chartData.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
          const avg = sum / period
          const x = margin.left + (chartData[i].timestamp.getTime() - chartData[0].timestamp.getTime()) / timeRange * chartWidth
          const y = margin.top + (maxPrice - avg) * priceScale

          if (i === period - 1) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
    })

    // Draw volume bars (if enabled)
    if (showVolume) {
      const maxVolume = Math.max(...chartData.map(d => d.volume))
      const volumeHeight = chartHeight * 0.2

      chartData.forEach(dataPoint => {
        const x = margin.left + (dataPoint.timestamp.getTime() - chartData[0].timestamp.getTime()) / timeRange * chartWidth
        const height = (dataPoint.volume / maxVolume) * volumeHeight
        const barWidth = Math.max(1, chartWidth / chartData.length * 0.8)

        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)'
        ctx.fillRect(x - barWidth / 2, margin.top + chartHeight - height, barWidth, height)
      })
    }

    // Draw price labels
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'

    for (let i = 0; i <= 10; i++) {
      const price = maxPrice - (priceRange / 10) * i
      const y = margin.top + (chartHeight / 10) * i + 4
      ctx.fillText(price.toFixed(2), margin.left - 10, y)
    }

  }, [chartData, indicators, showVolume, chartType])

  // Re-render chart when data or settings change
  useEffect(() => {
    const timer = setTimeout(renderChart, 100)
    return () => clearTimeout(timer)
  }, [renderChart])

  // Auto-update chart data
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      renderChart()
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, renderChart])

  // Current data for display
  const currentData = chartData && chartData.length > 0 ? chartData[chartData.length - 1] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`space-y-6 ${className}`}
    >
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-primary/20">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/20 text-primary border border-primary/30">
            <LineChart className="w-3 h-3 mr-1" />
            {symbol} - {timeframe}
          </Badge>
          
          {currentData && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Price:</span>
              <span className="text-white font-mono">${currentData.close.toFixed(2)}</span>
              <span className={`${currentData.close > currentData.open ? 'text-green-400' : 'text-red-400'}`}>
                {currentData.close > currentData.open ? '+' : ''}
                {((currentData.close - currentData.open) / currentData.open * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-3"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            variant={showVolume ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVolume(!showVolume)}
            className="h-8 px-3"
          >
            <Volume2 className="w-4 h-4 mr-1" />
            Volume
          </Button>

          <Button
            variant={showGreeks ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGreeks(!showGreeks)}
            className="h-8 px-3"
          >
            <Calculator className="w-4 h-4 mr-1" />
            Greeks
          </Button>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Advanced Trading Charts
            </CardTitle>
            <div className="flex gap-2">
              {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(tf as any)}
                  className="h-8 px-2 text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-black/20 rounded-lg"
              style={{ touchAction: 'none' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Technical Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {indicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: indicator.color }}
                    />
                    <span className="text-white text-sm">{indicator.name}</span>
                  </div>
                  <Button
                    variant={indicator.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newIndicators = [...indicators]
                      newIndicators[index].enabled = !newIndicators[index].enabled
                      setIndicators(newIndicators)
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    {indicator.enabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Greeks Display */}
        {currentData && showGreeks && (
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                Options Greeks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-400">Delta</div>
                  <div className="text-lg font-mono text-white">
                    {currentData.delta.toFixed(4)}
                  </div>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-400">Gamma</div>
                  <div className="text-lg font-mono text-white">
                    {currentData.gamma.toFixed(4)}
                  </div>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-400">Theta</div>
                  <div className="text-lg font-mono text-red-400">
                    {currentData.theta.toFixed(4)}
                  </div>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-400">Vega</div>
                  <div className="text-lg font-mono text-white">
                    {currentData.vega.toFixed(4)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  )
})

AdvancedTradingCharts.displayName = 'AdvancedTradingCharts'
export default AdvancedTradingCharts
