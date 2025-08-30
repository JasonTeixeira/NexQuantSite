"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  Area,
} from "recharts"
import { Brain, TrendingUp, Target, Activity, AlertTriangle, CheckCircle, Play, RefreshCw, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  predictiveAnalyticsEngine,
  type PredictionModel,
  type Prediction,
  type TrendAnalysis,
  type UserBehaviorPrediction,
  type MarketPrediction,
} from "@/lib/predictive-analytics-engine"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

function getModelStatusColor(status: string) {
  switch (status) {
    case "ready":
      return "bg-green-500"
    case "training":
      return "bg-yellow-500"
    case "error":
      return "bg-red-500"
    case "updating":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

function getModelStatusIcon(status: string) {
  switch (status) {
    case "ready":
      return <CheckCircle className="h-4 w-4" />
    case "training":
      return <RefreshCw className="h-4 w-4 animate-spin" />
    case "error":
      return <AlertTriangle className="h-4 w-4" />
    case "updating":
      return <Upload className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "decreasing":
      return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    case "stable":
      return <Activity className="h-4 w-4 text-blue-500" />
    case "volatile":
      return <Activity className="h-4 w-4 text-yellow-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

function getDirectionColor(direction: string) {
  switch (direction) {
    case "bullish":
      return "text-green-500"
    case "bearish":
      return "text-red-500"
    case "neutral":
      return "text-gray-500"
    default:
      return "text-gray-500"
  }
}

export default function PredictiveAnalyticsDashboard() {
  const [models, setModels] = useState<PredictionModel[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [trendAnalyses, setTrendAnalyses] = useState<TrendAnalysis[]>([])
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null)
  const [modelPerformance, setModelPerformance] = useState<any>(null)
  const [predictionInsights, setPredictionInsights] = useState<any>(null)
  const [userBehaviorPrediction, setUserBehaviorPrediction] = useState<UserBehaviorPrediction | null>(null)
  const [marketPredictions, setMarketPredictions] = useState<MarketPrediction[]>([])
  const [isTraining, setIsTraining] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState("user_1")
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setModels(predictiveAnalyticsEngine.getModels())
    setPredictions(predictiveAnalyticsEngine.getPredictions())
    setTrendAnalyses(predictiveAnalyticsEngine.getTrendAnalyses())
    setModelPerformance(predictiveAnalyticsEngine.getModelPerformance())
    setPredictionInsights(predictiveAnalyticsEngine.getPredictionInsights())

    // Load user behavior prediction
    setUserBehaviorPrediction(predictiveAnalyticsEngine.predictUserBehavior(selectedUserId))

    // Load market predictions for different symbols
    const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "DOTUSDT", "LINKUSDT"]
    const predictions = symbols.map((symbol) => predictiveAnalyticsEngine.predictMarket(symbol, "1d"))
    setMarketPredictions(predictions)
  }

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(modelId)
    try {
      await predictiveAnalyticsEngine.trainModel(modelId)
      loadData()
    } finally {
      setIsTraining(null)
    }
  }

  const handleMakePrediction = (modelId: string) => {
    const sampleInput = {
      user_id: "user_123",
      login_frequency: Math.random() * 30,
      trading_volume: Math.random() * 100000,
      support_tickets: Math.floor(Math.random() * 5),
    }

    predictiveAnalyticsEngine.makePrediction(modelId, sampleInput)
    loadData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground">AI-powered insights and forecasting models</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {modelPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modelPerformance.totalModels}</div>
              <p className="text-xs text-muted-foreground">{modelPerformance.activeModels} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(modelPerformance.averageAccuracy * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all models</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modelPerformance.totalPredictions}</div>
              <p className="text-xs text-muted-foreground">{modelPerformance.recentPredictions} in last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {predictionInsights ? (predictionInsights.accuracy * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Real-world validation</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="market">Market Predictions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {models.map((model) => (
              <Card
                key={model.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedModel(model)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        <Badge variant="outline" className={`${getModelStatusColor(model.status)} text-white`}>
                          {getModelStatusIcon(model.status)}
                          {model.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {model.type.replace("_", " ").toUpperCase()} • Accuracy: {(model.accuracy * 100).toFixed(1)}%
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMakePrediction(model.id)
                        }}
                        disabled={model.status !== "ready"}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Predict
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrainModel(model.id)
                        }}
                        disabled={isTraining === model.id}
                      >
                        {isTraining === model.id ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Retrain
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Accuracy</div>
                      <div className="text-muted-foreground">{(model.accuracy * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Precision</div>
                      <div className="text-muted-foreground">{(model.metrics.precision * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Recall</div>
                      <div className="text-muted-foreground">{(model.metrics.recall * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">F1 Score</div>
                      <div className="text-muted-foreground">{(model.metrics.f1Score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Model Performance</span>
                      <span>{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={model.accuracy * 100} className="h-2" />
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Features: {model.features.join(", ")} • Target: {model.target} • Last trained:{" "}
                    {model.lastTrained.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Predictions</h3>
            <Select
              onValueChange={(value) => {
                if (value === "all") {
                  setPredictions(predictiveAnalyticsEngine.getPredictions())
                } else {
                  setPredictions(predictiveAnalyticsEngine.getPredictions(value))
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {predictions.slice(0, 20).map((prediction) => {
              const model = models.find((m) => m.id === prediction.modelId)
              return (
                <Card key={prediction.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{model?.name || "Unknown Model"}</CardTitle>
                        <CardDescription>
                          Prediction ID: {prediction.id} • {prediction.timestamp.toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Confidence: {(prediction.confidence * 100).toFixed(1)}%
                        </div>
                        <Progress value={prediction.confidence * 100} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Input</div>
                        <div className="text-xs space-y-1">
                          {Object.entries(prediction.input).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span>{typeof value === "number" ? value.toFixed(2) : value.toString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Output</div>
                        <div className="text-lg font-bold">
                          {typeof prediction.output === "boolean"
                            ? prediction.output
                              ? "True"
                              : "False"
                            : prediction.output.toFixed(4)}
                        </div>
                        {prediction.actualOutcome !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Actual:{" "}
                            {typeof prediction.actualOutcome === "boolean"
                              ? prediction.actualOutcome
                                ? "True"
                                : "False"
                              : prediction.actualOutcome.toFixed(4)}
                            <Badge
                              variant={prediction.output === prediction.actualOutcome ? "default" : "destructive"}
                              className="ml-2"
                            >
                              {prediction.output === prediction.actualOutcome ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-6">
            {trendAnalyses.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {trend.metric}
                    {getTrendIcon(trend.trend)}
                    <Badge variant="outline">
                      {trend.trend} ({(trend.strength * 100).toFixed(0)}% strength)
                    </Badge>
                  </CardTitle>
                  <CardDescription>Trend analysis with {trend.forecast.length} month forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Forecast</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart
                          data={trend.forecast.map((point) => ({
                            date: point.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                            value: point.value,
                            upperBound: point.upperBound,
                            lowerBound: point.lowerBound,
                            confidence: point.confidence * 100,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area dataKey="upperBound" stroke="none" fill="#8884d8" fillOpacity={0.1} />
                          <Area dataKey="lowerBound" stroke="none" fill="#ffffff" />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-4">Seasonality Pattern</h4>
                      {trend.seasonality ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Pattern Type</span>
                            <Badge variant="outline">{trend.seasonality.type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Strength</span>
                            <span className="text-sm">{(trend.seasonality.strength * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Peak Periods</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {trend.seasonality.peaks.map((peak, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {peak}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Trough Periods</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {trend.seasonality.troughs.map((trough, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {trough}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No clear seasonal pattern detected</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="userId">Select User ID:</Label>
            <Select
              value={selectedUserId}
              onValueChange={(value) => {
                setSelectedUserId(value)
                setUserBehaviorPrediction(predictiveAnalyticsEngine.predictUserBehavior(value))
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => (
                  <SelectItem key={i} value={`user_${i + 1}`}>
                    user_{i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userBehaviorPrediction && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Behavior Prediction</CardTitle>
                  <CardDescription>AI-powered insights for {userBehaviorPrediction.userId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">
                          {(userBehaviorPrediction.churnProbability * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Churn Risk</div>
                        <Progress value={userBehaviorPrediction.churnProbability * 100} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          ${userBehaviorPrediction.lifetimeValue.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Lifetime Value</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{userBehaviorPrediction.nextAction}</div>
                        <div className="text-sm text-muted-foreground">Predicted Next Action</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {(userBehaviorPrediction.engagementScore * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Engagement Score</div>
                        <Progress value={userBehaviorPrediction.engagementScore * 100} className="mt-2 h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors & Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Risk Factors
                      </h4>
                      {userBehaviorPrediction.riskFactors.length > 0 ? (
                        <div className="space-y-1">
                          {userBehaviorPrediction.riskFactors.map((factor, i) => (
                            <div key={i} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {factor}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No significant risk factors identified</div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        Opportunities
                      </h4>
                      {userBehaviorPrediction.opportunities.length > 0 ? (
                        <div className="space-y-1">
                          {userBehaviorPrediction.opportunities.map((opportunity, i) => (
                            <div key={i} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                              {opportunity}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No immediate opportunities identified</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="symbol">Select Trading Pair:</Label>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
                <SelectItem value="DOTUSDT">DOT/USDT</SelectItem>
                <SelectItem value="LINKUSDT">LINK/USDT</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                const newPrediction = predictiveAnalyticsEngine.predictMarket(selectedSymbol, "1d")
                setMarketPredictions((prev) => prev.map((p) => (p.symbol === selectedSymbol ? newPrediction : p)))
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Prediction
            </Button>
          </div>

          <div className="grid gap-4">
            {marketPredictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {prediction.symbol}
                        <Badge variant="outline" className={getDirectionColor(prediction.direction)}>
                          {prediction.direction.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {prediction.timeframe} timeframe • {(prediction.confidence * 100).toFixed(1)}% confidence
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Target Price</div>
                      <div className="text-lg font-bold">${prediction.targetPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-500">
                            ${prediction.targetPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Target Price</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-500">${prediction.stopLoss.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Stop Loss</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence Level</span>
                          <span>{(prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={prediction.confidence * 100} className="h-2" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">Prediction Factors</h4>
                      <div className="space-y-2">
                        {prediction.factors.map((factor, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  factor.impact === "positive"
                                    ? "bg-green-500"
                                    : factor.impact === "negative"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                                }`}
                              />
                              <span className="text-sm">{factor.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                Weight: {(factor.weight * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs">Value: {factor.value.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {modelPerformance && predictionInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Accuracy Trend</CardTitle>
                  <CardDescription>30-day accuracy performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={modelPerformance.accuracyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis domain={[0.5, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Accuracy"]}
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Prediction Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Predictions by Model</CardTitle>
                  <CardDescription>Distribution of predictions across models</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={predictionInsights.predictionsByModel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="modelName" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{predictionInsights.totalPredictions}</div>
                        <div className="text-sm text-muted-foreground">Total Predictions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{predictionInsights.correctPredictions}</div>
                        <div className="text-sm text-muted-foreground">Correct Predictions</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {(predictionInsights.averageConfidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{predictionInsights.highConfidencePredictions}</div>
                        <div className="text-sm text-muted-foreground">High Confidence &gt;80%</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Accuracy</span>
                        <span>{(predictionInsights.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={predictionInsights.accuracy * 100} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Accuracy Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictionInsights.predictionsByModel.map((model: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{model.modelName}</span>
                          <span>{(model.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={model.accuracy * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Model Detail Modal */}
      {selectedModel && (
        <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedModel.name}
                <Badge className={`${getModelStatusColor(selectedModel.status)} text-white`}>
                  {selectedModel.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>Detailed model information and performance metrics</DialogDescription>
            </DialogHeader>
            <ModelDetailView model={selectedModel} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Model Detail View Component
function ModelDetailView({ model }: { model: PredictionModel }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{(model.metrics.precision * 100).toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Precision</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{(model.metrics.recall * 100).toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Recall</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{(model.metrics.f1Score * 100).toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">F1 Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="outline">{model.type.replace("_", " ").toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Target Variable</span>
                <span className="text-sm">{model.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Trained</span>
                <span className="text-sm">{model.lastTrained.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={`${getModelStatusColor(model.status)} text-white`}>{model.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {model.features.map((feature, index) => {
                const importance = Math.random() * 100 // Mock importance
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{feature}</span>
                      <span>{importance.toFixed(1)}%</span>
                    </div>
                    <Progress value={importance} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {model.metrics.rmse && (
        <Card>
          <CardHeader>
            <CardTitle>Regression Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{model.metrics.rmse.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">RMSE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{model.metrics.mae?.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">MAE</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
