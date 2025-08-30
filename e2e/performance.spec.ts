import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('homepage should load within performance budget', async ({ page }) => {
    // Start timing
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    
    // Check for Core Web Vitals
    const metrics = await page.evaluate(() => ({
      // Check if performance API is available
      navigationTiming: performance.getEntriesByType('navigation')[0] || null,
      paintTiming: performance.getEntriesByType('paint') || []
    }))
    
    expect(metrics.navigationTiming).toBeTruthy()
  })

  test('admin dashboard should load efficiently', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Wait for auth bypass
    
    const loadTime = Date.now() - startTime
    
    // Admin dashboard might be heavier, allow 8 seconds
    expect(loadTime).toBeLessThan(8000)
  })

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/')
    
    // Navigate through several pages to test for memory leaks
    const pages = ['/', '/dashboard', '/bots', '/pricing']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      // Check JS heap size (basic check)
      const heapSize = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize
        }
        return 0
      })
      
      // Basic check - heap shouldn't be extremely large (100MB)
      if (heapSize > 0) {
        expect(heapSize).toBeLessThan(100 * 1024 * 1024)
      }
    }
  })

  test('should load critical resources quickly', async ({ page }) => {
    const resourceTimes: { [key: string]: number } = {}
    
    // Monitor resource loading
    page.on('response', response => {
      const url = response.url()
      const timing = response.timing()
      if (timing) {
        resourceTimes[url] = timing.responseEnd
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that CSS loads quickly (should be under 1 second)
    const cssFiles = Object.keys(resourceTimes).filter(url => url.includes('.css'))
    for (const cssFile of cssFiles) {
      expect(resourceTimes[cssFile]).toBeLessThan(1000)
    }
  })

  test('should optimize image loading', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for lazy loading attributes on images
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const loading = await img.getAttribute('loading')
      const src = await img.getAttribute('src')
      
      // Images should either have lazy loading or be critical (small, above fold)
      if (src && !src.includes('data:')) {
        // Non-critical images should have lazy loading
        const isAboveFold = await img.evaluate(el => {
          const rect = el.getBoundingClientRect()
          return rect.top < window.innerHeight
        })
        
        if (!isAboveFold) {
          expect(loading).toBe('lazy')
        }
      }
    }
  })

  test('should minimize JavaScript bundle size', async ({ page }) => {
    const scriptSizes: number[] = []
    
    page.on('response', async response => {
      const url = response.url()
      if (url.includes('.js') && url.includes('_next/static')) {
        try {
          const buffer = await response.body()
          scriptSizes.push(buffer.length)
        } catch (e) {
          // Ignore errors for resource timing
        }
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that individual JS chunks aren't too large (2MB limit)
    for (const size of scriptSizes) {
      expect(size).toBeLessThan(2 * 1024 * 1024)
    }
  })

  test('should handle concurrent users simulation', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ])
    
    const pages = await Promise.all(contexts.map(context => context.newPage()))
    
    // All users navigate simultaneously
    const startTime = Date.now()
    await Promise.all(pages.map(page => page.goto('/')))
    await Promise.all(pages.map(page => page.waitForLoadState('networkidle')))
    const loadTime = Date.now() - startTime
    
    // Should handle concurrent load within reasonable time
    expect(loadTime).toBeLessThan(10000)
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()))
  })
})
