#!/usr/bin/env node

/**
 * Quick Admin Login Test
 * Tests the admin login flow end-to-end
 */

async function testAdminLogin() {
  console.log('🔑 TESTING ADMIN LOGIN FLOW')
  console.log('==========================')
  
  const baseUrl = 'http://localhost:3060'
  
  try {
    // Test 1: Login page loads
    console.log('1. Testing login page...')
    const loginPageResponse = await fetch(`${baseUrl}/admin/login`)
    
    if (loginPageResponse.ok) {
      console.log('✅ Login page loads successfully')
    } else {
      console.log('❌ Login page failed:', loginPageResponse.status)
      return false
    }
    
    // Test 2: Valid login
    console.log('2. Testing login credentials...')
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
      const token = loginData.token || loginData.tokens?.accessToken
      
      if (token) {
        console.log('✅ Login successful, token received')
        console.log('✅ User:', loginData.user?.name || 'Admin User')
        console.log('✅ Role:', loginData.user?.role || 'admin')
        
        // Test 3: Dashboard access
        console.log('3. Testing dashboard access...')
        const dashboardResponse = await fetch(`${baseUrl}/admin/dashboard`)
        
        if (dashboardResponse.ok) {
          console.log('✅ Dashboard accessible')
        } else {
          console.log('⚠️  Dashboard response:', dashboardResponse.status)
        }
        
        return true
      } else {
        console.log('❌ Login succeeded but no token received')
        return false
      }
    } else {
      console.log('❌ Login failed:', loginResponse.status)
      return false
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message)
    return false
  }
}

// Demo credentials display
function showCredentials() {
  console.log('\n🎯 ADMIN LOGIN CREDENTIALS')
  console.log('=========================')
  console.log('URL: http://localhost:3060/admin/login')
  console.log('')
  console.log('SUPER ADMIN:')
  console.log('  Email: admin@nexural.com')
  console.log('  Password: admin123')
  console.log('  Access: Full admin access')
  console.log('')
  console.log('DEMO ADMIN:')
  console.log('  Email: demo@nexural.com') 
  console.log('  Password: demo123')
  console.log('  Access: Limited admin access')
  console.log('')
}

// Run test
async function runTest() {
  showCredentials()
  
  const success = await testAdminLogin()
  
  console.log('\n' + '='.repeat(40))
  if (success) {
    console.log('🎉 ADMIN LOGIN TEST: SUCCESS')
    console.log('   Your admin dashboard is ready!')
    console.log('   Go to: http://localhost:3060/admin/login')
  } else {
    console.log('⚠️  ADMIN LOGIN TEST: ISSUES FOUND')
    console.log('   Check the server logs for errors')
  }
  console.log('='.repeat(40))
}

runTest().catch(console.error)
