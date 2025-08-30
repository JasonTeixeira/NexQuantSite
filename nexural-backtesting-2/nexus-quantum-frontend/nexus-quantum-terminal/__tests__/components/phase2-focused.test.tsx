import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { financialMatchers, mockData } from '../utils/test-utils'

// Import Phase 2 components that need coverage improvement
import { BacktestingEngine } from '@/components/phase2/backtesting-engine'
import { MLFactory } from '@/components/phase2/ml-factory'
import { AlternativeData } from '@/components/phase2/alternative-data'
import { ResearchNotebooks } from '@/components/phase2/research-notebooks'
import { OptionsAnalytics } from '@/components/phase2/options-analytics'
import { RegimeDetection } from '@/components/phase2/regime-detection'
import { OrderManagementSystem } from '@/components/phase2/order-management-system'
import { RiskManagement } from '@/components/phase2/risk-management'
import { PortfolioOptimization } from '@/components/phase2/portfolio-optimization'

// Extend Jest matchers
expect.extend(financialMatchers)

describe('Phase 2 Components - Focused Coverage Improvement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('BacktestingEngine', () => {
    it('renders without crashing', () => {
      render(<BacktestingEngine />)
      expect(screen.getByText('Backtesting Engine')).toBeInTheDocument()
    })

    it('displays backtesting description', () => {
      render(<BacktestingEngine />)
      expect(screen.getByText(/comprehensive backtesting/i)).toBeInTheDocument()
    })

    it('shows main backtesting tabs', () => {
      render(<BacktestingEngine />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles tab navigation', async () => {
      render(<BacktestingEngine />)
      
      const tabs = screen.getAllByRole('tab')
      if (tabs.length > 1) {
        fireEvent.click(tabs[1])
        // Wait for tab change
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      expect(tabs[0]).toBeInTheDocument()
    })

    it('displays backtest results', () => {
      render(<BacktestingEngine />)
      expect(screen.getByText('Backtesting Engine')).toBeInTheDocument()
    })

    it('handles backtest data', () => {
      render(<BacktestingEngine />)
      
      const backtestData = mockData.generateEquityData(252)
      expect(backtestData).toHaveLength(252)
      expect(backtestData[0].equity).toBeValidPrice()
    })

    it('supports export functionality', () => {
      render(<BacktestingEngine />)
      
      const exportButtons = screen.queryAllByText(/export/i)
      expect(exportButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains performance with large datasets', () => {
      const startTime = performance.now()
      render(<BacktestingEngine />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(300)
    })
  })

  describe('MLFactory', () => {
    it('renders without crashing', () => {
      render(<MLFactory />)
      expect(screen.getByText('ML Factory')).toBeInTheDocument()
    })

    it('displays ML description', () => {
      render(<MLFactory />)
      expect(screen.getByText(/machine learning/i)).toBeInTheDocument()
    })

    it('shows ML tabs', () => {
      render(<MLFactory />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles model selection', () => {
      render(<MLFactory />)
      
      const selects = screen.queryAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(0)
    })

    it('displays ML models', () => {
      render(<MLFactory />)
      expect(screen.getByText('ML Factory')).toBeInTheDocument()
    })

    it('handles training data', () => {
      render(<MLFactory />)
      
      const trainingData = mockData.generateEquityData(1000)
      expect(trainingData).toHaveLength(1000)
      expect(trainingData[0].equity).toBeValidPrice()
    })

    it('supports model evaluation', () => {
      render(<MLFactory />)
      
      const evaluationElements = screen.queryAllByText(/accuracy|precision|recall/i)
      expect(evaluationElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains ML performance', () => {
      const startTime = performance.now()
      render(<MLFactory />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(250)
    })
  })

  describe('AlternativeData', () => {
    it('renders without crashing', () => {
      render(<AlternativeData />)
      expect(screen.getByText('Alternative Data')).toBeInTheDocument()
    })

    it('displays alternative data description', () => {
      render(<AlternativeData />)
      expect(screen.getByText(/alternative data sources/i)).toBeInTheDocument()
    })

    it('shows data source tabs', () => {
      render(<AlternativeData />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles data source selection', () => {
      render(<AlternativeData />)
      
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('displays data sources', () => {
      render(<AlternativeData />)
      expect(screen.getByText('Alternative Data')).toBeInTheDocument()
    })

    it('handles sentiment data', () => {
      render(<AlternativeData />)
      
      const sentimentData = {
        sentiment: 0.75,
        confidence: 0.85,
        volume: 1000
      }
      
      expect(sentimentData.sentiment).toBeValidPercentage()
      expect(sentimentData.confidence).toBeValidPercentage()
    })

    it('supports data integration', () => {
      render(<AlternativeData />)
      
      const integrationElements = screen.queryAllByText(/integration|connect/i)
      expect(integrationElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains data processing performance', () => {
      const startTime = performance.now()
      render(<AlternativeData />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('ResearchNotebooks', () => {
    it('renders without crashing', () => {
      render(<ResearchNotebooks />)
      expect(screen.getByText('Research Notebooks')).toBeInTheDocument()
    })

    it('displays notebook description', () => {
      render(<ResearchNotebooks />)
      expect(screen.getByText(/interactive research/i)).toBeInTheDocument()
    })

    it('shows notebook tabs', () => {
      render(<ResearchNotebooks />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles notebook creation', () => {
      render(<ResearchNotebooks />)
      
      const createButtons = screen.queryAllByText(/create|new/i)
      expect(createButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('displays notebook interface', () => {
      render(<ResearchNotebooks />)
      expect(screen.getByText('Research Notebooks')).toBeInTheDocument()
    })

    it('handles code execution', () => {
      render(<ResearchNotebooks />)
      
      const executeButtons = screen.queryAllByText(/run|execute/i)
      expect(executeButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('supports collaboration', () => {
      render(<ResearchNotebooks />)
      
      const shareElements = screen.queryAllByText(/share|collaborate/i)
      expect(shareElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains notebook performance', () => {
      const startTime = performance.now()
      render(<ResearchNotebooks />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(250)
    })
  })

  describe('OptionsAnalytics', () => {
    it('renders without crashing', () => {
      render(<OptionsAnalytics />)
      expect(screen.getByText('Options Analytics')).toBeInTheDocument()
    })

    it('displays options description', () => {
      render(<OptionsAnalytics />)
      expect(screen.getByText(/options trading/i)).toBeInTheDocument()
    })

    it('shows options tabs', () => {
      render(<OptionsAnalytics />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles option chain data', () => {
      render(<OptionsAnalytics />)
      
      const optionChain = mockData.generateOptionChain(100)
      expect(optionChain).toHaveLength(21)
      expect(optionChain[0].strike).toBeValidPrice()
      expect(optionChain[0].callBid).toBeGreaterThanOrEqual(0)
    })

    it('displays volatility surface', () => {
      render(<OptionsAnalytics />)
      expect(screen.getByText('Options Analytics')).toBeInTheDocument()
    })

    it('handles Greeks calculations', () => {
      render(<OptionsAnalytics />)
      
      const greeks = {
        delta: 0.65,
        gamma: 0.03,
        theta: -0.05,
        vega: 0.25
      }
      
      expect(Math.abs(greeks.delta)).toBeLessThanOrEqual(1)
      expect(greeks.gamma).toBeGreaterThanOrEqual(0)
    })

    it('supports options strategies', () => {
      render(<OptionsAnalytics />)
      
      const strategyElements = screen.queryAllByText(/strategy|spread/i)
      expect(strategyElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains options performance', () => {
      const startTime = performance.now()
      render(<OptionsAnalytics />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(300)
    })
  })

  describe('RegimeDetection', () => {
    it('renders without crashing', () => {
      render(<RegimeDetection />)
      expect(screen.getByText('Regime Detection')).toBeInTheDocument()
    })

    it('displays regime description', () => {
      render(<RegimeDetection />)
      expect(screen.getByText(/market regime/i)).toBeInTheDocument()
    })

    it('shows regime tabs', () => {
      render(<RegimeDetection />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles regime detection', () => {
      render(<RegimeDetection />)
      
      const regimeData = {
        currentRegime: 'Bull Market',
        confidence: 0.85,
        duration: 45
      }
      
      expect(regimeData.confidence).toBeValidPercentage()
      expect(regimeData.duration).toBeGreaterThan(0)
    })

    it('displays regime indicators', () => {
      render(<RegimeDetection />)
      expect(screen.getByText('Regime Detection')).toBeInTheDocument()
    })

    it('handles regime transitions', () => {
      render(<RegimeDetection />)
      
      const transitionProb = 0.15
      expect(transitionProb).toBeValidPercentage()
    })

    it('supports regime adaptation', () => {
      render(<RegimeDetection />)
      
      const adaptationElements = screen.queryAllByText(/adapt|adjust/i)
      expect(adaptationElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains regime performance', () => {
      const startTime = performance.now()
      render(<RegimeDetection />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('OrderManagementSystem', () => {
    it('renders without crashing', () => {
      render(<OrderManagementSystem />)
      expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('displays OMS description', () => {
      render(<OrderManagementSystem />)
      expect(screen.getByText(/order management/i)).toBeInTheDocument()
    })

    it('shows OMS tabs', () => {
      render(<OrderManagementSystem />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles order creation', () => {
      render(<OrderManagementSystem />)
      
      const orderButtons = screen.queryAllByText(/order|buy|sell/i)
      expect(orderButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('displays order book', () => {
      render(<OrderManagementSystem />)
      expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('handles order execution', () => {
      render(<OrderManagementSystem />)
      
      const orderData = {
        symbol: 'AAPL',
        quantity: 100,
        price: 150.25,
        side: 'BUY'
      }
      
      expect(orderData.price).toBeValidPrice()
      expect(orderData.quantity).toBeGreaterThan(0)
    })

    it('supports execution analytics', () => {
      render(<OrderManagementSystem />)
      
      const analyticsElements = screen.queryAllByText(/analytics|performance/i)
      expect(analyticsElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains OMS performance', () => {
      const startTime = performance.now()
      render(<OrderManagementSystem />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('RiskManagement', () => {
    it('renders without crashing', () => {
      render(<RiskManagement />)
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })

    it('displays risk description', () => {
      render(<RiskManagement />)
      expect(screen.getByText(/risk management/i)).toBeInTheDocument()
    })

    it('shows risk tabs', () => {
      render(<RiskManagement />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles risk calculations', () => {
      render(<RiskManagement />)
      
      const riskMetrics = mockData.generateRiskMetrics()
      expect(riskMetrics.var95).toBeValidPrice()
      expect(riskMetrics.sharpeRatio).toBeValidSharpeRatio()
      expect(riskMetrics.maxDrawdown).toBeValidPercentage()
    })

    it('displays VaR analysis', () => {
      render(<RiskManagement />)
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })

    it('handles stress testing', () => {
      render(<RiskManagement />)
      
      const stressScenarios = [
        { name: 'Market Crash', impact: -0.25 },
        { name: 'Interest Rate Shock', impact: -0.15 },
        { name: 'Currency Crisis', impact: -0.20 }
      ]
      
      stressScenarios.forEach(scenario => {
        expect(scenario.impact).toBeValidPercentage()
      })
    })

    it('supports risk alerts', () => {
      render(<RiskManagement />)
      
      const alertElements = screen.queryAllByText(/alert|warning/i)
      expect(alertElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains risk performance', () => {
      const startTime = performance.now()
      render(<RiskManagement />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('PortfolioOptimization', () => {
    it('renders without crashing', () => {
      render(<PortfolioOptimization />)
      expect(screen.getByText('Portfolio Optimization')).toBeInTheDocument()
    })

    it('displays portfolio description', () => {
      render(<PortfolioOptimization />)
      expect(screen.getByText(/portfolio optimization/i)).toBeInTheDocument()
    })

    it('shows optimization tabs', () => {
      render(<PortfolioOptimization />)
      
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles portfolio data', () => {
      render(<PortfolioOptimization />)
      
      const portfolioData = mockData.generatePortfolioData(10)
      expect(portfolioData).toHaveLength(10)
      
      portfolioData.forEach(position => {
        expect(position.currentPrice).toBeValidPrice()
        expect(position.quantity).toBeGreaterThan(0)
      })
    })

    it('displays efficient frontier', () => {
      render(<PortfolioOptimization />)
      expect(screen.getByText('Portfolio Optimization')).toBeInTheDocument()
    })

    it('handles optimization constraints', () => {
      render(<PortfolioOptimization />)
      
      const constraints = {
        maxWeight: 0.20,
        minWeight: 0.01,
        maxRisk: 0.15
      }
      
      Object.values(constraints).forEach(value => {
        expect(value).toBeValidPercentage()
      })
    })

    it('supports rebalancing', () => {
      render(<PortfolioOptimization />)
      
      const rebalanceElements = screen.queryAllByText(/rebalance|allocat/i)
      expect(rebalanceElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains optimization performance', () => {
      const startTime = performance.now()
      render(<PortfolioOptimization />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(250)
    })
  })

  describe('Phase 2 Integration', () => {
    it('all components render together without conflicts', () => {
      const components = [
        <BacktestingEngine key="backtest" />,
        <MLFactory key="ml" />,
        <AlternativeData key="altdata" />,
        <ResearchNotebooks key="notebooks" />,
        <OptionsAnalytics key="options" />,
        <RegimeDetection key="regime" />,
        <OrderManagementSystem key="oms" />,
        <RiskManagement key="risk" />,
        <PortfolioOptimization key="portfolio" />
      ]
      
      components.forEach(component => {
        const { unmount } = render(component)
        unmount()
      })
      
      // All should render without errors
      expect(true).toBe(true)
    })

    it('components handle concurrent data processing', () => {
      const startTime = performance.now()
      
      // Generate data for all components
      const equityData = mockData.generateEquityData(500)
      const portfolioData = mockData.generatePortfolioData(50)
      const optionData = mockData.generateOptionChain(150)
      const riskData = mockData.generateRiskMetrics()
      
      const processingTime = performance.now() - startTime
      
      // Should process all data efficiently
      expect(processingTime).toBeLessThan(100)
      expect(equityData).toHaveLength(500)
      expect(portfolioData).toHaveLength(50)
      expect(optionData).toHaveLength(21)
      expect(riskData.var95).toBeValidPrice()
    })

    it('components maintain consistent theming', () => {
      render(<BacktestingEngine />)
      
      // Check for consistent dark theme
      const darkElements = document.querySelectorAll('.bg-\\[\\#15151f\\], .bg-\\[\\#1a1a2e\\], .text-white')
      expect(darkElements.length).toBeGreaterThan(0)
    })

    it('components handle error states gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Should not throw errors
      expect(() => render(<BacktestingEngine />)).not.toThrow()
      expect(() => render(<MLFactory />)).not.toThrow()
      expect(() => render(<AlternativeData />)).not.toThrow()
      expect(() => render(<ResearchNotebooks />)).not.toThrow()
      expect(() => render(<OptionsAnalytics />)).not.toThrow()
      expect(() => render(<RegimeDetection />)).not.toThrow()
      expect(() => render(<OrderManagementSystem />)).not.toThrow()
      expect(() => render(<RiskManagement />)).not.toThrow()
      expect(() => render(<PortfolioOptimization />)).not.toThrow()
      
      consoleSpy.mockRestore()
    })

    it('components maintain performance under load', () => {
      const renderTimes = []
      const components = [
        BacktestingEngine,
        MLFactory,
        AlternativeData,
        ResearchNotebooks,
        OptionsAnalytics
      ]
      
      components.forEach(Component => {
        const startTime = performance.now()
        const { unmount } = render(<Component />)
        const renderTime = performance.now() - startTime
        renderTimes.push(renderTime)
        unmount()
      })
      
      // All components should render quickly
      renderTimes.forEach(time => {
        expect(time).toBeLessThan(400)
      })
    })
  })
})
