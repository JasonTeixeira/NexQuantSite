/**
 * Real-time SRE Monitoring Dashboard
 * Live monitoring of system health, performance, and reliability
 */

interface MetricPoint {
  timestamp: number
  value: number
  label?: string
}

interface Metric {
  name: string
  current: number
  trend: 'up' | 'down' | 'stable'
  history: MetricPoint[]
  threshold: {
    warning: number
    critical: number
  }
  status: 'healthy' | 'warning' | 'critical'
}

interface AlertRule {
  name: string
  condition: (metrics: Map<string, Metric>) => boolean
  severity: 'info' | 'warning' | 'critical'
  message: string
  cooldownMs: number
  lastTriggered?: number
}

interface Alert {
  id: string
  rule: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: number
  resolved: boolean
  resolvedAt?: number
}

export class SREMonitor {
  private metrics: Map<string, Metric> = new Map()
  private alerts: Map<string, Alert> = new Map()
  private alertRules: AlertRule[] = []
  private isRunning: boolean = false
  private intervalId?: NodeJS.Timeout

  constructor() {
    this.initializeDefaultMetrics()
    this.initializeDefaultAlertRules()
  }

  private initializeDefaultMetrics(): void {
    const defaultMetrics = [
      {
        name: 'response-time',
        current: 0,
        trend: 'stable' as const,
        history: [],
        threshold: { warning: 2000, critical: 5000 },
        status: 'healthy' as const
      },
      {
        name: 'error-rate',
        current: 0,
        trend: 'stable' as const,
        history: [],
        threshold: { warning: 0.01, critical: 0.05 }, // 1% warning, 5% critical
        status: 'healthy' as const
      },
      {
        name: 'requests-per-second',
        current: 0,
        trend: 'stable' as const,
        history: [],
        threshold: { warning: 100, critical: 200 },
        status: 'healthy' as const
      },
      {
        name: 'memory-usage-mb',
        current: 0,
        trend: 'stable' as const,
        history: [],
        threshold: { warning: 512, critical: 1024 },
        status: 'healthy' as const
      },
      {
        name: 'active-connections',
        current: 0,
        trend: 'stable' as const,
        history: [],
        threshold: { warning: 500, critical: 1000 },
        status: 'healthy' as const
      }
    ]

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.name, metric)
    })
  }

  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        name: 'high-error-rate',
        condition: (metrics) => {
          const errorRate = metrics.get('error-rate')
          return errorRate ? errorRate.current > errorRate.threshold.warning : false
        },
        severity: 'warning',
        message: 'Error rate is above acceptable threshold',
        cooldownMs: 300000 // 5 minutes
      },
      {
        name: 'critical-error-rate',
        condition: (metrics) => {
          const errorRate = metrics.get('error-rate')
          return errorRate ? errorRate.current > errorRate.threshold.critical : false
        },
        severity: 'critical',
        message: 'ERROR RATE CRITICAL - Immediate attention required',
        cooldownMs: 60000 // 1 minute
      },
      {
        name: 'slow-response-time',
        condition: (metrics) => {
          const responseTime = metrics.get('response-time')
          return responseTime ? responseTime.current > responseTime.threshold.warning : false
        },
        severity: 'warning',
        message: 'Response time is degraded',
        cooldownMs: 600000 // 10 minutes
      },
      {
        name: 'critical-response-time',
        condition: (metrics) => {
          const responseTime = metrics.get('response-time')
          return responseTime ? responseTime.current > responseTime.threshold.critical : false
        },
        severity: 'critical',
        message: 'RESPONSE TIME CRITICAL - System unresponsive',
        cooldownMs: 180000 // 3 minutes
      },
      {
        name: 'memory-leak-detected',
        condition: (metrics) => {
          const memory = metrics.get('memory-usage-mb')
          if (!memory || memory.history.length < 10) return false
          
          // Check if memory has been increasing consistently
          const recent = memory.history.slice(-10)
          const trend = recent.reduce((sum, point, i) => {
            if (i === 0) return 0
            return sum + (point.value - recent[i-1].value)
          }, 0)
          
          return trend > 50 && memory.current > memory.threshold.warning
        },
        severity: 'warning',
        message: 'Potential memory leak detected - Memory usage increasing consistently',
        cooldownMs: 900000 // 15 minutes
      }
    ]
  }

  updateMetric(name: string, value: number, timestamp?: number): void {
    const metric = this.metrics.get(name)
    if (!metric) return

    const now = timestamp || Date.now()
    const oldValue = metric.current

    // Update current value
    metric.current = value

    // Add to history
    metric.history.push({ timestamp: now, value })

    // Keep only last 100 points
    if (metric.history.length > 100) {
      metric.history.shift()
    }

    // Calculate trend
    if (metric.history.length > 1) {
      const recent = metric.history.slice(-5) // Last 5 points
      if (recent.length >= 2) {
        const avgOld = recent.slice(0, -2).reduce((sum, p) => sum + p.value, 0) / Math.max(1, recent.length - 2)
        const avgNew = recent.slice(-2).reduce((sum, p) => sum + p.value, 0) / 2
        
        if (avgNew > avgOld * 1.1) {
          metric.trend = 'up'
        } else if (avgNew < avgOld * 0.9) {
          metric.trend = 'down'
        } else {
          metric.trend = 'stable'
        }
      }
    }

    // Update status
    if (value >= metric.threshold.critical) {
      metric.status = 'critical'
    } else if (value >= metric.threshold.warning) {
      metric.status = 'warning'
    } else {
      metric.status = 'healthy'
    }

    // Check alert rules
    this.checkAlerts()
  }

  private checkAlerts(): void {
    const now = Date.now()

    for (const rule of this.alertRules) {
      // Skip if in cooldown
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldownMs) {
        continue
      }

      // Check condition
      if (rule.condition(this.metrics)) {
        // Trigger alert
        const alertId = `${rule.name}-${now}`
        const alert: Alert = {
          id: alertId,
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          timestamp: now,
          resolved: false
        }

        this.alerts.set(alertId, alert)
        rule.lastTriggered = now

        // Log alert
        console.log(`🚨 ALERT [${rule.severity.toUpperCase()}]: ${rule.message}`)
        
        // In production, you'd send to alerting system (PagerDuty, Slack, etc.)
      }
    }
  }

  async collectSystemMetrics(): Promise<void> {
    try {
      // Collect frontend metrics
      const startTime = Date.now()
      const response = await fetch('http://localhost:3060/api/health')
      const responseTime = Date.now() - startTime
      
      this.updateMetric('response-time', responseTime)

      if (response.ok) {
        const health = await response.json()
        
        // Extract metrics from health check
        const frontendCheck = health.checks?.find((c: any) => c.name === 'frontend-availability')
        if (frontendCheck) {
          this.updateMetric('response-time', frontendCheck.responseTime)
        }

        // Simulate other metrics (in production, these would come from real sources)
        this.updateMetric('error-rate', Math.random() * 0.02) // 0-2% error rate
        this.updateMetric('requests-per-second', Math.random() * 50 + 10) // 10-60 RPS
        
        // Browser memory usage (if available)
        if (typeof window !== 'undefined' && (performance as any).memory) {
          const memInfo = (performance as any).memory
          this.updateMetric('memory-usage-mb', memInfo.usedJSHeapSize / 1024 / 1024)
        } else {
          // Simulate memory usage
          this.updateMetric('memory-usage-mb', Math.random() * 200 + 50)
        }

        this.updateMetric('active-connections', Math.floor(Math.random() * 100 + 10))
      } else {
        // High error rate if health check fails
        this.updateMetric('error-rate', 1.0)
        this.updateMetric('response-time', 30000) // 30s timeout
      }

    } catch (error) {
      console.error('Failed to collect system metrics:', error)
      this.updateMetric('error-rate', 1.0)
      this.updateMetric('response-time', 30000)
    }
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🔍 SRE Monitoring started')

    // Initial collection
    this.collectSystemMetrics()

    // Set up interval
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics()
    }, intervalMs)
  }

  stopMonitoring(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    console.log('🔍 SRE Monitoring stopped')
  }

  getMetrics(): Map<string, Metric> {
    return new Map(this.metrics)
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolved)
  }

  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values())
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      console.log(`✅ Alert resolved: ${alert.message}`)
    }
  }

  getDashboardData() {
    return {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      activeAlerts: this.getActiveAlerts(),
      systemStatus: this.getSystemStatus(),
      uptime: this.getUptime()
    }
  }

  private getSystemStatus(): 'healthy' | 'warning' | 'critical' {
    const activeAlerts = this.getActiveAlerts()
    
    if (activeAlerts.some(a => a.severity === 'critical')) {
      return 'critical'
    } else if (activeAlerts.some(a => a.severity === 'warning')) {
      return 'warning'
    } else {
      return 'healthy'
    }
  }

  private getUptime(): number {
    // In production, this would track actual uptime
    return Date.now() - (Date.now() - 24 * 60 * 60 * 1000) // Simulate 24h uptime
  }
}

// Global monitor instance
export const sreMonitor = new SREMonitor()

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  sreMonitor.startMonitoring(15000) // Every 15 seconds in dev
} else {
  sreMonitor.startMonitoring(60000) // Every minute in production
}
