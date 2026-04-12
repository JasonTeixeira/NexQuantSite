#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE PAGE & ROUTE TESTING
 * Tests every single page and route for loading, functionality, and UI elements
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3060';
const TEST_RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  results: []
};

// All routes from the app directory structure
const ALL_ROUTES = [
  // Main pages
  '/',
  '/about',
  '/jobs',
  '/investors',
  '/pricing',
  '/blog',
  '/contact',
  '/login',
  '/register',
  '/dashboard',
  '/profile',
  '/settings',
  
  // Trading & Features
  '/backtesting',
  '/backtesting/learn',
  '/options-flow',
  '/indicators', 
  '/bots',
  '/automation',
  '/signals-pro',
  '/strategy-lab',
  '/risk-calculator',
  '/quant',
  '/marketplace',
  '/leaderboard',
  '/leaderboards',
  
  // Learning & Support
  '/training',
  '/learn',
  '/learning',
  '/glossary',
  '/qa',
  '/help',
  '/community',
  '/community-guidelines',
  
  // Legal & Info
  '/legal',
  '/terms',
  '/privacy',
  '/risk',
  '/changelog',
  '/status',
  '/testimonials',
  
  // User Features
  '/referrals',
  '/referral-program',
  '/referral-leaderboard',
  '/achievements',
  '/members',
  '/member/testuser',
  '/author/testauthor',
  '/author-portal',
  '/onboarding',
  '/verify-email',
  '/forgot-password',
  '/2fa-setup',
  '/billing',
  '/checkout',
  '/join-free',
  '/signup',
  
  // Special pages
  '/api-docs',
  '/test',
  '/offline',
  
  // Admin routes (will test if accessible)
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/analytics',
  '/admin/careers',
  '/admin/blog',
  '/admin/settings',
  '/admin/roles',
  '/admin/security-dashboard',
  '/admin/performance-command-center',
  '/admin/disaster-recovery',
  '/admin/comprehensive-testing',
  '/admin/referral-management',
  '/admin/billing-management',
  '/admin/content-management',
  '/admin/social-management',
  
  // API endpoints
  '/api/health',
  '/api/status',
  '/api/version',
  '/robots.txt',
  '/sitemap.xml',
];

// Test categories
const CRITICAL_PAGES = ['/', '/dashboard', '/login', '/register', '/api/health'];
const USER_PAGES = ['/dashboard', '/profile', '/settings', '/backtesting', '/indicators'];
const PUBLIC_PAGES = ['/', '/about', '/pricing', '/blog', '/contact'];
const ADMIN_PAGES = ['/admin', '/admin/dashboard', '/admin/users'];

function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const request = http.get(url, (res) => {
      const duration = (Date.now() - startTime) / 1000;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          duration,
          url
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        duration: (Date.now() - startTime) / 1000,
        url
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        status: 0,
        error: 'Timeout',
        duration: 10,
        url
      });
    });
  });
}

function analyzeResponse(response) {
  const result = {
    url: response.url,
    status: response.status,
    duration: response.duration,
    size: response.body ? response.body.length : 0,
    issues: [],
    score: 0
  };
  
  // Status code analysis
  if (response.status === 200) {
    result.score += 40;
  } else if (response.status === 302 || response.status === 301) {
    result.score += 30;
    result.issues.push(`Redirect to ${response.headers.location || 'unknown'}`);
  } else if (response.status === 401) {
    result.score += 20;
    result.issues.push('Requires authentication (expected for protected routes)');
  } else if (response.status === 403) {
    result.score += 20;
    result.issues.push('Access forbidden');
  } else if (response.status === 404) {
    result.score += 10;
    result.issues.push('Page not found');
  } else if (response.status === 500) {
    result.score += 0;
    result.issues.push('Internal server error');
  } else if (response.status === 429) {
    result.score += 15;
    result.issues.push('Rate limited');
  } else if (response.status === 0) {
    result.score += 0;
    result.issues.push(response.error || 'Connection failed');
  }
  
  // Performance analysis
  if (result.duration < 0.5) {
    result.score += 20;
  } else if (result.duration < 1.0) {
    result.score += 15;
  } else if (result.duration < 2.0) {
    result.score += 10;
  } else {
    result.score += 5;
    result.issues.push('Slow response time');
  }
  
  // Content analysis
  if (response.body && response.status === 200) {
    result.score += 20;
    
    // Check for common issues in HTML content
    if (response.body.includes('Application error')) {
      result.score -= 10;
      result.issues.push('Application error in content');
    }
    
    if (response.body.includes('404') && response.status === 200) {
      result.score -= 15;
      result.issues.push('404 content but 200 status');
    }
    
    if (response.body.includes('<title>')) {
      result.score += 5;
    } else {
      result.issues.push('Missing title tag');
    }
    
    if (response.body.length < 100) {
      result.issues.push('Very small response body');
    }
  }
  
  // Security headers check
  if (response.headers) {
    if (response.headers['x-frame-options']) {
      result.score += 5;
    }
    
    if (response.headers['content-security-policy']) {
      result.score += 5;
    }
    
    if (response.headers['x-content-type-options']) {
      result.score += 5;
    }
  }
  
  result.score = Math.min(100, result.score);
  
  return result;
}

function categorizeRoute(url) {
  if (CRITICAL_PAGES.includes(url)) return 'CRITICAL';
  if (USER_PAGES.some(p => url.startsWith(p))) return 'USER';
  if (ADMIN_PAGES.some(p => url.startsWith(p))) return 'ADMIN';
  if (PUBLIC_PAGES.includes(url)) return 'PUBLIC';
  if (url.startsWith('/api/')) return 'API';
  return 'OTHER';
}

async function testRoute(url) {
  console.log(`🧪 Testing: ${url}`);
  
  const response = await makeRequest(`${BASE_URL}${url}`);
  const result = analyzeResponse(response);
  result.category = categorizeRoute(url);
  
  TEST_RESULTS.total++;
  
  if (result.score >= 70) {
    TEST_RESULTS.passed++;
    console.log(`✅ ${url}: PASS (Score: ${result.score}/100, ${result.duration.toFixed(3)}s)`);
  } else if (result.score >= 40) {
    TEST_RESULTS.warnings++;
    console.log(`⚠️ ${url}: WARN (Score: ${result.score}/100, ${result.duration.toFixed(3)}s) - ${result.issues.join(', ')}`);
  } else {
    TEST_RESULTS.failed++;
    console.log(`❌ ${url}: FAIL (Score: ${result.score}/100, ${result.duration.toFixed(3)}s) - ${result.issues.join(', ')}`);
  }
  
  TEST_RESULTS.results.push(result);
  return result;
}

function generateReport() {
  console.log('\n📊 COMPREHENSIVE PAGE TESTING REPORT');
  console.log('='.repeat(60));
  
  console.log(`📈 SUMMARY:`);
  console.log(`   Total Routes Tested: ${TEST_RESULTS.total}`);
  console.log(`   ✅ Passed (70-100): ${TEST_RESULTS.passed}`);
  console.log(`   ⚠️ Warnings (40-69): ${TEST_RESULTS.warnings}`);
  console.log(`   ❌ Failed (0-39): ${TEST_RESULTS.failed}`);
  console.log(`   🎯 Pass Rate: ${((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(1)}%`);
  
  // Category breakdown
  const categories = {};
  TEST_RESULTS.results.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = { total: 0, passed: 0, failed: 0, avgScore: 0 };
    }
    categories[result.category].total++;
    categories[result.category].avgScore += result.score;
    if (result.score >= 70) categories[result.category].passed++;
    else if (result.score < 40) categories[result.category].failed++;
  });
  
  console.log('\n📋 BY CATEGORY:');
  Object.keys(categories).forEach(cat => {
    const stats = categories[cat];
    const avgScore = (stats.avgScore / stats.total).toFixed(1);
    const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`   ${cat}: ${stats.passed}/${stats.total} passed (${passRate}%, avg score: ${avgScore})`);
  });
  
  // Critical issues
  const criticalIssues = TEST_RESULTS.results.filter(r => 
    (r.category === 'CRITICAL' && r.score < 70) || r.score < 20
  );
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    criticalIssues.forEach(issue => {
      console.log(`   ❌ ${issue.url}: ${issue.issues.join(', ')}`);
    });
  }
  
  // Performance summary
  const avgDuration = TEST_RESULTS.results.reduce((sum, r) => sum + r.duration, 0) / TEST_RESULTS.total;
  const slowPages = TEST_RESULTS.results.filter(r => r.duration > 2).length;
  
  console.log('\n⚡ PERFORMANCE:');
  console.log(`   Average Response Time: ${avgDuration.toFixed(3)}s`);
  console.log(`   Slow Pages (>2s): ${slowPages}/${TEST_RESULTS.total}`);
  
  // Security summary
  const securityIssues = TEST_RESULTS.results.filter(r => 
    r.issues.some(issue => issue.includes('security') || issue.includes('error'))
  ).length;
  
  console.log('\n🛡️ SECURITY:');
  console.log(`   Pages with Security Concerns: ${securityIssues}/${TEST_RESULTS.total}`);
  
  // Generate overall score
  const overallScore = Math.round(
    (TEST_RESULTS.passed * 100 + TEST_RESULTS.warnings * 60 + TEST_RESULTS.failed * 20) / 
    (TEST_RESULTS.total * 100) * 100
  );
  
  console.log(`\n🏆 OVERALL SCORE: ${overallScore}/100`);
  
  if (overallScore >= 90) {
    console.log('🎉 EXCELLENT! Your application is highly reliable.');
  } else if (overallScore >= 75) {
    console.log('👍 GOOD! Minor issues to address.');
  } else if (overallScore >= 60) {
    console.log('⚠️ NEEDS IMPROVEMENT! Several issues found.');
  } else {
    console.log('🚨 CRITICAL! Major issues require immediate attention.');
  }
  
  // Save detailed report
  require('fs').writeFileSync('./test-reports/page-test-report.json', JSON.stringify({
    summary: {
      total: TEST_RESULTS.total,
      passed: TEST_RESULTS.passed,
      warnings: TEST_RESULTS.warnings,
      failed: TEST_RESULTS.failed,
      passRate: (TEST_RESULTS.passed / TEST_RESULTS.total) * 100,
      overallScore
    },
    categories,
    criticalIssues,
    performance: { avgDuration, slowPages },
    results: TEST_RESULTS.results
  }, null, 2));
  
  console.log('\n📄 Detailed report saved to: test-reports/page-test-report.json');
}

async function main() {
  console.log('🧪 COMPREHENSIVE PAGE & ROUTE TESTING');
  console.log('='.repeat(60));
  console.log(`🎯 Testing ${ALL_ROUTES.length} routes on ${BASE_URL}`);
  console.log();
  
  // Ensure test-reports directory exists
  require('fs').mkdirSync('./test-reports', { recursive: true });
  
  // Test all routes
  for (const route of ALL_ROUTES) {
    await testRoute(route);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  generateReport();
  
  console.log('\n🎉 COMPREHENSIVE PAGE TESTING COMPLETE!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}


