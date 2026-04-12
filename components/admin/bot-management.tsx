"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Cpu, GitBranch, Crosshair, Zap, Atom, 
  Settings, Users, BarChart3, DollarSign, Shield, 
  Play, Pause, StopCircle, Edit3, Trash2, Eye,
  Activity, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Clock, Target, Brain, Database,
  RefreshCw, Download, Upload, Save, Plus,
  Filter, Search, Calendar, Globe, Lock,
  Unlock, Crown, Star, Award, Flame,
  LineChart, PieChart, Gauge, Router,
  Code, FileCode, GitCommit, Package,
  Server, Wifi, Signal, Zap as ZapIcon,
  MonitorSpeaker, HeadphonesIcon, Volume2,
  Layers, Network, HardDrive, Cpu as CpuIcon,
  MemoryStick, Smartphone, Tablet, Monitor
} from "lucide-react"
import { toast } from "sonner"

// ===== INTERFACES =====

interface TradingBot {
  id: string
  name: string
  title: string
  description: string
  algorithm: string
  version: string
  status: 'active' | 'inactive' | 'maintenance' | 'beta'
  category: string
  riskLevel: 'low' | 'medium' | 'high'
  
  // Performance Metrics
  accuracy: number
  winRate: number
  trades: number
  avgReturn: number
  sharpeRatio: number
  maxDrawdown: number
  
  // Configuration
  parameters: {
    [key: string]: {
      value: number | string | boolean
      type: 'number' | 'string' | 'boolean' | 'select'
      min?: number
      max?: number
      options?: string[]
      description: string
    }
  }
  
  // User & Business Metrics
  activeUsers: number
  totalDeployments: number
  revenue: number
  subscriptionTier: 'free' | 'premium' | 'enterprise'
  
  // Technical
  cpuUsage: number
  memoryUsage: number
  apiCalls: number
  latency: number
  uptime: number
  
  // Timestamps
  createdAt: string
  lastUpdated: string
  lastDeployment: string
}

interface BotAnalytics {
  realTimeMetrics: {
    activeExecutions: number
    avgExecutionTime: number
    successRate: number
    errorRate: number
    cpuLoad: number
    memoryUsage: number
  }
  performanceHistory: Array<{
    date: string
    pnl: number
    trades: number
    winRate: number
    sharpe: number
  }>
  userEngagement: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    churnRate: number
    avgSessionTime: number
  }
  revenueMetrics: {
    totalRevenue: number
    monthlyRecurring: number
    avgRevenuePerUser: number
    conversionRate: number
  }
}

interface UserSubscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  botId: string
  botName: string
  plan: 'free' | 'premium' | 'enterprise'
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  startDate: string
  endDate?: string
  revenue: number
  usage: {
    trades: number
    apiCalls: number
    lastActive: string
  }
}

// ===== MOCK DATA =====

const MOCK_BOTS: TradingBot[] = [
  {
    id: 'quantum',
    name: 'Q',
    title: 'Quantum Momentum Engine',
    description: 'AI-powered momentum detection with quantum algorithms',
    algorithm: 'Quantum Neural Networks',
    version: 'v3.2.1',
    status: 'active',
    category: 'Momentum',
    riskLevel: 'medium',
    accuracy: 87,
    winRate: 73,
    trades: 2847,
    avgReturn: 2.4,
    sharpeRatio: 1.85,
    maxDrawdown: 8.2,
    parameters: {
      'momentum_threshold': {
        value: 0.015,
        type: 'number',
        min: 0.005,
        max: 0.05,
        description: 'Minimum momentum threshold for signal generation'
      },
      'risk_multiplier': {
        value: 1.5,
        type: 'number',
        min: 0.5,
        max: 3.0,
        description: 'Risk multiplier for position sizing'
      },
      'timeframe_primary': {
        value: '1h',
        type: 'select',
        options: ['1m', '5m', '15m', '1h', '4h', '1d'],
        description: 'Primary analysis timeframe'
      },
      'enable_ml_adaptation': {
        value: true,
        type: 'boolean',
        description: 'Enable machine learning parameter adaptation'
      }
    },
    activeUsers: 1247,
    totalDeployments: 2583,
    revenue: 87540,
    subscriptionTier: 'premium',
    cpuUsage: 34,
    memoryUsage: 42,
    apiCalls: 15420,
    latency: 8,
    uptime: 99.7,
    createdAt: '2023-08-15T10:30:00Z',
    lastUpdated: '2024-12-01T14:20:00Z',
    lastDeployment: '2024-12-15T09:15:00Z'
  },
  {
    id: 'reversal',
    name: 'R',
    title: 'Reversal Recognition Matrix',
    description: 'Advanced pattern recognition for market reversals',
    algorithm: 'Deep Learning Pattern Recognition',
    version: 'v2.8.3',
    status: 'active',
    category: 'Reversal',
    riskLevel: 'medium',
    accuracy: 82,
    winRate: 69,
    trades: 1923,
    avgReturn: 3.1,
    sharpeRatio: 1.62,
    maxDrawdown: 12.5,
    parameters: {
      'divergence_sensitivity': {
        value: 0.8,
        type: 'number',
        min: 0.1,
        max: 1.0,
        description: 'Sensitivity for divergence detection'
      },
      'confirmation_period': {
        value: 3,
        type: 'number',
        min: 1,
        max: 10,
        description: 'Confirmation period in bars'
      },
      'reversal_strength': {
        value: 'medium',
        type: 'select',
        options: ['low', 'medium', 'high'],
        description: 'Required reversal signal strength'
      }
    },
    activeUsers: 934,
    totalDeployments: 1876,
    revenue: 62340,
    subscriptionTier: 'premium',
    cpuUsage: 28,
    memoryUsage: 35,
    apiCalls: 12650,
    latency: 12,
    uptime: 99.4,
    createdAt: '2023-09-20T15:45:00Z',
    lastUpdated: '2024-11-28T11:30:00Z',
    lastDeployment: '2024-12-14T16:22:00Z'
  },
  {
    id: 'execution',
    name: 'X',
    title: 'Execution Precision Protocol',
    description: 'Institutional-grade execution with minimal slippage',
    algorithm: 'Advanced Order Flow Analysis',
    version: 'v4.1.0',
    status: 'active',
    category: 'Execution',
    riskLevel: 'low',
    accuracy: 91,
    winRate: 76,
    trades: 3456,
    avgReturn: 1.8,
    sharpeRatio: 2.14,
    maxDrawdown: 5.7,
    parameters: {
      'slippage_tolerance': {
        value: 0.002,
        type: 'number',
        min: 0.001,
        max: 0.01,
        description: 'Maximum acceptable slippage percentage'
      },
      'execution_delay': {
        value: 5,
        type: 'number',
        min: 1,
        max: 30,
        description: 'Maximum execution delay in milliseconds'
      },
      'liquidity_threshold': {
        value: 10000,
        type: 'number',
        min: 1000,
        max: 100000,
        description: 'Minimum liquidity required for execution'
      }
    },
    activeUsers: 1589,
    totalDeployments: 3247,
    revenue: 124680,
    subscriptionTier: 'enterprise',
    cpuUsage: 45,
    memoryUsage: 52,
    apiCalls: 28450,
    latency: 4,
    uptime: 99.9,
    createdAt: '2023-07-10T12:00:00Z',
    lastUpdated: '2024-12-05T09:45:00Z',
    lastDeployment: '2024-12-15T11:33:00Z'
  },
  {
    id: 'oracle',
    name: 'O',
    title: 'Oracle Volatility Scanner',
    description: 'Predictive volatility analysis and breakout detection',
    algorithm: 'Volatility Prediction Models',
    version: 'v3.0.7',
    status: 'maintenance',
    category: 'Volatility',
    riskLevel: 'high',
    accuracy: 84,
    winRate: 71,
    trades: 2134,
    avgReturn: 2.9,
    sharpeRatio: 1.73,
    maxDrawdown: 11.3,
    parameters: {
      'volatility_threshold': {
        value: 0.25,
        type: 'number',
        min: 0.1,
        max: 0.5,
        description: 'Minimum volatility threshold for signals'
      },
      'prediction_horizon': {
        value: 24,
        type: 'number',
        min: 1,
        max: 168,
        description: 'Volatility prediction horizon in hours'
      },
      'news_sensitivity': {
        value: true,
        type: 'boolean',
        description: 'Enable news event sensitivity'
      }
    },
    activeUsers: 876,
    totalDeployments: 1654,
    revenue: 75230,
    subscriptionTier: 'premium',
    cpuUsage: 67,
    memoryUsage: 71,
    apiCalls: 18750,
    latency: 15,
    uptime: 97.8,
    createdAt: '2023-10-05T08:20:00Z',
    lastUpdated: '2024-11-30T13:10:00Z',
    lastDeployment: '2024-12-10T14:45:00Z'
  },
  {
    id: 'zenith',
    name: 'Z',
    title: 'Zenith Mean Reversion',
    description: 'Statistical mean reversion with advanced modeling',
    algorithm: 'Statistical Mean Reversion Models',
    version: 'v2.5.2',
    status: 'active',
    category: 'Mean Reversion',
    riskLevel: 'medium',
    accuracy: 79,
    winRate: 68,
    trades: 1876,
    avgReturn: 2.2,
    sharpeRatio: 1.54,
    maxDrawdown: 9.8,
    parameters: {
      'reversion_period': {
        value: 20,
        type: 'number',
        min: 5,
        max: 100,
        description: 'Mean reversion lookback period'
      },
      'z_score_threshold': {
        value: 2.0,
        type: 'number',
        min: 1.0,
        max: 4.0,
        description: 'Z-score threshold for signal generation'
      },
      'band_width': {
        value: 2.0,
        type: 'number',
        min: 1.0,
        max: 3.0,
        description: 'Bollinger band width multiplier'
      }
    },
    activeUsers: 743,
    totalDeployments: 1432,
    revenue: 54780,
    subscriptionTier: 'premium',
    cpuUsage: 22,
    memoryUsage: 28,
    apiCalls: 9870,
    latency: 10,
    uptime: 99.2,
    createdAt: '2023-11-12T16:40:00Z',
    lastUpdated: '2024-11-25T10:55:00Z',
    lastDeployment: '2024-12-13T08:20:00Z'
  }
]

const MOCK_ANALYTICS: BotAnalytics = {
  realTimeMetrics: {
    activeExecutions: 247,
    avgExecutionTime: 12.5,
    successRate: 78.3,
    errorRate: 1.2,
    cpuLoad: 34,
    memoryUsage: 42
  },
  performanceHistory: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pnl: Math.random() * 1000 - 200,
    trades: Math.floor(Math.random() * 50) + 20,
    winRate: Math.random() * 20 + 65,
    sharpe: Math.random() * 1 + 1
  })),
  userEngagement: {
    totalUsers: 5389,
    activeUsers: 3247,
    newUsers: 156,
    churnRate: 5.2,
    avgSessionTime: 45.3
  },
  revenueMetrics: {
    totalRevenue: 404570,
    monthlyRecurring: 45230,
    avgRevenuePerUser: 124.50,
    conversionRate: 12.4
  }
}

const MOCK_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: '1',
    userId: 'user_001',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
    botId: 'quantum',
    botName: 'Quantum Momentum Engine',
    plan: 'premium',
    status: 'active',
    startDate: '2024-01-15T00:00:00Z',
    revenue: 299,
    usage: {
      trades: 247,
      apiCalls: 1540,
      lastActive: '2024-12-15T14:30:00Z'
    }
  },
  {
    id: '2',
    userId: 'user_002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@example.com',
    botId: 'execution',
    botName: 'Execution Precision Protocol',
    plan: 'enterprise',
    status: 'active',
    startDate: '2024-02-01T00:00:00Z',
    revenue: 599,
    usage: {
      trades: 892,
      apiCalls: 4520,
      lastActive: '2024-12-15T16:45:00Z'
    }
  }
]

export default function BotManagement() {
  // ===== STATE MANAGEMENT =====
  const [bots, setBots] = useState<TradingBot[]>(MOCK_BOTS)
  const [analytics, setAnalytics] = useState<BotAnalytics>(MOCK_ANALYTICS)
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(MOCK_SUBSCRIPTIONS)
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)

  // ===== COMPUTED VALUES =====
  const filteredBots = useMemo(() => {
    let filtered = bots

    if (searchQuery) {
      filtered = filtered.filter(bot => 
        bot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bot => bot.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(bot => bot.category === categoryFilter)
    }

    return filtered
  }, [bots, searchQuery, statusFilter, categoryFilter])

  const overviewStats = useMemo(() => {
    const activeBots = bots.filter(bot => bot.status === 'active').length
    const totalUsers = bots.reduce((sum, bot) => sum + bot.activeUsers, 0)
    const totalRevenue = bots.reduce((sum, bot) => sum + bot.revenue, 0)
    const avgPerformance = bots.reduce((sum, bot) => sum + bot.avgReturn, 0) / bots.length

    return {
      activeBots,
      totalBots: bots.length,
      totalUsers,
      totalRevenue,
      avgPerformance: avgPerformance.toFixed(1)
    }
  }, [bots])

  // ===== EVENT HANDLERS =====
  
  const handleBotStatusChange = async (botId: string, newStatus: TradingBot['status']) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, status: newStatus, lastUpdated: new Date().toISOString() }
        : bot
    ))
    toast.success(`Bot status updated to ${newStatus}`)
  }

  const handleParameterUpdate = async (botId: string, parameter: string, value: any) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { 
            ...bot, 
            parameters: {
              ...bot.parameters,
              [parameter]: { ...bot.parameters[parameter], value }
            },
            lastUpdated: new Date().toISOString()
          }
        : bot
    ))
    toast.success('Parameter updated successfully')
  }

  const handleBotUpdate = async (botId: string, updates: Partial<TradingBot>) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, ...updates, lastUpdated: new Date().toISOString() }
        : bot
    ))
    toast.success('Bot configuration saved')
  }

  const handleVersionUpdate = async (botId: string, newVersion: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, version: newVersion, lastUpdated: new Date().toISOString() }
        : bot
    ))
    toast.success(`Bot updated to version ${newVersion}`)
  }

  const getBotIcon = (name: string) => {
    const icons: { [key: string]: any } = {
      'Q': Cpu,
      'R': GitBranch, 
      'X': Crosshair,
      'O': Zap,
      'Z': Atom
    }
    return icons[name] || CpuIcon
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-green-100'
      case 'inactive': return 'bg-gray-600 text-gray-100'
      case 'maintenance': return 'bg-yellow-600 text-yellow-100'
      case 'beta': return 'bg-blue-600 text-blue-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-950 min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Brain className="w-10 h-10 mr-4 text-blue-400" />
            Trading Bot Management
          </h1>
          <p className="text-gray-400 text-lg">
            Enterprise-grade bot administration with real-time analytics and comprehensive controls
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Deploy New Bot
          </Button>
        </div>
      </div>

      {/* ===== KEY METRICS BANNER ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Active Bots</p>
                  <p className="text-2xl font-bold text-white">{overviewStats.activeBots}</p>
                  <p className="text-blue-400 text-xs">of {overviewStats.totalBots} total</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-white">{overviewStats.totalUsers.toLocaleString()}</p>
                  <p className="text-green-400 text-xs">+12.4% this month</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${(overviewStats.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-purple-400 text-xs">Monthly recurring</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">Avg Performance</p>
                  <p className="text-2xl font-bold text-white">{overviewStats.avgPerformance}%</p>
                  <p className="text-orange-400 text-xs">Monthly return</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-300 text-sm font-medium">System Health</p>
                  <p className="text-2xl font-bold text-white">99.2%</p>
                  <p className="text-pink-400 text-xs">Uptime</p>
                </div>
                <Shield className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border-indigo-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-sm font-medium">API Calls</p>
                  <p className="text-2xl font-bold text-white">87K</p>
                  <p className="text-indigo-400 text-xs">Today</p>
                </div>
                <Signal className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== MAIN DASHBOARD TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            📊 Overview
          </TabsTrigger>
          <TabsTrigger value="bots" className="data-[state=active]:bg-blue-600">
            🤖 Bot Management
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
            👥 User Subscriptions
          </TabsTrigger>
          <TabsTrigger value="configuration" className="data-[state=active]:bg-blue-600">
            ⚙️ Configuration
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Real-time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Executions</span>
                    <Badge className="bg-green-600">{analytics.realTimeMetrics.activeExecutions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-green-400 font-bold">{analytics.realTimeMetrics.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Execution Time</span>
                    <span className="text-white">{analytics.realTimeMetrics.avgExecutionTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Error Rate</span>
                    <span className={`font-bold ${analytics.realTimeMetrics.errorRate <= 2 ? 'text-green-400' : 'text-red-400'}`}>
                      {analytics.realTimeMetrics.errorRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Server className="w-5 h-5 mr-2 text-blue-400" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">CPU Load</span>
                      <span className="text-white">{analytics.realTimeMetrics.cpuLoad}%</span>
                    </div>
                    <Progress value={analytics.realTimeMetrics.cpuLoad} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Memory Usage</span>
                      <span className="text-white">{analytics.realTimeMetrics.memoryUsage}%</span>
                    </div>
                    <Progress value={analytics.realTimeMetrics.memoryUsage} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">API Calls/Min</span>
                    <Badge className="bg-blue-600">1,247</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-purple-400" />
                  Revenue Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Revenue</span>
                    <span className="text-purple-400 font-bold">${(analytics.revenueMetrics.totalRevenue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monthly Recurring</span>
                    <span className="text-green-400 font-bold">${(analytics.revenueMetrics.monthlyRecurring / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ARPU</span>
                    <span className="text-white">${analytics.revenueMetrics.avgRevenuePerUser}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-green-400 font-bold">{analytics.revenueMetrics.conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bot Status Overview */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-green-400" />
                Bot Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {bots.map((bot) => {
                  const IconComponent = getBotIcon(bot.name)
                  return (
                    <Card key={bot.id} className="bg-gray-800 border-gray-700 hover:border-blue-600 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-white font-semibold">{bot.name} Bot</div>
                              <div className="text-xs text-gray-400">{bot.version}</div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(bot.status)}>
                            {bot.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Users:</span>
                            <span className="text-white">{bot.activeUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="text-green-400">${(bot.revenue / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Performance:</span>
                            <span className="text-blue-400">{bot.avgReturn}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Uptime:</span>
                            <span className={`font-bold ${bot.uptime >= 99 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {bot.uptime}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedBot(bot)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Configure
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== BOT MANAGEMENT TAB ===== */}
        <TabsContent value="bots" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search bots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Momentum">Momentum</SelectItem>
                      <SelectItem value="Reversal">Reversal</SelectItem>
                      <SelectItem value="Execution">Execution</SelectItem>
                      <SelectItem value="Volatility">Volatility</SelectItem>
                      <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBots.map((bot) => {
              const IconComponent = getBotIcon(bot.name)
              return (
                <motion.div
                  key={bot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">{bot.name} Bot</div>
                            <div className="text-gray-400 text-sm">{bot.title}</div>
                            <Badge className={getStatusColor(bot.status)} size="sm">
                              {bot.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBot(bot)
                              setIsConfigDialogOpen(true)
                            }}
                            className="border-gray-700"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline" 
                            className="border-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs mb-1">Accuracy</div>
                          <div className="text-green-400 font-bold text-lg">{bot.accuracy}%</div>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs mb-1">Win Rate</div>
                          <div className="text-blue-400 font-bold text-lg">{bot.winRate}%</div>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs mb-1">Avg Return</div>
                          <div className="text-purple-400 font-bold text-lg">{bot.avgReturn}%</div>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs mb-1">Sharpe Ratio</div>
                          <div className="text-orange-400 font-bold text-lg">{bot.sharpeRatio}</div>
                        </div>
                      </div>

                      {/* User & Revenue */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Active Users:</span>
                          <Badge className="bg-green-600">{bot.activeUsers.toLocaleString()}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Deployments:</span>
                          <Badge className="bg-blue-600">{bot.totalDeployments.toLocaleString()}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Monthly Revenue:</span>
                          <Badge className="bg-purple-600">${(bot.revenue / 1000).toFixed(0)}K</Badge>
                        </div>
                      </div>

                      {/* System Health */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">CPU Usage</span>
                            <span className="text-white">{bot.cpuUsage}%</span>
                          </div>
                          <Progress value={bot.cpuUsage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Memory</span>
                            <span className="text-white">{bot.memoryUsage}%</span>
                          </div>
                          <Progress value={bot.memoryUsage} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Uptime:</span>
                          <span className={`font-bold ${bot.uptime >= 99 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {bot.uptime}%
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <Separator className="bg-gray-700" />
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleBotStatusChange(bot.id, bot.status === 'active' ? 'inactive' : 'active')}
                          className={bot.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
                        >
                          {bot.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBot(bot)
                            setIsVersionDialogOpen(true)
                          }}
                          className="border-gray-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>



        {/* ===== CONFIGURATION TAB ===== */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Configuration */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-scaling</Label>
                    <p className="text-gray-400 text-sm">Automatically scale bot resources</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Load Balancing</Label>
                    <p className="text-gray-400 text-sm">Distribute bot workloads</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Health Monitoring</Label>
                    <p className="text-gray-400 text-sm">Monitor bot system health</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Failover Mode</Label>
                    <p className="text-gray-400 text-sm">Auto-switch to backup providers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">API Rate Limiting</Label>
                    <p className="text-gray-400 text-sm">Limit API requests per bot</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Encrypted Communication</Label>
                    <p className="text-gray-400 text-sm">Encrypt bot communications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Access Logging</Label>
                    <p className="text-gray-400 text-sm">Log bot access and operations</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Security Alerts</Label>
                    <p className="text-gray-400 text-sm">Notify of security events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== USER SUBSCRIPTIONS TAB ===== */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  User Bot Subscriptions ({subscriptions.length})
                </CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="text-white font-semibold">{subscription.userName}</div>
                          <div className="text-gray-400 text-sm">{subscription.userEmail}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-semibold">{subscription.botName}</div>
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.plan}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-green-400 font-bold">${subscription.revenue}</div>
                          <div className="text-gray-400 text-sm">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold">{subscription.usage.trades}</div>
                          <div className="text-gray-400 text-sm">Trades</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-700">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Start Date:</span>
                        <div className="text-white">{new Date(subscription.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">API Calls:</span>
                        <div className="text-white">{subscription.usage.apiCalls.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Active:</span>
                        <div className="text-white">{new Date(subscription.usage.lastActive).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global Bot Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                  Global Bot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Auto-Update Algorithms</Label>
                      <p className="text-gray-400 text-sm">Automatically update bot algorithms</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Beta Features</Label>
                      <p className="text-gray-400 text-sm">Allow users to access beta bot features</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Real-time Monitoring</Label>
                      <p className="text-gray-400 text-sm">Enable real-time bot performance monitoring</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label className="text-white">Max Concurrent Executions</Label>
                    <Slider defaultValue={[1000]} max={5000} min={100} step={100} className="mt-2" />
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>100</span>
                      <span>Current: 1,000</span>
                      <span>5,000</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">System Resource Limit (%)</Label>
                    <Slider defaultValue={[80]} max={100} min={20} step={5} className="mt-2" />
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>20%</span>
                      <span>Current: 80%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API & Integration Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Network className="w-5 h-5 mr-2 text-purple-400" />
                  API & Integration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Primary Data Provider</Label>
                  <Select defaultValue="alpaca">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="alpaca">Alpaca Markets</SelectItem>
                      <SelectItem value="interactive">Interactive Brokers</SelectItem>
                      <SelectItem value="td">TD Ameritrade</SelectItem>
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="polygon">Polygon.io</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Backup Data Provider</Label>
                  <Select defaultValue="polygon">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="polygon">Polygon.io</SelectItem>
                      <SelectItem value="alpha">Alpha Vantage</SelectItem>
                      <SelectItem value="yahoo">Yahoo Finance</SelectItem>
                      <SelectItem value="iex">IEX Cloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">API Rate Limit (calls/minute)</Label>
                  <Input 
                    type="number" 
                    defaultValue="1000" 
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-white">Webhook URL for Alerts</Label>
                  <Input 
                    placeholder="https://your-webhook-url.com/alerts" 
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Real-time Data</Label>
                    <p className="text-gray-400 text-sm">Use real-time market data feeds</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Failover Mode</Label>
                    <p className="text-gray-400 text-sm">Auto-switch to backup providers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== DEPLOYMENT TAB ===== */}
        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Controls */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-green-400" />
                  Bot Deployment Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bots.map((bot) => {
                  const IconComponent = getBotIcon(bot.name)
                  return (
                    <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{bot.title}</div>
                          <div className="text-gray-400 text-sm">Version {bot.version}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-white text-sm">{bot.activeUsers} active users</div>
                          <Badge className={getStatusColor(bot.status)}>
                            {bot.status}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleBotStatusChange(bot.id, bot.status === 'active' ? 'inactive' : 'active')}
                            className={bot.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                          >
                            {bot.status === 'active' ? (
                              <>
                                <StopCircle className="w-4 h-4 mr-1" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Deploy
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-700"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Server className="w-5 h-5 mr-2 text-orange-400" />
                  System Resource Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Total CPU Usage</span>
                    <span className="text-white">{analytics.realTimeMetrics.cpuLoad}%</span>
                  </div>
                  <Progress value={analytics.realTimeMetrics.cpuLoad} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-white">{analytics.realTimeMetrics.memoryUsage}%</span>
                  </div>
                  <Progress value={analytics.realTimeMetrics.memoryUsage} className="h-3" />
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Individual Bot Resource Usage</Label>
                  {bots.map((bot) => (
                    <div key={bot.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{bot.name} Bot</span>
                        <span className="text-white">CPU: {bot.cpuUsage}% | RAM: {bot.memoryUsage}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Progress value={bot.cpuUsage} className="h-1" />
                        <Progress value={bot.memoryUsage} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800/30 p-4 rounded-lg space-y-2">
                  <div className="text-white font-semibold">Resource Alerts</div>
                  <div className="text-sm text-yellow-400">⚠️ Oracle Bot using high CPU (67%)</div>
                  <div className="text-sm text-green-400">✅ All other bots within normal parameters</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== BOT CONFIGURATION DIALOG ===== */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-400" />
              Configure {selectedBot?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Adjust bot parameters and algorithm settings for optimal performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedBot && (
            <div className="space-y-6">
              {/* Bot Info */}
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    {React.createElement(getBotIcon(selectedBot.name), { className: "w-6 h-6 text-blue-400" })}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{selectedBot.title}</div>
                    <div className="text-gray-400">{selectedBot.algorithm} | Version {selectedBot.version}</div>
                  </div>
                  <Badge className={getStatusColor(selectedBot.status)}>
                    {selectedBot.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Active Users:</span>
                    <div className="text-white font-bold">{selectedBot.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Revenue:</span>
                    <div className="text-green-400 font-bold">${(selectedBot.revenue / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Performance:</span>
                    <div className="text-blue-400 font-bold">{selectedBot.avgReturn}%</div>
                  </div>
                </div>
              </div>

              {/* Parameter Configuration */}
              <div className="space-y-4">
                <Label className="text-white text-lg">Algorithm Parameters</Label>
                {Object.entries(selectedBot.parameters).map(([key, param]) => (
                  <div key={key} className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Label className="text-white capitalize">{key.replace(/_/g, ' ')}</Label>
                        <p className="text-gray-400 text-sm">{param.description}</p>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {param.type}
                      </Badge>
                    </div>
                    
                    {param.type === 'number' && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={param.value as number}
                          min={param.min}
                          max={param.max}
                          step="0.001"
                          onChange={(e) => handleParameterUpdate(selectedBot.id, key, parseFloat(e.target.value))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        {param.min !== undefined && param.max !== undefined && (
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Min: {param.min}</span>
                            <span>Max: {param.max}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {param.type === 'select' && param.options && (
                      <Select
                        value={param.value as string}
                        onValueChange={(value) => handleParameterUpdate(selectedBot.id, key, value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {param.options.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {param.type === 'boolean' && (
                      <Switch
                        checked={param.value as boolean}
                        onCheckedChange={(checked) => handleParameterUpdate(selectedBot.id, key, checked)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast.success('Configuration saved successfully')
                    setIsConfigDialogOpen(false)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== VERSION UPDATE DIALOG ===== */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-400" />
              Update {selectedBot?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Deploy a new version of the trading algorithm
            </DialogDescription>
          </DialogHeader>
          
          {selectedBot && (
            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="text-white font-semibold mb-2">Current Version: {selectedBot.version}</div>
                <div className="text-gray-400 text-sm">Last updated: {new Date(selectedBot.lastUpdated).toLocaleString()}</div>
              </div>

              <div>
                <Label className="text-white">New Version</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                    <SelectValue placeholder="Select version to deploy" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="v3.2.2">v3.2.2 (Latest)</SelectItem>
                    <SelectItem value="v3.2.1">v3.2.1 (Current)</SelectItem>
                    <SelectItem value="v3.2.0">v3.2.0 (Stable)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Update Notes</Label>
                <Textarea 
                  placeholder="Describe the changes and improvements..."
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-200 text-sm">This will restart the bot for all active users</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleVersionUpdate(selectedBot.id, 'v3.2.2')
                    setIsVersionDialogOpen(false)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Deploy Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
