"use client"

import { motion } from "framer-motion"
import { Cpu, Zap, Crosshair, GitBranch, Atom } from "lucide-react"

export default function TradingBotsSection() {
  const bots = [
    {
      name: "Q",
      icon: Cpu,
      title: "Quantum Momentum Engine",
      description:
        "Analyzes market momentum across multiple timeframes to identify high-probability trend continuations.",
    },
    {
      name: "R",
      icon: GitBranch,
      title: "Reversal Recognition Matrix",
      description:
        "Detects potential market reversals by identifying key exhaustion points and divergences in price action.",
    },
    {
      name: "X",
      icon: Crosshair,
      title: "Execution Precision Protocol",
      description:
        "Focuses on sniper-like entries and exits, minimizing slippage and maximizing risk-to-reward ratios.",
    },
    {
      name: "O",
      icon: Zap,
      title: "Oracle Volatility Scanner",
      description:
        "Scans for unusual volatility spikes and breakout opportunities, capitalizing on rapid market movements.",
    },
    {
      name: "Z",
      icon: Atom,
      title: "Zenith Mean Reversion",
      description:
        "Identifies over-extended assets and trades the statistical probability of price returning to its historical mean.",
    },
  ]

  return (
    <section id="bots" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono">
            NEXURAL AI <span className="text-primary">TRADING BOTS</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Our proprietary suite of AI-powered bots, engineered for precision and performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bots.map((bot, index) => (
            <motion.div
              key={bot.name}
              className="cyberpunk-card border border-gray-800 p-8 hover:border-primary hover:shadow-primary transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gray-900 cyberpunk-button flex items-center justify-center">
                  <bot.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-7xl font-mono font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                  {bot.name}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-mono">{bot.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{bot.description}</p>
            </motion.div>
          ))}
          <motion.div
            className="cyberpunk-card border border-dashed border-gray-700 p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors duration-300 group md:col-span-2 lg:col-span-1"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: bots.length * 0.1, duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gray-900 cyberpunk-button flex items-center justify-center mb-6">
              <Atom className="w-8 h-8 text-gray-600 group-hover:text-primary transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-mono">More Bots</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Our team is constantly developing new strategies. More bots coming soon.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
