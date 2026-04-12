/**
 * 🗄️ DATABASE ABSTRACTION LAYER
 * Provides unified interface for database operations across environments
 */

import * as postgres from './postgres-connection';
import * as sqlite from './sqlite-connection';
import * as redisReal from './redis-connection';
import * as redisMock from './sqlite-redis-mock';
import { reportError } from '../monitoring';

// Determine which implementation to use based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const useLocalDb = process.env.USE_LOCAL_DB === 'true' || (isDevelopment && !process.env.DATABASE_URL);

// Set up appropriate database and cache connections
export const db = useLocalDb ? sqlite : postgres;
export const redis = useLocalDb ? redisMock.redis : redisReal.redis;
export const { getAndParse, setWithExpiry, deleteKey } = useLocalDb ? redisMock : redisReal;

/**
 * Database health check function
 */
export const healthCheck = async (): Promise<{ 
  postgres: boolean; 
  redis: boolean;
  mode: string;
  connectionStats?: any;
  metrics?: any;
}> => {
  try {
    // Check database health
    const dbHealth = useLocalDb 
      ? await sqlite.checkDatabaseHealth()
      : await postgres.checkDatabaseHealth();
    
    // Check Redis health
    const redisHealth = useLocalDb 
      ? await redisMock.checkRedisHealth()
      : await redisReal.checkRedisHealth();
    
    // Get connection metrics in production
    const metrics = !useLocalDb ? postgres.getMetrics() : undefined;
    
    return {
      postgres: dbHealth.healthy,
      redis: redisHealth.connected,
      mode: useLocalDb ? 'local' : 'production',
      connectionStats: dbHealth.connections,
      metrics
    };
  } catch (error) {
    reportError({
      component: 'Database',
      action: 'healthCheck',
      error,
      severity: 'high'
    });
    
    console.error('Health check error:', error);
    return {
      postgres: false,
      redis: false,
      mode: useLocalDb ? 'local' : 'production'
    };
  }
}

/**
 * Get database performance metrics
 */
export const getPerformanceMetrics = async () => {
  if (useLocalDb) {
    // Mock metrics for local development
    return {
      active_connections: 1,
      cache_hit_rate: 0.95,
      avg_query_time: 5,
      memory_usage: 0.25
    };
  } else {
    // Get actual metrics from the connection pool
    const metrics = postgres.getMetrics();
    
    return {
      active_connections: metrics.activeConnections,
      idle_connections: metrics.idleConnections,
      total_connections: metrics.totalConnections,
      waiting_clients: metrics.waitingClients,
      connection_rate: metrics.connectionRate,
      query_rate: metrics.queryRate,
      error_rate: metrics.errorRate,
      avg_query_time: metrics.averageQueryTime,
      slow_queries: metrics.slowQueries
    };
  }
}

/**
 * Get current database mode
 */
export const getDatabaseMode = (): string => {
  return useLocalDb ? 'SQLite (Local Development)' : 'PostgreSQL (Production)';
}

/**
 * Get current cache mode
 */
export const getCacheMode = (): string => {
  return useLocalDb ? 'In-Memory (Local Development)' : 'Redis (Production)';
}

/**
 * Graceful shutdown
 */
export const shutdown = async (): Promise<void> => {
  try {
    if (useLocalDb) {
      await sqlite.closeDatabaseConnections();
      await redisMock.closeRedis();
    } else {
      await postgres.closeDatabaseConnections();
      await redisReal.closeRedis();
    }
    console.log('🔒 All database connections closed gracefully');
  } catch (error) {
    reportError({
      component: 'Database',
      action: 'shutdown',
      error,
      severity: 'high'
    });
    
    console.error('Error during database shutdown:', error);
  }
}

// Add shutdown hooks
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down databases...');
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down databases...');
  await shutdown();
  process.exit(0);
});

// Export database interfaces
export default {
  query: db.query,
  transaction: db.transaction,
  batchInsert: db.batchInsert,
  fullTextSearch: db.fullTextSearch,
  paginate: db.paginate,
  healthCheck,
  getPerformanceMetrics,
  getDatabaseMode,
  getCacheMode,
  shutdown,
  redis
}
