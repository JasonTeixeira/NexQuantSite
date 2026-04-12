# NexQuant Site: Refactoring Starter Template

This document provides initial code templates and implementation starting points for the refactoring plan outlined in `REFACTORING_IMPLEMENTATION_PLAN.md`. It focuses on Phase 1 (Core Infrastructure Improvements) to help developers kick-start the implementation process.

## Directory Structure Setup

Before diving into implementation, set up the initial directory structure:

```bash
# Create base directories
mkdir -p src/core/database
mkdir -p src/core/utils
mkdir -p src/core/components
mkdir -p src/core/repositories
mkdir -p src/features/trading/api
mkdir -p src/features/trading/components
mkdir -p src/features/trading/hooks
mkdir -p src/features/trading/services
mkdir -p src/features/trading/repositories
mkdir -p src/features/trading/types
mkdir -p src/features/auth/api
mkdir -p src/features/auth/components
mkdir -p src/features/auth/hooks
mkdir -p src/features/auth/services
mkdir -p src/features/auth/utils
mkdir -p src/types/models
mkdir -p src/types/api
```

## Database Layer Templates

### Database Connection

Start by creating a standardized database connection utility:

```typescript
// src/core/database/connection.ts

import { Pool, PoolClient } from 'pg';
import { DatabaseError } from '@/core/utils/errors';

// Configuration from environment variables with defaults
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'nexquant',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
};

// Create a connection pool
const pool = new Pool(config);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Types for query results
interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

/**
 * Database class for managing database connections and queries
 */
class Database {
  /**
   * Execute a SQL query with optional parameters
   * 
   * @param text - SQL query text
   * @param params - Query parameters
   * @returns Promise with query results
   * @throws DatabaseError if the query fails
   */
  async query<T>(text: string, params?: any[]): Promise<T[]> {
    const client = await pool.connect();
    try {
      const result = await client.query<T>(text, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw new DatabaseError('Query execution failed', { cause: error });
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction with multiple queries
   * 
   * @param callback - Function containing queries to execute in transaction
   * @returns Promise with result of the callback
   * @throws DatabaseError if the transaction fails
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw new DatabaseError('Transaction failed', { cause: error });
    } finally {
      client.release();
    }
  }

  /**
   * Check database connectivity
   * 
   * @returns Promise that resolves if connection is successful
   * @throws DatabaseError if connection fails
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      throw new DatabaseError('Database health check failed', { cause: error });
    }
  }
}

// Export a singleton instance
export const db = new Database();
```

### Repository Base Class

Create a base repository class to standardize data access:

```typescript
// src/core/repositories/BaseRepository.ts

import { db } from '@/core/database/connection';
import { DatabaseError } from '@/core/utils/errors';

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Find all records in the table
   */
  async findAll(): Promise<T[]> {
    try {
      return await db.query<T>(`SELECT * FROM ${this.tableName}`);
    } catch (error) {
      console.error(`Error in ${this.tableName}.findAll:`, error);
      throw new DatabaseError(`Failed to retrieve ${this.tableName}`, { cause: error });
    }
  }
  
  /**
   * Find a record by id
   */
  async findById(id: string | number): Promise<T | null> {
    try {
      const results = await db.query<T>(
        `SELECT * FROM ${this.tableName} WHERE id = $1`, 
        [id]
      );
      return results[0] || null;
    } catch (error) {
      console.error(`Error in ${this.tableName}.findById(${id}):`, error);
      throw new DatabaseError(`Failed to retrieve ${this.tableName} with id ${id}`, { cause: error });
    }
  }
  
  /**
   * Insert a new record
   */
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  
  /**
   * Update an existing record
   */
  abstract update(id: string | number, data: Partial<T>): Promise<T | null>;
  
  /**
   * Delete a record by id
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      const result = await db.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`, 
        [id]
      );
      return result.length > 0;
    } catch (error) {
      console.error(`Error in ${this.tableName}.delete(${id}):`, error);
      throw new DatabaseError(`Failed to delete ${this.tableName} with id ${id}`, { cause: error });
    }
  }
}
```

### Strategy Repository Implementation

```typescript
// src/features/trading/repositories/StrategyRepository.ts

import { BaseRepository } from '@/core/repositories/BaseRepository';
import { StrategyDefinition } from '@/features/trading/types';
import { db } from '@/core/database/connection';
import { DatabaseError } from '@/core/utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class StrategyRepository extends BaseRepository<StrategyDefinition> {
  constructor() {
    super('strategies');
  }
  
  /**
   * Create a new strategy
   */
  async create(data: Omit<StrategyDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategyDefinition> {
    try {
      const now = new Date();
      const id = uuidv4();
      
      const query = `
        INSERT INTO strategies (
          id, name, description, version, parameters, tags, 
          supported_instruments, distribution_channels, 
          subscription_tiers, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *
      `;
      
      const values = [
        id,
        data.name,
        data.description,
        data.version,
        JSON.stringify(data.parameters),
        data.tags,
        data.supportedInstruments,
        data.distributionChannels,
        data.subscriptionTiers,
        data.isActive,
        now,
        now
      ];
      
      const results = await db.query<StrategyDefinition>(query, values);
      return results[0];
    } catch (error) {
      console.error('Error in StrategyRepository.create:', error);
      throw new DatabaseError('Failed to create strategy', { cause: error });
    }
  }
  
  /**
   * Update an existing strategy
   */
  async update(
    id: string, 
    data: Partial<Omit<StrategyDefinition, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<StrategyDefinition | null> {
    try {
      // Get the current strategy
      const currentStrategy = await this.findById(id);
      if (!currentStrategy) {
        return null;
      }
      
      // Create update parts
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Add each field that needs to be updated
      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      
      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }
      
      if (data.version !== undefined) {
        updates.push(`version = $${paramIndex++}`);
        values.push(data.version);
      }
      
      if (data.parameters !== undefined) {
        updates.push(`parameters = $${paramIndex++}`);
        values.push(JSON.stringify(data.parameters));
      }
      
      if (data.tags !== undefined) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(data.tags);
      }
      
      if (data.supportedInstruments !== undefined) {
        updates.push(`supported_instruments = $${paramIndex++}`);
        values.push(data.supportedInstruments);
      }
      
      if (data.distributionChannels !== undefined) {
        updates.push(`distribution_channels = $${paramIndex++}`);
        values.push(data.distributionChannels);
      }
      
      if (data.subscriptionTiers !== undefined) {
        updates.push(`subscription_tiers = $${paramIndex++}`);
        values.push(data.subscriptionTiers);
      }
      
      if (data.isActive !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(data.isActive);
      }
      
      // Always update the updated_at timestamp
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());
      
      // Add id as the last parameter
      values.push(id);
      
      const query = `
        UPDATE strategies 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      const results = await db.query<StrategyDefinition>(query, values);
      return results[0] || null;
    } catch (error) {
      console.error(`Error in StrategyRepository.update(${id}):`, error);
      throw new DatabaseError(`Failed to update strategy with id ${id}`, { cause: error });
    }
  }
  
  /**
   * Find strategies by tag
   */
  async findByTag(tag: string): Promise<StrategyDefinition[]> {
    try {
      return await db.query<StrategyDefinition>(
        'SELECT * FROM strategies WHERE $1 = ANY(tags)',
        [tag]
      );
    } catch (error) {
      console.error(`Error in StrategyRepository.findByTag(${tag}):`, error);
      throw new DatabaseError(`Failed to find strategies with tag ${tag}`, { cause: error });
    }
  }
  
  /**
   * Find active strategies
   */
  async findActive(): Promise<StrategyDefinition[]> {
    try {
      return await db.query<StrategyDefinition>(
        'SELECT * FROM strategies WHERE is_active = true'
      );
    } catch (error) {
      console.error('Error in StrategyRepository.findActive:', error);
      throw new DatabaseError('Failed to find active strategies', { cause: error });
    }
  }
}
```

## API Layer Templates

### Custom Error Classes

```typescript
// src/core/utils/errors.ts

/**
 * Base application error class
 */
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 500);
    this.name = 'DatabaseError';
    
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
      
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  errors: Record<string, string[]>;
  
  constructor(message: string = 'Validation failed', errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
```

### API Response Utilities

```typescript
// src/core/utils/apiUtils.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  AuthenticationError, 
  AuthorizationError 
} from './errors';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

interface ApiResponseMeta {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

/**
 * Create a success response
 */
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

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string | Error, 
  status: number = HTTP_STATUS.BAD_REQUEST,
  errors?: Record<string, string[]>
) {
  const message = typeof error === 'string' ? error : error.message;
  
  const response: {
    success: false;
    error: string;
    errors?: Record<string, string[]>;
  } = {
    success: false,
    error: message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[], 
  meta: ApiResponseMeta
) {
  return NextResponse.json({
    success: true,
    data,
    meta
  });
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown, defaultMessage: string = 'An unexpected error occurred') {
  console.error('API Error:', error);
  
  // Handle known error types
  if (error instanceof ValidationError) {
    return createErrorResponse(error, HTTP_STATUS.BAD_REQUEST, error.errors);
  }
  
  if (error instanceof NotFoundError) {
    return createErrorResponse(error, HTTP_STATUS.NOT_FOUND);
  }
  
  if (error instanceof AuthenticationError) {
    return createErrorResponse(error, HTTP_STATUS.UNAUTHORIZED);
  }
  
  if (error instanceof AuthorizationError) {
    return createErrorResponse(error, HTTP_STATUS.FORBIDDEN);
  }
  
  if (error instanceof AppError) {
    return createErrorResponse(error, error.statusCode);
  }
  
  // Handle unknown errors
  return createErrorResponse(defaultMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(
  searchParams: URLSearchParams,
  schema: Record<string, { type: 'string' | 'number' | 'boolean', required: boolean }>
) {
  const result: Record<string, any> = {};
  const errors: Record<string, string[]> = {};
  
  // Process each parameter based on the schema
  Object.entries(schema).forEach(([param, config]) => {
    const value = searchParams.get(param);
    
    // Check if required parameter is missing
    if (config.required && (value === null || value === '')) {
      errors[param] = [`${param} is required`];
      return;
    }
    
    // Skip if not required and not provided
    if (!config.required && (value === null || value === '')) {
      return;
    }
    
    // Parse value based on type
    try {
      switch (config.type) {
        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors[param] = [`${param} must be a number`];
          } else {
            result[param] = num;
          }
          break;
          
        case 'boolean':
          if (value === 'true' || value === '1') {
            result[param] = true;
          } else if (value === 'false' || value === '0') {
            result[param] = false;
          } else {
            errors[param] = [`${param} must be a boolean`];
          }
          break;
          
        case 'string':
        default:
          result[param] = value;
          break;
      }
    } catch (error) {
      errors[param] = [`Invalid value for ${param}`];
    }
  });
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid query parameters', errors);
  }
  
  return result;
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    throw new ValidationError('Validation failed', { 
      body: ['Invalid request body'] 
    });
  }
}
```

### Strategies API Implementation

```typescript
// src/features/trading/api/strategies.ts

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  HTTP_STATUS,
  parseQueryParams,
  validateRequest
} from '@/core/utils/apiUtils';
import { 
  NotFoundError, 
  AuthenticationError, 
  AuthorizationError 
} from '@/core/utils/errors';
import { StrategyRepository } from '@/features/trading/repositories/StrategyRepository';
import { getServerSession } from 'next-auth';

// Initialize repository
const strategyRepository = new StrategyRepository();

// Define validation schema for creating a strategy
const createStrategySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  version: z.string(),
  parameters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['number', 'boolean', 'string', 'enum']),
    defaultValue: z.any(),
    range: z.tuple([z.number(), z.number()]).optional(),
    options: z.array(z.string()).optional(),
    isRequired: z.boolean(),
    isAdvanced: z.boolean()
  })).default([]),
  tags: z.array(z.string()).default([]),
  supportedInstruments: z.array(z.string()).default([]),
  distributionChannels: z.array(z.string()).default([]),
  subscriptionTiers: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

/**
 * GET /api/trading/strategies
 * Retrieve all available trading strategies or a specific strategy by ID
 */
export async function GET(req: NextRequest) {
  try {
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const params = parseQueryParams(searchParams, {
      id: { type: 'string', required: false }
    });

    // Check if we need to get a specific strategy
    if (params.id) {
      // Get a specific strategy from the database
      const strategy = await strategyRepository.findById(params.id);
      
      if (!strategy) {
        throw new NotFoundError('Strategy', params.id);
      }
      
      return createSuccessResponse(strategy);
    }

    // Get all strategies from the database
    const strategies = await strategyRepository.findAll();
    return createSuccessResponse(strategies);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch strategies');
  }
}

/**
 * POST /api/trading/strategies
 * Create a new trading strategy
 */
export async function POST(req: NextRequest) {
  try {
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      throw new AuthenticationError();
    }
    
    // Check if user has admin role
    const userRole = (session as any)?.user?.role || 'user';
    
    if (userRole !== 'admin') {
      throw new AuthorizationError('Admin permissions required');
    }
    
    // Validate request body
    const strategyData = await validateRequest(req, createStrategySchema);
    
    // Save to database
    const savedStrategy = await strategyRepository.create(strategyData);
    
    return createSuccessResponse(savedStrategy, 'Strategy created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleApiError(error, 'Failed to create strategy');
  }
}

/**
 * PUT /api/trading/strategies/:id
 * Update an existing trading strategy
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      throw new AuthenticationError();
    }
    
    // Check if user has admin role
    const userRole = (session as any)?.user?.role || 'user';
    
    if (userRole !== 'admin') {
      throw new AuthorizationError('Admin permissions required');
    }
    
    // Get strategy ID from route parameters
    const { id } = params;
    
    // Check if strategy exists
    const existingStrategy = await strategyRepository.findById(id);
    
    if (!existingStrategy) {
      throw new NotFoundError('Strategy', id);
    }
    
    // Validate request body
    const updateData = await validateRequest(req, createStrategySchema.partial());
    
    // Update strategy
    const updatedStrategy = await strategyRepository.update(id, updateData);
    
    if (!updatedStrategy) {
      throw new Error('Failed to update strategy');
    }
    
    return createSuccessResponse(updatedStrategy, 'Strategy updated successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to update strategy');
  }
}

/**
 * DELETE /api/trading/strategies/:id
 * Delete a trading strategy
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      throw new AuthenticationError();
    }
    
    // Check if user has admin role
    const userRole = (session as any)?.user?.role || 'user';
    
    if (userRole !== 'admin') {
      throw new AuthorizationError('Admin permissions required');
    }
    
    // Get strategy ID from route parameters
    const { id } = params;
    
    // Check if strategy exists
    const existingStrategy = await strategyRepository.findById(id);
    
    if (!existingStrategy) {
      throw new NotFoundError('Strategy', id);
    }
    
    // Delete strategy
    const result = await strategyRepository.delete(id);
    
    if (!result) {
      throw new Error('Failed to delete strategy');
    }
    
    return createSuccessResponse(null, 'Strategy deleted successfully', HTTP_STATUS.NO_CONTENT);
  } catch (error) {
    return handleApiError(error, 'Failed to delete strategy');
  }
}
```

## UI Component Templates

### Strategy Card Component

```tsx
// src/features/trading/components/StrategyCard.tsx

import React from 'react';
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
      data-testid={`strategy-card-${strategy.id}`}
    >
      <h4 className="font-medium text-lg text-white">{strategy.name}</h4>
      <p className="text-sm text-gray-300 mt-1">{strategy.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {strategy.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-400">Version: {strategy.version}</div>
    </div>
  );
}
```

### Strategy Service

```typescript
// src/features/trading/services/StrategyService.ts

import axios from 'axios';
import { StrategyDefinition } from '@/features/trading/types';

/**
 * Service for interacting with trading strategies API
 */
export class StrategyService {
  private baseUrl = '/api/trading/strategies';

  /**
   * Fetch all available strategies
   */
  async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching strategies:', error);
      throw new Error('Failed to fetch strategies');
    }
  }

  /**
   * Fetch a specific strategy by ID
   */
  async getStrategyById(id: string): Promise<StrategyDefinition | null> {
    try {
      const response = await axios.get(`${this.baseUrl}?id=${id}`);
      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching strategy ${id}:`, error);
      throw new Error(`Failed to fetch strategy ${id}`);
    }
  }

  /**
   * Create a new strategy
   */
  async createStrategy(strategy: Omit<StrategyDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategyDefinition> {
    try {
      const response = await axios.post(this.baseUrl, strategy);
      return response.data.data;
    } catch (error) {
      console.error('Error creating strategy:', error);
      throw new Error('Failed to create strategy');
    }
  }

  /**
   * Update an existing strategy
   */
  async updateStrategy(
    id: string,
    strategy: Partial<Omit<StrategyDefinition, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<StrategyDefinition> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, strategy);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating strategy ${id}:`, error);
      throw new Error(`Failed to update strategy ${id}`);
    }
  }

  /**
   * Delete a strategy
   */
  async deleteStrategy(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting strategy ${id}:`, error);
      throw new Error(`Failed to delete strategy ${id}`);
    }
  }
}
```

### Strategy Hook

```typescript
// src/features/trading/hooks/useStrategies.ts

import { useState, useEffect } from 'react';
import { StrategyDefinition } from '@/features/trading/types';
import { StrategyService } from '@/features/trading/services/StrategyService';

/**
 * Hook for fetching and managing
