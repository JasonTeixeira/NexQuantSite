"use client"

import { useEffect, useCallback } from "react"

interface UseKeyboardNavigationOptions {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  onHome?: () => void
  onEnd?: () => void
  onPageUp?: () => void
  onPageDown?: () => void
  enabled?: boolean
  preventDefault?: boolean
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    enabled = true,
    preventDefault = true,
  } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const { key } = event

      switch (key) {
        case "ArrowUp":
          if (onArrowUp) {
            if (preventDefault) event.preventDefault()
            onArrowUp()
          }
          break
        case "ArrowDown":
          if (onArrowDown) {
            if (preventDefault) event.preventDefault()
            onArrowDown()
          }
          break
        case "ArrowLeft":
          if (onArrowLeft) {
            if (preventDefault) event.preventDefault()
            onArrowLeft()
          }
          break
        case "ArrowRight":
          if (onArrowRight) {
            if (preventDefault) event.preventDefault()
            onArrowRight()
          }
          break
        case "Enter":
          if (onEnter) {
            if (preventDefault) event.preventDefault()
            onEnter()
          }
          break
        case "Escape":
          if (onEscape) {
            if (preventDefault) event.preventDefault()
            onEscape()
          }
          break
        case "Home":
          if (onHome) {
            if (preventDefault) event.preventDefault()
            onHome()
          }
          break
        case "End":
          if (onEnd) {
            if (preventDefault) event.preventDefault()
            onEnd()
          }
          break
        case "PageUp":
          if (onPageUp) {
            if (preventDefault) event.preventDefault()
            onPageUp()
          }
          break
        case "PageDown":
          if (onPageDown) {
            if (preventDefault) event.preventDefault()
            onPageDown()
          }
          break
      }
    },
    [
      enabled,
      preventDefault,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onEnter,
      onEscape,
      onHome,
      onEnd,
      onPageUp,
      onPageDown,
    ],
  )

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
