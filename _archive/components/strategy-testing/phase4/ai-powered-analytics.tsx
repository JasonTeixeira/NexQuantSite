"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Activity } from "lucide-react"

interface AIInsight {
  id: string
  type: "opportunity" | "risk" | "optimization" | "prediction"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  timeframe: string
  actionable: boolean
}

interface MarketPrediction {
  asset: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  timeframe: string
  factors: string[]
}

export default function AIPoweredAnalytics() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [analysisRunning, setAnalysisRunning] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D")

  // Mock AI insights data
  useEffect(() => {
    const mockInsights: AIInsight[] = [
      {
        id: "1",
        type: "opportunity",
        title: "Mean Reversion Signal Detected",
        description: "AAPL showing strong mean reversion pattern with 87% historical accuracy",
        confidence: 87,
        impact: "high",
        timeframe: "3-5 days",
        actionable: true,
      },
      {
        id: "2",
        type: "risk",
        title: "Correlation Breakdown Warning",
        description: "Tech sector correlations dropping below historical norms, increased portfolio risk",
        confidence: 92,
        impact: "medium",
        timeframe: "1-2 weeks",
        actionable: true,
      },
      {
        id: "3",
        type: "prediction",
        title: "Volatility Spike Forecast",
        description: "ML models predict 23% increase in VIX within next 48 hours",
        confidence: 78,
        impact: "high",
        timeframe: "2 days",
        actionable: true,
      },
    ]

    const mockPredictions: MarketPrediction[] = [
      {
        asset: "SPY",
        currentPrice: 445.67,
        predictedPrice: 452.3,
        confidence: 84,
        timeframe: "5D",
        factors: ["Fed Policy", "Earnings", "Technical"],
      },
      {
        asset: "QQQ",
        currentPrice: 378.45,
        predictedPrice: 371.2,
        confidence: 79,
        timeframe: "3D",
        factors: ["Tech Rotation", "Momentum", "Options Flow"],
      },
    ]

    setInsights(mockInsights)
    setPredictions(mockPredictions)
  }, [])

  const runAIAnalysis = () => {
    setAnalysisRunning(true)
    setTimeout(() => {
      setAnalysisRunning(false)
      // Simulate new insights
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: "optimization",
        title: "Portfolio Rebalancing Opportunity",
        description: "AI suggests 12% allocation shift to improve risk-adjusted returns",
        confidence: 91,
        impact: "high",
        timeframe: "Immediate",
        actionable: true,
      }
      setInsights((prev) => [newInsight, ...prev])
    }, 3000)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "optimization":
        return <Target className="h-4 w-4 text-blue-400" />
      case "prediction":
        return <Brain className="h-4 w-4 text-purple-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  // Mock sentiment data
  const sentimentData = [
    { time: "09:30", sentiment: 0.65, volume: 1200 },
    { time: "10:00", sentiment: 0.72, volume: 1450 },
    { time: "10:30", sentiment: 0.58, volume: 1100 },
    { time: "11:00", sentiment: 0.81, volume: 1680 },
    { time: "11:30", sentiment: 0.69, volume: 1320 },
    { time: "12:00", sentiment: 0.75, volume: 1520 },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">AI-Powered Analytics</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={runAIAnalysis} disabled={analysisRunning} className="bg-blue-600 hover:bg-blue-700">
            {analysisRunning ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className="bg-[#1a1a2e] border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <CardTitle className="text-sm font-medium text-white">{insight.title}</CardTitle>
                </div>
                <Badge className={getImpactColor(insight.impact)}>{insight.impact}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300">{insight.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Confidence</span>
                  <span className="text-white">{insight.confidence}%</span>
                </div>
                <Progress value={insight.confidence} className="h-1" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-400">{insight.timeframe}</span>
                {insight.actionable && (
                  <Button 
                    onClick={() => {
                      console.log(`Acting on insight: ${insight.title}`)
                      alert(`Taking action on: ${insight.title}`)
                    }}
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs bg-transparent"
                  >
                    Act on This
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ML Model Pipeline Status */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            ML Model Pipeline Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "LSTM Price Predictor", status: "training", accuracy: 94.2, lastUpdate: "2 min ago" },
              { name: "Sentiment Classifier", status: "active", accuracy: 87.6, lastUpdate: "5 min ago" },
              { name: "Risk Factor Model", status: "validating", accuracy: 91.3, lastUpdate: "1 min ago" },
              { name: "Options Flow Analyzer", status: "active", accuracy: 89.4, lastUpdate: "3 min ago" },
              { name: "Earnings Predictor", status: "retraining", accuracy: 76.8, lastUpdate: "15 min ago" },
              { name: "Volatility Forecaster", status: "active", accuracy: 92.1, lastUpdate: "1 min ago" },
            ].map((model, index) => (
              <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-white">{model.name}</h4>
                  <Badge
                    className={
                      model.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : model.status === "training"
                          ? "bg-blue-500/20 text-blue-400"
                          : model.status === "retraining"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-purple-500/20 text-purple-400"
                    }
                  >
                    {model.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-white">{model.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update</span>
                    <span className="text-gray-300">{model.lastUpdate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Predictions */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            AI Market Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((pred, index) => (
              <div key={index} className="space-y-3 p-4 bg-[#15151f] rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-white">{pred.asset}</h4>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {pred.confidence}% confidence
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Current</span>
                    <div className="text-white font-mono">${pred.currentPrice}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Predicted</span>
                    <div
                      className={`font-mono ${pred.predictedPrice > pred.currentPrice ? "text-green-400" : "text-red-400"}`}
                    >
                      ${pred.predictedPrice}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {pred.factors.map((factor, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced NLP Analysis */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-400" />
            Advanced NLP Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Real-time News Sentiment</h4>
              {[
                { source: "Bloomberg", sentiment: 0.72, confidence: 94, topics: ["Fed Policy", "Inflation"] },
                { source: "Reuters", sentiment: -0.23, confidence: 87, topics: ["Tech Earnings", "Guidance"] },
                { source: "WSJ", sentiment: 0.45, confidence: 91, topics: ["Market Structure", "Regulation"] },
                { source: "CNBC", sentiment: 0.18, confidence: 83, topics: ["Crypto", "DeFi"] },
              ].map((news, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{news.source}</span>
                    <Badge
                      className={news.sentiment > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                    >
                      {news.sentiment > 0 ? "+" : ""}
                      {(news.sentiment * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Confidence: {news.confidence}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {news.topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Social Media Signals</h4>
              {[
                { platform: "Twitter/X", mentions: 12847, sentiment: 0.34, trending: ["$TSLA", "$NVDA"] },
                { platform: "Reddit", mentions: 8923, sentiment: -0.12, trending: ["GME", "AMC"] },
                { platform: "StockTwits", mentions: 15632, sentiment: 0.67, trending: ["SPY", "QQQ"] },
                { platform: "Discord", mentions: 3421, sentiment: 0.23, trending: ["BTC", "ETH"] },
              ].map((social, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{social.platform}</span>
                    <span className="text-gray-400 text-xs">{social.mentions.toLocaleString()} mentions</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Sentiment</span>
                    <Badge
                      className={social.sentiment > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                    >
                      {social.sentiment > 0 ? "+" : ""}
                      {(social.sentiment * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {social.trending.map((trend, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Validation Dashboard */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Model Validation & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-white font-medium">Backtesting Results</h4>
              {[
                { model: "LSTM Predictor", sharpe: 2.34, maxDD: -8.2, winRate: 67.3 },
                { model: "Sentiment Model", sharpe: 1.87, maxDD: -12.1, winRate: 59.8 },
                { model: "Risk Factor", sharpe: 1.92, maxDD: -6.7, winRate: 71.2 },
              ].map((result, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-white mb-2">{result.model}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Sharpe</span>
                      <div className="text-green-400">{result.sharpe}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Max DD</span>
                      <div className="text-red-400">{result.maxDD}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Win Rate</span>
                      <div className="text-white">{result.winRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium">Feature Importance</h4>
              {[
                { feature: "Price Momentum", importance: 0.23, stability: 94 },
                { feature: "Volume Profile", importance: 0.19, stability: 87 },
                { feature: "News Sentiment", importance: 0.16, stability: 91 },
                { feature: "Options Flow", importance: 0.14, stability: 83 },
                { feature: "Macro Indicators", importance: 0.12, stability: 89 },
              ].map((feature, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white">{feature.feature}</span>
                    <span className="text-xs text-gray-400">{(feature.importance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Stability</span>
                    <span className="text-xs text-green-400">{feature.stability}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium">Model Drift Detection</h4>
              {[
                { model: "Price Predictor", drift: 2.3, status: "stable", lastCheck: "5m ago" },
                { model: "Sentiment Analyzer", drift: 8.7, status: "warning", lastCheck: "2m ago" },
                { model: "Risk Classifier", drift: 1.2, status: "stable", lastCheck: "3m ago" },
                { model: "Volume Predictor", drift: 12.4, status: "critical", lastCheck: "1m ago" },
              ].map((drift, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white">{drift.model}</span>
                    <Badge
                      className={
                        drift.status === "stable"
                          ? "bg-green-500/20 text-green-400"
                          : drift.status === "warning"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }
                    >
                      {drift.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Drift: {drift.drift}%</span>
                    <span className="text-gray-400">{drift.lastCheck}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment Analysis */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Real-time Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
