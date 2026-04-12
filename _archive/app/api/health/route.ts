// 🏥 SYSTEM HEALTH CHECK API  
// HIGH-PERFORMANCE: Enterprise caching for <100ms responses
// Production-ready health monitoring with database and cache status

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/database'
import { enterpriseCache } from '@/lib/performance/enterprise-cache'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 🚀 ENTERPRISE CACHE: Check for cached health status
    const cacheKey = 'system-health'
    const cachedHealth = await enterpriseCache.get(cacheKey, 'health')
    
    if (cachedHealth && typeof cachedHealth === 'object') {
      const responseTime = Date.now() - startTime
      return NextResponse.json({
        ...(cachedHealth as object),
        cached: true,
        responseTime,
        cache_stats: enterpriseCache.getStats()
      })
    }

    // For local development, use mock health checks
    const isDevelopment = process.env.NODE_ENV === 'development'
    let healthCheck, performanceMetrics

    if (isDevelopment) {
      // Mock healthy status for local development
      healthCheck = {
        postgres: true,
        redis: true
      }
      performanceMetrics = {
        active_connections: 5,
        cache_hit_rate: 0.95,
        avg_query_time: 12,
        memory_usage: 0.68
      }
    } else {
      // Production: use real database checks
      healthCheck = await db.healthCheck()
      performanceMetrics = await db.getPerformanceMetrics()
    }
    
    const responseTime = Date.now() - startTime
    
    // Determine overall system health
    const isHealthy = healthCheck.postgres && healthCheck.redis
    const status = isHealthy ? 'healthy' : 'degraded'
    const httpStatus = isHealthy ? 200 : 503

    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      services: {
        database: {
          status: healthCheck.postgres ? 'connected' : 'disconnected',
          type: isDevelopment ? 'PostgreSQL (mock)' : 'PostgreSQL'
        },
        cache: {
          status: healthCheck.redis ? 'connected' : 'disconnected',
          type: isDevelopment ? 'Redis (mock)' : 'Redis'
        },
        api: {
          status: 'operational',
          version: '1.0.0'
        }
      },
      metrics: {
        ...performanceMetrics,
        response_time_ms: responseTime
      },
      environment: process.env.NODE_ENV || 'development',
      cached: false,
      cache_stats: enterpriseCache.getStats()
    }

    // 🚀 CACHE THE HEALTH DATA for subsequent requests  
    await enterpriseCache.set(cacheKey, healthData, 'health')

    return NextResponse.json(healthData, { status: httpStatus })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
      error: error.message,
      services: {
        database: { status: 'error' },
        cache: { status: 'error' },
        api: { status: 'error' }
      },
      cached: false
    }, { status: 500 })
  }
}
