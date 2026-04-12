/**
 * 🧠 ML SERVICE CLIENT
 * Integration with NexuralTrading ML Engine
 */

import axios, { AxiosInstance } from 'axios';
import { StrategyDefinition, TradingSignal, StrategyPerformance } from '@/lib/shared/trading/strategy-types';

/**
 * Configuration for the ML service client
 */
interface MlServiceConfig {
  baseUrl: string;
  timeout?: number;
  apiKey?: string;
}

/**
 * Client for interacting with the ML service
 */
export class MlServiceClient {
  private client: AxiosInstance;
  private isInitialized: boolean = false;
  private static instance: MlServiceClient;

  private constructor(config: MlServiceConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      // Get token from auth context or session
      const token = await this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('ML Service error:', error?.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    this.isInitialized = true;
  }

  /**
   * Get the ML service client instance (singleton)
   */
  public static getInstance(config?: MlServiceConfig): MlServiceClient {
    if (!MlServiceClient.instance) {
      // Default configuration using environment variables
      const defaultConfig: MlServiceConfig = {
        baseUrl: process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000/api',
        timeout: Number(process.env.NEXT_PUBLIC_ML_SERVICE_TIMEOUT) || 30000,
        apiKey: process.env.ML_SERVICE_API_KEY,
      };

      MlServiceClient.instance = new MlServiceClient(config || defaultConfig);
    }
    return MlServiceClient.instance;
  }

  /**
   * Get authentication token for ML service
   */
  private async getAuthToken(): Promise<string | null> {
    // This would get the token from your auth system
    // For now, we'll return null as a placeholder
    return null;
  }

  /**
   * Check if the ML service is available
   */
  public async checkHealth(): Promise<{ status: string; version: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('ML service health check failed:', error);
      return { status: 'error', version: 'unknown' };
    }
  }

  /**
   * Get all available strategy definitions
   */
  public async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      const response = await this.client.get('/strategies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      // Return empty array as placeholder
      return [];
    }
  }

  /**
   * Get a specific strategy by ID
   */
  public async getStrategy(strategyId: string): Promise<StrategyDefinition | null> {
    try {
      const response = await this.client.get(`/strategies/${strategyId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch strategy ${strategyId}:`, error);
      return null;
    }
  }

  /**
   * Get latest signals for a strategy
   */
  public async getSignals(strategyId: string, limit: number = 10): Promise<TradingSignal[]> {
    try {
      const response = await this.client.get(`/signals/${strategyId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch signals for strategy ${strategyId}:`, error);
      // Return empty array as placeholder
      return [];
    }
  }

  /**
   * Get performance metrics for a strategy
   */
  public async getStrategyPerformance(
    strategyId: string,
    period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'
  ): Promise<StrategyPerformance | null> {
    try {
      const response = await this.client.get(`/strategies/${strategyId}/performance`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch performance for strategy ${strategyId}:`, error);
      // Return null as placeholder
      return null;
    }
  }

  /**
   * Create a WebSocket connection for real-time signals
   */
  public createSignalStream(
    strategyId: string,
    onSignal: (signal: TradingSignal) => void,
    onError?: (error: any) => void
  ): () => void {
    // Extract the base URL without the '/api' path
    const baseUrl = this.client.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    
    // Create WebSocket connection
    const ws = new WebSocket(`${wsUrl}/ws/signals/${strategyId}`);
    
    ws.onmessage = (event) => {
      try {
        const signal = JSON.parse(event.data) as TradingSignal;
        onSignal(signal);
      } catch (error) {
        console.error('Error parsing signal:', error);
        if (onError) onError(error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };
    
    // Return function to close the connection
    return () => {
      ws.close();
    };
  }
}

// Export a default instance
const mlService = MlServiceClient.getInstance();
export default mlService;
