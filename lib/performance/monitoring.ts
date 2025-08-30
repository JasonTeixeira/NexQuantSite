/**
 * Enterprise Performance Monitoring System
 * Real-time performance tracking and optimization
 */

// Performance Metrics Types
export interface PerformanceMetrics {
  timestamp: number
  path: string
  method: string
  responseTime: number
  statusCode: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  cpuUsage?: number
  userAgent?: string
  ip?: string
  userId?: string
  sessionId?: string
}

export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  entries?: PerformanceEntry[]
}

export interface SystemMetrics {
  timestamp: number
  memoryUsage: NodeJS.MemoryUsage
  uptime: number
  loadAverage: number[]
  activeHandles: number
  requestsPerMinute: number
  errorRate: number
  p95ResponseTime: number
}

// Performance Monitoring Class
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private webVitals: WebVitalsMetric[] = []
  private systemMetrics: SystemMetrics[] = []
  private maxMetrics = 10000 // Keep last 10k metrics in memory
  
  // Track API performance
  trackAPICall(data: Omit<PerformanceMetrics, 'timestamp' | 'memoryUsage'>) {
    const memUsage = process.memoryUsage()
    const metric: PerformanceMetrics = {
      ...data,
      timestamp: Date.now(),
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      }
    }
    
    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    
    // Log slow requests
    if (metric.responseTime > 1000) {
      console.warn(`Slow API call detected:`, {
        path: metric.path,
        responseTime: metric.responseTime,
        statusCode: metric.statusCode
      })
    }
    
    // Send to external monitoring (if configured)
    this.sendToExternalMonitoring(metric)
  }
  
  // Track Web Vitals
  trackWebVitals(metric: WebVitalsMetric) {
    this.webVitals.push({
      ...metric,
      rating: this.getWebVitalRating(metric.name, metric.value)
    })
    
    // Keep only recent web vitals
    if (this.webVitals.length > 1000) {
      this.webVitals = this.webVitals.slice(-1000)
    }
    
    // Alert on poor performance
    if (metric.value > this.getWebVitalThreshold(metric.name)) {
      console.warn(`Poor Web Vital detected:`, metric)
    }
  }
  
  // Collect system metrics
  collectSystemMetrics() {
    const metric: SystemMetrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      loadAverage: [0, 0, 0], // Would use os.loadavg() in Node.js
      activeHandles: 0, // Private API not available in production builds
      requestsPerMinute: this.getRequestsPerMinute(),
      errorRate: this.getErrorRate(),
      p95ResponseTime: this.getP95ResponseTime()
    }
    
    this.systemMetrics.push(metric)
    
    // Keep only recent system metrics
    if (this.systemMetrics.length > 1440) { // 24 hours of minute-level data
      this.systemMetrics = this.systemMetrics.slice(-1440)
    }
    
    return metric
  }
  
  // Get performance summary
  getPerformanceSummary(timeRange = 300000) { // Last 5 minutes
    const cutoff = Date.now() - timeRange
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    if (recentMetrics.length === 0) {
      return null
    }
    
    const responseTimes = recentMetrics.map(m => m.responseTime)
    const errors = recentMetrics.filter(m => m.statusCode >= 400)
    const memoryUsages = recentMetrics.map(m => m.memoryUsage.percentage)
    
    return {
      totalRequests: recentMetrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      errorRate: (errors.length / recentMetrics.length) * 100,
      averageMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
      slowestEndpoints: this.getSlowestEndpoints(recentMetrics),
      errorBreakdown: this.getErrorBreakdown(errors)
    }
  }
  
  // Get Web Vitals summary
  getWebVitalsSummary() {
    const vitals = ['CLS', 'FCP', 'FID', 'LCP', 'TTFB']
    const summary: Record<string, any> = {}
    
    vitals.forEach(vital => {
      const metrics = this.webVitals.filter(m => m.name === vital)
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value)
        summary[vital] = {
          count: metrics.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          p75: this.percentile(values, 75),
          p90: this.percentile(values, 90),
          goodCount: metrics.filter(m => m.rating === 'good').length,
          needsImprovementCount: metrics.filter(m => m.rating === 'needs-improvement').length,
          poorCount: metrics.filter(m => m.rating === 'poor').length
        }
      }
    })
    
    return summary
  }
  
  // Export metrics for external systems
  exportMetrics(format: 'json' | 'csv' | 'prometheus' = 'json') {
    const data = {
      metrics: this.metrics,
      webVitals: this.webVitals,
      systemMetrics: this.systemMetrics,
      summary: this.getPerformanceSummary(),
      webVitalsSummary: this.getWebVitalsSummary()
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data.metrics)
      case 'prometheus':
        return this.convertToPrometheus(data)
      default:
        return data
    }
  }
  
  // Clear old metrics (for memory management)
  clearOldMetrics(olderThan = 86400000) { // 24 hours
    const cutoff = Date.now() - olderThan
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    this.webVitals = this.webVitals.filter(m => (m as any).timestamp > cutoff)
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff)
  }
  
  // Private helper methods
  private getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      CLS: [0.1, 0.25],
      FCP: [1800, 3000],
      FID: [100, 300],
      LCP: [2500, 4000],
      TTFB: [800, 1800]
    }
    
    const [good, needsImprovement] = thresholds[name as keyof typeof thresholds] || [0, 0]
    
    if (value <= good) return 'good'
    if (value <= needsImprovement) return 'needs-improvement'
    return 'poor'
  }
  
  private getWebVitalThreshold(name: string): number {
    const thresholds = {
      CLS: 0.25,
      FCP: 3000,
      FID: 300,
      LCP: 4000,
      TTFB: 1800
    }
    return thresholds[name as keyof typeof thresholds] || 1000
  }
  
  private getRequestsPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000
    return this.metrics.filter(m => m.timestamp > oneMinuteAgo).length
  }
  
  private getErrorRate(): number {
    const oneMinuteAgo = Date.now() - 60000
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneMinuteAgo)
    if (recentMetrics.length === 0) return 0
    
    const errors = recentMetrics.filter(m => m.statusCode >= 400)
    return (errors.length / recentMetrics.length) * 100
  }
  
  private getP95ResponseTime(): number {
    const fiveMinutesAgo = Date.now() - 300000
    const recentMetrics = this.metrics.filter(m => m.timestamp > fiveMinutesAgo)
    const responseTimes = recentMetrics.map(m => m.responseTime)
    return this.percentile(responseTimes, 95)
  }
  
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index] || 0
  }
  
  private getSlowestEndpoints(metrics: PerformanceMetrics[], limit = 5) {
    const endpointStats: Record<string, { path: string; avgResponseTime: number; count: number }> = {}
    
    metrics.forEach(metric => {
      const key = `${metric.method} ${metric.path}`
      if (!endpointStats[key]) {
        endpointStats[key] = { path: key, avgResponseTime: 0, count: 0 }
      }
      endpointStats[key].avgResponseTime += metric.responseTime
      endpointStats[key].count++
    })
    
    Object.values(endpointStats).forEach(stat => {
      stat.avgResponseTime /= stat.count
    })
    
    return Object.values(endpointStats)
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit)
  }
  
  private getErrorBreakdown(errors: PerformanceMetrics[]) {
    const breakdown: Record<number, number> = {}
    errors.forEach(error => {
      breakdown[error.statusCode] = (breakdown[error.statusCode] || 0) + 1
    })
    return breakdown
  }
  
  private convertToCSV(metrics: PerformanceMetrics[]): string {
    if (metrics.length === 0) return ''
    
    const headers = Object.keys(metrics[0])
    const rows = metrics.map(metric => 
      headers.map(header => {
        const value = (metric as any)[header]
        return typeof value === 'object' ? JSON.stringify(value) : value
      }).join(',')
    )
    
    return [headers.join(','), ...rows].join('\n')
  }
  
  private convertToPrometheus(data: any): string {
    // Convert metrics to Prometheus format
    let output = ''
    
    if (data.summary) {
      output += `# HELP api_response_time_seconds API response time in seconds\n`
      output += `# TYPE api_response_time_seconds histogram\n`
      output += `api_response_time_seconds{quantile="0.95"} ${data.summary.p95ResponseTime / 1000}\n`
      output += `api_response_time_seconds{quantile="0.99"} ${data.summary.p99ResponseTime / 1000}\n`
      
      output += `# HELP api_requests_total Total number of API requests\n`
      output += `# TYPE api_requests_total counter\n`
      output += `api_requests_total ${data.summary.totalRequests}\n`
      
      output += `# HELP api_error_rate Percentage of API requests that resulted in errors\n`
      output += `# TYPE api_error_rate gauge\n`
      output += `api_error_rate ${data.summary.errorRate}\n`
    }
    
    return output
  }
  
  private sendToExternalMonitoring(metric: PerformanceMetrics) {
    // In production, send to external monitoring services
    // e.g., DataDog, New Relic, Grafana, etc.
    if (process.env.MONITORING_ENDPOINT) {
      // Implementation would go here
      // fetch(process.env.MONITORING_ENDPOINT, { ... })
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Express/API middleware for automatic performance tracking
export function createPerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    
    // Track the response
    const originalSend = res.send
    res.send = function(data: any) {
      const responseTime = Date.now() - start
      
      performanceMonitor.trackAPICall({
        path: req.url || req.path,
        method: req.method,
        responseTime,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        sessionId: req.sessionID
      })
      
      return originalSend.call(this, data)
    }
    
    next()
  }
}

// Web Vitals tracking for client-side - using native Performance API
export function trackWebVitals(onPerfEntry?: (entry: any) => void) {
  if (typeof window !== 'undefined' && onPerfEntry && onPerfEntry instanceof Function) {
    // Use native Performance API instead of web-vitals library
    try {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            onPerfEntry(entry)
          }
        })
        observer.observe({ type: 'paint', buffered: true })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })
      }
    } catch (error) {
      console.warn('Performance tracking failed:', error)
    }
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }) as T
  },
  
  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },
  
  // Lazy loading utility
  createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1
      })
    }
    return null
  },
  
  // Memory usage monitoring
  getMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }
    return null
  }
}
