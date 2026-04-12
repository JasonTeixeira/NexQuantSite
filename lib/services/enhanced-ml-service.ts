/**
 * 🧠 ENHANCED ML SERVICE
 * Secure, monitored integration with NexuralTrading ML Engine
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { reportError } from '@/lib/monitoring';
import { 
  StrategyDefinition, 
  TradingSignal, 
  StrategyPerformance 
} from '@/lib/shared/trading/strategy-types';

// Import from auth services
import jwtService from '@/lib/auth/jwt-service';
import auditLogger, { AuditCategory, AuditEventType, AuditStatus, AuditSeverity } from '@/lib/auth/audit-logger';

/**
 * ML Model related interfaces
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

export interface BacktestRequest {
  strategyId: string;
  parameters: Record<string, any>;
  timeframe: string;
  startDate?: string;
  endDate?: string;
  instruments?: string[];
}

export interface BacktestResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: string;
  results?: {
    performance: StrategyPerformance;
    signals: TradingSignal[];
  };
}

export interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableLogs?: boolean;
}

/**
 * Enhanced ML Service with secure authentication, monitoring, and improved error handling
 */
export class EnhancedMlService {
  private client: AxiosInstance;
  private retryConfig: {
    maxRetries: number;
    retryDelay: number;
  };
  private enableLogs: boolean;
  private static instance: EnhancedMlService;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: ServiceConfig = {}) {
    // Build configuration with defaults
    const baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000/api';
    const timeout = config.timeout || Number(process.env.NEXT_PUBLIC_ML_SERVICE_TIMEOUT) || 30000;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry settings
    this.retryConfig = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };

    // Configure logging
    this.enableLogs = config.enableLogs ?? (process.env.NODE_ENV === 'development');

    // Set up interceptors
    this.setupInterceptors();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(config?: ServiceConfig): EnhancedMlService {
    if (!EnhancedMlService.instance) {
      EnhancedMlService.instance = new EnhancedMlService(config);
    }
    return EnhancedMlService.instance;
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Get JWT token (uses auth token from cookies or storage)
          const token = await this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Add request ID for tracing
          const requestId = uuidv4();
          config.headers['X-Request-ID'] = requestId;

          // Log request if enabled
          if (this.enableLogs) {
            const url = config.url || '';
            const method = config.method?.toUpperCase() || 'GET';
            console.log(`🧠 ML Request [${method}] ${url}`, {
              requestId,
              params: config.params,
              data: this.sanitizeRequestData(config.data),
            });
          }

          return config;
        } catch (error) {
          console.error('Error in request interceptor:', error);
          return config;
        }
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and monitoring
    this.client.interceptors.response.use(
      (response) => {
        // Log response if enabled
        if (this.enableLogs) {
          const requestId = response.config.headers['X-Request-ID'];
          const url = response.config.url || '';
          const method = response.config.method?.toUpperCase() || 'GET';
          console.log(`✅ ML Response [${method}] ${url}`, {
            requestId,
            status: response.status,
            data: this.sanitizeResponseData(response.data),
          });
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const requestId = originalRequest?.headers?.['X-Request-ID'] || uuidv4();
        
        // Extract error details
        const status = error.response?.status;
        const data = error.response?.data;
        const url = originalRequest?.url || '';
        const method = originalRequest?.method?.toUpperCase() || 'GET';
        
        // Log error
        if (this.enableLogs) {
          console.error(`❌ ML Error [${method}] ${url}`, {
            requestId,
            status,
            data,
            error: error.message,
          });
        }
        
        // Report to monitoring system
        reportError({
          component: 'EnhancedMlService',
          action: `${method} ${url}`,
          error,
          context: {
            requestId,
            status,
            response: data,
          },
          severity: status >= 500 ? 'high' : 'medium',
        });

        // Implement retry logic for certain errors
        if (
          this.shouldRetry(error) &&
          originalRequest &&
          originalRequest._retry !== true &&
          (originalRequest._retryCount || 0) < this.retryConfig.maxRetries
        ) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          // Wait before retrying
          const delay = this.retryConfig.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Log retry attempt
          if (this.enableLogs) {
            console.log(`🔄 ML Retry [${method}] ${url} (${originalRequest._retryCount}/${this.retryConfig.maxRetries})`, {
              requestId,
            });
          }
          
          return this.client(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Determine if a request should be retried based on the error
   */
  private shouldRetry(error: any): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }
    
    // Retry on server errors (5xx)
    if (error.response.status >= 500) {
      return true;
    }
    
    // Retry on rate limiting (429)
    if (error.response.status === 429) {
      return true;
    }
    
    // Don't retry on client errors or other status codes
    return false;
  }

  /**
   * Sanitize request data for logging (remove sensitive information)
   */
  private sanitizeRequestData(data: any): any {
    if (!data) return data;
    
    // Clone data to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove sensitive fields if present
    if (sanitized.password) sanitized.password = '******';
    if (sanitized.token) sanitized.token = '******';
    if (sanitized.apiKey) sanitized.apiKey = '******';
    
    return sanitized;
  }

  /**
   * Sanitize response data for logging (truncate large responses)
   */
  private sanitizeResponseData(data: any): any {
    if (!data) return data;
    
    // For large arrays, truncate
    if (Array.isArray(data) && data.length > 5) {
      return {
        _truncated: true,
        _length: data.length,
        _sample: data.slice(0, 5),
      };
    }
    
    // For objects with large arrays, truncate those arrays
    if (typeof data === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 5) {
          sanitized[key] = {
            _truncated: true,
            _length: value.length,
            _sample: value.slice(0, 5),
          };
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Get auth token for requests
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // For server-side operations, get token from token services
      if (typeof window === 'undefined') {
        // Use server-side approach to get token
        // This depends on how you're storing tokens for API usage
        return process.env.ML_SERVICE_API_KEY || null;
      }
      
      // For client-side, get token from storage or cookie
      // Access tokens should be in HTTP-only cookies handled by the browser
      
      // If you're implementing a custom approach to get tokens client-side,
      // this is where you would implement it
      
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Execute a request with monitoring and error handling
   */
  private async executeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      let response: AxiosResponse<T>;
      
      switch (method) {
        case 'get':
          response = await this.client.get<T>(url, config);
          break;
        case 'post':
          response = await this.client.post<T>(url, data, config);
          break;
        case 'put':
          response = await this.client.put<T>(url, data, config);
          break;
        case 'delete':
          response = await this.client.delete<T>(url, config);
          break;
      }
      
      return response.data;
    } catch (error) {
      // Enhanced error handling
      const errorInfo = {
        url,
        method,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        responseData: (error as any)?.response?.data,
      };
      
      // Log more context about the error
      console.error(`ML Service error in ${method.toUpperCase()} ${url}:`, errorInfo);
      
      // Rethrow to let the caller handle it
      throw error;
    }
  }

  /**
   * Check if the ML service is available
   */
  public async checkHealth(): Promise<{ status: string; version: string }> {
    try {
      const response = await this.executeRequest<{ status: string; version: string }>('get', '/health');
      return response;
    } catch (error) {
      console.error('ML service health check failed:', error);
      return { status: 'error', version: 'unknown' };
    }
  }

  /**
   * Get all available strategies
   */
  public async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      return await this.executeRequest<StrategyDefinition[]>('get', '/strategies');
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      return [];
    }
  }

  /**
   * Get a specific strategy by ID
   */
  public async getStrategy(strategyId: string): Promise<StrategyDefinition | null> {
    try {
      return await this.executeRequest<StrategyDefinition>('get', `/strategies/${strategyId}`);
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
      return await this.executeRequest<TradingSignal[]>('get', `/signals/${strategyId}`, undefined, {
        params: { limit }
      });
    } catch (error) {
      console.error(`Failed to fetch signals for strategy ${strategyId}:`, error);
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
      return await this.executeRequest<StrategyPerformance>('get', `/strategies/${strategyId}/performance`, undefined, {
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
    
    // Track connection status
    let isConnected = false;
    
    // Set up open handler
    ws.onopen = () => {
      isConnected = true;
      if (this.enableLogs) {
        console.log(`🔌 ML WebSocket connected for strategy ${strategyId}`);
      }
      
      // Log connection to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.SYSTEM,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
        details: {
          action: 'signal_stream_connect',
          strategyId,
          connectionType: 'websocket'
        }
      }).catch(e => console.error('Audit logging error:', e));
    };
    
    // Set up message handler
    ws.onmessage = (event) => {
      try {
        const signal = JSON.parse(event.data) as TradingSignal;
        onSignal(signal);
      } catch (error) {
        console.error('Error parsing signal:', error);
        if (onError) onError(error);
      }
    };
    
    // Set up error handler
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      
      // Report to monitoring
      reportError({
        component: 'EnhancedMlService',
        action: 'signalStreamWebSocket',
        error,
        context: { strategyId },
        severity: 'medium'
      });
      
      if (onError) onError(error);
    };
    
    // Set up close handler
    ws.onclose = (event) => {
      isConnected = false;
      if (this.enableLogs) {
        console.log(`🔌 ML WebSocket disconnected for strategy ${strategyId}`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      }
    };
    
    // Return function to close the connection
    return () => {
      if (isConnected) {
        ws.close();
      }
    };
  }

  /**
   * Get all available ML models
   */
  public async getModels(): Promise<ModelDefinition[]> {
    try {
      return await this.executeRequest<ModelDefinition[]>('get', '/models');
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
      return await this.executeRequest<ModelDefinition>('get', `/models/${modelId}`);
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
      return await this.executeRequest<ModelVersion[]>('get', `/models/${modelId}/versions`);
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
      return await this.executeRequest<ModelVersion>('get', `/models/${modelId}/versions/${versionId}`);
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
      // Log prediction request to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'get_prediction',
          modelId: request.model_id,
          instrumentId: request.instrument_id
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      const response = await this.executeRequest<PredictionResponse>('post', '/predictions', request);
      
      // Log successful prediction to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
        details: {
          action: 'get_prediction',
          modelId: request.model_id,
          instrumentId: request.instrument_id,
          signalCount: response.signals.length
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      return response;
    } catch (error) {
      // Log failed prediction to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.FAILURE,
        severity: AuditSeverity.WARNING,
        details: {
          action: 'get_prediction',
          modelId: request.model_id,
          instrumentId: request.instrument_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(e => console.error('Audit logging error:', e));
      
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

    // Track connection status
    let isConnected = false;
    
    // Initialize connection promise
    const connectionPromise = new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        isConnected = true;
        if (this.enableLogs) {
          console.log(`🔌 ML Prediction WebSocket connected for client ${clientId}`);
        }
        
        // Log connection to audit system
        auditLogger.logAuditEvent({
          category: AuditCategory.SYSTEM,
          eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          details: {
            action: 'prediction_stream_connect',
            clientId,
            connectionType: 'websocket'
          }
        }).catch(e => console.error('Audit logging error:', e));
        
        resolve();
      };
      
      ws.onerror = (event) => {
        if (!isConnected) {
          reject(new Error('WebSocket connection failed'));
        }
        
        // Report to monitoring
        reportError({
          component: 'EnhancedMlService',
          action: 'predictionStreamWebSocket',
          error: new Error('WebSocket error'),
          context: { clientId },
          severity: 'medium'
        });
        
        if (onError) onError(event);
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
    
    // Set up close handler
    ws.onclose = (event) => {
      isConnected = false;
      if (this.enableLogs) {
        console.log(`🔌 ML Prediction WebSocket disconnected for client ${clientId}`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      }
    };
    
    // Function to ensure connection is ready
    const ensureConnection = async () => {
      if (!isConnected) {
        await connectionPromise;
      }
    };
    
    // Return control object with methods
    return {
      // Subscribe to a specific model and instrument
      subscribe: async (modelId: string, instrumentId: string) => {
        await ensureConnection();
        
        // Log subscription to audit system
        auditLogger.logAuditEvent({
          category: AuditCategory.DATA_ACCESS,
          eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
          status: AuditStatus.ATTEMPTED,
          severity: AuditSeverity.INFO,
          details: {
            action: 'prediction_stream_subscribe',
            clientId,
            modelId,
            instrumentId
          }
        }).catch(e => console.error('Audit logging error:', e));
        
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
        if (isConnected) {
          ws.close();
        }
      }
    };
  }

  /**
   * Submit a backtest job
   */
  public async submitBacktest(request: BacktestRequest): Promise<BacktestResponse | null> {
    try {
      // Log backtest request to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.ATTEMPTED,
        severity: AuditSeverity.INFO,
        details: {
          action: 'submit_backtest',
          strategyId: request.strategyId,
          timeframe: request.timeframe
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      const response = await this.executeRequest<BacktestResponse>('post', '/backtest', request);
      
      // Log successful submission to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
        details: {
          action: 'submit_backtest',
          strategyId: request.strategyId,
          timeframe: request.timeframe,
          jobId: response.jobId
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      return response;
    } catch (error) {
      // Log failed submission to audit system
      auditLogger.logAuditEvent({
        category: AuditCategory.DATA_ACCESS,
        eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
        status: AuditStatus.FAILURE,
        severity: AuditSeverity.WARNING,
        details: {
          action: 'submit_backtest',
          strategyId: request.strategyId,
          timeframe: request.timeframe,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(e => console.error('Audit logging error:', e));
      
      console.error('Failed to submit backtest:', error);
      return null;
    }
  }

  /**
   * Get backtest job status and results
   */
  public async getBacktestStatus(jobId: string): Promise<BacktestResponse | null> {
    try {
      return await this.executeRequest<BacktestResponse>('get', `/backtest/${jobId}`);
    } catch (error) {
      console.error(`Failed to get backtest status for job ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Compare multiple models based on specified metrics
   */
  public async compareModels(
    modelIds: string[],
    metricNames: string[]
  ): Promise<Record<string, any> | null> {
    try {
      return await this.executeRequest<Record<string, any>>('post', '/models/compare', {
        model_ids: modelIds,
        metric_names: metricNames
      });
    } catch (error) {
      console.error('Failed to compare models:', error);
      return null;
    }
  }
}

// Export default instance
const enhancedMlService = EnhancedMlService.getInstance();
export default enhancedMlService;
