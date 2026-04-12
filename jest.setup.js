// Set up test environment
process.env.NODE_ENV = 'test';

// Mock the JWT secret key for testing
process.env.JWT_SECRET = 'test-jwt-secret-key';

// Mock any global methods needed for tests
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => require('crypto').randomUUID()
  };
}
