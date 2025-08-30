/**
 * PostgreSQL Cluster Manager - Phase 2 Database Clustering
 * Intelligent routing: Writes -> Primary, Reads -> Read Replicas
 * Load balancing, failover, and connection pooling
 */

import { Pool, PoolClient, PoolConfig } from 'pg'
import Redis from 'ioredis'

export interface ClusterConfig {
  primary: {
    host: string
    port: number
    database: string
    user: string
    password: string
    ssl?: boolean
  }
  replicas: Array<{
    host: string
    port: number
    database: string
    user: string
    password: string
    ssl?: boolean
    weight?: number // Load balancing weight (default: 1)
  }>
  poolConfig?: {
    max?: number
    min?: number
    idleTimeoutMillis?: number
    connectionTimeoutMillis?: number
  }
  redis?: {
    host: string
    port: number
    password?: string
  }
}

export interface QueryOptions {
  preferReplica?: boolean
  timeout?: number
  retries?: number
  cacheKey?: string
  cacheTTL?: number
}

export class PostgreSQLClusterManager {
  private primaryPool: Pool
  private replicaPools: Pool[]
  private replicaWeights: number[]
  private redis?: Redis
  private currentReplicaIndex = 0
  private healthStatus: Map<string, boolean> = new Map()

  constructor(private config: ClusterConfig) {
    this.initializePools()
    this.initializeRedis()
    this.startHealthChecks()
  }

  private initializePools() {
    // Initialize primary connection pool
    const primaryConfig: PoolConfig = {
      host: this.config.primary.host,
      port: this.config.primary.port,
      database: this.config.primary.database,
      user: this.config.primary.user,
      password: this.config.primary.password,
      ssl: this.config.primary.ssl,
      max: this.config.poolConfig?.max || 20,
      min: this.config.poolConfig?.min || 2,
      idleTimeoutMillis: this.config.poolConfig?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: this.config.poolConfig?.connectionTimeoutMillis || 5000,
      statement_timeout: 30000,
      query_timeout: 30000,
    }

    this.primaryPool = new Pool(primaryConfig)
    this.healthStatus.set('primary', true)

    // Initialize replica connection pools
    this.replicaPools = []
    this.replicaWeights = []

    this.config.replicas.forEach((replica, index) => {
      const replicaConfig: PoolConfig = {
        host: replica.host,
        port: replica.port,
        database: replica.database,
        user: replica.user,
        password: replica.password,
        ssl: replica.ssl,
        max: this.config.poolConfig?.max || 15,
        min: this.config.poolConfig?.min || 1,
        idleTimeoutMillis: this.config.poolConfig?.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: this.config.poolConfig?.connectionTimeoutMillis || 5000,
        statement_timeout: 30000,
        query_timeout: 30000,
      }

      const pool = new Pool(replicaConfig)
      this.replicaPools.push(pool)
      this.replicaWeights.push(replica.weight || 1)
      this.healthStatus.set(`replica-${index}`, true)
    })

    console.log(`✅ Initialized PostgreSQL cluster: 1 primary + ${this.replicaPools.length} replicas`)
  }

  private initializeRedis() {
    if (this.config.redis) {
      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })

      this.redis.on('connect', () => {
        console.log('✅ Redis cache connected for query caching')
      })

      this.redis.on('error', (error) => {
        console.warn('⚠️ Redis cache error:', error.message)
      })
    }
  }

  private async startHealthChecks() {
    setInterval(async () => {
      await this.checkHealth()
    }, 10000) // Check every 10 seconds
  }

  private async checkHealth() {
    // Check primary health
    try {
      const client = await this.primaryPool.connect()
      await client.query('SELECT 1')
      client.release()
      this.healthStatus.set('primary', true)
    } catch (error) {
      console.error('❌ Primary database health check failed:', error)
      this.healthStatus.set('primary', false)
    }

    // Check replica health
    for (let i = 0; i < this.replicaPools.length; i++) {
      try {
        const client = await this.replicaPools[i].connect()
        await client.query('SELECT 1')
        client.release()
        this.healthStatus.set(`replica-${i}`, true)
      } catch (error) {
        console.error(`❌ Replica ${i} health check failed:`, error)
        this.healthStatus.set(`replica-${i}`, false)
      }
    }
  }

  private getHealthyReplicaPool(): Pool | null {
    const healthyReplicas = this.replicaPools.filter((_, index) => 
      this.healthStatus.get(`replica-${index}`)
    )

    if (healthyReplicas.length === 0) {
      console.warn('⚠️ No healthy replicas available, falling back to primary')
      return this.primaryPool
    }

    // Weighted round-robin selection
    const totalWeight = this.replicaWeights.reduce((sum, weight, index) => {
      return this.healthStatus.get(`replica-${index}`) ? sum + weight : sum
    }, 0)

    if (totalWeight === 0) return healthyReplicas[0]

    let randomWeight = Math.random() * totalWeight
    for (let i = 0; i < this.replicaPools.length; i++) {
      if (!this.healthStatus.get(`replica-${i}`)) continue
      
      randomWeight -= this.replicaWeights[i]
      if (randomWeight <= 0) {
        return this.replicaPools[i]
      }
    }

    return healthyReplicas[0]
  }

  private isWriteQuery(query: string): boolean {
    const writeKeywords = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE']
    const upperQuery = query.trim().toUpperCase()
    return writeKeywords.some(keyword => upperQuery.startsWith(keyword))
  }

  private async getCachedResult(cacheKey: string): Promise<any | null> {
    if (!this.redis || !cacheKey) return null

    try {
      const cached = await this.redis.get(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('⚠️ Cache get error:', error)
      return null
    }
  }

  private async setCachedResult(cacheKey: string, result: any, ttl: number) {
    if (!this.redis || !cacheKey) return

    try {
      await this.redis.setex(cacheKey, ttl, JSON.stringify(result))
    } catch (error) {
      console.warn('⚠️ Cache set error:', error)
    }
  }

  private async invalidateCache(patterns: string[]) {
    if (!this.redis) return

    try {
      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
    } catch (error) {
      console.warn('⚠️ Cache invalidation error:', error)
    }
  }

  /**
   * Execute a query with intelligent routing
   */
  async query(
    text: string, 
    params?: any[], 
    options: QueryOptions = {}
  ): Promise<any> {
    const { 
      preferReplica = false, 
      timeout = 30000, 
      retries = 2,
      cacheKey,
      cacheTTL = 300 // 5 minutes default
    } = options

    // Check cache first for read queries
    if (cacheKey && !this.isWriteQuery(text)) {
      const cached = await this.getCachedResult(cacheKey)
      if (cached) {
        return cached
      }
    }

    const isWrite = this.isWriteQuery(text)
    let pool: Pool

    // Routing logic
    if (isWrite) {
      // All writes go to primary
      pool = this.primaryPool
      if (!this.healthStatus.get('primary')) {
        throw new Error('Primary database is unavailable for write operations')
      }
    } else if (preferReplica || !isWrite) {
      // Reads go to replicas (with fallback to primary)
      pool = this.getHealthyReplicaPool() || this.primaryPool
    } else {
      pool = this.primaryPool
    }

    let lastError: Error | null = null
    let attempt = 0

    while (attempt <= retries) {
      try {
        const client: PoolClient = await pool.connect()
        
        try {
          const startTime = Date.now()
          const result = await client.query(text, params)
          const duration = Date.now() - startTime

          // Log slow queries
          if (duration > 1000) {
            console.warn(`🐌 Slow query detected (${duration}ms):`, text.substring(0, 100))
          }

          // Cache read query results
          if (cacheKey && !isWrite && result.rows) {
            await this.setCachedResult(cacheKey, result, cacheTTL)
          }

          // Invalidate related cache entries for write queries
          if (isWrite) {
            const tableName = this.extractTableName(text)
            if (tableName) {
              await this.invalidateCache([
                `query:*:${tableName}:*`,
                `portfolio:*`,
                `trades:*`,
                `positions:*`
              ])
            }
          }

          return result

        } finally {
          client.release()
        }

      } catch (error) {
        lastError = error as Error
        attempt++
        
        console.error(`❌ Query attempt ${attempt} failed:`, error)
        
        if (attempt <= retries) {
          console.log(`🔄 Retrying query (attempt ${attempt + 1}/${retries + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    throw lastError || new Error('Query failed after all retries')
  }

  private extractTableName(query: string): string | null {
    const match = query.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
    return match ? match[1] : null
  }

  /**
   * Execute a transaction (always on primary)
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<T> {
    const { timeout = 30000, retries = 2 } = options

    if (!this.healthStatus.get('primary')) {
      throw new Error('Primary database is unavailable for transactions')
    }

    let lastError: Error | null = null
    let attempt = 0

    while (attempt <= retries) {
      const client: PoolClient = await this.primaryPool.connect()
      
      try {
        await client.query('BEGIN')
        const result = await callback(client)
        await client.query('COMMIT')
        
        // Invalidate cache after successful transaction
        await this.invalidateCache([
          'query:*',
          'portfolio:*',
          'trades:*',
          'positions:*'
        ])
        
        return result

      } catch (error) {
        try {
          await client.query('ROLLBACK')
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError)
        }
        
        lastError = error as Error
        attempt++
        
        if (attempt <= retries) {
          console.log(`🔄 Retrying transaction (attempt ${attempt + 1}/${retries + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }

      } finally {
        client.release()
      }
    }

    throw lastError || new Error('Transaction failed after all retries')
  }

  /**
   * Get cluster health status
   */
  getHealthStatus(): { primary: boolean; replicas: boolean[] } {
    return {
      primary: this.healthStatus.get('primary') || false,
      replicas: this.replicaPools.map((_, index) => 
        this.healthStatus.get(`replica-${index}`) || false
      )
    }
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    return {
      primary: {
        totalCount: this.primaryPool.totalCount,
        idleCount: this.primaryPool.idleCount,
        waitingCount: this.primaryPool.waitingCount,
      },
      replicas: this.replicaPools.map(pool => ({
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      }))
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await Promise.all([
      this.primaryPool.end(),
      ...this.replicaPools.map(pool => pool.end())
    ])
    
    if (this.redis) {
      await this.redis.disconnect()
    }
    
    console.log('✅ PostgreSQL cluster connections closed')
  }
}

// Default cluster configuration
export const createClusterManager = (config?: Partial<ClusterConfig>): PostgreSQLClusterManager => {
  const defaultConfig: ClusterConfig = {
    primary: {
      host: process.env.POSTGRES_PRIMARY_HOST || 'postgres-primary',
      port: parseInt(process.env.POSTGRES_PRIMARY_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'nexural_production',
      user: process.env.POSTGRES_USER || 'nexural_admin',
      password: process.env.POSTGRES_PASSWORD || 'nexural_super_secure_password',
      ssl: process.env.NODE_ENV === 'production'
    },
    replicas: [
      {
        host: process.env.POSTGRES_REPLICA_1_HOST || 'postgres-replica-1',
        port: parseInt(process.env.POSTGRES_REPLICA_1_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'nexural_production',
        user: process.env.POSTGRES_USER || 'nexural_admin',
        password: process.env.POSTGRES_PASSWORD || 'nexural_super_secure_password',
        ssl: process.env.NODE_ENV === 'production',
        weight: 1
      },
      {
        host: process.env.POSTGRES_REPLICA_2_HOST || 'postgres-replica-2',
        port: parseInt(process.env.POSTGRES_REPLICA_2_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'nexural_production',
        user: process.env.POSTGRES_USER || 'nexural_admin',
        password: process.env.POSTGRES_PASSWORD || 'nexural_super_secure_password',
        ssl: process.env.NODE_ENV === 'production',
        weight: 1
      }
    ],
    poolConfig: {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
    redis: {
      host: process.env.REDIS_HOST || 'redis-cluster',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  }

  const mergedConfig = { ...defaultConfig, ...config }
  return new PostgreSQLClusterManager(mergedConfig)
}

// Global cluster manager instance
let clusterManager: PostgreSQLClusterManager | null = null

export const getClusterManager = (): PostgreSQLClusterManager => {
  if (!clusterManager) {
    clusterManager = createClusterManager()
  }
  return clusterManager
}
