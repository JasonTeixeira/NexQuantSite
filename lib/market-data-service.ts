/**
 * 📈 Market Data Service
 * Provides access to market data from various sources
 */

import axios, { AxiosInstance } from 'axios';
import { reportError, withPerformanceTracking } from './monitoring';

// Types for market data
export interface MarketDataPoint {
  timestamp: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

export interface MarketDataBar extends MarketDataPoint {
  instrumentId: string;
  timeframe: string;
}

export interface QuoteData {
  instrumentId: string;
  bid: number;
  ask: number;
  timestamp: number;
  bidSize?: number;
  askSize?: number;
  provider?: string;
}

export enum MarketDataTimeframe {
  MINUTE_1 = '1m',
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  MINUTE_30 = '30m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  DAY_1 = '1d',
  WEEK_1 = '1w'
}

export type SubscriptionCallback = (data: QuoteData | MarketDataBar) => void;

// Market data source configuration
export interface MarketDataConfig {
  apiKey: string;
  apiSecret?: string;
  baseUrl: string;
  timeout?: number;
  provider: 'ALPHAVANTAGE' | 'POLYGON' | 'DATABENTO' | 'IEX' | 'CUSTOM';
}

/**
 * Market Data Service - handles market data retrieval and subscription
 */
export class MarketDataService {
  private static instance: MarketDataService;
  private client: AxiosInstance;
  private config: MarketDataConfig;
  private subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay
  private isConnecting = false;
  
  /**
   * Get singleton instance of MarketDataService
   */
  public static getInstance(config?: MarketDataConfig): MarketDataService {
    if (!MarketDataService.instance) {
      // Default configuration using environment variables
      const defaultConfig: MarketDataConfig = {
        apiKey: process.env.MARKET_DATA_API_KEY || '',
        apiSecret: process.env.MARKET_DATA_API_SECRET,
        baseUrl: process.env.MARKET_DATA_API_URL || '',
        timeout: 30000,
        provider: (process.env.MARKET_DATA_PROVIDER as any) || 'ALPHAVANTAGE'
      };

      MarketDataService.instance = new MarketDataService(config || defaultConfig);
    }
    return MarketDataService.instance;
  }
  
  private constructor(config: MarketDataConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      }
    });
  }

  /**
   * Get historical bars for an instrument
   * @param instrumentId The instrument ID
   * @param timeframe The timeframe to get bars for
   * @param startTime Start time (timestamp in ms)
   * @param endTime End time (timestamp in ms)
   * @param limit Maximum number of bars to return
   * @returns Array of market data bars
   */
  public async getHistoricalBars(
    instrumentId: string,
    timeframe: MarketDataTimeframe = MarketDataTimeframe.DAY_1,
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<MarketDataBar[]> {
    return withPerformanceTracking(
      async () => {
        try {
          const endpoint = this.getEndpointForHistoricalData(this.config.provider);
          
          const params: Record<string, any> = {
            symbol: instrumentId,
            interval: timeframe,
            limit,
          };
          
          if (startTime) {
            params.start = new Date(startTime).toISOString();
          }
          
          if (endTime) {
            params.end = new Date(endTime).toISOString();
          }
          
          const response = await this.client.get(endpoint, { params });
          
          return this.transformHistoricalData(response.data, instrumentId, timeframe);
        } catch (error) {
          reportError({
            component: 'MarketDataService',
            action: 'getHistoricalBars',
            error,
            context: {
              instrumentId,
              timeframe,
              startTime,
              endTime,
              limit
            }
          });
          
          throw error;
        }
      },
      'getHistoricalBars',
      { instrumentId, timeframe }
    );
  }

  /**
   * Get latest quote for an instrument
   * @param instrumentId The instrument ID
   * @returns The latest quote data
   */
  public async getQuote(instrumentId: string): Promise<QuoteData> {
    return withPerformanceTracking(
      async () => {
        try {
          const endpoint = this.getEndpointForQuoteData(this.config.provider);
          
          const params = {
            symbol: instrumentId
          };
          
          const response = await this.client.get(endpoint, { params });
          
          return this.transformQuoteData(response.data, instrumentId);
        } catch (error) {
          reportError({
            component: 'MarketDataService',
            action: 'getQuote',
            error,
            context: { instrumentId }
          });
          
          throw error;
        }
      },
      'getQuote',
      { instrumentId }
    );
  }

  /**
   * Subscribe to real-time quotes for an instrument
   * @param instrumentId The instrument ID
   * @param callback Callback function to receive updates
   * @returns Function to unsubscribe
   */
  public subscribeToQuotes(
    instrumentId: string,
    callback: SubscriptionCallback
  ): () => void {
    // Create a subscription key
    const key = `quote:${instrumentId}`;
    
    // Add subscription to map
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    
    this.subscriptions.get(key)?.add(callback);
    
    // Connect to WebSocket if not already connected
    this.ensureWebSocketConnection();
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(key);
        }
      }
      
      // If no more subscriptions, close WebSocket
      if (this.subscriptions.size === 0) {
        this.closeWebSocket();
      }
    };
  }

  /**
   * Subscribe to real-time bars for an instrument
   * @param instrumentId The instrument ID
   * @param timeframe The timeframe for bars
   * @param callback Callback function to receive updates
   * @returns Function to unsubscribe
   */
  public subscribeToBars(
    instrumentId: string,
    timeframe: MarketDataTimeframe,
    callback: SubscriptionCallback
  ): () => void {
    // Create a subscription key
    const key = `bar:${instrumentId}:${timeframe}`;
    
    // Add subscription to map
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    
    this.subscriptions.get(key)?.add(callback);
    
    // Connect to WebSocket if not already connected
    this.ensureWebSocketConnection();
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(key);
        }
      }
      
      // If no more subscriptions, close WebSocket
      if (this.subscriptions.size === 0) {
        this.closeWebSocket();
      }
    };
  }

  /**
   * Search for instruments by symbol or name
   * @param query The search query
   * @param limit Maximum number of results
   * @returns Array of matching instruments
   */
  public async searchInstruments(
    query: string,
    limit: number = 10
  ): Promise<any[]> {
    return withPerformanceTracking(
      async () => {
        try {
          const endpoint = this.getEndpointForSearch(this.config.provider);
          
          const params = {
            keywords: query,
            limit
          };
          
          const response = await this.client.get(endpoint, { params });
          
          return this.transformSearchResults(response.data);
        } catch (error) {
          reportError({
            component: 'MarketDataService',
            action: 'searchInstruments',
            error,
            context: { query, limit }
          });
          
          throw error;
        }
      },
      'searchInstruments',
      { query }
    );
  }

  /**
   * Ensure WebSocket connection is established
   */
  private ensureWebSocketConnection(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return;
    }
    
    if (this.isConnecting) {
      return;
    }
    
    this.isConnecting = true;
    
    try {
      // Close existing connection if any
      this.closeWebSocket();
      
      // Create new connection
      const wsUrl = this.getWebSocketUrl();
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = this.handleWebSocketOpen.bind(this);
      this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
      this.websocket.onclose = this.handleWebSocketClose.bind(this);
      this.websocket.onerror = this.handleWebSocketError.bind(this);
    } catch (error) {
      this.isConnecting = false;
      reportError({
        component: 'MarketDataService',
        action: 'ensureWebSocketConnection',
        error
      });
    }
  }

  /**
   * Close WebSocket connection
   */
  private closeWebSocket(): void {
    if (this.websocket) {
      try {
        this.websocket.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.websocket = null;
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleWebSocketOpen(): void {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    
    // Subscribe to all instruments
    this.sendSubscriptions();
  }

  /**
   * Handle WebSocket message event
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Determine message type and route to appropriate handlers
      if (data.type === 'quote') {
        this.handleQuoteUpdate(data);
      } else if (data.type === 'bar') {
        this.handleBarUpdate(data);
      }
    } catch (error) {
      reportError({
        component: 'MarketDataService',
        action: 'handleWebSocketMessage',
        error,
        context: { data: event.data }
      });
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleWebSocketClose(event: CloseEvent): void {
    this.isConnecting = false;
    
    // If we have subscriptions, try to reconnect
    if (this.subscriptions.size > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      
      setTimeout(() => {
        this.ensureWebSocketConnection();
      }, this.reconnectDelay);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleWebSocketError(event: Event): void {
    this.isConnecting = false;
    
    reportError({
      component: 'MarketDataService',
      action: 'handleWebSocketError',
      error: new Error('WebSocket error'),
      context: { event }
    });
  }

  /**
   * Send subscriptions to WebSocket
   */
  private sendSubscriptions(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Group subscriptions by type
    const quoteSubscriptions: string[] = [];
    const barSubscriptions: Record<string, string[]> = {};
    
    for (const key of this.subscriptions.keys()) {
      const [type, instrumentId, timeframe] = key.split(':');
      
      if (type === 'quote') {
        quoteSubscriptions.push(instrumentId);
      } else if (type === 'bar') {
        if (!barSubscriptions[timeframe]) {
          barSubscriptions[timeframe] = [];
        }
        barSubscriptions[timeframe].push(instrumentId);
      }
    }
    
    // Send quote subscriptions
    if (quoteSubscriptions.length > 0) {
      this.websocket.send(JSON.stringify({
        action: 'subscribe',
        type: 'quotes',
        symbols: quoteSubscriptions
      }));
    }
    
    // Send bar subscriptions
    for (const [timeframe, symbols] of Object.entries(barSubscriptions)) {
      this.websocket.send(JSON.stringify({
        action: 'subscribe',
        type: 'bars',
        timeframe,
        symbols
      }));
    }
  }

  /**
   * Handle quote update from WebSocket
   */
  private handleQuoteUpdate(data: any): void {
    const quote: QuoteData = {
      instrumentId: data.symbol,
      bid: data.bid,
      ask: data.ask,
      timestamp: new Date(data.timestamp).getTime(),
      bidSize: data.bidSize,
      askSize: data.askSize,
      provider: this.config.provider
    };
    
    // Notify all subscribers
    const key = `quote:${quote.instrumentId}`;
    const callbacks = this.subscriptions.get(key);
    
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(quote);
        } catch (error) {
          console.error('Error in quote callback:', error);
        }
      }
    }
  }

  /**
   * Handle bar update from WebSocket
   */
  private handleBarUpdate(data: any): void {
    const bar: MarketDataBar = {
      instrumentId: data.symbol,
      timeframe: data.timeframe,
      timestamp: new Date(data.timestamp).getTime(),
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume
    };
    
    // Notify all subscribers
    const key = `bar:${bar.instrumentId}:${bar.timeframe}`;
    const callbacks = this.subscriptions.get(key);
    
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(bar);
        } catch (error) {
          console.error('Error in bar callback:', error);
        }
      }
    }
  }

  /**
   * Get endpoint for historical data based on provider
   */
  private getEndpointForHistoricalData(provider: string): string {
    switch (provider) {
      case 'ALPHAVANTAGE':
        return '/query';
      case 'POLYGON':
        return '/v2/aggs/ticker';
      case 'DATABENTO':
        return '/timeseries';
      case 'IEX':
        return '/stock/chart';
      case 'CUSTOM':
        return '/historical';
      default:
        return '/historical';
    }
  }

  /**
   * Get endpoint for quote data based on provider
   */
  private getEndpointForQuoteData(provider: string): string {
    switch (provider) {
      case 'ALPHAVANTAGE':
        return '/query';
      case 'POLYGON':
        return '/v2/last/nbbo';
      case 'DATABENTO':
        return '/quotes';
      case 'IEX':
        return '/stock/quote';
      case 'CUSTOM':
        return '/quotes';
      default:
        return '/quotes';
    }
  }

  /**
   * Get endpoint for instrument search based on provider
   */
  private getEndpointForSearch(provider: string): string {
    switch (provider) {
      case 'ALPHAVANTAGE':
        return '/query';
      case 'POLYGON':
        return '/v3/reference/tickers';
      case 'DATABENTO':
        return '/instruments';
      case 'IEX':
        return '/search';
      case 'CUSTOM':
        return '/search';
      default:
        return '/search';
    }
  }

  /**
   * Get WebSocket URL based on provider
   */
  private getWebSocketUrl(): string {
    const baseUrl = this.config.baseUrl.replace(/^http/, 'ws');
    
    switch (this.config.provider) {
      case 'ALPHAVANTAGE':
        // Alpha Vantage doesn't have a WebSocket API
        throw new Error('Alpha Vantage does not support WebSocket connections');
      case 'POLYGON':
        return `${baseUrl}/v2/ws/stocks?apiKey=${this.config.apiKey}`;
      case 'DATABENTO':
        return `${baseUrl}/ws?api_key=${this.config.apiKey}`;
      case 'IEX':
        return `${baseUrl}/stocks?token=${this.config.apiKey}`;
      case 'CUSTOM':
        return `${baseUrl}/ws?api_key=${this.config.apiKey}`;
      default:
        return `${baseUrl}/ws?api_key=${this.config.apiKey}`;
    }
  }

  /**
   * Transform historical data from provider format to our format
   */
  private transformHistoricalData(
    data: any,
    instrumentId: string,
    timeframe: MarketDataTimeframe
  ): MarketDataBar[] {
    switch (this.config.provider) {
      case 'ALPHAVANTAGE':
        return this.transformAlphaVantageHistoricalData(data, instrumentId, timeframe);
      case 'POLYGON':
        return this.transformPolygonHistoricalData(data, instrumentId, timeframe);
      case 'DATABENTO':
        return this.transformDatabentoHistoricalData(data, instrumentId, timeframe);
      case 'IEX':
        return this.transformIEXHistoricalData(data, instrumentId, timeframe);
      case 'CUSTOM':
        return this.transformCustomHistoricalData(data, instrumentId, timeframe);
      default:
        return [];
    }
  }

  /**
   * Transform quote data from provider format to our format
   */
  private transformQuoteData(data: any, instrumentId: string): QuoteData {
    switch (this.config.provider) {
      case 'ALPHAVANTAGE':
        return this.transformAlphaVantageQuoteData(data, instrumentId);
      case 'POLYGON':
        return this.transformPolygonQuoteData(data, instrumentId);
      case 'DATABENTO':
        return this.transformDatabentoQuoteData(data, instrumentId);
      case 'IEX':
        return this.transformIEXQuoteData(data, instrumentId);
      case 'CUSTOM':
        return this.transformCustomQuoteData(data, instrumentId);
      default:
        return {
          instrumentId,
          bid: 0,
          ask: 0,
          timestamp: Date.now(),
          provider: this.config.provider
        };
    }
  }

  /**
   * Transform search results from provider format to our format
   */
  private transformSearchResults(data: any): any[] {
    switch (this.config.provider) {
      case 'ALPHAVANTAGE':
        return this.transformAlphaVantageSearchResults(data);
      case 'POLYGON':
        return this.transformPolygonSearchResults(data);
      case 'DATABENTO':
        return this.transformDatabentoSearchResults(data);
      case 'IEX':
        return this.transformIEXSearchResults(data);
      case 'CUSTOM':
        return this.transformCustomSearchResults(data);
      default:
        return [];
    }
  }

  // Provider-specific transformations - these would be implemented based on each API's response format
  private transformAlphaVantageHistoricalData(data: any, instrumentId: string, timeframe: MarketDataTimeframe): MarketDataBar[] {
    // Implement Alpha Vantage-specific transformation
    // This is a placeholder implementation
    const timeSeriesKey = this.getAlphaVantageTimeSeriesKey(timeframe);
    const timeSeries = data[timeSeriesKey];
    
    if (!timeSeries) {
      return [];
    }
    
    return Object.entries(timeSeries).map(([dateStr, values]: [string, any]) => {
      const timestamp = new Date(dateStr).getTime();
      
      return {
        instrumentId,
        timeframe,
        timestamp,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume'])
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Sort descending
  }

  private getAlphaVantageTimeSeriesKey(timeframe: MarketDataTimeframe): string {
    switch (timeframe) {
      case MarketDataTimeframe.MINUTE_1:
        return 'Time Series (1min)';
      case MarketDataTimeframe.MINUTE_5:
        return 'Time Series (5min)';
      case MarketDataTimeframe.MINUTE_15:
        return 'Time Series (15min)';
      case MarketDataTimeframe.MINUTE_30:
        return 'Time Series (30min)';
      case MarketDataTimeframe.HOUR_1:
        return 'Time Series (60min)';
      case MarketDataTimeframe.DAY_1:
        return 'Time Series (Daily)';
      case MarketDataTimeframe.WEEK_1:
        return 'Weekly Time Series';
      default:
        return 'Time Series (Daily)';
    }
  }

  private transformAlphaVantageQuoteData(data: any, instrumentId: string): QuoteData {
    // Implement Alpha Vantage-specific transformation for quotes
    // This is a placeholder implementation
    const globalQuote = data['Global Quote'];
    
    if (!globalQuote) {
      return {
        instrumentId,
        bid: 0,
        ask: 0,
        timestamp: Date.now(),
        provider: 'ALPHAVANTAGE'
      };
    }
    
    const price = parseFloat(globalQuote['05. price']);
    
    return {
      instrumentId,
      bid: price * 0.999, // Simulated bid (slightly lower than last price)
      ask: price * 1.001, // Simulated ask (slightly higher than last price)
      timestamp: Date.now(),
      provider: 'ALPHAVANTAGE'
    };
  }

  private transformAlphaVantageSearchResults(data: any): any[] {
    // Implement Alpha Vantage-specific transformation for search results
    // This is a placeholder implementation
    const bestMatches = data['bestMatches'];
    
    if (!bestMatches) {
      return [];
    }
    
    return bestMatches.map((match: any) => {
      return {
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency'],
        provider: 'ALPHAVANTAGE'
      };
    });
  }

  // Placeholder methods for other providers - these would be implemented similarly
  private transformPolygonHistoricalData(data: any, instrumentId: string, timeframe: MarketDataTimeframe): MarketDataBar[] {
    // Polygon-specific implementation
    return [];
  }
  
  private transformDatabentoHistoricalData(data: any, instrumentId: string, timeframe: MarketDataTimeframe): MarketDataBar[] {
    // Databento-specific implementation
    return [];
  }
  
  private transformIEXHistoricalData(data: any, instrumentId: string, timeframe: MarketDataTimeframe): MarketDataBar[] {
    // IEX-specific implementation
    return [];
  }
  
  private transformCustomHistoricalData(data: any, instrumentId: string, timeframe: MarketDataTimeframe): MarketDataBar[] {
    // Custom implementation
    return [];
  }
  
  private transformPolygonQuoteData(data: any, instrumentId: string): QuoteData {
    // Polygon-specific implementation
    return {
      instrumentId,
      bid: 0,
      ask: 0,
      timestamp: Date.now(),
      provider: 'POLYGON'
    };
  }
  
  private transformDatabentoQuoteData(data: any, instrumentId: string): QuoteData {
    // Databento-specific implementation
    return {
      instrumentId,
      bid: 0,
      ask: 0,
      timestamp: Date.now(),
      provider: 'DATABENTO'
    };
  }
  
  private transformIEXQuoteData(data: any, instrumentId: string): QuoteData {
    // IEX-specific implementation
    return {
      instrumentId,
      bid: 0,
      ask: 0,
      timestamp: Date.now(),
      provider: 'IEX'
    };
  }
  
  private transformCustomQuoteData(data: any, instrumentId: string): QuoteData {
    // Custom implementation
    return {
      instrumentId,
      bid: 0,
      ask: 0,
      timestamp: Date.now(),
      provider: 'CUSTOM'
    };
  }
  
  private transformPolygonSearchResults(data: any): any[] {
    // Polygon-specific implementation
    return [];
  }
  
  private transformDatabentoSearchResults(data: any): any[] {
    // Databento-specific implementation
    return [];
  }
  
  private transformIEXSearchResults(data: any): any[] {
    // IEX-specific implementation
    return [];
  }
  
  private transformCustomSearchResults(data: any): any[] {
    // Custom implementation
    return [];
  }
}

// Export a default instance
const marketDataService = MarketDataService.getInstance();
export default marketDataService;
