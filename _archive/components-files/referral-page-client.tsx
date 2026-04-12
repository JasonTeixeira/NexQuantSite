"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, Users, DollarSign, TrendingUp, Star, Copy, Check, Share2, Award, Target, Zap, Crown, Trophy, Rocket, Shield, Heart, MessageSquare, Calendar, BarChart3, ArrowRight, ExternalLink, Download, Mail, Twitter, Linkedin, Facebook } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Referral tier data
const referralTiers = [
  {
    name: "Starter",
    icon: Users,
    minReferrals: 0,
    maxReferrals: 4,
    commission: 15,
    bonuses: ["Welcome bonus: $50", "Monthly newsletter", "Basic support"],
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30"
  },
  {
    name: "Bronze",
    icon: Award,
    minReferrals: 5,
    maxReferrals: 14,
    commission: 20,
    bonuses: ["Tier bonus: $200", "Priority support", "Exclusive webinars", "Performance analytics"],
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30"
  },
  {
    name: "Silver",
    icon: Star,
    minReferrals: 15,
    maxReferrals: 29,
    commission: 25,
    bonuses: ["Tier bonus: $500", "Dedicated account manager", "Advanced analytics", "Custom landing pages"],
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30"
  },
  {
    name: "Gold",
    icon: Trophy,
    minReferrals: 30,
    maxReferrals: 49,
    commission: 30,
    bonuses: ["Tier bonus: $1,000", "VIP support", "Co-marketing opportunities", "Higher payouts"],
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30"
  },
  {
    name: "Platinum",
    icon: Crown,
    minReferrals: 50,
    maxReferrals: 99,
    commission: 35,
    bonuses: ["Tier bonus: $2,500", "Personal success manager", "Custom commission rates", "Exclusive events"],
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  {
    name: "Diamond",
    icon: Zap,
    minReferrals: 100,
    maxReferrals: null,
    commission: 40,
    bonuses: ["Tier bonus: $5,000", "Partnership opportunities", "Revenue sharing", "Board advisory role"],
    color: "from-primary to-green-400",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30"
  }
]

// Top performers data
const topPerformers = [
  {
    rank: 1,
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    referrals: 247,
    earnings: 89420,
    tier: "Diamond",
    growth: "+23%"
  },
  {
    rank: 2,
    name: "Marcus Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    referrals: 189,
    earnings: 67340,
    tier: "Diamond",
    growth: "+18%"
  },
  {
    rank: 3,
    name: "Emily Watson",
    avatar: "/placeholder.svg?height=40&width=40",
    referrals: 156,
    earnings: 54230,
    tier: "Diamond",
    growth: "+31%"
  },
  {
    rank: 4,
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    referrals: 134,
    earnings: 47890,
    tier: "Diamond",
    growth: "+15%"
  },
  {
    rank: 5,
    name: "Lisa Thompson",
    avatar: "/placeholder.svg?height=40&width=40",
    referrals: 98,
    earnings: 34560,
    tier: "Platinum",
    growth: "+27%"
  }
]

// Success stories
const successStories = [
  {
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=60&width=60",
    title: "Full-time Affiliate Marketer",
    story: "Started with NEXURAL 8 months ago and now earning $15K+ monthly. The platform's conversion rates are incredible!",
    earnings: "$127,000",
    timeframe: "8 months",
    tier: "Diamond"
  },
  {
    name: "Maria Garcia",
    avatar: "/placeholder.svg?height=60&width=60",
    title: "Trading Educator",
    story: "As a trading educator, NEXURAL's tools perfectly complement my courses. My students love the platform!",
    earnings: "$89,000",
    timeframe: "1 year",
    tier: "Platinum"
  },
  {
    name: "James Wilson",
    avatar: "/placeholder.svg?height=60&width=60",
    title: "Financial Blogger",
    story: "Integrated NEXURAL into my blog content strategy. The passive income has been life-changing!",
    earnings: "$56,000",
    timeframe: "6 months",
    tier: "Gold"
  }
]

// Marketing materials
const marketingMaterials = [
  {
    type: "Banner Ads",
    count: 12,
    formats: ["728x90", "300x250", "160x600"],
    description: "High-converting banner ads for websites and blogs"
  },
  {
    type: "Email Templates",
    count: 8,
    formats: ["HTML", "Plain Text"],
    description: "Professional email templates for your campaigns"
  },
  {
    type: "Social Media",
    count: 24,
    formats: ["Instagram", "Twitter", "LinkedIn", "Facebook"],
    description: "Ready-to-post social media content and graphics"
  },
  {
    type: "Landing Pages",
    count: 6,
    formats: ["Desktop", "Mobile"],
    description: "Optimized landing pages with high conversion rates"
  },
  {
    type: "Video Content",
    count: 4,
    formats: ["MP4", "GIF"],
    description: "Engaging video content for social media and ads"
  },
  {
    type: "Case Studies",
    count: 10,
    formats: ["PDF", "Web"],
    description: "Detailed case studies showcasing platform success"
  }
]

export default function ReferralPageClient() {
  const [currentTier, setCurrentTier] = useState(0)
  const [referralCount, setReferralCount] = useState(12)
  const [referralCode, setReferralCode] = useState("NEXURAL-REF-2024")
  const [copied, setCopied] = useState(false)
  const [selectedTab, setSelectedTab] = useState("overview")

  // Calculate current tier based on referral count
  useEffect(() => {
    const tier = referralTiers.findIndex(tier => 
      referralCount >= tier.minReferrals && 
      (tier.maxReferrals === null || referralCount <= tier.maxReferrals)
    )
    setCurrentTier(tier >= 0 ? tier : 0)
  }, [referralCount])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://nexural.com/signup?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnSocial = (platform: string) => {
    const url = `https://nexural.com/signup?ref=${referralCode}`
    const text = "Join me on NEXURAL - the world's most advanced AI trading platform!"
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    }
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.1),transparent_50%)]" />
        
        {/* Floating elements */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge
                variant="outline"
                className="mb-6 px-6 py-3 text-sm font-mono border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Gift className="w-4 h-4 mr-2" />
                REFERRAL PROGRAM
              </Badge>

              <h1 className="text-6xl md:text-8xl font-bold mb-8 font-mono leading-tight">
                <span className="text-white">EARN</span>{" "}
                <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
                  WHILE YOU SHARE
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
                Join our exclusive referral program and earn up to <span className="text-primary font-bold">40% commission</span> 
                for every successful referral. Turn your network into a passive income stream with NEXURAL's 
                industry-leading conversion rates.
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-2">40%</div>
                  <div className="text-sm text-gray-400">Max Commission</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-green-400 mb-2">$2.5M+</div>
                  <div className="text-sm text-gray-400">Paid Out</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-blue-400 mb-2">5,000+</div>
                  <div className="text-sm text-gray-400">Active Affiliates</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-purple-400 mb-2">23%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold px-8 py-4 text-lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Join Program Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary px-8 py-4 text-lg bg-transparent"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Earnings Calculator
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2 mb-12">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Target className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="tiers" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Crown className="w-4 h-4 mr-2" />
                  Tiers
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-16">
                {/* How It Works */}
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto mb-12">
                    Start earning in three simple steps. Our streamlined process makes it easy to begin generating passive income.
                  </p>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        step: "01",
                        title: "Sign Up",
                        description: "Create your affiliate account and get your unique referral link instantly.",
                        icon: Users
                      },
                      {
                        step: "02", 
                        title: "Share & Promote",
                        description: "Share your link using our marketing materials and proven strategies.",
                        icon: Share2
                      },
                      {
                        step: "03",
                        title: "Earn Commissions",
                        description: "Get paid up to 40% commission for every successful referral that converts.",
                        icon: DollarSign
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.6 }}
                        className="relative"
                      >
                        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-primary/50 transition-all duration-300 h-full">
                          <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <item.icon className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-6xl font-bold text-gray-800 mb-4">{item.step}</div>
                            <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{item.description}</p>
                          </CardContent>
                        </Card>
                        {index < 2 && (
                          <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                            <ArrowRight className="w-8 h-8 text-primary/50" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Success Stories */}
                <div>
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-6">Success Stories</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                      Real stories from our top-performing affiliates who have built substantial passive income streams.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {successStories.map((story, index) => (
                      <motion.div
                        key={story.name}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-primary/50 transition-all duration-300 h-full">
                          <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src={story.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary/20 text-primary text-lg">
                                  {story.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-bold text-white">{story.name}</h3>
                                <p className="text-gray-400 text-sm">{story.title}</p>
                                <Badge className="mt-1 bg-primary/20 text-primary border-primary/30">
                                  {story.tier}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed">"{story.story}"</p>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-2xl font-bold text-primary">{story.earnings}</div>
                                <div className="text-sm text-gray-400">in {story.timeframe}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Tier</div>
                                <div className="text-lg font-semibold text-white">{story.tier}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tiers Tab */}
              <TabsContent value="tiers" className="space-y-12" id="tiers">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-6">Commission Tiers</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Advance through our tier system to unlock higher commission rates and exclusive benefits.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {referralTiers.map((tier, index) => (
                    <motion.div
                      key={tier.name}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className={`relative ${index === currentTier ? 'ring-2 ring-primary' : ''}`}
                    >
                      <Card className={`bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-primary/50 transition-all duration-300 h-full ${
                        index === currentTier ? 'border-primary/50 shadow-lg shadow-primary/20' : ''
                      }`}>
                        <CardHeader className="text-center pb-4">
                          {index === currentTier && (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-black">
                              Current Tier
                            </Badge>
                          )}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r ${tier.color}`}>
                            <tier.icon className="w-8 h-8 text-white" />
                          </div>
                          <CardTitle className="text-2xl font-bold text-white mb-2">{tier.name}</CardTitle>
                          <div className="text-4xl font-bold text-primary mb-2">{tier.commission}%</div>
                          <p className="text-gray-400 text-sm">
                            {tier.minReferrals} - {tier.maxReferrals || '∞'} referrals
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-white font-semibold mb-3">Benefits:</h4>
                            <ul className="space-y-2">
                              {tier.bonuses.map((bonus, idx) => (
                                <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  {bonus}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {index === currentTier && (
                            <div className="pt-4 border-t border-gray-800">
                              <div className="text-sm text-gray-400 mb-2">
                                Progress to {referralTiers[index + 1]?.name || 'Max Tier'}
                              </div>
                              <Progress 
                                value={referralTiers[index + 1] ? 
                                  ((referralCount - tier.minReferrals) / (referralTiers[index + 1].minReferrals - tier.minReferrals)) * 100 
                                  : 100
                                } 
                                className="h-2"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {referralCount} / {referralTiers[index + 1]?.minReferrals || '∞'} referrals
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-6">Your Referral Dashboard</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Track your performance, manage your referrals, and optimize your earning potential.
                  </p>
                </div>

                {/* Referral Link Section */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-primary" />
                      Your Referral Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={`https://nexural.com/signup?ref=${referralCode}`}
                        readOnly
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Button
                        onClick={copyReferralCode}
                        className="bg-primary text-black hover:bg-primary/90"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareOnSocial('twitter')}
                        className="border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareOnSocial('linkedin')}
                        className="border-gray-700 text-gray-300 hover:border-blue-600 hover:text-blue-400"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareOnSocial('facebook')}
                        className="border-gray-700 text-gray-300 hover:border-blue-700 hover:text-blue-400"
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">{referralCount}</div>
                      <div className="text-sm text-gray-400">Total Referrals</div>
                      <div className="text-xs text-green-400 mt-1">+3 this month</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                    <CardContent className="p-6 text-center">
                      <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">$4,250</div>
                      <div className="text-sm text-gray-400">Total Earnings</div>
                      <div className="text-xs text-green-400 mt-1">+$680 this month</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">18.5%</div>
                      <div className="text-sm text-gray-400">Conversion Rate</div>
                      <div className="text-xs text-green-400 mt-1">+2.3% vs avg</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                    <CardContent className="p-6 text-center">
                      <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">{referralTiers[currentTier].name}</div>
                      <div className="text-sm text-gray-400">Current Tier</div>
                      <div className="text-xs text-primary mt-1">{referralTiers[currentTier].commission}% commission</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: "referral", user: "john.doe@email.com", amount: "$150", time: "2 hours ago" },
                        { type: "signup", user: "sarah.smith@email.com", amount: "Pending", time: "1 day ago" },
                        { type: "referral", user: "mike.wilson@email.com", amount: "$200", time: "3 days ago" },
                        { type: "tier", user: "You advanced to Bronze tier!", amount: "+$200 bonus", time: "1 week ago" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'referral' ? 'bg-green-400' : 
                              activity.type === 'signup' ? 'bg-yellow-400' : 
                              activity.type === 'tier' ? 'bg-primary' : 'bg-gray-400'
                            }`} />
                            <div>
                              <div className="text-white text-sm">{activity.user}</div>
                              <div className="text-gray-400 text-xs">{activity.time}</div>
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${
                            activity.amount.includes('$') && !activity.amount.includes('Pending') ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {activity.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-6">Marketing Resources</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Access our comprehensive library of marketing materials designed to maximize your conversion rates.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {marketingMaterials.map((material, index) => (
                    <motion.div
                      key={material.type}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-primary/50 transition-all duration-300 h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-white">{material.type}</CardTitle>
                            <Badge variant="outline" className="border-primary/50 text-primary">
                              {material.count} items
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-400 text-sm">{material.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {material.formats.map((format) => (
                              <Badge key={format} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                                {format}
                              </Badge>
                            ))}
                          </div>
                          <Button className="w-full bg-primary text-black hover:bg-primary/90">
                            <Download className="w-4 h-4 mr-2" />
                            Download Pack
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Best Practices */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Best Practices & Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-white font-semibold mb-4">Content Strategy</h4>
                        <ul className="space-y-2">
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Focus on educational content about trading
                          </li>
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Share success stories and case studies
                          </li>
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Use video content for higher engagement
                          </li>
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Highlight platform's unique AI features
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-4">Optimization Tips</h4>
                        <ul className="space-y-2">
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            A/B test different landing pages
                          </li>
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Track conversion rates by traffic source
                          </li>
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Use retargeting for warm audiences
                          </li>
                          <li className="text-gray-300 text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            Leverage social proof and testimonials
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-6">Top Performers</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    See how you stack up against our top-performing affiliates and get inspired by their success.
                  </p>
                </div>

                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Monthly Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPerformers.map((performer, index) => (
                        <motion.div
                          key={performer.rank}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1, duration: 0.6 }}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index < 3 ? 'bg-gradient-to-r from-primary/10 to-transparent border border-primary/20' : 'bg-gray-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              index === 2 ? 'bg-orange-500 text-black' :
                              'bg-gray-700 text-white'
                            }`}>
                              {performer.rank}
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={performer.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {performer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white font-semibold">{performer.name}</div>
                              <div className="text-gray-400 text-sm">{performer.referrals} referrals</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">${performer.earnings.toLocaleString()}</div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                {performer.tier}
                              </Badge>
                              <span className="text-green-400 text-xs">{performer.growth}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Your Ranking */}
                <Card className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">#47</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">Your Current Ranking</div>
                          <div className="text-gray-400 text-sm">Keep climbing to unlock better rewards!</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">$4,250</div>
                        <div className="text-gray-400 text-sm">Total Earnings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-mono">
                  Ready to Start Earning?
                </h2>
                <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of successful affiliates who are already earning substantial passive income 
                  with NEXURAL's industry-leading referral program. Start your journey today!
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Reliable Payouts</h3>
                    <p className="text-gray-400 text-sm">Monthly payments, always on time</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Dedicated Support</h3>
                    <p className="text-gray-400 text-sm">Personal affiliate manager assigned</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Fast Growth</h3>
                    <p className="text-gray-400 text-sm">Scale your earnings quickly</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold px-10 py-4 text-lg">
                    <Gift className="w-5 h-5 mr-2" />
                    Join Program Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:border-primary/50 hover:text-primary px-10 py-4 text-lg bg-transparent"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                  <p>✓ No joining fees • ✓ Instant approval • ✓ 24/7 affiliate support</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
