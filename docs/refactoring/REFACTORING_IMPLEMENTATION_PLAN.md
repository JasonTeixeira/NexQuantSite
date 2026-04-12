# NexQuant Site: Refactoring Implementation Plan

This document outlines the specific implementation steps to continue the refactoring work outlined in `REFACTORING_PLAN.md` and `CODE_STANDARDS_AND_ORGANIZATION.md`. It provides a detailed roadmap for transforming the codebase into a well-structured, maintainable, and professional application.

## Current State Analysis

After reviewing the codebase, we've identified the following:

1. **Progress Made**:
   - Phase 1 infrastructure improvements have begun (database layer, API standardization)
   - Well-defined types exist in `lib/shared/trading/strategy-types.ts`
   - Refactored API routes are available with `.refactored` extensions
   - Code standards and organization guidelines are documented

2. **Issues to Address**:
   - Components are too large and handle multiple responsibilities
   - File organization doesn't follow the feature-based structure outlined in standards
   - Inconsistent naming conventions across the codebase
   - API error handling and response formats need standardization
   - Database access patterns need to be more consistent

## Implementation Plan

### Phase 1: Complete Core Infrastructure Improvements

#### 1. Database Layer Standardization (Week 1)

- [ ] Create repository classes for all entities:
  - [ ] `StrategyRepository`
  - [ ] `SignalRepository` 
  - [ ] `UserRepository`
  - [ ] `PerformanceRepository`

- [ ] Standardize database connections:
  - [ ] Create consistent connection pool management
  - [ ] Implement proper error handling for database operations
  - [ ] Add retry mechanisms for transient failures

- [ ] Implement transaction support:
  - [ ] Add transaction helpers
  - [ ] Update repositories to support transactions

```typescript
// Example implementation for StrategyRepository
// src/core/repositories/StrategyRepository.ts

import { db } from '@/core/database/connection';
import { StrategyDefinition } from '@/types/models/TradingTypes';

export class StrategyRepository {
  async findAll(): Promise<StrategyDefinition[]> {
    try {
      return await db.query<StrategyDefinition>('SELECT * FROM strategies');
    } catch (error) {
      console.error('Error in StrategyRepository.findAll:', error);
      throw new Error('Failed to retrieve strategies');
    }
  }
  
  async findById(id: string): Promise<StrategyDefinition | null> {
    try {
      const results = await db.query<StrategyDefinition>(
        'SELECT * FROM strategies WHERE id = ?', 
        [id]
      );
      return results[0] || null;
    } catch (error) {
      console.error(`Error in StrategyRepository.findById(${id}):`, error);
      throw new Error('Failed to retrieve strategy');
    }
  }
  
  // Additional methods...
}
```

#### 2. API Layer Standardization (Week 1)

- [ ] Create and implement standard API response utilities:
  - [ ] `createSuccessResponse`
  - [ ] `createErrorResponse`
  - [ ] `createPaginatedResponse`

- [ ] Implement request validation using Zod:
  - [ ] Create validation schemas for all API endpoints
  - [ ] Add validation middleware

- [ ] Standardize error handling:
  - [ ] Create consistent error classes
  - [ ] Implement error logging and monitoring

- [ ] Apply the new standards to all API routes:
  - [ ] `/api/trading/strategies`
  - [ ] `/api/trading/signals`
  - [ ] `/api/trading/performance`
  - [ ] `/api/auth/*`

```typescript
// Example implementation for API utilities
// src/core/utils/apiUtils.ts

import { NextResponse } from 'next/server';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  status: number = HTTP_STATUS.OK
) {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status });
}

export function createErrorResponse(
  error: string, 
  status: number = HTTP_STATUS.BAD_REQUEST
) {
  return NextResponse.json({
    success: false,
    error
  }, { status });
}

// Additional utility functions...
```

### Phase 2: Code Reorganization (Week 2)

#### 1. Directory Structure Setup

- [ ] Create the new directory structure following feature-based organization:
  - [ ] `src/features/auth/`
  - [ ] `src/features/trading/`
  - [ ] `src/features/dashboard/`
  - [ ] `src/core/`
  - [ ] `src/types/`

- [ ] Create subdirectories within each feature:
  - [ ] `api/` - API route handlers
  - [ ] `components/` - React components
  - [ ] `hooks/` - Custom React hooks
  - [ ] `services/` - Business logic
  - [ ] `utils/` - Utility functions
  - [ ] `repositories/` - Data access

#### 2. File Migration (Week 2)

- [ ] Move auth-related files:
  - [ ] `app/api/auth/*` → `src/features/auth/api/`
  - [ ] `lib/auth/*` → `src/features/auth/services/`
  - [ ] `components/auth/*` → `src/features/auth/components/`

- [ ] Move trading-related files:
  - [ ] `app/api/trading/*` → `src/features/trading/api/`
  - [ ] `lib/shared/trading/*` → `src/features/trading/types/`
  - [ ] `components/trading/*` → `src/features/trading/components/`
  - [ ] `lib/models/trading.ts` → `src/features/trading/repositories/`

- [ ] Move core utilities:
  - [ ] `lib/database/*` → `src/core/database/`
  - [ ] `lib/utils/*` → `src/core/utils/`
  - [ ] `components/ui/*` → `src/core/components/`

- [ ] Update imports in all files to reflect new paths

```bash
# Example migration commands
mkdir -p src/features/trading/api
mkdir -p src/features/trading/components
mkdir -p src/features/trading/hooks
mkdir -p src/features/trading/services
mkdir -p src/features/trading/repositories
mkdir -p src/features/trading/types

# Copy files to new structure
cp app/api/trading/strategies/route.ts src/features/trading/api/strategies.ts
cp components/trading/StrategyDashboard.tsx src/features/trading/components/StrategyDashboard.tsx
cp lib/shared/trading/strategy-types.ts src/features/trading/types/index.ts
```

#### 3. Create Index Files (Week 2)

- [ ] Create barrel export files for each module:
  - [ ] `src/features/trading/index.ts`
  - [ ] `src/features/auth/index.ts`
  - [ ] `src/core/components/index.ts`
  - [ ] `src/core/utils/index.ts`

```typescript
// Example barrel file
// src/features/trading/index.ts

// Export components
export * from './components/StrategyDashboard';
export * from './components/StrategyCard';
export * from './components/SignalsList';
export * from './components/PerformanceMetrics';

// Export hooks
export * from './hooks/useStrategy';
export * from './hooks/useSignals';
export * from './hooks/usePerformance';

// Export types
export * from './types';
```

### Phase 3: Component Architecture Improvements (Week 3)

#### 1. Refactor UI Components

- [ ] Break down large components into smaller, focused components:
  - [ ] Split `StrategyDashboard.tsx` into:
    - [ ] `StrategyCard.tsx`
    - [ ] `StrategyList.tsx`
    - [ ] `PerformanceMetrics.tsx`
    - [ ] `SignalsList.tsx`
    - [ ] `TradingDashboard.tsx` (container)

- [ ] Create reusable UI components:
  - [ ] `Card.tsx`
  - [ ] `Badge.tsx`
  - [ ] `DataTable.tsx`
  - [ ] `Skeleton.tsx`
  - [ ] `StatusIndicator.tsx`

```typescript
// Example component split
// src/features/trading/components/StrategyCard.tsx

import React from 'react';
import { Badge } from '@/core/components';
import { StrategyDefinition } from '@/features/trading/types';

interface StrategyCardProps {
  strategy: StrategyDefinition;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function StrategyCard({ strategy, isSelected, onSelect }: StrategyCardProps) {
  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-cyan-700 border-2 border-cyan-500'
          : 'bg-gray-800 hover:bg-gray-700'
      }`}
      onClick={() => onSelect(strategy.id)}
    >
      <h4 className="font-medium text-lg text-white">{strategy.name}</h4>
      <p className="text-sm text-gray-300 mt-1">{strategy.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {strategy.tags.map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-400">Version: {strategy.version}</div>
    </div>
  );
}
```

#### 2. Implement Custom Hooks

- [ ] Create custom hooks for data fetching:
  - [ ] `useStrategies.ts`
  - [ ] `useStrategy.ts`
  - [ ] `useSignals.ts`
  - [ ] `usePerformance.ts`

- [ ] Create hooks for shared state:
  - [ ] `useStrategySelection.ts`
  - [ ] `useStrategyFilter.ts`

```typescript
// Example custom hook
// src/features/trading/hooks/useStrategies.ts

import { useState, useEffect } from 'react';
import { StrategyDefinition } from '@/features/trading/types';
import { StrategyService } from '@/features/trading/services/StrategyService';

export function useStrategies() {
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setIsLoading(true);
        const strategyService = new StrategyService();
        const data = await strategyService.getStrategies();
        setStrategies(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch strategies'));
        console.error('Error fetching strategies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  return { strategies, isLoading, error };
}
```

#### 3. Create Service Classes

- [ ] Implement service classes for business logic:
  - [ ] `StrategyService.ts`
  - [ ] `SignalService.ts`
  - [ ] `PerformanceService.ts`
  - [ ] `AuthService.ts`

```typescript
// Example service class
// src/features/trading/services/StrategyService.ts

import axios from 'axios';
import { StrategyDefinition } from '@/features/trading/types';

export class StrategyService {
  private baseUrl = '/api/trading/strategies';

  async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data.data || [];
    } catch (error) {
      console.error('Error in StrategyService.getStrategies:', error);
      throw new Error('Failed to fetch strategies');
    }
  }

  async getStrategyById(id: string): Promise<StrategyDefinition | null> {
    try {
      const response = await axios.get(`${this.baseUrl}?id=${id}`);
      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`Error in StrategyService.getStrategyById(${id}):`, error);
      throw new Error('Failed to fetch strategy');
    }
  }

  // Additional methods...
}
```

### Phase 4: Developer Experience Enhancements (Week 4)

#### 1. Add JSDoc Documentation

- [ ] Add comprehensive JSDoc comments to all:
  - [ ] Functions
  - [ ] Classes
  - [ ] Interfaces
  - [ ] Components

```typescript
/**
 * Service for interacting with trading strategies
 * 
 * @example
 * ```typescript
 * const strategyService = new StrategyService();
 * const strategies = await strategyService.getStrategies();
 * ```
 */
export class StrategyService {
  /**
   * Fetches all available trading strategies
   * 
   * @returns Promise containing an array of strategy definitions
   * @throws Error if the API request fails
   */
  async getStrategies(): Promise<StrategyDefinition[]> {
    // Implementation...
  }
}
```

#### 2. Create README Files

- [ ] Add README.md files to major directories:
  - [ ] `src/features/trading/README.md`
  - [ ] `src/features/auth/README.md`
  - [ ] `src/core/components/README.md`

```markdown
# Trading Feature

This module handles all trading-related functionality in the NexQuant platform.

## Components

- `StrategyDashboard` - Main dashboard for viewing strategies and signals
- `StrategyCard` - Card component for displaying strategy information
- `SignalsList` - Table for displaying trading signals
- `PerformanceMetrics` - Performance indicators for strategies

## Hooks

- `useStrategies` - Hook for fetching and managing strategy data
- `useSignals` - Hook for fetching and managing signal data
- `usePerformance` - Hook for fetching performance metrics

## Services

- `StrategyService` - Service for interacting with strategy API
- `SignalService` - Service for interacting with signals API
- `PerformanceService` - Service for fetching performance data

## API Routes

- `GET /api/trading/strategies` - Get all strategies or a specific strategy
- `POST /api/trading/strategies` - Create a new strategy
- `GET /api/trading/signals` - Get signals for a strategy
- `GET /api/trading/performance` - Get performance metrics for a strategy
```

#### 3. Implement Testing

- [ ] Create unit tests for:
  - [ ] Services
  - [ ] Hooks
  - [ ] Utilities

- [ ] Create integration tests for:
  - [ ] API routes
  - [ ] Authentication flows

- [ ] Create component tests for:
  - [ ] UI components
  - [ ] Form validation

```typescript
// Example test
// __tests__/features/trading/services/StrategyService.test.ts

import { StrategyService } from '@/features/trading/services/StrategyService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StrategyService', () => {
  let service: StrategyService;

  beforeEach(() => {
    service = new StrategyService();
    jest.clearAllMocks();
  });

  describe('getStrategies', () => {
    it('should fetch strategies successfully', async () => {
      // Arrange
      const mockStrategies = [
        { id: '1', name: 'Strategy 1' },
        { id: '2', name: 'Strategy 2' }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { data: mockStrategies }
      });

      // Act
      const result = await service.getStrategies();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/trading/strategies');
      expect(result).toEqual(mockStrategies);
    });

    it('should handle errors properly', async () => {
      // Arrange
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(service.getStrategies()).rejects.toThrow('Failed to fetch strategies');
    });
  });
});
```

### Phase 5: Quality Assurance (Week 5)

#### 1. Implement Linting and Formatting

- [ ] Configure ESLint with appropriate rules
- [ ] Configure Prettier for consistent formatting
- [ ] Add pre-commit hooks using Husky

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": ["error", {
      "allowExpressions": true
    }],
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"]
    }]
  }
}
```

#### 2. Perform Code Review

- [ ] Review all refactored code for adherence to standards
- [ ] Check for consistent patterns and naming
- [ ] Validate component architecture

#### 3. Create Documentation

- [ ] Update project documentation with new structure
- [ ] Create developer onboarding guide
- [ ] Document architecture decisions

## Implementation Timeline

| Week | Focus | Tasks |
|------|-------|-------|
| 1 | Infrastructure | Database standardization, API layer improvements |
| 2 | Code Organization | Directory structure, file migration, index files |
| 3 | Component Architecture | Refactor components, implement hooks and services |
| 4 | Developer Experience | Documentation, testing, README files |
| 5 | Quality Assurance | Linting, code review, documentation |

## Conclusion

This implementation plan provides a structured approach to continue the refactoring of the NexQuant codebase. By following these steps, we'll transform the application into a well-organized, maintainable, and professional system that follows modern best practices.

The refactoring work will be done incrementally, ensuring that functionality is maintained throughout the process. Each phase builds on the previous one, gradually improving the codebase's structure, readability, and maintainability.
