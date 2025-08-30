"use client"

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"

interface MobileResponsiveWrapperProps {
  children: React.ReactNode
  className?: string
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
}

interface UseIsMobileReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

// Custom hook to detect device type
export function useIsMobile(): UseIsMobileReturn {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    screenSize
  }
}

export default function MobileResponsiveWrapper({ 
  children, 
  className,
  enablePullToRefresh = false,
  onRefresh
}: MobileResponsiveWrapperProps) {
  const { isMobile, isTablet } = useIsMobile()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  // Pull-to-refresh functionality
  useEffect(() => {
    if (!enablePullToRefresh || !onRefresh || !isMobile) return

    let touchStartY = 0
    let touchCurrentY = 0
    let pullThreshold = 100

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      setStartY(touchStartY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchCurrentY = e.touches[0].clientY
      const pullDistance = touchCurrentY - touchStartY

      // Only allow pull if we're at the top of the page
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      
      if (scrollTop === 0 && pullDistance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(pullDistance, pullThreshold * 1.5))
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance > pullThreshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enablePullToRefresh, onRefresh, isMobile, pullDistance, isRefreshing])

  const wrapperClasses = cn(
    // Base classes
    "w-full min-h-screen",
    
    // Mobile-specific classes
    isMobile && [
      "mobile-container",
      "mobile-scroll-container",
      "mobile-safe-top mobile-safe-bottom",
    ],

    // Tablet-specific classes
    isTablet && [
      "px-6 py-4"
    ],

    // Desktop classes (default)
    !isMobile && !isTablet && [
      "container mx-auto px-4 py-6"
    ],

    className
  )

  return (
    <div className={wrapperClasses}>
      {/* Pull-to-refresh indicator */}
      {enablePullToRefresh && isMobile && (
        <div 
          className={cn(
            "fixed top-0 left-0 right-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 transition-all duration-300 z-50",
            pullDistance > 0 ? "translate-y-0" : "-translate-y-full"
          )}
          style={{
            height: Math.min(pullDistance, 100),
            opacity: pullDistance / 100
          }}
        >
          <div className="flex items-center gap-2 text-white">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </>
            ) : pullDistance > 80 ? (
              <span className="text-sm">Release to refresh</span>
            ) : pullDistance > 20 ? (
              <span className="text-sm">Pull to refresh</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Main content */}
      <div 
        className={cn(
          "transition-transform duration-300",
          pullDistance > 0 && `translate-y-${Math.min(pullDistance / 4, 25)}`
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Mobile-optimized components

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  noBorder?: boolean
}

export function MobileCard({ children, className, noBorder = false }: MobileCardProps) {
  const { isMobile } = useIsMobile()

  return (
    <div className={cn(
      "bg-gray-800/50 border-gray-700",
      isMobile && !noBorder ? "mobile-card" : "rounded-lg border",
      className
    )}>
      <div className={cn(isMobile ? "mobile-card-content" : "p-6")}>
        {children}
      </div>
    </div>
  )
}

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  children: React.ReactNode
}

export function MobileButton({ 
  variant = 'primary', 
  size = 'default', 
  children, 
  className, 
  ...props 
}: MobileButtonProps) {
  const { isMobile } = useIsMobile()

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
    isMobile && "mobile-tap-target mobile-button"
  )

  const variantClasses = {
    primary: cn(
      isMobile ? "mobile-button-primary" : "bg-blue-600 hover:bg-blue-700 text-white"
    ),
    secondary: cn(
      isMobile ? "mobile-button-secondary" : "bg-gray-700 hover:bg-gray-600 text-gray-200"
    ),
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
  }

  const sizeClasses = {
    sm: isMobile ? "px-3 py-2 text-sm" : "px-3 py-2 text-sm",
    default: isMobile ? "px-4 py-2.5 text-base" : "px-4 py-2 text-sm",
    lg: isMobile ? "px-6 py-3 text-lg" : "px-6 py-3 text-base"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function MobileInput({ className, error, ...props }: MobileInputProps) {
  const { isMobile } = useIsMobile()

  return (
    <input
      className={cn(
        "w-full rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        isMobile ? "mobile-input" : "px-3 py-2",
        error ? "border-red-500" : "border-gray-600",
        className
      )}
      {...props}
    />
  )
}

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function MobileTextarea({ className, error, ...props }: MobileTextareaProps) {
  const { isMobile } = useIsMobile()

  return (
    <textarea
      className={cn(
        "w-full rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        isMobile ? "mobile-textarea" : "px-3 py-2 min-h-[100px]",
        error ? "border-red-500" : "border-gray-600",
        className
      )}
      {...props}
    />
  )
}

