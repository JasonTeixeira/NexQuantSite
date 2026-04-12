/**
 * 🚀 Database Initialization Script
 * Simple script to initialize the database with sample data
 */

const path = require('path');
const dbPath = path.join(__dirname, '..', '.data', 'nexquant.db');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

// Create a direct database connection
const db = new Database(dbPath);

// Set up pragmas for better performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Distribution channels and signal types constants
const DistributionChannel = {
  DISCORD: 'DISCORD',
  DESKTOP_APP: 'DESKTOP_APP',
  MOBILE_APP: 'MOBILE_APP',
  EMAIL: 'EMAIL',
};

const SignalType = {
  LONG: 'LONG',
  SHORT: 'SHORT',
  EXIT: 'EXIT',
  NEUTRAL: 'NEUTRAL',
};

// Simple query function
function query(sql, params = []) {
  console.log(`Running query: ${sql.substring(0, 100)}...`);
  
  try {
    const command = sql.trim().split(' ')[0].toUpperCase();
    
    if (command === 'SELECT' || sql.includes('RETURNING')) {
      const stmt = db.prepare(sql);
      return { rows: stmt.all(...params) };
    } else {
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      return { 
        rows: [],
        rowCount: result.changes
      };
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

/**
 * Initialize trading database tables
 */
async function initializeTradingTables() {
  try {
    // Create strategy_definitions table
    query(`
      CREATE TABLE IF NOT EXISTS strategy_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT NOT NULL,
        parameters JSON NOT NULL DEFAULT '[]',
        tags JSON NOT NULL DEFAULT '[]',
        supported_instruments JSON NOT NULL DEFAULT '[]',
        distribution_channels JSON NOT NULL DEFAULT '[]',
        subscription_tiers JSON NOT NULL DEFAULT '[]',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create trading_signals table
    query(`
      CREATE TABLE IF NOT EXISTS trading_signals (
        id TEXT PRIMARY KEY,
        strategy_id TEXT NOT NULL,
        instrument_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        confidence REAL NOT NULL,
        price REAL,
        target_price REAL,
        stop_price REAL,
        metadata JSON NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        FOREIGN KEY (strategy_id) REFERENCES strategy_definitions(id) ON DELETE CASCADE
      )
    `);

    // Create strategy_performance table
    query(`
      CREATE TABLE IF NOT EXISTS strategy_performance (
        strategy_id TEXT NOT NULL,
        period TEXT NOT NULL,
        win_rate REAL NOT NULL,
        total_signals INTEGER NOT NULL,
        profit_factor REAL NOT NULL,
        average_return REAL NOT NULL,
        max_drawdown REAL NOT NULL,
        sharpe_ratio REAL NOT NULL,
        metadata JSON NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL,
        PRIMARY KEY (strategy_id, period),
        FOREIGN KEY (strategy_id) REFERENCES strategy_definitions(id) ON DELETE CASCADE
      )
    `);

    // Create strategy_instances table for user-specific strategy configurations
    query(`
      CREATE TABLE IF NOT EXISTS strategy_instances (
        id TEXT PRIMARY KEY,
        strategy_definition_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        parameters JSON NOT NULL DEFAULT '{}',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (strategy_definition_id) REFERENCES strategy_definitions(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables created successfully');
    return true;
  } catch (error) {
    console.error('Error initializing trading tables:', error);
    throw error;
  }
}

/**
 * Save a strategy definition
 */
async function saveStrategyDefinition(strategy) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { rows } = query(`
    INSERT INTO strategy_definitions (
      id, name, description, version, parameters, tags, 
      supported_instruments, distribution_channels, subscription_tiers, is_active,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `, [
    id,
    strategy.name,
    strategy.description,
    strategy.version,
    JSON.stringify(strategy.parameters),
    JSON.stringify(strategy.tags),
    JSON.stringify(strategy.supportedInstruments),
    JSON.stringify(strategy.distributionChannels),
    JSON.stringify(strategy.subscriptionTiers),
    strategy.isActive ? 1 : 0,
    now,
    now
  ]);

  const result = rows[0];
  return {
    id: result.id,
    name: result.name,
    description: result.description,
    version: result.version,
    parameters: typeof result.parameters === 'string' ? JSON.parse(result.parameters) : result.parameters,
    tags: typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags,
    supportedInstruments: typeof result.supported_instruments === 'string' 
      ? JSON.parse(result.supported_instruments) 
      : result.supported_instruments,
    distributionChannels: typeof result.distribution_channels === 'string'
      ? JSON.parse(result.distribution_channels)
      : result.distribution_channels,
    subscriptionTiers: typeof result.subscription_tiers === 'string'
      ? JSON.parse(result.subscription_tiers)
      : result.subscription_tiers,
    isActive: !!result.is_active,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at)
  };
}

/**
 * Save a signal
 */
async function saveSignal(signal) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { rows } = query(`
    INSERT INTO trading_signals (
      id, strategy_id, instrument_id, timestamp, type, confidence,
      price, target_price, stop_price, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `, [
    id,
    signal.strategyId,
    signal.instrumentId,
    signal.timestamp,
    signal.type,
    signal.confidence,
    signal.price || null,
    signal.targetPrice || null,
    signal.stopPrice || null,
    JSON.stringify(signal.metadata || {}),
    now
  ]);

  const result = rows[0];
  return {
    id: result.id,
    strategyId: result.strategy_id,
    instrumentId: result.instrument_id,
    timestamp: result.timestamp,
    type: result.type,
    confidence: result.confidence,
    price: result.price,
    targetPrice: result.target_price,
    stopPrice: result.stop_price,
    metadata: typeof result.metadata === 'string' ? JSON.parse(result.metadata) : result.metadata,
    createdAt: new Date(result.created_at)
  };
}

/**
 * Save performance metrics
 */
async function saveStrategyPerformance(performance) {
  const now = new Date().toISOString();

  // First check if a record exists for this strategy and period
  const { rows: existingRows } = query(`
    SELECT * FROM strategy_performance
    WHERE strategy_id = ? AND period = ?
  `, [performance.strategyId, performance.period]);

  let result;
  if (existingRows.length > 0) {
    // Update existing record
    const { rows } = query(`
      UPDATE strategy_performance
      SET 
        win_rate = ?,
        total_signals = ?,
        profit_factor = ?,
        average_return = ?,
        max_drawdown = ?,
        sharpe_ratio = ?,
        metadata = ?,
        updated_at = ?
      WHERE strategy_id = ? AND period = ?
      RETURNING *
    `, [
      performance.winRate,
      performance.totalSignals,
      performance.profitFactor,
      performance.averageReturn,
      performance.maxDrawdown,
      performance.sharpeRatio,
      JSON.stringify(performance.metadata || {}),
      now,
      performance.strategyId,
      performance.period
    ]);

    result = rows[0];
  } else {
    // Insert new record
    const { rows } = query(`
      INSERT INTO strategy_performance (
        strategy_id, period, win_rate, total_signals, profit_factor,
        average_return, max_drawdown, sharpe_ratio, metadata, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [
      performance.strategyId,
      performance.period,
      performance.winRate,
      performance.totalSignals,
      performance.profitFactor,
      performance.averageReturn,
      performance.maxDrawdown,
      performance.sharpeRatio,
      JSON.stringify(performance.metadata || {}),
      now
    ]);

    result = rows[0];
  }

  return {
    strategyId: result.strategy_id,
    period: result.period,
    winRate: result.win_rate,
    totalSignals: result.total_signals,
    profitFactor: result.profit_factor,
    averageReturn: result.average_return,
    maxDrawdown: result.max_drawdown,
    sharpeRatio: result.sharpe_ratio,
    metadata: typeof result.metadata === 'string' ? JSON.parse(result.metadata) : result.metadata,
    updatedAt: new Date(result.updated_at)
  };
}

/**
 * Initialize trading database with sample data
 */
async function initializeTradingDatabase() {
  try {
    console.log('🚀 Initializing trading database tables...');
    await initializeTradingTables();

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
    
    // Close the database connection
    db.close();
  } catch (error) {
    console.error('Error initializing trading database:', error);
    // Close the database connection
    db.close();
    process.exit(1);
  }
}

// Run the initialization
initializeTradingDatabase().catch(console.error);
