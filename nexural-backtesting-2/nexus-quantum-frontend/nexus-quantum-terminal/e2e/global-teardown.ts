import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for NexusQuant Terminal E2E tests...')
  
  try {
    // Clean up any global resources
    console.log('🗑️ Cleaning up test artifacts...')
    
    // Add any cleanup logic here
    // For example: close database connections, clean up test files, etc.
    
    console.log('✅ Global teardown completed successfully')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw here as it might mask test failures
  }
}

export default globalTeardown
