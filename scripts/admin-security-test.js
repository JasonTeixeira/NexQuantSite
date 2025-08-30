#!/usr/bin/env node

/**
 * Comprehensive Admin Dashboard Security & Functionality Test
 * Tests login, authentication, authorization, and all admin features
 */

const fs = require('fs')

class AdminSecurityTester {
  constructor(baseUrl = 'http://localhost:3060') {
    this.baseUrl = baseUrl
    this.adminToken = null
    this.results = []
    this.vulnerabilities = []
  }

  log(test, status, message, vulnerability = null) {
    const result = {
      test,
      status,
      message,
      timestamp: new Date().toISOString(),
      vulnerability
    }
    this.results.push(result)
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${statusIcon} ${test}: ${message}`)
    
    if (vulnerability) {
      this.vulnerabilities.push({
        test,
        vulnerability,
        severity: vulnerability.severity,
        timestamp: new Date().toISOString()
      })
      console.log(`   🚨 VULNERABILITY: ${vulnerability.description}`)
    }
  }

  async testAdminLogin() {
    console.log('\n🔐 TESTING ADMIN LOGIN SYSTEM')
    console.log('='.repeat(50))

    // Test 1: Admin login page loads
    try {
      const response = await fetch(`${this.baseUrl}/admin/login`)
      if (response.ok) {
        this.log('Admin Login Page', 'PASS', 'Login page loads successfully')
      } else {
        this.log('Admin Login Page', 'FAIL', `Login page failed to load: ${response.status}`)
        return false
      }
    } catch (error) {
      this.log('Admin Login Page', 'FAIL', `Login page error: ${error.message}`)
      return false
    }

    // Test 2: Invalid credentials rejection
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid@test.com', password: 'wrongpassword' })
      })
      
      if (response.status === 401) {
        this.log('Invalid Credentials', 'PASS', 'Invalid credentials properly rejected')
      } else {
        this.log('Invalid Credentials', 'FAIL', 'Invalid credentials not properly rejected', {
          severity: 'HIGH',
          description: 'Authentication bypass possible with invalid credentials',
          recommendation: 'Fix credential validation'
        })
      }
    } catch (error) {
      this.log('Invalid Credentials', 'WARN', `Credential test error: ${error.message}`)
    }

    // Test 3: SQL Injection attempts
    const sqlPayloads = [
      "' OR '1'='1",
      "admin'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR 1=1#"
    ]

    for (const payload of sqlPayloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload, password: payload })
        })
        
        if (response.status === 401) {
          this.log('SQL Injection Defense', 'PASS', `SQL injection payload rejected: ${payload.substring(0, 20)}...`)
        } else if (response.ok) {
          this.log('SQL Injection Defense', 'FAIL', `SQL injection bypass possible`, {
            severity: 'CRITICAL',
            description: `SQL injection payload "${payload}" was accepted`,
            recommendation: 'Implement proper input sanitization and parameterized queries'
          })
        }
      } catch (error) {
        this.log('SQL Injection Defense', 'WARN', `SQL injection test error: ${error.message}`)
      }
    }

    // Test 4: Valid login
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nexural.com', password: 'admin123' })
      })
      
      if (response.ok) {
        const data = await response.json()
        this.adminToken = data.token || data.tokens?.accessToken
        
        if (this.adminToken) {
          this.log('Valid Login', 'PASS', 'Valid credentials accepted, token received')
        } else {
          this.log('Valid Login', 'FAIL', 'Valid credentials accepted but no token received')
          return false
        }
      } else {
        this.log('Valid Login', 'FAIL', 'Valid credentials rejected')
        return false
      }
    } catch (error) {
      this.log('Valid Login', 'FAIL', `Valid login error: ${error.message}`)
      return false
    }

    // Test 5: Weak password policy check
    const weakPasswords = ['123456', 'password', 'admin', '']
    
    this.log('Password Policy', 'WARN', 'Default demo password "admin123" is weak', {
      severity: 'MEDIUM',
      description: 'Demo credentials use weak passwords',
      recommendation: 'Implement strong password requirements and change default credentials'
    })

    return true
  }

  async testAuthenticationSecurity() {
    console.log('\n🛡️ TESTING AUTHENTICATION SECURITY')
    console.log('='.repeat(50))

    if (!this.adminToken) {
      this.log('Auth Security', 'FAIL', 'No admin token available for testing')
      return
    }

    // Test 1: Token validation
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/verify-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.adminToken}` }
      })
      
      if (response.ok) {
        this.log('Token Validation', 'PASS', 'Valid token accepted')
      } else {
        this.log('Token Validation', 'FAIL', 'Valid token rejected')
      }
    } catch (error) {
      this.log('Token Validation', 'WARN', `Token validation error: ${error.message}`)
    }

    // Test 2: Invalid token rejection
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/verify-session`, {
        method: 'POST',
        headers: { Authorization: 'Bearer invalid-token-12345' }
      })
      
      if (response.status === 401 || response.status === 403) {
        this.log('Invalid Token', 'PASS', 'Invalid token properly rejected')
      } else {
        this.log('Invalid Token', 'FAIL', 'Invalid token accepted', {
          severity: 'CRITICAL',
          description: 'Invalid tokens are being accepted',
          recommendation: 'Fix token validation logic'
        })
      }
    } catch (error) {
      this.log('Invalid Token', 'WARN', `Invalid token test error: ${error.message}`)
    }

    // Test 3: JWT manipulation attempts
    const manipulatedTokens = [
      this.adminToken + 'extra',
      this.adminToken.slice(0, -5) + 'aaaaa',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.invalid'
    ]

    for (const token of manipulatedTokens) {
      try {
        const response = await fetch(`${this.baseUrl}/api/admin/verify-session`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.status === 401 || response.status === 403) {
          this.log('JWT Manipulation', 'PASS', 'Manipulated JWT rejected')
        } else {
          this.log('JWT Manipulation', 'FAIL', 'Manipulated JWT accepted', {
            severity: 'HIGH',
            description: 'JWT token manipulation not properly detected',
            recommendation: 'Implement proper JWT signature verification'
          })
        }
      } catch (error) {
        this.log('JWT Manipulation', 'WARN', `JWT manipulation test error: ${error.message}`)
      }
    }
  }

  async testAdminDashboardAccess() {
    console.log('\n📊 TESTING ADMIN DASHBOARD ACCESS')
    console.log('='.repeat(50))

    const adminPages = [
      '/admin/dashboard',
      '/admin/users',
      '/admin/analytics',
      '/admin/advanced-financial',
      '/admin/signals',
      '/admin/settings',
      '/admin/ai-assistant',
      '/admin/api-management',
      '/admin/performance',
      '/admin/system-monitor',
      '/admin/business-intelligence',
      '/admin/marketing-automation',
      '/admin/compliance'
    ]

    // Test without authentication first
    for (const page of adminPages) {
      try {
        const response = await fetch(`${this.baseUrl}${page}`)
        
        if (response.status === 401 || response.status === 403 || response.status === 302) {
          this.log('Unauthorized Access', 'PASS', `${page} properly protected`)
        } else if (response.ok) {
          this.log('Unauthorized Access', 'FAIL', `${page} accessible without auth`, {
            severity: 'CRITICAL',
            description: `Admin page ${page} is accessible without authentication`,
            recommendation: 'Implement authentication guards on all admin routes'
          })
        }
      } catch (error) {
        this.log('Unauthorized Access', 'WARN', `${page} test error: ${error.message}`)
      }
    }

    // Test with valid authentication
    if (this.adminToken) {
      for (const page of adminPages.slice(0, 5)) { // Test first 5 to avoid overwhelming
        try {
          const response = await fetch(`${this.baseUrl}${page}`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
          })
          
          if (response.ok) {
            this.log('Authenticated Access', 'PASS', `${page} accessible with auth`)
          } else {
            this.log('Authenticated Access', 'FAIL', `${page} not accessible with valid auth`)
          }
        } catch (error) {
          this.log('Authenticated Access', 'WARN', `${page} auth test error: ${error.message}`)
        }
      }
    }
  }

  async testSecurityHeaders() {
    console.log('\n🔒 TESTING SECURITY HEADERS')
    console.log('='.repeat(50))

    try {
      const response = await fetch(`${this.baseUrl}/admin/dashboard`)
      const headers = response.headers

      // Check for security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy',
        'referrer-policy'
      ]

      for (const header of securityHeaders) {
        if (headers.get(header)) {
          this.log('Security Headers', 'PASS', `${header} header present`)
        } else {
          this.log('Security Headers', 'WARN', `${header} header missing`, {
            severity: 'MEDIUM',
            description: `Security header ${header} is missing`,
            recommendation: `Add ${header} header to improve security`
          })
        }
      }
    } catch (error) {
      this.log('Security Headers', 'WARN', `Security headers test error: ${error.message}`)
    }
  }

  async testInputValidation() {
    console.log('\n🔍 TESTING INPUT VALIDATION')
    console.log('='.repeat(50))

    // Test XSS payloads
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert(1)',
      '<img src=x onerror=alert(1)>',
      '"><script>alert(document.cookie)</script>'
    ]

    for (const payload of xssPayloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload, password: 'test' })
        })
        
        // Check if XSS payload is reflected in response
        const responseText = await response.text()
        if (responseText.includes(payload)) {
          this.log('XSS Prevention', 'FAIL', 'XSS payload reflected in response', {
            severity: 'HIGH',
            description: `XSS payload "${payload}" was reflected in the response`,
            recommendation: 'Implement proper input sanitization and output encoding'
          })
        } else {
          this.log('XSS Prevention', 'PASS', `XSS payload properly handled: ${payload.substring(0, 20)}...`)
        }
      } catch (error) {
        this.log('XSS Prevention', 'WARN', `XSS test error: ${error.message}`)
      }
    }
  }

  async testRateLimiting() {
    console.log('\n🚦 TESTING RATE LIMITING')
    console.log('='.repeat(50))

    // Rapid login attempts
    const loginAttempts = []
    for (let i = 0; i < 10; i++) {
      loginAttempts.push(
        fetch(`${this.baseUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
        })
      )
    }

    try {
      const responses = await Promise.all(loginAttempts)
      const blockedRequests = responses.filter(r => r.status === 429).length
      
      if (blockedRequests > 0) {
        this.log('Rate Limiting', 'PASS', `Rate limiting active: ${blockedRequests}/10 requests blocked`)
      } else {
        this.log('Rate Limiting', 'WARN', 'No rate limiting detected', {
          severity: 'MEDIUM',
          description: 'No rate limiting on login endpoint detected',
          recommendation: 'Implement rate limiting to prevent brute force attacks'
        })
      }
    } catch (error) {
      this.log('Rate Limiting', 'WARN', `Rate limiting test error: ${error.message}`)
    }
  }

  async runAllTests() {
    console.log('🔍 COMPREHENSIVE ADMIN SECURITY TEST')
    console.log('====================================')
    console.log(`Target: ${this.baseUrl}`)
    console.log(`Started: ${new Date().toISOString()}\n`)

    // Run all test suites
    const loginSuccess = await this.testAdminLogin()
    if (loginSuccess) {
      await this.testAuthenticationSecurity()
      await this.testAdminDashboardAccess()
    }
    await this.testSecurityHeaders()
    await this.testInputValidation()
    await this.testRateLimiting()

    this.generateSecurityReport()
  }

  generateSecurityReport() {
    console.log('\n' + '='.repeat(60))
    console.log('🛡️ ADMIN SECURITY TEST REPORT')
    console.log('='.repeat(60))

    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'PASS').length
    const failedTests = this.results.filter(r => r.status === 'FAIL').length
    const warnTests = this.results.filter(r => r.status === 'WARN').length

    console.log(`\n📊 TEST SUMMARY:`)
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   ✅ Passed: ${passedTests}`)
    console.log(`   ❌ Failed: ${failedTests}`)
    console.log(`   ⚠️  Warnings: ${warnTests}`)

    console.log(`\n🚨 SECURITY VULNERABILITIES: ${this.vulnerabilities.length}`)
    
    if (this.vulnerabilities.length > 0) {
      const critical = this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length
      const high = this.vulnerabilities.filter(v => v.severity === 'HIGH').length
      const medium = this.vulnerabilities.filter(v => v.severity === 'MEDIUM').length

      console.log(`   🔴 Critical: ${critical}`)
      console.log(`   🟠 High: ${high}`)
      console.log(`   🟡 Medium: ${medium}`)

      console.log(`\n📋 VULNERABILITY DETAILS:`)
      this.vulnerabilities.forEach((vuln, index) => {
        console.log(`\n   ${index + 1}. ${vuln.test} [${vuln.severity}]`)
        console.log(`      ${vuln.vulnerability.description}`)
        console.log(`      💡 ${vuln.vulnerability.recommendation}`)
      })
    }

    // Security score calculation
    const maxScore = 100
    const critical = this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length
    const high = this.vulnerabilities.filter(v => v.severity === 'HIGH').length
    const medium = this.vulnerabilities.filter(v => v.severity === 'MEDIUM').length
    
    const criticalPenalty = critical * 25
    const highPenalty = high * 15
    const mediumPenalty = medium * 5
    const failPenalty = failedTests * 10

    const securityScore = Math.max(0, maxScore - criticalPenalty - highPenalty - mediumPenalty - failPenalty)

    console.log(`\n🏆 SECURITY SCORE: ${securityScore}/100`)
    
    if (securityScore >= 90) {
      console.log(`   🟢 EXCELLENT: Admin system is highly secure`)
    } else if (securityScore >= 75) {
      console.log(`   🟡 GOOD: Minor security improvements needed`)
    } else if (securityScore >= 60) {
      console.log(`   🟠 MODERATE: Several security issues need attention`)
    } else {
      console.log(`   🔴 POOR: Critical security issues must be fixed`)
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      target: this.baseUrl,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        warnTests,
        securityScore
      },
      vulnerabilities: this.vulnerabilities,
      results: this.results
    }

    try {
      fs.writeFileSync('./test-reports/admin-security-report.json', JSON.stringify(report, null, 2))
      console.log(`\n📄 Detailed report saved: ./test-reports/admin-security-report.json`)
    } catch (error) {
      console.log(`\n⚠️  Could not save report: ${error.message}`)
    }

    console.log('='.repeat(60))
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new AdminSecurityTester()
  tester.runAllTests().catch(console.error)
}

module.exports = { AdminSecurityTester }
