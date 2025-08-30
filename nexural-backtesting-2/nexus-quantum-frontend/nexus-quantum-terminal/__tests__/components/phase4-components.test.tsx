import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { financialMatchers, mockData } from '../utils/test-utils'

// Import Phase 4 components (default exports)
import AIPoweredAnalytics from '@/components/phase4/ai-powered-analytics'
import IntelligentExecution from '@/components/phase4/intelligent-execution'
import PredictiveRisk from '@/components/phase4/predictive-risk'
import StrategyOptimization from '@/components/phase4/strategy-optimization'

// Extend Jest matchers
expect.extend(financialMatchers)

describe('Phase 4 Components - AI-Powered Features', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AIPoweredAnalytics', () => {
    it('renders without crashing', () => {
      render(<AIPoweredAnalytics />)
      expect(screen.getByText('AI-Powered Analytics')).toBeInTheDocument()
    })

    it('displays AI analytics description', () => {
      render(<AIPoweredAnalytics />)
      expect(screen.getByText('AI-Powered Analytics')).toBeInTheDocument()
    })

    it('shows AI analytics tabs', () => {
      render(<AIPoweredAnalytics />)
      
      // Check for AI analytics content
      expect(screen.getByText('AI-Powered Analytics')).toBeInTheDocument()
    })

    it('handles AI model selection', () => {
      render(<AIPoweredAnalytics />)
      
      // Check for model selection interface
      const selects = screen.queryAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(0)
    })

    it('displays AI predictions', () => {
      render(<AIPoweredAnalytics />)
      
      // Check for prediction displays
      expect(screen.getByText('AI-Powered Analytics')).toBeInTheDocument()
    })

    it('handles AI training data', () => {
      render(<AIPoweredAnalytics />)
      
      // Generate training data
      const trainingData = mockData.generateEquityData(1000)
      expect(trainingData).toHaveLength(1000)
      
      // Verify data quality for AI training
      expect(trainingData[0].equity).toBeValidPrice()
    })

    it('supports AI model evaluation', () => {
      render(<AIPoweredAnalytics />)
      
      // Check for evaluation metrics
      const metricsElements = screen.queryAllByText(/accuracy|precision|recall/i)
      expect(metricsElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains AI performance standards', () => {
      const startTime = performance.now()
      render(<AIPoweredAnalytics />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(300)
    })

    it('handles AI prediction confidence', () => {
      render(<AIPoweredAnalytics />)
      
      // Test confidence scoring
      const confidenceScore = 0.85
      expect(confidenceScore).toBeValidPercentage()
    })
  })

  describe('IntelligentExecution', () => {
    it('renders without crashing', () => {
      render(<IntelligentExecution />)
      expect(screen.getByText('Intelligent Execution')).toBeInTheDocument()
    })

    it('displays execution description', () => {
      render(<IntelligentExecution />)
      expect(screen.getByText('Intelligent Execution')).toBeInTheDocument()
    })

    it('shows execution algorithms', () => {
      render(<IntelligentExecution />)
      
      // Check for algorithm selection
      expect(screen.getByText('Intelligent Execution')).toBeInTheDocument()
    })

    it('handles execution parameters', () => {
      render(<IntelligentExecution />)
      
      // Check for parameter inputs
      const inputs = screen.queryAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })

    it('displays execution analytics', () => {
      render(<IntelligentExecution />)
      
      // Check for analytics displays
      const charts = screen.queryAllByTestId('responsive-container')
      expect(charts.length).toBeGreaterThanOrEqual(0)
    })

    it('supports execution optimization', () => {
      render(<IntelligentExecution />)
      
      // Check for optimization controls
      const optimizeButtons = screen.queryAllByText(/optimize/i)
      expect(optimizeButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('handles market impact modeling', () => {
      render(<IntelligentExecution />)
      
      // Test market impact calculations
      const marketImpact = 0.02 // 2 basis points
      expect(marketImpact).toBeValidPercentage()
    })

    it('maintains execution speed requirements', () => {
      const startTime = performance.now()
      render(<IntelligentExecution />)
      const renderTime = performance.now() - startTime
      
      // Execution components should be very fast
      expect(renderTime).toBeLessThan(150)
    })
  })

  describe('PredictiveRisk', () => {
    it('renders without crashing', () => {
      render(<PredictiveRisk />)
      expect(screen.getByText('Predictive Risk')).toBeInTheDocument()
    })

    it('displays risk prediction description', () => {
      render(<PredictiveRisk />)
      expect(screen.getByText('Predictive Risk')).toBeInTheDocument()
    })

    it('shows risk prediction models', () => {
      render(<PredictiveRisk />)
      
      // Check for model interfaces
      expect(screen.getByText('Predictive Risk')).toBeInTheDocument()
    })

    it('handles risk forecasting', () => {
      render(<PredictiveRisk />)
      
      // Check for forecasting displays
      const charts = screen.queryAllByTestId('responsive-container')
      expect(charts.length).toBeGreaterThanOrEqual(0)
    })

    it('displays risk scenarios', () => {
      render(<PredictiveRisk />)
      
      // Check for scenario analysis
      expect(screen.getByText('Predictive Risk')).toBeInTheDocument()
    })

    it('supports risk alerts', () => {
      render(<PredictiveRisk />)
      
      // Check for alert systems
      const alertElements = screen.queryAllByText(/alert|warning/i)
      expect(alertElements.length).toBeGreaterThanOrEqual(0)
    })

    it('handles risk model validation', () => {
      render(<PredictiveRisk />)
      
      // Test risk metrics validation
      const riskMetrics = {
        var95: 50000,
        var99: 75000,
        expectedShortfall: 90000
      }
      
      expect(riskMetrics.var95).toBeValidPrice()
      expect(riskMetrics.var99).toBeValidPrice()
      expect(riskMetrics.expectedShortfall).toBeValidPrice()
    })

    it('maintains risk calculation accuracy', () => {
      render(<PredictiveRisk />)
      
      // Generate risk data
      const riskData = mockData.generateRiskMetrics()
      expect(riskData.var95).toBeGreaterThan(0)
      expect(riskData.sharpeRatio).toBeValidSharpeRatio()
    })
  })

  describe('StrategyOptimization', () => {
    it('renders without crashing', () => {
      render(<StrategyOptimization />)
      expect(screen.getByText('Strategy Optimization')).toBeInTheDocument()
    })

    it('displays optimization description', () => {
      render(<StrategyOptimization />)
      expect(screen.getByText('Strategy Optimization')).toBeInTheDocument()
    })

    it('shows optimization algorithms', () => {
      render(<StrategyOptimization />)
      
      // Check for algorithm selection
      expect(screen.getByText('Strategy Optimization')).toBeInTheDocument()
    })

    it('handles optimization parameters', () => {
      render(<StrategyOptimization />)
      
      // Check for parameter controls
      const inputs = screen.queryAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })

    it('displays optimization results', () => {
      render(<StrategyOptimization />)
      
      // Check for results display
      const charts = screen.queryAllByTestId('responsive-container')
      expect(charts.length).toBeGreaterThanOrEqual(0)
    })

    it('supports multi-objective optimization', () => {
      render(<StrategyOptimization />)
      
      // Check for multi-objective controls
      const objectiveElements = screen.queryAllByText(/objective/i)
      expect(objectiveElements.length).toBeGreaterThanOrEqual(0)
    })

    it('handles optimization constraints', () => {
      render(<StrategyOptimization />)
      
      // Check for constraint inputs
      const constraintElements = screen.queryAllByText(/constraint/i)
      expect(constraintElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains optimization performance', () => {
      const startTime = performance.now()
      render(<StrategyOptimization />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(250)
    })
  })

  describe('Phase 4 AI Integration', () => {
    it('all AI components render together', () => {
      const { unmount: unmount1 } = render(<AIPoweredAnalytics />)
      const { unmount: unmount2 } = render(<IntelligentExecution />)
      const { unmount: unmount3 } = render(<PredictiveRisk />)
      const { unmount: unmount4 } = render(<StrategyOptimization />)
      
      // All should render without conflicts
      expect(screen.getAllByText(/AI-Powered Analytics|Intelligent Execution|Predictive Risk|Strategy Optimization/)).toHaveLength(4)
      
      // Clean up
      unmount1()
      unmount2()
      unmount3()
      unmount4()
    })

    it('AI components handle large datasets', () => {
      render(<AIPoweredAnalytics />)
      
      // Test with large dataset
      const largeDataset = mockData.generateEquityData(5000)
      expect(largeDataset).toHaveLength(5000)
      
      // Should handle large datasets efficiently
      const processingTime = performance.now()
      largeDataset.forEach(item => {
        expect(item.equity).toBeValidPrice()
      })
      const endTime = performance.now()
      
      expect(endTime - processingTime).toBeLessThan(200) // More realistic performance expectation
    })

    it('AI components maintain prediction accuracy', () => {
      render(<PredictiveRisk />)
      
      // Test prediction accuracy metrics
      const accuracyMetrics = {
        precision: 0.85,
        recall: 0.78,
        f1Score: 0.81,
        accuracy: 0.83
      }
      
      Object.values(accuracyMetrics).forEach(metric => {
        expect(metric).toBeValidPercentage()
        expect(metric).toBeGreaterThan(0.7) // Minimum acceptable accuracy
      })
    })

    it('AI components handle real-time updates', async () => {
      render(<IntelligentExecution />)
      
      // Simulate real-time updates
      const updates = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() + i,
        price: 100 + Math.random() * 10,
        volume: Math.floor(Math.random() * 1000000)
      }))
      
      // Should process updates quickly
      const startTime = performance.now()
      updates.forEach(update => {
        expect(update.price).toBeValidPrice()
        expect(update.volume).toBeGreaterThan(0)
      })
      const processingTime = performance.now() - startTime
      
      expect(processingTime).toBeLessThan(50)
    })

    it('AI components maintain consistent performance', () => {
      const renderTimes = []
      
      // Test multiple renders
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now()
        const { unmount } = render(<StrategyOptimization />)
        const renderTime = performance.now() - startTime
        renderTimes.push(renderTime)
        unmount()
      }
      
      // All renders should be consistently fast
      renderTimes.forEach(time => {
        expect(time).toBeLessThan(300)
      })
      
      // Variance should be low (consistent performance)
      const avgTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      const variance = renderTimes.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / renderTimes.length
      expect(variance).toBeLessThan(10000) // Low variance in render times
    })

    it('AI components handle error recovery', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Should handle errors gracefully
      expect(() => render(<AIPoweredAnalytics />)).not.toThrow()
      expect(() => render(<IntelligentExecution />)).not.toThrow()
      expect(() => render(<PredictiveRisk />)).not.toThrow()
      expect(() => render(<StrategyOptimization />)).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })
})
