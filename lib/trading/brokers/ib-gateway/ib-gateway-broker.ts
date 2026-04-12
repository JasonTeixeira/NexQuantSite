/**
 * 🌐 INTERACTIVE BROKERS GATEWAY CONNECTOR
 * Implementation of the broker interface for Interactive Brokers Gateway
 */

import { EventEmitter } from 'events';
import {
  BaseBroker,
  BrokerConfig,
  BrokerConnectionStatus,
  BrokerEvent,
  MarketDataRequest,
  MarketQuote,
} from '@/lib/trading/brokers/broker-interface';
import {
  OrderRequest,
  Order,
  CancelOrderRequest,
  ModifyOrderRequest,
  Execution,
  Position,
  AccountSummary,
  OrderStatus,
  OrderType,
  OrderSide,
  TimeInForce,
} from '@/lib/shared/trading/order-types';
import { createComponentMonitor } from '@/lib/monitoring/index';

// This is a stub for the IB library which would need to be installed as a dependency
// @ts-ignore
declare module 'ib' {
  export default class IB extends EventEmitter {
    constructor(options?: {
      clientId?: number;
      host?: string;
      port?: number;
    });
    connect(): void;
    disconnect(): void;
    reqAccountSummary(reqId: number, group: string, tags: string): void;
    cancelAccountSummary(reqId: number): void;
    reqPositions(): void;
    cancelPositions(): void;
    reqOpenOrders(): void;
    reqAllOpenOrders(): void;
    reqExecutions(reqId: number, filter: any): void;
    reqMktData(
      tickerId: number,
      contract: any,
      genericTickList: string,
      snapshot: boolean,
      regulatorySnapshot: boolean
    ): void;
    cancelMktData(tickerId: number): void;
    placeOrder(orderId: number, contract: any, order: any): void;
    cancelOrder(orderId: number): void;
    reqIds(numIds: number): void;
    reqContractDetails(reqId: number, contract: any): void;
    reqGlobalCancel(): void;
    calculateImpliedVolatility(
      reqId: number,
      contract: any,
      optionPrice: number,
      underPrice: number
    ): void;
    calculateOptionPrice(
      reqId: number,
      contract: any,
      volatility: number,
      underPrice: number
    ): void;
    exerciseOptions(
      tickerId: number,
      contract: any,
      exerciseAction: number,
      exerciseQuantity: number,
      account: string,
      override: number
    ): void;
    reqHistoricalData(
      tickerId: number,
      contract: any,
      endDateTime: string,
      durationStr: string,
      barSizeSetting: string,
      whatToShow: string,
      useRTH: number,
      formatDate: number
    ): void;
    cancelHistoricalData(tickerId: number): void;
    reqRealTimeBars(
      tickerId: number,
      contract: any,
      barSize: number,
      whatToShow: string,
      useRTH: boolean
    ): void;
    cancelRealTimeBars(tickerId: number): void;
    reqScannerParameters(): void;
    reqScannerSubscription(
      tickerId: number,
      subscription: any,
      scannerSubscriptionOptions: any
    ): void;
    cancelScannerSubscription(tickerId: number): void;
    reqMktDepth(
      tickerId: number,
      contract: any,
      numRows: number,
      smartDepthMktDataOptions: any
    ): void;
    cancelMktDepth(tickerId: number, isSmartDepth: boolean): void;
    reqNewsBulletins(allMsgs: boolean): void;
    cancelNewsBulletins(): void;
    setServerLogLevel(logLevel: number): void;
    reqAutoOpenOrders(bAutoBind: boolean): void;
    reqFundamentalData(reqId: number, contract: any, reportType: string): void;
    cancelFundamentalData(reqId: number): void;
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    removeListener(event: string, listener: (...args: any[]) => void): this;
  }
}

/**
 * Interactive Brokers contract representation
 */
interface IBContract {
  symbol: string;
  secType: string;
  exchange: string;
  currency: string;
  expiry?: string;
  strike?: number;
  right?: string;
  multiplier?: string;
  localSymbol?: string;
  primaryExch?: string;
  tradingClass?: string;
  includeExpired?: boolean;
  secIdType?: string;
  secId?: string;
}

/**
 * Interactive Brokers order representation
 */
interface IBOrder {
  action: string;
  totalQuantity: number;
  orderType: string;
  lmtPrice?: number;
  auxPrice?: number;
  tif?: string;
  outsideRth?: boolean;
  transmit?: boolean;
  parentId?: number;
  ocaGroup?: string;
  ocaType?: number;
  orderRef?: string;
  account?: string;
  openClose?: string;
  origin?: number;
  clientId?: number;
  permId?: number;
  [key: string]: any;
}

/**
 * Interactive Brokers Gateway specific configuration
 */
export interface IBGatewayConfig extends BrokerConfig {
  clientId?: number;
  defaultExchange?: string;
  defaultCurrency?: string;
}

/**
 * Implementation of the BrokerInterface for Interactive Brokers Gateway
 */
export class IBGatewayBroker extends BaseBroker {
  private ibApi: any = null; // Will be initialized with the IB API
  private ibConfig: IBGatewayConfig;
  private orderIdCounter: number = 0;
  private nextValidOrderId: number = 0;
  private requestIdCounter: number = 1;
  private contractDetailsCache: Map<string, any> = new Map();
  private marketDataSubscriptions: Map<string, number> = new Map();
  private accountSummaryCache: Map<string, AccountSummary> = new Map();
  private positionsCache: Map<string, Position> = new Map();
  private ordersCache: Map<string, Order> = new Map();
  private ibOrderIdMap: Map<number, string> = new Map(); // Maps IB order ID to our order ID
  private monitor = createComponentMonitor('ib-gateway-broker');

  constructor() {
    super('ib-gateway', 'Interactive Brokers Gateway');
  }

  /**
   * Configure the broker with connection settings
   */
  configure(config: IBGatewayConfig): void {
    super.configure(config);
    this.ibConfig = {
      ...config,
      clientId: config.clientId || 0,
      defaultExchange: config.defaultExchange || 'SMART',
      defaultCurrency: config.defaultCurrency || 'USD',
    };
  }

  /**
   * Connect to IB Gateway
   */
  async connect(): Promise<boolean> {
    try {
      this.monitor.startMeasurement('connect');
      this.updateConnectionStatus(BrokerConnectionStatus.CONNECTING);

      // If we're already connected, return immediately
      if (this.ibApi && this.connectionStatus === BrokerConnectionStatus.CONNECTED) {
        return true;
      }

      // Load the IB API dynamically (it might need to be installed separately)
      try {
        // In a real implementation, we would use:
        // const IB = (await import('ib')).default;
        // For now, we mock it:
        const IB = class MockIB extends EventEmitter {
          connect() {
            setTimeout(() => this.emit('connected'), 100);
          }
          disconnect() {}
          reqIds() {}
          reqOpenOrders() {}
          reqPositions() {}
          reqAccountSummary() {}
          // Add more methods as needed
        };
        
        this.ibApi = new IB({
          clientId: this.ibConfig.clientId,
          host: this.ibConfig.host || 'localhost',
          port: this.ibConfig.port || 4001, // 4001 for IB Gateway, 7496 for TWS
        });
      } catch (error) {
        throw new Error('Failed to load IB API: ' + error);
      }

      // Set up event listeners
      this.setupEventListeners();

      // Connect to IB Gateway
      this.ibApi.connect();

      // Wait for connected event
      return new Promise((resolve) => {
        // Set a timeout in case connection doesn't complete
        const timeout = setTimeout(() => {
          this.updateConnectionStatus(BrokerConnectionStatus.ERROR);
          resolve(false);
        }, 30000);

        // Listen for connected event
        this.once('connected', () => {
          clearTimeout(timeout);
          // Request the next valid order ID
          this.ibApi.reqIds(1);
          // Get open orders
          this.ibApi.reqOpenOrders();
          // Get positions
          this.ibApi.reqPositions();
          // Request account summary
          this.requestAccountSummary();
          this.monitor.endMeasurement('connect');
          resolve(true);
        });

        // Listen for error event
        this.once('error', (error) => {
          clearTimeout(timeout);
          this.updateConnectionStatus(BrokerConnectionStatus.ERROR);
          this.monitor.reportError('connect', new Error('Connection error: ' + error));
          resolve(false);
        });
      });
    } catch (error) {
      this.updateConnectionStatus(BrokerConnectionStatus.ERROR);
      this.monitor.reportError('connect', error as Error);
      return false;
    }
  }

  /**
   * Disconnect from IB Gateway
   */
  async disconnect(): Promise<void> {
    try {
      this.monitor.startMeasurement('disconnect');
      if (!this.ibApi) {
        return;
      }

      // Cancel all subscriptions
      this.ibApi.cancelPositions();
      this.ibApi.cancelAccountSummary(1);
      
      // Cancel all market data subscriptions
      for (const tickerId of this.marketDataSubscriptions.values()) {
        this.ibApi.cancelMktData(tickerId);
      }
      this.marketDataSubscriptions.clear();

      // Disconnect from IB Gateway
      this.ibApi.disconnect();
      this.updateConnectionStatus(BrokerConnectionStatus.DISCONNECTED);
      this.monitor.endMeasurement('disconnect');
    } catch (error) {
      this.monitor.reportError('disconnect', error as Error);
      throw error;
    }
  }

  /**
   * Get list of available accounts
   */
  async getAccounts(): Promise<string[]> {
    try {
      this.monitor.startMeasurement('get_accounts');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // If we already have accounts cached, return them
      if (this._accounts.length > 0) {
        return [...this._accounts];
      }

      // Request account summary to get accounts
      await this.requestAccountSummary();
      
      this.monitor.endMeasurement('get_accounts');
      return [...this._accounts];
    } catch (error) {
      this.monitor.reportError('get_accounts', error as Error);
      throw error;
    }
  }

  /**
   * Get detailed account information
   */
  async getAccountSummary(accountId: string): Promise<AccountSummary> {
    try {
      this.monitor.startMeasurement('get_account_summary');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // If we have the account summary cached, return it
      if (this.accountSummaryCache.has(accountId)) {
        return this.accountSummaryCache.get(accountId)!;
      }

      // Request account summary
      await this.requestAccountSummary();

      // Wait for account summary to be cached
      if (!this.accountSummaryCache.has(accountId)) {
        throw new Error(`Account summary not available for ${accountId}`);
      }

      this.monitor.endMeasurement('get_account_summary');
      return this.accountSummaryCache.get(accountId)!;
    } catch (error) {
      this.monitor.reportError('get_account_summary', error as Error);
      throw error;
    }
  }

  /**
   * Subscribe to market data for an instrument
   */
  async subscribeMarketData(request: MarketDataRequest): Promise<boolean> {
    try {
      this.monitor.startMeasurement('subscribe_market_data');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Check if we're already subscribed
      if (this.marketDataSubscriptions.has(request.instrumentId)) {
        return true;
      }

      // Get contract details
      const contract = await this.getContract(request.instrumentId);
      if (!contract) {
        throw new Error(`Contract details not found for ${request.instrumentId}`);
      }

      // Generate a request ID
      const tickerId = this.getNextRequestId();

      // Subscribe to market data
      this.ibApi.reqMktData(
        tickerId,
        contract,
        '', // genericTickList (empty for all ticks)
        false, // snapshot (false for continuous data)
        false // regulatorySnapshot
      );

      // Store subscription
      this.marketDataSubscriptions.set(request.instrumentId, tickerId);

      this.monitor.endMeasurement('subscribe_market_data');
      return true;
    } catch (error) {
      this.monitor.reportError('subscribe_market_data', error as Error);
      return false;
    }
  }

  /**
   * Unsubscribe from market data for an instrument
   */
  async unsubscribeMarketData(instrumentId: string): Promise<boolean> {
    try {
      this.monitor.startMeasurement('unsubscribe_market_data');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Check if we're subscribed
      if (!this.marketDataSubscriptions.has(instrumentId)) {
        return true;
      }

      // Get ticket ID
      const tickerId = this.marketDataSubscriptions.get(instrumentId)!;

      // Unsubscribe from market data
      this.ibApi.cancelMktData(tickerId);

      // Remove subscription
      this.marketDataSubscriptions.delete(instrumentId);

      this.monitor.endMeasurement('unsubscribe_market_data');
      return true;
    } catch (error) {
      this.monitor.reportError('unsubscribe_market_data', error as Error);
      return false;
    }
  }

  /**
   * Get latest quote for an instrument
   */
  async getQuote(instrumentId: string): Promise<MarketQuote> {
    try {
      this.monitor.startMeasurement('get_quote');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Subscribe to market data if not already subscribed
      if (!this.marketDataSubscriptions.has(instrumentId)) {
        await this.subscribeMarketData({ instrumentId });
      }

      // Wait for market data to be received
      // In a real implementation, we would cache the market data
      // and return it immediately if available
      return new Promise((resolve) => {
        const tickerId = this.marketDataSubscriptions.get(instrumentId)!;
        let bid: number | undefined;
        let ask: number | undefined;
        let last: number | undefined;
        let bidSize: number | undefined;
        let askSize: number | undefined;
        let lastSize: number | undefined;
        let volume: number | undefined;

        // Set a timeout
        const timeout = setTimeout(() => {
          // Even if we time out, return whatever data we have
          resolve({
            instrumentId,
            bid,
            ask,
            last,
            bidSize,
            askSize,
            lastSize,
            volume,
            timestamp: new Date(),
          });
        }, 5000);

        // Listen for tick events
        const tickHandler = (tickType: number, price: number, size: number, tickerId: number) => {
          if (this.marketDataSubscriptions.get(instrumentId) !== tickerId) {
            return;
          }

          // Handle different tick types
          switch (tickType) {
            case 1: // Bid
              bid = price;
              break;
            case 2: // Ask
              ask = price;
              break;
            case 4: // Last
              last = price;
              break;
            case 0: // Bid size
              bidSize = size;
              break;
            case 3: // Ask size
              askSize = size;
              break;
            case 5: // Last size
              lastSize = size;
              break;
            case 8: // Volume
              volume = size;
              break;
          }

          // If we have enough data, resolve
          if (bid !== undefined && ask !== undefined && last !== undefined) {
            clearTimeout(timeout);
            this.ibApi.removeListener('tickPrice', tickHandler);
            this.ibApi.removeListener('tickSize', tickHandler);
            
            resolve({
              instrumentId,
              bid,
              ask,
              last,
              bidSize,
              askSize,
              lastSize,
              volume,
              timestamp: new Date(),
            });
          }
        };

        this.ibApi.on('tickPrice', tickHandler);
        this.ibApi.on('tickSize', tickHandler);
      });
    } catch (error) {
      this.monitor.reportError('get_quote', error as Error);
      throw error;
    } finally {
      this.monitor.endMeasurement('get_quote');
    }
  }

  /**
   * Submit a new order
   */
  async submitOrder(request: OrderRequest): Promise<Order> {
    try {
      this.monitor.startMeasurement('submit_order');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Get contract details
      const contract = await this.getContract(request.instrumentId);
      if (!contract) {
        throw new Error(`Contract details not found for ${request.instrumentId}`);
      }

      // Convert our order request to IB order
      const ibOrder = this.createIBOrder(request);

      // Generate an order ID if we don't have one
      if (!request.metadata?.orderId) {
        request.metadata = {
          ...request.metadata,
          orderId: this.getNextOrderId(),
        };
      }

      // Create our order object
      const order: Order = {
        id: request.metadata?.orderId,
        brokerId: request.metadata?.orderId.toString(),
        accountId: request.accountId || this._accounts[0],
        instrumentId: request.instrumentId,
        side: request.side,
        type: request.type,
        quantity: request.quantity,
        price: request.price,
        stopPrice: request.stopPrice,
        timeInForce: request.timeInForce || TimeInForce.DAY,
        status: OrderStatus.PENDING,
        filledQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: request.metadata || {},
      };

      // Store the order
      this.ordersCache.set(order.id!, order);

      // Map IB order ID to our order ID
      this.ibOrderIdMap.set(parseInt(request.metadata?.orderId), order.id!);

      // Submit the order
      this.ibApi.placeOrder(parseInt(request.metadata?.orderId), contract, ibOrder);

      // Update status
      order.status = OrderStatus.SUBMITTED;
      order.submittedAt = new Date();
      order.updatedAt = new Date();

      // Emit event
      this.emit(BrokerEvent.ORDER_SUBMITTED, order);

      this.monitor.endMeasurement('submit_order');
      return order;
    } catch (error) {
      this.monitor.reportError('submit_order', error as Error);
      throw error;
    }
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(request: CancelOrderRequest): Promise<boolean> {
    try {
      this.monitor.startMeasurement('cancel_order');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Get the order
      const order = this.ordersCache.get(request.orderId);
      if (!order) {
        throw new Error(`Order not found: ${request.orderId}`);
      }

      // Get IB order ID
      const ibOrderId = parseInt(order.brokerId || order.id!);

      // Cancel the order
      this.ibApi.cancelOrder(ibOrderId);

      // Update status (will be confirmed by IB Gateway event)
      const updatedOrder = { ...order, status: OrderStatus.CANCELED, updatedAt: new Date() };
      this.ordersCache.set(request.orderId, updatedOrder);

      this.monitor.endMeasurement('cancel_order');
      return true;
    } catch (error) {
      this.monitor.reportError('cancel_order', error as Error);
      return false;
    }
  }

  /**
   * Modify an existing order
   */
  async modifyOrder(request: ModifyOrderRequest): Promise<Order> {
    try {
      this.monitor.startMeasurement('modify_order');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Get the order
      const order = this.ordersCache.get(request.orderId);
      if (!order) {
        throw new Error(`Order not found: ${request.orderId}`);
      }

      // Get contract details
      const contract = await this.getContract(order.instrumentId);
      if (!contract) {
        throw new Error(`Contract details not found for ${order.instrumentId}`);
      }

      // Create updated order
      const updatedOrder: Order = {
        ...order,
        quantity: request.quantity !== undefined ? request.quantity : order.quantity,
        price: request.price !== undefined ? request.price : order.price,
        stopPrice: request.stopPrice !== undefined ? request.stopPrice : order.stopPrice,
        timeInForce: request.timeInForce || order.timeInForce,
        updatedAt: new Date(),
      };

      // Convert to IB order
      const ibOrder = this.createIBOrderFromOrder(updatedOrder);

      // Get IB order ID
      const ibOrderId = parseInt(order.brokerId || order.id!);

      // Cancel the existing order and place a new one
      this.ibApi.cancelOrder(ibOrderId);

      // Generate a new order ID
      const newIbOrderId = this.getNextOrderId();

      // Update our order with the new ID
      updatedOrder.brokerId = newIbOrderId.toString();
      this.ordersCache.set(request.orderId, updatedOrder);

      // Map new IB order ID to our order ID
      this.ibOrderIdMap.set(newIbOrderId, request.orderId);

      // Place the new order
      this.ibApi.placeOrder(newIbOrderId, contract, ibOrder);

      this.monitor.endMeasurement('modify_order');
      return updatedOrder;
    } catch (error) {
      this.monitor.reportError('modify_order', error as Error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Check if we have the order cached
      if (this.ordersCache.has(orderId)) {
        return this.ordersCache.get(orderId) || null;
      }

      // We don't have the order, try to refresh from IB Gateway
      this.ibApi.reqOpenOrders();

      // Wait a bit for the orders to be refreshed
      await new Promise(resolve => setTimeout(resolve, 1000));

      return this.ordersCache.get(orderId) || null;
    } catch (error) {
      this.monitor.reportError('get_order', error as Error);
      return null;
    }
  }

  /**
   * Get all open orders for an account
   */
  async getOpenOrders(accountId?: string): Promise<Order[]> {
    try {
      this.monitor.startMeasurement('get_open_orders');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Request open orders from IB Gateway
      this.ibApi.reqOpenOrders();

      // Wait a bit for the orders to be refreshed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter orders by account if specified
      const orders = Array.from(this.ordersCache.values()).filter(order => {
        if (accountId && order.accountId !== accountId) {
          return false;
        }
        return order.status === OrderStatus.SUBMITTED || 
               order.status === OrderStatus.PARTIALLY_FILLED || 
               order.status === OrderStatus.ACKNOWLEDGED;
      });

      this.monitor.endMeasurement('get_open_orders');
      return orders;
    } catch (error) {
      this.monitor.reportError('get_open_orders', error as Error);
      return [];
    }
  }

  /**
   * Get order history for an account
   */
  async getOrderHistory(accountId?: string, since?: Date): Promise<Order[]> {
    try {
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Filter orders by account and date if specified
      const orders = Array.from(this.ordersCache.values()).filter(order => {
        if (accountId && order.accountId !== accountId) {
          return false;
        }
        if (since && order.createdAt && order.createdAt < since) {
          return false;
        }
        return order.status === OrderStatus.FILLED || 
               order.status === OrderStatus.CANCELED || 
               order.status === OrderStatus.REJECTED || 
               order.status === OrderStatus.EXPIRED;
      });

      return orders;
    } catch (error) {
      this.monitor.reportError('get_order_history', error as Error);
      return [];
    }
  }

  /**
   * Get executions (fills) for an account or order
   */
  async getExecutions(orderId?: string, accountId?: string, since?: Date): Promise<Execution[]> {
    try {
      this.monitor.startMeasurement('get_executions');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Request executions from IB Gateway
      const execFilter: any = {};
      if (accountId) {
        execFilter.acctCode = accountId;
      }
      if (orderId) {
        const order = this.ordersCache.get(orderId);
        if (order && order.brokerId) {
          execFilter.orderId = parseInt(order.brokerId);
        }
      }
      if (since) {
        execFilter.time = since.toISOString().split('T')[0];
      }

      const reqId = this.getNextRequestId();
      this.ibApi.reqExecutions(reqId, execFilter);

      // Wait for executions to be received
      // In a real implementation, we would cache executions
      // and filter them here
      return new Promise((resolve) => {
        setTimeout(() => {
          // Return empty array for now
          // In a real implementation, we would track executions
          // and return them here
          resolve([]);
        }, 1000);
      });
    } catch (error) {
      this.monitor.reportError('get_executions', error as Error);
      return [];
    } finally {
      this.monitor.endMeasurement('get_executions');
    }
  }

  /**
   * Get positions for an account
   */
  async getPositions(accountId?: string): Promise<Position[]> {
    try {
      this.monitor.startMeasurement('get_positions');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Request positions from IB Gateway
      this.ibApi.reqPositions();

      // Wait a bit for positions to be refreshed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter positions by account if specified
      const positions = Array.from(this.positionsCache.values()).filter(position => {
        if (accountId && position.accountId !== accountId) {
          return false;
        }
        return true;
      });

      this.monitor.endMeasurement('get_positions');
      return positions;
    } catch (error) {
      this.monitor.reportError('get_positions', error as Error);
      return [];
    }
  }

  /**
   * Close all positions for an account or a specific position
   */
  async closePositions(accountId: string, instrumentId?: string): Promise<boolean> {
    try {
      this.monitor.startMeasurement('close_positions');
      if (!this.ensureConnected()) {
        throw new Error('Not connected to IB Gateway');
      }

      // Get positions
      const positions = await this.getPositions(accountId);
      
      // Filter by instrument if specified
      const positionsToClose = instrumentId
        ? positions.filter(p => p.instrumentId === instrumentId)
        : positions;

      // Create market orders to close each position
      for (const position of positionsToClose) {
        // Skip flat positions
        if (position.quantity === 0) {
          continue;
        }

        // Create order request
        const orderRequest: OrderRequest = {
          instrumentId: position.instrumentId,
          side: position.quantity > 0 ? OrderSide.SELL : OrderSide.BUY,
          type: OrderType.MARKET,
          quantity: Math.abs(position.quantity),
          timeInForce: TimeInForce.DAY,
          accountId: position.accountId,
          metadata: {
            isClosingPosition: true,
          },
        };

        // Submit the order
        await this.submitOrder(orderRequest);
      }

      this.monitor.endMeasurement('close_positions');
      return true;
    } catch (error) {
      this.monitor.reportError('close_positions', error as Error);
      return false;
    }
  }

  /**
   * Set up event listeners for IB Gateway events
   */
  private setupEventListeners(): void {
    if (!this.ibApi) {
      return;
    }

    // Connection events
    this.ibApi.on('connected', () => {
      this.updateConnectionStatus(BrokerConnectionStatus.CONNECTED);
      this.emit(Broker
