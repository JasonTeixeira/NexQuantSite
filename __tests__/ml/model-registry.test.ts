/**
 * 🧪 MODEL REGISTRY TESTS
 * Tests for model registry functionality - versioning, metadata, lifecycle management
 */

import { ModelRegistry } from '@/lib/ml/model-registry';
import { ModelType, ModelCategory } from '@/lib/shared/trading/strategy-types';
import { StorageProvider } from '@/lib/services/storage-service';
import * as fs from 'fs';
import * as path from 'path';

// Mock storage provider
jest.mock('@/lib/services/storage-service', () => {
  const mockStorage: Record<string, any> = {};
  
  return {
    StorageProvider: jest.fn().mockImplementation(() => ({
      saveFile: jest.fn((key: string, data: any) => {
        mockStorage[key] = data;
        return Promise.resolve({ success: true, key });
      }),
      getFile: jest.fn((key: string) => {
        if (mockStorage[key]) {
          return Promise.resolve({ success: true, data: mockStorage[key] });
        }
        return Promise.resolve({ success: false, error: 'File not found' });
      }),
      listFiles: jest.fn((prefix: string) => {
        const keys = Object.keys(mockStorage).filter(k => k.startsWith(prefix));
        return Promise.resolve({ success: true, keys });
      }),
      deleteFile: jest.fn((key: string) => {
        if (mockStorage[key]) {
          delete mockStorage[key];
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: false, error: 'File not found' });
      })
    }))
  };
});

// Mock database
jest.mock('@/lib/database/database', () => {
  // Mock model records
  const mockModels: any[] = [];
  
  return {
    db: {
      query: jest.fn().mockImplementation((query: string, params: any[] = []) => {
        // Insert model record
        if (query.includes('INSERT INTO ml_models')) {
          const model = {
            id: `model-${mockModels.length + 1}`,
            name: params[0],
            version: params[1],
            category: params[2],
            type: params[3],
            status: params[4],
            metadata: params[5],
            created_at: new Date(),
            updated_at: new Date()
          };
          mockModels.push(model);
          return Promise.resolve({ rows: [model] });
        }
        
        // Update model status
        if (query.includes('UPDATE ml_models SET status')) {
          const status = params[0];
          const modelId = params[1];
          
          const modelIndex = mockModels.findIndex(m => m.id === modelId);
          if (modelIndex !== -1) {
            mockModels[modelIndex].status = status;
            mockModels[modelIndex].updated_at = new Date();
            return Promise.resolve({ rowCount: 1 });
          }
          return Promise.resolve({ rowCount: 0 });
        }
        
        // Get active model
        if (query.includes('SELECT * FROM ml_models WHERE status = \'active\'')) {
          const category = params[0];
          const type = params[1];
          
          const model = mockModels.find(m => 
            m.status === 'active' && 
            m.category === category && 
            m.type === type
          );
          
          return Promise.resolve({ rows: model ? [model] : [] });
        }
        
        // Get model by id
        if (query.includes('SELECT * FROM ml_models WHERE id')) {
          const id = params[0];
          const model = mockModels.find(m => m.id === id);
          return Promise.resolve({ rows: model ? [model] : [] });
        }
        
        // Get models by type/category
        if (query.includes('SELECT * FROM ml_models WHERE category')) {
          const category = params[0];
          const type = params[1];
          
          const filteredModels = mockModels.filter(m => 
            m.category === category && 
            (type ? m.type === type : true)
          );
          
          return Promise.resolve({ rows: filteredModels });
        }
        
        // Get all models
        if (query.includes('SELECT * FROM ml_models')) {
          return Promise.resolve({ rows: [...mockModels] });
        }
        
        // For other queries, return empty result
        return Promise.resolve({ rows: [] });
      })
    }
  };
});

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  reportError: jest.fn(),
  trackMetric: jest.fn(),
  logEvent: jest.fn()
}));

describe('Model Registry', () => {
  let registry: ModelRegistry;
  
  beforeEach(() => {
    jest.clearAllMocks();
    registry = new ModelRegistry();
  });
  
  describe('Model Registration', () => {
    it('should register a new model successfully', async () => {
      // Test model data
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: {
          description: 'LSTM model for price movement prediction',
          accuracy: 0.85,
          training_data: 'AAPL,MSFT,GOOG 2020-2025',
          parameters: {
            layers: 3,
            units: 64,
            dropout: 0.2
          }
        }
      };
      
      // Mock model binary data
      const modelBinary = Buffer.from('mock model binary data');
      
      // Register the model
      const result = await registry.registerModel(modelData, modelBinary);
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.modelId).toBeDefined();
      
      // Verify model was stored in database
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ml_models'),
        expect.arrayContaining([
          modelData.name,
          modelData.version,
          modelData.category,
          modelData.type,
          'inactive', // Default status should be inactive
          expect.any(Object) // Metadata
        ])
      );
      
      // Verify model binary was stored
      const { StorageProvider } = require('@/lib/services/storage-service');
      const storageInstance = StorageProvider.mock.results[0].value;
      expect(storageInstance.saveFile).toHaveBeenCalledWith(
        expect.stringContaining(result.modelId as string),
        modelBinary
      );
      
      // Verify event was logged
      const { logEvent } = require('@/lib/monitoring');
      expect(logEvent).toHaveBeenCalledWith(
        'model_registered',
        expect.objectContaining({
          model_id: result.modelId,
          model_name: modelData.name,
          model_version: modelData.version
        })
      );
    });
    
    it('should reject registration with invalid model data', async () => {
      // Test invalid model data (missing required fields)
      const invalidModelData = {
        name: 'price_movement_lstm',
        // Missing version
        category: ModelCategory.PRICE_PREDICTION,
        // Missing type
        metadata: {}
      };
      
      // Mock model binary data
      const modelBinary = Buffer.from('mock model binary data');
      
      // Try to register the model
      const result = await registry.registerModel(invalidModelData as any, modelBinary);
      
      // Verify failure
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
      
      // Verify no database insertion was attempted
      const { db } = require('@/lib/database/database');
      expect(db.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ml_models'),
        expect.any(Array)
      );
      
      // Verify no storage operation was attempted
      const { StorageProvider } = require('@/lib/services/storage-service');
      const storageInstance = StorageProvider.mock.results[0].value;
      expect(storageInstance.saveFile).not.toHaveBeenCalled();
    });
    
    it('should handle duplicate model version', async () => {
      // First register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'First model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      
      // Successfully register first model
      await registry.registerModel(modelData, modelBinary);
      
      // Now try to register a model with the same name and version
      const duplicateModelData = {
        ...modelData,
        metadata: { description: 'Duplicate model' }
      };
      
      // Mock database to throw a unique constraint violation
      const { db } = require('@/lib/database/database');
      db.query.mockRejectedValueOnce({
        code: '23505', // PostgreSQL unique violation code
        detail: 'Key (name, version)=(price_movement_lstm, v1.0.0) already exists.'
      });
      
      // Try to register the duplicate model
      const result = await registry.registerModel(duplicateModelData, modelBinary);
      
      // Verify failure with appropriate error
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });
  
  describe('Model Retrieval', () => {
    it('should get model by ID', async () => {
      // Setup: Register a model first
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Now retrieve the model
      const result = await registry.getModel(modelId);
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.model?.id).toBe(modelId);
      expect(result.model?.name).toBe(modelData.name);
      expect(result.model?.version).toBe(modelData.version);
      
      // Verify database query was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM ml_models WHERE id'),
        [modelId]
      );
    });
    
    it('should get active model for specific type and category', async () => {
      // Setup: Register and activate a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Activate the model
      await registry.activateModel(modelId);
      
      // Now retrieve the active model for this category and type
      const result = await registry.getActiveModel(
        ModelCategory.PRICE_PREDICTION,
        ModelType.LSTM
      );
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.model?.id).toBe(modelId);
      expect(result.model?.status).toBe('active');
      
      // Verify database query was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM ml_models WHERE status = \'active\''),
        [ModelCategory.PRICE_PREDICTION, ModelType.LSTM]
      );
    });
    
    it('should return all models for a category', async () => {
      // Setup: Register multiple models
      const modelData1 = {
        name: 'price_model_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'LSTM model' }
      };
      
      const modelData2 = {
        name: 'price_model_ensemble',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.ENSEMBLE,
        metadata: { description: 'Ensemble model' }
      };
      
      const modelData3 = {
        name: 'volatility_model',
        version: 'v1.0.0',
        category: ModelCategory.VOLATILITY_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Volatility model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      
      await registry.registerModel(modelData1, modelBinary);
      await registry.registerModel(modelData2, modelBinary);
      await registry.registerModel(modelData3, modelBinary);
      
      // Now retrieve all models for price prediction
      const result = await registry.getModelsByCategory(ModelCategory.PRICE_PREDICTION);
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.models).toBeDefined();
      expect(result.models?.length).toBe(2); // Should have 2 price prediction models
      
      // Verify the models are correctly filtered
      const modelNames = result.models?.map(m => m.name);
      expect(modelNames).toContain('price_model_lstm');
      expect(modelNames).toContain('price_model_ensemble');
      expect(modelNames).not.toContain('volatility_model');
      
      // Verify database query was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM ml_models WHERE category'),
        [ModelCategory.PRICE_PREDICTION, null]
      );
    });
  });
  
  describe('Model Lifecycle Management', () => {
    it('should activate a model', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Activate the model
      const result = await registry.activateModel(modelId);
      
      // Verify success
      expect(result.success).toBe(true);
      
      // Verify database update was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ml_models SET status'),
        ['active', modelId]
      );
      
      // Verify event was logged
      const { logEvent } = require('@/lib/monitoring');
      expect(logEvent).toHaveBeenCalledWith(
        'model_activated',
        expect.objectContaining({ model_id: modelId })
      );
    });
    
    it('should deactivate previous active model when activating a new one', async () => {
      // Setup: Register two models of the same type and category
      const modelData1 = {
        name: 'price_model_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'First model' }
      };
      
      const modelData2 = {
        name: 'price_model_lstm',
        version: 'v2.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Second model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      
      const reg1 = await registry.registerModel(modelData1, modelBinary);
      const reg2 = await registry.registerModel(modelData2, modelBinary);
      
      const modelId1 = reg1.modelId as string;
      const modelId2 = reg2.modelId as string;
      
      // Activate the first model
      await registry.activateModel(modelId1);
      
      // Clear mocks to track the next calls
      jest.clearAllMocks();
      
      // Now activate the second model
      await registry.activateModel(modelId2);
      
      // Verify database was called to deactivate the previous model
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ml_models SET status'),
        ['inactive', expect.any(String)]
      );
      
      // And then to activate the new model
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ml_models SET status'),
        ['active', modelId2]
      );
    });
    
    it('should deprecate a model', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Deprecate the model
      const result = await registry.deprecateModel(modelId);
      
      // Verify success
      expect(result.success).toBe(true);
      
      // Verify database update was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ml_models SET status'),
        ['deprecated', modelId]
      );
      
      // Verify event was logged
      const { logEvent } = require('@/lib/monitoring');
      expect(logEvent).toHaveBeenCalledWith(
        'model_deprecated',
        expect.objectContaining({ model_id: modelId })
      );
    });
    
    it('should archive a model', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Archive the model
      const result = await registry.archiveModel(modelId);
      
      // Verify success
      expect(result.success).toBe(true);
      
      // Verify database update was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ml_models SET status'),
        ['archived', modelId]
      );
      
      // Verify event was logged
      const { logEvent } = require('@/lib/monitoring');
      expect(logEvent).toHaveBeenCalledWith(
        'model_archived',
        expect.objectContaining({ model_id: modelId })
      );
    });
  });
  
  describe('Model Binary Management', () => {
    it('should load model binary', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const originalModelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, originalModelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Load the model binary
      const result = await registry.loadModelBinary(modelId);
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.binary).toBeDefined();
      
      // Verify storage provider was called correctly
      const { StorageProvider } = require('@/lib/services/storage-service');
      const storageInstance = StorageProvider.mock.results[0].value;
      expect(storageInstance.getFile).toHaveBeenCalledWith(
        expect.stringContaining(modelId)
      );
      
      // Verify metrics were tracked
      const { trackMetric } = require('@/lib/monitoring');
      expect(trackMetric).toHaveBeenCalledWith(
        'model_binary_loaded',
        1
      );
    });
    
    it('should update model binary', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const originalModelBinary = Buffer.from('original model binary');
      const registrationResult = await registry.registerModel(modelData, originalModelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Update the model binary
      const updatedModelBinary = Buffer.from('updated model binary');
      const result = await registry.updateModelBinary(modelId, updatedModelBinary);
      
      // Verify success
      expect(result.success).toBe(true);
      
      // Verify storage provider was called correctly
      const { StorageProvider } = require('@/lib/services/storage-service');
      const storageInstance = StorageProvider.mock.results[0].value;
      expect(storageInstance.saveFile).toHaveBeenCalledWith(
        expect.stringContaining(modelId),
        updatedModelBinary
      );
      
      // Verify event was logged
      const { logEvent } = require('@/lib/monitoring');
      expect(logEvent).toHaveBeenCalledWith(
        'model_binary_updated',
        expect.objectContaining({ model_id: modelId })
      );
    });
  });
  
  describe('Model Metadata Management', () => {
    it('should update model metadata', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { 
          description: 'Original description',
          accuracy: 0.8
        }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Update metadata
      const updatedMetadata = {
        description: 'Updated description',
        accuracy: 0.85,
        new_field: 'New information'
      };
      
      const result = await registry.updateModelMetadata(modelId, updatedMetadata);
      
      // Verify success
      expect(result.success).toBe(true);
      
      // Verify database update was correct
      const { db } = require('@/lib/database/database');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ml_models SET metadata'),
        [expect.any(Object), modelId]
      );
      
      // Check that the updated metadata was sent correctly
      const updatedMetadataArg = db.query.mock.calls[0][1][0];
      expect(updatedMetadataArg.description).toBe('Updated description');
      expect(updatedMetadataArg.accuracy).toBe(0.85);
      expect(updatedMetadataArg.new_field).toBe('New information');
    });
    
    it('should merge new metadata with existing metadata', async () => {
      // Mock the db.query implementation to return a model with existing metadata
      const { db } = require('@/lib/database/database');
      
      // Setup existing model in the mock
      const existingModel = {
        id: 'existing-model-id',
        name: 'price_movement_lstm',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        status: 'inactive',
        metadata: {
          description: 'Original description',
          accuracy: 0.8,
          training_date: '2025-01-01',
          parameters: {
            layers: 3,
            units: 64
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock to return the existing model
      db.query.mockImplementationOnce((query, params) => {
        if (query.includes('SELECT * FROM ml_models WHERE id')) {
          return Promise.resolve({ rows: [existingModel] });
        }
        return Promise.resolve({ rows: [] });
      });
      
      // Update only some fields in the metadata
      const partialUpdate = {
        accuracy: 0.85,
        parameters: {
          dropout: 0.2
          // Note: 'layers' and 'units' are not included
        }
      };
      
      // Update the metadata
      const result = await registry.updateModelMetadata('existing-model-id', partialUpdate);
      
      // Verify success
      expect(result.success).toBe(true);
      
      // Check the merged metadata
      // Get the metadata that was passed to the update query
      const updateCall = db.query.mock.calls.find(call => 
        call[0].includes('UPDATE ml_models SET metadata')
      );
      
      const mergedMetadata = updateCall[1][0];
      
      // Verify original fields were preserved
      expect(mergedMetadata.description).toBe('Original description');
      expect(mergedMetadata.training_date).toBe('2025-01-01');
      
      // Verify updated fields
      expect(mergedMetadata.accuracy).toBe(0.85);
      
      // Verify nested objects were merged correctly
      expect(mergedMetadata.parameters.layers).toBe(3);  // Original value
      expect(mergedMetadata.parameters.units).toBe(64);  // Original value
      expect(mergedMetadata.parameters.dropout).toBe(0.2); // New value
    });
  });
  
  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const { db } = require('@/lib/database/database');
      db.query.mockRejectedValueOnce(new Error('Database connection error'));
      
      // Try to get a model
      const result = await registry.getModel('non-existent-id');
      
      // Verify error handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('database');
      
      // Verify error was reported
      const { reportError } = require('@/lib/monitoring');
      expect(reportError).toHaveBeenCalled();
    });
    
    it('should handle storage errors gracefully', async () => {
      // Setup: Register a model
      const modelData = {
        name: 'error_model',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model' }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // Mock storage error
      const { StorageProvider } = require('@/lib/services/storage-service');
      const storageInstance = StorageProvider.mock.results[0].value;
      storageInstance.getFile.mockRejectedValueOnce(new Error('Storage error'));
      
      // Try to load the model binary
      const result = await registry.loadModelBinary(modelId);
      
      // Verify error handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('storage');
      
      // Verify error was reported
      const { reportError } = require('@/lib/monitoring');
      expect(reportError).toHaveBeenCalled();
    });
  });
  
  describe('Model Selection', () => {
    it('should select the appropriate model based on criteria', async () => {
      // Setup: Register multiple models
      const modelData1 = {
        name: 'price_model_v1',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.ENSEMBLE,
        metadata: { 
          accuracy: 0.82,
          latency: 50
        }
      };
      
      const modelData2 = {
        name: 'price_model_v2',
        version: 'v2.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.ENSEMBLE,
        metadata: { 
          accuracy: 0.88,
          latency: 120
        }
      };
      
      const modelData3 = {
        name: 'price_model_lightweight',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LIGHTWEIGHT,
        metadata: { 
          accuracy: 0.78,
          latency: 20
        }
      };
      
      const modelBinary = Buffer.from('mock model binary data');
      
      await registry.registerModel(modelData1, modelBinary);
      await registry.registerModel(modelData2, modelBinary);
      await registry.registerModel(modelData3, modelBinary);
      
      // Test selecting the best model by accuracy
      const resultByAccuracy = await registry.selectModelByCriteria(
        ModelCategory.PRICE_PREDICTION,
        ModelType.ENSEMBLE,
        'accuracy',
        true // higher is better
      );
      
      // Verify we got the model with highest accuracy
      expect(resultByAccuracy.success).toBe(true);
      expect(resultByAccuracy.model?.name).toBe('price_model_v2');
      expect(resultByAccuracy.model?.metadata.accuracy).toBe(0.88);
      
      // Test selecting the best model by lowest latency
      const resultByLatency = await registry.selectModelByCriteria(
        ModelCategory.PRICE_PREDICTION,
        null, // any type
        'latency',
        false // lower is better
      );
      
      // Verify we got the model with lowest latency
      expect(resultByLatency.success).toBe(true);
      expect(resultByLatency.model?.name).toBe('price_model_lightweight');
      expect(resultByLatency.model?.metadata.latency).toBe(20);
    });
    
    it('should handle model selection when no models match criteria', async () => {
      // Try to select a model for a category with no registered models
      const result = await registry.selectModelByCriteria(
        ModelCategory.VOLATILITY_PREDICTION,
        ModelType.LSTM,
        'accuracy',
        true
      );
      
      // Verify appropriate error handling
      expect(result.success).toBe(false);
      expect(result.error).toContain('No models found');
    });
  });
  
  describe('Integration Tests', () => {
    it('should support the complete lifecycle of a model', async () => {
      // 1. Register a model
      const modelData = {
        name: 'lifecycle_test_model',
        version: 'v1.0.0',
        category: ModelCategory.PRICE_PREDICTION,
        type: ModelType.LSTM,
        metadata: { description: 'Test model for lifecycle testing' }
      };
      
      const modelBinary = Buffer.from('original model binary');
      const registrationResult = await registry.registerModel(modelData, modelBinary);
      const modelId = registrationResult.modelId as string;
      
      // 2. Verify model exists
      const getResult = await registry.getModel(modelId);
      expect(getResult.success).toBe(true);
      expect(getResult.model?.name).toBe(modelData.name);
      
      // 3. Update model metadata
      const updatedMetadata = {
        description: 'Updated description',
        accuracy: 0.92
      };
      
      await registry.updateModelMetadata(modelId, updatedMetadata);
      
      // 4. Activate the model
      await registry.activateModel(modelId);
      
      // 5. Get the active model
      const activeResult = await registry.getActiveModel(
        ModelCategory.PRICE_PREDICTION,
        ModelType.LSTM
      );
      
      expect(activeResult.success).toBe(true);
      expect(activeResult.model?.id).toBe(modelId);
      expect(activeResult.model?.status).toBe('active');
      
      // 6. Update model binary
      const updatedModelBinary = Buffer.from('updated model binary');
      await registry.updateModelBinary(modelId, updatedModelBinary);
      
      // 7. Load and verify the updated binary
      const binaryResult = await registry.loadModelBinary(modelId);
      expect(binaryResult.success).toBe(true);
      expect(binaryResult.binary).toBeDefined();
      
      // 8. Deprecate the model
      await registry.deprecateModel(modelId);
      
      // 9. Verify status change
      const deprecatedResult = await registry.getModel(modelId);
      expect(deprecatedResult.model?.status).toBe('deprecated');
      
      // 10. Archive the model
      await registry.archiveModel(modelId);
      
      // 11. Verify final status
      const archivedResult = await registry.getModel(modelId);
      expect(archivedResult.model?.status).toBe('archived');
    });
  });
});
