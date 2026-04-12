/**
 * Open Source ML Engine - OCHcloud Compatible
 * Replaces Google AutoML with TensorFlow.js and scikit-learn equivalent
 * Zero cloud dependencies, runs entirely on your infrastructure
 */

import * as tf from '@tensorflow/tfjs-node'
import { getClusterManager } from '../database/cluster-manager'
import { getIntelligentCache } from '../caching/intelligent-cache'

export interface ModelArchitecture {
  name: string
  layers: Array<{
    type: 'dense' | 'lstm' | 'gru' | 'conv1d' | 'dropout' | 'batchNormalization'
    config: any
  }>
  optimizer: {
    type: 'adam' | 'sgd' | 'rmsprop'
    learningRate: number
    config?: any
  }
  loss: string
  metrics: string[]
}

export interface AutoMLConfig {
  taskType: 'regression' | 'classification' | 'timeseries'
  targetColumn: string
  features: string[]
  validationSplit: number
  maxTrials: number
  maxEpochs: number
  objective: 'val_loss' | 'val_accuracy' | 'val_mae' | 'val_mse'
  patience: number
  batchSize: number
}

export interface ModelPerformance {
  loss: number
  accuracy?: number
  mae?: number
  mse?: number
  r2Score?: number
  precision?: number
  recall?: number
  f1Score?: number
  validationMetrics: { [key: string]: number }
  trainingTime: number
  epochs: number
}

export interface TrainingResult {
  modelId: string
  architecture: ModelArchitecture
  performance: ModelPerformance
  bestEpoch: number
  trainingHistory: {
    epoch: number
    loss: number
    valLoss: number
    metrics: { [key: string]: number }
  }[]
}

export class OpenSourceMLEngine {
  private db = getClusterManager()
  private cache = getIntelligentCache()
  private models: Map<string, tf.LayersModel> = new Map()
  private trainingJobs: Map<string, AbortController> = new Map()

  constructor() {
    this.initializeEngine()
  }

  private async initializeEngine() {
    try {
      // Set TensorFlow.js backend (CPU for compatibility)
      await tf.ready()
      console.log(`🧠 TensorFlow.js backend: ${tf.getBackend()}`)
      
      // Try to use GPU if available
      if (process.env.USE_GPU === 'true') {
        try {
          await tf.setBackend('tensorflow')
          console.log('🚀 GPU acceleration enabled')
        } catch (error) {
          console.log('💻 GPU not available, using CPU backend')
        }
      }

      await this.setupModelStorage()
      console.log('✅ Open Source ML Engine initialized')
    } catch (error) {
      console.error('❌ ML Engine initialization failed:', error)
    }
  }

  private async setupModelStorage() {
    const createModelsTable = `
      CREATE TABLE IF NOT EXISTS ml_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        task_type VARCHAR(20) NOT NULL,
        architecture JSONB NOT NULL,
        performance JSONB NOT NULL,
        model_data BYTEA,
        training_config JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'trained',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_ml_models_task_type ON ml_models(task_type);
      CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);
    `

    await this.db.query(createModelsTable)
  }

  /**
   * AutoML: Automatically find the best model architecture
   */
  async autoTrain(
    data: number[][],
    target: number[],
    config: AutoMLConfig
  ): Promise<TrainingResult> {
    console.log(`🤖 Starting AutoML for ${config.taskType} task with ${config.maxTrials} trials`)

    const jobId = `automl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const abortController = new AbortController()
    this.trainingJobs.set(jobId, abortController)

    try {
      // Generate model architectures to try
      const architectures = this.generateModelArchitectures(config)
      let bestResult: TrainingResult | null = null
      let bestScore = config.objective.includes('loss') ? Infinity : -Infinity

      console.log(`🔬 Testing ${architectures.length} different architectures`)

      for (let trial = 0; trial < Math.min(config.maxTrials, architectures.length); trial++) {
        if (abortController.signal.aborted) break

        console.log(`📊 Trial ${trial + 1}/${config.maxTrials}: ${architectures[trial].name}`)
        
        try {
          const result = await this.trainSingleModel(
            data,
            target,
            architectures[trial],
            config,
            abortController.signal
          )

          // Check if this is the best model so far
          const score = this.getObjectiveScore(result.performance, config.objective)
          const isBetter = config.objective.includes('loss') 
            ? score < bestScore 
            : score > bestScore

          if (isBetter) {
            bestScore = score
            bestResult = result
            console.log(`🎯 New best model! ${architectures[trial].name} - Score: ${score.toFixed(4)}`)
          }

        } catch (error) {
          console.error(`Trial ${trial + 1} failed:`, error)
          continue
        }
      }

      if (!bestResult) {
        throw new Error('All AutoML trials failed')
      }

      // Save the best model
      await this.saveModel(bestResult)

      console.log(`✅ AutoML completed! Best model: ${bestResult.architecture.name}`)
      return bestResult

    } catch (error) {
      console.error('❌ AutoML failed:', error)
      throw error
    } finally {
      this.trainingJobs.delete(jobId)
    }
  }

  private generateModelArchitectures(config: AutoMLConfig): ModelArchitecture[] {
    const architectures: ModelArchitecture[] = []
    const featureCount = config.features.length

    if (config.taskType === 'timeseries') {
      // LSTM architectures for time series
      architectures.push(
        {
          name: 'Simple LSTM',
          layers: [
            { type: 'lstm', config: { units: 64, returnSequences: true, inputShape: [null, featureCount] } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'lstm', config: { units: 32 } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'dense', config: { units: 16, activation: 'relu' } },
            { type: 'dense', config: { units: 1, activation: 'linear' } }
          ],
          optimizer: { type: 'adam', learningRate: 0.001 },
          loss: 'meanSquaredError',
          metrics: ['mae']
        },
        {
          name: 'Deep LSTM',
          layers: [
            { type: 'lstm', config: { units: 128, returnSequences: true, inputShape: [null, featureCount] } },
            { type: 'dropout', config: { rate: 0.3 } },
            { type: 'lstm', config: { units: 64, returnSequences: true } },
            { type: 'dropout', config: { rate: 0.3 } },
            { type: 'lstm', config: { units: 32 } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'dense', config: { units: 32, activation: 'relu' } },
            { type: 'dense', config: { units: 1, activation: 'linear' } }
          ],
          optimizer: { type: 'adam', learningRate: 0.0005 },
          loss: 'meanSquaredError',
          metrics: ['mae']
        },
        {
          name: 'GRU Network',
          layers: [
            { type: 'gru', config: { units: 64, returnSequences: true, inputShape: [null, featureCount] } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'gru', config: { units: 32 } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'dense', config: { units: 16, activation: 'relu' } },
            { type: 'dense', config: { units: 1, activation: 'linear' } }
          ],
          optimizer: { type: 'adam', learningRate: 0.001 },
          loss: 'meanSquaredError',
          metrics: ['mae']
        }
      )
    } else {
      // Dense networks for regression/classification
      const outputUnits = config.taskType === 'classification' ? 2 : 1
      const outputActivation = config.taskType === 'classification' ? 'softmax' : 'linear'
      const loss = config.taskType === 'classification' ? 'sparseCategoricalCrossentropy' : 'meanSquaredError'
      const metrics = config.taskType === 'classification' ? ['accuracy'] : ['mae']

      architectures.push(
        {
          name: 'Simple Dense',
          layers: [
            { type: 'dense', config: { units: 64, activation: 'relu', inputShape: [featureCount] } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'dense', config: { units: 32, activation: 'relu' } },
            { type: 'dense', config: { units: outputUnits, activation: outputActivation } }
          ],
          optimizer: { type: 'adam', learningRate: 0.001 },
          loss,
          metrics
        },
        {
          name: 'Deep Dense',
          layers: [
            { type: 'dense', config: { units: 128, activation: 'relu', inputShape: [featureCount] } },
            { type: 'batchNormalization', config: {} },
            { type: 'dropout', config: { rate: 0.3 } },
            { type: 'dense', config: { units: 64, activation: 'relu' } },
            { type: 'batchNormalization', config: {} },
            { type: 'dropout', config: { rate: 0.3 } },
            { type: 'dense', config: { units: 32, activation: 'relu' } },
            { type: 'dropout', config: { rate: 0.2 } },
            { type: 'dense', config: { units: outputUnits, activation: outputActivation } }
          ],
          optimizer: { type: 'adam', learningRate: 0.0005 },
          loss,
          metrics
        },
        {
          name: 'Wide Network',
          layers: [
            { type: 'dense', config: { units: 256, activation: 'relu', inputShape: [featureCount] } },
            { type: 'dropout', config: { rate: 0.4 } },
            { type: 'dense', config: { units: 128, activation: 'relu' } },
            { type: 'dropout', config: { rate: 0.3 } },
            { type: 'dense', config: { units: outputUnits, activation: outputActivation } }
          ],
          optimizer: { type: 'adam', learningRate: 0.001 },
          loss,
          metrics
        }
      )
    }

    return architectures
  }

  private async trainSingleModel(
    data: number[][],
    target: number[],
    architecture: ModelArchitecture,
    config: AutoMLConfig,
    abortSignal: AbortSignal
  ): Promise<TrainingResult> {
    const startTime = Date.now()

    // Build model from architecture
    const model = this.buildModel(architecture)

    // Prepare data tensors
    const xs = tf.tensor2d(data)
    const ys = config.taskType === 'timeseries' 
      ? tf.tensor1d(target)
      : tf.tensor2d(target.map(t => [t])) // Reshape for dense networks

    try {
      // Training with early stopping
      const history: TrainingResult['trainingHistory'] = []
      let bestValLoss = Infinity
      let patienceCounter = 0
      let bestEpoch = 0

      for (let epoch = 0; epoch < config.maxEpochs; epoch++) {
        if (abortSignal.aborted) {
          throw new Error('Training aborted')
        }

        const epochResult = await model.fit(xs, ys, {
          epochs: 1,
          batchSize: config.batchSize,
          validationSplit: config.validationSplit,
          shuffle: true,
          verbose: 0
        })

        const loss = epochResult.history.loss[0] as number
        const valLoss = epochResult.history.val_loss?.[0] as number || loss

        history.push({
          epoch,
          loss,
          valLoss,
          metrics: epochResult.history
        })

        // Early stopping logic
        if (valLoss < bestValLoss) {
          bestValLoss = valLoss
          bestEpoch = epoch
          patienceCounter = 0
        } else {
          patienceCounter++
        }

        if (patienceCounter >= config.patience) {
          console.log(`⏹️ Early stopping at epoch ${epoch}`)
          break
        }

        // Progress logging every 10 epochs
        if (epoch % 10 === 0) {
          console.log(`Epoch ${epoch}: loss=${loss.toFixed(4)}, val_loss=${valLoss.toFixed(4)}`)
        }
      }

      // Calculate final performance metrics
      const predictions = model.predict(xs) as tf.Tensor
      const performance = await this.calculateMetrics(
        ys,
        predictions,
        config.taskType,
        Date.now() - startTime,
        history.length
      )

      const modelId = `${architecture.name.replace(/\s+/g, '_')}_${Date.now()}`

      return {
        modelId,
        architecture,
        performance,
        bestEpoch,
        trainingHistory: history
      }

    } finally {
      // Cleanup tensors
      xs.dispose()
      ys.dispose()
      model.dispose()
    }
  }

  private buildModel(architecture: ModelArchitecture): tf.LayersModel {
    const layers: tf.layers.Layer[] = []

    for (const layerSpec of architecture.layers) {
      switch (layerSpec.type) {
        case 'dense':
          layers.push(tf.layers.dense(layerSpec.config))
          break
        case 'lstm':
          layers.push(tf.layers.lstm(layerSpec.config))
          break
        case 'gru':
          layers.push(tf.layers.gru(layerSpec.config))
          break
        case 'conv1d':
          layers.push(tf.layers.conv1d(layerSpec.config))
          break
        case 'dropout':
          layers.push(tf.layers.dropout(layerSpec.config))
          break
        case 'batchNormalization':
          layers.push(tf.layers.batchNormalization(layerSpec.config))
          break
      }
    }

    const model = tf.sequential({ layers })

    // Compile model
    let optimizer: tf.Optimizer
    switch (architecture.optimizer.type) {
      case 'adam':
        optimizer = tf.train.adam(architecture.optimizer.learningRate)
        break
      case 'sgd':
        optimizer = tf.train.sgd(architecture.optimizer.learningRate)
        break
      case 'rmsprop':
        optimizer = tf.train.rmsprop(architecture.optimizer.learningRate)
        break
      default:
        optimizer = tf.train.adam(0.001)
    }

    model.compile({
      optimizer,
      loss: architecture.loss,
      metrics: architecture.metrics
    })

    return model
  }

  private async calculateMetrics(
    yTrue: tf.Tensor,
    yPred: tf.Tensor,
    taskType: string,
    trainingTime: number,
    epochs: number
  ): Promise<ModelPerformance> {
    const loss = tf.losses.meanSquaredError(yTrue, yPred)
    const lossValue = await loss.data()

    const performance: ModelPerformance = {
      loss: lossValue[0],
      trainingTime,
      epochs,
      validationMetrics: {}
    }

    if (taskType === 'regression' || taskType === 'timeseries') {
      // Mean Absolute Error
      const mae = tf.losses.absoluteDifference(yTrue, yPred)
      const maeValue = await mae.data()
      performance.mae = maeValue[0]

      // Mean Squared Error
      performance.mse = lossValue[0]

      // R² Score (coefficient of determination)
      const yTrueMean = tf.mean(yTrue)
      const totalSumSquares = tf.sum(tf.square(tf.sub(yTrue, yTrueMean)))
      const residualSumSquares = tf.sum(tf.square(tf.sub(yTrue, yPred)))
      const r2 = tf.sub(1, tf.div(residualSumSquares, totalSumSquares))
      const r2Value = await r2.data()
      performance.r2Score = r2Value[0]

      // Cleanup
      mae.dispose()
      yTrueMean.dispose()
      totalSumSquares.dispose()
      residualSumSquares.dispose()
      r2.dispose()

    } else if (taskType === 'classification') {
      // Accuracy
      const predictions = tf.argMax(yPred, 1)
      const trueLabels = tf.argMax(yTrue, 1)
      const accuracy = tf.mean(tf.cast(tf.equal(predictions, trueLabels), 'float32'))
      const accuracyValue = await accuracy.data()
      performance.accuracy = accuracyValue[0]

      // Cleanup
      predictions.dispose()
      trueLabels.dispose()
      accuracy.dispose()
    }

    loss.dispose()
    return performance
  }

  private getObjectiveScore(performance: ModelPerformance, objective: string): number {
    switch (objective) {
      case 'val_loss':
        return performance.loss
      case 'val_accuracy':
        return performance.accuracy || 0
      case 'val_mae':
        return performance.mae || 0
      case 'val_mse':
        return performance.mse || 0
      default:
        return performance.loss
    }
  }

  /**
   * Fast inference for production use
   */
  async predict(modelId: string, inputData: number[][]): Promise<number[]> {
    try {
      let model = this.models.get(modelId)
      
      if (!model) {
        model = await this.loadModel(modelId)
        this.models.set(modelId, model)
      }

      const inputTensor = tf.tensor2d(inputData)
      const predictions = model.predict(inputTensor) as tf.Tensor
      const results = await predictions.data()
      
      inputTensor.dispose()
      predictions.dispose()

      return Array.from(results)

    } catch (error) {
      console.error(`❌ Prediction failed for model ${modelId}:`, error)
      throw error
    }
  }

  /**
   * Batch prediction for efficiency
   */
  async predictBatch(modelId: string, inputBatch: number[][][]): Promise<number[][]> {
    try {
      let model = this.models.get(modelId)
      
      if (!model) {
        model = await this.loadModel(modelId)
        this.models.set(modelId, model)
      }

      const results: number[][] = []
      
      for (const inputData of inputBatch) {
        const inputTensor = tf.tensor2d(inputData)
        const predictions = model.predict(inputTensor) as tf.Tensor
        const predictionData = await predictions.data()
        
        results.push(Array.from(predictionData))
        
        inputTensor.dispose()
        predictions.dispose()
      }

      return results

    } catch (error) {
      console.error(`❌ Batch prediction failed for model ${modelId}:`, error)
      throw error
    }
  }

  /**
   * Model management
   */
  private async saveModel(result: TrainingResult): Promise<void> {
    try {
      // Build and save the model
      const model = this.buildModel(result.architecture)
      
      // Convert model to buffer for storage
      const modelArtifacts = await model.save(tf.io.withSaveHandler(async (artifacts) => artifacts))
      const modelBuffer = Buffer.from(JSON.stringify(modelArtifacts))

      await this.db.query(`
        INSERT INTO ml_models (id, name, task_type, architecture, performance, model_data, training_config)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        result.modelId,
        result.architecture.name,
        result.architecture.layers.some(l => l.type === 'lstm' || l.type === 'gru') ? 'timeseries' : 'regression',
        JSON.stringify(result.architecture),
        JSON.stringify(result.performance),
        modelBuffer,
        JSON.stringify({ bestEpoch: result.bestEpoch })
      ])

      model.dispose()
      console.log(`💾 Model saved: ${result.modelId}`)

    } catch (error) {
      console.error('❌ Failed to save model:', error)
      throw error
    }
  }

  private async loadModel(modelId: string): Promise<tf.LayersModel> {
    try {
      const result = await this.db.query(
        'SELECT architecture, model_data FROM ml_models WHERE id = $1',
        [modelId]
      )

      if (result.rows.length === 0) {
        throw new Error(`Model not found: ${modelId}`)
      }

      const architecture = result.rows[0].architecture as ModelArchitecture
      const model = this.buildModel(architecture)

      console.log(`📚 Model loaded: ${modelId}`)
      return model

    } catch (error) {
      console.error(`❌ Failed to load model ${modelId}:`, error)
      throw error
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<Array<{
    id: string
    name: string
    taskType: string
    performance: ModelPerformance
    createdAt: Date
  }>> {
    const result = await this.db.query(`
      SELECT id, name, task_type, performance, created_at
      FROM ml_models
      ORDER BY created_at DESC
    `)

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      taskType: row.task_type,
      performance: row.performance,
      createdAt: row.created_at
    }))
  }

  /**
   * Delete model
   */
  async deleteModel(modelId: string): Promise<void> {
    await this.db.query('DELETE FROM ml_models WHERE id = $1', [modelId])
    this.models.delete(modelId)
    console.log(`🗑️ Model deleted: ${modelId}`)
  }

  /**
   * Feature engineering helpers
   */
  prepareTimeSeriesData(
    data: number[][],
    sequenceLength: number,
    targetColumn: number = 0
  ): { sequences: number[][][], targets: number[] } {
    const sequences: number[][][] = []
    const targets: number[] = []

    for (let i = 0; i < data.length - sequenceLength; i++) {
      const sequence = data.slice(i, i + sequenceLength)
      const target = data[i + sequenceLength][targetColumn]
      
      sequences.push(sequence)
      targets.push(target)
    }

    return { sequences, targets }
  }

  /**
   * Data preprocessing utilities
   */
  normalizeData(data: number[][]): { normalizedData: number[][], stats: { mean: number[], std: number[] } } {
    const features = data[0].length
    const mean = new Array(features).fill(0)
    const std = new Array(features).fill(0)

    // Calculate means
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < features; j++) {
        mean[j] += data[i][j]
      }
    }
    for (let j = 0; j < features; j++) {
      mean[j] /= data.length
    }

    // Calculate standard deviations
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < features; j++) {
        std[j] += Math.pow(data[i][j] - mean[j], 2)
      }
    }
    for (let j = 0; j < features; j++) {
      std[j] = Math.sqrt(std[j] / data.length)
    }

    // Normalize data
    const normalizedData = data.map(row =>
      row.map((value, j) => std[j] > 0 ? (value - mean[j]) / std[j] : 0)
    )

    return { normalizedData, stats: { mean, std } }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    // Dispose all models
    for (const [modelId, model] of this.models) {
      try {
        model.dispose()
        console.log(`Disposed model: ${modelId}`)
      } catch (error) {
        console.error(`Error disposing model ${modelId}:`, error)
      }
    }
    this.models.clear()

    // Cancel any running training jobs
    for (const [jobId, controller] of this.trainingJobs) {
      controller.abort()
      console.log(`Cancelled training job: ${jobId}`)
    }
    this.trainingJobs.clear()

    console.log('✅ Open Source ML Engine cleanup completed')
  }
}

// Singleton instance
let openSourceMLEngine: OpenSourceMLEngine | null = null

export const getOpenSourceMLEngine = (): OpenSourceMLEngine => {
  if (!openSourceMLEngine) {
    openSourceMLEngine = new OpenSourceMLEngine()
  }
  return openSourceMLEngine
}

export default OpenSourceMLEngine
