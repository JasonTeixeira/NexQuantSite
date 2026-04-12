/**
 * 🧠 ML SERVICE CLIENT
 * Integration with NexuralTrading ML Engine using standardized service pattern
 */

import { BaseService, ServiceConfig } from './BaseService';
import { 
  StrategyDefinition, 
  TradingSignal, 
  StrategyPerformance 
} from '../../types/models/TradingTypes';

/**
 * Extended interfaces for model registry and prediction features
 */
export interface ModelDefinition {
  id: string;
  name: string;
  description?: string;
  model_type: string;
  version: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface ModelVersion {
  version_id: string;
  model_id: string;
  created_at: string;
  is_default: boolean;
  metrics?: Record<string, any>;
  file_path?: string;
}

export interface PredictionRequest {
  model_id: string;
  version_id?: string;
  instrument_id: string;
  timeframe?: string;
  params?: Record<string, any>;
}

export interface PredictionResponse {
  signals: TradingSignal[];
  cached?: boolean;
  model_id: string;
  model_version: string;
  timestamp: string;
}

/**
 * Client for interacting with the ML service
 */
export class MlService extends BaseService {
  private static instance: MlService;

  /**
   * Get the ML service client instance (singleton)
   */
  public static getInstance(config?: ServiceConfig): MlService {
    if (!MlService.instance) {
      // Default configuration using environment variables
      const defaultConfig: ServiceConfig = {
        baseUrl: process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000/api',
        timeout: Number(process.env.NEXT_PUBLIC_ML_SERVICE_TIMEOUT) || 30000,
        headers: {
          ...(process.env.ML_SERVICE_API_KEY ? { 'X-API-Key': process.env.ML_SERVICE_API_KEY } : {})
        }
      };

      MlService.instance = new MlService(config || defaultConfig);
    }
    return MlService.instance;
  }

  /**
   * Get all available strategy definitions
   */
  public async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      return await this.get<StrategyDefinition[]>('/strategies');
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get a specific strategy by ID
   */
  public async getStrategy(strategyId: string): Promise<StrategyDefinition | null> {
    try {
      return await this.get<StrategyDefinition>(`/strategies/${strategyId}`);
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
      return await this.get<TradingSignal[]>(`/signals/${strategyId}`, {
        params: { limit }
      });
    } catch (error) {
      console.error(`Failed to fetch signals for strategy ${strategyId}:`, error);
      // Return empty array as fallback
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
      return await this.get<StrategyPerformance>(`/strategies/${strategyId}/performance`, {
        params: { period }
      });
    } catch (error) {
      console.error(`Failed to fetch performance for strategy ${strategyId}:`, error);
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

  /**
   * Get all available ML models
   */
  public async getModels(): Promise<ModelDefinition[]> {
    try {
      return await this.get<ModelDefinition[]>('/models');
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }

  /**
   * Get a specific model by ID
   */
  public async getModel(modelId: string): Promise<ModelDefinition | null> {
    try {
      return await this.get<ModelDefinition>(`/models/${modelId}`);
    } catch (error) {
      console.error(`Failed to fetch model ${modelId}:`, error);
      return null;
    }
  }

  /**
   * Get all versions for a specific model
   */
  public async getModelVersions(modelId: string): Promise<ModelVersion[]> {
    try {
      return await this.get<ModelVersion[]>(`/models/${modelId}/versions`);
    } catch (error) {
      console.error(`Failed to fetch versions for model ${modelId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific model version
   */
  public async getModelVersion(modelId: string, versionId: string): Promise<ModelVersion | null> {
    try {
      return await this.get<ModelVersion>(`/models/${modelId}/versions/${versionId}`);
    } catch (error) {
      console.error(`Failed to fetch version ${versionId} for model ${modelId}:`, error);
      return null;
    }
  }

  /**
   * Get real-time prediction from model
   */
  public async getPrediction(request: PredictionRequest): Promise<PredictionResponse | null> {
    try {
      return await this.post<PredictionResponse>('/predictions', request);
    } catch (error) {
      console.error('Failed to get prediction:', error);
      return null;
    }
  }

  /**
   * Create a WebSocket connection for real-time predictions
   */
  public createPredictionStream(
    clientId: string,
    onPrediction: (prediction: PredictionResponse) => void,
    onError?: (error: any) => void
  ): { 
    subscribe: (modelId: string, instrumentId: string) => Promise<void>,
    unsubscribe: (modelId: string, instrumentId: string) => Promise<void>,
    close: () => void 
  } {
    // Extract the base URL without the '/api' path
    const baseUrl = this.client.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    
    // Create WebSocket connection
    const ws = new WebSocket(`${wsUrl}/ws/predictions/${clientId}`);

    // Initialize connection promise
    let connectionReady = false;
    const connectionPromise = new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        connectionReady = true;
        resolve();
      };
      ws.onerror = (event) => {
        reject(new Error('WebSocket connection failed'));
      };
    });
    
    // Set up message handler
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'prediction' || data.type === 'signal_result') {
          onPrediction(data);
        } else if (data.type === 'error') {
          if (onError) onError(new Error(data.error));
        }
      } catch (error) {
        console.error('Error parsing prediction:', error);
        if (onError) onError(error);
      }
    };
    
    // Set up error handler
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };
    
    // Function to ensure connection is ready
    const ensureConnection = async () => {
      if (!connectionReady) {
        await connectionPromise;
      }
    };
    
    // Return control object with methods
    return {
      // Subscribe to a specific model and instrument
      subscribe: async (modelId: string, instrumentId: string) => {
        await ensureConnection();
        ws.send(JSON.stringify({
          type: 'subscribe',
          model_id: modelId,
          instrument_id: instrumentId
        }));
      },
      
      // Unsubscribe from a specific model and instrument
      unsubscribe: async (modelId: string, instrumentId: string) => {
        await ensureConnection();
        ws.send(JSON.stringify({
          type: 'unsubscribe',
          model_id: modelId,
          instrument_id: instrumentId
        }));
      },
      
      // Close the WebSocket connection
      close: () => {
        ws.close();
      }
    };
  }
}

// Export a default instance
const mlService = MlService.getInstance();
export default mlService;
