"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, X, TrendingUp, TrendingDown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts"

interface Order {
  id: string
  symbol: string
  side: "BUY" | "SELL"
  quantity: number
  price: number
  type:
    | "MARKET"
    | "LIMIT"
    | "STOP"
    | "STOP_LIMIT"
    | "ICEBERG"
    | "TWAP"
    | "VWAP"
    | "POV"
    | "IMPLEMENTATION_SHORTFALL"
    | "ARRIVAL_PRICE"
  status: "PENDING" | "FILLED" | "PARTIAL" | "CANCELLED" | "REJECTED"
  timestamp: Date
  filled: number
  avgPrice: number
  venue: string
}

interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  unrealizedPnL: number
  realizedPnL: number
  exposure: number
}

export function OrderManagementSystem() {
  const [orders, setOrders] = useState<Order[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [newOrder, setNewOrder] = useState({
    symbol: "",
    side: "BUY" as "BUY" | "SELL",
    quantity: "",
    price: "",
    type: "LIMIT" as
      | "MARKET"
      | "LIMIT"
      | "STOP"
      | "STOP_LIMIT"
      | "ICEBERG"
      | "TWAP"
      | "VWAP"
      | "POV"
      | "IMPLEMENTATION_SHORTFALL"
      | "ARRIVAL_PRICE",
    venue: "SMART",
  })

  const [advancedOrderTypes] = useState(["ICEBERG", "TWAP", "VWAP", "POV", "IMPLEMENTATION_SHORTFALL", "ARRIVAL_PRICE"])

  const [executionVenues] = useState([
    { name: "NYSE", latency: "0.2ms", fillRate: 98.5, cost: 0.0005 },
    { name: "NASDAQ", latency: "0.15ms", fillRate: 99.1, cost: 0.0004 },
    { name: "BATS", latency: "0.18ms", fillRate: 97.8, cost: 0.0003 },
    { name: "IEX", latency: "0.35ms", fillRate: 96.2, cost: 0.0009 },
    { name: "DARK_POOL_1", latency: "0.25ms", fillRate: 85.4, cost: 0.0002 },
  ])

  const [orderBook] = useState([
    { price: 175.52, size: 500, side: "BID" },
    { price: 175.51, size: 300, side: "BID" },
    { price: 175.5, size: 800, side: "BID" },
    { price: 175.53, size: 400, side: "ASK" },
    { price: 175.54, size: 600, side: "ASK" },
    { price: 175.55, size: 200, side: "ASK" },
  ])

  const [riskChecks] = useState([
    { name: "Position Limit", status: "PASS", value: "85%", limit: "100%" },
    { name: "Concentration Risk", status: "PASS", value: "12%", limit: "15%" },
    { name: "Leverage Check", status: "PASS", value: "2.1x", limit: "4.0x" },
    { name: "Correlation Limit", status: "WARNING", value: "0.78", limit: "0.80" },
  ])

  // Mock data initialization
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "ORD001",
        symbol: "AAPL",
        side: "BUY",
        quantity: 100,
        price: 175.5,
        type: "LIMIT",
        status: "FILLED",
        timestamp: new Date(Date.now() - 3600000),
        filled: 100,
        avgPrice: 175.45,
        venue: "SMART",
      },
      {
        id: "ORD002",
        symbol: "TSLA",
        side: "SELL",
        quantity: 50,
        price: 245.0,
        type: "LIMIT",
        status: "PARTIAL",
        timestamp: new Date(Date.now() - 1800000),
        filled: 25,
        avgPrice: 245.1,
        venue: "SMART",
      },
      {
        id: "ORD003",
        symbol: "NVDA",
        side: "BUY",
        quantity: 75,
        price: 0,
        type: "MARKET",
        status: "PENDING",
        timestamp: new Date(),
        filled: 0,
        avgPrice: 0,
        venue: "SMART",
      },
    ]

    const mockPositions: Position[] = [
      {
        symbol: "AAPL",
        quantity: 100,
        avgPrice: 175.45,
        currentPrice: 178.2,
        unrealizedPnL: 275.0,
        realizedPnL: 0,
        exposure: 17820,
      },
      {
        symbol: "TSLA",
        quantity: -25,
        avgPrice: 245.1,
        currentPrice: 242.5,
        unrealizedPnL: 65.0,
        realizedPnL: 0,
        exposure: -6062.5,
      },
      {
        symbol: "MSFT",
        quantity: 200,
        avgPrice: 385.75,
        currentPrice: 388.9,
        unrealizedPnL: 630.0,
        realizedPnL: 150.0,
        exposure: 77780,
      },
    ]

    setOrders(mockOrders)
    setPositions(mockPositions)
  }, [])

  const handleSubmitOrder = () => {
    if (!newOrder.symbol || !newOrder.quantity) return

    const order: Order = {
      id: `ORD${String(orders.length + 1).padStart(3, "0")}`,
      symbol: newOrder.symbol.toUpperCase(),
      side: newOrder.side,
      quantity: Number.parseInt(newOrder.quantity),
      price: newOrder.type === "MARKET" ? 0 : Number.parseFloat(newOrder.price),
      type: newOrder.type,
      status: "PENDING",
      timestamp: new Date(),
      filled: 0,
      avgPrice: 0,
      venue: newOrder.venue,
    }

    setOrders([order, ...orders])
    setNewOrder({ symbol: "", side: "BUY", quantity: "", price: "", type: "LIMIT", venue: "SMART" })
  }

  const cancelOrder = (orderId: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "CANCELLED" as const } : order)))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "FILLED":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "PARTIAL":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-blue-400" />
      case "CANCELLED":
        return <X className="h-4 w-4 text-red-400" />
      case "REJECTED":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FILLED":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "PARTIAL":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "PENDING":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL + pos.realizedPnL, 0)
  const totalExposure = positions.reduce((sum, pos) => sum + Math.abs(pos.exposure), 0)

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Order Management System</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Total P&L: </span>
              <span className={totalPnL >= 0 ? "text-green-400" : "text-red-400"}>${totalPnL.toFixed(2)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Total Exposure: </span>
              <span className="text-white">${totalExposure.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a1a2e]">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Active Orders
            </TabsTrigger>
            <TabsTrigger
              value="positions"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Positions
            </TabsTrigger>
            <TabsTrigger
              value="new-order"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              New Order
            </TabsTrigger>
            <TabsTrigger
              value="execution-analytics"
              className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]"
            >
              Execution Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-white">{order.symbol}</span>
                            <Badge
                              variant="outline"
                              className={
                                order.side === "BUY"
                                  ? "text-green-400 border-green-500/30"
                                  : "text-red-400 border-red-500/30"
                              }
                            >
                              {order.side}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {order.quantity} @ {order.type === "MARKET" ? "MKT" : `$${order.price}`} | Filled:{" "}
                            {order.filled}/{order.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{order.timestamp.toLocaleTimeString()}</div>
                          {order.avgPrice > 0 && (
                            <div className="text-sm text-white">Avg: ${order.avgPrice.toFixed(2)}</div>
                          )}
                        </div>
                        {order.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelOrder(order.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Current Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positions.map((position) => (
                    <div
                      key={position.symbol}
                      className="flex items-center justify-between p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]"
                    >
                      <div className="flex items-center space-x-4">
                        {position.quantity > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-white text-lg">{position.symbol}</span>
                            <Badge
                              variant="outline"
                              className={
                                position.quantity > 0
                                  ? "text-green-400 border-green-500/30"
                                  : "text-red-400 border-red-500/30"
                              }
                            >
                              {position.quantity > 0 ? "LONG" : "SHORT"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Qty: {Math.abs(position.quantity)} | Avg: ${position.avgPrice.toFixed(2)} | Current: $
                            {position.currentPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${position.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          ${position.unrealizedPnL.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Exposure: ${Math.abs(position.exposure).toLocaleString()}
                        </div>
                        {position.realizedPnL !== 0 && (
                          <div className="text-sm text-blue-400">Realized: ${position.realizedPnL.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-order" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Place New Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Symbol</label>
                      <Input
                        value={newOrder.symbol}
                        onChange={(e) => setNewOrder({ ...newOrder, symbol: e.target.value })}
                        placeholder="AAPL"
                        className="bg-[#15151f] border-[#2a2a3e] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Side</label>
                      <Select
                        value={newOrder.side}
                        onValueChange={(value: "BUY" | "SELL") => setNewOrder({ ...newOrder, side: value })}
                      >
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="BUY" className="text-green-400">
                            BUY
                          </SelectItem>
                          <SelectItem value="SELL" className="text-red-400">
                            SELL
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Quantity</label>
                      <Input
                        type="number"
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                        placeholder="100"
                        className="bg-[#15151f] border-[#2a2a3e] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Order Type</label>
                      <Select
                        value={newOrder.type}
                        onValueChange={(
                          value:
                            | "MARKET"
                            | "LIMIT"
                            | "STOP"
                            | "STOP_LIMIT"
                            | "ICEBERG"
                            | "TWAP"
                            | "VWAP"
                            | "POV"
                            | "IMPLEMENTATION_SHORTFALL"
                            | "ARRIVAL_PRICE",
                        ) => setNewOrder({ ...newOrder, type: value })}
                      >
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="MARKET">Market</SelectItem>
                          <SelectItem value="LIMIT">Limit</SelectItem>
                          <SelectItem value="STOP">Stop</SelectItem>
                          <SelectItem value="STOP_LIMIT">Stop Limit</SelectItem>
                          {advancedOrderTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newOrder.type !== "MARKET" && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newOrder.price}
                        onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                        placeholder="175.50"
                        className="bg-[#15151f] border-[#2a2a3e] text-white"
                      />
                    </div>
                  )}

                  {/* Advanced Order Types */}
                  <div className="border-t border-[#2a2a3e] pt-4">
                    <h4 className="text-white font-semibold mb-3">Advanced Order Types</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {advancedOrderTypes.map((type) => (
                        <Button
                          key={type}
                          onClick={() => {
                            console.log(`Advanced order type selected: ${type}`)
                            alert(`Setting up ${type} order...`)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#00bbff]/30 text-[#00bbff] hover:bg-[#00bbff]/20 bg-transparent"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Execution Venue Selection */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Execution Venue</label>
                    <Select defaultValue="SMART" onValueChange={(value) => setNewOrder({ ...newOrder, venue: value })}>
                      <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                        <SelectItem value="SMART">Smart Order Routing</SelectItem>
                        {executionVenues.map((venue) => (
                          <SelectItem key={venue.name} value={venue.name}>
                            {venue.name} - {venue.latency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSubmitOrder}
                    className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white"
                    disabled={!newOrder.symbol || !newOrder.quantity}
                  >
                    Place Order
                  </Button>
                </CardContent>
              </Card>

              {/* Order Book and Risk Checks Panel */}
              <div className="space-y-4">
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Level II Order Book</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-xs font-mono">
                      {orderBook
                        .filter((o) => o.side === "ASK")
                        .reverse()
                        .map((order, i) => (
                          <div key={i} className="flex justify-between text-red-400">
                            <span>{order.size}</span>
                            <span>{order.price.toFixed(2)}</span>
                          </div>
                        ))}
                      <div className="border-t border-[#2a2a3e] my-2"></div>
                      {orderBook
                        .filter((o) => o.side === "BID")
                        .map((order, i) => (
                          <div key={i} className="flex justify-between text-green-400">
                            <span>{order.size}</span>
                            <span>{order.price.toFixed(2)}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Pre-Trade Risk Checks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {riskChecks.map((check, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{check.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white">{check.value}</span>
                            <Badge
                              variant="outline"
                              className={
                                check.status === "PASS"
                                  ? "text-green-400 border-green-500/30"
                                  : "text-yellow-400 border-yellow-500/30"
                              }
                            >
                              {check.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Execution Analytics Tab */}
          <TabsContent value="execution-analytics" className="space-y-4">
            {/* VWAP/TWAP Performance */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">VWAP/TWAP Performance - AAPL</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={[
                    { time: "09:30", price: 175.20, vwap: 175.18, twap: 175.15, volume: 82000 },
                    { time: "09:45", price: 175.35, vwap: 175.28, twap: 175.22, volume: 65000 },
                    { time: "10:00", price: 175.45, vwap: 175.38, twap: 175.31, volume: 48000 },
                    { time: "10:15", price: 175.52, vwap: 175.42, twap: 175.38, volume: 52000 },
                    { time: "10:30", price: 175.48, vwap: 175.45, twap: 175.42, volume: 39000 },
                    { time: "10:45", price: 175.55, vwap: 175.48, twap: 175.45, volume: 44000 },
                    { time: "11:00", price: 175.62, vwap: 175.52, twap: 175.48, volume: 36000 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="time" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `$${value.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="volume" fill="#00bbff" fillOpacity={0.3} yAxisId="volume" />
                    <Line type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={2} name="Market Price" />
                    <Line type="monotone" dataKey="vwap" stroke="#00bbff" strokeWidth={2} name="VWAP" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="twap" stroke="#fbbf24" strokeWidth={2} name="TWAP" strokeDasharray="3 3" />
                  </ComposedChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">VWAP Deviation</div>
                    <div className="font-mono text-green-400">-0.008%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">TWAP Deviation</div>
                    <div className="font-mono text-red-400">+0.012%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Participation Rate</div>
                    <div className="font-mono text-[#00bbff]">8.5%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Venue Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {executionVenues.map((venue, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-semibold">{venue.name}</span>
                          <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                            {venue.fillRate}% Fill
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Latency: </span>
                            <span className="text-green-400">{venue.latency}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Cost: </span>
                            <span className="text-yellow-400">{venue.cost}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Execution Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm text-gray-400 mb-1">Average Slippage</div>
                      <div className="text-xl font-bold text-red-400">-0.023%</div>
                    </div>
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm text-gray-400 mb-1">Implementation Shortfall</div>
                      <div className="text-xl font-bold text-yellow-400">0.045%</div>
                    </div>
                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm text-gray-400 mb-1">Market Impact</div>
                      <div className="text-xl font-bold text-[#00bbff]">0.012%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trade P&L Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Trade P&L Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { range: "-2%+", count: 2, pnl: -850 },
                      { range: "-1%", count: 5, pnl: -420 },
                      { range: "-0.5%", count: 12, pnl: -280 },
                      { range: "0%", count: 35, pnl: 120 },
                      { range: "+0.5%", count: 28, pnl: 680 },
                      { range: "+1%", count: 15, pnl: 920 },
                      { range: "+2%+", count: 8, pnl: 1240 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="range" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="#00bbff" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Daily Execution Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Total Trades</div>
                        <div className="text-xl font-mono text-white">147</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Win Rate</div>
                        <div className="text-xl font-mono text-green-400">62.4%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Avg Hold Time</div>
                        <div className="text-xl font-mono text-[#00bbff]">2h 34m</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Total Volume</div>
                        <div className="text-xl font-mono text-white">$2.4M</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
