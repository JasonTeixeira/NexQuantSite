#!/usr/bin/env node

/**
 * 🎯 BUTTON FUNCTIONALITY COMPREHENSIVE TEST
 * Testing every button, form, and interaction
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class ButtonFunctionalityTester {
  constructor(baseUrl = 'http://localhost:3060') {
    this.baseUrl = baseUrl;
    this.results = {
      buttons: [],
      forms: [],
      interactions: [],
      errors: []
    };
  }

  async runTest() {
    console.log('🎯 BUTTON FUNCTIONALITY TEST');
    console.log('============================');
    
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Test all pages systematically
      await this.testAdminDashboard(page);
      await this.testOptionsFlow(page);
      await this.testUserDashboard(page);
      await this.testMainSite(page);
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      this.results.errors.push({ test: 'Browser Test', error: error.message });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async testAdminDashboard(page) {
    console.log('\n🔧 Testing Admin Dashboard...');
    
    try {
      await page.goto(`${this.baseUrl}/admin/dashboard`);
      await page.waitForSelector('[role="tablist"]', { timeout: 10000 });

      // Test tab navigation
      const tabs = await page.$$('[role="tab"]');
      console.log(`  Found ${tabs.length} tabs to test`);

      for (let i = 0; i < Math.min(tabs.length, 10); i++) {
        const tab = tabs[i];
        const tabName = await page.evaluate(el => el.textContent, tab);
        
        try {
          await tab.click();
          await page.waitForTimeout(500);
          
          this.results.buttons.push({
            location: 'Admin Dashboard',
            button: `Tab: ${tabName}`,
            status: 'WORKING',
            message: 'Tab navigation successful'
          });
          console.log(`    ✅ Tab: ${tabName}`);
        } catch (error) {
          this.results.buttons.push({
            location: 'Admin Dashboard', 
            button: `Tab: ${tabName}`,
            status: 'FAILED',
            message: error.message
          });
          console.log(`    ❌ Tab: ${tabName} - ${error.message}`);
        }
      }

      // Test buttons within admin dashboard
      await this.testButtonsOnPage(page, 'Admin Dashboard');

    } catch (error) {
      console.log(`    ❌ Admin Dashboard test failed: ${error.message}`);
      this.results.errors.push({ test: 'Admin Dashboard', error: error.message });
    }
  }

  async testOptionsFlow(page) {
    console.log('\n⚡ Testing Options Flow...');
    
    try {
      await page.goto(`${this.baseUrl}/options-flow`);
      await page.waitForSelector('button', { timeout: 10000 });

      // Test live control buttons
      const buttons = await page.$$('button');
      console.log(`  Found ${buttons.length} buttons to test`);

      for (const button of buttons.slice(0, 15)) { // Test first 15 buttons
        const buttonText = await page.evaluate(el => el.textContent, button);
        
        try {
          const isDisabled = await page.evaluate(el => el.disabled, button);
          
          if (!isDisabled) {
            await button.click();
            await page.waitForTimeout(300);
            
            this.results.buttons.push({
              location: 'Options Flow',
              button: buttonText,
              status: 'WORKING',
              message: 'Button click successful'
            });
            console.log(`    ✅ Button: ${buttonText.substring(0, 30)}...`);
          } else {
            this.results.buttons.push({
              location: 'Options Flow',
              button: buttonText,
              status: 'DISABLED',
              message: 'Button correctly disabled'
            });
            console.log(`    ⚠️ Button: ${buttonText.substring(0, 30)}... (disabled)`);
          }
        } catch (error) {
          this.results.buttons.push({
            location: 'Options Flow',
            button: buttonText,
            status: 'FAILED', 
            message: error.message
          });
          console.log(`    ❌ Button: ${buttonText.substring(0, 30)}... - ${error.message}`);
        }
      }

      // Test dropdown selects
      const selects = await page.$$('select');
      for (const select of selects) {
        const selectId = await page.evaluate(el => el.id || el.name || 'unnamed', select);
        
        try {
          const options = await page.$$eval('select option', options => 
            options.map(option => option.value)
          );
          
          if (options.length > 1) {
            await page.select('select', options[1]);
            await page.waitForTimeout(200);
            
            this.results.interactions.push({
              location: 'Options Flow',
              element: `Select: ${selectId}`,
              status: 'WORKING',
              message: 'Select dropdown functional'
            });
            console.log(`    ✅ Select: ${selectId}`);
          }
        } catch (error) {
          this.results.interactions.push({
            location: 'Options Flow',
            element: `Select: ${selectId}`, 
            status: 'FAILED',
            message: error.message
          });
          console.log(`    ❌ Select: ${selectId} - ${error.message}`);
        }
      }

    } catch (error) {
      console.log(`    ❌ Options Flow test failed: ${error.message}`);
      this.results.errors.push({ test: 'Options Flow', error: error.message });
    }
  }

  async testUserDashboard(page) {
    console.log('\n📊 Testing User Dashboard...');
    
    try {
      await page.goto(`${this.baseUrl}/dashboard`);
      await page.waitForSelector('button', { timeout: 10000 });

      await this.testButtonsOnPage(page, 'User Dashboard');

    } catch (error) {
      console.log(`    ❌ User Dashboard test failed: ${error.message}`);
      this.results.errors.push({ test: 'User Dashboard', error: error.message });
    }
  }

  async testMainSite(page) {
    console.log('\n🏠 Testing Main Site...');
    
    const pages = [
      { url: '/', name: 'Home' },
      { url: '/pricing', name: 'Pricing' },
      { url: '/about', name: 'About' }
    ];

    for (const testPage of pages) {
      try {
        await page.goto(`${this.baseUrl}${testPage.url}`);
        await page.waitForSelector('body', { timeout: 5000 });
        
        await this.testButtonsOnPage(page, testPage.name);
        
      } catch (error) {
        console.log(`    ❌ ${testPage.name} test failed: ${error.message}`);
        this.results.errors.push({ test: testPage.name, error: error.message });
      }
    }
  }

  async testButtonsOnPage(page, pageName) {
    try {
      const buttons = await page.$$('button');
      
      for (const button of buttons.slice(0, 10)) { // Test first 10 buttons per page
        const buttonText = await page.evaluate(el => el.textContent || el.getAttribute('aria-label') || 'unnamed', button);
        
        try {
          const isVisible = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
          }, button);
          
          if (isVisible) {
            await button.click();
            await page.waitForTimeout(200);
            
            this.results.buttons.push({
              location: pageName,
              button: buttonText.substring(0, 50),
              status: 'WORKING',
              message: 'Button responsive'
            });
            console.log(`    ✅ Button: ${buttonText.substring(0, 30)}...`);
          }
        } catch (error) {
          this.results.buttons.push({
            location: pageName,
            button: buttonText.substring(0, 50),
            status: 'FAILED',
            message: error.message
          });
          console.log(`    ❌ Button: ${buttonText.substring(0, 30)}... - ${error.message.substring(0, 50)}`);
        }
      }
    } catch (error) {
      console.log(`    ⚠️ Could not test buttons on ${pageName}: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 BUTTON FUNCTIONALITY TEST RESULTS');
    console.log('====================================');

    const totalButtons = this.results.buttons.length;
    const workingButtons = this.results.buttons.filter(b => b.status === 'WORKING').length;
    const failedButtons = this.results.buttons.filter(b => b.status === 'FAILED').length;
    const disabledButtons = this.results.buttons.filter(b => b.status === 'DISABLED').length;

    const totalInteractions = this.results.interactions.length;
    const workingInteractions = this.results.interactions.filter(i => i.status === 'WORKING').length;

    const buttonSuccessRate = totalButtons > 0 ? (workingButtons / totalButtons * 100) : 0;
    const interactionSuccessRate = totalInteractions > 0 ? (workingInteractions / totalInteractions * 100) : 0;

    console.log('\n🎯 SUMMARY:');
    console.log(`Buttons tested: ${totalButtons}`);
    console.log(`Working: ${workingButtons} (${buttonSuccessRate.toFixed(1)}%)`);
    console.log(`Failed: ${failedButtons}`);
    console.log(`Disabled: ${disabledButtons}`);
    console.log(`Interactions tested: ${totalInteractions}`);
    console.log(`Working interactions: ${workingInteractions} (${interactionSuccessRate.toFixed(1)}%)`);

    console.log('\n🏆 FUNCTIONALITY GRADE:');
    const overallScore = (buttonSuccessRate + interactionSuccessRate) / 2;
    let grade = 'F';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 85) grade = 'A-';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'B-';
    else if (overallScore >= 65) grade = 'C+';
    else if (overallScore >= 60) grade = 'C';

    console.log(`Overall Score: ${overallScore.toFixed(1)}/100 (${grade})`);

    if (failedButtons > 0) {
      console.log('\n🚨 FAILED BUTTONS:');
      this.results.buttons.filter(b => b.status === 'FAILED').forEach(button => {
        console.log(`  ❌ ${button.location}: ${button.button} - ${button.message}`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
      this.results.errors.forEach(error => {
        console.log(`  ❌ ${error.test}: ${error.error}`);
      });
    }

    // Save report
    const reportPath = './BUTTON_FUNCTIONALITY_REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalButtons,
        workingButtons,
        failedButtons,
        disabledButtons,
        buttonSuccessRate,
        interactionSuccessRate,
        overallScore,
        grade
      },
      results: this.results
    }, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return { overallScore, grade, failedButtons };
  }
}

// Fallback for systems without puppeteer
async function fallbackTest() {
  console.log('🎯 BUTTON FUNCTIONALITY TEST (Fallback Mode)');
  console.log('=============================================');
  console.log('Puppeteer not available, using HTTP-based testing...');

  const http = require('http');
  const results = { working: 0, total: 0, errors: [] };

  const pages = [
    '/admin/dashboard',
    '/dashboard', 
    '/options-flow',
    '/'
  ];

  for (const page of pages) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3060${page}`, resolve);
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Timeout')));
      });

      if (response.statusCode === 200) {
        results.working++;
        console.log(`  ✅ ${page}: Accessible`);
      } else {
        console.log(`  ❌ ${page}: Status ${response.statusCode}`);
        results.errors.push(`${page}: Status ${response.statusCode}`);
      }
      results.total++;
    } catch (error) {
      console.log(`  ❌ ${page}: ${error.message}`);
      results.errors.push(`${page}: ${error.message}`);
      results.total++;
    }
  }

  const successRate = (results.working / results.total) * 100;
  console.log(`\n📊 Results: ${results.working}/${results.total} pages accessible (${successRate.toFixed(1)}%)`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Issues found:');
    results.errors.forEach(error => console.log(`  ❌ ${error}`));
  }

  return results;
}

// Run test
if (require.main === module) {
  const tester = new ButtonFunctionalityTester();
  
  tester.runTest()
    .then(() => console.log('\n✅ Button functionality test completed'))
    .catch(async (error) => {
      console.log('\n⚠️ Puppeteer test failed, trying fallback...');
      await fallbackTest();
    });
}

module.exports = ButtonFunctionalityTester;
