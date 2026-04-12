/**
 * 📊 STRATEGY DASHBOARD
 * Component for monitoring trading strategies and signals
 */

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  StrategyDefinition,
  TradingSignal,
  StrategyPerformance as StrategyPerformanceType,
  DistributionChannel,
} from '@/lib/shared/trading/strategy-types';

// Component for strategy selection
const StrategySelector = ({
  strategies,
  selectedStrategy,
  onSelectStrategy,
}: {
  strategies: StrategyDefinition[];
  selectedStrategy: string | null;
  onSelectStrategy: (strategyId: string) => void;
}) => {
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
        
        {strategies.length === 0 && (
          <div className="col-span-3 p-8 text-center text-gray-400">
            <p>No strategies available yet. Check back soon or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for displaying strategy performance
const StrategyPerformance = ({
  performance,
  isLoading,
}: {
  performance: StrategyPerformanceType | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
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
}: {
  signals: TradingSignal[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
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
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [performance, setPerformance] = useState<StrategyPerformanceType | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);
  const [isLoadingSignals, setIsLoadingSignals] = useState(false);

  // Fetch strategies on component mount
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setIsLoadingStrategies(true);
        const response = await axios.get('/api/trading/strategies');
        setStrategies(response.data);
        
        // Select the first strategy by default if available
        if (response.data.length > 0) {
          setSelectedStrategy(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching strategies:', error);
        // For now, create dummy strategies for development
        setStrategies([
          {
            id: 'strategy-1',
            name: 'Momentum Alpha',
            description: 'Trend-following strategy based on price momentum',
            version: '1.0.0',
            parameters: [],
            tags: ['Momentum', 'Trend'],
            supportedInstruments: ['ES', 'NQ', 'CL'],
            distributionChannels: [DistributionChannel.DISCORD, DistributionChannel.DESKTOP_APP],
            subscriptionTiers: ['pro', 'enterprise'],
            isActive: true,
          },
          {
            id: 'strategy-2',
            name: 'Mean Reversion',
            description: 'Counter-trend strategy for overbought/oversold conditions',
            version: '1.0.0',
            parameters: [],
            tags: ['Mean Reversion', 'Oscillator'],
            supportedInstruments: ['ES', 'NQ', 'RTY'],
            distributionChannels: [DistributionChannel.DISCORD, DistributionChannel.DESKTOP_APP],
            subscriptionTiers: ['pro', 'enterprise'],
            isActive: true,
          },
        ]);
        setSelectedStrategy('strategy-1');
      } finally {
        setIsLoadingStrategies(false);
      }
    };

    fetchStrategies();
  }, []);

  // Fetch performance and signals when a strategy is selected
  useEffect(() => {
    if (!selectedStrategy) return;

    const fetchPerformance = async () => {
      try {
        setIsLoadingPerformance(true);
        const response = await axios.get(`/api/trading/performance?strategyId=${selectedStrategy}`);
        setPerformance(response.data);
      } catch (error) {
        console.error('Error fetching performance:', error);
        // Dummy performance data for development
        setPerformance({
          strategyId: selectedStrategy,
          period: 'all',
          winRate: 0.65,
          totalSignals: 128,
          profitFactor: 1.85,
          averageReturn: 0.012,
          maxDrawdown: 0.18,
          sharpeRatio: 1.2,
          metadata: {},
          updatedAt: new Date(),
        });
      } finally {
        setIsLoadingPerformance(false);
      }
    };

    const fetchSignals = async () => {
      try {
        setIsLoadingSignals(true);
        const response = await axios.get(`/api/trading/signals?strategyId=${selectedStrategy}`);
        setSignals(response.data);
      } catch (error) {
        console.error('Error fetching signals:', error);
        // Dummy signals data for development
        const dummySignals = [];
        const now = Date.now();
        const types = ['LONG', 'SHORT', 'EXIT', 'NEUTRAL'];
        const instruments = ['ES', 'NQ', 'RTY', 'CL', 'GC'];
        
        for (let i = 0; i < 10; i++) {
          dummySignals.push({
            id: `signal-${i}`,
            strategyId: selectedStrategy,
            instrumentId: instruments[Math.floor(Math.random() * instruments.length)],
            timestamp: now - i * 3600000, // Each hour back
            type: types[Math.floor(Math.random() * types.length)] as any,
            confidence: 0.5 + Math.random() * 0.4,
            price: 4000 + Math.random() * 200,
            targetPrice: 4100 + Math.random() * 200,
            stopPrice: 3900 + Math.random() * 100,
            metadata: {},
          });
        }
        
        setSignals(dummySignals);
      } finally {
        setIsLoadingSignals(false);
      }
    };

    fetchPerformance();
    fetchSignals();
  }, [selectedStrategy]);

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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Trading Strategy Dashboard</h2>
      
      <StrategySelector
        strategies={strategies}
        selectedStrategy={selectedStrategy}
        onSelectStrategy={handleSelectStrategy}
      />
      
      <StrategyPerformance
        performance={performance}
        isLoading={isLoadingPerformance}
      />
      
      <SignalsList signals={signals} isLoading={isLoadingSignals} />
    </div>
  );
};

export default StrategyDashboard;
