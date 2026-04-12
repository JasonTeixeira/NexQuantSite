/**
 * 🖥️ DESKTOP APP API CLIENT
 * API client for the desktop trading application
 */

import axios, { AxiosInstance } from 'axios';
import EventEmitter from 'events';
import { 
  StrategyDefinition, 
  TradingSignal, 
  StrategyPerformance, 
  StrategyInstance 
} from '@/lib/shared/trading/strategy-types';

/**
 * Configuration for the desktop app API client
 */
export interface ApiClientConfig {
  apiUrl: string;
  websocketUrl: string;
  apiKey?: string;
  authToken?: string;
  refreshToken?: string;
}

/**
 * API client for the desktop trading application
 */
export class DesktopAppApiClient extends EventEmitter {
  private config: ApiClientConfig;
  private client: AxiosInstance;
  private websocket: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private isConnected: boolean = false;
  private subscriptions: Map<string, number> = new Map();
  
  constructor(config: ApiClientConfig) {
    super();
    
    this.config = {
      ...config,
      apiUrl: config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl,
      websocketUrl: config.websocketUrl.endsWith('/') ? config.websocketUrl.slice(0, -1) : config.websocketUrl
    };
    
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'X-API-Key': this.config.apiKey } : {}),
        ...(this.config.authToken ? { 'Authorization': `Bearer ${this.config.authToken}` } : {})
      }
    });

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      response => response,
      async error => {
        // Handle 401 responses by trying to refresh the token
        if (error.response?.status === 401 && this.config.refreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${this.config.apiUrl}/auth/refresh`,
              { refreshToken: this.config.refreshToken }
            );
            
            // Update tokens
            this.config.authToken = refreshResponse.data.token;
            this.config.refreshToken = refreshResponse.data.refreshToken;
            
            // Update authorization header
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.config.authToken}`;
            
            // Retry the original request
            return this.client(error.config);
          } catch (refreshError) {
            // If refresh fails, emit logout event
            this.emit('auth:logout', { reason: 'token_refresh_failed' });
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication tokens
   */
  public setAuthTokens(authToken: string, refreshToken?: string): void {
    this.config.authToken = authToken;
    
    if (refreshToken) {
      this.config.refreshToken = refreshToken;
    }
    
    this.client.defaults.headers.common['Authorization'] = `Bearer ${this.config.authToken}`;
  }
  
  /**
   * Clear authentication tokens
   */
  public clearAuthTokens(): void {
    this.config.authToken = undefined;
    this.config.refreshToken = undefined;
    
    delete this.client.defaults.headers.common['Authorization'];
  }
  
  /**
   * Check if authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.config.authToken;
  }
  
  /**
   * Connect to WebSocket for real-time signals
   */
  public async connect(): Promise<boolean> {
    if (this.websocket) {
      return this.isConnected;
    }
    
    return new Promise((resolve) => {
      try {
        const url = new URL(`${this.config.websocketUrl}/signals`);
        
        // Add auth token as query parameter
        if (this.config.authToken) {
          url.searchParams.append('token', this.config.authToken);
        }
        
        this.websocket = new WebSocket(url.toString());
        
        this.websocket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Start ping interval to keep connection alive
          this.pingInterval = setInterval(() => {
            if (this.websocket?.readyState === WebSocket.OPEN) {
              this.websocket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
          
          this.emit('ws:connected');
          resolve(true);
        };
        
        this.websocket.onclose = () => {
          this.isConnected = false;
          
          if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
          }
          
          this.emit('ws:disconnected');
          
          // Attempt reconnection
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            
            setTimeout(() => {
              this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
          } else {
            this.emit('ws:max_reconnect_attempts');
          }
          
          resolve(false);
        };
        
        this.websocket.onerror = (error) => {
          this.emit('ws:error', error);
        };
        
        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'pong') {
              // Heartbeat response
              return;
            }
            
            if (data.type === 'signal') {
              this.emit('signal', data.payload);
              
              // Emit strategy-specific event
              if (data.payload.strategyId) {
                this.emit(`signal:${data.payload.strategyId}`, data.payload);
              }
            }
            
            if (data.type === 'system') {
              this.emit('system', data.payload);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        this.emit('ws:error', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    this.isConnected = false;
  }
  
  /**
   * Subscribe to signals for a strategy
   */
  public subscribeToStrategy(strategyId: string): void {
    if (!this.isConnected || !this.websocket) {
      throw new Error('WebSocket not connected');
    }
    
    // Increment subscription count or set to 1 if new
    const currentCount = this.subscriptions.get(strategyId) || 0;
    this.subscriptions.set(strategyId, currentCount + 1);
    
    // Only send subscribe message if this is the first subscription
    if (currentCount === 0) {
      this.websocket.send(JSON.stringify({
        type: 'subscribe',
        strategyId
      }));
    }
  }
  
  /**
   * Unsubscribe from signals for a strategy
   */
  public unsubscribeFromStrategy(strategyId: string): void {
    if (!this.isConnected || !this.websocket) {
      return;
    }
    
    // Decrement subscription count
    const currentCount = this.subscriptions.get(strategyId) || 0;
    
    if (currentCount <= 1) {
      // If this is the last subscription, remove it and send unsubscribe message
      this.subscriptions.delete(strategyId);
      
      this.websocket.send(JSON.stringify({
        type: 'unsubscribe',
        strategyId
      }));
    } else {
      // Otherwise just decrement the count
      this.subscriptions.set(strategyId, currentCount - 1);
    }
  }
  
  /**
   * Get available strategies
   */
  public async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      const response = await this.client.get('/trading/strategies');
      return response.data;
    } catch (error) {
      console.error('Error fetching strategies:', error);
      return [];
    }
  }
  
  /**
   * Get strategy by ID
   */
  public async getStrategy(strategyId: string): Promise<StrategyDefinition | null> {
    try {
      const response = await this.client.get(`/trading/strategies?id=${strategyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching strategy ${strategyId}:`, error);
      return null;
    }
  }
  
  /**
   * Get strategy instances for the current user
   */
  public async getStrategyInstances(): Promise<StrategyInstance[]> {
    try {
      const response = await this.client.get('/trading/instances');
      return response.data;
    } catch (error) {
      console.error('Error fetching strategy instances:', error);
      return [];
    }
  }
  
  /**
   * Create a strategy instance
   */
  public async createStrategyInstance(
    strategyDefinitionId: string,
    name: string,
    parameters: Record<string, any>
  ): Promise<StrategyInstance | null> {
    try {
      const response = await this.client.post('/trading/instances', {
        strategyDefinitionId,
        name,
        parameters
      });
      return response.data;
    } catch (error) {
      console.error('Error creating strategy instance:', error);
      return null;
    }
  }
  
  /**
   * Update a strategy instance
   */
  public async updateStrategyInstance(
    instanceId: string,
    updates: Partial<{ name: string; parameters: Record<string, any>; isActive: boolean }>
  ): Promise<StrategyInstance | null> {
    try {
      const response = await this.client.put(`/trading/instances/${instanceId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating strategy instance ${instanceId}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a strategy instance
   */
  public async deleteStrategyInstance(instanceId: string): Promise<boolean> {
    try {
      await this.client.delete(`/trading/instances/${instanceId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting strategy instance ${instanceId}:`, error);
      return false;
    }
  }
  
  /**
   * Get recent signals for a strategy
   */
  public async getSignals(strategyId: string, limit: number = 100): Promise<TradingSignal[]> {
    try {
      const response = await this.client.get(`/trading/signals?strategyId=${strategyId}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching signals for strategy ${strategyId}:`, error);
      return [];
    }
  }
  
  /**
   * Get performance metrics for a strategy
   */
  public async getPerformance(
    strategyId: string,
    period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'
  ): Promise<StrategyPerformance | null> {
    try {
      const response = await this.client.get(`/trading/performance?strategyId=${strategyId}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching performance for strategy ${strategyId}:`, error);
      return null;
    }
  }
  
  /**
   * Check the health of the API
   */
  public async checkHealth(): Promise<{ status: string; version: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', version: 'unknown' };
    }
  }
}

// Create a function to get a desktop app API client instance
export function createDesktopAppClient(config: ApiClientConfig): DesktopAppApiClient {
  return new DesktopAppApiClient(config);
}
