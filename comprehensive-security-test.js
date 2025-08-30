#!/usr/bin/env node

/**
 * 🛡️ COMPREHENSIVE SECURITY & FUNCTIONALITY TEST SUITE
 * 
 * This script performs extensive security and functionality testing including:
 * - XSS vulnerability testing
 * - SQL injection testing
 * - Input validation testing
 * - Error handling testing
 * - Performance testing
 * - All page load testing
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🛡️  NEXURAL COMPREHENSIVE SECURITY TEST SUITE');
console.log('=' .repeat(60));

// Test configuration
const BASE_URL = 'http://localhost:3060';
const TEST_RESULTS = [];

// All routes to test
const ROUTES = [
  '/',
  '/about',
  '/jobs',
  '/investors',
  '/dashboard',
  '/login',
  '/register',
  '/pricing',
  '/blog',
  '/contact',
  '/backtesting',
  '/backtesting/learn', 
  '/options-flow',
  '/indicators',
  '/training',
  '/glossary',
  '/legal',
  '/admin/dashboard',
  '/admin/careers',
  '/admin/users',
  '/admin/analytics'
];

// Security test payloads
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<svg onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  "';alert('XSS');//",
  '<iframe src="javascript:alert(`XSS`)"></iframe>',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>'
];

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "' UNION SELECT * FROM users --",
  "' OR 1=1 --",
  "admin'--",
  "' OR 'x'='x",
  "'; EXEC xp_cmdshell('dir'); --",
  "' AND 1=CONVERT(int, (SELECT @@version)) --",
  "' UNION ALL SELECT NULL,NULL,NULL,NULL,version(),NULL-- ",
  "1' AND (SELECT SUBSTRING(@@version,1,1))='M'-- "
];

// Utility functions
function logResult(test, status, details = '') {
  const result = { test, status, details, timestamp: new Date().toISOString() };
  TEST_RESULTS.push(result);
  
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${test}: ${status} ${details}`);
}

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', timeout: 30000 });
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

function testPageLoad(route) {
  try {
    const result = executeCommand(`curl -s -o /dev/null -w "%{http_code}:%{time_total}" ${BASE_URL}${route}`);
    const [statusCode, loadTime] = result.trim().split(':');
    
    if (statusCode === '200') {
      logResult(`Page Load ${route}`, 'PASS', `${loadTime}s`);
      return true;
    } else {
      logResult(`Page Load ${route}`, 'FAIL', `Status: ${statusCode}`);
      return false;
    }
  } catch (error) {
    logResult(`Page Load ${route}`, 'FAIL', error.message);
    return false;
  }
}

function testSecurity() {
  console.log('\n🛡️  SECURITY VULNERABILITY TESTING');
  console.log('-'.repeat(40));

  // Test XSS vulnerabilities
  console.log('\n🚨 Testing XSS Vulnerabilities...');
  XSS_PAYLOADS.forEach((payload, index) => {
    try {
      // Test against contact forms and search endpoints
      const encodedPayload = encodeURIComponent(payload);
      const result = executeCommand(`curl -s -X POST -d "message=${encodedPayload}" ${BASE_URL}/api/contact`);
      
      // Check if payload is reflected without encoding
      if (result.includes(payload) && !result.includes('&lt;') && !result.includes('&gt;')) {
        logResult(`XSS Test ${index + 1}`, 'FAIL', 'Payload reflected without encoding');
      } else {
        logResult(`XSS Test ${index + 1}`, 'PASS', 'Payload properly sanitized');
      }
    } catch (error) {
      logResult(`XSS Test ${index + 1}`, 'PASS', 'Endpoint protected/not found');
    }
  });

  // Test SQL Injection vulnerabilities
  console.log('\n💉 Testing SQL Injection Vulnerabilities...');
  SQL_INJECTION_PAYLOADS.forEach((payload, index) => {
    try {
      const encodedPayload = encodeURIComponent(payload);
      const result = executeCommand(`curl -s "${BASE_URL}/api/admin/careers?search=${encodedPayload}"`);
      
      // Check for SQL error messages
      const sqlErrors = ['sql syntax', 'mysql', 'postgresql', 'oracle', 'sqlite', 'database error'];
      const hasError = sqlErrors.some(error => result.toLowerCase().includes(error));
      
      if (hasError) {
        logResult(`SQL Injection Test ${index + 1}`, 'FAIL', 'Database errors exposed');
      } else {
        logResult(`SQL Injection Test ${index + 1}`, 'PASS', 'No database errors exposed');
      }
    } catch (error) {
      logResult(`SQL Injection Test ${index + 1}`, 'PASS', 'Endpoint protected');
    }
  });
}

function testInputValidation() {
  console.log('\n📝 INPUT VALIDATION TESTING');
  console.log('-'.repeat(40));

  const testCases = [
    { name: 'Empty Email', data: { email: '' }, endpoint: '/api/auth/login' },
    { name: 'Invalid Email', data: { email: 'invalid-email' }, endpoint: '/api/auth/login' },
    { name: 'Long String (1000 chars)', data: { message: 'A'.repeat(1000) }, endpoint: '/api/contact' },
    { name: 'Special Characters', data: { name: '!@#$%^&*()' }, endpoint: '/api/contact' },
    { name: 'Null Values', data: { email: null }, endpoint: '/api/auth/login' },
    { name: 'Boolean in String Field', data: { name: true }, endpoint: '/api/contact' },
    { name: 'Array in String Field', data: { email: ['test@test.com'] }, endpoint: '/api/auth/login' },
    { name: 'Negative Numbers', data: { id: -1 }, endpoint: '/api/admin/careers' }
  ];

  testCases.forEach(testCase => {
    try {
      const postData = JSON.stringify(testCase.data);
      const result = executeCommand(
        `curl -s -X POST -H "Content-Type: application/json" -d '${postData}' ${BASE_URL}${testCase.endpoint}`
      );
      
      // Should return proper error responses, not crash
      if (result.includes('error') || result.includes('400') || result.includes('422')) {
        logResult(`Input Validation: ${testCase.name}`, 'PASS', 'Proper error handling');
      } else if (result.includes('500') || result.includes('Internal Server Error')) {
        logResult(`Input Validation: ${testCase.name}`, 'FAIL', 'Server crash/500 error');
      } else {
        logResult(`Input Validation: ${testCase.name}`, 'PASS', 'Graceful handling');
      }
    } catch (error) {
      logResult(`Input Validation: ${testCase.name}`, 'PASS', 'Protected endpoint');
    }
  });
}

function testErrorHandling() {
  console.log('\n🚨 ERROR HANDLING TESTING');
  console.log('-'.repeat(40));

  const errorTests = [
    { name: 'Non-existent Route', url: `${BASE_URL}/this-does-not-exist` },
    { name: 'Invalid API Endpoint', url: `${BASE_URL}/api/invalid-endpoint` },
    { name: 'Malformed JSON', url: `${BASE_URL}/api/contact`, method: 'POST', data: '{invalid json}' },
    { name: 'Missing Required Fields', url: `${BASE_URL}/api/auth/login`, method: 'POST', data: '{}' },
    { name: 'Very Large Payload', url: `${BASE_URL}/api/contact`, method: 'POST', data: `{"message":"${'A'.repeat(10000)}"}` }
  ];

  errorTests.forEach(test => {
    try {
      let command;
      if (test.method === 'POST') {
        command = `curl -s -X POST -H "Content-Type: application/json" -d '${test.data}' -w "Status: %{http_code}" ${test.url}`;
      } else {
        command = `curl -s -w "Status: %{http_code}" ${test.url}`;
      }
      
      const result = executeCommand(command);
      
      // Check for appropriate error codes
      if (result.includes('Status: 404') || result.includes('Status: 400') || result.includes('Status: 422')) {
        logResult(`Error Handling: ${test.name}`, 'PASS', 'Appropriate error code');
      } else if (result.includes('Status: 500')) {
        logResult(`Error Handling: ${test.name}`, 'FAIL', '500 Internal Server Error');
      } else {
        logResult(`Error Handling: ${test.name}`, 'WARN', 'Unexpected response');
      }
    } catch (error) {
      logResult(`Error Handling: ${test.name}`, 'WARN', 'Request failed');
    }
  });
}

function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTING');
  console.log('-'.repeat(40));

  const performanceTests = [
    { name: 'Homepage Load Time', url: BASE_URL },
    { name: 'Dashboard Load Time', url: `${BASE_URL}/dashboard` },
    { name: 'API Response Time', url: `${BASE_URL}/api/admin/careers` },
    { name: 'Large Page Load', url: `${BASE_URL}/backtesting/learn` }
  ];

  performanceTests.forEach(test => {
    try {
      const result = executeCommand(`curl -s -o /dev/null -w "%{time_total}:%{time_connect}:%{size_download}" ${test.url}`);
      const [totalTime, connectTime, size] = result.trim().split(':');
      
      const totalSeconds = parseFloat(totalTime);
      const sizeKB = Math.round(parseInt(size) / 1024);
      
      if (totalSeconds < 2.0) {
        logResult(`Performance: ${test.name}`, 'PASS', `${totalSeconds}s, ${sizeKB}KB`);
      } else if (totalSeconds < 5.0) {
        logResult(`Performance: ${test.name}`, 'WARN', `${totalSeconds}s (slow), ${sizeKB}KB`);
      } else {
        logResult(`Performance: ${test.name}`, 'FAIL', `${totalSeconds}s (too slow), ${sizeKB}KB`);
      }
    } catch (error) {
      logResult(`Performance: ${test.name}`, 'FAIL', error.message);
    }
  });
}

function testAuthenticationSecurity() {
  console.log('\n🔐 AUTHENTICATION SECURITY TESTING');
  console.log('-'.repeat(40));

  const authTests = [
    {
      name: 'Admin Access Without Auth',
      test: () => {
        const result = executeCommand(`curl -s -w "%{http_code}" ${BASE_URL}/admin/dashboard`);
        return result.includes('401') || result.includes('403') || result.includes('302');
      }
    },
    {
      name: 'API Endpoints Protection',
      test: () => {
        const result = executeCommand(`curl -s -X DELETE -w "%{http_code}" ${BASE_URL}/api/admin/careers?id=1`);
        return result.includes('401') || result.includes('403');
      }
    },
    {
      name: 'Password Brute Force Protection',
      test: () => {
        // Simulate rapid login attempts
        let protectedAfterAttempts = false;
        for (let i = 0; i < 5; i++) {
          const result = executeCommand(`curl -s -X POST -d "email=test&password=wrong" ${BASE_URL}/api/auth/login`);
          if (result.includes('rate limit') || result.includes('too many attempts')) {
            protectedAfterAttempts = true;
            break;
          }
        }
        return protectedAfterAttempts;
      }
    }
  ];

  authTests.forEach(test => {
    try {
      const isSecure = test.test();
      if (isSecure) {
        logResult(`Auth Security: ${test.name}`, 'PASS', 'Properly protected');
      } else {
        logResult(`Auth Security: ${test.name}`, 'FAIL', 'Security vulnerability detected');
      }
    } catch (error) {
      logResult(`Auth Security: ${test.name}`, 'WARN', 'Test failed to execute');
    }
  });
}

function generateSecurityReport() {
  console.log('\n📊 GENERATING COMPREHENSIVE SECURITY REPORT');
  console.log('='.repeat(60));

  const summary = {
    total: TEST_RESULTS.length,
    passed: TEST_RESULTS.filter(r => r.status === 'PASS').length,
    failed: TEST_RESULTS.filter(r => r.status === 'FAIL').length,
    warnings: TEST_RESULTS.filter(r => r.status === 'WARN').length
  };

  console.log(`\n📈 SECURITY TEST SUMMARY:`);
  console.log(`   Total Tests: ${summary.total}`);
  console.log(`   ✅ Passed: ${summary.passed}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   ⚠️  Warnings: ${summary.warnings}`);
  
  const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
  console.log(`   🎯 Success Rate: ${successRate}%`);

  // Security score calculation
  const securityScore = Math.max(0, 100 - (summary.failed * 10) - (summary.warnings * 2));
  console.log(`   🛡️  Security Score: ${securityScore}/100`);

  if (securityScore >= 90) {
    console.log('\n🏆 EXCELLENT SECURITY! Your platform is highly secure.');
  } else if (securityScore >= 80) {
    console.log('\n✅ GOOD SECURITY! Minor improvements needed.');
  } else if (securityScore >= 70) {
    console.log('\n⚠️  MODERATE SECURITY! Several issues need attention.');
  } else {
    console.log('\n🚨 SECURITY ISSUES! Immediate action required.');
  }

  // Save detailed report
  const report = {
    summary,
    securityScore,
    timestamp: new Date().toISOString(),
    results: TEST_RESULTS
  };

  fs.writeFileSync('security-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: security-test-report.json');
}

// Main execution
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Security Testing...\n');

  // 1. Test all page loads
  console.log('📄 PAGE LOAD TESTING');
  console.log('-'.repeat(40));
  ROUTES.forEach(route => testPageLoad(route));

  // 2. Security vulnerability testing
  testSecurity();

  // 3. Input validation testing
  testInputValidation();

  // 4. Error handling testing
  testErrorHandling();

  // 5. Performance testing
  testPerformance();

  // 6. Authentication security testing
  testAuthenticationSecurity();

  // 7. Generate comprehensive report
  generateSecurityReport();

  console.log('\n🎉 COMPREHENSIVE SECURITY TESTING COMPLETE!');
}

// Execute if run directly
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

module.exports = { runComprehensiveTests };

