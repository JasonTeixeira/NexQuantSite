// 🗄️ NEXUS QUANTUM DATABASE - PRODUCTION INTERFACE
// World-class database layer with connection pooling, caching, and error handling

import { Pool, PoolClient } from 'pg'
import Redis from 'ioredis'

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
  max?: number // connection pool size
}

interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
}

export interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'trader' | 'viewer'
  subscription_tier: 'basic' | 'pro' | 'institutional'
  created_at: Date
  settings: Record<string, any>
}

export interface Portfolio {
  id: number
  user_id: number
  name: string
  initial_capital: number
  current_value: number
  cash_balance: number
  total_pnl: number
  created_at: Date
}

export interface Position {
  id: number
  portfolio_id: number
  symbol: string
  asset_type: 'stock' | 'option' | 'future' | 'crypto'
  quantity: number
  avg_price: number
  current_price: number
  market_value: number
  unrealized_pnl: number
  realized_pnl: number
  opened_at: Date
}

export interface Trade {
  id: number
  portfolio_id: number
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  commission: number
  executed_at: Date
  trade_value: number
}

export interface MarketData {
  symbol: string
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjusted_close: number
  data_source: string
}

// ============================================================================
// DATABASE CONNECTION MANAGER
// ============================================================================

export class NexusDatabase {
  private pool: Pool
  private redis: Redis
  private connected: boolean = false

  constructor() {
    // Initialize PostgreSQL connection pool
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'nexus_quantum',
      user: process.env.DATABASE_USER || 'nexus_user',
      password: process.env.DATABASE_PASSWORD || 'secure_password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DATABASE_POOL_SIZE || '20'), // connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Initialize Redis for caching
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.pool.on('connect', () => {
      console.log('🗄️ Connected to PostgreSQL database')
      this.connected = true
    })

    this.pool.on('error', (err) => {
      console.error('💥 PostgreSQL error:', err)
      this.connected = false
    })

    this.redis.on('connect', () => {
      console.log('🔄 Connected to Redis cache')
    })

    this.redis.on('error', (err) => {
      console.error('💥 Redis error:', err)
    })
  }

  // ============================================================================
  // HEALTH CHECK & CONNECTION
  // ============================================================================

  async healthCheck(): Promise<{ postgres: boolean; redis: boolean }> {
    try {
      const pgResult = await this.pool.query('SELECT NOW() as timestamp')
      const redisResult = await this.redis.ping()
      
      return {
        postgres: pgResult.rows.length > 0,
        redis: redisResult === 'PONG'
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return { postgres: false, redis: false }
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end()
      this.redis.disconnect()
      this.connected = false
      console.log('📦 Database connections closed')
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  // ============================================================================
  // CACHING HELPERS
  // ============================================================================

  private getCacheKey(type: string, id: string | number): string {
    return `nexus:${type}:${id}`
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('Cache get error:', error)
      return null
    }
  }

  private async setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.warn('Cache set error:', error)
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getUserById(id: number): Promise<User | null> {
    const cacheKey = this.getCacheKey('user', id)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.pool.query(
        'SELECT id, email, full_name, role, subscription_tier, created_at, settings FROM users WHERE id = $1 AND is_active = true',
        [id]
      )
      
      const user = result.rows[0] || null
      if (user) {
        await this.setCache(cacheKey, user, 600) // Cache for 10 minutes
      }
      
      return user
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        'SELECT id, email, full_name, role, subscription_tier, created_at, settings FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      )
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `INSERT INTO users (email, password_hash, full_name, role, subscription_tier, settings) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email, full_name, role, subscription_tier, created_at, settings`,
        [
          userData.email?.toLowerCase(),
          userData.password_hash, // This should be hashed before calling
          userData.full_name,
          userData.role || 'trader',
          userData.subscription_tier || 'basic',
          userData.settings || {}
        ]
      )
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  // ============================================================================
  // PORTFOLIO MANAGEMENT
  // ============================================================================

  async getUserPortfolios(userId: number): Promise<Portfolio[]> {
    const cacheKey = this.getCacheKey('portfolios', userId)
    const cached = await this.getFromCache<Portfolio[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.pool.query(
        'SELECT * FROM portfolios WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
        [userId]
      )
      
      const portfolios = result.rows
      await this.setCache(cacheKey, portfolios, 300) // Cache for 5 minutes
      
      return portfolios
    } catch (error) {
      console.error('Error getting portfolios:', error)
      return []
    }
  }

  async getPortfolioPositions(portfolioId: number): Promise<Position[]> {
    const cacheKey = this.getCacheKey('positions', portfolioId)
    const cached = await this.getFromCache<Position[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.pool.query(
        'SELECT * FROM positions WHERE portfolio_id = $1 ORDER BY market_value DESC',
        [portfolioId]
      )
      
      const positions = result.rows
      await this.setCache(cacheKey, positions, 60) // Cache for 1 minute (more frequent updates)
      
      return positions
    } catch (error) {
      console.error('Error getting positions:', error)
      return []
    }
  }

  async createPortfolio(portfolioData: Partial<Portfolio>): Promise<Portfolio | null> {
    try {
      const result = await this.pool.query(
        `INSERT INTO portfolios (user_id, name, description, initial_capital, current_value, cash_balance) 
         VALUES ($1, $2, $3, $4, $4, $4) 
         RETURNING *`,
        [
          portfolioData.user_id,
          portfolioData.name,
          portfolioData.description || '',
          portfolioData.initial_capital
        ]
      )
      
      // Clear cache for user portfolios
      const cacheKey = this.getCacheKey('portfolios', portfolioData.user_id!)
      await this.redis.del(cacheKey)
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating portfolio:', error)
      return null
    }
  }

  // ============================================================================
  // TRADING & ORDERS
  // ============================================================================

  async getPortfolioTrades(portfolioId: number, limit: number = 100): Promise<Trade[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM trades WHERE portfolio_id = $1 ORDER BY executed_at DESC LIMIT $2',
        [portfolioId, limit]
      )
      
      return result.rows
    } catch (error) {
      console.error('Error getting trades:', error)
      return []
    }
  }

  async recordTrade(tradeData: Partial<Trade>): Promise<Trade | null> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Insert trade
      const tradeResult = await client.query(
        `INSERT INTO trades (portfolio_id, symbol, side, quantity, price, commission, executed_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          tradeData.portfolio_id,
          tradeData.symbol,
          tradeData.side,
          tradeData.quantity,
          tradeData.price,
          tradeData.commission || 0,
          tradeData.executed_at || new Date()
        ]
      )
      
      const trade = tradeResult.rows[0]
      
      // Update or create position
      await this.updatePosition(client, trade)
      
      // Update portfolio cash balance
      await this.updatePortfolioCash(client, trade)
      
      await client.query('COMMIT')
      
      // Clear relevant caches
      await this.redis.del(this.getCacheKey('positions', tradeData.portfolio_id!))
      await this.redis.del(this.getCacheKey('portfolios', '*')) // Clear all portfolio caches
      
      return trade
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error recording trade:', error)
      return null
    } finally {
      client.release()
    }
  }

  private async updatePosition(client: PoolClient, trade: Trade): Promise<void> {
    // Complex position update logic here
    // This would handle average price calculations, quantity updates, etc.
    const result = await client.query(
      'SELECT * FROM positions WHERE portfolio_id = $1 AND symbol = $2',
      [trade.portfolio_id, trade.symbol]
    )
    
    if (result.rows.length > 0) {
      // Update existing position
      const position = result.rows[0]
      const newQuantity = trade.side === 'buy' 
        ? position.quantity + trade.quantity
        : position.quantity - trade.quantity
      
      await client.query(
        'UPDATE positions SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQuantity, position.id]
      )
    } else {
      // Create new position
      await client.query(
        `INSERT INTO positions (portfolio_id, symbol, quantity, avg_price, opened_at) 
         VALUES ($1, $2, $3, $4, $5)`,
        [trade.portfolio_id, trade.symbol, trade.quantity, trade.price, trade.executed_at]
      )
    }
  }

  private async updatePortfolioCash(client: PoolClient, trade: Trade): Promise<void> {
    const cashChange = trade.side === 'buy' 
      ? -(trade.quantity * trade.price + trade.commission)
      : (trade.quantity * trade.price - trade.commission)
    
    await client.query(
      'UPDATE portfolios SET cash_balance = cash_balance + $1, updated_at = NOW() WHERE id = $2',
      [cashChange, trade.portfolio_id]
    )
  }

  // ============================================================================
  // MARKET DATA
  // ============================================================================

  async getLatestMarketData(symbol: string): Promise<MarketData | null> {
    const cacheKey = this.getCacheKey('market_data', symbol)
    const cached = await this.getFromCache<MarketData>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.pool.query(
        'SELECT * FROM market_data WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1',
        [symbol.toUpperCase()]
      )
      
      const data = result.rows[0] || null
      if (data) {
        await this.setCache(cacheKey, data, 30) // Cache for 30 seconds
      }
      
      return data
    } catch (error) {
      console.error('Error getting market data:', error)
      return null
    }
  }

  async bulkInsertMarketData(data: MarketData[]): Promise<boolean> {
    if (!data.length) return true

    try {
      const values = data.map((d, i) => 
        `($${i*8+1}, $${i*8+2}, $${i*8+3}, $${i*8+4}, $${i*8+5}, $${i*8+6}, $${i*8+7}, $${i*8+8})`
      ).join(', ')

      const params = data.flatMap(d => [
        d.symbol, d.timestamp, d.open, d.high, d.low, d.close, d.volume, d.data_source
      ])

      await this.pool.query(
        `INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume, data_source) 
         VALUES ${values} 
         ON CONFLICT (symbol, timestamp, data_source) DO UPDATE SET
         open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low, 
         close = EXCLUDED.close, volume = EXCLUDED.volume`,
        params
      )

      // Clear market data cache
      data.forEach(d => {
        this.redis.del(this.getCacheKey('market_data', d.symbol))
      })

      return true
    } catch (error) {
      console.error('Error bulk inserting market data:', error)
      return false
    }
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  async logAction(userId: number, action: string, details: any = {}): Promise<void> {
    try {
      await this.pool.query(
        'INSERT INTO audit_logs (user_id, action, details, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, action, details]
      )
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================

  async getPerformanceMetrics(): Promise<Record<string, any>> {
    try {
      const stats = await Promise.all([
        this.pool.query('SELECT COUNT(*) as total_users FROM users WHERE is_active = true'),
        this.pool.query('SELECT COUNT(*) as total_portfolios FROM portfolios WHERE is_active = true'),
        this.pool.query('SELECT COUNT(*) as total_trades FROM trades WHERE created_at > NOW() - INTERVAL \'24 hours\''),
        this.pool.query('SELECT COUNT(*) as total_positions FROM positions')
      ])

      return {
        totalUsers: parseInt(stats[0].rows[0].total_users),
        totalPortfolios: parseInt(stats[1].rows[0].total_portfolios),
        tradesLast24h: parseInt(stats[2].rows[0].total_trades),
        totalPositions: parseInt(stats[3].rows[0].total_positions),
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error getting performance metrics:', error)
      return {}
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const db = new NexusDatabase()

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database connections...')
  await db.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down database connections...')
  await db.disconnect()
  process.exit(0)
})

export default db
