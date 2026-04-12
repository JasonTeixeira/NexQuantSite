/**
 * 🧪 CYPRESS COMPONENT TESTING SUPPORT
 * Support file for component testing
 */

// Import commands.ts using ES2015 syntax
import './commands';

// Import mount function for React components
import { mount } from 'cypress/react18';

// Register the mount command for React component testing
Cypress.Commands.add('mount', mount);

// Add CSS for component tests
const appStyles = document.createElement('style');
appStyles.innerHTML = `
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: hsl(var(--foreground));
    background-color: hsl(var(--background));
  }
`;
document.head.appendChild(appStyles);

// Set up global before/after hooks for component tests
beforeEach(() => {
  cy.log('🧩 Setting up component test...');
});

afterEach(() => {
  cy.log('🧹 Cleaning up component test...');
});

// Log component test environment info
Cypress.env('TEST_ENV', process.env.NODE_ENV || 'development');
cy.log(`🌐 Running component tests in ${Cypress.env('TEST_ENV')} environment`);
