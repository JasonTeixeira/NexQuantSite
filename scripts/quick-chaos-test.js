#!/usr/bin/env node

/**
 * Quick Chaos Engineering Test
 * Simulates various failure scenarios
 */

async function runChaosTests() {
  console.log('\n🌪️  CHAOS ENGINEERING TESTS - FAILURE SCENARIOS')
  console.log('='.repeat(60))
  
  const results = []
  
  // Test 1: Network Delay Simulation
  console.log('\n🎭 TEST 1: Network Latency Simulation')
  console.log('Simulating slow network conditions...')
  
  const baselineStart = Date.now()
  try {
    const baselineResponse = await fetch('http://localhost:3060/')
    const baselineTime = Date.now() - baselineStart
    console.log(`✅ Baseline response: ${baselineTime}ms`)
    
    // Simulate network delay by making many concurrent requests
    const delayStart = Date.now()
    const delayPromises = []
    for (let i = 0; i < 20; i++) {
      delayPromises.push(fetch('http://localhost:3060/'))
    }
    
    await Promise.all(delayPromises)
    const delayTime = Date.now() - delayStart
    console.log(`⚠️  Under load response: ${delayTime}ms (${Math.round(delayTime/20)}ms avg per request)`)
    
    results.push({
      test: 'Network Latency',
      baseline: baselineTime,
      underLoad: Math.round(delayTime/20),
      degradation: Math.round((delayTime/20) / baselineTime * 100) + '%',
      passed: (delayTime/20) < baselineTime * 3
    })
    
  } catch (error) {
    console.log(`❌ Network test failed: ${error.message}`)
    results.push({ test: 'Network Latency', error: error.message, passed: false })
  }
  
  // Test 2: Rapid Fire Requests (Stress)
  console.log('\n🎭 TEST 2: Rapid Fire Request Storm')
  console.log('Sending 50 rapid requests...')
  
  const rapidStart = Date.now()
  let rapidSuccess = 0
  let rapidFail = 0
  
  const rapidPromises = []
  for (let i = 0; i < 50; i++) {
    rapidPromises.push(
      fetch('http://localhost:3060/')
        .then(response => response.ok ? rapidSuccess++ : rapidFail++)
        .catch(() => rapidFail++)
    )
  }
  
  try {
    await Promise.all(rapidPromises)
    const rapidTime = Date.now() - rapidStart
    const successRate = (rapidSuccess / 50) * 100
    
    console.log(`📊 Results: ${rapidSuccess}/50 successful (${successRate.toFixed(1)}%)`)
    console.log(`⏱️  Total time: ${rapidTime}ms (${Math.round(rapidTime/50)}ms avg)`)
    
    results.push({
      test: 'Rapid Fire Storm',
      requests: 50,
      successful: rapidSuccess,
      failed: rapidFail,
      successRate: successRate.toFixed(1) + '%',
      avgResponseTime: Math.round(rapidTime/50) + 'ms',
      passed: successRate > 90
    })
    
  } catch (error) {
    console.log(`❌ Rapid fire test failed: ${error.message}`)
    results.push({ test: 'Rapid Fire Storm', error: error.message, passed: false })
  }
  
  // Test 3: Mixed Endpoint Stress
  console.log('\n🎭 TEST 3: Mixed Endpoint Chaos')
  console.log('Testing multiple endpoints simultaneously...')
  
  const endpoints = [
    '/',
    '/dashboard', 
    '/pricing',
    '/login',
    '/api/health',
    '/api/placeholder/400/300'
  ]
  
  const mixedStart = Date.now()
  let mixedSuccess = 0
  let mixedFail = 0
  
  const mixedPromises = []
  
  // 10 requests to each endpoint
  for (const endpoint of endpoints) {
    for (let i = 0; i < 10; i++) {
      mixedPromises.push(
        fetch(`http://localhost:3060${endpoint}`)
          .then(response => response.ok ? mixedSuccess++ : mixedFail++)
          .catch(() => mixedFail++)
      )
    }
  }
  
  try {
    await Promise.all(mixedPromises)
    const mixedTime = Date.now() - mixedStart
    const totalRequests = endpoints.length * 10
    const mixedSuccessRate = (mixedSuccess / totalRequests) * 100
    
    console.log(`📊 Results: ${mixedSuccess}/${totalRequests} successful (${mixedSuccessRate.toFixed(1)}%)`)
    console.log(`⏱️  Total time: ${mixedTime}ms (${Math.round(mixedTime/totalRequests)}ms avg)`)
    
    results.push({
      test: 'Mixed Endpoint Chaos',
      endpoints: endpoints.length,
      totalRequests: totalRequests,
      successful: mixedSuccess,
      failed: mixedFail,
      successRate: mixedSuccessRate.toFixed(1) + '%',
      avgResponseTime: Math.round(mixedTime/totalRequests) + 'ms',
      passed: mixedSuccessRate > 95
    })
    
  } catch (error) {
    console.log(`❌ Mixed endpoint test failed: ${error.message}`)
    results.push({ test: 'Mixed Endpoint Chaos', error: error.message, passed: false })
  }
  
  // Final Report
  generateChaosReport(results)
  
  return results
}

function generateChaosReport(results) {
  console.log('\n' + '='.repeat(60))
  console.log('🌪️  CHAOS ENGINEERING REPORT')
  console.log('='.repeat(60))
  
  const passed = results.filter(r => r.passed)
  const failed = results.filter(r => !r.passed)
  
  console.log(`\n📊 CHAOS TEST SUMMARY:`)
  console.log(`   ✅ Passed: ${passed.length}/${results.length}`)
  console.log(`   ❌ Failed: ${failed.length}/${results.length}`)
  
  console.log(`\n📈 DETAILED RESULTS:`)
  results.forEach((result, index) => {
    console.log(`\n   ${index + 1}. ${result.test}:`)
    if (result.error) {
      console.log(`      ❌ Error: ${result.error}`)
    } else {
      Object.keys(result).forEach(key => {
        if (key !== 'test' && key !== 'passed') {
          console.log(`      ${key}: ${result[key]}`)
        }
      })
      console.log(`      Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
    }
  })
  
  console.log(`\n🎯 RESILIENCE ASSESSMENT:`)
  if (passed.length === results.length) {
    console.log(`   🟢 EXCELLENT: System handles chaos scenarios well`)
  } else if (passed.length >= results.length * 0.7) {
    console.log(`   🟡 GOOD: System mostly resilient with some issues`)
  } else if (passed.length >= results.length * 0.5) {
    console.log(`   🟠 MODERATE: System has resilience issues`)
  } else {
    console.log(`   🔴 POOR: System not resilient to chaos scenarios`)
  }
  
  console.log('='.repeat(60))
}

// Run if called directly
if (require.main === module) {
  runChaosTests().catch(console.error)
}

module.exports = { runChaosTests }
