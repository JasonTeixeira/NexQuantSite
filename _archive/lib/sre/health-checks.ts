/**
 * Comprehensive Health Check System
 * SRE-grade monitoring for production readiness
 */

interface HealthCheckResult {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  message?: string
  metadata?: Record<string, any>
  timestamp: string
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheckResult[]
  uptime: number
  version: string
  environment: string
  timestamp: string
}

interface HealthCheck {
  name: string
  check: () => Promise<HealthCheckResult>
  timeout: number
  critical: boolean
}

export class HealthCheckRunner {
  private checks: Map<string, HealthCheck> = new Map()
  private startTime: number = Date.now()

  registerCheck(check: HealthCheck): void {
    this.checks.set(check.name, check)
  }

  async runHealthChecks(): Promise<SystemHealth> {
    const results: HealthCheckResult[] = []
    
    for (const [name, check] of this.checks) {
      try {
        const promise = check.check()
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
        })
        
        const result = await Promise.race([promise, timeoutPromise])
        results.push(result)
      } catch (error: any) {
        results.push({
          name,
          status: 'unhealthy',
          responseTime: check.timeout,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    const overall = this.determineOverallHealth(results)
    
    return {
      overall,
      checks: results,
      uptime: (Date.now() - this.startTime) / 1000,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  }

  private determineOverallHealth(results: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
    const criticalChecks = Array.from(this.checks.values()).filter(c => c.critical)
    const criticalResults = results.filter(r => 
      criticalChecks.some(c => c.name === r.name)
    )

    // If any critical check is unhealthy, overall is unhealthy
    if (criticalResults.some(r => r.status === 'unhealthy')) {
      return 'unhealthy'
    }

    // If any check is unhealthy or critical is degraded, overall is degraded
    if (results.some(r => r.status === 'unhealthy') || 
        criticalResults.some(r => r.status === 'degraded')) {
      return 'degraded'
    }

    // If any check is degraded, overall is degraded
    if (results.some(r => r.status === 'degraded')) {
      return 'degraded'
    }

    return 'healthy'
  }
}

// Default health checks for web application
export const createDefaultHealthChecks = (baseUrl: string = 'http://localhost:3060'): HealthCheck[] => [
  {
    name: 'frontend-availability',
    timeout: 5000,
    critical: true,
    check: async (): Promise<HealthCheckResult> => {
      const startTime = Date.now()
      try {
        const response = await fetch(`${baseUrl}/`)
        const responseTime = Date.now() - startTime
        
        if (response.ok) {
          return {
            name: 'frontend-availability',
            status: responseTime < 2000 ? 'healthy' : 'degraded',
            responseTime,
            message: `HTTP ${response.status}`,
            metadata: {
              status: response.status,
              contentLength: response.headers.get('content-length')
            },
            timestamp: new Date().toISOString()
          }
        } else {
          return {
            name: 'frontend-availability',
            status: 'unhealthy',
            responseTime,
            message: `HTTP ${response.status}`,
            timestamp: new Date().toISOString()
          }
        }
      } catch (error: any) {
        return {
          name: 'frontend-availability',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  },
  {
    name: 'api-endpoints',
    timeout: 10000,
    critical: true,
    check: async (): Promise<HealthCheckResult> => {
      const startTime = Date.now()
      const endpoints = [
        '/api/placeholder/400/300',
        // Add other critical API endpoints here
      ]
      
      try {
        const results = await Promise.all(
          endpoints.map(async endpoint => {
            const response = await fetch(`${baseUrl}${endpoint}`)
            return {
              endpoint,
              status: response.status,
              ok: response.ok
            }
          })
        )
        
        const responseTime = Date.now() - startTime
        const failedEndpoints = results.filter(r => !r.ok)
        
        if (failedEndpoints.length === 0) {
          return {
            name: 'api-endpoints',
            status: 'healthy',
            responseTime,
            message: `All ${endpoints.length} endpoints healthy`,
            metadata: { results },
            timestamp: new Date().toISOString()
          }
        } else {
          return {
            name: 'api-endpoints',
            status: failedEndpoints.length === endpoints.length ? 'unhealthy' : 'degraded',
            responseTime,
            message: `${failedEndpoints.length}/${endpoints.length} endpoints failing`,
            metadata: { results, failures: failedEndpoints },
            timestamp: new Date().toISOString()
          }
        }
      } catch (error: any) {
        return {
          name: 'api-endpoints',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  },
  {
    name: 'static-assets',
    timeout: 15000,
    critical: false,
    check: async (): Promise<HealthCheckResult> => {
      const startTime = Date.now()
      const assets = [
        '/the-guardian-logo.png',
        '/generic-financial-logo.png',
        '/generic-tech-logo.png',
        '/techcrunch-logo.png',
        '/placeholder-zpfoe.png'
      ]
      
      try {
        const results = await Promise.all(
          assets.map(async asset => {
            try {
              const response = await fetch(`${baseUrl}${asset}`)
              return {
                asset,
                status: response.status,
                ok: response.ok,
                size: response.headers.get('content-length')
              }
            } catch (error) {
              return {
                asset,
                status: 0,
                ok: false,
                error: (error as Error).message
              }
            }
          })
        )
        
        const responseTime = Date.now() - startTime
        const failedAssets = results.filter(r => !r.ok)
        
        if (failedAssets.length === 0) {
          return {
            name: 'static-assets',
            status: 'healthy',
            responseTime,
            message: `All ${assets.length} assets available`,
            metadata: { results },
            timestamp: new Date().toISOString()
          }
        } else {
          return {
            name: 'static-assets',
            status: 'degraded',
            responseTime,
            message: `${failedAssets.length}/${assets.length} assets failing`,
            metadata: { results, failures: failedAssets },
            timestamp: new Date().toISOString()
          }
        }
      } catch (error: any) {
        return {
          name: 'static-assets',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  },
  {
    name: 'browser-performance',
    timeout: 20000,
    critical: false,
    check: async (): Promise<HealthCheckResult> => {
      const startTime = Date.now()
      
      if (typeof window === 'undefined') {
        return {
          name: 'browser-performance',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'Server-side environment',
          timestamp: new Date().toISOString()
        }
      }
      
      try {
        // Check memory usage
        const memInfo = (performance as any).memory
        const memoryMB = memInfo ? memInfo.usedJSHeapSize / 1024 / 1024 : 0
        
        // Check navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0
        
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
        let issues: string[] = []
        
        if (memoryMB > 100) {
          status = 'degraded'
          issues.push(`High memory usage: ${memoryMB.toFixed(1)}MB`)
        }
        
        if (loadTime > 5000) {
          status = 'degraded'
          issues.push(`Slow page load: ${loadTime.toFixed(0)}ms`)
        }
        
        if (memoryMB > 200 || loadTime > 10000) {
          status = 'unhealthy'
        }
        
        return {
          name: 'browser-performance',
          status,
          responseTime: Date.now() - startTime,
          message: issues.length > 0 ? issues.join(', ') : 'Performance within normal ranges',
          metadata: {
            memoryMB: memoryMB.toFixed(1),
            loadTimeMs: loadTime.toFixed(0),
            userAgent: navigator.userAgent
          },
          timestamp: new Date().toISOString()
        }
      } catch (error: any) {
        return {
          name: 'browser-performance',
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: `Performance check failed: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      }
    }
  },
  {
    name: 'local-storage',
    timeout: 5000,
    critical: false,
    check: async (): Promise<HealthCheckResult> => {
      const startTime = Date.now()
      
      if (typeof localStorage === 'undefined') {
        return {
          name: 'local-storage',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'Server-side environment',
          timestamp: new Date().toISOString()
        }
      }
      
      try {
        // Test localStorage functionality
        const testKey = 'health-check-test'
        const testValue = Date.now().toString()
        
        localStorage.setItem(testKey, testValue)
        const retrieved = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        
        if (retrieved === testValue) {
          // Check quota usage
          let quotaUsage = 0
          try {
            const estimate = await navigator.storage.estimate()
            quotaUsage = (estimate.usage || 0) / (estimate.quota || 1)
          } catch (e) {
            // Quota API not available
          }
          
          let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
          let message = 'localStorage working normally'
          
          if (quotaUsage > 0.8) {
            status = 'degraded'
            message = `Storage quota ${(quotaUsage * 100).toFixed(1)}% full`
          } else if (quotaUsage > 0.9) {
            status = 'unhealthy'
            message = `Storage quota ${(quotaUsage * 100).toFixed(1)}% full`
          }
          
          return {
            name: 'local-storage',
            status,
            responseTime: Date.now() - startTime,
            message,
            metadata: {
              quotaUsagePercent: (quotaUsage * 100).toFixed(1)
            },
            timestamp: new Date().toISOString()
          }
        } else {
          return {
            name: 'local-storage',
            status: 'unhealthy',
            responseTime: Date.now() - startTime,
            message: 'localStorage read/write failed',
            timestamp: new Date().toISOString()
          }
        }
      } catch (error: any) {
        return {
          name: 'local-storage',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  }
]

// Global health check runner instance
export const healthCheckRunner = new HealthCheckRunner()

// Initialize with default checks
export function initializeHealthChecks(baseUrl?: string): void {
  const checks = createDefaultHealthChecks(baseUrl)
  checks.forEach(check => healthCheckRunner.registerCheck(check))
}

// Convenience function for API route
export async function getSystemHealth(): Promise<SystemHealth> {
  return healthCheckRunner.runHealthChecks()
}
