/**
 * 🧪 LOGIN E2E TESTS
 * Tests for the login functionality
 */

describe('Login Page', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should display the login form', () => {
    // Check that the login form elements are visible
    cy.get('h1').should('contain', 'Login');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check for error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    
    // URL should still be login page
    cy.url().should('include', '/login');
  });

  it('should redirect to dashboard after successful login', () => {
    // Intercept the login API call
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    
    // Stub the response to simulate successful login
    cy.intercept('POST', '/api/auth/callback/credentials', {
      statusCode: 200,
      body: { 
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    }).as('loginCallback');
    
    // Enter valid credentials
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the login request to complete
    cy.wait('@loginCallback');
    
    // Check that we're redirected to the dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify user is logged in (e.g., user menu is visible)
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should be able to navigate to registration page', () => {
    // Click on the registration link
    cy.contains('Create an account').click();
    
    // Check that we're on the registration page
    cy.url().should('include', '/register');
  });

  it('should be able to navigate to password reset page', () => {
    // Click on the forgot password link
    cy.contains('Forgot password').click();
    
    // Check that we're on the password reset page
    cy.url().should('include', '/forgot-password');
  });
});

// Test for logout functionality
describe('Logout', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
  });

  it('should log out successfully', () => {
    // Click on user menu to open dropdown
    cy.get('[data-testid="user-menu"]').click();
    
    // Click on logout button in dropdown
    cy.get('[data-testid="logout-button"]').click();
    
    // Verify that the logout was successful
    cy.getCookie('next-auth.session-token').should('not.exist');
    cy.url().should('include', '/');
    
    // User menu should not be visible after logout
    cy.get('[data-testid="user-menu"]').should('not.exist');
  });
});
