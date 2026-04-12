"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  FlaskConical, 
  GitBranch, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Brain,
  Activity,
  Cpu,
  Database,
  Settings,
  Code,
  Layers,
  Network,
  Timer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Rocket,
  Shield,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCw,
  Upload,
  FileText,
  Share,
  Lock,
  Unlock,
  Star,
  Heart,
  Bookmark,
  Tag,
  Calendar,
  Globe,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Gauge,
  Thermometer,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  CloudRain,
  CloudSnow
} from "lucide-react"
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
  Brush,
  Legend
} from "recharts"

// 🚀 WORLD CLASS INTERFACES
interface QuantStrategy {
  id: string
  name: string
  type: 'momentum' | 'mean_reversion' | 'arbitrage' | 'market_making' | 'statistical_arbitrage' | 'pairs_trading' | 'volatility' | 'ml_driven' | 'factor_model' | 'regime_switching'
  status: 'draft' | 'testing' | 'live' | 'paused' | 'optimizing' | 'failed'
  performance: {
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    profitFactor: number
    calmarRatio: number
    sortinoRatio: number
    alpha: number
    beta: number
    informationRatio: number
  }
  automation: {
    enabled: boolean
    triggers: AutomationTrigger[]
    conditions: AutomationCondition[]
    actions: AutomationAction[]
  }
  riskManagement: {
    maxPositionSize: number
    stopLoss: number
    takeProfit: number
    maxDrawdownLimit: number
    correlationLimit: number
    sectorExposureLimit: number
  }
  parameters: Record<string, any>
  backtest: {
    startDate: string
    endDate: string
    initialCapital: number
    commission: number
    slippage: number
    results: BacktestResult[]
  }
  liveMetrics: {
    pnl: number
    positions: number
    orders: number
    fills: number
    rejections: number
    latency: number
    uptime: number
  }
  created: string
  modified: string
  author: string
  tags: string[]
  description: string
  version: string
  isPublic: boolean
  isFavorite: boolean
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface AutomationTrigger {
  id: string
  type: 'time' | 'price' | 'volume' | 'volatility' | 'news' | 'technical' | 'fundamental' | 'risk' | 'performance'
  condition: string
  value: number | string
  enabled: boolean
}

interface AutomationCondition {
  id: string
  type: 'and' | 'or' | 'not'
  rules: ConditionRule[]
}

interface ConditionRule {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith'
  value: any
}

interface AutomationAction {
  id: string
  type: 'start_strategy' | 'stop_strategy' | 'adjust_parameters' | 'send_alert' | 'rebalance' | 'hedge' | 'scale_position'
  parameters: Record<string, any>
  enabled: boolean
}

interface BacktestResult {
  date: string
  equity: number
  drawdown: number
  positions: number
  trades: number
  pnl: number
  volume: number
}

interface StrategyNode {
  id: string
  type: 'data' | 'indicator' | 'signal' | 'filter' | 'position' | 'risk' | 'execution'
  name: string
  parameters: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
  status: 'active' | 'inactive' | 'error' | 'warning'
}

// 🎯 WORLD CLASS STRATEGY TEMPLATES
const WORLD_CLASS_TEMPLATES: QuantStrategy[] = [
  {
    id: 'momentum_ml',
    name: 'ML-Enhanced Momentum',
    type: 'ml_driven',
    status: 'live',
    performance: {
      totalReturn: 34.7,
      sharpeRatio: 2.8,
      maxDrawdown: -8.2,
      winRate: 67.3,
      profitFactor: 2.4,
      calmarRatio: 4.2,
      sortinoRatio: 3.9,
      alpha: 0.18,
      beta: 0.85,
      informationRatio: 1.7
    },
    automation: {
      enabled: true,
      triggers: [
        { id: '1', type: 'volatility', condition: 'VIX > 25', value: 25, enabled: true },
        { id: '2', type: 'time', condition: 'Market Open', value: '09:30', enabled: true }
      ],
      conditions: [],
      actions: []
    },
    riskManagement: {
      maxPositionSize: 0.05,
      stopLoss: 0.02,
      takeProfit: 0.06,
      maxDrawdownLimit: 0.15,
      correlationLimit: 0.7,
      sectorExposureLimit: 0.3
    },
    parameters: {},
    backtest: {
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      commission: 0.001,
      slippage: 0.0005,
      results: []
    },
    liveMetrics: {
      pnl: 347000,
      positions: 23,
      orders: 1247,
      fills: 1198,
      rejections: 12,
      latency: 2.3,
      uptime: 99.7
    },
    created: '2024-01-15',
    modified: '2024-12-31',
    author: 'Quant Team',
    tags: ['momentum', 'ml', 'high-frequency'],
    description: 'Advanced momentum strategy enhanced with machine learning predictions',
    version: '2.1.0',
    isPublic: false,
    isFavorite: true,
    complexity: 'expert'
  },
  {
    id: 'pairs_stat_arb',
    name: 'Statistical Arbitrage Pairs',
    type: 'statistical_arbitrage',
    status: 'live',
    performance: {
      totalReturn: 28.4,
      sharpeRatio: 3.2,
      maxDrawdown: -5.1,
      winRate: 72.8,
      profitFactor: 2.8,
      calmarRatio: 5.6,
      sortinoRatio: 4.3,
      alpha: 0.22,
      beta: 0.12,
      informationRatio: 2.1
    },
    automation: {
      enabled: true,
      triggers: [],
      conditions: [],
      actions: []
    },
    riskManagement: {
      maxPositionSize: 0.03,
      stopLoss: 0.015,
      takeProfit: 0.045,
      maxDrawdownLimit: 0.1,
      correlationLimit: 0.8,
      sectorExposureLimit: 0.25
    },
    parameters: {},
    backtest: {
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      commission: 0.001,
      slippage: 0.0005,
      results: []
    },
    liveMetrics: {
      pnl: 284000,
      positions: 45,
      orders: 2341,
      fills: 2298,
      rejections: 8,
      latency: 1.8,
      uptime: 99.9
    },
    created: '2024-02-01',
    modified: '2024-12-30',
    author: 'Arbitrage Team',
    tags: ['pairs', 'statistical-arbitrage', 'market-neutral'],
    description: 'Market-neutral statistical arbitrage using cointegrated pairs',
    version: '1.8.2',
    isPublic: false,
    isFavorite: true,
    complexity: 'advanced'
  },
  {
    id: 'vol_surface_arb',
    name: 'Volatility Surface Arbitrage',
    type: 'volatility',
    status: 'testing',
    performance: {
      totalReturn: 42.1,
      sharpeRatio: 2.6,
      maxDrawdown: -12.3,
      winRate: 58.9,
      profitFactor: 2.1,
      calmarRatio: 3.4,
      sortinoRatio: 3.1,
      alpha: 0.31,
      beta: 0.23,
      informationRatio: 1.9
    },
    automation: {
      enabled: false,
      triggers: [],
      conditions: [],
      actions: []
    },
    riskManagement: {
      maxPositionSize: 0.08,
      stopLoss: 0.03,
      takeProfit: 0.08,
      maxDrawdownLimit: 0.2,
      correlationLimit: 0.6,
      sectorExposureLimit: 0.4
    },
    parameters: {},
    backtest: {
      startDate: '2023-06-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      commission: 0.002,
      slippage: 0.001,
      results: []
    },
    liveMetrics: {
      pnl: 0,
      positions: 0,
      orders: 0,
      fills: 0,
      rejections: 0,
      latency: 0,
      uptime: 0
    },
    created: '2024-06-15',
    modified: '2024-12-29',
    author: 'Vol Trading Team',
    tags: ['volatility', 'options', 'surface-arbitrage'],
    description: 'Exploits mispricings across the volatility surface using advanced Greeks',
    version: '0.9.1',
    isPublic: false,
    isFavorite: false,
    complexity: 'expert'
  }
]

// 🔥 WORLD CLASS STRATEGY LAB COMPONENT
export default function WorldClassStrategyLab() {
  const [strategies, setStrategies] = useState<QuantStrategy[]>(WORLD_CLASS_TEMPLATES)
  const [selectedStrategy, setSelectedStrategy] = useState<QuantStrategy | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('performance')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 🎯 FILTERED AND SORTED STRATEGIES
  const filteredStrategies = useMemo(() => {
    return strategies
      .filter(strategy => {
        const matchesSearch = strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            strategy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesType = filterType === 'all' || strategy.type === filterType
        const matchesStatus = filterStatus === 'all' || strategy.status === filterStatus
        return matchesSearch && matchesType && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'performance':
            return b.performance.totalReturn - a.performance.totalReturn
          case 'sharpe':
            return b.performance.sharpeRatio - a.performance.sharpeRatio
          case 'name':
            return a.name.localeCompare(b.name)
          case 'created':
            return new Date(b.created).getTime() - new Date(a.created).getTime()
          default:
            return 0
        }
      })
  }, [strategies, searchQuery, filterType, filterStatus, sortBy])

  // 🚀 OPTIMIZATION SIMULATION
  const runOptimization = useCallback(async () => {
    if (!selectedStrategy) return
    
    setIsOptimizing(true)
    setOptimizationProgress(0)
    
    // Simulate optimization process
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setOptimizationProgress(i)
    }
    
    // Update strategy performance with optimized results
    setStrategies(prev => prev.map(s => 
      s.id === selectedStrategy.id 
        ? {
            ...s,
            performance: {
              ...s.performance,
              totalReturn: s.performance.totalReturn * 1.15,
              sharpeRatio: s.performance.sharpeRatio * 1.08,
              maxDrawdown: s.performance.maxDrawdown * 0.92
            }
          }
        : s
    ))
    
    setIsOptimizing(false)
    alert('🚀 Strategy optimization complete! Performance improved by 15%')
  }, [selectedStrategy])

  // 🎨 STRATEGY STATUS COLORS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500'
      case 'testing': return 'bg-yellow-500'
      case 'paused': return 'bg-gray-500'
      case 'optimizing': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-orange-400'
      case 'expert': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* 🔥 WORLD CLASS HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-[#00bbff]" />
            <h1 className="text-3xl font-bold text-white">World Class Strategy Lab</h1>
            <Badge className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              INSTITUTIONAL GRADE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Simple' : 'Advanced'} Mode
          </Button>
          
          <Button
            onClick={() => {
              console.log('Create new strategy clicked')
              alert('🚀 Opening advanced strategy builder...')
            }}
            className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </Button>
        </div>
      </div>

      {/* 🎯 ADVANCED FILTERS & SEARCH */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a0a0b8]" />
                <Input
                  placeholder="Search strategies, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#15151f] border-[#2a2a3e] text-white"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Strategy Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="momentum">Momentum</SelectItem>
                <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                <SelectItem value="arbitrage">Arbitrage</SelectItem>
                <SelectItem value="statistical_arbitrage">Stat Arb</SelectItem>
                <SelectItem value="ml_driven">ML Driven</SelectItem>
                <SelectItem value="volatility">Volatility</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="sharpe">Sharpe Ratio</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-[#2a2a3e]"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-[#2a2a3e]"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 STRATEGY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStrategies.map((strategy) => (
          <Card 
            key={strategy.id} 
            className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
              selectedStrategy?.id === strategy.id ? 'ring-2 ring-[#00bbff]/50' : ''
            }`}
            onClick={() => setSelectedStrategy(strategy)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(strategy.status)}`} />
                  <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                  {strategy.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                </div>
                <Badge className={`${getComplexityColor(strategy.complexity)} bg-transparent border-current`}>
                  {strategy.complexity}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {strategy.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs border-[#2a2a3e] text-[#a0a0b8]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-[#a0a0b8] text-sm line-clamp-2">{strategy.description}</p>
              
              {/* 📊 PERFORMANCE METRICS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#15151f] rounded p-3">
                  <div className="text-xs text-[#a0a0b8] mb-1">Total Return</div>
                  <div className={`text-lg font-bold ${strategy.performance.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {strategy.performance.totalReturn > 0 ? '+' : ''}{strategy.performance.totalReturn.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-[#15151f] rounded p-3">
                  <div className="text-xs text-[#a0a0b8] mb-1">Sharpe Ratio</div>
                  <div className="text-lg font-bold text-[#00bbff]">
                    {strategy.performance.sharpeRatio.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-[#15151f] rounded p-3">
                  <div className="text-xs text-[#a0a0b8] mb-1">Max DD</div>
                  <div className="text-lg font-bold text-red-400">
                    {strategy.performance.maxDrawdown.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-[#15151f] rounded p-3">
                  <div className="text-xs text-[#a0a0b8] mb-1">Win Rate</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {strategy.performance.winRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* 🤖 AUTOMATION STATUS */}
              {strategy.automation.enabled && (
                <div className="flex items-center gap-2 p-2 bg-[#00bbff]/10 rounded border border-[#00bbff]/20">
                  <Zap className="h-4 w-4 text-[#00bbff]" />
                  <span className="text-[#00bbff] text-sm font-medium">Automation Active</span>
                  <Badge className="bg-[#00bbff]/20 text-[#00bbff] text-xs">
                    {strategy.automation.triggers.length} triggers
                  </Badge>
                </div>
              )}

              {/* 📈 LIVE METRICS (for live strategies) */}
              {strategy.status === 'live' && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-[#a0a0b8]">P&L</div>
                    <div className={`font-bold ${strategy.liveMetrics.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(strategy.liveMetrics.pnl / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#a0a0b8]">Positions</div>
                    <div className="text-white font-bold">{strategy.liveMetrics.positions}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#a0a0b8]">Uptime</div>
                    <div className="text-green-400 font-bold">{strategy.liveMetrics.uptime}%</div>
                  </div>
                </div>
              )}

              {/* 🎯 ACTION BUTTONS */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Edit strategy: ${strategy.name}`)
                    alert(`🔧 Opening strategy editor for ${strategy.name}`)
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Clone strategy: ${strategy.name}`)
                    alert(`📋 Cloning ${strategy.name}...`)
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Clone
                </Button>
                
                {strategy.status === 'live' ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Pause strategy: ${strategy.name}`)
                      alert(`⏸️ Pausing ${strategy.name}...`)
                    }}
                    size="sm"
                    className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Start strategy: ${strategy.name}`)
                      alert(`▶️ Starting ${strategy.name}...`)
                    }}
                    size="sm"
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🚀 SELECTED STRATEGY DETAILS */}
      {selectedStrategy && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-white text-xl">{selectedStrategy.name}</CardTitle>
                <Badge className={`${getStatusColor(selectedStrategy.status)} text-white`}>
                  {selectedStrategy.status.toUpperCase()}
                </Badge>
                {selectedStrategy.automation.enabled && (
                  <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                    <Zap className="h-3 w-3 mr-1" />
                    AUTO
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={runOptimization}
                  disabled={isOptimizing}
                  className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Optimize Strategy
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {isOptimizing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#a0a0b8]">Optimization Progress</span>
                  <span className="text-sm text-[#00bbff]">{optimizationProgress}%</span>
                </div>
                <Progress value={optimizationProgress} className="h-2" />
              </div>
            )}
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 bg-[#15151f]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
                <TabsTrigger value="backtest">Backtest</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Strategy Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-[#a0a0b8]">Description</label>
                        <p className="text-white mt-1">{selectedStrategy.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Type</label>
                          <p className="text-white mt-1 capitalize">{selectedStrategy.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Complexity</label>
                          <p className={`mt-1 capitalize font-medium ${getComplexityColor(selectedStrategy.complexity)}`}>
                            {selectedStrategy.complexity}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Version</label>
                          <p className="text-white mt-1">{selectedStrategy.version}</p>
                        </div>
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Author</label>
                          <p className="text-white mt-1">{selectedStrategy.author}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Total Return</div>
                        <div className={`text-2xl font-bold ${selectedStrategy.performance.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedStrategy.performance.totalReturn > 0 ? '+' : ''}{selectedStrategy.performance.totalReturn.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Sharpe Ratio</div>
                        <div className="text-2xl font-bold text-[#00bbff]">
                          {selectedStrategy.performance.sharpeRatio.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Max Drawdown</div>
                        <div className="text-2xl font-bold text-red-400">
                          {selectedStrategy.performance.maxDrawdown.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Win Rate</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {selectedStrategy.performance.winRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedStrategy.performance).map(([key, value]) => (
                    <div key={key} className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className={`text-lg font-bold ${
                        key.includes('Return') || key.includes('Ratio') || key === 'alpha' 
                          ? value > 0 ? 'text-green-400' : 'text-red-400'
                          : key.includes('Drawdown') 
                          ? 'text-red-400'
                          : key.includes('Rate')
                          ? 'text-yellow-400'
                          : 'text-[#00bbff]'
                      }`}>
                        {typeof value === 'number' ? 
                          (key.includes('Rate') || key.includes('Return') || key.includes('Drawdown') ? 
                            `${value > 0 && !key.includes('Drawdown') ? '+' : ''}${value.toFixed(1)}%` : 
                            value.toFixed(2)
                          ) : value
                        }
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Performance Chart Placeholder */}
                <div className="bg-[#15151f] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
                  <div className="h-64 flex items-center justify-center text-[#a0a0b8]">
                    📈 Advanced performance charts will be rendered here
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="automation" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Automation Settings</h3>
                  <Badge className={selectedStrategy.automation.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {selectedStrategy.automation.enabled ? "ENABLED" : "DISABLED"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-white">Triggers</h4>
                    {selectedStrategy.automation.triggers.map(trigger => (
                      <div key={trigger.id} className="bg-[#15151f] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-[#00bbff]/20 text-[#00bbff] capitalize">
                            {trigger.type}
                          </Badge>
                          <Badge className={trigger.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                            {trigger.enabled ? "ON" : "OFF"}
                          </Badge>
                        </div>
                        <p className="text-white text-sm">{trigger.condition}</p>
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => {
                        console.log('Add trigger clicked')
                        alert('🤖 Opening trigger builder...')
                      }}
                      variant="outline"
                      className="w-full border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trigger
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-white">Actions</h4>
                    <div className="bg-[#15151f] rounded-lg p-4 text-center text-[#a0a0b8]">
                      No automation actions configured
                    </div>
                    
                    <Button
                      onClick={() => {
                        console.log('Add action clicked')
                        alert('⚡ Opening action builder...')
                      }}
                      variant="outline"
                      className="w-full border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-white">Risk Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(selectedStrategy.riskManagement).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm text-[#a0a0b8] capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[typeof value === 'number' ? value * 100 : 0]}
                          max={key.includes('Limit') ? 100 : 50}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-white font-medium w-16 text-right">
                          {typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => {
                    console.log('Save risk settings clicked')
                    alert('💾 Risk management settings saved!')
                  }}
                  className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Risk Settings
                </Button>
              </TabsContent>

              <TabsContent value="backtest" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Backtest Configuration</h3>
                  <Button
                    onClick={() => {
                      console.log('Run backtest clicked')
                      alert('🔄 Starting comprehensive backtest...')
                    }}
                    className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Backtest
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-[#a0a0b8]">Start Date</label>
                      <Input
                        type="date"
                        value={selectedStrategy.backtest.startDate}
                        className="mt-1 bg-[#15151f] border-[#2a2a3e] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#a0a0b8]">End Date</label>
                      <Input
                        type="date"
                        value={selectedStrategy.backtest.endDate}
                        className="mt-1 bg-[#15151f] border-[#2a2a3e] text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-[#a0a0b8]">Initial Capital</label>
                      <Input
                        type="number"
                        value={selectedStrategy.backtest.initialCapital}
                        className="mt-1 bg-[#15151f] border-[#2a2a3e] text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#a0a0b8]">Commission</label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={selectedStrategy.backtest.commission}
                          className="mt-1 bg-[#15151f] border-[#2a2a3e] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-[#a0a0b8]">Slippage</label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={selectedStrategy.backtest.slippage}
                          className="mt-1 bg-[#15151f] border-[#2a2a3e] text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="live" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Live Trading Metrics</h3>
                  <Badge className={selectedStrategy.status === 'live' ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {selectedStrategy.status === 'live' ? "LIVE" : "NOT LIVE"}
                  </Badge>
                </div>
                
                {selectedStrategy.status === 'live' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedStrategy.liveMetrics).map(([key, value]) => (
                      <div key={key} className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className={`text-lg font-bold ${
                          key === 'pnl' 
                            ? value > 0 ? 'text-green-400' : 'text-red-400'
                            : key === 'uptime'
                            ? 'text-green-400'
                            : key === 'latency'
                            ? value < 5 ? 'text-green-400' : 'text-yellow-400'
                            : 'text-white'
                        }`}>
                          {key === 'pnl' ? `$${(value / 1000).toFixed(0)}K` :
                           key === 'uptime' ? `${value}%` :
                           key === 'latency' ? `${value}ms` :
                           value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#15151f] rounded-lg p-8 text-center">
                    <div className="text-[#a0a0b8] mb-4">Strategy is not currently live</div>
                    <Button
                      onClick={() => {
                        console.log('Go live clicked')
                        alert('🚀 Deploying strategy to live trading...')
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Deploy to Live
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
