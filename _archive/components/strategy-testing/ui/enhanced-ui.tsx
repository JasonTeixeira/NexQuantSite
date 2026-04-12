"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  Wifi, 
  Bell, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Sun,
  Moon,
  Monitor,
  Palette,
  Keyboard,
  HelpCircle
} from 'lucide-react'

// Enhanced notification system
interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Keep max 10 notifications
    
    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
      }, notification.duration)
    }
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-500/10'
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10'
      case 'error': return 'border-red-500/30 bg-red-500/10'
      case 'info': return 'border-blue-500/30 bg-blue-500/10'
      default: return 'border-[#2a2a3e] bg-[#1a1a25]'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
            {notifications.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[#0e111a] border border-[#2a2a3e] rounded-lg shadow-2xl z-50">
          <div className="p-3 border-b border-[#2a2a3e]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications([])}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-[#a0a0b8] text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-[#2a2a3e]/50 last:border-b-0 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{notification.title}</div>
                      <div className="text-xs text-[#a0a0b8] mt-1">{notification.message}</div>
                      <div className="text-xs text-[#6b7280] mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </div>
                      {notification.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={notification.action.onClick}
                          className="mt-2 text-xs h-6"
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced status bar
export const StatusBar = () => {
  const [time, setTime] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  const [cpuUsage, setCpuUsage] = useState(45)
  const [memoryUsage, setMemoryUsage] = useState(62)

  useEffect(() => {
    // Set initial time after hydration to avoid SSR mismatch
    setTime(new Date())
    
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400'
      case 'connecting': return 'text-yellow-400'
      case 'disconnected': return 'text-red-400'
    }
  }

  return (
    <div className="h-6 bg-[#0a0a0f] border-t border-[#2a2a3e] flex items-center justify-between px-4 text-xs text-[#a0a0b8]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Wifi className={`w-3 h-3 ${getConnectionColor()}`} />
          <span className="capitalize">{connectionStatus}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>CPU: {cpuUsage}%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Monitor className="w-3 h-3" />
          <span>RAM: {memoryUsage}%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Live Data
          </Badge>
          <Badge variant="outline" className="text-xs">
            AI Active
          </Badge>
        </div>
        
        <div className="font-mono">
          {time ? time.toLocaleTimeString() : '--:--:-- --'}
        </div>
      </div>
    </div>
  )
}

// Enhanced theme switcher
export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark')
  const [accentColor, setAccentColor] = useState('#00bbff')

  const themes = [
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'auto', name: 'Auto', icon: Monitor },
  ]

  const accentColors = [
    '#00bbff', // Default blue
    '#22d3ee', // Cyan
    '#a78bfa', // Purple
    '#34d399', // Green
    '#f59e0b', // Amber
    '#f87171', // Red
    '#fb7185', // Pink
  ]

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Theme</h3>
        <div className="flex gap-2">
          {themes.map((t) => (
            <Button
              key={t.id}
              variant={theme === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(t.id as any)}
              className="flex items-center gap-2"
            >
              <t.icon className="w-3 h-3" />
              {t.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Accent Color</h3>
        <div className="flex gap-2 flex-wrap">
          {accentColors.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                accentColor === color ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced keyboard shortcuts
export const KeyboardShortcuts = () => {
  const shortcuts = [
    { key: 'Ctrl + Shift + P', description: 'Toggle Performance Monitor' },
    { key: 'Ctrl + Shift + T', description: 'Toggle Terminal' },
    { key: 'Ctrl + Shift + N', description: 'New Strategy' },
    { key: 'Ctrl + Shift + S', description: 'Save Current View' },
    { key: 'Ctrl + Shift + E', description: 'Export Data' },
    { key: 'Ctrl + Shift + R', description: 'Refresh Data' },
    { key: 'Ctrl + Shift + F', description: 'Full Screen' },
    { key: 'Ctrl + Shift + H', description: 'Show Help' },
    { key: 'Ctrl + 1-6', description: 'Switch Main Tabs' },
    { key: 'Alt + 1-9', description: 'Switch Sub Tabs' },
  ]

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Keyboard className="w-4 h-4" />
        Keyboard Shortcuts
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="text-sm text-[#a0a0b8]">{shortcut.description}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

// Enhanced help system
export const HelpSystem = () => {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    { id: 'getting-started', name: 'Getting Started', icon: HelpCircle },
    { id: 'navigation', name: 'Navigation', icon: Monitor },
    { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard },
    { id: 'features', name: 'Features', icon: Zap },
  ]

  const content = {
    'getting-started': (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Welcome to NexusQuant Terminal</h3>
        <p className="text-[#a0a0b8]">
          This is an institutional-grade quantitative trading platform with AI integration.
        </p>
        <div className="space-y-2">
          <h4 className="font-medium text-white">Quick Start:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#a0a0b8]">
            <li>Navigate using the main tabs at the top</li>
            <li>Each tab has specialized sub-tabs for different functions</li>
            <li>Use the AI terminal for natural language queries</li>
            <li>Monitor performance with the built-in analytics</li>
          </ul>
        </div>
      </div>
    ),
    'navigation': (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Navigation Guide</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-white">Main Tabs:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#a0a0b8] mt-1">
              <li><strong>Control Center:</strong> Performance overview and monitoring</li>
              <li><strong>Market Intelligence:</strong> Real-time market data and analysis</li>
              <li><strong>Strategy Development:</strong> Build and test trading strategies</li>
              <li><strong>Risk & Portfolio:</strong> Risk management and optimization</li>
              <li><strong>Execution & Trading:</strong> Live trading and order management</li>
              <li><strong>System Administration:</strong> System settings and configuration</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    'shortcuts': <KeyboardShortcuts />,
    'features': (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Key Features</h3>
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardContent className="p-4">
              <h4 className="font-medium text-white mb-2">AI Integration</h4>
              <p className="text-sm text-[#a0a0b8]">
                Natural language queries, strategy suggestions, and market analysis
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardContent className="p-4">
              <h4 className="font-medium text-white mb-2">Real-time Data</h4>
              <p className="text-sm text-[#a0a0b8]">
                Live market data, order book, and trade execution
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardContent className="p-4">
              <h4 className="font-medium text-white mb-2">Advanced Analytics</h4>
              <p className="text-sm text-[#a0a0b8]">
                Comprehensive charting, backtesting, and performance analysis
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  }

  return (
    <div className="flex h-96">
      <div className="w-48 border-r border-[#2a2a3e] p-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className="w-full justify-start mb-1"
          >
            <section.icon className="w-4 h-4 mr-2" />
            {section.name}
          </Button>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {content[activeSection as keyof typeof content]}
      </div>
    </div>
  )
}

// Sound system for notifications and alerts
export const SoundSystem = () => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(50)

  const playSound = useCallback((type: 'success' | 'warning' | 'error' | 'notification') => {
    if (!soundEnabled) return

    // Create audio context for different sound types
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different notification types
    const frequencies = {
      success: 800,
      warning: 600,
      error: 400,
      notification: 1000,
    }

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
    gainNode.gain.setValueAtTime(volume / 100 * 0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }, [soundEnabled, volume])

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playSound,
    SoundControls: () => (
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        {soundEnabled && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a0a0b8]">Volume</span>
            <div className="w-20">
              <Progress value={volume} className="h-1" />
            </div>
          </div>
        )}
      </div>
    ),
  }
}

export default {
  NotificationCenter,
  StatusBar,
  ThemeSwitcher,
  KeyboardShortcuts,
  HelpSystem,
  SoundSystem,
}
