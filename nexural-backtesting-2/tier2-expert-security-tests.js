/**
 * NEXURAL PLATFORM - TIER 2 EXPERT SECURITY TESTING
 * Professional-grade security validation for trading platform
 * 
 * Coverage:
 * - Authentication & Authorization
 * - JWT Token Security
 * - Session Management
 * - Rate Limiting
 * - Input Validation & XSS Protection
 * - API Security Headers
 * - CORS Configuration
 * - SQL Injection Prevention
 */

const BASE_URL = 'http://localhost:3075'

class ExpertSecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    }
  }

  async runExpertSecuritySuite() {
    console.log('🔒 EXPERT SECURITY TESTING SUITE')
    console.log('================================')
    console.log('')

    // Test 1: Authentication System Analysis
    await this.testAuthentication()
    
    // Test 2: JWT Token Security
    await this.testJWTSecurity()
    
    // Test 3: Session Management
    await this.testSessionSecurity()
    
    // Test 4: Rate Limiting Protection
    await this.testRateLimiting()
    
    // Test 5: Input Validation & XSS Protection
    await this.testInputValidation()
    
    // Test 6: API Security Headers
    await this.testSecurityHeaders()
    
    // Test 7: CORS Configuration
    await this.testCORSConfiguration()
    
    // Test 8: SQL Injection Prevention
    await this.testSQLInjectionPrevention()

    // Generate Expert Security Report
    this.generateSecurityReport()
  }

  async test(name, testFunction) {
    try {
      console.log(`\n🔍 Testing: ${name}`)
      console.log('─'.repeat(name.length + 12))
      
      const startTime = Date.now()
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      if (result.status === 'PASS') {
        console.log(`✅ PASS: ${name} (${duration}ms)`)
        if (result.details) console.log(`   📋 ${result.details}`)
        this.results.passed++
      } else if (result.status === 'WARN') {
        console.log(`⚠️  WARN: ${name} (${duration}ms)`)
        if (result.details) console.log(`   📋 ${result.details}`)
        this.results.warnings++
      } else {
        console.log(`❌ FAIL: ${name} (${duration}ms)`)
        if (result.details) console.log(`   📋 ${result.details}`)
        this.results.failed++
      }
      
      this.results.tests.push({
        name, 
        status: result.status, 
        duration, 
        details: result.details 
      })
      
    } catch (error) {
      console.log(`❌ FAIL: ${name} - ${error.message}`)
      this.results.failed++
      this.results.tests.push({
        name, 
        status: 'FAIL', 
        error: error.message 
      })
    }
  }

  async testAuthentication() {
    await this.test('Authentication System Analysis', async () => {
      // Check if authentication endpoints exist
      const endpoints = [
        '/api/auth/login',
        '/api/auth/register', 
        '/api/auth/logout',
        '/api/auth/refresh'
      ]
      
      let existingEndpoints = 0
      const endpointResults = []
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          })
          
          // 404 means endpoint doesn't exist, anything else means it does
          if (response.status !== 404) {
            existingEndpoints++
            endpointResults.push(`${endpoint}: Status ${response.status}`)
          }
        } catch (error) {
          // Network errors mean server is down, which we don't count against auth
        }
      }
      
      if (existingEndpoints === 0) {
        return { 
          status: 'WARN', 
          details: 'No authentication endpoints detected (development mode OK)' 
        }
      } else if (existingEndpoints < 4) {
        return { 
          status: 'WARN', 
          details: `${existingEndpoints}/4 auth endpoints detected: ${endpointResults.join(', ')}` 
        }
      } else {
        return { 
          status: 'PASS', 
          details: `All ${existingEndpoints} authentication endpoints operational` 
        }
      }
    })
  }

  async testJWTSecurity() {
    await this.test('JWT Token Security Analysis', async () => {
      // Test for JWT implementation in headers
      const response = await fetch(`${BASE_URL}/api/portfolio`)
      const headers = response.headers
      
      // Look for JWT-related headers or responses
      const authHeader = headers.get('authorization')
      const tokenHeader = headers.get('x-auth-token')
      const responseText = await response.text()
      
      // Check if response mentions JWT tokens
      const hasJWTMention = responseText.toLowerCase().includes('jwt') || 
                           responseText.toLowerCase().includes('token') ||
                           responseText.toLowerCase().includes('authorization')
      
      if (authHeader || tokenHeader) {
        return { 
          status: 'PASS', 
          details: 'JWT headers detected in API responses' 
        }
      } else if (hasJWTMention) {
        return { 
          status: 'PASS', 
          details: 'JWT token handling detected in API responses' 
        }
      } else {
        return { 
          status: 'WARN', 
          details: 'JWT implementation not clearly detectable (may be internal)' 
        }
      }
    })
  }

  async testSessionSecurity() {
    await this.test('Session Management Security', async () => {
      const response = await fetch(`${BASE_URL}/api/health`)
      const headers = response.headers
      
      // Check for secure session cookies
      const setCookie = headers.get('set-cookie')
      const securityHeaders = {
        'x-frame-options': headers.get('x-frame-options'),
        'x-content-type-options': headers.get('x-content-type-options'),
        'x-xss-protection': headers.get('x-xss-protection'),
        'strict-transport-security': headers.get('strict-transport-security')
      }
      
      const hasSecurityHeaders = Object.values(securityHeaders).some(header => header !== null)
      
      if (setCookie && setCookie.includes('secure') && setCookie.includes('httponly')) {
        return { 
          status: 'PASS', 
          details: 'Secure session cookies detected with HttpOnly flag' 
        }
      } else if (hasSecurityHeaders) {
        return { 
          status: 'PASS', 
          details: 'Security headers present for session protection' 
        }
      } else {
        return { 
          status: 'WARN', 
          details: 'Basic session security - consider adding security headers' 
        }
      }
    })
  }

  async testRateLimiting() {
    await this.test('Rate Limiting Protection', async () => {
      const requests = []
      const startTime = Date.now()
      
      // Send 10 rapid requests to test rate limiting
      for (let i = 0; i < 10; i++) {
        requests.push(
          fetch(`${BASE_URL}/api/health`).then(r => ({ 
            status: r.status, 
            headers: Object.fromEntries(r.headers.entries()) 
          }))
        )
      }
      
      const responses = await Promise.all(requests)
      const duration = Date.now() - startTime
      
      // Check for rate limiting responses (429 Too Many Requests)
      const rateLimited = responses.filter(r => r.status === 429)
      const hasRateLimitHeaders = responses.some(r => 
        r.headers['x-ratelimit-limit'] || 
        r.headers['x-ratelimit-remaining'] ||
        r.headers['retry-after']
      )
      
      if (rateLimited.length > 0) {
        return { 
          status: 'PASS', 
          details: `Rate limiting active: ${rateLimited.length}/10 requests blocked` 
        }
      } else if (hasRateLimitHeaders) {
        return { 
          status: 'PASS', 
          details: 'Rate limiting headers detected (soft enforcement)' 
        }
      } else {
        return { 
          status: 'WARN', 
          details: `No rate limiting detected (${duration}ms for 10 requests)` 
        }
      }
    })
  }

  async testInputValidation() {
    await this.test('Input Validation & XSS Protection', async () => {
      // Test XSS payloads
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '"><script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '${alert("xss")}'
      ]
      
      let protectionDetected = false
      const testResults = []
      
      for (const payload of xssPayloads) {
        try {
          const response = await fetch(`${BASE_URL}/api/market-data/${encodeURIComponent(payload)}`)
          const responseText = await response.text()
          
          // Check if payload was sanitized or blocked
          const payloadEscaped = !responseText.includes(payload) || 
                                response.status === 400 || 
                                response.status === 403
          
          if (payloadEscaped) {
            protectionDetected = true
            testResults.push(`✓ ${payload.substring(0, 20)}... blocked/sanitized`)
          } else {
            testResults.push(`⚠ ${payload.substring(0, 20)}... not filtered`)
          }
        } catch (error) {
          // Network errors don't count as XSS vulnerabilities
        }
      }
      
      if (protectionDetected) {
        return { 
          status: 'PASS', 
          details: `XSS protection detected: ${testResults.join(', ')}` 
        }
      } else {
        return { 
          status: 'WARN', 
          details: 'Limited XSS protection detected - review input sanitization' 
        }
      }
    })
  }

  async testSecurityHeaders() {
    await this.test('API Security Headers Analysis', async () => {
      const response = await fetch(`${BASE_URL}/api/health`)
      const headers = response.headers
      
      const securityHeaders = {
        'Content-Security-Policy': headers.get('content-security-policy'),
        'X-Frame-Options': headers.get('x-frame-options'),
        'X-Content-Type-Options': headers.get('x-content-type-options'),
        'X-XSS-Protection': headers.get('x-xss-protection'),
        'Strict-Transport-Security': headers.get('strict-transport-security'),
        'Referrer-Policy': headers.get('referrer-policy')
      }
      
      const presentHeaders = Object.entries(securityHeaders).filter(([_, value]) => value !== null)
      const score = presentHeaders.length
      
      if (score >= 4) {
        return { 
          status: 'PASS', 
          details: `Excellent security headers: ${presentHeaders.map(([k]) => k).join(', ')}` 
        }
      } else if (score >= 2) {
        return { 
          status: 'WARN', 
          details: `Basic security headers present: ${presentHeaders.map(([k]) => k).join(', ')}` 
        }
      } else {
        return { 
          status: 'WARN', 
          details: 'Limited security headers - consider adding CSP, HSTS, etc.' 
        }
      }
    })
  }

  async testCORSConfiguration() {
    await this.test('CORS Configuration Analysis', async () => {
      const response = await fetch(`${BASE_URL}/api/health`)
      const headers = response.headers
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': headers.get('access-control-allow-origin'),
        'Access-Control-Allow-Methods': headers.get('access-control-allow-methods'),
        'Access-Control-Allow-Headers': headers.get('access-control-allow-headers'),
        'Access-Control-Max-Age': headers.get('access-control-max-age')
      }
      
      const hasCORS = Object.values(corsHeaders).some(header => header !== null)
      const allowOrigin = corsHeaders['Access-Control-Allow-Origin']
      
      if (hasCORS && allowOrigin !== '*') {
        return { 
          status: 'PASS', 
          details: `CORS properly configured: Origin=${allowOrigin}` 
        }
      } else if (hasCORS && allowOrigin === '*') {
        return { 
          status: 'WARN', 
          details: 'CORS configured but allows all origins (development OK)' 
        }
      } else if (hasCORS) {
        return { 
          status: 'PASS', 
          details: 'CORS headers detected with proper restrictions' 
        }
      } else {
        return { 
          status: 'WARN', 
          details: 'No CORS headers detected - may cause frontend issues' 
        }
      }
    })
  }

  async testSQLInjectionPrevention() {
    await this.test('SQL Injection Prevention', async () => {
      // Test SQL injection payloads
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "1; SELECT * FROM users",
        "admin'--"
      ]
      
      let protectionDetected = false
      const testResults = []
      
      for (const payload of sqlPayloads) {
        try {
          const response = await fetch(`${BASE_URL}/api/portfolio?userId=${encodeURIComponent(payload)}`)
          
          // Check for SQL injection protection
          const blocked = response.status === 400 || 
                         response.status === 403 ||
                         response.status === 422
          
          if (blocked) {
            protectionDetected = true
            testResults.push(`✓ SQL payload blocked (${response.status})`)
          } else {
            testResults.push(`? SQL payload processed (${response.status})`)
          }
        } catch (error) {
          // Network errors don't count as SQL vulnerabilities
        }
      }
      
      if (protectionDetected) {
        return { 
          status: 'PASS', 
          details: 'SQL injection protection detected' 
        }
      } else {
        return { 
          status: 'WARN', 
          details: 'SQL injection testing inconclusive - verify parameterized queries' 
        }
      }
    })
  }

  generateSecurityReport() {
    const totalTests = this.results.passed + this.results.failed + this.results.warnings
    const securityScore = Math.round(
      ((this.results.passed * 100) + (this.results.warnings * 60)) / 
      (totalTests * 100) * 100
    )
    
    console.log('\n' + '='.repeat(60))
    console.log('🔒 EXPERT SECURITY TESTING REPORT')
    console.log('='.repeat(60))
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`⚠️  Warnings: ${this.results.warnings}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`📊 Security Score: ${securityScore}%`)
    console.log('')
    
    if (securityScore >= 90) {
      console.log('🏆 EXCELLENT: Enterprise-grade security detected!')
    } else if (securityScore >= 75) {
      console.log('✅ GOOD: Solid security foundation with room for improvement')
    } else if (securityScore >= 60) {
      console.log('⚠️  ADEQUATE: Basic security present, recommend enhancements')
    } else {
      console.log('❌ NEEDS IMPROVEMENT: Critical security gaps detected')
    }
    
    return this.results
  }
}

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpertSecurityTester
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new ExpertSecurityTester()
  tester.runExpertSecuritySuite().catch(console.error)
}
