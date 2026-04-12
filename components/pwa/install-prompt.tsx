// 📱 PWA INSTALL PROMPT - Beautiful installation prompt for mobile and desktop
// Prompts users to install the app for native-like experience

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Download, 
  X, 
  Star, 
  Zap, 
  Shield,
  Wifi,
  Bell,
  ArrowDown
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installationSupported, setInstallationSupported] = useState(false)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Detect device type
    setDeviceType(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop')
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA install prompt triggered')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setInstallationSupported(true)
      
      // Show prompt after a delay (better UX)
      setTimeout(() => {
        if (!isInstalled && !isStandalone) {
          setShowPrompt(true)
        }
      }, 5000) // Wait 5 seconds after page load
    }
    
    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Check if we should show manual install instructions
    if (!installationSupported && !isStandalone) {
      // For iOS Safari or other browsers that don't support install prompt
      setTimeout(() => {
        setShowPrompt(true)
      }, 10000) // Show after 10 seconds
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, isStandalone, installationSupported])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user choice
      const choiceResult = await deferredPrompt.userChoice
      
      console.log('📱 User choice:', choiceResult.outcome)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt')
      } else {
        console.log('❌ User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
    }
    
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session (only in browser)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if already installed or dismissed
  if (isStandalone || isInstalled) {
    return null
  }

  // Check dismissed status only on client side
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance'
    },
    {
      icon: Wifi,
      title: 'Works Offline',
      description: 'Access your data even without internet'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get real-time trading alerts'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays safe and encrypted'
    }
  ]

  const iOSInstructions = deviceType === 'mobile' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />
          
          {/* Install Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <Card className="bg-gray-900 border-gray-700 shadow-2xl">
              <CardContent className="p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Install Nexural Trading</h3>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4">
                  Get the full experience with our native app. Faster, smoother, and works offline.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm">{feature.title}</p>
                        <p className="text-gray-400 text-xs truncate">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {iOSInstructions ? (
                  // iOS Manual Instructions
                  <div className="space-y-3">
                    <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                      <p className="text-blue-400 text-sm font-medium mb-2">📱 To install on iOS:</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex items-center space-x-2">
                          <span>1.</span>
                          <span>Tap the Share button</span>
                          <div className="w-4 h-4 border border-gray-500 rounded flex items-center justify-center">
                            <ArrowDown className="w-2 h-2" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>2.</span>
                          <span>Select "Add to Home Screen"</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>3.</span>
                          <span>Tap "Add" to install</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDismiss}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Later
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDismiss}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Standard Install Buttons
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDismiss}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Maybe Later
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleInstallClick}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  </div>
                )}

                {/* App Size Info */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  ~5MB • Free • No ads • Works offline
                </p>
                
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for PWA functionality
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setCanInstall(true)
    }
    
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return {
    isInstalled,
    isStandalone,
    canInstall,
    isPWA: isStandalone || isInstalled
  }
}
