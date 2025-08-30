// 📱 PWA STATUS COMPONENT - Shows PWA capabilities and settings
// Allows users to manage PWA features and see installation status

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff,
  Bell, 
  BellOff,
  CheckCircle, 
  XCircle,
  Info,
  Settings,
  Database,
  Refresh,
  Zap,
  Shield,
  Clock,
  Activity,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'
import { usePWA } from './install-prompt'
import { initializePushNotifications, PushNotificationService } from '@/lib/pwa/push-notifications'

interface PWAStatus {
  isInstalled: boolean
  isStandalone: boolean
  hasServiceWorker: boolean
  hasPushManager: boolean
  hasNotification: boolean
  isOnline: boolean
  cacheInfo: {
    supported: boolean
    caches: number
    files: number
  }
}

export default function PWAStatusComponent() {
  const { isInstalled, isStandalone, canInstall, isPWA } = usePWA()
  const [pwaStatus, setPWAStatus] = useState<PWAStatus>({
    isInstalled: false,
    isStandalone: false,
    hasServiceWorker: false,
    hasPushManager: false,
    hasNotification: false,
    isOnline: true,
    cacheInfo: { supported: false, caches: 0, files: 0 }
  })
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    checkPWAStatus()
    setupStatusListeners()
    checkPushNotificationStatus()
    
    // Update status every 30 seconds
    const interval = setInterval(checkPWAStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkPWAStatus = async () => {
    const status: PWAStatus = {
      isInstalled: isInstalled,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotification: 'Notification' in window,
      isOnline: navigator.onLine,
      cacheInfo: await getCacheInfo()
    }
    
    setPWAStatus(status)
    setLastUpdate(new Date())
  }

  const setupStatusListeners = () => {
    const handleOnline = () => {
      setPWAStatus(prev => ({ ...prev, isOnline: true }))
    }
    
    const handleOffline = () => {
      setPWAStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  const checkPushNotificationStatus = () => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }

  const getCacheInfo = async () => {
    try {
      if (!('caches' in window)) {
        return { supported: false, caches: 0, files: 0 }
      }

      const cacheNames = await caches.keys()
      let totalFiles = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        totalFiles += keys.length
      }

      return {
        supported: true,
        caches: cacheNames.length,
        files: totalFiles
      }
    } catch (error) {
      return { supported: false, caches: 0, files: 0 }
    }
  }

  const handlePushToggle = async (enabled: boolean) => {
    setLoading(true)
    
    try {
      if (enabled) {
        // Request permission and setup push
        const result = await PushNotificationService.requestPermission()
        
        if (result.granted) {
          // Save subscription (mock user ID for demo)
          if (result.subscription) {
            await PushNotificationService.saveSubscription('demo-user-id', result.subscription)
          }
          
          setPushEnabled(true)
          toast.success('🔔 Push notifications enabled!', {
            description: 'You will now receive trading alerts and updates.'
          })
        } else {
          toast.error('❌ Push notifications denied', {
            description: result.error || 'Permission was denied'
          })
        }
      } else {
        // Disable push notifications
        setPushEnabled(false)
        toast.info('🔕 Push notifications disabled', {
          description: 'You will no longer receive push notifications.'
        })
      }
    } catch (error: any) {
      console.error('Push toggle error:', error)
      toast.error('❌ Push notification error', {
        description: error.message || 'Failed to toggle push notifications'
      })
    }
    
    setLoading(false)
  }

  const sendTestNotification = async () => {
    if (!pushEnabled) {
      toast.error('Enable push notifications first')
      return
    }
    
    try {
      await PushNotificationService.sendTestNotification('demo-user-id')
      toast.success('🧪 Test notification sent!')
    } catch (error: any) {
      toast.error('❌ Failed to send test notification')
    }
  }

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        
        toast.success('🗑️ Cache cleared successfully')
        checkPWAStatus()
        
        // Reload to reactivate service worker
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (error) {
      toast.error('❌ Failed to clear cache')
    }
  }

  const updateApp = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        toast.success('🔄 Checking for updates...')
      }
    } catch (error) {
      toast.error('❌ Update check failed')
    }
  }

  const getOverallScore = () => {
    let score = 0
    if (pwaStatus.hasServiceWorker) score += 20
    if (pwaStatus.hasNotification) score += 20
    if (pwaStatus.hasPushManager) score += 20
    if (pwaStatus.isStandalone || isPWA) score += 20
    if (pwaStatus.cacheInfo.supported && pwaStatus.cacheInfo.files > 0) score += 20
    return score
  }

  const overallScore = getOverallScore()

  const features = [
    {
      icon: Smartphone,
      title: 'App Installation',
      status: pwaStatus.isStandalone || isPWA,
      description: pwaStatus.isStandalone ? 'Installed as app' : canInstall ? 'Can be installed' : 'Not available'
    },
    {
      icon: Database,
      title: 'Offline Storage',
      status: pwaStatus.cacheInfo.supported,
      description: `${pwaStatus.cacheInfo.files} files cached`
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      status: pwaStatus.hasNotification && pushEnabled,
      description: pwaStatus.hasNotification ? (pushEnabled ? 'Enabled' : 'Available') : 'Not supported'
    },
    {
      icon: Wifi,
      title: 'Network Status',
      status: pwaStatus.isOnline,
      description: pwaStatus.isOnline ? 'Online' : 'Offline'
    },
    {
      icon: Zap,
      title: 'Service Worker',
      status: pwaStatus.hasServiceWorker,
      description: pwaStatus.hasServiceWorker ? 'Active' : 'Not available'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                PWA Status
              </CardTitle>
              <CardDescription>Progressive Web App capabilities and performance</CardDescription>
            </div>
            <Badge 
              variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}
              className={overallScore >= 80 ? "bg-green-600" : overallScore >= 60 ? "bg-yellow-600" : "bg-red-600"}
            >
              {overallScore}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  feature.status ? 'bg-green-900/20 border border-green-700' : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  feature.status ? 'bg-green-600' : 'bg-gray-600'
                }`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-400 truncate">{feature.description}</p>
                </div>
                {feature.status ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings & Controls */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            PWA Settings
          </CardTitle>
          <CardDescription>Manage your app preferences and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              {pushEnabled ? (
                <Bell className="w-5 h-5 text-green-400" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-gray-400">Receive trading alerts and updates</p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={loading || !pwaStatus.hasNotification}
            />
          </div>

          <Separator className="bg-gray-700" />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              disabled={!pushEnabled}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Notification
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={updateApp}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Refresh className="w-4 h-4 mr-2" />
              Check Updates
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>

          {/* Status Info */}
          {lastUpdate && (
            <div className="flex items-center justify-center text-xs text-gray-500 pt-2">
              <Clock className="w-3 h-3 mr-1" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

