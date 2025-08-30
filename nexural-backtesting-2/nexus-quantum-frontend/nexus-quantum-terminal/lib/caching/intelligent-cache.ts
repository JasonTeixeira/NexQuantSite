/**
 * Intelligent Caching System - Phase 2 Advanced Caching Strategy
 * Multi-layer caching with smart invalidation, compression, and analytics
 */

import Redis from 'ioredis'
import { LRUCache } from 'lru-cache'
import { compress, decompress } from 'lz4'
import crypto from 'crypto'

export interface CacheConfig {
  redis: {
    host: string
    port: number
    password?: string
    db?: number
    cluster?: boolean
    nodes?: Array<{ host: string; port: number }>
  }
  memory: {
    maxSize: number // in bytes
    maxAge: number // in milliseconds
    ttl: number // default TTL in seconds
  }
  compression: {
    enabled: boolean
    threshold: number // compress if larger than this (bytes)
    algorithm: 'lz4' | 'gzip'
  }
  analytics: {
    enabled: boolean
    sampleRate: number // 0.0 to 1.0
  }
}

export interface CacheItem<T = any> {
  data: T
  metadata: {
    key: string
    timestamp: number
    ttl: number
    compressed: boolean
    size: number
    version: string
    tags: string[]
    hitCount: number
    lastAccessed: number
  }
}

export interface CacheAnalytics {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  memoryHits: number
  redisHits: number
  compressionSavings: number
  averageSize: number
  hotKeys: string[]
}

export class IntelligentCache {
  private redis: Redis
  private memoryCache: LRUCache<string, CacheItem>
  private analytics: CacheAnalytics
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
    this.initializeRedis()
    this.initializeMemoryCache()
    this.initializeAnalytics()
  }

  private initializeRedis() {
    if (this.config.redis.cluster && this.config.redis.nodes) {
      // Redis Cluster
      this.redis = new Redis.Cluster(this.config.redis.nodes, {
        redisOptions: {
          password: this.config.redis.password,
          db: this.config.redis.db || 0,
        },
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })
    } else {
      // Single Redis instance
      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        db: this.config.redis.db || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })
    }

    this.redis.on('connect', () => {
      console.log('✅ Redis cache connected')
    })

    this.redis.on('error', (error) => {
      console.error('❌ Redis cache error:', error)
    })
  }

  private initializeMemoryCache() {
    this.memoryCache = new LRUCache<string, CacheItem>({
      max: this.config.memory.maxSize,
      ttl: this.config.memory.maxAge,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
      dispose: (value, key) => {
        this.analytics.evictions++
        if (this.config.analytics.enabled) {
          console.log(`🗑️ Memory cache evicted key: ${key}`)
        }
      },
    })
  }

  private initializeAnalytics() {
    this.analytics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      memoryHits: 0,
      redisHits: 0,
      compressionSavings: 0,
      averageSize: 0,
      hotKeys: [],
    }

    // Periodic analytics reporting
    if (this.config.analytics.enabled) {
      setInterval(() => {
        this.reportAnalytics()
      }, 60000) // Every minute
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.analytics.sampleRate
  }

  private generateCacheKey(namespace: string, key: string, version?: string): string {
    const versionSuffix = version ? `:v${version}` : ''
    return `nexural:${namespace}:${key}${versionSuffix}`
  }

  private generateTags(namespace: string, additionalTags: string[] = []): string[] {
    return [namespace, ...additionalTags]
  }

  private async compressData(data: any): Promise<{ data: Buffer; compressed: boolean; originalSize: number }> {
    if (!this.config.compression.enabled) {
      const buffer = Buffer.from(JSON.stringify(data))
      return { data: buffer, compressed: false, originalSize: buffer.length }
    }

    const jsonData = JSON.stringify(data)
    const originalSize = Buffer.byteLength(jsonData)

    if (originalSize < this.config.compression.threshold) {
      return { data: Buffer.from(jsonData), compressed: false, originalSize }
    }

    try {
      const compressed = compress(Buffer.from(jsonData))
      const compressionRatio = compressed.length / originalSize
      
      if (compressionRatio < 0.9) { // Only use compression if it saves at least 10%
        this.analytics.compressionSavings += (originalSize - compressed.length)
        return { data: compressed, compressed: true, originalSize }
      } else {
        return { data: Buffer.from(jsonData), compressed: false, originalSize }
      }
    } catch (error) {
      console.warn('⚠️ Compression failed, storing uncompressed:', error)
      return { data: Buffer.from(jsonData), compressed: false, originalSize }
    }
  }

  private async decompressData(data: Buffer, compressed: boolean): Promise<any> {
    try {
      if (!compressed) {
        return JSON.parse(data.toString())
      }

      const decompressed = decompress(data)
      return JSON.parse(decompressed.toString())
    } catch (error) {
      console.error('❌ Decompression failed:', error)
      throw new Error('Failed to decompress cached data')
    }
  }

  /**
   * Set a value in cache with intelligent storage strategy
   */
  async set<T>(
    namespace: string,
    key: string,
    value: T,
    options: {
      ttl?: number
      tags?: string[]
      version?: string
      forceRedis?: boolean
    } = {}
  ): Promise<void> {
    const {
      ttl = this.config.memory.ttl,
      tags = [],
      version,
      forceRedis = false
    } = options

    const cacheKey = this.generateCacheKey(namespace, key, version)
    const allTags = this.generateTags(namespace, tags)

    try {
      // Compress data if needed
      const { data: compressedData, compressed, originalSize } = await this.compressData(value)

      const cacheItem: CacheItem<T> = {
        data: value,
        metadata: {
          key: cacheKey,
          timestamp: Date.now(),
          ttl,
          compressed,
          size: originalSize,
          version: version || '1.0',
          tags: allTags,
          hitCount: 0,
          lastAccessed: Date.now(),
        },
      }

      // Store in memory cache (for frequently accessed items)
      if (!forceRedis && originalSize < 1024 * 100) { // < 100KB goes to memory
        this.memoryCache.set(cacheKey, cacheItem, { ttl: ttl * 1000 })
      }

      // Store in Redis (persistent layer)
      const pipeline = this.redis.pipeline()
      
      // Store the compressed data
      pipeline.setex(cacheKey, ttl, compressedData)
      
      // Store metadata separately for analytics
      pipeline.setex(
        `${cacheKey}:meta`,
        ttl,
        JSON.stringify(cacheItem.metadata)
      )

      // Add to tag-based sets for batch invalidation
      for (const tag of allTags) {
        pipeline.sadd(`tag:${tag}`, cacheKey)
        pipeline.expire(`tag:${tag}`, ttl + 3600) // Tags expire 1 hour after cache
      }

      await pipeline.exec()

      this.analytics.sets++
      if (this.config.analytics.enabled && this.shouldSample()) {
        console.log(`📦 Cached ${namespace}:${key} (${originalSize} bytes, compressed: ${compressed})`)
      }

    } catch (error) {
      console.error(`❌ Failed to set cache ${namespace}:${key}:`, error)
      throw error
    }
  }

  /**
   * Get a value from cache with multi-layer fallback
   */
  async get<T>(namespace: string, key: string, version?: string): Promise<T | null> {
    const cacheKey = this.generateCacheKey(namespace, key, version)

    try {
      // Try memory cache first (fastest)
      const memoryItem = this.memoryCache.get(cacheKey)
      if (memoryItem) {
        memoryItem.metadata.hitCount++
        memoryItem.metadata.lastAccessed = Date.now()
        this.analytics.hits++
        this.analytics.memoryHits++
        
        if (this.config.analytics.enabled && this.shouldSample()) {
          console.log(`⚡ Memory cache hit: ${namespace}:${key}`)
        }
        
        return memoryItem.data
      }

      // Fallback to Redis
      const pipeline = this.redis.pipeline()
      pipeline.get(cacheKey)
      pipeline.get(`${cacheKey}:meta`)
      
      const results = await pipeline.exec()
      const [dataResult, metaResult] = results || []

      if (!dataResult || dataResult[1] === null) {
        this.analytics.misses++
        return null
      }

      const compressedData = dataResult[1] as Buffer
      const metadata = metaResult && metaResult[1] 
        ? JSON.parse(metaResult[1] as string) 
        : { compressed: false }

      // Decompress data
      const data = await this.decompressData(compressedData, metadata.compressed)

      // Update hit analytics
      if (metadata) {
        metadata.hitCount = (metadata.hitCount || 0) + 1
        metadata.lastAccessed = Date.now()
        
        // Update metadata in Redis
        this.redis.setex(`${cacheKey}:meta`, metadata.ttl, JSON.stringify(metadata))
      }

      this.analytics.hits++
      this.analytics.redisHits++

      if (this.config.analytics.enabled && this.shouldSample()) {
        console.log(`💽 Redis cache hit: ${namespace}:${key}`)
      }

      // Store in memory cache for future access if it's small enough
      if (metadata.size < 1024 * 100) { // < 100KB
        const cacheItem: CacheItem<T> = {
          data,
          metadata,
        }
        this.memoryCache.set(cacheKey, cacheItem, { ttl: metadata.ttl * 1000 })
      }

      return data

    } catch (error) {
      console.error(`❌ Failed to get cache ${namespace}:${key}:`, error)
      this.analytics.misses++
      return null
    }
  }

  /**
   * Delete a specific cache entry
   */
  async delete(namespace: string, key: string, version?: string): Promise<boolean> {
    const cacheKey = this.generateCacheKey(namespace, key, version)

    try {
      // Remove from memory cache
      this.memoryCache.delete(cacheKey)

      // Remove from Redis
      const pipeline = this.redis.pipeline()
      pipeline.del(cacheKey)
      pipeline.del(`${cacheKey}:meta`)
      
      const results = await pipeline.exec()
      const deleted = results ? results[0][1] as number > 0 : false

      if (deleted) {
        this.analytics.deletes++
      }

      return deleted

    } catch (error) {
      console.error(`❌ Failed to delete cache ${namespace}:${key}:`, error)
      return false
    }
  }

  /**
   * Invalidate cache entries by tags (smart invalidation)
   */
  async invalidateByTag(tag: string): Promise<number> {
    try {
      const tagKey = `tag:${tag}`
      const cacheKeys = await this.redis.smembers(tagKey)

      if (cacheKeys.length === 0) {
        return 0
      }

      // Remove from memory cache
      for (const cacheKey of cacheKeys) {
        this.memoryCache.delete(cacheKey)
      }

      // Remove from Redis
      const pipeline = this.redis.pipeline()
      
      for (const cacheKey of cacheKeys) {
        pipeline.del(cacheKey)
        pipeline.del(`${cacheKey}:meta`)
      }
      
      pipeline.del(tagKey)
      
      await pipeline.exec()

      console.log(`🗑️ Invalidated ${cacheKeys.length} cache entries with tag: ${tag}`)
      return cacheKeys.length

    } catch (error) {
      console.error(`❌ Failed to invalidate tag ${tag}:`, error)
      return 0
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern)
      
      if (keys.length === 0) {
        return 0
      }

      // Remove from memory cache
      for (const key of keys) {
        this.memoryCache.delete(key)
      }

      // Remove from Redis
      await this.redis.del(...keys)

      console.log(`🗑️ Invalidated ${keys.length} cache entries matching pattern: ${pattern}`)
      return keys.length

    } catch (error) {
      console.error(`❌ Failed to invalidate pattern ${pattern}:`, error)
      return 0
    }
  }

  /**
   * Bulk invalidation for related data
   */
  async invalidatePortfolioData(userId: string): Promise<void> {
    await Promise.all([
      this.invalidateByTag(`user:${userId}`),
      this.invalidateByTag('portfolio'),
      this.invalidateByPattern(`nexural:portfolio:${userId}:*`),
      this.invalidateByPattern(`nexural:trades:${userId}:*`),
      this.invalidateByPattern(`nexural:positions:${userId}:*`),
    ])
  }

  /**
   * Get cache statistics and analytics
   */
  getAnalytics(): CacheAnalytics & {
    memoryStats: {
      size: number
      maxSize: number
      itemCount: number
    }
    hitRate: number
    compressionRate: number
  } {
    const memoryStats = {
      size: this.memoryCache.calculatedSize,
      maxSize: this.config.memory.maxSize,
      itemCount: this.memoryCache.size,
    }

    const totalRequests = this.analytics.hits + this.analytics.misses
    const hitRate = totalRequests > 0 ? this.analytics.hits / totalRequests : 0

    const compressionRate = this.analytics.sets > 0 
      ? this.analytics.compressionSavings / this.analytics.sets 
      : 0

    return {
      ...this.analytics,
      memoryStats,
      hitRate,
      compressionRate,
    }
  }

  /**
   * Get hot keys (most frequently accessed)
   */
  async getHotKeys(limit: number = 10): Promise<Array<{ key: string; hitCount: number }>> {
    try {
      const pattern = 'nexural:*:meta'
      const keys = await this.redis.keys(pattern)
      
      const hotKeys: Array<{ key: string; hitCount: number }> = []

      for (const metaKey of keys) {
        const metaData = await this.redis.get(metaKey)
        if (metaData) {
          const metadata = JSON.parse(metaData)
          hotKeys.push({
            key: metadata.key.replace(':meta', ''),
            hitCount: metadata.hitCount || 0,
          })
        }
      }

      // Sort by hit count and return top N
      return hotKeys
        .sort((a, b) => b.hitCount - a.hitCount)
        .slice(0, limit)

    } catch (error) {
      console.error('❌ Failed to get hot keys:', error)
      return []
    }
  }

  /**
   * Health check for cache systems
   */
  async healthCheck(): Promise<{
    redis: boolean
    memory: boolean
    overall: boolean
  }> {
    const health = {
      redis: false,
      memory: false,
      overall: false,
    }

    try {
      // Test Redis connection
      await this.redis.ping()
      health.redis = true
    } catch (error) {
      console.error('❌ Redis health check failed:', error)
    }

    try {
      // Test memory cache
      const testKey = 'health-check-test'
      this.memoryCache.set(testKey, { test: true })
      const retrieved = this.memoryCache.get(testKey)
      health.memory = !!retrieved
      this.memoryCache.delete(testKey)
    } catch (error) {
      console.error('❌ Memory cache health check failed:', error)
    }

    health.overall = health.redis && health.memory
    return health
  }

  private reportAnalytics(): void {
    const stats = this.getAnalytics()
    console.log('📊 Cache Analytics:', {
      hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
      totalHits: stats.hits,
      memoryHits: stats.memoryHits,
      redisHits: stats.redisHits,
      misses: stats.misses,
      compressionSavings: `${(stats.compressionSavings / 1024 / 1024).toFixed(2)} MB`,
      memoryUsage: `${(stats.memoryStats.size / 1024 / 1024).toFixed(2)} MB`,
    })
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    try {
      this.memoryCache.clear()
      await this.redis.quit()
      console.log('✅ Cache systems closed gracefully')
    } catch (error) {
      console.error('❌ Error closing cache systems:', error)
    }
  }
}

// Default configuration
export const createIntelligentCache = (config?: Partial<CacheConfig>): IntelligentCache => {
  const defaultConfig: CacheConfig = {
    redis: {
      host: process.env.REDIS_HOST || 'redis-cluster',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 1,
      cluster: process.env.REDIS_CLUSTER === 'true',
    },
    memory: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 10 * 60 * 1000, // 10 minutes
      ttl: 300, // 5 minutes
    },
    compression: {
      enabled: true,
      threshold: 1024, // 1KB
      algorithm: 'lz4',
    },
    analytics: {
      enabled: process.env.NODE_ENV === 'production',
      sampleRate: 0.1, // 10% sampling
    },
  }

  const mergedConfig = { ...defaultConfig, ...config }
  return new IntelligentCache(mergedConfig)
}

// Global cache instance
let intelligentCache: IntelligentCache | null = null

export const getIntelligentCache = (): IntelligentCache => {
  if (!intelligentCache) {
    intelligentCache = createIntelligentCache()
  }
  return intelligentCache
}
