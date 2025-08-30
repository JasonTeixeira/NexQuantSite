"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, TrendingUp, BarChart3, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdvancedLoadingProps {
  variant?: 'spinner' | 'pulse' | 'trading' | 'market' | 'flow' | 'minimal'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

const loadingVariants = {
  spinner: {
    rotate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear" as const
      }
    }
  },
  pulse: {
    scale: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  },
  glow: {
    glow: {
      boxShadow: [
        "0 0 5px rgba(0, 115, 230, 0.3)",
        "0 0 20px rgba(0, 115, 230, 0.6)",
        "0 0 5px rgba(0, 115, 230, 0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8", 
  lg: "w-12 h-12",
  xl: "w-16 h-16"
}

export function AdvancedLoading({ 
  variant = 'trading', 
  size = 'md', 
  text, 
  className 
}: AdvancedLoadingProps) {
  
  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={cn("text-primary", sizeClasses[size])}
            variants={loadingVariants.spinner}
            animate="rotate"
          >
            <Loader2 className="w-full h-full" />
          </motion.div>
        )
        
      case 'pulse':
        return (
          <motion.div
            className={cn("bg-primary/20 rounded-full", sizeClasses[size])}
            variants={loadingVariants.pulse}
            animate="scale"
          />
        )
        
      case 'trading':
        return (
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              variants={loadingVariants.glow}
              animate="glow"
            >
              <TrendingUp className={cn("text-green-400", sizeClasses[size])} />
              <motion.div
                className="absolute inset-0 bg-green-400/20 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-8 bg-primary/60 rounded-sm"
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'market':
        return (
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-black/40 rounded-xl border border-primary/20"
              animate={{ 
                borderColor: ["rgba(0, 115, 230, 0.2)", "rgba(0, 115, 230, 0.6)", "rgba(0, 115, 230, 0.2)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className={cn("text-primary", sizeClasses[size])} />
            </motion.div>
            <div className="space-y-2">
              <motion.div
                className="h-2 bg-primary/30 rounded-full w-24"
                animate={{ scaleX: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-2 bg-green-400/30 rounded-full w-16"
                animate={{ scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="h-2 bg-red-400/30 rounded-full w-20"
                animate={{ scaleX: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </div>
          </div>
        )
        
      case 'flow':
        return (
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Activity className={cn("text-primary relative z-10", sizeClasses[size])} />
          </div>
        )
        
      case 'minimal':
        return (
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )
        
      default:
        return (
          <motion.div
            className={cn("text-primary", sizeClasses[size])}
            variants={loadingVariants.spinner}
            animate="rotate"
          >
            <Loader2 className="w-full h-full" />
          </motion.div>
        )
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {renderVariant()}
      
      <AnimatePresence>
        {text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-gray-400 text-center"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Professional shimmer effect */}
      {variant === 'trading' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: [-300, 300] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  )
}

// Professional loading states for specific trading contexts
export function TradingDataLoading() {
  return (
    <motion.div
      className="p-6 bg-black/40 backdrop-blur-sm border border-primary/20 rounded-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="p-3 bg-primary/10 rounded-xl"
          animate={{ 
            scale: [1, 1.05, 1],
            backgroundColor: ["rgba(0, 115, 230, 0.1)", "rgba(0, 115, 230, 0.2)", "rgba(0, 115, 230, 0.1)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-6 h-6 text-primary" />
        </motion.div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <motion.div
              className="h-4 bg-primary/20 rounded w-32"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-3 bg-green-400/20 rounded w-16"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          
          <motion.div
            className="h-3 bg-gray-600/20 rounded w-24"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
        </div>
      </div>
      
      <motion.div
        className="mt-4 text-xs text-gray-500 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading real-time market data...
      </motion.div>
    </motion.div>
  )
}

export function ChartLoading() {
  return (
    <motion.div
      className="h-64 bg-black/40 backdrop-blur-sm border border-primary/20 rounded-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="h-full relative overflow-hidden">
        {/* Animated chart lines */}
        <svg className="w-full h-full">
          <motion.path
            d="M0,200 Q50,150 100,120 T200,100 T300,80"
            fill="none"
            stroke="rgba(0, 115, 230, 0.6)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M0,180 Q50,160 100,140 T200,120 T300,100"
            fill="none"
            stroke="rgba(0, 210, 170, 0.4)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <AdvancedLoading variant="trading" size="lg" text="Loading chart data..." />
        </div>
      </div>
    </motion.div>
  )
}

export default AdvancedLoading
