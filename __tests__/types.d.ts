/**
 * 🧪 TEST TYPES
 * Type definitions for the test environment
 */

// Extend global types for testing
import '@testing-library/jest-dom';

// Make jest functions available globally
declare global {
  // Jest global functions
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>, timeout?: number) => void;
  const test: (name: string, fn: () => void | Promise<void>, timeout?: number) => void;
  const expect: any;
  const beforeAll: (fn: () => void | Promise<void>, timeout?: number) => void;
  const afterAll: (fn: () => void | Promise<void>, timeout?: number) => void;
  const beforeEach: (fn: () => void | Promise<void>, timeout?: number) => void;
  const afterEach: (fn: () => void | Promise<void>, timeout?: number) => void;

  // Define Jest namespace with all required methods
  namespace jest {
    function fn<T = any>(implementation?: (...args: any[]) => T): jest.Mock<T>;
    function mock(moduleName: string, factory?: any, options?: any): typeof jest;
    function spyOn(object: any, methodName: string): jest.Mock;
    function clearAllMocks(): typeof jest;
    function resetAllMocks(): typeof jest;
    function restoreAllMocks(): typeof jest;
    function requireMock(moduleName: string): any;
    function requireActual(moduleName: string): any;
    
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mockImplementation(fn: (...args: Y) => T): this;
      mockImplementationOnce(fn: (...args: Y) => T): this;
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockResolvedValue(value: T): this;
      mockResolvedValueOnce(value: T): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
      getMockName(): string;
      mockReturnThis(): this;
      mockRestore(): void;
      mockClear(): this;
      mockReset(): this;
      mock: {
        calls: Y[];
        instances: T[];
        contexts: any[];
        results: Array<{ type: string; value: any }>;
      };
    }
  }
  
  // Additional env variables used in tests
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      JWT_SECRET?: string;
      ENABLE_RATE_LIMIT?: string;
    }
  }
}

// Note: We don't override Next.js types globally, as it would conflict with app code
// Instead, we use explicit mocks in the test files
