import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for NexusQuant Terminal E2E tests...')
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Verify the application loads correctly
    await page.waitForSelector('[data-testid="nexus-terminal"]', { timeout: 30000 })
    console.log('✅ Application is ready for testing')
    
    // Set up any global test data or authentication if needed
    await page.evaluate(() => {
      // Clear any existing localStorage
      localStorage.clear()
      
      // Set up default test settings
      localStorage.setItem('nexus-settings', JSON.stringify({
        theme: 'dark',
        accentColor: '#00bbff',
        dataRefresh: 5000,
        gridDensity: 'comfortable'
      }))
      
      // Set up test user preferences
      localStorage.setItem('nexus-user-prefs', JSON.stringify({
        activeMainTab: 'control-center',
        activeSubTab: 'performance-overview',
        activeBottomTab: 'terminal'
      }))
    })
    
    console.log('✅ Global setup completed successfully')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
