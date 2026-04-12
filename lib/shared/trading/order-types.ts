/**
 * 📦 ORDER DATA MODELS
 * Shared types for orders, executions, and positions across broker integrations
 */

/**
 * Order side - buy or sell
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Order type definitions
 */
export enum OrderType {
  MARKET = 'MARKET',             // Execute immediately at market price
  LIMIT = 'LIMIT',               // Execute at specified price or better
  STOP = 'STOP',                 // Market order when price reaches stop price
  STOP_LIMIT = 'STOP_LIMIT',     // Limit order when price reaches stop price
  TRAIL_STOP = 'TRAIL_STOP',     // Stop order with trailing price
  OCO = 'OCO',                   // One-cancels-other (pair of orders)
}

/**
 * Time in force for orders
 */
export enum TimeInForce {
  DAY = 'DAY',                   // Valid for the trading day
  GTC = 'GTC',                   // Good-till-canceled
  IOC = 'IOC',                   // Immediate-or-cancel
  FOK = 'FOK',                   // Fill-or-kill
  GTD = 'GTD',                   // Good-till-date
}

/**
 * Order status throughout lifecycle
 */
export enum OrderStatus {
  PENDING = 'PENDING',           // Order created but not sent
  SUBMITTED = 'SUBMITTED',       // Order sent to broker
  ACKNOWLEDGED = 'ACKNOWLEDGED', // Order received by broker
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/**
 * Base order interface
 */
export interface Order {
  id?: string;                  // Internal ID
  brokerId?: string;            // ID assigned by broker
  strategyId?: string;          // Strategy that created the order
  accountId: string;            // Trading account ID
  instrumentId: string;         // Instrument identifier
  side: OrderSide;              // Buy or sell
  type: OrderType;              // Market, limit, etc.
  quantity: number;             // Order quantity
  price?: number;               // Limit price (if applicable)
  stopPrice?: number;           // Stop price (if applicable)
  timeInForce: TimeInForce;     // When order expires
  status: OrderStatus;          // Current order status
  filledQuantity: number;       // How much has been filled
  averagePrice?: number;        // Average fill price
  parentOrderId?: string;       // For child orders
  relatedOrders?: string[];     // For OCO or bracket orders
  createdAt?: Date;             // Order creation time
  updatedAt?: Date;             // Last update time
  submittedAt?: Date;           // When order was sent to broker
  filledAt?: Date;              // When order was filled
  expiresAt?: Date;             // Expiration time (if applicable)
  metadata: Record<string, any>; // Broker-specific details
  tags?: string[];              // Custom tags
}

/**
 * Execution report for a trade
 */
export interface Execution {
  id?: string;                  // Internal ID
  brokerId?: string;            // ID assigned by broker
  orderId: string;              // Associated order
  instrumentId: string;         // Instrument identifier
  side: OrderSide;              // Buy or sell
  quantity: number;             // Executed quantity
  price: number;                // Execution price
  timestamp: Date;              // When execution occurred
  fee?: number;                 // Commission/fee
  liquidityFlag?: string;       // Added/removed liquidity
  venue?: string;               // Execution venue
  metadata: Record<string, any>; // Broker-specific details
}

/**
 * Position tracking
 */
export interface Position {
  id?: string;                  // Internal ID
  accountId: string;            // Trading account ID
  instrumentId: string;         // Instrument identifier
  quantity: number;             // Current position size (+ for long, - for short)
  averagePrice: number;         // Average entry price
  openValue: number;            // Value at entry
  currentValue?: number;        // Current market value
  unrealizedPnl?: number;       // Unrealized profit/loss
  realizedPnl?: number;         // Realized profit/loss
  openDate: Date;               // When position was opened
  lastUpdated?: Date;           // Last update time
  metadata: Record<string, any>; // Additional data
}

/**
 * Account summary
 */
export interface AccountSummary {
  id: string;                   // Account identifier
  name: string;                 // Account name
  type: string;                 // Account type
  balance: number;              // Current balance
  availableFunds: number;       // Available for trading
  buyingPower: number;          // Margin buying power
  currency: string;             // Base currency
  realizedPnl?: number;         // Realized profit/loss
  unrealizedPnl?: number;       // Unrealized profit/loss
  positions?: Position[];       // Current positions
  lastUpdated: Date;            // Last update time
  metadata: Record<string, any>; // Broker-specific details
}

/**
 * Order request to be sent to broker
 */
export interface OrderRequest {
  instrumentId: string;         // Instrument identifier
  side: OrderSide;              // Buy or sell
  type: OrderType;              // Market, limit, etc.
  quantity: number;             // Order quantity
  price?: number;               // Limit price (if applicable)
  stopPrice?: number;           // Stop price (if applicable)
  timeInForce?: TimeInForce;    // When order expires (defaults to DAY)
  accountId?: string;           // Trading account ID (if multiple accounts)
  strategyId?: string;          // Strategy that created the order
  parentOrderId?: string;       // For child orders
  metadata?: Record<string, any>; // Broker-specific parameters
  tags?: string[];              // Custom tags
}

/**
 * Order cancellation request
 */
export interface CancelOrderRequest {
  orderId: string;              // Internal order ID
  brokerId?: string;            // Broker's order ID
  accountId?: string;           // Trading account ID (if multiple accounts)
}

/**
 * Order modification request
 */
export interface ModifyOrderRequest {
  orderId: string;              // Internal order ID
  brokerId?: string;            // Broker's order ID
  quantity?: number;            // New quantity
  price?: number;               // New limit price
  stopPrice?: number;           // New stop price
  timeInForce?: TimeInForce;    // New time in force
  metadata?: Record<string, any>; // Broker-specific parameters
}
