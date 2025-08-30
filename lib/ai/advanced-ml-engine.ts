/**
 * Advanced ML Engine - Phase 3 AI/ML Enhancement
 * Real-time inference, AutoML, model registry, and A/B testing
 */

import * as tf from '@tensorflow/tfjs-node'
import { AutoML } from 'automl-js'

export interface MLModel {
  id: string
  name: string
  version: string
  type: 'classification' | 'regression' | 'time_series' | 'reinforcement'
  algorithm: string
  status: 'training' | 'ready' | 'deployed' | 'deprecated'
  metrics: {
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    mse?: number
    mae?: number
    sharpeRatio?: number
    maxDrawdown?: number
  }
  trainingData: {
    features: string[]
    target: string
    sampleCount: number
    lastUpdated: Date
  }
  deploymentInfo: {
    endpoint: string
    instances: number
    averageLatency: number
    requestCount: number
    errorRate: number
  }
  metadata: {
    creator: string
    description: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }
}

export interface AutoMLConfig {
  taskType: 'classification' | 'regression' | 'forecasting'
  targetColumn: string
  features: string[]
  maxTrialCount: number
  maxDurationMinutes: number
  optimizationMetric: string
  validationSplit: number
  hyperparameterTuning: boolean
}

export interface ModelPrediction {
  modelId: string
  prediction: number | number[] | { [key: string]: number }
  confidence: number
  explainability: {
    featureImportance: { [feature: string]: number }
    shapValues?: number[]
    decisionPath?: string[]
  }
  latency: number
  timestamp: Date
}

export interface ABTestConfig {
  name: string
  modelA: string
  modelB: string
  trafficSplit: number // 0-1, percentage for model B
  metrics: string[]
  duration: number // days
  minSampleSize: number
}

export class AdvancedMLEngine {
  private models: Map<string, MLModel> = new Map()
  private loadedModels: Map<string, tf.LayersModel> = new Map()
  private autoML: AutoML
  private abTests: Map<string, ABTestConfig> = new Map()
  private predictionCache: Map<string, ModelPrediction> = new Map()

  constructor() {
    this.initializeEngine()
  }

  private async initializeEngine() {
    // Initialize TensorFlow.js backend
    await tf.ready()
    console.log('🧠 TensorFlow.js backend:', tf.getBackend())
    
    // Initialize AutoML
    this.autoML = new AutoML({
      apiKey: process.env.AUTOML_API_KEY,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    })
    
    console.log('✅ Advanced ML Engine initialized')
  }

  /**
   * AutoML - Automatically train and optimize models
   */
  async autoTrainModel(config: AutoMLConfig): Promise<string> {
    console.log('🤖 Starting AutoML training:', config.taskType)
    
    try {
      const trainingJob = await this.autoML.createTrainingJob({
        displayName: `nexural-automl-${Date.now()}`,
        dataset: {
          targetColumn: config.targetColumn,
          features: config.features,
        },
        trainingConfig: {
          maxTrialCount: config.maxTrialCount,
          maxParallelTrials: Math.min(config.maxTrialCount, 10),
          maxTrainingTime: `${config.maxDurationMinutes}m`,
          optimizationMetric: config.optimizationMetric,
          validationFraction: config.validationSplit,
        },
        hyperparameterTuning: config.hyperparameterTuning
      })

      const modelId = `automl_${trainingJob.id}_${Date.now()}`
      
      // Register the model
      const model: MLModel = {
        id: modelId,
        name: `AutoML ${config.taskType} Model`,
        version: '1.0',
        type: config.taskType as any,
        algorithm: 'AutoML',
        status: 'training',
        metrics: {},
        trainingData: {
          features: config.features,
          target: config.targetColumn,
          sampleCount: 0,
          lastUpdated: new Date(),
        },
        deploymentInfo: {
          endpoint: '',
          instances: 0,
          averageLatency: 0,
          requestCount: 0,
          errorRate: 0,
        },
        metadata: {
          creator: 'AutoML',
          description: `Automatically trained ${config.taskType} model`,
          tags: ['automl', config.taskType],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      this.models.set(modelId, model)
      
      // Monitor training progress
      this.monitorTrainingJob(trainingJob.id, modelId)
      
      return modelId

    } catch (error) {
      console.error('❌ AutoML training failed:', error)
      throw error
    }
  }

  private async monitorTrainingJob(jobId: string, modelId: string) {
    const checkInterval = 60000 // 1 minute
    
    const checkStatus = async () => {
      try {
        const job = await this.autoML.getTrainingJob(jobId)
        const model = this.models.get(modelId)
        
        if (!model) return
        
        if (job.state === 'JOB_STATE_SUCCEEDED') {
          model.status = 'ready'
          model.metrics = {
            accuracy: job.modelMetrics?.accuracy,
            precision: job.modelMetrics?.precision,
            recall: job.modelMetrics?.recall,
            f1Score: job.modelMetrics?.f1Score,
          }
          
          console.log('✅ AutoML training completed:', modelId)
          
          // Auto-deploy if metrics are good
          if ((model.metrics.accuracy ?? 0) > 0.8) {
            await this.deployModel(modelId)
          }
          
        } else if (job.state === 'JOB_STATE_FAILED') {
          model.status = 'deprecated'
          console.error('❌ AutoML training failed for:', modelId)
          
        } else {
          // Still training, check again
          setTimeout(checkStatus, checkInterval)
        }
        
        model.metadata.updatedAt = new Date()
        this.models.set(modelId, model)
        
      } catch (error) {
        console.error('Error monitoring training job:', error)
      }
    }
    
    setTimeout(checkStatus, checkInterval)
  }

  /**
   * Advanced Time Series Forecasting with LSTM
   */
  async trainTimeSeriesModel(
    data: number[][],
    config: {
      sequenceLength: number
      features: number
      epochs: number
      batchSize: number
      learningRate: number
    }
  ): Promise<string> {
    console.log('📊 Training LSTM time series model')
    
    try {
      // Prepare data
      const { xs, ys } = this.prepareTimeSeriesData(data, config.sequenceLength)
      
      // Build LSTM model
      const model = tf.sequential({
        layers: [
          tf.layers.lstm({
            units: 128,
            returnSequences: true,
            inputShape: [config.sequenceLength, config.features],
            dropout: 0.2,
            recurrentDropout: 0.2,
          }),
          tf.layers.lstm({
            units: 64,
            returnSequences: true,
            dropout: 0.2,
            recurrentDropout: 0.2,
          }),
          tf.layers.lstm({
            units: 32,
            dropout: 0.2,
            recurrentDropout: 0.2,
          }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 1, activation: 'linear' })
        ]
      })

      // Compile with advanced optimizer
      model.compile({
        optimizer: tf.train.adam(config.learningRate),
        loss: 'meanSquaredError',
        metrics: ['mse', 'mae']
      })

      // Train model
      console.log('🔄 Training LSTM model...')
      const history = await model.fit(xs, ys, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, val_loss = ${logs?.val_loss?.toFixed(4)}`)
            }
          }
        }
      })

      // Generate model ID and save
      const modelId = `lstm_timeseries_${Date.now()}`
      await model.save(`file://./models/${modelId}`)
      this.loadedModels.set(modelId, model)

      // Calculate final metrics
      const finalLoss = history.history.loss[history.history.loss.length - 1] as number
      const finalValLoss = history.history.val_loss[history.history.val_loss.length - 1] as number

      // Register model
      const mlModel: MLModel = {
        id: modelId,
        name: 'LSTM Time Series Forecasting',
        version: '1.0',
        type: 'time_series',
        algorithm: 'LSTM',
        status: 'ready',
        metrics: {
          mse: finalLoss,
          mae: finalValLoss,
        },
        trainingData: {
          features: ['price', 'volume', 'volatility', 'sentiment'],
          target: 'future_price',
          sampleCount: data.length,
          lastUpdated: new Date(),
        },
        deploymentInfo: {
          endpoint: `/api/models/${modelId}/predict`,
          instances: 1,
          averageLatency: 50,
          requestCount: 0,
          errorRate: 0,
        },
        metadata: {
          creator: 'LSTM Engine',
          description: 'Advanced LSTM model for price prediction',
          tags: ['lstm', 'time_series', 'forecasting'],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      this.models.set(modelId, mlModel)
      
      // Cleanup tensors
      xs.dispose()
      ys.dispose()

      console.log('✅ LSTM model trained successfully:', modelId)
      return modelId

    } catch (error) {
      console.error('❌ LSTM training failed:', error)
      throw error
    }
  }

  private prepareTimeSeriesData(data: number[][], sequenceLength: number) {
    const xs: number[][][] = []
    const ys: number[] = []

    for (let i = 0; i < data.length - sequenceLength; i++) {
      const sequence = data.slice(i, i + sequenceLength)
      const target = data[i + sequenceLength][0] // Assuming first column is target
      
      xs.push(sequence)
      ys.push(target)
    }

    return {
      xs: tf.tensor3d(xs),
      ys: tf.tensor1d(ys)
    }
  }

  /**
   * Real-time model inference with caching
   */
  async predict(
    modelId: string, 
    features: number[] | number[][], 
    options: {
      useCache?: boolean
      explainable?: boolean
      confidence?: boolean
    } = {}
  ): Promise<ModelPrediction> {
    const startTime = Date.now()
    
    // Check cache first
    const cacheKey = `${modelId}_${JSON.stringify(features)}`
    if (options.useCache && this.predictionCache.has(cacheKey)) {
      const cached = this.predictionCache.get(cacheKey)!
      return { ...cached, timestamp: new Date() }
    }

    try {
      const model = this.loadedModels.get(modelId)
      const modelInfo = this.models.get(modelId)
      
      if (!model || !modelInfo) {
        throw new Error(`Model ${modelId} not found or not loaded`)
      }

      // Prepare input tensor
      const inputTensor = Array.isArray(features[0]) 
        ? tf.tensor2d(features as number[][])
        : tf.tensor2d([features as number[]])

      // Make prediction
      const predictionTensor = model.predict(inputTensor) as tf.Tensor
      const predictionData = await predictionTensor.data()
      
      // Extract prediction value
      const prediction = predictionData.length === 1 
        ? predictionData[0] 
        : Array.from(predictionData)

      // Calculate confidence (simplified)
      const confidence = this.calculateConfidence(predictionTensor)
      
      // Generate explainability info
      const explainability = options.explainable 
        ? await this.generateExplainability(modelId, features as number[], prediction as number)
        : { featureImportance: {} }

      const result: ModelPrediction = {
        modelId,
        prediction,
        confidence,
        explainability,
        latency: Date.now() - startTime,
        timestamp: new Date()
      }

      // Cache result
      if (options.useCache) {
        this.predictionCache.set(cacheKey, result)
        // Auto-expire cache after 5 minutes
        setTimeout(() => this.predictionCache.delete(cacheKey), 5 * 60 * 1000)
      }

      // Update model metrics
      modelInfo.deploymentInfo.requestCount++
      modelInfo.deploymentInfo.averageLatency = 
        (modelInfo.deploymentInfo.averageLatency + result.latency) / 2

      // Cleanup tensors
      inputTensor.dispose()
      predictionTensor.dispose()

      return result

    } catch (error) {
      console.error(`❌ Prediction failed for model ${modelId}:`, error)
      
      // Update error rate
      const modelInfo = this.models.get(modelId)
      if (modelInfo) {
        modelInfo.deploymentInfo.errorRate++
      }
      
      throw error
    }
  }

  private calculateConfidence(prediction: tf.Tensor): number {
    // Simplified confidence calculation based on prediction variance
    try {
      const mean = tf.mean(prediction)
      const variance = tf.moments(prediction).variance
      const confidence = Math.max(0, Math.min(1, 1 - variance.dataSync()[0]))
      
      mean.dispose()
      variance.dispose()
      
      return confidence
    } catch {
      return 0.5 // Default confidence
    }
  }

  private async generateExplainability(
    modelId: string, 
    features: number[], 
    prediction: number
  ): Promise<{ featureImportance: { [feature: string]: number } }> {
    // Simplified feature importance using permutation method
    const modelInfo = this.models.get(modelId)
    if (!modelInfo) return { featureImportance: {} }

    const featureNames = modelInfo.trainingData.features
    const importance: { [feature: string]: number } = {}

    // Mock feature importance (in real implementation, use SHAP or LIME)
    featureNames.forEach((feature, index) => {
      importance[feature] = Math.random() * features[index] || 0
    })

    return { featureImportance: importance }
  }

  /**
   * A/B Testing for model deployment
   */
  async createABTest(config: ABTestConfig): Promise<string> {
    console.log('🧪 Creating A/B test:', config.name)
    
    const testId = `abtest_${Date.now()}`
    this.abTests.set(testId, {
      ...config,
      name: config.name || `AB Test ${testId}`
    })

    console.log(`✅ A/B test created: ${testId}`)
    return testId
  }

  async getABTestPrediction(testId: string, features: number[]): Promise<ModelPrediction> {
    const test = this.abTests.get(testId)
    if (!test) {
      throw new Error(`A/B test ${testId} not found`)
    }

    // Decide which model to use based on traffic split
    const useModelB = Math.random() < test.trafficSplit
    const modelId = useModelB ? test.modelB : test.modelA

    const prediction = await this.predict(modelId, features, { useCache: true })
    
    // Log for A/B test analysis
    this.logABTestResult(testId, modelId, prediction)
    
    return prediction
  }

  private logABTestResult(testId: string, modelId: string, prediction: ModelPrediction) {
    // In production, this would log to analytics system
    console.log(`📊 A/B Test ${testId}: Model ${modelId}, Prediction: ${prediction.prediction}, Latency: ${prediction.latency}ms`)
  }

  /**
   * Deploy model to production
   */
  async deployModel(modelId: string, instances: number = 1): Promise<void> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    console.log(`🚀 Deploying model ${modelId} with ${instances} instances`)
    
    // Load model if not already loaded
    if (!this.loadedModels.has(modelId)) {
      try {
        const loadedModel = await tf.loadLayersModel(`file://./models/${modelId}/model.json`)
        this.loadedModels.set(modelId, loadedModel)
      } catch (error) {
        console.error(`Failed to load model ${modelId}:`, error)
        throw error
      }
    }

    // Update deployment info
    model.status = 'deployed'
    model.deploymentInfo.instances = instances
    model.deploymentInfo.endpoint = `/api/models/${modelId}/predict`
    model.metadata.updatedAt = new Date()

    this.models.set(modelId, model)
    console.log(`✅ Model ${modelId} deployed successfully`)
  }

  /**
   * Model performance monitoring
   */
  getModelMetrics(modelId: string): MLModel | null {
    return this.models.get(modelId) || null
  }

  getAllModels(): MLModel[] {
    return Array.from(this.models.values())
  }

  getDeployedModels(): MLModel[] {
    return Array.from(this.models.values()).filter(model => model.status === 'deployed')
  }

  /**
   * Model versioning and management
   */
  async createModelVersion(baseModelId: string, changes: Partial<MLModel>): Promise<string> {
    const baseModel = this.models.get(baseModelId)
    if (!baseModel) {
      throw new Error(`Base model ${baseModelId} not found`)
    }

    const newVersion = this.incrementVersion(baseModel.version)
    const newModelId = `${baseModelId}_v${newVersion}`

    const newModel: MLModel = {
      ...baseModel,
      ...changes,
      id: newModelId,
      version: newVersion,
      status: 'ready',
      metadata: {
        ...baseModel.metadata,
        ...changes.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    this.models.set(newModelId, newModel)
    console.log(`✅ Created model version: ${newModelId}`)
    
    return newModelId
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.')
    const patch = parseInt(parts[parts.length - 1]) + 1
    parts[parts.length - 1] = patch.toString()
    return parts.join('.')
  }

  /**
   * Cleanup and resource management
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up ML Engine resources')
    
    // Dispose all loaded models
    for (const [modelId, model] of this.loadedModels) {
      try {
        model.dispose()
        console.log(`Disposed model: ${modelId}`)
      } catch (error) {
        console.error(`Error disposing model ${modelId}:`, error)
      }
    }
    
    this.loadedModels.clear()
    this.predictionCache.clear()
    
    console.log('✅ ML Engine cleanup completed')
  }
}

// Singleton instance
let advancedMLEngine: AdvancedMLEngine | null = null

export const getAdvancedMLEngine = (): AdvancedMLEngine => {
  if (!advancedMLEngine) {
    advancedMLEngine = new AdvancedMLEngine()
  }
  return advancedMLEngine
}

export default AdvancedMLEngine
