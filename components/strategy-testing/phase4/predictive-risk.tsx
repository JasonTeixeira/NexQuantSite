"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Shield, AlertTriangle, TrendingDown, Brain, Target, Zap, Activity } from "lucide-react"

interface RiskPrediction {
  id: string
  type: "market" | "credit" | "liquidity" | "operational"
  title: string
  description: string
  probability: number
  impact: "low" | "medium" | "high" | "critical"
  timeframe: string
  confidence: number
  mitigation: string[]
}

interface StressScenario {
  name: string
  description: string
  probability: number
  portfolioImpact: number
  varImpact: number
  liquidityImpact: number
}

export default function PredictiveRisk() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState("1W")
  const [riskScore, setRiskScore] = useState(73)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock risk predictions
  useEffect(() => {
    const mockPredictions: RiskPrediction[] = [
      {
        id: "1",
        type: "market",
        title: "Volatility Spike Risk",
        description: "ML models predict 85% chance of VIX exceeding 30 within next week",
        probability: 85,
        impact: "high",
        timeframe: "3-7 days",
        confidence: 92,
        mitigation: ["Reduce leverage", "Hedge with VIX calls", "Increase cash allocation"],
      },
      {
        id: "2",
        type: "liquidity",
        title: "Liquidity Crunch Warning",
        description: "Credit spreads widening, potential liquidity issues in small-cap positions",
        probability: 67,
        impact: "medium",
        timeframe: "1-2 weeks",
        confidence: 78,
        mitigation: ["Reduce position sizes", "Focus on liquid names", "Prepare cash reserves"],
      },
      {
        id: "3",
        type: "credit",
        title: "Sector Rotation Risk",
        description: "Tech sector showing signs of institutional selling pressure",
        probability: 74,
        impact: "medium",
        timeframe: "2-4 weeks",
        confidence: 81,
        mitigation: ["Diversify sectors", "Reduce tech exposure", "Add defensive positions"],
      },
    ]

    setPredictions(mockPredictions)
  }, [])

  const runRiskAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setRiskScore(Math.floor(Math.random() * 30) + 60) // Random score between 60-90

      // Add new prediction
      const newPrediction: RiskPrediction = {
        id: Date.now().toString(),
        type: "operational",
        title: "System Risk Alert",
        description: "Unusual trading patterns detected, potential system stress",
        probability: 45,
        impact: "low",
        timeframe: "24-48 hours",
        confidence: 67,
        mitigation: ["Monitor systems", "Reduce automated trading", "Manual oversight"],
      }

      setPredictions((prev) => [newPrediction, ...prev])
    }, 3000)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-red-600/20 text-red-400 border-red-600/30"
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

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case "market":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      case "credit":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "liquidity":
        return <Target className="h-4 w-4 text-blue-400" />
      case "operational":
        return <Shield className="h-4 w-4 text-purple-400" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  // Mock stress test scenarios
  const stressScenarios: StressScenario[] = [
    {
      name: "2008 Financial Crisis",
      description: "Severe market downturn with credit freeze",
      probability: 5,
      portfolioImpact: -45,
      varImpact: 340,
      liquidityImpact: -67,
    },
    {
      name: "Flash Crash",
      description: "Rapid market decline due to algorithmic trading",
      probability: 15,
      portfolioImpact: -23,
      varImpact: 180,
      liquidityImpact: -34,
    },
    {
      name: "Interest Rate Shock",
      description: "Unexpected 200bp rate hike",
      probability: 25,
      portfolioImpact: -18,
      varImpact: 145,
      liquidityImpact: -28,
    },
  ]

  // Mock risk factor data for radar chart
  const riskFactors = [
    { factor: "Market Risk", current: 75, predicted: 85 },
    { factor: "Credit Risk", current: 45, predicted: 52 },
    { factor: "Liquidity Risk", current: 60, predicted: 73 },
    { factor: "Operational Risk", current: 35, predicted: 41 },
    { factor: "Model Risk", current: 55, predicted: 48 },
    { factor: "Concentration Risk", current: 68, predicted: 71 },
  ]

  // Mock VaR prediction data
  const varData = [
    { date: "2024-01-15", actual: 2.3, predicted: 2.5, confidence: 0.4 },
    { date: "2024-01-16", actual: 2.1, predicted: 2.2, confidence: 0.3 },
    { date: "2024-01-17", actual: 2.8, predicted: 2.9, confidence: 0.5 },
    { date: "2024-01-18", actual: 3.2, predicted: 3.4, confidence: 0.6 },
    { date: "2024-01-19", actual: 2.9, predicted: 3.1, confidence: 0.4 },
    { date: "2024-01-20", actual: null, predicted: 3.8, confidence: 0.7 },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Predictive Risk Modeling</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={`${riskScore > 80 ? "bg-red-500/20 text-red-400" : riskScore > 60 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}
          >
            Risk Score: {riskScore}
          </Badge>
          <Button onClick={runRiskAnalysis} disabled={isAnalyzing} className="bg-red-600 hover:bg-red-700">
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Risk Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {predictions.map((prediction) => (
          <Card key={prediction.id} className="bg-[#1a1a2e] border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRiskTypeIcon(prediction.type)}
                  <CardTitle className="text-sm font-medium text-white">{prediction.title}</CardTitle>
                </div>
                <Badge className={getImpactColor(prediction.impact)}>{prediction.impact}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300">{prediction.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Probability</span>
                  <span className="text-white">{prediction.probability}%</span>
                </div>
                <Progress value={prediction.probability} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Confidence</span>
                  <span className="text-white">{prediction.confidence}%</span>
                </div>
                <Progress value={prediction.confidence} className="h-1" />
              </div>
              <div className="pt-2">
                <div className="text-xs text-gray-400 mb-1">Mitigation Strategies:</div>
                <div className="flex flex-wrap gap-1">
                  {prediction.mitigation.slice(0, 2).map((strategy, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {strategy}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced ML Risk Models */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Advanced ML Risk Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Deep Learning Models</h4>
              {[
                {
                  model: "LSTM Risk Predictor",
                  accuracy: 94.2,
                  status: "active",
                  prediction: "High volatility in 2-3 days",
                },
                {
                  model: "Transformer Risk Model",
                  accuracy: 91.8,
                  status: "training",
                  prediction: "Credit spread widening",
                },
                { model: "CNN Pattern Detector", accuracy: 89.5, status: "active", prediction: "Market regime change" },
                {
                  model: "GAN Scenario Generator",
                  accuracy: 87.3,
                  status: "validating",
                  prediction: "Tail risk scenarios",
                },
              ].map((model, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-white text-sm">{model.model}</h5>
                    <Badge
                      className={
                        model.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : model.status === "training"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {model.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-green-400">{model.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Latest Prediction</span>
                      <div className="text-white mt-1">{model.prediction}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Real-time Risk Signals</h4>
              {[
                { signal: "Options Skew Alert", severity: "high", confidence: 92, timeframe: "2-4 hours" },
                { signal: "Credit Spread Divergence", severity: "medium", confidence: 87, timeframe: "1-2 days" },
                { signal: "Liquidity Stress", severity: "low", confidence: 78, timeframe: "3-5 days" },
                { signal: "Correlation Breakdown", severity: "high", confidence: 94, timeframe: "6-12 hours" },
                { signal: "Momentum Reversal", severity: "medium", confidence: 83, timeframe: "1-3 days" },
              ].map((signal, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-white text-sm">{signal.signal}</h5>
                    <Badge
                      className={
                        signal.severity === "high"
                          ? "bg-red-500/20 text-red-400"
                          : signal.severity === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                      }
                    >
                      {signal.severity}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Confidence</span>
                      <div className="text-white">{signal.confidence}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Timeframe</span>
                      <div className="text-gray-300">{signal.timeframe}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Model Ensemble Results</h4>
              {[
                { ensemble: "Risk Consensus", models: 8, agreement: 94, prediction: "Elevated risk next week" },
                { ensemble: "Volatility Forecast", models: 6, agreement: 87, prediction: "VIX spike to 28-32" },
                { ensemble: "Credit Risk", models: 5, agreement: 91, prediction: "Spreads widen 15-20bps" },
                { ensemble: "Liquidity Risk", models: 7, agreement: 83, prediction: "Reduced market depth" },
              ].map((ensemble, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-white text-sm">{ensemble.ensemble}</h5>
                    <Badge className="bg-purple-500/20 text-purple-400">{ensemble.models} models</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Agreement</span>
                      <span className="text-green-400">{ensemble.agreement}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Consensus</span>
                      <div className="text-white mt-1">{ensemble.prediction}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factor Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Risk Factor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskFactors}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <Radar name="Current" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Radar name="Predicted" dataKey="predicted" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* VaR Prediction */}
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              VaR Prediction Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={varData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
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
                    dataKey="actual"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stress Test Scenarios */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Stress Test Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stressScenarios.map((scenario, index) => (
              <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{scenario.name}</h4>
                    <p className="text-sm text-gray-400">{scenario.description}</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {scenario.probability}% probability
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Portfolio Impact</span>
                    <div className="text-red-400 font-semibold">{scenario.portfolioImpact}%</div>
                  </div>
                  <div>
                    <span className="text-gray-400">VaR Impact</span>
                    <div className="text-red-400 font-semibold">+{scenario.varImpact}%</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Liquidity Impact</span>
                    <div className="text-red-400 font-semibold">{scenario.liquidityImpact}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Risk Monitoring */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-400" />
            Real-time Risk Monitoring & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Active Risk Alerts</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  {
                    time: "14:32:15",
                    type: "VaR Breach",
                    message: "Portfolio VaR exceeded 95% confidence level",
                    severity: "critical",
                  },
                  {
                    time: "14:28:42",
                    type: "Concentration Risk",
                    message: "Tech sector exposure above 35% limit",
                    severity: "high",
                  },
                  {
                    time: "14:25:18",
                    type: "Liquidity Alert",
                    message: "REIT positions showing reduced liquidity",
                    severity: "medium",
                  },
                  {
                    time: "14:22:33",
                    type: "Correlation Alert",
                    message: "Equity-bond correlation turning positive",
                    severity: "medium",
                  },
                  {
                    time: "14:19:07",
                    type: "Volatility Spike",
                    message: "Implied volatility increased 15% in last hour",
                    severity: "high",
                  },
                  {
                    time: "14:15:44",
                    type: "Credit Warning",
                    message: "High yield spreads widening rapidly",
                    severity: "high",
                  },
                ].map((alert, index) => (
                  <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">{alert.time}</span>
                      <Badge
                        className={
                          alert.severity === "critical"
                            ? "bg-red-600/20 text-red-400"
                            : alert.severity === "high"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-white mb-1">{alert.type}</div>
                    <div className="text-xs text-gray-300">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Risk Limit Monitoring</h4>
              {[
                { limit: "Portfolio VaR", current: 2.8, max: 3.0, utilization: 93.3 },
                { limit: "Sector Concentration", current: 34.2, max: 35.0, utilization: 97.7 },
                { limit: "Single Name", current: 4.8, max: 5.0, utilization: 96.0 },
                { limit: "Leverage Ratio", current: 2.1, max: 2.5, utilization: 84.0 },
                { limit: "Liquidity Buffer", current: 8.7, max: 10.0, utilization: 87.0 },
                { limit: "Correlation Risk", current: 0.72, max: 0.75, utilization: 96.0 },
              ].map((limit, index) => (
                <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white">{limit.limit}</span>
                    <Badge
                      className={
                        limit.utilization > 95
                          ? "bg-red-500/20 text-red-400"
                          : limit.utilization > 85
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                      }
                    >
                      {limit.utilization.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{limit.current}</span>
                    <span>{limit.max}</span>
                  </div>
                  <Progress value={limit.utilization} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
