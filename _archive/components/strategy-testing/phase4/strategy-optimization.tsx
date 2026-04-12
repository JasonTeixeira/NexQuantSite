"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts"
import { Target, Zap, TrendingUp, Settings, Brain } from "lucide-react"

interface Strategy {
  id: string
  name: string
  type: "momentum" | "mean_reversion" | "arbitrage" | "ml_based"
  status: "running" | "paused" | "optimizing"
  performance: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  lastOptimized: string
  parameters: { [key: string]: number }
}

interface OptimizationResult {
  id: string
  strategyId: string
  timestamp: string
  oldParams: { [key: string]: number }
  newParams: { [key: string]: number }
  expectedImprovement: number
  confidence: number
  status: "pending" | "applied" | "rejected"
}

export default function StrategyOptimization() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>("")
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Mock strategies data
  useEffect(() => {
    const mockStrategies: Strategy[] = [
      {
        id: "1",
        name: "Momentum Alpha",
        type: "momentum",
        status: "running",
        performance: 23.4,
        sharpe: 1.87,
        maxDrawdown: -8.2,
        winRate: 67.3,
        lastOptimized: "2024-01-15",
        parameters: {
          lookback: 20,
          threshold: 0.02,
          stopLoss: 0.05,
          takeProfit: 0.08,
        },
      },
      {
        id: "2",
        name: "Mean Reversion Pro",
        type: "mean_reversion",
        status: "running",
        performance: 18.7,
        sharpe: 2.14,
        maxDrawdown: -5.1,
        winRate: 72.8,
        lastOptimized: "2024-01-12",
        parameters: {
          window: 50,
          zscore: 2.0,
          exitThreshold: 0.5,
          maxHold: 10,
        },
      },
      {
        id: "3",
        name: "ML Predictor",
        type: "ml_based",
        status: "optimizing",
        performance: 31.2,
        sharpe: 2.45,
        maxDrawdown: -12.3,
        winRate: 64.1,
        lastOptimized: "2024-01-17",
        parameters: {
          features: 25,
          learningRate: 0.001,
          epochs: 100,
          dropout: 0.2,
        },
      },
    ]

    const mockOptimizations: OptimizationResult[] = [
      {
        id: "1",
        strategyId: "1",
        timestamp: "2024-01-17 14:30",
        oldParams: { lookback: 20, threshold: 0.02 },
        newParams: { lookback: 18, threshold: 0.025 },
        expectedImprovement: 12.3,
        confidence: 87,
        status: "pending",
      },
      {
        id: "2",
        strategyId: "2",
        timestamp: "2024-01-17 13:15",
        oldParams: { window: 50, zscore: 2.0 },
        newParams: { window: 45, zscore: 2.2 },
        expectedImprovement: 8.7,
        confidence: 92,
        status: "applied",
      },
    ]

    setStrategies(mockStrategies)
    setOptimizations(mockOptimizations)
    setSelectedStrategy(mockStrategies[0].id)
  }, [])

  const runOptimization = (strategyId: string) => {
    setIsOptimizing(true)

    // Update strategy status
    setStrategies((prev) => prev.map((s) => (s.id === strategyId ? { ...s, status: "optimizing" } : s)))

    setTimeout(() => {
      setIsOptimizing(false)

      // Create new optimization result
      const strategy = strategies.find((s) => s.id === strategyId)
      if (strategy) {
        const newOptimization: OptimizationResult = {
          id: Date.now().toString(),
          strategyId,
          timestamp: new Date().toLocaleString(),
          oldParams: { ...strategy.parameters },
          newParams: {
            ...strategy.parameters,
            // Simulate parameter changes
            ...(strategy.type === "momentum" && {
              lookback: strategy.parameters.lookback + Math.floor(Math.random() * 6) - 3,
              threshold: strategy.parameters.threshold + (Math.random() * 0.01 - 0.005),
            }),
          },
          expectedImprovement: Math.random() * 20 + 5,
          confidence: Math.floor(Math.random() * 30) + 70,
          status: "pending",
        }

        setOptimizations((prev) => [newOptimization, ...prev])

        // Update strategy status back to running
        setStrategies((prev) => prev.map((s) => (s.id === strategyId ? { ...s, status: "running" } : s)))
      }
    }, 4000)
  }

  const applyOptimization = (optimizationId: string) => {
    const optimization = optimizations.find((o) => o.id === optimizationId)
    if (!optimization) return

    // Update optimization status
    setOptimizations((prev) => prev.map((o) => (o.id === optimizationId ? { ...o, status: "applied" } : o)))

    // Update strategy parameters
    setStrategies((prev) =>
      prev.map((s) =>
        s.id === optimization.strategyId
          ? {
              ...s,
              parameters: optimization.newParams,
              lastOptimized: new Date().toISOString().split("T")[0],
            }
          : s,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "optimizing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "momentum":
        return "bg-purple-500/20 text-purple-400"
      case "mean_reversion":
        return "bg-blue-500/20 text-blue-400"
      case "arbitrage":
        return "bg-green-500/20 text-green-400"
      case "ml_based":
        return "bg-orange-500/20 text-orange-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  // Mock optimization history data
  const optimizationHistory = [
    { date: "2024-01-10", sharpe: 1.65, performance: 18.2 },
    { date: "2024-01-11", sharpe: 1.72, performance: 19.8 },
    { date: "2024-01-12", sharpe: 1.89, performance: 21.4 },
    { date: "2024-01-13", sharpe: 1.94, performance: 22.1 },
    { date: "2024-01-14", sharpe: 1.87, performance: 23.4 },
    { date: "2024-01-15", sharpe: 2.01, performance: 24.7 },
    { date: "2024-01-16", sharpe: 1.98, performance: 23.9 },
    { date: "2024-01-17", sharpe: 2.14, performance: 25.3 },
  ]

  // Mock parameter sensitivity data
  const sensitivityData = [
    { param: "Lookback", sensitivity: 0.85, impact: 12.3 },
    { param: "Threshold", sensitivity: 0.72, impact: 8.7 },
    { param: "Stop Loss", sensitivity: 0.91, impact: 15.2 },
    { param: "Take Profit", sensitivity: 0.68, impact: 6.4 },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Strategy Optimization</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {strategies.filter((s) => s.status === "running").length} Active Strategies
          </Badge>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="bg-[#1a1a2e] border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                <Badge className={getStatusColor(strategy.status)}>{strategy.status}</Badge>
              </div>
              <Badge className={getTypeColor(strategy.type)}>{strategy.type.replace("_", " ")}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Performance</span>
                  <div className="text-green-400 font-semibold">{strategy.performance}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Sharpe Ratio</span>
                  <div className="text-white font-semibold">{strategy.sharpe}</div>
                </div>
                <div>
                  <span className="text-gray-400">Max Drawdown</span>
                  <div className="text-red-400 font-semibold">{strategy.maxDrawdown}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Win Rate</span>
                  <div className="text-white font-semibold">{strategy.winRate}%</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-xs text-gray-400 mb-2">Last Optimized: {strategy.lastOptimized}</div>
                <Button
                  onClick={() => runOptimization(strategy.id)}
                  disabled={strategy.status === "optimizing" || isOptimizing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {strategy.status === "optimizing" ? (
                    <>
                      <Brain className="h-3 w-3 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 mr-2" />
                      Optimize
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Results */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            Optimization Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((opt) => {
              const strategy = strategies.find((s) => s.id === opt.strategyId)
              return (
                <div key={opt.id} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{strategy?.name}</h4>
                      <p className="text-sm text-gray-400">{opt.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        +{opt.expectedImprovement.toFixed(1)}% improvement
                      </Badge>
                      <Badge
                        className={
                          opt.status === "applied" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {opt.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Old Parameters</div>
                      <div className="space-y-1">
                        {Object.entries(opt.oldParams).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-300">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">New Parameters</div>
                      <div className="space-y-1">
                        {Object.entries(opt.newParams).map(([key, value]) => (
                          <div key={key} className="text-xs text-green-400">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-400">Confidence: </span>
                      <span className="text-white">{opt.confidence}%</span>
                    </div>
                    {opt.status === "pending" && (
                      <Button
                        onClick={() => applyOptimization(opt.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Apply Changes
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced ML Optimization */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Advanced ML Optimization Engines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Genetic Algorithms</h4>
              {[
                { name: "Multi-Objective GA", generation: 247, fitness: 94.2, population: 500 },
                { name: "Differential Evolution", generation: 189, fitness: 91.8, population: 300 },
                { name: "Particle Swarm", generation: 156, fitness: 89.5, population: 200 },
                { name: "Simulated Annealing", generation: 312, fitness: 87.3, population: 100 },
              ].map((algo, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-white text-sm">{algo.name}</h5>
                    <Badge className="bg-purple-500/20 text-purple-400">Gen {algo.generation}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Fitness</span>
                      <div className="text-green-400">{algo.fitness}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Population</span>
                      <div className="text-white">{algo.population}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Bayesian Optimization</h4>
              {[
                { objective: "Sharpe Ratio", iterations: 156, best: 2.47, acquisition: "EI" },
                { objective: "Max Drawdown", iterations: 203, best: -4.2, acquisition: "UCB" },
                { objective: "Calmar Ratio", iterations: 134, best: 1.89, acquisition: "PI" },
                { objective: "Sortino Ratio", iterations: 178, best: 3.12, acquisition: "EI" },
              ].map((opt, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-white text-sm">{opt.objective}</h5>
                    <Badge className="bg-blue-500/20 text-blue-400">{opt.acquisition}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Iterations</span>
                      <div className="text-white">{opt.iterations}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Best Value</span>
                      <div className="text-green-400">{opt.best}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Reinforcement Learning</h4>
              {[
                { agent: "PPO Agent", episodes: 2847, reward: 156.7, epsilon: 0.12 },
                { agent: "DQN Agent", episodes: 1923, reward: 134.2, epsilon: 0.08 },
                { agent: "A3C Agent", episodes: 3156, reward: 178.9, epsilon: 0.15 },
                { agent: "SAC Agent", episodes: 2234, reward: 142.8, epsilon: 0.1 },
              ].map((agent, index) => (
                <div key={index} className="p-4 bg-[#15151f] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-white text-sm">{agent.agent}</h5>
                    <Badge className="bg-green-500/20 text-green-400">Training</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Episodes</span>
                      <div className="text-white">{agent.episodes.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Reward</span>
                      <div className="text-green-400">{agent.reward}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-400">Exploration: </span>
                    <span className="text-yellow-400">{(agent.epsilon * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Objective Optimization */}
      <Card className="bg-[#1a1a2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Multi-Objective Optimization Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Pareto Optimal Solutions</h4>
              <div className="space-y-3">
                {[
                  { solution: "Solution A", sharpe: 2.34, drawdown: -8.2, volatility: 12.4, rank: 1 },
                  { solution: "Solution B", sharpe: 2.18, drawdown: -6.1, volatility: 10.8, rank: 2 },
                  { solution: "Solution C", sharpe: 2.45, drawdown: -11.3, volatility: 15.2, rank: 3 },
                  { solution: "Solution D", sharpe: 2.01, drawdown: -4.7, volatility: 9.3, rank: 4 },
                  { solution: "Solution E", sharpe: 2.67, drawdown: -14.8, volatility: 18.1, rank: 5 },
                ].map((solution, index) => (
                  <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white">{solution.solution}</span>
                      <Badge
                        className={
                          solution.rank <= 2
                            ? "bg-green-500/20 text-green-400"
                            : solution.rank <= 4
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                        }
                      >
                        Rank {solution.rank}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Sharpe</span>
                        <div className="text-green-400">{solution.sharpe}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Max DD</span>
                        <div className="text-red-400">{solution.drawdown}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Vol</span>
                        <div className="text-white">{solution.volatility}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Optimization Constraints</h4>
              <div className="space-y-3">
                {[
                  { constraint: "Max Drawdown", limit: "≤ 15%", current: "8.2%", status: "satisfied" },
                  { constraint: "Minimum Sharpe", limit: "≥ 1.5", current: "2.34", status: "satisfied" },
                  { constraint: "Max Volatility", limit: "≤ 20%", current: "12.4%", status: "satisfied" },
                  { constraint: "Min Win Rate", limit: "≥ 55%", current: "67.3%", status: "satisfied" },
                  { constraint: "Max Correlation", limit: "≤ 0.8", current: "0.72", status: "satisfied" },
                  { constraint: "Liquidity Buffer", limit: "≥ 5%", current: "8.7%", status: "satisfied" },
                ].map((constraint, index) => (
                  <div key={index} className="p-3 bg-[#15151f] rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">{constraint.constraint}</span>
                      <Badge
                        className={
                          constraint.status === "satisfied"
                            ? "bg-green-500/20 text-green-400"
                            : constraint.status === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }
                      >
                        {constraint.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{constraint.limit}</span>
                      <span className="text-white">{constraint.current}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Optimization History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={optimizationHistory}>
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
                  <Area type="monotone" dataKey="performance" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Parameter Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="sensitivity" stroke="#9CA3AF" />
                  <YAxis dataKey="impact" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter dataKey="impact" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
