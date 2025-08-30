export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null
  private isInstalled = false
  private isStandalone = false

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window === "undefined") return

    // Check if app is already installed
    this.isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    this.isInstalled = this.isStandalone

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      this.deferredPrompt = e as any
      this.dispatchEvent("installable", { canInstall: true })
    })

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true
      this.deferredPrompt = null
      this.dispatchEvent("installed", { installed: true })
    })

    // Register service worker
    this.registerServiceWorker()
  }

  private async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registered:", registration)

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                this.dispatchEvent("updateavailable", { registration })
              }
            })
          }
        })
      } catch (error) {
        console.error("Service Worker registration failed:", error)
      }
    }
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) return false

    try {
      await this.deferredPrompt.prompt()
      const choiceResult = await this.deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        this.deferredPrompt = null
        return true
      }
      return false
    } catch (error) {
      console.error("Install prompt failed:", error)
      return false
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled
  }

  isAppInstalled(): boolean {
    return this.isInstalled
  }

  isRunningStandalone(): boolean {
    return this.isStandalone
  }

  async updateApp(): Promise<boolean> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
          return true
        }
      } catch (error) {
        console.error("Update failed:", error)
      }
    }
    return false
  }

  private dispatchEvent(type: string, detail: any) {
    window.dispatchEvent(new CustomEvent(`pwa-${type}`, { detail }))
  }

  // Offline detection
  isOnline(): boolean {
    return navigator.onLine
  }

  onOnlineStatusChange(callback: (isOnline: boolean) => void) {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ("Notification" in window) {
      return await Notification.requestPermission()
    }
    return "denied"
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
        return subscription
      } catch (error) {
        console.error("Push subscription failed:", error)
      }
    }
    return null
  }

  // App shortcuts
  async updateAppShortcuts(
    shortcuts: Array<{
      name: string
      short_name?: string
      description?: string
      url: string
      icons?: Array<{ src: string; sizes: string; type: string }>
    }>,
  ) {
    if ("navigator" in window && "setAppBadge" in navigator) {
      try {
        // This would update dynamic shortcuts in the manifest
        console.log("Updating app shortcuts:", shortcuts)
      } catch (error) {
        console.error("Failed to update shortcuts:", error)
      }
    }
  }

  // App badge
  async setAppBadge(count?: number): Promise<void> {
    if ("setAppBadge" in navigator) {
      try {
        if (count === undefined) {
          await (navigator as any).clearAppBadge()
        } else {
          await (navigator as any).setAppBadge(count)
        }
      } catch (error) {
        console.error("Failed to set app badge:", error)
      }
    }
  }

  // Share API
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if ("share" in navigator) {
      try {
        await (navigator as any).share(data)
        return true
      } catch (error) {
        console.error("Share failed:", error)
      }
    }
    return false
  }

  // Wake lock (prevent screen from sleeping)
  private wakeLock: any = null

  async requestWakeLock(): Promise<boolean> {
    if ("wakeLock" in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request("screen")
        return true
      } catch (error) {
        console.error("Wake lock failed:", error)
      }
    }
    return false
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release()
      this.wakeLock = null
    }
  }
}

export const pwaManager = new PWAManager()
