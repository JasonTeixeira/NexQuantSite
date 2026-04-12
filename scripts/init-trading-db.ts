/**
 * 🚀 TRADING DATABASE INITIALIZATION
 * Initialize database tables for trading functionality
 */

import { initializeTradingTables, saveStrategyDefinition, saveSignal, saveStrategyPerformance } from '../lib/models/trading';
import { DistributionChannel, SignalType } from '../lib/shared/trading/strategy-types';

/**
 * Initialize trading database with sample data
 */
async function initializeTradingDatabase() {
  try {
    console.log('🚀 Initializing trading database tables...');
    await initializeTradingTables();
    console.log('✅ Tables created successfully');

    // Create sample strategies
    console.log('📊 Creating sample strategies...');
    const strategy1 = await saveStrategyDefinition({
      name: 'Momentum Alpha',
      description: 'Trend-following strategy based on price momentum',
      version: '1.0.0',
      parameters: [
        {
          id: 'lookback',
          name: 'Lookback Period',
          description: 'Number of bars to look back',
          type: 'number',
          defaultValue: 20,
          range: [5, 50],
          isRequired: true,
          isAdvanced: false,
        },
        {
          id: 'threshold',
          name: 'Signal Threshold',
          description: 'Threshold for signal generation',
          type: 'number',
          defaultValue: 0.5,
          range: [0.1, 0.9],
          isRequired: true,
          isAdvanced: false,
        },
      ],
      tags: ['Momentum', 'Trend'],
      supportedInstruments: ['ES', 'NQ', 'CL'],
      distributionChannels: [DistributionChannel.DISCORD, DistributionChannel.DESKTOP_APP],
      subscriptionTiers: ['pro', 'enterprise'],
      isActive: true,
    });

    const strategy2 = await saveStrategyDefinition({
      name: 'Mean Reversion',
      description: 'Counter-trend strategy for overbought/oversold conditions',
      version: '1.0.0',
      parameters: [
        {
          id: 'lookback',
          name: 'Lookback Period',
          description: 'Number of bars to look back',
          type: 'number',
          defaultValue: 14,
          range: [5, 30],
          isRequired: true,
          isAdvanced: false,
        },
        {
          id: 'overbought',
          name: 'Overbought Level',
          description: 'Level considered overbought',
          type: 'number',
          defaultValue: 70,
          range: [60, 90],
          isRequired: true,
          isAdvanced: false,
        },
        {
          id: 'oversold',
          name: 'Oversold Level',
          description: 'Level considered oversold',
          type: 'number',
          defaultValue: 30,
          range: [10, 40],
          isRequired: true,
          isAdvanced: false,
        },
      ],
      tags: ['Mean Reversion', 'Oscillator'],
      supportedInstruments: ['ES', 'NQ', 'RTY'],
      distributionChannels: [DistributionChannel.DISCORD, DistributionChannel.DESKTOP_APP],
      subscriptionTiers: ['pro', 'enterprise'],
      isActive: true,
    });

    console.log(`✅ Created strategies: ${strategy1.name}, ${strategy2.name}`);

    // Create sample signals
    console.log('📊 Creating sample signals...');
    const now = Date.now();
    const types = [SignalType.LONG, SignalType.SHORT, SignalType.EXIT];
    const instruments = ['ES', 'NQ', 'RTY', 'CL'];

    for (const strategy of [strategy1, strategy2]) {
      for (let i = 0; i < 20; i++) {
        const hourOffset = i * 3600000; // Each hour back
        const type = types[Math.floor(Math.random() * types.length)];
        const instrument = instruments[Math.floor(Math.random() * instruments.length)];
        const basePrice = 4000 + Math.random() * 200;

        await saveSignal({
          strategyId: strategy.id,
          instrumentId: instrument,
          timestamp: now - hourOffset,
          type: type,
          confidence: 0.5 + Math.random() * 0.4,
          price: basePrice,
          targetPrice: type === SignalType.LONG ? basePrice * 1.01 : basePrice * 0.99,
          stopPrice: type === SignalType.LONG ? basePrice * 0.99 : basePrice * 1.01,
          metadata: {
            volume: Math.floor(1000 + Math.random() * 5000),
            volatility: 0.1 + Math.random() * 0.2,
          },
        });
      }

      // Create performance metrics
      await saveStrategyPerformance({
        strategyId: strategy.id,
        period: 'day',
        winRate: 0.6 + Math.random() * 0.2,
        totalSignals: Math.floor(10 + Math.random() * 20),
        profitFactor: 1.5 + Math.random() * 1,
        averageReturn: 0.005 + Math.random() * 0.01,
        maxDrawdown: 0.05 + Math.random() * 0.1,
        sharpeRatio: 1 + Math.random() * 1,
        metadata: {
          bestTrade: 0.05 + Math.random() * 0.05,
          worstTrade: -(0.02 + Math.random() * 0.03),
        },
      });

      await saveStrategyPerformance({
        strategyId: strategy.id,
        period: 'week',
        winRate: 0.55 + Math.random() * 0.2,
        totalSignals: Math.floor(50 + Math.random() * 50),
        profitFactor: 1.4 + Math.random() * 1,
        averageReturn: 0.004 + Math.random() * 0.01,
        maxDrawdown: 0.08 + Math.random() * 0.1,
        sharpeRatio: 0.9 + Math.random() * 1,
        metadata: {
          bestTrade: 0.06 + Math.random() * 0.06,
          worstTrade: -(0.03 + Math.random() * 0.03),
        },
      });

      await saveStrategyPerformance({
        strategyId: strategy.id,
        period: 'month',
        winRate: 0.52 + Math.random() * 0.2,
        totalSignals: Math.floor(200 + Math.random() * 100),
        profitFactor: 1.3 + Math.random() * 1,
        averageReturn: 0.003 + Math.random() * 0.01,
        maxDrawdown: 0.1 + Math.random() * 0.1,
        sharpeRatio: 0.8 + Math.random() * 1,
        metadata: {
          bestTrade: 0.07 + Math.random() * 0.07,
          worstTrade: -(0.04 + Math.random() * 0.03),
        },
      });

      await saveStrategyPerformance({
        strategyId: strategy.id,
        period: 'all',
        winRate: 0.51 + Math.random() * 0.15,
        totalSignals: Math.floor(500 + Math.random() * 500),
        profitFactor: 1.2 + Math.random() * 0.8,
        averageReturn: 0.002 + Math.random() * 0.008,
        maxDrawdown: 0.15 + Math.random() * 0.1,
        sharpeRatio: 0.7 + Math.random() * 0.8,
        metadata: {
          bestTrade: 0.08 + Math.random() * 0.07,
          worstTrade: -(0.05 + Math.random() * 0.03),
          tradingDays: Math.floor(100 + Math.random() * 100),
        },
      });
    }

    console.log('✅ Created sample signals and performance metrics');
    console.log('🎉 Database initialization complete');
  } catch (error) {
    console.error('Error initializing trading database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeTradingDatabase().catch(console.error);
