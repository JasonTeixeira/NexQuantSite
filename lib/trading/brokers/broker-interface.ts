/**
 * 🌐 BROKER INTERFACE
 * Core interface that all broker implementations must follow
 */

import { EventEmitter } from 'events';
import {
  OrderRequest,
  Order,
  CancelOrderRequest,
  ModifyOrderRequest,
  Execution,
  Position,
  AccountSummary,
} from '@/lib/shared/trading/order-types';

/**
 * Broker connection status
 */
export enum BrokerConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

/**
 * Broker authentication method
 */
export enum BrokerAuthMethod {
  API_KEY = 'API_KEY',
  OAUTH = 'OAUTH',
  USERNAME_PASSWORD = 'USERNAME_PASSWORD',
  TOKEN = 'TOKEN',
  CERTIFICATE = 'CERTIFICATE',
}

/**
 * Broker authentication credentials
 */
export interface BrokerCredentials {
  method: BrokerAuthMethod;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  token?: string;
  certificatePath?: string;
  additionalParams?: Record<string, any>;
}

/**
 * Market data subscription request
 */
export interface MarketDataRequest {
  instrumentId: string;
  level?: number; // Market data level (1 = top of book, 2 = market depth)
  aggregate?: boolean; // Whether to aggregate updates
  frequency?: number; // Update frequency in ms (if supported)
}

/**
 * Market data quote
 */
export interface MarketQuote {
  instrumentId: string;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
  last?: number;
  lastSize?: number;
  volume?: number;
  timestamp: Date;
  depth?: Array<{
    price: number;
    size: number;
    side: 'bid' | 'ask';
    mpId?: string; // Market participant ID
  }>;
}

/**
 * Configuration for broker connection
 */
export interface BrokerConfig {
  // Connection settings
  host?: string;
  port?: number;
  path?: string;
  protocol?: string;
  
  // Authentication
  credentials: BrokerCredentials;
  
  // Behavior settings
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  requestTimeout?: number;
  
  // Environment
  isDemo?: boolean;
  
  // Additional broker-specific settings
  additionalSettings?: Record<string, any>;
}

/**
 * Core broker interface that all broker implementations must implement
 */
export interface BrokerInterface extends EventEmitter {
  /**
   * Unique identifier for this broker
   */
  readonly id: string;
  
  /**
   * Human-readable name for this broker
   */
  readonly name: string;
  
  /**
   * Current connection status
   */
  readonly connectionStatus: BrokerConnectionStatus;
  
  /**
   * List of accounts available with this broker
   */
  readonly accounts: string[];
  
  /**
   * Configure the broker with connection settings
   */
  configure(config: BrokerConfig): void;
  
  /**
   * Connect to the broker
   */
  connect(): Promise<boolean>;
  
  /**
   * Disconnect from the broker
   */
  disconnect(): Promise<void>;
  
  /**
   * Get list of available accounts
   */
  getAccounts(): Promise<string[]>;
  
  /**
   * Get detailed account information
   */
  getAccountSummary(accountId: string): Promise<AccountSummary>;
  
  /**
   * Subscribe to market data for an instrument
   */
  subscribeMarketData(request: MarketDataRequest): Promise<boolean>;
  
  /**
   * Unsubscribe from market data for an instrument
   */
  unsubscribeMarketData(instrumentId: string): Promise<boolean>;
  
  /**
   * Get latest quote for an instrument
   */
  getQuote(instrumentId: string): Promise<MarketQuote>;
  
  /**
   * Submit a new order
   */
  submitOrder(request: OrderRequest): Promise<Order>;
  
  /**
   * Cancel an existing order
   */
  cancelOrder(request: CancelOrderRequest): Promise<boolean>;
  
  /**
   * Modify an existing order
   */
  modifyOrder(request: ModifyOrderRequest): Promise<Order>;
  
  /**
   * Get order by ID
   */
  getOrder(orderId: string): Promise<Order | null>;
  
  /**
   * Get all open orders for an account
   */
  getOpenOrders(accountId?: string): Promise<Order[]>;
  
  /**
   * Get order history for an account
   */
  getOrderHistory(accountId?: string, since?: Date): Promise<Order[]>;
  
  /**
   * Get executions (fills) for an account or order
   */
  getExecutions(orderId?: string, accountId?: string, since?: Date): Promise<Execution[]>;
  
  /**
   * Get positions for an account
   */
  getPositions(accountId?: string): Promise<Position[]>;
  
  /**
   * Close all positions for an account or a specific position
   */
  closePositions(accountId: string, instrumentId?: string): Promise<boolean>;
}

/**
 * Broker factory interface to create broker instances
 */
export interface BrokerFactory {
  /**
   * Create a new broker instance
   */
  createBroker(config: BrokerConfig): BrokerInterface;
}

/**
 * Broker events that implementations can emit
 */
export enum BrokerEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTION_ERROR = 'connection_error',
  RECONNECTING = 'reconnecting',
  
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_ACKNOWLEDGED = 'order_acknowledged',
  ORDER_FILLED = 'order_filled',
  ORDER_PARTIALLY_FILLED = 'order_partially_filled',
  ORDER_CANCELED = 'order_canceled',
  ORDER_REJECTED = 'order_rejected',
  ORDER_EXPIRED = 'order_expired',
  
  EXECUTION = 'execution',
  
  POSITION_OPENED = 'position_opened',
  POSITION_UPDATED = 'position_updated',
  POSITION_CLOSED = 'position_closed',
  
  ACCOUNT_UPDATED = 'account_updated',
  
  MARKET_DATA = 'market_data',
  
  ERROR = 'error',
}

/**
 * Abstract base class for broker implementations
 * Provides some common functionality and event handling
 */
export abstract class BaseBroker extends EventEmitter implements BrokerInterface {
  protected _id: string;
  protected _name: string;
  protected _connectionStatus: BrokerConnectionStatus = BrokerConnectionStatus.DISCONNECTED;
  protected _accounts: string[] = [];
  protected _config?: BrokerConfig;
  
  constructor(id: string, name: string) {
    super();
    this._id = id;
    this._name = name;
  }
  
  get id(): string {
    return this._id;
  }
  
  get name(): string {
    return this._name;
  }
  
  get connectionStatus(): BrokerConnectionStatus {
    return this._connectionStatus;
  }
  
  get accounts(): string[] {
    return [...this._accounts];
  }
  
  /**
   * Configure the broker with connection settings
   */
  configure(config: BrokerConfig): void {
    this._config = config;
  }
  
  /**
   * Update connection status and emit events
   */
  protected updateConnectionStatus(status: BrokerConnectionStatus): void {
    const previousStatus = this._connectionStatus;
    this._connectionStatus = status;
    
    // Emit appropriate events based on status change
    if (previousStatus !== status) {
      switch (status) {
        case BrokerConnectionStatus.CONNECTED:
          this.emit(BrokerEvent.CONNECTED);
          break;
        case BrokerConnectionStatus.DISCONNECTED:
          this.emit(BrokerEvent.DISCONNECTED);
          break;
        case BrokerConnectionStatus.ERROR:
          this.emit(BrokerEvent.CONNECTION_ERROR);
          break;
        case BrokerConnectionStatus.RECONNECTING:
          this.emit(BrokerEvent.RECONNECTING);
          break;
      }
    }
  }
  
  /**
   * Handle errors and emit events
   */
  protected handleError(error: Error, context?: string): void {
    this.emit(BrokerEvent.ERROR, { error, context });
  }
  
  // Abstract methods that must be implemented by subclasses
  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract getAccounts(): Promise<string[]>;
  abstract getAccountSummary(accountId: string): Promise<AccountSummary>;
  abstract subscribeMarketData(request: MarketDataRequest): Promise<boolean>;
  abstract unsubscribeMarketData(instrumentId: string): Promise<boolean>;
  abstract getQuote(instrumentId: string): Promise<MarketQuote>;
  abstract submitOrder(request: OrderRequest): Promise<Order>;
  abstract cancelOrder(request: CancelOrderRequest): Promise<boolean>;
  abstract modifyOrder(request: ModifyOrderRequest): Promise<Order>;
  abstract getOrder(orderId: string): Promise<Order | null>;
  abstract getOpenOrders(accountId?: string): Promise<Order[]>;
  abstract getOrderHistory(accountId?: string, since?: Date): Promise<Order[]>;
  abstract getExecutions(orderId?: string, accountId?: string, since?: Date): Promise<Execution[]>;
  abstract getPositions(accountId?: string): Promise<Position[]>;
  abstract closePositions(accountId: string, instrumentId?: string): Promise<boolean>;
}
