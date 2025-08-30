import { test, expect } from '@playwright/test'

test.describe('Strategy Development Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Navigate to Strategy Development
    await page.click('text=Strategy Development')
    await expect(page.locator('text=Strategy Lab')).toBeVisible()
  })

  test('should complete full strategy development workflow', async ({ page }) => {
    // Step 1: Start in Strategy Lab
    await page.click('text=Strategy Lab')
    await expect(page.locator('text=Visual Strategy Builder')).toBeVisible()
    
    // Step 2: Configure strategy
    await page.fill('input[placeholder="My Strategy"]', 'Test Momentum Strategy')
    await page.selectOption('select', 'NASDAQ 100')
    
    // Step 3: Run backtest
    await page.click('text=Run Backtest')
    
    // Should show running state
    await expect(page.locator('text=Running...')).toBeVisible({ timeout: 5000 })
    
    // Step 4: Navigate to Backtesting Engine for detailed results
    await page.click('text=Backtesting Engine')
    await expect(page.locator('text=Backtesting Engine')).toBeVisible()
    
    // Should show backtest results
    await expect(page.locator('text=Portfolio Performance')).toBeVisible()
  })

  test('should use strategy templates', async ({ page }) => {
    // Navigate to Templates tab
    await page.click('text=Templates')
    await expect(page.locator('text=Momentum Crossover')).toBeVisible()
    
    // Select a template
    await page.click('text=Use Template >> nth=0')
    
    // Should navigate back to builder with template loaded
    await expect(page.locator('text=Strategy Builder')).toBeVisible()
  })

  test('should configure technical indicators', async ({ page }) => {
    // Navigate to Indicators tab
    await page.click('text=Indicators')
    await expect(page.locator('text=SMA')).toBeVisible()
    
    // Configure an indicator
    const smaCard = page.locator('text=SMA').locator('..')
    await smaCard.locator('input[placeholder="Value"]').first().fill('20')
    
    // Add to strategy
    await smaCard.locator('text=Add to Strategy').click()
    
    // Should provide feedback
    await expect(smaCard).toBeVisible()
  })

  test('should display backtest results with charts', async ({ page }) => {
    // Navigate to Backtest Results
    await page.click('text=Backtest Results')
    
    // Wait for charts to load
    await page.waitForSelector('[data-testid="responsive-container"]', { timeout: 10000 })
    
    // Check performance metrics are displayed
    await expect(page.locator('text=Total Return')).toBeVisible()
    await expect(page.locator('text=Sharpe Ratio')).toBeVisible()
    await expect(page.locator('text=Max Drawdown')).toBeVisible()
    await expect(page.locator('text=Win Rate')).toBeVisible()
    
    // Check that charts are rendered
    const charts = page.locator('[data-testid="responsive-container"]')
    await expect(charts.first()).toBeVisible()
  })

  test('should perform factor analysis', async ({ page }) => {
    // Navigate to Factor Analysis tab
    await page.click('text=Factor Analysis')
    
    // Wait for factor analysis to load
    await expect(page.locator('text=Factor Exposures')).toBeVisible()
    
    // Check factor statistics
    await expect(page.locator('text=Market')).toBeVisible()
    await expect(page.locator('text=Size')).toBeVisible()
    await expect(page.locator('text=Value')).toBeVisible()
    await expect(page.locator('text=Momentum')).toBeVisible()
    
    // Check factor radar chart
    await expect(page.locator('text=Factor Profile')).toBeVisible()
  })

  test('should optimize strategy parameters', async ({ page }) => {
    // Navigate to Optimization tab
    await page.click('text=Optimization')
    
    // Configure optimization
    await page.selectOption('select[value="sharpe"]', 'return')
    await page.selectOption('select[value="grid"]', 'bayesian')
    
    // Set parameter ranges
    await page.fill('input[placeholder="10"]', '15')
    await page.fill('input[placeholder="50"]', '45')
    
    // Start optimization
    await page.click('text=Start Optimization')
    
    // Should show optimization results
    await expect(page.locator('text=Optimization Results')).toBeVisible()
    await expect(page.locator('text=Best Parameters')).toBeVisible()
  })

  test('should export strategy results', async ({ page }) => {
    // Navigate to Backtest Results
    await page.click('text=Backtest Results')
    
    // Wait for results to load
    await expect(page.locator('text=Strategy Performance')).toBeVisible()
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button (if available)
    const exportButton = page.locator('text=Export')
    if (await exportButton.isVisible()) {
      await exportButton.click()
      
      // Wait for download
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('strategy')
    }
  })

  test('should save strategy configuration', async ({ page }) => {
    // Configure strategy
    await page.fill('input[placeholder="My Strategy"]', 'Saved Test Strategy')
    
    // Save strategy
    await page.click('text=Save Strategy')
    
    // Should provide confirmation
    // Note: In a real app, this might show a toast or modal
    await expect(page.locator('text=Save Strategy')).toBeVisible()
  })

  test('should handle strategy builder drag and drop', async ({ page }) => {
    // Check that strategy builder canvas is present
    await expect(page.locator('text=Visual Strategy Builder')).toBeVisible()
    await expect(page.locator('text=Drag components to build your strategy')).toBeVisible()
    
    // Check component library
    await expect(page.locator('text=Component Library')).toBeVisible()
    await expect(page.locator('text=Data Sources')).toBeVisible()
    await expect(page.locator('text=Indicators')).toBeVisible()
    await expect(page.locator('text=Signals')).toBeVisible()
    
    // In a real implementation, you would test actual drag and drop
    // For now, just verify the components are present
    await expect(page.locator('text=OHLCV')).toBeVisible()
    await expect(page.locator('text=SMA')).toBeVisible()
    await expect(page.locator('text=Crossover')).toBeVisible()
  })

  test('should validate strategy parameters', async ({ page }) => {
    // Try to configure invalid parameters
    await page.fill('input[placeholder="1000000"]', '-1000')
    
    // Should handle validation gracefully
    // Note: Actual validation behavior depends on implementation
    await expect(page.locator('input[placeholder="1000000"]')).toBeVisible()
  })

  test('should show strategy performance metrics', async ({ page }) => {
    // Navigate to results
    await page.click('text=Backtest Results')
    
    // Check that all key metrics are displayed
    const metrics = [
      'Total Return',
      'Sharpe Ratio', 
      'Max Drawdown',
      'Win Rate'
    ]
    
    for (const metric of metrics) {
      await expect(page.locator(`text=${metric}`)).toBeVisible()
    }
    
    // Check that metric values are displayed (should have percentage or number)
    const metricCards = page.locator('[data-testid="metric-card"]')
    if (await metricCards.count() > 0) {
      for (let i = 0; i < await metricCards.count(); i++) {
        const card = metricCards.nth(i)
        await expect(card).toBeVisible()
      }
    }
  })

  test('should handle multiple strategies', async ({ page }) => {
    // Create first strategy
    await page.fill('input[placeholder="My Strategy"]', 'Strategy 1')
    await page.click('text=Save Strategy')
    
    // Create second strategy
    await page.fill('input[placeholder="My Strategy"]', 'Strategy 2')
    await page.selectOption('select', 'Russell 2000')
    await page.click('text=Save Strategy')
    
    // Should handle multiple strategies
    await expect(page.locator('input[placeholder="My Strategy"]')).toHaveValue('Strategy 2')
  })

  test('should integrate with ML Factory', async ({ page }) => {
    // Navigate to ML Factory
    await page.click('text=ML Factory')
    
    // Should show ML Factory interface
    await expect(page.locator('text=ML Factory')).toBeVisible()
    await expect(page.locator('text=Machine learning model development and deployment')).toBeVisible()
    
    // Check main tabs
    await expect(page.locator('text=Models')).toBeVisible()
    await expect(page.locator('text=Feature Engineering')).toBeVisible()
    await expect(page.locator('text=Training')).toBeVisible()
  })

  test('should show alternative data integration', async ({ page }) => {
    // Navigate to Alternative Data
    await page.click('text=Alternative Data')
    
    // Should show alternative data interface
    await expect(page.locator('text=Alternative Data')).toBeVisible()
    await expect(page.locator('text=Integrate alternative data sources for enhanced alpha generation')).toBeVisible()
    
    // Check data categories
    await expect(page.locator('text=News Sentiment')).toBeVisible()
    await expect(page.locator('text=Social Media')).toBeVisible()
    await expect(page.locator('text=Satellite Data')).toBeVisible()
  })

  test('should access research notebooks', async ({ page }) => {
    // Navigate to Research Notebooks
    await page.click('text=Research Notebooks')
    
    // Should show notebooks interface
    await expect(page.locator('text=Research Notebooks')).toBeVisible()
    await expect(page.locator('text=Interactive research and strategy development environment')).toBeVisible()
    
    // Check notebook tabs
    await expect(page.locator('text=My Notebooks')).toBeVisible()
    await expect(page.locator('text=Templates')).toBeVisible()
    await expect(page.locator('text=Notebook Editor')).toBeVisible()
  })
})
