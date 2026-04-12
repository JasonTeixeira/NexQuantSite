# Code Standards & Organization

This document outlines the coding standards, naming conventions, and file organization patterns to be used throughout the NexQuantSite codebase. Following these guidelines will ensure consistency, readability, and maintainability across the project.

## Table of Contents

1. [File Organization](#file-organization)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Best Practices](#typescript-best-practices)
4. [React Component Structure](#react-component-structure)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [State Management](#state-management)
8. [Testing Conventions](#testing-conventions)
9. [Documentation](#documentation)
10. [Refactoring Guidelines](#refactoring-guidelines)

## File Organization

### Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/              # API routes (Next.js Route Handlers)
│   ├── [route]/          # Page routes
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/               # UI components (buttons, inputs, etc.)
│   ├── global/           # Global components (navbar, footer, etc.)
│   ├── [feature]/        # Feature-specific components
│   └── [page]/           # Page-specific components
├── core/                 # Core application logic
│   ├── api/              # API service clients
│   └── utils/            # Core utilities
├── hooks/                # React hooks
├── lib/                  # Library code
│   ├── auth/             # Authentication logic
│   ├── database/         # Database connections and utilities
│   ├── models/           # Data models
│   ├── services/         # External service integrations
│   ├── shared/           # Shared utilities
│   ├── utils/            # Utility functions
│   └── validation/       # Validation logic
├── ml-server/            # ML service code
├── public/               # Static assets
├── scripts/              # Build and maintenance scripts
├── shared/               # Shared code between client and server
│   └── api-schema/       # API schemas and types
├── styles/               # Global styles
├── types/                # TypeScript type definitions
│   ├── models/           # Data model types
│   └── api/              # API request/response types
└── __tests__/            # Test files
```

### Directory Purpose

- **app/**: Next.js App Router pages and API routes
- **components/**: React components organized by purpose
- **core/**: Core application logic that powers features
- **hooks/**: React hooks for shared stateful logic
- **lib/**: Utility libraries and service integrations
- **ml-server/**: Machine learning service code
- **public/**: Static assets served by Next.js
- **scripts/**: Utility scripts for development and deployment
- **shared/**: Code shared between client and server
- **styles/**: Global CSS and styling utilities
- **types/**: TypeScript type definitions

## Naming Conventions

### Files and Directories

- Use **kebab-case** for file and directory names: `trading-dashboard.tsx`
- Use **PascalCase** for React component files: `TradingDashboard.tsx`
- Use **camelCase** for utility and hook files: `useMarketData.ts`
- Use **index.ts** files for exporting public APIs from directories

### React Components

- Use **PascalCase** for component names: `TradingDashboard`
- Use descriptive, noun-based names for components: `StrategyCard` not `Trading`
- Add context to common component names: `TradingButton` not `Button`
- Use compound names for page-specific components: `TradingDashboardHeader`

### Functions and Variables

- Use **camelCase** for function and variable names: `fetchMarketData`
- Use verb prefixes for functions: `getUser`, `fetchData`, `calculateTotal`
- Use descriptive names that indicate purpose: `isLoading` not `loading`
- Use plural names for arrays: `strategies` not `strategyList`
- Use boolean prefixes like `is`, `has`, `should`: `isAuthenticated`

### API Endpoints

- Use **kebab-case** for API routes: `/api/trading/strategies`
- Use RESTful naming conventions for API endpoints
- Group related endpoints under descriptive directories

### Type Definitions

- Use **PascalCase** for interface and type names: `TradingStrategy`
- Use descriptive, noun-based names for types: `UserProfile`
- Use `I` prefix for interfaces only when necessary for disambiguation
- Use `T` prefix for generic type parameters: `TData`

## TypeScript Best Practices

### Type Definitions

- Define shared types in the `types/` directory
- Export types from barrel files (`index.ts`) for easier imports
- Use interface for object types with methods
- Use type for union, intersection, or mapped types
- Use enums for distinct value sets: `enum OrderType { Market, Limit }`

```typescript
// Good
interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameters;
  isActive: boolean;
}

// Bad
type strategy = {
  id: string,
  name: string,
  desc: string,
  params: any,
  active: boolean
}
```

### Type Safety

- Avoid using `any` type; use `unknown` when type is truly unknown
- Use generics for reusable components and functions
- Define function parameter and return types explicitly
- Use type guards for runtime type checking
- Use discriminated unions for complex state management

```typescript
// Good
function getStrategy<T extends TradingStrategy>(id: string): Promise<T | null> {
  // Implementation
}

// Bad
function getStrategy(id): any {
  // Implementation
}
```

## React Component Structure

### Functional Components

- Use functional components with hooks
- Define prop types as interfaces above component
- Export components as named exports
- Use destructuring for props
- Put hooks at the top of the component

```tsx
// Good
interface UserProfileProps {
  userId: string;
  isEditable?: boolean;
}

export function UserProfile({ userId, isEditable = false }: UserProfileProps) {
  const { data, isLoading } = useUserData(userId);
  
  // Component logic
  
  return (
    // JSX
  );
}
```

### Component Organization

- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Separate presentation and container components when appropriate
- Organize component files by feature or domain
- Use index.ts files to expose component APIs

### State Management

- Use local state for component-specific state
- Use context for shared state across related components
- Use server state management (like React Query) for API data
- Avoid prop drilling by using context or composition

## API Endpoints

### Route Structure

- Organize routes by domain area: `/api/trading/strategies`
- Use resource-oriented naming for RESTful endpoints
- Follow REST conventions for HTTP methods:
  - GET: Retrieve resources
  - POST: Create resources
  - PUT: Update resources
  - DELETE: Remove resources

### Response Format

- Use consistent response formats:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
  };
}
```

### Error Handling

- Use appropriate HTTP status codes
- Include detailed error messages and codes
- Validate input data with strong typing

## Error Handling

### Client-Side Errors

- Use error boundaries for React component errors
- Handle promise rejections with try/catch
- Implement global error handling for unhandled errors
- Display user-friendly error messages

### Server-Side Errors

- Use custom error classes for different error types
- Log errors with contextual information
- Return appropriate HTTP status codes
- Include error codes for client-side handling

```typescript
// Custom error class
export class ResourceNotFoundError extends Error {
  statusCode = 404;
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = 'ResourceNotFoundError';
  }
}
```

## State Management

### Local State

- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Split state into logical pieces rather than one large state object

### Global State

- Use React Context for shared state between related components
- Consider external state management libraries for complex applications
- Keep global state minimal and focused

### Server State

- Use React Query or similar libraries for server state
- Implement proper caching strategies
- Handle loading, error, and success states

## Testing Conventions

### Test Organization

- Place tests in `__tests__` directory mirroring source structure
- Name test files with `.test.ts` or `.test.tsx` suffix
- Group tests logically with `describe` blocks
- Use descriptive test names that explain the expected behavior

### Test Naming

- Use descriptive names that explain what is being tested
- Follow the pattern: "should [expected behavior] when [condition]"

```typescript
// Good
test('should display error message when API returns an error', () => {
  // Test implementation
});

// Bad
test('API error test', () => {
  // Test implementation
});
```

### Test Coverage

- Aim for high test coverage of critical paths
- Test edge cases and error scenarios
- Test component rendering, user interactions, and side effects
- Test API endpoints for correct responses and error handling

## Documentation

### Code Comments

- Use JSDoc comments for functions, classes, and interfaces
- Comment complex logic that isn't immediately obvious
- Avoid comments that just repeat the code
- Keep comments up-to-date when code changes

```typescript
/**
 * Calculates the optimal trading parameters based on market conditions.
 * 
 * @param marketData - Current market data snapshot
 * @param strategy - Trading strategy configuration
 * @returns Optimized parameters for the strategy
 */
function optimizeParameters(marketData: MarketData, strategy: TradingStrategy): StrategyParameters {
  // Implementation
}
```

### README Files

- Include README.md files in major directories
- Explain the purpose and organization of the directory
- Document any special patterns or conventions used
- Provide examples for complex or non-obvious usage

## Refactoring Guidelines

### When to Refactor

- When adding new features to an existing module
- When fixing bugs in complex or unclear code
- When code has accumulated technical debt
- Before adding new developers to a codebase
- When performance improvements are needed

### Refactoring Approach

1. Ensure adequate test coverage before refactoring
2. Make small, incremental changes
3. Run tests after each change
4. Commit frequently with descriptive messages
5. Review refactored code with team members

### Common Refactorings

1. **Extract Function/Component**: Move code to a separate function or component
2. **Rename**: Improve names to better reflect purpose
3. **Consolidate Conditional Logic**: Simplify complex conditionals
4. **Replace Magic Values**: Use named constants for magic values
5. **Normalize Type Usage**: Ensure consistent type definitions
6. **Fix Folder Structure**: Reorganize files according to domain concepts

### File Structure Refactoring

- Move files to appropriate directories based on their purpose
- Split large files into smaller, focused files
- Create index files for directory exports
- Group related functionality together

### Naming Refactoring

- Rename files and variables to follow conventions
- Make names more descriptive and consistent
- Remove abbreviations unless widely understood
- Ensure names reflect current functionality

### Code Quality Refactoring

- Remove duplicate code
- Simplify complex expressions
- Add proper type definitions
- Improve error handling
