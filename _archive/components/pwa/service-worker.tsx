// 🚀 PWA SERVICE WORKER - Client-side service worker registration
// Handles service worker registration, updates, and PWA functionality

'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export default function PWAServiceWorker() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported in this browser')
      return
    }

    // Register service worker
    registerServiceWorker()

    // Setup update detection
    setupUpdateDetection()

    // Setup online/offline detection
    setupOnlineOfflineDetection()

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 Registering Service Worker...')

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      })

      console.log('✅ Service Worker registered successfully:', registration.scope)

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        if (newWorker) {
          console.log('🔄 New Service Worker installing...')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('🆕 New version available!')
                showUpdateAvailableToast()
              } else {
                // First time install
                console.log('✅ App is ready for offline use!')
                showOfflineReadyToast()
              }
            }
          })
        }
      })

      // Handle service worker controlling
      registration.addEventListener('controlling', () => {
        console.log('🎯 Service Worker is now controlling the page')
        window.location.reload()
      })

      // Check for updates periodically
      setInterval(() => {
        registration.update()
      }, 60000) // Check every minute

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }

  const setupUpdateDetection = () => {
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data || {}

      switch (type) {
        case 'SW_UPDATE_AVAILABLE':
          showUpdateAvailableToast()
          break
        case 'SW_OFFLINE_FALLBACK':
          toast.info('📱 You are offline', {
            description: 'Some features may be limited. Your data will sync when back online.',
            duration: 5000
          })
          break
        case 'SW_BACK_ONLINE':
          toast.success('🌐 Back online!', {
            description: 'All features are now available.',
            duration: 3000
          })
          break
        case 'SW_CACHE_UPDATED':
          console.log('📦 Cache updated:', payload)
          break
        default:
          break
      }
    })

    // Handle service worker errors
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.error('❌ Service Worker error:', event)
    })
  }

  const setupOnlineOfflineDetection = () => {
    const handleOnline = () => {
      console.log('🌐 Back online')
      toast.success('🌐 Connection restored!', {
        description: 'You are back online. Syncing data...',
        duration: 3000
      })

      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register('sync-user-actions')
        }).catch((error) => {
          console.log('Background sync registration failed:', error)
        })
      }
    }

    const handleOffline = () => {
      console.log('📱 Gone offline')
      toast.warning('📱 You are offline', {
        description: 'Some features may be limited. Your data will sync when back online.',
        duration: 5000,
        action: {
          label: 'View offline features',
          onClick: () => {
            window.location.href = '/offline'
          }
        }
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (!navigator.onLine) {
      setTimeout(handleOffline, 1000) // Delay to avoid showing immediately on page load
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  const showUpdateAvailableToast = () => {
    toast.info('🆕 App update available!', {
      description: 'A new version of the app is available with improvements and bug fixes.',
      duration: 10000,
      action: {
        label: 'Update now',
        onClick: () => {
          updateApp()
        }
      }
    })
  }

  const showOfflineReadyToast = () => {
    toast.success('📱 App ready for offline use!', {
      description: 'The app has been cached and will work even when you are offline.',
      duration: 5000
    })
  }

  const updateApp = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (registration?.waiting) {
        // Tell the waiting service worker to become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        toast.loading('Updating app...', {
          duration: 2000
        })
        
        // Wait for the new service worker to take control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })
      } else {
        // Force update by reloading
        window.location.reload()
      }
    } catch (error) {
      console.error('❌ App update failed:', error)
      toast.error('Update failed', {
        description: 'Please refresh the page manually.'
      })
    }
  }

  // This component doesn't render anything
  return null
}

// Utility function to check PWA status
export const checkPWAStatus = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const hasServiceWorker = 'serviceWorker' in navigator
  const hasPushManager = 'PushManager' in window
  const hasNotification = 'Notification' in window

  return {
    isStandalone,
    isMobile,
    hasServiceWorker,
    hasPushManager,
    hasNotification,
    isPWACapable: hasServiceWorker && hasNotification,
    isFullPWA: isStandalone && hasServiceWorker
  }
}

// Utility function to check if app needs update
export const checkForAppUpdate = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    
    if (registration) {
      await registration.update()
      return registration.waiting !== null
    }
    
    return false
  } catch (error) {
    console.error('Error checking for app update:', error)
    return false
  }
}

// Utility function to get cache information
export const getCacheInfo = async () => {
  try {
    if (!('caches' in window)) {
      return { supported: false }
    }

    const cacheNames = await caches.keys()
    let totalSize = 0
    let totalFiles = 0

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      totalFiles += keys.length
    }

    return {
      supported: true,
      caches: cacheNames.length,
      files: totalFiles,
      size: totalSize // Note: Calculating exact size requires additional logic
    }
  } catch (error) {
    console.error('Error getting cache info:', error)
    return { supported: false, error: error.message }
  }
}

