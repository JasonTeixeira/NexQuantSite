/**
 * 📊 EXECUTION ENGINE
 * Core service for translating signals to orders and managing their lifecycle
 */

import { EventEmitter } from 'events';
import {
  OrderRequest,
  Order,
  CancelOrderRequest,
  ModifyOrderRequest,
  Execution,
  Position,
  OrderSide,
  OrderType,
  TimeInForce,
  OrderStatus,
} from '@/lib/shared/trading/order-types';
import { TradingSignal, SignalType } from '@/lib/shared/trading/strategy-types';
import {
  BrokerInterface,
  BrokerEvent,
  BrokerConnectionStatus,
} from '@/lib/trading/brokers/broker-interface';
import { createComponentMonitor } from '@/lib/monitoring/index';

/**
 * Execution engine events
 */
export enum ExecutionEngineEvent {
  ORDER_CREATED = 'order_created',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_UPDATED = 'order_updated',
  ORDER_FILLED = 'order_filled',
  ORDER_REJECTED = 'order_rejected',
  ORDER_CANCELED = 'order_canceled',
  EXECUTION_RECEIVED = 'execution_received',
  POSITION_UPDATED = 'position_updated',
  ERROR = 'error',
}

/**
 * Execution engine configuration
 */
export interface ExecutionEngineConfig {
  defaultAccountId?: string;
  autoSubmit?: boolean;  // Whether to automatically submit orders once created
  defaultTimeInForce?: TimeInForce;
  defaultQuantity?: number;
  riskChecks?: boolean;
  validateSignals?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Execution engine service for translating signals to orders and managing order lifecycle
 */
export class ExecutionEngine extends EventEmitter {
  private broker: BrokerInterface;
  private config: ExecutionEngineConfig;
  private pendingOrders: Map<string, Order> = new Map();
  private activeOrders: Map<string, Order> = new Map();
  private completedOrders: Map<string, Order> = new Map();
  private positions: Map<string, Position> = new Map();
  private executions: Map<string, Execution> = new Map();
  private signalToOrderMap: Map<string, string> = new Map();
  private monitor = createComponentMonitor('execution-engine');
  
  constructor(broker: BrokerInterface, config: ExecutionEngineConfig = {}) {
    super();
    this.broker = broker;
    this.config = {
      autoSubmit: true,
      defaultTimeInForce: TimeInForce.DAY,
      riskChecks: true,
      validateSignals: true,
      logLevel: 'info',
      ...config,
    };
    
    this.setupBrokerListeners();
  }
  
  /**
   * Setup event listeners for broker events
   */
  private setupBrokerListeners(): void {
    // Order status updates
    this.broker.on(BrokerEvent.ORDER_SUBMITTED, this.handleOrderSubmitted.bind(this));
    this.broker.on(BrokerEvent.ORDER_ACKNOWLEDGED, this.handleOrderUpdated.bind(this));
    this.broker.on(BrokerEvent.ORDER_FILLED, this.handleOrderFilled.bind(this));
    this.broker.on(BrokerEvent.ORDER_PARTIALLY_FILLED, this.handleOrderUpdated.bind(this));
    this.broker.on(BrokerEvent.ORDER_CANCELED, this.handleOrderCanceled.bind(this));
    this.broker.on(BrokerEvent.ORDER_REJECTED, this.handleOrderRejected.bind(this));
    this.broker.on(BrokerEvent.ORDER_EXPIRED, this.handleOrderUpdated.bind(this));
    
    // Executions
    this.broker.on(BrokerEvent.EXECUTION, this.handleExecution.bind(this));
    
    // Position updates
    this.broker.on(BrokerEvent.POSITION_OPENED, this.handlePositionUpdate.bind(this));
    this.broker.on(BrokerEvent.POSITION_UPDATED, this.handlePositionUpdate.bind(this));
    this.broker.on(BrokerEvent.POSITION_CLOSED, this.handlePositionUpdate.bind(this));
    
    // Errors
    this.broker.on(BrokerEvent.ERROR, this.handleBrokerError.bind(this));
  }
  
  /**
   * Create an order from a trading signal
   */
  public createOrderFromSignal(signal: TradingSignal, accountId?: string): Order | null {
    try {
      this.monitor.startMeasurement('create_order_from_signal');
      
      // Validate signal if enabled
      if (this.config.validateSignals && !this.validateSignal(signal)) {
        this.monitor.reportError('create_order_from_signal', new Error('Invalid signal'), {
          context: { signal }
        });
        return null;
      }
      
      // Determine order side based on signal type
      let side: OrderSide;
      switch (signal.type) {
        case SignalType.LONG:
          side = OrderSide.BUY;
          break;
        case SignalType.SHORT:
          side = OrderSide.SELL;
          break;
        case SignalType.EXIT:
          // For exit signals, we need to check current position direction
          const position = this.getPositionByInstrument(signal.instrumentId);
          if (!position) {
            this.monitor.reportError('create_order_from_signal', new Error('No position to exit'), {
              context: { signal }
            });
            return null;
          }
          side = position.quantity > 0 ? OrderSide.SELL : OrderSide.BUY;
          break;
        case SignalType.NEUTRAL:
          // Neutral signals don't result in orders
          return null;
        default:
          this.monitor.reportError('create_order_from_signal', new Error('Unknown signal type'), {
            context: { signal }
          });
          return null;
      }
      
      // Determine order type and parameters
      const type = signal.price ? OrderType.LIMIT : OrderType.MARKET;
      
      // Get quantity either from signal, config, or default
      const quantity = signal.metadata?.quantity || this.config.defaultQuantity || 1;
      
      // Prepare order request
      const orderRequest: OrderRequest = {
        instrumentId: signal.instrumentId,
        side,
        type,
        quantity,
        price: signal.price,
        stopPrice: signal.type === SignalType.SHORT ? signal.targetPrice : signal.stopPrice,
        timeInForce: this.config.defaultTimeInForce || TimeInForce.DAY,
        accountId: accountId || this.config.defaultAccountId || this.broker.accounts[0],
        strategyId: signal.strategyId,
        metadata: {
          signalId: signal.id,
          signalConfidence: signal.confidence,
          ...signal.metadata,
        },
      };
      
      // Perform risk checks if enabled
      if (this.config.riskChecks && !this.performRiskChecks(orderRequest)) {
        this.monitor.reportError('create_order_from_signal', new Error('Risk check failed'), {
          context: { orderRequest }
        });
        return null;
      }
      
      // Create order
      const order: Order = {
        ...orderRequest,
        accountId: orderRequest.accountId!,
        status: OrderStatus.PENDING,
        filledQuantity: 0,
        timeInForce: orderRequest.timeInForce || TimeInForce.DAY,
        metadata: orderRequest.metadata || {},
      };
      
      // Generate internal ID if not provided
      if (!order.id) {
        order.id = this.generateOrderId();
      }
      
      // Store in pending orders
      this.pendingOrders.set(order.id, order);
      
      // Map signal to order
      if (signal.id) {
        this.signalToOrderMap.set(signal.id, order.id);
      }
      
      this.emit(ExecutionEngineEvent.ORDER_CREATED, order);
      
      // Auto-submit if enabled
      if (this.config.autoSubmit) {
        this.submitOrder(order.id);
      }
      
      this.monitor.endMeasurement('create_order_from_signal');
      return order;
    } catch (error) {
      this.monitor.reportError('create_order_from_signal', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'createOrderFromSignal',
        error,
        signal,
      });
      return null;
    }
  }
  
  /**
   * Submit a pending order to the broker
   */
  public async submitOrder(orderId: string): Promise<Order | null> {
    try {
      this.monitor.startMeasurement('submit_order');
      
      // Find order in pending orders
      const order = this.pendingOrders.get(orderId);
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      
      // Check broker connection
      if (this.broker.connectionStatus !== BrokerConnectionStatus.CONNECTED) {
        throw new Error(`Broker not connected: ${this.broker.connectionStatus}`);
      }
      
      // Prepare order request
      const orderRequest: OrderRequest = {
        instrumentId: order.instrumentId,
        side: order.side,
        type: order.type,
        quantity: order.quantity,
        price: order.price,
        stopPrice: order.stopPrice,
        timeInForce: order.timeInForce,
        accountId: order.accountId,
        strategyId: order.strategyId,
        metadata: order.metadata,
      };
      
      // Submit order to broker
      const submittedOrder = await this.broker.submitOrder(orderRequest);
      
      // Update local order with broker response
      const updatedOrder: Order = {
        ...order,
        ...submittedOrder,
        status: OrderStatus.SUBMITTED,
        submittedAt: new Date(),
      };
      
      // Move from pending to active orders
      this.pendingOrders.delete(orderId);
      this.activeOrders.set(updatedOrder.id!, updatedOrder);
      
      this.emit(ExecutionEngineEvent.ORDER_SUBMITTED, updatedOrder);
      
      this.monitor.endMeasurement('submit_order');
      return updatedOrder;
    } catch (error) {
      this.monitor.reportError('submit_order', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'submitOrder',
        error,
        orderId,
      });
      return null;
    }
  }
  
  /**
   * Cancel an active order
   */
  public async cancelOrder(orderId: string): Promise<boolean> {
    try {
      this.monitor.startMeasurement('cancel_order');
      
      // Find order in active orders
      const order = this.activeOrders.get(orderId);
      if (!order) {
        throw new Error(`Active order not found: ${orderId}`);
      }
      
      // Prepare cancel request
      const cancelRequest: CancelOrderRequest = {
        orderId: order.id!,
        brokerId: order.brokerId,
        accountId: order.accountId,
      };
      
      // Send cancel request to broker
      const success = await this.broker.cancelOrder(cancelRequest);
      
      if (success) {
        // Order will be updated when we receive the cancellation event from the broker
        this.monitor.trackMetric('order_cancel_requested', 1, 'count');
      }
      
      this.monitor.endMeasurement('cancel_order');
      return success;
    } catch (error) {
      this.monitor.reportError('cancel_order', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'cancelOrder',
        error,
        orderId,
      });
      return false;
    }
  }
  
  /**
   * Modify an active order
   */
  public async modifyOrder(
    orderId: string,
    modifications: Partial<{ quantity: number; price: number; stopPrice: number }>
  ): Promise<Order | null> {
    try {
      this.monitor.startMeasurement('modify_order');
      
      // Find order in active orders
      const order = this.activeOrders.get(orderId);
      if (!order) {
        throw new Error(`Active order not found: ${orderId}`);
      }
      
      // Prepare modify request
      const modifyRequest: ModifyOrderRequest = {
        orderId: order.id!,
        brokerId: order.brokerId,
        ...modifications,
      };
      
      // Send modify request to broker
      const modifiedOrder = await this.broker.modifyOrder(modifyRequest);
      
      // Update local order
      this.activeOrders.set(modifiedOrder.id!, modifiedOrder);
      
      this.emit(ExecutionEngineEvent.ORDER_UPDATED, modifiedOrder);
      
      this.monitor.endMeasurement('modify_order');
      return modifiedOrder;
    } catch (error) {
      this.monitor.reportError('modify_order', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'modifyOrder',
        error,
        orderId,
        modifications,
      });
      return null;
    }
  }
  
  /**
   * Get all orders
   */
  public getAllOrders(): Order[] {
    return [
      ...Array.from(this.pendingOrders.values()),
      ...Array.from(this.activeOrders.values()),
      ...Array.from(this.completedOrders.values()),
    ];
  }
  
  /**
   * Get order by ID
   */
  public getOrder(orderId: string): Order | undefined {
    return (
      this.pendingOrders.get(orderId) ||
      this.activeOrders.get(orderId) ||
      this.completedOrders.get(orderId)
    );
  }
  
  /**
   * Get order created from a signal
   */
  public getOrderBySignal(signalId: string): Order | undefined {
    const orderId = this.signalToOrderMap.get(signalId);
    if (!orderId) return undefined;
    return this.getOrder(orderId);
  }
  
  /**
   * Get all positions
   */
  public getAllPositions(): Position[] {
    return Array.from(this.positions.values());
  }
  
  /**
   * Get position by ID
   */
  public getPosition(positionId: string): Position | undefined {
    return this.positions.get(positionId);
  }
  
  /**
   * Get position by instrument
   */
  public getPositionByInstrument(instrumentId: string): Position | undefined {
    return Array.from(this.positions.values()).find(
      (position) => position.instrumentId === instrumentId
    );
  }
  
  /**
   * Get all executions
   */
  public getAllExecutions(): Execution[] {
    return Array.from(this.executions.values());
  }
  
  /**
   * Get executions for an order
   */
  public getExecutionsByOrder(orderId: string): Execution[] {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.orderId === orderId
    );
  }
  
  /**
   * Sync data with broker
   */
  public async syncWithBroker(accountId: string): Promise<void> {
    try {
      // Sync orders
      const openOrders = await this.broker.getOpenOrders(accountId);
      for (const order of openOrders) {
        if (order.id) {
          if (this.activeOrders.has(order.id)) {
            // Update existing order
            this.activeOrders.set(order.id, order);
          } else {
            // Add new order
            this.activeOrders.set(order.id, order);
          }
        }
      }
      
      // Sync positions
      const positions = await this.broker.getPositions(accountId);
      for (const position of positions) {
        if (position.id) {
          this.positions.set(position.id, position);
        }
      }
      
      // Emit update events
      this.emit('sync_complete', { accountId });
    } catch (error) {
      this.monitor.reportError('sync_with_broker', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'syncWithBroker',
        error,
        accountId,
      });
    }
  }
  
  /**
   * Close all positions
   */
  public async closeAllPositions(accountId: string): Promise<boolean> {
    try {
      return await this.broker.closePositions(accountId);
    } catch (error) {
      this.monitor.reportError('close_all_positions', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'closeAllPositions',
        error,
        accountId,
      });
      return false;
    }
  }
  
  /**
   * Close a specific position
   */
  public async closePosition(accountId: string, instrumentId: string): Promise<boolean> {
    try {
      return await this.broker.closePositions(accountId, instrumentId);
    } catch (error) {
      this.monitor.reportError('close_position', error as Error);
      this.emit(ExecutionEngineEvent.ERROR, {
        context: 'closePosition',
        error,
        accountId,
        instrumentId,
      });
      return false;
    }
  }
  
  /**
   * Reset the execution engine state
   */
  public reset(): void {
    this.pendingOrders.clear();
    this.activeOrders.clear();
    this.completedOrders.clear();
    this.positions.clear();
    this.executions.clear();
    this.signalToOrderMap.clear();
  }
  
  /**
   * Generate a unique order ID
   */
  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  
  /**
   * Validate a trading signal
   */
  private validateSignal(signal: TradingSignal): boolean {
    // Basic validation
    if (!signal.instrumentId || !signal.type) {
      return false;
    }
    
    // Type-specific validation
    switch (signal.type) {
      case SignalType.LONG:
      case SignalType.SHORT:
        // Confidence should be present and between 0 and 1
        if (typeof signal.confidence !== 'number' || signal.confidence < 0 || signal.confidence > 1) {
          return false;
        }
        break;
      case SignalType.EXIT:
        // For exit signals, we should have a position to exit
        if (!this.getPositionByInstrument(signal.instrumentId)) {
          return false;
        }
        break;
    }
    
    return true;
  }
  
  /**
   * Perform risk checks before submitting an order
   */
  private performRiskChecks(orderRequest: OrderRequest): boolean {
    // TODO: Implement risk checks like:
    // - Position size limits
    // - Exposure limits
    // - Maximum loss limits
    // - Concentration limits
    return true; // For now, pass all checks
  }
  
  /**
   * Handle order submitted event from broker
   */
  private handleOrderSubmitted(order: Order): void {
    if (!order.id) return;
    
    // Update local order
    const existingOrder = this.activeOrders.get(order.id);
    if (existingOrder) {
      const updatedOrder = { ...existingOrder, ...order };
      this.activeOrders.set(order.id, updatedOrder);
      this.emit(ExecutionEngineEvent.ORDER_UPDATED, updatedOrder);
    }
  }
  
  /**
   * Handle order updated event from broker
   */
  private handleOrderUpdated(order: Order): void {
    if (!order.id) return;
    
    // Update local order
    const existingOrder = this.activeOrders.get(order.id);
    if (existingOrder) {
      const updatedOrder = { ...existingOrder, ...order };
      this.activeOrders.set(order.id, updatedOrder);
      this.emit(ExecutionEngineEvent.ORDER_UPDATED, updatedOrder);
    }
  }
  
  /**
   * Handle order filled event from broker
   */
  private handleOrderFilled(order: Order): void {
    if (!order.id) return;
    
    // Move from active to completed orders
    this.activeOrders.delete(order.id);
    this.completedOrders.set(order.id, order);
    
    this.emit(ExecutionEngineEvent.ORDER_FILLED, order);
  }
  
  /**
   * Handle order canceled event from broker
   */
  private handleOrderCanceled(order: Order): void {
    if (!order.id) return;
    
    // Move from active to completed orders
    this.activeOrders.delete(order.id);
    this.completedOrders.set(order.id, order);
    
    this.emit(ExecutionEngineEvent.ORDER_CANCELED, order);
  }
  
  /**
   * Handle order rejected event from broker
   */
  private handleOrderRejected(order: Order): void {
    if (!order.id) return;
    
    // Move from active to completed orders
    this.activeOrders.delete(order.id);
    this.completedOrders.set(order.id, order);
    
    this.emit(ExecutionEngineEvent.ORDER_REJECTED, order);
  }
  
  /**
   * Handle execution event from broker
   */
  private handleExecution(execution: Execution): void {
    if (!execution.id) {
      execution.id = `exec-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Store execution
    this.executions.set(execution.id, execution);
    
    this.emit(ExecutionEngineEvent.EXECUTION_RECEIVED, execution);
  }
  
  /**
   * Handle position update event from broker
   */
  private handlePositionUpdate(position: Position): void {
    if (!position.id) return;
    
    // Update local position
    this.positions.set(position.id, position);
    
    this.emit(ExecutionEngineEvent.POSITION_UPDATED, position);
  }
  
  /**
   * Handle broker error event
   */
  private handleBrokerError(error: any): void {
    this.emit(ExecutionEngineEvent.ERROR, {
      context: 'brokerEvent',
      error,
    });
  }
}

/**
 * Create an execution engine instance
 */
export function createExecutionEngine(
  broker: BrokerInterface,
  config?: ExecutionEngineConfig
): ExecutionEngine {
  return new ExecutionEngine(broker, config);
}
