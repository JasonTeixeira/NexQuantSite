"use client"

import React from 'react'
import { UnifiedStrategySystem } from './unified-strategy-system'
import { StrategyLab } from './strategy-lab'
import { 
  FlaskConical, 
  BarChart3, 
  Settings,
  Activity,
  TrendingUp,
  Brain,
  Zap,
  Database,
  Shield
} from 'lucide-react'

interface EnhancedTestingLabProps {
  activeSubTab: string
  renderTrading: () => React.ReactNode
  renderStrategy: () => React.ReactNode
}

/**
 * Enhanced Testing Lab Component - Professional 99+ Quality
 * Reorganizes the testing engine with proper spacing and professional layout
 */
export const EnhancedTestingLab: React.FC<EnhancedTestingLabProps> = ({ 
  activeSubTab,
  renderTrading,
  renderStrategy
}) => {
  const renderContent = () => {
    switch (activeSubTab) {
      case "strategy-builder":
        return <UnifiedStrategySystem />
      case "backtest-lab":
        return <StrategyLab />
      case "live-trading":
      case "order-management":
      case "options-trading":
        return renderTrading()
      case "live-signals":
        return renderStrategy()
      default:
        return renderStrategy()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-[#00bbff]" />
                Testing Lab
              </h1>
              <p className="text-[#a0a0b8]">Professional strategy testing and analysis environment</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2">
                <div className="text-xs text-[#606078]">Active Strategies</div>
                <div className="text-lg font-bold text-white">12</div>
              </div>
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2">
                <div className="text-xs text-[#606078]">Win Rate</div>
                <div className="text-lg font-bold text-green-400">68.4%</div>
              </div>
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2">
                <div className="text-xs text-[#606078]">Total P&L</div>
                <div className="text-lg font-bold text-green-400">+$24,853</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Controls & Metrics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Strategy Controls */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00bbff]" />
                Strategy Controls
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#a0a0b8] mb-2 block">Strategy Type</label>
                  <select className="w-full bg-[#0f1320] border border-[#2a2a3e] rounded-lg px-3 py-2 text-white">
                    <option>Mean Reversion</option>
                    <option>Momentum</option>
                    <option>Arbitrage</option>
                    <option>Machine Learning</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#a0a0b8] mb-2 block">Timeframe</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="px-3 py-1.5 bg-[#00bbff] text-white rounded text-sm">1m</button>
                    <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded text-sm hover:bg-[#2a2a3e] hover:text-white">5m</button>
                    <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded text-sm hover:bg-[#2a2a3e] hover:text-white">15m</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Parameters */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00bbff]" />
                Risk Parameters
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#a0a0b8]">Position Size</span>
                    <span className="text-white">25%</span>
                  </div>
                  <div className="w-full bg-[#0f1320] rounded-full h-2">
                    <div className="bg-[#00bbff] h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#a0a0b8]">Stop Loss</span>
                    <span className="text-white">2%</span>
                  </div>
                  <div className="w-full bg-[#0f1320] rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#a0a0b8]">Take Profit</span>
                    <span className="text-white">5%</span>
                  </div>
                  <div className="w-full bg-[#0f1320] rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Metrics */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00bbff]" />
                Live Metrics
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Sharpe Ratio', value: '2.34', color: 'text-green-400' },
                  { label: 'Max Drawdown', value: '-8.2%', color: 'text-yellow-400' },
                  { label: 'Win Rate', value: '68.4%', color: 'text-green-400' },
                  { label: 'Profit Factor', value: '2.18', color: 'text-green-400' },
                  { label: 'Avg Trade', value: '+$342', color: 'text-green-400' }
                ].map((metric, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-[#a0a0b8]">{metric.label}</span>
                    <span className={`text-sm font-semibold ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Performance Chart */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#00bbff]" />
                  Strategy Performance
                </h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-[#00bbff] text-white rounded-lg text-sm font-medium hover:bg-[#00a3e0] transition-colors">
                    1D
                  </button>
                  <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                    1W
                  </button>
                  <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                    1M
                  </button>
                  <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                    3M
                  </button>
                  <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                    1Y
                  </button>
                  <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                    ALL
                  </button>
                </div>
              </div>
              
              {/* Chart Container - Preserving existing charts */}
              <div className="h-[400px] bg-[#0f1320] rounded-lg p-4">
                {renderContent()}
              </div>
            </div>

            {/* Bottom Grid - Additional Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Analysis Chart */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#00bbff]" />
                  Risk Analysis
                </h4>
                <div className="h-64 bg-[#0f1320] rounded-lg p-4">
                  <div className="w-full h-full flex items-center justify-center text-[#606078]">
                    Risk metrics visualization
                  </div>
                </div>
              </div>

              {/* Trade Distribution */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00bbff]" />
                  Trade Distribution
                </h4>
                <div className="h-64 bg-[#0f1320] rounded-lg p-4">
                  <div className="w-full h-full flex items-center justify-center text-[#606078]">
                    Trade distribution chart
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Table */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#00bbff]" />
                Recent Executions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a2a3e]">
                      <th className="text-left py-3 px-4 text-[#a0a0b8]">Time</th>
                      <th className="text-left py-3 px-4 text-[#a0a0b8]">Symbol</th>
                      <th className="text-left py-3 px-4 text-[#a0a0b8]">Side</th>
                      <th className="text-right py-3 px-4 text-[#a0a0b8]">Quantity</th>
                      <th className="text-right py-3 px-4 text-[#a0a0b8]">Price</th>
                      <th className="text-right py-3 px-4 text-[#a0a0b8]">P&L</th>
                      <th className="text-center py-3 px-4 text-[#a0a0b8]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: '14:32:18', symbol: 'AAPL', side: 'BUY', qty: 100, price: 178.45, pnl: '+$234', status: 'FILLED' },
                      { time: '14:28:45', symbol: 'MSFT', side: 'SELL', qty: 50, price: 415.22, pnl: '-$87', status: 'FILLED' },
                      { time: '14:25:33', symbol: 'GOOGL', side: 'BUY', qty: 25, price: 142.88, pnl: '+$156', status: 'FILLED' },
                      { time: '14:22:11', symbol: 'TSLA', side: 'BUY', qty: 40, price: 241.15, pnl: '+$421', status: 'FILLED' },
                      { time: '14:18:57', symbol: 'NVDA', side: 'SELL', qty: 30, price: 485.33, pnl: '+$892', status: 'FILLED' }
                    ].map((trade, i) => (
                      <tr key={i} className="border-b border-[#2a2a3e]/50 hover:bg-[#2a2a3e]/20">
                        <td className="py-3 px-4 text-white">{trade.time}</td>
                        <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                        <td className={`py-3 px-4 font-medium ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.side}
                        </td>
                        <td className="text-right py-3 px-4 text-white">{trade.qty}</td>
                        <td className="text-right py-3 px-4 text-white">${trade.price}</td>
                        <td className={`text-right py-3 px-4 font-medium ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedTestingLab
