import { test, expect } from '@playwright/test'

test.describe('Basic Smoke Tests', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the main terminal to load
    await page.waitForSelector('[data-testid="nexus-terminal"]', { timeout: 30000 })
    
    // Check that the main interface is visible
    await expect(page.locator('[data-testid="nexus-terminal"]')).toBeVisible()
    
    // Check for key UI elements
    await expect(page.locator('text=NexusQuant')).toBeVisible()
    
    // Check that main tabs are present
    await expect(page.locator('text=Control Center')).toBeVisible()
    await expect(page.locator('text=Market Intelligence')).toBeVisible()
    await expect(page.locator('text=Strategy Development')).toBeVisible()
  })

  test('should navigate between main tabs', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="nexus-terminal"]', { timeout: 30000 })
    
    // Test basic tab navigation
    await page.click('text=Market Intelligence')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Live Market Data')).toBeVisible()
    
    await page.click('text=Strategy Development')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Strategy Lab')).toBeVisible()
  })

  test('should open enhanced UI features', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="nexus-terminal"]', { timeout: 30000 })
    
    // Test command palette
    await page.keyboard.press('Control+Shift+K')
    await expect(page.locator('text=Type a command or search...')).toBeVisible()
    await page.keyboard.press('Escape')
    
    // Test performance monitor
    await page.keyboard.press('Control+Shift+P')
    await expect(page.locator('text=Performance Monitor')).toBeVisible()
  })
})
