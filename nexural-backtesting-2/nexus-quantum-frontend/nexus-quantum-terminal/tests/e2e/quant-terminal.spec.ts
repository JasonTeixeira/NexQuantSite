import { test, expect } from '@playwright/test';

test.describe('Nexus Quant Terminal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3015');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="nexus-quant-terminal"]', { timeout: 10000 });
  });

  test('should load the main dashboard', async ({ page }) => {
    // Check that the main terminal loads
    await expect(page.locator('[data-testid="nexus-quant-terminal"]')).toBeVisible();
    
    // Check that the header is present
    await expect(page.locator('[data-testid="enhanced-header"]')).toBeVisible();
    
    // Check that the sidebar navigation is present
    await expect(page.locator('[data-testid="sidebar-navigation"]')).toBeVisible();
  });

  test('should navigate between main tabs', async ({ page }) => {
    // Test Control Center tab
    await page.click('text=Control Center');
    await expect(page.locator('text=Performance Overview')).toBeVisible();
    
    // Test Market Intelligence tab
    await page.click('text=Market Intelligence');
    await expect(page.locator('text=Market Data Feed')).toBeVisible();
    
    // Test Strategy Development tab
    await page.click('text=Strategy Development');
    await expect(page.locator('text=Strategy Lab')).toBeVisible();
    
    // Test Risk & Portfolio tab
    await page.click('text=Risk & Portfolio');
    await expect(page.locator('text=Portfolio Dashboard')).toBeVisible();
    
    // Test Execution & Trading tab
    await page.click('text=Execution & Trading');
    await expect(page.locator('text=Live Trading')).toBeVisible();
    
    // Test System Administration tab
    await page.click('text=System Administration');
    await expect(page.locator('text=Data Pipeline')).toBeVisible();
  });

  test('should test terminal functionality', async ({ page }) => {
    // Navigate to terminal tab
    await page.click('text=Enhanced Terminal');
    
    // Wait for terminal to load
    await page.waitForSelector('.xterm', { timeout: 5000 });
    
    // Test terminal input
    await page.click('.xterm');
    await page.keyboard.type('help');
    await page.keyboard.press('Enter');
    
    // Check that help command shows output
    await expect(page.locator('.xterm')).toContainText('Available commands');
  });

  test('should test backtesting workflow', async ({ page }) => {
    // Navigate to Strategy Development
    await page.click('text=Strategy Development');
    await page.click('text=Backtesting Engine');
    
    // Wait for backtesting component to load
    await page.waitForSelector('[data-testid="backtest-wizard"]', { timeout: 5000 });
    
    // Test strategy selection
    await page.selectOption('select[name="strategy"]', 'momentum');
    
    // Test parameter inputs
    await page.fill('input[name="lookback"]', '20');
    await page.fill('input[name="threshold"]', '0.02');
    
    // Test run backtest button
    await page.click('button:has-text("Run Backtest")');
    
    // Check that backtest starts
    await expect(page.locator('text=Running backtest...')).toBeVisible();
  });

  test('should test ML Factory functionality', async ({ page }) => {
    // Navigate to ML Factory
    await page.click('text=Strategy Development');
    await page.click('text=ML Factory');
    
    // Wait for ML Factory to load
    await page.waitForSelector('[data-testid="ml-factory"]', { timeout: 5000 });
    
    // Test model selection
    await page.selectOption('select[name="model"]', 'random_forest');
    
    // Test training button
    await page.click('button:has-text("Train Model")');
    
    // Check that training starts
    await expect(page.locator('text=Training model...')).toBeVisible();
  });

  test('should test portfolio optimization', async ({ page }) => {
    // Navigate to Portfolio Dashboard
    await page.click('text=Risk & Portfolio');
    await page.click('text=Portfolio Dashboard');
    
    // Wait for portfolio component to load
    await page.waitForSelector('[data-testid="portfolio-dashboard"]', { timeout: 5000 });
    
    // Test optimization button
    await page.click('button:has-text("Run Optimization")');
    
    // Check that optimization starts
    await expect(page.locator('text=Optimizing portfolio...')).toBeVisible();
  });

  test('should test settings persistence', async ({ page }) => {
    // Navigate to System Settings
    await page.click('text=System Administration');
    await page.click('text=System Settings');
    
    // Wait for settings to load
    await page.waitForSelector('[data-testid="system-settings"]', { timeout: 5000 });
    
    // Test theme toggle
    await page.click('button[data-testid="theme-toggle"]');
    
    // Test save settings
    await page.click('button:has-text("Save Settings")');
    
    // Check that settings are saved
    await expect(page.locator('text=Settings saved successfully!')).toBeVisible();
  });

  test('should test error boundary', async ({ page }) => {
    // Navigate to a page that might trigger errors
    await page.click('text=Strategy Development');
    await page.click('text=Advanced Indicators');
    
    // Wait for component to load
    await page.waitForSelector('[data-testid="advanced-indicators"]', { timeout: 5000 });
    
    // Test that error boundary is present
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
  });

  test('should test responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that sidebar collapses
    await expect(page.locator('[data-testid="sidebar-toggle"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that layout adapts
    await expect(page.locator('[data-testid="nexus-quant-terminal"]')).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should test keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+Shift+B for right sidebar
    await page.keyboard.press('Control+Shift+B');
    await expect(page.locator('[data-testid="right-sidebar"]')).toBeVisible();
    
    // Test Shift+` for terminal fullscreen
    await page.keyboard.press('Shift+`');
    await expect(page.locator('.terminal-fullscreen')).toBeVisible();
    
    // Test Escape to close modals
    await page.keyboard.press('Escape');
  });

  test('should test data loading states', async ({ page }) => {
    // Navigate to Market Intelligence
    await page.click('text=Market Intelligence');
    await page.click('text=Market Data Feed');
    
    // Check for loading states
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="market-data-table"]', { timeout: 10000 });
    
    // Check that data is displayed
    await expect(page.locator('[data-testid="market-data-table"]')).toBeVisible();
  });

  test('should test export functionality', async ({ page }) => {
    // Navigate to a page with export buttons
    await page.click('text=Strategy Development');
    await page.click('text=Backtesting Engine');
    
    // Wait for component to load
    await page.waitForSelector('[data-testid="backtest-wizard"]', { timeout: 5000 });
    
    // Test PNG export
    await page.click('button:has-text("Export PNG")');
    
    // Check that export dialog appears
    await expect(page.locator('text=Exporting chart...')).toBeVisible();
  });
});
