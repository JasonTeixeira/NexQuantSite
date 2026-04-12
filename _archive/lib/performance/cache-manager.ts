interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  size: number
  tags: Set<string>
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalEntries: number
  totalSize: number
  evictions: number
}

interface CacheConfig {
  maxSize: number // bytes
  maxEntries: number
  defaultTTL: number // milliseconds
  cleanupInterval: number // milliseconds
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    totalSize: 0,
    evictions: 0,
  }

  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 10000,
      defaultTTL: 60 * 60 * 1000, // 1 hour
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...config,
    }

    this.startCleanupTimer()
  }

  set<T>(key: string, data: T, ttl?: number, tags: string[] = []): void {
    const size = this.calculateSize(data)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0,
      size,
      tags: new Set(tags),
    }

    // Check if we need to evict entries
    this.evictIfNecessary(size)

    this.cache.set(key, entry)
    this.updateStats()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    entry.hits++
    this.stats.hits++
    this.updateHitRate()

    return entry.data as T
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number, tags: string[] = []): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await factory()
    this.set(key, data, ttl, tags)
    return data
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateStats()
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.resetStats()
  }

  invalidateByTags(tags: string[]): number {
    let invalidated = 0
    const tagSet = new Set(tags)

    for (const [key, entry] of this.cache.entries()) {
      if (this.hasAnyTag(entry.tags, tagSet)) {
        this.cache.delete(key)
        invalidated++
      }
    }

    this.updateStats()
    return invalidated
  }

  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        invalidated++
      }
    }

    this.updateStats()
    return invalidated
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  getKeysByTag(tag: string): string[] {
    const keys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.has(tag)) {
        keys.push(key)
      }
    }

    return keys
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key)
    if (!entry || this.isExpired(entry)) {
      return false
    }

    entry.timestamp = Date.now()
    if (ttl !== undefined) {
      entry.ttl = ttl
    }

    return true
  }

  private evictIfNecessary(newEntrySize: number): void {
    // Check size limit
    while (this.stats.totalSize + newEntrySize > this.config.maxSize && this.cache.size > 0) {
      this.evictLRU()
    }

    // Check entry count limit
    while (this.cache.size >= this.config.maxEntries) {
      this.evictLRU()
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    let lowestHits = Number.POSITIVE_INFINITY

    for (const [key, entry] of this.cache.entries()) {
      const lastAccess = entry.timestamp + entry.hits * 1000 // Factor in hit count

      if (lastAccess < oldestTime || (lastAccess === oldestTime && entry.hits < lowestHits)) {
        oldestTime = lastAccess
        oldestKey = key
        lowestHits = entry.hits
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
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

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2 // Rough estimate (UTF-16)
  }

  private hasAnyTag(entryTags: Set<string>, searchTags: Set<string>): boolean {
    for (const tag of searchTags) {
      if (entryTags.has(tag)) {
        return true
      }
    }
    return false
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size
    this.stats.totalSize = Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0)
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      totalSize: 0,
      evictions: 0,
    }
  }

  destroy(): void {
    this.stopCleanupTimer()
    this.clear()
  }
}

export const cacheManager = new CacheManager()
