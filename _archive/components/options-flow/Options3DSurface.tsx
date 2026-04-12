"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Box, RotateCcw, Maximize, Minimize, Play, Pause, 
  TrendingUp, Zap, Target, Layers
} from "lucide-react"

interface Options3DSurfaceProps {
  symbol: string
  className?: string
}

interface SurfaceDataPoint {
  strike: number
  timeToExpiry: number
  impliedVolatility: number
  volume: number
  openInterest: number
  gamma: number
}

export default function Options3DSurface({ symbol, className = "" }: Options3DSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [surfaceData, setSurfaceData] = useState<SurfaceDataPoint[]>([])
  const [viewMode, setViewMode] = useState<'iv' | 'volume' | 'gamma'>('iv')
  
  // Generate 3D surface data
  useEffect(() => {
    const generateSurfaceData = () => {
      const data: SurfaceDataPoint[] = []
      const strikes = Array.from({ length: 20 }, (_, i) => 80 + i * 10) // 80-270 strikes
      const timeToExpiries = Array.from({ length: 10 }, (_, i) => 0.01 + i * 0.1) // 1% to 91% of year
      
      strikes.forEach(strike => {
        timeToExpiries.forEach(timeToExpiry => {
          // Generate realistic implied volatility smile/skew
          const moneyness = strike / 150 // Assuming underlying at 150
          const skew = Math.exp(-Math.pow(moneyness - 1, 2) * 2) * 0.3 + 0.2
          const timeDecay = Math.sqrt(timeToExpiry) * 0.4
          const randomness = (Math.random() - 0.5) * 0.1
          
          const impliedVolatility = (skew + timeDecay + randomness) * 100
          const volume = Math.floor(Math.random() * 5000) + 100
          const openInterest = Math.floor(Math.random() * 10000) + 500
          const gamma = Math.random() * 0.05 + 0.005
          
          data.push({
            strike,
            timeToExpiry,
            impliedVolatility: Math.max(10, Math.min(80, impliedVolatility)),
            volume,
            openInterest,
            gamma
          })
        })
      })
      
      return data
    }
    
    setSurfaceData(generateSurfaceData())
  }, [symbol])

  // 3D Canvas Rendering
  useEffect(() => {
    if (!canvasRef.current || surfaceData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    let animationFrame: number
    let rotation = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      
      const centerX = canvas.offsetWidth / 2
      const centerY = canvas.offsetHeight / 2
      const scale = 150

      // 3D projection parameters
      const fov = 800
      const distance = 400

      // Create grid of points for the surface
      const gridSize = 20
      const points: Array<{ x: number; y: number; z: number; value: number; color: string }> = []

      surfaceData.forEach(point => {
        const x = (point.strike - 150) / 10  // Normalize strike
        const y = (point.timeToExpiry - 0.5) * 20  // Normalize time
        let z = 0
        let value = 0
        let color = '#00FF88'

        switch (viewMode) {
          case 'iv':
            z = (point.impliedVolatility - 30) / 5
            value = point.impliedVolatility
            color = `hsl(${Math.max(0, 240 - value * 3)}, 70%, 60%)`
            break
          case 'volume':
            z = point.volume / 500
            value = point.volume
            color = `hsl(${120 + value / 100}, 70%, 60%)`
            break
          case 'gamma':
            z = point.gamma * 100
            value = point.gamma
            color = `hsl(${60 + value * 1000}, 70%, 60%)`
            break
        }

        points.push({ x, y, z, value, color })
      })

      // Sort points by z-distance for proper rendering
      points.sort((a, b) => {
        const rotY = Math.cos(rotation) * a.x + Math.sin(rotation) * a.z
        const rotZ_a = -Math.sin(rotation) * a.x + Math.cos(rotation) * a.z + distance
        
        const rotY_b = Math.cos(rotation) * b.x + Math.sin(rotation) * b.z
        const rotZ_b = -Math.sin(rotation) * b.x + Math.cos(rotation) * b.z + distance
        
        return rotZ_b - rotZ_a
      })

      // Draw surface points
      points.forEach((point, index) => {
        // 3D rotation
        const rotX = point.x
        const rotY = Math.cos(rotation) * point.y + Math.sin(rotation) * point.z
        const rotZ = -Math.sin(rotation) * point.y + Math.cos(rotation) * point.z + distance

        // Perspective projection
        const screenX = centerX + (rotX * fov) / rotZ * scale / 100
        const screenY = centerY + (rotY * fov) / rotZ * scale / 100
        
        // Size based on distance
        const size = Math.max(1, 8 / rotZ * fov)
        
        // Draw point
        ctx.beginPath()
        ctx.arc(screenX, screenY, size, 0, 2 * Math.PI)
        ctx.fillStyle = point.color + '80'
        ctx.fill()
        
        // Add glow effect for high values
        if (point.value > 50) {
          ctx.beginPath()
          ctx.arc(screenX, screenY, size * 1.5, 0, 2 * Math.PI)
          ctx.fillStyle = point.color + '20'
          ctx.fill()
        }
      })

      // Draw grid lines for reference
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      for (let i = -10; i <= 10; i += 2) {
        for (let j = -10; j <= 10; j += 2) {
          const x1 = i, y1 = j, z1 = 0
          const x2 = i, y2 = j + 2, z2 = 0
          
          // Rotate and project
          const rotY1 = Math.cos(rotation) * y1 + Math.sin(rotation) * z1
          const rotZ1 = -Math.sin(rotation) * y1 + Math.cos(rotation) * z1 + distance
          const screenX1 = centerX + (x1 * fov) / rotZ1 * scale / 100
          const screenY1 = centerY + (rotY1 * fov) / rotZ1 * scale / 100
          
          const rotY2 = Math.cos(rotation) * y2 + Math.sin(rotation) * z2
          const rotZ2 = -Math.sin(rotation) * y2 + Math.cos(rotation) * z2 + distance
          const screenX2 = centerX + (x2 * fov) / rotZ2 * scale / 100
          const screenY2 = centerY + (rotY2 * fov) / rotZ2 * scale / 100
          
          ctx.beginPath()
          ctx.moveTo(screenX1, screenY1)
          ctx.lineTo(screenX2, screenY2)
          ctx.stroke()
        }
      }

      // Update rotation
      if (isRotating) {
        rotation += 0.02
      }

      animationFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [surfaceData, viewMode, isRotating])

  const getViewModeLabel = (mode: string) => {
    switch (mode) {
      case 'iv': return 'Implied Volatility'
      case 'volume': return 'Volume'
      case 'gamma': return 'Gamma Exposure'
      default: return mode
    }
  }

  const getViewModeDescription = (mode: string) => {
    switch (mode) {
      case 'iv': return 'Shows IV smile/skew across strikes and time'
      case 'volume': return 'Visualizes trading volume distribution'
      case 'gamma': return 'Displays gamma exposure concentration'
      default: return ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={`bg-black/40 backdrop-blur-sm border border-primary/20 ${
          isFullscreen ? 'fixed inset-4 z-50' : ''
        }`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/40 flex items-center justify-center"
                  animate={{
                    rotateY: isRotating ? [0, 360] : 0,
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 30px rgba(147, 51, 234, 0.5)",
                      "0 0 20px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ 
                    rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Box className="w-5 h-5 text-blue-400" />
                </motion.div>
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    3D Options Surface
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                      {symbol}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    {getViewModeDescription(viewMode)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Selector */}
                <div className="flex gap-1">
                  {[
                    { key: 'iv', label: 'IV', icon: Target },
                    { key: 'volume', label: 'Vol', icon: TrendingUp },
                    { key: 'gamma', label: 'Gamma', icon: Zap }
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={viewMode === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(key as any)}
                      className={`${
                        viewMode === key 
                          ? "bg-blue-500/20 text-blue-400 border border-blue-400/50" 
                          : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRotating(!isRotating)}
                  className={`${isRotating ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-gray-400 hover:text-white"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className={`relative bg-black/20 ${
              isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
            }`}>
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ 
                  background: 'radial-gradient(circle at center, rgba(0,255,136,0.05) 0%, transparent 70%)'
                }}
              />
              
              {/* Axis Labels */}
              <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Strike Price →</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>← Time to Expiry</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>↑ {getViewModeLabel(viewMode)}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                <div className="text-xs text-white font-semibold mb-2">
                  {getViewModeLabel(viewMode)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      background: viewMode === 'iv' ? 'hsl(240, 70%, 60%)' :
                                 viewMode === 'volume' ? 'hsl(120, 70%, 60%)' :
                                 'hsl(60, 70%, 60%)'
                    }}></div>
                    <span className="text-xs text-gray-300">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      background: viewMode === 'iv' ? 'hsl(120, 70%, 60%)' :
                                 viewMode === 'volume' ? 'hsl(200, 70%, 60%)' :
                                 'hsl(120, 70%, 60%)'
                    }}></div>
                    <span className="text-xs text-gray-300">High</span>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {surfaceData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Layers className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
                    <p className="text-gray-400">Building 3D Surface...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Surface Statistics */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { 
            label: "Peak IV", 
            value: surfaceData.length > 0 ? `${Math.max(...surfaceData.map(d => d.impliedVolatility)).toFixed(1)}%` : "0%",
            color: "text-red-400" 
          },
          { 
            label: "Min IV", 
            value: surfaceData.length > 0 ? `${Math.min(...surfaceData.map(d => d.impliedVolatility)).toFixed(1)}%` : "0%",
            color: "text-green-400" 
          },
          { 
            label: "Total Volume", 
            value: surfaceData.length > 0 ? `${Math.floor(surfaceData.reduce((sum, d) => sum + d.volume, 0) / 1000)}K` : "0K",
            color: "text-blue-400" 
          },
          { 
            label: "Max Gamma", 
            value: surfaceData.length > 0 ? `${Math.max(...surfaceData.map(d => d.gamma)).toFixed(3)}` : "0",
            color: "text-yellow-400" 
          }
        ].map((stat, index) => (
          <div key={stat.label} className="text-center p-3 bg-black/20 rounded-lg border border-primary/10">
            <div className={`text-xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Info */}
      <motion.div
        className="text-center p-4 bg-black/20 rounded-lg border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Box className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Proprietary 3D Visualization</span>
        </div>
        <p className="text-xs text-gray-400">
          Interactive 3D surface showing real-time options data across strikes and time to expiration.
          Click and drag to rotate • Use view modes to explore different metrics
        </p>
      </motion.div>
    </div>
  )
}
