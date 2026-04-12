/**
 * Chaos Engineering Testing Suite
 * Netflix-style chaos testing for frontend resilience
 */

interface ChaosTestConfig {
  baseUrl: string
  testDuration: number // seconds
  scenarios: ChaosScenario[]
}

interface ChaosScenario {
  name: string
  description: string
  probability: number // 0-1
  enabled: boolean
  execute: () => Promise<void>
  cleanup?: () => Promise<void>
}

interface ChaosTestResult {
  scenario: string
  executed: boolean
  success: boolean
  error?: string
  impact: {
    responseTimeIncrease: number
    errorRateIncrease: number
    userExperienceImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }
  resilience: {
    recoveryTime: number // seconds
    gracefulDegradation: boolean
    userNotification: boolean
  }
}

export class ChaosTestRunner {
  private config: ChaosTestConfig
  private results: ChaosTestResult[] = []
  private originalFetch: typeof fetch
  private chaosActive: boolean = false

  constructor(config: ChaosTestConfig) {
    this.config = config
    this.originalFetch = globalThis.fetch
  }

  async runChaosTests(): Promise<ChaosTestResult[]> {
    console.log('🌪️  Starting Chaos Engineering Tests...')
    
    for (const scenario of this.config.scenarios) {
      if (!scenario.enabled) continue
      
      console.log(`\n🎭 Running: ${scenario.name}`)
      console.log(`   ${scenario.description}`)
      
      const result: ChaosTestResult = {
        scenario: scenario.name,
        executed: false,
        success: false,
        impact: {
          responseTimeIncrease: 0,
          errorRateIncrease: 0,
          userExperienceImpact: 'LOW'
        },
        resilience: {
          recoveryTime: 0,
          gracefulDegradation: false,
          userNotification: false
        }
      }

      try {
        // Baseline measurement
        const baselineMetrics = await this.measureBaseline()
        
        // Execute chaos
        this.chaosActive = true
        await scenario.execute()
        result.executed = true
        
        // Measure impact
        const chaosMetrics = await this.measureDuringChaos()
        result.impact = this.calculateImpact(baselineMetrics, chaosMetrics)
        
        // Test resilience
        result.resilience = await this.testResilience()
        
        // Cleanup
        if (scenario.cleanup) {
          await scenario.cleanup()
        }
        this.chaosActive = false
        
        result.success = true
        console.log(`   ✅ Completed: ${scenario.name}`)
        
      } catch (error: any) {
        result.error = error.message
        console.log(`   ❌ Failed: ${scenario.name} - ${error.message}`)
      }
      
      this.results.push(result)
      
      // Wait between scenarios
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    this.generateChaosReport()
    return this.results
  }

  private async measureBaseline(): Promise<any> {
    const startTime = Date.now()
    let successCount = 0
    let errorCount = 0
    let totalResponseTime = 0

    const requests = 10
    const promises = []

    for (let i = 0; i < requests; i++) {
      promises.push(
        fetch(`${this.config.baseUrl}/`)
          .then(response => {
            if (response.ok) {
              successCount++
            } else {
              errorCount++
            }
            totalResponseTime += Date.now() - startTime
            return response
          })
          .catch(() => {
            errorCount++
          })
      )
    }

    await Promise.all(promises)

    return {
      successRate: successCount / requests,
      averageResponseTime: totalResponseTime / requests,
      errorRate: errorCount / requests
    }
  }

  private async measureDuringChaos(): Promise<any> {
    // Same as baseline but during chaos
    return this.measureBaseline()
  }

  private calculateImpact(baseline: any, chaos: any): any {
    const responseTimeIncrease = chaos.averageResponseTime - baseline.averageResponseTime
    const errorRateIncrease = chaos.errorRate - baseline.errorRate

    let userExperienceImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'

    if (errorRateIncrease > 0.1 || responseTimeIncrease > 5000) {
      userExperienceImpact = 'CRITICAL'
    } else if (errorRateIncrease > 0.05 || responseTimeIncrease > 2000) {
      userExperienceImpact = 'HIGH'
    } else if (errorRateIncrease > 0.01 || responseTimeIncrease > 1000) {
      userExperienceImpact = 'MEDIUM'
    }

    return {
      responseTimeIncrease,
      errorRateIncrease,
      userExperienceImpact
    }
  }

  private async testResilience(): Promise<any> {
    const startTime = Date.now()
    let recovered = false
    let gracefulDegradation = false
    let userNotification = false

    // Test recovery
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/`)
        if (response.ok) {
          recovered = true
          break
        }
      } catch (error) {
        // Still failing
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const recoveryTime = (Date.now() - startTime) / 1000

    // Check for graceful degradation (simplified)
    try {
      const response = await fetch(`${this.config.baseUrl}/`)
      const text = await response.text()
      gracefulDegradation = text.includes('error') || text.includes('temporarily')
    } catch (error) {
      // No graceful degradation
    }

    return {
      recoveryTime,
      gracefulDegradation,
      userNotification // Would need DOM inspection
    }
  }

  private generateChaosReport(): void {
    console.log('\n' + '='.repeat(80))
    console.log('🌪️  CHAOS ENGINEERING REPORT')
    console.log('='.repeat(80))

    this.results.forEach(result => {
      console.log(`\n🎭 ${result.scenario}:`)
      console.log(`   Executed: ${result.executed ? '✅' : '❌'}`)
      console.log(`   Success: ${result.success ? '✅' : '❌'}`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      console.log(`   Impact:`)
      console.log(`     Response Time: +${result.impact.responseTimeIncrease.toFixed(0)}ms`)
      console.log(`     Error Rate: +${(result.impact.errorRateIncrease * 100).toFixed(1)}%`)
      console.log(`     UX Impact: ${result.impact.userExperienceImpact}`)
      
      console.log(`   Resilience:`)
      console.log(`     Recovery Time: ${result.resilience.recoveryTime.toFixed(1)}s`)
      console.log(`     Graceful Degradation: ${result.resilience.gracefulDegradation ? '✅' : '❌'}`)
      console.log(`     User Notification: ${result.resilience.userNotification ? '✅' : '❌'}`)
    })

    const criticalIssues = this.results.filter(r => r.impact.userExperienceImpact === 'CRITICAL')
    const poorResilience = this.results.filter(r => r.resilience.recoveryTime > 30)

    console.log('\n📊 SUMMARY:')
    console.log(`Total Scenarios: ${this.results.length}`)
    console.log(`Critical Issues: ${criticalIssues.length}`)
    console.log(`Poor Resilience: ${poorResilience.length}`)

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:')
      criticalIssues.forEach(issue => {
        console.log(`   ${issue.scenario}: ${issue.impact.userExperienceImpact} impact`)
      })
    }

    console.log('\n' + '='.repeat(80))
  }
}

// Default chaos scenarios for web applications
export const DEFAULT_CHAOS_SCENARIOS: ChaosScenario[] = [
  {
    name: 'Network Latency',
    description: 'Introduce 2-5 second network delays',
    probability: 1.0,
    enabled: true,
    execute: async () => {
      // Mock network delays by intercepting fetch
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (input, init) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000))
        return originalFetch(input, init)
      }
    },
    cleanup: async () => {
      // Restore original fetch (would need better state management in real implementation)
    }
  },
  {
    name: 'API Failures',
    description: 'Simulate 50% API failure rate',
    probability: 1.0,
    enabled: true,
    execute: async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (input, init) => {
        if (Math.random() < 0.5 && typeof input === 'string' && input.includes('/api/')) {
          throw new Error('Simulated API failure')
        }
        return originalFetch(input, init)
      }
    }
  },
  {
    name: 'Memory Pressure',
    description: 'Create memory pressure to test performance degradation',
    probability: 1.0,
    enabled: true,
    execute: async () => {
      // Create memory pressure (simplified)
      const memoryHogs: any[] = []
      for (let i = 0; i < 1000; i++) {
        memoryHogs.push(new Array(10000).fill('memory pressure test'))
      }
      // Keep references so GC doesn't clean up
      setTimeout(() => {
        memoryHogs.length = 0
      }, 30000)
    }
  },
  {
    name: 'Slow JavaScript Execution',
    description: 'Simulate slow JavaScript execution with CPU-intensive tasks',
    probability: 1.0,
    enabled: true,
    execute: async () => {
      // Block the main thread intermittently
      const blockingTask = () => {
        const start = Date.now()
        while (Date.now() - start < 100) {
          // Busy wait for 100ms
          Math.random()
        }
      }
      
      const interval = setInterval(blockingTask, 500)
      setTimeout(() => clearInterval(interval), 30000)
    }
  },
  {
    name: 'Storage Quota Exceeded',
    description: 'Fill localStorage to test storage error handling',
    probability: 1.0,
    enabled: true,
    execute: async () => {
      try {
        // Fill localStorage
        for (let i = 0; i < 1000; i++) {
          localStorage.setItem(`chaos_test_${i}`, 'x'.repeat(10000))
        }
      } catch (error) {
        // Expected quota exceeded error
      }
    },
    cleanup: async () => {
      // Clean up
      for (let i = 0; i < 1000; i++) {
        localStorage.removeItem(`chaos_test_${i}`)
      }
    }
  }
]

export const DEFAULT_CHAOS_CONFIG: ChaosTestConfig = {
  baseUrl: 'http://localhost:3060',
  testDuration: 300, // 5 minutes
  scenarios: DEFAULT_CHAOS_SCENARIOS
}
