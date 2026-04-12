"use client"

import {
  TrendingUp,
  BarChart3,
  Target,
  CheckCircle,
  Play,
  DollarSign,
  Percent,
  Shield,
  Settings,
  TrendingDown,
  Info,
  Calculator,
  RefreshCw,
  Rocket,
  GraduationCap,
  PlayCircle,
  Database,
  Layers,
  Code,
  Zap,
  Globe,
  Bot,
  FileText,
  RotateCcw,
  Shuffle,
  FastForward,
  TestTube,
  Cpu,
  Star,
  AlertTriangle,
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  Activity,
  Workflow,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Floating particles for background animation
const FloatingParticle = ({ delay = 0, size = "small" }) => {
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
  }, [])

  const particleSize = size === "small" ? "w-1 h-1" : size === "medium" ? "w-2 h-2" : "w-3 h-3"
  const opacity = size === "small" ? "bg-primary/20" : size === "medium" ? "bg-primary/30" : "bg-primary/40"

  return (
    <motion.div
      className={`absolute ${particleSize} ${opacity} rounded-full`}
      initial={{
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        opacity: 0,
      }}
      animate={{
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        repeat: Number.POSITIVE_INFINITY,
        delay: delay,
        ease: "linear",
      }}
    />
  )
}

// Enhanced backtesting types data
const backtestingTypes = [
  {
    id: "simple-historical",
    title: "Simple Historical Backtest",
    icon: TrendingUp,
    emoji: "📈",
    description:
      "The foundation of all backtesting. Test your strategy against historical price data to evaluate past performance.",
    features: ["Basic buy/sell signal testing", "P&L calculation", "Win rate analysis", "Drawdown measurement"],
    codeExample: `backtest.run(strategy="MA_Cross",
  data=historical_prices,
  initial_capital=100000)`,
    complexity: "Beginner",
    speed: 5,
    accuracy: 3,
    detailedDescription:
      "Simple historical backtesting is the most fundamental approach to strategy validation. It involves running your trading algorithm against historical market data to see how it would have performed in the past. This method assumes perfect execution with no slippage or market impact, making it ideal for initial strategy evaluation. While it provides a good starting point, it's important to understand its limitations - past performance doesn't guarantee future results, and real-world trading involves complexities not captured in simple backtests.",
    useCases: [
      "Initial strategy validation",
      "Quick performance assessment",
      "Educational purposes",
      "Proof of concept development",
    ],
    limitations: [
      "Doesn't account for market impact",
      "Assumes perfect execution",
      "May suffer from survivorship bias",
      "Limited real-world applicability",
    ],
    bestPractices: [
      "Use high-quality, clean data",
      "Account for transaction costs",
      "Test across multiple time periods",
      "Validate assumptions regularly",
    ],
  },
  {
    id: "walk-forward",
    title: "Walk-Forward Analysis",
    icon: RotateCcw,
    emoji: "🔄",
    description:
      "Rolling window optimization that adapts parameters over time, preventing overfitting and ensuring robustness.",
    features: [
      "In-sample optimization",
      "Out-of-sample validation",
      "Parameter stability testing",
      "Adaptive strategy tuning",
    ],
    codeExample: `walk_forward.optimize(
  window_size=252,
  step_size=21,
  optimization="sharpe")`,
    complexity: "Intermediate",
    speed: 3,
    accuracy: 5,
    detailedDescription:
      "Walk-forward analysis is a sophisticated backtesting technique that addresses the overfitting problem inherent in traditional backtesting. It divides historical data into multiple periods, optimizing strategy parameters on one period (in-sample) and testing on the subsequent period (out-of-sample). This process rolls forward through time, providing a more realistic assessment of how a strategy would perform with periodic reoptimization.",
    useCases: [
      "Parameter optimization validation",
      "Adaptive strategy development",
      "Institutional strategy deployment",
      "Risk management assessment",
    ],
    limitations: [
      "Computationally intensive",
      "Requires longer historical datasets",
      "May show parameter instability",
      "Complex implementation",
    ],
    bestPractices: [
      "Use appropriate window sizes",
      "Maintain consistent reoptimization frequency",
      "Monitor parameter stability",
      "Account for transaction costs in optimization",
    ],
  },
  {
    id: "monte-carlo",
    title: "Monte Carlo Simulation",
    icon: Shuffle,
    emoji: "🎲",
    description:
      "Generate thousands of random market scenarios to understand your strategy's behavior under uncertainty.",
    features: ["Path-dependent analysis", "Risk distribution modeling", "Confidence intervals", "Worst-case scenarios"],
    codeExample: `monte_carlo.simulate(
  iterations=10000,
  confidence_level=0.95,
  method="bootstrap")`,
    complexity: "Advanced",
    speed: 2,
    accuracy: 5,
    detailedDescription:
      "Monte Carlo simulation is a powerful statistical technique that generates thousands of possible market scenarios to test strategy robustness. By randomly sampling from historical returns or using stochastic models, it creates multiple potential future paths for asset prices. This approach helps quantify the uncertainty in backtesting results and provides confidence intervals for performance metrics.",
    useCases: [
      "Risk assessment and VaR calculation",
      "Portfolio optimization",
      "Stress testing strategies",
      "Capital allocation decisions",
    ],
    limitations: [
      "Assumes historical patterns persist",
      "Computationally expensive",
      "Model selection critical",
      "May not capture regime changes",
    ],
    bestPractices: [
      "Use sufficient simulation runs (10,000+)",
      "Validate underlying assumptions",
      "Consider multiple stochastic models",
      "Account for parameter uncertainty",
    ],
  },
  {
    id: "multi-market",
    title: "Multi-Market Backtesting",
    icon: Globe,
    emoji: "🌐",
    description: "Test strategies across multiple markets, timeframes, and asset classes for true robustness.",
    features: ["Cross-market correlation", "Portfolio-level metrics", "Currency adjustment", "Market regime analysis"],
    codeExample: `multi_market.test(
  markets=["SPY", "GLD", "TLT"],
  correlations=True,
  rebalance="monthly")`,
    complexity: "Advanced",
    speed: 3,
    accuracy: 4,
    detailedDescription:
      "Multi-market backtesting extends strategy validation across different markets, asset classes, and geographical regions. This comprehensive approach reveals how strategies perform under various market conditions and helps identify universal patterns versus market-specific anomalies.",
    useCases: [
      "Global portfolio strategies",
      "Cross-asset momentum strategies",
      "Diversification analysis",
      "Multi-manager allocation",
    ],
    limitations: [
      "Data synchronization challenges",
      "Currency conversion complexity",
      "Different market microstructures",
      "Regulatory differences",
    ],
    bestPractices: [
      "Ensure data quality across markets",
      "Account for time zone differences",
      "Consider transaction costs per market",
      "Validate correlation assumptions",
    ],
  },
  {
    id: "event-driven",
    title: "Event-Driven Backtesting",
    icon: Zap,
    emoji: "⚡",
    description: "Simulate real market microstructure with tick-by-tick data, order books, and latency modeling.",
    features: ["Order book simulation", "Market impact modeling", "Latency effects", "Realistic fill prices"],
    codeExample: `event_backtest.run(
  tick_data=True,
  latency_ms=5,
  slippage_model="linear")`,
    complexity: "Expert",
    speed: 1,
    accuracy: 5,
    detailedDescription:
      "Event-driven backtesting represents the most sophisticated approach to strategy validation, simulating the actual market microstructure with tick-by-tick precision. This method models order books, market impact, latency effects, and realistic execution scenarios.",
    useCases: [
      "High-frequency trading strategies",
      "Market making algorithms",
      "Execution algorithm development",
      "Institutional trading systems",
    ],
    limitations: [
      "Extremely data intensive",
      "High computational requirements",
      "Complex implementation",
      "Expensive tick data requirements",
    ],
    bestPractices: [
      "Use high-quality tick data",
      "Model realistic latency",
      "Include market impact models",
      "Validate against live trading",
    ],
  },
  {
    id: "ml-enhanced",
    title: "ML-Enhanced Backtesting",
    icon: Bot,
    emoji: "🤖",
    description: "Advanced testing for machine learning strategies with proper train/test splits and cross-validation.",
    features: [
      "Time series cross-validation",
      "Feature importance analysis",
      "Model decay testing",
      "Ensemble validation",
    ],
    codeExample: `ml_backtest.validate(
  model=xgboost_model,
  cv_splits=5,
  purge_days=10)`,
    complexity: "Expert",
    speed: 2,
    accuracy: 4,
    detailedDescription:
      "ML-enhanced backtesting addresses the unique challenges of validating machine learning-based trading strategies. Traditional backtesting methods are insufficient for ML models due to data leakage, overfitting, and temporal dependencies.",
    useCases: [
      "Quantitative factor models",
      "Alternative data strategies",
      "Sentiment-based trading",
      "Pattern recognition systems",
    ],
    limitations: [
      "Complex validation requirements",
      "Feature engineering challenges",
      "Model interpretability issues",
      "Regime change sensitivity",
    ],
    bestPractices: [
      "Use proper time series CV",
      "Implement purging and embargo",
      "Monitor feature importance drift",
      "Regular model retraining",
    ],
  },
]

// Comprehensive performance metrics
const performanceMetrics = [
  {
    name: "Sharpe Ratio",
    category: "Risk-Adjusted Returns",
    icon: Target,
    formula: "(Return - Risk-free Rate) / Volatility",
    description:
      "The Sharpe ratio measures risk-adjusted return by comparing excess return to volatility. It's the most widely used metric for evaluating investment performance.",
    interpretation:
      "Higher is better. >1.0 is good, >2.0 is excellent, >3.0 is exceptional. Values below 0 indicate returns worse than risk-free rate.",
    benchmark: { poor: "<0.5", fair: "0.5-1.0", good: "1.0-2.0", excellent: ">2.0" },
    importance: "Primary metric for risk-adjusted performance comparison across strategies and time periods.",
    calculation: "Annualized excess return divided by annualized volatility. Uses standard deviation as risk measure.",
    codeExample: `def sharpe_ratio(returns, rf=0.02):
    excess_returns = returns - rf/252
    return np.sqrt(252) * excess_returns.mean() / returns.std()`,
    detailedExplanation:
      "The Sharpe ratio, developed by Nobel laureate William Sharpe, is fundamental to modern portfolio theory. It quantifies the additional return received for the extra volatility endured. A higher Sharpe ratio indicates better risk-adjusted performance.",
    limitations: [
      "Assumes normal distribution of returns",
      "Uses standard deviation as only risk measure",
      "Doesn't account for tail risks",
      "Can be manipulated by return smoothing",
    ],
    applications: ["Portfolio optimization", "Strategy comparison", "Performance attribution", "Risk budgeting"],
  },
  {
    name: "Maximum Drawdown",
    category: "Risk Metrics",
    icon: TrendingDown,
    formula: "Max((Peak - Trough) / Peak) × 100%",
    description:
      "The largest peak-to-trough decline in portfolio value, representing the worst-case historical loss scenario.",
    interpretation:
      "Lower is better. <5% is excellent, <10% is good, >20% is concerning. Critical for understanding downside risk.",
    benchmark: { excellent: "<5%", good: "5-10%", fair: "10-20%", poor: ">20%" },
    importance:
      "Essential for risk management and position sizing. Helps determine if a strategy is psychologically tradeable.",
    calculation: "Maximum percentage decline from any peak to subsequent trough before a new peak is achieved.",
    codeExample: `def max_drawdown(equity_curve):
    peak = equity_curve.expanding().max()
    dd = (equity_curve - peak) / peak
    return dd.min()`,
    detailedExplanation:
      "Maximum drawdown is arguably the most important risk metric for traders and investors. It represents the maximum loss from peak to trough and helps answer the critical question: 'What's the worst that could happen?'",
    limitations: [
      "Based on historical data only",
      "Doesn't predict future drawdowns",
      "May not capture tail risks",
      "Sensitive to data period selection",
    ],
    applications: ["Position sizing decisions", "Risk management", "Strategy comparison", "Capital allocation"],
  },
  {
    name: "Calmar Ratio",
    category: "Risk-Adjusted Returns",
    icon: Calculator,
    formula: "Annual Return / |Maximum Drawdown|",
    description:
      "The Calmar ratio measures return per unit of downside risk, focusing on the worst-case scenario rather than volatility.",
    interpretation:
      "Higher is better. >1.0 is good, >2.0 is excellent, >3.0 is exceptional. Preferred over Sharpe for drawdown-sensitive investors.",
    benchmark: { poor: "<0.5", fair: "0.5-1.0", good: "1.0-2.0", excellent: ">2.0" },
    importance:
      "Particularly valuable for strategies where drawdown control is more important than volatility management.",
    calculation: "Annualized return divided by the absolute value of maximum drawdown percentage.",
    codeExample: `def calmar_ratio(returns, equity_curve):
    annual_return = (1 + returns.mean()) ** 252 - 1
    max_dd = abs(max_drawdown(equity_curve))
    return annual_return / max_dd`,
    detailedExplanation:
      "The Calmar ratio, named after California Managed Account Reports, focuses on downside risk rather than total volatility. It's particularly useful for evaluating strategies where the primary concern is avoiding large losses.",
    limitations: [
      "Only considers maximum drawdown",
      "Ignores frequency of drawdowns",
      "May not reflect ongoing risk",
      "Sensitive to time period",
    ],
    applications: [
      "Hedge fund evaluation",
      "Conservative strategy assessment",
      "Capital preservation strategies",
      "Institutional portfolio management",
    ],
  },
  {
    name: "Sortino Ratio",
    category: "Risk-Adjusted Returns",
    icon: Shield,
    formula: "(Return - Target) / Downside Deviation",
    description:
      "Similar to Sharpe ratio but only penalizes downside volatility, recognizing that upside volatility is desirable.",
    interpretation:
      "Higher is better. Generally higher than Sharpe ratio for positively skewed strategies. >1.5 is good, >2.5 is excellent.",
    benchmark: { poor: "<1.0", fair: "1.0-1.5", good: "1.5-2.5", excellent: ">2.5" },
    importance:
      "Better than Sharpe for strategies with asymmetric return distributions or when upside volatility is beneficial.",
    calculation: "Excess return over target divided by downside deviation (standard deviation of negative returns).",
    codeExample: `def sortino_ratio(returns, target=0):
    excess = returns - target/252
    downside = returns[returns < target/252].std()
    return np.sqrt(252) * excess.mean() / downside`,
    detailedExplanation:
      "The Sortino ratio improves upon the Sharpe ratio by distinguishing between 'good' and 'bad' volatility. It only penalizes downside deviation, recognizing that investors don't mind upside volatility.",
    limitations: [
      "Requires sufficient downside observations",
      "Target return selection affects results",
      "May be unstable with limited data",
      "Less widely understood than Sharpe",
    ],
    applications: [
      "Momentum strategy evaluation",
      "Options-based strategies",
      "Alternative investment assessment",
      "Asymmetric return strategies",
    ],
  },
  {
    name: "Win Rate",
    category: "Consistency Metrics",
    icon: Percent,
    formula: "(Winning Trades / Total Trades) × 100%",
    description: "The percentage of profitable trades, indicating strategy consistency and reliability.",
    interpretation:
      "Context dependent. >50% for balanced strategies, can be lower for momentum strategies with large winners.",
    benchmark: { low: "<40%", fair: "40-50%", good: "50-60%", high: ">60%" },
    importance:
      "Indicates strategy consistency and helps assess psychological tradability. Must be considered with average win/loss size.",
    calculation: "Number of profitable trades divided by total number of trades, expressed as percentage.",
    codeExample: `def win_rate(trades):
    winning_trades = len(trades[trades > 0])
    total_trades = len(trades)
    return winning_trades / total_trades * 100`,
    detailedExplanation:
      "Win rate is a fundamental metric that measures how often a strategy generates profitable trades. However, it must be interpreted in context with the average size of wins versus losses.",
    limitations: [
      "Doesn't account for trade size",
      "Can be misleading without profit factor",
      "May encourage overoptimization",
      "Doesn't reflect risk-adjusted performance",
    ],
    applications: [
      "Strategy development",
      "Psychological assessment",
      "Trade execution analysis",
      "System reliability evaluation",
    ],
  },
  {
    name: "Profit Factor",
    category: "Performance Metrics",
    icon: DollarSign,
    formula: "Total Profit / |Total Loss|",
    description: "The ratio of gross profit to gross loss, measuring overall profitability efficiency.",
    interpretation:
      "Must be >1.0 to be profitable. >1.5 is good, >2.0 is excellent. Higher values indicate more efficient profit generation.",
    benchmark: { unprofitable: "<1.0", fair: "1.0-1.5", good: "1.5-2.0", excellent: ">2.0" },
    importance:
      "Directly measures profitability and efficiency. Essential for understanding the relationship between wins and losses.",
    calculation: "Sum of all winning trades divided by absolute sum of all losing trades.",
    codeExample: `def profit_factor(trades):
    wins = trades[trades > 0].sum()
    losses = abs(trades[trades < 0].sum())
    return wins / losses if losses > 0 else float('inf')`,
    detailedExplanation:
      "Profit factor is a comprehensive measure that captures both the frequency and magnitude of wins versus losses. It directly answers whether a strategy makes money and how efficiently it does so.",
    limitations: [
      "Doesn't account for risk",
      "May be skewed by outliers",
      "Doesn't consider timing of trades",
      "Ignores opportunity cost",
    ],
    applications: [
      "Strategy profitability assessment",
      "System comparison",
      "Performance monitoring",
      "Risk-return optimization",
    ],
  },
  {
    name: "Annualized Return",
    category: "Return Metrics",
    icon: TrendingUp,
    formula: "(1 + Total Return)^(252/Days) - 1",
    description: "The compound annual growth rate, standardizing returns across different time periods.",
    interpretation:
      "Higher is better. Should be compared to relevant benchmarks and risk-free rates. Consider risk-adjusted metrics.",
    benchmark: { low: "<5%", fair: "5-10%", good: "10-20%", excellent: ">20%" },
    importance: "Standard measure for comparing performance across different time periods and strategies.",
    calculation: "Compound annual growth rate calculated from total return over the investment period.",
    codeExample: `def annualized_return(equity_curve):
    total_return = (equity_curve.iloc[-1] / equity_curve.iloc[0]) - 1
    days = len(equity_curve)
    return (1 + total_return) ** (252 / days) - 1`,
    detailedExplanation:
      "Annualized return standardizes performance measurement by expressing returns on an annual basis, enabling comparison across different time periods and strategies.",
    limitations: [
      "Doesn't account for risk",
      "May not reflect future performance",
      "Sensitive to start/end dates",
      "Ignores return distribution",
    ],
    applications: ["Performance comparison", "Benchmark analysis", "Investment evaluation", "Portfolio construction"],
  },
  {
    name: "Value at Risk (VaR)",
    category: "Risk Metrics",
    icon: AlertTriangle,
    formula: "Percentile of Return Distribution",
    description: "Statistical measure of potential loss at a given confidence level over a specific time period.",
    interpretation:
      "Lower absolute values are better. 95% VaR of -5% means 5% chance of losing more than 5% in given period.",
    benchmark: { low: "<2%", moderate: "2-5%", high: "5-10%", extreme: ">10%" },
    importance: "Regulatory requirement for many institutions. Key risk management tool for position sizing.",
    calculation:
      "Typically the 5th percentile of return distribution, representing worst-case scenario in 95% of cases.",
    codeExample: `def value_at_risk(returns, confidence=0.05):
    return np.percentile(returns, confidence * 100)`,
    detailedExplanation:
      "Value at Risk (VaR) quantifies the potential loss in portfolio value over a specific time horizon at a given confidence level.",
    limitations: [
      "Doesn't capture tail risk beyond confidence level",
      "Assumes historical patterns persist",
      "May not account for liquidity risk",
      "Can be gamed through return smoothing",
    ],
    applications: ["Risk management", "Regulatory compliance", "Position sizing", "Capital allocation"],
  },
  {
    name: "Alpha",
    category: "Performance Attribution",
    icon: Star,
    formula: "Portfolio Return - (Beta × Market Return + Risk-free Rate)",
    description: "Excess return above what would be expected given the portfolio's beta and market performance.",
    interpretation:
      "Higher is better. Positive alpha indicates outperformance, negative indicates underperformance relative to risk taken.",
    benchmark: { negative: "<0%", neutral: "0-2%", good: "2-5%", excellent: ">5%" },
    importance: "Measures manager skill and value-add beyond market exposure. Core concept in performance evaluation.",
    calculation: "Actual return minus expected return based on CAPM model.",
    codeExample: `def alpha(portfolio_returns, market_returns, risk_free_rate, beta):
    expected_return = risk_free_rate + beta * (market_returns.mean() - risk_free_rate)
    return portfolio_returns.mean() - expected_return`,
    detailedExplanation:
      "Alpha represents the value added by active management or strategy selection beyond what could be achieved through passive market exposure.",
    limitations: [
      "Depends on appropriate benchmark selection",
      "Assumes CAPM validity",
      "May not capture all risk factors",
      "Can be unstable over time",
    ],
    applications: ["Manager evaluation", "Performance attribution", "Strategy assessment", "Fee justification"],
  },
  {
    name: "Beta",
    category: "Risk Metrics",
    icon: Activity,
    formula: "Covariance(Portfolio, Market) / Variance(Market)",
    description: "Measure of portfolio's sensitivity to market movements, indicating systematic risk exposure.",
    interpretation:
      "1.0 = market-like risk, >1.0 = more volatile than market, <1.0 = less volatile, negative = inverse correlation.",
    benchmark: { defensive: "<0.8", neutral: "0.8-1.2", aggressive: "1.2-1.8", very_aggressive: ">1.8" },
    importance:
      "Fundamental risk measure indicating market sensitivity. Essential for portfolio construction and risk management.",
    calculation: "Covariance between portfolio and market returns divided by market variance.",
    codeExample: `def beta(portfolio_returns, market_returns):
    covariance = np.cov(portfolio_returns, market_returns)[0, 1]
    market_variance = np.var(market_returns)
    return covariance / market_variance`,
    detailedExplanation:
      "Beta measures systematic risk by quantifying how much a portfolio's returns move in relation to market returns.",
    limitations: [
      "Assumes linear relationship with market",
      "May not be stable over time",
      "Doesn't capture all systematic risks",
      "Sensitive to market proxy selection",
    ],
    applications: ["Risk assessment", "Portfolio construction", "Performance attribution", "Hedging strategies"],
  },
]

// Comprehensive glossary terms
const glossaryTerms = [
  {
    term: "Sharpe Ratio",
    definition:
      "Risk-adjusted return metric calculated as (Return - Risk Free Rate) / Standard Deviation. Measures excess return per unit of volatility risk.",
    example: "sharpe = (returns.mean() - rf) / returns.std()",
    category: "Performance Metrics",
    detailedExplanation:
      "The Sharpe ratio is the most widely used measure of risk-adjusted performance. It was developed by Nobel laureate William Sharpe and forms the foundation of modern portfolio theory.",
    relatedTerms: ["Volatility", "Risk-free Rate", "Modern Portfolio Theory"],
  },
  {
    term: "Maximum Drawdown",
    definition:
      "Largest peak-to-trough decline in portfolio value. Critical risk metric showing worst-case historical loss.",
    example: "max_dd = (peak - trough) / peak * 100",
    category: "Risk Metrics",
    detailedExplanation:
      "Maximum drawdown represents the maximum observed loss from a peak to a trough of a portfolio, before a new peak is attained. It's an indicator of downside risk over a specified time period.",
    relatedTerms: ["Drawdown Duration", "Recovery Time", "Underwater Curve"],
  },
  {
    term: "Calmar Ratio",
    definition:
      "Return to risk ratio calculated as Annual Return / Maximum Drawdown. Measures return per unit of downside risk.",
    example: "calmar = annual_return / abs(max_drawdown)",
    category: "Performance Metrics",
    detailedExplanation:
      "The Calmar ratio is a performance measurement that compares the average annual compounded rate of return and the maximum drawdown risk.",
    relatedTerms: ["Maximum Drawdown", "Risk-Adjusted Return", "Downside Risk"],
  },
  {
    term: "Value at Risk (VaR)",
    definition: "Statistical measure of potential loss at a given confidence level over a specific time period.",
    example: "var_95 = np.percentile(returns, 5)",
    category: "Risk Metrics",
    detailedExplanation:
      "VaR is a statistic that quantifies the extent of possible financial losses within a firm, portfolio, or position over a specific time frame.",
    relatedTerms: ["Conditional VaR", "Expected Shortfall", "Confidence Level"],
  },
  {
    term: "Alpha",
    definition:
      "Excess return above benchmark after adjusting for market risk (beta). The holy grail of active management.",
    example: "alpha = returns - (beta * market_returns)",
    category: "Performance Metrics",
    detailedExplanation:
      "Alpha is a measure of the active return on an investment, the performance of that investment compared with a suitable market index.",
    relatedTerms: ["Beta", "CAPM", "Jensen's Alpha", "Benchmark"],
  },
  {
    term: "Beta",
    definition:
      "Measure of strategy's correlation with market movements. Beta of 1.0 moves with market, < 1.0 is defensive.",
    example: "beta = cov(returns, market) / var(market)",
    category: "Risk Metrics",
    detailedExplanation:
      "Beta is a measure of the volatility—or systematic risk—of a security or portfolio compared to the market as a whole.",
    relatedTerms: ["Alpha", "Systematic Risk", "Market Risk", "CAPM"],
  },
  {
    term: "Cointegration",
    definition:
      "Statistical property where two or more time series move together in the long run, essential for pairs trading strategies.",
    example: "coint_test = coint_johansen(prices, det_order=0, k_ar_diff=1)",
    category: "Statistical Concepts",
    detailedExplanation:
      "Cointegration is a statistical property of time series variables. Two or more time series are cointegrated if they share a common stochastic drift.",
    relatedTerms: ["Pairs Trading", "Mean Reversion", "Error Correction Model", "Stationarity"],
  },
  {
    term: "Monte Carlo Simulation",
    definition:
      "Random sampling technique to model probability of different outcomes by running thousands of simulations.",
    example: "paths = np.random.normal(mu, sigma, (n_sims, n_days))",
    category: "Testing Methods",
    detailedExplanation:
      "Monte Carlo methods are a broad class of computational algorithms that rely on repeated random sampling to obtain numerical results.",
    relatedTerms: ["Random Walk", "Stochastic Process", "Bootstrap", "Scenario Analysis"],
  },
  {
    term: "Walk-Forward Analysis",
    definition: "Rolling window optimization where parameters are periodically re-optimized using recent data.",
    example: "optimize_window=252, test_window=63, step_size=21",
    category: "Testing Methods",
    detailedExplanation:
      "Walk-forward analysis is a method of determining the optimal parameters for a trading strategy by using a rolling window of data.",
    relatedTerms: ["Overfitting", "Out-of-Sample", "Parameter Optimization", "Robustness"],
  },
  {
    term: "Slippage",
    definition:
      "Difference between expected and actual execution price due to market movement and liquidity constraints.",
    example: "slippage = (actual_price - signal_price) / signal_price",
    category: "Trading Costs",
    detailedExplanation:
      "Slippage refers to the difference between the expected price of a trade and the price at which the trade is executed.",
    relatedTerms: ["Market Impact", "Bid-Ask Spread", "Liquidity", "Transaction Costs"],
  },
  {
    term: "Backtest Overfitting",
    definition:
      "The use of excessive parameters or data mining that makes a strategy perform well on historical data but fail in live trading.",
    example: "# Avoid: testing 1000+ parameter combinations on same dataset",
    category: "Common Pitfalls",
    detailedExplanation:
      "Overfitting occurs when a model learns the detail and noise in the training data to the extent that it negatively impacts performance on new data.",
    relatedTerms: ["Data Snooping", "Curve Fitting", "Out-of-Sample Testing", "Cross-Validation"],
  },
  {
    term: "Transaction Costs",
    definition:
      "All costs associated with trading including commissions, spreads, market impact, and opportunity costs.",
    example: "total_cost = commission + spread + market_impact",
    category: "Trading Costs",
    detailedExplanation:
      "Transaction costs are expenses incurred when buying or selling securities, including broker commissions and spreads.",
    relatedTerms: ["Slippage", "Market Impact", "Bid-Ask Spread", "Commission"],
  },
  {
    term: "Sortino Ratio",
    definition:
      "Risk-adjusted return metric that only penalizes downside volatility, calculated as excess return divided by downside deviation.",
    example: "sortino = excess_return / downside_deviation",
    category: "Performance Metrics",
    detailedExplanation:
      "The Sortino ratio is a variation of the Sharpe ratio that differentiates harmful volatility from total overall volatility.",
    relatedTerms: ["Sharpe Ratio", "Downside Deviation", "Target Return", "Semi-Variance"],
  },
  {
    term: "Information Ratio",
    definition:
      "Measures active return per unit of active risk, calculated as excess return over benchmark divided by tracking error.",
    example: "info_ratio = excess_return / tracking_error",
    category: "Performance Metrics",
    detailedExplanation:
      "The information ratio measures portfolio returns beyond the returns of a benchmark, usually an index, compared to the volatility of those returns.",
    relatedTerms: ["Tracking Error", "Active Return", "Benchmark", "Active Management"],
  },
  {
    term: "Conditional VaR (CVaR)",
    definition: "Expected loss given that loss exceeds VaR threshold. Also known as Expected Shortfall.",
    example: "cvar = returns[returns <= var].mean()",
    category: "Risk Metrics",
    detailedExplanation:
      "CVaR is a risk assessment measure that quantifies the amount of tail risk an investment portfolio has.",
    relatedTerms: ["Value at Risk", "Expected Shortfall", "Tail Risk", "Coherent Risk Measure"],
  },
  {
    term: "Payoff Ratio",
    definition: "Ratio of average winning trade to average losing trade, measuring risk-reward efficiency.",
    example: "payoff_ratio = avg_win / abs(avg_loss)",
    category: "Performance Metrics",
    detailedExplanation:
      "The payoff ratio compares the average gain of winning trades to the average loss of losing trades.",
    relatedTerms: ["Win Rate", "Risk-Reward Ratio", "Profit Factor", "Average Trade"],
  },
  {
    term: "Survivorship Bias",
    definition:
      "Error that occurs when only successful entities are considered, ignoring those that failed or were delisted.",
    example: "# Include delisted stocks in historical analysis",
    category: "Common Pitfalls",
    detailedExplanation:
      "Survivorship bias is the logical error of concentrating on entities that survived a selection process while overlooking those that did not.",
    relatedTerms: ["Selection Bias", "Data Quality", "Historical Data", "Backtesting Bias"],
  },
  {
    term: "Look-Ahead Bias",
    definition: "Using information that would not have been available at the time of making an investment decision.",
    example: "# Wrong: using today's close for today's signal",
    category: "Common Pitfalls",
    detailedExplanation:
      "Look-ahead bias occurs when a study or simulation uses information or data that would not have been known or available during the period being analyzed.",
    relatedTerms: ["Data Snooping", "Time Series", "Signal Generation", "Backtesting Bias"],
  },
  {
    term: "Market Impact",
    definition: "The effect that a market participant has on the price of a security when executing a trade.",
    example: "impact = trade_size * impact_coefficient * volatility",
    category: "Trading Costs",
    detailedExplanation:
      "Market impact is the change in the price of a security that results from a trade, particularly large trades.",
    relatedTerms: ["Slippage", "Liquidity", "Order Size", "Price Impact"],
  },
  {
    term: "Tracking Error",
    definition: "Standard deviation of the difference between portfolio returns and benchmark returns.",
    example: "tracking_error = std(portfolio_returns - benchmark_returns)",
    category: "Risk Metrics",
    detailedExplanation:
      "Tracking error is a measure of how closely a portfolio follows the index to which it is benchmarked.",
    relatedTerms: ["Information Ratio", "Active Risk", "Benchmark", "Relative Performance"],
  },
]

// Common pitfalls data
const commonPitfalls = [
  {
    title: "Look-Ahead Bias",
    description:
      "Using information that wouldn't have been available at the time of the trade, like using today's close to generate today's signal.",
    solution:
      "Always use data from time T-1 to generate signals for time T. Implement proper time delays in your backtesting engine.",
    severity: "Critical",
    frequency: "Common",
    emoji: "👀",
  },
  {
    title: "Survivorship Bias",
    description:
      "Testing only on stocks that still exist today, missing all the companies that went bankrupt or were delisted.",
    solution:
      "Use point-in-time constituent data and include delisted securities. Professional data providers offer survivorship-bias-free datasets.",
    severity: "High",
    frequency: "Very Common",
    emoji: "💀",
  },
  {
    title: "Overfitting",
    description:
      "Creating a strategy that works perfectly on historical data but fails in live trading due to excessive parameter optimization.",
    solution:
      "Use walk-forward analysis, keep parameters simple, and always validate on truly out-of-sample data. Less is often more.",
    severity: "Critical",
    frequency: "Very Common",
    emoji: "🎯",
  },
  {
    title: "Ignoring Transaction Costs",
    description:
      "Not accounting for spreads, slippage, commissions, and market impact can make unprofitable strategies look profitable.",
    solution:
      "Model realistic costs including variable spreads, price impact based on volume, and actual commission structures.",
    severity: "High",
    frequency: "Common",
    emoji: "💸",
  },
  {
    title: "Selection Bias",
    description:
      "Cherry-picking favorable time periods or markets for testing, avoiding periods where the strategy would have failed.",
    solution:
      "Test across multiple market regimes, including bear markets, high volatility, and different economic cycles.",
    severity: "Medium",
    frequency: "Common",
    emoji: "🍒",
  },
  {
    title: "Data Snooping",
    description:
      "Repeatedly testing on the same dataset until finding a strategy that works, essentially memorizing the data.",
    solution:
      "Set aside data for final validation that you never look at during development. Use statistical tests for multiple comparisons.",
    severity: "High",
    frequency: "Common",
    emoji: "🔍",
  },
]

// Platform comparison data
const platforms = [
  {
    name: "Backtrader",
    language: "Python",
    speed: 4,
    assetClasses: "Stocks, Futures, Forex",
    cost: "Free",
    bestFor: "Python developers",
    pros: ["Free", "Flexible", "Good documentation"],
    cons: ["Slower than vectorized", "Learning curve"],
  },
  {
    name: "QuantConnect",
    language: "C#, Python",
    speed: 5,
    assetClasses: "All",
    cost: "Free/Paid",
    bestFor: "Professional quants",
    pros: ["Cloud-based", "Live trading", "Multiple assets"],
    cons: ["Limited free tier", "Vendor lock-in"],
  },
  {
    name: "Zipline",
    language: "Python",
    speed: 3,
    assetClasses: "US Equities",
    cost: "Free",
    bestFor: "Quantopian refugees",
    pros: ["Free", "Pandas integration", "Research friendly"],
    cons: ["Limited assets", "Maintenance issues"],
  },
  {
    name: "VectorBT",
    language: "Python",
    speed: 5,
    assetClasses: "Any",
    cost: "Free",
    bestFor: "Fast parameter sweeps",
    pros: ["Extremely fast", "Vectorized", "Great for optimization"],
    cons: ["Less flexible", "Newer library"],
  },
  {
    name: "TradingView",
    language: "Pine Script",
    speed: 2,
    assetClasses: "Most",
    cost: "$15-60/mo",
    bestFor: "Visual traders",
    pros: ["User-friendly", "Great charts", "Community"],
    cons: ["Limited backtesting", "Proprietary language"],
  },
]

// Workflow steps
const workflowSteps = [
  {
    number: 1,
    title: "Data Preparation",
    description:
      "Clean, adjust, and validate historical data. Handle corporate actions, dividends, and ensure survivorship bias free datasets.",
    actions: ["Data Cleaning", "Adjustment", "Validation"],
    icon: Database,
  },
  {
    number: 2,
    title: "Strategy Definition",
    description:
      "Code your trading logic with clear entry/exit rules, position sizing, and risk management parameters.",
    actions: ["Signal Logic", "Risk Rules", "Portfolio Logic"],
    icon: Code,
  },
  {
    number: 3,
    title: "Initial Backtest",
    description: "Run simple historical backtest to validate logic and get baseline performance metrics.",
    actions: ["Logic Test", "Debug", "Baseline Metrics"],
    icon: Play,
  },
  {
    number: 4,
    title: "Parameter Optimization",
    description: "Use walk-forward analysis to find robust parameters that work across different market conditions.",
    actions: ["Grid Search", "Genetic Algo", "Validation"],
    icon: Settings,
  },
  {
    number: 5,
    title: "Robustness Testing",
    description:
      "Monte Carlo simulations and multi-market testing to ensure strategy isn't overfit to specific conditions.",
    actions: ["Monte Carlo", "Sensitivity", "Multi-Market"],
    icon: TestTube,
  },
  {
    number: 6,
    title: "Risk Analysis",
    description: "Stress test with historical crises, analyze drawdowns, and calculate risk metrics like VaR and CVaR.",
    actions: ["Stress Test", "VaR/CVaR", "Scenario Analysis"],
    icon: Shield,
  },
  {
    number: 7,
    title: "Transaction Costs",
    description: "Add realistic slippage, commissions, and market impact to ensure profitability after costs.",
    actions: ["Slippage Model", "Commission", "Impact Model"],
    icon: DollarSign,
  },
  {
    number: 8,
    title: "Forward Testing",
    description: "Paper trade with live data to validate real-time performance before risking capital.",
    actions: ["Paper Trade", "Monitor", "Analyze"],
    icon: FastForward,
  },
  {
    number: 9,
    title: "Live Deployment",
    description: "Deploy with small capital, monitor performance, and scale up gradually as confidence builds.",
    actions: ["Small Scale", "Monitor", "Scale Up"],
    icon: Rocket,
  },
]

export default function BacktestingPageClient() {
  // Interactive Tree state
  const [selectedTreeNode, setSelectedTreeNode] = useState<any>(null)
  const [visitedTreeNodes, setVisitedTreeNodes] = useState(new Set())
  const [treeAnimationPlaying, setTreeAnimationPlaying] = useState(false)

  // Tree data structure
  const treeData = {
    name: "Start",
    icon: "🎯",
    description: "Begin Your Backtesting Journey",
    type: "root",
    x: 800,
    y: 100,
    children: [
      {
        name: "Data Foundation",
        icon: "📊",
        type: "core",
        description: "Quality data is the foundation of reliable backtesting",
        x: 400,
        y: 250,
        content: {
          title: "Data Foundation",
          sections: [
            {
              heading: "Why Data Quality Matters",
              text: "Garbage in, garbage out. Poor data quality can make unprofitable strategies appear profitable, leading to significant losses in live trading.",
            },
            {
              heading: "Essential Data Requirements",
              list: [
                "Adjusted OHLCV prices (splits & dividends)",
                "Survivorship bias-free universe",
                "Point-in-time constituent data",
                "Corporate actions history",
                "Accurate timestamps and timezones",
              ],
            },
            {
              heading: "Code Example",
              code: `# Validate data integrity
assert not data.isnull().any().any()
assert (data.high >= data.low).all()
assert (data.high >= data.close).all()

# Check for survivorship bias
missing = historical_constituents - current_tickers
print(f"Missing {len(missing)} delisted stocks")`,
            },
          ],
          metrics: [
            { label: "Data Points Required", value: "5+ Years" },
            { label: "Frequency Needed", value: "1min - Daily" },
            { label: "Quality Score", value: "95%+" },
          ],
        },
      },
      {
        name: "Strategy Design",
        icon: "🎨",
        type: "core",
        description: "Transform ideas into testable trading rules",
        x: 600,
        y: 250,
        content: {
          title: "Strategy Design Principles",
          sections: [
            {
              heading: "Components of a Complete Strategy",
              list: [
                "Entry signals (when to buy)",
                "Exit signals (when to sell)",
                "Position sizing (how much to buy)",
                "Risk management (stop losses)",
                "Portfolio rules (max positions)",
              ],
            },
          ],
        },
      },
      {
        name: "Backtesting Engine",
        icon: "⚙️",
        type: "core",
        description: "Execute strategy on historical data",
        x: 800,
        y: 250,
        content: {
          title: "Backtesting Engine Architecture",
          sections: [
            {
              heading: "Engine Types",
              list: [
                "Event-Driven: Most realistic, handles orders",
                "Vectorized: Fast, good for screening",
                "Agent-Based: Complex market simulation",
              ],
            },
          ],
        },
      },
      {
        name: "Performance Analysis",
        icon: "📈",
        type: "core",
        description: "Measure strategy performance comprehensively",
        x: 1000,
        y: 250,
        content: {
          title: "Performance Metrics",
          sections: [
            {
              heading: "Key Metrics to Track",
              list: [
                "Total Return: Overall profitability",
                "Sharpe Ratio: Risk-adjusted returns",
                "Maximum Drawdown: Worst loss period",
                "Win Rate: Percentage of profitable trades",
                "Profit Factor: Gross profit / gross loss",
              ],
            },
          ],
        },
      },
      {
        name: "Optimization",
        icon: "🔧",
        type: "core",
        description: "Find robust parameters without overfitting",
        x: 1200,
        y: 250,
        content: {
          title: "Parameter Optimization",
          sections: [
            {
              heading: "Optimization Methods",
              list: [
                "Grid Search: Test all combinations",
                "Random Search: Sample parameter space",
                "Genetic Algorithms: Evolutionary approach",
                "Bayesian: Smart parameter exploration",
              ],
            },
          ],
        },
      },
    ],
  }

  // Tree interaction functions
  const selectTreeNode = useCallback((node: any) => {
    setSelectedTreeNode(node)
    setVisitedTreeNodes((prev) => new Set([...prev, node.name]))

    // Update visual state
    document.querySelectorAll(".tree-node").forEach((n) => n.classList.remove("active"))
    const nodeElement = document.querySelector(`[data-tree-node="${node.name}"]`)
    if (nodeElement) {
      nodeElement.classList.add("active")
    }
  }, [])

  const resetInteractiveTree = useCallback(() => {
    setSelectedTreeNode(null)
    setVisitedTreeNodes(new Set())
    document.querySelectorAll(".tree-node").forEach((n) => n.classList.remove("active"))
  }, [])

  const playTreeAnimation = useCallback(async () => {
    if (treeAnimationPlaying) return
    setTreeAnimationPlaying(true)
    resetInteractiveTree()

    // Animate through nodes with delays
    const animateNode = async (node: any, delay = 0) => {
      await new Promise((resolve) => setTimeout(resolve, delay))
      selectTreeNode(node)

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          await animateNode(node.children[i], 1500)
        }
      }
    }

    await animateNode(treeData)
    setTreeAnimationPlaying(false)
  }, [treeAnimationPlaying, selectTreeNode])

  // Initialize tree visualization
  useEffect(() => {
    const svg = document.getElementById("backtesting-tree-svg")
    if (!svg) return

    // Clear existing content
    const existingNodes = svg.querySelectorAll(".tree-node, .tree-connection")
    existingNodes.forEach((el) => el.remove())

    // Draw connections
    const drawConnection = (from: any, to: any) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const pathData = `M ${from.x} ${from.y + 40} Q ${from.x} ${from.y + 80}, ${to.x} ${to.y - 40}`

      path.setAttribute("d", pathData)
      path.setAttribute("class", "tree-connection")
      path.setAttribute("fill", "none")
      path.setAttribute("stroke", "rgba(0, 255, 136, 0.3)")
      path.setAttribute("stroke-width", "2")
      path.setAttribute("stroke-dasharray", "5,5")

      svg.appendChild(path)
    }

    // Draw nodes
    const drawNode = (node: any) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
      g.setAttribute("class", "tree-node")
      g.setAttribute("data-tree-node", node.name)
      g.setAttribute("transform", `translate(${node.x}, ${node.y})`)
      g.style.cursor = "pointer"

      // Circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("r", "40")
      circle.setAttribute("fill", "rgba(0, 0, 0, 0.8)")
      circle.setAttribute("stroke", "rgb(0, 255, 136)")
      circle.setAttribute("stroke-width", "2")
      g.appendChild(circle)

      // Icon
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "text")
      icon.setAttribute("text-anchor", "middle")
      icon.setAttribute("dominant-baseline", "central")
      icon.setAttribute("font-size", "24")
      icon.textContent = node.icon
      g.appendChild(icon)

      // Label
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text")
      label.setAttribute("text-anchor", "middle")
      label.setAttribute("y", "60")
      label.setAttribute("fill", "white")
      label.setAttribute("font-size", "14")
      label.setAttribute("font-weight", "600")
      label.textContent = node.name
      g.appendChild(label)

      // Click handler
      g.addEventListener("click", () => selectTreeNode(node))

      svg.appendChild(g)

      // Draw children
      if (node.children) {
        node.children.forEach((child: any) => {
          drawConnection(node, child)
          drawNode(child)
        })
      }
    }

    drawNode(treeData)
  }, [selectTreeNode])

  const [selectedType, setSelectedType] = useState(backtestingTypes[0])
  const [selectedMetric, setSelectedMetric] = useState(performanceMetrics[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [demoConfig, setDemoConfig] = useState({
    backtestType: "simple",
    strategy: "ma-cross",
    timePeriod: "1year",
    capital: [100000],
    risk: [2],
  })

  // Filter glossary terms based on search and category
  const filteredGlossary = glossaryTerms.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || term.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ["all", ...new Set(glossaryTerms.map((term) => term.category))]

  // Counter animation hook
  const useCounterAnimation = (target: number, duration = 2000) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      let start = 0
      const increment = target / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }, [target, duration])

    return count
  }

  const animatedValue = useCallback((target: number, duration = 2000) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      let start = 0
      const increment = target / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }, [target, duration])

    return count
  }, [])

  // Simulate backtesting process
  const runBacktest = async () => {
    setIsSimulating(true)
    setSimulationProgress(0)

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setSimulationProgress(i)
    }

    setIsSimulating(false)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {[...Array(40)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.15} size={i % 4 === 0 ? "large" : i % 2 === 0 ? "medium" : "small"} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(0,255,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8"
            >
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">🎯 The Complete Guide to Professional Backtesting</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-8xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-white via-primary to-blue-400 bg-clip-text text-transparent">
                Master Every Type
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-primary to-white bg-clip-text text-transparent">
                of Backtesting
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              From simple historical tests to advanced Monte Carlo simulations. Learn the complete spectrum of
              backtesting methodologies used by quantitative trading professionals to validate and deploy profitable
              strategies.
            </motion.p>
          </motion.div>

          {/* Hero Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: "Backtesting Types", value: 15, description: "Complete methodologies", icon: Layers },
              { label: "Live Examples", value: 50, description: "Interactive demos", icon: PlayCircle },
              { label: "Key Metrics", value: 100, description: "Performance indicators", icon: BarChart3 },
              { label: "Workflow Steps", value: 25, description: "Professional process", icon: Settings },
            ].map((stat, index) => {
              const animatedValueLocal = animatedValue(stat.value, 2000)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-6 text-center relative z-10">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold text-white mb-1">{animatedValueLocal}+</div>
                      <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                      <div className="text-xs text-gray-400">{stat.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/80 text-black font-semibold px-8 py-4 text-lg group"
              onClick={() => document.getElementById("backtesting-types")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Explore All Types
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 hover:border-primary/50 px-8 py-4 text-lg bg-transparent group"
              onClick={() => document.getElementById("interactive-demo")?.scrollIntoView({ behavior: "smooth" })}
            >
              <PlayCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Try Live Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Interactive Backtesting Tree Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <Workflow className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">🌳 Interactive Journey</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              The <span className="text-primary">Backtesting</span> Tree
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Navigate through the complete process of professional strategy validation. Click each node to explore
              detailed insights, code examples, and best practices.
            </p>
          </motion.div>

          {/* Tree Container */}
          <div className="relative">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetInteractiveTree()}
                className="border-gray-600 bg-gray-900/50 text-white hover:bg-primary hover:text-black backdrop-blur-sm"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playTreeAnimation()}
                className="border-gray-600 bg-gray-900/50 text-white hover:bg-primary hover:text-black backdrop-blur-sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Story
              </Button>
            </div>

            {/* Main Tree Visualization */}
            <div className="relative bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="h-[800px] relative">
                <svg
                  id="backtesting-tree-svg"
                  className="w-full h-full"
                  viewBox="0 0 1600 800"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(0, 255, 136, 0.05) 0%, transparent 70%)",
                  }}
                >
                  <defs>
                    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(0, 255, 136)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="rgb(0, 204, 136)" stopOpacity="0.8" />
                    </linearGradient>

                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="rgb(0, 255, 136)" />
                    </marker>
                  </defs>

                  {/* Tree nodes and connections will be rendered here by JavaScript */}
                </svg>

                {/* Floating particles background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-primary/30 rounded-full"
                      initial={{
                        x: Math.random() * 1600,
                        y: Math.random() * 800,
                        opacity: 0,
                      }}
                      animate={{
                        x: Math.random() * 1600,
                        y: Math.random() * 800,
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.5,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <AnimatePresence>
              {selectedTreeNode && (
                <motion.div
                  initial={{ opacity: 0, x: 400 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 400 }}
                  transition={{ duration: 0.4 }}
                  className="fixed right-0 top-0 w-96 h-full bg-gray-900/95 border-l border-gray-800 backdrop-blur-sm z-30 overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-primary">{selectedTreeNode.name}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTreeNode(null)}
                        className="border-gray-600 bg-transparent text-white hover:bg-primary hover:text-black"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <p className="text-gray-300 leading-relaxed">{selectedTreeNode.description}</p>

                      {selectedTreeNode.content && (
                        <>
                          {selectedTreeNode.content.sections?.map((section: any, index: number) => (
                            <div key={index} className="space-y-3">
                              {section.heading && (
                                <h4 className="text-lg font-semibold text-white">{section.heading}</h4>
                              )}

                              {section.text && <p className="text-gray-300 text-sm leading-relaxed">{section.text}</p>}

                              {section.list && (
                                <ul className="space-y-2">
                                  {section.list.map((item: any, itemIndex: number) => (
                                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-300">
                                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {section.code && (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                  <pre className="text-primary text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                                    {section.code}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}

                          {selectedTreeNode.content.metrics && (
                            <div className="space-y-3">
                              <h4 className="text-lg font-semibold text-white">Key Metrics</h4>
                              {selectedTreeNode.content.metrics.map((metric: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                                >
                                  <span className="text-gray-400 text-sm">{metric.label}</span>
                                  <span className="text-primary font-bold">{metric.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-full px-6 py-3 backdrop-blur-sm">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      visitedTreeNodes.size > index ? "bg-primary shadow-lg shadow-primary/50" : "bg-gray-600"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-400 ml-2">{visitedTreeNodes.size}/8 explored</span>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-primary text-sm font-semibold mb-3 uppercase tracking-wide">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary"></div>
                  <span className="text-gray-300">Core Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary"></div>
                  <span className="text-gray-300">Best Practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-500"></div>
                  <span className="text-gray-300">Common Pitfall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-500"></div>
                  <span className="text-gray-300">Critical Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Backtesting Types Section */}
      <section
        id="backtesting-types"
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-900/20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <Database className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">📊 Comprehensive Overview</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Every Type of <span className="text-primary">Backtesting</span> Explained
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Discover the full spectrum of backtesting methodologies, from basic historical tests to sophisticated
              machine learning approaches. Each type serves a specific purpose in the strategy validation process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {backtestingTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => setSelectedType(type)}
              >
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                        {type.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors text-white">
                          {type.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                            {type.complexity}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Speed:</span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    i < type.speed ? "bg-primary" : "bg-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-4">
                    <p className="text-white text-sm leading-relaxed">{type.description}</p>

                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {type.features.slice(0, 3).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2 text-xs text-white">
                            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <pre className="text-primary text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                        {type.codeExample}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="interactive-demo" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <PlayCircle className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">🎮 Interactive Experience</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Live <span className="text-primary">Backtesting</span> Demo
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Experience different backtesting types in action. Adjust parameters and watch how each methodology reveals
              different insights about strategy performance.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Demo Controls */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5 text-primary" />
                    Configure Your Backtest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Backtesting Type</label>
                    <Select
                      value={demoConfig.backtestType}
                      onValueChange={(value) => setDemoConfig({ ...demoConfig, backtestType: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple Historical</SelectItem>
                        <SelectItem value="walk-forward">Walk-Forward Analysis</SelectItem>
                        <SelectItem value="monte-carlo">Monte Carlo Simulation</SelectItem>
                        <SelectItem value="multi-market">Multi-Market Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Strategy</label>
                    <Select
                      value={demoConfig.strategy}
                      onValueChange={(value) => setDemoConfig({ ...demoConfig, strategy: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ma-cross">Moving Average Crossover</SelectItem>
                        <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                        <SelectItem value="momentum">Momentum Breakout</SelectItem>
                        <SelectItem value="pairs">Pairs Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Time Period</label>
                    <Select
                      value={demoConfig.timePeriod}
                      onValueChange={(value) => setDemoConfig({ ...demoConfig, timePeriod: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">Last 1 Year</SelectItem>
                        <SelectItem value="3years">Last 3 Years</SelectItem>
                        <SelectItem value="5years">Last 5 Years</SelectItem>
                        <SelectItem value="2008crisis">2008 Crisis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Initial Capital: ${demoConfig.capital[0].toLocaleString()}
                    </label>
                    <Slider
                      value={demoConfig.capital}
                      onValueChange={(value) => setDemoConfig({ ...demoConfig, capital: value })}
                      min={10000}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Risk Per Trade: {demoConfig.risk[0]}%
                    </label>
                    <Slider
                      value={demoConfig.risk}
                      onValueChange={(value) => setDemoConfig({ ...demoConfig, risk: value })}
                      min={0.5}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={runBacktest}
                    disabled={isSimulating}
                    className="w-full bg-primary hover:bg-primary/80 text-black font-semibold py-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running Backtest...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Complete Testing Suite
                      </>
                    )}
                  </Button>

                  {isSimulating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm text-white">
                        <span>Processing comprehensive test...</span>
                        <span>{simulationProgress}%</span>
                      </div>
                      <Progress value={simulationProgress} className="h-2" />
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Cpu className="w-4 h-4 animate-pulse" />
                        <span>Analyzing strategy across multiple timeframes</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Display */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Backtest Results
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 bg-transparent text-xs text-white">
                        Equity Curve
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 bg-transparent text-xs text-white">
                        Drawdown
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 bg-transparent text-xs text-white">
                        Returns
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                    {!isSimulating && simulationProgress === 0 ? (
                      <div className="text-center text-gray-400">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-white">Click "Run Backtest" to see results</p>
                        <p className="text-3xl mt-4">📊</p>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <svg className="w-full h-full">
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgb(0, 255, 136)" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="rgb(0, 255, 136)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <motion.path
                            d="M0,200 Q150,100 300,150 T600,100"
                            fill="none"
                            stroke="rgb(0, 255, 136)"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: simulationProgress / 100 }}
                            transition={{ duration: 0.5 }}
                          />
                          <motion.path
                            d="M0,200 Q150,100 300,150 T600,100 L600,250 L0,250 Z"
                            fill="url(#gradient)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: simulationProgress > 50 ? 0.3 : 0 }}
                            transition={{ duration: 0.5 }}
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Total Return", value: simulationProgress > 0 ? "+24.5%" : "--", positive: true },
                      { label: "Sharpe Ratio", value: simulationProgress > 0 ? "1.8" : "--", positive: true },
                      { label: "Max Drawdown", value: simulationProgress > 0 ? "-8.2%" : "--", positive: false },
                      { label: "Win Rate", value: simulationProgress > 0 ? "68%" : "--", positive: true },
                    ].map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gray-800/30 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors"
                      >
                        <div className={`text-2xl font-bold mb-1 ${metric.positive ? "text-primary" : "text-red-400"}`}>
                          {metric.value}
                        </div>
                        <div className="text-sm text-white">{metric.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">🔬 Technical Deep Dive</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Performance <span className="text-primary">Metrics</span> Mastery
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Master the essential metrics used to evaluate strategy performance and make informed trading decisions.
              Understand the mathematical foundations behind professional quantitative analysis.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Metrics Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-2">
                {performanceMetrics.map((metric, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => setSelectedMetric(metric)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                      selectedMetric.name === metric.name
                        ? "bg-primary/20 border border-primary text-white"
                        : "bg-gray-900/50 border border-gray-800 hover:border-gray-700 text-white hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <metric.icon
                        className={`w-5 h-5 flex-shrink-0 ${selectedMetric.name === metric.name ? "text-primary" : "text-gray-400"}`}
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm">{metric.name}</h3>
                        <p className="text-xs opacity-75">{metric.category}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Metric Details */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMetric.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <selectedMetric.icon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl mb-2 text-white">{selectedMetric.name}</CardTitle>
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {selectedMetric.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="text-xl font-semibold mb-3 text-primary">Description</h4>
                        <p className="text-white text-lg leading-relaxed">{selectedMetric.description}</p>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold mb-3 text-primary">Formula</h4>
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <code className="text-primary text-lg">{selectedMetric.formula}</code>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold mb-3 text-primary">Interpretation</h4>
                        <p className="text-white text-lg">{selectedMetric.interpretation}</p>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold mb-3 text-primary">Benchmarks</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(selectedMetric.benchmark).map(([level, value]) => (
                            <div
                              key={level}
                              className={`p-3 rounded-lg text-center ${
                                level === "excellent" || level === "high"
                                  ? "bg-green-500/20 border border-green-500/30"
                                  : level === "good"
                                    ? "bg-blue-500/20 border border-blue-500/30"
                                    : level === "fair"
                                      ? "bg-yellow-500/20 border border-yellow-500/30"
                                      : "bg-red-500/20 border border-red-500/30"
                              }`}
                            >
                              <div className="text-sm font-medium capitalize text-white">{level}</div>
                              <div className="text-lg font-bold text-white">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-blue-300 mb-2">Why This Matters</h5>
                            <p className="text-blue-200 text-sm">{selectedMetric.importance}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          Code Implementation
                        </h4>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <pre className="text-primary text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                            {selectedMetric.codeExample}
                          </pre>
                        </div>
                      </div>

                      {selectedMetric.detailedExplanation && (
                        <div>
                          <h4 className="text-xl font-semibold mb-3 text-primary">Detailed Explanation</h4>
                          <p className="text-white leading-relaxed">{selectedMetric.detailedExplanation}</p>
                        </div>
                      )}

                      {selectedMetric.limitations && (
                        <div>
                          <h4 className="text-xl font-semibold mb-3 text-primary">Limitations</h4>
                          <ul className="space-y-2">
                            {selectedMetric.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-start gap-2 text-white">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span>{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedMetric.applications && (
                        <div>
                          <h4 className="text-xl font-semibold mb-3 text-primary">Applications</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedMetric.applications.map((application, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                              >
                                {application}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Common Pitfalls Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">⚠️ Avoid Catastrophic Errors</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Common <span className="text-primary">Pitfalls</span> to Avoid
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Learn from the mistakes of others. These are the most common pitfalls that can invalidate your backtesting
              results and lead to financial losses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {commonPitfalls.map((pitfall, index) => (
              <motion.div
                key={pitfall.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                        {pitfall.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors text-white">
                          {pitfall.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-red-500/30 text-red-500 text-xs">
                            {pitfall.severity}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Frequency:</span>
                            <span className="text-xs text-white">{pitfall.frequency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-4">
                    <p className="text-white text-sm leading-relaxed">{pitfall.description}</p>

                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Solution
                      </h4>
                      <p className="text-white text-xs">{pitfall.solution}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Glossary Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">📚 Complete Reference</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Backtesting <span className="text-primary">Glossary</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Demystify the jargon of quantitative finance. Understand the key terms and concepts used in backtesting
              and algorithmic trading with comprehensive definitions and practical examples.
            </p>
          </motion.div>

          {/* Search and Filter Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative max-w-md w-full">
              <Input
                type="text"
                placeholder="Search glossary terms..."
                className="bg-gray-900/50 border-gray-800 text-white rounded-full py-3 px-6 pr-12 focus:border-primary/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGlossary.length === 0 ? (
              <div className="text-center text-gray-400 col-span-full">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No terms found matching your search criteria.</p>
              </div>
            ) : (
              filteredGlossary.map((glossaryTerm, index) => (
                <motion.div
                  key={glossaryTerm.term}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors text-white">
                          {glossaryTerm.term}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="border-blue-500/30 text-blue-500 text-xs ml-2 flex-shrink-0"
                        >
                          {glossaryTerm.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-4">
                      <p className="text-white text-sm leading-relaxed">{glossaryTerm.definition}</p>

                      {glossaryTerm.detailedExplanation && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-primary">Detailed Explanation</h4>
                          <p className="text-gray-300 text-xs leading-relaxed">{glossaryTerm.detailedExplanation}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Example
                        </h4>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                          <pre className="text-primary text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {glossaryTerm.example}
                          </pre>
                        </div>
                      </div>

                      {glossaryTerm.relatedTerms && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-primary">Related Terms</h4>
                          <div className="flex flex-wrap gap-1">
                            {glossaryTerm.relatedTerms.map((term, termIndex) => (
                              <span
                                key={termIndex}
                                className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded border border-gray-700"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Platform Comparison Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <Code className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">🛠️ Choose Your Weapon</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Backtesting <span className="text-primary">Platforms</span> Compared
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Find the right backtesting platform for your needs. Compare features, languages, costs, and more to make
              an informed decision for your quantitative trading journey.
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 border border-gray-800 rounded-lg backdrop-blur-sm"
            >
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Speed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Asset Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Best For
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Pros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cons
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                  {platforms.map((platform, index) => (
                    <motion.tr
                      key={platform.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{platform.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{platform.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < platform.speed ? "bg-primary" : "bg-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{platform.assetClasses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{platform.cost}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{platform.bestFor}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <ul className="list-disc pl-5 space-y-1">
                          {platform.pros.map((pro, proIndex) => (
                            <li key={proIndex} className="text-xs text-green-400">
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <ul className="list-disc pl-5 space-y-1">
                          {platform.cons.map((con, conIndex) => (
                            <li key={conIndex} className="text-xs text-red-400">
                              {con}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Professional Workflow Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
              <Workflow className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">🔄 Complete Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Professional <span className="text-primary">Backtesting</span> Workflow
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Follow this battle-tested workflow used by quantitative trading firms to develop, test, and deploy
              profitable strategies. Each step builds upon the previous to ensure robust strategy validation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-visible"
              >
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full relative overflow-visible group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Step Number */}
                  <div className="absolute -top-3 left-4 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center font-bold text-lg z-20 shadow-xl shadow-primary/30 border-2 border-white/20">
                    {step.number}
                  </div>

                  <CardHeader className="pt-10 pb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors text-white leading-tight">
                          {step.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <p className="text-white text-sm leading-relaxed">{step.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {step.actions.map((action, actionIndex) => (
                        <span
                          key={actionIndex}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 whitespace-nowrap"
                        >
                          {action}
                        </span>
                      ))}
                    </div>

                    {/* Connection Arrow for larger screens */}
                    {index < workflowSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-6 h-6 text-primary/50" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Master <span className="text-primary">Backtesting</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              You now have the complete knowledge base to implement professional-grade backtesting. Start with simple
              historical tests and gradually work your way up to advanced methodologies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/80 text-black font-semibold px-8 py-4 text-lg group"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Your Journey
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 hover:border-primary/50 px-8 py-4 text-lg bg-transparent group"
              >
                <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore More Resources
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/80 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Nexural Trading Platform. Master the art of quantitative backtesting.
          </p>
        </div>
      </footer>
    </div>
  )
}
