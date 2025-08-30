"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ArrowRight, TrendingUp, Shield, Zap, Bot, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import VideoModal from "./VideoModal"
import HeroBackground from "./HeroBackground"
import LiveSignalsBanner from "./LiveSignalsBanner"

// Hero Bot Performance Card Component
interface HeroBotCardProps {
  name: string
  performance: number
  trades: number
  winRate: number
}

const HeroBotCard: React.FC<HeroBotCardProps> = ({ name, performance, trades, winRate }) => {
  const isPositive = performance >= 0
  
  return (
    <motion.div
      className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-xl p-4 text-center group hover:border-green-400/40 transition-all duration-300 hover:bg-gray-800/60"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-center mb-3">
        <Bot className="h-5 w-5 text-green-400 mr-2" />
        <span className="text-white font-medium text-sm truncate">{name}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-center">
          <Badge 
            variant="outline" 
            className={`text-xs font-bold px-2 py-1 ${
              isPositive 
                ? 'text-green-400 border-green-400/40 bg-green-400/10' 
                : 'text-red-400 border-red-400/40 bg-red-400/10'
            }`}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {performance.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="text-xs text-gray-400 space-y-1">
          <div>{trades} trades</div>
          <div>{winRate}% win rate</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  }

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden pt-24">
      {/* Background */}
      <HeroBackground />
      
      {/* Content */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Badge 
                variant="outline" 
                className="px-6 py-2 text-sm font-medium bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
              >
                🚀 Advanced AI Trading Platform
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-white">QUANT TRADING</span>
                <span className="block bg-gradient-to-r from-primary via-green-400 to-blue-400 bg-clip-text text-transparent">
                  FOR EVERYONE
                </span>
              </h1>
              <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed">
                Democratizing algorithmic trading with AI-powered bots, advanced analytics, 
                and institutional-grade tools accessible to retail traders worldwide.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-4 text-lg group"
              >
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg group"
                onClick={() => setIsVideoOpen(true)}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Integrated Live Bot Performance */}
            <motion.div variants={itemVariants} className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Bot className="h-6 w-6 text-green-400" />
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Live Bot Performance
                  </span>
                </h3>
                <p className="text-gray-400 text-sm">Real-time 24h results • Updated every 15 seconds</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                <HeroBotCard name="AI Momentum Pro" performance={12.4} trades={23} winRate={78} />
                <HeroBotCard name="Neural Scalper" performance={8.7} trades={156} winRate={84} />
                <HeroBotCard name="Quant Explorer" performance={15.2} trades={12} winRate={91} />
                <HeroBotCard name="Algo Arbitrage" performance={5.1} trades={88} winRate={72} />
                <HeroBotCard name="Trend Follower" performance={10.9} trades={45} winRate={81} />
              </div>
            </motion.div>


          </motion.div>
        </div>
      </div>

      {/* Live Signals Banner - Right in the hero for maximum impact */}
      <div className="absolute bottom-0 left-0 right-0">
        <LiveSignalsBanner />
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoId="demo-video" />
    </section>
  )
}
