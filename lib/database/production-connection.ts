/**
 * 🔐 SECURE PRODUCTION DATABASE CONNECTION
 * Enterprise-grade PostgreSQL connection with comprehensive security
 */

import { Pool, PoolClient, PoolConfig } from 'pg'
import { getDatabaseURL } from '@/lib/config/secure-environment'

// ===== SECURE CONNECTION CONFIGURATION =====

/**
 * Production database configuration with security enforcement
 */
const getSecurePoolConfig = (): PoolConfig => {
  const databaseUrl = getDatabaseURL()
  
  // Parse database URL for connection details
  const url = new URL(databaseUrl)
  
  return {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading slash
    user: url.username,
    password: url.password,
    
    // Security settings
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_SSL_CA,
      cert: process.env.DATABASE_SSL_CERT,
      key: process.env.DATABASE_SSL_KEY
    } : false,
    
    // Connection pool settings
    max: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
    min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
    
    // Timeouts
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    query_timeout: 30000,
    statement_timeout: 30000,
    
    // Connection validation
    allowExitOnIdle: true,
    
    // Application name for monitoring
    application_name: 'nexural-trading-platform'
  }
}

// ===== CONNECTION POOL =====

class SecureDatabase {
  private static instance: SecureDatabase
  private pool: Pool
  private isConnected: boolean = false
  
  private constructor() {
    const config = getSecurePoolConfig()
    this.pool = new Pool(config)
    this.setupEventHandlers()
  }

  static getInstance(): SecureDatabase {
    if (!SecureDatabase.instance) {
      SecureDatabase.instance = new SecureDatabase()
    }
    return SecureDatabase.instance
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client) => {
      console.log('🔗 Database client connected')
      this.isConnected = true
    })

    this.pool.on('error', (error) => {
      console.error('💥 Database pool error:', error)
      this.isConnected = false
    })

    this.pool.on('remove', () => {
      console.log('🔌 Database client removed')
    })
  }

  /**
   * Execute query with security logging
   */
  async query<T = any>(text: string, params?: any[]): Promise<{
    rows: T[]
    rowCount: number
    command: string
  }> {
    const start = Date.now()
    
    try {
      // Log query execution (without sensitive parameters in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Executing query:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))
      }
      
      const result = await this.pool.query(text, params)
      const duration = Date.now() - start
      
      // Log performance
      if (duration > 1000) {
        console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 50))
      }
      
      return result
    } catch (error) {
      console.error('💥 Database query error:', error)
      
      // Don't expose SQL details in production
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database operation failed')
      } else {
        throw error
      }
    }
  }

  /**
   * Execute transaction with automatic rollback
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('🔄 Transaction rolled back due to error:', error)
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Get connection pool status
   */
  getPoolStatus(): {
    totalCount: number
    idleCount: number
    waitingCount: number
    isConnected: boolean
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{
    connected: boolean
    responseTime: number
    poolStatus: any
    error?: string
  }> {
    const start = Date.now()
    
    try {
      await this.query('SELECT 1 as health_check')
      
      return {
        connected: true,
        responseTime: Date.now() - start,
        poolStatus: this.getPoolStatus()
      }
    } catch (error: any) {
      return {
        connected: false,
        responseTime: Date.now() - start,
        poolStatus: this.getPoolStatus(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Connection failed'
      }
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      await this.pool.end()
      console.log('✅ Database pool closed gracefully')
    } catch (error) {
      console.error('❌ Error closing database pool:', error)
    }
  }
}

// ===== EXPORTS =====

export const database = SecureDatabase.getInstance()

// Helper functions for common operations
export const query = <T = any>(text: string, params?: any[]) => database.query<T>(text, params)
export const transaction = <T>(callback: (client: PoolClient) => Promise<T>) => database.transaction(callback)

// Health and monitoring
export const getDatabaseHealth = () => database.healthCheck()
export const getPoolStatus = () => database.getPoolStatus()

export default database
