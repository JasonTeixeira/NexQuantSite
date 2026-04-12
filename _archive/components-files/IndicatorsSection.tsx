"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, TrendingUp } from "lucide-react"
import { indicators, type Indicator } from "@/lib/indicator-data"
import IndicatorModal from "./IndicatorModal"

export default function IndicatorsSection() {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)

  return (
    <>
      <section id="indicators" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono">
              Proprietary <span className="text-primary">Indicators</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              A selection of our high-precision indicators designed to give you a market edge. Click to learn more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {indicators.map((indicator, index) => (
              <motion.div
                key={indicator.id}
                className="aspect-w-16 aspect-h-9 cyberpunk-card border border-gray-800 bg-gray-900/50 flex items-center justify-center p-4 hover:border-primary transition-colors duration-300 cursor-pointer group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
                onClick={() => setSelectedIndicator(indicator)}
              >
                <div className="text-center">
                  <p className="font-mono text-lg text-gray-300 group-hover:text-primary transition-colors">
                    {indicator.name}
                  </p>
                  <p className="font-mono text-xs text-gray-500 mt-1">Click to view details</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cool TradingView Button */}
          <motion.div
            className="flex justify-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.a
              href="https://www.tradingview.com/scripts/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 rounded-lg font-mono font-semibold text-white text-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Pulsing border effect */}
              <div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/30 group-hover:animate-pulse" />

              {/* Content */}
              <TrendingUp className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                Explore More Indicators
              </span>
              <ExternalLink className="w-5 h-5 text-primary/70 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {selectedIndicator && <IndicatorModal indicator={selectedIndicator} onClose={() => setSelectedIndicator(null)} />}
    </>
  )
}
