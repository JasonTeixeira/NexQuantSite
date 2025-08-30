"use client"

import type * as React from "react"
import { useEffect, useRef } from "react"

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
  initialFocus?: string
}

export function FocusTrap({ children, active = true, restoreFocus = true, initialFocus }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement>
    }

    const focusableElements = getFocusableElements()
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus initial element or first focusable element
    if (initialFocus) {
      const initialElement = container.querySelector(initialFocus) as HTMLElement
      if (initialElement) {
        initialElement.focus()
      } else if (firstElement) {
        firstElement.focus()
      }
    } else if (firstElement) {
      firstElement.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const currentFocusableElements = getFocusableElements()
      const currentFirstElement = currentFocusableElements[0]
      const currentLastElement = currentFocusableElements[currentFocusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === currentFirstElement) {
          e.preventDefault()
          currentLastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === currentLastElement) {
          e.preventDefault()
          currentFirstElement?.focus()
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)

      // Restore focus to previously focused element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [active, initialFocus, restoreFocus])

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  )
}
