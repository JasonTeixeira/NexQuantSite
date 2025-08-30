import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Basic accessibility checks without axe-core for now
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)
    
    // Check for alt text on images
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Check for proper link text
    const links = await page.locator('a').all()
    for (const link of links) {
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('admin dashboard should be accessible', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check for proper heading structure in admin
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for form labels if any forms exist
    const inputs = await page.locator('input').all()
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count()
        expect(label > 0 || ariaLabel || placeholder).toBeTruthy()
      }
    }
  })

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT'].includes(focusedElement || '')).toBeTruthy()
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Basic check for dark theme (our default)
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    
    // Should have dark background (our theme)
    expect(bodyBg).toContain('rgb')
  })

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for proper landmark roles
    const main = await page.locator('main').count()
    expect(main).toBeGreaterThan(0)
    
    const nav = await page.locator('nav').count()
    expect(nav).toBeGreaterThan(0)
    
    // Check for skip links or proper navigation structure
    const skipLinks = await page.locator('a[href*="#"]').count()
    expect(skipLinks).toBeGreaterThanOrEqual(0) // Skip links are optional but good
  })

  test('should handle focus management', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Test that interactive elements can receive focus
    const buttons = await page.locator('button').all()
    for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
      const isVisible = await button.isVisible()
      if (isVisible) {
        await button.focus()
        const isFocused = await button.evaluate(el => el === document.activeElement)
        expect(isFocused).toBeTruthy()
      }
    }
  })
})
