/**
 * 📊 SHARED API SCHEMA - TRADING TYPES
 * Common type definitions for trading data shared across all components
 */

// Signal types
export enum SignalType {
  LONG = 'LONG',
  SHORT = 'SHORT',
  EXIT = 'EXIT',
  NEUTRAL = 'NEUTRAL'
}

// Distribution channels
export enum DistributionChannel {
  DISCORD = 'DISCORD',
  DESKTOP_APP = 'DESKTOP_APP',
  MOBILE_APP = 'MOBILE_APP',
  EMAIL = 'EMAIL',
  WEB = 'WEB'
}

// Strategy definition
export interface StrategyDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  parameters: StrategyParameter[];
  tags: string[];
  supportedInstruments: string[];
  distributionChannels: DistributionChannel[];
  subscriptionTiers: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Strategy parameter
export interface StrategyParameter {
  id: string;
  name: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  range?: [number, number]; // For numeric parameters
  options?: string[]; // For enum-like parameters
  isRequired: boolean;
  isAdvanced: boolean;
}

// Trading signal
export interface TradingSignal {
  id: string;
  strategyId: string;
  instrumentId: string;
  timestamp: number;
  type: SignalType;
  confidence: number;
  price?: number;
  targetPrice?: number;
  stopPrice?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

// Strategy performance metrics
export interface StrategyPerformance {
  strategyId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  winRate: number;
  totalSignals: number;
  profitFactor: number;
  averageReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  metadata?: Record<string, any>;
  updatedAt: Date;
}

// User strategy instance (user-specific configuration)
export interface StrategyInstance {
  id: string;
  strategyDefinitionId: string;
  userId: string;
  name: string;
  parameters: Record<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Subscription tier information
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  strategyAccess: string[]; // Array of strategy IDs
  maxInstances: number;
  isActive: boolean;
}
