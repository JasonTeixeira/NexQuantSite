/**
 * 🛠️ API UTILITIES
 * Standardized utilities for API response handling and error management
 */

import { NextResponse } from 'next/server';

// Standard HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BAD_GATEWAY: 502,         // Added BAD_GATEWAY for external service failures
  SERVICE_UNAVAILABLE: 503, // Added SERVICE_UNAVAILABLE for when services are down
  GATEWAY_TIMEOUT: 504,     // Added GATEWAY_TIMEOUT for timeouts
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Standard API error response interface
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: any;
}

/**
 * Standard API success response interface
 */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

/**
 * Create a standardized API success response
 * @param data Response data payload
 * @param meta Optional metadata
 * @param status HTTP status code
 * @returns NextResponse with standardized format
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, any>,
  status: number = HTTP_STATUS.OK
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    data,
    ...(meta ? { meta } : {}),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a standardized API error response
 * @param error Error message or object
 * @param status HTTP status code
 * @param details Additional error details
 * @returns NextResponse with standardized error format
 */
export function createErrorResponse(
  error: string | Error,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error;
  
  const response: ApiErrorResponse = {
    error: errorMessage,
    ...(details ? { details } : {}),
  };

  return NextResponse.json(response, { status });
}

/**
 * Handle API errors in a standardized way
 * @param error The error to handle
 * @param defaultMessage Default message if error is not an instance of Error
 * @returns Standardized error response
 */
export function handleApiError(
  error: unknown, 
  defaultMessage: string = 'An unexpected error occurred'
): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    // Handle known error types
    if ((error as any).code === 'UNAUTHORIZED') {
      return createErrorResponse(error.message, HTTP_STATUS.UNAUTHORIZED);
    } else if ((error as any).code === 'FORBIDDEN') {
      return createErrorResponse(error.message, HTTP_STATUS.FORBIDDEN);
    } else if ((error as any).code === 'NOT_FOUND') {
      return createErrorResponse(error.message, HTTP_STATUS.NOT_FOUND);
    } else if ((error as any).code === 'VALIDATION_ERROR') {
      return createErrorResponse(error.message, HTTP_STATUS.BAD_REQUEST, (error as any).details);
    } else if ((error as any).code === 'SERVICE_UNAVAILABLE') {
      return createErrorResponse(error.message, HTTP_STATUS.SERVICE_UNAVAILABLE);
    } else if ((error as any).code === 'GATEWAY_TIMEOUT') {
      return createErrorResponse(error.message, HTTP_STATUS.GATEWAY_TIMEOUT);
    } else if ((error as any).code === 'BAD_GATEWAY') {
      return createErrorResponse(error.message, HTTP_STATUS.BAD_GATEWAY);
    }
    
    return createErrorResponse(error.message);
  }
  
  return createErrorResponse(defaultMessage);
}

/**
 * Validate that required parameters are present
 * @param params Object containing parameters to check
 * @param requiredParams Array of required parameter names
 * @returns Error if validation fails, null if it passes
 */
export function validateRequiredParams(
  params: Record<string, any>,
  requiredParams: string[]
): Error | null {
  const missingParams = requiredParams.filter(param => params[param] === undefined);
  
  if (missingParams.length > 0) {
    const error = new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    (error as any).code = 'VALIDATION_ERROR';
    (error as any).details = { missingParams };
    return error;
  }
  
  return null;
}

/**
 * Parse and validate query parameters
 * @param searchParams URL search params
 * @param paramConfig Configuration for each parameter
 * @returns Parsed and validated parameters object
 */
export function parseQueryParams<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  paramConfig: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date',
    required?: boolean,
    default?: any,
    validator?: (value: any) => boolean
  }>
): T {
  const result: Record<string, any> = {};
  const errors: string[] = [];

  // Process each parameter according to its configuration
  Object.entries(paramConfig).forEach(([paramName, config]) => {
    const rawValue = searchParams.get(paramName);
    
    // Handle required parameters
    if (config.required && rawValue === null) {
      errors.push(`Missing required parameter: ${paramName}`);
      return;
    }
    
    // Use default value if parameter is not provided
    if (rawValue === null) {
      if ('default' in config) {
        result[paramName] = config.default;
      }
      return;
    }
    
    // Parse value according to type
    let parsedValue: any;
    try {
      switch (config.type) {
        case 'string':
          parsedValue = rawValue;
          break;
        case 'number':
          parsedValue = Number(rawValue);
          if (isNaN(parsedValue)) {
            throw new Error(`Invalid number: ${rawValue}`);
          }
          break;
        case 'boolean':
          parsedValue = rawValue === 'true' || rawValue === '1';
          break;
        case 'date':
          parsedValue = new Date(rawValue);
          if (isNaN(parsedValue.getTime())) {
            throw new Error(`Invalid date: ${rawValue}`);
          }
          break;
      }
    } catch (error) {
      errors.push(`Invalid value for ${paramName}: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    
    // Apply custom validator if provided
    if (config.validator && !config.validator(parsedValue)) {
      errors.push(`Validation failed for ${paramName}`);
      return;
    }
    
    result[paramName] = parsedValue;
  });
  
  // If there are validation errors, throw an error
  if (errors.length > 0) {
    const error = new Error('Parameter validation failed');
    (error as any).code = 'VALIDATION_ERROR';
    (error as any).details = { errors };
    throw error;
  }
  
  return result as T;
}
