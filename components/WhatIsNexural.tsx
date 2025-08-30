"use client"

import { motion } from "framer-motion"
import { ArrowRight, DollarSign, TrendingUp, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function WhatIsNexural() {
  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900/50 to-black relative overflow-hidden">
      {/* Cyberpunk background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF41]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00FF41]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="what-circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 L10,10 L10,0 M10,20 L10,10 L20,10" stroke="#00FF41" strokeWidth="0.3" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#what-circuit)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block">
            {/* Glitch effect background */}
            <h2 className="absolute inset-0 text-4xl md:text-6xl font-bold text-[#00FF41]/20 blur-sm font-mono">
              WHAT IS NEXURAL?
            </h2>
            <h2 className="relative text-4xl md:text-6xl font-bold text-white mb-4 font-mono tracking-wider">
              WHAT IS <span className="text-[#00FF41] drop-shadow-[0_0_20px_#00FF41]">NEXURAL</span>?
            </h2>
          </div>

          {/* Cyberpunk accent line */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#00FF41] to-transparent mx-auto mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Card
            className="cyberpunk-main-card bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 border-2 border-[#00FF41] backdrop-blur-xl overflow-hidden relative shadow-[0_0_50px_rgba(0,255,65,0.2)]"
            style={{
              clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))",
            }}
          >
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF41]/20 via-transparent to-[#00FF41]/20 animate-pulse" />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M0,30 L30,30 L30,0" stroke="#00FF41" strokeWidth="3" fill="none" />
                <circle cx="30" cy="30" r="4" fill="#00FF41" className="animate-pulse" />
              </svg>
            </div>

            <div className="absolute bottom-0 right-0 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M100,70 L70,70 L70,100" stroke="#00FF41" strokeWidth="3" fill="none" />
                <circle cx="70" cy="70" r="4" fill="#00FF41" className="animate-pulse" />
              </svg>
            </div>

            <CardContent className="p-8 md:p-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Enhanced Stats Display */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between text-sm text-gray-400 border-b border-[#00FF41]/30 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" />
                      <span className="font-mono tracking-wider">01 PERSON</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse delay-500" />
                      <span className="font-mono tracking-wider">02 PERSON</span>
                    </div>
                  </div>

                  <motion.div
                    className="cyberpunk-trading-card bg-black/70 rounded-none p-8 border border-[#00FF41]/50 relative overflow-hidden group hover:border-[#00FF41] transition-all duration-500"
                    whileHover={{ scale: 1.02 }}
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                    }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00FF41]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-6">
                          <div className="text-sm text-gray-400 font-mono">NEXURAL:</div>
                          <div className="text-[#00FF41] font-mono text-xl font-bold drop-shadow-[0_0_10px_#00FF41]">
                            $0.004
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-sm text-gray-400 font-mono">VOLUME:</div>
                          <div className="text-white font-mono text-xl font-bold">$22.32M</div>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full bg-gradient-to-r from-[#00FF41] to-green-400 text-black hover:from-green-400 hover:to-[#00FF41] font-bold py-4 relative overflow-hidden group border border-[#00FF41]"
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                          }}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <Shield className="w-5 h-5 mr-2" />
                            ACCEPT TRADE
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-[#00FF41] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Enhanced Animated Counters */}
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div
                      className="text-center p-6 bg-black/50 border border-[#00FF41]/30 relative group hover:border-[#00FF41] transition-all duration-300"
                      initial={{ scale: 0, rotate: -10 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                      }}
                    >
                      <div className="absolute inset-0 bg-[#00FF41]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="text-3xl font-bold text-[#00FF41] font-mono drop-shadow-[0_0_10px_#00FF41]">
                          $2.4M
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Daily Volume</div>
                        <Zap className="w-4 h-4 text-[#00FF41] mx-auto mt-2 animate-pulse" />
                      </div>
                    </motion.div>

                    <motion.div
                      className="text-center p-6 bg-black/50 border border-[#00FF41]/30 relative group hover:border-[#00FF41] transition-all duration-300"
                      initial={{ scale: 0, rotate: 10 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                      }}
                    >
                      <div className="absolute inset-0 bg-[#00FF41]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="text-3xl font-bold text-[#00FF41] font-mono drop-shadow-[0_0_10px_#00FF41]">
                          847
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Active Traders</div>
                        <TrendingUp className="w-4 h-4 text-[#00FF41] mx-auto mt-2 animate-pulse" />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Right Side - Enhanced Description */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">
                      <span className="text-[#00FF41] font-bold text-xl drop-shadow-[0_0_10px_#00FF41]">
                        Nexural Trading
                      </span>{" "}
                      is enabling over-the-counter (OTC) trading for everyone. Trade futures directly with others
                      without relying on a liquidity pool.
                    </p>

                    <div className="w-16 h-px bg-gradient-to-r from-[#00FF41] to-transparent mb-6" />

                    <p className="text-gray-400 leading-relaxed">
                      Our smart contracts act as a middle-man. This allows anyone to trade futures completely risk-free,
                      without worrying about counterparty risk or market manipulation.
                    </p>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    {[
                      { icon: TrendingUp, text: "Zero Slippage" },
                      { icon: DollarSign, text: "Low Fees" },
                      { icon: Shield, text: "Secure Trading" },
                      { icon: Zap, text: "Instant Execution" },
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.text}
                        className="flex items-center space-x-3 p-3 bg-black/30 border border-[#00FF41]/20 hover:border-[#00FF41]/50 transition-all duration-300 group"
                        whileHover={{ scale: 1.05, x: 5 }}
                        style={{
                          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
                        }}
                      >
                        <feature.icon className="w-5 h-5 text-[#00FF41] group-hover:drop-shadow-[0_0_10px_#00FF41] transition-all duration-300" />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
