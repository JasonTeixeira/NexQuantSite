/**
 * WebSocket Client for Real-time Features
 * Handles real-time communication for messages, notifications, and live updates
 */

export type WebSocketEvent = 
  | 'message_received'
  | 'notification_received'
  | 'post_reaction'
  | 'comment_added'
  | 'user_online'
  | 'user_offline'
  | 'post_updated'
  | 'typing_start'
  | 'typing_stop'
  | 'conversation_read'
  | 'system_announcement'

export interface WebSocketMessage {
  type: WebSocketEvent
  data: any
  timestamp: string
  id?: string
}

export interface ConnectionOptions {
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  debug?: boolean
}

export type EventListener = (data: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private options: Required<ConnectionOptions>
  private listeners: Map<WebSocketEvent, EventListener[]> = new Map()
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isConnected = false
  private isConnecting = false
  private connectionListeners: Array<(connected: boolean) => void> = []

  constructor(url: string, options: ConnectionOptions = {}) {
    this.url = url
    this.options = {
      reconnectAttempts: options.reconnectAttempts ?? 5,
      reconnectInterval: options.reconnectInterval ?? 3000,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      debug: options.debug ?? false
    }

    // Auto-connect
    this.connect()
  }

  private log(message: string, ...args: any[]) {
    if (this.options.debug) {
      console.log(`[WebSocket] ${message}`, ...args)
    }
  }

  connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true
        this.log('Connecting to WebSocket...', this.url)

        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.log('WebSocket connected')
          this.isConnected = true
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.notifyConnectionListeners(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            this.log('Error parsing message:', error)
          }
        }

        this.ws.onclose = (event) => {
          this.log('WebSocket closed', event.code, event.reason)
          this.isConnected = false
          this.isConnecting = false
          this.stopHeartbeat()
          this.notifyConnectionListeners(false)

          // Attempt reconnection if it wasn't a clean close
          if (event.code !== 1000 && event.code !== 1001) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          this.log('WebSocket error:', error)
          this.isConnecting = false
          
          if (this.reconnectAttempts === 0) {
            reject(new Error('Failed to connect to WebSocket'))
          }
        }

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.log('Connection timeout')
            this.ws?.close()
            this.isConnecting = false
            reject(new Error('Connection timeout'))
          }
        }, 10000)

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect() {
    this.log('Disconnecting WebSocket')
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'User disconnected')
      this.ws = null
    }

    this.isConnected = false
    this.isConnecting = false
    this.notifyConnectionListeners(false)
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.reconnectAttempts) {
      this.log('Max reconnection attempts reached')
      return
    }

    const delay = this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts)
    this.reconnectAttempts++
    
    this.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect().catch(error => {
          this.log('Reconnection failed:', error)
        })
      }
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private handleMessage(message: WebSocketMessage) {
    this.log('Received message:', message)

    // Handle system messages
    if (message.type === 'system_announcement' && message.data?.type === 'pong') {
      // Heartbeat response
      return
    }

    // Notify listeners
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message.data)
        } catch (error) {
          this.log('Error in event listener:', error)
        }
      })
    }
  }

  send(type: WebSocketEvent, data: any) {
    if (!this.isConnected || !this.ws) {
      this.log('Cannot send message - not connected')
      return false
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    try {
      this.ws.send(JSON.stringify(message))
      this.log('Sent message:', message)
      return true
    } catch (error) {
      this.log('Error sending message:', error)
      return false
    }
  }

  // Event listeners
  on(event: WebSocketEvent, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: WebSocketEvent, listener: EventListener) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Connection status listeners
  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener)
    // Immediately notify current status
    listener(this.isConnected)
  }

  offConnectionChange(listener: (connected: boolean) => void) {
    const index = this.connectionListeners.indexOf(listener)
    if (index > -1) {
      this.connectionListeners.splice(index, 1)
    }
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected)
      } catch (error) {
        this.log('Error in connection listener:', error)
      }
    })
  }

  // Getters
  get connected() {
    return this.isConnected
  }

  get connecting() {
    return this.isConnecting
  }

  get readyState() {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

// Singleton instance
let webSocketClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!webSocketClient) {
    // Use different URLs for development and production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const url = `${protocol}//${host}/api/websocket`
    
    webSocketClient = new WebSocketClient(url, {
      debug: process.env.NODE_ENV === 'development'
    })
  }
  
  return webSocketClient
}

export function disconnectWebSocket() {
  if (webSocketClient) {
    webSocketClient.disconnect()
    webSocketClient = null
  }
}

// React Hook for WebSocket
import { useEffect, useState, useCallback } from 'react'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [client] = useState(() => getWebSocketClient())

  useEffect(() => {
    const handleConnectionChange = (isConnected: boolean) => {
      setConnected(isConnected)
    }

    client.onConnectionChange(handleConnectionChange)

    return () => {
      client.offConnectionChange(handleConnectionChange)
    }
  }, [client])

  const send = useCallback((type: WebSocketEvent, data: any) => {
    return client.send(type, data)
  }, [client])

  const subscribe = useCallback((event: WebSocketEvent, listener: EventListener) => {
    client.on(event, listener)
    
    return () => client.off(event, listener)
  }, [client])

  return {
    connected,
    send,
    subscribe,
    client
  }
}

// Specific hooks for common use cases
export function useRealTimeMessages(conversationId?: string) {
  const { subscribe } = useWebSocket()
  const [newMessage, setNewMessage] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = subscribe('message_received', (data) => {
      if (!conversationId || data.conversationId === conversationId) {
        setNewMessage(data)
      }
    })

    return unsubscribe
  }, [subscribe, conversationId])

  return newMessage
}

export function useRealTimeNotifications() {
  const { subscribe } = useWebSocket()
  const [notification, setNotification] = useState<any>(null)

  useEffect(() => {
    return subscribe('notification_received', setNotification)
  }, [subscribe])

  return notification
}

export function useRealTimePostUpdates(postId?: string) {
  const { subscribe } = useWebSocket()
  const [update, setUpdate] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = subscribe('post_reaction', (data) => {
      if (!postId || data.postId === postId) {
        setUpdate(data)
      }
    })

    return unsubscribe
  }, [subscribe, postId])

  return update
}

export function useTypingIndicator(conversationId: string) {
  const { subscribe, send } = useWebSocket()
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    const unsubscribeStart = subscribe('typing_start', (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId])
      }
    })

    const unsubscribeStop = subscribe('typing_stop', (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId))
      }
    })

    return () => {
      unsubscribeStart()
      unsubscribeStop()
    }
  }, [subscribe, conversationId])

  const startTyping = useCallback(() => {
    send('typing_start', { conversationId })
  }, [send, conversationId])

  const stopTyping = useCallback(() => {
    send('typing_stop', { conversationId })
  }, [send, conversationId])

  return {
    typingUsers,
    startTyping,
    stopTyping
  }
}

export default WebSocketClient

