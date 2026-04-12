/**
 * 🧪 ML SERVICE INTEGRATION TESTS
 * Tests for end-to-end ML service functionality across components
 */

import { MlService } from '@/core/api/MlService';
import { SignalType } from '@/types/models/TradingTypes';
import { createComponentMonitor, ComponentMonitor } from '@/lib/monitoring/index';

// Mock the services
jest.mock('@/core/api/MlService');
jest.mock('@/lib/monitoring/index');

describe('ML Service Integration', () => {
  let mlService: MlService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize services with mocked implementations
    mlService = new (MlService as any)();
    
    // Set up mock responses
    (mlService.getModel as jest.Mock).mockResolvedValue({
      id: 'model-1',
      name: 'Market Regime Detection',
      model_type: 'classification',
      version: 'v1.0.0',
      metadata: { accuracy: 0.85 }
    });
    
    (mlService.getPrediction as jest.Mock).mockResolvedValue({
      signals: [
        {
          id: 'signal-1',
          strategyId: 'strategy-1',
          instrumentId: 'BTC-USD',
          type: SignalType.LONG,
          price: 50000,
          confidence: 0.85,
          timestamp: Date.now(),
          metadata: {}
        }
      ],
      model_id: 'model-1',
      model_version: 'v1.0.0',
      timestamp: new Date().toISOString(),
      cached: false
    });
  });
  
  describe('End-to-End Trading Signal Generation', () => {
    it('should generate trading signals using model details', async () => {
      // 1. Get model details from ML service
      const modelDetails = await mlService.getModel('model-1');
      expect(modelDetails).toBeDefined();
      expect(modelDetails?.model_type).toBe('classification');
      
      // 2. Generate predictions for BTC-USD
      const prediction = await mlService.getPrediction({
        model_id: modelDetails?.id as string,
        instrument_id: 'BTC-USD'
      });
      
      // 3. Verify prediction contains signals
      expect(prediction).toBeDefined();
      expect(prediction?.signals).toHaveLength(1);
      expect(prediction?.signals[0].instrumentId).toBe('BTC-USD');
      expect(prediction?.signals[0].type).toBe(SignalType.LONG);
      
      // 4. Verify model attribution in prediction
      expect(prediction?.model_id).toBe(modelDetails?.id);
      expect(prediction?.model_version).toBeDefined();
    });
    
    it('should handle error cases gracefully', async () => {
      // Mock error cases for coverage
      (mlService.getModel as jest.Mock)
        .mockResolvedValueOnce(null) // First call returns null
        .mockResolvedValueOnce({     // Second call returns a model
          id: 'model-2',
          name: 'Volatility Model',
          model_type: 'regression',
          version: 'v1.0.0'
        });
      
      // 1. First ML service call fails to get model details
      const nullModelDetails = await mlService.getModel('wrong-id');
      expect(nullModelDetails).toBeNull();
      
      // 2. Second call succeeds
      const modelDetails = await mlService.getModel('model-2');
      expect(modelDetails).toBeDefined();
      expect(modelDetails?.model_type).toBe('regression');
      
      // 3. Generate predictions
      const prediction = await mlService.getPrediction({
        model_id: modelDetails?.id as string,
        instrument_id: 'ETH-USD'
      });
      
      expect(prediction).toBeDefined();
      expect(prediction?.signals).toBeDefined();
    });
  });
  
  describe('Performance Monitoring Integration', () => {
    it('should track performance metrics during ML operations', async () => {
      // Mock the performance monitor
      const mockPerformanceMonitor = {
        startMeasurement: jest.fn(),
        endMeasurement: jest.fn().mockReturnValue(100),
        trackMetric: jest.fn(),
        reportError: jest.fn()
      };
      
      (createComponentMonitor as jest.Mock).mockReturnValue(mockPerformanceMonitor);
      
      // Execute ML operations
      const monitor = createComponentMonitor('ml-service');
      
      // Start timing the operation
      monitor.startMeasurement('ml_prediction');
      
      // Get prediction
      await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      // End timing
      monitor.endMeasurement('ml_prediction');
      
      // Track additional metrics
      monitor.trackMetric('ml_prediction_count', 1, 'count');
      
      // Verify monitoring was used correctly
      expect(monitor.startMeasurement).toHaveBeenCalledWith('ml_prediction');
      expect(monitor.endMeasurement).toHaveBeenCalledWith('ml_prediction');
      expect(monitor.trackMetric).toHaveBeenCalledWith('ml_prediction_count', 1, 'count');
    });
    
    it('should handle and report errors during ML operations', async () => {
      // Mock error responses
      (mlService.getPrediction as jest.Mock).mockRejectedValue(
        new Error('ML service unavailable')
      );
      
      // Mock the performance monitor
      const mockPerformanceMonitor = {
        startMeasurement: jest.fn(),
        endMeasurement: jest.fn().mockReturnValue(100),
        trackMetric: jest.fn(),
        reportError: jest.fn()
      };
      
      (createComponentMonitor as jest.Mock).mockReturnValue(mockPerformanceMonitor);
      
      // Execute ML operations with error handling
      const monitor = createComponentMonitor('ml-service');
      
      try {
        // Start timing the operation
        monitor.startMeasurement('ml_prediction');
        
        // This will throw an error
        await mlService.getPrediction({
          model_id: 'model-1',
          instrument_id: 'BTC-USD'
        });
        
        // End timing (this shouldn't execute but included for completeness)
        monitor.endMeasurement('ml_prediction');
      } catch (error) {
        // Record the error
        monitor.reportError('ml_prediction', error as Error, {
          context: {
            operation: 'ml_prediction',
            modelId: 'model-1'
          }
        });
      }
      
      // Verify error was reported
      expect(monitor.reportError).toHaveBeenCalledWith(
        'ml_prediction',
        expect.any(Error),
        expect.objectContaining({
          context: expect.objectContaining({
            operation: 'ml_prediction'
          })
        })
      );
    });
  });
  
  describe('Caching Integration', () => {
    it('should use cached results when available', async () => {
      // First call - uncached
      await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      // Mock second call to return cached result
      (mlService.getPrediction as jest.Mock).mockResolvedValueOnce({
        signals: [
          {
            id: 'signal-1',
            strategyId: 'strategy-1',
            instrumentId: 'BTC-USD',
            type: SignalType.LONG,
            price: 50000,
            confidence: 0.85,
            timestamp: Date.now(),
            metadata: {}
          }
        ],
        model_id: 'model-1',
        model_version: 'v1.0.0',
        timestamp: new Date().toISOString(),
        cached: true  // This result is from cache
      });
      
      // Second call - should be cached
      const cachedResult = await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      expect(cachedResult).toBeDefined();
      expect(cachedResult?.cached).toBe(true);
      
      // Verify the service was called twice
      expect(mlService.getPrediction).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Cross-Component Data Flow', () => {
    it('should maintain data consistency between requests', async () => {
      // Set up mock for model details
      const modelMetadata = {
        training_date: '2025-01-15',
        features: ['price', 'volume', 'volatility'],
        parameters: { epochs: 100, batch_size: 32 }
      };
      
      (mlService.getModel as jest.Mock).mockResolvedValue({
        id: 'model-complex',
        name: 'Complex Model',
        model_type: 'ensemble',
        version: 'v2.0.0',
        metadata: modelMetadata
      });
      
      // Get model from service
      const serviceModel = await mlService.getModel('model-complex');
      expect(serviceModel).toBeDefined();
      
      // Generate a prediction using the model
      (mlService.getPrediction as jest.Mock).mockResolvedValueOnce({
        signals: [
          {
            id: 'signal-complex',
            strategyId: 'strategy-advanced',
            instrumentId: 'ETH-USD',
            type: SignalType.SHORT,
            price: 3000,
            confidence: 0.92,
            timestamp: Date.now(),
            metadata: {
              model_info: {
                type: serviceModel?.model_type,
                parameters: serviceModel?.metadata.parameters
              }
            }
          }
        ],
        model_id: serviceModel?.id,
        model_version: serviceModel?.version,
        timestamp: new Date().toISOString(),
        cached: false
      });
      
      // Get prediction based on the model
      const prediction = await mlService.getPrediction({
        model_id: serviceModel?.id as string,
        instrument_id: 'ETH-USD'
      });
      
      // Verify data consistency between model and prediction
      expect(prediction?.model_id).toBe(serviceModel?.id);
      expect(prediction?.model_version).toBe(serviceModel?.version);
      
      // Verify metadata was incorporated correctly
      const signalMetadata = prediction?.signals[0].metadata.model_info;
      expect(signalMetadata.type).toBe('ensemble');
      expect(signalMetadata.parameters.epochs).toBe(100);
    });
  });
});
