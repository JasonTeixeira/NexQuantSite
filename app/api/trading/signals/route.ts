/**
 * 📊 API ROUTE: Trading Signals
 * Endpoint for retrieving and managing trading signals
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  HTTP_STATUS,
  parseQueryParams
} from '@/core/utils/apiUtils';
import mlService, { PredictionRequest } from '@/core/api/MlService';
import { getSignalsByStrategy, saveSignal } from '@/lib/models/trading';
import { TradingSignal } from '@/types/models/TradingTypes';
import { apiRateLimiter } from '@/lib/rate-limiter';

/**
 * GET /api/trading/signals
 * Retrieve signals for a specific strategy or model
 */
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      return createErrorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Parse URL to check for specific endpoints
    const { pathname, searchParams } = new URL(req.url);
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Parse query parameters
    const params = parseQueryParams(searchParams, {
      strategyId: { type: 'string', required: false },
      modelId: { type: 'string', required: false },
      instrumentId: { type: 'string', required: false },
      limit: { type: 'number', default: 100 }
    });
    
    // Determine the source of signals - strategy or model
    if (params.strategyId) {
      // Get signals from the database
      const signals = await getSignalsByStrategy(params.strategyId, params.limit);
      
      // If no signals in database, try to get them from ML service
      if (signals.length === 0) {
        const mlSignals = await mlService.getSignals(params.strategyId, params.limit);
        
        // If there are signals from ML service, save them to our database
        if (mlSignals.length > 0) {
          for (const signal of mlSignals) {
            await saveSignal(signal);
          }
        }
        
        return createSuccessResponse(mlSignals);
      }
      
      return createSuccessResponse(signals);
    } 
    else if (params.modelId) {
      // Check if we need real-time predictions
      if (params.instrumentId) {
        // Prepare prediction request
        const predictionRequest: PredictionRequest = {
          model_id: params.modelId,
          instrument_id: params.instrumentId,
          // Include other optional parameters if provided
          timeframe: searchParams.get('timeframe') || undefined,
          params: {
            limit: params.limit
          }
        };
        
        // Get prediction from ML service
        const prediction = await mlService.getPrediction(predictionRequest);
        
        if (!prediction) {
          return createErrorResponse('Failed to get prediction', HTTP_STATUS.BAD_GATEWAY);
        }
        
        // Save signals to database for future reference
        if (prediction.signals && prediction.signals.length > 0) {
          for (const signal of prediction.signals) {
            // Only save if it has a strategy ID (some models may not be associated with strategies)
            if (signal.strategyId) {
              await saveSignal(signal);
            }
          }
        }
        
        return createSuccessResponse(prediction);
      } else {
        // If no instrument ID, return error
        return createErrorResponse('Instrument ID is required for model predictions', HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      // Neither strategyId nor modelId provided
      return createErrorResponse('Either strategyId or modelId is required', HTTP_STATUS.BAD_REQUEST);
    }
  } catch (error) {
    console.error('Error fetching signals:', error);
    return handleApiError(error, 'Failed to fetch signals');
  }
}

/**
 * POST /api/trading/signals
 * Create a new trading signal (usually called by ML service)
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // This endpoint should be protected with an API key for ML service
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey || apiKey !== process.env.ML_SERVICE_API_KEY) {
      return createErrorResponse('Invalid API key', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Get signal data from request body
    const signalData: Omit<TradingSignal, 'id' | 'createdAt'> = await req.json();
    
    // Validate signal data
    if (!signalData.strategyId || !signalData.instrumentId || !signalData.timestamp || !signalData.type) {
      return createErrorResponse('Missing required signal data', HTTP_STATUS.BAD_REQUEST, {
        details: 'strategyId, instrumentId, timestamp, and type are required'
      });
    }
    
    // Save to database
    const savedSignal = await saveSignal(signalData);
    
    // Return saved signal
    return createSuccessResponse(savedSignal, {
      timestamp: new Date().toISOString()
    }, HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error creating signal:', error);
    return handleApiError(error, 'Failed to create signal');
  }
}

/**
 * PUT /api/trading/signals/backfill
 * Backfill historical signals for a strategy
 */
export async function PUT(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      return createErrorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if user has admin role
    const userRole = (session as any)?.user?.role || 'user';
    
    if (userRole !== 'admin') {
      return createErrorResponse('Admin permissions required', HTTP_STATUS.FORBIDDEN);
    }
    
    // Parse URL to check for specific endpoints
    const { pathname } = new URL(req.url);
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Get request data
    const data = await req.json();
    
    // Handle backfill endpoint
    if (pathParts.includes('backfill')) {
      // Validate required fields
      if (!data.strategyId) {
        return createErrorResponse('Strategy ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      
      const days = data.days || 30;
      
      // In a real implementation, this would call the ML service's backfill API
      // For now, returning a mock response
      return createSuccessResponse({
        jobId: `backfill-${Date.now()}`,
        status: 'pending',
        strategyId: data.strategyId,
        days,
        estimatedCompletionTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }, {
        message: `Backfill request received for strategy ${data.strategyId} for the last ${days} days`
      });
    }
    
    // Default error for unrecognized endpoints
    return createErrorResponse('Invalid endpoint', HTTP_STATUS.BAD_REQUEST);
  } catch (error) {
    console.error('Error requesting backfill:', error);
    return handleApiError(error, 'Failed to request backfill');
  }
}
