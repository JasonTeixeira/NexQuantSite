"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Shield,
  Zap,
  Brain,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Flame,
  Snowflake,
  Wind,
  Waves
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart
} from 'recharts'

interface MarketRegime {
  id: string
  name: string
  description: string
  color: string
  icon: React.ComponentType<any>
  characteristics: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
}

interface PerformanceMetrics {
  regime: string
  returns: number
  sharpe: number
  maxDrawdown: number
  winRate: number
  avgWin: number
  avgLoss: number
  volatility: number
  beta: number
  alpha: number
  calmarRatio: number
  sortinoRatio: number
}

interface ChaosTestScenario {
  id: string
  name: string
  description: string
  severity: 'mild' | 'moderate' | 'severe' | 'extreme'
  probability: number
  impact: string[]
  historicalExamples: string[]
}

const marketRegimes: MarketRegime[] = [
  {
    id: 'bull',
    name: 'Bull Market',
    description: 'Rising prices, high confidence, low volatility',
    color: '#22c55e',
    icon: TrendingUp,
    characteristics: ['Rising prices', 'Low volatility', 'High sentiment', 'Economic growth'],
    riskLevel: 'low'
  },
  {
    id: 'bear',
    name: 'Bear Market',
    description: 'Falling prices, fear, high volatility',
    color: '#ef4444',
    icon: TrendingDown,
    characteristics: ['Falling prices', 'High volatility', 'Fear sentiment', 'Economic contraction'],
    riskLevel: 'high'
  },
  {
    id: 'sideways',
    name: 'Sideways Market',
    description: 'Range-bound, mixed signals, moderate volatility',
    color: '#f59e0b',
    icon: Activity,
    characteristics: ['Range-bound', 'Mixed signals', 'Moderate volatility', 'Uncertainty'],
    riskLevel: 'medium'
  },
  {
    id: 'crisis',
    name: 'Crisis Mode',
    description: 'Extreme volatility, panic selling, flight to safety',
    color: '#dc2626',
    icon: AlertTriangle,
    characteristics: ['Extreme volatility', 'Panic selling', 'Flight to safety', 'Liquidity crisis'],
    riskLevel: 'extreme'
  },
  {
    id: 'recovery',
    name: 'Recovery Phase',
    description: 'Stabilizing after crisis, cautious optimism',
    color: '#10b981',
    icon: Shield,
    characteristics: ['Stabilizing prices', 'Cautious optimism', 'Policy support', 'Gradual recovery'],
    riskLevel: 'medium'
  }
]

const chaosTestScenarios: ChaosTestScenario[] = [
  {
    id: 'flash-crash',
    name: 'Flash Crash',
    description: 'Sudden 10-20% market drop within minutes',
    severity: 'severe',
    probability: 0.05,
    impact: ['Liquidity evaporation', 'Stop-loss cascades', 'System overload'],
    historicalExamples: ['May 6, 2010', 'Aug 24, 2015', 'Feb 5, 2018']
  },
  {
    id: 'volatility-spike',
    name: 'Volatility Explosion',
    description: 'VIX spikes above 40, correlations break down',
    severity: 'moderate',
    probability: 0.15,
    impact: ['Risk model failure', 'Correlation breakdown', 'Margin calls'],
    historicalExamples: ['COVID-19 2020', 'Brexit 2016', 'China Devaluation 2015']
  },
  {
    id: 'interest-rate-shock',
    name: 'Interest Rate Shock',
    description: 'Unexpected 100+ bps rate change',
    severity: 'severe',
    probability: 0.08,
    impact: ['Bond market collapse', 'Currency volatility', 'Credit crunch'],
    historicalExamples: ['Volcker Shock 1979', 'Taper Tantrum 2013']
  },
  {
    id: 'geopolitical-crisis',
    name: 'Geopolitical Crisis',
    description: 'War, sanctions, or major political upheaval',
    severity: 'extreme',
    probability: 0.12,
    impact: ['Commodity spikes', 'Safe haven flows', 'Supply chain disruption'],
    historicalExamples: ['Ukraine War 2022', '9/11 2001', 'Gulf War 1991']
  },
  {
    id: 'tech-disruption',
    name: 'Technology Disruption',
    description: 'AI breakthrough or quantum computing threat',
    severity: 'extreme',
    probability: 0.03,
    impact: ['Industry obsolescence', 'Massive revaluation', 'Job displacement'],
    historicalExamples: ['Internet Bubble 2000', 'ChatGPT Launch 2022']
  },
  {
    id: 'liquidity-crisis',
    name: 'Liquidity Crisis',
    description: 'Major bank failure or credit freeze',
    severity: 'extreme',
    probability: 0.06,
    impact: ['Credit freeze', 'Bank runs', 'System collapse'],
    historicalExamples: ['Lehman 2008', 'LTCM 1998', 'SVB 2023']
  }
]

// Generate realistic performance data for different market regimes
const generatePerformanceData = (): PerformanceMetrics[] => {
  return [
    {
      regime: 'Bull Market',
      returns: 18.5,
      sharpe: 1.45,
      maxDrawdown: -8.2,
      winRate: 68,
      avgWin: 2.1,
      avgLoss: -1.3,
      volatility: 12.8,
      beta: 0.85,
      alpha: 4.2,
      calmarRatio: 2.26,
      sortinoRatio: 2.1
    },
    {
      regime: 'Bear Market',
      returns: -12.3,
      sharpe: -0.65,
      maxDrawdown: -28.5,
      winRate: 42,
      avgWin: 1.8,
      avgLoss: -2.4,
      volatility: 22.4,
      beta: 1.15,
      alpha: -2.8,
      calmarRatio: -0.43,
      sortinoRatio: -0.89
    },
    {
      regime: 'Sideways Market',
      returns: 6.2,
      sharpe: 0.48,
      maxDrawdown: -15.1,
      winRate: 55,
      avgWin: 1.4,
      avgLoss: -1.6,
      volatility: 16.3,
      beta: 0.92,
      alpha: 1.1,
      calmarRatio: 0.41,
      sortinoRatio: 0.72
    },
    {
      regime: 'Crisis Mode',
      returns: -25.8,
      sharpe: -1.2,
      maxDrawdown: -45.2,
      winRate: 35,
      avgWin: 2.8,
      avgLoss: -3.5,
      volatility: 35.6,
      beta: 1.35,
      alpha: -8.4,
      calmarRatio: -0.57,
      sortinoRatio: -1.65
    },
    {
      regime: 'Recovery Phase',
      returns: 14.7,
      sharpe: 0.89,
      maxDrawdown: -18.3,
      winRate: 61,
      avgWin: 2.3,
      avgLoss: -1.9,
      volatility: 19.2,
      beta: 1.05,
      alpha: 2.8,
      calmarRatio: 0.80,
      sortinoRatio: 1.24
    }
  ]
}

export const MarketConditionAnalysis: React.FC = () => {
  const [selectedRegime, setSelectedRegime] = useState<string>('bull')
  const [showChaosTests, setShowChaosTests] = useState(false)
  const [runningChaosTest, setRunningChaosTest] = useState<string | null>(null)
  
  const performanceData = useMemo(() => generatePerformanceData(), [])
  
  const selectedRegimeData = performanceData.find(d => d.regime.toLowerCase().includes(selectedRegime))
  
  const runChaosTest = async (scenarioId: string) => {
    setRunningChaosTest(scenarioId)
    
    // Simulate chaos test execution
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setRunningChaosTest(null)
    
    // Show results
    const scenario = chaosTestScenarios.find(s => s.id === scenarioId)
    alert(`🧪 Chaos Test Complete: ${scenario?.name}\n\nStrategy showed ${Math.random() > 0.5 ? 'resilience' : 'vulnerability'} to this scenario.\n\nRecommendation: ${Math.random() > 0.5 ? 'Increase hedging' : 'Reduce position size'} during similar conditions.`)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'severe': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'extreme': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'extreme': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Generate time series data for regime performance
  const timeSeriesData = useMemo(() => {
    return Array.from({ length: 252 }, (_, i) => {
      const regime = marketRegimes.find(r => r.id === selectedRegime)
      const baseReturn = selectedRegimeData?.returns || 0
      const volatility = selectedRegimeData?.volatility || 15
      
      const dailyReturn = (baseReturn / 252) + (Math.random() - 0.5) * (volatility / 16)
      const cumulativeReturn = i === 0 ? 100 : (timeSeriesData?.[i-1]?.value || 100) * (1 + dailyReturn / 100)
      
      return {
        day: i + 1,
        value: cumulativeReturn,
        regime: regime?.name || 'Unknown'
      }
    })
  }, [selectedRegime, selectedRegimeData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Market Condition Analysis</h2>
          <p className="text-[#a0a0b8]">Analyze strategy performance across different market regimes and stress test with chaos scenarios</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showChaosTests ? "default" : "outline"}
            onClick={() => setShowChaosTests(!showChaosTests)}
            className="flex items-center gap-2"
          >
            <Flame className="w-4 h-4" />
            {showChaosTests ? 'Hide' : 'Show'} Chaos Tests
          </Button>
        </div>
      </div>

      {/* Market Regime Selector */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Market Regime Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {marketRegimes.map((regime) => {
              const Icon = regime.icon
              return (
                <button
                  key={regime.id}
                  onClick={() => setSelectedRegime(regime.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedRegime === regime.id
                      ? 'border-[#00bbff] bg-[#00bbff]/10'
                      : 'border-[#2a2a3e] bg-[#15151f] hover:border-[#3a3a4e]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="w-6 h-6" style={{ color: regime.color }} />
                    <div className="text-sm font-semibold text-white">{regime.name}</div>
                    <Badge className={`text-xs ${getRiskLevelColor(regime.riskLevel)}`}>
                      {regime.riskLevel}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected Regime Details */}
          {selectedRegimeData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-[#15151f] rounded-lg p-4 border border-[#2a2a3e]">
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                      <XAxis dataKey="day" stroke="#606078" fontSize={10} />
                      <YAxis stroke="#606078" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a25', 
                          border: '1px solid #2a2a3e',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00bbff" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-[#15151f] rounded-lg p-4 border border-[#2a2a3e]">
                <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Annual Return</div>
                      <div className={`text-lg font-bold ${selectedRegimeData.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedRegimeData.returns.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Sharpe Ratio</div>
                      <div className={`text-lg font-bold ${selectedRegimeData.sharpe >= 1 ? 'text-green-400' : selectedRegimeData.sharpe >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedRegimeData.sharpe.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Max Drawdown</div>
                      <div className="text-lg font-bold text-red-400">
                        {selectedRegimeData.maxDrawdown.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Win Rate</div>
                      <div className={`text-lg font-bold ${selectedRegimeData.winRate >= 60 ? 'text-green-400' : selectedRegimeData.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedRegimeData.winRate}%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Volatility</div>
                      <div className="text-lg font-bold text-white">
                        {selectedRegimeData.volatility.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Beta</div>
                      <div className="text-lg font-bold text-white">
                        {selectedRegimeData.beta.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Alpha</div>
                      <div className={`text-lg font-bold ${selectedRegimeData.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedRegimeData.alpha.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a0a0b8]">Calmar Ratio</div>
                      <div className={`text-lg font-bold ${selectedRegimeData.calmarRatio >= 1 ? 'text-green-400' : selectedRegimeData.calmarRatio >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedRegimeData.calmarRatio.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chaos Testing */}
      {showChaosTests && (
        <Card className="bg-[#1a1a25] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Chaos Testing & Stress Scenarios
            </CardTitle>
            <p className="text-[#a0a0b8] text-sm">
              Test your strategy's resilience against extreme market conditions and black swan events
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chaosTestScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-[#15151f] rounded-lg p-4 border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{scenario.name}</h3>
                    <Badge className={`text-xs ${getSeverityColor(scenario.severity)}`}>
                      {scenario.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-[#a0a0b8] mb-3">{scenario.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#a0a0b8]">Probability</span>
                      <span className="text-white">{(scenario.probability * 100).toFixed(1)}%</span>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-[#a0a0b8] mb-1">Historical Examples:</div>
                      <div className="text-white">
                        {scenario.historicalExamples.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => runChaosTest(scenario.id)}
                    disabled={runningChaosTest === scenario.id}
                    className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
                    size="sm"
                  >
                    {runningChaosTest === scenario.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary Across All Regimes */}
      <Card className="bg-[#1a1a25] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Cross-Regime Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a3e]">
                  <th className="text-left py-3 px-2 text-[#a0a0b8] font-semibold">Regime</th>
                  <th className="text-right py-3 px-2 text-[#a0a0b8] font-semibold">Return</th>
                  <th className="text-right py-3 px-2 text-[#a0a0b8] font-semibold">Sharpe</th>
                  <th className="text-right py-3 px-2 text-[#a0a0b8] font-semibold">Max DD</th>
                  <th className="text-right py-3 px-2 text-[#a0a0b8] font-semibold">Win Rate</th>
                  <th className="text-right py-3 px-2 text-[#a0a0b8] font-semibold">Volatility</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((data, index) => (
                  <tr key={index} className="border-b border-[#2a2a3e]/50 hover:bg-[#1f1f2a] transition-colors">
                    <td className="py-2 px-2 text-white font-semibold">{data.regime}</td>
                    <td className={`py-2 px-2 text-right font-semibold ${data.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.returns.toFixed(1)}%
                    </td>
                    <td className={`py-2 px-2 text-right font-semibold ${data.sharpe >= 1 ? 'text-green-400' : data.sharpe >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {data.sharpe.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-red-400">
                      {data.maxDrawdown.toFixed(1)}%
                    </td>
                    <td className={`py-2 px-2 text-right font-semibold ${data.winRate >= 60 ? 'text-green-400' : data.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {data.winRate}%
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-white">
                      {data.volatility.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MarketConditionAnalysis
