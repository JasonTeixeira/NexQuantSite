#!/usr/bin/env node

/**
 * Working Enterprise Load Test - Fixed Version
 * Tests for 1K-100K monthly users capacity
 */

const fs = require('fs')

// Simple but effective load test
async function runLoadScenario(name, concurrent, duration, description) {
  console.log(`\n🎯 RUNNING: ${name.toUpperCase()}`)
  console.log(`📊 ${description}`)
  console.log(`👥 ${concurrent} concurrent users for ${duration}s`)
  
  const startTime = Date.now()
  const results = {
    scenario: name,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: []
  }
  
  // Create workers
  const workers = []
  const endTime = startTime + (duration * 1000)
  
  // Worker function
  const worker = async (workerId) => {
    while (Date.now() < endTime) {
      const requestStart = Date.now()
      try {
        results.totalRequests++
        const response = await fetch('http://localhost:3060/')
        const responseTime = Date.now() - requestStart
        results.responseTimes.push(responseTime)
        
        if (response.ok) {
          results.successfulRequests++
        } else {
          results.failedRequests++
          results.errors.push(`HTTP ${response.status}`)
        }
      } catch (error) {
        results.failedRequests++
        results.errors.push(error.message)
        const responseTime = Date.now() - requestStart
        results.responseTimes.push(responseTime)
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 50))
    }
  }
  
  // Start all workers
  for (let i = 0; i < concurrent; i++) {
    workers.push(worker(i))
  }
  
  // Show progress
  const progressInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    console.log(`⏳ ${name} progress: ${elapsed}/${duration}s - ${results.totalRequests} requests`)
  }, 10000)
  
  try {
    await Promise.all(workers)
    clearInterval(progressInterval)
    
    // Calculate statistics
    const actualDuration = (Date.now() - startTime) / 1000
    const rps = results.totalRequests / actualDuration
    const successRate = (results.successfulRequests / results.totalRequests) * 100
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
    const maxResponseTime = Math.max(...results.responseTimes)
    const minResponseTime = Math.min(...results.responseTimes)
    
    // P95 calculation
    const sorted = results.responseTimes.sort((a, b) => a - b)
    const p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)]
    
    const finalResults = {
      ...results,
      duration: actualDuration,
      rps,
      successRate,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      p95ResponseTime
    }
    
    console.log(`✅ ${name} COMPLETED:`)
    console.log(`   📊 ${results.totalRequests.toLocaleString()} requests total`)
    console.log(`   ✅ ${successRate.toFixed(2)}% success rate`)
    console.log(`   ⚡ ${rps.toFixed(1)} requests/second`)
    console.log(`   ⏱️  ${avgResponseTime.toFixed(0)}ms avg response`)
    console.log(`   📈 ${p95ResponseTime.toFixed(0)}ms P95 response`)
    console.log(`   📊 ${minResponseTime}ms min, ${maxResponseTime}ms max`)
    
    // Performance assessment
    let assessment = '✅ EXCELLENT'
    if (successRate < 99.9) assessment = '⚠️  WARNING'
    if (successRate < 99) assessment = '❌ POOR'
    if (avgResponseTime > 2000) assessment = '⚠️  SLOW'
    if (avgResponseTime > 5000) assessment = '❌ TOO SLOW'
    
    console.log(`   🏆 Assessment: ${assessment}`)
    
    return finalResults
    
  } catch (error) {
    clearInterval(progressInterval)
    console.error(`❌ ${name} FAILED:`, error.message)
    return {
      scenario: name,
      error: error.message,
      success: false
    }
  }
}

async function runAllLoadTests() {
  console.log('\n🏢 ENTERPRISE LOAD TESTING FOR 1K-100K MONTHLY USERS')
  console.log('='.repeat(80))
  
  const scenarios = [
    {
      name: 'baseline-load',
      concurrent: 5,
      duration: 60, // 1 minute for faster testing
      description: 'Normal traffic (1K users/month)'
    },
    {
      name: 'moderate-load',
      concurrent: 15,
      duration: 120, // 2 minutes
      description: 'Growing traffic (10K users/month)'
    },
    {
      name: 'high-load',
      concurrent: 30,
      duration: 180, // 3 minutes
      description: 'Busy traffic (50K users/month)'
    },
    {
      name: 'peak-load',
      concurrent: 50,
      duration: 240, // 4 minutes
      description: 'Peak traffic (100K users/month)'
    }
  ]
  
  const results = []
  
  for (const scenario of scenarios) {
    const result = await runLoadScenario(
      scenario.name,
      scenario.concurrent,
      scenario.duration,
      scenario.description
    )
    
    results.push(result)
    
    // Cooldown between tests
    if (scenario !== scenarios[scenarios.length - 1]) {
      console.log('😴 Cooling down for 15 seconds...')
      await new Promise(resolve => setTimeout(resolve, 15000))
    }
  }
  
  // Generate final report
  generateFinalReport(results)
  
  return results
}

function generateFinalReport(results) {
  console.log('\n' + '='.repeat(80))
  console.log('🏆 FINAL ENTERPRISE LOAD TEST REPORT')
  console.log('='.repeat(80))
  
  const successful = results.filter(r => !r.error)
  const failed = results.filter(r => r.error)
  
  console.log(`\n📊 OVERALL SUMMARY:`)
  console.log(`   ✅ Successful scenarios: ${successful.length}/${results.length}`)
  console.log(`   ❌ Failed scenarios: ${failed.length}/${results.length}`)
  
  if (successful.length > 0) {
    console.log(`\n📈 DETAILED RESULTS:`)
    
    successful.forEach(result => {
      console.log(`\n   🎯 ${result.scenario.toUpperCase()}:`)
      console.log(`      📊 Total Requests: ${result.totalRequests.toLocaleString()}`)
      console.log(`      ✅ Success Rate: ${result.successRate.toFixed(2)}%`)
      console.log(`      ⚡ RPS: ${result.rps.toFixed(1)}`)
      console.log(`      ⏱️  Avg Response: ${result.avgResponseTime.toFixed(0)}ms`)
      console.log(`      📈 P95 Response: ${result.p95ResponseTime.toFixed(0)}ms`)
    })
    
    // Calculate capacity
    const maxConcurrent = successful.reduce((max, result) => {
      if (result.successRate >= 99) {
        const concurrent = getConcurrentUsers(result.scenario)
        return concurrent > max ? concurrent : max
      }
      return max
    }, 0)
    
    const monthlyCapacity = maxConcurrent * 20 * 30 // rough estimate
    
    console.log(`\n🎯 CAPACITY ANALYSIS:`)
    console.log(`   👥 Max Concurrent Users: ${maxConcurrent}`)
    console.log(`   📅 Estimated Monthly Capacity: ${monthlyCapacity.toLocaleString()} users`)
    
    // Overall score
    const avgSuccessRate = successful.reduce((sum, r) => sum + r.successRate, 0) / successful.length
    const avgResponseTime = successful.reduce((sum, r) => sum + r.avgResponseTime, 0) / successful.length
    
    let score = 0
    if (avgSuccessRate >= 99.9 && avgResponseTime <= 1000) score = 95
    else if (avgSuccessRate >= 99.5 && avgResponseTime <= 2000) score = 85
    else if (avgSuccessRate >= 99 && avgResponseTime <= 3000) score = 75
    else if (avgSuccessRate >= 95 && avgResponseTime <= 5000) score = 65
    else score = 40
    
    console.log(`\n🏆 ENTERPRISE READINESS SCORE: ${score}/100`)
    
    if (score >= 90) {
      console.log(`   🚀 VERDICT: READY FOR 100K+ MONTHLY USERS`)
    } else if (score >= 80) {
      console.log(`   🟡 VERDICT: READY FOR 50K MONTHLY USERS`)
    } else if (score >= 70) {
      console.log(`   🟠 VERDICT: READY FOR 10K MONTHLY USERS`)
    } else {
      console.log(`   🔴 VERDICT: NEEDS OPTIMIZATION`)
    }
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED SCENARIOS:`)
    failed.forEach(result => {
      console.log(`   ${result.scenario}: ${result.error}`)
    })
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      successful: successful.length,
      failed: failed.length,
      totalScenarios: results.length
    }
  }
  
  try {
    fs.writeFileSync('./test-reports/enterprise-load-results.json', JSON.stringify(report, null, 2))
    console.log(`\n📄 Report saved: ./test-reports/enterprise-load-results.json`)
  } catch (e) {
    console.log(`\n⚠️  Could not save report: ${e.message}`)
  }
  
  console.log('='.repeat(80))
}

function getConcurrentUsers(scenario) {
  const mapping = {
    'baseline-load': 5,
    'moderate-load': 15,
    'high-load': 30,
    'peak-load': 50
  }
  return mapping[scenario] || 1
}

// Run if called directly
if (require.main === module) {
  runAllLoadTests().catch(console.error)
}

module.exports = { runAllLoadTests }
