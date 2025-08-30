"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedProgressBar, 
  FloatingActionButton,
  NotificationToast,
  DataStreamLoader,
  SkeletonLoader,
  PulseLoader
} from './micro-interactions'
import { 
  Zap, 
  Heart, 
  Star, 
  TrendingUp, 
  Bell,
  Settings,
  Download,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

export const UIShowcase = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: number
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>>([])
  const [progress, setProgress] = useState(65)
  const [loading, setLoading] = useState(false)

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00bbff] to-[#4a4aff] bg-clip-text text-transparent mb-2">
          Enhanced UI Components Showcase
        </h1>
        <p className="text-[#a0a0b8]">Advanced micro-interactions and animations for the NexusQuant Terminal</p>
      </div>

      {/* Enhanced Buttons */}
      <EnhancedCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Enhanced Buttons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EnhancedButton variant="primary" onClick={() => addNotification('success', 'Primary action completed!')}>
            Primary
          </EnhancedButton>
          <EnhancedButton variant="secondary" onClick={() => addNotification('info', 'Secondary action triggered')}>
            Secondary
          </EnhancedButton>
          <EnhancedButton variant="ghost" onClick={() => addNotification('warning', 'Ghost button clicked')}>
            Ghost
          </EnhancedButton>
          <EnhancedButton variant="danger" onClick={() => addNotification('error', 'Danger action executed')}>
            Danger
          </EnhancedButton>
        </div>
        
        <div className="mt-4 flex gap-4">
          <EnhancedButton loading={loading} onClick={simulateLoading}>
            {loading ? 'Loading...' : 'Simulate Loading'}
          </EnhancedButton>
          <EnhancedButton disabled>
            Disabled
          </EnhancedButton>
        </div>
      </EnhancedCard>

      {/* Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedCard hoverable glowEffect>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">+12.5%</div>
            <p className="text-[#a0a0b8] text-sm">Portfolio growth this month</p>
          </CardContent>
        </EnhancedCard>

        <EnhancedCard hoverable>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">94/100</div>
            <p className="text-[#a0a0b8] text-sm">System health excellent</p>
          </CardContent>
        </EnhancedCard>

        <EnhancedCard hoverable>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">4.8★</div>
            <p className="text-[#a0a0b8] text-sm">User satisfaction</p>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* Progress Bars */}
      <EnhancedCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Enhanced Progress Bars</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#a0a0b8] mb-2 block">CPU Usage</label>
            <EnhancedProgressBar value={progress} color="#00bbff" />
          </div>
          <div>
            <label className="text-sm text-[#a0a0b8] mb-2 block">Memory Usage</label>
            <EnhancedProgressBar value={78} color="#4ade80" />
          </div>
          <div>
            <label className="text-sm text-[#a0a0b8] mb-2 block">Network Load</label>
            <EnhancedProgressBar value={45} color="#f59e0b" />
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <EnhancedButton size="sm" onClick={() => setProgress(Math.random() * 100)}>
            Randomize
          </EnhancedButton>
          <EnhancedButton size="sm" variant="secondary" onClick={() => setProgress(0)}>
            Reset
          </EnhancedButton>
        </div>
      </EnhancedCard>

      {/* Loaders */}
      <EnhancedCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Loading Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-[#a0a0b8] mb-3">Pulse Loader</h3>
            <PulseLoader size="lg" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-[#a0a0b8] mb-3">Data Stream</h3>
            <DataStreamLoader />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-[#a0a0b8] mb-3">Skeleton</h3>
            <SkeletonLoader lines={3} />
          </div>
        </div>
      </EnhancedCard>

      {/* Interactive Elements */}
      <EnhancedCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Interactive Elements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Badge className="animate-bounce-gentle cursor-pointer hover:scale-110 transition-transform">
            Live Data
          </Badge>
          <Badge variant="secondary" className="animate-pulse cursor-pointer hover:scale-110 transition-transform">
            Processing
          </Badge>
          <Badge variant="outline" className="hover:scale-110 transition-transform cursor-pointer">
            Connected
          </Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 animate-shimmer cursor-pointer hover:scale-110 transition-transform">
            Premium
          </Badge>
        </div>
      </EnhancedCard>

      {/* Floating Action Buttons */}
      <FloatingActionButton
        icon={<RefreshCw className="w-6 h-6" />}
        onClick={() => addNotification('info', 'Data refreshed!')}
        tooltip="Refresh Data"
        position="bottom-right"
      />

      <FloatingActionButton
        icon={<Settings className="w-6 h-6" />}
        onClick={() => addNotification('info', 'Settings opened!')}
        tooltip="Settings"
        position="bottom-left"
      />

      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Demo Controls */}
      <EnhancedCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Demo Controls</h2>
        <div className="flex flex-wrap gap-2">
          <EnhancedButton size="sm" onClick={() => addNotification('success', 'Success notification!')}>
            Success Toast
          </EnhancedButton>
          <EnhancedButton size="sm" variant="secondary" onClick={() => addNotification('error', 'Error notification!')}>
            Error Toast
          </EnhancedButton>
          <EnhancedButton size="sm" variant="ghost" onClick={() => addNotification('warning', 'Warning notification!')}>
            Warning Toast
          </EnhancedButton>
          <EnhancedButton size="sm" onClick={() => addNotification('info', 'Info notification!')}>
            Info Toast
          </EnhancedButton>
        </div>
      </EnhancedCard>
    </div>
  )
}

export default UIShowcase
