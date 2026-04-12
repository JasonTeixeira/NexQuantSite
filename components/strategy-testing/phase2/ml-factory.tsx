"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  CheckCircle
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
  Area
} from "recharts"

interface MLModel {
  id: string
  name: string
  type: "classification" | "regression" | "ensemble"
  status: "training" | "completed" | "failed"
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainTime: number
}

interface Feature {
  name: string
  importance: number
  correlation: number
  pValue: number
  category: "technical" | "fundamental" | "alternative" | "macro"
}

interface ModelPerformance {
  date: string
  prediction: number
  actual: number
  error: number
  confidence: number
}

interface EnsembleModel {
  name: string
  weight: number
  performance: number
  contribution: number
}

export function MLFactory() {
  const [activeModel, setActiveModel] = useState("random_forest")
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [models, setModels] = useState<MLModel[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([])
  const [ensembleModels, setEnsembleModels] = useState<EnsembleModel[]>([])

  // Model templates
  const [modelTemplates] = useState([
    {
      id: "random_forest",
      name: "Random Forest",
      description: "Ensemble of decision trees with feature bagging",
      type: "ensemble",
      complexity: "Medium",
      interpretability: "High",
      speed: "Fast"
    },
    {
      id: "xgboost",
      name: "XGBoost",
      description: "Gradient boosting with advanced regularization",
      type: "ensemble", 
      complexity: "High",
      interpretability: "Medium",
      speed: "Medium"
    },
    {
      id: "lstm",
      name: "LSTM Neural Network",
      description: "Long Short-Term Memory for sequence prediction",
      type: "neural_network",
      complexity: "Very High",
      interpretability: "Low",
      speed: "Slow"
    },
    {
      id: "svm",
      name: "Support Vector Machine",
      description: "Kernel-based classification and regression",
      type: "kernel",
      complexity: "Medium",
      interpretability: "Low",
      speed: "Medium"
    },
    {
      id: "transformer",
      name: "Transformer",
      description: "Attention-based model for complex patterns",
      type: "neural_network",
      complexity: "Very High",
      interpretability: "Very Low",
      speed: "Very Slow"
    }
  ])

  // Feature categories
  const [featureCategories] = useState([
    {
      name: "Technical Indicators",
      count: 45,
      examples: ["RSI", "MACD", "Bollinger Bands", "ATR"]
    },
    {
      name: "Price Patterns",
      count: 28,
      examples: ["Candlestick Patterns", "Chart Patterns", "Support/Resistance"]
    },
    {
      name: "Volume Analysis",
      count: 18,
      examples: ["Volume Profile", "OBV", "Accumulation/Distribution"]
    },
    {
      name: "Fundamental Data",
      count: 35,
      examples: ["P/E Ratio", "Revenue Growth", "Debt/Equity", "ROE"]
    },
    {
      name: "Alternative Data",
      count: 22,
      examples: ["News Sentiment", "Social Media", "Satellite Data", "Web Traffic"]
    },
    {
      name: "Macro Factors",
      count: 15,
      examples: ["Interest Rates", "VIX", "Dollar Index", "Commodity Prices"]
    }
  ])

  // Mock data initialization
  useEffect(() => {
    const mockModels: MLModel[] = [
      {
        id: "rf_001",
        name: "Random Forest v1.2",
        type: "ensemble",
        status: "completed",
        accuracy: 0.847,
        precision: 0.823,
        recall: 0.871,
        f1Score: 0.846,
        trainTime: 45
      },
      {
        id: "xgb_001", 
        name: "XGBoost v2.1",
        type: "ensemble",
        status: "completed",
        accuracy: 0.892,
        precision: 0.885,
        recall: 0.898,
        f1Score: 0.891,
        trainTime: 128
      },
      {
        id: "lstm_001",
        name: "LSTM v1.0",
        type: "regression",
        status: "training",
        accuracy: 0.0,
        precision: 0.0,
        recall: 0.0,
        f1Score: 0.0,
        trainTime: 0
      }
    ]

    const mockFeatures: Feature[] = [
      { name: "RSI_14", importance: 0.156, correlation: 0.234, pValue: 0.001, category: "technical" },
      { name: "MACD_Signal", importance: 0.143, correlation: -0.187, pValue: 0.003, category: "technical" },
      { name: "BB_Position", importance: 0.128, correlation: 0.156, pValue: 0.007, category: "technical" },
      { name: "Volume_Ratio", importance: 0.112, correlation: 0.089, pValue: 0.023, category: "technical" },
      { name: "PE_Ratio", importance: 0.098, correlation: -0.145, pValue: 0.012, category: "fundamental" },
      { name: "Revenue_Growth", importance: 0.087, correlation: 0.198, pValue: 0.005, category: "fundamental" },
      { name: "News_Sentiment", importance: 0.076, correlation: 0.123, pValue: 0.034, category: "alternative" },
      { name: "VIX_Level", importance: 0.065, correlation: -0.167, pValue: 0.018, category: "macro" },
      { name: "Dollar_Index", importance: 0.054, correlation: -0.098, pValue: 0.067, category: "macro" },
      { name: "Sector_Momentum", importance: 0.081, correlation: 0.134, pValue: 0.028, category: "technical" }
    ]

    const mockPerformance: ModelPerformance[] = []
    for (let i = 0; i < 100; i++) {
      const actual = Math.random() * 0.1 - 0.05
      const prediction = actual + (Math.random() - 0.5) * 0.02
      mockPerformance.push({
        date: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        prediction,
        actual,
        error: Math.abs(prediction - actual),
        confidence: 0.6 + Math.random() * 0.3
      })
    }

    const mockEnsemble: EnsembleModel[] = [
      { name: "XGBoost", weight: 0.35, performance: 0.892, contribution: 0.312 },
      { name: "Random Forest", weight: 0.28, performance: 0.847, contribution: 0.237 },
      { name: "LSTM", weight: 0.22, performance: 0.823, contribution: 0.181 },
      { name: "SVM", weight: 0.15, performance: 0.798, contribution: 0.120 }
    ]

    setModels(mockModels)
    setFeatures(mockFeatures)
    setModelPerformance(mockPerformance)
    setEnsembleModels(mockEnsemble)
  }, [])

  const trainModel = async () => {
    setIsTraining(true)
    setTrainingProgress(0)
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 border-green-500/30"
      case "training": return "text-yellow-400 border-yellow-500/30"
      case "failed": return "text-red-400 border-red-500/30"
      default: return "text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "training": return <Activity className="h-4 w-4" />
      case "failed": return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto" data-testid="ml-factory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-[#00bbff]" />
            <div>
              <h1 className="text-2xl font-bold text-white">ML Factory</h1>
              <p className="text-sm text-[#a0a0b8]">Machine learning model development and deployment</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                console.log('Export model clicked')
                alert('Model exported successfully! Check downloads folder.')
              }}
              variant="outline" 
              className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Model
            </Button>
            <Button onClick={trainModel} disabled={isTraining} className="bg-[#00bbff] hover:bg-[#0099cc] text-white">
              {isTraining ? (
                <>
                  <Cpu className="h-4 w-4 mr-2" />
                  Training...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Train Model
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#1a1a2e]">
            <TabsTrigger value="models" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Models
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Feature Engineering
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Training
            </TabsTrigger>
            <TabsTrigger value="validation" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Validation
            </TabsTrigger>
            <TabsTrigger value="ensemble" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Ensemble
            </TabsTrigger>
            <TabsTrigger value="deployment" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Deployment
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            {/* Model Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelTemplates.map((template) => (
                <Card key={template.id} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                        {template.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Complexity:</span>
                        <span className="text-white">{template.complexity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Interpretability:</span>
                        <span className="text-white">{template.interpretability}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Training Speed:</span>
                        <span className="text-white">{template.speed}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30">
                      Configure Model
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trained Models */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Trained Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.map((model) => (
                    <div key={model.id} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Brain className="h-5 w-5 text-[#00bbff]" />
                          <div>
                            <h4 className="font-semibold text-white">{model.name}</h4>
                            <p className="text-sm text-gray-400">Type: {model.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(model.status)}>
                            {getStatusIcon(model.status)}
                            <span className="ml-1">{model.status}</span>
                          </Badge>
                          {model.status === "training" && (
                            <div className="w-32">
                              <Progress value={trainingProgress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {model.status === "completed" && (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-green-400 font-mono">{(model.accuracy * 100).toFixed(1)}%</div>
                            <div className="text-gray-400">Accuracy</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[#00bbff] font-mono">{(model.precision * 100).toFixed(1)}%</div>
                            <div className="text-gray-400">Precision</div>
                          </div>
                          <div className="text-center">
                            <div className="text-yellow-400 font-mono">{(model.recall * 100).toFixed(1)}%</div>
                            <div className="text-gray-400">Recall</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400 font-mono">{(model.f1Score * 100).toFixed(1)}%</div>
                            <div className="text-gray-400">F1 Score</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Engineering Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Feature Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCategories.map((category, i) => (
                <Card key={i} className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                      <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                        {category.count}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.examples.map((example, j) => (
                        <div key={j} className="text-sm text-[#a0a0b8]">• {example}</div>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30">
                      Configure Features
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Importance */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Feature Importance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={features.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="importance" fill="#00bbff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Statistics */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Feature Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.slice(0, 8).map((feature, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{feature.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{feature.category}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-[#00bbff] font-mono">{(feature.importance * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-400">Importance</div>
                        </div>
                        <div>
                          <div className={`font-mono ${feature.correlation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {feature.correlation > 0 ? '+' : ''}{feature.correlation.toFixed(3)}
                          </div>
                          <div className="text-xs text-gray-400">Correlation</div>
                        </div>
                        <div>
                          <div className="font-mono text-white">{feature.pValue.toFixed(3)}</div>
                          <div className="text-xs text-gray-400">p-value</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Training Configuration */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    Training Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Model Type</label>
                      <Select defaultValue="xgboost">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="xgboost">XGBoost</SelectItem>
                          <SelectItem value="random_forest">Random Forest</SelectItem>
                          <SelectItem value="lstm">LSTM</SelectItem>
                          <SelectItem value="transformer">Transformer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Training Data Split</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Input placeholder="70" className="bg-[#15151f] border-[#2a2a3e] text-white" />
                          <div className="text-xs text-gray-400 mt-1">Train %</div>
                        </div>
                        <div>
                          <Input placeholder="20" className="bg-[#15151f] border-[#2a2a3e] text-white" />
                          <div className="text-xs text-gray-400 mt-1">Validation %</div>
                        </div>
                        <div>
                          <Input placeholder="10" className="bg-[#15151f] border-[#2a2a3e] text-white" />
                          <div className="text-xs text-gray-400 mt-1">Test %</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Cross-Validation</label>
                      <Select defaultValue="5fold">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="5fold">5-Fold CV</SelectItem>
                          <SelectItem value="10fold">10-Fold CV</SelectItem>
                          <SelectItem value="timeseries">Time Series CV</SelectItem>
                          <SelectItem value="stratified">Stratified CV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Hyperparameter Tuning</label>
                      <Select defaultValue="bayesian">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="grid">Grid Search</SelectItem>
                          <SelectItem value="random">Random Search</SelectItem>
                          <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                          <SelectItem value="optuna">Optuna</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Training Progress */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Training Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {isTraining && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Overall Progress</span>
                          <span className="text-white">{trainingProgress.toFixed(0)}%</span>
                        </div>
                        <Progress value={trainingProgress} className="h-3" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="text-sm text-gray-400 mb-1">Current Epoch</div>
                        <div className="text-xl font-mono text-white">47 / 100</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="text-sm text-gray-400 mb-1">Training Loss</div>
                        <div className="text-xl font-mono text-green-400">0.0234</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="text-sm text-gray-400 mb-1">Validation Accuracy</div>
                        <div className="text-xl font-mono text-[#00bbff]">89.2%</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="text-sm text-gray-400 mb-1">ETA</div>
                        <div className="text-xl font-mono text-white">12m 34s</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Training History */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Training History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { epoch: 1, trainLoss: 0.45, valLoss: 0.48, trainAcc: 0.62, valAcc: 0.59 },
                    { epoch: 10, trainLoss: 0.32, valLoss: 0.35, trainAcc: 0.74, valAcc: 0.71 },
                    { epoch: 20, trainLoss: 0.24, valLoss: 0.28, trainAcc: 0.82, valAcc: 0.78 },
                    { epoch: 30, trainLoss: 0.18, valLoss: 0.23, trainAcc: 0.87, valAcc: 0.84 },
                    { epoch: 40, trainLoss: 0.14, valLoss: 0.21, trainAcc: 0.91, valAcc: 0.87 },
                    { epoch: 47, trainLoss: 0.12, valLoss: 0.20, trainAcc: 0.93, valAcc: 0.89 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="epoch" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="trainLoss" stroke="#ff6b6b" name="Train Loss" />
                    <Line type="monotone" dataKey="valLoss" stroke="#ffa500" name="Val Loss" />
                    <Line type="monotone" dataKey="trainAcc" stroke="#00bbff" name="Train Acc" />
                    <Line type="monotone" dataKey="valAcc" stroke="#4ade80" name="Val Acc" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="space-y-6">
            {/* Prediction vs Actual */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Prediction vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={modelPerformance.slice(0, 50)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="actual" stroke="#888" name="Actual" />
                    <YAxis dataKey="prediction" stroke="#888" name="Prediction" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Scatter name="Predictions" data={modelPerformance.slice(0, 50)} fill="#00bbff" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prediction Error Distribution */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Error Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { range: "<-0.02", count: 5 },
                      { range: "-0.02 to -0.01", count: 12 },
                      { range: "-0.01 to 0", count: 28 },
                      { range: "0 to 0.01", count: 35 },
                      { range: "0.01 to 0.02", count: 15 },
                      { range: ">0.02", count: 5 }
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

              {/* Model Metrics */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Validation Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">RMSE</div>
                        <div className="text-xl font-mono text-white">0.0156</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">MAE</div>
                        <div className="text-xl font-mono text-white">0.0123</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">R²</div>
                        <div className="text-xl font-mono text-green-400">0.847</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Directional Accuracy</div>
                        <div className="text-xl font-mono text-[#00bbff]">73.2%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ensemble Tab */}
          <TabsContent value="ensemble" className="space-y-6">
            {/* Ensemble Composition */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <GitBranch className="h-5 w-5 mr-2" />
                  Ensemble Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ensembleModels.map((model, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{model.name}</div>
                        <div className="text-sm text-gray-400">Performance: {(model.performance * 100).toFixed(1)}%</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-[#00bbff] font-mono">{(model.weight * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-400">Weight</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-mono">{(model.contribution * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-400">Contribution</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ensemble Performance */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Ensemble Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ensembleModels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a2e",
                          border: "1px solid #2a2a3e",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="performance" fill="#00bbff" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ensemble Configuration */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Ensemble Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Ensemble Method</label>
                      <Select defaultValue="weighted">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="weighted">Weighted Average</SelectItem>
                          <SelectItem value="voting">Majority Voting</SelectItem>
                          <SelectItem value="stacking">Stacking</SelectItem>
                          <SelectItem value="blending">Blending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Weight Optimization</label>
                      <Select defaultValue="performance">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="performance">Performance Based</SelectItem>
                          <SelectItem value="diversity">Diversity Based</SelectItem>
                          <SelectItem value="sharpe">Sharpe Ratio</SelectItem>
                          <SelectItem value="custom">Custom Weights</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="text-sm text-gray-400 mb-2">Ensemble Metrics</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white">Accuracy:</span>
                          <span className="text-green-400">91.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">Diversity Score:</span>
                          <span className="text-[#00bbff]">0.73</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">Stability:</span>
                          <span className="text-yellow-400">0.89</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white">
                      Optimize Ensemble
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Deployment */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Model Deployment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Deployment Environment</label>
                      <Select defaultValue="production">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Prediction Frequency</label>
                      <Select defaultValue="realtime">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="1min">Every Minute</SelectItem>
                          <SelectItem value="5min">Every 5 Minutes</SelectItem>
                          <SelectItem value="1hour">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Model Status</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        console.log('Deploy model clicked')
                        alert('Model deployed to production! Live trading enabled.')
                      }}
                      className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white"
                    >
                      Deploy Model
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Model Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Predictions/Hour</div>
                        <div className="text-xl font-mono text-white">1,247</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Avg Latency</div>
                        <div className="text-xl font-mono text-green-400">23ms</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Model Drift</div>
                        <div className="text-xl font-mono text-yellow-400">0.12</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Accuracy (24h)</div>
                        <div className="text-xl font-mono text-[#00bbff]">87.3%</div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center text-yellow-400 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Model drift detected - consider retraining
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Monitoring */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Live Performance Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={modelPerformance.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidence"
                      stackId="1"
                      stroke="#fbbf24"
                      fill="#fbbf24"
                      fillOpacity={0.3}
                    />
                    <Line type="monotone" dataKey="prediction" stroke="#00bbff" name="Prediction" />
                    <Line type="monotone" dataKey="actual" stroke="#4ade80" name="Actual" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
