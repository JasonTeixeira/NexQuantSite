/**
 * Performance metrics collection and monitoring
 */

export interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  timeToInteractive: number
  cumulativeLayoutShift: number
  bundleSize: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []

  collectMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    
    return {
      pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      firstContentfulPaint: fcp?.startTime || 0,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      cumulativeLayoutShift: 0, // Would need Web Vitals library for accurate CLS
      bundleSize: 0, // Would be populated by build process
      timestamp: Date.now()
    }
  }

  logMetrics(): void {
    const metrics = this.collectMetrics()
    if (!metrics) return

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('⚡ Performance Metrics')
      console.log(`Page Load Time: ${(metrics.pageLoadTime / 1000).toFixed(2)}s`)
      console.log(`First Contentful Paint: ${(metrics.firstContentfulPaint / 1000).toFixed(2)}s`)
      console.log(`Time to Interactive: ${(metrics.timeToInteractive / 1000).toFixed(2)}s`)
      console.groupEnd()
    }

    this.metrics.push(metrics)
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, m) => sum + m.pageLoadTime, 0)
    return total / this.metrics.length
  }
}

// Export singleton
export const performanceMonitor = new PerformanceMonitor()

// Auto-collect metrics on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => performanceMonitor.logMetrics(), 100)
  })
}

// Performance budget alerts
export const PERFORMANCE_BUDGET = {
  pageLoadTime: 3000, // 3 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  timeToInteractive: 3500, // 3.5 seconds
  bundleSize: 500 * 1024, // 500KB
}

export function checkPerformanceBudget(metrics: PerformanceMetrics): {
  passed: boolean
  violations: string[]
} {
  const violations: string[] = []

  if (metrics.pageLoadTime > PERFORMANCE_BUDGET.pageLoadTime) {
    violations.push(`Page load time exceeded budget: ${(metrics.pageLoadTime / 1000).toFixed(2)}s > ${PERFORMANCE_BUDGET.pageLoadTime / 1000}s`)
  }

  if (metrics.firstContentfulPaint > PERFORMANCE_BUDGET.firstContentfulPaint) {
    violations.push(`FCP exceeded budget: ${(metrics.firstContentfulPaint / 1000).toFixed(2)}s > ${PERFORMANCE_BUDGET.firstContentfulPaint / 1000}s`)
  }

  if (metrics.timeToInteractive > PERFORMANCE_BUDGET.timeToInteractive) {
    violations.push(`TTI exceeded budget: ${(metrics.timeToInteractive / 1000).toFixed(2)}s > ${PERFORMANCE_BUDGET.timeToInteractive / 1000}s`)
  }

  return {
    passed: violations.length === 0,
    violations
  }
}
