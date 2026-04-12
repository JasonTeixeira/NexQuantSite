/**
 * Progressive Web App (PWA) Utilities
 * Handles PWA installation, push notifications, and offline functionality
 */

// PWA Installation Manager
export class PWAInstallManager {
  private deferredPrompt: any = null
  private isInstallable = false
  private isInstalled = false
  
  constructor() {
    this.initializePWA()
  }
  
  private initializePWA() {
    if (typeof window === 'undefined') return
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA: Install prompt available')
      e.preventDefault()
      this.deferredPrompt = e
      this.isInstallable = true
      this.showInstallPrompt()
    })
    
    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA: App installed successfully')
      this.isInstalled = true
      this.deferredPrompt = null
      this.isInstallable = false
      this.hideInstallPrompt()
    })
    
    // Check if already installed
    this.checkInstallStatus()
  }
  
  async checkInstallStatus(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://')
    
    this.isInstalled = isStandalone
    return isStandalone
  }
  
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('❌ PWA: No install prompt available')
      return false
    }
    
    try {
      const result = await this.deferredPrompt.prompt()
      console.log('📱 PWA: Install prompt result:', result.outcome)
      
      if (result.outcome === 'accepted') {
        console.log('✅ PWA: User accepted install prompt')
        return true
      } else {
        console.log('❌ PWA: User dismissed install prompt')
        return false
      }
    } catch (error) {
      console.error('❌ PWA: Install prompt failed:', error)
      return false
    } finally {
      this.deferredPrompt = null
      this.isInstallable = false
    }
  }
  
  getInstallStatus() {
    return {
      isInstallable: this.isInstallable,
      isInstalled: this.isInstalled,
      canPrompt: !!this.deferredPrompt
    }
  }
  
  private showInstallPrompt() {
    // Dispatch custom event for UI components to listen
    window.dispatchEvent(new CustomEvent('pwa:installable', {
      detail: { canInstall: true }
    }))
  }
  
  private hideInstallPrompt() {
    window.dispatchEvent(new CustomEvent('pwa:installed', {
      detail: { installed: true }
    }))
  }
}

// Push Notification Manager
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null
  private vapidPublicKey: string
  
  constructor(vapidPublicKey?: string) {
    this.vapidPublicKey = vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
    this.initialize()
  }
  
  private async initialize() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    
    try {
      this.registration = await navigator.serviceWorker.ready
      await this.getExistingSubscription()
    } catch (error) {
      console.error('❌ Push: Failed to initialize:', error)
    }
  }
  
  async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }
    
    const permission = await Notification.requestPermission()
    console.log('🔔 Push: Permission result:', permission)
    return permission as 'granted' | 'denied' | 'default'
  }
  
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('❌ Push: Service worker not ready')
      return null
    }
    
    if (!this.vapidPublicKey) {
      console.error('❌ Push: VAPID public key not configured')
      return null
    }
    
    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      console.log('❌ Push: Permission not granted')
      return null
    }
    
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as unknown as ArrayBuffer
      })
      
      this.subscription = subscription
      console.log('✅ Push: Subscription created')
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('❌ Push: Subscription failed:', error)
      return null
    }
  }
  
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }
    
    try {
      const result = await this.subscription.unsubscribe()
      if (result) {
        this.subscription = null
        console.log('✅ Push: Unsubscribed successfully')
        
        // Notify server of unsubscription
        await this.removeSubscriptionFromServer()
      }
      return result
    } catch (error) {
      console.error('❌ Push: Unsubscribe failed:', error)
      return false
    }
  }
  
  async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) return null
    
    try {
      this.subscription = await this.registration.pushManager.getSubscription()
      return this.subscription
    } catch (error) {
      console.error('❌ Push: Failed to get existing subscription:', error)
      return null
    }
  }
  
  getSubscriptionStatus() {
    return {
      isSubscribed: !!this.subscription,
      subscription: this.subscription,
      permission: typeof window !== 'undefined' ? Notification.permission : 'default'
    }
  }
  
  // Test notification
  async sendTestNotification(): Promise<void> {
    if (!this.subscription) {
      console.error('❌ Push: No subscription available')
      return
    }
    
    try {
      await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.subscription
        })
      })
      
      console.log('✅ Push: Test notification sent')
    } catch (error) {
      console.error('❌ Push: Test notification failed:', error)
    }
  }
  
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('❌ Push: Failed to send subscription to server:', error)
    }
  }
  
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.subscription
        })
      })
    } catch (error) {
      console.error('❌ Push: Failed to remove subscription from server:', error)
    }
  }
  
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }
}

// Offline Manager
export class OfflineManager {
  private isOnline = true
  private offlineActions: Array<{ type: string; data: any; timestamp: number }> = []
  
  constructor() {
    this.initialize()
  }
  
  private initialize() {
    if (typeof window === 'undefined') return
    
    this.isOnline = navigator.onLine
    
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    
    // Load stored offline actions
    this.loadOfflineActions()
  }
  
  private handleOnline() {
    console.log('🌐 Network: Back online')
    this.isOnline = true
    this.syncOfflineActions()
    
    window.dispatchEvent(new CustomEvent('network:online'))
  }
  
  private handleOffline() {
    console.log('📡 Network: Gone offline')
    this.isOnline = false
    
    window.dispatchEvent(new CustomEvent('network:offline'))
  }
  
  getOnlineStatus(): boolean {
    return this.isOnline
  }
  
  // Queue actions for later sync when offline
  queueOfflineAction(type: string, data: any): void {
    const action = {
      type,
      data,
      timestamp: Date.now()
    }
    
    this.offlineActions.push(action)
    this.saveOfflineActions()
    
    console.log(`📝 Offline: Queued action ${type}`)
  }
  
  private async syncOfflineActions(): Promise<void> {
    if (!this.isOnline || this.offlineActions.length === 0) return
    
    console.log(`🔄 Offline: Syncing ${this.offlineActions.length} actions`)
    
    const actionsToSync = [...this.offlineActions]
    this.offlineActions = []
    this.saveOfflineActions()
    
    for (const action of actionsToSync) {
      try {
        await this.syncAction(action)
        console.log(`✅ Offline: Synced action ${action.type}`)
      } catch (error) {
        console.error(`❌ Offline: Failed to sync action ${action.type}:`, error)
        
        // Re-queue failed actions
        this.offlineActions.push(action)
      }
    }
    
    if (this.offlineActions.length > 0) {
      this.saveOfflineActions()
    }
  }
  
  private async syncAction(action: { type: string; data: any; timestamp: number }): Promise<void> {
    switch (action.type) {
      case 'analytics':
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        break
        
      case 'user_action':
        await fetch('/api/user/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        break
        
      default:
        console.warn(`Unknown offline action type: ${action.type}`)
    }
  }
  
  private saveOfflineActions(): void {
    try {
      localStorage.setItem('nexural:offline_actions', JSON.stringify(this.offlineActions))
    } catch (error) {
      console.error('❌ Offline: Failed to save actions:', error)
    }
  }
  
  private loadOfflineActions(): void {
    try {
      const stored = localStorage.getItem('nexural:offline_actions')
      if (stored) {
        this.offlineActions = JSON.parse(stored)
        console.log(`📁 Offline: Loaded ${this.offlineActions.length} stored actions`)
      }
    } catch (error) {
      console.error('❌ Offline: Failed to load stored actions:', error)
      this.offlineActions = []
    }
  }
  
  clearOfflineActions(): void {
    this.offlineActions = []
    this.saveOfflineActions()
    console.log('🗑️ Offline: Cleared all stored actions')
  }
}

// Service Worker Manager
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false
  
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('❌ SW: Service workers not supported')
      return null
    }
    
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('✅ SW: Service worker registered')
      
      // Listen for updates
      this.registration.addEventListener('updatefound', this.handleUpdateFound.bind(this))
      
      // Check for existing service worker
      if (this.registration.active) {
        console.log('✅ SW: Service worker active')
      }
      
      return this.registration
    } catch (error) {
      console.error('❌ SW: Registration failed:', error)
      return null
    }
  }
  
  private handleUpdateFound(): void {
    if (!this.registration) return
    
    const newWorker = this.registration.installing
    if (!newWorker) return
    
    console.log('🔄 SW: Update found')
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          console.log('🆕 SW: Update available')
          this.updateAvailable = true
          this.notifyUpdateAvailable()
        } else {
          console.log('✅ SW: Content cached for first time')
        }
      }
    })
  }
  
  private notifyUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('sw:updateavailable'))
  }
  
  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) return
    
    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // Reload the page to activate the new service worker
    window.location.reload()
  }
  
  async getCacheSize(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.registration) {
        resolve(0)
        return
      }
      
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          resolve(event.data.size)
        }
      }
      
      this.registration.active?.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2]
      )
    })
  }
  
  async clearCache(): Promise<void> {
    if (!this.registration) return
    
    this.registration.active?.postMessage({ type: 'CLEAR_CACHE' })
    console.log('🗑️ SW: Cache clear requested')
  }
  
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }
  
  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }
}

// Singleton instances
export const pwaInstall = new PWAInstallManager()
export const pushNotifications = new PushNotificationManager()
export const offlineManager = new OfflineManager()
export const serviceWorkerManager = new ServiceWorkerManager()

// Initialize service worker on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    serviceWorkerManager.register()
  })
}

// PWA utility functions
export const pwaUtils = {
  // Check if running as PWA
  isPWA(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://')
  },
  
  // Get device info for PWA optimization
  getDeviceInfo() {
    if (typeof window === 'undefined') return null
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      touchSupport: 'ontouchstart' in window,
      screenSize: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },
  
  // Optimize for touch devices
  optimizeForTouch(): void {
    if (typeof window === 'undefined') return
    
    // Add touch-optimized CSS class
    if ('ontouchstart' in window) {
      document.documentElement.classList.add('touch-device')
    }
    
    // Prevent zoom on double-tap
    let lastTouchEnd = 0
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
  },
  
  // Add to home screen prompt
  async promptAddToHomeScreen(): Promise<boolean> {
    return await pwaInstall.promptInstall()
  },
  
  // Get installation status
  getInstallationStatus() {
    return pwaInstall.getInstallStatus()
  },
  
  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Export everything
export default {
  pwaInstall,
  pushNotifications,
  offlineManager,
  serviceWorkerManager,
  pwaUtils
}
