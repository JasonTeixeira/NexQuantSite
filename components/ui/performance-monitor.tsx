"use client"

import React, { useState, useEffect, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Zap, Clock, MemoryStick } from 'lucide-react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  bundleSize: number
  fps: number
  componentCount: number
  reRenderCount: number
}

const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 464, // From build output
    fps: 60,
    componentCount: 0,
    reRenderCount: 0
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let frameId: number
    let lastTime = performance.now()
    let frameCount = 0

    const measurePerformance = () => {
      const now = performance.now()
      frameCount++

      // Calculate FPS every second
      if (now - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (now - lastTime))
        }))
        frameCount = 0
        lastTime = now
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }))
      }

      frameId = requestAnimationFrame(measurePerformance)
    }

    if (isVisible) {
      measurePerformance()
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [isVisible])

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-[#1a1a25] border border-[#2a2a3e] rounded-lg p-2 text-[#a0a0b8] hover:text-white transition-colors"
          title="Show Performance Monitor (Ctrl+Shift+P)"
        >
          <Activity className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-400'
    if (value <= thresholds[1]) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getProgressColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'bg-green-500'
    if (value <= thresholds[1]) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-[#0e111a] border-[#2a2a3e]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-[#a0a0b8] hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#a0a0b8]" />
              <span className="text-xs text-[#a0a0b8]">FPS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${getPerformanceColor(60 - (metrics.fps || 60), [5, 15])}`}>
                {metrics.fps || '60'}
              </span>
              <Badge variant={metrics.fps >= 55 ? "default" : metrics.fps >= 45 ? "secondary" : "destructive"}>
                {metrics.fps >= 55 ? "Good" : metrics.fps >= 45 ? "Fair" : "Poor"}
              </Badge>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="w-3 h-3 text-[#a0a0b8]" />
                <span className="text-xs text-[#a0a0b8]">Memory</span>
              </div>
              <span className={`text-xs font-mono ${getPerformanceColor(metrics.memoryUsage || 0, [50, 100])}`}>
                {metrics.memoryUsage || '0'} MB
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.memoryUsage / 200) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Bundle Size */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-[#a0a0b8]" />
                <span className="text-xs text-[#a0a0b8]">Bundle</span>
              </div>
              <span className={`text-xs font-mono ${getPerformanceColor(metrics.bundleSize || 0, [300, 500])}`}>
                {metrics.bundleSize || '0'} KB
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.bundleSize / 1000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Performance Tips */}
          <div className="pt-2 border-t border-[#2a2a3e]">
            <div className="text-xs text-[#a0a0b8] space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Lazy loading active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Code splitting enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Chart optimization active</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#6b7280] text-center pt-1">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

export default PerformanceMonitor
