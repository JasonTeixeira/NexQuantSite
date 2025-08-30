#!/usr/bin/env node

/**
 * 🚀 COMPREHENSIVE LOAD & PERFORMANCE TESTING
 * Professional-grade load testing for Nexural Trading Platform
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

class LoadPerformanceTester {
  constructor(baseUrl = 'http://localhost:3060') {
    this.baseUrl = baseUrl;
    this.results = {
      loadTests: [],
      performanceTests: [],
      errors: [],
      warnings: []
    };
    this.concurrentUsers = 0;
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
  }

  async runCompleteTest() {
    console.log('🚀 COMPREHENSIVE LOAD & PERFORMANCE TEST');
    console.log('========================================');
    console.log(`Target: ${this.baseUrl}`);
    console.log(`Test Start: ${new Date().toLocaleString()}`);
    console.log(`CPU Cores: ${os.cpus().length}`);
    console.log(`Available Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB\n`);

    await this.performanceBaseline();
    await this.loadTestSequence();
    await this.stressTest();
    await this.enduranceTest();
    await this.memoryLeakTest();
    
    this.generateLoadReport();
  }

  /**
   * 📊 PERFORMANCE BASELINE
   */
  async performanceBaseline() {
    console.log('📊 PERFORMANCE BASELINE TESTING');
    console.log('================================');

    const endpoints = [
      { path: '/', name: 'Home Page' },
      { path: '/dashboard', name: 'User Dashboard' },
      { path: '/admin/dashboard', name: 'Admin Dashboard' },
      { path: '/options-flow', name: 'Options Flow' },
      { path: '/pricing', name: 'Pricing Page' },
      { path: '/api/stats', name: 'Stats API' },
      { path: '/api/signals', name: 'Signals API' },
      { path: '/api/leaderboard', name: 'Leaderboard API' }
    ];

    for (const endpoint of endpoints) {
      console.log(`  Testing: ${endpoint.name}...`);
      
      const measurements = [];
      const errors = [];

      // Take 10 measurements for average
      for (let i = 0; i < 10; i++) {
        try {
          const startTime = Date.now();
          const response = await this.makeRequest(endpoint.path);
          const responseTime = Date.now() - startTime;
          
          measurements.push({
            responseTime,
            size: response.length,
            success: true
          });
        } catch (error) {
          errors.push(error.message);
          measurements.push({
            responseTime: -1,
            size: 0,
            success: false
          });
        }
      }

      const successfulMeasurements = measurements.filter(m => m.success);
      const avgResponseTime = successfulMeasurements.length > 0 
        ? successfulMeasurements.reduce((sum, m) => sum + m.responseTime, 0) / successfulMeasurements.length 
        : -1;

      const minResponseTime = successfulMeasurements.length > 0 
        ? Math.min(...successfulMeasurements.map(m => m.responseTime))
        : -1;

      const maxResponseTime = successfulMeasurements.length > 0 
        ? Math.max(...successfulMeasurements.map(m => m.responseTime))
        : -1;

      this.results.performanceTests.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        successRate: (successfulMeasurements.length / measurements.length) * 100,
        errors: errors.length
      });

      const status = avgResponseTime < 1000 ? '✅' : avgResponseTime < 3000 ? '⚠️' : '❌';
      console.log(`    ${status} Avg: ${avgResponseTime.toFixed(0)}ms | Min: ${minResponseTime}ms | Max: ${maxResponseTime}ms`);
    }
  }

  /**
   * 🔥 LOAD TEST SEQUENCE
   */
  async loadTestSequence() {
    console.log('\n🔥 LOAD TEST SEQUENCE');
    console.log('=====================');

    const loadTests = [
      { name: '5 Concurrent Users', users: 5, requests: 50 },
      { name: '10 Concurrent Users', users: 10, requests: 100 },
      { name: '25 Concurrent Users', users: 25, requests: 250 },
      { name: '50 Concurrent Users', users: 50, requests: 500 },
      { name: '100 Concurrent Users', users: 100, requests: 1000 }
    ];

    for (const test of loadTests) {
      console.log(`\n  🧪 ${test.name}`);
      console.log(`     Requests: ${test.requests} | Duration: ~30s`);
      
      const result = await this.runLoadTest(test.users, test.requests);
      
      this.results.loadTests.push({
        name: test.name,
        users: test.users,
        totalRequests: test.requests,
        ...result
      });

      const status = result.successRate >= 95 ? '✅' : result.successRate >= 90 ? '⚠️' : '❌';
      console.log(`     ${status} Success Rate: ${result.successRate.toFixed(1)}% | Avg Response: ${result.avgResponseTime}ms`);
      
      // Cool down between tests
      await this.sleep(2000);
    }
  }

  /**
   * 💥 STRESS TEST
   */
  async stressTest() {
    console.log('\n💥 STRESS TEST (Finding Breaking Point)');
    console.log('=======================================');

    let currentUsers = 50;
    let lastSuccessfulUsers = 0;
    let breakingPoint = false;

    while (!breakingPoint && currentUsers <= 500) {
      console.log(`  Testing ${currentUsers} concurrent users...`);
      
      const result = await this.runLoadTest(currentUsers, currentUsers * 5, 10000); // 10s timeout
      
      if (result.successRate >= 90) {
        lastSuccessfulUsers = currentUsers;
        console.log(`    ✅ System stable at ${currentUsers} users`);
      } else {
        console.log(`    ❌ System unstable at ${currentUsers} users (${result.successRate.toFixed(1)}% success)`);
        breakingPoint = true;
      }

      currentUsers += 50;
      
      if (breakingPoint) {
        console.log(`\n  🎯 Breaking Point: Between ${lastSuccessfulUsers} and ${currentUsers - 50} users`);
      }
    }

    this.results.loadTests.push({
      name: 'Stress Test',
      lastStableUsers: lastSuccessfulUsers,
      breakingPointUsers: breakingPoint ? currentUsers - 50 : currentUsers
    });
  }

  /**
   * ⏰ ENDURANCE TEST
   */
  async enduranceTest() {
    console.log('\n⏰ ENDURANCE TEST (5 minutes sustained load)');
    console.log('============================================');

    const testDuration = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();
    const endTime = startTime + testDuration;
    
    let requestCount = 0;
    let successCount = 0;
    const responseTimes = [];

    console.log('  Running sustained 25 concurrent user load for 5 minutes...');

    while (Date.now() < endTime) {
      const promises = [];
      
      // Send 25 concurrent requests
      for (let i = 0; i < 25; i++) {
        promises.push(this.timedRequest('/dashboard'));
      }

      try {
        const results = await Promise.all(promises);
        requestCount += results.length;
        
        results.forEach(result => {
          if (result.success) {
            successCount++;
            responseTimes.push(result.responseTime);
          }
        });

        // Show progress every minute
        const elapsed = Date.now() - startTime;
        if (elapsed % 60000 < 2000) { // Every ~60 seconds
          const successRate = (successCount / requestCount) * 100;
          const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
          console.log(`    Progress: ${Math.round(elapsed / 60000)}min | Success: ${successRate.toFixed(1)}% | Avg: ${avgResponseTime.toFixed(0)}ms`);
        }
      } catch (error) {
        this.results.errors.push(`Endurance test error: ${error.message}`);
      }

      await this.sleep(1000); // 1 second between batches
    }

    const finalSuccessRate = (successCount / requestCount) * 100;
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    this.results.loadTests.push({
      name: 'Endurance Test',
      duration: '5 minutes',
      totalRequests: requestCount,
      successfulRequests: successCount,
      successRate: finalSuccessRate,
      avgResponseTime
    });

    const status = finalSuccessRate >= 95 ? '✅' : '❌';
    console.log(`  ${status} Endurance Test Complete: ${successCount}/${requestCount} requests (${finalSuccessRate.toFixed(1)}%)`);
  }

  /**
   * 🧠 MEMORY LEAK TEST
   */
  async memoryLeakTest() {
    console.log('\n🧠 MEMORY LEAK DETECTION');
    console.log('========================');

    const measurements = [];
    const testDuration = 2 * 60 * 1000; // 2 minutes
    const startTime = Date.now();

    console.log('  Monitoring memory usage during sustained requests...');

    while (Date.now() < startTime + testDuration) {
      const memoryBefore = process.memoryUsage();
      
      // Make several requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(this.makeRequest('/dashboard'));
      }
      
      await Promise.all(promises.map(p => p.catch(() => {})));
      
      const memoryAfter = process.memoryUsage();
      
      measurements.push({
        timestamp: Date.now() - startTime,
        heapUsed: memoryAfter.heapUsed,
        heapTotal: memoryAfter.heapTotal,
        external: memoryAfter.external,
        rss: memoryAfter.rss
      });

      await this.sleep(5000); // Every 5 seconds
    }

    // Analyze memory trend
    const firstMeasurement = measurements[0];
    const lastMeasurement = measurements[measurements.length - 1];
    
    const heapGrowth = lastMeasurement.heapUsed - firstMeasurement.heapUsed;
    const memoryLeakSuspected = heapGrowth > 50 * 1024 * 1024; // 50MB growth

    this.results.loadTests.push({
      name: 'Memory Leak Test',
      initialHeap: Math.round(firstMeasurement.heapUsed / 1024 / 1024),
      finalHeap: Math.round(lastMeasurement.heapUsed / 1024 / 1024),
      heapGrowth: Math.round(heapGrowth / 1024 / 1024),
      memoryLeakSuspected
    });

    const status = memoryLeakSuspected ? '⚠️' : '✅';
    console.log(`  ${status} Memory growth: ${Math.round(heapGrowth / 1024 / 1024)}MB ${memoryLeakSuspected ? '(Potential leak detected)' : '(Normal)'}`);
  }

  /**
   * Run individual load test
   */
  async runLoadTest(concurrentUsers, totalRequests, timeout = 30000) {
    const startTime = Date.now();
    const requestsPerUser = Math.ceil(totalRequests / concurrentUsers);
    const promises = [];

    // Create concurrent user simulations
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.simulateUser(requestsPerUser, timeout));
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();

    // Aggregate results
    let totalRequests_actual = 0;
    let successfulRequests = 0;
    let totalResponseTime = 0;
    let errors = 0;

    results.forEach(userResult => {
      totalRequests_actual += userResult.requests;
      successfulRequests += userResult.successful;
      totalResponseTime += userResult.totalTime;
      errors += userResult.errors;
    });

    const successRate = (successfulRequests / totalRequests_actual) * 100;
    const avgResponseTime = successfulRequests > 0 ? totalResponseTime / successfulRequests : 0;
    const duration = endTime - startTime;
    const requestsPerSecond = totalRequests_actual / (duration / 1000);

    return {
      duration,
      totalRequests: totalRequests_actual,
      successfulRequests,
      failedRequests: totalRequests_actual - successfulRequests,
      successRate,
      avgResponseTime: Math.round(avgResponseTime),
      requestsPerSecond: Math.round(requestsPerSecond),
      errors
    };
  }

  /**
   * Simulate individual user behavior
   */
  async simulateUser(requestCount, timeout) {
    const userEndpoints = [
      '/dashboard',
      '/options-flow',
      '/',
      '/pricing',
      '/api/stats'
    ];

    let successful = 0;
    let totalTime = 0;
    let errors = 0;

    for (let i = 0; i < requestCount; i++) {
      const endpoint = userEndpoints[Math.floor(Math.random() * userEndpoints.length)];
      
      try {
        const startTime = Date.now();
        await Promise.race([
          this.makeRequest(endpoint),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
        ]);
        
        const responseTime = Date.now() - startTime;
        totalTime += responseTime;
        successful++;
      } catch (error) {
        errors++;
      }

      // Random delay between requests (100-500ms)
      await this.sleep(Math.random() * 400 + 100);
    }

    return {
      requests: requestCount,
      successful,
      totalTime,
      errors
    };
  }

  async timedRequest(path) {
    const startTime = Date.now();
    try {
      await this.makeRequest(path);
      return {
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      
      const req = http.request(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
          } else {
            resolve(body);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate comprehensive load testing report
   */
  generateLoadReport() {
    console.log('\n🚀 LOAD & PERFORMANCE TEST RESULTS');
    console.log('===================================');

    // Performance baseline summary
    console.log('\n📊 PERFORMANCE BASELINE:');
    const performanceTests = this.results.performanceTests;
    const avgPerformance = performanceTests.reduce((sum, test) => sum + test.avgResponseTime, 0) / performanceTests.length;
    
    performanceTests.forEach(test => {
      const status = test.avgResponseTime < 1000 ? '✅' : test.avgResponseTime < 3000 ? '⚠️' : '❌';
      console.log(`  ${status} ${test.endpoint}: ${test.avgResponseTime.toFixed(0)}ms (${test.successRate.toFixed(1)}% success)`);
    });

    // Load test summary
    console.log('\n🔥 LOAD TEST RESULTS:');
    this.results.loadTests.forEach(test => {
      if (test.successRate !== undefined) {
        const status = test.successRate >= 95 ? '✅' : test.successRate >= 90 ? '⚠️' : '❌';
        console.log(`  ${status} ${test.name}: ${test.successRate.toFixed(1)}% success | ${test.avgResponseTime}ms avg`);
      } else {
        console.log(`  📊 ${test.name}: Results logged`);
      }
    });

    // Overall scores
    const performanceScore = avgPerformance < 500 ? 100 : avgPerformance < 1000 ? 80 : avgPerformance < 2000 ? 60 : 40;
    const loadScore = this.results.loadTests.length > 0 ? 
      this.results.loadTests.filter(t => t.successRate >= 95).length / this.results.loadTests.filter(t => t.successRate !== undefined).length * 100 : 100;

    console.log('\n🏆 FINAL SCORES:');
    console.log(`Performance Score: ${performanceScore}/100`);
    console.log(`Load Handling Score: ${loadScore.toFixed(1)}/100`);
    console.log(`Overall Load Score: ${((performanceScore + loadScore) / 2).toFixed(1)}/100`);

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (performanceScore < 80) {
      console.log('  🚀 Optimize response times - consider caching, database optimization');
    }
    if (loadScore < 80) {
      console.log('  💪 Improve scalability - consider load balancing, horizontal scaling');
    }
    if (this.results.errors.length > 0) {
      console.log('  🔧 Fix critical errors that occurred during testing');
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        avgResponseTime: avgPerformance,
        performanceScore,
        loadScore,
        overallScore: (performanceScore + loadScore) / 2
      },
      performanceTests: this.results.performanceTests,
      loadTests: this.results.loadTests,
      errors: this.results.errors
    };

    fs.writeFileSync('./LOAD_PERFORMANCE_REPORT.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: LOAD_PERFORMANCE_REPORT.json');

    return report.summary;
  }
}

// Run test if called directly
if (require.main === module) {
  const tester = new LoadPerformanceTester();
  tester.runCompleteTest()
    .then(() => console.log('\n✅ Load and performance testing completed'))
    .catch(error => {
      console.error('❌ Load test failed:', error);
      process.exit(1);
    });
}

module.exports = LoadPerformanceTester;
