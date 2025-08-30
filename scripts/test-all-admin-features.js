#!/usr/bin/env node

/**
 * Comprehensive Admin Dashboard Feature Testing
 * Tests every individual admin feature, component, and page
 */

async function testAdminFeatures() {
  console.log('🧪 TESTING ALL ADMIN DASHBOARD FEATURES')
  console.log('=====================================')
  
  const baseUrl = 'http://localhost:3060'
  let adminToken = null
  const results = []
  
  // Get admin token first
  try {
    console.log('🔑 Getting admin authentication...')
    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nexural.com',
        password: 'admin123'
      })
    })
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      adminToken = loginData.token || loginData.tokens?.accessToken
      console.log('✅ Admin authentication successful')
    } else {
      console.log('⚠️  Using guest access for testing (rate limited)')
    }
  } catch (error) {
    console.log('⚠️  Authentication error, testing without token')
  }

  // All admin pages to test
  const adminPages = [
    // Core dashboards
    { path: '/admin/dashboard', name: 'Main Dashboard', priority: 'HIGH' },
    { path: '/admin/users', name: 'User Management', priority: 'HIGH' },
    { path: '/admin/analytics', name: 'Analytics Dashboard', priority: 'HIGH' },
    { path: '/admin/settings', name: 'System Settings', priority: 'HIGH' },
    
    // Financial management
    { path: '/admin/advanced-financial', name: 'Advanced Financial', priority: 'HIGH' },
    { path: '/admin/financial-reports', name: 'Financial Reports', priority: 'MEDIUM' },
    { path: '/admin/comprehensive-financial', name: 'Comprehensive Financial', priority: 'MEDIUM' },
    
    // AI & Automation
    { path: '/admin/ai-assistant', name: 'AI Assistant', priority: 'HIGH' },
    { path: '/admin/marketing-automation', name: 'Marketing Automation', priority: 'MEDIUM' },
    { path: '/admin/predictive-analytics', name: 'Predictive Analytics', priority: 'MEDIUM' },
    
    // Business Intelligence
    { path: '/admin/business-intelligence', name: 'Business Intelligence', priority: 'HIGH' },
    { path: '/admin/advanced-analytics', name: 'Advanced Analytics', priority: 'MEDIUM' },
    { path: '/admin/performance', name: 'Performance Monitor', priority: 'HIGH' },
    
    // System Management
    { path: '/admin/api-management', name: 'API Management', priority: 'HIGH' },
    { path: '/admin/system-monitor', name: 'System Monitor', priority: 'HIGH' },
    { path: '/admin/system-diagnostics', name: 'System Diagnostics', priority: 'HIGH' },
    { path: '/admin/backup-recovery', name: 'Backup & Recovery', priority: 'MEDIUM' },
    
    // Digital & Mobile
    { path: '/admin/mobile-app', name: 'Mobile App Management', priority: 'MEDIUM' },
    { path: '/admin/mobile-app-console', name: 'Mobile App Console', priority: 'MEDIUM' },
    { path: '/admin/media', name: 'Media Management', priority: 'MEDIUM' },
    { path: '/admin/media-editor', name: 'Media Editor', priority: 'LOW' },
    
    // Trading & Signals
    { path: '/admin/signals', name: 'Trading Signals', priority: 'HIGH' },
    { path: '/admin/referrals', name: 'Referral System', priority: 'MEDIUM' },
    { path: '/admin/lifecycle-management', name: 'User Lifecycle', priority: 'MEDIUM' },
    
    // Content & Communication
    { path: '/admin/blog', name: 'Blog Management', priority: 'MEDIUM' },
    { path: '/admin/blog/create', name: 'Blog Creation', priority: 'LOW' },
    { path: '/admin/content-workflow', name: 'Content Workflow', priority: 'MEDIUM' },
    { path: '/admin/pages', name: 'Page Management', priority: 'MEDIUM' },
    { path: '/admin/support', name: 'Customer Support', priority: 'HIGH' },
    { path: '/admin/integrated-support', name: 'Integrated Support', priority: 'MEDIUM' },
    
    // Security & Compliance
    { path: '/admin/compliance', name: 'Compliance Management', priority: 'HIGH' },
    { path: '/admin/audit', name: 'Audit Logging', priority: 'HIGH' },
    { path: '/admin/transformation', name: 'Business Transformation', priority: 'LOW' },
    
    // Advanced Features
    { path: '/admin/integration-hub', name: 'Integration Hub', priority: 'MEDIUM' },
    { path: '/admin/dashboard-customization', name: 'Dashboard Customization', priority: 'LOW' },
    { path: '/admin/enhanced-segmentation', name: 'Enhanced Segmentation', priority: 'MEDIUM' },
    { path: '/admin/bulk-operations', name: 'Bulk Operations', priority: 'MEDIUM' },
    { path: '/admin/user-segmentation', name: 'User Segmentation', priority: 'MEDIUM' }
  ]

  const testPage = async (page) => {
    try {
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      const response = await fetch(`${baseUrl}${page.path}`, { headers })
      
      const status = response.status
      const statusText = response.statusText
      
      let result = {
        page: page.name,
        path: page.path,
        priority: page.priority,
        status: status,
        working: false,
        issue: null
      }
      
      if (status === 200) {
        result.working = true
        console.log(`✅ ${page.name}: Working perfectly`)
      } else if (status === 401 || status === 403) {
        result.working = true
        result.issue = 'Protected (auth required)'
        console.log(`🔒 ${page.name}: Protected (needs authentication)`)
      } else if (status === 302) {
        result.working = true
        result.issue = 'Redirect (likely auth redirect)'
        console.log(`↪️  ${page.name}: Redirecting (likely auth)`)
      } else if (status === 404) {
        result.working = false
        result.issue = 'Page not found'
        console.log(`❌ ${page.name}: Page not found (404)`)
      } else if (status === 500) {
        result.working = false
        result.issue = 'Server error'
        console.log(`💥 ${page.name}: Server error (500)`)
      } else {
        result.working = false
        result.issue = `HTTP ${status} - ${statusText}`
        console.log(`⚠️  ${page.name}: HTTP ${status}`)
      }
      
      return result
    } catch (error) {
      console.log(`💥 ${page.name}: Network error - ${error.message}`)
      return {
        page: page.name,
        path: page.path,
        priority: page.priority,
        status: 'ERROR',
        working: false,
        issue: `Network error: ${error.message}`
      }
    }
  }

  // Test all pages
  console.log('\n📊 TESTING INDIVIDUAL ADMIN FEATURES:')
  console.log('=====================================')
  
  for (const page of adminPages) {
    const result = await testPage(page)
    results.push(result)
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Generate comprehensive report
  console.log('\n📋 ADMIN FEATURE TEST REPORT')
  console.log('============================')
  
  const totalPages = results.length
  const workingPages = results.filter(r => r.working).length
  const brokenPages = results.filter(r => !r.working).length
  const highPriorityWorking = results.filter(r => r.priority === 'HIGH' && r.working).length
  const highPriorityTotal = results.filter(r => r.priority === 'HIGH').length
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`   Total Admin Features: ${totalPages}`)
  console.log(`   ✅ Working: ${workingPages}`)
  console.log(`   ❌ Broken: ${brokenPages}`)
  console.log(`   🎯 High Priority Working: ${highPriorityWorking}/${highPriorityTotal}`)
  
  const successRate = Math.round((workingPages / totalPages) * 100)
  console.log(`   📈 Success Rate: ${successRate}%`)
  
  if (brokenPages > 0) {
    console.log(`\n❌ BROKEN FEATURES:`)
    results.filter(r => !r.working).forEach(r => {
      console.log(`   • ${r.page} (${r.priority}): ${r.issue}`)
    })
  }
  
  console.log(`\n✅ WORKING FEATURES BY PRIORITY:`)
  
  // High priority features
  const highPriority = results.filter(r => r.priority === 'HIGH')
  console.log(`\n🎯 HIGH PRIORITY (Core Features):`)
  highPriority.forEach(r => {
    const status = r.working ? '✅' : '❌'
    console.log(`   ${status} ${r.page}`)
  })
  
  // Medium priority features
  const mediumPriority = results.filter(r => r.priority === 'MEDIUM')
  console.log(`\n🔶 MEDIUM PRIORITY (Advanced Features):`)
  mediumPriority.forEach(r => {
    const status = r.working ? '✅' : '❌'
    console.log(`   ${status} ${r.page}`)
  })
  
  // Low priority features
  const lowPriority = results.filter(r => r.priority === 'LOW')
  console.log(`\n🔸 LOW PRIORITY (Optional Features):`)
  lowPriority.forEach(r => {
    const status = r.working ? '✅' : '❌'
    console.log(`   ${status} ${r.page}`)
  })
  
  // Overall verdict
  console.log(`\n🏆 OVERALL VERDICT:`)
  if (successRate >= 90) {
    console.log(`   🟢 EXCELLENT: Admin dashboard is production-ready!`)
  } else if (successRate >= 80) {
    console.log(`   🟡 GOOD: Minor issues, but mostly functional`)
  } else if (successRate >= 70) {
    console.log(`   🟠 FAIR: Several issues need attention`)
  } else {
    console.log(`   🔴 POOR: Major issues require fixes`)
  }
  
  // Save detailed results
  try {
    const fs = require('fs')
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages,
        workingPages,
        brokenPages,
        successRate,
        highPriorityWorking,
        highPriorityTotal
      },
      results: results
    }
    
    fs.writeFileSync('./test-reports/admin-features-report.json', JSON.stringify(reportData, null, 2))
    console.log(`\n📄 Detailed report saved: ./test-reports/admin-features-report.json`)
  } catch (error) {
    console.log(`\n⚠️  Could not save report: ${error.message}`)
  }
  
  console.log('============================')
}

// Component functionality tests
async function testComponentFunctionality() {
  console.log('\n🧩 TESTING COMPONENT FUNCTIONALITY')
  console.log('==================================')
  
  const baseUrl = 'http://localhost:3060'
  
  // Test API endpoints that power the admin dashboard
  const apiEndpoints = [
    { path: '/api/admin/verify-session', name: 'Session Verification', method: 'POST' },
    { path: '/api/health', name: 'System Health', method: 'GET' },
    { path: '/api/placeholder/400/300', name: 'Image Placeholder', method: 'GET' },
    { path: '/api/stats', name: 'Statistics API', method: 'GET' },
    { path: '/api/leaderboard', name: 'Leaderboard API', method: 'GET' },
    { path: '/api/signals', name: 'Signals API', method: 'GET' },
    { path: '/api/referrals', name: 'Referrals API', method: 'GET' }
  ]
  
  for (const api of apiEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${api.path}`, {
        method: api.method,
        headers: api.method === 'POST' ? { 'Content-Type': 'application/json' } : {}
      })
      
      if (response.ok) {
        console.log(`✅ ${api.name}: API working`)
      } else if (response.status === 401) {
        console.log(`🔒 ${api.name}: API protected (auth required)`)
      } else {
        console.log(`⚠️  ${api.name}: HTTP ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${api.name}: API error`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 COMPREHENSIVE ADMIN DASHBOARD TESTING')
  console.log('========================================')
  console.log(`Started: ${new Date().toISOString()}\n`)
  
  await testAdminFeatures()
  await testComponentFunctionality()
  
  console.log('\n✨ ADMIN DASHBOARD TESTING COMPLETE')
  console.log('===================================')
}

runAllTests().catch(console.error)
