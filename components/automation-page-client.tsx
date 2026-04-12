"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Zap, Shield, Globe, TrendingUp, BarChart3, CheckCircle, ArrowRight, Star, Trophy, Crown, Rocket, Clock, Users, DollarSign, Target, Activity, Briefcase, Building, Layers, Settings, Lock, Database, Server, Network, Brain, Eye, Gauge, Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AutomationPageClient() {
  const [timeLeft, setTimeLeft] = useState({
    days: 127,
    hours: 14,
    minutes: 32,
    seconds: 45
  })
  const [activeStrategy, setActiveStrategy] = useState(0)
  const [totalAUM, setTotalAUM] = useState(2847000000)

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Animate AUM
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalAUM(prev => prev + Math.floor(Math.random() * 100000) - 50000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const strategies = [
    {
      name: "Quantum Alpha Genesis",
      description: "Multi-dimensional arbitrage across 47 global exchanges with quantum-enhanced pattern recognition",
      aum: "$847M",
      returns: "+127.3%",
      sharpe: "4.82",
      maxDD: "-2.1%",
      complexity: 5,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Neural Momentum Fusion",
      description: "Deep learning ensemble combining 12 neural networks for momentum prediction across asset classes",
      aum: "$623M",
      returns: "+94.7%",
      sharpe: "3.91",
      maxDD: "-3.4%",
      complexity: 5,
      color: "from-purple-500 to-violet-500"
    },
    {
      name: "Systematic Risk Parity",
      description: "Dynamic risk allocation using real-time volatility forecasting and correlation modeling",
      aum: "$1.2B",
      returns: "+78.2%",
      sharpe: "2.87",
      maxDD: "-4.2%",
      complexity: 4,
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Cross-Asset Volatility",
      description: "Advanced volatility surface modeling with options flow integration across multiple timeframes",
      aum: "$456M",
      returns: "+156.8%",
      sharpe: "5.23",
      maxDD: "-1.8%",
      complexity: 5,
      color: "from-orange-500 to-red-500"
    }
  ]

  const features = [
    {
      icon: Cpu,
      title: "Quantum Processing",
      description: "Leverage quantum computing for portfolio optimization and risk calculations",
      specs: "IBM Quantum Network Access"
    },
    {
      icon: Brain,
      title: "AI Strategy Engine",
      description: "Self-evolving algorithms that adapt to market conditions in real-time",
      specs: "GPT-4 Enhanced Models"
    },
    {
      icon: Globe,
      title: "Global Market Access",
      description: "Trade across 200+ markets, exchanges, and asset classes simultaneously",
      specs: "24/7 Global Coverage"
    },
    {
      icon: Shield,
      title: "Institutional Security",
      description: "Bank-grade security with multi-signature wallets and cold storage",
      specs: "SOC 2 Type II Certified"
    },
    {
      icon: Database,
      title: "Big Data Analytics",
      description: "Process petabytes of market data with real-time pattern recognition",
      specs: "100TB+ Daily Processing"
    },
    {
      icon: Network,
      title: "Ultra-Low Latency",
      description: "Sub-microsecond execution with FPGA-accelerated trading infrastructure",
      specs: "<100ns Execution Time"
    }
  ]

  const testimonials = [
    {
      name: "Michael Chen",
      role: "CIO, Apex Capital",
      company: "Apex Capital Management",
      aum: "$12.4B AUM",
      avatar: "/placeholder.svg?height=80&width=80&text=MC",
      content: "Nexural's automation platform has revolutionized our trading operations. The AI-driven strategies consistently outperform our traditional models.",
      returns: "+$2.8B",
      timeframe: "18 months"
    },
    {
      name: "Sarah Williams",
      role: "Managing Partner",
      company: "Quantum Hedge Fund",
      aum: "$8.7B AUM",
      avatar: "/placeholder.svg?height=80&width=80&text=SW",
      content: "The level of sophistication in their quantum algorithms is unmatched. We've seen a 340% improvement in our Sharpe ratio.",
      returns: "+$1.9B",
      timeframe: "12 months"
    },
    {
      name: "David Rodriguez",
      role: "Head of Trading",
      company: "Global Asset Partners",
      aum: "$15.2B AUM",
      avatar: "/placeholder.svg?height=80&width=80&text=DR",
      content: "The automation platform handles complexity we never thought possible. It's like having a team of 1000 quants working 24/7.",
      returns: "+$4.1B",
      timeframe: "24 months"
    }
  ]

  const capabilities = [
    { title: "Multi-Asset Trading", value: "200+ Markets" },
    { title: "Processing Power", value: "100 PetaFLOPS" },
    { title: "Data Points", value: "50M+ per second" },
    { title: "Strategy Combinations", value: "10,000+" },
    { title: "Risk Models", value: "500+ Active" },
    { title: "Execution Speed", value: "<100 nanoseconds" }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-black to-purple-500/10" />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
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
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-8"
          >
            <Crown className="w-5 h-5 text-blue-500" />
            <span className="text-blue-500 font-semibold">INSTITUTIONAL GRADE AUTOMATION</span>
            <Rocket className="w-5 h-5 text-blue-500" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            FULL AUTOMATION
            <br />
            <span className="text-4xl md:text-6xl">COMING SOON</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            The world's most advanced AI-powered trading automation platform. 
            Managing <span className="text-blue-500 font-bold">${(totalAUM / 1000000000).toFixed(1)}B+</span> in assets 
            with quantum-enhanced algorithms and institutional-grade infrastructure.
          </p>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-12 max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-6 text-blue-400">LAUNCH COUNTDOWN</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="text-4xl md:text-6xl font-black text-blue-500 mb-2">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm uppercase tracking-wider text-gray-400">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-xl px-12 py-6 rounded-xl shadow-2xl shadow-blue-500/25"
              >
                <Bell className="w-6 h-6 mr-3" />
                Join Waitlist - Early Access
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Live Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-500">${(totalAUM / 1000000000).toFixed(1)}B</div>
                <div className="text-gray-400">Assets Under Management</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-500">127.3%</div>
                <div className="text-gray-400">Average Annual Return</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-500">47</div>
                <div className="text-gray-400">Institutional Clients</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Strategy Showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Institutional <span className="text-blue-500">Trading Strategies</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Advanced algorithmic strategies used by the world's largest hedge funds and institutional investors
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => setActiveStrategy(index)}
              >
                <Card className={`bg-white/5 border-blue-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300 ${activeStrategy === index ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${strategy.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex gap-1">
                        {[...Array(strategy.complexity)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-blue-500 rounded-full" />
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                      {strategy.name}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {strategy.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-blue-500">{strategy.aum}</div>
                        <div className="text-sm text-gray-400">AUM</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-500">{strategy.returns}</div>
                        <div className="text-sm text-gray-400">Annual Return</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{strategy.sharpe}</div>
                        <div className="text-sm text-gray-400">Sharpe Ratio</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">{strategy.maxDD}</div>
                        <div className="text-sm text-gray-400">Max Drawdown</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Advanced Features */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Enterprise <span className="text-blue-500">Infrastructure</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Built for institutional scale with quantum computing, AI, and ultra-low latency execution
          </p>

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
                <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-4 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-sm text-blue-500 font-semibold">
                      {feature.specs}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Capabilities Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Platform <span className="text-blue-500">Capabilities</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm text-center p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="text-3xl font-bold text-blue-500 mb-2">{capability.value}</div>
                  <div className="text-gray-400">{capability.title}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Institutional Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Trusted by <span className="text-blue-500">Industry Leaders</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Leading hedge funds and institutional investors rely on our automation platform
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar || "/placeholder.svg"} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-blue-400">{testimonial.role}</p>
                        <p className="text-xs text-gray-400">{testimonial.company}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                      <div className="text-sm text-blue-400 font-semibold">{testimonial.aum}</div>
                    </div>
                    
                    <p className="text-gray-300 italic leading-relaxed mb-6">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">{testimonial.returns}</div>
                        <div className="text-sm text-gray-400">in {testimonial.timeframe}</div>
                      </div>
                      <Building className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Waitlist CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-12"
        >
          <Gauge className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the <span className="text-blue-500">Elite Waitlist</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Be among the first institutional investors to access our quantum-powered automation platform. 
            Limited to 100 founding members with exclusive early access pricing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>Priority access</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>50% launch discount</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>Dedicated support</span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-2xl px-16 py-8 rounded-xl shadow-2xl shadow-blue-500/25"
            >
              <Crown className="w-8 h-8 mr-4" />
              JOIN ELITE WAITLIST
              <ArrowRight className="w-8 h-8 ml-4" />
            </Button>
          </motion.div>

          <p className="text-sm text-gray-500 mt-6">
            Minimum investment: $1M • Institutional clients only • Limited availability
          </p>
        </motion.div>
      </div>
    </div>
  )
}
