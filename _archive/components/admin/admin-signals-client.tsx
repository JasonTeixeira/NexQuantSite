"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import {
  ArrowLeft,
  Plus,
  Signal,
  TrendingUp,
  TrendingDown,
  Activity,
  Edit,
  Trash2,
  Play,
  Pause,
  Eye,
  Target,
  Users,
  Search,
  Download,
} from "lucide-react"
import { toast } from "sonner"

interface TradingSignal {
  id: string
  pair: string
  type: "long" | "short"
  entry: number
  stopLoss: number
  takeProfit: number
  status: "active" | "closed" | "cancelled" | "pending"
  performance: number
  created: string
  closed?: string
  description: string
  confidence: number
  timeframe: string
  category: "forex" | "crypto" | "stocks" | "commodities"
  subscribers: number
  views: number
  author: string
  tags: string[]
  riskLevel: "low" | "medium" | "high"
  expectedDuration: string
  marketCondition: string
  technicalAnalysis: string
  fundamentalAnalysis?: string
  alerts: boolean
  autoTrade: boolean
}

export default function AdminSignalsClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    pair: "",
    type: "long" as "long" | "short",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    description: "",
    confidence: 75,
    timeframe: "1h",
    category: "crypto" as TradingSignal["category"],
    riskLevel: "medium" as TradingSignal["riskLevel"],
    expectedDuration: "1-3 days",
    marketCondition: "",
    technicalAnalysis: "",
    fundamentalAnalysis: "",
    tags: "",
    alerts: true,
    autoTrade: false,
  })

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    loadSignals()
  }, [router])

  const loadSignals = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with real API
      const mockSignals: TradingSignal[] = [
        {
          id: "1",
          pair: "BTC/USDT",
          type: "long",
          entry: 42500,
          stopLoss: 41000,
          takeProfit: 45000,
          status: "active",
          performance: 5.2,
          created: "2024-01-20 10:30",
          description: "Strong bullish momentum with RSI oversold bounce",
          confidence: 85,
          timeframe: "4h",
          category: "crypto",
          subscribers: 1247,
          views: 3421,
          author: "AI Signal Bot",
          tags: ["breakout", "momentum", "bullish"],
          riskLevel: "medium",
          expectedDuration: "2-5 days",
          marketCondition: "Bullish trend continuation",
          technicalAnalysis: "RSI showing oversold bounce, MACD bullish crossover, price above 20 EMA",
          fundamentalAnalysis: "Positive market sentiment, institutional buying pressure",
          alerts: true,
          autoTrade: true,
        },
        {
          id: "2",
          pair: "EUR/USD",
          type: "short",
          entry: 1.085,
          stopLoss: 1.09,
          takeProfit: 1.075,
          status: "closed",
          performance: 8.1,
          created: "2024-01-19 15:45",
          closed: "2024-01-20 09:30",
          description: "ECB dovish stance weakening EUR",
          confidence: 78,
          timeframe: "1h",
          category: "forex",
          subscribers: 892,
          views: 2156,
          author: "Expert Trader",
          tags: ["fundamental", "central-bank", "bearish"],
          riskLevel: "low",
          expectedDuration: "1-2 days",
          marketCondition: "Range-bound with bearish bias",
          technicalAnalysis: "Resistance at 1.0900, support broken at 1.0800",
          fundamentalAnalysis: "ECB dovish comments, US dollar strength",
          alerts: true,
          autoTrade: false,
        },
        {
          id: "3",
          pair: "AAPL",
          type: "long",
          entry: 185.5,
          stopLoss: 180.0,
          takeProfit: 195.0,
          status: "active",
          performance: -2.1,
          created: "2024-01-20 09:15",
          description: "Earnings beat expectations, strong guidance",
          confidence: 92,
          timeframe: "1d",
          category: "stocks",
          subscribers: 567,
          views: 1234,
          author: "Stock Analyst",
          tags: ["earnings", "growth", "tech"],
          riskLevel: "medium",
          expectedDuration: "1-2 weeks",
          marketCondition: "Post-earnings momentum",
          technicalAnalysis: "Bullish flag pattern, volume confirmation",
          fundamentalAnalysis: "Strong Q4 earnings, positive guidance for 2024",
          alerts: true,
          autoTrade: false,
        },
        {
          id: "4",
          pair: "GOLD/USD",
          type: "long",
          entry: 2025.5,
          stopLoss: 2010.0,
          takeProfit: 2050.0,
          status: "pending",
          performance: 0,
          created: "2024-01-20 14:20",
          description: "Safe haven demand amid geopolitical tensions",
          confidence: 70,
          timeframe: "4h",
          category: "commodities",
          subscribers: 423,
          views: 876,
          author: "Commodity Expert",
          tags: ["safe-haven", "geopolitical", "inflation"],
          riskLevel: "low",
          expectedDuration: "3-7 days",
          marketCondition: "Risk-off sentiment",
          technicalAnalysis: "Support at 2020, resistance at 2040",
          fundamentalAnalysis: "Geopolitical tensions, inflation concerns",
          alerts: true,
          autoTrade: true,
        },
      ]
      setSignals(mockSignals)
    } catch (error) {
      toast.error("Failed to load signals")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSignals = signals.filter((signal) => {
    const matchesSearch =
      signal.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || signal.status === statusFilter
    const matchesCategory = categoryFilter === "all" || signal.category === categoryFilter
    const matchesType = typeFilter === "all" || signal.type === typeFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesType
  })

  const paginatedSignals = filteredSignals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredSignals.length / itemsPerPage)

  const handleCreateSignal = async () => {
    try {
      const newSignal: TradingSignal = {
        id: Date.now().toString(),
        pair: formData.pair,
        type: formData.type,
        entry: Number.parseFloat(formData.entry),
        stopLoss: Number.parseFloat(formData.stopLoss),
        takeProfit: Number.parseFloat(formData.takeProfit),
        status: "pending",
        performance: 0,
        created: new Date().toISOString().replace("T", " ").substring(0, 16),
        description: formData.description,
        confidence: formData.confidence,
        timeframe: formData.timeframe,
        category: formData.category,
        subscribers: 0,
        views: 0,
        author: "Admin",
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        riskLevel: formData.riskLevel,
        expectedDuration: formData.expectedDuration,
        marketCondition: formData.marketCondition,
        technicalAnalysis: formData.technicalAnalysis,
        fundamentalAnalysis: formData.fundamentalAnalysis,
        alerts: formData.alerts,
        autoTrade: formData.autoTrade,
      }

      setSignals([newSignal, ...signals])
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success("Signal created successfully")
    } catch (error) {
      toast.error("Failed to create signal")
    }
  }

  const handleUpdateSignal = async () => {
    if (!selectedSignal) return

    try {
      const updatedSignals = signals.map((signal) =>
        signal.id === selectedSignal.id
          ? {
              ...signal,
              ...formData,
              entry: Number.parseFloat(formData.entry),
              stopLoss: Number.parseFloat(formData.stopLoss),
              takeProfit: Number.parseFloat(formData.takeProfit),
              tags: formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }
          : signal,
      )
      setSignals(updatedSignals)
      setIsEditDialogOpen(false)
      setSelectedSignal(null)
      resetForm()
      toast.success("Signal updated successfully")
    } catch (error) {
      toast.error("Failed to update signal")
    }
  }

  const handleDeleteSignal = async (signalId: string) => {
    try {
      setSignals(signals.filter((signal) => signal.id !== signalId))
      toast.success("Signal deleted successfully")
    } catch (error) {
      toast.error("Failed to delete signal")
    }
  }

  const handleStatusChange = async (signalId: string, newStatus: TradingSignal["status"]) => {
    try {
      const updatedSignals = signals.map((signal) =>
        signal.id === signalId
          ? {
              ...signal,
              status: newStatus,
              closed: newStatus === "closed" ? new Date().toISOString().replace("T", " ").substring(0, 16) : undefined,
            }
          : signal,
      )
      setSignals(updatedSignals)
      toast.success(`Signal ${newStatus} successfully`)
    } catch (error) {
      toast.error("Failed to update signal status")
    }
  }

  const resetForm = () => {
    setFormData({
      pair: "",
      type: "long",
      entry: "",
      stopLoss: "",
      takeProfit: "",
      description: "",
      confidence: 75,
      timeframe: "1h",
      category: "crypto",
      riskLevel: "medium",
      expectedDuration: "1-3 days",
      marketCondition: "",
      technicalAnalysis: "",
      fundamentalAnalysis: "",
      tags: "",
      alerts: true,
      autoTrade: false,
    })
  }

  const openEditDialog = (signal: TradingSignal) => {
    setSelectedSignal(signal)
    setFormData({
      pair: signal.pair,
      type: signal.type,
      entry: signal.entry.toString(),
      stopLoss: signal.stopLoss.toString(),
      takeProfit: signal.takeProfit.toString(),
      description: signal.description,
      confidence: signal.confidence,
      timeframe: signal.timeframe,
      category: signal.category,
      riskLevel: signal.riskLevel,
      expectedDuration: signal.expectedDuration,
      marketCondition: signal.marketCondition,
      technicalAnalysis: signal.technicalAnalysis,
      fundamentalAnalysis: signal.fundamentalAnalysis || "",
      tags: signal.tags.join(", "),
      alerts: signal.alerts,
      autoTrade: signal.autoTrade,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (signal: TradingSignal) => {
    setSelectedSignal(signal)
    setIsViewDialogOpen(true)
  }

  const exportSignals = () => {
    const csvContent = [
      ["Pair", "Type", "Entry", "Stop Loss", "Take Profit", "Status", "Performance", "Created", "Confidence"],
      ...filteredSignals.map((signal) => [
        signal.pair,
        signal.type,
        signal.entry.toString(),
        signal.stopLoss.toString(),
        signal.takeProfit.toString(),
        signal.status,
        `${signal.performance}%`,
        signal.created,
        `${signal.confidence}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "signals-export.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Signals exported successfully")
  }

  // Performance chart data
  const performanceData = signals
    .filter((s) => s.status === "closed")
    .slice(-10)
    .map((signal, index) => ({
      name: signal.pair,
      performance: signal.performance,
      index: index + 1,
    }))

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Signal Management</h1>
                <p className="text-gray-400">Create and manage trading signals</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={exportSignals}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Signal
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Trading Signal</DialogTitle>
                    <DialogDescription className="text-gray-400">Add a new trading signal for users</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pair" className="text-white">
                            Trading Pair
                          </Label>
                          <Input
                            id="pair"
                            value={formData.pair}
                            onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                            placeholder="BTC/USDT"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type" className="text-white">
                            Signal Type
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as "long" | "short" })}
                          >
                            <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-purple-500/30">
                              <SelectItem value="long">Long</SelectItem>
                              <SelectItem value="short">Short</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entry" className="text-white">
                            Entry Price
                          </Label>
                          <Input
                            id="entry"
                            type="number"
                            step="0.01"
                            value={formData.entry}
                            onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                            placeholder="42500"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stopLoss" className="text-white">
                            Stop Loss
                          </Label>
                          <Input
                            id="stopLoss"
                            type="number"
                            step="0.01"
                            value={formData.stopLoss}
                            onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                            placeholder="41000"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="takeProfit" className="text-white">
                            Take Profit
                          </Label>
                          <Input
                            id="takeProfit"
                            type="number"
                            step="0.01"
                            value={formData.takeProfit}
                            onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                            placeholder="45000"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-white">
                            Category
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value as TradingSignal["category"] })
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-purple-500/30">
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="stocks">Stocks</SelectItem>
                              <SelectItem value="commodities">Commodities</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeframe" className="text-white">
                            Timeframe
                          </Label>
                          <Select
                            value={formData.timeframe}
                            onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
                          >
                            <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-purple-500/30">
                              <SelectItem value="5m">5 Minutes</SelectItem>
                              <SelectItem value="15m">15 Minutes</SelectItem>
                              <SelectItem value="1h">1 Hour</SelectItem>
                              <SelectItem value="4h">4 Hours</SelectItem>
                              <SelectItem value="1d">1 Day</SelectItem>
                              <SelectItem value="1w">1 Week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="riskLevel" className="text-white">
                            Risk Level
                          </Label>
                          <Select
                            value={formData.riskLevel}
                            onValueChange={(value) =>
                              setFormData({ ...formData, riskLevel: value as TradingSignal["riskLevel"] })
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-purple-500/30">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="description" className="text-white">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Signal analysis and reasoning..."
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confidence" className="text-white">
                            Confidence Level (%)
                          </Label>
                          <Input
                            id="confidence"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.confidence}
                            onChange={(e) =>
                              setFormData({ ...formData, confidence: Number.parseInt(e.target.value) || 0 })
                            }
                            className="bg-white/10 border-purple-500/30 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expectedDuration" className="text-white">
                            Expected Duration
                          </Label>
                          <Input
                            id="expectedDuration"
                            value={formData.expectedDuration}
                            onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
                            placeholder="1-3 days"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="marketCondition" className="text-white">
                            Market Condition
                          </Label>
                          <Input
                            id="marketCondition"
                            value={formData.marketCondition}
                            onChange={(e) => setFormData({ ...formData, marketCondition: e.target.value })}
                            placeholder="Bullish trend continuation"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="technicalAnalysis" className="text-white">
                            Technical Analysis
                          </Label>
                          <Textarea
                            id="technicalAnalysis"
                            value={formData.technicalAnalysis}
                            onChange={(e) => setFormData({ ...formData, technicalAnalysis: e.target.value })}
                            placeholder="RSI showing oversold bounce, MACD bullish crossover..."
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fundamentalAnalysis" className="text-white">
                            Fundamental Analysis (Optional)
                          </Label>
                          <Textarea
                            id="fundamentalAnalysis"
                            value={formData.fundamentalAnalysis}
                            onChange={(e) => setFormData({ ...formData, fundamentalAnalysis: e.target.value })}
                            placeholder="Positive market sentiment, institutional buying pressure..."
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tags" className="text-white">
                            Tags (comma separated)
                          </Label>
                          <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="breakout, momentum, bullish"
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="alerts" className="text-white">
                              Enable Alerts
                            </Label>
                            <p className="text-sm text-gray-400">Send notifications to subscribers</p>
                          </div>
                          <Switch
                            id="alerts"
                            checked={formData.alerts}
                            onCheckedChange={(checked) => setFormData({ ...formData, alerts: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoTrade" className="text-white">
                              Auto Trading
                            </Label>
                            <p className="text-sm text-gray-400">Allow automated execution</p>
                          </div>
                          <Switch
                            id="autoTrade"
                            checked={formData.autoTrade}
                            onCheckedChange={(checked) => setFormData({ ...formData, autoTrade: checked })}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSignal}>Create Signal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Signals</p>
                  <p className="text-2xl font-bold text-white">{signals.length}</p>
                  <p className="text-green-400 text-sm">+12 this week</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Signal className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Signals</p>
                  <p className="text-2xl font-bold text-white">{signals.filter((s) => s.status === "active").length}</p>
                  <p className="text-green-400 text-sm">Currently running</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {signals.filter((s) => s.status === "closed").length > 0
                      ? Math.round(
                          (signals.filter((s) => s.status === "closed" && s.performance > 0).length /
                            signals.filter((s) => s.status === "closed").length) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-green-400 text-sm">Last 30 days</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Performance</p>
                  <p className="text-2xl font-bold text-white">
                    {signals.filter((s) => s.status === "closed").length > 0
                      ? (
                          signals.filter((s) => s.status === "closed").reduce((sum, s) => sum + s.performance, 0) /
                          signals.filter((s) => s.status === "closed").length
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                  <p className="text-green-400 text-sm">Closed signals</p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Signal Performance</CardTitle>
            <CardDescription className="text-gray-400">Performance of last 10 closed signals</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                performance: {
                  label: "Performance %",
                  color: "#8B5CF6",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="performance" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search signals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-purple-500/30 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-500/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-purple-500/30 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-500/30">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-purple-500/30 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-500/30">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Signals Table */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Trading Signals ({filteredSignals.length})</CardTitle>
            <CardDescription className="text-gray-400">Manage your trading signals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-purple-500/20">
                  <TableHead className="text-gray-300">Signal</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Entry/SL/TP</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Performance</TableHead>
                  <TableHead className="text-gray-300">Engagement</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSignals.map((signal) => (
                  <TableRow key={signal.id} className="border-purple-500/20">
                    <TableCell className="text-white">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            signal.category === "crypto"
                              ? "bg-orange-500/20 text-orange-400"
                              : signal.category === "forex"
                                ? "bg-blue-500/20 text-blue-400"
                                : signal.category === "stocks"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {signal.category === "crypto"
                            ? "₿"
                            : signal.category === "forex"
                              ? "$"
                              : signal.category === "stocks"
                                ? "📈"
                                : "🥇"}
                        </div>
                        <div>
                          <div className="font-medium">{signal.pair}</div>
                          <div className="text-sm text-gray-400">{signal.timeframe}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          signal.type === "long"
                            ? "border-green-500/50 text-green-400"
                            : "border-red-500/50 text-red-400"
                        }
                      >
                        <div className="flex items-center gap-1">
                          {signal.type === "long" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {signal.type}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="text-sm">
                        <div>Entry: {signal.entry}</div>
                        <div>SL: {signal.stopLoss}</div>
                        <div>TP: {signal.takeProfit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          signal.status === "active"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : signal.status === "closed"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : signal.status === "cancelled"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {signal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            signal.performance > 0
                              ? "text-green-400"
                              : signal.performance < 0
                                ? "text-red-400"
                                : "text-gray-400"
                          }
                        >
                          {signal.performance > 0 ? "+" : ""}
                          {signal.performance}%
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            signal.riskLevel === "low"
                              ? "bg-green-400"
                              : signal.riskLevel === "medium"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {signal.subscribers}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {signal.views}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{signal.created}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openViewDialog(signal)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(signal)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {signal.status === "active" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(signal.id, "closed")}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : signal.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(signal.id, "active")}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Signal</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete this signal for {signal.pair}? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSignal(signal.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredSignals.length)} of {filteredSignals.length} signals
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-purple-500/30"
                >
                  Previous
                </Button>
                <span className="text-white px-3 py-1 bg-purple-500/20 rounded">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-purple-500/30"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Signal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Trading Signal</DialogTitle>
            <DialogDescription className="text-gray-400">Update signal information and settings</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pair" className="text-white">
                    Trading Pair
                  </Label>
                  <Input
                    id="edit-pair"
                    value={formData.pair}
                    onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type" className="text-white">
                    Signal Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "long" | "short" })}
                  >
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-purple-500/30">
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-entry" className="text-white">
                    Entry Price
                  </Label>
                  <Input
                    id="edit-entry"
                    type="number"
                    step="0.01"
                    value={formData.entry}
                    onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stopLoss" className="text-white">
                    Stop Loss
                  </Label>
                  <Input
                    id="edit-stopLoss"
                    type="number"
                    step="0.01"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-technicalAnalysis" className="text-white">
                    Technical Analysis
                  </Label>
                  <Textarea
                    id="edit-technicalAnalysis"
                    value={formData.technicalAnalysis}
                    onChange={(e) => setFormData({ ...formData, technicalAnalysis: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags" className="text-white">
                    Tags
                  </Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-alerts" className="text-white">
                    Enable Alerts
                  </Label>
                  <Switch
                    id="edit-alerts"
                    checked={formData.alerts}
                    onCheckedChange={(checked) => setFormData({ ...formData, alerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-autoTrade" className="text-white">
                    Auto Trading
                  </Label>
                  <Switch
                    id="edit-autoTrade"
                    checked={formData.autoTrade}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoTrade: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSignal}>Update Signal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Signal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-purple-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Signal Details</DialogTitle>
            <DialogDescription className="text-gray-400">Complete signal information and performance</DialogDescription>
          </DialogHeader>
          {selectedSignal && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{selectedSignal.pair}</div>
                        <div className="text-gray-400">{selectedSignal.category}</div>
                        <Badge
                          className={`mt-2 ${
                            selectedSignal.type === "long"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {selectedSignal.type.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entry:</span>
                          <span className="text-white">{selectedSignal.entry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stop Loss:</span>
                          <span className="text-white">{selectedSignal.stopLoss}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Take Profit:</span>
                          <span className="text-white">{selectedSignal.takeProfit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Description</Label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedSignal.description}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Confidence</Label>
                    <div className="text-white">{selectedSignal.confidence}%</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Risk Level</Label>
                    <Badge
                      className={`${
                        selectedSignal.riskLevel === "low"
                          ? "bg-green-500/20 text-green-400"
                          : selectedSignal.riskLevel === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {selectedSignal.riskLevel}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Timeframe</Label>
                    <div className="text-white">{selectedSignal.timeframe}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Market Condition</Label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedSignal.marketCondition}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Technical Analysis</Label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedSignal.technicalAnalysis}</div>
                  </div>
                  {selectedSignal.fundamentalAnalysis && (
                    <div className="space-y-2">
                      <Label className="text-gray-400">Fundamental Analysis</Label>
                      <div className="text-white bg-white/5 p-3 rounded-lg">{selectedSignal.fundamentalAnalysis}</div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-gray-400">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSignal.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <div
                        className={`text-2xl font-bold ${
                          selectedSignal.performance > 0
                            ? "text-green-400"
                            : selectedSignal.performance < 0
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {selectedSignal.performance > 0 ? "+" : ""}
                        {selectedSignal.performance}%
                      </div>
                      <div className="text-gray-400">Performance</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">{selectedSignal.subscribers}</div>
                      <div className="text-gray-400">Subscribers</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">{selectedSignal.views}</div>
                      <div className="text-gray-400">Views</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Status</Label>
                  <Badge
                    className={`${
                      selectedSignal.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : selectedSignal.status === "closed"
                          ? "bg-blue-500/20 text-blue-400"
                          : selectedSignal.status === "cancelled"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {selectedSignal.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Created</Label>
                    <div className="text-white">{selectedSignal.created}</div>
                  </div>
                  {selectedSignal.closed && (
                    <div className="space-y-2">
                      <Label className="text-gray-400">Closed</Label>
                      <div className="text-white">{selectedSignal.closed}</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subscribers" className="space-y-4">
                <div className="text-white">Subscriber list and engagement metrics would be displayed here</div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
