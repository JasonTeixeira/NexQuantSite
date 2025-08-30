// 🔄 WEBSOCKET MANAGER - Enterprise-grade real-time connections
// Handles multiple WebSocket connections with auto-reconnection, heartbeat, and failover

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'

interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  debug?: boolean
}

interface WebSocketMessage {
  type: string
  channel?: string
  data: any
  timestamp: number
}

type MessageHandler = (message: WebSocketMessage) => void
type StatusHandler = (status: WebSocketStatus, connection: string) => void

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private configs: Map<string, WebSocketConfig> = new Map()
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map()
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private statusHandlers: Set<StatusHandler> = new Set()
  private isClient: boolean = typeof window !== 'undefined'

  constructor(private debug: boolean = false) {
    this.log('WebSocket Manager initialized')
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  async connect(connectionId: string, config: WebSocketConfig): Promise<void> {
    if (!this.isClient) {
      this.log('WebSocket not available in server environment')
      return
    }

    this.configs.set(connectionId, {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      debug: false,
      ...config
    })

    this.reconnectAttempts.set(connectionId, 0)
    await this._createConnection(connectionId)
  }

  private async _createConnection(connectionId: string): Promise<void> {
    const config = this.configs.get(connectionId)!
    
    try {
      this._updateStatus(connectionId, 'connecting')
      this.log(`Connecting to ${config.url}`)

      const ws = new WebSocket(config.url)
      this.connections.set(connectionId, ws)

      ws.onopen = () => this._handleOpen(connectionId)
      ws.onmessage = (event) => this._handleMessage(connectionId, event)
      ws.onclose = (event) => this._handleClose(connectionId, event)
      ws.onerror = (event) => this._handleError(connectionId, event)

    } catch (error) {
      this.log(`Connection failed: ${error}`)
      this._updateStatus(connectionId, 'error')
      this._scheduleReconnect(connectionId)
    }
  }

  disconnect(connectionId: string): void {
    const ws = this.connections.get(connectionId)
    if (ws) {
      ws.close(1000, 'Manual disconnect')
      this.connections.delete(connectionId)
    }

    this._clearTimers(connectionId)
    this._updateStatus(connectionId, 'disconnected')
  }

  disconnectAll(): void {
    for (const connectionId of this.connections.keys()) {
      this.disconnect(connectionId)
    }
  }

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  subscribe(connectionId: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(connectionId)) {
      this.messageHandlers.set(connectionId, new Set())
    }
    
    this.messageHandlers.get(connectionId)!.add(handler)
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(connectionId)?.delete(handler)
    }
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  send(connectionId: string, message: any): boolean {
    const ws = this.connections.get(connectionId)
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.log(`Cannot send message - connection not ready: ${connectionId}`)
      return false
    }

    try {
      ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      this.log(`Send error: ${error}`)
      return false
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  private _handleOpen(connectionId: string): void {
    this.log(`Connected: ${connectionId}`)
    this._updateStatus(connectionId, 'connected')
    this.reconnectAttempts.set(connectionId, 0)
    
    const config = this.configs.get(connectionId)!
    
    // Start heartbeat
    if (config.heartbeatInterval) {
      this._startHeartbeat(connectionId)
    }
  }

  private _handleMessage(connectionId: string, event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      message.timestamp = Date.now()
      
      this.log(`Message received on ${connectionId}:`, message.type)
      
      // Notify all handlers for this connection
      const handlers = this.messageHandlers.get(connectionId)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message)
          } catch (error) {
            this.log(`Handler error: ${error}`)
          }
        })
      }
      
    } catch (error) {
      this.log(`Parse error: ${error}`)
    }
  }

  private _handleClose(connectionId: string, event: CloseEvent): void {
    this.log(`Connection closed: ${connectionId}, code: ${event.code}`)
    this.connections.delete(connectionId)
    this._clearTimers(connectionId)
    
    if (event.code !== 1000) { // Not a normal closure
      this._updateStatus(connectionId, 'disconnected')
      this._scheduleReconnect(connectionId)
    } else {
      this._updateStatus(connectionId, 'disconnected')
    }
  }

  private _handleError(connectionId: string, event: Event): void {
    this.log(`Connection error: ${connectionId}`, event)
    this._updateStatus(connectionId, 'error')
  }

  // ============================================================================
  // RECONNECTION LOGIC
  // ============================================================================

  private _scheduleReconnect(connectionId: string): void {
    const config = this.configs.get(connectionId)!
    const attempts = this.reconnectAttempts.get(connectionId) || 0
    
    if (attempts >= config.maxReconnectAttempts!) {
      this.log(`Max reconnection attempts reached for ${connectionId}`)
      this._updateStatus(connectionId, 'error')
      return
    }

    this.reconnectAttempts.set(connectionId, attempts + 1)
    this._updateStatus(connectionId, 'reconnecting')
    
    // Exponential backoff with jitter
    const baseDelay = config.reconnectInterval!
    const exponentialDelay = baseDelay * Math.pow(2, attempts)
    const jitter = Math.random() * 1000
    const delay = Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
    
    this.log(`Reconnecting in ${delay}ms (attempt ${attempts + 1}/${config.maxReconnectAttempts})`)
    
    const timer = setTimeout(() => {
      this.reconnectTimers.delete(connectionId)
      this._createConnection(connectionId)
    }, delay)
    
    this.reconnectTimers.set(connectionId, timer)
  }

  // ============================================================================
  // HEARTBEAT MANAGEMENT
  // ============================================================================

  private _startHeartbeat(connectionId: string): void {
    const config = this.configs.get(connectionId)!
    
    const timer = setInterval(() => {
      if (!this.send(connectionId, { type: 'ping', timestamp: Date.now() })) {
        this.log(`Heartbeat failed for ${connectionId}`)
        this._clearTimers(connectionId)
      }
    }, config.heartbeatInterval!)
    
    this.heartbeatTimers.set(connectionId, timer)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private _clearTimers(connectionId: string): void {
    const reconnectTimer = this.reconnectTimers.get(connectionId)
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      this.reconnectTimers.delete(connectionId)
    }

    const heartbeatTimer = this.heartbeatTimers.get(connectionId)
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      this.heartbeatTimers.delete(connectionId)
    }
  }

  private _updateStatus(connectionId: string, status: WebSocketStatus): void {
    this.log(`Status update: ${connectionId} -> ${status}`)
    
    this.statusHandlers.forEach(handler => {
      try {
        handler(status, connectionId)
      } catch (error) {
        this.log(`Status handler error: ${error}`)
      }
    })
  }

  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[WebSocketManager] ${message}`, data || '')
    }
  }

  // ============================================================================
  // PUBLIC STATUS METHODS
  // ============================================================================

  getStatus(connectionId: string): WebSocketStatus {
    const ws = this.connections.get(connectionId)
    if (!ws) return 'disconnected'
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'disconnected'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'error'
    }
  }

  getAllStatuses(): Record<string, WebSocketStatus> {
    const statuses: Record<string, WebSocketStatus> = {}
    for (const connectionId of this.connections.keys()) {
      statuses[connectionId] = this.getStatus(connectionId)
    }
    return statuses
  }

  isConnected(connectionId: string): boolean {
    return this.getStatus(connectionId) === 'connected'
  }

  getConnectionCount(): number {
    return Array.from(this.connections.values())
      .filter(ws => ws.readyState === WebSocket.OPEN).length
  }
}

// Singleton instance
export const wsManager = new WebSocketManager(process.env.NODE_ENV === 'development')

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    wsManager.disconnectAll()
  })
}

export default wsManager
