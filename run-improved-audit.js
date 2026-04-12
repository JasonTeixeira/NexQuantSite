#!/usr/bin/env node

// 🔍 IMPROVED AUDIT - Test after fixes
// Quick validation of critical fixes

const CRITICAL_TESTS = [
  {
    name: 'Homepage',
    url: 'http://localhost:3060/',
    critical: true
  },
  {
    name: 'Learning Page', 
    url: 'http://localhost:3060/learning',
    critical: true
  },
  {
    name: 'Contact Page',
    url: 'http://localhost:3060/contact',
    critical: true
  },
  {
    name: 'Health API',
    url: 'http://localhost:3060/api/health',
    critical: true
  },
  {
    name: 'Contact API',
    url: 'http://localhost:3060/api/contact',
    method: 'POST',
    body: {
      name: 'Test',
      email: 'test@test.com',
      subject: 'Test',
      message: 'Test'
    },
    critical: true
  }
]

async function runQuickAudit() {
  console.log('🔍 Running Quick Audit After Fixes...\n')
  
  let passed = 0
  let failed = 0
  
  for (const test of CRITICAL_TESTS) {
    try {
      const options = {
        method: test.method || 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
      
      if (test.body) {
        options.body = JSON.stringify(test.body)
      }
      
      const response = await fetch(test.url, options)
      
      if (response.status < 400) {
        console.log(`✅ ${test.name}: ${response.status}`)
        passed++
      } else {
        console.log(`❌ ${test.name}: ${response.status}`)
        failed++
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`)
      failed++
    }
  }
  
  const total = passed + failed
  const score = Math.round((passed / total) * 100)
  
  console.log(`\n📊 QUICK AUDIT RESULTS`)
  console.log(`Passed: ${passed}/${total} (${score}%)`)
  
  if (score >= 80) {
    console.log('🟢 GOOD: Major improvements made!')
  } else if (score >= 60) {
    console.log('🟡 PROGRESS: Getting better, more fixes needed')
  } else {
    console.log('🔴 ISSUES: Critical problems remain')
  }
}

runQuickAudit().catch(console.error)

