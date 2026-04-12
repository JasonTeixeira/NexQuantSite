import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Clock, Target, BookOpen, Play, CheckCircle, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Learn Backtesting - Master Strategy Testing | Nexural",
  description: "Learn how to backtest trading strategies with professional tools and comprehensive tutorials.",
}

export default function BacktestingLearnPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <BarChart3 className="w-4 h-4 mr-2" />
              Strategy Testing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Learn Backtesting
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Master the art of strategy validation with our comprehensive backtesting education. 
              Test your ideas on historical data before risking real capital.
            </p>
          </div>

          {/* Backtesting Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Historical Data</p>
                  <p className="text-2xl font-bold text-white">10+ Years</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Test Scenarios</p>
                  <p className="text-2xl font-bold text-white">1000+</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tick Data</p>
                  <p className="text-2xl font-bold text-white">1ms</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Accuracy</p>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>
          </div>

          {/* Learning Modules */}
          <h2 className="text-2xl font-bold mb-6">Backtesting Curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Fundamentals</h3>
                  <p className="text-gray-400 mb-4">Understanding backtesting basics, data requirements, and common pitfalls</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      What is backtesting
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Data quality importance
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Avoiding overfitting
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Start Module</Button>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Advanced Techniques</h3>
                  <p className="text-gray-400 mb-4">Walk-forward analysis, Monte Carlo simulations, and portfolio testing</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Walk-forward optimization
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Monte Carlo methods
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Multi-asset testing
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Start Module</Button>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Performance Metrics</h3>
                  <p className="text-gray-400 mb-4">Understanding Sharpe ratio, drawdown, and other key performance indicators</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Risk-adjusted returns
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Maximum drawdown
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Win rate analysis
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Start Module</Button>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Common Mistakes</h3>
                  <p className="text-gray-400 mb-4">Learn to avoid survivorship bias, look-ahead bias, and other pitfalls</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Survivorship bias
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Look-ahead bias
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Curve fitting
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Start Module</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Interactive Demo */}
          <Card className="bg-gradient-to-r from-primary/10 to-cyan-600/10 border-primary/30 p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-400/30">Interactive</Badge>
                <h3 className="text-2xl font-bold mb-2">Try Our Backtesting Engine</h3>
                <p className="text-gray-400 mb-4">Test your strategies with real market data in our browser-based engine</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 10 years of data</span>
                  <span className="flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> Real-time results</span>
                </div>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90 mt-4 md:mt-0">
                <Play className="w-5 h-5 mr-2" />
                Launch Demo
              </Button>
            </div>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Master Backtesting Today</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Start testing your trading ideas with confidence. Learn from experts and 
              avoid costly mistakes with proper backtesting.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
