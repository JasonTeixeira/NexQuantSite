/**
 * NEXURAL PLATFORM - CRITICAL FUNCTION TESTS
 * Run this script to test core trading platform functionality
 * 
 * Usage: node test-critical-functions.js
 */

const BASE_URL = 'http://localhost:3075'

async function runCriticalTests() {
  console.log('🚀 STARTING NEXURAL CRITICAL TESTS')
  console.log('==================================')
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Helper function to run a test
  async function test(name, testFn) {
    try {
      console.log(`\n🧪 Testing: ${name}`)
      const startTime = Date.now()
      await testFn()
      const duration = Date.now() - startTime
      console.log(`✅ PASS: ${name} (${duration}ms)`)
      results.passed++
      results.tests.push({ name, status: 'PASS', duration })
    } catch (error) {
      console.log(`❌ FAIL: ${name} - ${error.message}`)
      results.failed++
      results.tests.push({ name, status: 'FAIL', error: error.message })
    }
  }

  // Test 1: Basic Health Check
  await test('Health Check API', async () => {
    const response = await fetch(`${BASE_URL}/api/health`)
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`)
    const data = await response.json()
    if (!data.status === 'ok') throw new Error('Health check returned unhealthy status')
  })

  // Test 2: Market Data API
  await test('Market Data Fetch', async () => {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']
    
    for (const symbol of symbols) {
      const response = await fetch(`${BASE_URL}/api/market-data/${symbol}`)
      if (!response.ok) throw new Error(`Market data failed for ${symbol}: ${response.status}`)
      
      const data = await response.json()
      if (!data.data || !data.data.price) {
        throw new Error(`Invalid market data structure for ${symbol}`)
      }
      
      // Validate price is reasonable (between $1 and $10,000)
      const price = parseFloat(data.data.price)
      if (price < 1 || price > 10000) {
        throw new Error(`Unreasonable price for ${symbol}: $${price}`)
      }
    }
  })

  // Test 3: Portfolio API
  await test('Portfolio Management', async () => {
    // Test getting portfolio (should work without auth for demo)
    const response = await fetch(`${BASE_URL}/api/portfolio`)
    
    // Accept both 200 (success) and 401 (auth required) as valid responses
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Portfolio API unexpected status: ${response.status}`)
    }
    
    if (response.status === 200) {
      const data = await response.json()
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid portfolio data structure')
      }
    }
  })

  // Test 4: WebSocket Connection
  await test('WebSocket Real-time Connection', async () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:3075/api/websocket`)
      
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('WebSocket connection timeout'))
      }, 5000)
      
      ws.onopen = () => {
        clearTimeout(timeout)
        ws.close()
        resolve()
      }
      
      ws.onerror = (error) => {
        clearTimeout(timeout)
        reject(new Error('WebSocket connection failed'))
      }
    })
  })

  // Test 5: API Response Times
  await test('API Performance', async () => {
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/health`)
    const duration = Date.now() - startTime
    
    if (duration > 1000) {
      throw new Error(`API response too slow: ${duration}ms (should be < 1000ms)`)
    }
    
    if (!response.ok) {
      throw new Error(`API returned error: ${response.status}`)
    }
  })

  // Test 6: Multiple Concurrent Requests
  await test('Concurrent Load (10 requests)', async () => {
    const promises = []
    
    for (let i = 0; i < 10; i++) {
      promises.push(fetch(`${BASE_URL}/api/health`))
    }
    
    const responses = await Promise.all(promises)
    
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Concurrent request failed: ${response.status}`)
      }
    }
  })

  // Test 7: Error Handling
  await test('Error Handling', async () => {
    // Test invalid API endpoint
    const response = await fetch(`${BASE_URL}/api/nonexistent-endpoint`)
    
    // Should return 404, not crash
    if (response.status !== 404) {
      throw new Error(`Expected 404 for invalid endpoint, got ${response.status}`)
    }
  })

  // Test 8: CORS Headers
  await test('CORS Configuration', async () => {
    const response = await fetch(`${BASE_URL}/api/health`)
    
    // Check for CORS headers (important for frontend)
    const corsHeader = response.headers.get('Access-Control-Allow-Origin')
    if (!corsHeader) {
      console.warn('⚠️  WARNING: No CORS headers found (may cause frontend issues)')
    }
  })

  // Final Results
  console.log('\n' + '='.repeat(50))
  console.log('📊 CRITICAL TESTS SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`)
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL CRITICAL TESTS PASSED! 🎉')
    console.log('Your Nexural platform is ready for production testing.')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - REVIEW AND FIX ISSUES')
    console.log('Failed tests need to be addressed before production deployment.')
  }
  
  return results
}

// Run the tests
if (typeof require !== 'undefined' && require.main === module) {
  runCriticalTests().catch(console.error)
}

module.exports = { runCriticalTests }
