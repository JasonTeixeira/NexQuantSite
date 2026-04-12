/**
 * 📊 TRADING MODELS
 * Database models for trading strategies and signals
 */

import { db } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
import {
  StrategyDefinition,
  TradingSignal,
  StrategyPerformance,
  StrategyInstance,
  SignalType,
  DistributionChannel
} from '@/types/models/TradingTypes';

/**
 * Save a strategy definition to the database
 */
export async function saveStrategyDefinition(
  strategy: Omit<StrategyDefinition, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StrategyDefinition> {
  const id = uuidv4();
  const now = new Date();

  const { rows } = await db.query(`
    INSERT INTO strategy_definitions (
      id, name, description, version, parameters, tags, 
      supported_instruments, distribution_channels, subscription_tiers, is_active,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    strategy.isActive,
    now,
    now
  ]);

  return mapDbRowToStrategyDefinition(rows[0]);
}

/**
 * Get all strategy definitions
 */
export async function getStrategyDefinitions(): Promise<StrategyDefinition[]> {
  try {
    const { rows } = await db.query(`
      SELECT * FROM strategy_definitions
      ORDER BY name ASC
    `);

    return rows.map(mapDbRowToStrategyDefinition);
  } catch (error) {
    console.error('Error fetching strategy definitions:', error);
    return [];
  }
}

/**
 * Get a strategy definition by ID
 */
export async function getStrategyDefinitionById(id: string): Promise<StrategyDefinition | null> {
  try {
    const { rows } = await db.query(`
      SELECT * FROM strategy_definitions
      WHERE id = $1
    `, [id]);

    if (rows.length === 0) {
      return null;
    }

    return mapDbRowToStrategyDefinition(rows[0]);
  } catch (error) {
    console.error(`Error fetching strategy definition ${id}:`, error);
    return null;
  }
}

/**
 * Save a trading signal to the database
 */
export async function saveSignal(
  signal: Omit<TradingSignal, 'id' | 'createdAt'>
): Promise<TradingSignal> {
  const id = uuidv4();
  const now = new Date();

  const { rows } = await db.query(`
    INSERT INTO trading_signals (
      id, strategy_id, instrument_id, timestamp, type, confidence,
      price, target_price, stop_price, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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

  return mapDbRowToSignal(rows[0]);
}

/**
 * Get signals for a strategy
 */
export async function getSignalsByStrategy(
  strategyId: string,
  limit: number = 100
): Promise<TradingSignal[]> {
  try {
    const { rows } = await db.query(`
      SELECT * FROM trading_signals
      WHERE strategy_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `, [strategyId, limit]);

    return rows.map(mapDbRowToSignal);
  } catch (error) {
    console.error(`Error fetching signals for strategy ${strategyId}:`, error);
    return [];
  }
}

/**
 * Save strategy performance metrics
 */
export async function saveStrategyPerformance(
  performance: Omit<StrategyPerformance, 'updatedAt'>
): Promise<StrategyPerformance> {
  const now = new Date();

  // First check if a record exists for this strategy and period
  const { rows: existingRows } = await db.query(`
    SELECT * FROM strategy_performance
    WHERE strategy_id = $1 AND period = $2
  `, [performance.strategyId, performance.period]);

  if (existingRows.length > 0) {
    // Update existing record
    const { rows } = await db.query(`
      UPDATE strategy_performance
      SET 
        win_rate = $3,
        total_signals = $4,
        profit_factor = $5,
        average_return = $6,
        max_drawdown = $7,
        sharpe_ratio = $8,
        metadata = $9,
        updated_at = $10
      WHERE strategy_id = $1 AND period = $2
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

    return mapDbRowToPerformance(rows[0]);
  } else {
    // Insert new record
    const { rows } = await db.query(`
      INSERT INTO strategy_performance (
        strategy_id, period, win_rate, total_signals, profit_factor,
        average_return, max_drawdown, sharpe_ratio, metadata, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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

    return mapDbRowToPerformance(rows[0]);
  }
}

/**
 * Get performance metrics for a strategy
 */
export async function getStrategyPerformanceById(
  strategyId: string,
  period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'
): Promise<StrategyPerformance | null> {
  try {
    const { rows } = await db.query(`
      SELECT * FROM strategy_performance
      WHERE strategy_id = $1 AND period = $2
    `, [strategyId, period]);

    if (rows.length === 0) {
      return null;
    }

    return mapDbRowToPerformance(rows[0]);
  } catch (error) {
    console.error(`Error fetching performance for strategy ${strategyId}:`, error);
    return null;
  }
}

/**
 * Create database tables if they don't exist
 */
export async function initializeTradingTables(): Promise<void> {
  try {
    // Create strategy_definitions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS strategy_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT NOT NULL,
        parameters JSONB NOT NULL DEFAULT '[]',
        tags JSONB NOT NULL DEFAULT '[]',
        supported_instruments JSONB NOT NULL DEFAULT '[]',
        distribution_channels JSONB NOT NULL DEFAULT '[]',
        subscription_tiers JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `);

    // Create trading_signals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS trading_signals (
        id TEXT PRIMARY KEY,
        strategy_id TEXT NOT NULL,
        instrument_id TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        type TEXT NOT NULL,
        confidence REAL NOT NULL,
        price REAL,
        target_price REAL,
        stop_price REAL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL,
        FOREIGN KEY (strategy_id) REFERENCES strategy_definitions(id) ON DELETE CASCADE
      )
    `);

    // Create strategy_performance table
    await db.query(`
      CREATE TABLE IF NOT EXISTS strategy_performance (
        strategy_id TEXT NOT NULL,
        period TEXT NOT NULL,
        win_rate REAL NOT NULL,
        total_signals INTEGER NOT NULL,
        profit_factor REAL NOT NULL,
        average_return REAL NOT NULL,
        max_drawdown REAL NOT NULL,
        sharpe_ratio REAL NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP NOT NULL,
        PRIMARY KEY (strategy_id, period),
        FOREIGN KEY (strategy_id) REFERENCES strategy_definitions(id) ON DELETE CASCADE
      )
    `);

    // Create strategy_instances table for user-specific strategy configurations
    await db.query(`
      CREATE TABLE IF NOT EXISTS strategy_instances (
        id TEXT PRIMARY KEY,
        strategy_definition_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        parameters JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (strategy_definition_id) REFERENCES strategy_definitions(id) ON DELETE CASCADE
      )
    `);

    console.log('Trading tables initialized');
  } catch (error) {
    console.error('Error initializing trading tables:', error);
    throw error;
  }
}

// Helper functions for mapping database rows to TypeScript types

function mapDbRowToStrategyDefinition(row: any): StrategyDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    parameters: typeof row.parameters === 'string' ? JSON.parse(row.parameters) : row.parameters,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    supportedInstruments: typeof row.supported_instruments === 'string' 
      ? JSON.parse(row.supported_instruments) 
      : row.supported_instruments,
    distributionChannels: typeof row.distribution_channels === 'string'
      ? JSON.parse(row.distribution_channels)
      : row.distribution_channels,
    subscriptionTiers: typeof row.subscription_tiers === 'string'
      ? JSON.parse(row.subscription_tiers)
      : row.subscription_tiers,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function mapDbRowToSignal(row: any): TradingSignal {
  return {
    id: row.id,
    strategyId: row.strategy_id,
    instrumentId: row.instrument_id,
    timestamp: row.timestamp,
    type: row.type as SignalType,
    confidence: row.confidence,
    price: row.price,
    targetPrice: row.target_price,
    stopPrice: row.stop_price,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    createdAt: new Date(row.created_at)
  };
}

function mapDbRowToPerformance(row: any): StrategyPerformance {
  return {
    strategyId: row.strategy_id,
    period: row.period as 'day' | 'week' | 'month' | 'year' | 'all',
    winRate: row.win_rate,
    totalSignals: row.total_signals,
    profitFactor: row.profit_factor,
    averageReturn: row.average_return,
    maxDrawdown: row.max_drawdown,
    sharpeRatio: row.sharpe_ratio,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    updatedAt: new Date(row.updated_at)
  };
}
