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
  Brain, 
  Cpu, 
  Database, 
  GitBranch, 
  Play, 
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Pause,
  Square,
  RotateCcw,
  Save,
  Upload,
  Share,
  Settings,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Minus,
  X,
  Search,
  Filter,
  RefreshCw,
  Monitor,
  Server,
  Cloud,
  Shield,
  Lock,
  Unlock,
  Key,
  Network,
  Router,
  HardDrive,
  MemoryStick,
  Gauge,
  Thermometer,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Star,
  Heart,
  Bookmark,
  Tag,
  Calendar,
  Clock,
  Timer,
  Hourglass,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Layers,
  Grid,
  List,
  Table,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  ScatterChart as ScatterChartIcon,
  TrendingUpIcon,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box,
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
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Award,
  Medal,
  Trophy,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Map,
  Globe,
  Building,
  Factory,
  Store,
  Home,
  Car,
  Truck,
  Ship,
  Train,
  Plane,
  Fuel,
  Droplets,
  Leaf,
  TreePine,
  Mountain,
  Waves,
  Wind,
  CloudRain,
  CloudSnow,
  Umbrella,
  Rainbow
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
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  AreaChart,
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
interface InstitutionalMLModel {
  id: string
  name: string
  type: 'lstm' | 'transformer' | 'ensemble' | 'cnn' | 'rnn' | 'gru' | 'attention' | 'bert' | 'gpt' | 'xgboost' | 'lightgbm' | 'catboost' | 'random_forest' | 'svm' | 'neural_network' | 'automl'
  category: 'time_series' | 'nlp' | 'computer_vision' | 'tabular' | 'reinforcement_learning' | 'generative' | 'ensemble' | 'deep_learning'
  status: 'training' | 'completed' | 'deployed' | 'failed' | 'paused' | 'optimizing' | 'validating' | 'testing'
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  sharpeRatio?: number
  maxDrawdown?: number
  winRate?: number
  profitFactor?: number
  trainingTime: number
  inferenceTime: number
  modelSize: number
  complexity: 'low' | 'medium' | 'high' | 'very_high'
  framework: 'tensorflow' | 'pytorch' | 'scikit_learn' | 'xgboost' | 'lightgbm' | 'catboost' | 'h2o' | 'auto_sklearn' | 'optuna'
  version: string
  created: string
  lastTrained: string
  author: string
  description: string
  features: string[]
  hyperparameters: Record<string, any>
  trainingData: {
    samples: number
    features: number
    timeRange: string
    quality: number
  }
  validation: {
    method: 'cross_validation' | 'time_series_split' | 'holdout' | 'walk_forward'
    folds: number
    testSize: number
    results: ValidationResult[]
  }
  deployment: {
    environment: 'development' | 'staging' | 'production'
    endpoint: string
    instances: number
    latency: number
    throughput: number
    uptime: number
    lastDeployed: string
  }
  monitoring: {
    drift: number
    performance: number
    errors: number
    alerts: ModelAlert[]
  }
  backtesting?: {
    startDate: string
    endDate: string
    initialCapital: number
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    trades: number
  }
}

interface ValidationResult {
  fold: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
}

interface ModelAlert {
  id: string
  type: 'drift' | 'performance' | 'error' | 'latency' | 'memory'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
}

interface AutoMLPipeline {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  modelsGenerated: number
  bestModel: string
  bestScore: number
  timeRemaining: number
  configuration: {
    algorithms: string[]
    maxTime: number
    maxModels: number
    metric: string
    crossValidation: number
  }
  results: AutoMLResult[]
}

interface AutoMLResult {
  modelId: string
  algorithm: string
  score: number
  trainingTime: number
  hyperparameters: Record<string, any>
}

interface ModelExperiment {
  id: string
  name: string
  description: string
  models: string[]
  status: 'running' | 'completed' | 'failed'
  results: ExperimentResult[]
  bestModel: string
  created: string
  author: string
}

interface ExperimentResult {
  modelId: string
  metrics: Record<string, number>
  parameters: Record<string, any>
  artifacts: string[]
}

// 🎯 WORLD CLASS ML MODELS
const INSTITUTIONAL_ML_MODELS: InstitutionalMLModel[] = [
  {
    id: 'lstm_price_predictor',
    name: 'LSTM Price Prediction Engine',
    type: 'lstm',
    category: 'time_series',
    status: 'deployed',
    accuracy: 87.3,
    precision: 89.1,
    recall: 85.7,
    f1Score: 87.4,
    auc: 0.923,
    sharpeRatio: 2.8,
    maxDrawdown: -8.2,
    winRate: 68.4,
    profitFactor: 2.3,
    trainingTime: 3600,
    inferenceTime: 12,
    modelSize: 45.7,
    complexity: 'high',
    framework: 'tensorflow',
    version: '2.1.0',
    created: '2024-11-15',
    lastTrained: '2024-12-30',
    author: 'ML Team',
    description: 'Advanced LSTM network for multi-timeframe price prediction with attention mechanism',
    features: ['Price History', 'Volume', 'Technical Indicators', 'Market Sentiment', 'Economic Data'],
    hyperparameters: {
      layers: 3,
      units: 128,
      dropout: 0.2,
      learning_rate: 0.001,
      batch_size: 64,
      sequence_length: 60
    },
    trainingData: {
      samples: 2500000,
      features: 47,
      timeRange: '5 years',
      quality: 94.2
    },
    validation: {
      method: 'time_series_split',
      folds: 5,
      testSize: 0.2,
      results: [
        { fold: 1, accuracy: 86.8, precision: 88.3, recall: 85.1, f1Score: 86.7, auc: 0.918 },
        { fold: 2, accuracy: 87.9, precision: 89.7, recall: 86.2, f1Score: 87.9, auc: 0.925 },
        { fold: 3, accuracy: 87.1, precision: 88.9, recall: 85.4, f1Score: 87.1, auc: 0.921 },
        { fold: 4, accuracy: 87.6, precision: 89.2, recall: 86.0, f1Score: 87.6, auc: 0.924 },
        { fold: 5, accuracy: 87.2, precision: 89.4, recall: 85.3, f1Score: 87.3, auc: 0.922 }
      ]
    },
    deployment: {
      environment: 'production',
      endpoint: 'https://api.ml.quantterminal.com/lstm/predict',
      instances: 3,
      latency: 12,
      throughput: 8500,
      uptime: 99.7,
      lastDeployed: '2024-12-30T10:00:00Z'
    },
    monitoring: {
      drift: 2.3,
      performance: 96.8,
      errors: 0.3,
      alerts: []
    },
    backtesting: {
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      totalReturn: 34.7,
      sharpeRatio: 2.8,
      maxDrawdown: -8.2,
      winRate: 68.4,
      trades: 1247
    }
  },
  {
    id: 'transformer_sentiment',
    name: 'Transformer Sentiment Analyzer',
    type: 'transformer',
    category: 'nlp',
    status: 'deployed',
    accuracy: 92.6,
    precision: 94.1,
    recall: 91.2,
    f1Score: 92.6,
    auc: 0.967,
    trainingTime: 7200,
    inferenceTime: 8,
    modelSize: 127.3,
    complexity: 'very_high',
    framework: 'pytorch',
    version: '1.8.2',
    created: '2024-10-20',
    lastTrained: '2024-12-29',
    author: 'NLP Team',
    description: 'State-of-the-art transformer model for financial sentiment analysis with market context',
    features: ['Text Content', 'Author Influence', 'Engagement Metrics', 'Market Context', 'Historical Sentiment'],
    hyperparameters: {
      model_name: 'finbert-large',
      max_length: 512,
      learning_rate: 2e-5,
      batch_size: 16,
      epochs: 10,
      warmup_steps: 1000
    },
    trainingData: {
      samples: 5000000,
      features: 768,
      timeRange: '3 years',
      quality: 96.8
    },
    validation: {
      method: 'cross_validation',
      folds: 5,
      testSize: 0.15,
      results: [
        { fold: 1, accuracy: 92.3, precision: 93.8, recall: 90.9, f1Score: 92.3, auc: 0.964 },
        { fold: 2, accuracy: 92.9, precision: 94.4, recall: 91.5, f1Score: 92.9, auc: 0.969 },
        { fold: 3, accuracy: 92.4, precision: 93.9, recall: 91.0, f1Score: 92.4, auc: 0.965 },
        { fold: 4, accuracy: 92.8, precision: 94.3, recall: 91.4, f1Score: 92.8, auc: 0.968 },
        { fold: 5, accuracy: 92.6, precision: 94.1, recall: 91.2, f1Score: 92.6, auc: 0.967 }
      ]
    },
    deployment: {
      environment: 'production',
      endpoint: 'https://api.ml.quantterminal.com/sentiment/analyze',
      instances: 5,
      latency: 8,
      throughput: 12000,
      uptime: 99.9,
      lastDeployed: '2024-12-29T14:30:00Z'
    },
    monitoring: {
      drift: 1.8,
      performance: 98.2,
      errors: 0.1,
      alerts: []
    }
  },
  {
    id: 'ensemble_alpha_generator',
    name: 'Ensemble Alpha Generator',
    type: 'ensemble',
    category: 'ensemble',
    status: 'deployed',
    accuracy: 91.4,
    precision: 93.2,
    recall: 89.7,
    f1Score: 91.4,
    auc: 0.954,
    sharpeRatio: 3.4,
    maxDrawdown: -6.1,
    winRate: 72.8,
    profitFactor: 2.7,
    trainingTime: 5400,
    inferenceTime: 15,
    modelSize: 89.2,
    complexity: 'very_high',
    framework: 'scikit_learn',
    version: '3.2.1',
    created: '2024-09-10',
    lastTrained: '2024-12-28',
    author: 'Quant Team',
    description: 'Advanced ensemble combining LSTM, XGBoost, and Random Forest for alpha generation',
    features: ['Technical Indicators', 'Fundamental Data', 'Alternative Data', 'Market Microstructure', 'Sentiment'],
    hyperparameters: {
      base_models: ['lstm', 'xgboost', 'random_forest', 'lightgbm'],
      meta_learner: 'linear_regression',
      cv_folds: 5,
      stacking_method: 'blending',
      weights: [0.3, 0.25, 0.25, 0.2]
    },
    trainingData: {
      samples: 3200000,
      features: 156,
      timeRange: '7 years',
      quality: 95.7
    },
    validation: {
      method: 'walk_forward',
      folds: 10,
      testSize: 0.1,
      results: [
        { fold: 1, accuracy: 90.8, precision: 92.6, recall: 89.1, f1Score: 90.8, auc: 0.948 },
        { fold: 2, accuracy: 91.7, precision: 93.5, recall: 90.0, f1Score: 91.7, auc: 0.957 },
        { fold: 3, accuracy: 91.2, precision: 93.0, recall: 89.5, f1Score: 91.2, auc: 0.952 },
        { fold: 4, accuracy: 91.9, precision: 93.7, recall: 90.2, f1Score: 91.9, auc: 0.959 },
        { fold: 5, accuracy: 91.4, precision: 93.2, recall: 89.7, f1Score: 91.4, auc: 0.954 }
      ]
    },
    deployment: {
      environment: 'production',
      endpoint: 'https://api.ml.quantterminal.com/ensemble/predict',
      instances: 4,
      latency: 15,
      throughput: 6800,
      uptime: 99.8,
      lastDeployed: '2024-12-28T16:45:00Z'
    },
    monitoring: {
      drift: 2.1,
      performance: 97.3,
      errors: 0.2,
      alerts: [
        {
          id: '1',
          type: 'drift',
          severity: 'medium',
          message: 'Feature drift detected in technical indicators',
          timestamp: '2024-12-31T08:30:00Z',
          acknowledged: false
        }
      ]
    },
    backtesting: {
      startDate: '2022-01-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      totalReturn: 42.8,
      sharpeRatio: 3.4,
      maxDrawdown: -6.1,
      winRate: 72.8,
      trades: 2156
    }
  },
  {
    id: 'reinforcement_trader',
    name: 'RL Trading Agent',
    type: 'neural_network',
    category: 'reinforcement_learning',
    status: 'training',
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    auc: 0,
    trainingTime: 0,
    inferenceTime: 25,
    modelSize: 234.7,
    complexity: 'very_high',
    framework: 'pytorch',
    version: '0.8.1',
    created: '2024-12-25',
    lastTrained: '2024-12-31',
    author: 'RL Team',
    description: 'Deep reinforcement learning agent for autonomous trading with continuous learning',
    features: ['Market State', 'Portfolio State', 'Risk Metrics', 'Market Regime', 'Volatility Surface'],
    hyperparameters: {
      algorithm: 'PPO',
      learning_rate: 3e-4,
      batch_size: 256,
      gamma: 0.99,
      gae_lambda: 0.95,
      clip_range: 0.2,
      entropy_coef: 0.01
    },
    trainingData: {
      samples: 10000000,
      features: 89,
      timeRange: '10 years',
      quality: 97.1
    },
    validation: {
      method: 'time_series_split',
      folds: 3,
      testSize: 0.3,
      results: []
    },
    deployment: {
      environment: 'development',
      endpoint: '',
      instances: 0,
      latency: 0,
      throughput: 0,
      uptime: 0,
      lastDeployed: ''
    },
    monitoring: {
      drift: 0,
      performance: 0,
      errors: 0,
      alerts: []
    }
  },
  {
    id: 'automl_optimizer',
    name: 'AutoML Strategy Optimizer',
    type: 'automl',
    category: 'ensemble',
    status: 'completed',
    accuracy: 89.7,
    precision: 91.3,
    recall: 88.2,
    f1Score: 89.7,
    auc: 0.941,
    sharpeRatio: 2.9,
    maxDrawdown: -7.8,
    winRate: 69.2,
    profitFactor: 2.4,
    trainingTime: 14400,
    inferenceTime: 18,
    modelSize: 67.4,
    complexity: 'high',
    framework: 'h2o',
    version: '1.5.3',
    created: '2024-12-20',
    lastTrained: '2024-12-31',
    author: 'AutoML Team',
    description: 'Automated machine learning pipeline that optimizes model selection and hyperparameters',
    features: ['All Available Features', 'Feature Engineering', 'Automated Selection', 'Hyperparameter Tuning'],
    hyperparameters: {
      max_runtime_secs: 14400,
      max_models: 100,
      seed: 42,
      nfolds: 5,
      balance_classes: true,
      stopping_metric: 'AUC'
    },
    trainingData: {
      samples: 4500000,
      features: 203,
      timeRange: '8 years',
      quality: 94.8
    },
    validation: {
      method: 'cross_validation',
      folds: 5,
      testSize: 0.2,
      results: [
        { fold: 1, accuracy: 89.3, precision: 90.9, recall: 87.8, f1Score: 89.3, auc: 0.937 },
        { fold: 2, accuracy: 90.1, precision: 91.7, recall: 88.6, f1Score: 90.1, auc: 0.945 },
        { fold: 3, accuracy: 89.5, precision: 91.1, recall: 88.0, f1Score: 89.5, auc: 0.939 },
        { fold: 4, accuracy: 89.9, precision: 91.5, recall: 88.4, f1Score: 89.9, auc: 0.943 },
        { fold: 5, accuracy: 89.7, precision: 91.3, recall: 88.2, f1Score: 89.7, auc: 0.941 }
      ]
    },
    deployment: {
      environment: 'staging',
      endpoint: 'https://api.ml.quantterminal.com/automl/predict',
      instances: 2,
      latency: 18,
      throughput: 4200,
      uptime: 98.9,
      lastDeployed: '2024-12-31T12:00:00Z'
    },
    monitoring: {
      drift: 1.9,
      performance: 96.1,
      errors: 1.1,
      alerts: []
    },
    backtesting: {
      startDate: '2023-06-01',
      endDate: '2024-12-31',
      initialCapital: 1000000,
      totalReturn: 28.9,
      sharpeRatio: 2.9,
      maxDrawdown: -7.8,
      winRate: 69.2,
      trades: 1834
    }
  }
]

// 🤖 AUTOML PIPELINES
const AUTOML_PIPELINES: AutoMLPipeline[] = [
  {
    id: 'alpha_discovery',
    name: 'Alpha Discovery Pipeline',
    status: 'running',
    progress: 67,
    modelsGenerated: 47,
    bestModel: 'XGBoost_Ensemble_v23',
    bestScore: 0.923,
    timeRemaining: 2340,
    configuration: {
      algorithms: ['XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'Neural Network'],
      maxTime: 7200,
      maxModels: 100,
      metric: 'AUC',
      crossValidation: 5
    },
    results: [
      { modelId: 'xgb_v23', algorithm: 'XGBoost', score: 0.923, trainingTime: 180, hyperparameters: { max_depth: 8, learning_rate: 0.1 } },
      { modelId: 'lgb_v15', algorithm: 'LightGBM', score: 0.918, trainingTime: 120, hyperparameters: { num_leaves: 64, learning_rate: 0.05 } },
      { modelId: 'cat_v09', algorithm: 'CatBoost', score: 0.915, trainingTime: 240, hyperparameters: { depth: 6, learning_rate: 0.08 } }
    ]
  }
]

// 🔥 WORLD CLASS ML FACTORY COMPONENT
export default function WorldClassMLFactory() {
  const [models, setModels] = useState<InstitutionalMLModel[]>(INSTITUTIONAL_ML_MODELS)
  const [selectedModel, setSelectedModel] = useState<InstitutionalMLModel | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('accuracy')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'pipeline'>('grid')
  const [showAutoML, setShowAutoML] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)

  // 🎯 FILTERED AND SORTED MODELS
  const filteredModels = useMemo(() => {
    return models
      .filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            model.framework.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || model.type === filterType
        const matchesStatus = filterStatus === 'all' || model.status === filterStatus
        const matchesCategory = filterCategory === 'all' || model.category === filterCategory
        return matchesSearch && matchesType && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'accuracy':
            return b.accuracy - a.accuracy
          case 'f1Score':
            return b.f1Score - a.f1Score
          case 'sharpeRatio':
            return (b.sharpeRatio || 0) - (a.sharpeRatio || 0)
          case 'trainingTime':
            return a.trainingTime - b.trainingTime
          case 'name':
            return a.name.localeCompare(b.name)
          case 'created':
            return new Date(b.created).getTime() - new Date(a.created).getTime()
          default:
            return 0
        }
      })
  }, [models, searchQuery, filterType, filterStatus, filterCategory, sortBy])

  // 🚀 TRAINING SIMULATION
  const startTraining = useCallback(async (modelId: string) => {
    setIsTraining(true)
    setTrainingProgress(0)
    
    // Update model status
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'training' } : m
    ))
    
    // Simulate training progress
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setTrainingProgress(i)
    }
    
    // Update model with improved metrics
    setModels(prev => prev.map(m => 
      m.id === modelId 
        ? {
            ...m,
            status: 'completed',
            accuracy: Math.min(100, m.accuracy + Math.random() * 3),
            f1Score: Math.min(100, m.f1Score + Math.random() * 2),
            lastTrained: new Date().toISOString().split('T')[0]
          }
        : m
    ))
    
    setIsTraining(false)
    window.alert('🚀 Model training complete! Performance improved!')
  }, [])

  // 🎨 STATUS COLORS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'training': return 'bg-yellow-500'
      case 'optimizing': return 'bg-purple-500'
      case 'failed': return 'bg-red-500'
      case 'paused': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'very_high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'time_series': return TrendingUp
      case 'nlp': return FileText
      case 'computer_vision': return Eye
      case 'tabular': return Table
      case 'reinforcement_learning': return Brain
      case 'generative': return Sparkles
      case 'ensemble': return Layers
      case 'deep_learning': return Network
      default: return Cpu
    }
  }

  return (
    <div className="space-y-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* 🔥 WORLD CLASS HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-[#00bbff]" />
            <h1 className="text-3xl font-bold text-white">ML Factory</h1>
            <Badge className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              INSTITUTIONAL GRADE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAutoML(!showAutoML)}
            variant="outline"
            className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
          >
            <Zap className="h-4 w-4 mr-2" />
            AutoML
          </Button>
          
          <Button
            onClick={() => {
              console.log('Create new model clicked')
              window.alert('🚀 Opening model creation wizard...')
            }}
            className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Model
          </Button>
        </div>
      </div>

      {/* 📊 REAL-TIME DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Deployed Models</p>
                <p className="text-2xl font-bold text-white">
                  {models.filter(m => m.status === 'deployed').length}
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
                <p className="text-sm text-[#a0a0b8]">Avg Accuracy</p>
                <p className="text-2xl font-bold text-white">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Avg Sharpe</p>
                <p className="text-2xl font-bold text-white">
                  {(models.filter(m => m.sharpeRatio).reduce((sum, m) => sum + (m.sharpeRatio || 0), 0) / 
                    models.filter(m => m.sharpeRatio).length).toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#a0a0b8]">Training Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {models.filter(m => m.status === 'training').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-400" />
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
                  placeholder="Search models, frameworks, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#15151f] border-[#2a2a3e] text-white"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Model Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lstm">LSTM</SelectItem>
                <SelectItem value="transformer">Transformer</SelectItem>
                <SelectItem value="ensemble">Ensemble</SelectItem>
                <SelectItem value="xgboost">XGBoost</SelectItem>
                <SelectItem value="neural_network">Neural Network</SelectItem>
                <SelectItem value="automl">AutoML</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="time_series">Time Series</SelectItem>
                <SelectItem value="nlp">NLP</SelectItem>
                <SelectItem value="ensemble">Ensemble</SelectItem>
                <SelectItem value="reinforcement_learning">RL</SelectItem>
                <SelectItem value="deep_learning">Deep Learning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] bg-[#15151f] border-[#2a2a3e] text-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a25] border-[#2a2a3e]">
                <SelectItem value="accuracy">Accuracy</SelectItem>
                <SelectItem value="f1Score">F1 Score</SelectItem>
                <SelectItem value="sharpeRatio">Sharpe Ratio</SelectItem>
                <SelectItem value="trainingTime">Training Time</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created</SelectItem>
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
                variant={viewMode === 'pipeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                className="border-[#2a2a3e]"
              >
                <GitBranch className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 MODELS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModels.map((model) => {
          const CategoryIcon = getCategoryIcon(model.category)
          return (
            <Card 
              key={model.id} 
              className={`bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all duration-200 cursor-pointer ${
                selectedModel?.id === model.id ? 'ring-2 ring-[#00bbff]/50' : ''
              }`}
              onClick={() => setSelectedModel(model)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00bbff]/20 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="h-5 w-5 text-[#00bbff]" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{model.name}</CardTitle>
                      <p className="text-sm text-[#a0a0b8]">{model.framework} • v{model.version}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`} />
                    <Badge className={`${getComplexityColor(model.complexity)} bg-transparent border-current text-xs`}>
                      {model.complexity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-[#a0a0b8] text-sm line-clamp-2">{model.description}</p>
                
                {/* 📊 PERFORMANCE METRICS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#15151f] rounded p-3">
                    <div className="text-xs text-[#a0a0b8] mb-1">Accuracy</div>
                    <div className="text-lg font-bold text-green-400">
                      {model.accuracy.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-[#15151f] rounded p-3">
                    <div className="text-xs text-[#a0a0b8] mb-1">F1 Score</div>
                    <div className="text-lg font-bold text-blue-400">
                      {model.f1Score.toFixed(1)}%
                    </div>
                  </div>
                  
                  {model.sharpeRatio && (
                    <>
                      <div className="bg-[#15151f] rounded p-3">
                        <div className="text-xs text-[#a0a0b8] mb-1">Sharpe Ratio</div>
                        <div className="text-lg font-bold text-purple-400">
                          {model.sharpeRatio.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className="bg-[#15151f] rounded p-3">
                        <div className="text-xs text-[#a0a0b8] mb-1">Win Rate</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {model.winRate?.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 🚀 DEPLOYMENT STATUS */}
                {model.status === 'deployed' && (
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">Live in Production</span>
                    </div>
                    <div className="text-xs text-green-400">
                      {model.deployment.uptime}% uptime
                    </div>
                  </div>
                )}

                {/* 🔥 TRAINING STATUS */}
                {model.status === 'training' && (
                  <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-3 w-3 text-yellow-400 animate-pulse" />
                      <span className="text-yellow-400 text-sm font-medium">Training in Progress</span>
                    </div>
                    <Progress value={trainingProgress} className="h-1" />
                  </div>
                )}

                {/* 🧠 MODEL ALERTS */}
                {model.monitoring.alerts.length > 0 && (
                  <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">
                        {model.monitoring.alerts.length} alert(s)
                      </span>
                    </div>
                  </div>
                )}

                {/* 🎯 ACTION BUTTONS */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Train model: ${model.name}`)
                      startTraining(model.id)
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                    disabled={model.status === 'training' || isTraining}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {model.status === 'training' ? 'Training...' : 'Train'}
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Deploy model: ${model.name}`)
                      window.alert(`🚀 Deploying ${model.name} to production...`)
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                    disabled={model.status === 'training'}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Deploy
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log(`Monitor model: ${model.name}`)
                      window.alert(`📊 Opening monitoring dashboard for ${model.name}`)
                    }}
                    size="sm"
                    className="bg-[#00bbff]/20 text-[#00bbff] hover:bg-[#00bbff]/30"
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 🚀 SELECTED MODEL DETAILS */}
      {selectedModel && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-white text-xl">{selectedModel.name}</CardTitle>
                <Badge className={`${getStatusColor(selectedModel.status)} text-white`}>
                  {selectedModel.status.toUpperCase()}
                </Badge>
                <Badge className="bg-[#00bbff]/20 text-[#00bbff]">
                  {selectedModel.framework.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    console.log(`Optimize ${selectedModel.name}`)
                    window.alert(`🧠 Starting hyperparameter optimization for ${selectedModel.name}...`)
                  }}
                  className="bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:brightness-110"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 bg-[#15151f]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="deployment">Deployment</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="backtesting">Backtesting</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Model Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-[#a0a0b8]">Description</label>
                        <p className="text-white mt-1">{selectedModel.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Type</label>
                          <p className="text-white mt-1 capitalize">{selectedModel.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Category</label>
                          <p className="text-white mt-1 capitalize">{selectedModel.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Complexity</label>
                          <p className={`mt-1 capitalize font-medium ${getComplexityColor(selectedModel.complexity)}`}>
                            {selectedModel.complexity.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-[#a0a0b8]">Model Size</label>
                          <p className="text-white mt-1">{selectedModel.modelSize.toFixed(1)} MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Key Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedModel.features.map(feature => (
                        <Badge key={feature} variant="outline" className="border-[#2a2a3e] text-[#a0a0b8]">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white">Hyperparameters</h3>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <pre className="text-sm text-[#a0a0b8] overflow-x-auto">
                        {JSON.stringify(selectedModel.hyperparameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Accuracy</div>
                    <div className="text-2xl font-bold text-green-400">
                      {selectedModel.accuracy.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Precision</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedModel.precision.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Recall</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {selectedModel.recall.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">F1 Score</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {selectedModel.f1Score.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">AUC</div>
                    <div className="text-2xl font-bold text-[#00bbff]">
                      {selectedModel.auc.toFixed(3)}
                    </div>
                  </div>
                  {selectedModel.sharpeRatio && (
                    <>
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Sharpe Ratio</div>
                        <div className="text-2xl font-bold text-green-400">
                          {selectedModel.sharpeRatio.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Max Drawdown</div>
                        <div className="text-2xl font-bold text-red-400">
                          {selectedModel.maxDrawdown?.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-[#15151f] rounded-lg p-4">
                        <div className="text-sm text-[#a0a0b8] mb-2">Win Rate</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {selectedModel.winRate?.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Cross-Validation Results */}
                <div className="bg-[#15151f] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Cross-Validation Results</h3>
                  <div className="space-y-3">
                    {selectedModel.validation.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a25] rounded">
                        <span className="text-[#a0a0b8]">Fold {result.fold}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-400">Acc: {result.accuracy.toFixed(1)}%</span>
                          <span className="text-blue-400">Prec: {result.precision.toFixed(1)}%</span>
                          <span className="text-purple-400">Rec: {result.recall.toFixed(1)}%</span>
                          <span className="text-yellow-400">F1: {result.f1Score.toFixed(1)}%</span>
                          <span className="text-[#00bbff]">AUC: {result.auc.toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="training" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Training Configuration</h3>
                    <div className="bg-[#15151f] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Training Samples</span>
                        <span className="text-white">{selectedModel.trainingData.samples.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Features</span>
                        <span className="text-white">{selectedModel.trainingData.features}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Time Range</span>
                        <span className="text-white">{selectedModel.trainingData.timeRange}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Data Quality</span>
                        <span className="text-green-400">{selectedModel.trainingData.quality.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Training Metrics</h3>
                    <div className="bg-[#15151f] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Training Time</span>
                        <span className="text-white">{(selectedModel.trainingTime / 60).toFixed(0)} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Inference Time</span>
                        <span className="text-white">{selectedModel.inferenceTime} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Last Trained</span>
                        <span className="text-white">{selectedModel.lastTrained}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Framework</span>
                        <span className="text-[#00bbff]">{selectedModel.framework}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => startTraining(selectedModel.id)}
                  disabled={selectedModel.status === 'training' || isTraining}
                  className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {selectedModel.status === 'training' ? 'Training in Progress...' : 'Start Training'}
                </Button>
              </TabsContent>

              <TabsContent value="deployment" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Deployment Status</h3>
                    <div className="bg-[#15151f] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Environment</span>
                        <Badge className={selectedModel.deployment.environment === 'production' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {selectedModel.deployment.environment.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Instances</span>
                        <span className="text-white">{selectedModel.deployment.instances}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Uptime</span>
                        <span className="text-green-400">{selectedModel.deployment.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Last Deployed</span>
                        <span className="text-white">
                          {selectedModel.deployment.lastDeployed ? 
                            new Date(selectedModel.deployment.lastDeployed).toLocaleDateString() : 
                            'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
                    <div className="bg-[#15151f] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Latency</span>
                        <span className="text-white">{selectedModel.deployment.latency} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Throughput</span>
                        <span className="text-white">{selectedModel.deployment.throughput.toLocaleString()} req/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0a0b8]">Endpoint</span>
                        <span className="text-[#00bbff] text-xs break-all">
                          {selectedModel.deployment.endpoint || 'Not deployed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      console.log(`Deploy ${selectedModel.name}`)
                      window.alert(`🚀 Deploying ${selectedModel.name} to production...`)
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Deploy to Production
                  </Button>
                  
                  <Button
                    onClick={() => {
                      console.log(`Test ${selectedModel.name}`)
                      window.alert(`🧪 Running deployment tests for ${selectedModel.name}...`)
                    }}
                    variant="outline"
                    className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Deployment
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Drift Score</div>
                    <div className={`text-2xl font-bold ${selectedModel.monitoring.drift < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedModel.monitoring.drift.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Performance</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedModel.monitoring.performance.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Error Rate</div>
                    <div className={`text-2xl font-bold ${selectedModel.monitoring.errors < 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedModel.monitoring.errors.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#15151f] rounded-lg p-4">
                    <div className="text-sm text-[#a0a0b8] mb-2">Active Alerts</div>
                    <div className={`text-2xl font-bold ${selectedModel.monitoring.alerts.length === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedModel.monitoring.alerts.length}
                    </div>
                  </div>
                </div>
                
                {/* Alerts */}
                {selectedModel.monitoring.alerts.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                    {selectedModel.monitoring.alerts.map(alert => (
                      <Card key={alert.id} className="bg-[#15151f] border-[#2a2a3e]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
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
                          </div>
                          <p className="text-white mb-2">{alert.message}</p>
                          <div className="text-sm text-[#a0a0b8]">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#15151f] rounded-lg p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-[#a0a0b8]">No active alerts for this model</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="backtesting" className="space-y-6 mt-6">
                {selectedModel.backtesting ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Total Return</div>
                      <div className={`text-2xl font-bold ${selectedModel.backtesting.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedModel.backtesting.totalReturn > 0 ? '+' : ''}{selectedModel.backtesting.totalReturn.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Sharpe Ratio</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {selectedModel.backtesting.sharpeRatio.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Max Drawdown</div>
                      <div className="text-2xl font-bold text-red-400">
                        {selectedModel.backtesting.maxDrawdown.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Win Rate</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {selectedModel.backtesting.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Total Trades</div>
                      <div className="text-2xl font-bold text-white">
                        {selectedModel.backtesting.trades.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Initial Capital</div>
                      <div className="text-2xl font-bold text-[#00bbff]">
                        ${(selectedModel.backtesting.initialCapital / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">Start Date</div>
                      <div className="text-lg font-bold text-white">
                        {selectedModel.backtesting.startDate}
                      </div>
                    </div>
                    <div className="bg-[#15151f] rounded-lg p-4">
                      <div className="text-sm text-[#a0a0b8] mb-2">End Date</div>
                      <div className="text-lg font-bold text-white">
                        {selectedModel.backtesting.endDate}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#15151f] rounded-lg p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-[#a0a0b8] mx-auto mb-4" />
                    <p className="text-[#a0a0b8] mb-4">No backtesting results available for this model</p>
                    <Button
                      onClick={() => {
                        console.log('Run backtest clicked')
                        window.alert('🔄 Starting comprehensive backtest...')
                      }}
                      className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Backtest
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 🤖 AUTOML PIPELINE */}
      {showAutoML && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">AutoML Pipeline</CardTitle>
              <Button
                onClick={() => setShowAutoML(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {AUTOML_PIPELINES.map(pipeline => (
              <Card key={pipeline.id} className="bg-[#15151f] border-[#2a2a3e]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{pipeline.name}</h3>
                    <Badge className={pipeline.status === 'running' ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}>
                      {pipeline.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-[#a0a0b8]">Progress</div>
                      <div className="text-lg font-bold text-blue-400">{pipeline.progress}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#a0a0b8]">Models Generated</div>
                      <div className="text-lg font-bold text-white">{pipeline.modelsGenerated}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#a0a0b8]">Best Score</div>
                      <div className="text-lg font-bold text-green-400">{pipeline.bestScore.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#a0a0b8]">Time Remaining</div>
                      <div className="text-lg font-bold text-yellow-400">{Math.floor(pipeline.timeRemaining / 60)}m</div>
                    </div>
                  </div>
                  
                  <Progress value={pipeline.progress} className="mb-4" />
                  
                  <div className="space-y-2">
                    <h4 className="text-md font-semibold text-white">Top Models</h4>
                    {pipeline.results.slice(0, 3).map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#1a1a25] rounded">
                        <span className="text-[#a0a0b8]">{result.algorithm}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-400">Score: {result.score.toFixed(3)}</span>
                          <span className="text-blue-400">Time: {result.trainingTime}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
