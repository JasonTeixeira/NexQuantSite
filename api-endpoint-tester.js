#!/usr/bin/env node

/**
 * 🌐 COMPREHENSIVE API ENDPOINT TESTING
 * Tests all API endpoints for functionality, security, and performance
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3060';
const TEST_RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  results: []
};

// API endpoints from app/api structure
const API_ENDPOINTS = [
  // Health & Status
  { path: '/api/health', method: 'GET', description: 'Health check endpoint' },
  { path: '/api/status', method: 'GET', description: 'System status' },
  { path: '/api/version', method: 'GET', description: 'API version' },
  
  // Authentication
  { path: '/api/auth/login', method: 'POST', description: 'User login' },
  { path: '/api/auth/register', method: 'POST', description: 'User registration' },
  { path: '/api/auth/logout', method: 'POST', description: 'User logout' },
  { path: '/api/auth/2fa', method: 'POST', description: 'Two-factor authentication' },
  { path: '/api/auth/verify', method: 'POST', description: 'Email verification' },
  
  // Admin endpoints
  { path: '/api/admin/dashboard', method: 'GET', description: 'Admin dashboard data' },
  { path: '/api/admin/users', method: 'GET', description: 'User management' },
  { path: '/api/admin/analytics', method: 'GET', description: 'Admin analytics' },
  { path: '/api/admin/blog', method: 'GET', description: 'Blog management' },
  { path: '/api/admin/careers', method: 'GET', description: 'Career management' },
  
  // Business APIs
  { path: '/api/referrals', method: 'GET', description: 'Referral system' },
  { path: '/api/referrals/payouts', method: 'POST', description: 'Process payouts' },
  { path: '/api/subscriptions', method: 'GET', description: 'Subscription management' },
  { path: '/api/webhooks/stripe', method: 'POST', description: 'Stripe webhooks' },
  
  // Content APIs
  { path: '/api/blog/posts', method: 'GET', description: 'Blog posts' },
  { path: '/api/blog/authors', method: 'GET', description: 'Blog authors' },
  
  // Security APIs
  { path: '/api/security/scan', method: 'POST', description: 'Security scanning' },
  { path: '/api/circuit-breaker', method: 'GET', description: 'Circuit breaker status' },
];

// Test payloads for POST requests
const TEST_PAYLOADS = {
  '/api/auth/login': {
    email: 'test@example.com',
    password: 'testpassword123'
  },
  '/api/auth/register': {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  },
  '/api/referrals/payouts': {
    amount: 100,
    userId: 'test123'
  },
  '/api/webhooks/stripe': {
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test' } }
  },
  '/api/security/scan': {
    url: 'https://example.com',
    type: 'xss'
  }
};

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'localhost',
      port: 3060,
      path: url.replace('http://localhost:3060', ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'APITester/1.0',
        'Accept': 'application/json, text/plain, */*'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = http.request(options, (res) => {
      const duration = (Date.now() - startTime) / 1000;
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
          duration: duration,
          url: url,
          method: method
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        duration: (Date.now() - startTime) / 1000,
        url: url,
        method: method
      });
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Request timeout',
        duration: 30,
        url: url,
        method: method
      });
    });
    
    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

function analyzeResponse(response, endpoint) {
  const result = {
    endpoint: endpoint.path,
    method: endpoint.method,
    description: endpoint.description,
    status: response.status,
    duration: response.duration,
    size: response.body ? response.body.length : 0,
    issues: [],
    score: 0,
    response: response
  };
  
  // Status code analysis
  if (response.status === 200 || response.status === 201) {
    result.score += 40;
  } else if (response.status === 400) {
    result.score += 25;
    result.issues.push('Bad request (may be expected for test data)');
  } else if (response.status === 401) {
    result.score += 30;
    result.issues.push('Unauthorized (expected for protected endpoints)');
  } else if (response.status === 403) {
    result.score += 25;
    result.issues.push('Forbidden');
  } else if (response.status === 404) {
    result.score += 15;
    result.issues.push('Endpoint not found');
  } else if (response.status === 405) {
    result.score += 20;
    result.issues.push('Method not allowed');
  } else if (response.status === 429) {
    result.score += 20;
    result.issues.push('Rate limited');
  } else if (response.status === 500) {
    result.score += 5;
    result.issues.push('Internal server error');
  } else if (response.status === 0) {
    result.score += 0;
    result.issues.push(response.error || 'Connection failed');
  }
  
  // Performance analysis
  if (result.duration < 0.1) {
    result.score += 20;
  } else if (result.duration < 0.5) {
    result.score += 15;
  } else if (result.duration < 1.0) {
    result.score += 10;
  } else if (result.duration < 2.0) {
    result.score += 5;
  } else {
    result.issues.push('Slow response time');
  }
  
  // Response format analysis
  if (response.body) {
    result.score += 10;
    
    try {
      JSON.parse(response.body);
      result.score += 10;
      result.responseType = 'JSON';
    } catch (e) {
      if (response.body.includes('<!DOCTYPE html>')) {
        result.responseType = 'HTML';
        if (response.status === 200) {
          result.issues.push('Returns HTML instead of JSON');
        }
      } else {
        result.responseType = 'TEXT';
      }
    }
    
    // Check for error information leakage
    const sensitiveInfo = [
      'password', 'secret', 'key', 'token', 'internal', 'debug',
      'stack trace', 'file path', 'database error'
    ];
    
    sensitiveInfo.forEach(info => {
      if (response.body.toLowerCase().includes(info)) {
        result.issues.push(`Possible information leakage: ${info}`);
        result.score -= 5;
      }
    });
  }
  
  // Security headers analysis
  if (response.headers) {
    let securityScore = 0;
    
    if (response.headers['x-frame-options']) securityScore += 2;
    if (response.headers['x-content-type-options']) securityScore += 2;
    if (response.headers['x-xss-protection']) securityScore += 2;
    if (response.headers['strict-transport-security']) securityScore += 2;
    if (response.headers['content-security-policy']) securityScore += 2;
    
    result.score += securityScore;
    result.securityHeaders = securityScore;
    
    // Check for proper content type
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json') && result.responseType === 'JSON') {
      result.score += 5;
    }
  }
  
  result.score = Math.min(100, Math.max(0, result.score));
  
  return result;
}

async function testEndpoint(endpoint) {
  console.log(`🌐 Testing: ${endpoint.method} ${endpoint.path}`);
  
  const payload = TEST_PAYLOADS[endpoint.path] || null;
  const response = await makeRequest(`${BASE_URL}${endpoint.path}`, endpoint.method, payload);
  const result = analyzeResponse(response, endpoint);
  
  TEST_RESULTS.total++;
  
  if (result.score >= 70) {
    TEST_RESULTS.passed++;
    console.log(`✅ ${endpoint.method} ${endpoint.path}: PASS (Score: ${result.score}/100, ${result.duration.toFixed(3)}s)`);
  } else if (result.score >= 40) {
    TEST_RESULTS.warnings++;
    console.log(`⚠️ ${endpoint.method} ${endpoint.path}: WARN (Score: ${result.score}/100, ${result.duration.toFixed(3)}s) - ${result.issues.join(', ')}`);
  } else {
    TEST_RESULTS.failed++;
    console.log(`❌ ${endpoint.method} ${endpoint.path}: FAIL (Score: ${result.score}/100, ${result.duration.toFixed(3)}s) - ${result.issues.join(', ')}`);
  }
  
  TEST_RESULTS.results.push(result);
  return result;
}

function generateReport() {
  console.log('\n📊 COMPREHENSIVE API ENDPOINT TESTING REPORT');
  console.log('='.repeat(60));
  
  console.log(`📈 SUMMARY:`);
  console.log(`   Total Endpoints Tested: ${TEST_RESULTS.total}`);
  console.log(`   ✅ Passed (70-100): ${TEST_RESULTS.passed}`);
  console.log(`   ⚠️ Warnings (40-69): ${TEST_RESULTS.warnings}`);
  console.log(`   ❌ Failed (0-39): ${TEST_RESULTS.failed}`);
  console.log(`   🎯 Pass Rate: ${((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(1)}%`);
  
  // Method breakdown
  const methods = {};
  TEST_RESULTS.results.forEach(result => {
    if (!methods[result.method]) {
      methods[result.method] = { total: 0, passed: 0, avgScore: 0 };
    }
    methods[result.method].total++;
    methods[result.method].avgScore += result.score;
    if (result.score >= 70) methods[result.method].passed++;
  });
  
  console.log('\n📋 BY HTTP METHOD:');
  Object.keys(methods).forEach(method => {
    const stats = methods[method];
    const avgScore = (stats.avgScore / stats.total).toFixed(1);
    const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`   ${method}: ${stats.passed}/${stats.total} passed (${passRate}%, avg score: ${avgScore})`);
  });
  
  // Critical API issues
  const criticalIssues = TEST_RESULTS.results.filter(r => 
    r.score < 30 || r.issues.some(issue => 
      issue.includes('server error') || issue.includes('leakage')
    )
  );
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL API ISSUES:');
    criticalIssues.forEach(issue => {
      console.log(`   ❌ ${issue.method} ${issue.endpoint}: ${issue.issues.join(', ')}`);
    });
  }
  
  // Performance summary
  const avgDuration = TEST_RESULTS.results.reduce((sum, r) => sum + r.duration, 0) / TEST_RESULTS.total;
  const slowAPIs = TEST_RESULTS.results.filter(r => r.duration > 1).length;
  
  console.log('\n⚡ API PERFORMANCE:');
  console.log(`   Average Response Time: ${avgDuration.toFixed(3)}s`);
  console.log(`   Slow APIs (>1s): ${slowAPIs}/${TEST_RESULTS.total}`);
  
  // Security analysis
  const securityIssues = TEST_RESULTS.results.filter(r => 
    r.issues.some(issue => issue.includes('leakage')) ||
    (r.securityHeaders || 0) < 5
  ).length;
  
  const avgSecurityHeaders = TEST_RESULTS.results.reduce((sum, r) => sum + (r.securityHeaders || 0), 0) / TEST_RESULTS.total;
  
  console.log('\n🛡️ API SECURITY:');
  console.log(`   APIs with Security Issues: ${securityIssues}/${TEST_RESULTS.total}`);
  console.log(`   Average Security Headers Score: ${avgSecurityHeaders.toFixed(1)}/10`);
  
  // Response type analysis
  const responseTypes = {};
  TEST_RESULTS.results.forEach(result => {
    const type = result.responseType || 'UNKNOWN';
    responseTypes[type] = (responseTypes[type] || 0) + 1;
  });
  
  console.log('\n📄 RESPONSE TYPES:');
  Object.keys(responseTypes).forEach(type => {
    console.log(`   ${type}: ${responseTypes[type]} endpoints`);
  });
  
  // Generate overall score
  const overallScore = Math.round(
    (TEST_RESULTS.passed * 100 + TEST_RESULTS.warnings * 60 + TEST_RESULTS.failed * 20) / 
    (TEST_RESULTS.total * 100) * 100
  );
  
  console.log(`\n🏆 OVERALL API SCORE: ${overallScore}/100`);
  
  if (overallScore >= 90) {
    console.log('🎉 EXCELLENT! Your APIs are highly reliable and secure.');
  } else if (overallScore >= 75) {
    console.log('👍 GOOD! Minor API issues to address.');
  } else if (overallScore >= 60) {
    console.log('⚠️ NEEDS IMPROVEMENT! Several API issues found.');
  } else {
    console.log('🚨 CRITICAL! Major API issues require immediate attention.');
  }
  
  // Save detailed report
  require('fs').writeFileSync('./test-reports/api-test-report.json', JSON.stringify({
    summary: {
      total: TEST_RESULTS.total,
      passed: TEST_RESULTS.passed,
      warnings: TEST_RESULTS.warnings,
      failed: TEST_RESULTS.failed,
      passRate: (TEST_RESULTS.passed / TEST_RESULTS.total) * 100,
      overallScore
    },
    methods,
    responseTypes,
    performance: { avgDuration, slowAPIs },
    security: { securityIssues, avgSecurityHeaders },
    criticalIssues,
    results: TEST_RESULTS.results
  }, null, 2));
  
  console.log('\n📄 Detailed report saved to: test-reports/api-test-report.json');
}

async function main() {
  console.log('🌐 COMPREHENSIVE API ENDPOINT TESTING');
  console.log('='.repeat(60));
  console.log(`🎯 Testing ${API_ENDPOINTS.length} API endpoints on ${BASE_URL}`);
  console.log();
  
  // Ensure test-reports directory exists
  require('fs').mkdirSync('./test-reports', { recursive: true });
  
  // Test all endpoints
  for (const endpoint of API_ENDPOINTS) {
    await testEndpoint(endpoint);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  generateReport();
  
  console.log('\n🎉 COMPREHENSIVE API TESTING COMPLETE!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}


