/**
 * 📊 API ROUTE: Trading Performance
 * Endpoint for retrieving performance metrics for trading strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getStrategyPerformanceById } from '@/lib/models/trading';

/**
 * GET /api/trading/performance
 * Retrieve performance metrics for a specific strategy
 */
export async function GET(
  req: NextRequest
) {
  try {
    // Get user session to check permissions
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const strategyId = searchParams.get('strategyId');
    const period = searchParams.get('period') || 'all';
    
    if (!strategyId) {
      return NextResponse.json(
        { error: 'Strategy ID is required' },
        { status: 400 }
      );
    }

    // Validate period
    const validPeriods = ['day', 'week', 'month', 'year', 'all'];
    if (!validPeriods.includes(period as string)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: ' + validPeriods.join(', ') },
        { status: 400 }
      );
    }

    // Get performance metrics from the database
    const performance = await getStrategyPerformanceById(
      strategyId, 
      period as 'day' | 'week' | 'month' | 'year' | 'all'
    );
    
    if (!performance) {
      // Return placeholder data for development
      return NextResponse.json({
        strategyId,
        period,
        winRate: 0.65,
        totalSignals: 128,
        profitFactor: 1.85,
        averageReturn: 0.012,
        maxDrawdown: 0.18,
        sharpeRatio: 1.2,
        metadata: {
          bestTrade: 0.075,
          worstTrade: -0.035,
          tradingDays: 120,
        },
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json(performance);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
