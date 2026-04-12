# NexQuant Site Implementation Guide

This guide provides detailed instructions for implementing the refactoring plan outlined in `REFACTORING_PLAN.md`. It offers concrete steps, code examples, and best practices to ensure consistent implementation across the codebase.

## Phase 1: Core Infrastructure Implementation

### Database Layer

#### Redis Mock Implementation

The Redis mock implementation has been fixed and enhanced with proper interface compatibility. The implementation includes:

- `RedisClient` class that mimics Redis client behavior
- In-memory cache storage for development
- Helper functions for data operations
- Health check functionality

**Example Usage:**

```typescript
import { getAndParse, setWithExpiry, deleteKey } from 'lib/database/sqlite-redis-mock';

// Store data with expiry
await setWithExpiry('user:1:session', { userId: 1, role: 'admin' }, 3600);

// Retrieve and parse data
const session = await getAndParse<UserSession>('user:1:session');
if (session) {
  // Use session data
}

// Delete data
await deleteKey('user:1:session');
```

#### Database Standardization

Implement consistent database access patterns:

1. Create repository classes for each entity:

```typescript
// lib/repositories/strategy-repository.ts
import { db } from 'lib/database/database';
import { TradingStrategy } from 'types/models/TradingTypes';

export class StrategyRepository {
  async findAll(): Promise<TradingStrategy[]> {
    return db.query<TradingStrategy>('SELECT * FROM strategies');
  }
  
  async findById(id: string): Promise<TradingStrategy | null> {
    const results = await db.query<TradingStrategy>(
      'SELECT * FROM strategies WHERE id = ?', 
      [id]
    );
    return results[0] || null;
  }
  
  async create(strategy: Omit<TradingStrategy, 'id'>): Promise<TradingStrategy> {
    const results = await db.query<TradingStrategy>(
      'INSERT INTO strategies (name, description, parameters) VALUES (?, ?, ?)',
      [strategy.name, strategy.description, JSON.stringify(strategy.parameters)]
    );
    return results[0];
  }
  
  // Additional methods as needed
}
```

2. Use the repositories in API routes:

```typescript
// app/api/trading/strategies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StrategyRepository } from 'lib/repositories/strategy-repository';
import { authenticate } from 'lib/auth/auth-middleware';

const strategyRepository = new StrategyRepository();

export async function GET(request: NextRequest) {
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const strategies = await strategyRepository.findAll();
    return NextResponse.json({ data: strategies });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategies' }, 
      { status: 500 }
    );
  }
}
```

### Authentication System

#### Reorganizing Authentication Code

1. Create an auth directory structure:

```
/lib/auth/
  /middleware/        # Authentication middleware
  /providers/         # Auth providers (NextAuth, etc.)
  /services/          # Token services, password services
  /strategies/        # Auth strategies
  /utils/             # Auth-related utilities
  auth-service.ts     # Main authentication service
  auth-types.ts       # Authentication type definitions
```

2. Implement a central authentication service:

```typescript
// lib/auth/auth-service.ts
import { JwtService } from './services/jwt-service';
import { UserRepository } from 'lib/repositories/user-repository';
import { AuthResult, LoginCredentials, SessionUser } from './auth-types';

export class AuthService {
  private jwtService: JwtService;
  private userRepository: UserRepository;
  
  constructor() {
    this.jwtService = new JwtService();
    this.userRepository = new UserRepository();
  }
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Validate credentials
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Check password
      const isPasswordValid = await this.validatePassword(
        credentials.password, 
        user.passwordHash
      );
      
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Generate tokens
      const accessToken = this.jwtService.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      const refreshToken = this.jwtService.generateRefreshToken({
        id: user.id
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }
  
  // Additional methods: logout, refresh, validateToken, etc.
}
```

3. Create a middleware for route protection:

```typescript
// lib/auth/middleware/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { JwtService } from '../services/jwt-service';
import { AuthResult } from '../auth-types';

const jwtService = new JwtService();

export async function authenticate(
  request: NextRequest
): Promise<AuthResult> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    const payload = jwtService.verifyAccessToken(token);
    
    if (!payload) {
      return { success: false, error: 'Invalid token' };
    }
    
    return {
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export function requireRole(role: string) {
  return async (request: NextRequest) => {
    const authResult = await authenticate(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    if (authResult.user.role !== role) {
      return NextResponse.json(
        { error: 'Forbidden' }, 
        { status: 403 }
      );
    }
    
    return authResult;
  };
}
```

### API Layer

#### Standardizing API Responses

1. Create a standard API response utility:

```typescript
// lib/api/api-response.ts
import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  meta?: ApiResponse<T>['meta']
) {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta
  });
}

export function createErrorResponse(
  error: string, 
  status: number = 400
) {
  return NextResponse.json({
    success: false,
    error
  }, { status });
}

export function createPaginatedResponse<T>(
  data: T[], 
  page: number, 
  limit: number, 
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  });
}
```

2. Use the standardized response in API routes:

```typescript
// app/api/trading/strategies/route.ts
import { NextRequest } from 'next/server';
import { StrategyRepository } from 'lib/repositories/strategy-repository';
import { authenticate } from 'lib/auth/middleware/auth-middleware';
import { 
  createSuccessResponse, 
  createErrorResponse 
} from 'lib/api/api-response';

const strategyRepository = new StrategyRepository();

export async function GET(request: NextRequest) {
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return createErrorResponse('Unauthorized', 401);
  }
  
  try {
    const strategies = await strategyRepository.findAll();
    return createSuccessResponse(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return createErrorResponse('Failed to fetch strategies', 500);
  }
}
```

#### Request Validation

1. Create a validation utility:

```typescript
// lib/api/validation.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from './api-response';

export async function validateRequest<T>(
  request: NextRequest, 
  schema: z.ZodSchema<T>
): Promise<{ success: boolean; data?: T; error?: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = createErrorResponse(
        'Validation error', 
        400
      );
      return { success: false, error: errorResponse };
    }
    
    const errorResponse = createErrorResponse(
      'Invalid request', 
      400
    );
    return { success: false, error: errorResponse };
  }
}
```

2. Use validation in API routes:

```typescript
// app/api/trading/strategies/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateRequest } from 'lib/api/validation';
import { 
  createSuccessResponse, 
  createErrorResponse 
} from 'lib/api/api-response';

// Define schema
const createStrategySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  parameters: z.record(z.any())
});

export async function POST(request: NextRequest) {
  // Validate request body
  const validation = await validateRequest(request, createStrategySchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const strategyData = validation.data;
  
  try {
    // Process validated data
    const strategy = await strategyRepository.create(strategyData);
    return createSuccessResponse(strategy, 'Strategy created successfully', 201);
  } catch (error) {
    console.error('Error creating strategy:', error);
    return createErrorResponse('Failed to create strategy', 500);
  }
}
```

## Phase 2: Code Organization Implementation

### Moving to Feature-Based Structure

1. Create the new directory structure:

```
mkdir -p src/features/auth/{api,components,hooks,services,utils}
mkdir -p src/features/trading/{api,components,hooks,services,utils}
mkdir -p src/features/dashboard/{api,components,hooks,services,utils}
mkdir -p src/core/{api,components,hooks,services,utils}
mkdir -p src/types
mkdir -p src/tests
```

2. Move files to their appropriate locations:

```bash
# Authentication files
mv app/api/auth/* src/features/auth/api/
mv components/auth/* src/features/auth/components/
mv lib/auth/* src/features/auth/services/

# Trading files
mv app/api/trading/* src/features/trading/api/
mv components/trading/* src/features/trading/components/
mv lib/trading/* src/features/trading/services/

# Core files
mv lib/utils/* src/core/utils/
mv lib/database/* src/core/services/database/
mv components/ui/* src/core/components/
```

3. Update imports in moved files:

```typescript
// OLD: import { authenticate } from 'lib/auth/auth-middleware';
// NEW: import { authenticate } from 'src/features/auth/services/auth-middleware';

// OLD: import { db } from 'lib/database/database';
// NEW: import { db } from 'src/core/services/database/database';
```

### Creating Index Files

1. Create barrel exports for each module:

```typescript
// src/features/auth/index.ts
export * from './services/auth-service';
export * from './services/jwt-service';
export * from './hooks/useAuth';
export * from './api/types';

// src/features/trading/index.ts
export * from './services/strategy-service';
export * from './services/signal-service';
export * from './hooks/useStrategies';
export * from './api/types';

// src/core/components/index.ts
export * from './Button';
export * from './Input';
export * from './Card';
export * from './Modal';
// ... other component exports
```

2. Use the barrel exports in your code:

```typescript
// OLD: 
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Card } from 'components/ui/Card';

// NEW:
import { Button, Input, Card } from 'src/core/components';
```

## Phase 3: Component Architecture Implementation

### Separating Container and Presentational Components

1. Create presentational components:

```tsx
// src/features/trading/components/StrategyCard.tsx
import { Card, Text, Badge } from 'src/core/components';
import { Strategy } from '../types';

interface StrategyCardProps {
  strategy: Strategy;
  onSelect: (id: string) => void;
}

export function StrategyCard({ strategy, onSelect }: StrategyCardProps) {
  return (
    <Card onClick={() => onSelect(strategy.id)}>
      <Text variant="heading">{strategy.name}</Text>
      <Text>{strategy.description}</Text>
      <div className="flex gap-2 mt-2">
        {strategy.tags.map(tag => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </Card>
  );
}
```

2. Create container components:

```tsx
// src/features/trading/components/StrategyList.tsx
import { useState, useEffect } from 'react';
import { useStrategies } from '../hooks/useStrategies';
import { StrategyCard } from './StrategyCard';
import { LoadingSpinner, ErrorMessage } from 'src/core/components';

export function StrategyList() {
  const { strategies, loading, error } = useStrategies();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Additional logic...
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {strategies.map(strategy => (
        <StrategyCard 
          key={strategy.id}
          strategy={strategy}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

### Creating Custom Hooks

1. Create hooks for data fetching:

```typescript
// src/features/trading/hooks/useStrategies.ts
import { useState, useEffect } from 'react';
import { StrategyService } from '../services/strategy-service';
import { Strategy } from '../types';

const strategyService = new StrategyService();

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const data = await strategyService.getStrategies();
        setStrategies(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch strategies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategies();
  }, []);
  
  return { strategies, loading, error };
}
```

2. Create hooks for state management:

```typescript
// src/features/auth/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { AuthService } from '../services/auth-service';
import { User, LoginCredentials } from '../types';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setError(null);
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Phase 4: Developer Experience Implementation

### Adding Documentation

1. Create JSDoc comments for functions and components:

```typescript
/**
 * Authentication service that handles user login, logout, and session management
 * 
 * @example
 * const authService = new AuthService();
 * const result = await authService.login({ email: 'user@example.com', password: 'password123' });
 * 
 * if (result.success) {
 *   // User is logged in
 *   console.log(result.user);
 * } else {
 *   // Login failed
 *   console.error(result.error);
 * }
 */
export class AuthService {
  /**
   * Authenticates a user with the provided credentials
   * 
   * @param credentials - The user's login credentials
   * @returns AuthResult object containing success status, user data if successful, and tokens
   * @throws Error if the authentication service is unavailable
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Implementation...
  }
  
  // Other methods...
}
```

2. Create README files for modules:

```markdown
# Authentication Module

This module handles user authentication, authorization, and session management for the NexQuant platform.

## Features

- User login and registration
- JWT-based authentication
- Role-based access control
- Session management
- Password reset functionality

## Usage

### Authentication

```typescript
import { AuthService } from 'src/features/auth';

const authService = new AuthService();
const result = await authService.login({ 
  email: 'user@example.com', 
  password: 'password123' 
});

if (result.success) {
  // User is logged in
  console.log(result.user);
} else {
  // Login failed
  console.error(result.error);
}
```

### Protected Routes

```typescript
import { requireAuth } from 'src/features/auth';

export const GET = requireAuth(async (req) => {
  // This route is protected and only accessible to authenticated users
  // Implementation...
});
```

## Architecture

The authentication module follows a service-based architecture:

1. `AuthService` - Core service for authentication operations
2. `JwtService` - Handles JWT token generation and validation
3. `PasswordService` - Manages password hashing and verification
4. `auth-middleware` - Route protection middleware

## Configuration

Authentication settings can be configured in `.env`:

- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRY` - Token expiration time (e.g., "1h", "7d")
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiration (e.g., "30d")
```

### Testing Implementation

1. Create unit tests for services:

```typescript
// __tests__/features/auth/services/auth-service.test.ts
import { AuthService } from 'src/features/auth/services/auth-service';
import { UserRepository } from 'src/features/auth/repositories/user-repository';
import { JwtService } from 'src/features/auth/services/jwt-service';

// Mock dependencies
jest.mock('src/features/auth/repositories/user-repository');
jest.mock('src/features/auth/services/jwt-service');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
    jwtServiceMock = new JwtService() as jest.Mocked<JwtService>;
    
    // Create service with mocked dependencies
    authService = new AuthService(
      userRepositoryMock,
      jwtServiceMock
    );
  });
  
  describe('login', () => {
    it('should return success and user data when credentials are valid', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        role: 'user'
      };
      
      userRepositoryMock.findByEmail.mockResolvedValue(user);
      jwtServiceMock.generateAccessToken.mockReturnValue('access_token');
      jwtServiceMock.generateRefreshToken.mockReturnValue('refresh_token');
      
      // Act
      const result = await authService.login(credentials);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      });
      expect(result.tokens).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });
    });
    
    it('should return failure when user does not exist', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      
      // Act
      const result = await authService.login(credentials);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
    
    // More test cases...
  });
  
  // More tests for other methods...
});
```

2. Create integration tests:

```typescript
// __tests__/features/trading/api/strategies.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from 'src/features/trading/api/strategies/route';
import { StrategyService } from 'src/features/trading/services/strategy-service';
import { authenticate } from 'src/features/auth/middleware/auth-middleware';

// Mock dependencies
jest.mock('src/features/trading/services/strategy-service');
jest.mock('src/features/auth/middleware/auth-middleware');

describe('Strategies API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/trading/strategies', () => {
    it('should return strategies when authenticated', async () => {
      // Arrange
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'authorization': 'Bearer valid_token'
        }
      });
      
      const mockStrategies = [
        { id: '1', name: 'Strategy 1' },
        { id: '2', name: 'Strategy 2' }
      ];
      
      (authenticate as jest.Mock).mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' }
      });
      
      (StrategyService.prototype.getStrategies as jest.Mock).mockResolvedValue(mockStrategies);
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockStrategies
      });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Arrange
      const { req, res } = createMocks({
        method: 'GET'
      });
      
      (authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Unauthorized'
      });
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Unauthorized'
      });
    });
    
    // More test cases...
  });
  
  // Tests for POST, PUT, DELETE...
});
```

## Conclusion

This implementation guide provides detailed instructions for refactoring the NexQuant codebase according to the plan outlined in the refactoring plan. By following these guidelines, the codebase will become more maintainable, scalable, and aligned with modern development practices.

Each phase builds upon the previous one, gradually transforming the codebase into a well-structured, type-safe, and testable application. The examples provided can be adapted to fit the specific needs of the NexQuant platform while maintaining consistency across the codebase.
