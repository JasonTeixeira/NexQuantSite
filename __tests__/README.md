# Testing Guide for NexQuantSite

## Overview

This document provides guidelines for writing and running tests for the NexQuantSite project. We use Jest for unit and integration testing, and Cypress for end-to-end testing.

## Test Configuration

The project uses a separate TypeScript configuration for tests (`tsconfig.test.json`) that relaxes some of the type checking rules to allow for more flexible mocking in test files.

### Directory Structure

```
__tests__/              # Main test directory
├── auth/               # Authentication-related tests
├── api/                # API route tests
├── components/         # React component tests
├── hooks/              # Custom hooks tests
├── utils/              # Utility function tests
├── types.d.ts          # TypeScript declarations for tests
└── README.md           # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test categories
npm run test:auth
npm run test:api

# Run Cypress tests
npm run cypress
npm run cypress:headless
```

## Writing Effective Tests

### Test Structure

Follow this structure for your test files:

1. Import the code under test and any dependencies
2. Mock any external dependencies (databases, APIs, etc.)
3. Use `describe` blocks to group related tests
4. Use `it` or `test` blocks for individual test cases
5. Use `beforeEach`/`afterEach` for setup/teardown between tests
6. Use `beforeAll`/`afterAll` for one-time setup/teardown

Example:

```typescript
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should handle normal input correctly', () => {
    expect(myFunction('test')).toBe('expected result');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('default value');
  });
});
```

### Mocking Dependencies

For each type of dependency, use the appropriate mocking strategy:

#### Mocking Next.js Components

```typescript
// For NextRequest
jest.mock('next/server', () => {
  class MockHeaders {
    private headers: Record<string, string> = {};
    
    constructor(headers: Record<string, string> = {}) {
      this.headers = { ...headers };
    }
    
    get(name: string): string | null {
      return this.headers[name.toLowerCase()] || null;
    }
    
    set(name: string, value: string): void {
      this.headers[name.toLowerCase()] = value;
    }
  }
  
  class MockRequest {
    headers: MockHeaders;
    
    constructor(headers: Record<string, string> = {}) {
      this.headers = new MockHeaders(headers);
    }
  }
  
  return {
    NextRequest: MockRequest,
    // Add other Next.js components as needed
    NextResponse: {
      json: jest.fn((body: any, options: any = {}) => {
        return {
          body,
          status: options.status || 200,
          headers: options.headers || {}
        };
      })
    }
  };
});

// Later in your test:
const req = new NextRequest({
  'x-forwarded-for': '192.168.1.1',
  'user-agent': 'Mozilla/5.0'
});
```

#### Mocking Database

```typescript
jest.mock('@/lib/database/database', () => {
  return {
    db: {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      // Add other methods as needed
    }
  };
});

// Later in your test:
const { db } = require('@/lib/database/database');
db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test' }] });
```

#### Mocking Redis

```typescript
jest.mock('@/lib/database/redis-connection', () => {
  const mockedCache: Record<string, any> = {};
  
  return {
    redis: {
      get: jest.fn((key: string) => Promise.resolve(mockedCache[key] || null)),
      set: jest.fn((key: string, value: string) => {
        mockedCache[key] = value;
        return Promise.resolve('OK');
      }),
      // Add other methods as needed
    }
  };
});
```

### Testing React Components

Use React Testing Library for testing React components:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing API Routes

For testing API routes, use the pattern:

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/my-route/route';

describe('API: /api/my-route', () => {
  it('returns 200 with valid data', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        success: true
      })
    );
  });
});
```

## Common Issues and Solutions

### TypeScript Errors in Tests

If you see TypeScript errors in test files related to mocks, remember:

1. **They are expected** when viewing the files in the editor (which uses the main tsconfig.json)
2. The tests will **still work correctly** when run with Jest (which uses tsconfig.test.json)
3. If you want to fix the errors for better editor experience, you can:
   - Add more type declarations in `__tests__/types.d.ts`
   - Use `// @ts-ignore` or `// @ts-expect-error` comments for specific lines
   - Use type assertions (`as any`) when necessary

### Module Path Aliases

The project uses path aliases (e.g., `@/lib/utils` instead of `../../lib/utils`). Jest is configured to resolve these correctly in tests.

### Testing Async Code

For async functions, remember to:

1. Make your test function async
2. Use `await` for the function call
3. Use `resolves`/`rejects` matchers for promises

```typescript
it('should resolve with correct data', async () => {
  await expect(asyncFunction()).resolves.toEqual({ success: true });
});

it('should reject with an error', async () => {
  await expect(asyncFunction('bad input')).rejects.toThrow();
});
```

## Best Practices

1. **Test behaviors, not implementation details** - Focus on what the code does, not how it does it
2. **Keep tests simple and focused** - Each test should verify one specific behavior
3. **Use descriptive test names** - Names should clearly describe what's being tested
4. **Mock only what's necessary** - Over-mocking makes tests brittle and less valuable
5. **Test edge cases** - Include tests for empty inputs, errors, and boundary conditions
6. **Avoid test interdependence** - Tests should not depend on each other's state
7. **Clean up after tests** - Reset any shared state in `afterEach` or `afterAll`
8. **Use the AAA pattern** - Arrange (setup), Act (execute), Assert (verify)

## Code Coverage

The project aims for high test coverage, but quality is more important than quantity. Focus on testing:

1. Business-critical functionality
2. Complex logic and algorithms
3. Error handling and edge cases
4. Public APIs and interfaces

View the coverage report after running `npm run test:coverage` in the `coverage` directory.
