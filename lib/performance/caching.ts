/**
 * Enterprise Caching Strategy System
 * Multi-layer caching with Redis/Memcached support
 */

// Cache Configuration Types
export interface CacheConfig {
  defaultTTL: number
  maxSize?: number
  prefix?: string
  serializer?: 'json' | 'msgpack' | 'none'
  compression?: boolean
}

export interface CacheEntry<T = any> {
  value: T
  ttl: number
  created: number
  accessed: number
  hits: number
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
  memoryUsage: number
  entries: number
}

// Cache Layer Types
type CacheLayer = 'memory' | 'redis' | 'memcached' | 'disk'

// Advanced Caching System
class EnterpriseCache {
  private memoryCache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
    memoryUsage: 0,
    entries: 0
  }
  private cleanupInterval: NodeJS.Timer | null = null
  
  // External cache connections (would be initialized with real connections in production)
  private redisClient: any = null
  private memcachedClient: any = null
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      prefix: 'nexural',
      serializer: 'json',
      compression: false,
      ...config
    }
    
    // Start cleanup interval
    this.startCleanup()
    
    // Initialize external cache connections
    this.initializeExternalCaches()
  }
  
  // Multi-layer get with fallback strategy
  async get<T>(key: string, layers: CacheLayer[] = ['memory', 'redis']): Promise<T | null> {
    const fullKey = this.getFullKey(key)
    
    for (const layer of layers) {
      try {
        const value = await this.getFromLayer<T>(fullKey, layer)
        if (value !== null) {
          this.stats.hits++
          this.updateHitRate()
          
          // Promote to higher layers
          await this.promoteToHigherLayers(fullKey, value, layer, layers)
          return value
        }
      } catch (error) {
        console.warn(`Cache layer ${layer} failed for key ${key}:`, error)
      }
    }
    
    this.stats.misses++
    this.updateHitRate()
    return null
  }
  
  // Multi-layer set with cascade strategy
  async set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    layers: CacheLayer[] = ['memory', 'redis']
  ): Promise<void> {
    const fullKey = this.getFullKey(key)
    const finalTTL = ttl || this.config.defaultTTL
    
    const promises = layers.map(layer => 
      this.setToLayer(fullKey, value, finalTTL, layer).catch(error => {
        console.warn(`Cache layer ${layer} set failed for key ${key}:`, error)
      })
    )
    
    await Promise.allSettled(promises)
    this.stats.sets++
    this.updateStats()
  }
  
  // Delete from all layers
  async delete(key: string, layers: CacheLayer[] = ['memory', 'redis']): Promise<void> {
    const fullKey = this.getFullKey(key)
    
    const promises = layers.map(layer =>
      this.deleteFromLayer(fullKey, layer).catch(error => {
        console.warn(`Cache layer ${layer} delete failed for key ${key}:`, error)
      })
    )
    
    await Promise.allSettled(promises)
    this.stats.deletes++
  }
  
  // Bulk operations for efficiency
  async mget<T>(keys: string[], layers: CacheLayer[] = ['memory', 'redis']): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {}
    const promises = keys.map(async key => {
      const value = await this.get<T>(key, layers)
      results[key] = value
    })
    
    await Promise.all(promises)
    return results
  }
  
  async mset<T>(
    entries: Record<string, T>, 
    ttl?: number, 
    layers: CacheLayer[] = ['memory', 'redis']
  ): Promise<void> {
    const promises = Object.entries(entries).map(([key, value]) =>
      this.set(key, value, ttl, layers)
    )
    
    await Promise.all(promises)
  }
  
  // Pattern-based operations
  async keys(pattern: string, layer: CacheLayer = 'memory'): Promise<string[]> {
    switch (layer) {
      case 'memory':
        const regex = this.patternToRegex(pattern)
        return Array.from(this.memoryCache.keys()).filter(key => regex.test(key))
      case 'redis':
        if (this.redisClient) {
          return await this.redisClient.keys(pattern)
        }
        return []
      default:
        return []
    }
  }
  
  async clear(pattern?: string, layers: CacheLayer[] = ['memory', 'redis']): Promise<void> {
    if (pattern) {
      const promises = layers.map(async layer => {
        const keys = await this.keys(pattern, layer)
        return Promise.all(keys.map(key => this.deleteFromLayer(key, layer)))
      })
      await Promise.all(promises)
    } else {
      // Clear all
      layers.forEach(layer => {
        switch (layer) {
          case 'memory':
            this.memoryCache.clear()
            break
          case 'redis':
            this.redisClient?.flushall()
            break
          case 'memcached':
            this.memcachedClient?.flush()
            break
        }
      })
    }
    this.updateStats()
  }
  
  // Cache warming utilities
  async warm<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }
    
    const value = await fetcher()
    await this.set(key, value, ttl)
    return value
  }
  
  // Advanced patterns
  async remember<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    return this.warm(key, fetcher, ttl)
  }
  
  async rememberForever<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    return this.warm(key, fetcher, 86400000) // 24 hours
  }
  
  // Cache invalidation strategies
  async invalidateByTag(tag: string): Promise<void> {
    const pattern = `*:tag:${tag}:*`
    await this.clear(pattern)
  }
  
  async invalidateByPrefix(prefix: string): Promise<void> {
    const pattern = `${this.config.prefix}:${prefix}:*`
    await this.clear(pattern)
  }
  
  // Statistics and monitoring
  getStats(): CacheStats & { layers: Record<string, any> } {
    return {
      ...this.stats,
      layers: {
        memory: {
          size: this.memoryCache.size,
          memoryUsage: this.calculateMemoryUsage()
        },
        redis: {
          connected: !!this.redisClient,
          // Would include Redis-specific stats in production
        },
        memcached: {
          connected: !!this.memcachedClient,
          // Would include Memcached-specific stats in production
        }
      }
    }
  }
  
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      memoryUsage: 0,
      entries: 0
    }
  }
  
  // Cache health check
  async healthCheck(): Promise<{ status: string; layers: Record<string, boolean> }> {
    const layers: Record<string, boolean> = {}
    
    // Memory cache is always healthy if we can access it
    layers.memory = this.memoryCache instanceof Map
    
    // Redis health check
    try {
      if (this.redisClient) {
        await this.redisClient.ping()
        layers.redis = true
      } else {
        layers.redis = false
      }
    } catch {
      layers.redis = false
    }
    
    // Memcached health check
    try {
      if (this.memcachedClient) {
        // Would implement actual health check in production
        layers.memcached = true
      } else {
        layers.memcached = false
      }
    } catch {
      layers.memcached = false
    }
    
    const healthyLayers = Object.values(layers).filter(Boolean).length
    const status = healthyLayers > 0 ? (healthyLayers === Object.keys(layers).length ? 'healthy' : 'degraded') : 'unhealthy'
    
    return { status, layers }
  }
  
  // Cleanup and maintenance
  cleanup(): void {
    const now = Date.now()
    const expired: string[] = []
    
    this.memoryCache.forEach((entry, key) => {
      if (now > entry.created + entry.ttl) {
        expired.push(key)
      }
    })
    
    expired.forEach(key => this.memoryCache.delete(key))
    this.updateStats()
  }
  
  // Private methods
  private async getFromLayer<T>(key: string, layer: CacheLayer): Promise<T | null> {
    switch (layer) {
      case 'memory':
        const entry = this.memoryCache.get(key)
        if (entry && Date.now() < entry.created + entry.ttl) {
          entry.accessed = Date.now()
          entry.hits++
          return this.deserialize<T>(entry.value)
        }
        if (entry) {
          this.memoryCache.delete(key)
        }
        return null
        
      case 'redis':
        if (this.redisClient) {
          const value = await this.redisClient.get(key)
          return value ? this.deserialize<T>(value) : null
        }
        return null
        
      case 'memcached':
        if (this.memcachedClient) {
          const value = await this.memcachedClient.get(key)
          return value ? this.deserialize<T>(value) : null
        }
        return null
        
      default:
        return null
    }
  }
  
  private async setToLayer<T>(key: string, value: T, ttl: number, layer: CacheLayer): Promise<void> {
    const serialized = this.serialize(value)
    
    switch (layer) {
      case 'memory':
        // Implement LRU eviction if at max size
        if (this.config.maxSize && this.memoryCache.size >= this.config.maxSize) {
          this.evictLRU()
        }
        
        this.memoryCache.set(key, {
          value: serialized,
          ttl,
          created: Date.now(),
          accessed: Date.now(),
          hits: 0
        })
        break
        
      case 'redis':
        if (this.redisClient) {
          await this.redisClient.setex(key, Math.ceil(ttl / 1000), serialized)
        }
        break
        
      case 'memcached':
        if (this.memcachedClient) {
          await this.memcachedClient.set(key, serialized, Math.ceil(ttl / 1000))
        }
        break
    }
  }
  
  private async deleteFromLayer(key: string, layer: CacheLayer): Promise<void> {
    switch (layer) {
      case 'memory':
        this.memoryCache.delete(key)
        break
      case 'redis':
        if (this.redisClient) {
          await this.redisClient.del(key)
        }
        break
      case 'memcached':
        if (this.memcachedClient) {
          await this.memcachedClient.del(key)
        }
        break
    }
  }
  
  private async promoteToHigherLayers<T>(
    key: string, 
    value: T, 
    foundLayer: CacheLayer, 
    layers: CacheLayer[]
  ): Promise<void> {
    const layerIndex = layers.indexOf(foundLayer)
    if (layerIndex > 0) {
      const higherLayers = layers.slice(0, layerIndex)
      await Promise.allSettled(
        higherLayers.map(layer => this.setToLayer(key, value, this.config.defaultTTL, layer))
      )
    }
  }
  
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    this.memoryCache.forEach((entry, key) => {
      if (entry.accessed < oldestTime) {
        oldestTime = entry.accessed
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
    }
  }
  
  private getFullKey(key: string): string {
    return `${this.config.prefix}:${key}`
  }
  
  private serialize<T>(value: T): any {
    switch (this.config.serializer) {
      case 'json':
        return JSON.stringify(value)
      case 'msgpack':
        // Would use msgpack library in production
        return JSON.stringify(value)
      case 'none':
        return value
      default:
        return JSON.stringify(value)
    }
  }
  
  private deserialize<T>(value: any): T {
    switch (this.config.serializer) {
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value
      case 'msgpack':
        // Would use msgpack library in production
        return typeof value === 'string' ? JSON.parse(value) : value
      case 'none':
        return value
      default:
        return typeof value === 'string' ? JSON.parse(value) : value
    }
  }
  
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = escaped.replace(/\\\*/g, '.*').replace(/\\\?/g, '.')
    return new RegExp(`^${regex}$`)
  }
  
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }
  
  private updateStats(): void {
    this.stats.entries = this.memoryCache.size
    this.stats.memoryUsage = this.calculateMemoryUsage()
    this.updateHitRate()
  }
  
  private calculateMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0
    this.memoryCache.forEach((entry, key) => {
      size += key.length * 2 // Approximate string size
      size += JSON.stringify(entry).length * 2
    })
    return size
  }
  
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }
  
  private initializeExternalCaches(): void {
    // In production, initialize Redis and Memcached clients
    if (process.env.REDIS_URL) {
      // this.redisClient = new Redis(process.env.REDIS_URL)
    }
    
    if (process.env.MEMCACHED_URL) {
      // this.memcachedClient = new Memcached(process.env.MEMCACHED_URL)
    }
  }
  
  // Cleanup on shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval as unknown as NodeJS.Timeout)
    }
    this.memoryCache.clear()
    // Close external connections in production
  }
}

// Singleton cache instance
export const cache = new EnterpriseCache()

// Specialized cache instances for different use cases
export const apiCache = new EnterpriseCache({
  prefix: 'api',
  defaultTTL: 300000, // 5 minutes
  maxSize: 5000
})

export const sessionCache = new EnterpriseCache({
  prefix: 'session',
  defaultTTL: 1800000, // 30 minutes
  maxSize: 10000
})

export const staticContentCache = new EnterpriseCache({
  prefix: 'static',
  defaultTTL: 86400000, // 24 hours
  maxSize: 1000
})

// Cache decorators and utilities
export function cached(ttl?: number, key?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = key || `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }
      
      const result = await method.apply(this, args)
      await cache.set(cacheKey, result, ttl)
      return result
    }
    
    return descriptor
  }
}

// Cache warming strategies
export class CacheWarmingService {
  private static instance: CacheWarmingService
  private warmingJobs: Map<string, NodeJS.Timer> = new Map()
  
  static getInstance(): CacheWarmingService {
    if (!CacheWarmingService.instance) {
      CacheWarmingService.instance = new CacheWarmingService()
    }
    return CacheWarmingService.instance
  }
  
  scheduleWarming<T>(
    key: string,
    fetcher: () => Promise<T>,
    interval: number,
    ttl?: number
  ): void {
    // Cancel existing job if any
    this.cancelWarming(key)
    
    // Initial warm
    cache.warm(key, fetcher, ttl)
    
    // Schedule periodic warming
    const job = setInterval(async () => {
      try {
        await cache.warm(key, fetcher, ttl)
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error)
      }
    }, interval)
    
    this.warmingJobs.set(key, job)
  }
  
  cancelWarming(key: string): void {
    const job = this.warmingJobs.get(key)
    if (job) {
      clearInterval(job as unknown as NodeJS.Timeout)
      this.warmingJobs.delete(key)
    }
  }
  
  cancelAllWarming(): void {
    this.warmingJobs.forEach((job, key) => {
      clearInterval(job as unknown as NodeJS.Timeout)
    })
    this.warmingJobs.clear()
  }
}

export const cacheWarming = CacheWarmingService.getInstance()

// Export default cache instance
export default cache
