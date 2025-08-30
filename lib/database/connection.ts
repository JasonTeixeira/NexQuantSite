// 🗄️ PRODUCTION DATABASE CONNECTION
// High-performance PostgreSQL connection with pooling and monitoring

import { Pool, PoolClient } from 'pg'
import { createHash } from 'crypto'
import * as mockDB from './mock-connection'

// Connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pooling for optimal performance
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections
  min: parseInt(process.env.DB_POOL_MIN || '5'),  // Minimum connections
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'), // 10 seconds
  maxUses: parseInt(process.env.DB_MAX_USES || '7500'), // Max uses per connection
  allowExitOnIdle: false,
  // Performance optimization
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30 seconds
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30 seconds
}

// Create the connection pool
const pool = new Pool(dbConfig)

// Pool event handlers for monitoring
pool.on('connect', (client: PoolClient) => {
  console.log('📡 New database client connected')
})

pool.on('acquire', (client: PoolClient) => {
  console.log('🔄 Database client acquired from pool')
})

pool.on('error', (err: Error) => {
  console.error('💥 Unexpected database pool error:', err)
  // In production, you might want to send this to your error tracking service
})

pool.on('remove', (client: PoolClient) => {
  console.log('🗑️ Database client removed from pool')
})

// Connection health check
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean
  latency?: number
  connections?: { total: number; idle: number; waiting: number }
  error?: string
}> => {
  const startTime = Date.now()
  
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as current_time, version() as db_version')
    const latency = Date.now() - startTime
    
    // Get pool stats
    const poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    }
    
    client.release()
    
    return {
      healthy: true,
      latency,
      connections: poolStats
    }
  } catch (error) {
    // Fall back to mock database in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Health check falling back to mock database')
      return await mockDB.checkDatabaseHealth()
    }
    
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

// Query interface with monitoring
export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
  command: string
  fields: any[]
  oid: number
  executionTime: number
}

// Enhanced query function with performance monitoring
export const query = async <T = any>(
  text: string, 
  params?: any[], 
  options?: { timeout?: number; logQuery?: boolean }
): Promise<QueryResult<T>> => {
  const startTime = Date.now()
  const queryId = createHash('md5').update(text).digest('hex').substring(0, 8)
  
  try {
    if (options?.logQuery !== false && process.env.NODE_ENV === 'development') {
      console.log(`🔍 Query ${queryId}:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''))
      if (params) console.log('📝 Parameters:', params)
    }
    
    const result = await pool.query(text, params)
    const executionTime = Date.now() - startTime
    
    if (executionTime > 1000) {
      console.warn(`⚠️ Slow query detected (${executionTime}ms) - Query ${queryId}`)
    }
    
    return {
      ...result,
      executionTime
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error(`💥 Query failed after ${executionTime}ms - Query ${queryId}:`, error)
    
    // Fall back to mock database in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Falling back to mock database')
      return await mockDB.query(text, params)
    }
    
    throw error
  }
}

// Transaction support
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Batch insert helper
export const batchInsert = async <T extends Record<string, any>>(
  tableName: string,
  records: T[],
  options?: { onConflict?: string; returning?: string }
): Promise<QueryResult> => {
  if (records.length === 0) {
    return { rows: [], rowCount: 0, command: 'INSERT', fields: [], oid: 0, executionTime: 0 }
  }
  
  const keys = Object.keys(records[0])
  const columns = keys.join(', ')
  
  // Create parameter placeholders
  const values: any[] = []
  const placeholders: string[] = []
  
  records.forEach((record, recordIndex) => {
    const rowPlaceholders: string[] = []
    keys.forEach((key, keyIndex) => {
      const paramIndex = recordIndex * keys.length + keyIndex + 1
      rowPlaceholders.push(`$${paramIndex}`)
      values.push(record[key])
    })
    placeholders.push(`(${rowPlaceholders.join(', ')})`)
  })
  
  let sql = `INSERT INTO ${tableName} (${columns}) VALUES ${placeholders.join(', ')}`
  
  if (options?.onConflict) {
    sql += ` ${options.onConflict}`
  }
  
  if (options?.returning) {
    sql += ` RETURNING ${options.returning}`
  }
  
  return query(sql, values)
}

// Search helper with full-text search support
export const fullTextSearch = async (
  searchTerm: string,
  tableName: string,
  searchColumns: string[],
  options?: {
    limit?: number
    offset?: number
    orderBy?: string
    additionalFilters?: string
    additionalParams?: any[]
  }
): Promise<QueryResult> => {
  const searchQuery = searchTerm
    .split(' ')
    .filter(term => term.length > 2)
    .join(' & ')
  
  if (!searchQuery) {
    return { rows: [], rowCount: 0, command: 'SELECT', fields: [], oid: 0, executionTime: 0 }
  }
  
  const searchExpression = searchColumns
    .map(col => `to_tsvector('english', ${col})`)
    .join(' || ')
  
  let sql = `
    SELECT *, 
           ts_rank_cd(${searchExpression}, plainto_tsquery('english', $1)) as search_rank
    FROM ${tableName}
    WHERE ${searchExpression} @@ plainto_tsquery('english', $1)
  `
  
  const params = [searchTerm]
  let paramIndex = 2
  
  if (options?.additionalFilters) {
    sql += ` AND ${options.additionalFilters}`
    if (options.additionalParams) {
      params.push(...options.additionalParams)
      paramIndex += options.additionalParams.length
    }
  }
  
  sql += ` ORDER BY ${options?.orderBy || 'search_rank DESC'}`
  
  if (options?.limit) {
    sql += ` LIMIT $${paramIndex}`
    params.push(options.limit)
    paramIndex++
  }
  
  if (options?.offset) {
    sql += ` OFFSET $${paramIndex}`
    params.push(options.offset)
  }
  
  return query(sql, params)
}

// Pagination helper
export const paginate = async (
  baseQuery: string,
  countQuery: string,
  page: number = 1,
  limit: number = 10,
  params?: any[]
): Promise<{
  rows: any[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}> => {
  const offset = (page - 1) * limit
  
  // Get total count
  const countResult = await query(countQuery, params)
  const total = parseInt(countResult.rows[0]?.count || '0')
  
  // Get paginated results
  const dataQuery = `${baseQuery} LIMIT $${(params?.length || 0) + 1} OFFSET $${(params?.length || 0) + 2}`
  const dataParams = [...(params || []), limit, offset]
  const dataResult = await query(dataQuery, dataParams)
  
  const pages = Math.ceil(total / limit)
  
  return {
    rows: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  }
}

// Database migration helper
export const runMigration = async (migrationSql: string): Promise<void> => {
  try {
    console.log('🚀 Running database migration...')
    await query(migrationSql)
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

// Graceful shutdown
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    await pool.end()
    console.log('🔒 Database connections closed gracefully')
  } catch (error) {
    console.error('💥 Error closing database connections:', error)
  }
}

// Export the pool for direct access when needed
export { pool }

// Default export
export default {
  query,
  transaction,
  batchInsert,
  fullTextSearch,
  paginate,
  runMigration,
  checkDatabaseHealth,
  closeDatabaseConnections,
  pool
}
