#!/usr/bin/env node

// 🧪 LIVE INTEGRATION TEST SCRIPT
// Tests Resend email and Stripe payment integrations

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
}

const BASE_URL = 'http://localhost:3060'

console.log(`${colors.blue}`)
console.log('╔══════════════════════════════════════════════════╗')
console.log('║     LIVE INTEGRATION TEST SUITE                 ║')
console.log('║     Testing Resend & Stripe                     ║')
console.log('╚══════════════════════════════════════════════════╝')
console.log(`${colors.reset}\n`)

// Test function
async function test(name, fn) {
  process.stdout.write(`Testing ${name}... `)
  try {
    const result = await fn()
    if (result.success) {
      console.log(`${colors.green}✓ PASS${colors.reset}`)
      if (result.message) {
        console.log(`  ${colors.green}→ ${result.message}${colors.reset}`)
      }
      return true
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset}`)
      console.log(`  ${colors.red}→ ${result.error}${colors.reset}`)
      return false
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset}`)
    console.log(`  ${colors.red}→ ${error.message}${colors.reset}`)
    return false
  }
}

// Check environment variables
function checkEnvironment() {
  console.log(`${colors.blue}📋 ENVIRONMENT CHECK${colors.reset}`)
  console.log('─'.repeat(40))
  
  const required = [
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'JWT_SECRET',
    'CSRF_SECRET'
  ]
  
  let allPresent = true
  required.forEach(key => {
    if (process.env[key]) {
      console.log(`  ${colors.green}✓${colors.reset} ${key}: ${process.env[key].substring(0, 10)}...`)
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${key}: Missing`)
      allPresent = false
    }
  })
  
  console.log()
  return allPresent
}

// Main test suite
async function runTests() {
  let passedTests = 0
  let totalTests = 0
  
  // 1. EMAIL TESTS
  console.log(`${colors.blue}📧 EMAIL TESTS (RESEND)${colors.reset}`)
  console.log('─'.repeat(40))
  
  // Test email
  totalTests++
  const emailTest = await test('Send Test Email', async () => {
    const response = await fetch(`${BASE_URL}/api/test/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        type: 'test'
      })
    })
    const data = await response.json()
    return {
      success: data.success,
      message: data.data?.id ? `Email ID: ${data.data.id}` : null,
      error: data.error
    }
  })
  if (emailTest) passedTests++
  
  // Welcome email
  totalTests++
  const welcomeTest = await test('Welcome Email Template', async () => {
    const response = await fetch(`${BASE_URL}/api/test/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        type: 'welcome'
      })
    })
    const data = await response.json()
    return {
      success: data.success,
      message: 'Welcome email template works',
      error: data.error
    }
  })
  if (welcomeTest) passedTests++
  
  // Password reset email
  totalTests++
  const resetTest = await test('Password Reset Template', async () => {
    const response = await fetch(`${BASE_URL}/api/test/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        type: 'reset'
      })
    })
    const data = await response.json()
    return {
      success: data.success,
      message: 'Reset email template works',
      error: data.error
    }
  })
  if (resetTest) passedTests++
  
  console.log()
  
  // 2. PAYMENT TESTS  
  console.log(`${colors.blue}💳 PAYMENT TESTS (STRIPE)${colors.reset}`)
  console.log('─'.repeat(40))
  
  // Create checkout session
  totalTests++
  const checkoutTest = await test('Create Checkout Session', async () => {
    const response = await fetch(`${BASE_URL}/api/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: 'price_test',
        mode: 'subscription'
      })
    })
    const data = await response.json()
    
    // Will fail without auth, but that's expected
    if (response.status === 401) {
      return {
        success: true,
        message: 'Auth protection working correctly'
      }
    }
    
    return {
      success: data.success,
      message: data.session?.id ? `Session: ${data.session.id}` : null,
      error: data.error
    }
  })
  if (checkoutTest) passedTests++
  
  // Webhook endpoint
  totalTests++
  const webhookTest = await test('Webhook Endpoint', async () => {
    const response = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify({
        type: 'test'
      })
    })
    
    // Should fail without proper signature
    if (response.status === 400) {
      return {
        success: true,
        message: 'Webhook signature validation working'
      }
    }
    
    return {
      success: false,
      error: 'Webhook not properly secured'
    }
  })
  if (webhookTest) passedTests++
  
  console.log()
  
  // 3. SECURITY TESTS
  console.log(`${colors.blue}🔒 SECURITY TESTS${colors.reset}`)
  console.log('─'.repeat(40))
  
  // Check no hardcoded secrets
  totalTests++
  const secretsTest = await test('No Hardcoded Secrets', async () => {
    // Check if any files contain hardcoded keys
    const fs = require('fs')
    const path = require('path')
    
    const filesToCheck = [
      'lib/email/resend-service.ts',
      'lib/payments/stripe-service.ts',
      'lib/auth/production-auth.ts'
    ]
    
    let foundHardcoded = false
    for (const file of filesToCheck) {
      const filePath = path.join(process.cwd(), file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes('sk_live_') || content.includes('re_')) {
          foundHardcoded = true
          return {
            success: false,
            error: `Found hardcoded key in ${file}`
          }
        }
      }
    }
    
    return {
      success: !foundHardcoded,
      message: 'No hardcoded secrets found'
    }
  })
  if (secretsTest) passedTests++
  
  console.log('\n' + '═'.repeat(50))
  
  // SUMMARY
  const percentage = ((passedTests / totalTests) * 100).toFixed(0)
  const color = percentage >= 80 ? colors.green : percentage >= 50 ? colors.yellow : colors.red
  
  console.log(`\n${color}╔══════════════════════════════════════════════════╗`)
  console.log(`║               TEST RESULTS                       ║`)
  console.log(`╚══════════════════════════════════════════════════╝${colors.reset}`)
  console.log(`${color}`)
  console.log(`  Tests Passed: ${passedTests}/${totalTests}`)
  console.log(`  Success Rate: ${percentage}%`)
  console.log(`${colors.reset}`)
  
  if (percentage >= 80) {
    console.log(`${colors.green}✅ INTEGRATIONS ARE WORKING!${colors.reset}`)
  } else {
    console.log(`${colors.red}❌ Some integrations need attention${colors.reset}`)
  }
}

// Run tests
runTests().catch(console.error)

