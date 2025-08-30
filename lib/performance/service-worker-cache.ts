"use client"

interface CacheConfig {
  name: string
  version: string
  strategies: {
    [key: string]: "cache-first" | "network-first" | "stale-while-revalidate"
  }
  maxAge: {
    [key: string]: number
  }
}

class ServiceWorkerCache {
  private config: CacheConfig
  private isSupported: boolean

  constructor(config: CacheConfig) {
    this.config = config
    this.isSupported = typeof window !== "undefined" && "serviceWorker" in navigator
  }

  async register() {
    if (!this.isSupported) return false

    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("[v0] Service Worker registered:", registration)

      // Send cache config to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: "CACHE_CONFIG",
          config: this.config,
        })
      }

      return true
    } catch (error) {
      console.error("[v0] Service Worker registration failed:", error)
      return false
    }
  }

  async cacheResource(
    url: string,
    strategy: "cache-first" | "network-first" | "stale-while-revalidate" = "cache-first",
  ) {
    if (!this.isSupported) return

    const cache = await caches.open(this.config.name)

    try {
      if (strategy === "network-first") {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response.clone())
        }
        return response
      } else {
        const cachedResponse = await cache.match(url)
        if (cachedResponse && strategy === "cache-first") {
          return cachedResponse
        }

        const networkResponse = await fetch(url)
        if (networkResponse.ok) {
          await cache.put(url, networkResponse.clone())
        }

        return networkResponse
      }
    } catch (error) {
      console.error("[v0] Cache operation failed:", error)
      const cachedResponse = await cache.match(url)
      return cachedResponse || new Response("Network error", { status: 408 })
    }
  }

  async preloadCriticalResources(urls: string[]) {
    if (!this.isSupported) return

    const cache = await caches.open(this.config.name)

    const preloadPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
        }
      } catch (error) {
        console.warn("[v0] Failed to preload:", url, error)
      }
    })

    await Promise.allSettled(preloadPromises)
  }

  async clearExpiredCache() {
    if (!this.isSupported) return

    const cacheNames = await caches.keys()
    const currentCacheName = `${this.config.name}-v${this.config.version}`

    const deletePromises = cacheNames
      .filter((name) => name !== currentCacheName && name.startsWith(this.config.name))
      .map((name) => caches.delete(name))

    await Promise.all(deletePromises)
  }

  async getCacheStats() {
    if (!this.isSupported) return null

    const cache = await caches.open(this.config.name)
    const keys = await cache.keys()

    let totalSize = 0
    const entries = await Promise.all(
      keys.map(async (request) => {
        const response = await cache.match(request)
        const size = response ? (await response.blob()).size : 0
        totalSize += size
        return {
          url: request.url,
          size,
          timestamp: response?.headers.get("date") || "unknown",
        }
      }),
    )

    return {
      totalEntries: keys.length,
      totalSize,
      entries,
    }
  }
}

// Default configuration for Nexural Trading platform
export const defaultCacheConfig: CacheConfig = {
  name: "nexural-cache",
  version: "1.0.0",
  strategies: {
    "/api/": "stale-while-revalidate",
    "/images/": "cache-first",
    "/static/": "cache-first",
    "/_next/": "cache-first",
    "/dashboard": "network-first",
    "/": "stale-while-revalidate",
  },
  maxAge: {
    "/api/": 5 * 60 * 1000, // 5 minutes
    "/images/": 24 * 60 * 60 * 1000, // 24 hours
    "/static/": 7 * 24 * 60 * 60 * 1000, // 7 days
    "/_next/": 30 * 24 * 60 * 60 * 1000, // 30 days
    "/dashboard": 1 * 60 * 1000, // 1 minute
    "/": 10 * 60 * 1000, // 10 minutes
  },
}

export const serviceWorkerCache = new ServiceWorkerCache(defaultCacheConfig)
