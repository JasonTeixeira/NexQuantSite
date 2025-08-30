"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Clock,
  Database
} from "lucide-react"

export default function OfflinePageClient() {
  const [isOnline, setIsOnline] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [offlineStartTime] = useState(Date.now())
  const [offlineDuration, setOfflineDuration] = useState(0)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-redirect when back online
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Update offline duration
    const durationInterval = setInterval(() => {
      if (!navigator.onLine) {
        setOfflineDuration(Date.now() - offlineStartTime)
      }
    }, 1000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(durationInterval)
    }
  }, [offlineStartTime])

  const handleRetry = async () => {
    setRetrying(true)

    try {
      // Test connection with a small request
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'cors'
      })

      if (response.ok) {
        window.location.href = '/'
      } else {
        throw new Error('Connection test failed')
      }
    } catch (error) {
      console.log('Still offline:', error)
      setTimeout(() => setRetrying(false), 2000)
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Show success message when back online
  if (isOnline && typeof window !== 'undefined' && navigator.onLine) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-900/20 flex items-center justify-center">
            <Activity className="w-12 h-12 text-green-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Back Online!</h1>
          <p className="text-gray-400 mb-4">Redirecting you to the dashboard...</p>
          <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-cyan-400">Nexural Trading</div>
              <Badge variant="destructive" className="bg-red-900/50 text-red-400">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Offline for {formatDuration(offlineDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Main Offline Message */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gray-900 border-4 border-gray-700 flex items-center justify-center">
              <WifiOff className="w-16 h-16 text-gray-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              You're Offline
            </h1>
            
            <p className="text-xl text-gray-400 mb-8">
              No internet connection detected. Please check your network settings and try again.
            </p>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleRetry}
                disabled={retrying}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Checking...' : 'Try Again'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>

          {/* Offline Features Available */}
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-cyan-400" />
                Available Offline Features
              </CardTitle>
              <CardDescription className="text-gray-400">
                Some features may still be accessible from cached data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Cached Dashboard</div>
                    <div className="text-sm text-gray-400">View recent data</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">Historical Charts</div>
                    <div className="text-sm text-gray-400">Offline analysis</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Learning Content</div>
                    <div className="text-sm text-gray-400">Educational resources</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-400" />
                  <div>
                    <div className="font-semibold text-white">Auto-Sync</div>
                    <div className="text-sm text-gray-400">When reconnected</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Tips */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Troubleshooting Tips</CardTitle>
              <CardDescription className="text-gray-400">
                Try these steps to restore your connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-white">Check your WiFi or mobile data</div>
                    <div className="text-sm text-gray-400">Make sure you're connected to a network</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-white">Try switching networks</div>
                    <div className="text-sm text-gray-400">Switch between WiFi and mobile data</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-white">Restart your browser</div>
                    <div className="text-sm text-gray-400">Close and reopen your browser or app</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-semibold text-white">Check for service outages</div>
                    <div className="text-sm text-gray-400">Visit our status page for updates</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auto-retry notification */}
      <div className="fixed bottom-4 right-4">
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="text-sm text-gray-300">
                Automatically checking connection...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


