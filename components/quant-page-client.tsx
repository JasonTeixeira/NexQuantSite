"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Play, Database, Brain, Shield, TrendingUp, Zap } from "lucide-react"

// Animated Counter Component
const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
}: {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const startCount = 0

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      const currentCount = Math.floor(progress * (end - startCount) + startCount)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [isInView, end, duration])

  return (
    <span ref={ref} className="font-mono">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

// Enhanced Floating Particles Component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            backgroundColor:
              i % 5 === 0
                ? "#50ff88"
                : i % 5 === 1
                  ? "#60a5fa"
                  : i % 5 === 2
                    ? "#a855f7"
                    : i % 5 === 3
                      ? "#ec4899"
                      : "#fbbf24",
            opacity: Math.random() * 0.6 + 0.2,
          }}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: typeof window !== "undefined" ? window.innerHeight + 10 : 1000,
          }}
          animate={{
            y: -10,
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000) + (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: Math.random() * 20,
          }}
        />
      ))}
    </div>
  )
}

// Interactive Formula Display
const FormulaDisplay = () => {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  const formulaTerms = [
    { symbol: "P", color: "text-white", label: "Profit" },
    { symbol: "=", color: "text-gray-400", label: "equals" },
    { symbol: "f(", color: "text-white", label: "function of" },
    { symbol: "D", color: "text-primary", label: "Data Quality", pillar: 1 },
    { symbol: "×", color: "text-gray-400", label: "multiplied by" },
    { symbol: "M", color: "text-blue-400", label: "Mathematical Models", pillar: 2 },
    { symbol: "×", color: "text-gray-400", label: "multiplied by" },
    { symbol: "R", color: "text-purple-400", label: "Risk Management", pillar: 3 },
    { symbol: "×", color: "text-gray-400", label: "multiplied by" },
    { symbol: "B", color: "text-pink-400", label: "Backtesting", pillar: 4 },
    { symbol: "×", color: "text-gray-400", label: "multiplied by" },
    { symbol: "E", color: "text-yellow-400", label: "Execution", pillar: 5 },
    { symbol: ")", color: "text-white", label: "end function" },
  ]

  return (
    <div className="relative bg-gradient-to-br from-primary/5 to-blue-500/5 border border-white/10 rounded-3xl p-12 mb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 animate-pulse" />

      <div className="relative z-10 text-center">
        <div className="text-4xl md:text-6xl font-mono font-bold tracking-wider flex flex-wrap justify-center items-center gap-2 md:gap-4">
          {formulaTerms.map((term, index) => (
            <motion.span
              key={index}
              className={`${term.color} cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2`}
              whileHover={{ scale: 1.1, y: -8 }}
              onClick={() => term.pillar && setSelectedTerm(term.label)}
              title={term.label}
            >
              {term.symbol}
            </motion.span>
          ))}
        </div>

        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-black/40 rounded-xl border border-primary/20"
          >
            <h4 className="text-xl font-bold text-primary mb-2">{selectedTerm}</h4>
            <p className="text-gray-300">Click to explore this pillar in detail below</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Pillar Card Component
const PillarCard = ({
  pillar,
  delay,
}: {
  pillar: {
    number: number
    title: string
    subtitle: string
    description: string
    icon: React.ReactNode
    color: string
    features: string[]
    metrics: { value: string; label: string }[]
  }
  delay: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.8, delay }}
      className="group relative bg-black/20 border border-white/10 rounded-2xl p-8 hover:border-primary/40 hover:-translate-y-3 transition-all duration-500 cursor-pointer overflow-hidden"
      style={{ "--pillar-color": pillar.color } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--pillar-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="relative w-20 h-20 bg-white/5 border-2 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform duration-500"
            style={{ borderColor: pillar.color }}
          >
            {pillar.icon}
            <div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-black"
              style={{ backgroundColor: pillar.color }}
            >
              {pillar.number}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{pillar.title}</h3>
            <p className="text-sm font-semibold" style={{ color: pillar.color }}>
              {pillar.subtitle}
            </p>
          </div>
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">{pillar.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {pillar.metrics.map((metric, index) => (
            <div key={index} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold font-mono mb-1" style={{ color: pillar.color }}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{metric.label}</div>
            </div>
          ))}
        </div>

        <ul className="space-y-3">
          {pillar.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-300">
              <span className="text-sm mt-1 flex-shrink-0" style={{ color: pillar.color }}>
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

// Enhanced Interactive Visualization Component with Category-Specific Animations
const InteractiveVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState("data")
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)
  const [infoPanel, setInfoPanel] = useState({
    title: "Real-Time Data Processing",
    description: "Processing 10TB of market data daily from 500+ sources with microsecond precision.",
    icon: <Database className="w-6 h-6" />,
    color: "#50ff88",
    metrics: [
      { value: "10TB", label: "Daily Volume" },
      { value: "0.1ms", label: "Latency" },
      { value: "99.99%", label: "Uptime" },
      { value: "500+", label: "Sources" },
    ],
  })
  const [liveMetrics, setLiveMetrics] = useState({
    processing: "9,847 MB/s",
    efficiency: "98.2%",
    signals: "142",
  })

  // Professional component information with proper icons and colors
  const componentInfo = {
    data: {
      title: "Real-Time Data Processing",
      description: "Processing 10TB of market data daily from 500+ sources with microsecond precision.",
      icon: <Database className="w-6 h-6" />,
      color: "#50ff88",
      metrics: [
        { value: "10TB", label: "Daily Volume" },
        { value: "0.1ms", label: "Latency" },
        { value: "99.99%", label: "Uptime" },
        { value: "500+", label: "Sources" },
      ],
    },
    model: {
      title: "AI-Powered Models",
      description: "150+ sophisticated models including deep learning, statistical arbitrage, and ensemble methods.",
      icon: <Brain className="w-6 h-6" />,
      color: "#60a5fa",
      metrics: [
        { value: "150+", label: "Models" },
        { value: "73%", label: "Win Rate" },
        { value: "AI/ML", label: "Powered" },
        { value: "24/7", label: "Learning" },
      ],
    },
    risk: {
      title: "Advanced Risk Management",
      description: "Dynamic position sizing with portfolio optimization and comprehensive drawdown protection.",
      icon: <Shield className="w-6 h-6" />,
      color: "#a855f7",
      metrics: [
        { value: "2.8", label: "Sharpe" },
        { value: "12%", label: "Max DD" },
        { value: "Kelly", label: "Sizing" },
        { value: "VAR", label: "Analysis" },
      ],
    },
    backtest: {
      title: "Rigorous Validation",
      description: "10+ years of historical testing with walk-forward analysis and Monte Carlo simulations.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "#ec4899",
      metrics: [
        { value: "10+", label: "Years" },
        { value: "99.9%", label: "Accuracy" },
        { value: "1M+", label: "Scenarios" },
        { value: "OOS", label: "Validated" },
      ],
    },
    execution: {
      title: "Lightning-Fast Execution",
      description: "Microsecond execution with smart order routing and co-located infrastructure.",
      icon: <Zap className="w-6 h-6" />,
      color: "#fbbf24",
      metrics: [
        { value: "0.1ms", label: "Speed" },
        { value: "24/7", label: "Active" },
        { value: "SOR", label: "Routing" },
        { value: "0.01%", label: "Slippage" },
      ],
    },
  }

  // Update live metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics({
        processing: `${(Math.random() * 1000 + 9000).toFixed(0)} MB/s`,
        efficiency: `${(Math.random() * 5 + 95).toFixed(1)}%`,
        signals: `${(Math.random() * 50 + 150).toFixed(0)}`,
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Handle view changes and update info panel
  const handleViewChange = (view: string) => {
    setActiveView(view)
    if (componentInfo[view as keyof typeof componentInfo]) {
      setInfoPanel(componentInfo[view as keyof typeof componentInfo])
    }
  }

  const handleComponentHover = (component: string) => {
    if (componentInfo[component as keyof typeof componentInfo]) {
      setInfoPanel(componentInfo[component as keyof typeof componentInfo])
      setHoveredComponent(component)
    }
  }

  const handleComponentLeave = () => {
    setHoveredComponent(null)
    // Reset to active view info
    if (componentInfo[activeView as keyof typeof componentInfo]) {
      setInfoPanel(componentInfo[activeView as keyof typeof componentInfo])
    }
  }

  // Category-specific animation components
  const DataFlowAnimation = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Data streams flowing from multiple sources */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`data-stream-${i}`}
          className="absolute w-1 bg-gradient-to-b from-primary via-primary/80 to-transparent rounded-full"
          style={{
            left: `${10 + i * 7}%`,
            height: "80px",
          }}
          animate={{
            y: [-80, 600],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
            ease: "linear",
          }}
        />
      ))}

      {/* Data processing nodes representing different exchanges */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`data-node-${i}`}
          className="absolute w-6 h-6 bg-primary rounded-full shadow-lg border-2 border-primary/50"
          style={{
            left: `${15 + (i % 4) * 20}%`,
            top: `${30 + Math.floor(i / 4) * 40}%`,
            boxShadow: `0 0 20px ${componentInfo.data.color}`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
            borderColor: ["rgba(80, 255, 136, 0.5)", "rgba(80, 255, 136, 1)", "rgba(80, 255, 136, 0.5)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Data aggregation center */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-16 h-16 border-4 border-primary rounded-full flex items-center justify-center bg-primary/10"
        style={{ transform: "translate(-50%, -50%)" }}
        animate={{
          scale: [1, 1.1, 1],
          borderColor: ["#50ff88", "#60ff98", "#50ff88"],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <Database className="w-8 h-8 text-primary" />
      </motion.div>

      {/* Binary data visualization */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={`binary-${i}`}
          className="absolute text-xs font-mono text-primary/60"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 60 + 20}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -40, -80],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 3,
          }}
        >
          {Math.random() > 0.5 ? "1" : "0"}
        </motion.div>
      ))}

      {/* Data flow connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 100 200 Q 200 150 300 200 T 500 200 T 700 200"
          stroke={componentInfo.data.color}
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
          animate={{
            strokeDashoffset: [0, -24],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </svg>
    </div>
  )

  const ModelAnimation = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Neural network layers */}
      {Array.from({ length: 4 }).map((_, layer) => (
        <div key={`layer-${layer}`} className="absolute" style={{ left: `${15 + layer * 18}%`, top: "15%" }}>
          {Array.from({ length: 6 }).map((_, node) => (
            <motion.div
              key={`neuron-${layer}-${node}`}
              className="absolute w-8 h-8 bg-blue-400 rounded-full border-2 border-blue-300 flex items-center justify-center"
              style={{
                top: `${node * 70}px`,
                boxShadow: `0 0 15px ${componentInfo.model.color}`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                borderColor: ["#60a5fa", "#93c5fd", "#60a5fa"],
                backgroundColor: ["#60a5fa", "#3b82f6", "#60a5fa"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: layer * 0.2 + node * 0.1,
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
          ))}
        </div>
      ))}

      {/* Neural connections with data flow */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => {
          const layer1 = Math.floor(i / 6)
          const node1 = i % 6
          const layer2 = layer1 + 1
          const node2 = (i + 1) % 6

          if (layer2 >= 4) return null

          return (
            <motion.line
              key={`connection-${i}`}
              x1={`${15 + layer1 * 18 + 4}%`}
              y1={`${15 + node1 * 10}%`}
              x2={`${15 + layer2 * 18}%`}
              y2={`${15 + node2 * 10}%`}
              stroke={componentInfo.model.color}
              strokeWidth="2"
              opacity="0.6"
              animate={{
                opacity: [0.3, 0.9, 0.3],
                strokeWidth: [1, 3, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
              }}
            />
          )
        })}
      </svg>

      {/* AI brain visualization */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-32 h-32 border-3 border-blue-400 rounded-full flex items-center justify-center bg-blue-400/10"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
          borderColor: ["#60a5fa", "#3b82f6", "#60a5fa"],
        }}
        transition={{
          rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 3, repeat: Number.POSITIVE_INFINITY },
          borderColor: { duration: 2, repeat: Number.POSITIVE_INFINITY },
        }}
      >
        <div className="absolute inset-4 border-2 border-blue-400/60 rounded-full" />
        <div className="absolute inset-8 border border-blue-400/40 rounded-full" />
        <Brain className="w-12 h-12 text-blue-400" />
      </motion.div>

      {/* Model accuracy indicators */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`accuracy-${i}`}
          className="absolute text-sm font-mono text-blue-400/80 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/30"
          style={{
            left: `${15 + i * 15}%`,
            bottom: "15%",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            y: [0, -10, 0],
            borderColor: ["rgba(96, 165, 250, 0.3)", "rgba(96, 165, 250, 0.6)", "rgba(96, 165, 250, 0.3)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        >
          {(Math.random() * 20 + 70).toFixed(1)}%
        </motion.div>
      ))}
    </div>
  )

  const RiskAnimation = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Risk shields positioned strategically */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`risk-shield-${i}`}
          className="absolute w-12 h-12 border-2 border-purple-400 rounded-xl flex items-center justify-center bg-purple-400/10"
          style={{
            left: `${15 + (i % 4) * 20}%`,
            top: `${25 + Math.floor(i / 4) * 35}%`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0],
            borderColor: ["#a855f7", "#c084fc", "#a855f7"],
            boxShadow: [
              `0 0 10px ${componentInfo.risk.color}30`,
              `0 0 20px ${componentInfo.risk.color}60`,
              `0 0 10px ${componentInfo.risk.color}30`,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        >
          <Shield className="w-6 h-6 text-purple-400" />
        </motion.div>
      ))}

      {/* Risk assessment meters */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`risk-meter-${i}`}
          className="absolute bg-purple-400/20 rounded-full border border-purple-400/30"
          style={{
            left: `${20 + i * 10}%`,
            bottom: "20%",
            width: "8px",
            height: `${30 + Math.random() * 40}px`,
          }}
          animate={{
            height: [`${30 + Math.random() * 40}px`, `${40 + Math.random() * 50}px`, `${30 + Math.random() * 40}px`],
            backgroundColor: ["rgba(168, 85, 247, 0.2)", "rgba(196, 132, 252, 0.4)", "rgba(168, 85, 247, 0.2)"],
            borderColor: ["rgba(168, 85, 247, 0.3)", "rgba(168, 85, 247, 0.6)", "rgba(168, 85, 247, 0.3)"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Risk radar scanner */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-40 h-40 border-2 border-purple-400/40 rounded-full bg-purple-400/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <div className="absolute inset-6 border border-purple-400/30 rounded-full" />
        <div className="absolute inset-12 border border-purple-400/20 rounded-full" />
        <motion.div
          className="absolute top-1/2 left-1/2 w-1 h-16 bg-purple-400 origin-bottom rounded-full"
          style={{ transform: "translate(-50%, -100%)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        {/* Risk detection blips */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`blip-${i}`}
            className="absolute w-3 h-3 bg-purple-400 rounded-full"
            style={{
              left: `${40 + Math.cos(i * 1.2) * 25}%`,
              top: `${40 + Math.sin(i * 1.2) * 25}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* VaR calculations floating */}
      {["VaR", "CVaR", "β", "σ", "Sharpe"].map((symbol, i) => (
        <motion.div
          key={`risk-calc-${i}`}
          className="absolute text-lg font-bold text-purple-400/80 font-mono bg-purple-400/10 px-3 py-2 rounded-lg border border-purple-400/30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${15 + (i % 2) * 25}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.1, 1],
            borderColor: ["rgba(168, 85, 247, 0.3)", "rgba(168, 85, 247, 0.6)", "rgba(168, 85, 247, 0.3)"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.7,
          }}
        >
          {symbol}
        </motion.div>
      ))}
    </div>
  )

  const BacktestAnimation = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Historical timeline */}
      <div className="absolute bottom-1/3 left-0 right-0 h-1 bg-pink-400/30 rounded-full" />

      {/* Historical data points along timeline */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`historical-point-${i}`}
          className="absolute w-4 h-4 bg-pink-400 rounded-full border-2 border-pink-300"
          style={{
            left: `${5 + i * 3}%`,
            bottom: `${33 + Math.sin(i * 0.3) * 15}%`,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6],
            y: [0, -8, 0],
            borderColor: ["#f472b6", "#ec4899", "#f472b6"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.1,
          }}
        />
      ))}

      {/* Performance curve drawing animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 50 400 Q 150 350 250 300 T 450 250 T 650 200 T 850 150"
          stroke={componentInfo.backtest.color}
          strokeWidth="4"
          fill="none"
          filter="drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Performance area fill */}
        <motion.path
          d="M 50 400 Q 150 350 250 300 T 450 250 T 650 200 T 850 150 L 850 450 L 50 450 Z"
          fill="url(#backtestGradient)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        <defs>
          <linearGradient id="backtestGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.05)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Mathematical formulas and statistics */}
      {["Sharpe", "α", "β", "R²", "σ", "μ"].map((symbol, i) => (
        <motion.div
          key={`backtest-formula-${i}`}
          className="absolute text-xl font-bold text-pink-400/80 font-mono bg-pink-400/10 px-3 py-2 rounded-lg border border-pink-400/30"
          style={{
            left: `${15 + (i % 3) * 25}%`,
            top: `${20 + Math.floor(i / 3) * 30}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
            borderColor: ["rgba(236, 72, 153, 0.3)", "rgba(236, 72, 153, 0.6)", "rgba(236, 72, 153, 0.3)"],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.6,
          }}
        >
          {symbol}
        </motion.div>
      ))}

      {/* Monte Carlo simulation particles */}
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={`monte-carlo-${i}`}
          className="absolute w-2 h-2 bg-pink-400/60 rounded-full"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 60 + 20}%`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 60, 0],
            y: [0, (Math.random() - 0.5) * 60, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Validation checkmarks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`validation-${i}`}
          className="absolute w-8 h-8 border-2 border-pink-400 rounded-full flex items-center justify-center bg-pink-400/10"
          style={{
            right: `${15 + i * 12}%`,
            top: `${30 + i * 12}%`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            borderColor: ["#ec4899", "#f472b6", "#ec4899"],
            backgroundColor: ["rgba(236, 72, 153, 0.1)", "rgba(236, 72, 153, 0.2)", "rgba(236, 72, 153, 0.1)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.4,
          }}
        >
          <span className="text-pink-400 text-sm font-bold">✓</span>
        </motion.div>
      ))}
    </div>
  )

  const ExecutionAnimation = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Lightning speed indicators */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`lightning-${i}`}
          className="absolute"
          style={{
            left: `${10 + i * 7}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.5, 0.8],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.1,
          }}
        >
          <Zap className="w-6 h-6 text-yellow-400" />
        </motion.div>
      ))}

      {/* Speed lines racing across */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`speed-line-${i}`}
          className="absolute h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"
          style={{
            top: `${25 + i * 6}%`,
            width: "50%",
          }}
          animate={{
            x: ["-100%", "200%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Order execution hub */}
      <motion.div
        className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-yellow-400 rounded-full flex items-center justify-center bg-yellow-400/10"
        animate={{
          scale: [1, 1.2, 1],
          borderColor: ["#fbbf24", "#fcd34d", "#fbbf24"],
          boxShadow: [
            "0 0 20px rgba(251, 191, 36, 0.4)",
            "0 0 40px rgba(251, 191, 36, 0.6)",
            "0 0 20px rgba(251, 191, 36, 0.4)",
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <motion.div
          className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Zap className="w-6 h-6 text-black" />
        </motion.div>
      </motion.div>

      {/* Execution pulses radiating outward */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`execution-pulse-${i}`}
          className="absolute border-2 border-yellow-400 rounded-full"
          style={{
            top: "50%",
            left: "33.33%",
            width: "96px",
            height: "96px",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 4, 1],
            opacity: [0.8, 0, 0.8],
            borderWidth: [2, 0, 2],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.25,
          }}
        />
      ))}

      {/* Smart order routing paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.path
            key={`routing-path-${i}`}
            d={`M 300 250 Q ${400 + i * 40} ${180 + i * 20} ${600 + i * 30} ${220 + i * 15}`}
            stroke={componentInfo.execution.color}
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            animate={{
              strokeDashoffset: [0, -24],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "linear",
            }}
          />
        ))}
      </svg>

      {/* Latency indicators */}
      {["0.1ms", "0.2ms", "0.1ms", "0.3ms", "0.1ms"].map((latency, i) => (
        <motion.div
          key={`latency-${i}`}
          className="absolute text-sm font-mono text-yellow-400/80 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/30"
          style={{
            right: `${15 + i * 12}%`,
            top: `${25 + i * 15}%`,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.1, 1],
            y: [0, -5, 0],
            borderColor: ["rgba(251, 191, 36, 0.3)", "rgba(251, 191, 36, 0.6)", "rgba(251, 191, 36, 0.3)"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.4,
          }}
        >
          {latency}
        </motion.div>
      ))}

      {/* Co-location server indicators */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`server-${i}`}
          className="absolute w-6 h-8 bg-yellow-400/20 border border-yellow-400/40 rounded-sm"
          style={{
            bottom: "15%",
            left: `${25 + i * 12}%`,
          }}
          animate={{
            backgroundColor: ["rgba(251, 191, 36, 0.2)", "rgba(251, 191, 36, 0.4)", "rgba(251, 191, 36, 0.2)"],
            borderColor: ["rgba(251, 191, 36, 0.4)", "rgba(251, 191, 36, 0.6)", "rgba(251, 191, 36, 0.4)"],
            height: ["32px", "40px", "32px"],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )

  // Render the appropriate animation based on active view
  const renderAnimation = () => {
    switch (activeView) {
      case "data":
        return <DataFlowAnimation />
      case "model":
        return <ModelAnimation />
      case "risk":
        return <RiskAnimation />
      case "backtest":
        return <BacktestAnimation />
      case "execution":
        return <ExecutionAnimation />
      default:
        return <DataFlowAnimation />
    }
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-6 py-3 text-sm uppercase tracking-wider font-semibold">
            SEE THE MATHEMATICS OF SUCCESS
          </Badge>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black mb-6"
        >
          The Formula <span className="text-primary">Visualized</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
        >
          Experience how mathematical precision transforms market chaos into consistent profits. Each component works in
          perfect synchronization to deliver superior returns.
        </motion.p>
      </div>

      {/* Enhanced Formula Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 overflow-hidden backdrop-blur-sm"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute inset-0 bg-gradient-conic from-emerald-500/20 via-blue-500/20 via-purple-500/20 to-emerald-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="inline-flex items-center gap-3 md:gap-6 p-8 md:p-12 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="text-4xl md:text-6xl font-mono font-black text-primary"
              style={{ textShadow: "0 0 30px rgba(80, 255, 136, 0.5)" }}
              animate={{
                textShadow: [
                  "0 0 30px rgba(80, 255, 136, 0.5)",
                  "0 0 40px rgba(80, 255, 136, 0.8)",
                  "0 0 30px rgba(80, 255, 136, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              P
            </motion.span>
            <span className="text-4xl md:text-6xl font-mono font-black text-gray-400">=</span>
            <span className="text-4xl md:text-6xl font-mono font-black text-blue-400">f(</span>

            {Object.entries(componentInfo).map(([key, info], index) => (
              <React.Fragment key={key}>
                <motion.span
                  className="text-4xl md:text-6xl font-mono font-black cursor-pointer transition-all duration-300 px-4 py-3 rounded-xl relative overflow-hidden group"
                  style={{ color: info.color }}
                  whileHover={{
                    scale: 1.15,
                    y: -8,
                    textShadow: `0 0 20px ${info.color}80`,
                  }}
                  onMouseEnter={() => handleComponentHover(key)}
                  onMouseLeave={handleComponentLeave}
                  onClick={() => handleViewChange(key)}
                >
                  {key.charAt(0).toUpperCase()}
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle, ${info.color}20, transparent)` }}
                  />
                  {activeView === key && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                  )}
                </motion.span>
                {index < Object.keys(componentInfo).length - 1 && (
                  <motion.span
                    className="text-4xl md:text-6xl font-mono font-black text-gray-400"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                  >
                    ×
                  </motion.span>
                )}
              </React.Fragment>
            ))}

            <span className="text-4xl md:text-6xl font-mono font-black text-blue-400">)</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Component Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
        {Object.entries(componentInfo).map(([key, info], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6 text-center cursor-pointer transition-all duration-500 hover:border-white/30 hover:-translate-y-3 relative overflow-hidden"
            style={{ "--card-color": info.color } as React.CSSProperties}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => handleComponentHover(key)}
            onMouseLeave={handleComponentLeave}
            onClick={() => handleViewChange(key)}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at center, ${info.color}15, transparent)` }}
            />

            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-white/5 border-2 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12"
                style={{ borderColor: info.color, color: info.color }}
                whileHover={{ rotate: 12, scale: 1.1 }}
              >
                {info.icon}
              </motion.div>
              <div className="text-sm font-bold mb-2" style={{ color: info.color }}>
                {key.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400 font-mono">{info.metrics[0].value}</div>
            </div>

            {/* Active indicator */}
            {activeView === key && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs"
                style={{ backgroundColor: info.color }}
              >
                ✓
              </motion.div>
            )}

            {/* Hover glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 20px ${info.color}30, 0 0 20px ${info.color}20`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Visualization Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative bg-gradient-to-b from-black/80 to-black/95 border border-white/20 rounded-3xl overflow-hidden backdrop-blur-sm h-[700px] shadow-2xl"
      >
        {/* Enhanced View Selector */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 bg-black/90 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-lg">
          {[
            { id: "data", label: "Data Flow", color: "#50ff88", icon: <Database className="w-4 h-4" /> },
            { id: "model", label: "AI Models", color: "#60a5fa", icon: <Brain className="w-4 h-4" /> },
            { id: "risk", label: "Risk Analysis", color: "#a855f7", icon: <Shield className="w-4 h-4" /> },
            { id: "backtest", label: "Backtesting", color: "#ec4899", icon: <TrendingUp className="w-4 h-4" /> },
            { id: "execution", label: "Execution", color: "#fbbf24", icon: <Zap className="w-4 h-4" /> },
          ].map((view) => (
            <motion.button
              key={view.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeView === view.id
                  ? `bg-white/15 text-white shadow-lg`
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              style={activeView === view.id ? { color: view.color, borderColor: view.color } : {}}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleViewChange(view.id)}
            >
              {view.icon}
              <span className="hidden md:inline">{view.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Animation Area */}
        <div className="w-full h-full relative" ref={containerRef}>
          {/* Enhanced Animated Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(80, 255, 136, 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(80, 255, 136, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
              animate={{
                backgroundPosition: ["0px 0px", "60px 60px"],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </div>

          {/* Render Category-Specific Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {renderAnimation()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Info Display Panel - Fixed positioning to prevent overlap */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="absolute top-20 right-8 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-80 z-40 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${infoPanel.color}20`, color: infoPanel.color }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {infoPanel.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white">{infoPanel.title}</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">{infoPanel.description}</p>
            <div className="grid grid-cols-2 gap-4">
              {infoPanel.metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-white/20 transition-colors duration-300"
                >
                  <div className="text-lg font-bold font-mono mb-1" style={{ color: infoPanel.color }}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Live Metrics Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/95 to-transparent border-t border-white/10 flex items-center justify-around px-8 z-25">
          <motion.div
            className="flex items-center gap-3"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-primary shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(80, 255, 136, 0.5)",
                  "0 0 20px rgba(80, 255, 136, 0.8)",
                  "0 0 10px rgba(80, 255, 136, 0.5)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Status:</span>
            <span className="text-sm font-bold text-primary">LIVE</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Processing:</span>
            <motion.span
              className="text-sm font-bold text-primary font-mono"
              key={liveMetrics.processing}
              initial={{ scale: 1.2, color: "#60ff88" }}
              animate={{ scale: 1, color: "#50ff88" }}
              transition={{ duration: 0.3 }}
            >
              {liveMetrics.processing}
            </motion.span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Efficiency:</span>
            <motion.span
              className="text-sm font-bold text-primary font-mono"
              key={liveMetrics.efficiency}
              initial={{ scale: 1.2, color: "#60ff88" }}
              animate={{ scale: 1, color: "#50ff88" }}
              transition={{ duration: 0.3 }}
            >
              {liveMetrics.efficiency}
            </motion.span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Signals/min:</span>
            <motion.span
              className="text-sm font-bold text-primary font-mono"
              key={liveMetrics.signals}
              initial={{ scale: 1.2, color: "#60ff88" }}
              animate={{ scale: 1, color: "#50ff88" }}
              transition={{ duration: 0.3 }}
            >
              {liveMetrics.signals}
            </motion.span>
          </div>
        </div>

        {/* Activity indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          {[
            { color: "#50ff88", delay: 0 },
            { color: "#60a5fa", delay: 0.5 },
            { color: "#a855f7", delay: 1 },
            { color: "#ec4899", delay: 1.5 },
            { color: "#fbbf24", delay: 2 },
          ].map((indicator, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: indicator.color }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
                boxShadow: [`0 0 5px ${indicator.color}`, `0 0 15px ${indicator.color}`, `0 0 5px ${indicator.color}`],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: indicator.delay,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Problem Card Component
const ProblemCard = ({
  icon,
  stat,
  title,
  description,
  delay,
}: {
  icon: string
  stat: string
  title: string
  description: string
  delay: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      className="group relative bg-black/20 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-4 right-4 text-2xl font-mono text-red-500/30 font-black">{stat}</div>
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-red-400 mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}

// Bot Card Component
const BotCard = ({
  bot,
  delay,
}: {
  bot: {
    id: string
    name: string
    type: string
    description: string
    winRate: number
    avgReturn: string
    timeframe: string
  }
  delay: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.8, delay }}
      className="group relative bg-black/20 border border-primary/20 rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center text-2xl font-bold font-mono text-primary group-hover:rotate-12 transition-transform duration-300">
          {bot.id}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{bot.name}</h3>
          <p className="text-sm text-gray-400 uppercase tracking-wider">{bot.type}</p>
        </div>
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">{bot.description}</p>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
        <div className="text-center">
          <div className="text-xl font-bold text-primary font-mono">{bot.winRate}%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary font-mono">{bot.avgReturn}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Return</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary font-mono">{bot.timeframe}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Timeframe</div>
        </div>
      </div>
    </motion.div>
  )
}

// Risk Calculator Component
const RiskCalculator = () => {
  const [accountSize, setAccountSize] = useState([10000])
  const [riskPercent, setRiskPercent] = useState([2])
  const [winRate, setWinRate] = useState([70])

  const calculateReturn = () => {
    const account = accountSize[0]
    const risk = riskPercent[0]
    const win = winRate[0]

    const riskAmount = account * (risk / 100)
    const winRateDecimal = win / 100
    const avgWin = riskAmount * 2 // 2:1 risk/reward
    const avgLoss = riskAmount
    const expectedValue = winRateDecimal * avgWin - (1 - winRateDecimal) * avgLoss
    const monthlyTrades = 20
    const monthlyReturn = expectedValue * monthlyTrades

    return monthlyReturn
  }

  const monthlyReturn = calculateReturn()

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <label className="block text-sm text-gray-400 uppercase tracking-wider mb-4">Account Size</label>
            <Slider
              value={accountSize}
              onValueChange={setAccountSize}
              max={100000}
              min={1000}
              step={1000}
              className="mb-4"
            />
            <div className="text-2xl font-bold text-primary font-mono">${accountSize[0].toLocaleString()}</div>
          </div>

          <div className="text-center">
            <label className="block text-sm text-gray-400 uppercase tracking-wider mb-4">Risk Per Trade</label>
            <Slider value={riskPercent} onValueChange={setRiskPercent} max={5} min={0.5} step={0.5} className="mb-4" />
            <div className="text-2xl font-bold text-primary font-mono">{riskPercent[0]}%</div>
          </div>

          <div className="text-center">
            <label className="block text-sm text-gray-400 uppercase tracking-wider mb-4">Win Rate</label>
            <Slider value={winRate} onValueChange={setWinRate} max={90} min={40} step={5} className="mb-4" />
            <div className="text-2xl font-bold text-primary font-mono">{winRate[0]}%</div>
          </div>
        </div>

        <div className="text-center bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className={`text-4xl font-black mb-2 font-mono ${monthlyReturn >= 0 ? "text-primary" : "text-red-500"}`}>
            {monthlyReturn >= 0 ? "+" : ""}${Math.abs(Math.floor(monthlyReturn)).toLocaleString()}
          </div>
          <div className="text-gray-400">Expected Monthly Return</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function QuantPageClient() {
  const { scrollYProgress } = useScroll()

  // Transform values for parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const problems = [
    {
      icon: "😱",
      stat: "-73%",
      title: "Emotional Trading",
      description:
        "Fear and greed drive decisions. Panic selling at lows, FOMO buying at highs. Your emotions are your worst enemy.",
    },
    {
      icon: "⏰",
      stat: "24/7",
      title: "Market Never Sleeps",
      description:
        "Crypto trades 24/7. Miss one move while you sleep, and months of gains vanish. Humans need rest, markets don't.",
    },
    {
      icon: "📊",
      stat: "1ms",
      title: "Speed Disadvantage",
      description:
        "By the time you see the opportunity, algorithms have already traded it. Manual trading is bringing a knife to a gunfight.",
    },
    {
      icon: "🎲",
      stat: "50/50",
      title: "Random Strategies",
      description:
        "Most traders guess. No backtesting, no data, just hope. That's not trading, it's gambling with worse odds.",
    },
  ]

  const pillars = [
    {
      number: 1,
      title: "Data Quality",
      subtitle: "D = Data Collection & Processing",
      description:
        "Garbage in, garbage out. Your models are only as good as your data. Clean, comprehensive, and real-time data is the foundation of every profitable strategy.",
      icon: <Database className="w-8 h-8" />,
      color: "#50ff88",
      metrics: [
        { value: "10TB", label: "Daily Processed" },
        { value: "0.1ms", label: "Data Latency" },
      ],
      features: [
        "Tick-by-tick price feeds",
        "Order book depth analysis",
        "Alternative data sources",
        "Data cleaning & normalization",
      ],
    },
    {
      number: 2,
      title: "Mathematical Models",
      subtitle: "M = Algorithm Development",
      description:
        "The brain of your system. Statistical models, machine learning, and mathematical optimization turn raw data into actionable trading signals.",
      icon: <Brain className="w-8 h-8" />,
      color: "#60a5fa",
      metrics: [
        { value: "150+", label: "Active Models" },
        { value: "73%", label: "Win Rate" },
      ],
      features: [
        "Statistical arbitrage models",
        "Machine learning predictions",
        "Mean reversion algorithms",
        "Momentum indicators",
      ],
    },
    {
      number: 3,
      title: "Risk Management",
      subtitle: "R = Position Sizing & Limits",
      description:
        "Survival first, profits second. Professional risk management keeps you in the game long enough for your edge to materialize.",
      icon: <Shield className="w-8 h-8" />,
      color: "#a855f7",
      metrics: [
        { value: "2.8", label: "Sharpe Ratio" },
        { value: "12%", label: "Max Drawdown" },
      ],
      features: [
        "Kelly Criterion optimization",
        "Dynamic position sizing",
        "Correlation analysis",
        "Drawdown protection",
      ],
    },
    {
      number: 4,
      title: "Rigorous Backtesting",
      subtitle: "B = Historical Validation",
      description:
        "Trust, but verify. Extensive backtesting across different market conditions separates profitable strategies from curve-fitted disasters.",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "#ec4899",
      metrics: [
        { value: "10+", label: "Years Data" },
        { value: "99.9%", label: "Accuracy" },
      ],
      features: [
        "10+ years historical data",
        "Walk-forward analysis",
        "Monte Carlo simulations",
        "Out-of-sample testing",
      ],
    },
    {
      number: 5,
      title: "Flawless Execution",
      subtitle: "E = Infrastructure & Speed",
      description:
        "Theory meets reality. Low-latency infrastructure and smart order routing ensure your edge isn't lost to slippage and fees.",
      icon: <Zap className="w-8 h-8" />,
      color: "#fbbf24",
      metrics: [
        { value: "0.1ms", label: "Latency" },
        { value: "24/7", label: "Monitoring" },
      ],
      features: ["Microsecond latency", "Smart order routing", "Co-location servers", "24/7 monitoring"],
    },
  ]

  const bots = [
    {
      id: "Q",
      name: "Quantum Momentum Engine",
      type: "Trend Following",
      description:
        "Analyzes market momentum across multiple timeframes to identify high-probability trend continuations.",
      winRate: 73,
      avgReturn: "2.8x",
      timeframe: "24/7",
    },
    {
      id: "R",
      name: "Reversal Recognition Matrix",
      type: "Mean Reversion",
      description:
        "Detects potential market reversals by identifying key exhaustion points and divergences in price action.",
      winRate: 68,
      avgReturn: "1.9x",
      timeframe: "15m",
    },
    {
      id: "X",
      name: "Execution Precision Protocol",
      type: "Scalping",
      description:
        "Focuses on sniper-like entries and exits, minimizing slippage and maximizing risk-to-reward ratios.",
      winRate: 91,
      avgReturn: "1.3x",
      timeframe: "1m",
    },
    {
      id: "O",
      name: "Oracle Volatility Scanner",
      type: "Volatility Trading",
      description:
        "Scans for unusual volatility spikes and breakout opportunities, capitalizing on rapid market movements.",
      winRate: 65,
      avgReturn: "3.5x",
      timeframe: "4h",
    },
    {
      id: "Z",
      name: "Zenith Mean Reversion",
      type: "Statistical Arbitrage",
      description:
        "Identifies over-extended assets and trades the statistical probability of price returning to its historical mean.",
      winRate: 82,
      avgReturn: "1.5x",
      timeframe: "1d",
    },
  ]

  const testimonials = [
    {
      name: "James Kim",
      role: "Former Day Trader",
      avatar: "JK",
      content:
        "I spent 3 years losing money trying to day trade manually. NEXURAL's bots made me profitable in 2 months. The difference? No emotions, just math.",
      results: { return: "+287%", winRate: "73%" },
    },
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      avatar: "SC",
      content:
        "As a developer, I appreciate good algorithms. NEXURAL's bots are next level. Clean execution, smart risk management, consistent profits.",
      results: { profit: "$47K", bots: "5" },
    },
    {
      name: "Mike Rodriguez",
      role: "Hedge Fund Analyst",
      avatar: "MR",
      content:
        "I've seen million-dollar algos at work. NEXURAL gives retail traders institutional-grade tools. This is democratizing quant trading.",
      results: { sharpe: "2.4", drawdown: "12%" },
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <FloatingParticles />

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10" />

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm uppercase tracking-wider">
              The Science of Profitable Trading
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none"
          >
            <span className="block text-white">WHERE MATH</span>
            <span className="block bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent animate-pulse">
              MEETS MONEY
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            95% of traders fail because they lack a systematic approach. Master the 5 pillars of quantitative trading
            and join the profitable 5%.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-bold px-8 py-4 text-lg group">
              Discover The Formula
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg group bg-transparent"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Live Demo
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <div className="w-8 h-12 border-2 border-primary rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="w-1 h-3 bg-primary rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* The Trading Formula Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2 text-sm uppercase tracking-wider">
              The Mathematical Truth
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Profit = Function of <span className="text-primary">5 Critical Variables</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Every successful quantitative trading system follows this exact formula. Miss one variable, and your
              system fails. Master all five, and profits become inevitable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <FormulaDisplay />
          </motion.div>
        </div>
      </section>

      {/* The 5 Pillars Section */}
      <section className="py-20 px-4 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              The <span className="text-primary">5 Pillars</span> of Success
            </h2>
            <p className="text-xl text-gray-400">
              Each pillar is essential. Together, they create unstoppable trading systems.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <PillarCard key={pillar.number} pillar={pillar} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Visualization Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <InteractiveVisualization />
          </motion.div>
        </div>
      </section>

      {/* Success Formula Visualization */}

      {/* The Problem Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              95% of Traders <span className="text-red-500">Fail</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Traditional trading is broken. Emotions destroy profits. Manual analysis can't compete with algorithms.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {problems.map((problem, index) => (
              <ProblemCard key={index} {...problem} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Demo Section */}
      <section className="py-20 px-4 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="bg-black/60 border-2 border-primary/20 rounded-2xl overflow-hidden backdrop-blur-sm"
          >
            <div className="bg-black/40 p-6 border-b border-primary/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary">NEXURAL Trading Dashboard</h3>
              <div className="flex gap-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/40">🟢 Live</Badge>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 bg-transparent">
                  Export
                </Button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="bg-primary/5 border-primary/20 text-center p-6">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Total P&L</div>
                <div className="text-3xl font-bold text-primary font-mono">
                  $<AnimatedCounter end={47283} />
                </div>
                <div className="text-sm text-green-400 mt-2">↑ +23.4%</div>
              </Card>

              <Card className="bg-primary/5 border-primary/20 text-center p-6">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Win Rate</div>
                <div className="text-3xl font-bold text-primary font-mono">
                  <AnimatedCounter end={73} suffix="%" />
                </div>
                <div className="text-sm text-green-400 mt-2">↑ Target: 65%+</div>
              </Card>

              <Card className="bg-primary/5 border-primary/20 text-center p-6">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Active Bots</div>
                <div className="text-3xl font-bold text-primary font-mono">
                  <AnimatedCounter end={5} />
                </div>
                <div className="text-sm text-gray-400 mt-2">5 Available</div>
              </Card>

              <Card className="bg-primary/5 border-primary/20 text-center p-6">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Daily Volume</div>
                <div className="text-3xl font-bold text-primary font-mono">
                  $<AnimatedCounter end={328654} />
                </div>
                <div className="text-sm text-green-400 mt-2">↑ +18.7%</div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trading Bots Showcase */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Meet Your AI <span className="text-primary">Trading Team</span>
            </h2>
            <p className="text-xl text-gray-400">
              Each bot specializes in a unique strategy. Together, they adapt to any market condition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bots.map((bot, index) => (
              <BotCard key={bot.id} bot={bot} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Risk Calculator Section */}
      <section className="py-20 px-4 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Calculate Your <span className="text-primary">Potential</span>
            </h2>
            <p className="text-xl text-gray-400">
              Adjust the sliders to see your potential monthly return based on different risk levels and win rates.
            </p>
          </motion.div>

          <RiskCalculator />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Real People. <span className="text-primary">Real Results.</span>
            </h2>
            <p className="text-xl text-gray-400">
              Don't just take our word for it. See what our users are saying about NEXURAL.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-black/20 border border-primary/20 rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-3 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center text-xl font-bold font-mono text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">{testimonial.content}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <div>
                    {Object.entries(testimonial.results).map(([key, value]) => (
                      <div key={key} className="text-sm text-gray-400">
                        {key}: <span className="text-primary">{value}</span>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="border-primary text-primary bg-transparent">
                    Read More
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-black/40">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Ready to <span className="text-primary">Automate</span> Your Profits?
            </h2>
            <p className="text-xl text-gray-400">
              Join the profitable 5% and start building your quantitative trading system today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-bold px-8 py-4 text-lg group">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 px-4 text-center text-gray-500 border-t border-gray-800">
        © 2024 NEXURAL. All rights reserved.
      </footer>
    </div>
  )
}
