"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  TestTube, 
  Rocket, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  Target,
  Shield,
  Zap,
  Play,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Plus,
  History,
  DollarSign,
  ChevronRight,
  FileText,
  Users
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  getUserTestingData, 
  launchTestingEngine,
  formatROI,
  getROIBadgeVariant,
  type UserTestingData 
} from "@/lib/testing-engine-config"

// Quick Launch Hero for Returning Users
function QuickLaunchHero({ testingData }: { testingData: UserTestingData }) {
  const [isLaunching, setIsLaunching] = useState(false)

  const handleLaunch = () => {
    setIsLaunching(true)
    launchTestingEngine({ directLaunch: true })
    setTimeout(() => setIsLaunching(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-2xl p-8 mb-12"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">
              Welcome Back to Testing Engine
            </h1>
          </div>
          <p className="text-gray-300 mb-6">
            Continue testing your strategies with professional-grade backtesting tools
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-400">
                {testingData.credits}
              </div>
              <div className="text-xs text-gray-400">Credits Available</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">
                {testingData.testsRun}
              </div>
              <div className="text-xs text-gray-400">Tests Completed</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">
                {testingData.winRate}%
              </div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className={`text-2xl font-bold ${testingData.avgRoi >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {formatROI(testingData.avgRoi)}
              </div>
              <div className="text-xs text-gray-400">Average ROI</div>
            </div>
          </div>

          {/* Last Test Info */}
          {testingData.lastTest && (
            <div className="bg-gray-800/30 rounded-lg p-4 mb-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Last Test</div>
                  <div className="text-white font-medium">{testingData.lastTest.name}</div>
                </div>
                <div className="text-right">
                  <Badge variant={getROIBadgeVariant(testingData.lastTest.roi)}>
                    {formatROI(testingData.lastTest.roi)}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">{testingData.lastTest.time}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={handleLaunch}
              disabled={isLaunching || testingData.credits === 0}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {isLaunching ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" />
                  Launching Engine...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Launch Testing Engine
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => launchTestingEngine({ tutorial: true })}
              className="border-gray-600 hover:bg-gray-800"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Tutorial
            </Button>
            <Link href="/dashboard#testing">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 hover:bg-gray-800"
              >
                <History className="mr-2 h-5 w-5" />
                View History
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Tests Preview */}
        <div className="lg:w-96">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Recent Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {testingData.recentTests.slice(0, 3).map((test) => (
                <motion.div
                  key={test.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                  onClick={() => launchTestingEngine({ strategy: test.strategy })}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{test.strategy}</div>
                    <div className="text-xs text-gray-500">{test.symbol} • {test.duration}</div>
                  </div>
                  <Badge variant={getROIBadgeVariant(test.roi)}>
                    {formatROI(test.roi)}
                  </Badge>
                </motion.div>
              ))}
              {testingData.credits <= 2 && (
                <Link href="#pricing">
                  <div className="p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-yellow-400">Low on Credits</div>
                        <div className="text-xs text-gray-400">Get more to continue testing</div>
                      </div>
                      <Plus className="h-4 w-4 text-yellow-400" />
                    </div>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

// Educational Hero for New Users
function EducationalHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-16"
    >
      <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
        Professional Testing Engine
      </Badge>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Test Your Strategies Before You Trade
      </h1>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
        Professional-grade backtesting engine to validate your trading strategies with historical data, 
        advanced analytics, and comprehensive performance metrics.
      </p>
      <div className="flex justify-center gap-4">
        <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
          <Rocket className="mr-2 h-5 w-5" />
          Start Free Trial
        </Button>
        <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800">
          <Play className="mr-2 h-5 w-5" />
          Watch Demo
        </Button>
      </div>
    </motion.div>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Historical Data Testing",
      description: "Test against years of historical market data across multiple timeframes and instruments"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in risk metrics including drawdown analysis, Sharpe ratio, and position sizing"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process millions of data points in seconds with our optimized testing engine"
    },
    {
      icon: Target,
      title: "Strategy Optimization",
      description: "Find optimal parameters with walk-forward analysis and genetic algorithms"
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Comprehensive performance reports with trade-by-trade analysis and equity curves"
    },
    {
      icon: Users,
      title: "Community Strategies",
      description: "Access and test strategies shared by our community of professional traders"
    }
  ]

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-white text-center mb-12">
        Everything You Need to Test Like a Pro
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-emerald-400 mb-3" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: "Trial",
      price: "Free",
      credits: 3,
      features: ["3 test credits", "Basic strategies", "7-day history", "Community support"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Starter",
      price: "$19",
      credits: 20,
      features: ["20 test credits/month", "All strategies", "30-day history", "Email support"],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Professional",
      price: "$49",
      credits: 100,
      features: ["100 test credits/month", "Priority processing", "Unlimited history", "Priority support"],
      cta: "Go Pro",
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      credits: "Unlimited",
      features: ["Unlimited credits", "Custom strategies", "API access", "Dedicated support"],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div id="pricing" className="mb-16">
      <h2 className="text-3xl font-bold text-white text-center mb-4">
        Simple, Transparent Pricing
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Choose the plan that fits your testing needs. All plans include access to our professional testing engine.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  Most Popular
                </Badge>
              </div>
            )}
            <Card className={`h-full ${plan.popular ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' : 'border-gray-700'} bg-gray-900/50`}>
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "Free" && plan.price !== "Custom" && (
                    <span className="text-gray-400 ml-2">/month</span>
                  )}
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
                    {plan.credits === "Unlimited" ? "Unlimited" : `${plan.credits} Credits`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Floating Quick Access Button
function FloatingQuickAccess({ testingData }: { testingData: UserTestingData | null }) {
  if (!testingData || !testingData.isReturningUser) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button
        size="lg"
        asChild
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
      >
        <Link href="/testing-engine">
          <Zap className="mr-2 h-5 w-5" />
          Quick Launch Engine
        </Link>
      </Button>
    </motion.div>
  )
}

// Main Component
export default function BacktestingHub() {
  const [testingData, setTestingData] = useState<UserTestingData | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-800 rounded-2xl mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isReturningUser = testingData?.isReturningUser || false
  const hasCredits = (testingData?.credits || 0) > 0

  return (
    <div className="min-h-screen bg-black pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section - Different for new vs returning users */}
        {isReturningUser && hasCredits ? (
          <QuickLaunchHero testingData={testingData!} />
        ) : (
          <EducationalHero />
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="features" className="mb-16">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-gray-900/50">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-8">
            <FeaturesSection />
          </TabsContent>
          
          <TabsContent value="tutorial" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle>Getting Started with Testing Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <Play className="h-16 w-16 text-gray-600" />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="text-2xl font-bold text-emerald-400">1</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Choose Your Strategy</h3>
                        <p className="text-gray-400 text-sm">Select from pre-built strategies or create your own</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-2xl font-bold text-emerald-400">2</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Configure Parameters</h3>
                        <p className="text-gray-400 text-sm">Set your timeframe, symbols, and risk parameters</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-2xl font-bold text-emerald-400">3</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Run Backtest</h3>
                        <p className="text-gray-400 text-sm">Let our engine process years of data in seconds</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-2xl font-bold text-emerald-400">4</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Analyze Results</h3>
                        <p className="text-gray-400 text-sm">Review comprehensive performance metrics and reports</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Moving Average Cross", winRate: 65, roi: 12.3, difficulty: "Beginner" },
                { name: "RSI Divergence", winRate: 72, roi: 18.5, difficulty: "Intermediate" },
                { name: "Bollinger Squeeze", winRate: 68, roi: 15.2, difficulty: "Intermediate" },
                { name: "Market Making", winRate: 78, roi: 22.1, difficulty: "Advanced" },
                { name: "Pairs Trading", winRate: 71, roi: 16.8, difficulty: "Advanced" },
                { name: "ML Momentum", winRate: 74, roi: 19.7, difficulty: "Expert" }
              ].map((strategy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-700 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{strategy.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {strategy.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Win Rate</div>
                          <div className="text-xl font-bold text-green-400">{strategy.winRate}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Avg ROI</div>
                          <div className="text-xl font-bold text-blue-400">+{strategy.roi}%</div>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => launchTestingEngine({ strategy: strategy.name })}
                      >
                        Test Strategy
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border-t border-gray-800"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Test Your Strategies?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who validate their strategies before risking real capital
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

        {/* Floating Quick Access for Returning Users */}
        <FloatingQuickAccess testingData={testingData} />
      </div>
    </div>
  )
}
