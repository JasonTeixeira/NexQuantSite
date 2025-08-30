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
  Activity, TrendingUp, TrendingDown, Users, DollarSign,
  Settings, Play, Pause, Square, RotateCcw, 
  Plus, Search, Filter, Download, Upload, 
  Bell, Shield, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, XCircle, Clock,
  BarChart3, LineChart, PieChart, Target,
  Brain, Sparkles, Rocket, Star, Crown,
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
  accuracy: number
  winRate: number
  trades: number
  avgReturn: number
  sharpeRatio: number
  maxDrawdown: number
  parameters: Record<string, {
    value: any
    type: 'string' | 'number' | 'boolean' | 'select'
    min?: number
    max?: number
    options?: string[]
    description: string
  }>
  activeUsers: number
  totalDeployments: number
  revenue: number
  subscriptionTier: string
  cpuUsage: number
  memoryUsage: number
  apiCalls: number
  latency: number
  uptime: number
  createdAt: string
  lastUpdated: string
  lastDeployment: string
}

// ===== MOCK DATA =====

const MOCK_BOTS: TradingBot[] = [
  {
    id: 'quantum',
    name: 'Q',
    title: 'Quantum Momentum Pro',
    description: 'Advanced momentum trading with quantum-inspired algorithms',
    algorithm: 'Quantum-Enhanced Momentum Strategy',
    version: 'v3.2.1',
    status: 'active',
    category: 'Momentum',
    riskLevel: 'medium',
    accuracy: 87,
    winRate: 73,
    trades: 2341,
    avgReturn: 3.2,
    sharpeRatio: 1.84,
    maxDrawdown: 8.5,
    parameters: {
      'momentum_period': {
        value: 14,
        type: 'number',
        min: 5,
        max: 50,
        description: 'Momentum calculation period'
      },
      'risk_threshold': {
        value: 0.02,
        type: 'number',
        min: 0.01,
        max: 0.1,
        description: 'Maximum risk per trade'
      },
      'market_cap_filter': {
        value: 'large',
        type: 'select',
        options: ['small', 'medium', 'large', 'mega'],
        description: 'Market capitalization filter'
      }
    },
    activeUsers: 1247,
    totalDeployments: 3456,
    revenue: 127500,
    subscriptionTier: 'premium',
    cpuUsage: 34,
    memoryUsage: 42,
    apiCalls: 15670,
    latency: 12,
    uptime: 99.7,
    createdAt: '2023-08-15T10:30:00Z',
    lastUpdated: '2024-12-01T14:22:00Z',
    lastDeployment: '2024-12-15T09:45:00Z'
  }
]

export default function BotManagement() {
  // ===== STATE MANAGEMENT =====
  const [bots, setBots] = useState<TradingBot[]>(MOCK_BOTS)
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

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
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Deploy New Bot
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* ===== OVERVIEW METRICS ===== */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Bots</p>
                <p className="text-3xl font-bold text-white">{overviewStats.activeBots}</p>
                <p className="text-green-400 text-sm">↑ +12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{overviewStats.totalUsers.toLocaleString()}</p>
                <p className="text-blue-400 text-sm">↑ +8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${(overviewStats.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-green-400 text-sm">↑ +15% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Performance</p>
                <p className="text-3xl font-bold text-white">{overviewStats.avgPerformance}%</p>
                <p className="text-green-400 text-sm">↑ +3.2% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== MAIN DASHBOARD TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            📊 Bot Overview
          </TabsTrigger>
          <TabsTrigger value="management" className="data-[state=active]:bg-blue-600">
            🤖 Bot Management
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBots.map((bot) => {
              const IconComponent = getBotIcon(bot.name)
              
              return (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{bot.title}</h3>
                            <p className="text-gray-400 text-sm">{bot.algorithm}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(bot.status)}>
                          {bot.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-300 text-sm">{bot.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-green-400">{bot.accuracy}%</div>
                            <div className="text-gray-400 text-xs">Accuracy</div>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400">{bot.winRate}%</div>
                            <div className="text-gray-400 text-xs">Win Rate</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div>
                            <div className="text-white font-medium">{bot.activeUsers} users</div>
                            <div className="text-gray-400 text-xs">Active subscribers</div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => setSelectedBot(bot)}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== MANAGEMENT TAB ===== */}
        <TabsContent value="management" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Bot Management Console</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Bot Management</h3>
                <p className="text-gray-400 mb-6">
                  Detailed bot configuration, performance monitoring, and user management tools
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Access Full Management Suite
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
