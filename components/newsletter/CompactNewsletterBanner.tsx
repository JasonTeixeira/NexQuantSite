"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react'

interface CompactNewsletterBannerProps {
  source: string
  className?: string
  showDismiss?: boolean
  onDismiss?: () => void
}

export default function CompactNewsletterBanner({
  source,
  className = "",
  showDismiss = false,
  onDismiss
}: CompactNewsletterBannerProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

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
          source: `${source}-compact-banner`,
          tags: ['compact-banner', source]
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        
        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'compact_banner_conversion', {
            event_category: 'Newsletter',
            event_label: source,
            value: 1
          })
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
    }

    setIsLoading(false)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  // Success state
  if (isSuccess) {
    return (
      <motion.div 
        className={`bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">You're all set! 🎉</p>
              <p className="text-gray-300 text-xs">Check your email for exclusive trading insights.</p>
            </div>
          </div>
          {showDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-cyan-500/20 rounded-lg p-4 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Content */}
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex-shrink-0">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-semibold text-sm">Free Newsletter</h4>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs px-2 py-0">
                Free
              </Badge>
            </div>
            <p className="text-gray-300 text-xs leading-tight">
              Get weekly AI-powered trading insights • Join 12,500+ successful traders
            </p>
          </div>

          {/* Stats - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>12.5k</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>68% open</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 sm:w-44 h-8 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 text-sm"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            size="sm" 
            className="h-8 px-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-xs font-medium"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
            ) : (
              <>
                Subscribe
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        </form>

        {/* Dismiss button */}
        {showDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 h-auto flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
