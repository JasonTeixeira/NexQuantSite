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
  Users,
  Award,
  Brain,
  Crown,
  Trophy,
  Cpu,
  Globe,
  Bot,
  Shuffle,
  RotateCcw,
  Calculator,
  Activity,
  Lightbulb,
  Eye,
  Code,
  PlayCircle,
  BadgeIcon,
  Percent
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { 
  getUserTestingData, 
  launchTestingEngine,
  formatROI,
  getROIBadgeVariant,
  type UserTestingData 
} from "@/lib/testing-engine-config"

// Pricing Plans
const pricingPlans = [
  {
    name: "Starter Pack",
    price: "$9",
    credits: 10,
    bestValue: false,
    features: [
      "10 Testing Credits",
      "Basic methodologies",
      "7-day result history",
      "Email support",
      "Strategy templates"
    ],
    popular: false,
    savings: null
  },
  {
    name: "Professional",
    price: "$24",
    originalPrice: "$30",
    credits: 30,
    bestValue: true,
    features: [
      "30 Testing Credits",
      "All methodologies unlocked",
      "30-day result history", 
      "Priority support",
      "Advanced analytics",
      "Custom parameters",
      "Export capabilities"
    ],
    popular: true,
    savings: "20% OFF"
  },
  {
    name: "Expert Trader",
    price: "$45",
    originalPrice: "$60",
    credits: 75,
    bestValue: false,
    features: [
      "75 Testing Credits",
      "Everything in Professional",
      "90-day result history",
      "API access",
      "Bulk testing",
      "White-label reports",
      "Dedicated support"
    ],
    popular: false,
    savings: "25% OFF"
  },
  {
    name: "Unlimited",
    price: "$99",
    credits: "Unlimited",
    bestValue: false,
    features: [
      "Unlimited Testing",
      "All features included",
      "Unlimited history",
      "Priority processing",
      "Custom integrations",
      "Team collaboration",
      "Enterprise support"
    ],
    popular: false,
    savings: "Best Value"
  }
]

// Quick Launch Cards for different methodologies
const quickLaunchOptions = [
  {
    id: "simple-historical",
    title: "Quick Start",
    description: "Perfect for beginners - test your first strategy in minutes",
    icon: TrendingUp,
    creditCost: 1,
    estimatedTime: "5-10 min",
    difficulty: "Beginner",
    color: "emerald"
  },
  {
    id: "monte-carlo",
    title: "Risk Analysis", 
    description: "Advanced risk modeling with Monte Carlo simulation",
    icon: Shuffle,
    creditCost: 3,
    estimatedTime: "15-30 min",
    difficulty: "Advanced", 
    color: "blue"
  },
  {
    id: "walk-forward",
    title: "Professional Grade",
    description: "Institutional-level walk-forward optimization",
    icon: RotateCcw,
    creditCost: 2,
    estimatedTime: "20-40 min",
    difficulty: "Intermediate",
    color: "purple"
  },
  {
    id: "ml-enhanced",
    title: "AI-Powered",
    description: "Machine learning enhanced backtesting",
    icon: Bot,
    creditCost: 4,
    estimatedTime: "30-60 min",
    difficulty: "Expert",
    color: "orange"
  }
]

// Benefits section
const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast Results",
    description: "Get comprehensive backtest results in seconds, not hours"
  },
  {
    icon: Shield,
    title: "Institutional Grade",
    description: "Same methodologies used by hedge funds and prop trading firms"
  },
  {
    icon: Brain,
    title: "Learn While You Test", 
    description: "Each test comes with educational insights and best practices"
  },
  {
    icon: Target,
    title: "Proven Accuracy",
    description: "92% correlation with live trading results across 10,000+ tests"
  }
]

// How it works steps
const howItWorksSteps = [
  {
    step: 1,
    title: "Choose Your Method",
    description: "Select from 6 professional backtesting methodologies",
    icon: Target
  },
  {
    step: 2, 
    title: "Configure & Launch",
    description: "Set parameters and launch with one click",
    icon: Rocket
  },
  {
    step: 3,
    title: "Get Insights",
    description: "Receive detailed analysis and actionable insights",
    icon: BarChart3
  },
  {
    step: 4,
    title: "Improve & Iterate",
    description: "Refine your strategy and test again",
    icon: TrendingUp
  }
]

// Stats section
const platformStats = [
  { label: "Tests Completed", value: "50,000+", icon: TestTube },
  { label: "Success Rate", value: "78%", icon: Trophy },
  { label: "Avg ROI Tested", value: "+12.5%", icon: TrendingUp },
  { label: "Active Traders", value: "2,500+", icon: Users }
]

// Quick Launch Card Component
function QuickLaunchCard({ option, testingData, onLaunch }: {
  option: typeof quickLaunchOptions[0]
  testingData: UserTestingData | null
  onLaunch: () => void
}) {
  const canAfford = (testingData?.credits || 0) >= option.creditCost
  const colorClasses = {
    emerald: "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-900/10",
    blue: "border-blue-500/30 hover:border-blue-500/50 bg-blue-900/10", 
    purple: "border-purple-500/30 hover:border-purple-500/50 bg-purple-900/10",
    orange: "border-orange-500/30 hover:border-orange-500/50 bg-orange-900/10"
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full ${colorClasses[option.color as keyof typeof colorClasses]} border transition-all duration-300 cursor-pointer`}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-3">
            <option.icon className={`h-8 w-8 text-${option.color}-400`} />
            <Badge variant="outline" className="text-xs">
              {option.creditCost} Credits
            </Badge>
          </div>
          <CardTitle className="text-lg text-white">{option.title}</CardTitle>
          <p className="text-sm text-gray-400">{option.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time:</span>
            <span className="text-white">{option.estimatedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Level:</span>
            <Badge variant="outline" className="text-xs">
              {option.difficulty}
            </Badge>
          </div>
          
          <Button
            onClick={onLaunch}
            disabled={!canAfford}
            className={`w-full ${
              canAfford 
                ? `bg-${option.color}-600 hover:bg-${option.color}-700 text-white`
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canAfford ? (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Launch Now
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Need Credits
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Pricing Card Component
function PricingCard({ plan, isPopular = false }: {
  plan: typeof pricingPlans[0]
  isPopular?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative"
    >
      {(plan.bestValue || isPopular) && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1">
            {plan.savings || "Most Popular"}
          </Badge>
        </div>
      )}
      
      <Card className={`h-full ${
        plan.bestValue 
          ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20 bg-emerald-900/10' 
          : 'border-gray-700 bg-gray-900/50'
      }`}>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl text-center">{plan.name}</CardTitle>
          <div className="text-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              {plan.originalPrice && (
                <span className="text-lg text-gray-400 line-through">{plan.originalPrice}</span>
              )}
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
                {plan.credits === "Unlimited" ? "∞ Credits" : `${plan.credits} Credits`}
              </Badge>
            </div>
            {plan.savings && (
              <div className="mt-2">
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  {plan.savings}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className={`w-full ${
              plan.bestValue
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
          >
            {plan.name === "Unlimited" ? "Go Unlimited" : "Buy Credits"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Main Component
export default function BacktestingBusinessHub() {
  const [testingData, setTestingData] = useState<UserTestingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")

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

  const handleQuickLaunch = (methodId: string) => {
    launchTestingEngine({
      strategy: methodId,
      tutorial: true,
      returnUrl: window.location.href
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-800 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-lg px-4 py-2">
            🚀 Professional Testing Engine
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Test Your Strategies
            <br />
            <span className="text-emerald-400">Before You Trade</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Professional-grade backtesting platform trusted by traders worldwide. 
            Validate your strategies with institutional-level methodologies in minutes, not hours.
          </p>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            {platformStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4">
              <Rocket className="mr-2 h-5 w-5" />
              Start Testing Now
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800 px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Quick Launch Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Testing Method
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From beginner-friendly historical tests to advanced Monte Carlo simulations. 
              Each method is optimized for different trading strategies and skill levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLaunchOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuickLaunchCard
                  option={option}
                  testingData={testingData}
                  onLaunch={() => handleQuickLaunch(option.id)}
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/backtesting/learn">
              <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                <BookOpen className="mr-2 h-4 w-4" />
                Learn All 6 Methodologies
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Our Testing Engine?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built by quantitative analysts, used by professional traders worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400">Simple process, professional results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
          id="pricing"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pay-As-You-Go Pricing
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              No monthly commitments. Buy credits when you need them. 
              Each credit gives you access to professional-grade backtesting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                plan={plan}
                isPopular={plan.popular}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-400 mb-4">
              All plans include access to our learning hub with 6 professional methodologies
            </p>
            <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Your Needs
            </Button>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border-t border-gray-800"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Test Your Edge?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who validate their strategies before risking real capital. 
            Start with our free trial credits.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 py-4"
              onClick={() => launchTestingEngine({ tutorial: true })}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
            <Link href="/backtesting/learn">
              <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800 px-8 py-4">
                <BookOpen className="mr-2 h-5 w-5" />
                Learn First
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

