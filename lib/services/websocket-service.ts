import { config } from "@/lib/config"
import { useTradingStore } from "@/lib/stores/trading-store"

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export interface MarketDataUpdate {
  symbol: string
  price: number
  change: number
  volume: number
  timestamp: string
}

export interface SignalUpdate {
  id: string
  status: "active" | "executed" | "expired"
  executedPrice?: number
  timestamp: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private isConnecting = false
  private subscriptions = new Set<string>()
  private messageHandlers = new Map<string, (data: any) => void>()

  constructor() {
    this.setupDefaultHandlers()
  }

  private setupDefaultHandlers() {
    // Market data updates
    this.messageHandlers.set("market_data", (data: MarketDataUpdate) => {
      const tradingStore = useTradingStore.getState()
      tradingStore.setMarketData(data.symbol, data as any)
    })

    // Signal updates
    this.messageHandlers.set("signal_update", (data: SignalUpdate) => {
      const tradingStore = useTradingStore.getState()
      tradingStore.updateSignal(data.id, data as any)
    })

    // Portfolio updates
    this.messageHandlers.set("portfolio_update", (data: any) => {
      const tradingStore = useTradingStore.getState()
      tradingStore.setPortfolio(data as any)
    })
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error("Connection already in progress"))
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(config.websocket.url)

        this.ws.onopen = () => {
          console.log("WebSocket connected")
          this.isConnecting = false
          this.reconnectAttempts = 0

          // Resubscribe to previous subscriptions
          this.subscriptions.forEach((subscription) => {
            this.send("subscribe", { channel: subscription })
          })

          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason)
          this.isConnecting = false
          this.ws = null

          if (!event.wasClean && this.reconnectAttempts < config.websocket.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          this.isConnecting = false
          reject(error)
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Max 30 seconds

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error)
      })
    }, delay)
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message.data)
    } else {
      console.warn("No handler for message type:", message.type)
    }
  }

  private send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString(),
        }),
      )
    } else {
      console.warn("WebSocket not connected, cannot send message")
    }
  }

  subscribe(channel: string) {
    this.subscriptions.add(channel)
    this.send("subscribe", { channel })
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel)
    this.send("unsubscribe", { channel })
  }

  // Specific subscription methods
  subscribeToMarketData(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.subscribe(`market_data:${symbol}`)
    })
  }

  subscribeToSignals() {
    this.subscribe("signals")
  }

  subscribeToPortfolio() {
    this.subscribe("portfolio")
  }

  subscribeToNotifications() {
    this.subscribe("notifications")
  }

  // Custom message handlers
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, "Client disconnect")
      this.ws = null
    }

    this.subscriptions.clear()
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): string {
    if (!this.ws) return "disconnected"

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting"
      case WebSocket.OPEN:
        return "connected"
      case WebSocket.CLOSING:
        return "closing"
      case WebSocket.CLOSED:
        return "disconnected"
      default:
        return "unknown"
    }
  }
}

export const websocketService = new WebSocketService()

// Auto-connect when feature is enabled
if (config.features.realTimeData && typeof window !== "undefined") {
  websocketService.connect().catch((error) => {
    console.error("Failed to connect WebSocket:", error)
  })
}
