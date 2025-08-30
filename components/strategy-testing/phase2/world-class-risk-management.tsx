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
  AlertTriangle, 
  Shield, 
  Activity, 
  Target,
  TrendingDown,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Zap,
  Eye,
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
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
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
  ShieldCheck,
  ShieldAlert,
  ShieldX,
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
  Plus,
  Minus,
  X,
  Edit,
  Copy,
  Trash2,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
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
interface AdvancedRiskMetric {
  id: string
  name: string
  category: 'market' | 'credit' | 'operational' | 'liquidity' | 'model' | 'concentration' | 'counterparty' | 'regulatory'
  current: number
  limit: number
  warning: number
  critical: number
  status: 'safe' | 'warning' | 'critical' | 'breach'
  unit: string
  description: string
  methodology: string
  confidence: number
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  historicalData: Array<{ date: string; value: number }>
  attribution: Array<{ factor: string; contribution: number }>
}

interface InstitutionalVaRModel {
  id: string
  name: string
  methodology: 'historical' | 'parametric' | 'monte_carlo' | 'extreme_value' | 'copula' | 'filtered_historical'
  confidenceLevel: number
  holdingPeriod: number
  lookbackPeriod: number
  var: number
  expectedShortfall: number
  conditionalVaR: number
  maximumLoss: number
  backtestingResults: {
    violations: number
    expectedViolations: number
    kupiecTest: { statistic: number; pValue: number; result: 'pass' | 'fail' }
    christoffersenTest: { statistic: number; pValue: number; result: 'pass' | 'fail' }
  }
  componentVaR: Array<{ asset: string; contribution: number; marginalVaR: number }>
  stressVaR: number
  incrementalVaR: number
}

interface StressTestScenario {
  id: string
  name: string
  category: 'market_crash' | 'credit_crisis' | 'liquidity_crisis' | 'operational' | 'regulatory' | 'geopolitical' | 'pandemic' | 'cyber_attack' | 'climate' | 'custom'
  description: string
  severity: 'mild' | 'moderate' | 'severe' | 'extreme'
  probability: number
  timeHorizon: number
  shocks: Array<{
    factor: string
    type: 'absolute' | 'relative'
    value: number
    correlation?: number
  }>
  results: {
    portfolioImpact: number
    varImpact: number
    liquidityImpact: number
    capitalImpact: number
    recoveryTime: number
    worstCaseScenario: number
  }
  mitigationStrategies: Array<{
    strategy: string
    effectiveness: number
    cost: number
    timeToImplement: number
  }>
}

interface RiskAlert {
  id: string
  type: 'limit_breach' | 'model_failure' | 'data_quality' | 'concentration' | 'correlation' | 'volatility_spike' | 'liquidity_shortage' | 'operational'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  metric: string
  currentValue: number
  threshold: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  acknowledged: boolean
  assignedTo?: string
  actions: Array<{
    action: string
    status: 'pending' | 'in_progress' | 'completed'
    assignee?: string
    dueDate?: string
  }>
  escalationLevel: number
  relatedAlerts: string[]
}

interface RiskControl {
  id: string
  name: string
  category: 'preventive' | 'detective' | 'corrective'
  type: 'automated' | 'manual' | 'hybrid'
  enabled: boolean
  effectiveness: number
  description: string
  implementation: string
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly'
  owner: string
  lastTested: string
  testResults: 'pass' | 'fail' | 'partial'
  exceptions: number
  cost: number
  riskReduction: number
}

interface PortfolioRiskAttribution {
  totalRisk: number
  diversificationBenefit: number
  concentrationRisk: number
  assetContributions: Array<{
    asset: string
    weight: number
    riskContribution: number
    marginalRisk: number
    componentRisk: number
    diversificationRatio: number
  }>
  factorContributions: Array<{
    factor: string
    exposure: number
    riskContribution: number
    correlation: number
  }>
  sectorContributions: Array<{
    sector: string
    weight: number
    riskContribution: number
    concentration: number
  }>
  geographicContributions: Array<{
    region: string
    weight: number
    riskContribution: number
    correlation: number
  }>
}

interface LiquidityRiskMetrics {
  liquidityAtRisk: number
  fundingLiquidity: number
  marketLiquidity: number
  liquidityBuffer: number
  liquidityCoverage: number
  netStableFunding: number
  cashFlowGap: Array<{
    period: string
    inflows: number
    outflows: number
    netFlow: number
    cumulativeGap: number
  }>
  liquidityStress: Array<{
    scenario: string
    survivalPeriod: number
    liquidityShortfall: number
    requiredBuffer: number
  }>
}

interface ModelRiskMetrics {
  modelInventory: Array<{
    modelId: string
    name: string
    type: string
    criticality: 'high' | 'medium' | 'low'
    lastValidated: string
    performance: number
    stability: number
    issues: number
  }>
  validationResults: Array<{
    modelId: string
    validationType: string
    result: 'pass' | 'fail' | 'conditional'
    issues: string[]
    recommendations: string[]
  }>
  modelPerformance: Array<{
    modelId: string
    accuracy: number
    stability: number
    robustness: number
    interpretability: number
  }>
}

// 🎯 WORLD CLASS RISK MODELS DATA
const ADVANCED_RISK_METRICS: AdvancedRiskMetric[] = [
  {
    id: 'portfolio_var_95',
    name: 'Portfolio VaR (95%)',
    category: 'market',
    current: 2.8,
    limit: 5.0,
    warning: 4.0,
    critical: 4.5,
    status: 'safe',
    unit: '%',
    description: 'Maximum expected loss over 1 day with 95% confidence',
    methodology: 'Monte Carlo simulation with 10,000 scenarios',
    confidence: 95,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'down',
    trendValue: -0.2,
    historicalData: [
      { date: '2024-12-24', value: 3.2 },
      { date: '2024-12-25', value: 3.0 },
      { date: '2024-12-26', value: 2.9 },
      { date: '2024-12-27', value: 2.8 },
      { date: '2024-12-28', value: 2.7 },
      { date: '2024-12-29', value: 2.8 },
      { date: '2024-12-30', value: 2.8 }
    ],
    attribution: [
      { factor: 'Equity Risk', contribution: 65.2 },
      { factor: 'Interest Rate Risk', contribution: 18.7 },
      { factor: 'FX Risk', contribution: 12.3 },
      { factor: 'Credit Risk', contribution: 3.8 }
    ]
  },
  {
    id: 'expected_shortfall',
    name: 'Expected Shortfall (CVaR)',
    category: 'market',
    current: 4.2,
    limit: 7.5,
    warning: 6.0,
    critical: 7.0,
    status: 'safe',
    unit: '%',
    description: 'Expected loss given that VaR threshold is exceeded',
    methodology: 'Conditional expectation beyond VaR threshold',
    confidence: 95,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'stable',
    trendValue: 0.0,
    historicalData: [
      { date: '2024-12-24', value: 4.5 },
      { date: '2024-12-25', value: 4.3 },
      { date: '2024-12-26', value: 4.2 },
      { date: '2024-12-27', value: 4.1 },
      { date: '2024-12-28', value: 4.0 },
      { date: '2024-12-29', value: 4.2 },
      { date: '2024-12-30', value: 4.2 }
    ],
    attribution: [
      { factor: 'Tail Risk', contribution: 78.5 },
      { factor: 'Fat Tails', contribution: 21.5 }
    ]
  },
  {
    id: 'maximum_drawdown',
    name: 'Maximum Drawdown',
    category: 'market',
    current: 8.7,
    limit: 15.0,
    warning: 12.0,
    critical: 14.0,
    status: 'safe',
    unit: '%',
    description: 'Largest peak-to-trough decline in portfolio value',
    methodology: 'Rolling maximum drawdown calculation',
    confidence: 100,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'up',
    trendValue: 0.3,
    historicalData: [
      { date: '2024-12-24', value: 8.2 },
      { date: '2024-12-25', value: 8.4 },
      { date: '2024-12-26', value: 8.5 },
      { date: '2024-12-27', value: 8.6 },
      { date: '2024-12-28', value: 8.7 },
      { date: '2024-12-29', value: 8.7 },
      { date: '2024-12-30', value: 8.7 }
    ],
    attribution: [
      { factor: 'Market Volatility', contribution: 45.2 },
      { factor: 'Concentration Risk', contribution: 32.1 },
      { factor: 'Correlation Risk', contribution: 22.7 }
    ]
  },
  {
    id: 'liquidity_at_risk',
    name: 'Liquidity at Risk',
    category: 'liquidity',
    current: 12.5,
    limit: 25.0,
    warning: 20.0,
    critical: 23.0,
    status: 'safe',
    unit: '%',
    description: 'Percentage of portfolio that cannot be liquidated within 1 day',
    methodology: 'Liquidity-adjusted VaR with market impact costs',
    confidence: 95,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'down',
    trendValue: -1.2,
    historicalData: [
      { date: '2024-12-24', value: 14.1 },
      { date: '2024-12-25', value: 13.8 },
      { date: '2024-12-26', value: 13.2 },
      { date: '2024-12-27', value: 12.9 },
      { date: '2024-12-28', value: 12.7 },
      { date: '2024-12-29', value: 12.6 },
      { date: '2024-12-30', value: 12.5 }
    ],
    attribution: [
      { factor: 'Small Cap Exposure', contribution: 42.3 },
      { factor: 'Emerging Markets', contribution: 28.7 },
      { factor: 'Alternative Assets', contribution: 19.2 },
      { factor: 'Fixed Income', contribution: 9.8 }
    ]
  },
  {
    id: 'concentration_risk',
    name: 'Concentration Risk',
    category: 'concentration',
    current: 18.7,
    limit: 30.0,
    warning: 25.0,
    critical: 28.0,
    status: 'safe',
    unit: '%',
    description: 'Risk arising from lack of diversification',
    methodology: 'Herfindahl-Hirschman Index with risk-weighted exposures',
    confidence: 100,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'stable',
    trendValue: 0.1,
    historicalData: [
      { date: '2024-12-24', value: 18.9 },
      { date: '2024-12-25', value: 18.8 },
      { date: '2024-12-26', value: 18.7 },
      { date: '2024-12-27', value: 18.6 },
      { date: '2024-12-28', value: 18.7 },
      { date: '2024-12-29', value: 18.7 },
      { date: '2024-12-30', value: 18.7 }
    ],
    attribution: [
      { factor: 'Single Name', contribution: 35.4 },
      { factor: 'Sector', contribution: 28.9 },
      { factor: 'Geographic', contribution: 22.1 },
      { factor: 'Currency', contribution: 13.6 }
    ]
  },
  {
    id: 'credit_var',
    name: 'Credit VaR',
    category: 'credit',
    current: 1.8,
    limit: 4.0,
    warning: 3.0,
    critical: 3.5,
    status: 'safe',
    unit: '%',
    description: 'Value at Risk from credit exposures',
    methodology: 'CreditMetrics with Monte Carlo simulation',
    confidence: 99,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'up',
    trendValue: 0.1,
    historicalData: [
      { date: '2024-12-24', value: 1.6 },
      { date: '2024-12-25', value: 1.7 },
      { date: '2024-12-26', value: 1.7 },
      { date: '2024-12-27', value: 1.8 },
      { date: '2024-12-28', value: 1.8 },
      { date: '2024-12-29', value: 1.8 },
      { date: '2024-12-30', value: 1.8 }
    ],
    attribution: [
      { factor: 'Default Risk', contribution: 67.8 },
      { factor: 'Migration Risk', contribution: 23.4 },
      { factor: 'Recovery Risk', contribution: 8.8 }
    ]
  },
  {
    id: 'operational_var',
    name: 'Operational VaR',
    category: 'operational',
    current: 0.9,
    limit: 2.0,
    warning: 1.5,
    critical: 1.8,
    status: 'safe',
    unit: '%',
    description: 'Value at Risk from operational failures',
    methodology: 'Loss Distribution Approach with extreme value theory',
    confidence: 99.9,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'down',
    trendValue: -0.05,
    historicalData: [
      { date: '2024-12-24', value: 1.0 },
      { date: '2024-12-25', value: 0.95 },
      { date: '2024-12-26', value: 0.92 },
      { date: '2024-12-27', value: 0.90 },
      { date: '2024-12-28', value: 0.89 },
      { date: '2024-12-29', value: 0.90 },
      { date: '2024-12-30', value: 0.90 }
    ],
    attribution: [
      { factor: 'Technology Risk', contribution: 45.2 },
      { factor: 'Process Risk', contribution: 28.7 },
      { factor: 'People Risk', contribution: 16.3 },
      { factor: 'External Risk', contribution: 9.8 }
    ]
  },
  {
    id: 'model_risk',
    name: 'Model Risk Score',
    category: 'model',
    current: 15.2,
    limit: 30.0,
    warning: 25.0,
    critical: 28.0,
    status: 'safe',
    unit: 'score',
    description: 'Composite score of model risk across all models',
    methodology: 'Weighted average of model validation scores',
    confidence: 95,
    lastUpdated: '2024-12-31T09:00:00Z',
    trend: 'stable',
    trendValue: 0.0,
    historicalData: [
      { date: '2024-12-24', value: 15.5 },
      { date: '2024-12-25', value: 15.3 },
      { date: '2024-12-26', value: 15.2 },
      { date: '2024-12-27', value: 15.1 },
      { date: '2024-12-28', value: 15.2 },
      { date: '2024-12-29', value: 15.2 },
      { date: '2024-12-30', value: 15.2 }
    ],
    attribution: [
      { factor: 'Pricing Models', contribution: 38.7 },
      { factor: 'Risk Models', contribution: 32.1 },
      { factor: 'Valuation Models', contribution: 19.4 },
      { factor: 'Other Models', contribution: 9.8 }
    ]
  }
]

const VAR_MODELS: InstitutionalVaRModel[] = [
  {
    id: 'monte_carlo_var',
    name: 'Monte Carlo VaR',
    methodology: 'monte_carlo',
    confidenceLevel: 95,
    holdingPeriod: 1,
    lookbackPeriod: 250,
    var: 2.8,
    expectedShortfall: 4.2,
    conditionalVaR: 4.5,
    maximumLoss: 8.7,
    backtestingResults: {
      violations: 12,
      expectedViolations: 13,
      kupiecTest: { statistic: 0.08, pValue: 0.78, result: 'pass' },
      christoffersenTest: { statistic: 1.23, pValue: 0.54, result: 'pass' }
    },
    componentVaR: [
      { asset: 'US Equities', contribution: 45.2, marginalVaR: 1.26 },
      { asset: 'EU Equities', contribution: 23.1, marginalVaR: 0.65 },
      { asset: 'Bonds', contribution: 18.7, marginalVaR: 0.52 },
      { asset: 'Commodities', contribution: 8.9, marginalVaR: 0.25 },
      { asset: 'FX', contribution: 4.1, marginalVaR: 0.11 }
    ],
    stressVaR: 5.4,
    incrementalVaR: 0.3
  },
  {
    id: 'historical_var',
    name: 'Historical Simulation VaR',
    methodology: 'historical',
    confidenceLevel: 99,
    holdingPeriod: 1,
    lookbackPeriod: 500,
    var: 4.1,
    expectedShortfall: 6.8,
    conditionalVaR: 7.2,
    maximumLoss: 12.3,
    backtestingResults: {
      violations: 2,
      expectedViolations: 3,
      kupiecTest: { statistic: 0.33, pValue: 0.56, result: 'pass' },
      christoffersenTest: { statistic: 0.89, pValue: 0.64, result: 'pass' }
    },
    componentVaR: [
      { asset: 'US Equities', contribution: 48.7, marginalVaR: 2.00 },
      { asset: 'EU Equities', contribution: 24.3, marginalVaR: 1.00 },
      { asset: 'Bonds', contribution: 16.2, marginalVaR: 0.66 },
      { asset: 'Commodities', contribution: 7.8, marginalVaR: 0.32 },
      { asset: 'FX', contribution: 3.0, marginalVaR: 0.12 }
    ],
    stressVaR: 8.9,
    incrementalVaR: 0.5
  }
]

const STRESS_TEST_SCENARIOS: StressTestScenario[] = [
  {
    id: 'market_crash_2008',
    name: '2008 Financial Crisis',
    category: 'market_crash',
    description: 'Severe market crash similar to 2008 financial crisis',
    severity: 'extreme',
    probability: 2.5,
    timeHorizon: 30,
    shocks: [
      { factor: 'S&P 500', type: 'relative', value: -40.0 },
      { factor: 'VIX', type: 'absolute', value: 45.0 },
      { factor: 'Credit Spreads', type: 'absolute', value: 500 },
      { factor: 'USD Strength', type: 'relative', value: 15.0 }
    ],
    results: {
      portfolioImpact: -28.7,
      varImpact: 340.5,
      liquidityImpact: -45.2,
      capitalImpact: -32.1,
      recoveryTime: 18,
      worstCaseScenario: -35.4
    },
    mitigationStrategies: [
      { strategy: 'Increase Cash Holdings', effectiveness: 65, cost: 2.1, timeToImplement: 1 },
      { strategy: 'Hedge with Put Options', effectiveness: 78, cost: 3.8, timeToImplement: 2 },
      { strategy: 'Reduce Leverage', effectiveness: 82, cost: 1.2, timeToImplement: 1 }
    ]
  },
  {
    id: 'covid_pandemic',
    name: 'COVID-19 Pandemic',
    category: 'pandemic',
    description: 'Global pandemic with lockdowns and economic disruption',
    severity: 'severe',
    probability: 5.0,
    timeHorizon: 90,
    shocks: [
      { factor: 'S&P 500', type: 'relative', value: -30.0 },
      { factor: 'Oil Price', type: 'relative', value: -60.0 },
      { factor: 'Travel Stocks', type: 'relative', value: -70.0 },
      { factor: 'Tech Stocks', type: 'relative', value: 20.0 }
    ],
    results: {
      portfolioImpact: -18.9,
      varImpact: 215.7,
      liquidityImpact: -28.4,
      capitalImpact: -21.3,
      recoveryTime: 12,
      worstCaseScenario: -24.7
    },
    mitigationStrategies: [
      { strategy: 'Sector Rotation', effectiveness: 72, cost: 1.8, timeToImplement: 3 },
      { strategy: 'Increase Tech Allocation', effectiveness: 68, cost: 0.9, timeToImplement: 1 },
      { strategy: 'ESG Focus', effectiveness: 55, cost: 1.5, timeToImplement: 7 }
    ]
  },
  {
    id: 'interest_rate_shock',
    name: 'Interest Rate Shock',
    category: 'market_crash',
    description: 'Sudden 300bp increase in interest rates',
    severity: 'moderate',
    probability: 15.0,
    timeHorizon: 7,
    shocks: [
      { factor: '10Y Treasury', type: 'absolute', value: 300 },
      { factor: 'Credit Spreads', type: 'absolute', value: 150 },
      { factor: 'USD Strength', type: 'relative', value: 8.0 },
      { factor: 'Growth Stocks', type: 'relative', value: -25.0 }
    ],
    results: {
      portfolioImpact: -12.4,
      varImpact: 145.8,
      liquidityImpact: -15.7,
      capitalImpact: -14.2,
      recoveryTime: 6,
      worstCaseScenario: -16.8
    },
    mitigationStrategies: [
      { strategy: 'Duration Hedging', effectiveness: 85, cost: 2.3, timeToImplement: 1 },
      { strategy: 'Value Tilt', effectiveness: 62, cost: 1.1, timeToImplement: 2 },
      { strategy: 'REIT Exposure', effectiveness: 48, cost: 0.8, timeToImplement: 1 }
    ]
  },
  {
    id: 'geopolitical_crisis',
    name: 'Geopolitical Crisis',
    category: 'geopolitical',
    description: 'Major geopolitical event affecting global markets',
    severity: 'severe',
    probability: 8.0,
    timeHorizon: 60,
    shocks: [
      { factor: 'Oil Price', type: 'relative', value: 40.0 },
      { factor: 'Gold Price', type: 'relative', value: 25.0 },
      { factor: 'Emerging Markets', type: 'relative', value: -35.0 },
      { factor: 'Safe Haven Flows', type: 'relative', value: 15.0 }
    ],
    results: {
      portfolioImpact: -15.6,
      varImpact: 178.9,
      liquidityImpact: -22.1,
      capitalImpact: -17.8,
      recoveryTime: 9,
      worstCaseScenario: -21.4
    },
    mitigationStrategies: [
      { strategy: 'Safe Haven Assets', effectiveness: 76, cost: 1.9, timeToImplement: 1 },
      { strategy: 'Geographic Diversification', effectiveness: 58, cost: 2.1, timeToImplement: 5 },
      { strategy: 'Commodity Hedging', effectiveness: 64, cost: 2.7, timeToImplement: 2 }
    ]
  },
  {
    id: 'cyber_attack',
    name: 'Major Cyber Attack',
    category: 'cyber_attack',
    description: 'Large-scale cyber attack on financial infrastructure',
    severity: 'moderate',
    probability: 12.0,
    timeHorizon: 14,
    shocks: [
      { factor: 'Financial Sector', type: 'relative', value: -20.0 },
      { factor: 'Tech Sector', type: 'relative', value: -15.0 },
      { factor: 'Volatility', type: 'absolute', value: 25.0 },
      { factor: 'Liquidity Premium', type: 'absolute', value: 200 }
    ],
    results: {
      portfolioImpact: -8.9,
      varImpact: 98.7,
      liquidityImpact: -18.4,
      capitalImpact: -10.2,
      recoveryTime: 4,
      worstCaseScenario: -12.7
    },
    mitigationStrategies: [
      { strategy: 'Cybersecurity Stocks', effectiveness: 45, cost: 1.2, timeToImplement: 1 },
      { strategy: 'Operational Hedging', effectiveness: 67, cost: 3.1, timeToImplement: 3 },
      { strategy: 'Insurance Coverage', effectiveness: 72, cost: 0.5, timeToImplement: 30 }
    ]
  }
]

const RISK_ALERTS: RiskAlert[] = [
  {
    id: 'concentration_warning',
    type: 'concentration',
    severity: 'medium',
    title: 'Concentration Risk Warning',
    message: 'Single name concentration approaching warning threshold',
    metric: 'Single Name Concentration',
    currentValue: 8.7,
    threshold: 10.0,
    impact: 'medium',
    timestamp: '2024-12-31T08:45:00Z',
    acknowledged: false,
    actions: [
      { action: 'Review position sizing', status: 'pending' },
      { action: 'Consider diversification', status: 'pending' }
    ],
    escalationLevel: 1,
    relatedAlerts: []
  },
  {
    id: 'volatility_spike',
    type: 'volatility_spike',
    severity: 'high',
    title: 'Volatility Spike Detected',
    message: 'Market volatility has increased significantly',
    metric: 'Realized Volatility',
    currentValue: 28.4,
    threshold: 25.0,
    impact: 'high',
    timestamp: '2024-12-31T07:30:00Z',
    acknowledged: true,
    assignedTo: 'Risk Team',
    actions: [
      { action: 'Increase hedging', status: 'in_progress', assignee: 'John Doe', dueDate: '2024-12-31' },
      { action: 'Review VaR limits', status: 'completed', assignee: 'Jane Smith' }
    ],
    escalationLevel: 2,
    relatedAlerts: ['var_increase']
  }
]

const RISK_CONTROLS: RiskControl[] = [
  {
    id: 'var_limit_control',
    name: 'VaR Limit Monitoring',
    category: 'detective',
    type: 'automated',
    enabled: true,
    effectiveness: 95,
    description: 'Real-time monitoring of VaR against established limits',
    implementation: 'Automated system with real-time alerts',
    frequency: 'real_time',
    owner: 'Risk Management',
    lastTested: '2024-12-30',
    testResults: 'pass',
    exceptions: 0,
    cost: 50000,
    riskReduction: 85
  },
  {
    id: 'concentration_limit',
    name: 'Concentration Limits',
    category: 'preventive',
    type: 'automated',
    enabled: true,
    effectiveness: 88,
    description: 'Automated enforcement of concentration limits',
    implementation: 'Pre-trade and post-trade limit checks',
    frequency: 'real_time',
    owner: 'Risk Management',
    lastTested: '2024-12-29',
    testResults: 'pass',
    exceptions: 2,
    cost: 75000,
    riskReduction: 78
  },
  {
    id: 'stress_testing',
    name: 'Regular Stress Testing',
    category: 'detective',
    type: 'hybrid',
    enabled: true,
    effectiveness: 82,
    description: 'Comprehensive stress testing program',
    implementation: 'Monthly stress tests with scenario analysis',
    frequency: 'monthly',
    owner: 'Risk Management',
    lastTested: '2024-12-28',
    testResults: 'pass',
    exceptions: 1,
    cost: 120000,
    riskReduction: 72
  },
  {
    id: 'model_validation',
    name: 'Model Validation',
    category: 'detective',
    type: 'manual',
    enabled: true,
    effectiveness: 79,
    description: 'Independent validation of risk models',
    implementation: 'Annual model validation with quarterly reviews',
    frequency: 'monthly',
    owner: 'Model Validation',
    lastTested: '2024-12-15',
    testResults: 'partial',
    exceptions: 3,
    cost: 200000,
    riskReduction: 68
  }
]

// 🔥 WORLD CLASS RISK MANAGEMENT COMPONENT
export default function WorldClassRiskManagement() {
  const [metrics, setMetrics] = useState<AdvancedRiskMetric[]>(ADVANCED_RISK_METRICS)
  const [selectedMetric, setSelectedMetric] = useState<AdvancedRiskMetric | null>(null)
  const [varModels, setVarModels] = useState<InstitutionalVaRModel[]>(VAR_MODELS)
  const [selectedVarModel, setSelectedVarModel] = useState<InstitutionalVaRModel | null>(VAR_MODELS[0])
  const [stressScenarios, setStressScenarios] = useState<StressTestScenario[]>(STRESS_TEST_SCENARIOS)
  const [selectedScenario, setSelectedScenario] = useState<StressTestScenario | null>(null)
  const [alerts, setAlerts] = useState<RiskAlert[]>(RISK_ALERTS)
  const [controls, setControls] = useState<RiskControl[]>(RISK_CONTROLS)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRunningStressTest, setIsRunningStressTest] = useState(false)
  const [stressTestProgress, setStressTestProgress] = useState(0)

  // 🎯 FILTERED METRICS
  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => {
      const matchesCategory = filterCategory === 'all' || metric.category === filterCategory
      const matchesSearch = metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           metric.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [metrics, filterCategory, searchQuery])

  // 🎯 FILTERED ALERTS
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
      const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.message.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSeverity && matchesSearch
    })
  }, [alerts, filterSeverity, searchQuery])

  // 🚀 STRESS TEST SIMULATION
  const runStressTest = useCallback(async (scenarioId: string) => {
    setIsRunningStressTest(true)
    setStressTestProgress(0)
    
    // Simulate stress test progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setStressTestProgress(i)
    }
    
    // Update scenario results
    setStressScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? {
            ...scenario,
            results: {
              ...scenario.results,
              portfolioImpact: scenario.results.portfolioImpact * (0.9 + Math.random() * 0.2),
              varImpact: scenario.results.varImpact * (0.9 + Math.random() * 0.2)
            }
          }
        : scenario
    ))
    
    setIsRunningStressTest(false)
    window.window.alert('🧪 Stress test completed! Results updated.')
  }, [])

  // 🎨 STATUS COLORS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-orange-500'
      case 'breach': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return TrendingUp
      case 'credit': return Shield
      case 'operational': return Settings
      case 'liquidity': return Droplets
      case 'model': return Cpu
      case 'concentration': return Target
      case 'counterparty': return Users
      case 'regulatory': return Building
      default: return AlertTriangle
    }
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* 🔥 WORLD CLASS HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-[#00bbff]" />
            <h1 className="text-3xl font-bold text-white">Risk Management</h1>
            <Badge className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              INSTITUTIONAL GRADE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              console.log('Generate risk report clicked')
              window.window.alert('📊 Generating comprehensive risk report...')
            }}
            variant="outline"
            className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
          >
            <Download className="h-4 w-4 mr-2" />
            Risk Report
          </Button>
          
          <Button
            onClick={() => {
              console.log('Run stress test clicked')
              if (stressScenarios.length > 0) {
                runStressTest(stressScenarios[0].id)
              }
            }}
            className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
            disabled={isRunningStressTest}
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunningStressTest ? 'Running...' : 'Stress Test'}
          </Button>
        </div>
      </div>

      {/* 📊 REAL-TIME DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Portfolio VaR (95%)</p>
                <p className="text-2xl font-bold text-white">2.8%</p>
                <p className="text-xs text-green-400">↓ 0.2% from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Expected Shortfall</p>
                <p className="text-2xl font-bold text-white">4.2%</p>
                <p className="text-xs text-gray-400">→ Stable</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Active Alerts</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => !a.acknowledged).length}
                </p>
                <p className="text-xs text-yellow-400">2 high priority</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Risk Controls</p>
                <p className="text-2xl font-bold text-white">
                  {controls.filter(c => c.enabled).length}/{controls.length}
                </p>
                <p className="text-xs text-green-400">All systems operational</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🎯 ADVANCED FILTERS & SEARCH */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a0a0b8]" />
                <Input
                  placeholder="Search risk metrics, alerts, or scenarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#15151f] border-[#2a2a3e] text-white"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="market">Market Risk</SelectItem>
                <SelectItem value="credit">Credit Risk</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="liquidity">Liquidity</SelectItem>
                <SelectItem value="model">Model Risk</SelectItem>
                <SelectItem value="concentration">Concentration</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[120px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                console.log('Refresh data clicked')
                window.window.alert('🔄 Refreshing risk data...')
              }}
              variant="outline"
              size="sm"
              className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 MAIN CONTENT TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 bg-[#15151f]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="var-models">VaR Models</TabsTrigger>
          <TabsTrigger value="stress-testing">Stress Testing</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Risk Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMetrics.map((metric) => {
              const CategoryIcon = getCategoryIcon(metric.category)
              const utilizationPercent = (metric.current / metric.limit) * 100
              
              return (
                <Card 
                  key={metric.id} 
                  className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
                    selectedMetric?.id === metric.id ? 'ring-2 ring-[#00bbff]/50' : ''
                  }`}
                  onClick={() => setSelectedMetric(metric)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00bbff]/20 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-[#00bbff]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{metric.name}</CardTitle>
                          <p className="text-sm text-[#a0a0b8] capitalize">{metric.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
                        <Badge className={`${getSeverityColor(metric.status)} bg-transparent border-current text-xs`}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-[#a0a0b8] text-sm line-clamp-2">{metric.description}</p>
                    
                    {/* Current Value */}
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#a0a0b8]">Current Value</span>
                        <div className="flex items-center gap-1">
                          {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-400" />}
                          {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-400" />}
                          {metric.trend === 'stable' && <div className="w-3 h-0.5 bg-gray-400" />}
                          <span className={`text-xs ${
                            metric.trend === 'up' ? 'text-red-400' : 
                            metric.trend === 'down' ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {metric.trendValue > 0 ? '+' : ''}{metric.trendValue.toFixed(1)}{metric.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {metric.current.toFixed(1)}{metric.unit}
                      </div>
                      <Progress value={utilizationPercent} className="h-2" />
                      <div className="flex justify-between text-xs text-[#a0a0b8] mt-1">
                        <span>0{metric.unit}</span>
                        <span>{metric.limit.toFixed(1)}{metric.unit}</span>
                      </div>
                    </div>

                    {/* Confidence & Last Updated */}
                    <div className="flex justify-between text-xs text-[#a0a0b8]">
                      <span>Confidence: {metric.confidence}%</span>
                      <span>Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log(`View details: ${metric.name}`)
                          window.alert(`📊 Opening detailed view for ${metric.name}`)
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log(`Configure alerts: ${metric.name}`)
                          window.alert(`🔔 Configuring alerts for ${metric.name}`)
                        }}
                        size="sm"
                        className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                      >
                        <Bell className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Metric Details */}
          {selectedMetric && (
            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">{selectedMetric.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={`${getStatusColor(selectedMetric.status)} text-white`}>
                      {selectedMetric.status.toUpperCase()}
                    </Badge>
                    <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                      {selectedMetric.methodology}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historical Trend */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Historical Trend (7 days)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedMetric.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#a0a0b8"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="#a0a0b8"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}${selectedMetric.unit}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a25', 
                            border: '1px solid #2a2a3e',
                            borderRadius: '8px'
                          }}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: any) => [`${value}${selectedMetric.unit}`, selectedMetric.name]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#00bbff" 
                          strokeWidth={2}
                          dot={{ fill: '#00bbff', strokeWidth: 2, r: 4 }}
                        />
                        <ReferenceLine y={selectedMetric.limit} stroke="#ef4444" strokeDasharray="5 5" />
                        <ReferenceLine y={selectedMetric.warning} stroke="#f59e0b" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Attribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Risk Attribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={selectedMetric.attribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="contribution"
                          label={({ factor, contribution }) => `${factor}: ${contribution.toFixed(1)}%`}
                        >
                          {selectedMetric.attribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a25', 
                            border: '1px solid #2a2a3e',
                            borderRadius: '8px'
                          }}
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'Contribution']}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="var-models" className="space-y-6 mt-6">
          {/* VaR Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {varModels.map((model) => (
              <Card 
                key={model.id} 
                className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
                  selectedVarModel?.id === model.id ? 'ring-2 ring-[#00bbff]/50' : ''
                }`}
                onClick={() => setSelectedVarModel(model)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{model.name}</CardTitle>
                    <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                      {model.methodology.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">VaR ({model.confidenceLevel}%)</div>
                      <div className="text-lg font-bold text-red-400">
                        {model.var.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Expected Shortfall</div>
                      <div className="text-lg font-bold text-orange-400">
                        {model.expectedShortfall.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Conditional VaR</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {model.conditionalVaR.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Maximum Loss</div>
                      <div className="text-lg font-bold text-red-400">
                        {model.maximumLoss.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Backtesting Results */}
                  <div className="bg-[#15151f] rounded p-3">
                    <h4 className="text-sm font-semibold text-white mb-2">Backtesting Results</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Violations:</span>
                        <span className="text-white">{model.backtestingResults.violations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Expected:</span>
                        <span className="text-white">{model.backtestingResults.expectedViolations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Kupiec Test:</span>
                        <span className={`${model.backtestingResults.kupiecTest.result === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                          {model.backtestingResults.kupiecTest.result.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Christoffersen:</span>
                        <span className={`${model.backtestingResults.christoffersenTest.result === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                          {model.backtestingResults.christoffersenTest.result.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log(`Recalculate VaR: ${model.name}`)
                        window.alert(`🔄 Recalculating ${model.name}...`)
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recalculate
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log(`Backtest VaR: ${model.name}`)
                        window.alert(`📊 Running backtest for ${model.name}...`)
                      }}
                      size="sm"
                      className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Backtest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected VaR Model Details */}
          {selectedVarModel && (
            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {selectedVarModel.name} - Component Analysis
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedVarModel.componentVaR}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis 
                        dataKey="asset" 
                        stroke="#a0a0b8"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#a0a0b8"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a25', 
                          border: '1px solid #2a2a3e',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string) => [
                          `${value.toFixed(2)}%`, 
                          name === 'contribution' ? 'Contribution' : 'Marginal VaR'
                        ]}
                      />
                      <Bar dataKey="contribution" fill="#00bbff" name="contribution" />
                      <Bar dataKey="marginalVaR" fill="#4a4aff" name="marginalVaR" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stress-testing" className="space-y-6 mt-6">
          {/* Stress Test Progress */}
          {isRunningStressTest && (
            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Activity className="h-5 w-5 text-[#00bbff] animate-pulse" />
                  <span className="text-white font-medium">Running Stress Test...</span>
                </div>
                <Progress value={stressTestProgress} className="mb-2" />
                <div className="text-sm text-[#a0a0b8]">{stressTestProgress}% complete</div>
              </CardContent>
            </Card>
          )}

          {/* Stress Test Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stressScenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
                  selectedScenario?.id === scenario.id ? 'ring-2 ring-[#00bbff]/50' : ''
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{scenario.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={`${
                        scenario.severity === 'extreme' ? 'bg-red-500/20 text-red-400' :
                        scenario.severity === 'severe' ? 'bg-orange-500/20 text-orange-400' :
                        scenario.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {scenario.severity.toUpperCase()}
                      </Badge>
                      <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                        {scenario.probability.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-[#a0a0b8] text-sm">{scenario.description}</p>
                  
                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Portfolio Impact</div>
                      <div className={`text-lg font-bold ${
                        scenario.results.portfolioImpact < 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {scenario.results.portfolioImpact > 0 ? '+' : ''}{scenario.results.portfolioImpact.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">VaR Impact</div>
                      <div className="text-lg font-bold text-orange-400">
                        +{scenario.results.varImpact.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Recovery Time</div>
                      <div className="text-lg font-bold text-blue-400">
                        {scenario.results.recoveryTime} months
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Worst Case</div>
                      <div className="text-lg font-bold text-red-400">
                        {scenario.results.worstCaseScenario.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        runStressTest(scenario.id)
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                      disabled={isRunningStressTest}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Test
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log(`View mitigation: ${scenario.name}`)
                        window.alert(`🛡️ Viewing mitigation strategies for ${scenario.name}`)
                      }}
                      size="sm"
                      className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Mitigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Scenario Details */}
          {selectedScenario && (
            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {selectedScenario.name} - Mitigation Strategies
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {selectedScenario.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="bg-[#15151f] rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{strategy.strategy}</h4>
                        <Badge className="bg-green-500/20 text-green-400">
                          {strategy.effectiveness}% effective
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-[#a0a0b8]">Cost: </span>
                          <span className="text-white">${strategy.cost.toFixed(1)}M</span>
                        </div>
                        <div>
                          <span className="text-[#a0a0b8]">Time: </span>
                          <span className="text-white">{strategy.timeToImplement} days</span>
                        </div>
                        <div>
                          <Button
                            onClick={() => {
                              console.log(`Implement strategy: ${strategy.strategy}`)
                              window.alert(`🚀 Implementing ${strategy.strategy}...`)
                            }}
                            size="sm"
                            className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                          >
                            Implement
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 mt-6">
          {/* Active Alerts */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="bg-[#1a1a25] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      } ${!alert.acknowledged ? 'animate-pulse' : ''}`} />
                      <div>
                        <h3 className="text-white font-medium">{alert.title}</h3>
                        <p className="text-[#a0a0b8] text-sm">{alert.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getSeverityColor(alert.severity)} bg-transparent border-current`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-[#a0a0b8]">Current: </span>
                      <span className="text-white">{alert.currentValue.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#a0a0b8]">Threshold: </span>
                      <span className="text-white">{alert.threshold.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#a0a0b8]">Impact: </span>
                      <span className={`${getSeverityColor(alert.impact)}`}>
                        {alert.impact.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {alert.actions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-white text-sm font-medium mb-2">Actions:</h4>
                      <div className="space-y-1">
                        {alert.actions.map((action, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-[#a0a0b8]">{action.action}</span>
                            <Badge className={`${
                              action.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              action.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {action.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[#a0a0b8]">
                      {new Date(alert.timestamp).toLocaleString()}
                      {alert.assignedTo && ` • Assigned to ${alert.assignedTo}`}
                    </div>
                    
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <Button
                          onClick={() => {
                            console.log('Acknowledge alert clicked')
                            setAlerts(prev => prev.map(a => 
                              a.id === alert.id ? { ...a, acknowledged: true } : a
                            ))
                            window.window.alert('✅ Alert acknowledged')
                          }}
                          size="sm"
                          variant="outline"
                          className="border-[#00bbff]/30 text-[#00bbff] hover:bg-[#00bbff]/20"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => {
                          console.log('Take action clicked')
                          window.alert('🚀 Opening action panel...')
                        }}
                        size="sm"
                        className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <Card className="bg-[#1a1a25] border-[#2a2a3e]">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-[#a0a0b8]">No active alerts matching your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="controls" className="space-y-6 mt-6">
          {/* Risk Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {controls.map((control) => (
              <Card key={control.id} className="bg-[#1a1a25] border-[#2a2a3e]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{control.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        control.category === 'preventive' ? 'bg-green-500/20 text-green-400' :
                        control.category === 'detective' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {control.category.toUpperCase()}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${control.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-[#a0a0b8] text-sm">{control.description}</p>
                  
                  {/* Control Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Effectiveness</div>
                      <div className="text-lg font-bold text-green-400">
                        {control.effectiveness}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Risk Reduction</div>
                      <div className="text-lg font-bold text-blue-400">
                        {control.riskReduction}%
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Exceptions</div>
                      <div className={`text-lg font-bold ${control.exceptions === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {control.exceptions}
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded p-3">
                      <div className="text-xs text-[#a0a0b8] mb-1">Annual Cost</div>
                      <div className="text-lg font-bold text-white">
                        ${(control.cost / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>

                  {/* Control Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a0a0b8]">Type:</span>
                      <span className="text-white capitalize">{control.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0b8]">Frequency:</span>
                      <span className="text-white capitalize">{control.frequency.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0b8]">Owner:</span>
                      <span className="text-white">{control.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0b8]">Last Tested:</span>
                      <span className="text-white">{control.lastTested}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0b8]">Test Result:</span>
                      <span className={`${
                        control.testResults === 'pass' ? 'text-green-400' :
                        control.testResults === 'partial' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {control.testResults.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        console.log(`Toggle control: ${control.name}`)
                        setControls(prev => prev.map(c => 
                          c.id === control.id ? { ...c, enabled: !c.enabled } : c
                        ))
                      }}
                      size="sm"
                      variant="outline"
                      className={`flex-1 border-[#2a2a3e] ${
                        control.enabled ? 'text-red-400 hover:bg-red-500/20' : 'text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      {control.enabled ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        console.log(`Test control: ${control.name}`)
                        window.alert(`🧪 Testing ${control.name}...`)
                      }}
                      size="sm"
                      className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-6 mt-6">
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Portfolio Risk Attribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-[#a0a0b8] py-8">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>Risk attribution analysis coming soon...</p>
                <p className="text-sm mt-2">This will show detailed risk breakdown by asset, sector, and factor.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6 mt-6">
          <Card className="bg-[#1a1a25] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Real-time Risk Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-[#a0a0b8] py-8">
                <Monitor className="h-12 w-12 mx-auto mb-4" />
                <p>Real-time monitoring dashboard coming soon...</p>
                <p className="text-sm mt-2">This will show live risk metrics, alerts, and system health.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
