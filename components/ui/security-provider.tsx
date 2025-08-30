"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { securityAudit } from "@/lib/security-audit-system"

interface SecurityContextType {
  securityScore: number
  threatLevel: "low" | "medium" | "high" | "critical"
  isSecureConnection: boolean
  sessionValid: boolean
  enabledFeatures: string[]
  reportThreat: (type: string, description: string) => void
  validateCSRF: (token: string) => boolean
}

const SecurityContext = createContext<SecurityContextType | null>(null)

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [securityState, setSecurityState] = useState<{
    securityScore: number
    threatLevel: "low" | "medium" | "high" | "critical"
    isSecureConnection: boolean
    sessionValid: boolean
    enabledFeatures: string[]
  }>({
    securityScore: 95,
    threatLevel: "low",
    isSecureConnection: true,
    sessionValid: true,
    enabledFeatures: ["2fa", "csrf", "rate-limiting", "audit-logging"],
  })

  useEffect(() => {
    // Initialize security monitoring
    const initSecurity = async () => {
      try {
        // Check connection security
        const isSecure = window.location.protocol === "https:"

        // Get security metrics
        const metrics = securityAudit.analyzeSecurityPosture()
        const score = calculateSecurityScore(metrics)
        const threatLevel = determineThreatLevel(metrics)

        setSecurityState((prev) => ({
          ...prev,
          isSecureConnection: isSecure,
          securityScore: score,
          threatLevel,
        }))

        // Start security monitoring
        startSecurityMonitoring()
      } catch (error) {
        console.error("[v0] Security initialization failed:", error)
      }
    }

    initSecurity()
  }, [])

  const calculateSecurityScore = (metrics: any): number => {
    let score = 100

    if (metrics.criticalEvents > 0) score -= 20
    if (metrics.suspiciousIPs.length > 5) score -= 15
    if (!securityState.isSecureConnection) score -= 25

    return Math.max(0, score)
  }

  const determineThreatLevel = (metrics: any): "low" | "medium" | "high" | "critical" => {
    if (metrics.criticalEvents > 5) return "critical"
    if (metrics.criticalEvents > 2) return "high"
    if (metrics.suspiciousIPs.length > 3) return "medium"
    return "low"
  }

  const startSecurityMonitoring = () => {
    // Monitor for suspicious activity
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Check for suspicious DOM modifications
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName === "SCRIPT" && !element.hasAttribute("data-trusted")) {
                reportThreat("xss_attempt", "Untrusted script injection detected")
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Monitor for suspicious user behavior
    let rapidClicks = 0
    let lastClickTime = 0

    document.addEventListener("click", () => {
      const now = Date.now()
      if (now - lastClickTime < 100) {
        rapidClicks++
        if (rapidClicks > 10) {
          reportThreat("suspicious_pattern", "Rapid clicking detected - possible bot activity")
          rapidClicks = 0
        }
      } else {
        rapidClicks = 0
      }
      lastClickTime = now
    })
  }

  const reportThreat = (type: string, description: string) => {
    securityAudit.detectThreat(type as any, window.location.hostname, description, { userAgent: navigator.userAgent })

    // Update threat level if necessary
    const metrics = securityAudit.analyzeSecurityPosture()
    const newThreatLevel = determineThreatLevel(metrics)

    if (newThreatLevel !== securityState.threatLevel) {
      setSecurityState((prev) => ({ ...prev, threatLevel: newThreatLevel }))
    }
  }

  const validateCSRF = (token: string): boolean => {
    // Implement CSRF validation logic
    return token.length > 0 && /^[a-zA-Z0-9+/=]+$/.test(token)
  }

  const contextValue: SecurityContextType = {
    ...securityState,
    reportThreat,
    validateCSRF,
  }

  return <SecurityContext.Provider value={contextValue}>{children}</SecurityContext.Provider>
}

export function useSecurity() {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error("useSecurity must be used within SecurityProvider")
  }
  return context
}
