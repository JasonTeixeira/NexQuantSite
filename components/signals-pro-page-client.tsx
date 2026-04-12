"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Zap, Target, Shield, Smartphone, BarChart3, CheckCircle, ArrowRight, Star, Trophy, Crown, Rocket, Bell, DollarSign, Clock, Users, Award, LineChart, Activity, Gauge } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SignalsProPageClient() {
  const [activeBot, setActiveBot] = useState("Q")
  const [winRate, setWinRate] = useState(87.3)
  const [monthlyProfit, setMonthlyProfit] = useState(24750)

  // Animate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setWinRate(prev => prev + (Math.random() - 0.5) * 0.2)
      setMonthlyProfit(prev => prev + Math.floor(Math.random() * 100) - 50)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const bots = [
    {
      id: "Q",
      name: "Quantum Bot Q",
      specialty: "Scalping & Day Trading",
      winRate: "89.2%",
      avgReturn: "+2.4%",
      trades: "15-25/day",
      description: "High-frequency scalping bot optimized for quick profits in volatile markets",
      color: "from-blue-500 to-cyan-500",
      performance: [
        { month: "Jan", profit: 18500 },
        { month: "Feb", profit: 22100 },
        { month: "Mar", profit: 19800 },
        { month: "Apr", profit: 25400 },
        { month: "May", profit: 21900 },
        { month: "Jun", profit: 24750 }
      ]
    },
    {
      id: "R",
      name: "Reversal Bot R",
      specialty: "Mean Reversion",
      winRate: "84.7%",
      avgReturn: "+3.1%",
      trades: "8-12/day",
      description: "Identifies oversold/overbought conditions for high-probability reversal trades",
      color: "from-purple-500 to-violet-500",
      performance: [
        { month: "Jan", profit: 16200 },
        { month: "Feb", profit: 19800 },
        { month: "Mar", profit: 21500 },
        { month: "Apr", profit: 18900 },
        { month: "May", profit: 23100 },
        { month: "Jun", profit: 20800 }
      ]
    },
    {
      id: "X",
      name: "Momentum Bot X",
      specialty: "Trend Following",
      winRate: "91.5%",
      avgReturn: "+4.2%",
      trades: "5-8/day",
      description: "Captures strong trending moves with advanced momentum indicators",
      color: "from-green-500 to-emerald-500",
      performance: [
        { month: "Jan", profit: 28900 },
        { month: "Feb", profit: 31200 },
        { month: "Mar", profit: 27800 },
        { month: "Apr", profit: 33500 },
        { month: "May", profit: 29100 },
        { month: "Jun", profit: 32400 }
      ]
    },
    {
      id: "O",
      name: "Options Bot O",
      specialty: "Options Strategies",
      winRate: "86.1%",
      avgReturn: "+5.8%",
      trades: "3-6/day",
      description: "Advanced options strategies including spreads, straddles, and iron condors",
      color: "from-orange-500 to-red-500",
      performance: [
        { month: "Jan", profit: 35600 },
        { month: "Feb", profit: 38900 },
        { month: "Mar", profit: 32100 },
        { month: "Apr", profit: 41200 },
        { month: "May", profit: 36800 },
        { month: "Jun", profit: 39500 }
      ]
    },
    {
      id: "Z",
      name: "Zen Bot Z",
      specialty: "Swing Trading",
      winRate: "88.9%",
      avgReturn: "+6.7%",
      trades: "2-4/day",
      description: "Patient swing trading approach for capturing multi-day price movements",
      color: "from-pink-500 to-rose-500",
      performance: [
        { month: "Jan", profit: 42100 },
        { month: "Feb", profit: 38700 },
        { month: "Mar", profit: 45200 },
        { month: "Apr", profit: 39800 },
        { month: "May", profit: 43600 },
        { month: "Jun", profit: 41900 }
      ]
    }
  ]

  const features = [
    {
      icon: Bell,
      title: "Real-Time Alerts",
      description: "Get instant notifications for all bot signals via Discord, SMS, and email",
      highlight: "< 2 second latency"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed performance metrics, win rates, and profit tracking for each bot",
      highlight: "Live dashboard"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Full mobile app with push notifications and one-tap trade execution",
      highlight: "iOS & Android"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in stop losses, position sizing, and portfolio risk controls",
      highlight: "Max 2% risk per trade"
    },
    {
      icon: Target,
      title: "Multi-Timeframe",
      description: "Signals across scalping, day trading, swing trading, and position trading",
      highlight: "1m to 1D timeframes"
    },
    {
      icon: Zap,
      title: "Auto-Execution",
      description: "Optional auto-trading integration with major brokers and exchanges",
      highlight: "Coming Q4 2024"
    }
  ]

  const testimonials = [
    {
      name: "David Kim",
      role: "Professional Trader",
      avatar: "/placeholder.svg?height=60&width=60&text=DK",
      content: "The Signals Pro bots have completely transformed my trading. I'm averaging $15K+ per month with their signals.",
      profit: "+$187,500",
      timeframe: "12 months",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Hedge Fund Manager",
      avatar: "/placeholder.svg?height=60&width=60&text=ER",
      content: "We use Nexural's signals for our $50M fund. The consistency and performance are unmatched in the industry.",
      profit: "+$2.1M",
      timeframe: "8 months",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Retail Trader",
      avatar: "/placeholder.svg?height=60&width=60&text=JW",
      content: "Started with $10K and now managing $85K thanks to following the bot signals religiously. Life-changing!",
      profit: "+$75,000",
      timeframe: "6 months",
      rating: 5
    }
  ]

  const pricingFeatures = [
    "Access to all 5 premium trading bots",
    "Real-time signal alerts (Discord, SMS, email)",
    "Advanced analytics dashboard",
    "Mobile app with push notifications",
    "Risk management tools",
    "Multi-timeframe analysis",
    "Priority customer support",
    "Weekly strategy webinars",
    "Backtesting tools",
    "Portfolio tracking",
    "Custom alert settings",
    "API access for developers"
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-blue-500/10" />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-500/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 pt-20"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8"
          >
            <Crown className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-semibold">PROFESSIONAL TRADING SIGNALS</span>
            <Trophy className="w-5 h-5 text-green-500" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent">
            SIGNALS PRO
            <br />
            <span className="text-4xl md:text-6xl">5 PREMIUM BOTS</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Get access to our elite suite of 5 AI-powered trading bots with an average win rate of 
            <span className="text-green-500 font-bold"> {winRate.toFixed(1)}%</span> and monthly profits of 
            <span className="text-green-500 font-bold"> ${monthlyProfit.toLocaleString()}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold text-xl px-12 py-6 rounded-xl shadow-2xl shadow-green-500/25"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Start 7-Day Free Trial
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">$55/month</div>
              <div className="text-sm text-gray-400">after free trial</div>
            </div>
          </div>

          {/* Live Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">{winRate.toFixed(1)}%</div>
                <div className="text-gray-400">Average Win Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">${monthlyProfit.toLocaleString()}</div>
                <div className="text-gray-400">Monthly Profit</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">47</div>
                <div className="text-gray-400">Signals Today</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">2,847</div>
                <div className="text-gray-400">Active Users</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Interactive Tabs Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <Tabs defaultValue="bots" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-green-500/20 rounded-xl p-2 mb-12">
              <TabsTrigger value="bots" className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold">
                🤖 Trading Bots
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold">
                ⚡ Features
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold">
                📊 Analytics
              </TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold">
                💰 Pricing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bots" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Meet Your <span className="text-green-500">AI Trading Team</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Each bot specializes in different market conditions and trading styles, 
                  giving you comprehensive coverage across all opportunities
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {bots.map((bot, index) => (
                  <motion.div
                    key={bot.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => setActiveBot(bot.id)}
                  >
                    <Card className={`bg-white/5 border-green-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300 ${activeBot === bot.id ? 'ring-2 ring-green-500' : ''}`}>
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${bot.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                            <div className="w-8 h-8 bg-white rounded text-black font-bold flex items-center justify-center text-lg">
                              {bot.id}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-500">{bot.winRate}</div>
                            <div className="text-sm text-gray-400">Win Rate</div>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-green-400 transition-colors">
                          {bot.name}
                        </h3>
                        <div className="text-green-500 font-semibold mb-4">{bot.specialty}</div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                          {bot.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-lg font-bold text-white">{bot.avgReturn}</div>
                            <div className="text-sm text-gray-400">Avg Return</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">{bot.trades}</div>
                            <div className="text-sm text-gray-400">Daily Trades</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Professional <span className="text-green-500">Trading Tools</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Everything you need to execute trades like a professional trader, 
                  all integrated into one powerful platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 mb-6 group-hover:scale-110 transition-transform duration-300">
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                          {feature.description}
                        </p>
                        <div className="inline-block bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-sm text-green-500 font-semibold">
                          {feature.highlight}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Advanced <span className="text-green-500">Performance Analytics</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Track every metric that matters with institutional-grade analytics and reporting
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-white">Real-Time Performance Dashboard</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Profit (30 days)</span>
                        <span className="text-2xl font-bold text-green-500">+$24,750</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Win Rate</span>
                        <span className="text-xl font-bold text-green-500">87.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Trades</span>
                        <span className="text-xl font-bold text-white">342</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg Trade Duration</span>
                        <span className="text-xl font-bold text-white">2h 34m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Max Drawdown</span>
                        <span className="text-xl font-bold text-red-400">-3.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sharpe Ratio</span>
                        <span className="text-xl font-bold text-green-500">2.84</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-white">Bot Performance Comparison</h3>
                    <div className="space-y-6">
                      {bots.slice(0, 3).map((bot, index) => (
                        <div key={bot.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded bg-gradient-to-r ${bot.color} flex items-center justify-center text-white font-bold text-sm`}>
                              {bot.id}
                            </div>
                            <span className="text-white">{bot.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-green-500 font-bold">{bot.winRate}</div>
                            <div className="text-sm text-gray-400">{bot.avgReturn}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Simple, <span className="text-green-500">Transparent Pricing</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  One price, all features included. No hidden fees, no surprises.
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Crown className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h3 className="text-4xl font-bold mb-4 text-white">Signals Pro</h3>
                    <div className="text-6xl font-black text-green-500 mb-2">$55</div>
                    <div className="text-xl text-gray-400 mb-8">per month</div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
                      <div className="text-2xl font-bold text-green-500 mb-2">7-Day Free Trial</div>
                      <div className="text-gray-400">Full access to all features, cancel anytime</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                      {pricingFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold text-xl px-12 py-6 rounded-xl shadow-2xl shadow-green-500/25 w-full"
                      >
                        <Rocket className="w-6 h-6 mr-3" />
                        Start Free Trial Now
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </Button>
                    </motion.div>

                    <p className="text-sm text-gray-500 mt-4">
                      No credit card required • Cancel anytime • 30-day money-back guarantee
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Real Results from <span className="text-green-500">Real Traders</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            See how our Signals Pro users are achieving consistent profits with our AI trading bots
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar || "/placeholder.svg"} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-300 italic leading-relaxed mb-6">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">{testimonial.profit}</div>
                        <div className="text-sm text-gray-400">in {testimonial.timeframe}</div>
                      </div>
                      <Award className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-12"
        >
          <Gauge className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Trade Like a <span className="text-green-500">Professional?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join 2,847+ successful traders who are already using our AI bots to generate consistent profits. 
            Start your 7-day free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold text-2xl px-16 py-8 rounded-xl shadow-2xl shadow-green-500/25"
            >
              <Trophy className="w-8 h-8 mr-4" />
              START FREE TRIAL
              <ArrowRight className="w-8 h-8 ml-4" />
            </Button>
          </motion.div>

          <p className="text-sm text-gray-500 mt-6">
            Risk Warning: Trading involves risk. Past performance does not guarantee future results.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
