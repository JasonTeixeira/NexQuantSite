/**
 * 🗄️ PRODUCTION DATABASE CONNECTION
 * Enhanced PostgreSQL connection with advanced pooling, monitoring and metrics
 */

import { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';
import { reportError, withPerformanceTracking } from '../monitoring';
import { createHash } from 'crypto';

// Connection configuration types
export interface ConnectionConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

export interface PoolConfig extends ConnectionConfig {
  // Connection pool configuration
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxUses?: number;
  allowExitOnIdle?: boolean;
  
  // Query configuration
  statement_timeout?: number;
  query_timeout?: number;
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
}

// Parse configuration from environment variables
const getPoolConfig = (): PoolConfig => {
  return {
    // Connection configuration
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true' } 
      : false,
    
    // Pool configuration
    max: parseInt(process.env.DB_POOL_MAX || '20'),           // Maximum connections
    min: parseInt(process.env.DB_POOL_MIN || '5'),            // Minimum connections
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),        // 30 seconds
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),  // 10 seconds
    maxUses: parseInt(process.env.DB_MAX_USES || '7500'),              // Max uses per connection
    allowExitOnIdle: false,
    
    // Query configuration
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),    // 30 seconds
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),          // 30 seconds
    
    // Retry configuration
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
  };
};

// Connection metrics
export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  connectionRate: number;
  queryRate: number;
  errorRate: number;
  averageQueryTime: number;
  slowQueries: number;
}

// Connection pool class with enhanced monitoring
export class PostgresConnectionPool {
  private pool: Pool;
  private config: PoolConfig;
  private metrics: ConnectionMetrics;
  private lastMetricsUpdate: number;
  private queryHistory: { time: number; duration: number }[] = [];
  private connectionAttempts: number[] = [];
  private errors: number[] = [];
  
  constructor(config: PoolConfig = getPoolConfig()) {
    this.config = config;
    this.pool = new Pool(config);
    this.setupEventHandlers();
    
    // Initialize metrics
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      connectionRate: 0,
      queryRate: 0,
      errorRate: 0,
      averageQueryTime: 0,
      slowQueries: 0,
    };
    
    this.lastMetricsUpdate = Date.now();
    
    // Setup periodic metrics calculation
    setInterval(() => this.calculateMetrics(), 60000);
  }
  
  /**
   * Set up event handlers for pool events
   */
  private setupEventHandlers(): void {
    // New client connection
    this.pool.on('connect', (client: PoolClient) => {
      this.connectionAttempts.push(Date.now());
      this.metrics.totalConnections++;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 New database client connected');
      }
    });
    
    // Client acquired from pool
    this.pool.on('acquire', (client: PoolClient) => {
      this.metrics.activeConnections++;
      this.metrics.idleConnections--;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Database client acquired from pool');
      }
    });
    
    // Client released back to pool - note that there's no built-in 'release' event
    // We'll need to update our metrics differently
    // Track when clients are acquired and removed instead
    
    // Pool error
    this.pool.on('error', (err: Error) => {
      this.errors.push(Date.now());
      
      reportError({
        component: 'PostgresConnectionPool',
        action: 'poolError',
        error: err,
        context: {
          totalConnections: this.metrics.totalConnections,
          activeConnections: this.metrics.activeConnections,
          idleConnections: this.metrics.idleConnections,
          waitingClients: this.metrics.waitingClients,
        },
        severity: 'high',
      });
      
      console.error('💥 Unexpected database pool error:', err);
    });
    
    // Client removed from pool
    this.pool.on('remove', (client: PoolClient) => {
      this.metrics.totalConnections--;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Database client removed from pool');
      }
    });
  }
  
  /**
   * Calculate connection pool metrics
   */
  private calculateMetrics(): void {
    const now = Date.now();
    const timeWindow = now - this.lastMetricsUpdate;
    
    // Update connection rate (connections per minute)
    const recentConnections = this.connectionAttempts.filter(time => time > now - 60000).length;
    this.metrics.connectionRate = (recentConnections / 60) * 1000;
    
    // Update query rate (queries per minute)
    const recentQueries = this.queryHistory.filter(query => query.time > now - 60000).length;
    this.metrics.queryRate = (recentQueries / 60) * 1000;
    
    // Update error rate (errors per minute)
    const recentErrors = this.errors.filter(time => time > now - 60000).length;
    this.metrics.errorRate = (recentErrors / 60) * 1000;
    
    // Update average query time
    const recentQueryHistory = this.queryHistory.filter(query => query.time > now - 60000);
    if (recentQueryHistory.length > 0) {
      const totalDuration = recentQueryHistory.reduce((sum, query) => sum + query.duration, 0);
      this.metrics.averageQueryTime = totalDuration / recentQueryHistory.length;
    }
    
    // Update slow queries count
    this.metrics.slowQueries = this.queryHistory.filter(query => 
      query.time > now - 60000 && query.duration > 1000
    ).length;
    
    // Clean up old data
    this.connectionAttempts = this.connectionAttempts.filter(time => time > now - 60000);
    this.queryHistory = this.queryHistory.filter(query => query.time > now - 60000);
    this.errors = this.errors.filter(time => time > now - 60000);
    
    // Update pool stats
    this.metrics.idleConnections = this.pool.idleCount;
    this.metrics.waitingClients = this.pool.waitingCount;
    this.metrics.activeConnections = this.pool.totalCount - this.pool.idleCount;
    
    this.lastMetricsUpdate = now;
  }
  
  /**
   * Get the current connection metrics
   */
  public getMetrics(): ConnectionMetrics {
    this.calculateMetrics();
    return { ...this.metrics };
  }
  
  /**
   * Check database health
   */
  public async checkHealth(): Promise<{
    healthy: boolean;
    latency?: number;
    connections?: {
      total: number;
      active: number;
      idle: number;
      waiting: number;
    };
    error?: string;
  }> {
    return withPerformanceTracking(
      async () => {
        const startTime = Date.now();
        
        try {
          const client = await this.pool.connect();
          const result = await client.query('SELECT NOW() as current_time, version() as db_version');
          const latency = Date.now() - startTime;
          
          // Get pool stats
          const poolStats = {
            total: this.pool.totalCount,
            active: this.pool.totalCount - this.pool.idleCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount
          };
          
          client.release();
          
          return {
            healthy: true,
            latency,
            connections: poolStats
          };
        } catch (error) {
          // Report the error
          reportError({
            component: 'PostgresConnectionPool',
            action: 'checkHealth',
            error,
            severity: 'high',
          });
          
          return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown database error'
          };
        }
      },
      'db.checkHealth',
      {}
    );
  }
  
  /**
   * Execute a query with retries and monitoring
   */
  public async query<T = any>(
    text: string,
    params?: any[],
    options?: {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
      logQuery?: boolean;
      client?: PoolClient;
    }
  ): Promise<QueryResult<T>> {
    return withPerformanceTracking(
      async () => {
        const startTime = Date.now();
        const queryId = createHash('md5').update(text).digest('hex').substring(0, 8);
        
        // Set default options
        const retries = options?.retries ?? this.config.maxRetries ?? 3;
        const retryDelay = options?.retryDelay ?? this.config.retryDelay ?? 1000;
        const timeout = options?.timeout ?? this.config.query_timeout ?? 30000;
        
        // Log query in development
        if (options?.logQuery !== false && process.env.NODE_ENV === 'development') {
          console.log(`🔍 Query ${queryId}:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
          if (params) console.log('📝 Parameters:', params);
        }
        
        let attempt = 0;
        let lastError: any;
        
        // Retry loop
        while (attempt <= retries) {
          attempt++;
          
          try {
            // Use provided client or get one from pool
            const client = options?.client ?? this.pool;
            
            // Execute query with timeout
            const result = await Promise.race([
              client.query(text, params),
              new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Query timeout after ${timeout}ms`)), timeout);
              })
            ]) as PgQueryResult;
            
            const executionTime = Date.now() - startTime;
            
            // Record query for metrics
            this.queryHistory.push({
              time: Date.now(),
              duration: executionTime
            });
            
            // Log slow queries
            if (executionTime > 1000) {
              console.warn(`⚠️ Slow query detected (${executionTime}ms) - Query ${queryId}`);
              
              reportError({
                component: 'PostgresConnectionPool',
                action: 'slowQuery',
                error: new Error(`Slow query (${executionTime}ms)`),
                context: {
                  queryId,
                  executionTime,
                  query: text.substring(0, 200),
                  params: params ? JSON.stringify(params).substring(0, 200) : undefined
                },
                severity: 'low'
              });
            }
            
            return {
              rows: result.rows,
              rowCount: result.rowCount,
              fields: result.fields,
              command: result.command,
              oid: result.oid,
              executionTime
            };
          } catch (error) {
            lastError = error;
            
            // Check if error is retryable
            const isRetryable = this.isRetryableError(error);
            
            if (!isRetryable || attempt > retries) {
              break;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
        }
        
        // If we reached here, all retries failed
        const executionTime = Date.now() - startTime;
        
        reportError({
          component: 'PostgresConnectionPool',
          action: 'queryFailed',
          error: lastError,
          context: {
            queryId,
            executionTime,
            attempts: attempt,
            query: text.substring(0, 200),
            params: params ? JSON.stringify(params).substring(0, 200) : undefined
          },
          severity: 'medium'
        });
        
        console.error(`💥 Query failed after ${executionTime}ms and ${attempt} attempts - Query ${queryId}:`, lastError);
        throw lastError;
      },
      'db.query',
      { query: text.substring(0, 50) }
    );
  }
  
  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    // Connection-related errors are retryable
    const retryableErrors = [
      'connection terminated',
      'connection reset',
      'Connection terminated',
      'Connection reset',
      'timeout',
      'Timeout',
      'Connection timed out',
      'connection timed out',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EHOSTUNREACH'
    ];
    
    const errorMessage = error.message || String(error);
    
    return retryableErrors.some(msg => errorMessage.includes(msg));
  }
  
  /**
   * Execute a transaction
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    return withPerformanceTracking(
      async () => {
        const client = await this.pool.connect();
        
        try {
          await client.query('BEGIN');
          const result = await callback(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          
          reportError({
            component: 'PostgresConnectionPool',
            action: 'transactionFailed',
            error,
            severity: 'medium'
          });
          
          throw error;
        } finally {
          client.release();
        }
      },
      'db.transaction',
      {}
    );
  }
  
  /**
   * Batch insert helper
   */
  public async batchInsert<T extends Record<string, any>>(
    tableName: string,
    records: T[],
    options?: {
      onConflict?: string;
      returning?: string;
      chunkSize?: number;
    }
  ): Promise<QueryResult> {
    return withPerformanceTracking(
      async () => {
        if (records.length === 0) {
          return {
            rows: [],
            rowCount: 0,
            command: 'INSERT',
            fields: [],
            oid: 0,
            executionTime: 0
          };
        }
        
        const chunkSize = options?.chunkSize || 1000;
        const keys = Object.keys(records[0]);
        let totalResult: QueryResult = {
          rows: [],
          rowCount: 0,
          command: 'INSERT',
          fields: [],
          oid: 0,
          executionTime: 0
        };
        
        // Process in chunks to avoid query parameter limits
        for (let i = 0; i < records.length; i += chunkSize) {
          const chunk = records.slice(i, i + chunkSize);
          
          // Create parameter placeholders
          const values: any[] = [];
          const placeholders: string[] = [];
          
          chunk.forEach((record, recordIndex) => {
            const rowPlaceholders: string[] = [];
            keys.forEach((key, keyIndex) => {
              const paramIndex = recordIndex * keys.length + keyIndex + 1;
              rowPlaceholders.push(`$${paramIndex}`);
              values.push(record[key]);
            });
            placeholders.push(`(${rowPlaceholders.join(', ')})`);
          });
          
          // Build SQL query
          let sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES ${placeholders.join(', ')}`;
          
          if (options?.onConflict) {
            sql += ` ${options.onConflict}`;
          }
          
          if (options?.returning) {
            sql += ` RETURNING ${options.returning}`;
          }
          
          // Execute query
          const result = await this.query(sql, values);
          
          // Combine results
          totalResult.rows = [...totalResult.rows, ...result.rows];
          totalResult.rowCount += result.rowCount;
          totalResult.executionTime += result.executionTime;
          
          // Use the fields and oid from the first result
          if (i === 0) {
            totalResult.fields = result.fields;
            totalResult.oid = result.oid;
            totalResult.command = result.command;
          }
        }
        
        return totalResult;
      },
      'db.batchInsert',
      { table: tableName, count: records.length }
    );
  }
  
  /**
   * Full-text search helper
   */
  public async fullTextSearch(
    searchTerm: string,
    tableName: string,
    searchColumns: string[],
    options?: {
      limit?: number | string;
      offset?: number | string;
      orderBy?: string;
      additionalFilters?: string;
      additionalParams?: any[];
    }
  ): Promise<QueryResult> {
    return withPerformanceTracking(
      async () => {
        const searchQuery = searchTerm
          .split(' ')
          .filter(term => term.length > 2)
          .join(' & ');
        
        if (!searchQuery) {
          return {
            rows: [],
            rowCount: 0,
            command: 'SELECT',
            fields: [],
            oid: 0,
            executionTime: 0
          };
        }
        
        const searchExpression = searchColumns
          .map(col => `to_tsvector('english', ${col})`)
          .join(' || ');
        
        let sql = `
          SELECT *, 
                 ts_rank_cd(${searchExpression}, plainto_tsquery('english', $1)) as search_rank
          FROM ${tableName}
          WHERE ${searchExpression} @@ plainto_tsquery('english', $1)
        `;
        
        // Make sure all params are strings
        const params: string[] = [searchTerm];
        let paramIndex = 2;
        
        if (options?.additionalFilters) {
          sql += ` AND ${options.additionalFilters}`;
          if (options.additionalParams) {
            // Convert each parameter to string
            params.push(...options.additionalParams.map(p => String(p)));
            paramIndex += options.additionalParams.length;
          }
        }
        
        sql += ` ORDER BY ${options?.orderBy || 'search_rank DESC'}`;
        
        if (options?.limit !== undefined) {
          sql += ` LIMIT $${paramIndex}`;
          // Convert limit to string (fixing TypeScript error)
          params.push(typeof options.limit === 'number' ? options.limit.toString() : options.limit);
          paramIndex++;
        }
        
        if (options?.offset !== undefined) {
          sql += ` OFFSET $${paramIndex}`;
          // Convert offset to string (fixing TypeScript error)
          params.push(typeof options.offset === 'number' ? options.offset.toString() : options.offset);
        }
        
        return this.query(sql, params);
      },
      'db.fullTextSearch',
      { table: tableName, term: searchTerm.substring(0, 20) }
    );
  }
  
  /**
   * Pagination helper
   */
  public async paginate(
    baseQuery: string,
    countQuery: string,
    page: number | string = 1,
    limit: number | string = 10,
    params?: any[]
  ): Promise<{
    rows: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return withPerformanceTracking(
      async () => {
        // Convert parameters to numbers for calculation
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
        const offsetNum = (pageNum - 1) * limitNum;
        
        // Get total count - convert params to strings
        const countParams = params ? params.map(p => String(p)) : undefined;
        const countResult = await this.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0]?.count || '0');
        
        // Get paginated results
        const dataQuery = `${baseQuery} LIMIT $${(params?.length || 0) + 1} OFFSET $${(params?.length || 0) + 2}`;
        
        // Make sure all params are strings for PostgreSQL
        const paramsCopy = params ? [...params].map(p => String(p)) : [];
        
        // Explicitly convert limit and offset to strings (fixing TypeScript error)
        const limitStr = limitNum.toString();
        const offsetStr = offsetNum.toString();
        
        const dataParams = [...paramsCopy, limitStr, offsetStr];
        
        const dataResult = await this.query(dataQuery, dataParams);
        
        const pages = Math.ceil(total / limitNum);
        
        return {
          rows: dataResult.rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages,
            hasNext: pageNum < pages,
            hasPrev: pageNum > 1
          }
        };
      },
      'db.paginate',
      { page, limit }
    );
  }
  
  /**
   * Database migration helper
   */
  public async runMigration(migrationSql: string): Promise<void> {
    return withPerformanceTracking(
      async () => {
        try {
          console.log('🚀 Running database migration...');
          await this.query(migrationSql);
          console.log('✅ Migration completed successfully');
        } catch (error) {
          console.error('💥 Migration failed:', error);
          
          reportError({
            component: 'PostgresConnectionPool',
            action: 'runMigration',
            error,
            severity: 'critical'
          });
          
          throw error;
        }
      },
      'db.runMigration',
      {}
    );
  }
  
  /**
   * Graceful shutdown
   */
  public async close(): Promise<void> {
    return withPerformanceTracking(
      async () => {
        try {
          await this.pool.end();
          console.log('🔒 Database connections closed gracefully');
        } catch (error) {
          console.error('💥 Error closing database connections:', error);
          
          reportError({
            component: 'PostgresConnectionPool',
            action: 'close',
            error,
            severity: 'high'
          });
          
          throw error;
        }
      },
      'db.close',
      {}
    );
  }
}

// Query result interface
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  fields: any[];
  oid: number;
  executionTime: number;
}

// Create a singleton instance
const postgresPool = new PostgresConnectionPool();

// Export methods and types
export const query = postgresPool.query.bind(postgresPool);
export const transaction = postgresPool.transaction.bind(postgresPool);
export const batchInsert = postgresPool.batchInsert.bind(postgresPool);
export const fullTextSearch = postgresPool.fullTextSearch.bind(postgresPool);
export const paginate = postgresPool.paginate.bind(postgresPool);
export const runMigration = postgresPool.runMigration.bind(postgresPool);
export const checkDatabaseHealth = postgresPool.checkHealth.bind(postgresPool);
export const closeDatabaseConnections = postgresPool.close.bind(postgresPool);
export const getMetrics = postgresPool.getMetrics.bind(postgresPool);

// Export the pool for direct access when needed
export { postgresPool as pool };

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
  getMetrics,
  pool: postgresPool
};
