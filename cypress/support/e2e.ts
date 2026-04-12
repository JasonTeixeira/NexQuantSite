/**
 * 🧪 CYPRESS E2E SUPPORT
 * Main support file for E2E tests
 */

// Import commands.ts using ES2015 syntax
import './commands';

// Configure global behavior
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test on uncaught exceptions
  // This is useful in cases where the application has error handlers that we want to test
  // but we don't want Cypress to fail the test because of them.
  // If you want to have Cypress fail on uncaught exceptions, return true here.
  
  // Ignore ResizeObserver errors as they're generally harmless
  if (err.message.includes('ResizeObserver') || err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Log all uncaught exceptions for debugging
  console.error('Uncaught exception:', err);
  
  // Return false to prevent the test from failing
  return false;
});

// Set up global before/after hooks
beforeEach(() => {
  // Reset the application state before each test
  cy.log('🔄 Resetting application state before test...');
  
  // Clear local storage and cookies
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Add any other setup steps you need before each test
});

afterEach(() => {
  // Clean up after each test
  cy.log('🧹 Cleaning up after test...');
});

// Define global custom assertions
chai.Assertion.addProperty('visible', function () {
  const subject = this._obj;
  const assertFn = () => new chai.Assertion(subject).to.be.visible;
  
  this.assert(
    subject.is(':visible'),
    'expected #{this} to be visible',
    'expected #{this} not to be visible'
  );
});

// Setup screenshot behavior
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: true,
  capture: 'viewport'
});

// Log test environment info
Cypress.env('TEST_ENV', process.env.NODE_ENV || 'development');
cy.log(`🌐 Running tests in ${Cypress.env('TEST_ENV')} environment`);
