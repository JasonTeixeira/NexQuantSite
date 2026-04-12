"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'

// Advanced loading animations
export const PulseLoader = ({ size = 'md', color = '#00bbff' }: { size?: 'sm' | 'md' | 'lg', color?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Sophisticated data loading animation
export const DataStreamLoader = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-[#00bbff] to-[#4a4aff] rounded-full"
            animate={{
              height: [4, 20, 4],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <motion.span
        className="text-sm text-[#a0a0b8]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading market data...
      </motion.span>
    </div>
  )
}

// Advanced button with micro-interactions
export const EnhancedButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number, x: number, y: number }>>([])

  const variants = {
    primary: 'bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white',
    secondary: 'bg-[#2a2a3e] text-white border border-[#3a3a52]',
    ghost: 'bg-transparent text-[#a0a0b8] hover:bg-[#2a2a3e]',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y
    }

    setRipples(prev => [...prev, newRipple])
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}
        ${isPressed ? 'scale-95' : ''}
      `}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Ripple effect */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <PulseLoader size="sm" color="currentColor" />}
        {children}
      </span>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.button>
  )
}

// Advanced card with hover effects
export const EnhancedCard = ({ 
  children, 
  className = '',
  hoverable = true,
  glowEffect = false 
}: {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  glowEffect?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`
        relative bg-[#1a1a25] border border-[#2a2a3e] rounded-lg overflow-hidden
        ${hoverable ? 'cursor-pointer' : ''}
        ${glowEffect && isHovered ? 'shadow-[0_0_20px_rgba(0,187,255,0.3)]' : ''}
        ${className}
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={hoverable ? { 
        scale: 1.02, 
        borderColor: '#00bbff',
        transition: { duration: 0.2 }
      } : {}}
      layout
    >
      {/* Animated border gradient */}
      {isHovered && hoverable && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#00bbff] via-[#4a4aff] to-[#00bbff] opacity-50"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            background: 'conic-gradient(from 0deg, #00bbff, #4a4aff, #00bbff)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 bg-[#1a1a25] rounded-lg h-full">
        {children}
      </div>
    </motion.div>
  )
}

// Advanced progress bar with animations
export const EnhancedProgressBar = ({ 
  value, 
  max = 100, 
  color = '#00bbff',
  showPercentage = true,
  animated = true,
  className = ''
}: {
  value: number
  max?: number
  color?: string
  showPercentage?: boolean
  animated?: boolean
  className?: string
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-[#2a2a3e] rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </div>
      
      {showPercentage && (
        <motion.span
          className="absolute right-0 -top-6 text-xs text-[#a0a0b8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percentage.toFixed(1)}%
        </motion.span>
      )}
    </div>
  )
}

// Floating action button with advanced animations
export const FloatingActionButton = ({ 
  icon, 
  onClick, 
  tooltip,
  position = 'bottom-right' 
}: {
  icon: React.ReactNode
  onClick: () => void
  tooltip?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <div className={`fixed ${positions[position]} z-50`}>
      <motion.button
        className="w-14 h-14 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={onClick}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          whileHover={{ rotate: 15 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-[#0e111a] text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0e111a]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Advanced notification toast
export const NotificationToast = ({ 
  message, 
  type = 'info', 
  onClose,
  duration = 5000 
}: {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          onClose()
          return 0
        }
        return prev - (100 / (duration / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration, onClose])

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  }

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <motion.div
      className={`
        relative p-4 rounded-lg border backdrop-blur-sm
        ${typeStyles[type]}
      `}
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{typeIcons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
        <motion.div
          className="h-full bg-current opacity-50"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  )
}

export default {
  PulseLoader,
  DataStreamLoader,
  EnhancedButton,
  EnhancedCard,
  EnhancedProgressBar,
  FloatingActionButton,
  NotificationToast,
}
