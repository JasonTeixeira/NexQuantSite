/**
 * 🧪 CYPRESS CUSTOM COMMANDS
 * Define custom commands for Cypress tests
 */

// Import Cypress types for TypeScript support
/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      // Login command that logs in a user with given credentials
      login(email: string, password: string): Chainable<Element>;
      
      // Logout command that logs out the current user
      logout(): Chainable<Element>;
      
      // Wait for API request to complete
      waitForApi(method: string, url: string): Chainable<null>;
      
      // Get element by data-testid
      getByTestId(testId: string): Chainable<Element>;
      
      // Check that toast notification appears with given text
      shouldShowToast(text: string): Chainable<Element>;
    }
  }
}

/**
 * Log in a user with email and password
 * @example cy.login('user@example.com', 'password123')
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  
  // Fill in login form
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  
  // Submit form
  cy.get('button[type="submit"]').click();
  
  // Wait for login to complete
  cy.url().should('not.include', '/login');
  
  // Verify that the login was successful
  cy.getCookie('next-auth.session-token').should('exist');
});

/**
 * Log out the current user
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Click on user menu to open dropdown
  cy.get('[data-testid="user-menu"]').click();
  
  // Click on logout button in dropdown
  cy.get('[data-testid="logout-button"]').click();
  
  // Verify that the logout was successful
  cy.getCookie('next-auth.session-token').should('not.exist');
  cy.url().should('include', '/');
});

/**
 * Wait for an API request to complete
 * @example cy.waitForApi('GET', '/api/user/profile')
 */
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiRequest');
  cy.wait('@apiRequest');
});

/**
 * Get element by data-testid attribute
 * @example cy.getByTestId('submit-button')
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Check that toast notification appears with given text
 * @example cy.shouldShowToast('Successfully saved')
 */
Cypress.Commands.add('shouldShowToast', (text: string) => {
  return cy.get('[data-testid="toast"]').contains(text);
});

// Add other custom commands as needed
