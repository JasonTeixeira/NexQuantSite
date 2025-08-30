"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  Treemap, FunnelChart, Funnel, LabelList
} from "recharts"
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
  Calculator, FileText, Target, AlertTriangle, CheckCircle, XCircle,
  ArrowUp, ArrowDown, Minus, RefreshCw, Download, Settings, Calendar,
  CreditCard, Receipt, Building, Wallet, Activity, Clock, Eye,
  Globe, Users, Zap, Award, Brain
} from "lucide-react"
import { toast } from "sonner"

interface RevenueMetrics {
  totalRevenue: number
  recurringRevenue: number
  oneTimeRevenue: number
  growth: {
    month: number
    quarter: number
    year: number
  }
  breakdown: {
    subscriptions: number
    commissions: number
    premiumFeatures: number
    partnerships: number
  }
  forecast: {
    nextMonth: number
    nextQuarter: number
    confidence: number
  }
}

interface ExpenseMetrics {
  totalExpenses: number
  categories: {
    salaries: number
    marketing: number
    infrastructure: number
    operations: number
    legal: number
    other: number
  }
  trends: {
    monthly: number
    quarterly: number
  }
  budgetComparison: {
    planned: number
    actual: number
    variance: number
  }
}

interface ProfitabilityMetrics {
  grossProfit: number
  netProfit: number
  ebitda: number
  margins: {
    gross: number
    net: number
    operating: number
  }
  ratios: {
    roe: number // Return on Equity
    roi: number // Return on Investment
    roa: number // Return on Assets
  }
}

interface CashFlowMetrics {
  operating: number
  investing: number
  financing: number
  free: number
  burnRate: number
  runway: number // months
}

interface KPIMetrics {
  arr: number // Annual Recurring Revenue
  mrr: number // Monthly Recurring Revenue
  cac: number // Customer Acquisition Cost
  ltv: number // Customer Lifetime Value
  ltvCacRatio: number
  churnRate: number
  arpu: number // Average Revenue Per User
  paybackPeriod: number
}

interface FinancialForecasts {
  revenue: Array<{
    month: string
    conservative: number
    realistic: number
    optimistic: number
  }>
  expenses: Array<{
    month: string
    planned: number
    projected: number
  }>
  cashFlow: Array<{
    month: string
    projected: number
    confidence: number
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function FinancialCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    recurringRevenue: 0,
    oneTimeRevenue: 0,
    growth: { month: 0, quarter: 0, year: 0 },
    breakdown: { subscriptions: 0, commissions: 0, premiumFeatures: 0, partnerships: 0 },
    forecast: { nextMonth: 0, nextQuarter: 0, confidence: 0 }
  })

  const [expenseMetrics, setExpenseMetrics] = useState<ExpenseMetrics>({
    totalExpenses: 0,
    categories: { salaries: 0, marketing: 0, infrastructure: 0, operations: 0, legal: 0, other: 0 },
    trends: { monthly: 0, quarterly: 0 },
    budgetComparison: { planned: 0, actual: 0, variance: 0 }
  })

  const [profitabilityMetrics, setProfitabilityMetrics] = useState<ProfitabilityMetrics>({
    grossProfit: 0,
    netProfit: 0,
    ebitda: 0,
    margins: { gross: 0, net: 0, operating: 0 },
    ratios: { roe: 0, roi: 0, roa: 0 }
  })

  const [cashFlowMetrics, setCashFlowMetrics] = useState<CashFlowMetrics>({
    operating: 0,
    investing: 0,
    financing: 0,
    free: 0,
    burnRate: 0,
    runway: 0
  })

  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics>({
    arr: 0,
    mrr: 0,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    churnRate: 0,
    arpu: 0,
    paybackPeriod: 0
  })

  const [forecasts, setForecasts] = useState<FinancialForecasts>({
    revenue: [],
    expenses: [],
    cashFlow: []
  })

  useEffect(() => {
    loadFinancialData()
  }, [selectedPeriod, selectedYear])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        updateRealTimeData()
      }, 60000) // Update every minute for financial data
    }
    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  const loadFinancialData = async () => {
    setIsLoading(true)
    try {
      // Comprehensive mock financial data
      const mockRevenueMetrics: RevenueMetrics = {
        totalRevenue: 485620,
        recurringRevenue: 342800,
        oneTimeRevenue: 142820,
        growth: {
          month: 12.7,
          quarter: 38.4,
          year: 145.6
        },
        breakdown: {
          subscriptions: 298450,
          commissions: 128370,
          premiumFeatures: 43200,
          partnerships: 15600
        },
        forecast: {
          nextMonth: 524300,
          nextQuarter: 1567200,
          confidence: 87
        }
      }

      const mockExpenseMetrics: ExpenseMetrics = {
        totalExpenses: 324150,
        categories: {
          salaries: 185000,
          marketing: 67500,
          infrastructure: 34200,
          operations: 22800,
          legal: 8650,
          other: 6000
        },
        trends: {
          monthly: 8.3,
          quarterly: 23.7
        },
        budgetComparison: {
          planned: 340000,
          actual: 324150,
          variance: -4.7
        }
      }

      const mockProfitabilityMetrics: ProfitabilityMetrics = {
        grossProfit: 378950,
        netProfit: 161470,
        ebitda: 198420,
        margins: {
          gross: 78.1,
          net: 33.2,
          operating: 40.8
        },
        ratios: {
          roe: 22.4,
          roi: 18.7,
          roa: 15.3
        }
      }

      const mockCashFlowMetrics: CashFlowMetrics = {
        operating: 187650,
        investing: -45200,
        financing: 125000,
        free: 142450,
        burnRate: 28500,
        runway: 18
      }

      const mockKPIMetrics: KPIMetrics = {
        arr: 4114000,
        mrr: 342800,
        cac: 125,
        ltv: 2840,
        ltvCacRatio: 22.7,
        churnRate: 2.1,
        arpu: 156,
        paybackPeriod: 4.2
      }

      const mockForecasts: FinancialForecasts = {
        revenue: [
          { month: "Jan 2024", conservative: 420000, realistic: 485000, optimistic: 545000 },
          { month: "Feb 2024", conservative: 445000, realistic: 524000, optimistic: 598000 },
          { month: "Mar 2024", conservative: 478000, realistic: 567000, optimistic: 645000 },
          { month: "Apr 2024", conservative: 502000, realistic: 598000, optimistic: 685000 },
          { month: "May 2024", conservative: 534000, realistic: 634000, optimistic: 728000 },
          { month: "Jun 2024", conservative: 567000, realistic: 672000, optimistic: 775000 }
        ],
        expenses: [
          { month: "Jan 2024", planned: 340000, projected: 324000 },
          { month: "Feb 2024", planned: 352000, projected: 341000 },
          { month: "Mar 2024", planned: 365000, projected: 358000 },
          { month: "Apr 2024", planned: 378000, projected: 375000 },
          { month: "May 2024", planned: 392000, projected: 389000 },
          { month: "Jun 2024", planned: 407000, projected: 402000 }
        ],
        cashFlow: [
          { month: "Jan 2024", projected: 161000, confidence: 89 },
          { month: "Feb 2024", projected: 183000, confidence: 87 },
          { month: "Mar 2024", projected: 209000, confidence: 85 },
          { month: "Apr 2024", projected: 223000, confidence: 82 },
          { month: "May 2024", projected: 245000, confidence: 80 },
          { month: "Jun 2024", projected: 270000, confidence: 78 }
        ]
      }

      setRevenueMetrics(mockRevenueMetrics)
      setExpenseMetrics(mockExpenseMetrics)
      setProfitabilityMetrics(mockProfitabilityMetrics)
      setCashFlowMetrics(mockCashFlowMetrics)
      setKpiMetrics(mockKPIMetrics)
      setForecasts(mockForecasts)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading financial data:", error)
      toast.error("Failed to load financial data")
      setIsLoading(false)
    }
  }

  const updateRealTimeData = () => {
    // Simulate small changes in real-time financial metrics
    setRevenueMetrics(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + Math.random() * 1000 - 500
    }))
    setLastUpdated(new Date())
  }

  // Time series data for financial charts
  const monthlyFinancialData = [
    { month: "Jul", revenue: 425000, expenses: 298000, profit: 127000 },
    { month: "Aug", revenue: 456000, expenses: 312000, profit: 144000 },
    { month: "Sep", revenue: 478000, expenses: 324000, profit: 154000 },
    { month: "Oct", revenue: 502000, expenses: 335000, profit: 167000 },
    { month: "Nov", revenue: 534000, expenses: 349000, profit: 185000 },
    { month: "Dec", revenue: 486000, expenses: 324000, profit: 162000 }
  ]

  const revenueBreakdownData = Object.entries(revenueMetrics.breakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: COLORS[Object.keys(revenueMetrics.breakdown).indexOf(key)]
  }))

  const expenseBreakdownData = Object.entries(expenseMetrics.categories).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: COLORS[Object.keys(expenseMetrics.categories).indexOf(key)]
  }))

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-400"
    if (value < 0) return "text-red-400"
    return "text-gray-400"
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getHealthStatus = (metric: string, value: number) => {
    const benchmarks = {
      grossMargin: { good: 70, warning: 50 },
      netMargin: { good: 25, warning: 15 },
      burnRate: { good: 20000, warning: 40000 }, // Reverse logic
      ltvCacRatio: { good: 3, warning: 2 },
      churnRate: { good: 3, warning: 5 } // Reverse logic
    }

    const benchmark = benchmarks[metric as keyof typeof benchmarks]
    if (!benchmark) return "good"

    if (metric === 'burnRate' || metric === 'churnRate') {
      // Lower is better
      if (value <= benchmark.good) return "good"
      if (value <= benchmark.warning) return "warning"
      return "critical"
    } else {
      // Higher is better
      if (value >= benchmark.good) return "good"
      if (value >= benchmark.warning) return "warning"
      return "critical"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-400"
      case "warning": return "text-yellow-400"
      case "critical": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "critical": return <XCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading financial command center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-blue-400" />
            Financial Command Center
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive financial reporting, analytics, and forecasting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label className="text-gray-300 text-sm">Real-time</Label>
            <Switch 
              checked={isRealTimeEnabled} 
              onCheckedChange={setIsRealTimeEnabled}
            />
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-20 bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadFinancialData} className="border-gray-600 text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setReportDialogOpen(true)}
            className="border-gray-600 text-gray-400"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Health Overview */}
      <Card className="bg-gray-900/50 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${profitabilityMetrics.netProfit > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {profitabilityMetrics.netProfit > 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Financial Health: {profitabilityMetrics.netProfit > 0 ? 'Profitable' : 'Loss-making'}
                </h2>
                <p className="text-gray-400 text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatCurrency(revenueMetrics.totalRevenue)}</div>
                <div className="text-gray-400 text-sm">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatCurrency(profitabilityMetrics.netProfit)}</div>
                <div className="text-gray-400 text-sm">Net Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profitabilityMetrics.margins.net.toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Net Margin</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(kpiMetrics.mrr)}</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(revenueMetrics.growth.month)}
                  <span className={`text-sm ${getTrendColor(revenueMetrics.growth.month)}`}>
                    {revenueMetrics.growth.month.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Receipt className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Customer Acquisition Cost</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(kpiMetrics.cac)}</p>
                <p className="text-blue-400 text-xs">LTV/CAC: {kpiMetrics.ltvCacRatio.toFixed(1)}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cash Runway</p>
                <p className="text-2xl font-bold text-white">{cashFlowMetrics.runway}mo</p>
                <p className="text-yellow-400 text-xs">Burn: {formatCurrency(cashFlowMetrics.burnRate)}/mo</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Churn Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(getHealthStatus('churnRate', kpiMetrics.churnRate))}`}>
                  {kpiMetrics.churnRate.toFixed(1)}%
                </p>
                <p className="text-purple-400 text-xs">Target: &lt; 3%</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Financial Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="revenue" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger 
            value="expenses" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger 
            value="profitability" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Profitability
          </TabsTrigger>
          <TabsTrigger 
            value="cashflow" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Cash Flow
          </TabsTrigger>
          <TabsTrigger 
            value="forecasts" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Forecasts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Performance Trends */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Financial Performance
                </CardTitle>
                <CardDescription>Revenue, expenses, and profit trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <ComposedChart data={monthlyFinancialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="revenue" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="Revenue" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} name="Profit" />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Key Financial Ratios */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Key Financial Ratios
                </CardTitle>
                <CardDescription>Performance indicators and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Gross Margin</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getHealthStatus('grossMargin', profitabilityMetrics.margins.gross))}
                      <span className={`font-medium ${getStatusColor(getHealthStatus('grossMargin', profitabilityMetrics.margins.gross))}`}>
                        {profitabilityMetrics.margins.gross.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Net Margin</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getHealthStatus('netMargin', profitabilityMetrics.margins.net))}
                      <span className={`font-medium ${getStatusColor(getHealthStatus('netMargin', profitabilityMetrics.margins.net))}`}>
                        {profitabilityMetrics.margins.net.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">LTV/CAC Ratio</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getHealthStatus('ltvCacRatio', kpiMetrics.ltvCacRatio))}
                      <span className={`font-medium ${getStatusColor(getHealthStatus('ltvCacRatio', kpiMetrics.ltvCacRatio))}`}>
                        {kpiMetrics.ltvCacRatio.toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Return on Investment</span>
                    <span className="text-white font-medium">{profitabilityMetrics.ratios.roi.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Return on Equity</span>
                    <span className="text-white font-medium">{profitabilityMetrics.ratios.roe.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Payback Period</span>
                    <span className="text-white font-medium">{kpiMetrics.paybackPeriod.toFixed(1)} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Health Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Revenue Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Growth Rate</span>
                    <span className={`font-medium ${getTrendColor(revenueMetrics.growth.month)}`}>
                      +{revenueMetrics.growth.month.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recurring %</span>
                    <span className="text-white font-medium">
                      {((revenueMetrics.recurringRevenue / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Forecast Confidence</span>
                    <span className="text-green-400 font-medium">{revenueMetrics.forecast.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Cost Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget Variance</span>
                    <span className={`font-medium ${expenseMetrics.budgetComparison.variance < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {expenseMetrics.budgetComparison.variance > 0 ? '+' : ''}{expenseMetrics.budgetComparison.variance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost/Revenue</span>
                    <span className="text-white font-medium">
                      {((expenseMetrics.totalExpenses / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Burn Rate</span>
                    <span className={`font-medium ${getStatusColor(getHealthStatus('burnRate', cashFlowMetrics.burnRate))}`}>
                      {formatCurrency(cashFlowMetrics.burnRate)}/mo
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Cash Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Free Cash Flow</span>
                    <span className={`font-medium ${cashFlowMetrics.free > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(cashFlowMetrics.free)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Operating Cash Flow</span>
                    <span className="text-white font-medium">{formatCurrency(cashFlowMetrics.operating)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Runway</span>
                    <span className={`font-medium ${cashFlowMetrics.runway > 12 ? 'text-green-400' : cashFlowMetrics.runway > 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {cashFlowMetrics.runway} months
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(revenueMetrics.totalRevenue)}</p>
                  <div className="flex items-center justify-center space-x-1">
                    {getTrendIcon(revenueMetrics.growth.month)}
                    <span className={`text-sm ${getTrendColor(revenueMetrics.growth.month)}`}>
                      {revenueMetrics.growth.month.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Recurring Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(revenueMetrics.recurringRevenue)}</p>
                  <p className="text-green-400 text-xs">
                    {((revenueMetrics.recurringRevenue / revenueMetrics.totalRevenue) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">One-time Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(revenueMetrics.oneTimeRevenue)}</p>
                  <p className="text-yellow-400 text-xs">
                    {((revenueMetrics.oneTimeRevenue / revenueMetrics.totalRevenue) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">ARPU</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(kpiMetrics.arpu)}</p>
                  <p className="text-purple-400 text-xs">Average Revenue Per User</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Revenue sources and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {revenueBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm">{item.name}: {formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Growth Analysis */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Growth Analysis
                </CardTitle>
                <CardDescription>Revenue growth across different timeframes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-white font-medium mb-4">Growth Rates</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getTrendColor(revenueMetrics.growth.month)}`}>
                          {revenueMetrics.growth.month > 0 ? '+' : ''}{revenueMetrics.growth.month.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-sm">Monthly</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getTrendColor(revenueMetrics.growth.quarter)}`}>
                          {revenueMetrics.growth.quarter > 0 ? '+' : ''}{revenueMetrics.growth.quarter.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-sm">Quarterly</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getTrendColor(revenueMetrics.growth.year)}`}>
                          {revenueMetrics.growth.year > 0 ? '+' : ''}{revenueMetrics.growth.year.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-sm">Yearly</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-white font-medium mb-4">Revenue Forecast</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Month</span>
                        <span className="text-white font-medium">{formatCurrency(revenueMetrics.forecast.nextMonth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Quarter</span>
                        <span className="text-white font-medium">{formatCurrency(revenueMetrics.forecast.nextQuarter)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={revenueMetrics.forecast.confidence} className="w-16 h-2" />
                          <span className="text-green-400 font-medium">{revenueMetrics.forecast.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/50 border-red-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(expenseMetrics.totalExpenses)}</p>
                  <div className="flex items-center justify-center space-x-1">
                    {getTrendIcon(expenseMetrics.trends.monthly)}
                    <span className={`text-sm ${getTrendColor(expenseMetrics.trends.monthly)}`}>
                      {expenseMetrics.trends.monthly.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Budget Planned</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(expenseMetrics.budgetComparison.planned)}</p>
                  <p className="text-blue-400 text-xs">Budget for period</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Budget Variance</p>
                  <p className={`text-2xl font-bold ${expenseMetrics.budgetComparison.variance < 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {expenseMetrics.budgetComparison.variance > 0 ? '+' : ''}{expenseMetrics.budgetComparison.variance.toFixed(1)}%
                  </p>
                  <p className="text-yellow-400 text-xs">vs planned</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Expense Categories
                </CardTitle>
                <CardDescription>Cost breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {expenseBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm">{item.name}: {formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Analysis */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Budget Analysis
                </CardTitle>
                <CardDescription>Planned vs actual spending analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expenseMetrics.categories).map(([category, amount]) => {
                    const planned = expenseMetrics.budgetComparison.planned * (amount / expenseMetrics.totalExpenses)
                    const variance = ((amount - planned) / planned) * 100
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300 capitalize">{category}</span>
                          <div className="text-right">
                            <div className="text-white font-medium">{formatCurrency(amount)}</div>
                            <div className={`text-sm ${variance < 0 ? 'text-green-400' : variance > 10 ? 'text-red-400' : 'text-yellow-400'}`}>
                              {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(100, (amount / planned) * 100)} 
                          className="h-2"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Gross Profit</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(profitabilityMetrics.grossProfit)}</p>
                  <p className="text-green-400 text-xs">{profitabilityMetrics.margins.gross.toFixed(1)}% margin</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Net Profit</p>
                  <p className={`text-2xl font-bold ${profitabilityMetrics.netProfit > 0 ? 'text-white' : 'text-red-400'}`}>
                    {formatCurrency(profitabilityMetrics.netProfit)}
                  </p>
                  <p className="text-blue-400 text-xs">{profitabilityMetrics.margins.net.toFixed(1)}% margin</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">EBITDA</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(profitabilityMetrics.ebitda)}</p>
                  <p className="text-yellow-400 text-xs">
                    {((profitabilityMetrics.ebitda / revenueMetrics.totalRevenue) * 100).toFixed(1)}% margin
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Operating Margin</p>
                  <p className="text-2xl font-bold text-white">{profitabilityMetrics.margins.operating.toFixed(1)}%</p>
                  <p className="text-purple-400 text-xs">Operating efficiency</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profitability Trends */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Profitability Margins
                </CardTitle>
                <CardDescription>Margin analysis and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gross Margin</span>
                      <span className={`font-medium ${getStatusColor(getHealthStatus('grossMargin', profitabilityMetrics.margins.gross))}`}>
                        {profitabilityMetrics.margins.gross.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={profitabilityMetrics.margins.gross} className="h-2" />
                    <div className="text-gray-500 text-xs">Target: &gt; 70%</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Net Margin</span>
                      <span className={`font-medium ${getStatusColor(getHealthStatus('netMargin', profitabilityMetrics.margins.net))}`}>
                        {profitabilityMetrics.margins.net.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={profitabilityMetrics.margins.net} className="h-2" />
                    <div className="text-gray-500 text-xs">Target: &gt; 25%</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Operating Margin</span>
                      <span className="text-white font-medium">{profitabilityMetrics.margins.operating.toFixed(1)}%</span>
                    </div>
                    <Progress value={profitabilityMetrics.margins.operating} className="h-2" />
                    <div className="text-gray-500 text-xs">Target: &gt; 30%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Ratios */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Return Ratios
                </CardTitle>
                <CardDescription>Investment efficiency and returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Return on Equity (ROE)</div>
                      <div className="text-gray-400 text-sm">Profit relative to shareholder equity</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{profitabilityMetrics.ratios.roe.toFixed(1)}%</div>
                      <div className="text-green-400 text-sm">Excellent</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Return on Investment (ROI)</div>
                      <div className="text-gray-400 text-sm">Overall investment efficiency</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{profitabilityMetrics.ratios.roi.toFixed(1)}%</div>
                      <div className="text-green-400 text-sm">Strong</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Return on Assets (ROA)</div>
                      <div className="text-gray-400 text-sm">Profit generated from assets</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{profitabilityMetrics.ratios.roa.toFixed(1)}%</div>
                      <div className="text-yellow-400 text-sm">Good</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Operating Cash Flow</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(cashFlowMetrics.operating)}</p>
                  <p className="text-green-400 text-xs">From operations</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Free Cash Flow</p>
                  <p className={`text-2xl font-bold ${cashFlowMetrics.free > 0 ? 'text-white' : 'text-red-400'}`}>
                    {formatCurrency(cashFlowMetrics.free)}
                  </p>
                  <p className="text-blue-400 text-xs">After investments</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Burn Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(getHealthStatus('burnRate', cashFlowMetrics.burnRate))}`}>
                    {formatCurrency(cashFlowMetrics.burnRate)}
                  </p>
                  <p className="text-yellow-400 text-xs">Monthly burn</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-red-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Cash Runway</p>
                  <p className={`text-2xl font-bold ${cashFlowMetrics.runway > 12 ? 'text-white' : cashFlowMetrics.runway > 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {cashFlowMetrics.runway}mo
                  </p>
                  <p className="text-red-400 text-xs">At current burn</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Breakdown */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Cash Flow Analysis
                </CardTitle>
                <CardDescription>Detailed cash flow by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Activity className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Operating Activities</div>
                        <div className="text-gray-400 text-sm">Cash from business operations</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${cashFlowMetrics.operating > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(cashFlowMetrics.operating)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Building className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Investing Activities</div>
                        <div className="text-gray-400 text-sm">Equipment, R&D, acquisitions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${cashFlowMetrics.investing > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(cashFlowMetrics.investing)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Financing Activities</div>
                        <div className="text-gray-400 text-sm">Loans, investments, dividends</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${cashFlowMetrics.financing > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(cashFlowMetrics.financing)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Projections */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Cash Flow Projections
                </CardTitle>
                <CardDescription>Forecasted cash positions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-48">
                  <AreaChart data={forecasts.cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="projected" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="Projected Cash Flow" />
                  </AreaChart>
                </ChartContainer>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-white font-medium">Key Insights</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• Free cash flow positive for {forecasts.cashFlow.filter(f => f.projected > 0).length} months</div>
                    <div>• Average confidence level: {Math.round(forecasts.cashFlow.reduce((sum, f) => sum + f.confidence, 0) / forecasts.cashFlow.length)}%</div>
                    <div>• Projected cash runway: {cashFlowMetrics.runway} months</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Financial Forecasts
              </CardTitle>
              <CardDescription>AI-powered financial projections and scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ComposedChart data={forecasts.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="optimistic" fill="#10B981" fillOpacity={0.2} stroke="#10B981" name="Optimistic" />
                  <Area type="monotone" dataKey="realistic" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="Realistic" />
                  <Area type="monotone" dataKey="conservative" fill="#EF4444" fillOpacity={0.2} stroke="#EF4444" name="Conservative" />
                </ComposedChart>
              </ChartContainer>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <span className="text-white font-medium">Conservative</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(forecasts.revenue[forecasts.revenue.length - 1]?.conservative || 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Worst-case scenario</div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <span className="text-white font-medium">Realistic</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(forecasts.revenue[forecasts.revenue.length - 1]?.realistic || 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Expected outcome</div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span className="text-white font-medium">Optimistic</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(forecasts.revenue[forecasts.revenue.length - 1]?.optimistic || 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Best-case scenario</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Forecast */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Expense Forecast</CardTitle>
                <CardDescription>Projected vs planned expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-48">
                  <AreaChart data={forecasts.expenses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="planned" fill="#F59E0B" fillOpacity={0.3} stroke="#F59E0B" name="Planned" />
                    <Area type="monotone" dataKey="projected" fill="#EF4444" fillOpacity={0.3} stroke="#EF4444" name="Projected" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Key Assumptions */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Forecast Assumptions</CardTitle>
                <CardDescription>Key drivers and assumptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-white font-medium">Revenue Growth</div>
                    <div className="text-gray-400 text-sm">12-15% monthly growth based on current trends</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-white font-medium">Churn Rate</div>
                    <div className="text-gray-400 text-sm">Maintaining 2-3% monthly churn rate</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-white font-medium">Customer Acquisition</div>
                    <div className="text-gray-400 text-sm">CAC remains stable, LTV continues to grow</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-white font-medium">Operating Expenses</div>
                    <div className="text-gray-400 text-sm">8-10% monthly increase due to scaling</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Export Financial Report</DialogTitle>
            <DialogDescription>
              Choose the format and data to include in your report
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Report Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Time Period</Label>
              <Select defaultValue="current">
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="current">Current Period</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Include Sections</Label>
              <div className="space-y-2">
                {[
                  { id: "overview", label: "Executive Overview" },
                  { id: "revenue", label: "Revenue Analysis" },
                  { id: "expenses", label: "Expense Breakdown" },
                  { id: "profitability", label: "Profitability Metrics" },
                  { id: "cashflow", label: "Cash Flow Statement" },
                  { id: "forecasts", label: "Financial Forecasts" }
                ].map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={section.id}
                      defaultChecked
                      className="text-blue-600"
                    />
                    <Label htmlFor={section.id} className="text-gray-300 text-sm">
                      {section.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReportDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setReportDialogOpen(false)
                toast.success("Financial report exported successfully!")
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
