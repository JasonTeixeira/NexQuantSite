/**
 * Mobile-Optimized Terminal Component - Phase 2 Mobile Enhancement
 * Touch-first interface with gesture support, offline capabilities, and PWA features
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Smartphone, 
  Wifi, 
  WifiOff,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Bell,
  Download,
  Home,
  User
} from 'lucide-react'

// Mobile-specific hooks
const useSwipe = (onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        onSwipe(deltaX > 0 ? 'right' : 'left')
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        onSwipe(deltaY > 0 ? 'down' : 'up')
      }
    }

    setTouchStart(null)
  }

  return { handleTouchStart, handleTouchEnd }
}

const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  return { canInstall: !!deferredPrompt, isInstalled, installPWA }
}

interface MobileTerminalProps {
  portfolioData?: {
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    volatility: number
  }
}

export default function MobileOptimizedTerminal({ 
  portfolioData = {
    totalReturn: 24.7,
    sharpeRatio: 1.43,
    maxDrawdown: -8.2,
    winRate: 68.4,
    volatility: 12.8
  }
}: MobileTerminalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  
  const isOnline = useOfflineStatus()
  const { canInstall, isInstalled, installPWA } = usePWA()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Swipe gestures
  const { handleTouchStart, handleTouchEnd } = useSwipe((direction) => {
    const tabs = ['overview', 'portfolio', 'analysis', 'signals']
    const currentIndex = tabs.indexOf(activeTab)
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  })

  // Push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Register for push notifications
      const requestNotificationPermission = async () => {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          console.log('✅ Push notifications enabled')
        }
      }
      
      requestNotificationPermission()
    }
  }, [])

  // Mock real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const signals = [
          '🚀 AAPL bullish signal detected',
          '⚠️ Market volatility spike',
          '💰 Portfolio milestone reached',
          '📊 New AI insight available'
        ]
        const newNotification = signals[Math.floor(Math.random() * signals.length)]
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)])
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const handleCommand = useCallback((command: string) => {
    if (!command.trim()) return

    setCommandHistory(prev => [command, ...prev.slice(0, 19)])
    setCurrentCommand('')

    // Mock command processing
    const response = `Processing: ${command}`
    setTimeout(() => {
      setNotifications(prev => [response, ...prev.slice(0, 4)])
    }, 500)
  }, [])

  const quickActions = [
    { id: 'scan', label: 'Market Scan', icon: Activity, color: 'bg-blue-500' },
    { id: 'alert', label: 'Set Alert', icon: Bell, color: 'bg-orange-500' },
    { id: 'analyze', label: 'AI Analysis', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'portfolio', label: 'Portfolio', icon: BarChart3, color: 'bg-green-500' }
  ]

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} bg-[#0a0a0f] text-white min-h-screen transition-all duration-300`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#2a2a3e]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-bold text-[#00bbff]">Nexural</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <Badge 
              variant="outline" 
              className={`px-2 py-1 text-xs ${isOnline 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? 'Live' : 'Offline'}
            </Badge>

            {/* PWA Install Button */}
            {canInstall && !isInstalled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={installPWA}
                className="p-2"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="px-4 pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-[#1a1a2e] p-1">
              <TabsTrigger value="overview" className="text-xs py-2">
                <Home className="w-4 h-4 mr-1" />
                Home
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="text-xs py-2">
                <BarChart3 className="w-4 h-4 mr-1" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs py-2">
                <Activity className="w-4 h-4 mr-1" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="signals" className="text-xs py-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Signals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-80 bg-[#0a0a0f] border-r border-[#2a2a3e] p-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#00bbff] mb-4">Menu</h2>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications ({notifications.length})
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                </div>
              </div>
              
              {/* Recent Notifications */}
              <div>
                <h3 className="text-sm font-semibold text-[#a0a0b8] mb-2">Recent Alerts</h3>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {notifications.map((notification, index) => (
                      <div 
                        key={index} 
                        className="text-xs p-2 bg-[#1a1a2e] rounded border border-[#2a2a3e]"
                      >
                        {notification}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 pb-20">
        <Tabs value={activeTab}>
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Portfolio Overview</h2>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">+{portfolioData.totalReturn}%</p>
                    <p className="text-xs text-[#a0a0b8]">Total Return</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{portfolioData.sharpeRatio}</p>
                    <p className="text-xs text-[#a0a0b8]">Sharpe Ratio</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm font-semibold text-red-400">{portfolioData.maxDrawdown}%</p>
                    <p className="text-xs text-[#a0a0b8]">Max DD</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-400">{portfolioData.winRate}%</p>
                    <p className="text-xs text-[#a0a0b8]">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">{portfolioData.volatility}%</p>
                    <p className="text-xs text-[#a0a0b8]">Volatility</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-[#a0a0b8] mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-16 flex flex-col gap-2 bg-[#1a1a2e] border-[#2a2a3e] hover:bg-[#2a2a3e]"
                    >
                      <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Portfolio Details</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded border border-[#2a2a3e]">
                    <div>
                      <p className="font-semibold text-white">AAPL</p>
                      <p className="text-xs text-[#a0a0b8]">100 shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-400">+$1,250</p>
                      <p className="text-xs text-green-400">+8.4%</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded border border-[#2a2a3e]">
                    <div>
                      <p className="font-semibold text-white">MSFT</p>
                      <p className="text-xs text-[#a0a0b8]">75 shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-400">-$340</p>
                      <p className="text-xs text-red-400">-2.1%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <p className="text-sm text-blue-400">
                      🧠 Market sentiment is bullish. Consider increasing tech exposure.
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                    <p className="text-sm text-orange-400">
                      ⚠️ High volatility detected in energy sector. Monitor closely.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="mt-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Live Signals</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <div>
                      <p className="font-semibold text-green-400">TSLA BUY</p>
                      <p className="text-xs text-[#a0a0b8]">AI Confidence: 87%</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Strong
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <div>
                      <p className="font-semibold text-yellow-400">NVDA HOLD</p>
                      <p className="text-xs text-[#a0a0b8]">AI Confidence: 72%</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Moderate
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Command Input (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-sm border-t border-[#2a2a3e] p-4">
        <div className="flex gap-2">
          <Input
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand(currentCommand)
              }
            }}
            placeholder="Enter AI command..."
            className="flex-1 bg-[#1a1a2e] border-[#2a2a3e] text-white placeholder-[#666] text-sm"
          />
          <Button 
            onClick={() => handleCommand(currentCommand)}
            className="bg-[#00bbff] hover:bg-[#0099cc] text-black px-4"
            disabled={!currentCommand.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
