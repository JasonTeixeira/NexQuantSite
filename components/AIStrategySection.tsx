"use client"

import { motion } from "framer-motion"
import { TrendingUp, Shield, Zap } from 'lucide-react'

export default function AIStrategySection() {
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
    <section className="py-20 bg-gradient-to-b from-black via-gray-900/20 to-black">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Our <span className="bg-gradient-to-r from-primary via-green-400 to-blue-400 bg-clip-text text-transparent">AI Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced machine learning technology that adapts, learns, and delivers consistent results
            </p>
          </motion.div>

          {/* Strategy Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center hover:border-primary/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">AI-Powered Strategies</h3>
              <p className="text-gray-400 leading-relaxed">
                Advanced machine learning algorithms continuously optimize your trading performance by analyzing millions of data points in real-time.
              </p>
            </motion.div>
            
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: "2s" }}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center hover:border-primary/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Risk Management</h3>
              <p className="text-gray-400 leading-relaxed">
                Built-in risk controls and portfolio protection mechanisms ensure you never risk more than you can afford to lose.
              </p>
            </motion.div>
            
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: "4s" }}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center hover:border-primary/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Ultra-low latency execution with institutional-grade infrastructure ensures you never miss an opportunity.
              </p>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants} className="mt-16">
            <motion.button
              className="bg-gradient-to-r from-primary to-green-500 hover:from-green-500 hover:to-primary text-black font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Experience the AI Advantage
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
