/**
 * 🔴 SECURE REDIS CONNECTION - Production Ready
 * Enterprise-grade Redis configuration with security and monitoring
 */

import Redis from 'ioredis'

// ===== SECURE CONFIGURATION =====

const REDIS_URL = process.env.REDIS_URL
const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')
const REDIS_PASSWORD = process.env.REDIS_PASSWORD
const REDIS_DB = parseInt(process.env.REDIS_DB || '0')

// Require Redis configuration in production
if (process.env.NODE_ENV === 'production' && !REDIS_URL && !REDIS_PASSWORD) {
  throw new Error('Redis configuration required in production. Set REDIS_URL or REDIS_PASSWORD')
}

// ===== CONNECTION CONFIGURATION =====

const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  db: REDIS_DB,
  
  // Security settings
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
  
  // Connection settings
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  
  // Health monitoring
  keepAlive: 30000,
  
  // Connection pooling
  lazyConnect: true,
  maxLoadingTimeout: 5000
}

// ===== REDIS CLIENT =====

export const redis = REDIS_URL 
  ? new Redis(REDIS_URL, {
      ...redisConfig,
      tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    })
  : new Redis(redisConfig)

// ===== ERROR HANDLING =====

redis.on('error', (error) => {
  console.error('Redis connection error:', error)
})

redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('ready', () => {
  console.log('🚀 Redis ready for operations')
})

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed')
})

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

// ===== UTILITY FUNCTIONS =====

/**
 * Set data with automatic expiration
 */
export const setWithExpiry = async (
  key: string, 
  value: string | object, 
  expirySeconds: number
): Promise<boolean> => {
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
    const result = await redis.setex(key, expirySeconds, serializedValue)
    return result === 'OK'
  } catch (error) {
    console.error('Redis setex error:', error)
    return false
  }
}

/**
 * Get and parse data
 */
export const getAndParse = async <T = any>(key: string): Promise<T | null> => {
  try {
    const value = await redis.get(key)
    if (!value) return null
    
    try {
      return JSON.parse(value)
    } catch {
      return value as T
    }
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

/**
 * Delete key(s)
 */
export const deleteKey = async (key: string | string[]): Promise<boolean> => {
  try {
    const keys = Array.isArray(key) ? key : [key]
    const result = await redis.del(...keys)
    return result > 0
  } catch (error) {
    console.error('Redis delete error:', error)
    return false
  }
}

/**
 * Check Redis health
 */
export const checkRedisHealth = async (): Promise<{
  connected: boolean
  responseTime: number
  error?: string
}> => {
  const start = Date.now()
  
  try {
    await redis.ping()
    return {
      connected: true,
      responseTime: Date.now() - start
    }
  } catch (error: any) {
    return {
      connected: false,
      responseTime: Date.now() - start,
      error: error.message
    }
  }
}

/**
 * Graceful Redis shutdown
 */
export const closeRedis = async (): Promise<void> => {
  try {
    await redis.quit()
    console.log('✅ Redis connection closed gracefully')
  } catch (error) {
    console.error('Redis shutdown error:', error)
  }
}

// ===== TOKEN STORAGE UTILITIES =====

/**
 * Store email verification token
 */
export const storeEmailToken = async (token: string, data: any): Promise<boolean> => {
  return setWithExpiry(`email_verification:${token}`, data, 24 * 60 * 60) // 24 hours
}

/**
 * Get email verification token data
 */
export const getEmailToken = async (token: string): Promise<any> => {
  return getAndParse(`email_verification:${token}`)
}

/**
 * Store password reset token
 */
export const storePasswordResetToken = async (token: string, data: any): Promise<boolean> => {
  return setWithExpiry(`password_reset:${token}`, data, 60 * 60) // 1 hour
}

/**
 * Get password reset token data
 */
export const getPasswordResetToken = async (token: string): Promise<any> => {
  return getAndParse(`password_reset:${token}`)
}

/**
 * Store user session
 */
export const storeUserSession = async (sessionId: string, data: any): Promise<boolean> => {
  return setWithExpiry(`user_session:${sessionId}`, data, 24 * 60 * 60) // 24 hours
}

/**
 * Get user session data
 */
export const getUserSession = async (sessionId: string): Promise<any> => {
  return getAndParse(`user_session:${sessionId}`)
}

export default redis
