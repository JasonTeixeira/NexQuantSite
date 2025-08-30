import { performanceMonitor } from "./performance-monitor"
import { cacheManager } from "./cache-manager"

interface OptimizationRule {
  id: string
  name: string
  condition: (metrics: any) => boolean
  action: () => Promise<void>
  priority: number
  cooldown: number
  lastExecuted?: number
}

interface OptimizationResult {
  ruleId: string
  executed: boolean
  improvement?: number
  error?: string
  timestamp: number
}

export class OptimizationEngine {
  private rules: OptimizationRule[] = []
  private results: OptimizationResult[] = []
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.setupDefaultRules()
  }

  private setupDefaultRules(): void {
    this.rules = [
      {
        id: "cache_cleanup",
        name: "Cache Cleanup",
        condition: (metrics) => metrics.memoryUsage > 80,
        action: async () => {
          const beforeSize = cacheManager.getStats().totalSize
          cacheManager.invalidateByTags(["expired", "low_priority"])
          const afterSize = cacheManager.getStats().totalSize
          console.log(`Cache cleanup: ${beforeSize - afterSize} bytes freed`)
        },
        priority: 1,
        cooldown: 60000, // 1 minute
      },
      {
        id: "preload_critical_data",
        name: "Preload Critical Data",
        condition: (metrics) => metrics.apiResponseTimes?.["critical"] > 1000,
        action: async () => {
          // Preload critical data during low usage
          const criticalEndpoints = ["/api/user/profile", "/api/trading/portfolio"]

          for (const endpoint of criticalEndpoints) {
            try {
              const response = await fetch(endpoint)
              const data = await response.json()
              cacheManager.set(`preload:${endpoint}`, data, 300000, ["preload", "critical"])
            } catch (error) {
              console.error(`Failed to preload ${endpoint}:`, error)
            }
          }
        },
        priority: 2,
        cooldown: 300000, // 5 minutes
      },
      {
        id: "optimize_images",
        name: "Optimize Images",
        condition: (metrics) => metrics.resourceLoadTimes?.images > 2000,
        action: async () => {
          // Trigger image optimization
          console.log("Triggering image optimization...")
          // This would typically call an image optimization service
        },
        priority: 3,
        cooldown: 600000, // 10 minutes
      },
      {
        id: "reduce_bundle_size",
        name: "Reduce Bundle Size",
        condition: (metrics) => metrics.resourceLoadTimes?.scripts > 3000,
        action: async () => {
          // Analyze and suggest bundle optimizations
          console.log("Analyzing bundle size for optimization opportunities...")
          // This would typically analyze webpack bundles and suggest optimizations
        },
        priority: 4,
        cooldown: 1800000, // 30 minutes
      },
      {
        id: "database_query_optimization",
        name: "Database Query Optimization",
        condition: (metrics) => metrics.apiResponseTimes?.database > 500,
        action: async () => {
          // Analyze slow queries and suggest optimizations
          console.log("Analyzing database queries for optimization...")
          // This would typically analyze query performance and suggest indexes
        },
        priority: 2,
        cooldown: 900000, // 15 minutes
      },
    ]
  }

  start(intervalMs = 30000): void {
    if (this.isRunning) {
      console.warn("Optimization engine is already running")
      return
    }

    this.isRunning = true
    console.log("Starting optimization engine...")

    this.intervalId = setInterval(() => {
      this.runOptimizationCycle()
    }, intervalMs)
  }

  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    console.log("Optimization engine stopped")
  }

  private async runOptimizationCycle(): Promise<void> {
    try {
      const metrics = performanceMonitor.getMetrics()
      const currentTime = Date.now()

      // Sort rules by priority
      const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority)

      for (const rule of sortedRules) {
        // Check cooldown
        if (rule.lastExecuted && currentTime - rule.lastExecuted < rule.cooldown) {
          continue
        }

        // Check condition
        if (rule.condition(metrics)) {
          try {
            const startTime = Date.now()
            await rule.action()
            const executionTime = Date.now() - startTime

            rule.lastExecuted = currentTime

            this.results.push({
              ruleId: rule.id,
              executed: true,
              improvement: executionTime,
              timestamp: currentTime,
            })

            console.log(`Optimization rule '${rule.name}' executed successfully`)
          } catch (error) {
            this.results.push({
              ruleId: rule.id,
              executed: false,
              error: error instanceof Error ? error.message : "Unknown error",
              timestamp: currentTime,
            })

            console.error(`Optimization rule '${rule.name}' failed:`, error)
          }
        }
      }

      // Clean up old results (keep last 100)
      if (this.results.length > 100) {
        this.results = this.results.slice(-100)
      }
    } catch (error) {
      console.error("Error in optimization cycle:", error)
    }
  }

  addRule(rule: OptimizationRule): void {
    this.rules.push(rule)
    console.log(`Added optimization rule: ${rule.name}`)
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex((rule) => rule.id === ruleId)
    if (index !== -1) {
      this.rules.splice(index, 1)
      console.log(`Removed optimization rule: ${ruleId}`)
      return true
    }
    return false
  }

  getResults(): OptimizationResult[] {
    return [...this.results]
  }

  getRules(): OptimizationRule[] {
    return [...this.rules]
  }

  getStats(): {
    totalRules: number
    executedRules: number
    failedRules: number
    averageExecutionTime: number
  } {
    const executed = this.results.filter((r) => r.executed)
    const failed = this.results.filter((r) => !r.executed)
    const avgTime =
      executed.length > 0 ? executed.reduce((sum, r) => sum + (r.improvement || 0), 0) / executed.length : 0

    return {
      totalRules: this.rules.length,
      executedRules: executed.length,
      failedRules: failed.length,
      averageExecutionTime: avgTime,
    }
  }

  // Manual optimization triggers
  async optimizeCache(): Promise<void> {
    const rule = this.rules.find((r) => r.id === "cache_cleanup")
    if (rule) {
      await rule.action()
    }
  }

  async optimizeImages(): Promise<void> {
    const rule = this.rules.find((r) => r.id === "optimize_images")
    if (rule) {
      await rule.action()
    }
  }

  async preloadCriticalData(): Promise<void> {
    const rule = this.rules.find((r) => r.id === "preload_critical_data")
    if (rule) {
      await rule.action()
    }
  }
}

export const optimizationEngine = new OptimizationEngine()
