"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface GestureState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  velocity: number
  direction: "left" | "right" | "up" | "down" | null
  isActive: boolean
}

interface GestureCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onRotate?: (angle: number) => void
  onLongPress?: () => void
  onDoubleTap?: () => void
}

export function useAdvancedGestures(callbacks: GestureCallbacks) {
  const elementRef = useRef<HTMLElement>(null)
  const [gestureState, setGestureState] = useState<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    direction: null,
    isActive: false,
  })

  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTap = useRef<number>(0)
  const touchStartTime = useRef<number>(0)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0]
      const now = Date.now()
      touchStartTime.current = now

      setGestureState((prev) => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isActive: true,
      }))

      // Long press detection
      longPressTimer.current = setTimeout(() => {
        callbacks.onLongPress?.()
      }, 500)

      // Double tap detection
      if (now - lastTap.current < 300) {
        callbacks.onDoubleTap?.()
        lastTap.current = 0
      } else {
        lastTap.current = now
      }
    },
    [callbacks],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!gestureState.isActive) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - gestureState.startX
      const deltaY = touch.clientY - gestureState.startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const timeDelta = Date.now() - touchStartTime.current
      const velocity = distance / timeDelta

      // Clear long press if moving
      if (distance > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }

      setGestureState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        velocity,
        direction: Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? "right" : "left") : deltaY > 0 ? "down" : "up",
      }))

      // Handle pinch gesture
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2),
        )
        // Calculate scale based on initial distance
        callbacks.onPinch?.(distance / 100) // Normalize scale
      }
    },
    [gestureState, callbacks],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }

      const { deltaX, deltaY, velocity } = gestureState
      const minSwipeDistance = 50
      const minSwipeVelocity = 0.3

      if (Math.abs(deltaX) > minSwipeDistance && velocity > minSwipeVelocity) {
        if (deltaX > 0) {
          callbacks.onSwipeRight?.()
        } else {
          callbacks.onSwipeLeft?.()
        }
      } else if (Math.abs(deltaY) > minSwipeDistance && velocity > minSwipeVelocity) {
        if (deltaY > 0) {
          callbacks.onSwipeDown?.()
        } else {
          callbacks.onSwipeUp?.()
        }
      }

      setGestureState((prev) => ({
        ...prev,
        isActive: false,
        deltaX: 0,
        deltaY: 0,
        velocity: 0,
        direction: null,
      }))
    },
    [gestureState, callbacks],
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { elementRef, gestureState }
}
