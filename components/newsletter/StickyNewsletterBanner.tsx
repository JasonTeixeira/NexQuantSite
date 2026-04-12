"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Sparkles } from 'lucide-react'

interface StickyNewsletterBannerProps {
  position?: 'top' | 'bottom'
  source: string
  enabled?: boolean
}

export default function StickyNewsletterBanner({
  position = 'bottom',
  source,
  enabled = true
}: StickyNewsletterBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Check if user has already subscribed or dismissed
    const hasSubscribed = localStorage.getItem('newsletter_subscribed')
    const hasDismissed = localStorage.getItem('newsletter_banner_dismissed')
    
    if (hasSubscribed || hasDismissed) return

    // Show banner after 5 seconds and user has scrolled
    let hasScrolled = false
    let timer: NodeJS.Timeout

    const handleScroll = () => {
      if (window.scrollY > 200) {
        hasScrolled = true
      }
    }

    const checkConditions = () => {
      if (hasScrolled) {
        setIsVisible(true)
        window.removeEventListener('scroll', handleScroll)
        clearInterval(timer)
      }
    }

    // Check every second for conditions
    timer = setInterval(checkConditions, 1000)
    
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Show after 10 seconds regardless
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true)
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timer)
    }, 10000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timer)
      clearTimeout(fallbackTimer)
    }
  }, [enabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          source: `${source}-sticky-banner`,
          tags: ['sticky-banner', source]
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        localStorage.setItem('newsletter_subscribed', 'true')
        
        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'sticky_banner_conversion', {
            event_category: 'Newsletter',
            event_label: source,
            value: 1
          })
        }

        // Auto-hide after success
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
    }

    setIsLoading(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('newsletter_banner_dismissed', 'true')
    
    // Track dismissal
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sticky_banner_dismissed', {
        event_category: 'Newsletter',
        event_label: source
      })
    }
  }

  if (!enabled) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-lg border-t border-cyan-500/20 shadow-2xl shadow-black/50`}
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="hidden sm:block">
                    <h3 className="text-white font-semibold text-lg">
                      {isSuccess ? '🎉 Welcome to Nexural!' : 'Get AI Trading Insights'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {isSuccess 
                        ? 'Check your email for exclusive strategies!'
                        : 'Join 12,500+ traders getting weekly market analysis'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isSuccess && (
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-48 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 text-sm"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium px-4"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        'Get Started'
                      )}
                    </Button>
                  </form>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="sm:hidden mt-3">
              <p className="text-gray-300 text-sm mb-3">
                {isSuccess 
                  ? 'Check your email for exclusive trading strategies!'
                  : 'Join 12,500+ traders getting weekly AI-powered market analysis'
                }
              </p>
              
              {!isSuccess && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium px-6"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      'Join'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing banner state
export function useStickyBannerState() {
  const [hasSubscribed, setHasSubscribed] = useState<boolean | null>(null)
  const [hasDismissed, setHasDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    const subscribed = localStorage.getItem('newsletter_subscribed')
    const dismissed = localStorage.getItem('newsletter_banner_dismissed')
    
    setHasSubscribed(!!subscribed)
    setHasDismissed(!!dismissed)
  }, [])

  return {
    shouldShow: !hasSubscribed && !hasDismissed,
    hasSubscribed,
    hasDismissed
  }
}
