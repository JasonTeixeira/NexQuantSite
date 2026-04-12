/**
 * 🚀 API ROUTE: Trading Strategies
 * Endpoint for retrieving and managing trading strategies
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
import mlService from '@/core/api/MlService';
import { getStrategyDefinitions, getStrategyDefinitionById, saveStrategyDefinition } from '@/lib/models/trading';
import { StrategyDefinition } from '@/types/models/TradingTypes';

/**
 * GET /api/trading/strategies
 * Retrieve all available trading strategies
 */
export async function GET(req: NextRequest) {
  try {
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      return createErrorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const params = parseQueryParams(searchParams, {
      id: { type: 'string', required: false }
    });

    // Check if we need to get a specific strategy
    if (params.id) {
      // Get a specific strategy
      const strategy = await getStrategyDefinitionById(params.id);
      
      if (!strategy) {
        // Try to get it from ML service as fallback
        const mlStrategy = await mlService.getStrategy(params.id);
        
        if (!mlStrategy) {
          return createErrorResponse('Strategy not found', HTTP_STATUS.NOT_FOUND);
        }
        
        return createSuccessResponse(mlStrategy);
      }
      
      return createSuccessResponse(strategy);
    }

    // Get all strategies from the database
    const strategies = await getStrategyDefinitions();
    
    // If no strategies in database, try to get them from ML service
    if (strategies.length === 0) {
      const mlStrategies = await mlService.getStrategies();
      return createSuccessResponse(mlStrategies);
    }
    
    return createSuccessResponse(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
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
      return createErrorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if user has admin role
    const userRole = (session as any)?.user?.role || 'user';
    
    if (userRole !== 'admin') {
      return createErrorResponse('Admin permissions required', HTTP_STATUS.FORBIDDEN);
    }
    
    // Get strategy data from request body
    const strategyData: Omit<StrategyDefinition, 'id' | 'createdAt' | 'updatedAt'> = await req.json();
    
    // Validate required fields
    if (!strategyData.name || !strategyData.version) {
      return createErrorResponse('Name and version are required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Save to database
    const savedStrategy = await saveStrategyDefinition(strategyData);
    
    return createSuccessResponse(savedStrategy, undefined, HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error creating strategy:', error);
    return handleApiError(error, 'Failed to create strategy');
  }
}
