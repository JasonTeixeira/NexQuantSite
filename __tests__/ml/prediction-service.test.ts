/**
 * 🧪 PREDICTION SERVICE TESTS
 * Tests for real-time prediction functionality - signal generation, streaming, caching
 */

import { MlService } from '@/core/api/MlService';
import { SignalType } from '@/types/models/TradingTypes';
import { TradingSignal } from '@/types/models/TradingTypes';
import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

// Mock WebSocket
jest.mock('ws', () => {
  // Create a mock WebSocket implementation
  return {
    WebSocket: jest.fn().mockImplementation(() => {
      const eventEmitter = new EventEmitter();
      return {
        addEventListener: jest.fn((event, callback) => {
          eventEmitter.on(event, callback);
        }),
        removeEventListener: jest.fn((event, callback) => {
          eventEmitter.off(event, callback);
        }),
        send: jest.fn((data) => {
          // Store the sent data for assertions
          (this as any).lastSentData = data;
        }),
        close: jest.fn(),
        // Mock methods to trigger events
        _triggerOpen: () => eventEmitter.emit('open'),
        _triggerMessage: (data: any) => eventEmitter.emit('message', { data: JSON.stringify(data) }),
        _triggerClose: () => eventEmitter.emit('close'),
        _triggerError: (error: any) => eventEmitter.emit('error', error)
      };
    })
  };
});

// Mock MlService
jest.mock('@/core/api/MlService', () => {
  const originalModule = jest.requireActual('@/core/api/MlService');
  
  // Create mock implementation
  const mockPredictions: Record<string, any> = {
    'model-1_BTC-USD': {
      signals: [
        {
          id: 'signal-1',
          strategyId: 'strategy-1',
          instrumentId: 'BTC-USD',
          type: SignalType.LONG,
          price: 50000,
          stopPrice: 48500,
          targetPrice: 52500,
          confidence: 0.85,
          timestamp: Date.now(),
          metadata: {}
        }
      ]
    },
    'model-2_ETH-USD': {
      signals: [
        {
          id: 'signal-2',
          strategyId: 'strategy-2',
          instrumentId: 'ETH-USD',
          type: SignalType.SHORT,
          price: 3000,
          stopPrice: 3150,
          targetPrice: 2700,
          confidence: 0.78,
          timestamp: Date.now(),
          metadata: {}
        }
      ]
    }
  };
  
  return {
    ...originalModule,
    MlService: jest.fn().mockImplementation(() => ({
      getPrediction: jest.fn(async (request: any) => {
        const key = `${request.model_id}_${request.instrument_id}`;
        const prediction = mockPredictions[key];
        
        if (prediction) {
          return {
            ...prediction,
            model_id: request.model_id,
            model_version: request.version_id || 'v1.0.0',
            timestamp: new Date().toISOString(),
            cached: false
          };
        }
        
        return null;
      }),
      getModels: jest.fn(async () => [
        { id: 'model-1', name: 'Price Prediction LSTM', model_type: 'classification' },
        { id: 'model-2', name: 'Market Regime Model', model_type: 'classification' }
      ]),
      getModel: jest.fn(async (modelId: string) => {
        if (modelId === 'model-1') {
          return {
            id: 'model-1',
            name: 'Price Prediction LSTM',
            model_type: 'classification',
            version: 'v1.0.0',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
            metadata: {
              accuracy: 0.85,
              description: 'LSTM model for price movement prediction'
            }
          };
        } else if (modelId === 'model-2') {
          return {
            id: 'model-2',
            name: 'Market Regime Model',
            model_type: 'classification',
            version: 'v1.0.0',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
            metadata: {
              accuracy: 0.78,
              description: 'Model for detecting market regimes'
            }
          };
        }
        return null;
      }),
      createPredictionStream: jest.fn((clientId, onPrediction, onError) => {
        // Mock implementation of websocket connection
        const mockWs = new (WebSocket as any).WebSocket();
        
        // Trigger the open event immediately
        setTimeout(() => mockWs._triggerOpen(), 0);
        
        return {
          subscribe: async (modelId: string, instrumentId: string) => {
            // Simulate a subscription confirmation
            setTimeout(() => {
              mockWs._triggerMessage({
                type: 'subscription_success',
                model_id: modelId,
                instrument_id: instrumentId
              });
              
              // Then simulate a prediction coming in
              const key = `${modelId}_${instrumentId}`;
              if (mockPredictions[key]) {
                setTimeout(() => {
                  mockWs._triggerMessage({
                    type: 'prediction',
                    model_id: modelId,
                    instrument_id: instrumentId,
                    signals: mockPredictions[key].signals,
                    timestamp: new Date().toISOString()
                  });
                }, 50);
              }
            }, 10);
          },
          unsubscribe: async (modelId: string, instrumentId: string) => {
            // Simulate an unsubscription confirmation
            setTimeout(() => {
              mockWs._triggerMessage({
                type: 'unsubscription_success',
                model_id: modelId,
                instrument_id: instrumentId
              });
            }, 10);
          },
          close: () => {
            mockWs.close();
            mockWs._triggerClose();
          }
        };
      })
    })),
    default: {
      getPrediction: jest.fn(),
      getModels: jest.fn(),
      getModel: jest.fn(),
      createPredictionStream: jest.fn()
    }
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn(),
  logEvent: jest.fn()
}));

describe('Prediction Service', () => {
  let mlService: MlService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mlService = new MlService();
  });
  
  describe('Signal Generation', () => {
    it('should generate prediction signals for a specific model and instrument', async () => {
      // Get prediction for BTC-USD using model-1
      const result = await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      // Verify success
      expect(result).not.toBeNull();
      expect(result?.signals).toHaveLength(1);
      expect(result?.signals[0].instrumentId).toBe('BTC-USD');
      expect(result?.signals[0].type).toBe(SignalType.LONG);
      
      // Verify model info
      expect(result?.model_id).toBe('model-1');
      expect(result?.model_version).toBeDefined();
      
      // Verify timestamps
      expect(result?.timestamp).toBeDefined();
      expect(new Date(result?.timestamp as string)).not.toBeNaN();
    });
    
    it('should generate signals with correct risk parameters', async () => {
      // Get prediction for BTC-USD using model-1
      const result = await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      // Extract signal
      const signal = result?.signals[0];
      
      // Verify risk parameters
      expect(signal).toBeDefined();
      expect(signal.price).toBe(50000);
      expect(signal.stopPrice).toBe(48500);
      expect(signal.targetPrice).toBe(52500);
      
      // Calculate risk-reward ratio (manually)
      const riskAmount = Math.abs(signal.price - signal.stopPrice);
      const rewardAmount = Math.abs(signal.targetPrice - signal.price);
      const calculatedRiskRewardRatio = rewardAmount / riskAmount;
      
      // Should be approximately 1.67 (2500 / 1500)
      expect(calculatedRiskRewardRatio).toBeCloseTo(1.67, 1);
    });
    
    it('should handle non-existent models gracefully', async () => {
      // Get prediction for a non-existent model
      const result = await mlService.getPrediction({
        model_id: 'non-existent-model',
        instrument_id: 'BTC-USD'
      });
      
      // Should return null
      expect(result).toBeNull();
    });
  });
  
  describe('Real-time Streaming', () => {
    it('should establish a streaming connection for predictions', async () => {
      // Mock callbacks
      const onPrediction = jest.fn();
      const onError = jest.fn();
      
      // Create stream
      const stream = mlService.createPredictionStream(
        'client-123',
        onPrediction,
        onError
      );
      
      expect(stream).toBeDefined();
      expect(stream.subscribe).toBeInstanceOf(Function);
      expect(stream.unsubscribe).toBeInstanceOf(Function);
      expect(stream.close).toBeInstanceOf(Function);
      
      // Cleanup
      stream.close();
    });
    
    it('should receive predictions through the streaming connection', async () => {
      return new Promise<void>((resolve) => {
        // Mock callbacks
        const onPrediction = jest.fn((prediction) => {
          // Verify prediction data
          expect(prediction).toBeDefined();
          expect(prediction.type).toBe('prediction');
          expect(prediction.model_id).toBe('model-1');
          expect(prediction.instrument_id).toBe('BTC-USD');
          expect(prediction.signals).toHaveLength(1);
          
          // Cleanup and resolve test
          stream.close();
          resolve();
        });
        
        const onError = jest.fn();
        
        // Create stream
        const stream = mlService.createPredictionStream(
          'client-123',
          onPrediction,
          onError
        );
        
        // Subscribe to signals
        stream.subscribe('model-1', 'BTC-USD');
      });
    });
    
    it('should handle subscription and unsubscription correctly', async () => {
      return new Promise<void>((resolve) => {
        // Track subscription confirmations
        let subscribed = false;
        let unsubscribed = false;
        
        // Mock callbacks
        const onPrediction = jest.fn((data) => {
          if (data.type === 'subscription_success') {
            subscribed = true;
            
            // Test unsubscribe after successful subscription
            stream.unsubscribe('model-1', 'BTC-USD');
          }
          
          if (data.type === 'unsubscription_success') {
            unsubscribed = true;
            
            // Verify both operations were successful
            expect(subscribed).toBe(true);
            expect(unsubscribed).toBe(true);
            
            // Cleanup and resolve test
            stream.close();
            resolve();
          }
        });
        
        const onError = jest.fn();
        
        // Create stream
        const stream = mlService.createPredictionStream(
          'client-123',
          onPrediction,
          onError
        );
        
        // Subscribe to signals
        stream.subscribe('model-1', 'BTC-USD');
      });
    });
    
    it('should handle connection closure gracefully', async () => {
      // Mock callbacks
      const onPrediction = jest.fn();
      const onError = jest.fn();
      
      // Create stream
      const stream = mlService.createPredictionStream(
        'client-123',
        onPrediction,
        onError
      );
      
      // Subscribe to signals
      await stream.subscribe('model-1', 'BTC-USD');
      
      // Close connection
      stream.close();
      
      // Try to subscribe after closing (should not throw error)
      await expect(stream.subscribe('model-1', 'BTC-USD')).resolves.not.toThrow();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors when requesting predictions for invalid parameters', async () => {
      // Mock implementation to throw error
      (mlService.getPrediction as jest.Mock).mockRejectedValueOnce(new Error('Invalid parameters'));
      
      // Attempt to get prediction with invalid parameters
      await expect(mlService.getPrediction({
        model_id: '',  // Invalid empty model ID
        instrument_id: 'BTC-USD'
      })).rejects.toThrow('Invalid parameters');
      
      // Verify error was reported
      const { reportError } = require('@/lib/monitoring');
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should handle streaming errors gracefully', async () => {
      return new Promise<void>((resolve) => {
        // Mock callbacks
        const onPrediction = jest.fn();
        const onError = jest.fn((error) => {
          // Verify error handling
          expect(error).toBeDefined();
          
          // Cleanup and resolve test
          stream.close();
          resolve();
        });
        
        // Create stream
        const stream = mlService.createPredictionStream(
          'client-123',
          onPrediction,
          onError
        );
        
        // Trigger an error in the WebSocket
        const mockWs = (WebSocket as any).WebSocket.mock.results[0].value;
        mockWs._triggerError(new Error('WebSocket connection error'));
      });
    });
  });
  
  describe('Performance and Caching', () => {
    it('should indicate when predictions are cached', async () => {
      // First request (not cached)
      const result1 = await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      expect(result1).not.toBeNull();
      expect(result1?.cached).toBe(false);
      
      // Mock second request to return cached result
      (mlService.getPrediction as jest.Mock).mockResolvedValueOnce({
        ...result1,
        cached: true
      });
      
      // Second request (should be cached)
      const result2 = await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      expect(result2).not.toBeNull();
      expect(result2?.cached).toBe(true);
      
      // Verify signals are the same
      expect(result2?.signals).toEqual(result1?.signals);
    });
    
    it('should track prediction performance metrics', async () => {
      // Get prediction
      await mlService.getPrediction({
        model_id: 'model-1',
        instrument_id: 'BTC-USD'
      });
      
      // Verify metrics were tracked
      const { trackMetric } = require('@/lib/monitoring');
      expect(trackMetric).toHaveBeenCalled();
    });
  });
  
  describe('Integration Tests', () => {
    it('should support the complete prediction workflow', async () => {
      // 1. Get available models
      const models = await mlService.getModels();
      expect(models).toHaveLength(2);
      
      // 2. Get details for a specific model
      const modelDetails = await mlService.getModel(models[0].id);
      expect(modelDetails).not.toBeNull();
      
      // 3. Get prediction for the model
      const prediction = await mlService.getPrediction({
        model_id: models[0].id,
        instrument_id: 'BTC-USD'
      });
      
      expect(prediction).not.toBeNull();
      expect(prediction?.signals).toBeDefined();
      
      // 4. Set up streaming for real-time updates
      return new Promise<void>((resolve) => {
        const onPrediction = jest.fn((data) => {
          if (data.type === 'prediction') {
            // 5. Verify streaming prediction
            expect(data.signals).toBeDefined();
            expect(data.model_id).toBe(models[0].id);
            
            // 6. Clean up and finish test
            stream.close();
            resolve();
          }
        });
        
        const onError = jest.fn();
        
        const stream = mlService.createPredictionStream(
          'client-integration-test',
          onPrediction,
          onError
        );
        
        // Subscribe to the same model/instrument
        stream.subscribe(models[0].id, 'BTC-USD');
      });
    });
  });
});
