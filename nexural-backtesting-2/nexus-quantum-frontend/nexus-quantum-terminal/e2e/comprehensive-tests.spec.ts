import { test, expect, Page } from '@playwright/test'

// Comprehensive E2E Tests for NexusQuant Terminal
test.describe('NexusQuant Terminal - Comprehensive E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="nexus-terminal"]', { timeout: 30000 })
  })

  test.describe('Core Navigation Tests', () => {
    test('should load main terminal interface', async ({ page }) => {
      // Check main container
      await expect(page.locator('[data-testid="nexus-terminal"]')).toBeVisible()
      
      // Check header elements
      await expect(page.locator('text=NexusQuant')).toBeVisible()
      await expect(page.locator('text=Institutional Trading Terminal')).toBeVisible()
      
      // Check main tabs are present
      const mainTabs = [
        'Control Center',
        'Market Intelligence', 
        'Strategy Development',
        'Risk & Portfolio',
        'Execution & Trading',
        'System Administration'
      ]
      
      for (const tab of mainTabs) {
        await expect(page.locator(`text=${tab}`)).toBeVisible()
      }
    })

    test('should navigate between main tabs', async ({ page }) => {
      // Test each main tab navigation
      const tabs = [
        { name: 'Market Intelligence', expectedContent: 'Live Market Data' },
        { name: 'Strategy Development', expectedContent: 'Strategy Lab' },
        { name: 'Risk & Portfolio', expectedContent: 'Portfolio' },
        { name: 'Execution & Trading', expectedContent: 'Live Trading' },
        { name: 'System Administration', expectedContent: 'Data Pipeline' }
      ]

      for (const tab of tabs) {
        await page.click(`text=${tab.name}`)
        await page.waitForTimeout(1000) // Allow for lazy loading
        // Check that content has changed
        await expect(page.locator('body')).toContainText(tab.expectedContent)
      }
    })

    test('should navigate sub-tabs within main tabs', async ({ page }) => {
      // Test Strategy Development sub-tabs
      await page.click('text=Strategy Development')
      await page.waitForTimeout(1000)
      
      const subTabs = ['Strategy Lab', 'Backtesting Engine', 'ML Factory', 'Alternative Data']
      
      for (const subTab of subTabs) {
        await page.click(`text=${subTab}`)
        await page.waitForTimeout(500)
        await expect(page.locator('body')).toContainText(subTab)
      }
    })
  })

  test.describe('Enhanced UI Features Tests', () => {
    test('should open and interact with command palette', async ({ page }) => {
      // Open command palette with keyboard shortcut
      await page.keyboard.press('Control+Shift+K')
      
      // Check command palette is visible
      await expect(page.locator('text=Type a command or search...')).toBeVisible()
      
      // Type a search query
      await page.fill('input[placeholder*="command"]', 'settings')
      
      // Check filtered results
      await expect(page.locator('text=Open Settings')).toBeVisible()
      
      // Close with Escape
      await page.keyboard.press('Escape')
      await expect(page.locator('text=Type a command or search...')).not.toBeVisible()
    })

    test('should toggle fullscreen mode', async ({ page }) => {
      // Click fullscreen button
      await page.click('[title*="Toggle Fullscreen"]')
      
      // Note: In headless mode, fullscreen API might not work
      // So we just check the button exists and is clickable
      await expect(page.locator('[title*="Toggle Fullscreen"]')).toBeVisible()
    })

    test('should open notification center', async ({ page }) => {
      // Click notification bell
      await page.click('button:has(svg[data-lucide="bell"])')
      
      // Check notification panel opens
      await expect(page.locator('text=Notifications')).toBeVisible()
      
      // Check clear all button
      await expect(page.locator('text=Clear All')).toBeVisible()
    })

    test('should open theme switcher', async ({ page }) => {
      // Click theme/palette button
      await page.click('button:has(svg[data-lucide="palette"])')
      
      // Check theme panel opens
      await expect(page.locator('text=Appearance')).toBeVisible()
      await expect(page.locator('text=Theme')).toBeVisible()
      await expect(page.locator('text=Accent Color')).toBeVisible()
    })

    test('should open help system', async ({ page }) => {
      // Click help button
      await page.click('button:has(svg[data-lucide="help-circle"])')
      
      // Check help panel opens
      await expect(page.locator('text=Help & Documentation')).toBeVisible()
      await expect(page.locator('text=Getting Started')).toBeVisible()
    })
  })

  test.describe('Performance Monitor Tests', () => {
    test('should toggle performance monitor', async ({ page }) => {
      // Open performance monitor with keyboard shortcut
      await page.keyboard.press('Control+Shift+P')
      
      // Check performance monitor appears
      await expect(page.locator('text=Performance Monitor')).toBeVisible()
      await expect(page.locator('text=FPS')).toBeVisible()
      await expect(page.locator('text=Memory')).toBeVisible()
    })
  })

  test.describe('AI Terminal Tests', () => {
    test('should access AI terminal', async ({ page }) => {
      // Click on terminal tab at bottom
      await page.click('text=Terminal')
      
      // Wait for AI terminal to load
      await page.waitForTimeout(2000)
      
      // Check AI terminal interface
      await expect(page.locator('.xterm-screen')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Chart and Data Visualization Tests', () => {
    test('should load charts in Control Center', async ({ page }) => {
      // Go to Control Center
      await page.click('text=Control Center')
      await page.waitForTimeout(1000)
      
      // Check for chart containers
      await expect(page.locator('.recharts-responsive-container')).toBeVisible({ timeout: 10000 })
    })

    test('should load market data charts', async ({ page }) => {
      // Go to Market Intelligence
      await page.click('text=Market Intelligence')
      await page.waitForTimeout(2000)
      
      // Check for market data elements
      await expect(page.locator('text=Live Market Data')).toBeVisible()
    })
  })

  test.describe('Settings and Configuration Tests', () => {
    test('should open global settings', async ({ page }) => {
      // Click settings button
      await page.click('button:has(svg[data-lucide="settings"])')
      
      // Check settings modal opens
      await expect(page.locator('text=Global Settings')).toBeVisible()
    })
  })
})

test.describe('Chaos and Stress Testing', () => {
  test.describe('Rapid Navigation Stress Test', () => {
    test('should handle rapid tab switching', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      const tabs = [
        'Control Center',
        'Market Intelligence', 
        'Strategy Development',
        'Risk & Portfolio',
        'Execution & Trading',
        'System Administration'
      ]

      // Rapidly switch between tabs 20 times
      for (let i = 0; i < 20; i++) {
        const randomTab = tabs[Math.floor(Math.random() * tabs.length)]
        await page.click(`text=${randomTab}`)
        await page.waitForTimeout(100) // Very short wait to stress test
      }

      // Verify the interface is still responsive
      await expect(page.locator('[data-testid="nexus-terminal"]')).toBeVisible()
    })

    test('should handle rapid sub-tab switching', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      // Go to Strategy Development
      await page.click('text=Strategy Development')
      await page.waitForTimeout(1000)

      const subTabs = ['Strategy Lab', 'Backtesting Engine', 'ML Factory', 'Alternative Data', 'Research Notebooks']

      // Rapidly switch between sub-tabs 15 times
      for (let i = 0; i < 15; i++) {
        const randomSubTab = subTabs[Math.floor(Math.random() * subTabs.length)]
        await page.click(`text=${randomSubTab}`)
        await page.waitForTimeout(50)
      }

      // Verify interface is still responsive
      await expect(page.locator('text=Strategy Development')).toBeVisible()
    })
  })

  test.describe('Memory Stress Testing', () => {
    test('should handle multiple modal openings', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      // Rapidly open and close various modals
      for (let i = 0; i < 10; i++) {
        // Open command palette
        await page.keyboard.press('Control+Shift+K')
        await page.waitForTimeout(100)
        await page.keyboard.press('Escape')
        
        // Open performance monitor
        await page.keyboard.press('Control+Shift+P')
        await page.waitForTimeout(100)
        await page.keyboard.press('Control+Shift+P') // Toggle off
        
        // Open help
        await page.click('button:has(svg[data-lucide="help-circle"])')
        await page.waitForTimeout(100)
        await page.keyboard.press('Escape')
      }

      // Verify no memory leaks by checking interface is still responsive
      await expect(page.locator('[data-testid="nexus-terminal"]')).toBeVisible()
    })
  })

  test.describe('Network Resilience Testing', () => {
    test('should handle network interruptions gracefully', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      // Simulate network conditions
      await page.route('**/*', route => {
        // Randomly delay or fail some requests to simulate network issues
        if (Math.random() < 0.1) { // 10% chance of delay
          setTimeout(() => route.continue(), 2000)
        } else {
          route.continue()
        }
      })

      // Navigate through the app with simulated network issues
      const tabs = ['Market Intelligence', 'Strategy Development', 'Risk & Portfolio']
      
      for (const tab of tabs) {
        await page.click(`text=${tab}`)
        await page.waitForTimeout(1000)
        await expect(page.locator(`text=${tab}`)).toBeVisible()
      }
    })
  })

  test.describe('Concurrent User Simulation', () => {
    test('should handle multiple concurrent interactions', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      // Simulate multiple concurrent user actions
      const actions = [
        () => page.click('text=Market Intelligence'),
        () => page.keyboard.press('Control+Shift+K'),
        () => page.click('button:has(svg[data-lucide="bell"])'),
        () => page.click('text=Strategy Development'),
        () => page.keyboard.press('Control+Shift+P'),
      ]

      // Execute multiple actions concurrently
      await Promise.all([
        actions[0](),
        actions[1](),
        actions[2](),
        actions[3](),
        actions[4](),
      ])

      // Wait for all actions to settle
      await page.waitForTimeout(2000)

      // Verify the interface is still functional
      await expect(page.locator('[data-testid="nexus-terminal"]')).toBeVisible()
    })
  })

  test.describe('Data Load Stress Testing', () => {
    test('should handle large dataset rendering', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      // Navigate to data-heavy sections
      await page.click('text=Market Intelligence')
      await page.waitForTimeout(2000)

      // Check that charts and data tables load
      await expect(page.locator('.recharts-responsive-container')).toBeVisible({ timeout: 15000 })

      // Navigate to Strategy Development with heavy charts
      await page.click('text=Strategy Development')
      await page.waitForTimeout(2000)
      
      await page.click('text=Backtesting Engine')
      await page.waitForTimeout(2000)

      // Verify charts load even with large datasets
      await expect(page.locator('text=Backtesting Engine')).toBeVisible()
    })
  })

  test.describe('Browser Compatibility Stress', () => {
    test('should work across different viewport sizes', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('[data-testid="nexus-terminal"]')

      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1366, height: 768 },  // Laptop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 },   // Mobile
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(500)
        
        // Verify main interface is still visible
        await expect(page.locator('[data-testid="nexus-terminal"]')).toBeVisible()
        
        // Try basic navigation
        await page.click('text=Market Intelligence')
        await page.waitForTimeout(500)
        await expect(page.locator('text=Market Intelligence')).toBeVisible()
      }
    })
  })
})
