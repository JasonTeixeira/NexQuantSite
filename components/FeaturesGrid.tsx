"use client"

import { motion } from "framer-motion"
import { BarChart3, Bot, Lock, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function FeaturesGrid() {
  const features = [
    {
      icon: BarChart3,
      title: "Buy & sell without affecting market price or slippage",
      description: "Execute large trades without moving the market against you",
      color: "#00FF41",
    },
    {
      icon: Bot,
      title: "Add tokens without checking charts 24/7",
      description: "Automated trading signals and smart order execution",
      color: "#00FF41",
    },
    {
      icon: Lock,
      title: "Trade private tokens before public liquidity yet",
      description: "Access exclusive pre-market trading opportunities",
      color: "#00FF41",
    },
    {
      icon: Shield,
      title: "Never get front-run by bots/snipers",
      description: "Protected trading environment with MEV resistance",
      color: "#00FF41",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            WHY USE <span className="text-[#00FF41]">NEXURAL</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Trading on a traditional DEX/CEX comes with issues like price impact and slippage, which means you rarely
            get the full value of the deal and sometimes incur trading pair fees too regularly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="h-full"
            >
              <Card className="bg-black/50 border-[#00FF41]/30 backdrop-blur-md hover:border-[#00FF41] transition-all duration-300 h-full group cursor-pointer shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-[#00FF41]/20">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#00FF41]/20 rounded-lg flex items-center justify-center group-hover:bg-[#00FF41]/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <feature.icon className="w-8 h-8 text-[#00FF41]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-[#00FF41] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
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
          <p className="text-gray-400 max-w-4xl mx-auto">
            <span className="text-[#00FF41] font-semibold">NEXURAL</span> solves these issues. Buy and sell trading with
            others with zero risk of price impact, slippage or front-running/sniping attacks.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
