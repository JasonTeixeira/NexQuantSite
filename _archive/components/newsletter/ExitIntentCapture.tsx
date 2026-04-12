"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmailCapturePopup } from './EmailCaptureForm'

interface ExitIntentCaptureProps {
  delay?: number // Minimum time before showing popup
  exitThreshold?: number // Pixels from top before considering exit intent
  source: string
  enabled?: boolean
}

export default function ExitIntentCapture({
  delay = 30000, // 30 seconds minimum
  exitThreshold = 50,
  source,
  enabled = true
}: ExitIntentCaptureProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [canShow, setCanShow] = useState(false)

  useEffect(() => {
    if (!enabled || hasShown) return

    // Check if user has already subscribed
    const hasSubscribed = localStorage.getItem('newsletter_subscribed')
    if (hasSubscribed) return

    // Check if popup was dismissed recently
    const dismissedTime = localStorage.getItem('exit_popup_dismissed')
    if (dismissedTime) {
      const dismissedDate = new Date(dismissedTime)
      const now = new Date()
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
      
      // Don't show again for 7 days after dismissal
      if (daysSinceDismissed < 7) return
    }

    // Wait for minimum delay
    const delayTimer = setTimeout(() => {
      setCanShow(true)
    }, delay)

    // Mouse movement tracking for exit intent
    const handleMouseMove = (e: MouseEvent) => {
      if (!canShow || hasShown || showPopup) return

      // Detect mouse leaving the top of the screen (exit intent)
      if (e.clientY <= exitThreshold && e.movementY < 0) {
        setShowPopup(true)
        setHasShown(true)
      }
    }

    // Mobile scroll tracking (alternative to mouse exit intent)
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      if (!canShow || hasShown || showPopup) return

      const currentScrollY = window.scrollY
      
      // Show popup if user scrolls up significantly (mobile exit intent alternative)
      if (currentScrollY < lastScrollY - 100 && currentScrollY > 500) {
        setShowPopup(true)
        setHasShown(true)
      }
      
      lastScrollY = currentScrollY
    }

    // Page visibility change (when user switches tabs - another exit intent signal)
    const handleVisibilityChange = () => {
      if (!canShow || hasShown || showPopup) return

      if (document.visibilityState === 'hidden') {
        // Small delay to avoid false positives
        setTimeout(() => {
          if (document.visibilityState === 'hidden' && !showPopup) {
            setShowPopup(true)
            setHasShown(true)
          }
        }, 100)
      }
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(delayTimer)
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [delay, exitThreshold, source, enabled, hasShown, showPopup, canShow])

  const handleClose = () => {
    setShowPopup(false)
    // Remember dismissal
    localStorage.setItem('exit_popup_dismissed', new Date().toISOString())
  }

  const handleSuccess = (email: string) => {
    // Remember subscription
    localStorage.setItem('newsletter_subscribed', 'true')
    localStorage.setItem('subscriber_email', email)
    
    // Track conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_conversion', {
        event_category: 'Newsletter',
        event_label: source,
        value: 1
      })
    }
  }

  if (!enabled) return null

  return (
    <AnimatePresence>
      {showPopup && (
        <EmailCapturePopup
          isOpen={showPopup}
          onClose={handleClose}
          source={`${source}-exit-intent`}
        />
      )}
    </AnimatePresence>
  )
}

// Hook for managing exit intent state
export function useExitIntentCapture(source: string, enabled: boolean = true) {
  const [hasSubscribed, setHasSubscribed] = useState<boolean | null>(null)
  const [canShowPopup, setCanShowPopup] = useState(false)

  useEffect(() => {
    // Check subscription status
    const subscribed = localStorage.getItem('newsletter_subscribed')
    setHasSubscribed(!!subscribed)
    
    // Check dismissal status
    const dismissed = localStorage.getItem('exit_popup_dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const now = new Date()
      const daysSince = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
      setCanShowPopup(daysSince >= 7) // Show again after 7 days
    } else {
      setCanShowPopup(true)
    }
  }, [])

  const markAsSubscribed = (email: string) => {
    localStorage.setItem('newsletter_subscribed', 'true')
    localStorage.setItem('subscriber_email', email)
    setHasSubscribed(true)
  }

  const markAsDismissed = () => {
    localStorage.setItem('exit_popup_dismissed', new Date().toISOString())
    setCanShowPopup(false)
  }

  return {
    hasSubscribed,
    canShowPopup: enabled && canShowPopup && !hasSubscribed,
    markAsSubscribed,
    markAsDismissed
  }
}

// Smart popup component that respects user preferences
export function SmartNewsletterPopup({ 
  source, 
  children 
}: { 
  source: string
  children: React.ReactNode 
}) {
  const { canShowPopup } = useExitIntentCapture(source)

  return (
    <>
      {children}
      {canShowPopup && (
        <ExitIntentCapture
          source={source}
          enabled={true}
          delay={30000} // 30 seconds
        />
      )}
    </>
  )
}


