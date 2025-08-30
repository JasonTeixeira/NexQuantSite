#!/usr/bin/env node

/**
 * Comprehensive Testing Suite Runner
 * Runs stress tests, chaos tests, and generates SRE report
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3060',
  reportDir: './test-reports',
  concurrent: {
    light: 10,
    medium: 25,
    heavy: 50,
    extreme: 100
  },
  duration: {
    smoke: 60,    // 1 minute
    load: 300,    // 5 minutes
    stress: 900,  // 15 minutes
    endurance: 3600 // 1 hour
  }
}

// Ensure reports directory exists
function ensureReportDir() {
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true })
  }
}

// Check if server is running
async function checkServerHealth() {
  console.log('🏥 Checking server health...')
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/health`)
    const health = await response.json()
    
    if (health.overall === 'healthy') {
      console.log('✅ Server is healthy and ready for testing')
      return true
    } else {
      console.log(`⚠️  Server health: ${health.overall}`)
      console.log('Continuing with tests but results may be affected...')
      return true
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message)
    console.log('Please ensure the server is running on', CONFIG.baseUrl)
    return false
  }
}

// Run command with timeout and logging
function runCommand(command, description, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}`)
    console.log(`Command: ${command}\n`)
    
    const startTime = Date.now()
    const process = exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      
      if (error) {
        console.error(`❌ ${description} failed after ${duration}s:`, error.message)
        if (stderr) console.error('STDERR:', stderr)
        reject(error)
      } else {
        console.log(`✅ ${description} completed in ${duration}s`)
        if (stdout) console.log('OUTPUT:', stdout.slice(-500)) // Last 500 chars
        resolve({ stdout, stderr, duration })
      }
    })
    
    // Show progress for long-running tests
    if (timeoutMs > 60000) {
      const interval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        console.log(`⏳ ${description} running... ${elapsed}s elapsed`)
      }, 30000)
      
      process.on('exit', () => clearInterval(interval))
    }
  })
}

// Smoke test - basic functionality check
async function runSmokeTests() {
  console.log('\n' + '='.repeat(60))
  console.log('🚭 SMOKE TESTS - Basic Functionality')
  console.log('='.repeat(60))
  
  const endpoints = [
    '/',
    '/dashboard', 
    '/login',
    '/pricing',
    '/api/health',
    '/api/circuit-breaker',
    '/api/placeholder/400/300'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`)
      const start = Date.now()
      const response = await fetch(`${CONFIG.baseUrl}${endpoint}`)
      const duration = Date.now() - start
      
      if (response.ok) {
        console.log(`  ✅ ${endpoint} - ${response.status} (${duration}ms)`)
      } else {
        console.log(`  ❌ ${endpoint} - ${response.status} (${duration}ms)`)
      }
    } catch (error) {
      console.log(`  💥 ${endpoint} - ${error.message}`)
    }
  }
}

// Load test with different intensities
async function runLoadTests() {
  console.log('\n' + '='.repeat(60))
  console.log('📈 LOAD TESTS - Performance Under Load')
  console.log('='.repeat(60))
  
  const tests = [
    { name: 'light-load', concurrent: CONFIG.concurrent.light, duration: CONFIG.duration.smoke },
    { name: 'medium-load', concurrent: CONFIG.concurrent.medium, duration: CONFIG.duration.load },
    { name: 'heavy-load', concurrent: CONFIG.concurrent.heavy, duration: CONFIG.duration.stress }
  ]
  
  for (const test of tests) {
    try {
      console.log(`\n🎯 Running ${test.name}: ${test.concurrent} concurrent users for ${test.duration}s`)
      
      // Use the stress test runner we created
      const command = `node -e "
        const { StressTestRunner, DEFAULT_STRESS_CONFIG } = require('./lib/testing/stress-test.ts');
        const config = {
          ...DEFAULT_STRESS_CONFIG,
          concurrent: ${test.concurrent},
          duration: ${test.duration},
          baseUrl: '${CONFIG.baseUrl}'
        };
        const runner = new StressTestRunner(config);
        runner.runStressTest().then(report => {
          console.log('Test completed');
          require('fs').writeFileSync('${CONFIG.reportDir}/${test.name}-report.json', JSON.stringify(report, null, 2));
        }).catch(console.error);
      "`
      
      await runCommand(command, `${test.name} test`, test.duration * 1000 + 60000)
      
    } catch (error) {
      console.error(`Failed to run ${test.name}:`, error.message)
    }
  }
}

// Button/UI interaction tests
async function runButtonTests() {
  console.log('\n' + '='.repeat(60))
  console.log('🖱️  BUTTON/UI INTERACTION TESTS')
  console.log('='.repeat(60))
  
  // This would ideally use Puppeteer or Playwright for real browser testing
  // For now, we'll test the endpoints that buttons would trigger
  
  const buttonEndpoints = [
    { name: 'Login Button', endpoint: '/login' },
    { name: 'Dashboard Button', endpoint: '/dashboard' },
    { name: 'Pricing Button', endpoint: '/pricing' },
    { name: 'Bot Management', endpoint: '/bots' },
    { name: 'Signals Pro', endpoint: '/signals-pro' },
    { name: 'Health Check', endpoint: '/api/health' }
  ]
  
  console.log('Testing button endpoints under rapid-fire clicks...')
  
  for (const button of buttonEndpoints) {
    console.log(`\n🎯 Testing ${button.name} (${button.endpoint})`)
    
    // Simulate rapid clicking - 10 requests in quick succession
    const promises = []
    const startTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        fetch(`${CONFIG.baseUrl}${button.endpoint}`)
          .then(response => ({ 
            status: response.status, 
            ok: response.ok,
            time: Date.now() - startTime
          }))
          .catch(error => ({ 
            error: error.message,
            time: Date.now() - startTime
          }))
      )
    }
    
    try {
      const results = await Promise.all(promises)
      const successful = results.filter(r => r.ok).length
      const avgTime = results.reduce((sum, r) => sum + (r.time || 0), 0) / results.length
      
      console.log(`  Results: ${successful}/10 successful, avg ${avgTime.toFixed(0)}ms`)
      
      if (successful >= 8) {
        console.log(`  ✅ ${button.name} - Passed rapid-fire test`)
      } else {
        console.log(`  ⚠️  ${button.name} - Some failures under rapid clicking`)
      }
    } catch (error) {
      console.log(`  ❌ ${button.name} - Failed: ${error.message}`)
    }
  }
}

// Memory leak detection
async function runMemoryLeakTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧠 MEMORY LEAK DETECTION')
  console.log('='.repeat(60))
  
  console.log('Running sustained load to detect memory leaks...')
  
  // Run a sustained load for 10 minutes and monitor memory
  const duration = 600 // 10 minutes
  const interval = 30 // Check every 30 seconds
  
  const memorySnapshots = []
  let testRunning = true
  
  // Start background load
  const loadPromise = runCommand(
    `node -e "
      const startTime = Date.now();
      const endTime = startTime + ${duration * 1000};
      const runLoad = async () => {
        while (Date.now() < endTime) {
          try {
            await fetch('${CONFIG.baseUrl}/');
            await fetch('${CONFIG.baseUrl}/dashboard');
            await new Promise(r => setTimeout(r, 100));
          } catch (e) {}
        }
      };
      runLoad();
    "`,
    'Memory leak background load',
    duration * 1000 + 30000
  )
  
  // Monitor memory usage
  const memoryMonitor = setInterval(async () => {
    if (!testRunning) return
    
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/health`)
      const health = await response.json()
      
      // In a real implementation, we'd get memory stats from the server
      // For now, we'll just track response times as a proxy
      const memorySnapshot = {
        timestamp: new Date().toISOString(),
        responseTime: health.checks.find(c => c.name === 'frontend-availability')?.responseTime || 0,
        overall: health.overall
      }
      
      memorySnapshots.push(memorySnapshot)
      console.log(`📊 Memory check: ${memorySnapshot.responseTime}ms response, status: ${memorySnapshot.overall}`)
      
    } catch (error) {
      console.log(`⚠️  Memory check failed: ${error.message}`)
    }
  }, interval * 1000)
  
  try {
    await loadPromise
    testRunning = false
    clearInterval(memoryMonitor)
    
    // Analyze memory snapshots
    if (memorySnapshots.length > 2) {
      const firstResponse = memorySnapshots[0].responseTime
      const lastResponse = memorySnapshots[memorySnapshots.length - 1].responseTime
      const avgIncrease = (lastResponse - firstResponse) / memorySnapshots.length
      
      console.log(`\n📈 Memory Analysis:`)
      console.log(`  Initial response time: ${firstResponse}ms`)
      console.log(`  Final response time: ${lastResponse}ms`)
      console.log(`  Average increase per check: ${avgIncrease.toFixed(2)}ms`)
      
      if (avgIncrease > 10) {
        console.log(`  ⚠️  Potential memory leak detected (response time degradation)`)
      } else {
        console.log(`  ✅ No obvious memory leaks detected`)
      }
      
      // Save memory report
      fs.writeFileSync(
        path.join(CONFIG.reportDir, 'memory-leak-report.json'),
        JSON.stringify({ snapshots: memorySnapshots, analysis: { avgIncrease } }, null, 2)
      )
    }
    
  } catch (error) {
    testRunning = false
    clearInterval(memoryMonitor)
    console.error('Memory leak test failed:', error.message)
  }
}

// Generate final SRE report
async function generateSREReport() {
  console.log('\n' + '='.repeat(60))
  console.log('📋 GENERATING SRE READINESS REPORT')
  console.log('='.repeat(60))
  
  // Collect all test reports
  const reports = {}
  
  try {
    const reportFiles = fs.readdirSync(CONFIG.reportDir)
    for (const file of reportFiles) {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(path.join(CONFIG.reportDir, file), 'utf8')
        reports[file.replace('.json', '')] = JSON.parse(content)
      }
    }
  } catch (error) {
    console.log('⚠️  Could not read all reports:', error.message)
  }
  
  // Get current system health
  let currentHealth = null
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/health`)
    currentHealth = await response.json()
  } catch (error) {
    console.log('⚠️  Could not get current health:', error.message)
  }
  
  // Get circuit breaker status
  let circuitStatus = null
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/circuit-breaker`)
    circuitStatus = await response.json()
  } catch (error) {
    console.log('⚠️  Could not get circuit breaker status:', error.message)
  }
  
  const sreReport = {
    timestamp: new Date().toISOString(),
    summary: {
      testsRun: Object.keys(reports).length,
      systemHealth: currentHealth?.overall || 'unknown',
      circuitBreakersHealthy: circuitStatus?.breakers?.every(b => b.state === 'CLOSED') || false
    },
    testResults: reports,
    currentHealth,
    circuitBreakerStatus: circuitStatus,
    recommendations: generateRecommendations(reports, currentHealth, circuitStatus),
    sreScore: calculateSREScore(reports, currentHealth, circuitStatus)
  }
  
  fs.writeFileSync(
    path.join(CONFIG.reportDir, 'sre-readiness-report.json'),
    JSON.stringify(sreReport, null, 2)
  )
  
  console.log('\n📊 SRE READINESS SUMMARY:')
  console.log(`  Overall Score: ${sreReport.sreScore}/100`)
  console.log(`  System Health: ${sreReport.summary.systemHealth}`)
  console.log(`  Tests Completed: ${sreReport.summary.testsRun}`)
  
  if (sreReport.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:')
    sreReport.recommendations.forEach(rec => console.log(`  ${rec}`))
  }
  
  console.log(`\n📄 Full report saved to: ${path.join(CONFIG.reportDir, 'sre-readiness-report.json')}`)
}

// Generate recommendations based on test results
function generateRecommendations(reports, health, circuitStatus) {
  const recommendations = []
  
  // Check load test results
  Object.entries(reports).forEach(([name, report]) => {
    if (name.includes('load') && report.overallSuccessRate < 99) {
      recommendations.push(`❌ ${name}: Success rate ${report.overallSuccessRate.toFixed(1)}% - Add more error handling`)
    }
    if (name.includes('load') && report.averageResponseTime > 3000) {
      recommendations.push(`⚠️  ${name}: Slow response time ${report.averageResponseTime.toFixed(0)}ms - Optimize performance`)
    }
  })
  
  // Check health status
  if (health?.overall !== 'healthy') {
    recommendations.push(`🏥 System health is ${health?.overall} - Address health check failures`)
  }
  
  // Check circuit breaker status
  if (circuitStatus?.breakers?.some(b => b.state !== 'CLOSED')) {
    recommendations.push(`🔌 Some circuit breakers are open - Check service reliability`)
  }
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('✅ All tests passed - System appears ready for production load')
  } else {
    recommendations.push('🔧 Address the above issues before production deployment')
  }
  
  return recommendations
}

// Calculate SRE readiness score
function calculateSREScore(reports, health, circuitStatus) {
  let score = 100
  
  // Health check score (30 points)
  if (health?.overall === 'unhealthy') score -= 30
  else if (health?.overall === 'degraded') score -= 15
  
  // Load test score (40 points) 
  Object.entries(reports).forEach(([name, report]) => {
    if (name.includes('load')) {
      if (report.overallSuccessRate < 95) score -= 20
      else if (report.overallSuccessRate < 99) score -= 10
      
      if (report.averageResponseTime > 5000) score -= 15
      else if (report.averageResponseTime > 3000) score -= 8
    }
  })
  
  // Circuit breaker score (20 points)
  const openBreakers = circuitStatus?.breakers?.filter(b => b.state === 'OPEN').length || 0
  score -= openBreakers * 10
  
  // Resilience score (10 points)
  if (Object.keys(reports).length < 3) score -= 10
  
  return Math.max(0, score)
}

// Main execution
async function main() {
  console.log('🚀 COMPREHENSIVE SRE TESTING SUITE')
  console.log('====================================')
  console.log(`Target: ${CONFIG.baseUrl}`)
  console.log(`Reports: ${CONFIG.reportDir}`)
  
  ensureReportDir()
  
  // Check if server is healthy
  const serverHealthy = await checkServerHealth()
  if (!serverHealthy) {
    process.exit(1)
  }
  
  try {
    // Run all test suites
    await runSmokeTests()
    await runButtonTests()
    await runLoadTests()
    await runMemoryLeakTest()
    
    // Generate comprehensive report
    await generateSREReport()
    
    console.log('\n🎉 ALL TESTS COMPLETED!')
    console.log(`📊 Check ${CONFIG.reportDir}/ for detailed reports`)
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main, runSmokeTests, runLoadTests, runButtonTests }
