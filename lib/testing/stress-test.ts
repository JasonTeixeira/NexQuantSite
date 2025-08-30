/**
 * Comprehensive Stress Testing Infrastructure
 * SRE-grade testing for production readiness
 */

interface StressTestConfig {
  baseUrl: string
  concurrent: number
  duration: number // seconds
  rampUpTime: number // seconds
  endpoints: string[]
  expectedResponseTime: number // ms
  expectedSuccessRate: number // percentage
}

interface TestResult {
  endpoint: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  successRate: number
  errorsPerSecond: number
  requestsPerSecond: number
  errors: Array<{
    error: string
    count: number
    percentage: number
  }>
}

interface StressTestReport {
  startTime: string
  endTime: string
  duration: number
  totalRequests: number
  totalErrors: number
  overallSuccessRate: number
  averageResponseTime: number
  peakRPS: number
  results: TestResult[]
  recommendations: string[]
  slaViolations: string[]
}

export class StressTestRunner {
  private config: StressTestConfig
  private results: Map<string, TestResult> = new Map()
  private startTime: number = 0
  private activeRequests: number = 0

  constructor(config: StressTestConfig) {
    this.config = config
  }

  async runStressTest(): Promise<StressTestReport> {
    console.log('🚀 Starting SRE Stress Test...')
    console.log(`Configuration:`, this.config)

    this.startTime = Date.now()
    const promises: Promise<void>[] = []

    // Initialize results
    for (const endpoint of this.config.endpoints) {
      this.results.set(endpoint, {
        endpoint,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        successRate: 0,
        errorsPerSecond: 0,
        requestsPerSecond: 0,
        errors: []
      })
    }

    // Ramp up gradually
    const rampUpInterval = (this.config.rampUpTime * 1000) / this.config.concurrent
    
    for (let i = 0; i < this.config.concurrent; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            this.startWorker().then(resolve)
          }, i * rampUpInterval)
        })
      )
    }

    // Wait for all workers to complete
    await Promise.all(promises)

    return this.generateReport()
  }

  private async startWorker(): Promise<void> {
    const endTime = this.startTime + (this.config.duration * 1000)
    
    while (Date.now() < endTime) {
      for (const endpoint of this.config.endpoints) {
        if (Date.now() >= endTime) break
        
        await this.makeRequest(endpoint)
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
  }

  private async makeRequest(endpoint: string): Promise<void> {
    const result = this.results.get(endpoint)!
    const startTime = Date.now()
    
    this.activeRequests++
    result.totalRequests++

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'StressTest/1.0'
        }
      })

      clearTimeout(timeoutId)
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        result.successfulRequests++
        this.updateResponseTime(result, responseTime)
      } else {
        result.failedRequests++
        this.recordError(result, `HTTP ${response.status}`)
      }
      
    } catch (error: any) {
      result.failedRequests++
      this.recordError(result, error.message || 'Unknown error')
    } finally {
      this.activeRequests--
    }
  }

  private updateResponseTime(result: TestResult, responseTime: number): void {
    result.maxResponseTime = Math.max(result.maxResponseTime, responseTime)
    result.minResponseTime = Math.min(result.minResponseTime, responseTime)
    
    // Update running average
    const totalSuccessTime = result.averageResponseTime * (result.successfulRequests - 1)
    result.averageResponseTime = (totalSuccessTime + responseTime) / result.successfulRequests
  }

  private recordError(result: TestResult, errorMessage: string): void {
    const existingError = result.errors.find(e => e.error === errorMessage)
    if (existingError) {
      existingError.count++
    } else {
      result.errors.push({ error: errorMessage, count: 1, percentage: 0 })
    }
  }

  private generateReport(): StressTestReport {
    const endTime = Date.now()
    const duration = (endTime - this.startTime) / 1000

    let totalRequests = 0
    let totalErrors = 0
    let totalResponseTime = 0
    let totalSuccessful = 0

    // Finalize results
    for (const result of this.results.values()) {
      result.successRate = (result.successfulRequests / result.totalRequests) * 100
      result.requestsPerSecond = result.totalRequests / duration
      result.errorsPerSecond = result.failedRequests / duration

      // Update error percentages
      result.errors.forEach(error => {
        error.percentage = (error.count / result.failedRequests) * 100
      })

      totalRequests += result.totalRequests
      totalErrors += result.failedRequests
      totalResponseTime += result.averageResponseTime * result.successfulRequests
      totalSuccessful += result.successfulRequests
    }

    const report: StressTestReport = {
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      totalRequests,
      totalErrors,
      overallSuccessRate: (totalSuccessful / totalRequests) * 100,
      averageResponseTime: totalResponseTime / totalSuccessful,
      peakRPS: totalRequests / duration,
      results: Array.from(this.results.values()),
      recommendations: this.generateRecommendations(),
      slaViolations: this.checkSLAViolations()
    }

    return report
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    for (const result of this.results.values()) {
      if (result.successRate < this.config.expectedSuccessRate) {
        recommendations.push(
          `❌ ${result.endpoint}: Success rate ${result.successRate.toFixed(1)}% below target ${this.config.expectedSuccessRate}%`
        )
      }
      
      if (result.averageResponseTime > this.config.expectedResponseTime) {
        recommendations.push(
          `⚠️  ${result.endpoint}: Average response time ${result.averageResponseTime.toFixed(0)}ms exceeds target ${this.config.expectedResponseTime}ms`
        )
      }
      
      if (result.maxResponseTime > this.config.expectedResponseTime * 3) {
        recommendations.push(
          `🚨 ${result.endpoint}: Max response time ${result.maxResponseTime}ms indicates performance spikes`
        )
      }
    }

    // Overall recommendations
    if (this.results.size > 0) {
      const avgSuccessRate = Array.from(this.results.values())
        .reduce((sum, r) => sum + r.successRate, 0) / this.results.size
        
      if (avgSuccessRate < 99.9) {
        recommendations.push('🔧 Consider adding circuit breakers and retry logic')
      }
      
      if (avgSuccessRate < 99) {
        recommendations.push('🚨 Critical: Success rate indicates system instability')
      }
    }

    return recommendations
  }

  private checkSLAViolations(): string[] {
    const violations: string[] = []
    
    for (const result of this.results.values()) {
      // SLA: 99.9% success rate
      if (result.successRate < 99.9) {
        violations.push(`SLA BREACH: ${result.endpoint} - Success rate ${result.successRate.toFixed(3)}% < 99.9%`)
      }
      
      // SLA: P95 response time under expected threshold
      if (result.averageResponseTime > this.config.expectedResponseTime) {
        violations.push(`SLA BREACH: ${result.endpoint} - Response time ${result.averageResponseTime.toFixed(0)}ms > ${this.config.expectedResponseTime}ms`)
      }
    }

    return violations
  }
}

// Default configuration for web app stress testing
export const DEFAULT_STRESS_CONFIG: StressTestConfig = {
  baseUrl: 'http://localhost:3060',
  concurrent: 50,
  duration: 300, // 5 minutes
  rampUpTime: 30, // 30 seconds
  endpoints: [
    '/',
    '/dashboard',
    '/login',
    '/pricing',
    '/bots',
    '/signals-pro',
    '/api/placeholder/400/300'
  ],
  expectedResponseTime: 2000, // 2 seconds
  expectedSuccessRate: 99.9 // 99.9%
}

// CLI runner
export async function runStressTest(config: Partial<StressTestConfig> = {}): Promise<void> {
  const finalConfig = { ...DEFAULT_STRESS_CONFIG, ...config }
  const runner = new StressTestRunner(finalConfig)
  
  try {
    const report = await runner.runStressTest()
    
    console.log('\n' + '='.repeat(80))
    console.log('🎯 STRESS TEST REPORT')
    console.log('='.repeat(80))
    console.log(`Duration: ${report.duration.toFixed(1)}s`)
    console.log(`Total Requests: ${report.totalRequests.toLocaleString()}`)
    console.log(`Success Rate: ${report.overallSuccessRate.toFixed(2)}%`)
    console.log(`Average Response Time: ${report.averageResponseTime.toFixed(0)}ms`)
    console.log(`Peak RPS: ${report.peakRPS.toFixed(1)}`)
    
    console.log('\n📊 ENDPOINT BREAKDOWN:')
    for (const result of report.results) {
      console.log(`\n${result.endpoint}:`)
      console.log(`  Requests: ${result.totalRequests.toLocaleString()}`)
      console.log(`  Success Rate: ${result.successRate.toFixed(2)}%`)
      console.log(`  Avg Response: ${result.averageResponseTime.toFixed(0)}ms`)
      console.log(`  RPS: ${result.requestsPerSecond.toFixed(1)}`)
      
      if (result.errors.length > 0) {
        console.log(`  Errors:`)
        result.errors.forEach(error => {
          console.log(`    ${error.error}: ${error.count} (${error.percentage.toFixed(1)}%)`)
        })
      }
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:')
      report.recommendations.forEach(rec => console.log(`  ${rec}`))
    }
    
    if (report.slaViolations.length > 0) {
      console.log('\n🚨 SLA VIOLATIONS:')
      report.slaViolations.forEach(violation => console.log(`  ${violation}`))
    }
    
    console.log('\n' + '='.repeat(80))
    
    // Save detailed report
    const fs = require('fs')
    fs.writeFileSync('stress-test-report.json', JSON.stringify(report, null, 2))
    console.log('📄 Detailed report saved to: stress-test-report.json')
    
  } catch (error) {
    console.error('❌ Stress test failed:', error)
  }
}
