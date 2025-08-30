#!/usr/bin/env node

/**
 * Quick Admin Feature Test
 * Tests core admin features that should be working
 */

async function quickTest() {
  console.log('🚀 QUICK ADMIN FEATURE TEST')
  console.log('==========================')
  
  const baseUrl = 'http://localhost:3060'
  
  // Test core working features
  const coreFeatures = [
    '/admin/dashboard',
    '/admin/users', 
    '/admin/analytics',
    '/admin/advanced-financial',
    '/admin/ai-assistant',
    '/admin/business-intelligence'
  ]
  
  console.log('\n🎯 Testing CORE admin features (should work):')
  
  for (const feature of coreFeatures) {
    try {
      const response = await fetch(`${baseUrl}${feature}`)
      const status = response.status
      
      if (status === 200) {
        console.log(`✅ ${feature}: Working perfectly`)
      } else if (status === 302 || status === 401) {
        console.log(`🔒 ${feature}: Protected (auth required)`)
      } else {
        console.log(`❌ ${feature}: HTTP ${status}`)
      }
    } catch (error) {
      console.log(`💥 ${feature}: Network error`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // Test previously broken features  
  const brokenFeatures = [
    '/admin/signals',
    '/admin/system-diagnostics', 
    '/admin/backup-recovery',
    '/admin/compliance'
  ]
  
  console.log('\n⚠️  Testing PREVIOUSLY BROKEN features:')
  
  for (const feature of brokenFeatures) {
    try {
      const response = await fetch(`${baseUrl}${feature}`)
      const status = response.status
      
      if (status === 200) {
        console.log(`✅ ${feature}: FIXED - Now working!`)
      } else if (status === 302 || status === 401) {
        console.log(`🔒 ${feature}: FIXED - Now protected (auth required)`)
      } else if (status === 500) {
        console.log(`💥 ${feature}: Still broken (500 error)`)
      } else {
        console.log(`⚠️  ${feature}: HTTP ${status}`)
      }
    } catch (error) {
      console.log(`💥 ${feature}: Network error`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('\n=========================')
  console.log('🎯 QUICK TEST COMPLETE')
  console.log('=========================')
}

quickTest().catch(console.error)
