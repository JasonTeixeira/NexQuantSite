/**
 * Message Queue System - OCHcloud Compatible
 * RabbitMQ implementation for async processing and event handling
 * Handles broker API calls, notifications, reports, and data processing
 */

import { connect, Connection, Channel, ConsumeMessage } from 'amqplib'
import { getClusterManager } from '../database/cluster-manager'
import { getIntelligentCache } from '../caching/intelligent-cache'

export interface QueueMessage {
  id: string
  type: 'trade_execution' | 'portfolio_update' | 'market_data' | 'notification' | 'report_generation' | 'ai_analysis'
  payload: any
  priority: 'low' | 'normal' | 'high' | 'critical'
  attempts: number
  maxAttempts: number
  createdAt: Date
  scheduledAt?: Date
  userId?: string
  tenantId?: string
  metadata: { [key: string]: any }
}

export interface QueueOptions {
  durable: boolean
  exclusive: boolean
  autoDelete: boolean
  maxLength?: number
  messageTtl?: number // milliseconds
  deadLetterExchange?: string
  priority?: number
}

export interface ConsumerOptions {
  concurrency: number
  prefetch: number
  noAck: boolean
  retryDelays: number[] // milliseconds between retries
  deadLetterQueue?: string
}

export interface QueueStats {
  messageCount: number
  consumerCount: number
  publishRate: number
  consumeRate: number
}

export type MessageHandler = (message: QueueMessage) => Promise<void>

export class MessageQueueService {
  private connection: Connection | null = null
  private channel: Channel | null = null
  private db = getClusterManager()
  private cache = getIntelligentCache()
  private consumers: Map<string, { handler: MessageHandler; options: ConsumerOptions }> = new Map()
  private publishRates: Map<string, number> = new Map()
  private consumeRates: Map<string, number> = new Map()

  constructor(private connectionUrl: string = process.env.RABBITMQ_URL || 'amqp://localhost:5672') {
    this.initializeMessageQueue()
  }

  private async initializeMessageQueue() {
    try {
      await this.connect()
      await this.setupExchangesAndQueues()
      await this.startStatsCollection()
      console.log('📬 Message queue service initialized')
    } catch (error) {
      console.error('❌ Message queue initialization failed:', error)
      // Retry connection after delay
      setTimeout(() => this.initializeMessageQueue(), 5000)
    }
  }

  private async connect() {
    try {
      this.connection = await connect(this.connectionUrl)
      this.channel = await this.connection.createChannel()
      
      // Set channel prefetch for fair distribution
      await this.channel.prefetch(10)

      this.connection.on('error', (error) => {
        console.error('❌ RabbitMQ connection error:', error)
        this.reconnect()
      })

      this.connection.on('close', () => {
        console.warn('⚠️ RabbitMQ connection closed, reconnecting...')
        this.reconnect()
      })

      console.log('✅ Connected to RabbitMQ')

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error)
      throw error
    }
  }

  private async reconnect() {
    this.connection = null
    this.channel = null
    
    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    try {
      await this.connect()
      await this.setupExchangesAndQueues()
      await this.restartConsumers()
    } catch (error) {
      console.error('❌ Reconnection failed:', error)
      this.reconnect() // Keep trying
    }
  }

  private async setupExchangesAndQueues() {
    if (!this.channel) throw new Error('Channel not initialized')

    // Create exchanges
    await this.channel.assertExchange('nexural.direct', 'direct', { durable: true })
    await this.channel.assertExchange('nexural.topic', 'topic', { durable: true })
    await this.channel.assertExchange('nexural.fanout', 'fanout', { durable: true })
    await this.channel.assertExchange('nexural.dlx', 'direct', { durable: true })

    // Create priority queues with dead letter handling
    const queues = [
      {
        name: 'trade_execution',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 10000,
          messageTtl: 300000, // 5 minutes
          deadLetterExchange: 'nexural.dlx',
          priority: 10
        }
      },
      {
        name: 'portfolio_updates',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 50000,
          messageTtl: 600000, // 10 minutes
          deadLetterExchange: 'nexural.dlx',
          priority: 8
        }
      },
      {
        name: 'market_data_processing',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 100000,
          messageTtl: 60000, // 1 minute
          deadLetterExchange: 'nexural.dlx',
          priority: 7
        }
      },
      {
        name: 'ai_analysis',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 5000,
          messageTtl: 1800000, // 30 minutes
          deadLetterExchange: 'nexural.dlx',
          priority: 6
        }
      },
      {
        name: 'notifications',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 20000,
          messageTtl: 86400000, // 24 hours
          deadLetterExchange: 'nexural.dlx',
          priority: 5
        }
      },
      {
        name: 'report_generation',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 1000,
          messageTtl: 3600000, // 1 hour
          deadLetterExchange: 'nexural.dlx',
          priority: 4
        }
      },
      {
        name: 'background_tasks',
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false,
          maxLength: 10000,
          messageTtl: 7200000, // 2 hours
          deadLetterExchange: 'nexural.dlx',
          priority: 2
        }
      }
    ]

    for (const queue of queues) {
      await this.channel.assertQueue(queue.name, {
        durable: queue.options.durable,
        exclusive: queue.options.exclusive,
        autoDelete: queue.options.autoDelete,
        arguments: {
          'x-max-length': queue.options.maxLength,
          'x-message-ttl': queue.options.messageTtl,
          'x-dead-letter-exchange': queue.options.deadLetterExchange,
          'x-max-priority': queue.options.priority
        }
      })

      // Bind queues to exchanges
      await this.channel.bindQueue(queue.name, 'nexural.direct', queue.name)
      await this.channel.bindQueue(queue.name, 'nexural.topic', `${queue.name}.*`)
    }

    // Dead letter queue
    await this.channel.assertQueue('dead_letter_queue', {
      durable: true,
      exclusive: false,
      autoDelete: false
    })
    await this.channel.bindQueue('dead_letter_queue', 'nexural.dlx', '')

    console.log('📋 Queues and exchanges setup completed')
  }

  /**
   * Publish a message to a queue
   */
  async publishMessage(
    queueName: string,
    message: Omit<QueueMessage, 'id' | 'createdAt' | 'attempts'>,
    options: { delay?: number; persistent?: boolean } = {}
  ): Promise<string> {
    if (!this.channel) {
      throw new Error('Message queue not connected')
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queueMessage: QueueMessage = {
      ...message,
      id: messageId,
      createdAt: new Date(),
      attempts: 0
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(queueMessage))
      const publishOptions: any = {
        persistent: options.persistent !== false,
        messageId,
        timestamp: Date.now(),
        priority: this.getPriorityValue(message.priority)
      }

      // Handle delayed messages
      if (options.delay && options.delay > 0) {
        publishOptions.headers = {
          'x-delay': options.delay
        }
        queueMessage.scheduledAt = new Date(Date.now() + options.delay)
      }

      const published = this.channel.publish(
        'nexural.direct',
        queueName,
        messageBuffer,
        publishOptions
      )

      if (!published) {
        throw new Error('Failed to publish message (channel buffer full)')
      }

      // Update publish rate stats
      this.updatePublishRate(queueName)

      console.log(`📤 Message published to ${queueName}: ${messageId}`)
      return messageId

    } catch (error) {
      console.error(`❌ Failed to publish message to ${queueName}:`, error)
      throw error
    }
  }

  /**
   * Subscribe to a queue with message handler
   */
  async subscribe(
    queueName: string,
    handler: MessageHandler,
    options: ConsumerOptions = {
      concurrency: 1,
      prefetch: 10,
      noAck: false,
      retryDelays: [1000, 5000, 15000, 60000], // 1s, 5s, 15s, 1m
      deadLetterQueue: 'dead_letter_queue'
    }
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Message queue not connected')
    }

    try {
      // Store consumer info
      this.consumers.set(queueName, { handler, options })

      // Set prefetch for this consumer
      await this.channel.prefetch(options.prefetch)

      // Start consuming
      await this.channel.consume(queueName, async (msg) => {
        if (msg) {
          await this.handleMessage(msg, handler, options)
        }
      }, {
        noAck: options.noAck
      })

      console.log(`📥 Subscribed to queue: ${queueName} (concurrency: ${options.concurrency})`)

    } catch (error) {
      console.error(`❌ Failed to subscribe to ${queueName}:`, error)
      throw error
    }
  }

  private async handleMessage(
    msg: ConsumeMessage,
    handler: MessageHandler,
    options: ConsumerOptions
  ) {
    if (!this.channel) return

    let queueMessage: QueueMessage

    try {
      queueMessage = JSON.parse(msg.content.toString())
      console.log(`📨 Processing message: ${queueMessage.id} (type: ${queueMessage.type})`)

      // Update consume rate stats
      this.updateConsumeRate(msg.fields.routingKey)

      // Execute handler
      await handler(queueMessage)

      // Acknowledge successful processing
      if (!options.noAck) {
        this.channel.ack(msg)
      }

      console.log(`✅ Message processed successfully: ${queueMessage.id}`)

    } catch (error) {
      console.error(`❌ Message processing failed: ${queueMessage?.id || 'unknown'}`, error)

      if (!options.noAck) {
        await this.handleMessageFailure(msg, queueMessage, error, options)
      }
    }
  }

  private async handleMessageFailure(
    msg: ConsumeMessage,
    queueMessage: QueueMessage,
    error: Error,
    options: ConsumerOptions
  ) {
    if (!this.channel) return

    queueMessage.attempts = (queueMessage.attempts || 0) + 1

    // Check if we should retry
    if (queueMessage.attempts < queueMessage.maxAttempts && 
        queueMessage.attempts <= options.retryDelays.length) {
      
      const retryDelay = options.retryDelays[queueMessage.attempts - 1] || 60000
      
      console.log(`🔄 Retrying message ${queueMessage.id} in ${retryDelay}ms (attempt ${queueMessage.attempts}/${queueMessage.maxAttempts})`)
      
      // Republish with delay
      setTimeout(async () => {
        await this.publishMessage(msg.fields.routingKey, queueMessage, { delay: retryDelay })
      }, retryDelay)

      this.channel.ack(msg)
    } else {
      // Max retries exceeded, send to dead letter queue
      console.error(`💀 Message ${queueMessage.id} exceeded max retries, sending to DLQ`)
      
      if (options.deadLetterQueue) {
        await this.publishMessage(options.deadLetterQueue, {
          ...queueMessage,
          type: 'failed_message' as any,
          payload: {
            originalMessage: queueMessage,
            error: error.message,
            failedAt: new Date(),
            originalQueue: msg.fields.routingKey
          }
        })
      }

      this.channel.ack(msg)
    }
  }

  /**
   * Convenience methods for specific message types
   */
  
  async publishTradeExecution(
    userId: string,
    tenantId: string,
    tradeData: {
      symbol: string
      side: 'buy' | 'sell'
      quantity: number
      price?: number
      orderType: 'market' | 'limit'
      broker: string
    }
  ): Promise<string> {
    return this.publishMessage('trade_execution', {
      type: 'trade_execution',
      payload: tradeData,
      priority: 'high',
      maxAttempts: 3,
      userId,
      tenantId,
      metadata: { broker: tradeData.broker }
    })
  }

  async publishPortfolioUpdate(
    userId: string,
    tenantId: string,
    updateData: {
      portfolioId: string
      type: 'position_update' | 'balance_update' | 'performance_calculation'
      data: any
    }
  ): Promise<string> {
    return this.publishMessage('portfolio_updates', {
      type: 'portfolio_update',
      payload: updateData,
      priority: 'normal',
      maxAttempts: 2,
      userId,
      tenantId,
      metadata: { portfolioId: updateData.portfolioId }
    })
  }

  async publishMarketDataProcess(
    symbols: string[],
    dataType: 'price' | 'volume' | 'sentiment',
    data: any
  ): Promise<string> {
    return this.publishMessage('market_data_processing', {
      type: 'market_data',
      payload: { symbols, dataType, data },
      priority: 'normal',
      maxAttempts: 2,
      metadata: { symbols, dataType }
    })
  }

  async publishAIAnalysis(
    userId: string,
    tenantId: string,
    analysisRequest: {
      type: 'portfolio_analysis' | 'market_prediction' | 'risk_assessment'
      symbols: string[]
      timeframe: string
      parameters: any
    }
  ): Promise<string> {
    return this.publishMessage('ai_analysis', {
      type: 'ai_analysis',
      payload: analysisRequest,
      priority: 'normal',
      maxAttempts: 2,
      userId,
      tenantId,
      metadata: { analysisType: analysisRequest.type }
    })
  }

  async publishNotification(
    userId: string,
    tenantId: string,
    notification: {
      type: 'email' | 'push' | 'sms' | 'webhook'
      recipient: string
      subject: string
      content: string
      priority: 'low' | 'normal' | 'high' | 'critical'
    }
  ): Promise<string> {
    return this.publishMessage('notifications', {
      type: 'notification',
      payload: notification,
      priority: notification.priority,
      maxAttempts: 3,
      userId,
      tenantId,
      metadata: { notificationType: notification.type }
    })
  }

  async publishReportGeneration(
    userId: string,
    tenantId: string,
    reportRequest: {
      templateId: string
      parameters: any
      format: 'pdf' | 'excel' | 'csv'
      recipients: string[]
    }
  ): Promise<string> {
    return this.publishMessage('report_generation', {
      type: 'report_generation',
      payload: reportRequest,
      priority: 'low',
      maxAttempts: 2,
      userId,
      tenantId,
      metadata: { templateId: reportRequest.templateId }
    })
  }

  /**
   * Queue management and monitoring
   */
  async getQueueStats(queueName: string): Promise<QueueStats> {
    if (!this.channel) {
      throw new Error('Message queue not connected')
    }

    try {
      const queueInfo = await this.channel.checkQueue(queueName)
      
      return {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
        publishRate: this.publishRates.get(queueName) || 0,
        consumeRate: this.consumeRates.get(queueName) || 0
      }
    } catch (error) {
      console.error(`❌ Failed to get stats for queue ${queueName}:`, error)
      throw error
    }
  }

  async purgeQueue(queueName: string): Promise<number> {
    if (!this.channel) {
      throw new Error('Message queue not connected')
    }

    try {
      const result = await this.channel.purgeQueue(queueName)
      console.log(`🧹 Purged ${result.messageCount} messages from queue: ${queueName}`)
      return result.messageCount
    } catch (error) {
      console.error(`❌ Failed to purge queue ${queueName}:`, error)
      throw error
    }
  }

  async deleteQueue(queueName: string): Promise<number> {
    if (!this.channel) {
      throw new Error('Message queue not connected')
    }

    try {
      const result = await this.channel.deleteQueue(queueName)
      console.log(`🗑️ Deleted queue: ${queueName}`)
      return result.messageCount
    } catch (error) {
      console.error(`❌ Failed to delete queue ${queueName}:`, error)
      throw error
    }
  }

  /**
   * Health and monitoring
   */
  async healthCheck(): Promise<{
    connected: boolean
    queues: string[]
    consumers: number
    publishRate: number
    consumeRate: number
  }> {
    const isConnected = this.connection !== null && this.channel !== null
    const queues = Array.from(this.consumers.keys())
    const consumers = this.consumers.size
    
    const totalPublishRate = Array.from(this.publishRates.values())
      .reduce((sum, rate) => sum + rate, 0)
    const totalConsumeRate = Array.from(this.consumeRates.values())
      .reduce((sum, rate) => sum + rate, 0)

    return {
      connected: isConnected,
      queues,
      consumers,
      publishRate: totalPublishRate,
      consumeRate: totalConsumeRate
    }
  }

  /**
   * Helper methods
   */
  private getPriorityValue(priority: QueueMessage['priority']): number {
    switch (priority) {
      case 'critical': return 10
      case 'high': return 8
      case 'normal': return 5
      case 'low': return 2
      default: return 5
    }
  }

  private updatePublishRate(queueName: string) {
    const current = this.publishRates.get(queueName) || 0
    this.publishRates.set(queueName, current + 1)
  }

  private updateConsumeRate(queueName: string) {
    const current = this.consumeRates.get(queueName) || 0
    this.consumeRates.set(queueName, current + 1)
  }

  private startStatsCollection() {
    // Reset rates every minute for rate calculation
    setInterval(() => {
      this.publishRates.clear()
      this.consumeRates.clear()
    }, 60000)

    console.log('📊 Stats collection started')
  }

  private async restartConsumers() {
    console.log('🔄 Restarting consumers...')
    
    for (const [queueName, { handler, options }] of this.consumers) {
      try {
        await this.subscribe(queueName, handler, options)
      } catch (error) {
        console.error(`Failed to restart consumer for ${queueName}:`, error)
      }
    }
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close()
      }
      if (this.connection) {
        await this.connection.close()
      }
      console.log('✅ Message queue service cleanup completed')
    } catch (error) {
      console.error('❌ Message queue cleanup failed:', error)
    }
  }
}

// Singleton instance
let messageQueueService: MessageQueueService | null = null

export const getMessageQueueService = (): MessageQueueService => {
  if (!messageQueueService) {
    messageQueueService = new MessageQueueService()
  }
  return messageQueueService
}

export default MessageQueueService
