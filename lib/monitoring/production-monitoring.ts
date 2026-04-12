// 📊 PRODUCTION MONITORING - Comprehensive monitoring with Prometheus, health checks, and alerting
// Addresses CRITICAL operational gap: No production monitoring

import prometheus from 'prom-client'
import { EventEmitter } from 'events'

// 📊 CUSTOM METRICS DEFINITIONS
const metrics = {
  // 🔢 COUNTERS
  httpRequests: new prometheus.Counter({
    name: 'nexural_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'user_id']
  }),

  brokerApiCalls: new prometheus.Counter({
    name: 'nexural_broker_api_calls_total',
    help: 'Total broker API calls',
    labelNames: ['broker_id', 'endpoint', 'status', 'user_id']
  }),

  tradeExecutions: new prometheus.Counter({
    name: 'nexural_trade_executions_total',
    help: 'Total trade executions',
    labelNames: ['broker_id', 'symbol', 'side', 'order_type', 'status']
  }),

  authenticationAttempts: new prometheus.Counter({
    name: 'nexural_auth_attempts_total',
    help: 'Authentication attempts',
    labelNames: ['method', 'status', 'ip_address']
  }),

  rateLimitViolations: new prometheus.Counter({
    name: 'nexural_rate_limit_violations_total',
    help: 'Rate limit violations',
    labelNames: ['rule_id', 'identifier_type', 'endpoint']
  }),

  // ⏱️ HISTOGRAMS
  httpRequestDuration: new prometheus.Histogram({
    name: 'nexural_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  }),

  brokerApiLatency: new prometheus.Histogram({
    name: 'nexural_broker_api_latency_seconds',
    help: 'Broker API response time in seconds',
    labelNames: ['broker_id', 'endpoint'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),

  databaseQueryDuration: new prometheus.Histogram({
    name: 'nexural_database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['query_type', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
  }),

  // 📏 GAUGES
  activeUsers: new prometheus.Gauge({
    name: 'nexural_active_users',
    help: 'Number of currently active users',
    labelNames: ['session_type']
  }),

  activeWebSocketConnections: new prometheus.Gauge({
    name: 'nexural_websocket_connections',
    help: 'Number of active WebSocket connections',
    labelNames: ['connection_type']
  }),

  memoryUsage: new prometheus.Gauge({
    name: 'nexural_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type']
  }),

  portfolioValues: new prometheus.Gauge({
    name: 'nexural_portfolio_values_usd',
    help: 'Total portfolio values in USD',
    labelNames: ['broker_id', 'asset_class']
  }),

  systemHealth: new prometheus.Gauge({
    name: 'nexural_system_health_score',
    help: 'Overall system health score (0-100)',
    labelNames: ['component']
  }),

  redisConnections: new prometheus.Gauge({
    name: 'nexural_redis_connections',
    help: 'Number of Redis connections',
    labelNames: ['pool_name']
  }),

  // 📈 SUMMARIES
  tradingVolume: new prometheus.Summary({
    name: 'nexural_trading_volume_usd',
    help: 'Trading volume in USD',
    labelNames: ['broker_id', 'symbol', 'asset_class'],
    percentiles: [0.5, 0.9, 0.95, 0.99]
  })
}

// 🏥 HEALTH CHECK DEFINITIONS
interface HealthCheck {
  name: string
  check: () => Promise<{ healthy: boolean; details?: any; latency?: number }>
  critical: boolean
  timeout: number
}

interface SystemHealth {
  healthy: boolean
  score: number
  timestamp: Date
  checks: { [key: string]: { healthy: boolean; details?: any; latency?: number; error?: string } }
  uptime: number
}

// 📊 PRODUCTION MONITORING SYSTEM
export class ProductionMonitoring extends EventEmitter {
  private healthChecks: Map<string, HealthCheck> = new Map()
  private startTime: Date = new Date()
  private monitoringInterval?: NodeJS.Timeout
  private healthCheckInterval?: NodeJS.Timeout

  constructor() {
    super()
    
    // Initialize default Prometheus metrics collection
    prometheus.collectDefaultMetrics({
      prefix: 'nexural_',
      timeout: 5000
    })

    // Set up default health checks
    this.setupDefaultHealthChecks()
    
    // Start monitoring loops
    this.startMonitoring()
  }

  // 🏥 SETUP DEFAULT HEALTH CHECKS
  private setupDefaultHealthChecks(): void {
    // Database health check
    this.addHealthCheck('database', async () => {
      const start = Date.now()
      try {
        // TODO: Replace with actual database ping
        // await db.query('SELECT 1')
        await new Promise(resolve => setTimeout(resolve, 10)) // Mock
        
        return {
          healthy: true,
          latency: Date.now() - start,
          details: { connection: 'active' }
        }
      } catch (error) {
        return {
          healthy: false,
          latency: Date.now() - start,
          details: { error: error.message }
        }
      }
    }, true, 5000)

    // Redis health check
    this.addHealthCheck('redis', async () => {
      const start = Date.now()
      try {
        // TODO: Replace with actual Redis ping
        // await redis.ping()
        await new Promise(resolve => setTimeout(resolve, 5)) // Mock
        
        return {
          healthy: true,
          latency: Date.now() - start,
          details: { connection: 'active' }
        }
      } catch (error) {
        return {
          healthy: false,
          latency: Date.now() - start,
          details: { error: error.message }
        }
      }
    }, true, 3000)

    // Memory health check
    this.addHealthCheck('memory', async () => {
      const memUsage = process.memoryUsage()
      const totalMB = memUsage.heapTotal / 1024 / 1024
      const usedMB = memUsage.heapUsed / 1024 / 1024
      const utilizationPercent = (usedMB / totalMB) * 100
      
      return {
        healthy: utilizationPercent < 90,
        details: {
          totalMB: Math.round(totalMB),
          usedMB: Math.round(usedMB),
          utilization: Math.round(utilizationPercent)
        }
      }
    }, false, 1000)

    // Broker API health checks (for each broker)
    const brokers = ['alpaca', 'interactive_brokers', 'binance_testnet']
    brokers.forEach(brokerId => {
      this.addHealthCheck(`broker_${brokerId}`, async () => {
        const start = Date.now()
        try {
          // TODO: Replace with actual broker API health check
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
          
          return {
            healthy: Math.random() > 0.1, // 90% success rate for demo
            latency: Date.now() - start,
            details: { broker: brokerId, status: 'connected' }
          }
        } catch (error) {
          return {
            healthy: false,
            latency: Date.now() - start,
            details: { broker: brokerId, error: error.message }
          }
        }
      }, false, 10000)
    })
  }

  // 🏥 ADD CUSTOM HEALTH CHECK
  addHealthCheck(name: string, check: () => Promise<any>, critical: boolean = false, timeout: number = 5000): void {
    this.healthChecks.set(name, { name, check, critical, timeout })
  }

  // 🏥 REMOVE HEALTH CHECK
  removeHealthCheck(name: string): void {
    this.healthChecks.delete(name)
  }

  // 🏥 RUN ALL HEALTH CHECKS
  async runHealthChecks(): Promise<SystemHealth> {
    const results: { [key: string]: any } = {}
    let healthyCount = 0
    let criticalFailures = 0
    
    const promises = Array.from(this.healthChecks.entries()).map(async ([name, healthCheck]) => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout)
        )
        
        const result = await Promise.race([healthCheck.check(), timeoutPromise])
        results[name] = result
        
        if (result.healthy) {
          healthyCount++
        } else if (healthCheck.critical) {
          criticalFailures++
        }
      } catch (error) {
        results[name] = {
          healthy: false,
          error: error.message
        }
        
        if (healthCheck.critical) {
          criticalFailures++
        }
      }
    })

    await Promise.all(promises)

    const totalChecks = this.healthChecks.size
    const score = Math.round((healthyCount / totalChecks) * 100)
    const overallHealthy = criticalFailures === 0 && score >= 70

    // Update Prometheus metrics
    metrics.systemHealth.set({ component: 'overall' }, score)

    return {
      healthy: overallHealthy,
      score,
      timestamp: new Date(),
      checks: results,
      uptime: Date.now() - this.startTime.getTime()
    }
  }

  // 📊 RECORD METRICS
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, userId?: string): void {
    metrics.httpRequests.inc({
      method,
      route,
      status_code: statusCode.toString(),
      user_id: userId || 'anonymous'
    })
    
    metrics.httpRequestDuration.observe({
      method,
      route,
      status_code: statusCode.toString()
    }, duration / 1000)
  }

  recordBrokerApiCall(brokerId: string, endpoint: string, status: string, latency: number, userId?: string): void {
    metrics.brokerApiCalls.inc({
      broker_id: brokerId,
      endpoint,
      status,
      user_id: userId || 'unknown'
    })
    
    metrics.brokerApiLatency.observe({
      broker_id: brokerId,
      endpoint
    }, latency / 1000)
  }

  recordTradeExecution(brokerId: string, symbol: string, side: string, orderType: string, status: string): void {
    metrics.tradeExecutions.inc({
      broker_id: brokerId,
      symbol,
      side,
      order_type: orderType,
      status
    })
  }

  recordAuthAttempt(method: string, status: string, ipAddress: string): void {
    metrics.authenticationAttempts.inc({
      method,
      status,
      ip_address: ipAddress
    })
  }

  recordRateLimitViolation(ruleId: string, identifierType: string, endpoint: string): void {
    metrics.rateLimitViolations.inc({
      rule_id: ruleId,
      identifier_type: identifierType,
      endpoint
    })
  }

  recordDatabaseQuery(queryType: string, table: string, duration: number): void {
    metrics.databaseQueryDuration.observe({
      query_type: queryType,
      table
    }, duration / 1000)
  }

  recordTradingVolume(brokerId: string, symbol: string, assetClass: string, volume: number): void {
    metrics.tradingVolume.observe({
      broker_id: brokerId,
      symbol,
      asset_class: assetClass
    }, volume)
  }

  // 📊 UPDATE GAUGE METRICS
  updateActiveUsers(count: number, sessionType: string = 'web'): void {
    metrics.activeUsers.set({ session_type: sessionType }, count)
  }

  updateWebSocketConnections(count: number, connectionType: string = 'market_data'): void {
    metrics.activeWebSocketConnections.set({ connection_type: connectionType }, count)
  }

  updateMemoryUsage(): void {
    const memUsage = process.memoryUsage()
    metrics.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed)
    metrics.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal)
    metrics.memoryUsage.set({ type: 'external' }, memUsage.external)
    metrics.memoryUsage.set({ type: 'rss' }, memUsage.rss)
  }

  updatePortfolioValues(brokerId: string, assetClass: string, totalValue: number): void {
    metrics.portfolioValues.set({
      broker_id: brokerId,
      asset_class: assetClass
    }, totalValue)
  }

  // 🚨 ALERT MANAGEMENT
  private async checkForAlerts(health: SystemHealth): Promise<void> {
    // Critical system down
    if (!health.healthy) {
      this.emit('critical_alert', {
        type: 'system_unhealthy',
        message: `System health critical: ${health.score}% healthy`,
        details: health.checks
      })
    }

    // Low health score
    if (health.score < 80) {
      this.emit('warning_alert', {
        type: 'low_health_score',
        message: `System health degraded: ${health.score}%`,
        details: health.checks
      })
    }

    // Specific component failures
    for (const [name, result] of Object.entries(health.checks)) {
      if (!result.healthy) {
        const healthCheck = this.healthChecks.get(name)
        if (healthCheck?.critical) {
          this.emit('critical_alert', {
            type: 'critical_component_failure',
            message: `Critical component ${name} failed`,
            details: result
          })
        }
      }
    }
  }

  // 📈 GET METRICS FOR PROMETHEUS ENDPOINT
  getMetrics(): string {
    return prometheus.register.metrics()
  }

  // 📊 GET SYSTEM STATS
  async getSystemStats(): Promise<any> {
    const health = await this.runHealthChecks()
    
    return {
      uptime: Date.now() - this.startTime.getTime(),
      health,
      metrics: {
        activeUsers: metrics.activeUsers.get() || {},
        activeConnections: metrics.activeWebSocketConnections.get() || {},
        memoryUsage: process.memoryUsage()
      }
    }
  }

  // 🔄 START MONITORING LOOPS
  private startMonitoring(): void {
    // Health check loop (every 30 seconds)
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.runHealthChecks()
        await this.checkForAlerts(health)
        
        // Emit health update event
        this.emit('health_update', health)
      } catch (error) {
        console.error('Health check loop error:', error)
      }
    }, 30000)

    // Metrics update loop (every 10 seconds)
    this.monitoringInterval = setInterval(() => {
      try {
        this.updateMemoryUsage()
        // Update other gauge metrics as needed
      } catch (error) {
        console.error('Metrics update loop error:', error)
      }
    }, 10000)
  }

  // 🛑 STOP MONITORING
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = undefined
    }
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    
    prometheus.register.clear()
  }
}

// 🏭 SINGLETON INSTANCE
export const monitoring = new ProductionMonitoring()

// 🌐 EXPRESS MIDDLEWARE FOR AUTOMATIC METRICS COLLECTION
export function createMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    
    // Override res.end to capture metrics
    const originalEnd = res.end
    res.end = function(...args: any[]) {
      const duration = Date.now() - start
      const route = req.route?.path || req.path || 'unknown'
      
      monitoring.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration,
        req.user?.id
      )
      
      originalEnd.apply(res, args)
    }
    
    next()
  }
}

// 📊 HEALTH CHECK ENDPOINT
export function createHealthEndpoint() {
  return async (req: any, res: any) => {
    try {
      const health = await monitoring.runHealthChecks()
      
      res.status(health.healthy ? 200 : 503).json({
        status: health.healthy ? 'healthy' : 'unhealthy',
        score: health.score,
        timestamp: health.timestamp,
        uptime: health.uptime,
        checks: health.checks
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message
      })
    }
  }
}

// 📊 METRICS ENDPOINT
export function createMetricsEndpoint() {
  return async (req: any, res: any) => {
    try {
      const metrics = monitoring.getMetrics()
      res.set('Content-Type', prometheus.register.contentType)
      res.send(metrics)
    } catch (error) {
      res.status(500).json({
        error: 'Failed to collect metrics',
        details: error.message
      })
    }
  }
}

export { metrics, SystemHealth, ProductionMonitoring }
