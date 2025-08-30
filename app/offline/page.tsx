// 📱 OFFLINE PAGE - PWA Offline Experience
// Beautiful offline page when user has no internet connection

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  TrendingUp, 
  Users, 
  BookOpen,
  ArrowRight,
  Home
} from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)
    
    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true)
      setLastSync(new Date())
    }
    
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    
    try {
      // Try to fetch a small resource to test connection
      const response = await fetch('/api/health-check', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        // Connection restored, redirect to home
        window.location.href = '/'
      } else {
        throw new Error('Connection test failed')
      }
    } catch (error) {
      console.log('Still offline:', error)
      // Connection still not available
      setTimeout(() => setIsRetrying(false), 1000)
    }
  }

  const offlineFeatures = [
    {
      icon: TrendingUp,
      title: 'View Cached Data',
      description: 'Access recently viewed trading strategies and market data'
    },
    {
      icon: Users,
      title: 'Browse Community',
      description: 'Read cached community posts and discussions'
    },
    {
      icon: BookOpen,
      title: 'Continue Learning',
      description: 'Access downloaded course materials and progress'
    }
  ]

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-green-400">Back Online!</CardTitle>
            <CardDescription>Your connection has been restored</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              Welcome back! You can now access all features of Nexural Trading.
            </p>
            
            <div className="space-y-3">
              <Link href="/" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-blue-400" />
            <span className="font-semibold text-white">Nexural Trading</span>
          </div>
          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Offline Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">You're Offline</h1>
            <p className="text-gray-400">
              No internet connection detected. Some features may be limited.
            </p>
          </motion.div>

          {/* Connection Status */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Connection Status</p>
                  <p className="font-medium text-red-400">Offline</p>
                </div>
                <Button 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {isRetrying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
              
              {lastSync && (
                <p className="text-xs text-gray-500 mt-2">
                  Last synced: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Offline Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Available Offline</h2>
            
            {offlineFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tips */}
          <Card className="bg-blue-600/10 border-blue-600/30">
            <CardHeader>
              <CardTitle className="text-sm text-blue-400">💡 Offline Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Your progress is saved locally and will sync when back online</li>
                <li>• Cached content remains available for viewing</li>
                <li>• Check your WiFi or mobile data connection</li>
                <li>• The app will automatically reconnect when possible</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-500">
          Nexural Trading • Progressive Web App
        </p>
      </div>
    </div>
  )
}