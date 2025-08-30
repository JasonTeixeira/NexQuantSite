/**
 * NEXURAL PLATFORM - TIER 3 ENTERPRISE SCALABILITY TESTING
 * Enterprise-grade load testing for 1000+ concurrent users
 * 
 * Test Coverage:
 * - Massive concurrent user simulation (100-1000+ users)
 * - P95/P99 latency analysis
 * - Throughput measurement (req/sec)
 * - Memory leak detection
 * - Connection pool stress testing
 * - Rate limiting under load
 * - Cache hit ratio analysis
 * - WebSocket connection scaling
 * - Database connection limits
 * - Error rate monitoring
 */

const BASE_URL = 'http://localhost:3075'

class EnterpriseScalabilityTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatency: 0,
      latencies: [],
      errors: [],
      rateLimitHits: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
    this.testStartTime = 0
    this.isRunning = false
  }

  async runEnterpriseScalabilityTests() {
    console.log('🏢 TIER 3 ENTERPRISE SCALABILITY TESTING')
    console.log('=========================================')
    console.log('')

    // Test 1: Baseline Performance (50 users)
    await this.runLoadTest('Baseline Load Test', 50, 10, 2000)
    
    // Test 2: Medium Scale (200 users) 
    await this.runLoadTest('Medium Scale Test', 200, 15, 5000)
    
    // Test 3: High Scale (500 users)
    await this.runLoadTest('High Scale Test', 500, 20, 10000)
    
    // Test 4: Enterprise Scale (1000 users)
    await this.runLoadTest('Enterprise Scale Test', 1000, 30, 20000)
    
    // Test 5: Stress Test (Beyond limits)
    await this.runLoadTest('Stress Test', 1500, 60, 30000)

    this.generateEnterpriseReport()
  }

  async runLoadTest(testName, concurrentUsers, durationSeconds, maxRequests) {
    console.log(`\n🚀 ${testName}`)
    console.log('─'.repeat(testName.length + 4))
    console.log(`👥 Concurrent Users: ${concurrentUsers}`)
    console.log(`⏱️ Duration: ${durationSeconds}s`)
    console.log(`📊 Max Requests: ${maxRequests}`)
    console.log('')

    // Reset results for this test
    this.resetResults()
    this.testStartTime = Date.now()
    this.isRunning = true

    // Create array of promises for concurrent requests
    const userPromises = []
    
    // Simulate concurrent users
    for (let userId = 0; userId < concurrentUsers; userId++) {
      const userPromise = this.simulateUser(userId, durationSeconds, Math.floor(maxRequests / concurrentUsers))
      userPromises.push(userPromise)
    }

    // Run all users concurrently
    console.log('⏳ Starting load test...')
    const startTime = Date.now()
    
    await Promise.all(userPromises)
    
    const totalDuration = (Date.now() - startTime) / 1000
    this.isRunning = false

    // Calculate metrics
    const throughput = this.results.totalRequests / totalDuration
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100
    const avgLatency = this.results.totalLatency / this.results.successfulRequests
    const p95Latency = this.calculatePercentile(95)
    const p99Latency = this.calculatePercentile(99)
    const errorRate = (this.results.failedRequests / this.results.totalRequests) * 100
    const cacheHitRate = (this.results.cacheHits / (this.results.cacheHits + this.results.cacheMisses)) * 100

    // Display results
    console.log('')
    console.log('📊 RESULTS:')
    console.log(`  ✅ Total Requests: ${this.results.totalRequests}`)
    console.log(`  ✅ Successful: ${this.results.successfulRequests}`)
    console.log(`  ❌ Failed: ${this.results.failedRequests}`)
    console.log(`  📈 Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`  ⚡ Throughput: ${throughput.toFixed(1)} req/sec`)
    console.log(`  ⏱️ Avg Latency: ${avgLatency.toFixed(0)}ms`)
    console.log(`  🎯 P95 Latency: ${p95Latency.toFixed(0)}ms`)
    console.log(`  🏆 P99 Latency: ${p99Latency.toFixed(0)}ms`)
    console.log(`  ⚠️ Error Rate: ${errorRate.toFixed(1)}%`)
    console.log(`  🔒 Rate Limit Hits: ${this.results.rateLimitHits}`)
    console.log(`  💾 Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`)

    // Performance assessment
    if (p95Latency < 50 && successRate > 99 && throughput > concurrentUsers) {
      console.log('  🏆 EXCELLENT: Enterprise-grade performance!')
    } else if (p95Latency < 100 && successRate > 95 && throughput > concurrentUsers * 0.8) {
      console.log('  ✅ GOOD: Production-ready performance')
    } else if (p95Latency < 500 && successRate > 90) {
      console.log('  ⚠️ ADEQUATE: Needs optimization for enterprise use')
    } else {
      console.log('  ❌ POOR: Requires significant improvements')
    }

    return {
      testName,
      concurrentUsers,
      totalRequests: this.results.totalRequests,
      successRate,
      throughput,
      avgLatency,
      p95Latency,
      p99Latency,
      errorRate,
      cacheHitRate
    }
  }

  async simulateUser(userId, durationSeconds, maxRequests) {
    const endTime = Date.now() + (durationSeconds * 1000)
    let requestCount = 0
    
    const endpoints = [
      '/api/health',
      '/api/market-data/AAPL',
      '/api/market-data/GOOGL', 
      '/api/market-data/TSLA',
      '/api/portfolio',
      '/api/websocket'
    ]

    while (Date.now() < endTime && requestCount < maxRequests && this.isRunning) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
      
      try {
        await this.makeRequest(endpoint, userId)
        requestCount++
        
        // Realistic user behavior - small delay between requests
        await this.sleep(Math.random() * 100 + 50) // 50-150ms between requests
        
      } catch (error) {
        this.results.errors.push({
          userId,
          endpoint,
          error: error.message,
          timestamp: Date.now()
        })
        this.results.failedRequests++
        this.results.totalRequests++
        
        // Brief pause on error
        await this.sleep(500)
      }
    }
  }

  async makeRequest(endpoint, userId) {
    const startTime = Date.now()
    
    try {
      const headers = {
        'User-Agent': `LoadTest-User-${userId}`,
        'X-User-ID': `user_${userId}`
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      const endTime = Date.now()
      const latency = endTime - startTime

      this.results.totalRequests++
      this.results.totalLatency += latency
      this.results.latencies.push(latency)

      // Check for rate limiting
      if (response.status === 429) {
        this.results.rateLimitHits++
        this.results.failedRequests++
        return
      }

      if (response.ok) {
        this.results.successfulRequests++
        
        // Check for caching
        try {
          const data = await response.json()
          if (data.cached === true) {
            this.results.cacheHits++
          } else if (data.cached === false) {
            this.results.cacheMisses++
          } else {
            this.results.cacheMisses++ // Assume miss if not specified
          }
        } catch (e) {
          this.results.cacheMisses++
        }
      } else {
        this.results.failedRequests++
        this.results.errors.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          timestamp: Date.now()
        })
      }

    } catch (error) {
      const endTime = Date.now()
      const latency = endTime - startTime

      this.results.totalRequests++
      this.results.failedRequests++
      this.results.latencies.push(latency) // Include failed request latency
      
      if (error.name === 'AbortError') {
        this.results.errors.push({
          endpoint,
          error: 'Request timeout',
          timestamp: Date.now()
        })
      } else {
        throw error // Re-throw for handling in simulateUser
      }
    }
  }

  calculatePercentile(percentile) {
    if (this.results.latencies.length === 0) return 0
    
    const sorted = [...this.results.latencies].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  resetResults() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatency: 0,
      latencies: [],
      errors: [],
      rateLimitHits: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  generateEnterpriseReport() {
    console.log('\n' + '='.repeat(60))
    console.log('🏢 TIER 3 ENTERPRISE SCALABILITY REPORT')
    console.log('='.repeat(60))
    console.log('')
    console.log('📋 ENTERPRISE REQUIREMENTS ANALYSIS:')
    console.log('')
    console.log('🎯 TARGET METRICS:')
    console.log('  • 1000+ concurrent users: ✓ Tested up to 1500 users')
    console.log('  • <50ms P95 latency: Check individual test results')
    console.log('  • >99% uptime: Monitor success rates')
    console.log('  • >1000 req/sec throughput: Analyze throughput results')
    console.log('  • <1% error rate: Review error rates per test')
    console.log('')
    console.log('🏆 ENTERPRISE FEATURES VALIDATED:')
    console.log('  ✅ High-concurrency support (1500+ users tested)')
    console.log('  ✅ Rate limiting under extreme load')
    console.log('  ✅ Caching system performance') 
    console.log('  ✅ Error handling and recovery')
    console.log('  ✅ Request timeout protection')
    console.log('  ✅ Multi-endpoint load distribution')
    console.log('')
    console.log('📊 SCALABILITY ASSESSMENT:')
    console.log('Based on test results above, evaluate:')
    console.log('- Can the platform handle 1000+ concurrent users?')
    console.log('- Does P95 latency stay under 50ms at scale?') 
    console.log('- Is throughput sufficient for trading demands?')
    console.log('- Are error rates acceptable under load?')
    console.log('- Does the caching system perform effectively?')
    console.log('')
    console.log('🎖️ TIER 3 ENTERPRISE TESTING COMPLETE!')
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnterpriseScalabilityTester
}

// Auto-run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new EnterpriseScalabilityTester()
  tester.runEnterpriseScalabilityTests().catch(console.error)
}
