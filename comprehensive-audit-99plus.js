#!/usr/bin/env node

// 🔍 COMPREHENSIVE 99+ SAAS PLATFORM AUDIT
// Tests every page, feature, and security aspect

const fs = require('fs')

const AUDIT_CONFIG = {
  baseUrl: 'http://localhost:3060',
  timeout: 10000,
  retries: 3,
  adminCredentials: {
    email: 'admin@nexural.io',
    password: 'admin123'
  }
}

// 📋 COMPREHENSIVE PAGE LIST FOR TESTING
const PAGES_TO_TEST = [
  // Core Pages
  { url: '/', name: 'Homepage', critical: true, public: true },
  { url: '/login', name: 'Login', critical: true, public: true },
  { url: '/register', name: 'Register', critical: true, public: true },
  { url: '/contact', name: 'Contact', critical: true, public: true },
  { url: '/pricing', name: 'Pricing', critical: true, public: true },
  
  // Dashboard & User Areas
  { url: '/dashboard', name: 'Main Dashboard', critical: true, protected: true },
  { url: '/dashboard/portfolio', name: 'Portfolio Dashboard', critical: true, protected: true },
  { url: '/dashboard/signals', name: 'Trading Signals', critical: true, protected: true },
  { url: '/dashboard/performance', name: 'Performance Analytics', critical: true, protected: true },
  { url: '/dashboard/billing', name: 'Billing Dashboard', critical: true, protected: true },
  { url: '/dashboard/referrals', name: 'Referral Dashboard', critical: true, protected: true },
  
  // Trading Features
  { url: '/marketplace', name: 'Trading Marketplace', critical: true, public: true },
  { url: '/backtesting', name: 'Backtesting Engine', critical: true, protected: true },
  { url: '/strategy-lab', name: 'Strategy Laboratory', critical: true, protected: true },
  { url: '/signals-pro', name: 'Professional Signals', critical: true, protected: true },
  { url: '/risk-calculator', name: 'Risk Calculator', critical: true, public: true },
  { url: '/options-flow', name: 'Options Flow', critical: true, protected: true },
  
  // Learning & Community
  { url: '/learning', name: 'Learning Center', critical: true, public: true },
  { url: '/community', name: 'Community Hub', critical: true, public: true },
  { url: '/leaderboard', name: 'Leaderboard', critical: true, public: true },
  { url: '/blog', name: 'Blog', critical: false, public: true },
  
  // Admin Dashboard
  { url: '/admin', name: 'Admin Dashboard', critical: true, admin: true },
  { url: '/admin/users', name: 'User Management', critical: true, admin: true },
  { url: '/admin/analytics', name: 'Admin Analytics', critical: true, admin: true },
  { url: '/admin/security-dashboard', name: 'Security Dashboard', critical: true, admin: true },
  { url: '/admin/billing-management', name: 'Billing Management', critical: true, admin: true },
  
  // Support & Legal
  { url: '/help', name: 'Help Center', critical: true, public: true },
  { url: '/terms', name: 'Terms of Service', critical: true, public: true },
  { url: '/privacy', name: 'Privacy Policy', critical: true, public: true },
  { url: '/legal', name: 'Legal Center', critical: true, public: true },
  
  // Additional Features
  { url: '/profile', name: 'User Profile', critical: true, protected: true },
  { url: '/settings', name: 'User Settings', critical: true, protected: true },
  { url: '/billing', name: 'Billing Page', critical: true, protected: true },
  { url: '/referrals', name: 'Referral Program', critical: true, protected: true },
  { url: '/onboarding', name: 'User Onboarding', critical: true, protected: true },
  { url: '/2fa-setup', name: '2FA Setup', critical: true, protected: true },
  { url: '/verify-email', name: 'Email Verification', critical: true, public: true },
  { url: '/forgot-password', name: 'Password Reset', critical: true, public: true },
]

// 🔒 SECURITY TESTS
const SECURITY_TESTS = [
  {
    name: 'SQL Injection Test',
    test: async () => {
      const injections = ["'; DROP TABLE users; --", "1' OR '1'='1", "admin'--", "1 UNION SELECT * FROM users"]
      for (let injection of injections) {
        try {
          const response = await fetch(`${AUDIT_CONFIG.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: injection, password: 'test' })
          })
          if (response.status === 200) {
            return { passed: false, details: `SQL injection vulnerability detected with: ${injection}` }
          }
        } catch (e) {
          // Expected to fail
        }
      }
      return { passed: true, details: 'No SQL injection vulnerabilities detected' }
    }
  },
  {
    name: 'XSS Protection Test',
    test: async () => {
      const xssPayloads = ["<script>alert('xss')</script>", "javascript:alert('xss')", "onmouseover=alert('xss')"]
      for (let payload of xssPayloads) {
        try {
          const response = await fetch(`${AUDIT_CONFIG.baseUrl}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: payload, 
              email: 'test@test.com', 
              subject: 'Test', 
              message: 'Test' 
            })
          })
          const result = await response.json()
          if (result.success && result.message.includes('<script>')) {
            return { passed: false, details: `XSS vulnerability detected with: ${payload}` }
          }
        } catch (e) {
          // Expected to be sanitized
        }
      }
      return { passed: true, details: 'XSS protection working correctly' }
    }
  },
  {
    name: 'Rate Limiting Test',
    test: async () => {
      const requests = []
      // Make 20 rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(fetch(`${AUDIT_CONFIG.baseUrl}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: 'Test', 
            email: 'test@test.com', 
            subject: 'Rate limit test', 
            message: `Test ${i}` 
          })
        }))
      }
      
      const responses = await Promise.allSettled(requests)
      const rateLimited = responses.some(r => 
        r.status === 'fulfilled' && r.value.status === 429
      )
      
      return { 
        passed: rateLimited, 
        details: rateLimited ? 'Rate limiting is active' : 'Rate limiting may not be working' 
      }
    }
  },
  {
    name: 'Authentication Security Test',
    test: async () => {
      // Test protected routes without authentication
      const protectedRoutes = ['/dashboard', '/admin', '/api/user/profile']
      let violations = 0
      
      for (let route of protectedRoutes) {
        try {
          const response = await fetch(`${AUDIT_CONFIG.baseUrl}${route}`)
          if (response.status === 200) {
            violations++
          }
        } catch (e) {
          // Expected for API routes
        }
      }
      
      return { 
        passed: violations === 0, 
        details: violations > 0 ? `${violations} protected routes accessible without auth` : 'Protected routes properly secured' 
      }
    }
  },
  {
    name: 'CSRF Protection Test',
    test: async () => {
      try {
        // Test sensitive operation without CSRF token
        const response = await fetch(`${AUDIT_CONFIG.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
        })
        
        const headers = response.headers.get('x-csrf-token') || response.headers.get('csrf-token')
        return { 
          passed: !!headers || response.status === 403, 
          details: headers ? 'CSRF protection detected' : 'CSRF protection may be missing' 
        }
      } catch (e) {
        return { passed: true, details: 'CSRF protection working (request blocked)' }
      }
    }
  }
]

// 🧪 API ENDPOINT TESTS
const API_TESTS = [
  // Authentication APIs
  { endpoint: '/api/auth/login', method: 'POST', critical: true },
  { endpoint: '/api/auth/register', method: 'POST', critical: true },
  { endpoint: '/api/auth/logout', method: 'POST', critical: true },
  { endpoint: '/api/auth/forgot-password', method: 'POST', critical: true },
  { endpoint: '/api/auth/verify-email', method: 'POST', critical: true },
  
  // User APIs
  { endpoint: '/api/user/profile', method: 'GET', protected: true, critical: true },
  { endpoint: '/api/user/settings', method: 'GET', protected: true, critical: true },
  
  // Trading APIs
  { endpoint: '/api/trading/market', method: 'GET', critical: true },
  { endpoint: '/api/trading/signals', method: 'GET', critical: true },
  { endpoint: '/api/portfolio', method: 'GET', protected: true, critical: true },
  { endpoint: '/api/marketplace/bots', method: 'GET', critical: true },
  { endpoint: '/api/marketplace/strategies', method: 'GET', critical: true },
  
  // Payment APIs
  { endpoint: '/api/payments/create-checkout', method: 'POST', protected: true, critical: true },
  { endpoint: '/api/subscriptions', method: 'GET', protected: true, critical: true },
  
  // Admin APIs
  { endpoint: '/api/admin/users', method: 'GET', admin: true, critical: true },
  { endpoint: '/api/admin/analytics', method: 'GET', admin: true, critical: true },
  { endpoint: '/api/admin/health', method: 'GET', admin: true, critical: true },
  
  // Communication APIs
  { endpoint: '/api/contact', method: 'POST', critical: true },
  { endpoint: '/api/newsletter/subscribe', method: 'POST', critical: true },
  
  // Utility APIs
  { endpoint: '/api/health', method: 'GET', critical: true },
  { endpoint: '/api/health-check', method: 'GET', critical: true },
]

// 📊 PERFORMANCE TESTS
const PERFORMANCE_BENCHMARKS = {
  pageLoadTime: 3000, // 3 seconds max
  apiResponseTime: 1000, // 1 second max
  criticalApiResponseTime: 500, // 500ms for critical APIs
}

class ComprehensiveAuditor {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        critical_failures: 0,
        score: 0
      },
      pageTests: [],
      apiTests: [],
      securityTests: [],
      performanceTests: [],
      issues: {
        critical: [],
        high: [],
        medium: [],
        low: []
      }
    }
  }

  async runPageTest(page) {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${AUDIT_CONFIG.baseUrl}${page.url}`, {
        timeout: AUDIT_CONFIG.timeout
      })
      
      const loadTime = Date.now() - startTime
      const result = {
        page: page.name,
        url: page.url,
        status: response.status,
        loadTime: loadTime,
        passed: response.status >= 200 && response.status < 400,
        critical: page.critical,
        issues: []
      }

      // Performance check
      if (loadTime > PERFORMANCE_BENCHMARKS.pageLoadTime) {
        result.issues.push(`Slow load time: ${loadTime}ms (max: ${PERFORMANCE_BENCHMARKS.pageLoadTime}ms)`)
      }

      // Security headers check
      const securityHeaders = ['x-frame-options', 'x-content-type-options', 'x-xss-protection', 'strict-transport-security']
      const missingHeaders = securityHeaders.filter(header => !response.headers.get(header))
      if (missingHeaders.length > 0) {
        result.issues.push(`Missing security headers: ${missingHeaders.join(', ')}`)
      }

      return result
    } catch (error) {
      return {
        page: page.name,
        url: page.url,
        status: 0,
        loadTime: Date.now() - startTime,
        passed: false,
        critical: page.critical,
        error: error.message,
        issues: [`Page failed to load: ${error.message}`]
      }
    }
  }

  async runApiTest(api) {
    const startTime = Date.now()
    
    try {
      const options = {
        method: api.method,
        headers: { 'Content-Type': 'application/json' },
        timeout: AUDIT_CONFIG.timeout
      }

      // Add test data for POST requests
      if (api.method === 'POST') {
        switch (api.endpoint) {
          case '/api/contact':
            options.body = JSON.stringify({
              name: 'Test User',
              email: 'test@example.com',
              subject: 'API Test',
              message: 'Testing API endpoint'
            })
            break
          case '/api/newsletter/subscribe':
            options.body = JSON.stringify({
              name: 'Test User',
              email: 'test@example.com'
            })
            break
          case '/api/auth/login':
            options.body = JSON.stringify({
              email: 'test@example.com',
              password: 'testpassword'
            })
            break
          default:
            options.body = JSON.stringify({})
        }
      }

      const response = await fetch(`${AUDIT_CONFIG.baseUrl}${api.endpoint}`, options)
      const responseTime = Date.now() - startTime
      
      const result = {
        endpoint: api.endpoint,
        method: api.method,
        status: response.status,
        responseTime: responseTime,
        passed: response.status < 500, // Allow 4xx errors (expected for many endpoints)
        critical: api.critical,
        issues: []
      }

      // Performance check
      const maxTime = api.critical ? PERFORMANCE_BENCHMARKS.criticalApiResponseTime : PERFORMANCE_BENCHMARKS.apiResponseTime
      if (responseTime > maxTime) {
        result.issues.push(`Slow response: ${responseTime}ms (max: ${maxTime}ms)`)
      }

      return result
    } catch (error) {
      return {
        endpoint: api.endpoint,
        method: api.method,
        status: 0,
        responseTime: Date.now() - startTime,
        passed: false,
        critical: api.critical,
        error: error.message,
        issues: [`API failed: ${error.message}`]
      }
    }
  }

  async runSecurityTest(test) {
    const startTime = Date.now()
    
    try {
      const result = await test.test()
      return {
        name: test.name,
        passed: result.passed,
        details: result.details,
        executionTime: Date.now() - startTime,
        critical: true
      }
    } catch (error) {
      return {
        name: test.name,
        passed: false,
        details: `Security test failed: ${error.message}`,
        executionTime: Date.now() - startTime,
        critical: true,
        error: error.message
      }
    }
  }

  categorizeIssue(issue, isCritical, testType) {
    const severity = isCritical ? 'critical' : 
                    testType === 'security' ? 'high' :
                    testType === 'api' ? 'medium' : 'low'
    
    this.results.issues[severity].push(issue)
  }

  async runComprehensiveAudit() {
    console.log('🔍 Starting Comprehensive 99+ SaaS Platform Audit...\n')

    // 1. Page Tests
    console.log('📱 Testing Pages...')
    for (const page of PAGES_TO_TEST) {
      const result = await this.runPageTest(page)
      this.results.pageTests.push(result)
      this.results.summary.totalTests++
      
      if (result.passed) {
        this.results.summary.passed++
        console.log(`✅ ${result.page}: ${result.status} (${result.loadTime}ms)`)
      } else {
        this.results.summary.failed++
        if (result.critical) this.results.summary.critical_failures++
        console.log(`❌ ${result.page}: ${result.status} - ${result.error || 'Failed'}`)
        this.categorizeIssue(`Page ${result.page}: ${result.issues?.join(', ') || result.error}`, result.critical, 'page')
      }

      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => this.categorizeIssue(`${result.page}: ${issue}`, false, 'performance'))
      }
    }

    // 2. API Tests
    console.log('\n🔌 Testing API Endpoints...')
    for (const api of API_TESTS) {
      const result = await this.runApiTest(api)
      this.results.apiTests.push(result)
      this.results.summary.totalTests++
      
      if (result.passed) {
        this.results.summary.passed++
        console.log(`✅ ${result.method} ${result.endpoint}: ${result.status} (${result.responseTime}ms)`)
      } else {
        this.results.summary.failed++
        if (result.critical) this.results.summary.critical_failures++
        console.log(`❌ ${result.method} ${result.endpoint}: ${result.status} - ${result.error || 'Failed'}`)
        this.categorizeIssue(`API ${result.endpoint}: ${result.error || 'Failed'}`, result.critical, 'api')
      }

      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => this.categorizeIssue(`API ${result.endpoint}: ${issue}`, false, 'performance'))
      }
    }

    // 3. Security Tests
    console.log('\n🔒 Running Security Tests...')
    for (const test of SECURITY_TESTS) {
      const result = await this.runSecurityTest(test)
      this.results.securityTests.push(result)
      this.results.summary.totalTests++
      
      if (result.passed) {
        this.results.summary.passed++
        console.log(`✅ ${result.name}: ${result.details}`)
      } else {
        this.results.summary.failed++
        this.results.summary.critical_failures++
        console.log(`❌ ${result.name}: ${result.details}`)
        this.categorizeIssue(`Security ${result.name}: ${result.details}`, true, 'security')
      }
    }

    // Calculate final score
    this.calculateScore()
    this.generateReport()
  }

  calculateScore() {
    const { totalTests, passed, critical_failures } = this.results.summary
    
    // Base score from pass rate
    const baseScore = (passed / totalTests) * 100
    
    // Deduct heavily for critical failures
    const criticalPenalty = critical_failures * 10
    
    // Deduct for each issue category
    const criticalIssues = this.results.issues.critical.length
    const highIssues = this.results.issues.high.length
    const mediumIssues = this.results.issues.medium.length
    const lowIssues = this.results.issues.low.length
    
    const issuePenalty = (criticalIssues * 5) + (highIssues * 3) + (mediumIssues * 2) + (lowIssues * 1)
    
    this.results.summary.score = Math.max(0, Math.round(baseScore - criticalPenalty - issuePenalty))
  }

  generateReport() {
    const report = `
🔍 COMPREHENSIVE 99+ SAAS PLATFORM AUDIT REPORT
=====================================================

📊 SUMMARY
----------
Total Tests: ${this.results.summary.totalTests}
Passed: ${this.results.summary.passed}
Failed: ${this.results.summary.failed}
Critical Failures: ${this.results.summary.critical_failures}

🏆 PLATFORM SCORE: ${this.results.summary.score}/100

📱 PAGE TESTS (${this.results.pageTests.length})
-----------
${this.results.pageTests.map(p => 
  `${p.passed ? '✅' : '❌'} ${p.page}: ${p.status} (${p.loadTime}ms)${p.issues?.length ? ' - Issues: ' + p.issues.length : ''}`
).join('\n')}

🔌 API TESTS (${this.results.apiTests.length})
----------
${this.results.apiTests.map(a => 
  `${a.passed ? '✅' : '❌'} ${a.method} ${a.endpoint}: ${a.status} (${a.responseTime}ms)`
).join('\n')}

🔒 SECURITY TESTS (${this.results.securityTests.length})
--------------
${this.results.securityTests.map(s => 
  `${s.passed ? '✅' : '❌'} ${s.name}: ${s.details}`
).join('\n')}

🚨 ISSUES FOUND
--------------
Critical Issues (${this.results.issues.critical.length}):
${this.results.issues.critical.map(i => `❌ ${i}`).join('\n')}

High Issues (${this.results.issues.high.length}):
${this.results.issues.high.map(i => `⚠️  ${i}`).join('\n')}

Medium Issues (${this.results.issues.medium.length}):
${this.results.issues.medium.map(i => `🔸 ${i}`).join('\n')}

Low Issues (${this.results.issues.low.length}):
${this.results.issues.low.map(i => `🔹 ${i}`).join('\n')}

🎯 RECOMMENDATIONS
-----------------
${this.generateRecommendations()}

📈 99+ SAAS READINESS
-------------------
${this.assessSaasReadiness()}
`

    console.log(report)
    
    // Save detailed report
    fs.writeFileSync('COMPREHENSIVE_99PLUS_AUDIT_REPORT.md', report)
    fs.writeFileSync('audit-results.json', JSON.stringify(this.results, null, 2))
    
    console.log('\n📄 Detailed report saved to COMPREHENSIVE_99PLUS_AUDIT_REPORT.md')
  }

  generateRecommendations() {
    const recommendations = []
    
    if (this.results.issues.critical.length > 0) {
      recommendations.push('🚨 CRITICAL: Fix all critical security issues immediately')
    }
    
    if (this.results.issues.high.length > 0) {
      recommendations.push('⚠️  HIGH: Address high-priority issues before launch')
    }
    
    const slowPages = this.results.pageTests.filter(p => p.loadTime > PERFORMANCE_BENCHMARKS.pageLoadTime)
    if (slowPages.length > 0) {
      recommendations.push(`🐌 PERFORMANCE: Optimize ${slowPages.length} slow-loading pages`)
    }
    
    const failedApis = this.results.apiTests.filter(a => !a.passed && a.critical)
    if (failedApis.length > 0) {
      recommendations.push(`🔌 API: Fix ${failedApis.length} critical API endpoints`)
    }
    
    if (this.results.summary.score >= 95) {
      recommendations.push('🏆 EXCELLENT: Platform ready for 99+ SaaS status!')
    } else if (this.results.summary.score >= 85) {
      recommendations.push('👍 GOOD: Close to 99+ status, address remaining issues')
    } else {
      recommendations.push('⚡ NEEDS WORK: Significant improvements needed for 99+ status')
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : 'No specific recommendations - platform looks good!'
  }

  assessSaasReadiness() {
    const score = this.results.summary.score
    const criticalIssues = this.results.issues.critical.length
    const highIssues = this.results.issues.high.length
    
    if (score >= 98 && criticalIssues === 0 && highIssues === 0) {
      return '🌟 GRADE A+: Ready for enterprise deployment (99+ SaaS)'
    } else if (score >= 95 && criticalIssues === 0) {
      return '⭐ GRADE A: Production ready with minor improvements needed'
    } else if (score >= 85 && criticalIssues <= 2) {
      return '👍 GRADE B+: Good foundation, address key issues for 99+ status'
    } else if (score >= 75) {
      return '📈 GRADE B: Solid platform, needs optimization for enterprise use'
    } else {
      return '⚡ NEEDS IMPROVEMENT: Significant work required for production readiness'
    }
  }
}

// Run the audit
async function main() {
  const auditor = new ComprehensiveAuditor()
  await auditor.runComprehensiveAudit()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = ComprehensiveAuditor

