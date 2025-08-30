"use client"

import React, { useEffect, useRef, useState } from 'react'

/**
 * Touch Optimization Component
 * Enhances mobile touch interactions and gestures
 */

// Touch gesture types
export interface TouchGestureEvent {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'pan'
  target: HTMLElement
  touches: TouchList
  deltaX?: number
  deltaY?: number
  scale?: number
  rotation?: number
  duration?: number
  velocity?: number
}

// Touch optimization options
export interface TouchOptimizationOptions {
  enableFastTap: boolean
  enableSwipeGestures: boolean
  enablePinchZoom: boolean
  enableLongPress: boolean
  fastTapDelay: number
  longPressDelay: number
  swipeThreshold: number
  pinchThreshold: number
  preventDefaultTouches: boolean
}

// Touch optimization hook
export function useTouchOptimization(
  ref: React.RefObject<HTMLElement>,
  options: Partial<TouchOptimizationOptions> = {},
  onGesture?: (event: TouchGestureEvent) => void
) {
  const config: TouchOptimizationOptions = {
    enableFastTap: true,
    enableSwipeGestures: true,
    enablePinchZoom: false,
    enableLongPress: true,
    fastTapDelay: 300,
    longPressDelay: 500,
    swipeThreshold: 50,
    pinchThreshold: 0.1,
    preventDefaultTouches: false,
    ...options
  }

  const gestureState = useRef({
    isTracking: false,
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    initialDistance: 0,
    currentDistance: 0,
    initialAngle: 0,
    currentAngle: 0,
    touchCount: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    lastTapTime: 0,
    tapCount: 0
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Touch start handler
    const handleTouchStart = (e: TouchEvent) => {
      if (config.preventDefaultTouches) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      const state = gestureState.current

      state.isTracking = true
      state.startTime = Date.now()
      state.startX = touch.clientX
      state.startY = touch.clientY
      state.currentX = touch.clientX
      state.currentY = touch.clientY
      state.touchCount = e.touches.length

      if (e.touches.length === 2 && config.enablePinchZoom) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        state.initialDistance = getDistance(touch1, touch2)
        state.initialAngle = getAngle(touch1, touch2)
      }

      // Start long press timer
      if (config.enableLongPress && e.touches.length === 1) {
        state.longPressTimer = setTimeout(() => {
          if (state.isTracking) {
            onGesture?.({
              type: 'long-press',
              target: element,
              touches: e.touches,
              duration: Date.now() - state.startTime
            })
          }
        }, config.longPressDelay)
      }
    }

    // Touch move handler
    const handleTouchMove = (e: TouchEvent) => {
      if (config.preventDefaultTouches) {
        e.preventDefault()
      }

      const state = gestureState.current
      if (!state.isTracking) return

      const touch = e.touches[0]
      state.currentX = touch.clientX
      state.currentY = touch.clientY

      // Clear long press if moved too much
      if (state.longPressTimer) {
        const deltaX = Math.abs(state.currentX - state.startX)
        const deltaY = Math.abs(state.currentY - state.startY)
        
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(state.longPressTimer)
          state.longPressTimer = null
        }
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && config.enablePinchZoom) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        state.currentDistance = getDistance(touch1, touch2)
        state.currentAngle = getAngle(touch1, touch2)

        const scale = state.currentDistance / state.initialDistance
        const rotation = state.currentAngle - state.initialAngle

        if (Math.abs(scale - 1) > config.pinchThreshold) {
          onGesture?.({
            type: 'pinch',
            target: element,
            touches: e.touches,
            scale,
            rotation
          })
        }
      }

      // Handle pan gesture
      if (e.touches.length === 1) {
        const deltaX = state.currentX - state.startX
        const deltaY = state.currentY - state.startY

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          onGesture?.({
            type: 'pan',
            target: element,
            touches: e.touches,
            deltaX,
            deltaY
          })
        }
      }
    }

    // Touch end handler
    const handleTouchEnd = (e: TouchEvent) => {
      const state = gestureState.current
      
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer)
        state.longPressTimer = null
      }

      if (!state.isTracking) return

      const endTime = Date.now()
      const duration = endTime - state.startTime
      const deltaX = state.currentX - state.startX
      const deltaY = state.currentY - state.startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const velocity = distance / duration

      // Handle swipe gesture
      if (config.enableSwipeGestures && distance > config.swipeThreshold && duration < 500) {
        onGesture?.({
          type: 'swipe',
          target: element,
          touches: e.changedTouches,
          deltaX,
          deltaY,
          velocity,
          duration
        })
      }
      // Handle tap gestures
      else if (distance < 10 && duration < config.fastTapDelay) {
        const timeSinceLastTap = endTime - state.lastTapTime
        
        if (timeSinceLastTap < config.fastTapDelay) {
          state.tapCount++
        } else {
          state.tapCount = 1
        }
        
        state.lastTapTime = endTime

        // Double tap detection
        if (state.tapCount === 2) {
          onGesture?.({
            type: 'double-tap',
            target: element,
            touches: e.changedTouches,
            duration
          })
          state.tapCount = 0
        } else {
          // Single tap with delay to check for double tap
          setTimeout(() => {
            if (state.tapCount === 1) {
              onGesture?.({
                type: 'tap',
                target: element,
                touches: e.changedTouches,
                duration
              })
            }
            state.tapCount = 0
          }, config.fastTapDelay)
        }
      }

      state.isTracking = false
    }

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !config.preventDefaultTouches })
    element.addEventListener('touchmove', handleTouchMove, { passive: !config.preventDefaultTouches })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (gestureState.current.longPressTimer) {
        clearTimeout(gestureState.current.longPressTimer)
      }
    }
  }, [ref, config, onGesture])
}

// Touch-optimized button component
export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large'
  hapticFeedback?: boolean
  rippleEffect?: boolean
}

export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ size = 'medium', hapticFeedback = true, rippleEffect = true, children, className = '', ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number; size: number }>>([])

    // Merge refs
    React.useImperativeHandle(ref, () => buttonRef.current!)

    const sizeClasses = {
      small: 'min-h-[44px] px-3 py-2 text-sm',
      medium: 'min-h-[48px] px-4 py-3 text-base',
      large: 'min-h-[56px] px-6 py-4 text-lg'
    }

    const handleTouch = (e: TouchGestureEvent) => {
      if (e.type === 'tap') {
        // Haptic feedback
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50)
        }

        // Ripple effect
        if (rippleEffect && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          const touch = e.touches[0] || { clientX: rect.width / 2, clientY: rect.height / 2 }
          const x = (touch.clientX || rect.width / 2) - rect.left
          const y = (touch.clientY || rect.height / 2) - rect.top
          const size = Math.max(rect.width, rect.height) * 2

          const ripple = {
            id: `ripple-${Date.now()}`,
            x: x - size / 2,
            y: y - size / 2,
            size
          }

          setRipples(prev => [...prev, ripple])

          // Remove ripple after animation
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== ripple.id))
          }, 600)
        }
      }
    }

    useTouchOptimization(buttonRef, {
      enableFastTap: true,
      enableSwipeGestures: false,
      enablePinchZoom: false,
      enableLongPress: false,
      fastTapDelay: 200
    }, handleTouch)

    return (
      <button
        ref={buttonRef}
        className={`
          relative overflow-hidden
          ${sizeClasses[size]}
          ${className}
          active:scale-95 transition-transform duration-100
          touch-manipulation select-none
          focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50
        `}
        {...props}
      >
        {children}
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/20 rounded-full pointer-events-none animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size
            }}
          />
        ))}
      </button>
    )
  }
)

TouchButton.displayName = 'TouchButton'

// Touch-optimized input component
export interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const TouchInput = React.forwardRef<HTMLInputElement, TouchInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={inputRef}
            className={`
              w-full min-h-[48px] px-4 py-3 
              ${icon ? 'pl-12' : 'pl-4'}
              bg-gray-900 border border-gray-700 rounded-lg
              text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent
              transition-all duration-200
              touch-manipulation
              ${isFocused ? 'ring-2 ring-cyan-400' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </div>
        
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

TouchInput.displayName = 'TouchInput'

// Swipeable card component
export interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  swipeThreshold?: number
  className?: string
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, rotation: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const handleGesture = (e: TouchGestureEvent) => {
    switch (e.type) {
      case 'pan':
        if (e.deltaX !== undefined && e.deltaY !== undefined) {
          setIsDragging(true)
          setTransform({
            x: e.deltaX,
            y: e.deltaY,
            rotation: e.deltaX * 0.1 // Subtle rotation based on horizontal movement
          })
        }
        break

      case 'swipe':
        if (e.deltaX !== undefined && e.deltaY !== undefined) {
          const absX = Math.abs(e.deltaX)
          const absY = Math.abs(e.deltaY)

          if (absX > absY) {
            // Horizontal swipe
            if (e.deltaX > swipeThreshold && onSwipeRight) {
              onSwipeRight()
            } else if (e.deltaX < -swipeThreshold && onSwipeLeft) {
              onSwipeLeft()
            }
          } else {
            // Vertical swipe
            if (e.deltaY > swipeThreshold && onSwipeDown) {
              onSwipeDown()
            } else if (e.deltaY < -swipeThreshold && onSwipeUp) {
              onSwipeUp()
            }
          }
        }
        
        // Reset position
        setIsDragging(false)
        setTransform({ x: 0, y: 0, rotation: 0 })
        break
    }
  }

  useTouchOptimization(cardRef, {
    enableSwipeGestures: true,
    enableFastTap: false,
    swipeThreshold: swipeThreshold
  }, handleGesture)

  return (
    <div
      ref={cardRef}
      className={`
        touch-manipulation select-none
        transition-transform duration-300
        ${isDragging ? 'duration-0' : ''}
        ${className}
      `}
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotation}deg)`
      }}
    >
      {children}
    </div>
  )
}

// Utility functions
function getDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function getAngle(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.atan2(dy, dx) * (180 / Math.PI)
}

// Touch optimization provider
export interface TouchOptimizationProviderProps {
  children: React.ReactNode
}

export const TouchOptimizationProvider: React.FC<TouchOptimizationProviderProps> = ({ children }) => {
  useEffect(() => {
    // Add global touch optimizations
    const addTouchClass = () => {
      if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device')
      }
    }

    // Prevent default touch behaviors where needed
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    // Prevent double-tap zoom
    let lastTouchEnd = 0
    const preventDoubleTouch = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    addTouchClass()
    document.addEventListener('touchstart', preventZoom, { passive: false })
    document.addEventListener('touchend', preventDoubleTouch, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventZoom)
      document.removeEventListener('touchend', preventDoubleTouch)
    }
  }, [])

  return <>{children}</>
}

export default {
  useTouchOptimization,
  TouchButton,
  TouchInput,
  SwipeableCard,
  TouchOptimizationProvider
}


