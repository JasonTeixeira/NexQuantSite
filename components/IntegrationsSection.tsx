"use client"

import { motion } from "framer-motion"
import { Code, MessageSquare, TrendingUp, Zap } from "lucide-react"

export default function IntegrationsSection() {
  const integrations = [
    {
      name: "NinjaTrader 8",
      icon: TrendingUp,
      description: "Professional trading platform integration",
    },
    {
      name: "QuantTower",
      icon: Code,
      description: "Advanced analytics and execution",
    },
    {
      name: "TradingView",
      icon: TrendingUp,
      description: "Charting and technical analysis",
    },
    {
      name: "Discord",
      icon: MessageSquare,
      description: "Real-time community and alerts",
    },
    {
      name: "API Access",
      icon: Zap,
      description: "Custom integrations and automation",
    },
  ]

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Platform <span className="text-[#00FF41]">Integrations</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Seamlessly connect with your favorite trading platforms and tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              className="bg-black/50 border border-gray-700 rounded-lg p-6 text-center hover:border-[#00FF41] transition-all duration-300 group backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div className="mb-4" whileHover={{ rotate: 5 }}>
                <div className="w-16 h-16 bg-[#00FF41]/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-[#00FF41]/30 transition-colors">
                  <integration.icon className="w-8 h-8 text-[#00FF41]" />
                </div>
              </motion.div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00FF41] transition-colors">
                {integration.name}
              </h3>

              <p className="text-sm text-gray-400">{integration.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400">More integrations coming soon. Request your favorite platform in our Discord.</p>
        </motion.div>
      </div>
    </section>
  )
}
