interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalEntries: number
  memoryUsage: number
}

export class AdvancedCachingSystem {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    memoryUsage: 0,
  }

  private readonly maxMemoryUsage = 100 * 1024 * 1024 // 100MB
  private readonly cleanupInterval = 5 * 60 * 1000 // 5 minutes
  private cleanupTimer?: NodeJS.Timeout

  constructor() {
    this.startCleanupTimer()
  }

  // Set cache entry with TTL and tags
  set<T>(key: string, data: T, ttl = 3600000, tags: string[] = []): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, entry)
    this.updateStats()
    this.enforceMemoryLimit()
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++
    this.updateHitRate()

    return entry.data as T
  }

  // Get or set pattern
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl = 3600000, tags: string[] = []): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await factory()
    this.set(key, data, ttl, tags)
    return data
  }

  // Delete specific key
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateStats()
    }
    return deleted
  }

  // Clear cache by tags
  clearByTags(tags: string[]): number {
    let cleared = 0

    for (const [key, entry] of this.cache.entries()) {
      if (tags.some((tag) => entry.tags.includes(tag))) {
        this.cache.delete(key)
        cleared++
      }
    }

    this.updateStats()
    return cleared
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0,
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Get cache keys by pattern
  getKeysByPattern(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter((key) => pattern.test(key))
  }

  // Preload cache with data
  async preload(
    entries: Array<{ key: string; factory: () => Promise<any>; ttl?: number; tags?: string[] }>,
  ): Promise<void> {
    const promises = entries.map(async ({ key, factory, ttl = 3600000, tags = [] }) => {
      try {
        const data = await factory()
        this.set(key, data, ttl, tags)
      } catch (error) {
        console.error(`Failed to preload cache key ${key}:`, error)
      }
    })

    await Promise.all(promises)
  }

  // Export cache for persistence
  export(): string {
    const exportData = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      ...entry,
    }))

    return JSON.stringify(exportData)
  }

  // Import cache from persistence
  import(data: string): void {
    try {
      const importData = JSON.parse(data)
      const now = Date.now()

      importData.forEach((item: any) => {
        // Only import non-expired entries
        if (now - item.timestamp < item.ttl) {
          const { key, ...entry } = item
          this.cache.set(key, entry)
        }
      })

      this.updateStats()
    } catch (error) {
      console.error("Failed to import cache data:", error)
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      // Remove expired entries
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`)
      this.updateStats()
    }
  }

  private enforceMemoryLimit(): void {
    if (this.stats.memoryUsage > this.maxMemoryUsage) {
      // Remove least recently used entries
      const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)

      const toRemove = Math.ceil(entries.length * 0.1) // Remove 10%

      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0])
      }

      console.log(`Memory limit enforced: removed ${toRemove} LRU entries`)
      this.updateStats()
    }
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size
    this.stats.memoryUsage = this.estimateMemoryUsage()
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  private estimateMemoryUsage(): number {
    let usage = 0

    for (const [key, entry] of this.cache.entries()) {
      usage += key.length * 2 // UTF-16 characters
      usage += JSON.stringify(entry).length * 2
    }

    return usage
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }
}

// Specialized cache instances
export const apiCache = new AdvancedCachingSystem()
export const pageCache = new AdvancedCachingSystem()
export const userCache = new AdvancedCachingSystem()

// Cache middleware for API routes
export function withCache<T>(
  key: string,
  ttl = 300000, // 5 minutes
  tags: string[] = [],
) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${key}:${JSON.stringify(args)}`

      return await apiCache.getOrSet(cacheKey, () => method.apply(this, args), ttl, tags)
    }

    return descriptor
  }
}
