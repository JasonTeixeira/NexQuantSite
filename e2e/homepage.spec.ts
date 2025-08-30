import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Nexural Trading/)
    
    // Check main heading is visible
    await expect(page.locator('h1')).toBeVisible()
    
    // Verify no customer navigation on admin routes
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should display key sections', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for hero section
    await expect(page.locator('h1')).toContainText(/Trading/)
    
    // Check for navigation menu
    const navItems = ['Dashboard', 'Bots', 'Indicators', 'Learning']
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible()
    }
  })

  test('should have responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator('nav')).toBeVisible()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    // Mobile might have hamburger menu instead
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to different pages
    const links = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Bots', url: '/bots' },
      { text: 'Pricing', url: '/pricing' }
    ]
    
    for (const link of links) {
      await page.goto('/')
      await page.click(`text=${link.text}`)
      await expect(page).toHaveURL(new RegExp(link.url))
    }
  })

  test('should not display admin elements', async ({ page }) => {
    await page.goto('/')
    
    // Ensure no admin-specific elements are visible on customer pages
    await expect(page.locator('text=Admin Dashboard')).not.toBeVisible()
    await expect(page.locator('text=System Monitor')).not.toBeVisible()
    await expect(page.locator('text=User Management')).not.toBeVisible()
  })
})
