"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { marketDataService, type MarketData } from "@/lib/market-data-service"
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap } from "lucide-react"

interface Order {
  id: string
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop"
  quantity: number
  price?: number
  status: "pending" | "filled" | "cancelled"
  timestamp: number
}

interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

export default function LiveTradingInterface() {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USD")
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [balance, setBalance] = useState(10000)

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [isSwipeMode, setIsSwipeMode] = useState(false)
  const [pinchScale, setPinchScale] = useState(1)
  const [lastPinchDistance, setLastPinchDistance] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      setLastPinchDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    if (e.touches.length === 2) {
      // Pinch to zoom for chart scaling
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      const scale = distance / lastPinchDistance
      setPinchScale((prev) => Math.max(0.5, Math.min(3, prev * scale)))
      setLastPinchDistance(distance)
    } else if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStart.x
      const deltaY = e.touches[0].clientY - touchStart.y

      // Horizontal swipe for symbol switching
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
        setIsSwipeMode(true)
        const symbols = Object.keys(marketData)
        const currentIndex = symbols.indexOf(selectedSymbol)

        if (deltaX > 0 && currentIndex > 0) {
          setSelectedSymbol(symbols[currentIndex - 1])
        } else if (deltaX < 0 && currentIndex < symbols.length - 1) {
          setSelectedSymbol(symbols[currentIndex + 1])
        }
      }
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    setIsSwipeMode(false)
    setPinchScale(1)
  }

  const handleLongPress = (action: string) => {
    navigator.vibrate?.(50) // Haptic feedback

    switch (action) {
      case "quick-buy":
        setOrderSide("buy")
        setOrderType("market")
        setQuantity("0.1")
        break
      case "quick-sell":
        setOrderSide("sell")
        setOrderType("market")
        setQuantity("0.1")
        break
      case "close-all":
        // Close all positions logic
        break
    }
  }

  useEffect(() => {
    const unsubscribe = marketDataService.subscribe("marketData", (data: MarketData) => {
      setMarketData((prev) => ({
        ...prev,
        [data.symbol]: data,
      }))
    })

    return unsubscribe
  }, [])

  const handlePlaceOrder = useCallback(() => {
    if (!quantity || (orderType !== "market" && !price)) {
      return
    }

    const currentPrice = marketData[selectedSymbol]?.price || 0
    const orderPrice = orderType === "market" ? currentPrice : Number.parseFloat(price)
    const orderQuantity = Number.parseFloat(quantity)

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      symbol: selectedSymbol,
      side: orderSide,
      type: orderType,
      quantity: orderQuantity,
      price: orderPrice,
      status: "pending",
      timestamp: Date.now(),
    }

    setOrders((prev) => [newOrder, ...prev])

    // Simulate order execution
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((order) => (order.id === newOrder.id ? { ...order, status: "filled" as const } : order)),
      )

      // Update positions
      const totalCost = orderQuantity * orderPrice
      if (orderSide === "buy") {
        setBalance((prev) => prev - totalCost)
        setPositions((prev) => {
          const existingPosition = prev.find((p) => p.symbol === selectedSymbol)
          if (existingPosition) {
            const newQuantity = existingPosition.quantity + orderQuantity
            const newAvgPrice = (existingPosition.quantity * existingPosition.avgPrice + totalCost) / newQuantity
            return prev.map((p) =>
              p.symbol === selectedSymbol ? { ...p, quantity: newQuantity, avgPrice: newAvgPrice } : p,
            )
          } else {
            return [
              ...prev,
              {
                symbol: selectedSymbol,
                quantity: orderQuantity,
                avgPrice: orderPrice,
                currentPrice: orderPrice,
                pnl: 0,
                pnlPercent: 0,
              },
            ]
          }
        })
      } else {
        setBalance((prev) => prev + totalCost)
        setPositions((prev) =>
          prev
            .map((p) => (p.symbol === selectedSymbol ? { ...p, quantity: Math.max(0, p.quantity - orderQuantity) } : p))
            .filter((p) => p.quantity > 0),
        )
      }
    }, 1000)

    // Reset form
    setQuantity("")
    setPrice("")
  }, [selectedSymbol, orderSide, orderType, quantity, price, marketData])

  // Update position P&L
  useEffect(() => {
    setPositions((prev) =>
      prev.map((position) => {
        const currentPrice = marketData[position.symbol]?.price || position.avgPrice
        const pnl = (currentPrice - position.avgPrice) * position.quantity
        const pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100
        return {
          ...position,
          currentPrice,
          pnl,
          pnlPercent,
        }
      }),
    )
  }, [marketData])

  const currentMarketData = marketData[selectedSymbol]
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalValue = balance + positions.reduce((sum, pos) => sum + pos.currentPrice * pos.quantity, 0)

  return (
    <div
      className="space-y-4 sm:space-y-6 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y pinch-zoom" }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="touch-manipulation">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Balance</p>
                <p className="text-base sm:text-lg font-semibold">${balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Value</p>
                <p className="text-base sm:text-lg font-semibold">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              )}
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">P&L</p>
                <p
                  className={`text-base sm:text-lg font-semibold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  ${totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Positions</p>
                <p className="text-base sm:text-lg font-semibold">{positions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 touch-manipulation">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Live Market Data</span>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">Swipe left/right to switch symbols</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.values(marketData).map((data) => (
                <div
                  key={data.symbol}
                  className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 touch-manipulation min-h-[60px] sm:min-h-[80px] ${
                    selectedSymbol === data.symbol
                      ? "bg-primary/10 border-primary shadow-lg scale-[1.02]"
                      : "hover:bg-muted/50 active:scale-[0.98]"
                  }`}
                  onClick={() => setSelectedSymbol(data.symbol)}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = "scale(0.98)"
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{data.symbol}</h3>
                      <p className="text-xl sm:text-2xl font-bold">${data.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`flex items-center space-x-1 ${
                          data.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {data.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <span className="font-semibold text-sm sm:text-base">{data.changePercent.toFixed(2)}%</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Vol: {(data.volume / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs sm:text-sm">Symbol</Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="h-12 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(marketData).map((symbol) => (
                    <SelectItem key={symbol} value={symbol} className="h-12 sm:h-10">
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderSide === "buy" ? "default" : "outline"}
                onClick={() => setOrderSide("buy")}
                onTouchStart={() => navigator.vibrate?.(25)}
                className="bg-green-500 hover:bg-green-600 h-12 sm:h-10 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              >
                Buy
              </Button>
              <Button
                variant={orderSide === "sell" ? "default" : "outline"}
                onClick={() => setOrderSide("sell")}
                onTouchStart={() => navigator.vibrate?.(25)}
                className="bg-red-500 hover:bg-red-600 h-12 sm:h-10 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              >
                Sell
              </Button>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Order Type</Label>
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger className="h-12 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market" className="h-12 sm:h-10">
                    Market
                  </SelectItem>
                  <SelectItem value="limit" className="h-12 sm:h-10">
                    Limit
                  </SelectItem>
                  <SelectItem value="stop" className="h-12 sm:h-10">
                    Stop
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="h-12 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {orderType !== "market" && (
              <div>
                <Label className="text-xs sm:text-sm">Price</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-12 sm:h-10 text-sm sm:text-base"
                />
              </div>
            )}

            {currentMarketData && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
                <p className="text-base sm:text-lg font-semibold">${currentMarketData.price.toFixed(2)}</p>
              </div>
            )}

            <Button
              onClick={handlePlaceOrder}
              onTouchStart={() => navigator.vibrate?.(50)}
              className="w-full h-12 sm:h-10 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              disabled={!quantity || (orderType !== "market" && !price)}
            >
              Place {orderSide.toUpperCase()} Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Orders and Positions */}
      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No open positions</p>
              ) : (
                <div className="space-y-4">
                  {positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{position.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          {position.quantity} @ ${position.avgPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${position.currentPrice.toFixed(2)}</p>
                        <p className={`text-sm ${position.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                          ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders placed</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={order.side === "buy" ? "default" : "destructive"}>
                            {order.side.toUpperCase()}
                          </Badge>
                          <span className="font-semibold">{order.symbol}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} @ ${order.price?.toFixed(2)} ({order.type})
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            order.status === "filled"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
