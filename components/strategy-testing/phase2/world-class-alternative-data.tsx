"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  Satellite, 
  MessageSquare, 
  TrendingUp, 
  Globe, 
  Newspaper,
  Activity,
  BarChart3,
  Zap,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  Plane,
  Wifi,
  WifiOff,
  Signal,
  Database,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Wind,
  Thermometer,
  Eye,
  Camera,
  Radar as RadarIcon,
  Radio,
  Smartphone,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  Router,
  Server,
  Shield,
  Lock,
  Unlock,
  Key,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Share,
  Star,
  Heart,
  Bookmark,
  Tag,
  Calendar,
  MapPin,
  Navigation,
  Compass,
  Map,
  Building,
  Factory,
  Store,
  Home,
  Car,
  Truck,
  Ship,
  Train,
  Fuel,
  Zap as Lightning,
  Droplets,
  Leaf,
  TreePine,
  Mountain,
  Waves,
  Flame,
  Snowflake,
  Sparkles,
  Rocket,
  Atom,
  Dna,
  Microscope,
  FlaskConical,
  Beaker,
  TestTube,
  Pill,
  Stethoscope,
  HeartHandshake,
  TrendingDown,
  Plus,
  Minus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Settings,
  Edit,
  Copy,
  Trash2,
  Save,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box,
  Layers,
  Grid,
  List,
  Table,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  ScatterChart as ScatterChartIcon,
  TrendingUpIcon,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind
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
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  PieChart,
  Cell,
  Pie,
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
interface InstitutionalDataSource {
  id: string
  name: string
  category: 'satellite' | 'social' | 'news' | 'economic' | 'weather' | 'supply_chain' | 'geopolitical' | 'esg' | 'credit' | 'alternative' | 'proprietary'
  provider: string
  status: 'active' | 'inactive' | 'maintenance' | 'error' | 'premium' | 'trial'
  quality: 'institutional' | 'professional' | 'standard' | 'experimental'
  latency: number // milliseconds
  coverage: string[]
  updateFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  cost: number // per month
  dataPoints: number
  accuracy: number // percentage
  reliability: number // percentage
  description: string
  features: string[]
  apiEndpoint: string
  authentication: 'api-key' | 'oauth' | 'certificate' | 'proprietary'
  rateLimit: number
  historicalDepth: string
  sampleData: any[]
  insights: DataInsight[]
  correlations: DataCorrelation[]
  alerts: DataAlert[]
  performance: DataPerformance
  integration: {
    connected: boolean
    lastSync: string
    nextSync: string
    syncStatus: 'success' | 'failed' | 'pending' | 'syncing'
    errorCount: number
    dataVolume: number
  }
}

interface DataInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'alert' | 'opportunity'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  actionable: boolean
  relatedAssets: string[]
  generatedAt: string
  aiModel: string
}

interface DataCorrelation {
  id: string
  asset: string
  correlation: number
  significance: number
  timeframe: string
  strength: 'strong' | 'moderate' | 'weak'
}

interface DataAlert {
  id: string
  type: 'threshold' | 'anomaly' | 'trend' | 'correlation' | 'news' | 'event'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  triggeredAt: string
  acknowledged: boolean
  actionTaken: boolean
}

interface DataPerformance {
  uptime: number
  avgLatency: number
  errorRate: number
  dataQuality: number
  predictionAccuracy: number
  signalStrength: number
}

interface AIDataProcessor {
  id: string
  name: string
  type: 'nlp' | 'computer_vision' | 'time_series' | 'anomaly_detection' | 'sentiment' | 'predictive' | 'clustering'
  status: 'active' | 'training' | 'idle' | 'error'
  accuracy: number
  processingSpeed: number
  lastTrained: string
  dataProcessed: number
  insights: number
  predictions: number
}

// 🎯 WORLD CLASS DATA SOURCES
const INSTITUTIONAL_DATA_SOURCES: InstitutionalDataSource[] = [
  {
    id: 'satellite_imagery',
    name: 'Satellite Imagery Analytics',
    category: 'satellite',
    provider: 'Planet Labs / Maxar',
    status: 'active',
    quality: 'institutional',
    latency: 3600000, // 1 hour
    coverage: ['Global', 'High Resolution', 'Daily Updates'],
    updateFrequency: 'daily',
    cost: 25000,
    dataPoints: 50000000,
    accuracy: 94.5,
    reliability: 98.2,
    description: 'High-resolution satellite imagery for tracking economic activity, supply chains, and infrastructure development',
    features: ['Parking Lot Analysis', 'Construction Monitoring', 'Crop Yield Estimation', 'Oil Storage Tracking', 'Shipping Activity'],
    apiEndpoint: 'https://api.planet.com/data/v1',
    authentication: 'api-key',
    rateLimit: 1000,
    historicalDepth: '5 years',
    sampleData: [],
    insights: [
      {
        id: '1',
        type: 'trend',
        title: 'Walmart Parking Lots 15% Fuller',
        description: 'Satellite analysis shows increased consumer activity at Walmart locations across the US',
        confidence: 87.3,
        impact: 'high',
        timeframe: 'Last 30 days',
        actionable: true,
        relatedAssets: ['WMT', 'TGT', 'COST'],
        generatedAt: '2024-12-31T10:30:00Z',
        aiModel: 'Computer Vision v3.2'
      },
      {
        id: '2',
        type: 'anomaly',
        title: 'Unusual Oil Tanker Activity',
        description: 'Significant increase in oil tanker traffic at key ports suggests supply chain disruption',
        confidence: 92.1,
        impact: 'high',
        timeframe: 'Last 7 days',
        actionable: true,
        relatedAssets: ['XOM', 'CVX', 'COP'],
        generatedAt: '2024-12-31T09:15:00Z',
        aiModel: 'Maritime Analytics v2.1'
      }
    ],
    correlations: [
      { id: '1', asset: 'WMT', correlation: 0.73, significance: 0.95, timeframe: '6M', strength: 'strong' },
      { id: '2', asset: 'AMZN', correlation: -0.45, significance: 0.82, timeframe: '6M', strength: 'moderate' }
    ],
    alerts: [
      {
        id: '1',
        type: 'anomaly',
        severity: 'high',
        message: 'Unusual construction activity detected at Tesla Gigafactory',
        triggeredAt: '2024-12-31T08:45:00Z',
        acknowledged: false,
        actionTaken: false
      }
    ],
    performance: {
      uptime: 99.7,
      avgLatency: 3600,
      errorRate: 0.3,
      dataQuality: 94.5,
      predictionAccuracy: 87.2,
      signalStrength: 8.4
    },
    integration: {
      connected: true,
      lastSync: '2024-12-31T10:00:00Z',
      nextSync: '2024-12-31T11:00:00Z',
      syncStatus: 'success',
      errorCount: 2,
      dataVolume: 2.3e9
    }
  },
  {
    id: 'social_sentiment',
    name: 'Social Media Sentiment Engine',
    category: 'social',
    provider: 'StockTwits / Twitter API',
    status: 'active',
    quality: 'institutional',
    latency: 30000, // 30 seconds
    coverage: ['Twitter', 'Reddit', 'StockTwits', 'LinkedIn', 'News Comments'],
    updateFrequency: 'real-time',
    cost: 15000,
    dataPoints: 100000000,
    accuracy: 89.7,
    reliability: 96.8,
    description: 'Real-time social media sentiment analysis with advanced NLP and emotion detection',
    features: ['Sentiment Scoring', 'Emotion Detection', 'Influencer Tracking', 'Viral Content Analysis', 'Bot Detection'],
    apiEndpoint: 'https://api.stocktwits.com/api/2',
    authentication: 'oauth',
    rateLimit: 5000,
    historicalDepth: '2 years',
    sampleData: [],
    insights: [
      {
        id: '3',
        type: 'trend',
        title: 'TSLA Sentiment Surge',
        description: 'Tesla sentiment increased 45% following Cybertruck delivery announcement',
        confidence: 91.8,
        impact: 'high',
        timeframe: 'Last 24 hours',
        actionable: true,
        relatedAssets: ['TSLA', 'F', 'GM'],
        generatedAt: '2024-12-31T10:45:00Z',
        aiModel: 'Sentiment Analysis v4.1'
      }
    ],
    correlations: [
      { id: '3', asset: 'TSLA', correlation: 0.68, significance: 0.89, timeframe: '3M', strength: 'strong' },
      { id: '4', asset: 'AAPL', correlation: 0.52, significance: 0.76, timeframe: '3M', strength: 'moderate' }
    ],
    alerts: [],
    performance: {
      uptime: 99.9,
      avgLatency: 30,
      errorRate: 0.1,
      dataQuality: 89.7,
      predictionAccuracy: 82.6,
      signalStrength: 7.8
    },
    integration: {
      connected: true,
      lastSync: '2024-12-31T10:59:30Z',
      nextSync: '2024-12-31T11:00:00Z',
      syncStatus: 'syncing',
      errorCount: 0,
      dataVolume: 5.7e8
    }
  },
  {
    id: 'supply_chain_intel',
    name: 'Global Supply Chain Intelligence',
    category: 'supply_chain',
    provider: 'Resilinc / Riskmethods',
    status: 'active',
    quality: 'institutional',
    latency: 1800000, // 30 minutes
    coverage: ['Manufacturing', 'Logistics', 'Ports', 'Shipping', 'Inventory'],
    updateFrequency: 'hourly',
    cost: 35000,
    dataPoints: 25000000,
    accuracy: 92.3,
    reliability: 97.5,
    description: 'Comprehensive supply chain monitoring with predictive disruption analytics',
    features: ['Disruption Prediction', 'Port Congestion', 'Inventory Levels', 'Shipping Rates', 'Supplier Risk'],
    apiEndpoint: 'https://api.resilinc.com/v2',
    authentication: 'certificate',
    rateLimit: 500,
    historicalDepth: '3 years',
    sampleData: [],
    insights: [
      {
        id: '4',
        type: 'alert',
        title: 'Semiconductor Shortage Alert',
        description: 'Critical shortage detected in automotive semiconductor supply chain',
        confidence: 95.2,
        impact: 'high',
        timeframe: 'Next 2 weeks',
        actionable: true,
        relatedAssets: ['TSM', 'NVDA', 'AMD', 'F', 'GM'],
        generatedAt: '2024-12-31T09:30:00Z',
        aiModel: 'Supply Chain Predictor v2.8'
      }
    ],
    correlations: [
      { id: '5', asset: 'TSM', correlation: 0.81, significance: 0.93, timeframe: '1Y', strength: 'strong' },
      { id: '6', asset: 'NVDA', correlation: 0.74, significance: 0.88, timeframe: '1Y', strength: 'strong' }
    ],
    alerts: [
      {
        id: '2',
        type: 'threshold',
        severity: 'critical',
        message: 'Port congestion at Long Beach exceeds critical threshold',
        triggeredAt: '2024-12-31T07:20:00Z',
        acknowledged: true,
        actionTaken: true
      }
    ],
    performance: {
      uptime: 98.9,
      avgLatency: 1800,
      errorRate: 1.1,
      dataQuality: 92.3,
      predictionAccuracy: 89.7,
      signalStrength: 9.1
    },
    integration: {
      connected: true,
      lastSync: '2024-12-31T10:30:00Z',
      nextSync: '2024-12-31T11:00:00Z',
      syncStatus: 'success',
      errorCount: 1,
      dataVolume: 1.2e9
    }
  },
  {
    id: 'weather_climate',
    name: 'Advanced Weather & Climate Data',
    category: 'weather',
    provider: 'NOAA / Weather Underground',
    status: 'active',
    quality: 'institutional',
    latency: 300000, // 5 minutes
    coverage: ['Global Weather', 'Climate Patterns', 'Natural Disasters', 'Agricultural Impact'],
    updateFrequency: 'real-time',
    cost: 8000,
    dataPoints: 75000000,
    accuracy: 91.8,
    reliability: 99.1,
    description: 'Comprehensive weather and climate data with agricultural and energy impact analysis',
    features: ['Weather Forecasting', 'Crop Impact Analysis', 'Energy Demand Prediction', 'Natural Disaster Tracking'],
    apiEndpoint: 'https://api.weather.gov/v1',
    authentication: 'api-key',
    rateLimit: 2000,
    historicalDepth: '10 years',
    sampleData: [],
    insights: [
      {
        id: '5',
        type: 'prediction',
        title: 'La Niña Impact on Corn Yields',
        description: 'La Niña weather pattern expected to reduce US corn yields by 8-12%',
        confidence: 88.4,
        impact: 'high',
        timeframe: 'Next 6 months',
        actionable: true,
        relatedAssets: ['CORN', 'ADM', 'BG', 'CF'],
        generatedAt: '2024-12-31T08:00:00Z',
        aiModel: 'Climate Impact v1.9'
      }
    ],
    correlations: [
      { id: '7', asset: 'CORN', correlation: -0.67, significance: 0.91, timeframe: '2Y', strength: 'strong' },
      { id: '8', asset: 'ADM', correlation: -0.54, significance: 0.83, timeframe: '2Y', strength: 'moderate' }
    ],
    alerts: [],
    performance: {
      uptime: 99.8,
      avgLatency: 300,
      errorRate: 0.2,
      dataQuality: 91.8,
      predictionAccuracy: 85.3,
      signalStrength: 8.7
    },
    integration: {
      connected: true,
      lastSync: '2024-12-31T10:55:00Z',
      nextSync: '2024-12-31T11:00:00Z',
      syncStatus: 'success',
      errorCount: 0,
      dataVolume: 3.4e8
    }
  },
  {
    id: 'credit_flows',
    name: 'Global Credit Flow Analytics',
    category: 'credit',
    provider: 'Moody\'s Analytics / S&P',
    status: 'premium',
    quality: 'institutional',
    latency: 3600000, // 1 hour
    coverage: ['Corporate Credit', 'Sovereign Debt', 'Municipal Bonds', 'Credit Derivatives'],
    updateFrequency: 'daily',
    cost: 50000,
    dataPoints: 15000000,
    accuracy: 96.2,
    reliability: 98.8,
    description: 'Institutional-grade credit analytics with default prediction and flow analysis',
    features: ['Default Prediction', 'Credit Flow Tracking', 'Spread Analysis', 'Rating Changes', 'Covenant Monitoring'],
    apiEndpoint: 'https://api.moodys.com/credit/v3',
    authentication: 'certificate',
    rateLimit: 200,
    historicalDepth: '15 years',
    sampleData: [],
    insights: [
      {
        id: '6',
        type: 'alert',
        title: 'High Yield Credit Stress',
        description: 'Unusual stress patterns detected in high-yield credit markets',
        confidence: 93.7,
        impact: 'high',
        timeframe: 'Current',
        actionable: true,
        relatedAssets: ['HYG', 'JNK', 'BKLN'],
        generatedAt: '2024-12-31T06:00:00Z',
        aiModel: 'Credit Risk v5.2'
      }
    ],
    correlations: [
      { id: '9', asset: 'HYG', correlation: 0.89, significance: 0.97, timeframe: '5Y', strength: 'strong' },
      { id: '10', asset: 'JNK', correlation: 0.85, significance: 0.95, timeframe: '5Y', strength: 'strong' }
    ],
    alerts: [
      {
        id: '3',
        type: 'trend',
        severity: 'medium',
        message: 'Investment grade spreads widening beyond historical norms',
        triggeredAt: '2024-12-30T16:30:00Z',
        acknowledged: true,
        actionTaken: false
      }
    ],
    performance: {
      uptime: 99.5,
      avgLatency: 3600,
      errorRate: 0.5,
      dataQuality: 96.2,
      predictionAccuracy: 91.8,
      signalStrength: 9.3
    },
    integration: {
      connected: true,
      lastSync: '2024-12-31T10:00:00Z',
      nextSync: '2024-12-31T11:00:00Z',
      syncStatus: 'success',
      errorCount: 0,
      dataVolume: 8.9e8
    }
  },
  {
    id: 'esg_metrics',
    name: 'ESG & Sustainability Metrics',
    category: 'esg',
    provider: 'MSCI ESG / Sustainalytics',
    status: 'active',
    quality: 'institutional',
    latency: 86400000, // 24 hours
    coverage: ['Environmental', 'Social', 'Governance', 'Carbon Footprint', 'Regulatory Compliance'],
    updateFrequency: 'daily',
    cost: 20000,
    dataPoints: 5000000,
    accuracy: 88.9,
    reliability: 95.7,
    description: 'Comprehensive ESG scoring and sustainability metrics with regulatory compliance tracking',
    features: ['ESG Scoring', 'Carbon Tracking', 'Regulatory Monitoring', 'Sustainability Trends', 'Impact Analysis'],
    apiEndpoint: 'https://api.msci.com/esg/v2',
    authentication: 'oauth',
    rateLimit: 100,
    historicalDepth: '5 years',
    sampleData: [],
    insights: [
      {
        id: '7',
        type: 'trend',
        title: 'ESG Fund Inflows Accelerating',
        description: 'ESG-focused funds seeing record inflows, up 67% year-over-year',
        confidence: 85.6,
        impact: 'medium',
        timeframe: 'Last quarter',
        actionable: true,
        relatedAssets: ['ESGU', 'ESGD', 'VSGX'],
        generatedAt: '2024-12-31T05:00:00Z',
        aiModel: 'ESG Trends v2.3'
      }
    ],
    correlations: [
      { id: '11', asset: 'ESGU', correlation: 0.76, significance: 0.87, timeframe: '2Y', strength: 'strong' },
      { id: '12', asset: 'TSLA', correlation: 0.43, significance: 0.71, timeframe: '2Y', strength: 'moderate' }
    ],
    alerts: [],
    performance: {
      uptime: 98.2,
      avgLatency: 86400,
      errorRate: 1.8,
      dataQuality: 88.9,
      predictionAccuracy: 79.4,
      signalStrength: 7.2
    },
    integration: {
      connected: true,
      lastSync: '2024-12-31T00:00:00Z',
      nextSync: '2025-01-01T00:00:00Z',
      syncStatus: 'success',
      errorCount: 3,
      dataVolume: 2.1e8
    }
  }
]

// 🤖 AI DATA PROCESSORS
const AI_PROCESSORS: AIDataProcessor[] = [
  {
    id: 'nlp_engine',
    name: 'Advanced NLP Engine',
    type: 'nlp',
    status: 'active',
    accuracy: 94.2,
    processingSpeed: 50000,
    lastTrained: '2024-12-30',
    dataProcessed: 2500000000,
    insights: 125000,
    predictions: 89000
  },
  {
    id: 'computer_vision',
    name: 'Satellite Vision AI',
    type: 'computer_vision',
    status: 'active',
    accuracy: 91.8,
    processingSpeed: 25000,
    lastTrained: '2024-12-29',
    dataProcessed: 1800000000,
    insights: 78000,
    predictions: 45000
  },
  {
    id: 'anomaly_detector',
    name: 'Market Anomaly Detector',
    type: 'anomaly_detection',
    status: 'active',
    accuracy: 87.5,
    processingSpeed: 75000,
    lastTrained: '2024-12-31',
    dataProcessed: 950000000,
    insights: 34000,
    predictions: 67000
  }
]

// 🔥 WORLD CLASS ALTERNATIVE DATA COMPONENT
export default function WorldClassAlternativeData() {
  const [dataSources, setDataSources] = useState<InstitutionalDataSource[]>(INSTITUTIONAL_DATA_SOURCES)
  const [selectedSource, setSelectedSource] = useState<InstitutionalDataSource | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('accuracy')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid')
  const [showAIProcessors, setShowAIProcessors] = useState(false)
  const [realTimeMode, setRealTimeMode] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  // 🎯 FILTERED AND SORTED DATA SOURCES
  const filteredSources = useMemo(() => {
    return dataSources
      .filter(source => {
        const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            source.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            source.provider.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'all' || source.category === filterCategory
        const matchesStatus = filterStatus === 'all' || source.status === filterStatus
        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'accuracy':
            return b.accuracy - a.accuracy
          case 'reliability':
            return b.reliability - a.reliability
          case 'cost':
            return a.cost - b.cost
          case 'latency':
            return a.latency - b.latency
          case 'name':
            return a.name.localeCompare(b.name)
          default:
            return 0
        }
      })
  }, [dataSources, searchQuery, filterCategory, filterStatus, sortBy])

  // 🚀 REAL-TIME DATA SIMULATION
  useEffect(() => {
    if (!realTimeMode) return

    const interval = setInterval(() => {
      setDataSources(prev => prev.map(source => ({
        ...source,
        integration: {
          ...source.integration,
          lastSync: new Date().toISOString(),
          dataVolume: source.integration.dataVolume + Math.random() * 1000000
        },
        performance: {
          ...source.performance,
          avgLatency: source.performance.avgLatency + (Math.random() - 0.5) * 100,
          signalStrength: Math.max(0, Math.min(10, source.performance.signalStrength + (Math.random() - 0.5) * 0.5))
        }
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [realTimeMode])

  // 🎨 STATUS COLORS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'premium': return 'bg-purple-500'
      case 'trial': return 'bg-blue-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'inactive': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'satellite': return Satellite
      case 'social': return MessageSquare
      case 'news': return Newspaper
      case 'weather': return CloudRain
      case 'supply_chain': return Truck
      case 'credit': return Building
      case 'esg': return Leaf
      case 'economic': return TrendingUp
      case 'geopolitical': return Globe
      default: return Database
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'institutional': return 'text-purple-400'
      case 'professional': return 'text-blue-400'
      case 'standard': return 'text-green-400'
      case 'experimental': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* 🔥 WORLD CLASS HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-[#00bbff]" />
            <h1 className="text-3xl font-bold text-white">Alternative Data Intelligence</h1>
            <Badge className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              INSTITUTIONAL GRADE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realTimeMode ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-[#a0a0b8]">
              {realTimeMode ? 'Real-time' : 'Paused'}
            </span>
          </div>
          
          <Button
            onClick={() => setRealTimeMode(!realTimeMode)}
            variant="outline"
            size="sm"
            className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
          >
            {realTimeMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={() => setShowAIProcessors(!showAIProcessors)}
            variant="outline"
            className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Processors
          </Button>
          
          <Button
            onClick={() => {
              console.log('Add data source clicked')
              window.alert('🚀 Opening data source marketplace...')
            }}
            className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Data Source
          </Button>
        </div>
      </div>

      {/* 📊 REAL-TIME DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Active Sources</p>
                <p className="text-2xl font-bold text-white">
                  {dataSources.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Data Points/Day</p>
                <p className="text-2xl font-bold text-white">
                  {(dataSources.reduce((sum, s) => sum + s.dataPoints, 0) / 1000000).toFixed(0)}M
                </p>
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
                <p className="text-sm text-[#a0a0b8]">Avg Accuracy</p>
                <p className="text-2xl font-bold text-white">
                  {(dataSources.reduce((sum, s) => sum + s.accuracy, 0) / dataSources.length).toFixed(1)}%
                </p>
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
                <p className="text-sm text-[#a0a0b8]">AI Insights</p>
                <p className="text-2xl font-bold text-white">
                  {dataSources.reduce((sum, s) => sum + s.insights.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-yellow-400" />
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
                  placeholder="Search data sources, providers, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#15151f] border-[#2a2a3e] text-white"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="news">News & Media</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="supply_chain">Supply Chain</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="esg">ESG</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="accuracy">Accuracy</SelectItem>
                <SelectItem value="reliability">Reliability</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="latency">Latency</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-[#2a2a3e]"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-[#2a2a3e]"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('analytics')}
                className="border-[#2a2a3e]"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 DATA SOURCES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSources.map((source) => {
          const CategoryIcon = getCategoryIcon(source.category)
          return (
            <Card 
              key={source.id} 
              className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
                selectedSource?.id === source.id ? 'ring-2 ring-[#00bbff]/50' : ''
              }`}
              onClick={() => setSelectedSource(source)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00bbff]/20 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="h-5 w-5 text-[#00bbff]" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{source.name}</CardTitle>
                      <p className="text-sm text-[#a0a0b8]">{source.provider}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(source.status)}`} />
                    <Badge className={`${getQualityColor(source.quality)} bg-transparent border-current text-xs`}>
                      {source.quality}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-[#a0a0b8] text-sm line-clamp-2">{source.description}</p>
                
                {/* 📊 KEY METRICS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#15151f] rounded p-3">
                    <div className="text-xs text-[#a0a0b8] mb-1">Accuracy</div>
                    <div className="text-lg font-bold text-green-400">
                      {source.accuracy.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-[#15151f] rounded p-3">
                    <div className="text-xs text-[#a0a0b8] mb-1">Reliability</div>
                    <div className="text-lg font-bold text-blue-400">
                      {source.reliability.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-[#15151f] rounded p-3">
                    <div className="text-xs text-[#a0a0b8] mb-1">Latency</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {source.latency < 60000 ? `${(source.latency / 1000).toFixed(0)}s` : 
                       source.latency < 3600000 ? `${(source.latency / 60000).toFixed(0)}m` : 
                       `${(source.latency / 3600000).toFixed(0)}h`}
                    </div>
                  </div>
                  
                  <div className="bg-[#15151f] rounded p-3">
                    <div className="text-xs text-[#a0a0b8] mb-1">Cost/Month</div>
                    <div className="text-lg font-bold text-purple-400">
                      ${(source.cost / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                {/* 🔥 REAL-TIME STATUS */}
                <div className="flex items-center justify-between p-2 bg-[#15151f] rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      source.integration.syncStatus === 'success' ? 'bg-green-400' :
                      source.integration.syncStatus === 'syncing' ? 'bg-blue-400 animate-pulse' :
                      source.integration.syncStatus === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-xs text-[#a0a0b8]">
                      {source.integration.syncStatus === 'syncing' ? 'Syncing...' : 
                       source.integration.syncStatus === 'success' ? 'Connected' :
                       source.integration.syncStatus === 'failed' ? 'Error' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-xs text-[#a0a0b8]">
                    {(source.integration.dataVolume / 1e6).toFixed(1)}M points
                  </div>
                </div>

                {/* 🧠 AI INSIGHTS PREVIEW */}
                {source.insights.length > 0 && (
                  <div className="p-2 bg-[#00bbff]/10 rounded border border-[#00bbff]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-3 w-3 text-[#00bbff]" />
                      <span className="text-xs text-[#00bbff] font-medium">Latest Insight</span>
                    </div>
                    <p className="text-xs text-white line-clamp-2">{source.insights[0].title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge className="bg-[#00bbff]/20 text-[#00bbff] text-xs">
                        {source.insights[0].confidence.toFixed(0)}% confidence
                      </Badge>
                      <span className="text-xs text-[#a0a0b8]">{source.insights[0].timeframe}</span>
                    </div>
                  </div>
                )}

                {/* 🎯 ACTION BUTTONS */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Configure ${source.name}`)
                      window.alert(`🔧 Opening configuration for ${source.name}`)
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Sync ${source.name}`)
                      window.alert(`🔄 Syncing ${source.name}...`)
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`View insights for ${source.name}`)
                      window.alert(`🧠 Opening AI insights for ${source.name}`)
                    }}
                    size="sm"
                    className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                  >
                    <Brain className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 🚀 SELECTED SOURCE DETAILS */}
      {selectedSource && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-white text-xl">{selectedSource.name}</CardTitle>
                <Badge className={`${getStatusColor(selectedSource.status)} text-white`}>
                  {selectedSource.status.toUpperCase()}
                </Badge>
                <Badge className={`${getQualityColor(selectedSource.quality)} bg-transparent border-current`}>
                  {selectedSource.quality.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    console.log(`Generate insights for ${selectedSource.name}`)
                    window.alert(`🧠 Generating AI insights for ${selectedSource.name}...`)
                  }}
                  className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 bg-[#15151f]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="correlations">Correlations</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Data Source Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-[#a0a0b8]">Description</label>
                        <p className="text-white mt-1">{selectedSource.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Provider</label>
                          <p className="text-white mt-1">{selectedSource.provider}</p>
                        </div>
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Category</label>
                          <p className="text-white mt-1 capitalize">{selectedSource.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Update Frequency</label>
                          <p className="text-white mt-1 capitalize">{selectedSource.updateFrequency.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Historical Depth</label>
                          <p className="text-white mt-1">{selectedSource.historicalDepth}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Key Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSource.features.map(feature => (
                        <Badge key={feature} variant="outline" className="border-[#2a2a3e] text-[#a0a0b8]">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white">Coverage Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSource.coverage.map(area => (
                        <Badge key={area} className="bg-[#00bbff]/20 text-[#00bbff] border-[#00bbff]/30">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">AI-Generated Insights</h3>
                  <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                    {selectedSource.insights.length} insights
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {selectedSource.insights.map(insight => (
                    <Card key={insight.id} className="bg-[#15151f] border-[#2a2a3e]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              insight.type === 'trend' ? 'bg-blue-500/20 text-blue-400' :
                              insight.type === 'anomaly' ? 'bg-red-500/20 text-red-400' :
                              insight.type === 'prediction' ? 'bg-purple-500/20 text-purple-400' :
                              insight.type === 'alert' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {insight.type.toUpperCase()}
                            </Badge>
                            <Badge className={`${
                              insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                              insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {insight.impact.toUpperCase()} IMPACT
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[#a0a0b8]">Confidence</div>
                            <div className="text-lg font-bold text-[#00bbff]">{insight.confidence.toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                        <p className="text-[#a0a0b8] mb-3">{insight.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {insight.relatedAssets.map(asset => (
                              <Badge key={asset} variant="outline" className="text-xs border-[#2a2a3e] text-[#a0a0b8]">
                                {asset}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-[#a0a0b8]">{insight.timeframe}</div>
                        </div>
                        
                        {insight.actionable && (
                          <Button
                            onClick={() => {
                              console.log(`Act on insight: ${insight.title}`)
                              window.alert(`Taking action on: ${insight.title}`)
                            }}
                            size="sm"
                            className="mt-3 bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                          >
                            Take Action
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="correlations" className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-white">Asset Correlations</h3>
                
                <div className="space-y-4">
                  {selectedSource.correlations.map(corr => (
                    <div key={corr.id} className="bg-[#15151f] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-[#00bbff]/20 text-[#00bbff]">{corr.asset}</Badge>
                          <Badge className={`${
                            corr.strength === 'strong' ? 'bg-green-500/20 text-green-400' :
                            corr.strength === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {corr.strength.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#a0a0b8]">Correlation</div>
                          <div className={`text-lg font-bold ${corr.correlation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#a0a0b8]">Significance: {(corr.significance * 100).toFixed(1)}%</span>
                        <span className="text-[#a0a0b8]">Timeframe: {corr.timeframe}</span>
                      </div>
                      
                      <div className="mt-2">
                        <Progress 
                          value={Math.abs(corr.correlation) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedSource.performance).map(([key, value]) => (
                    <div key={key} className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className={`text-lg font-bold ${
                        key.includes('uptime') || key.includes('accuracy') || key.includes('quality') 
                          ? 'text-green-400'
                          : key.includes('error') || key.includes('latency')
                          ? 'text-red-400'
                          : 'text-[#00bbff]'
                      }`}>
                        {typeof value === 'number' ? 
                          (key.includes('uptime') || key.includes('accuracy') || key.includes('quality') || key.includes('error') ? 
                            `${value.toFixed(1)}%` : 
                            key.includes('latency') ?
                            `${value.toFixed(0)}ms` :
                            value.toFixed(1)
                          ) : value
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                  <Badge className={selectedSource.alerts.length > 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>
                    {selectedSource.alerts.length} alerts
                  </Badge>
                </div>
                
                {selectedSource.alerts.length > 0 ? (
                  <div className="space-y-4">
                    {selectedSource.alerts.map(alert => (
                      <Card key={alert.id} className="bg-[#15151f] border-[#2a2a3e]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                                {alert.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {!alert.acknowledged && (
                                <Button
                                  onClick={() => {
                                    console.log('Acknowledge alert clicked')
                                    window.alert('Alert acknowledged and marked as reviewed.')
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-[#00bbff]/30 text-[#00bbff] bg-transparent"
                                >
                                  Acknowledge
                                </Button>
                              )}
                              <Button
                                onClick={() => {
                                  console.log('Take action clicked')
                                  window.alert('Opening alert action panel...')
                                }}
                                size="sm"
                                variant="outline"
                                className="text-xs border-red-500/30 text-red-400 bg-transparent"
                              >
                                Take Action
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-white mb-2">{alert.message}</p>
                          <div className="text-sm text-[#a0a0b8]">
                            Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#15151f] rounded-lg p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-[#a0a0b8]">No active alerts for this data source</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="integration" className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-white">Integration Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#a0a0b8]">Connection Status</span>
                        <Badge className={selectedSource.integration.connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {selectedSource.integration.connected ? "CONNECTED" : "DISCONNECTED"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-[#a0a0b8] mb-2">Sync Status</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedSource.integration.syncStatus === 'success' ? 'bg-green-400' :
                          selectedSource.integration.syncStatus === 'syncing' ? 'bg-blue-400 animate-pulse' :
                          selectedSource.integration.syncStatus === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                        }`} />
                        <span className="text-white capitalize">{selectedSource.integration.syncStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-[#a0a0b8] mb-2">Last Sync</div>
                      <div className="text-white">{new Date(selectedSource.integration.lastSync).toLocaleString()}</div>
                    </div>
                    
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-[#a0a0b8] mb-2">Data Volume</div>
                      <div className="text-white">{(selectedSource.integration.dataVolume / 1e6).toFixed(1)}M points</div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    console.log('Test connection clicked')
                    window.alert('Testing connection to data source...')
                  }}
                  className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 🤖 AI PROCESSORS PANEL */}
      {showAIProcessors && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">AI Data Processors</CardTitle>
              <Button
                onClick={() => setShowAIProcessors(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AI_PROCESSORS.map(processor => (
                <Card key={processor.id} className="bg-[#15151f] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">{processor.name}</h4>
                      <Badge className={processor.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                        {processor.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8] text-sm">Accuracy</span>
                        <span className="text-green-400 font-medium">{processor.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8] text-sm">Speed</span>
                        <span className="text-blue-400 font-medium">{(processor.processingSpeed / 1000).toFixed(0)}K/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8] text-sm">Insights</span>
                        <span className="text-purple-400 font-medium">{(processor.insights / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
