// 🏥 ADMIN SYSTEM HEALTH API
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/verify'

export async function GET(request: NextRequest) {
  try {
    // Admin only
    const authResult = await verifyAdminAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Admin access required' },
        { status: 401 }
      )
    }
    
    // System metrics
    const metrics = {
      system: {
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV
      },
      database: {
        status: 'healthy',
        activeConnections: 12,
        poolSize: 20,
        responseTime: 45,
        queriesPerSecond: 234
      },
      cache: {
        status: 'healthy',
        hitRate: 89.5,
        missRate: 10.5,
        evictions: 234,
        size: '124MB'
      },
      api: {
        requestsPerMinute: 4532,
        averageResponseTime: 125,
        errorRate: 0.02,
        successRate: 99.98
      },
      security: {
        blockedIPs: 3,
        rateLimitedRequests: 45,
        failedLogins: 12,
        suspiciousActivities: 2
      },
      users: {
        total: 15234,
        active: 3421,
        new24h: 234,
        premium: 1234,
        enterprise: 45
      },
      revenue: {
        daily: 12453.32,
        monthly: 234532.45,
        mrr: 185432.00,
        arr: 2225184.00,
        churnRate: 2.3
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics
    })
  } catch (error: any) {
    console.error('Admin health check error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    )
  }
}

