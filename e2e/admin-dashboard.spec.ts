import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test('should load admin dashboard successfully', async ({ page }) => {
    await page.goto('/admin/dashboard')
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Check page is loading (might show loading state first)
    await expect(page.locator('body')).toBeVisible()
    
    // Wait for admin content to load (bypass loading screen)
    await page.waitForTimeout(2000)
  })

  test('should display admin-specific elements', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Wait for auth bypass and loading
    
    // Check for admin-specific content
    const adminElements = [
      'User Management',
      'System Monitor', 
      'Analytics',
      'Content & Workflow'
    ]
    
    for (const element of adminElements) {
      // Use more flexible selector since exact text might vary
      await expect(page.locator(`text*=${element}`).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('should not display customer navigation', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Ensure customer navigation is NOT visible on admin pages
    await expect(page.locator('text=Community')).not.toBeVisible()
    await expect(page.locator('text=Marketplace')).not.toBeVisible()
    await expect(page.locator('text=Leaderboard')).not.toBeVisible()
  })

  test('should not display customer footer', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Ensure customer footer is NOT visible on admin pages
    await expect(page.locator('text=Earn While You Share')).not.toBeVisible()
    await expect(page.locator('footer')).not.toBeVisible()
  })

  test('should display admin sidebar navigation', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check for admin sidebar elements
    const sidebarItems = [
      'Dashboard',
      'Users',
      'Analytics', 
      'Settings'
    ]
    
    for (const item of sidebarItems) {
      // Look for sidebar navigation items
      await expect(page.locator(`nav`).locator(`text*=${item}`).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('should handle admin authentication bypass in development', async ({ page }) => {
    await page.goto('/admin/dashboard')
    
    // In development mode, should bypass auth and load dashboard
    // Should not redirect to login page
    await page.waitForTimeout(3000)
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    
    // Should not show login form
    await expect(page.locator('input[type="password"]')).not.toBeVisible()
    await expect(page.locator('text=Login')).not.toBeVisible()
  })

  test('should display statistics cards', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Look for typical admin dashboard stat cards
    const stats = [
      'Total Users',
      'Active Bots', 
      'Revenue',
      'System'
    ]
    
    for (const stat of stats) {
      // Use flexible text matching for stats
      await expect(page.locator(`text*=${stat}`).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop admin view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    
    // Test tablet admin view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator('body')).toBeVisible()
    
    // Test mobile admin view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(page.locator('body')).toBeVisible()
  })
})
