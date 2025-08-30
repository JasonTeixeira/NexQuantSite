"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedGradientBackground, SURREAL_PALETTES } from './surreal-visualizations'

// 🎯 TEST STATUS TYPES
type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'warning'

interface TestResult {
  id: string
  name: string
  status: TestStatus
  duration: number
  coverage: number
  assertions: number
  errors?: string[]
  performance?: {
    memory: number
    cpu: number
    renderTime: number
  }
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestResult[]
  totalDuration: number
  passRate: number
}

// 🌟 BEAUTIFUL TEST STATUS INDICATOR
const TestStatusIndicator: React.FC<{ status: TestStatus, size?: 'sm' | 'md' | 'lg' }> = ({ 
  status, 
  size = 'md' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const statusConfig = {
    idle: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/20' },
    running: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    passed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/20' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/20' },
    warning: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/20' }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizes[size],
        config.bg,
        status === 'running' && 'animate-pulse'
      )}
      animate={status === 'running' ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 1, repeat: status === 'running' ? Infinity : 0 }}
    >
      <Icon className={cn(sizes[size === 'lg' ? 'md' : 'sm'], config.color)} />
    </motion.div>
  )
}

// 🎭 SURREAL TEST RUNNER
interface SurrealTestRunnerProps {
  testSuites: TestSuite[]
  onRunTests: (suiteId?: string) => void
  isRunning: boolean
}

export const SurrealTestRunner: React.FC<SurrealTestRunnerProps> = ({
  testSuites,
  onRunTests,
  isRunning
}) => {
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null)
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set())

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0)
  const passedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'passed').length, 0
  )
  const failedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'failed').length, 0
  )

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 rounded-2xl overflow-hidden">
      <AnimatedGradientBackground palette="cyberpunk" />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Test Command Center
            </h2>
            <p className="text-slate-400 font-mono text-sm mt-1">
              Beautiful testing for beautiful code
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => onRunTests()}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-medium transition-all duration-200",
                isRunning
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:scale-105 shadow-lg"
              )}
              whileHover={{ scale: isRunning ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Running...' : 'Run All Tests'}
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">{totalTests}</div>
                <div className="text-sm text-slate-400">Total Tests</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">{passedTests}</div>
                <div className="text-sm text-slate-400">Passed</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-black/30 backdrop-blur-sm border border-red-500/30 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">{failedTests}</div>
                <div className="text-sm text-slate-400">Failed</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </div>
                <div className="text-sm text-slate-400">Pass Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Test Suites */}
        <div className="space-y-6">
          {testSuites.map((suite) => (
            <motion.div
              key={suite.id}
              className="bg-black/20 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ borderColor: 'rgba(0, 187, 255, 0.3)' }}
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setSelectedSuite(selectedSuite === suite.id ? null : suite.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TestStatusIndicator 
                      status={suite.passRate === 100 ? 'passed' : suite.passRate === 0 ? 'failed' : 'warning'} 
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white font-mono">{suite.name}</h3>
                      <p className="text-slate-400 text-sm">{suite.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm font-mono">
                    <div className="text-center">
                      <div className="text-white font-bold">{suite.tests.length}</div>
                      <div className="text-slate-400">Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{suite.passRate.toFixed(1)}%</div>
                      <div className="text-slate-400">Pass Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{suite.totalDuration}ms</div>
                      <div className="text-slate-400">Duration</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Test Details */}
              <AnimatePresence>
                {selectedSuite === suite.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-700/50"
                  >
                    <div className="p-6 space-y-3">
                      {suite.tests.map((test) => (
                        <motion.div
                          key={test.id}
                          className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <div className="flex items-center gap-3">
                            <TestStatusIndicator status={test.status} />
                            <div>
                              <div className="font-mono text-white">{test.name}</div>
                              {test.errors && test.errors.length > 0 && (
                                <div className="text-red-400 text-xs mt-1">
                                  {test.errors[0]}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                            <span>{test.duration}ms</span>
                            <span>{test.coverage}% coverage</span>
                            <span>{test.assertions} assertions</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 🎨 BEAUTIFUL COVERAGE VISUALIZATION
interface CoverageVisualizationProps {
  coverageData: Array<{
    file: string
    lines: number
    covered: number
    functions: number
    functionsCovered: number
    branches: number
    branchesCovered: number
  }>
}

export const BeautifulCoverageVisualization: React.FC<CoverageVisualizationProps> = ({
  coverageData
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl overflow-hidden">
      <AnimatedGradientBackground palette="aurora" />
      
      <div className="relative z-10 p-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
          Code Coverage Visualization
        </h3>
        
        <div className="space-y-4">
          {coverageData.map((file) => {
            const lineCoverage = (file.covered / file.lines) * 100
            const functionCoverage = (file.functionsCovered / file.functions) * 100
            const branchCoverage = (file.branchesCovered / file.branches) * 100
            
            return (
              <motion.div
                key={file.file}
                className="bg-black/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
                whileHover={{ borderColor: 'rgba(0, 255, 0, 0.3)' }}
                onClick={() => setSelectedFile(selectedFile === file.file ? null : file.file)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-white font-medium">{file.file}</div>
                  <div className="text-sm text-slate-400 font-mono">
                    {lineCoverage.toFixed(1)}% coverage
                  </div>
                </div>
                
                {/* Coverage bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-xs text-slate-400 font-mono">Lines</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${lineCoverage}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                      />
                    </div>
                    <div className="w-12 text-xs text-white font-mono text-right">
                      {lineCoverage.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-xs text-slate-400 font-mono">Functions</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${functionCoverage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <div className="w-12 text-xs text-white font-mono text-right">
                      {functionCoverage.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-xs text-slate-400 font-mono">Branches</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${branchCoverage}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <div className="w-12 text-xs text-white font-mono text-right">
                      {branchCoverage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 🚀 PERFORMANCE TESTING VISUALIZATION
interface PerformanceTestProps {
  performanceData: Array<{
    test: string
    renderTime: number
    memoryUsage: number
    cpuUsage: number
    threshold: number
    status: 'pass' | 'fail' | 'warning'
  }>
}

export const PerformanceTestVisualization: React.FC<PerformanceTestProps> = ({
  performanceData
}) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 rounded-2xl overflow-hidden">
      <AnimatedGradientBackground palette="fire" />
      
      <div className="relative z-10 p-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent mb-6">
          Performance Testing
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceData.map((test) => (
            <motion.div
              key={test.test}
              className="bg-black/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-white font-medium">{test.test}</div>
                <TestStatusIndicator 
                  status={test.status === 'pass' ? 'passed' : test.status === 'fail' ? 'failed' : 'warning'} 
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Render Time</span>
                    <span className="text-white font-mono">{test.renderTime}ms</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full",
                        test.renderTime > test.threshold 
                          ? "bg-gradient-to-r from-red-400 to-red-600"
                          : "bg-gradient-to-r from-green-400 to-green-600"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((test.renderTime / test.threshold) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Memory Usage</span>
                    <span className="text-white font-mono">{test.memoryUsage}MB</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${test.memoryUsage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-white font-mono">{test.cpuUsage}%</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${test.cpuUsage}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Components are already exported above
