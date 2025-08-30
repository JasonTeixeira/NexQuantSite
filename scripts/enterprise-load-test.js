#!/usr/bin/env node

/**
 * Enterprise Load Testing for 1K-100K Monthly Users
 * Tests system capacity for high-scale production deployment
 */

const { exec } = require('child_process')
const fs = require('fs')

// Configuration for enterprise scale
const ENTERPRISE_CONFIG = {
  baseUrl: 'http://localhost:3060',
  scenarios: [
    {
      name: 'baseline-load',
      description: 'Normal traffic (1K users/month)',
      concurrent: 5,
      duration: 120, // 2 minutes
      expectedRPS: 10
    },
    {
      name: 'moderate-load', 
      description: 'Growing traffic (10K users/month)',
      concurrent: 25,
      duration: 300, // 5 minutes
      expectedRPS: 50
    },
    {
      name: 'high-load',
      description: 'Busy traffic (50K users/month)', 
      concurrent: 75,
      duration: 600, // 10 minutes
      expectedRPS: 150
    },
    {
      name: 'peak-load',
      description: 'Peak traffic (100K users/month)',
      concurrent: 150,
      duration: 900, // 15 minutes
      expectedRPS: 300
    },
    {
      name: 'burst-load',
      description: 'Traffic spike/viral event',
      concurrent: 500,
      duration: 300, // 5 minutes
      expectedRPS: 1000
    },
    {
      name: 'extreme-load',
      description: 'Breaking point test',
      concurrent: 1000,
      duration: 180, // 3 minutes
      expectedRPS: 2000
    }
  ]
}

async function runEnterpriseLoadTest() {
  console.log('\n🏢 ENTERPRISE LOAD TESTING - 1K TO 100K MONTHLY USERS')
  console.log('=' .repeat(80))
  
  const results = []
  
  for (const scenario of ENTERPRISE_CONFIG.scenarios) {
    console.log(`\n🎯 SCENARIO: ${scenario.name.toUpperCase()}`)
    console.log(`📊 ${scenario.description}`)
    console.log(`👥 ${scenario.concurrent} concurrent users for ${scenario.duration}s`)
    console.log(`🎯 Target: ${scenario.expectedRPS} RPS`)
    
    const startTime = Date.now()
    
    try {
      // Create custom stress test for this scenario
      const testScript = `
        const startTime = Date.now();
        const endTime = startTime + ${scenario.duration * 1000};
        const workers = [];
        const results = {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          responseTimes: [],
          errors: []
        };
        
        // Create worker function
        async function worker(workerId) {
          while (Date.now() < endTime) {
            const requestStart = Date.now();
            try {
              results.totalRequests++;
              const response = await fetch('${ENTERPRISE_CONFIG.baseUrl}/');
              const responseTime = Date.now() - requestStart;
              results.responseTimes.push(responseTime);
              
              if (response.ok) {
                results.successfulRequests++;
              } else {
                results.failedRequests++;
                results.errors.push(\`HTTP \${response.status}\`);
              }
            } catch (error) {
              results.failedRequests++;
              results.errors.push(error.message);
              const responseTime = Date.now() - requestStart;
              results.responseTimes.push(responseTime);
            }
            
            // Small delay to prevent overwhelming
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          }
        }
        
        // Start all workers
        for (let i = 0; i < ${scenario.concurrent}; i++) {
          workers.push(worker(i));
        }
        
        // Wait for all workers to complete
        await Promise.all(workers);
        
        // Calculate statistics
        const duration = (Date.now() - startTime) / 1000;
        results.duration = duration;
        results.rps = results.totalRequests / duration;
        results.successRate = (results.successfulRequests / results.totalRequests) * 100;
        results.avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
        results.maxResponseTime = Math.max(...results.responseTimes);
        results.minResponseTime = Math.min(...results.responseTimes);
        
        // P95 calculation
        const sorted = results.responseTimes.sort((a, b) => a - b);
        results.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)];
        
        console.log(JSON.stringify({
          scenario: '${scenario.name}',
          ...results
        }));
      `
      
      const result = await new Promise((resolve, reject) => {
        const testProcess = exec(`node -e "${testScript}"`, {
          timeout: (scenario.duration + 60) * 1000 // Add 60s buffer
        }, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ ${scenario.name} failed:`, error.message)
            resolve({
              scenario: scenario.name,
              error: error.message,
              success: false
            })
          } else {
            try {
              const result = JSON.parse(stdout.trim())
              resolve({...result, success: true})
            } catch (parseError) {
              console.error(`❌ ${scenario.name} parse error:`, parseError.message)
              resolve({
                scenario: scenario.name,
                error: parseError.message,
                success: false
              })
            }
          }
        })
        
        // Show progress
        const progressInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          console.log(`⏳ ${scenario.name} running... ${elapsed}/${scenario.duration}s`)
        }, 15000)
        
        testProcess.on('exit', () => clearInterval(progressInterval))
      })
      
      results.push(result)
      
      if (result.success) {
        console.log(`✅ ${scenario.name} COMPLETED`)
        console.log(`   📊 ${result.totalRequests.toLocaleString()} total requests`)
        console.log(`   ✅ ${result.successRate.toFixed(2)}% success rate`)
        console.log(`   ⚡ ${result.rps.toFixed(1)} RPS (target: ${scenario.expectedRPS})`)
        console.log(`   ⏱️  ${result.avgResponseTime.toFixed(0)}ms avg response`)
        console.log(`   📈 ${result.p95ResponseTime.toFixed(0)}ms P95 response`)
        
        // Evaluate performance
        let status = '✅ EXCELLENT'
        if (result.successRate < 99.9) status = '⚠️  WARNING'
        if (result.successRate < 99) status = '❌ POOR'
        if (result.avgResponseTime > 2000) status = '⚠️  SLOW'
        if (result.avgResponseTime > 5000) status = '❌ TOO SLOW'
        
        console.log(`   🏆 Performance: ${status}`)
      }
      
      // Cooldown between tests
      console.log('😴 Cooling down for 30 seconds...')
      await new Promise(resolve => setTimeout(resolve, 30000))
      
    } catch (error) {
      console.error(`💥 ${scenario.name} failed:`, error.message)
      results.push({
        scenario: scenario.name,
        error: error.message,
        success: false
      })
    }
  }
  
  // Generate enterprise report
  generateEnterpriseReport(results)
  
  return results
}

function generateEnterpriseReport(results) {
  console.log('\n' + '='.repeat(80))
  console.log('🏢 ENTERPRISE LOAD TEST REPORT - FINAL RESULTS')
  console.log('='.repeat(80))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`\n📊 TEST SUMMARY:`)
  console.log(`   ✅ Successful scenarios: ${successful.length}/${results.length}`)
  console.log(`   ❌ Failed scenarios: ${failed.length}/${results.length}`)
  
  if (successful.length > 0) {
    console.log(`\n🏆 PERFORMANCE ANALYSIS:`)
    
    successful.forEach(result => {
      const scenario = ENTERPRISE_CONFIG.scenarios.find(s => s.name === result.scenario)
      console.log(`\n   📈 ${result.scenario.toUpperCase()}:`)
      console.log(`      Target Load: ${scenario?.description}`)
      console.log(`      Users: ${scenario?.concurrent} concurrent`)
      console.log(`      Requests: ${result.totalRequests?.toLocaleString()} total`)
      console.log(`      Success Rate: ${result.successRate?.toFixed(2)}%`)
      console.log(`      RPS: ${result.rps?.toFixed(1)} (target: ${scenario?.expectedRPS})`)
      console.log(`      Response Times: ${result.avgResponseTime?.toFixed(0)}ms avg, ${result.p95ResponseTime?.toFixed(0)}ms P95`)
      
      // Capacity assessment
      let capacity = '🔴 INSUFFICIENT'
      if (result.successRate >= 99.9 && result.avgResponseTime < 1000) capacity = '🟢 EXCELLENT'
      else if (result.successRate >= 99.5 && result.avgResponseTime < 2000) capacity = '🟡 GOOD'
      else if (result.successRate >= 99 && result.avgResponseTime < 5000) capacity = '🟠 ADEQUATE'
      
      console.log(`      Capacity: ${capacity}`)
    })
    
    // Overall assessment
    const maxSuccessfulLoad = successful.reduce((max, result) => {
      const scenario = ENTERPRISE_CONFIG.scenarios.find(s => s.name === result.scenario)
      return (result.successRate >= 99 && scenario?.concurrent > max) ? scenario.concurrent : max
    }, 0)
    
    console.log(`\n🎯 CAPACITY ASSESSMENT:`)
    console.log(`   Maximum Concurrent Users: ${maxSuccessfulLoad}`)
    console.log(`   Monthly User Capacity: ${estimateMonthlyCapacity(maxSuccessfulLoad)}`)
    
    const overallScore = calculateEnterpriseScore(successful)
    console.log(`\n🏆 ENTERPRISE READINESS SCORE: ${overallScore}/100`)
    
    if (overallScore >= 90) {
      console.log(`   🚀 STATUS: READY FOR 100K+ MONTHLY USERS`)
    } else if (overallScore >= 80) {
      console.log(`   🟡 STATUS: READY FOR 50K MONTHLY USERS`) 
    } else if (overallScore >= 70) {
      console.log(`   🟠 STATUS: READY FOR 10K MONTHLY USERS`)
    } else {
      console.log(`   🔴 STATUS: NOT READY FOR ENTERPRISE SCALE`)
    }
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED SCENARIOS:`)
    failed.forEach(result => {
      console.log(`   ${result.scenario}: ${result.error}`)
    })
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    analysis: {
      successfulScenarios: successful.length,
      failedScenarios: failed.length,
      maxConcurrentUsers: maxSuccessfulLoad,
      estimatedMonthlyCapacity: estimateMonthlyCapacity(maxSuccessfulLoad),
      enterpriseScore: calculateEnterpriseScore(successful)
    }
  }
  
  fs.writeFileSync('./test-reports/enterprise-load-test-report.json', JSON.stringify(report, null, 2))
  console.log(`\n📄 Detailed report saved: ./test-reports/enterprise-load-test-report.json`)
  console.log('='.repeat(80))
}

function estimateMonthlyCapacity(maxConcurrentUsers) {
  // Rough calculation: concurrent users * 20 (sessions per day) * 30 (days) * 0.8 (safety factor)
  return Math.floor(maxConcurrentUsers * 20 * 30 * 0.8)
}

function calculateEnterpriseScore(results) {
  if (results.length === 0) return 0
  
  let score = 0
  let totalWeight = 0
  
  results.forEach(result => {
    const scenario = ENTERPRISE_CONFIG.scenarios.find(s => s.name === result.scenario)
    const weight = scenario?.concurrent || 1
    
    let scenarioScore = 0
    
    // Success rate scoring (50 points max)
    if (result.successRate >= 99.9) scenarioScore += 50
    else if (result.successRate >= 99.5) scenarioScore += 45
    else if (result.successRate >= 99) scenarioScore += 35
    else if (result.successRate >= 95) scenarioScore += 20
    else scenarioScore += 0
    
    // Response time scoring (30 points max)
    if (result.avgResponseTime <= 500) scenarioScore += 30
    else if (result.avgResponseTime <= 1000) scenarioScore += 25
    else if (result.avgResponseTime <= 2000) scenarioScore += 15
    else if (result.avgResponseTime <= 5000) scenarioScore += 5
    else scenarioScore += 0
    
    // RPS efficiency scoring (20 points max)
    const targetRPS = scenario?.expectedRPS || 1
    const efficiency = Math.min(1, result.rps / targetRPS)
    scenarioScore += Math.floor(efficiency * 20)
    
    score += scenarioScore * weight
    totalWeight += weight
  })
  
  return Math.floor(score / totalWeight)
}

// Run if called directly
if (require.main === module) {
  runEnterpriseLoadTest().catch(console.error)
}

module.exports = { runEnterpriseLoadTest }
