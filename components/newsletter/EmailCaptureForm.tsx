"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  Users,
  Gift,
  Zap
} from 'lucide-react'

interface EmailCaptureFormProps {
  variant?: 'inline' | 'popup' | 'sidebar' | 'footer' | 'hero' | 'exit-intent'
  source: string // Track where the signup came from
  title?: string
  subtitle?: string
  placeholder?: string
  buttonText?: string
  showBenefits?: boolean
  showSocialProof?: boolean
  className?: string
  onSuccess?: (email: string) => void
}

interface FormState {
  email: string
  firstName: string
  isLoading: boolean
  isSuccess: boolean
  error: string | null
}

export default function EmailCaptureForm({
  variant = 'inline',
  source,
  title,
  subtitle,
  placeholder = "Enter your email address",
  buttonText = "Get Started",
  showBenefits = true,
  showSocialProof = true,
  className = "",
  onSuccess
}: EmailCaptureFormProps) {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    firstName: '',
    isLoading: false,
    isSuccess: false,
    error: null
  })

  const [hasInteracted, setHasInteracted] = useState(false)

  // Variant-specific styling
  const variants = {
    inline: {
      container: "bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-8",
      title: "text-2xl font-bold text-white mb-3",
      form: "flex flex-col sm:flex-row gap-4"
    },
    hero: {
      container: "bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-10 shadow-2xl shadow-cyan-500/10",
      title: "text-3xl font-bold text-white mb-4",
      form: "flex flex-col sm:flex-row gap-5"
    },
    popup: {
      container: "bg-gray-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-10 shadow-2xl shadow-cyan-500/20",
      title: "text-3xl font-bold text-white mb-5",
      form: "flex flex-col gap-5"
    },
    sidebar: {
      container: "bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-8 sticky top-8",
      title: "text-xl font-bold text-white mb-4",
      form: "flex flex-col gap-4"
    },
    footer: {
      container: "bg-transparent border-0 p-0",
      title: "text-lg font-semibold text-white mb-3",
      form: "flex flex-col sm:flex-row gap-3"
    },
    'exit-intent': {
      container: "bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl p-10 shadow-2xl shadow-cyan-500/30",
      title: "text-3xl font-bold text-white mb-5",
      form: "flex flex-col gap-5"
    }
  }

  const currentVariant = variants[variant]

  const benefits = [
    { icon: TrendingUp, text: "Weekly trading insights", color: "text-cyan-400" },
    { icon: Users, text: "Exclusive community access", color: "text-blue-400" },
    { icon: Gift, text: "Free strategy guides", color: "text-cyan-300" },
    { icon: Zap, text: "AI trading alerts", color: "text-blue-300" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.email) {
      setFormState(prev => ({ ...prev, error: 'Email is required' }))
      return
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.email,
          firstName: formState.firstName,
          source,
          tags: [variant, source],
          customFields: {
            signupVariant: variant,
            userAgent: navigator.userAgent
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        setFormState(prev => ({ 
          ...prev, 
          isSuccess: true, 
          isLoading: false 
        }))
        
        // Track successful signup
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_signup', {
            event_category: 'Newsletter',
            event_label: source,
            value: 1
          })
        }

        onSuccess?.(formState.email)
      } else {
        throw new Error(result.error || 'Subscription failed')
      }

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Something went wrong',
        isLoading: false
      }))
    }
  }

  // Success state
  if (formState.isSuccess) {
    return (
      <motion.div 
        className={`${currentVariant.container} ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            Welcome to Nexural! 🎉
          </h3>
          
          <p className="text-gray-300 mb-4">
            Check your email for exclusive trading insights and your welcome bonus.
          </p>

          {showBenefits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  className="flex items-center gap-2 text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`${currentVariant.container} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
            Free Newsletter
          </Badge>
        </div>

        <h3 className={currentVariant.title}>
          {title || "Get Trading Insights"}
        </h3>
        
        <p className="text-gray-300">
          {subtitle || "Join 12,500+ traders getting weekly AI-powered market analysis"}
        </p>

        {showSocialProof && (
          <motion.div 
            className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-semibold text-white"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>+234 joined this week</span>
          </motion.div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={currentVariant.form}>
        <div className="flex-1 space-y-3">
          {variant === 'popup' && (
            <Input
              type="text"
              placeholder="First name (optional)"
              value={formState.firstName}
              onChange={(e) => setFormState(prev => ({ ...prev, firstName: e.target.value }))}
              className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              onFocus={() => setHasInteracted(true)}
            />
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder={placeholder}
              value={formState.email}
              onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value, error: null }))}
              className="pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              required
              onFocus={() => setHasInteracted(true)}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={formState.isLoading}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState.isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              <span>{buttonText}</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {formState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{formState.error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benefits */}
      {showBenefits && !formState.isSuccess && (
        <motion.div 
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {benefits.map((benefit, index) => (
            <div key={benefit.text} className="flex items-center gap-2 text-gray-300">
              <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
              <span>{benefit.text}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Privacy Notice */}
      <motion.p 
        className="text-xs text-gray-500 mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        No spam. Unsubscribe anytime. Read our{" "}
        <a href="/privacy" className="text-cyan-400 hover:underline">
          Privacy Policy
        </a>
      </motion.p>
    </motion.div>
  )
}

// High-converting popup variant
export function EmailCapturePopup({ 
  isOpen, 
  onClose, 
  source 
}: { 
  isOpen: boolean
  onClose: () => void
  source: string 
}) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <EmailCaptureForm
          variant="popup"
          source={source}
          title="Wait! Don't Miss Your Trading Edge 🚀"
          subtitle="Join 12,500+ successful traders getting weekly AI-powered insights"
          buttonText="Get My Edge Now"
          showBenefits={true}
          showSocialProof={true}
          onSuccess={() => {
            setTimeout(() => onClose(), 2000)
          }}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-2 -right-2 text-gray-400 hover:text-white"
        >
          ×
        </Button>
      </motion.div>
    </motion.div>
  )
}
