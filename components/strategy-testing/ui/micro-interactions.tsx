"use client"

import React, { useState, useEffect, useRef } from 'react'

// CSS-based pulse loader
export const PulseLoader = ({ size = 'md', color = '#00bbff' }: { size?: 'sm' | 'md' | 'lg', color?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} rounded-full animate-pulse`}
          style={{ 
            backgroundColor: color,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  )
}

// Enhanced button with ripple effect
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
  const [ripples, setRipples] = useState<Array<{ id: number, x: number, y: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const variants = {
    primary: 'bg-gradient-to-r from-[#00bbff] to-[#4a4aff] text-white hover:shadow-lg hover:shadow-[#00bbff]/25',
    secondary: 'bg-[#2a2a3e] text-white border border-[#3a3a52] hover:border-[#00bbff] hover:shadow-md',
    ghost: 'bg-transparent text-[#a0a0b8] hover:bg-[#2a2a3e] hover:text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-500/25'
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
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200 transform
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
      `}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s'
          }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <PulseLoader size="sm" color="currentColor" />}
        {children}
      </span>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full hover:translate-x-full transition-transform duration-700 ease-out" />
    </button>
  )
}

// Enhanced card with hover effects
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
    <div
      className={`
        relative bg-[#1a1a25] border border-[#2a2a3e] rounded-lg overflow-hidden transition-all duration-300
        ${hoverable ? 'cursor-pointer hover:scale-102 hover:border-[#00bbff] hover:shadow-lg' : ''}
        ${glowEffect && isHovered ? 'shadow-[0_0_20px_rgba(0,187,255,0.3)]' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border gradient */}
      {isHovered && hoverable && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#00bbff] via-[#4a4aff] to-[#00bbff] opacity-50 animate-spin-slow" 
             style={{
               background: 'conic-gradient(from 0deg, #00bbff, #4a4aff, #00bbff)',
               mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               maskComposite: 'xor',
               WebkitMaskComposite: 'xor',
               padding: '1px',
             }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 bg-[#1a1a25] rounded-lg h-full">
        {children}
      </div>
    </div>
  )
}

// Enhanced progress bar
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
        <div
          className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out ${animated ? 'animate-pulse' : ''}`}
          style={{ 
            backgroundColor: color,
            width: `${percentage}%`
          }}
        >
          {/* Animated shine effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      
      {showPercentage && (
        <span className="absolute right-0 -top-6 text-xs text-[#a0a0b8] transition-opacity duration-500">
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  )
}

// Floating action button
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
      <button
        className="w-14 h-14 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-90 animate-bounce-subtle"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="transition-transform duration-200 hover:rotate-15">
          {icon}
        </div>
      </button>

      {/* Tooltip */}
      {showTooltip && tooltip && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-[#0e111a] text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap transition-all duration-200 animate-fade-in">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0e111a]" />
        </div>
      )}
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          setIsVisible(false)
          setTimeout(onClose, 300) // Wait for exit animation
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
    <div
      className={`
        relative p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 transform
        ${typeStyles[type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg animate-bounce-gentle">{typeIcons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="text-current hover:opacity-70 transition-opacity hover:rotate-90 transform duration-200"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-current opacity-50 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Data stream visualization
export const DataStreamLoader = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-[#00bbff] to-[#4a4aff] rounded-full animate-wave"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
      <span className="text-sm text-[#a0a0b8] animate-pulse">
        Loading market data...
      </span>
    </div>
  )
}

// Skeleton loader for content
export const SkeletonLoader = ({ className = '', lines = 3 }: { className?: string, lines?: number }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[#2a2a3e] rounded mb-2 animate-shimmer"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

export default {
  PulseLoader,
  EnhancedButton,
  EnhancedCard,
  EnhancedProgressBar,
  FloatingActionButton,
  NotificationToast,
  DataStreamLoader,
  SkeletonLoader,
}
