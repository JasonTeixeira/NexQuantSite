export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timestamp: string
  public readonly requestId?: string

  constructor(message: string, statusCode = 500, isOperational = true, requestId?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()
    this.requestId = requestId

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, requestId?: string) {
    super(message, 400, true, requestId)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", requestId?: string) {
    super(message, 401, true, requestId)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions", requestId?: string) {
    super(message, 403, true, requestId)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", requestId?: string) {
    super(message, 404, true, requestId)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", requestId?: string) {
    super(message, 429, true, requestId)
  }
}

export function handleError(error: unknown, requestId?: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, false, requestId)
  }

  return new AppError("An unexpected error occurred", 500, false, requestId)
}

export function logError(error: AppError, context?: Record<string, any>) {
  const logData = {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    timestamp: error.timestamp,
    requestId: error.requestId,
    isOperational: error.isOperational,
    context,
  }

  if (error.statusCode >= 500) {
    console.error("[ERROR]", logData)
  } else {
    console.warn("[WARNING]", logData)
  }

  // In production, send to external logging service
  if (process.env.NODE_ENV === "production") {
    // Send to Sentry, DataDog, etc.
  }
}
