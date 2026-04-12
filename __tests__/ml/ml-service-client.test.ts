/**
 * 🧪 ML SERVICE CLIENT TESTS
 * Tests for ML service client communication, request handling, and error management
 */

import { MlServiceClient } from '@/lib/services/ml-service-client';
import { SignalType, ModelType } from '@/lib/shared/trading/strategy-types';
import axios from 'axios';

// Mock axios for HTTP request testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn(),
  trackLatency: jest.fn()
}));

// Test configuration
const TEST_ML_API_URL = 'http://ml-api.example.com';
const TEST_API_KEY = 'test-api-key-123';

describe('ML Service Client', () => {
  let mlClient: MlServiceClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mlClient = new MlServiceClient({
      apiUrl: TEST_ML_API_URL,
      apiKey: TEST_API_KEY,
      timeout: 5000,
      retryCount: 3
    });
  });
  
  describe('API Communication', () => {
    it('should successfully fetch predictions', async () => {
      // Mock successful response
      const mockResponse = {
        data: {
          predictions: [
            { timestamp: '2025-08-30T12:00:00Z', value: 0.75, confidence: 0.92 },
            { timestamp: '2025-08-30T13:00:00Z', value: 0.82, confidence: 0.88 }
          ],
          model_version: 'v2.1.0',
          execution_time_ms: 120
        },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' }
      };
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [
          { name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] },
          { name: 'volume', values: [1200000, 980000, 1500000, 1100000, 1300000] }
        ]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify the result
      expect(result.success).toBe(true);
      expect(result.predictions).toHaveLength(2);
      expect(result.modelVersion).toBe('v2.1.0');
      
      // Verify the request was made correctly
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(TEST_ML_API_URL),
        expect.objectContaining({
          data: inputData,
          signal_type: SignalType.PRICE_MOVEMENT,
          model_type: ModelType.ENSEMBLE
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${TEST_API_KEY}`,
            'Content-Type': 'application/json'
          }),
          timeout: 5000
        })
      );
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock API error response
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal server error', message: 'ML service unavailable' }
        }
      });
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [
          { name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }
        ]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify error handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('ML service unavailable');
      
      // Verify error was reported
      const { reportError } = require('@/lib/monitoring');
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should retry failed requests before giving up', async () => {
      // Mock network failures for the first 2 attempts, then succeed
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            predictions: [{ timestamp: '2025-08-30T12:00:00Z', value: 0.75, confidence: 0.92 }],
            model_version: 'v2.1.0',
            execution_time_ms: 120
          },
          status: 200
        });
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify the result after retries
      expect(result.success).toBe(true);
      expect(result.predictions).toHaveLength(1);
      
      // Verify that axios.post was called 3 times (2 failures + 1 success)
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('Request Formatting', () => {
    it('should format time series data correctly', async () => {
      // Mock successful response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          predictions: [{ timestamp: '2025-08-30T12:00:00Z', value: 0.75, confidence: 0.92 }],
          model_version: 'v2.1.0',
          execution_time_ms: 120
        },
        status: 200
      });
      
      // Input with raw time series data
      const timeSeriesData = {
        timestamps: [
          '2025-08-30T07:00:00Z',
          '2025-08-30T08:00:00Z',
          '2025-08-30T09:00:00Z',
          '2025-08-30T10:00:00Z',
          '2025-08-30T11:00:00Z'
        ],
        prices: [150.25, 151.80, 149.90, 152.30, 153.75],
        volumes: [1200000, 980000, 1500000, 1100000, 1300000]
      };
      
      // Call formatTimeSeriesData (assuming this method exists in the client)
      const formattedData = mlClient.formatTimeSeriesData(timeSeriesData);
      
      // Call the prediction method with formatted data
      await mlClient.getPrediction(
        formattedData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify the request payload format
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          data: expect.objectContaining({
            features: expect.arrayContaining([
              expect.objectContaining({ name: 'price' }),
              expect.objectContaining({ name: 'volume' })
            ])
          })
        }),
        expect.any(Object)
      );
      
      // Check that the feature arrays have the correct length
      const requestPayload = mockedAxios.post.mock.calls[0][1];
      expect(requestPayload.data.features[0].values).toHaveLength(5);
      expect(requestPayload.data.features[1].values).toHaveLength(5);
    });
    
    it('should validate input data before sending', async () => {
      // Create invalid data (missing required fields)
      const invalidData = {
        // Missing symbol
        timeframe: '1h',
        features: []
      };
      
      // Call the client method with invalid data
      const result = await mlClient.getPrediction(
        invalidData as any,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify validation error
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
      
      // Verify that the HTTP request was never made
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
  
  describe('Response Handling', () => {
    it('should transform API response to application model', async () => {
      // Mock API response in a specific format
      const apiResponse = {
        data: {
          predictions: [
            {
              timestamp: '2025-08-30T12:00:00Z',
              value: 0.75,
              confidence: 0.92,
              raw_score: 1.28,
              features_importance: { close: 0.7, volume: 0.3 }
            }
          ],
          model_version: 'v2.1.0',
          model_name: 'price_movement_ensemble',
          execution_time_ms: 120
        },
        status: 200
      };
      
      mockedAxios.post.mockResolvedValueOnce(apiResponse);
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify transformation to application model
      expect(result.success).toBe(true);
      expect(result.predictions[0]).toEqual(expect.objectContaining({
        timestamp: expect.any(Date), // Should be converted to Date object
        signalValue: 0.75,          // Should match value
        confidence: 0.92,           // Should match confidence
        metadata: expect.objectContaining({ // Additional data should be in metadata
          rawScore: 1.28,
          featureImportance: { close: 0.7, volume: 0.3 }
        })
      }));
      
      // Verify model info is captured
      expect(result.modelInfo).toEqual(expect.objectContaining({
        version: 'v2.1.0',
        name: 'price_movement_ensemble',
        executionTimeMs: 120
      }));
    });
    
    it('should handle missing fields in response gracefully', async () => {
      // Mock API response with missing fields
      const incompleteResponse = {
        data: {
          predictions: [
            {
              timestamp: '2025-08-30T12:00:00Z',
              value: 0.75
              // Missing confidence and other fields
            }
          ]
          // Missing model_version and execution_time_ms
        },
        status: 200
      };
      
      mockedAxios.post.mockResolvedValueOnce(incompleteResponse);
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify the client handles missing fields gracefully
      expect(result.success).toBe(true);
      expect(result.predictions[0]).toEqual(expect.objectContaining({
        timestamp: expect.any(Date),
        signalValue: 0.75,
        confidence: null // Default value for missing field
      }));
      
      expect(result.modelInfo).toEqual(expect.objectContaining({
        version: 'unknown', // Default value for missing field
        executionTimeMs: 0  // Default value for missing field
      }));
    });
  });
  
  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      // Mock timeout error
      const timeoutError = new Error('timeout of 5000ms exceeded');
      timeoutError.name = 'TimeoutError';
      mockedAxios.post.mockRejectedValueOnce(timeoutError);
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify timeout handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
      
      // Verify metrics are tracked
      const { trackMetric } = require('@/lib/monitoring');
      expect(trackMetric).toHaveBeenCalledWith(
        expect.stringContaining('timeout'),
        expect.any(Number)
      );
    });
    
    it('should handle unexpected response formats', async () => {
      // Mock invalid JSON response
      mockedAxios.post.mockResolvedValueOnce({
        data: 'This is not valid JSON',
        status: 200
      });
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify error handling for unexpected response format
      expect(result.success).toBe(false);
      expect(result.error).toContain('unexpected response format');
      
      // Verify error was reported
      const { reportError } = require('@/lib/monitoring');
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should fall back to default model if specified model is unavailable', async () => {
      // Mock failure for ENSEMBLE model
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Model not found', message: 'Ensemble model not available' }
        }
      });
      
      // Mock success for FALLBACK model
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          predictions: [{ timestamp: '2025-08-30T12:00:00Z', value: 0.65, confidence: 0.85 }],
          model_version: 'v1.5.0',
          model_name: 'fallback_model',
          execution_time_ms: 80
        },
        status: 200
      });
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method with fallback option
      const result = await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE,
        { useFallback: true }
      );
      
      // Verify fallback was successful
      expect(result.success).toBe(true);
      expect(result.modelInfo?.name).toBe('fallback_model');
      
      // Verify both calls were made
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      
      // Verify the second call used the fallback model
      const secondCallArgs = mockedAxios.post.mock.calls[1][1];
      expect(secondCallArgs.model_type).toBe(ModelType.FALLBACK);
    });
  });
  
  describe('Performance Monitoring', () => {
    it('should track latency for successful requests', async () => {
      const { trackLatency } = require('@/lib/monitoring');
      
      // Mock successful response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          predictions: [{ timestamp: '2025-08-30T12:00:00Z', value: 0.75, confidence: 0.92 }],
          model_version: 'v2.1.0',
          execution_time_ms: 120
        },
        status: 200
      });
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify latency tracking
      expect(trackLatency).toHaveBeenCalledWith(
        'ml_service_request',
        expect.any(Number)
      );
    });
    
    it('should track successful vs. failed requests', async () => {
      const { trackMetric } = require('@/lib/monitoring');
      
      // Mock successful response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          predictions: [{ timestamp: '2025-08-30T12:00:00Z', value: 0.75, confidence: 0.92 }],
          model_version: 'v2.1.0',
          execution_time_ms: 120
        },
        status: 200
      });
      
      // Test input data
      const inputData = {
        symbol: 'AAPL',
        timeframe: '1h',
        features: [{ name: 'close', values: [150.25, 151.80, 149.90, 152.30, 153.75] }]
      };
      
      // Call the client method
      await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify success metric tracking
      expect(trackMetric).toHaveBeenCalledWith(
        'ml_request_success',
        1
      );
      
      // Reset mocks for failed request test
      jest.clearAllMocks();
      
      // Mock failed response
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      
      // Call the client method again
      await mlClient.getPrediction(
        inputData,
        SignalType.PRICE_MOVEMENT,
        ModelType.ENSEMBLE
      );
      
      // Verify failure metric tracking
      expect(trackMetric).toHaveBeenCalledWith(
        'ml_request_failure',
        1
      );
    });
  });
});
