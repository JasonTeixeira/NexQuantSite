import { test, expect } from '@playwright/test'

test.describe('NexusQuant Terminal Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should load the main terminal interface', async ({ page }) => {
    // Check that the main interface loads
    await expect(page.locator('text=Control Center')).toBeVisible()
    await expect(page.locator('text=Market Intelligence')).toBeVisible()
    await expect(page.locator('text=Strategy Development')).toBeVisible()
    await expect(page.locator('text=Risk & Portfolio')).toBeVisible()
    await expect(page.locator('text=Execution & Trading')).toBeVisible()
    await expect(page.locator('text=System Administration')).toBeVisible()
  })

  test('should navigate between main tabs', async ({ page }) => {
    // Start with Control Center active
    await expect(page.locator('text=Control Center').locator('..')).toHaveClass(/bg-\[#00bbff\]/)
    
    // Navigate to Strategy Development
    await page.click('text=Strategy Development')
    await expect(page.locator('text=Strategy Development').locator('..')).toHaveClass(/bg-\[#00bbff\]/)
    
    // Check that sub-tabs are visible
    await expect(page.locator('text=Strategy Lab')).toBeVisible()
    await expect(page.locator('text=Backtesting Engine')).toBeVisible()
    await expect(page.locator('text=ML Factory')).toBeVisible()
    
    // Navigate to Risk & Portfolio
    await page.click('text=Risk & Portfolio')
    await expect(page.locator('text=Risk & Portfolio').locator('..')).toHaveClass(/bg-\[#00bbff\]/)
    
    // Check that appropriate sub-tabs are visible
    await expect(page.locator('text=Portfolio Dashboard')).toBeVisible()
    await expect(page.locator('text=Risk Management')).toBeVisible()
  })

  test('should navigate between sub-tabs', async ({ page }) => {
    // Navigate to Strategy Development
    await page.click('text=Strategy Development')
    
    // Click on ML Factory sub-tab
    await page.click('text=ML Factory')
    
    // Verify ML Factory content is loaded
    await expect(page.locator('text=ML Factory')).toBeVisible()
    
    // Switch to Backtesting Engine
    await page.click('text=Backtesting Engine')
    
    // Verify Backtesting Engine content is loaded
    await expect(page.locator('text=Backtesting Engine')).toBeVisible()
  })

  test('should maintain tab state when switching between main sections', async ({ page }) => {
    // Navigate to Strategy Development > ML Factory
    await page.click('text=Strategy Development')
    await page.click('text=ML Factory')
    
    // Switch to Risk & Portfolio
    await page.click('text=Risk & Portfolio')
    
    // Switch back to Strategy Development
    await page.click('text=Strategy Development')
    
    // Should still be on ML Factory (state maintained)
    await expect(page.locator('text=ML Factory')).toBeVisible()
  })

  test('should navigate bottom tabs', async ({ page }) => {
    // Check bottom navigation is visible
    await expect(page.locator('text=Terminal')).toBeVisible()
    await expect(page.locator('text=Trade Blotter')).toBeVisible()
    await expect(page.locator('text=Alerts')).toBeVisible()
    await expect(page.locator('text=System Monitor')).toBeVisible()
    
    // Click on Terminal
    await page.click('text=Terminal')
    
    // Should show terminal content
    await expect(page.locator('[data-testid="enhanced-ai-terminal"]')).toBeVisible({ timeout: 10000 })
  })

  test('should open and close settings modal', async ({ page }) => {
    // Click settings button
    await page.click('[aria-label="Settings"]')
    
    // Settings modal should be visible
    await expect(page.locator('text=Global Settings')).toBeVisible()
    
    // Close settings modal
    await page.click('[aria-label="Close"]')
    
    // Settings modal should be hidden
    await expect(page.locator('text=Global Settings')).not.toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that the interface adapts to mobile
    await expect(page.locator('text=Control Center')).toBeVisible()
    
    // Navigation should still work on mobile
    await page.click('text=Strategy Development')
    await expect(page.locator('text=Strategy Lab')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on first tab
    await page.keyboard.press('Tab')
    
    // Use arrow keys to navigate (if implemented)
    await page.keyboard.press('ArrowRight')
    
    // Use Enter to activate
    await page.keyboard.press('Enter')
    
    // Should still be functional
    await expect(page.locator('text=Control Center')).toBeVisible()
  })

  test('should load charts and visualizations', async ({ page }) => {
    // Navigate to Control Center (should have charts)
    await page.click('text=Control Center')
    
    // Wait for charts to load
    await page.waitForSelector('[data-testid="responsive-container"]', { timeout: 10000 })
    
    // Check that charts are rendered
    const charts = page.locator('[data-testid="responsive-container"]')
    await expect(charts.first()).toBeVisible()
  })

  test('should handle rapid navigation without errors', async ({ page }) => {
    const sections = [
      'Strategy Development',
      'Risk & Portfolio',
      'Execution & Trading',
      'Market Intelligence',
      'Control Center'
    ]
    
    // Rapidly navigate through sections
    for (const section of sections) {
      await page.click(`text=${section}`)
      await page.waitForTimeout(100) // Small delay to simulate rapid clicking
    }
    
    // Should end up in Control Center without errors
    await expect(page.locator('text=Control Center').locator('..')).toHaveClass(/bg-\[#00bbff\]/)
  })

  test('should persist settings in localStorage', async ({ page }) => {
    // Open settings
    await page.click('[aria-label="Settings"]')
    
    // Change theme setting
    await page.selectOption('select[value="Dark"]', 'Light')
    
    // Save settings
    await page.click('text=Save Settings')
    
    // Check localStorage
    const settings = await page.evaluate(() => {
      return localStorage.getItem('nexus-settings')
    })
    
    expect(settings).toContain('Light')
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Monitor console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Navigate through all sections
    const sections = [
      'Control Center',
      'Market Intelligence', 
      'Strategy Development',
      'Risk & Portfolio',
      'Execution & Trading',
      'System Administration'
    ]
    
    for (const section of sections) {
      await page.click(`text=${section}`)
      await page.waitForTimeout(500)
    }
    
    // Should have minimal console errors
    expect(errors.length).toBeLessThan(5)
  })

  test('should maintain performance under load', async ({ page }) => {
    // Measure navigation performance
    const startTime = Date.now()
    
    // Navigate through multiple sections
    await page.click('text=Strategy Development')
    await page.click('text=ML Factory')
    await page.click('text=Risk & Portfolio')
    await page.click('text=Portfolio Dashboard')
    await page.click('text=Execution & Trading')
    await page.click('text=Options Trading')
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Should complete navigation within reasonable time
    expect(totalTime).toBeLessThan(5000) // 5 seconds
  })
})
