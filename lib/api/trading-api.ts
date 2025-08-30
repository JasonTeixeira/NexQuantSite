import { resourceManager } from "../performance/resource-manager"
import { cacheManager } from "../performance/cache-manager"

export interface ExchangeConfig {
  name: string
  apiKey: string
  apiSecret: string
  sandbox: boolean
  rateLimit: number
}

export interface OrderRequest {
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop" | "stop_limit"
  quantity: number
  price?: number
  stopPrice?: number
  timeInForce?: "GTC" | "IOC" | "FOK"
  clientOrderId?: string
}

export interface OrderResponse {
  orderId: string
  clientOrderId?: string
  symbol: string
  side: "buy" | "sell"
  type: string
  quantity: number
  price: number
  status: "new" | "partially_filled" | "filled" | "canceled" | "rejected"
  executedQuantity: number
  executedPrice: number
  fees: number
  timestamp: number
}

export interface BalanceInfo {
  asset: string
  free: number
  locked: number
  total: number
}

export interface TickerInfo {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  timestamp: number
}

export class TradingAPI {
  private config: ExchangeConfig
  private baseUrl: string
  private lastRequestTime = 0

  constructor(config: ExchangeConfig) {
    this.config = config
    this.baseUrl = config.sandbox ? "https://testnet.binance.vision/api/v3" : "https://api.binance.com/api/v3"
  }

  async getAccountInfo(): Promise<{ balances: BalanceInfo[] }> {
    const cacheKey = `account_info:${this.config.name}`
    const cached = cacheManager.get<{ balances: BalanceInfo[] }>(cacheKey)

    if (cached) {
      return cached
    }

    const response = await this.makeRequest("GET", "/account")
    const data = await response.json()

    const result = {
      balances: data.balances.map((balance: any) => ({
        asset: balance.asset,
        free: Number.parseFloat(balance.free),
        locked: Number.parseFloat(balance.locked),
        total: Number.parseFloat(balance.free) + Number.parseFloat(balance.locked),
      })),
    }

    cacheManager.set(cacheKey, result, 30000, ["account", "balances"])
    return result
  }

  async getTicker(symbol: string): Promise<TickerInfo> {
    const cacheKey = `ticker:${symbol}`
    const cached = cacheManager.get<TickerInfo>(cacheKey)

    if (cached) {
      return cached
    }

    const response = await this.makeRequest("GET", "/ticker/24hr", { symbol })
    const data = await response.json()

    const result: TickerInfo = {
      symbol: data.symbol,
      price: Number.parseFloat(data.lastPrice),
      change: Number.parseFloat(data.priceChange),
      changePercent: Number.parseFloat(data.priceChangePercent),
      volume: Number.parseFloat(data.volume),
      high: Number.parseFloat(data.highPrice),
      low: Number.parseFloat(data.lowPrice),
      open: Number.parseFloat(data.openPrice),
      timestamp: Date.now(),
    }

    cacheManager.set(cacheKey, result, 5000, ["ticker", symbol])
    return result
  }

  async getAllTickers(): Promise<TickerInfo[]> {
    const cacheKey = "all_tickers"
    const cached = cacheManager.get<TickerInfo[]>(cacheKey)

    if (cached) {
      return cached
    }

    const response = await this.makeRequest("GET", "/ticker/24hr")
    const data = await response.json()

    const result: TickerInfo[] = data.map((ticker: any) => ({
      symbol: ticker.symbol,
      price: Number.parseFloat(ticker.lastPrice),
      change: Number.parseFloat(ticker.priceChange),
      changePercent: Number.parseFloat(ticker.priceChangePercent),
      volume: Number.parseFloat(ticker.volume),
      high: Number.parseFloat(ticker.highPrice),
      low: Number.parseFloat(ticker.lowPrice),
      open: Number.parseFloat(ticker.openPrice),
      timestamp: Date.now(),
    }))

    cacheManager.set(cacheKey, result, 10000, ["tickers"])
    return result
  }

  async getOrderBook(
    symbol: string,
    limit = 100,
  ): Promise<{
    bids: Array<[number, number]>
    asks: Array<[number, number]>
    timestamp: number
  }> {
    const cacheKey = `orderbook:${symbol}:${limit}`
    const cached = cacheManager.get<any>(cacheKey)

    if (cached) {
      return cached
    }

    const response = await this.makeRequest("GET", "/depth", { symbol, limit })
    const data = await response.json()

    const result = {
      bids: data.bids.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]),
      asks: data.asks.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]),
      timestamp: Date.now(),
    }

    cacheManager.set(cacheKey, result, 1000, ["orderbook", symbol])
    return result
  }

  async getKlines(
    symbol: string,
    interval: string,
    limit = 500,
    startTime?: number,
    endTime?: number,
  ): Promise<
    Array<{
      openTime: number
      open: number
      high: number
      low: number
      close: number
      volume: number
      closeTime: number
    }>
  > {
    const cacheKey = `klines:${symbol}:${interval}:${limit}:${startTime}:${endTime}`
    const cached = cacheManager.get<any>(cacheKey)

    if (cached) {
      return cached
    }

    const params: any = { symbol, interval, limit }
    if (startTime) params.startTime = startTime
    if (endTime) params.endTime = endTime

    const response = await this.makeRequest("GET", "/klines", params)
    const data = await response.json()

    const result = data.map((kline: any[]) => ({
      openTime: kline[0],
      open: Number.parseFloat(kline[1]),
      high: Number.parseFloat(kline[2]),
      low: Number.parseFloat(kline[3]),
      close: Number.parseFloat(kline[4]),
      volume: Number.parseFloat(kline[5]),
      closeTime: kline[6],
    }))

    // Cache for different durations based on interval
    const cacheDuration = this.getCacheDuration(interval)
    cacheManager.set(cacheKey, result, cacheDuration, ["klines", symbol, interval])

    return result
  }

  async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    await this.enforceRateLimit()

    const params = {
      symbol: orderRequest.symbol,
      side: orderRequest.side.toUpperCase(),
      type: orderRequest.type.toUpperCase(),
      quantity: orderRequest.quantity.toString(),
      ...(orderRequest.price && { price: orderRequest.price.toString() }),
      ...(orderRequest.stopPrice && { stopPrice: orderRequest.stopPrice.toString() }),
      ...(orderRequest.timeInForce && { timeInForce: orderRequest.timeInForce }),
      ...(orderRequest.clientOrderId && { newClientOrderId: orderRequest.clientOrderId }),
      timestamp: Date.now(),
    }

    const response = await this.makeRequest("POST", "/order", params, true)
    const data = await response.json()

    return {
      orderId: data.orderId.toString(),
      clientOrderId: data.clientOrderId,
      symbol: data.symbol,
      side: data.side.toLowerCase() as "buy" | "sell",
      type: data.type.toLowerCase(),
      quantity: Number.parseFloat(data.origQty),
      price: Number.parseFloat(data.price || "0"),
      status: this.mapOrderStatus(data.status),
      executedQuantity: Number.parseFloat(data.executedQty),
      executedPrice: Number.parseFloat(data.cummulativeQuoteQty) / Number.parseFloat(data.executedQty) || 0,
      fees: Number.parseFloat(
        data.fills?.reduce((sum: number, fill: any) => sum + Number.parseFloat(fill.commission), 0) || "0",
      ),
      timestamp: data.transactTime,
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<OrderResponse> {
    await this.enforceRateLimit()

    const params = {
      symbol,
      orderId,
      timestamp: Date.now(),
    }

    const response = await this.makeRequest("DELETE", "/order", params, true)
    const data = await response.json()

    return {
      orderId: data.orderId.toString(),
      clientOrderId: data.clientOrderId,
      symbol: data.symbol,
      side: data.side.toLowerCase() as "buy" | "sell",
      type: data.type.toLowerCase(),
      quantity: Number.parseFloat(data.origQty),
      price: Number.parseFloat(data.price || "0"),
      status: this.mapOrderStatus(data.status),
      executedQuantity: Number.parseFloat(data.executedQty),
      executedPrice: Number.parseFloat(data.cummulativeQuoteQty) / Number.parseFloat(data.executedQty) || 0,
      fees: 0,
      timestamp: Date.now(),
    }
  }

  async getOrder(symbol: string, orderId: string): Promise<OrderResponse> {
    const cacheKey = `order:${symbol}:${orderId}`
    const cached = cacheManager.get<OrderResponse>(cacheKey)

    if (cached && cached.status !== "new" && cached.status !== "partially_filled") {
      return cached
    }

    const params = {
      symbol,
      orderId,
      timestamp: Date.now(),
    }

    const response = await this.makeRequest("GET", "/order", params, true)
    const data = await response.json()

    const result: OrderResponse = {
      orderId: data.orderId.toString(),
      clientOrderId: data.clientOrderId,
      symbol: data.symbol,
      side: data.side.toLowerCase() as "buy" | "sell",
      type: data.type.toLowerCase(),
      quantity: Number.parseFloat(data.origQty),
      price: Number.parseFloat(data.price || "0"),
      status: this.mapOrderStatus(data.status),
      executedQuantity: Number.parseFloat(data.executedQty),
      executedPrice: Number.parseFloat(data.cummulativeQuoteQty) / Number.parseFloat(data.executedQty) || 0,
      fees: 0,
      timestamp: data.time,
    }

    // Cache completed orders longer
    const cacheDuration = result.status === "filled" || result.status === "canceled" ? 300000 : 10000
    cacheManager.set(cacheKey, result, cacheDuration, ["orders", symbol])

    return result
  }

  async getOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    const cacheKey = `open_orders:${symbol || "all"}`
    const cached = cacheManager.get<OrderResponse[]>(cacheKey)

    if (cached) {
      return cached
    }

    const params: any = {
      timestamp: Date.now(),
    }
    if (symbol) params.symbol = symbol

    const response = await this.makeRequest("GET", "/openOrders", params, true)
    const data = await response.json()

    const result: OrderResponse[] = data.map((order: any) => ({
      orderId: order.orderId.toString(),
      clientOrderId: order.clientOrderId,
      symbol: order.symbol,
      side: order.side.toLowerCase() as "buy" | "sell",
      type: order.type.toLowerCase(),
      quantity: Number.parseFloat(order.origQty),
      price: Number.parseFloat(order.price || "0"),
      status: this.mapOrderStatus(order.status),
      executedQuantity: Number.parseFloat(order.executedQty),
      executedPrice: Number.parseFloat(order.cummulativeQuoteQty) / Number.parseFloat(order.executedQty) || 0,
      fees: 0,
      timestamp: order.time,
    }))

    cacheManager.set(cacheKey, result, 5000, ["orders", "open"])
    return result
  }

  private async makeRequest(
    method: "GET" | "POST" | "DELETE",
    endpoint: string,
    params: Record<string, any> = {},
    signed = false,
  ): Promise<Response> {
    await this.enforceRateLimit()

    let url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-MBX-APIKEY": this.config.apiKey,
    }

    if (signed) {
      const queryString = new URLSearchParams(params).toString()
      const signature = await this.createSignature(queryString)
      params.signature = signature
    }

    if (method === "GET") {
      const queryString = new URLSearchParams(params).toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (method !== "GET") {
      options.body = JSON.stringify(params)
    }

    return resourceManager.fetch(url, options)
  }

  private async createSignature(queryString: string): Promise<string> {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.config.apiSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(queryString))
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    const minInterval = 1000 / this.config.rateLimit

    if (timeSinceLastRequest < minInterval) {
      await new Promise((resolve) => setTimeout(resolve, minInterval - timeSinceLastRequest))
    }

    this.lastRequestTime = Date.now()
  }

  private getCacheDuration(interval: string): number {
    const durations: Record<string, number> = {
      "1s": 1000,
      "1m": 5000,
      "3m": 10000,
      "5m": 15000,
      "15m": 30000,
      "30m": 60000,
      "1h": 120000,
      "2h": 240000,
      "4h": 480000,
      "6h": 720000,
      "8h": 960000,
      "12h": 1440000,
      "1d": 2880000,
      "3d": 8640000,
      "1w": 28800000,
      "1M": 86400000,
    }

    return durations[interval] || 60000
  }

  private mapOrderStatus(status: string): OrderResponse["status"] {
    const statusMap: Record<string, OrderResponse["status"]> = {
      NEW: "new",
      PARTIALLY_FILLED: "partially_filled",
      FILLED: "filled",
      CANCELED: "canceled",
      REJECTED: "rejected",
      EXPIRED: "canceled",
    }

    return statusMap[status] || "new"
  }
}

export const tradingAPI = new TradingAPI({
  name: "binance",
  apiKey: process.env.BINANCE_API_KEY || "",
  apiSecret: process.env.BINANCE_API_SECRET || "",
  sandbox: process.env.NODE_ENV !== "production",
  rateLimit: 10, // requests per second
})
