/**
 * 🧠 ML GATEWAY API
 * Secure proxy between web application and ML server with authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, UserRole } from '@/lib/auth/auth-middleware';
import { createRateLimitMiddleware, RateLimitType } from '@/lib/auth/rate-limiter';
import auditLogger, { AuditCategory, AuditEventType, AuditStatus, AuditSeverity } from '@/lib/auth/audit-logger';
import mlService from '@/lib/services/enhanced-ml-service';
import { z } from 'zod';
import { reportError } from '@/lib/monitoring';

// Schema validation for prediction requests
const predictionRequestSchema = z.object({
  model_id: z.string().min(1, "Model ID is required"),
  instrument_id: z.string().min(1, "Instrument ID is required"),
  version_id: z.string().optional(),
  timeframe: z.string().optional(),
  params: z.record(z.any()).optional()
});

// Schema validation for backtest requests
const backtestRequestSchema = z.object({
  strategyId: z.string().min(1, "Strategy ID is required"),
  parameters: z.record(z.any()),
  timeframe: z.string().min(1, "Timeframe is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instruments: z.array(z.string()).optional()
});

// Schema validation for model comparison requests
const modelCompareRequestSchema = z.object({
  model_ids: z.array(z.string()).min(1, "At least one model ID is required"),
  metric_names: z.array(z.string()).min(1, "At least one metric name is required")
});

/**
 * Helper function to create standardized response
 */
function createApiResponse(data: any, status: number = 200, message?: string) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      message,
      data
    },
    { status }
  );
}

/**
 * GET /api/ml-gateway - Health check and model endpoints
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Apply rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(RateLimitType.API_GENERAL);
    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Parse URL to check for specific endpoints
    const { pathname, searchParams } = new URL(req.url);
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Handle /api/ml-gateway/models endpoint (get all models or specific model)
    if (pathParts.includes('models')) {
      const modelId = pathParts[pathParts.indexOf('models') + 1];
      
      // If modelId is specified, get specific model
      if (modelId) {
        // Check if we need to get versions for this model
        if (pathParts.includes('versions')) {
          const versionId = pathParts[pathParts.indexOf('versions') + 1];
          
          // If versionId is specified, get specific version
          if (versionId) {
            // Log access to audit system
            auditLogger.logAuditEvent({
              userId: req.headers.get('x-user-id') || undefined,
              category: AuditCategory.DATA_ACCESS,
              eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
              status: AuditStatus.ATTEMPTED,
              severity: AuditSeverity.INFO,
              details: {
                action: 'get_model_version',
                modelId,
                versionId
              }
            }).catch(e => console.error('Audit logging error:', e));
            
            const modelVersion = await mlService.getModelVersion(modelId, versionId);
            if (!modelVersion) {
              return createApiResponse(null, 404, 'Model version not found');
            }
            return createApiResponse(modelVersion);
          }
          
          // Get all versions for this model
          // Log access to audit system
          auditLogger.logAuditEvent({
            userId: req.headers.get('x-user-id') || undefined,
            category: AuditCategory.DATA_ACCESS,
            eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
            status: AuditStatus.ATTEMPTED,
            severity: AuditSeverity.INFO,
            details: {
              action: 'get_model_versions',
              modelId
            }
          }).catch(e => console.error('Audit logging error:', e));
          
          const versions = await mlService.getModelVersions(modelId);
          return createApiResponse(versions);
        }
        
        // Log access to audit system
        auditLogger.logAuditEvent({
          userId: req.headers.get('x-user-id') || undefined,
          category: AuditCategory.DATA_ACCESS,
          eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
          status: AuditStatus.ATTEMPTED,
          severity: AuditSeverity.INFO,
          details: {
            action: 'get_model',
            modelId
          }
        }).catch(e => console.error('Audit logging error:', e));
        
        // Get model details
        const model = await mlService.getModel(modelId);
        if (!model) {
          return createApiResponse(null, 404, 'Model not found');
        }
        return createApiResponse(model);
      }
      
      // Log access to audit system
      auditLogger.logAuditEvent({
        userId: req.headers.get('x-user-id') || undefined,
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'get_all_models'
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      // Get all models
      const models = await mlService.getModels();
      return createApiResponse(models);
    }
    
    // Handle /api/ml-gateway/strategies endpoint (get all strategies or specific strategy)
    if (pathParts.includes('strategies')) {
      const strategyId = pathParts[pathParts.indexOf('strategies') + 1];
      
      // If strategyId is specified, get specific strategy
      if (strategyId) {
        // Check if we need to get performance for this strategy
        if (pathParts.includes('performance')) {
          const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' | 'all' || 'all';
          
          // Log access to audit system
          auditLogger.logAuditEvent({
            userId: req.headers.get('x-user-id') || undefined,
            category: AuditCategory.DATA_ACCESS,
            eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
            status: AuditStatus.ATTEMPTED,
            severity: AuditSeverity.INFO,
            details: {
              action: 'get_strategy_performance',
              strategyId,
              period
            }
          }).catch(e => console.error('Audit logging error:', e));
          
          const performance = await mlService.getStrategyPerformance(strategyId, period);
          if (!performance) {
            return createApiResponse(null, 404, 'Strategy performance not found');
          }
          return createApiResponse(performance);
        }
        
        // Log access to audit system
        auditLogger.logAuditEvent({
          userId: req.headers.get('x-user-id') || undefined,
          category: AuditCategory.DATA_ACCESS,
          eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
          status: AuditStatus.ATTEMPTED,
          severity: AuditSeverity.INFO,
          details: {
            action: 'get_strategy',
            strategyId
          }
        }).catch(e => console.error('Audit logging error:', e));
        
        // Get strategy details
        const strategy = await mlService.getStrategy(strategyId);
        if (!strategy) {
          return createApiResponse(null, 404, 'Strategy not found');
        }
        return createApiResponse(strategy);
      }
      
      // Log access to audit system
      auditLogger.logAuditEvent({
        userId: req.headers.get('x-user-id') || undefined,
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'get_all_strategies'
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      // Get all strategies
      const strategies = await mlService.getStrategies();
      return createApiResponse(strategies);
    }
    
    // Handle /api/ml-gateway/signals endpoint (get signals for a strategy)
    if (pathParts.includes('signals')) {
      const strategyId = pathParts[pathParts.indexOf('signals') + 1];
      
      if (!strategyId) {
        return createApiResponse(null, 400, 'Strategy ID is required');
      }
      
      const limit = Number(searchParams.get('limit')) || 10;
      
      // Log access to audit system
      auditLogger.logAuditEvent({
        userId: req.headers.get('x-user-id') || undefined,
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'get_signals',
          strategyId,
          limit
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      const signals = await mlService.getSignals(strategyId, limit);
      return createApiResponse(signals);
    }
    
    // Handle /api/ml-gateway/backtest endpoint (get backtest status)
    if (pathParts.includes('backtest')) {
      const jobId = pathParts[pathParts.indexOf('backtest') + 1];
      
      if (!jobId) {
        return createApiResponse(null, 400, 'Job ID is required');
      }
      
      // Log access to audit system
      auditLogger.logAuditEvent({
        userId: req.headers.get('x-user-id') || undefined,
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'get_backtest_status',
          jobId
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      const backtestStatus = await mlService.getBacktestStatus(jobId);
      if (!backtestStatus) {
        return createApiResponse(null, 404, 'Backtest job not found');
      }
      return createApiResponse(backtestStatus);
    }
    
    // Default - health check
    const healthStatus = await mlService.checkHealth();
    
    return createApiResponse({
      status: healthStatus.status,
      version: healthStatus.version || 'unknown',
      timestamp: new Date().toISOString(),
      gateway: 'operational'
    });
  } catch (error) {
    // Report error to monitoring system
    reportError({
      component: 'MLGatewayAPI',
      action: 'GET',
      error,
      severity: 'high'
    });
    
    // Log to audit system
    auditLogger.logAuditEvent({
      userId: req.headers.get('x-user-id') || undefined,
      category: AuditCategory.SYSTEM,
      eventType: AuditEventType.SYSTEM_ERROR,
      status: AuditStatus.FAILURE,
      severity: AuditSeverity.ERROR,
      details: {
        action: 'ml_gateway_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }).catch(e => console.error('Audit logging error:', e));
    
    console.error('ML Gateway error:', error);
    return createApiResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
      'Failed to process ML Gateway request'
    );
  }
}, {
  // Allow access to basic health check without authentication
  // but require authentication for all other endpoints
  optional: true
});

/**
 * POST /api/ml-gateway - Predictions and other data-modifying operations
 */
export const POST = withAuth(async (req: NextRequest) => {
  try {
    // Apply rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(RateLimitType.API_GENERAL);
    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Parse URL to determine endpoint
    const { pathname } = new URL(req.url);
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Parse request body
    let data;
    try {
      data = await req.json();
    } catch (error) {
      return createApiResponse(null, 400, 'Invalid JSON in request body');
    }
    
    // Handle predictions endpoint
    if (pathParts.includes('predictions')) {
      // Validate request body
      const validationResult = predictionRequestSchema.safeParse(data);
      if (!validationResult.success) {
        return createApiResponse(
          { errors: validationResult.error.flatten().fieldErrors },
          400,
          'Invalid prediction request'
        );
      }
      
      const validatedData = validationResult.data;
      
      // Get prediction from ML service
      const prediction = await mlService.getPrediction({
        model_id: validatedData.model_id,
        instrument_id: validatedData.instrument_id,
        version_id: validatedData.version_id,
        timeframe: validatedData.timeframe,
        params: validatedData.params
      });
      
      if (!prediction) {
        return createApiResponse(null, 502, 'Failed to get prediction from ML service');
      }
      
      return createApiResponse(prediction);
    }
    
    // Handle model comparison endpoint
    if (pathParts.includes('models') && pathParts.includes('compare')) {
      // Validate request body
      const validationResult = modelCompareRequestSchema.safeParse(data);
      if (!validationResult.success) {
        return createApiResponse(
          { errors: validationResult.error.flatten().fieldErrors },
          400,
          'Invalid model comparison request'
        );
      }
      
      const validatedData = validationResult.data;
      
      // Log access to audit system
      auditLogger.logAuditEvent({
        userId: req.headers.get('x-user-id') || undefined,
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'compare_models',
          modelIds: validatedData.model_ids,
          metricNames: validatedData.metric_names
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      // Compare models
      const comparison = await mlService.compareModels(
        validatedData.model_ids,
        validatedData.metric_names
      );
      
      if (!comparison) {
        return createApiResponse(null, 502, 'Failed to compare models');
      }
      
      return createApiResponse(comparison);
    }
    
    // Handle signal stream initialization
    if (pathParts.includes('stream')) {
      // Validate required fields for stream
      if (!data.clientId || !data.modelId) {
        return createApiResponse(
          { details: 'clientId and modelId are required' },
          400,
          'Missing required fields'
        );
      }
      
      try {
        // Log access to audit system
        auditLogger.logAuditEvent({
          userId: req.headers.get('x-user-id') || undefined,
          category: AuditCategory.SYSTEM,
          eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
          status: AuditStatus.ATTEMPTED,
          severity: AuditSeverity.INFO,
          details: {
            action: 'initialize_prediction_stream',
            clientId: data.clientId,
            modelId: data.modelId
          }
        }).catch(e => console.error('Audit logging error:', e));
        
        // Initialize prediction stream connection info
        // The actual WebSocket connection would be established client-side
        const baseUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000/api';
        const wsBaseUrl = baseUrl.replace('/api', '').replace(/^http/, 'ws');
        
        return createApiResponse({
          clientId: data.clientId,
          modelId: data.modelId,
          wsEndpoint: `${wsBaseUrl}/ws/predictions/${data.clientId}`,
          instructions: "Connect to the WebSocket endpoint and send subscription messages"
        });
      } catch (error) {
        console.error('Stream initialization error:', error);
        
        // Log error to audit system
        auditLogger.logAuditEvent({
          userId: req.headers.get('x-user-id') || undefined,
          category: AuditCategory.SYSTEM,
          eventType: AuditEventType.SYSTEM_ERROR,
          status: AuditStatus.FAILURE,
          severity: AuditSeverity.ERROR,
          details: {
            action: 'initialize_prediction_stream',
            clientId: data.clientId,
            modelId: data.modelId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }).catch(e => console.error('Audit logging error:', e));
        
        return createApiResponse(
          { originalError: error instanceof Error ? error.message : 'Unknown error' },
          502,
          'Failed to initialize stream'
        );
      }
    }
    
    // Default error for unrecognized endpoints
    return createApiResponse(null, 400, 'Invalid endpoint');
  } catch (error) {
    // Report error to monitoring system
    reportError({
      component: 'MLGatewayAPI',
      action: 'POST',
      error,
      severity: 'high'
    });
    
    // Log to audit system
    auditLogger.logAuditEvent({
      userId: req.headers.get('x-user-id') || undefined,
      category: AuditCategory.SYSTEM,
      eventType: AuditEventType.SYSTEM_ERROR,
      status: AuditStatus.FAILURE,
      severity: AuditSeverity.ERROR,
      details: {
        action: 'ml_gateway_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }).catch(e => console.error('Audit logging error:', e));
    
    console.error('ML Gateway error:', error);
    return createApiResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
      'Failed to process ML Gateway request'
    );
  }
}, {
  // Require authentication for POST operations
  requiredRole: UserRole.USER
});

/**
 * PUT /api/ml-gateway - Backtest operations
 */
export const PUT = withAuth(async (req: NextRequest) => {
  try {
    // Apply rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(RateLimitType.API_GENERAL);
    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Parse URL to determine endpoint
    const { pathname } = new URL(req.url);
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Parse request body
    let data;
    try {
      data = await req.json();
    } catch (error) {
      return createApiResponse(null, 400, 'Invalid JSON in request body');
    }
    
    // Handle backtest endpoint
    if (pathParts.includes('backtest')) {
      // Validate request body
      const validationResult = backtestRequestSchema.safeParse(data);
      if (!validationResult.success) {
        return createApiResponse(
          { errors: validationResult.error.flatten().fieldErrors },
          400,
          'Invalid backtest request'
        );
      }
      
      const validatedData = validationResult.data;
      
      // Submit backtest
      const backtestResponse = await mlService.submitBacktest({
        strategyId: validatedData.strategyId,
        parameters: validatedData.parameters,
        timeframe: validatedData.timeframe,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        instruments: validatedData.instruments
      });
      
      if (!backtestResponse) {
        return createApiResponse(null, 502, 'Failed to submit backtest to ML service');
      }
      
      return createApiResponse(backtestResponse, 200, 'Backtest job queued successfully');
    }
    
    // Default error for unrecognized endpoints
    return createApiResponse(null, 400, 'Invalid endpoint');
  } catch (error) {
    // Report error to monitoring system
    reportError({
      component: 'MLGatewayAPI',
      action: 'PUT',
      error,
      severity: 'high'
    });
    
    // Log to audit system
    auditLogger.logAuditEvent({
      userId: req.headers.get('x-user-id') || undefined,
      category: AuditCategory.SYSTEM,
      eventType: AuditEventType.SYSTEM_ERROR,
      status: AuditStatus.FAILURE,
      severity: AuditSeverity.ERROR,
      details: {
        action: 'ml_gateway_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }).catch(e => console.error('Audit logging error:', e));
    
    console.error('ML Gateway error:', error);
    return createApiResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
      'Failed to process ML Gateway request'
    );
  }
}, {
  // Require premium user role for backtest operations
  requiredRole: UserRole.PREMIUM
});
