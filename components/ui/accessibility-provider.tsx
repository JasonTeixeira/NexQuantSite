"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: "small" | "medium" | "large" | "extra-large"
  focusVisible: boolean
  screenReaderAnnouncements: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (settings: Partial<AccessibilitySettings>) => void
  announceToScreenReader: (message: string, priority?: "polite" | "assertive") => void
  focusElement: (selector: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    fontSize: "medium",
    focusVisible: true,
    screenReaderAnnouncements: true,
  })

  const [liveRegion, setLiveRegion] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    // Detect user preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches

    setSettings((prev) => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
    }))

    // Create live region for screen reader announcements
    const liveRegionElement = document.createElement("div")
    liveRegionElement.setAttribute("aria-live", "polite")
    liveRegionElement.setAttribute("aria-atomic", "true")
    liveRegionElement.className = "sr-only"
    liveRegionElement.id = "accessibility-live-region"
    document.body.appendChild(liveRegionElement)
    setLiveRegion(liveRegionElement)

    return () => {
      if (liveRegionElement.parentNode) {
        liveRegionElement.parentNode.removeChild(liveRegionElement)
      }
    }
  }, [])

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement

    root.setAttribute("data-reduced-motion", settings.reducedMotion.toString())
    root.setAttribute("data-high-contrast", settings.highContrast.toString())
    root.setAttribute("data-font-size", settings.fontSize)
    root.setAttribute("data-focus-visible", settings.focusVisible.toString())

    // Apply CSS custom properties
    root.style.setProperty(
      "--font-size-multiplier",
      settings.fontSize === "small"
        ? "0.875"
        : settings.fontSize === "large"
          ? "1.125"
          : settings.fontSize === "extra-large"
            ? "1.25"
            : "1",
    )
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const announceToScreenReader = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (!settings.screenReaderAnnouncements || !liveRegion) return

    liveRegion.setAttribute("aria-live", priority)
    liveRegion.textContent = message

    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) liveRegion.textContent = ""
    }, 1000)
  }

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        announceToScreenReader,
        focusElement,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}
