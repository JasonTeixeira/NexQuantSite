"use client"

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { designSystem } from '@/lib/design-system'
import { cn } from '@/lib/utils'

// 🎯 INSTITUTIONAL BUTTON - 99+ Level
interface InstitutionalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  glow?: boolean
}

export const InstitutionalButton = forwardRef<HTMLButtonElement, InstitutionalButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    glow = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ id: number, x: number, y: number }>>([])
    const [isPressed, setIsPressed] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const variants = {
      primary: `
        bg-gradient-to-r from-[#00bbff] to-[#4a4aff] 
        text-white font-medium
        shadow-lg shadow-blue-500/25
        hover:shadow-xl hover:shadow-blue-500/40
        hover:scale-[1.02] active:scale-[0.98]
        border-0
        ${glow ? 'shadow-[0_0_20px_rgba(0,187,255,0.4)]' : ''}
      `,
      secondary: `
        bg-[#2a2a3e] text-white font-medium
        border border-[#3a3a52]
        hover:border-[#00bbff] hover:bg-[#3a3a52]
        hover:scale-[1.02] active:scale-[0.98]
        shadow-md
      `,
      ghost: `
        bg-transparent text-[#a0a0b8] font-medium
        border-0
        hover:bg-[#2a2a3e] hover:text-white
        hover:scale-[1.02] active:scale-[0.98]
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-700
        text-white font-medium
        shadow-lg shadow-red-500/25
        hover:shadow-xl hover:shadow-red-500/40
        hover:scale-[1.02] active:scale-[0.98]
        border-0
      `,
      success: `
        bg-gradient-to-r from-green-600 to-green-700
        text-white font-medium
        shadow-lg shadow-green-500/25
        hover:shadow-xl hover:shadow-green-500/40
        hover:scale-[1.02] active:scale-[0.98]
        border-0
      `
    }

    const sizes = {
      xs: 'px-2 py-1 text-xs rounded-md min-h-[24px]',
      sm: 'px-3 py-1.5 text-sm rounded-md min-h-[32px]',
      md: 'px-4 py-2 text-sm rounded-lg min-h-[40px]',
      lg: 'px-6 py-3 text-base rounded-lg min-h-[48px]',
      xl: 'px-8 py-4 text-lg rounded-xl min-h-[56px]'
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

      props.onClick?.(e)
    }

    return (
      <button
        ref={ref || buttonRef}
        className={cn(
          // Base styles
          'relative overflow-hidden font-mono transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          
          // Variant styles
          variants[variant],
          
          // Size styles
          sizes[size],
          
          // Full width
          fullWidth && 'w-full',
          
          // Pressed state
          isPressed && 'transform scale-[0.98]',
          
          className
        )}
        disabled={disabled || loading}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        {...props}
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

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full hover:translate-x-full transition-transform duration-700 ease-out" />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {icon && iconPosition === 'left' && !loading && icon}
          {children}
          {icon && iconPosition === 'right' && !loading && icon}
        </span>
      </button>
    )
  }
)

InstitutionalButton.displayName = 'InstitutionalButton'

// 🎯 INSTITUTIONAL CARD - 99+ Level
interface InstitutionalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'glow'
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  glowColor?: 'blue' | 'purple' | 'green' | 'red'
}

export const InstitutionalCard = forwardRef<HTMLDivElement, InstitutionalCardProps>(
  ({ 
    className, 
    variant = 'default', 
    hoverable = false,
    padding = 'md',
    glowColor = 'blue',
    children, 
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    const variants = {
      default: `
        bg-[#15151f] border border-[#2a2a3e]
        shadow-lg
      `,
      elevated: `
        bg-[#1a1a25] border border-[#3a3a52]
        shadow-xl shadow-black/20
      `,
      glass: `
        bg-[#1a1a25]/80 border border-[#2a2a3e]/50
        backdrop-blur-xl
        shadow-2xl shadow-black/30
      `,
      glow: `
        bg-[#15151f] border border-[#2a2a3e]
        shadow-lg
        ${isHovered ? `shadow-[0_0_30px_rgba(0,187,255,0.3)]` : ''}
      `
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl transition-all duration-300 ease-out',
          
          // Variant styles
          variants[variant],
          
          // Padding
          paddings[padding],
          
          // Hoverable styles
          hoverable && [
            'cursor-pointer',
            'hover:scale-[1.02]',
            'hover:border-[#00bbff]',
            'hover:shadow-xl',
            'active:scale-[0.99]'
          ],
          
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Animated border gradient for glow variant */}
        {variant === 'glow' && isHovered && (
          <div 
            className="absolute inset-0 rounded-xl opacity-50 animate-spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, #00bbff, #4a4aff, #8b5cf6, #00bbff)',
              padding: '1px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

InstitutionalCard.displayName = 'InstitutionalCard'

// 🎯 INSTITUTIONAL PROGRESS BAR - 99+ Level
interface InstitutionalProgressProps {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  animated?: boolean
  gradient?: boolean
  className?: string
}

export const InstitutionalProgress: React.FC<InstitutionalProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = true,
  animated = true,
  gradient = true,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  const variants = {
    default: gradient 
      ? 'bg-gradient-to-r from-[#00bbff] to-[#4a4aff]'
      : 'bg-[#00bbff]',
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-green-600'
      : 'bg-green-500',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
      : 'bg-yellow-500',
    danger: gradient
      ? 'bg-gradient-to-r from-red-500 to-red-600'
      : 'bg-red-500'
  }

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Background track */}
      <div className={cn(
        'w-full bg-[#2a2a3e] rounded-full overflow-hidden',
        sizes[size]
      )}>
        {/* Progress bar */}
        <div
          className={cn(
            'h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out',
            variants[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      
      {/* Value display */}
      {showValue && (
        <div className="absolute right-0 -top-6 text-xs text-[#a0a0b8] font-mono">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  )
}

// 🎯 INSTITUTIONAL BADGE - 99+ Level
interface InstitutionalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  glow?: boolean
}

export const InstitutionalBadge = forwardRef<HTMLSpanElement, InstitutionalBadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    pulse = false,
    glow = false,
    children, 
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-[#00bbff]/20 text-[#00bbff] border-[#00bbff]/30',
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      danger: 'bg-red-500/20 text-red-400 border-red-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    }

    const glowColors = {
      default: 'shadow-[0_0_10px_rgba(0,187,255,0.5)]',
      success: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]',
      warning: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      danger: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]',
      info: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
      purple: 'shadow-[0_0_10px_rgba(139,92,246,0.5)]'
    }

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-mono font-medium border rounded-full',
          'transition-all duration-200',
          
          // Variant styles
          variants[variant],
          
          // Size styles
          sizes[size],
          
          // Pulse animation
          pulse && 'animate-pulse',
          
          // Glow effect
          glow && glowColors[variant],
          
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

InstitutionalBadge.displayName = 'InstitutionalBadge'

// 🎯 INSTITUTIONAL INPUT - 99+ Level
interface InstitutionalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  errorText?: string
}

export const InstitutionalInput = forwardRef<HTMLInputElement, InstitutionalInputProps>(
  ({ 
    className, 
    variant = 'default',
    inputSize = 'md',
    error = false,
    success = false,
    leftIcon,
    rightIcon,
    label,
    helperText,
    errorText,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    const variants = {
      default: `
        bg-[#15151f] border border-[#2a2a3e]
        focus:border-[#00bbff] focus:bg-[#1a1a25]
      `,
      filled: `
        bg-[#2a2a3e] border border-transparent
        focus:border-[#00bbff] focus:bg-[#15151f]
      `,
      ghost: `
        bg-transparent border border-transparent border-b-[#2a2a3e]
        focus:border-b-[#00bbff] rounded-none
      `
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    }

    const inputClasses = cn(
      // Base styles
      'w-full font-mono text-white placeholder-[#6a6a78] transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-[#00bbff]/20',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Variant styles
      variants[variant],
      
      // Size styles
      sizes[inputSize],
      
      // Border radius (except ghost)
      variant !== 'ghost' && 'rounded-lg',
      
      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      
      // Success state
      success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      
      // Icon padding
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      
      className
    )

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-mono">
            {label}
          </label>
        )}
        
        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a6a78]">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            className={inputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6a6a78]">
              {rightIcon}
            </div>
          )}
          
          {/* Focus ring */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg border-2 border-[#00bbff] pointer-events-none animate-pulse" />
          )}
        </div>
        
        {/* Helper/Error text */}
        {(helperText || errorText) && (
          <p className={cn(
            'mt-2 text-xs font-mono',
            error ? 'text-red-400' : 'text-[#6a6a78]'
          )}>
            {errorText || helperText}
          </p>
        )}
      </div>
    )
  }
)

InstitutionalInput.displayName = 'InstitutionalInput'

// Export all components
export {
  InstitutionalButton as Button,
  InstitutionalCard as Card,
  InstitutionalProgress as Progress,
  InstitutionalBadge as Badge,
  InstitutionalInput as Input,
}
