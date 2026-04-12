/**
 * 📊 STRATEGY DASHBOARD - PRODUCTION-READY IMPLEMENTATION
 * Refactored component with proper error handling and no mock data
 */

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  StrategyDefinition,
  TradingSignal,
  StrategyPerformance as StrategyPerformanceType,
} from '@/lib/shared/trading/strategy-types';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ReloadIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';

// Monitoring and logging utility (to be implemented)
import { reportError } from '@/lib/monitoring';

// Component for displaying errors with retry functionality
const ErrorDisplay = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void;
}) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Error</AlertTitle>
      <div className="flex flex-col gap-4">
        <p>{message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="self-start"
        >
          <ReloadIcon className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    </Alert>
  );
};

// Component for strategy selection
const StrategySelector = ({
  strategies,
  selectedStrategy,
  onSelectStrategy,
  isLoading,
  error,
  onRetry,
}: {
  strategies: StrategyDefinition[];
  selectedStrategy: string | null;
  onSelectStrategy: (strategyId: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={onRetry} />;
  }

  if (strategies.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Trading Strategies</h3>
        <div className="p-8 text-center text-gray-400">
          <p>No strategies available yet. Please check back later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Trading Strategies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedStrategy === strategy.id
                ? 'bg-cyan-700 border-2 border-cyan-500'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            onClick={() => onSelectStrategy(strategy.id)}
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
        ))}
      </div>
    </div>
  );
};

// Component for displaying strategy performance
const StrategyPerformance = ({
  performance,
  isLoading,
  error,
  onRetry,
}: {
  performance: StrategyPerformanceType | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={onRetry} />;
  }

  if (!performance) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Performance Metrics</h3>
        <div className="p-8 text-center text-gray-400">
          <p>Select a strategy to view performance metrics.</p>
        </div>
      </div>
    );
  }

  // Define performance cards
  const cards = [
    {
      title: 'Win Rate',
      value: `${(performance.winRate * 100).toFixed(1)}%`,
      color: performance.winRate > 0.5 ? 'text-green-400' : 'text-red-400',
    },
    {
      title: 'Total Signals',
      value: performance.totalSignals.toString(),
      color: 'text-blue-400',
    },
    {
      title: 'Profit Factor',
      value: performance.profitFactor.toFixed(2),
      color: performance.profitFactor > 1 ? 'text-green-400' : 'text-red-400',
    },
    {
      title: 'Average Return',
      value: `${(performance.averageReturn * 100).toFixed(2)}%`,
      color: performance.averageReturn > 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      title: 'Max Drawdown',
      value: `${(performance.maxDrawdown * 100).toFixed(2)}%`,
      color: 'text-red-400',
    },
    {
      title: 'Sharpe Ratio',
      value: performance.sharpeRatio.toFixed(2),
      color: performance.sharpeRatio > 1 ? 'text-green-400' : 'text-yellow-400',
    },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Performance Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">{card.title}</div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for displaying signals
const SignalsList = ({
  signals,
  isLoading,
  error,
  onRetry,
}: {
  signals: TradingSignal[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={onRetry} />;
  }

  if (signals.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-white">Recent Signals</h3>
        <div className="p-8 text-center text-gray-400">
          <p>No signals available for this strategy yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-white">Recent Signals</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2 text-left text-gray-300">Time</th>
              <th className="px-4 py-2 text-left text-gray-300">Instrument</th>
              <th className="px-4 py-2 text-left text-gray-300">Type</th>
              <th className="px-4 py-2 text-left text-gray-300">Confidence</th>
              <th className="px-4 py-2 text-left text-gray-300">Price</th>
              <th className="px-4 py-2 text-left text-gray-300">Target</th>
              <th className="px-4 py-2 text-left text-gray-300">Stop</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => (
              <tr key={signal.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-300">
                  {new Date(signal.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-300">{signal.instrumentId}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      signal.type === 'LONG'
                        ? 'bg-green-900 text-green-300'
                        : signal.type === 'SHORT'
                        ? 'bg-red-900 text-red-300'
                        : signal.type === 'EXIT'
                        ? 'bg-yellow-900 text-yellow-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {signal.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {(signal.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {signal.price ? signal.price.toFixed(2) : '-'}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {signal.targetPrice ? signal.targetPrice.toFixed(2) : '-'}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {signal.stopPrice ? signal.stopPrice.toFixed(2) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main dashboard component
const StrategyDashboard = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // State for strategies
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [strategiesError, setStrategiesError] = useState<string | null>(null);
  
  // State for performance
  const [performance, setPerformance] = useState<StrategyPerformanceType | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  
  // State for signals
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isLoadingSignals, setIsLoadingSignals] = useState(false);
  const [signalsError, setSignalsError] = useState<string | null>(null);

  // Fetch strategies function
  const fetchStrategies = async () => {
    try {
      setIsLoadingStrategies(true);
      setStrategiesError(null);
      
      const response = await axios.get('/api/trading/strategies');
      setStrategies(response.data.data || []);
      
      // Select the first strategy by default if available
      if (response.data.data && response.data.data.length > 0) {
        setSelectedStrategy(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setStrategiesError('Unable to load trading strategies. Please try again later.');
      reportError({
        component: 'StrategyDashboard',
        action: 'fetchStrategies',
        error
      });
      
      toast({
        title: 'Error loading strategies',
        description: 'Could not load trading strategies. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStrategies(false);
    }
  };

  // Fetch performance function
  const fetchPerformance = async (strategyId: string) => {
    try {
      setIsLoadingPerformance(true);
      setPerformanceError(null);
      
      const response = await axios.get(`/api/trading/performance?strategyId=${strategyId}`);
      setPerformance(response.data.data || null);
    } catch (error) {
      console.error('Error fetching performance:', error);
      setPerformanceError('Unable to load performance metrics. Please try again later.');
      reportError({
        component: 'StrategyDashboard',
        action: 'fetchPerformance',
        strategyId,
        error
      });
    } finally {
      setIsLoadingPerformance(false);
    }
  };

  // Fetch signals function
  const fetchSignals = async (strategyId: string) => {
    try {
      setIsLoadingSignals(true);
      setSignalsError(null);
      
      const response = await axios.get(`/api/trading/signals?strategyId=${strategyId}`);
      setSignals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching signals:', error);
      setSignalsError('Unable to load trading signals. Please try again later.');
      reportError({
        component: 'StrategyDashboard',
        action: 'fetchSignals',
        strategyId,
        error
      });
    } finally {
      setIsLoadingSignals(false);
    }
  };

  // Fetch strategies on component mount
  useEffect(() => {
    if (session) {
      fetchStrategies();
    }
  }, [session]);

  // Fetch performance and signals when a strategy is selected
  useEffect(() => {
    if (!selectedStrategy || !session) return;
    
    fetchPerformance(selectedStrategy);
    fetchSignals(selectedStrategy);
  }, [selectedStrategy, session]);

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedStrategy(strategyId);
  };

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-400">Please sign in to view the strategy dashboard.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <p>An unexpected error occurred while loading the dashboard. Our team has been notified.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              <ReloadIcon className="mr-2 h-4 w-4" />
              Refresh page
            </Button>
          </Alert>
        </div>
      }
      onError={(error) => {
        reportError({
          component: 'StrategyDashboard',
          action: 'render',
          error
        });
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Trading Strategy Dashboard</h2>
        
        <StrategySelector
          strategies={strategies}
          selectedStrategy={selectedStrategy}
          onSelectStrategy={handleSelectStrategy}
          isLoading={isLoadingStrategies}
          error={strategiesError}
          onRetry={fetchStrategies}
        />
        
        <StrategyPerformance
          performance={performance}
          isLoading={isLoadingPerformance}
          error={performanceError}
          onRetry={() => selectedStrategy && fetchPerformance(selectedStrategy)}
        />
        
        <SignalsList 
          signals={signals} 
          isLoading={isLoadingSignals}
          error={signalsError}
          onRetry={() => selectedStrategy && fetchSignals(selectedStrategy)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default StrategyDashboard;
