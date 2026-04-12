"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { 
  TrendingUp,
  Target,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Zap,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Upload,
  Save,
  Share,
  Filter,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Building,
  Globe,
  Cpu,
  Database,
  Network,
  Server,
  Monitor,
  Gauge,
  Thermometer,
  Battery,
  Signal,
  Wifi,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Snowflake,
  Wind,
  CloudRain,
  Sun,
  Moon,
  Star,
  Heart,
  Bookmark,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Map,
  Home,
  Car,
  Plane,
  Ship,
  Train,
  Fuel,
  Droplets,
  Leaf,
  TreePine,
  Mountain,
  Waves,
  Rainbow,
  Sparkles,
  Rocket,
  Atom,
  Dna,
  Microscope,
  FlaskConical,
  Beaker,
  TestTube,
  Stethoscope,
  Pill,
  Syringe,
  Bandage,
  HeartHandshake,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Award,
  Medal,
  Trophy,
  Layers,
  Grid,
  List,
  Table,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey,
  ReferenceLine,
  Brush,
  Legend
} from "recharts"

// 🚀 WORLD CLASS INTERFACES
interface OptimizationAsset {
  id: string
  symbol: string
  name: string
  sector: string
  currentWeight: number
  optimizedWeight: number
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  beta: number
  correlation: number
  liquidity: number
  marketCap: number
  dividendYield: number
  peRatio: number
  constraints: {
    minWeight: number
    maxWeight: number
    sectorLimit: number
  }
}

interface OptimizationStrategy {
  id: string
  name: string
  type: 'mean_variance' | 'black_litterman' | 'risk_parity' | 'minimum_variance' | 'maximum_sharpe' | 'maximum_diversification' | 'hierarchical_risk_parity' | 'cvar_optimization'
  description: string
  objective: string
  constraints: string[]
  results: {
    expectedReturn: number
    volatility: number
    sharpeRatio: number
    maxDrawdown: number
    var95: number
    cvar95: number
    diversificationRatio: number
    turnover: number
    transactionCosts: number
  }
  weights: Array<{ asset: string; weight: number }>
  efficientFrontier: Array<{ risk: number; return: number; sharpe: number }>
  backtest: {
    totalReturn: number
    annualizedReturn: number
    volatility: number
    sharpeRatio: number
    maxDrawdown: number
    calmarRatio: number
    sortinoRatio: number
    winRate: number
    trades: number
  }
}

interface OptimizationConstraint {
  id: string
  type: 'weight' | 'sector' | 'risk' | 'turnover' | 'tracking_error' | 'concentration' | 'esg' | 'liquidity'
  name: string
  description: string
  enabled: boolean
  parameters: Record<string, number>
  impact: 'low' | 'medium' | 'high'
}

interface EfficientFrontierPoint {
  risk: number
  return: number
  sharpe: number
  weights: Record<string, number>
  label?: string
  isOptimal?: boolean
}

interface OptimizationScenario {
  id: string
  name: string
  description: string
  marketConditions: {
    regime: 'bull' | 'bear' | 'sideways' | 'volatile'
    expectedReturns: Record<string, number>
    correlationShift: number
    volatilityMultiplier: number
  }
  results: OptimizationStrategy[]
}

// 🎯 WORLD CLASS OPTIMIZATION DATA
const OPTIMIZATION_ASSETS: OptimizationAsset[] = [
  {
    id: 'spy',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    sector: 'Equity',
    currentWeight: 35.0,
    optimizedWeight: 28.5,
    expectedReturn: 10.2,
    volatility: 16.8,
    sharpeRatio: 0.61,
    beta: 1.00,
    correlation: 1.00,
    liquidity: 100,
    marketCap: 450000,
    dividendYield: 1.8,
    peRatio: 22.5,
    constraints: { minWeight: 0, maxWeight: 40, sectorLimit: 60 }
  },
  {
    id: 'qqq',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    sector: 'Technology',
    currentWeight: 25.0,
    optimizedWeight: 22.3,
    expectedReturn: 12.8,
    volatility: 22.4,
    sharpeRatio: 0.57,
    beta: 1.15,
    correlation: 0.85,
    liquidity: 95,
    marketCap: 180000,
    dividendYield: 0.6,
    peRatio: 28.7,
    constraints: { minWeight: 0, maxWeight: 30, sectorLimit: 40 }
  },
  {
    id: 'efa',
    symbol: 'EFA',
    name: 'iShares MSCI EAFE ETF',
    sector: 'International',
    currentWeight: 15.0,
    optimizedWeight: 18.7,
    expectedReturn: 8.5,
    volatility: 18.2,
    sharpeRatio: 0.47,
    beta: 0.82,
    correlation: 0.72,
    liquidity: 85,
    marketCap: 75000,
    dividendYield: 3.2,
    peRatio: 16.8,
    constraints: { minWeight: 0, maxWeight: 25, sectorLimit: 30 }
  },
  {
    id: 'eem',
    symbol: 'EEM',
    name: 'iShares MSCI Emerging Markets',
    sector: 'Emerging',
    currentWeight: 10.0,
    optimizedWeight: 8.9,
    expectedReturn: 9.8,
    volatility: 24.6,
    sharpeRatio: 0.40,
    beta: 1.05,
    correlation: 0.68,
    liquidity: 80,
    marketCap: 28000,
    dividendYield: 2.8,
    peRatio: 14.2,
    constraints: { minWeight: 0, maxWeight: 15, sectorLimit: 20 }
  },
  {
    id: 'agg',
    symbol: 'AGG',
    name: 'iShares Core US Aggregate Bond',
    sector: 'Fixed Income',
    currentWeight: 10.0,
    optimizedWeight: 15.2,
    expectedReturn: 4.2,
    volatility: 3.8,
    sharpeRatio: 1.11,
    beta: -0.12,
    correlation: -0.15,
    liquidity: 90,
    marketCap: 95000,
    dividendYield: 2.1,
    peRatio: 0,
    constraints: { minWeight: 5, maxWeight: 25, sectorLimit: 40 }
  },
  {
    id: 'gld',
    symbol: 'GLD',
    name: 'SPDR Gold Shares',
    sector: 'Commodities',
    currentWeight: 5.0,
    optimizedWeight: 6.4,
    expectedReturn: 5.8,
    volatility: 19.2,
    sharpeRatio: 0.30,
    beta: 0.05,
    correlation: -0.08,
    liquidity: 75,
    marketCap: 58000,
    dividendYield: 0.0,
    peRatio: 0,
    constraints: { minWeight: 0, maxWeight: 10, sectorLimit: 15 }
  }
]

const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    id: 'mean_variance',
    name: 'Mean-Variance Optimization',
    type: 'mean_variance',
    description: 'Classic Markowitz optimization maximizing return for given risk level',
    objective: 'Maximize Sharpe Ratio',
    constraints: ['Weight limits', 'Sector limits', 'Turnover constraint'],
    results: {
      expectedReturn: 9.2,
      volatility: 12.8,
      sharpeRatio: 0.72,
      maxDrawdown: -18.4,
      var95: -2.1,
      cvar95: -3.2,
      diversificationRatio: 0.68,
      turnover: 15.7,
      transactionCosts: 0.08
    },
    weights: [
      { asset: 'SPY', weight: 28.5 },
      { asset: 'QQQ', weight: 22.3 },
      { asset: 'EFA', weight: 18.7 },
      { asset: 'EEM', weight: 8.9 },
      { asset: 'AGG', weight: 15.2 },
      { asset: 'GLD', weight: 6.4 }
    ],
    efficientFrontier: [
      { risk: 8.2, return: 6.8, sharpe: 0.83 },
      { risk: 10.5, return: 7.9, sharpe: 0.75 },
      { risk: 12.8, return: 9.2, sharpe: 0.72 },
      { risk: 15.1, return: 10.4, sharpe: 0.69 },
      { risk: 17.8, return: 11.8, sharpe: 0.66 }
    ],
    backtest: {
      totalReturn: 127.8,
      annualizedReturn: 9.2,
      volatility: 12.8,
      sharpeRatio: 0.72,
      maxDrawdown: -18.4,
      calmarRatio: 0.50,
      sortinoRatio: 1.08,
      winRate: 64.2,
      trades: 47
    }
  },
  {
    id: 'black_litterman',
    name: 'Black-Litterman Model',
    type: 'black_litterman',
    description: 'Bayesian approach combining market equilibrium with investor views',
    objective: 'Incorporate Market Views',
    constraints: ['Market equilibrium', 'Investor confidence', 'View uncertainty'],
    results: {
      expectedReturn: 8.9,
      volatility: 11.2,
      sharpeRatio: 0.79,
      maxDrawdown: -15.8,
      var95: -1.8,
      cvar95: -2.7,
      diversificationRatio: 0.74,
      turnover: 12.3,
      transactionCosts: 0.06
    },
    weights: [
      { asset: 'SPY', weight: 32.1 },
      { asset: 'QQQ', weight: 19.8 },
      { asset: 'EFA', weight: 21.4 },
      { asset: 'EEM', weight: 7.2 },
      { asset: 'AGG', weight: 14.8 },
      { asset: 'GLD', weight: 4.7 }
    ],
    efficientFrontier: [
      { risk: 7.8, return: 6.5, sharpe: 0.83 },
      { risk: 9.2, return: 7.4, sharpe: 0.80 },
      { risk: 11.2, return: 8.9, sharpe: 0.79 },
      { risk: 13.5, return: 10.2, sharpe: 0.76 },
      { risk: 16.1, return: 11.7, sharpe: 0.73 }
    ],
    backtest: {
      totalReturn: 118.4,
      annualizedReturn: 8.9,
      volatility: 11.2,
      sharpeRatio: 0.79,
      maxDrawdown: -15.8,
      calmarRatio: 0.56,
      sortinoRatio: 1.18,
      winRate: 67.8,
      trades: 32
    }
  },
  {
    id: 'risk_parity',
    name: 'Risk Parity',
    type: 'risk_parity',
    description: 'Equal risk contribution from each asset to total portfolio risk',
    objective: 'Equal Risk Contribution',
    constraints: ['Risk budgeting', 'Leverage constraints', 'Minimum weights'],
    results: {
      expectedReturn: 8.1,
      volatility: 9.8,
      sharpeRatio: 0.83,
      maxDrawdown: -12.6,
      var95: -1.6,
      cvar95: -2.3,
      diversificationRatio: 0.82,
      turnover: 8.9,
      transactionCosts: 0.04
    },
    weights: [
      { asset: 'SPY', weight: 18.7 },
      { asset: 'QQQ', weight: 14.2 },
      { asset: 'EFA', weight: 19.8 },
      { asset: 'EEM', weight: 12.4 },
      { asset: 'AGG', weight: 28.3 },
      { asset: 'GLD', weight: 6.6 }
    ],
    efficientFrontier: [
      { risk: 6.8, return: 5.9, sharpe: 0.87 },
      { risk: 8.2, return: 6.8, sharpe: 0.83 },
      { risk: 9.8, return: 8.1, sharpe: 0.83 },
      { risk: 11.7, return: 9.2, sharpe: 0.79 },
      { risk: 14.1, return: 10.5, sharpe: 0.74 }
    ],
    backtest: {
      totalReturn: 104.7,
      annualizedReturn: 8.1,
      volatility: 9.8,
      sharpeRatio: 0.83,
      maxDrawdown: -12.6,
      calmarRatio: 0.64,
      sortinoRatio: 1.24,
      winRate: 71.3,
      trades: 28
    }
  },
  {
    id: 'hierarchical_risk_parity',
    name: 'Hierarchical Risk Parity',
    type: 'hierarchical_risk_parity',
    description: 'Machine learning approach using hierarchical clustering for diversification',
    objective: 'Maximum Diversification',
    constraints: ['Hierarchical structure', 'Cluster stability', 'Risk budgeting'],
    results: {
      expectedReturn: 8.7,
      volatility: 10.4,
      sharpeRatio: 0.84,
      maxDrawdown: -14.2,
      var95: -1.7,
      cvar95: -2.5,
      diversificationRatio: 0.89,
      turnover: 11.2,
      transactionCosts: 0.05
    },
    weights: [
      { asset: 'SPY', weight: 24.3 },
      { asset: 'QQQ', weight: 16.8 },
      { asset: 'EFA', weight: 22.1 },
      { asset: 'EEM', weight: 9.7 },
      { asset: 'AGG', weight: 21.4 },
      { asset: 'GLD', weight: 5.7 }
    ],
    efficientFrontier: [
      { risk: 7.2, return: 6.2, sharpe: 0.86 },
      { risk: 8.8, return: 7.4, sharpe: 0.84 },
      { risk: 10.4, return: 8.7, sharpe: 0.84 },
      { risk: 12.3, return: 9.9, sharpe: 0.80 },
      { risk: 14.6, return: 11.3, sharpe: 0.77 }
    ],
    backtest: {
      totalReturn: 112.8,
      annualizedReturn: 8.7,
      volatility: 10.4,
      sharpeRatio: 0.84,
      maxDrawdown: -14.2,
      calmarRatio: 0.61,
      sortinoRatio: 1.21,
      winRate: 69.4,
      trades: 35
    }
  }
]

const OPTIMIZATION_CONSTRAINTS: OptimizationConstraint[] = [
  {
    id: 'weight_limits',
    type: 'weight',
    name: 'Asset Weight Limits',
    description: 'Minimum and maximum weight constraints for individual assets',
    enabled: true,
    parameters: { minWeight: 0.0, maxWeight: 0.4 },
    impact: 'high'
  },
  {
    id: 'sector_limits',
    type: 'sector',
    name: 'Sector Concentration',
    description: 'Maximum allocation to any single sector',
    enabled: true,
    parameters: { maxSectorWeight: 0.6 },
    impact: 'medium'
  },
  {
    id: 'turnover_limit',
    type: 'turnover',
    name: 'Turnover Constraint',
    description: 'Maximum portfolio turnover to control transaction costs',
    enabled: true,
    parameters: { maxTurnover: 0.2 },
    impact: 'medium'
  },
  {
    id: 'tracking_error',
    type: 'tracking_error',
    name: 'Tracking Error Limit',
    description: 'Maximum tracking error relative to benchmark',
    enabled: false,
    parameters: { maxTrackingError: 0.05 },
    impact: 'low'
  },
  {
    id: 'liquidity_constraint',
    type: 'liquidity',
    name: 'Liquidity Requirements',
    description: 'Minimum liquidity score for portfolio holdings',
    enabled: true,
    parameters: { minLiquidity: 70 },
    impact: 'medium'
  }
]

// 🔥 WORLD CLASS 3D OPTIMIZATION COMPONENT
export default function WorldClass3DOptimization() {
  const [assets, setAssets] = useState<OptimizationAsset[]>(OPTIMIZATION_ASSETS)
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>(OPTIMIZATION_STRATEGIES)
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy>(OPTIMIZATION_STRATEGIES[0])
  const [constraints, setConstraints] = useState<OptimizationConstraint[]>(OPTIMIZATION_CONSTRAINTS)
  const [activeTab, setActiveTab] = useState('overview')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [riskTolerance, setRiskTolerance] = useState([12.8])
  const [expectedReturn, setExpectedReturn] = useState([9.2])
  const [rebalanceFrequency, setRebalanceFrequency] = useState('monthly')

  // 🚀 OPTIMIZATION SIMULATION
  const runOptimization = useCallback(async (strategyType: string) => {
    setIsOptimizing(true)
    setOptimizationProgress(0)
    
    // Simulate optimization progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setOptimizationProgress(i)
    }
    
    // Update strategy results with slight randomization
    setStrategies(prev => prev.map(strategy => 
      strategy.type === strategyType 
        ? {
            ...strategy,
            results: {
              ...strategy.results,
              expectedReturn: strategy.results.expectedReturn * (0.98 + Math.random() * 0.04),
              sharpeRatio: strategy.results.sharpeRatio * (0.95 + Math.random() * 0.1)
            }
          }
        : strategy
    ))
    
    setIsOptimizing(false)
    alert('🚀 Portfolio optimization completed! Results updated.')
  }, [])

  // 🎨 UTILITY FUNCTIONS
  const getStrategyColor = (type: string) => {
    switch (type) {
      case 'mean_variance': return '#00bbff'
      case 'black_litterman': return '#4a4aff'
      case 'risk_parity': return '#00ff88'
      case 'hierarchical_risk_parity': return '#ff6b6b'
      default: return '#a0a0b8'
    }
  }

  const getPerformanceColor = (value: number, threshold: number) => {
    return value >= threshold ? 'text-green-400' : value >= threshold * 0.8 ? 'text-yellow-400' : 'text-red-400'
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* 🔥 WORLD CLASS HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-[#00bbff]" />
            <h1 className="text-3xl font-bold text-white">3D Portfolio Optimization</h1>
            <Badge className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              INSTITUTIONAL GRADE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              console.log('Export optimization results clicked')
              alert('📊 Exporting optimization results...')
            }}
            variant="outline"
            className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          
          <Button
            onClick={() => runOptimization(selectedStrategy.type)}
            className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
            disabled={isOptimizing}
          >
            <Play className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>
        </div>
      </div>

      {/* 📊 REAL-TIME DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Expected Return</p>
                <p className="text-2xl font-bold text-white">
                  {selectedStrategy.results.expectedReturn.toFixed(1)}%
                </p>
                <p className="text-xs text-green-400">↑ 0.3% vs benchmark</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Portfolio Risk</p>
                <p className="text-2xl font-bold text-white">
                  {selectedStrategy.results.volatility.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-400">↓ 1.2% vs current</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-white">
                  {selectedStrategy.results.sharpeRatio.toFixed(2)}
                </p>
                <p className="text-xs text-purple-400">Top quartile</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Diversification</p>
                <p className="text-2xl font-bold text-white">
                  {(selectedStrategy.results.diversificationRatio * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-yellow-400">Excellent</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🚀 OPTIMIZATION PROGRESS */}
      {isOptimizing && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Cpu className="h-5 w-5 text-[#00bbff] animate-pulse" />
              <span className="text-white font-medium">Running {selectedStrategy.name}...</span>
            </div>
            <Progress value={optimizationProgress} className="mb-2" />
            <div className="text-sm text-[#a0a0b8]">{optimizationProgress}% complete</div>
          </CardContent>
        </Card>
      )}

      {/* 🎯 MAIN CONTENT TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-[#15151f]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="efficient-frontier">Efficient Frontier</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="backtesting">Backtesting</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Current vs Optimized Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Current Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={assets.map(asset => ({
                          name: asset.symbol,
                          value: asset.currentWeight,
                          fill: getStrategyColor(asset.sector.toLowerCase())
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value?.toFixed(1) || 0}%`}
                      >
                        {assets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStrategyColor(entry.sector.toLowerCase())} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a25', 
                          border: '1px solid #2a2a3e',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`${value?.toFixed(1) || 0}%`, 'Weight']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Optimized Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={selectedStrategy.weights.map(weight => {
                          const asset = assets.find(a => a.symbol === weight.asset)
                          return {
                            name: weight.asset,
                            value: weight.weight,
                            fill: getStrategyColor(asset?.sector.toLowerCase() || 'default')
                          }
                        })}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value?.toFixed(1) || 0}%`}
                      >
                        {selectedStrategy.weights.map((entry, index) => {
                          const asset = assets.find(a => a.symbol === entry.asset)
                          return (
                            <Cell key={`cell-${index}`} fill={getStrategyColor(asset?.sector.toLowerCase() || 'default')} />
                          )
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a25', 
                          border: '1px solid #2a2a3e',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`${value?.toFixed(1) || 0}%`, 'Weight']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Comparison Table */}
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Asset Allocation Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3e]">
                      <th className="text-left text-[#a0a0b8] p-2">Asset</th>
                      <th className="text-left text-[#a0a0b8] p-2">Current</th>
                      <th className="text-left text-[#a0a0b8] p-2">Optimized</th>
                      <th className="text-left text-[#a0a0b8] p-2">Change</th>
                      <th className="text-left text-[#a0a0b8] p-2">Expected Return</th>
                      <th className="text-left text-[#a0a0b8] p-2">Risk</th>
                      <th className="text-left text-[#a0a0b8] p-2">Sharpe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(asset => {
                      const optimizedWeight = selectedStrategy.weights.find(w => w.asset === asset.symbol)?.weight || 0
                      const change = optimizedWeight - asset.currentWeight
                      return (
                        <tr key={asset.id} className="border-b border-[#2a2a3e]/50">
                          <td className="p-2">
                            <div>
                              <div className="text-white font-medium">{asset.symbol}</div>
                              <div className="text-xs text-[#a0a0b8]">{asset.name}</div>
                            </div>
                          </td>
                          <td className="p-2 text-white">{asset.currentWeight.toFixed(1)}%</td>
                          <td className="p-2 text-white">{optimizedWeight.toFixed(1)}%</td>
                          <td className="p-2">
                            <span className={`${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-2 text-white">{asset.expectedReturn.toFixed(1)}%</td>
                          <td className="p-2 text-white">{asset.volatility.toFixed(1)}%</td>
                          <td className="p-2">
                            <span className={getPerformanceColor(asset.sharpeRatio, 0.5)}>
                              {asset.sharpeRatio.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6 mt-6">
          {/* Strategy Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map(strategy => (
              <Card 
                key={strategy.id} 
                className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
                  selectedStrategy.id === strategy.id ? 'ring-2 ring-[#00bbff]/50' : ''
                }`}
                onClick={() => setSelectedStrategy(strategy)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{strategy.name}</CardTitle>
                    <Badge style={{ backgroundColor: getStrategyColor(strategy.type) + '20', color: getStrategyColor(strategy.type) }}>
                      {strategy.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-[#a0a0b8] text-sm">{strategy.description}</p>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Expected Return</div>
                      <div className="text-lg font-bold text-green-400">
                        {strategy.results.expectedReturn.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Volatility</div>
                      <div className="text-lg font-bold text-blue-400">
                        {strategy.results.volatility.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Sharpe Ratio</div>
                      <div className="text-lg font-bold text-purple-400">
                        {strategy.results.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Max Drawdown</div>
                      <div className="text-lg font-bold text-red-400">
                        {strategy.results.maxDrawdown.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        runOptimization(strategy.type)
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                      disabled={isOptimizing}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Optimize
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log(`View details: ${strategy.name}`)
                        alert(`📊 Opening detailed view for ${strategy.name}`)
                      }}
                      size="sm"
                      className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="efficient-frontier" className="space-y-6 mt-6">
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Efficient Frontier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis 
                      dataKey="risk" 
                      stroke="#a0a0b8"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Risk (%)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#a0a0b8' } }}
                    />
                    <YAxis 
                      dataKey="return" 
                      stroke="#a0a0b8"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#a0a0b8' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a25', 
                        border: '1px solid #2a2a3e',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any, name: string) => [
                        `${value.toFixed(2)}${name === 'return' ? '%' : name === 'risk' ? '%' : ''}`, 
                        name === 'return' ? 'Return' : name === 'risk' ? 'Risk' : 'Sharpe Ratio'
                      ]}
                    />
                    {strategies.map(strategy => (
                      <Scatter
                        key={strategy.id}
                        name={strategy.name}
                        data={strategy.efficientFrontier}
                        fill={getStrategyColor(strategy.type)}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constraints" className="space-y-6 mt-6">
          {/* Optimization Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {constraints.map(constraint => (
              <Card key={constraint.id} className="bg-[#1a1a25] border-[#2a2a3e]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{constraint.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        constraint.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        constraint.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {constraint.impact.toUpperCase()}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${constraint.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-[#a0a0b8] text-sm">{constraint.description}</p>
                  
                  {/* Constraint Parameters */}
                  <div className="space-y-2">
                    {Object.entries(constraint.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-[#a0a0b8] text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-white font-medium">
                          {typeof value === 'number' ? (value < 1 ? (value * 100).toFixed(1) + '%' : value?.toFixed(1) || 0) : value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Toggle Button */}
                  <Button
                    onClick={() => {
                      console.log(`Toggle constraint: ${constraint.name}`)
                      setConstraints(prev => prev.map(c => 
                        c.id === constraint.id ? { ...c, enabled: !c.enabled } : c
                      ))
                    }}
                    size="sm"
                    variant="outline"
                    className={`w-full border-[#2a2a3e] ${
                      constraint.enabled ? 'text-red-400 hover:bg-red-500/20' : 'text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {constraint.enabled ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backtesting" className="space-y-6 mt-6">
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Strategy Backtesting Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Total Return</div>
                  <div className="text-2xl font-bold text-green-400">
                    {selectedStrategy.backtest.totalReturn.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Annualized Return</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedStrategy.backtest.annualizedReturn.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {selectedStrategy.backtest.sharpeRatio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Max Drawdown</div>
                  <div className="text-2xl font-bold text-red-400">
                    {selectedStrategy.backtest.maxDrawdown.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Calmar Ratio</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {selectedStrategy.backtest.calmarRatio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Sortino Ratio</div>
                  <div className="text-2xl font-bold text-[#00bbff]">
                    {selectedStrategy.backtest.sortinoRatio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Win Rate</div>
                  <div className="text-2xl font-bold text-green-400">
                    {selectedStrategy.backtest.winRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#15151f] rounded p-4">
                  <div className="text-sm text-[#a0a0b8] mb-2">Total Trades</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedStrategy.backtest.trades}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  console.log('Run detailed backtest clicked')
                  alert('🔄 Running detailed backtest analysis...')
                }}
                className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Detailed Backtest
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6 mt-6">
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-[#a0a0b8] py-8">
                <Globe className="h-12 w-12 mx-auto mb-4" />
                <p>Scenario analysis coming soon...</p>
                <p className="text-sm mt-2">This will show optimization results under different market conditions.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
