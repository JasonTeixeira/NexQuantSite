"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SurrealPerformanceChart,
  LiquidRiskGauge,
  SurrealCorrelationMatrix,
  SurrealTradingFlow,
  PortfolioUniverse
} from './surreal-visualizations'
import {
  SurrealTestRunner,
  BeautifulCoverageVisualization,
  PerformanceTestVisualization
} from './beautiful-testing'
import { ResponsiveGrid } from './responsive-layout'

// 🎯 MOCK DATA FOR DEMONSTRATIONS
const mockPerformanceData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  portfolio: 100 + Math.random() * 20 - 10 + i * 0.5,
  benchmark: 100 + Math.random() * 15 - 7.5 + i * 0.3,
  drawdown: Math.random() * -15,
  volume: Math.random() * 1000000
}))

const mockCorrelationData = [
  { asset1: 'AAPL', asset2: 'MSFT', correlation: 0.85 },
  { asset1: 'AAPL', asset2: 'GOOGL', correlation: 0.72 },
  { asset1: 'AAPL', asset2: 'TSLA', correlation: 0.45 },
  { asset1: 'MSFT', asset2: 'GOOGL', correlation: 0.78 },
  { asset1: 'MSFT', asset2: 'TSLA', correlation: 0.32 },
  { asset1: 'GOOGL', asset2: 'TSLA', correlation: 0.28 },
]

const mockTradingData = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  symbol: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'][Math.floor(Math.random() * 5)],
  side: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy' | 'sell',
  quantity: Math.floor(Math.random() * 1000) + 100,
  price: Math.random() * 500 + 100,
  timestamp: Date.now() - Math.random() * 86400000
}))

const mockPortfolioData = [
  { symbol: 'AAPL', weight: 25, return: 12.5, risk: 18.2, sector: 'Technology' },
  { symbol: 'MSFT', weight: 20, return: 15.8, risk: 16.5, sector: 'Technology' },
  { symbol: 'GOOGL', weight: 15, return: 8.3, risk: 22.1, sector: 'Technology' },
  { symbol: 'TSLA', weight: 10, return: 45.2, risk: 35.8, sector: 'Consumer' },
  { symbol: 'JPM', weight: 12, return: 6.8, risk: 12.3, sector: 'Finance' },
  { symbol: 'JNJ', weight: 8, return: 4.2, risk: 8.7, sector: 'Healthcare' },
  { symbol: 'XOM', weight: 10, return: -2.1, risk: 28.5, sector: 'Energy' },
]

const mockTestSuites = [
  {
    id: 'ui-components',
    name: 'UI Components',
    description: 'Testing all UI components and interactions',
    totalDuration: 2450,
    passRate: 95.5,
    tests: [
      { id: '1', name: 'Button Component', status: 'passed' as const, duration: 120, coverage: 98, assertions: 15 },
      { id: '2', name: 'Chart Component', status: 'passed' as const, duration: 340, coverage: 92, assertions: 28 },
      { id: '3', name: 'Modal Component', status: 'failed' as const, duration: 180, coverage: 85, assertions: 12, errors: ['Modal does not close on escape key'] },
      { id: '4', name: 'Form Validation', status: 'passed' as const, duration: 220, coverage: 96, assertions: 22 },
    ]
  },
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Testing data adapters and processing logic',
    totalDuration: 1850,
    passRate: 100,
    tests: [
      { id: '5', name: 'Market Data Adapter', status: 'passed' as const, duration: 450, coverage: 94, assertions: 35 },
      { id: '6', name: 'Portfolio Calculator', status: 'passed' as const, duration: 380, coverage: 98, assertions: 42 },
      { id: '7', name: 'Risk Metrics', status: 'passed' as const, duration: 290, coverage: 91, assertions: 28 },
    ]
  }
]

const mockCoverageData = [
  { file: 'components/ui/button.tsx', lines: 120, covered: 118, functions: 8, functionsCovered: 8, branches: 15, branchesCovered: 14 },
  { file: 'components/charts/performance.tsx', lines: 280, covered: 258, functions: 12, functionsCovered: 11, branches: 28, branchesCovered: 25 },
  { file: 'lib/data-adapters.ts', lines: 450, covered: 423, functions: 25, functionsCovered: 24, branches: 45, branchesCovered: 42 },
  { file: 'hooks/use-performance.ts', lines: 180, covered: 172, functions: 6, functionsCovered: 6, branches: 12, branchesCovered: 11 },
]

const mockPerformanceTests = [
  { test: 'Chart Rendering', renderTime: 45, memoryUsage: 12, cpuUsage: 25, threshold: 100, status: 'pass' as const },
  { test: 'Data Table Scroll', renderTime: 180, memoryUsage: 35, cpuUsage: 45, threshold: 200, status: 'warning' as const },
  { test: 'Modal Animation', renderTime: 25, memoryUsage: 8, cpuUsage: 15, threshold: 50, status: 'pass' as const },
  { test: 'Large Dataset Load', renderTime: 850, memoryUsage: 85, cpuUsage: 78, threshold: 500, status: 'fail' as const },
]

export const SurrealShowcase: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'visualizations' | 'testing'>('visualizations')
  const [isTestRunning, setIsTestRunning] = useState(false)

  const handleRunTests = () => {
    setIsTestRunning(true)
    setTimeout(() => setIsTestRunning(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-neon-glow"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            SURREAL VISUALIZATIONS
          </motion.h1>
          <motion.p
            className="text-xl text-slate-300 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Beautiful • Professional • Real-World Usable • 99+ Level
          </motion.p>
        </div>

        {/* Section Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 flex gap-2">
            <button
              onClick={() => setActiveSection('visualizations')}
              className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${
                activeSection === 'visualizations'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Data Visualizations
            </button>
            <button
              onClick={() => setActiveSection('testing')}
              className={`px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${
                activeSection === 'testing'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Testing Framework
            </button>
          </div>
        </div>

        {/* Content */}
        {activeSection === 'visualizations' ? (
          <motion.div
            key="visualizations"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Performance Chart */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">
                🚀 Surreal Performance Chart
              </h2>
              <SurrealPerformanceChart 
                data={mockPerformanceData}
                height={400}
                palette="aurora"
              />
            </div>

            {/* Risk Gauges */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">
                🌊 Liquid Risk Gauges
              </h2>
              <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 4 }} gap="lg">
                <LiquidRiskGauge value={75} max={100} label="VaR Risk" color="#00ffff" />
                <LiquidRiskGauge value={45} max={100} label="Liquidity Risk" color="#ff00ff" />
                <LiquidRiskGauge value={92} max={100} label="Credit Risk" color="#ffff00" />
                <LiquidRiskGauge value={28} max={100} label="Market Risk" color="#00ff00" />
              </ResponsiveGrid>
            </div>

            {/* Correlation Matrix */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">
                🎭 3D Correlation Matrix
              </h2>
              <SurrealCorrelationMatrix data={mockCorrelationData} />
            </div>

            {/* Trading Flow & Portfolio Universe */}
            <ResponsiveGrid cols={{ xs: 1, lg: 2 }} gap="lg">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 font-mono">
                  🚀 Real-Time Trading Flow
                </h2>
                <SurrealTradingFlow trades={mockTradingData} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4 font-mono">
                  🌌 Portfolio Universe
                </h2>
                <PortfolioUniverse positions={mockPortfolioData} />
              </div>
            </ResponsiveGrid>
          </motion.div>
        ) : (
          <motion.div
            key="testing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Test Runner */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 font-mono">
                🎯 Surreal Test Runner
              </h2>
              <SurrealTestRunner
                testSuites={mockTestSuites}
                onRunTests={handleRunTests}
                isRunning={isTestRunning}
              />
            </div>

            {/* Coverage & Performance */}
            <ResponsiveGrid cols={{ xs: 1, lg: 2 }} gap="lg">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 font-mono">
                  🎨 Coverage Visualization
                </h2>
                <BeautifulCoverageVisualization coverageData={mockCoverageData} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4 font-mono">
                  🚀 Performance Testing
                </h2>
                <PerformanceTestVisualization performanceData={mockPerformanceTests} />
              </div>
            </ResponsiveGrid>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="text-center mt-20 pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="text-slate-400 font-mono text-sm">
            Built with ❤️ for institutional-grade quantitative trading
          </div>
          <div className="text-slate-500 font-mono text-xs mt-2">
            99+ Level • Beautiful • Professional • Real-World Usable
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SurrealShowcase
