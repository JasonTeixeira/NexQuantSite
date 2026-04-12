"use client"
import { useState, useEffect } from 'react'
import { debug } from '@/lib/debug'

export const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    renders: 0,
    apiCalls: 0,
    memory: 0,
    fps: 0
  })

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setStats(prev => ({ ...prev, fps }))
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }

    const measureMemory = () => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory
        const used = Math.round(mem.usedJSHeapSize / 1024 / 1024)
        setStats(prev => ({ ...prev, memory: used }))
      }
    }

    measureFPS()
    const memoryInterval = setInterval(measureMemory, 1000)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      clearInterval(memoryInterval)
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-[#1a1a25] border border-[#2a2a3e] rounded-lg p-2 text-[#a0a0b8] hover:text-white transition-colors"
        title="Toggle Debug Panel"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-[#0f1320] border border-[#2a2a3e] rounded-lg p-4 text-xs text-white shadow-2xl min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#00bbff]">Debug Panel</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.clear()
                  debug.log('Console cleared')
                }}
                className="px-2 py-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded text-xs transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  debug.log('LocalStorage cleared')
                }}
                className="px-2 py-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded text-xs transition-colors"
              >
                Clear LS
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#a0a0b8]">FPS:</span>
              <span className={stats.fps < 30 ? 'text-red-400' : stats.fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
                {stats.fps}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[#a0a0b8]">Memory:</span>
              <span className={stats.memory > 100 ? 'text-red-400' : stats.memory > 50 ? 'text-yellow-400' : 'text-green-400'}>
                {stats.memory}MB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[#a0a0b8]">Renders:</span>
              <span className="text-white">{stats.renders}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[#a0a0b8]">API Calls:</span>
              <span className="text-white">{stats.apiCalls}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#2a2a3e]">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  debug.log('Manual debug log')
                  debug.warn('Manual debug warning')
                  debug.error('Manual debug error')
                }}
                className="px-2 py-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded text-xs transition-colors"
              >
                Test Logs
              </button>
              <button
                onClick={() => {
                  debug.memory()
                  debug.performance('DebugPanel', 25)
                  debug.api('/api/test', 'GET', 1500)
                }}
                className="px-2 py-1 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded text-xs transition-colors"
              >
                Test Alerts
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#2a2a3e] text-[#808090] text-xs">
            <div>💡 Development Mode</div>
            <div>🔧 Ctrl+Shift+K for Cursor AI</div>
          </div>
        </div>
      )}
    </>
  )
}
