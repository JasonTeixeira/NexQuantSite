"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Gift,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Shield,
  Zap,
  Target,
  Award,
  Sparkles,
  ArrowRight,
  Crown,
  BarChart3,
  Percent,
  Trophy,
  Lock,
  Unlock,
  Timer,
  AlertCircle,
  ExternalLink,
  Share2,
  Heart
} from "lucide-react"

interface ReferralData {
  referrerName: string
  referrerUsername: string
  referrerLevel: string
  referrerStats: {
    totalTrades: number
    winRate: number
    totalPnL: number
    followers: number
  }
  isValid: boolean
  bonusAmount: number
  referrerBonus: number
  expiresAt: string
  campaignName: string
}

interface ReferralLandingClientProps {
  referralCode: string
  referralData: ReferralData
  source?: string
  campaign?: string
}

// Floating particles component for visual appeal
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
        animate={{
          x: [0, Math.random() * 100 - 50],
          y: [0, Math.random() * 100 - 50],
          opacity: [0.6, 0.2, 0.6],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
)

export default function ReferralLandingClient({ 
  referralCode, 
  referralData, 
  source, 
  campaign 
}: ReferralLandingClientProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  
  // Calculate time left until expiry
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(referralData.expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [referralData.expiresAt])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const benefits = [
    {
      icon: DollarSign,
      title: "Instant Welcome Bonus",
      description: `Get $${referralData.bonusAmount} credited to your account immediately upon signup`,
      highlight: true
    },
    {
      icon: Zap,
      title: "AI-Powered Trading Tools",
      description: "Access institutional-grade algorithmic trading strategies",
      highlight: false
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Advanced performance tracking and risk management tools",
      highlight: false
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Learn from top traders and share strategies",
      highlight: false
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your funds and data protected with enterprise security",
      highlight: false
    },
    {
      icon: Target,
      title: "Proven Results",
      description: "Join traders who've generated $2.1M+ in verified profits",
      highlight: false
    }
  ]

  const trustSignals = [
    { metric: "150,000+", label: "Active Traders" },
    { metric: "99.9%", label: "Uptime" },
    { metric: "$2.1M+", label: "Total Profits" },
    { metric: "4.9/5", label: "User Rating" }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      <FloatingParticles />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Header with Urgency */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-black py-3"
        >
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold">
              <Gift className="w-4 h-4" />
              <span>EXCLUSIVE INVITATION BONUS</span>
              {timeLeft && (
                <>
                  <span>•</span>
                  <Timer className="w-4 h-4" />
                  <span>
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Referrer Info & Value Prop */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Referrer Card */}
              <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-600">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-cyan-500">
                      <AvatarImage src="" alt={referralData.referrerName} />
                      <AvatarFallback className="bg-cyan-600 text-lg">
                        {referralData.referrerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{referralData.referrerName}</h3>
                        <Crown className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <span>@{referralData.referrerUsername}</span>
                        <Badge className="bg-purple-600">{referralData.referrerLevel}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4 mb-4 bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400 mb-1">invited you to join</div>
                    <div className="text-3xl font-display font-bold text-cyan-400">NEXURAL TRADING</div>
                  </div>

                  {/* Referrer Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        ${formatNumber(referralData.referrerStats.totalPnL)}
                      </div>
                      <div className="text-xs text-gray-400">Total P&L</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {referralData.referrerStats.winRate}%
                      </div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {formatNumber(referralData.referrerStats.totalTrades)}
                      </div>
                      <div className="text-xs text-gray-400">Total Trades</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cyan-400">
                        {formatNumber(referralData.referrerStats.followers)}
                      </div>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bonus Highlight */}
              <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-600">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold">EXCLUSIVE BONUS</span>
                  </div>
                  
                  <div className="text-4xl font-bold text-white mb-2">
                    ${referralData.bonusAmount}
                  </div>
                  <div className="text-amber-400 mb-4">Welcome Bonus</div>
                  
                  <div className="text-sm text-gray-300 mb-4">
                    Plus {referralData.referrerName} gets ${referralData.referrerBonus} when you join!
                  </div>

                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-black font-bold w-full">
                    <Gift className="w-5 h-5 mr-2" />
                    Claim Your Bonus
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Main CTA */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Badge className="mb-4 bg-green-600">LIMITED TIME OFFER</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Start Trading with
                  <span className="text-cyan-400 block">AI-Powered Precision</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl">
                  Join {formatNumber(150000)}+ traders using institutional-grade algorithms. 
                  Get your <strong className="text-amber-400">${referralData.bonusAmount} welcome bonus</strong> and 
                  start generating profits from day one.
                </p>
              </div>

              {/* Sign Up Form */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Get Started in 2 Minutes</h3>
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>No Credit Card Required</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-6"
                      asChild
                    >
                      <Link href={`/register?ref=${referralCode}&source=${source || 'referral'}`}>
                        <Unlock className="w-6 h-6 mr-3" />
                        Create Free Account & Claim ${referralData.bonusAmount}
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </Link>
                    </Button>

                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">Already have an account?</div>
                      <Button 
                        variant="outline" 
                        className="border-gray-600"
                        asChild
                      >
                        <Link href={`/login?ref=${referralCode}`}>
                          <Lock className="w-4 h-4 mr-2" />
                          Sign In Instead
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {trustSignals.map((signal, index) => (
                        <div key={index}>
                          <div className="text-lg font-bold text-white">{signal.metric}</div>
                          <div className="text-xs text-gray-400">{signal.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Urgency Timer */}
              {timeLeft && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <div className="text-center">
                        <div className="text-sm text-red-400 font-semibold">BONUS EXPIRES IN:</div>
                        <div className="text-2xl font-bold text-white">
                          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Traders Choose Nexural
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join the platform that's revolutionizing retail trading with institutional-grade technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full ${benefit.highlight ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600' : 'bg-gray-900 border-gray-700'} hover:scale-105 transition-transform`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${benefit.highlight ? 'bg-amber-600' : 'bg-cyan-600'}`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.description}</p>
                      {benefit.highlight && (
                        <Badge className="mt-3 bg-amber-600">Featured Benefit</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by Professional Traders
            </h2>
            <p className="text-xl text-gray-400">Real results from real traders</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marcus Johnson",
                username: "crypto_marcus",
                level: "Expert",
                profit: "+234%",
                trades: "1,200+",
                testimonial: "Nexural's AI algorithms helped me achieve consistent 20%+ monthly returns. The community aspect makes it even better."
              },
              {
                name: "Elena Rodriguez", 
                username: "elena_trader",
                level: "Advanced",
                profit: "+189%",
                trades: "850+",
                testimonial: "The platform's risk management tools saved me from major losses during market volatility. Highly recommended."
              },
              {
                name: "David Kim",
                username: "quant_david", 
                level: "Expert",
                profit: "+312%",
                trades: "2,100+",
                testimonial: "Finally, a platform that gives retail traders access to institutional-grade strategies. Game changer."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900 border-gray-700 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-cyan-600">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">@{testimonial.username}</div>
                      </div>
                      <Badge className="ml-auto bg-purple-600">{testimonial.level}</Badge>
                    </div>
                    
                    <div className="flex gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{testimonial.profit}</div>
                        <div className="text-xs text-gray-500">Total Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{testimonial.trades}</div>
                        <div className="text-xs text-gray-500">Trades</div>
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-300 italic">
                      "{testimonial.testimonial}"
                    </blockquote>
                    
                    <div className="flex justify-center mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join {referralData.referrerName} and thousands of successful traders on Nexural
            </p>
            
            <div className="max-w-md mx-auto space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-black font-bold py-6 text-xl"
                asChild
              >
                <Link href={`/register?ref=${referralCode}&source=${source || 'referral'}`}>
                  <Trophy className="w-6 h-6 mr-3" />
                  Claim ${referralData.bonusAmount} Bonus Now
                  <Sparkles className="w-6 h-6 ml-3" />
                </Link>
              </Button>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant Setup</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


