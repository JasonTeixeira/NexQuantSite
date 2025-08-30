"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  BarChart3,
  Brain
} from 'lucide-react'

interface InlineNewsletterWidgetProps {
  variant?: 'compact' | 'featured' | 'sidebar' | 'article-end'
  source: string
  className?: string
  title?: string
  description?: string
  showStats?: boolean
  showTestimonial?: boolean
}

export default function InlineNewsletterWidget({
  variant = 'compact',
  source,
  className = "",
  title,
  description,
  showStats = true,
  showTestimonial = false
}: InlineNewsletterWidgetProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
          source: `${source}-inline-widget`,
          tags: ['inline-widget', variant, source]
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        
        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'inline_widget_conversion', {
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

  const stats = [
    { icon: Users, label: "Subscribers", value: "12,547", color: "text-cyan-400" },
    { icon: TrendingUp, label: "Open Rate", value: "68.4%", color: "text-blue-400" },
    { icon: BarChart3, label: "Success Rate", value: "94%", color: "text-cyan-300" }
  ]

  const testimonial = {
    text: "The weekly insights helped me increase my portfolio returns by 34% in just 3 months.",
    author: "Sarah Chen",
    role: "Quantitative Analyst"
  }

  // Success state
  if (isSuccess) {
    return (
      <motion.div 
        className={`bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">You're All Set! 🎉</h3>
        <p className="text-gray-300">
          Check your email for exclusive trading insights and your welcome bonus.
        </p>
      </motion.div>
    )
  }

  // Compact variant - Much more compact
  if (variant === 'compact') {
    return (
      <motion.div 
        className={`bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-cyan-500/20 rounded-lg p-3 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
            <Mail className="w-4 h-4 text-cyan-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm leading-tight">
              {title || "Get Trading Insights"}
            </h4>
            <p className="text-xs text-gray-300 leading-tight">
              {description || "Weekly AI analysis"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-28 sm:w-32 h-8 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 text-xs"
              required
            />
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className="h-8 px-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    )
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <motion.div 
        className={`bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl p-8 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
              <Brain className="w-8 h-8 text-cyan-400" />
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Free Newsletter
            </Badge>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            {title || "Master AI Trading Strategies"}
          </h3>
          <p className="text-gray-300 text-lg">
            {description || "Get weekly insights from our AI-powered analysis, delivered every Sunday"}
          </p>
        </div>

        {showStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/30">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {showTestimonial && (
          <div className="bg-black/30 border border-gray-700 rounded-xl p-4 mb-6">
            <p className="text-gray-300 italic mb-3">"{testimonial.text}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                SC
              </div>
              <div>
                <p className="text-white font-medium text-sm">{testimonial.author}</p>
                <p className="text-gray-400 text-xs">{testimonial.role}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-8"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Joining...
              </>
            ) : (
              <>
                Get My Edge
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          No spam. Unsubscribe anytime. 12,500+ traders trust us.
        </p>
      </motion.div>
    )
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <motion.div 
        className={`bg-gradient-to-b from-gray-900 to-gray-800 border border-cyan-500/20 rounded-xl p-6 sticky top-8 ${className}`}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-4">
          <Mail className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white mb-2">
            {title || "Stay Updated"}
          </h4>
          <p className="text-sm text-gray-300">
            {description || "Get weekly trading insights"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>

        {showStats && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-center text-sm text-gray-400">
              Join 12,547 traders • 68.4% open rate
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // Article end variant
  return (
    <motion.div 
      className={`bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-8 my-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">
            {title || "Enjoyed this article?"}
          </h3>
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>

        <p className="text-gray-300 mb-6">
          {description || "Get more insights like this delivered weekly to your inbox"}
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
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
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-6"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-3">
          Free forever • No spam • Unsubscribe anytime
        </p>
      </div>
    </motion.div>
  )
}
