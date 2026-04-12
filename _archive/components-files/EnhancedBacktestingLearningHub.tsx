"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Crown,
  Trophy,
  User,
  Clock,
  ChevronRight,
  Lock,
  Unlock,
  Badge as BadgeIcon,
  Award,
  Brain,
  Eye,
  Lightbulb,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { 
  getUserTestingData, 
  launchTestingEngine,
  type UserTestingData 
} from "@/lib/testing-engine-config"

// User Progress Interface
interface UserProgress {
  completedMethodologies: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  totalCreditsSpent: number
  successfulTests: number
  currentStreak: number
  achievements: string[]
  favoriteMethodology?: string
}

// Enhanced Methodology Data with Business Integration
const enhancedMethodologies = [
  {
    id: "simple-historical",
    title: "Simple Historical Backtest",
    icon: TrendingUp,
    emoji: "📈",
    description: "The foundation of all backtesting. Test your strategy against historical price data to evaluate past performance.",
    
    // Business Integration
    creditCost: 1,
    difficulty: "Beginner",
    estimatedTime: "5-15 minutes",
    popularityScore: 95,
    successRate: 78,
    
    // Educational Content (Preserved)
    features: ["Basic buy/sell signal testing", "P&L calculation", "Win rate analysis", "Drawdown measurement"],
    codeExample: `backtest.run(strategy="MA_Cross",
  data=historical_prices,
  initial_capital=100000)`,
    
    detailedDescription: "Simple historical backtesting is the most fundamental approach to strategy validation. It involves running your trading algorithm against historical market data to see how it would have performed in the past.",
    
    useCases: [
      "Initial strategy validation",
      "Quick performance assessment", 
      "Educational purposes",
      "Proof of concept development"
    ],
    
    limitations: [
      "Doesn't account for market impact",
      "Assumes perfect execution",
      "May suffer from survivorship bias",
      "Limited real-world applicability"
    ],
    
    bestPractices: [
      "Use high-quality, clean data",
      "Account for transaction costs", 
      "Test across multiple time periods",
      "Validate assumptions regularly"
    ],
    
    // Interactive Elements
    interactiveElements: {
      hasCodeEditor: true,
      hasLiveDemo: true,
      hasParameterTuning: true,
      hasResultsVisualization: true
    },
    
    // Learning Path
    prerequisites: [],
    nextSteps: ["walk-forward", "monte-carlo"],
    relatedStrategies: ["Moving Average Cross", "RSI Divergence", "Bollinger Bands"]
  },
  
  {
    id: "walk-forward",
    title: "Walk-Forward Analysis", 
    icon: RotateCcw,
    emoji: "🔄",
    description: "Rolling window optimization that adapts parameters over time, preventing overfitting and ensuring robustness.",
    
    // Business Integration
    creditCost: 2,
    difficulty: "Intermediate",
    estimatedTime: "15-30 minutes",
    popularityScore: 88,
    successRate: 65,
    
    features: ["In-sample optimization", "Out-of-sample validation", "Parameter stability testing", "Adaptive strategy tuning"],
    codeExample: `walk_forward.optimize(
  window_size=252,
  step_size=21, 
  optimization="sharpe")`,
    
    detailedDescription: "Walk-forward analysis is a sophisticated backtesting technique that addresses the overfitting problem inherent in traditional backtesting.",
    
    useCases: [
      "Parameter optimization validation",
      "Adaptive strategy development",
      "Institutional strategy deployment", 
      "Risk management assessment"
    ],
    
    limitations: [
      "Computationally intensive",
      "Requires longer historical datasets",
      "May show parameter instability",
      "Complex implementation"
    ],
    
    bestPractices: [
      "Use appropriate window sizes",
      "Maintain consistent reoptimization frequency",
      "Monitor parameter stability",
      "Account for transaction costs in optimization"
    ],
    
    interactiveElements: {
      hasCodeEditor: true,
      hasLiveDemo: true, 
      hasParameterTuning: true,
      hasResultsVisualization: true
    },
    
    prerequisites: ["simple-historical"],
    nextSteps: ["monte-carlo", "multi-market"],
    relatedStrategies: ["Adaptive Moving Average", "Dynamic Pairs Trading", "Regime-Aware Momentum"]
  },
  
  {
    id: "monte-carlo",
    title: "Monte Carlo Simulation",
    icon: Shuffle,
    emoji: "🎲", 
    description: "Generate thousands of random market scenarios to understand your strategy's behavior under uncertainty.",
    
    // Business Integration
    creditCost: 3,
    difficulty: "Advanced",
    estimatedTime: "30-60 minutes", 
    popularityScore: 92,
    successRate: 58,
    
    features: ["Path-dependent analysis", "Risk distribution modeling", "Confidence intervals", "Worst-case scenarios"],
    codeExample: `monte_carlo.simulate(
  iterations=10000,
  confidence_level=0.95,
  method="bootstrap")`,
    
    detailedDescription: "Monte Carlo simulation is a powerful statistical technique that generates thousands of possible market scenarios to test strategy robustness.",
    
    useCases: [
      "Risk assessment and VaR calculation",
      "Portfolio optimization",
      "Stress testing strategies", 
      "Capital allocation decisions"
    ],
    
    limitations: [
      "Assumes historical patterns persist",
      "Computationally expensive",
      "Model selection critical",
      "May not capture regime changes"
    ],
    
    bestPractices: [
      "Use sufficient simulation runs (10,000+)",
      "Validate underlying assumptions",
      "Consider multiple stochastic models",
      "Account for parameter uncertainty"
    ],
    
    interactiveElements: {
      hasCodeEditor: true,
      hasLiveDemo: true,
      hasParameterTuning: true,
      hasResultsVisualization: true
    },
    
    prerequisites: ["simple-historical", "walk-forward"],
    nextSteps: ["multi-market", "event-driven"],
    relatedStrategies: ["Risk Parity", "Black-Litterman", "Stochastic Volatility Models"]
  },
  
  {
    id: "multi-market", 
    title: "Multi-Market Backtesting",
    icon: Globe,
    emoji: "🌐",
    description: "Test strategies across multiple markets, timeframes, and asset classes for true robustness.",
    
    // Business Integration
    creditCost: 3,
    difficulty: "Advanced",
    estimatedTime: "45-90 minutes",
    popularityScore: 85,
    successRate: 62,
    
    features: ["Cross-market correlation", "Portfolio-level metrics", "Currency adjustment", "Market regime analysis"],
    codeExample: `multi_market.test(
  markets=["SPY", "GLD", "TLT"],
  correlations=True,
  rebalance="monthly")`,
    
    detailedDescription: "Multi-market backtesting extends strategy validation across different markets, asset classes, and geographical regions.",
    
    useCases: [
      "Global portfolio strategies",
      "Cross-asset momentum strategies", 
      "Diversification analysis",
      "Multi-manager allocation"
    ],
    
    limitations: [
      "Data synchronization challenges",
      "Currency conversion complexity",
      "Different market microstructures",
      "Regulatory differences"
    ],
    
    bestPractices: [
      "Ensure data quality across markets",
      "Account for time zone differences",
      "Consider transaction costs per market",
      "Validate correlation assumptions"
    ],
    
    interactiveElements: {
      hasCodeEditor: true,
      hasLiveDemo: true,
      hasParameterTuning: true, 
      hasResultsVisualization: true
    },
    
    prerequisites: ["simple-historical", "monte-carlo"],
    nextSteps: ["event-driven", "ml-enhanced"],
    relatedStrategies: ["Global Macro", "Currency Carry", "Cross-Asset Momentum"]
  },
  
  {
    id: "event-driven",
    title: "Event-Driven Backtesting", 
    icon: Zap,
    emoji: "⚡",
    description: "Simulate real market microstructure with tick-by-tick data, order books, and latency modeling.",
    
    // Business Integration
    creditCost: 5,
    difficulty: "Expert",
    estimatedTime: "90-180 minutes",
    popularityScore: 75,
    successRate: 45,
    
    features: ["Order book simulation", "Market impact modeling", "Latency effects", "Realistic fill prices"],
    codeExample: `event_backtest.run(
  tick_data=True,
  latency_ms=5,
  slippage_model="linear")`,
    
    detailedDescription: "Event-driven backtesting represents the most sophisticated approach to strategy validation, simulating the actual market microstructure with tick-by-tick precision.",
    
    useCases: [
      "High-frequency trading strategies",
      "Market making algorithms",
      "Execution algorithm development",
      "Institutional trading systems"
    ],
    
    limitations: [
      "Extremely data intensive", 
      "High computational requirements",
      "Complex implementation",
      "Expensive tick data requirements"
    ],
    
    bestPractices: [
      "Use high-quality tick data",
      "Model realistic latency",
      "Include market impact models",
      "Validate against live trading"
    ],
    
    interactiveElements: {
      hasCodeEditor: true,
      hasLiveDemo: false, // Too complex for live demo
      hasParameterTuning: true,
      hasResultsVisualization: true
    },
    
    prerequisites: ["simple-historical", "walk-forward", "monte-carlo"],
    nextSteps: ["ml-enhanced"],
    relatedStrategies: ["Market Making", "Arbitrage", "High-Frequency Momentum"]
  },
  
  {
    id: "ml-enhanced",
    title: "ML-Enhanced Backtesting",
    icon: Bot,
    emoji: "🤖", 
    description: "Advanced testing for machine learning strategies with proper train/test splits and cross-validation.",
    
    // Business Integration
    creditCost: 4,
    difficulty: "Expert",
    estimatedTime: "60-120 minutes",
    popularityScore: 90,
    successRate: 52,
    
    features: ["Time series cross-validation", "Feature importance analysis", "Model decay testing", "Ensemble validation"],
    codeExample: `ml_backtest.validate(
  model=xgboost_model,
  cv_splits=5,
  purge_days=10)`,
    
    detailedDescription: "ML-enhanced backtesting addresses the unique challenges of testing machine learning strategies, including data leakage, overfitting, and model decay.",
    
    useCases: [
      "Machine learning strategy validation", 
      "Feature engineering testing",
      "Model performance monitoring",
      "Ensemble strategy development"
    ],
    
    limitations: [
      "Complex validation requirements",
      "Data leakage risks",
      "Model interpretability challenges", 
      "Computational complexity"
    ],
    
    bestPractices: [
      "Use proper time series splits",
      "Implement purging and embargoing",
      "Monitor for data leakage",
      "Test model decay over time"
    ],
    
    interactiveElements: {
      hasCodeEditor: true,
      hasLiveDemo: true,
      hasParameterTuning: true,
      hasResultsVisualization: true
    },
    
    prerequisites: ["simple-historical", "walk-forward", "monte-carlo"],
    nextSteps: [],
    relatedStrategies: ["Neural Network Momentum", "Ensemble Strategies", "Reinforcement Learning"]
  }
]

// Skill Level Recommendations
const skillLevelRecommendations = {
  beginner: ["simple-historical"],
  intermediate: ["simple-historical", "walk-forward", "monte-carlo"],
  advanced: ["walk-forward", "monte-carlo", "multi-market"],
  expert: ["event-driven", "ml-enhanced", "multi-market"]
}

// Progress Tracking Component
function ProgressTracker({ userProgress, onProgressUpdate }: { 
  userProgress: UserProgress
  onProgressUpdate: (progress: UserProgress) => void 
}) {
  const completedCount = userProgress.completedMethodologies.length
  const totalCount = enhancedMethodologies.length
  const completionPercentage = (completedCount / totalCount) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-emerald-400" />
          <h3 className="text-xl font-semibold text-white">Your Learning Progress</h3>
        </div>
        <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
          {userProgress.skillLevel.charAt(0).toUpperCase() + userProgress.skillLevel.slice(1)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{completedCount}/{totalCount}</div>
          <div className="text-sm text-gray-400">Methods Mastered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{userProgress.totalCreditsSpent}</div>
          <div className="text-sm text-gray-400">Credits Spent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{userProgress.successfulTests}</div>
          <div className="text-sm text-gray-400">Successful Tests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{userProgress.currentStreak}</div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-emerald-400 font-semibold">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-3" />
      </div>
      
      {userProgress.achievements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {userProgress.achievements.map((achievement, index) => (
            <Badge key={index} variant="outline" className="text-yellow-400 border-yellow-500/30">
              <BadgeIcon className="h-3 w-3 mr-1" />
              {achievement}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Smart Recommendation Engine
function SmartRecommendations({ userProgress, testingData }: {
  userProgress: UserProgress
  testingData: UserTestingData | null
}) {
  const recommendations = skillLevelRecommendations[userProgress.skillLevel]
  const availableCredits = testingData?.credits || 0
  
  const getRecommendedMethodologies = () => {
    return enhancedMethodologies.filter(method => {
      const isRecommended = recommendations.includes(method.id)
      const isNotCompleted = !userProgress.completedMethodologies.includes(method.id)
      const canAfford = availableCredits >= method.creditCost
      return isRecommended && isNotCompleted && canAfford
    }).slice(0, 3)
  }

  const recommended = getRecommendedMethodologies()

  if (recommended.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">Smart Recommendations</h3>
      </div>
      
      <p className="text-gray-300 mb-6">
        Based on your {userProgress.skillLevel} level and {availableCredits} available credits, we recommend:
      </p>
      
      <div className="grid gap-4">
        {recommended.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <method.icon className="h-5 w-5 text-purple-400" />
              <div>
                <div className="font-medium text-white">{method.title}</div>
                <div className="text-sm text-gray-400">{method.estimatedTime} • {method.difficulty}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                {method.creditCost} Credits
              </Badge>
              <Button 
                size="sm"
                onClick={() => launchTestingEngine({ 
                  strategy: method.id,
                  tutorial: true 
                })}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Try Now
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Enhanced Methodology Card with Business Integration
function EnhancedMethodologyCard({ 
  methodology, 
  userProgress, 
  testingData,
  onMethodologyStart 
}: {
  methodology: typeof enhancedMethodologies[0]
  userProgress: UserProgress
  testingData: UserTestingData | null
  onMethodologyStart: (methodId: string) => void
}) {
  const isCompleted = userProgress.completedMethodologies.includes(methodology.id)
  const canAfford = (testingData?.credits || 0) >= methodology.creditCost
  const hasPrerequisites = methodology.prerequisites.every(prereq => 
    userProgress.completedMethodologies.includes(prereq)
  )
  
  const [selectedTab, setSelectedTab] = useState("overview")
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`
        h-full transition-all duration-300 hover:shadow-xl
        ${isCompleted 
          ? 'bg-emerald-900/20 border-emerald-500/30 shadow-emerald-500/20' 
          : canAfford && hasPrerequisites
            ? 'bg-gray-900/50 border-gray-700 hover:border-emerald-500/50' 
            : 'bg-gray-900/30 border-gray-800 opacity-75'
        }
      `}>
        
        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isCompleted && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          {!hasPrerequisites && (
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
          <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
            {methodology.creditCost} Credits
          </Badge>
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <methodology.icon className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-white">{methodology.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {methodology.difficulty}
                </Badge>
                <span className="text-xs text-gray-400">
                  {methodology.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          
          {/* Popularity & Success Indicators */}
          <div className="flex justify-between text-sm mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-400">{methodology.popularityScore}% popular</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">{methodology.successRate}% success rate</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="try">Try It</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {methodology.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Key Features:</h4>
                <ul className="space-y-1">
                  {methodology.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {methodology.prerequisites.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Prerequisites:</h4>
                  <div className="flex flex-wrap gap-1">
                    {methodology.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {enhancedMethodologies.find(m => m.id === prereq)?.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="learn" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Detailed Explanation:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {methodology.detailedDescription}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Best Use Cases:</h4>
                  <ul className="space-y-1">
                    {methodology.useCases.map((useCase, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Best Practices:</h4>
                  <ul className="space-y-1">
                    {methodology.bestPractices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Limitations to Consider:</h4>
                  <ul className="space-y-1">
                    {methodology.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Code Example:</h4>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap">
                    {methodology.codeExample}
                  </pre>
                </div>
              </div>
              
              {methodology.interactiveElements.hasCodeEditor && (
                <Button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  variant="outline"
                  className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                >
                  <Code className="h-4 w-4 mr-2" />
                  {showCodeEditor ? 'Hide' : 'Show'} Interactive Code Editor
                </Button>
              )}

              {showCodeEditor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <Textarea
                    placeholder="Edit the code example above or write your own..."
                    className="h-32 font-mono text-sm bg-gray-800/50 border-gray-700"
                    defaultValue={methodology.codeExample}
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="try" className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Ready to Test This Method?</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Launch the Testing Engine with {methodology.title} pre-configured and ready to run.
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Cost:</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      {methodology.creditCost} Credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Estimated Time:</span>
                    <span className="text-sm text-white">{methodology.estimatedTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Your Credits:</span>
                    <span className={`text-sm font-semibold ${
                      canAfford ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {testingData?.credits || 0} Available
                    </span>
                  </div>
                </div>

                <Separator className="my-4 bg-gray-700" />

                {!hasPrerequisites ? (
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 mb-3">
                      Complete prerequisites first
                    </p>
                    <div className="text-xs text-gray-500">
                      Required: {methodology.prerequisites.map(p => 
                        enhancedMethodologies.find(m => m.id === p)?.title
                      ).join(', ')}
                    </div>
                  </div>
                ) : !canAfford ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-400 text-center">
                      Insufficient credits. Need {methodology.creditCost - (testingData?.credits || 0)} more.
                    </p>
                    <Button 
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => window.open('/backtesting#pricing', '_blank')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Get More Credits
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        onMethodologyStart(methodology.id)
                        launchTestingEngine({ 
                          strategy: methodology.id,
                          tutorial: !isCompleted
                        })
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      disabled={!hasPrerequisites}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Launch Testing Engine
                    </Button>
                    
                    {methodology.interactiveElements.hasLiveDemo && (
                      <Button
                        variant="outline"
                        className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => launchTestingEngine({ 
                          strategy: methodology.id,
                          tutorial: true 
                        })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Watch Live Demo First
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {methodology.relatedStrategies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Related Strategies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {methodology.relatedStrategies.map((strategy, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Credit Purchase CTA Component
function CreditPurchaseCTA({ testingData }: { testingData: UserTestingData | null }) {
  const credits = testingData?.credits || 0
  
  if (credits >= 10) return null // Don't show if user has plenty of credits

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Low on Testing Credits</h3>
          </div>
          <p className="text-gray-300 text-sm">
            You have {credits} credits remaining. Get more to continue exploring advanced methodologies.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
          >
            View Pricing
          </Button>
          <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Buy Credits
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Main Component
export default function EnhancedBacktestingLearningHub() {
  const [testingData, setTestingData] = useState<UserTestingData | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedMethodologies: ["simple-historical"], // Demo data
    skillLevel: 'intermediate',
    totalCreditsSpent: 12,
    successfulTests: 8,
    currentStreak: 5,
    achievements: ["First Test", "Method Master", "Week Streak"],
    favoriteMethodology: "monte-carlo"
  })
  const [loading, setLoading] = useState(true)
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("popularity")

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserTestingData()
        setTestingData(data)
      } catch (error) {
        console.error('Failed to load testing data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleMethodologyStart = (methodId: string) => {
    // Update user progress when they start a methodology
    setUserProgress(prev => ({
      ...prev,
      totalCreditsSpent: prev.totalCreditsSpent + (enhancedMethodologies.find(m => m.id === methodId)?.creditCost || 0)
    }))
  }

  const filteredMethodologies = enhancedMethodologies
    .filter(method => filterDifficulty === "all" || method.difficulty.toLowerCase() === filterDifficulty)
    .sort((a, b) => {
      if (sortBy === "popularity") return b.popularityScore - a.popularityScore
      if (sortBy === "difficulty") {
        const difficultyOrder = ["Beginner", "Intermediate", "Advanced", "Expert"]
        return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
      }
      if (sortBy === "credits") return a.creditCost - b.creditCost
      return 0
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-gray-800 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-16">
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (2 + Math.random() * 4) + 's'
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            🎓 Professional Backtesting Mastery
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Master Every <span className="text-emerald-400">Backtesting</span> Methodology
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Learn, practice, and master professional backtesting techniques used by quantitative trading firms worldwide. 
            From simple historical tests to advanced Monte Carlo simulations.
          </p>
        </motion.div>

        {/* Progress Tracker */}
        <ProgressTracker 
          userProgress={userProgress} 
          onProgressUpdate={setUserProgress}
        />

        {/* Smart Recommendations */}
        <SmartRecommendations 
          userProgress={userProgress}
          testingData={testingData}
        />

        {/* Credit Purchase CTA */}
        <CreditPurchaseCTA testingData={testingData} />

        {/* Filters and Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-48 border-gray-700 bg-gray-800">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-gray-700 bg-gray-800">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="credits">Credit Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredMethodologies.length} of {enhancedMethodologies.length} methodologies
          </div>
        </motion.div>

        {/* Enhanced Methodology Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {filteredMethodologies.map((methodology, index) => (
            <motion.div
              key={methodology.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnhancedMethodologyCard
                methodology={methodology}
                userProgress={userProgress}
                testingData={testingData}
                onMethodologyStart={handleMethodologyStart}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border-t border-gray-800"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Become a Backtesting Expert?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Start with the basics and work your way up to advanced methodologies. 
            Each test you run brings you closer to trading mastery.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={() => launchTestingEngine({ tutorial: true })}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Launch Testing Engine
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

