"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Crown,
  Star,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Target,
  Award,
  BarChart3,
  Clock,
  Percent,
  Calculator,
  Share2,
  Globe,
  Smartphone,
  CreditCard,
  RefreshCw,
  Mail,
  MessageSquare,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Copy,
  ExternalLink,
  AlertCircle,
  Info,
  Sparkles,
  Trophy,
  Rocket,
  Heart,
  ThumbsUp,
  Eye,
  Play,
  Calendar,
  Map,
  Phone
} from "lucide-react"

const tierStructure = [
  {
    tier: "Bronze",
    minReferrals: 0,
    commission: 25,
    bonusMultiplier: 1.0,
    color: "text-amber-600",
    bgColor: "from-amber-900/20 to-orange-900/20",
    borderColor: "border-amber-600",
    features: [
      "25% commission on all referrals",
      "$25 signup bonus per referral",
      "Basic referral tracking",
      "Email support"
    ]
  },
  {
    tier: "Silver",
    minReferrals: 10,
    commission: 30,
    bonusMultiplier: 1.1,
    color: "text-gray-300",
    bgColor: "from-gray-700/20 to-gray-600/20", 
    borderColor: "border-gray-500",
    features: [
      "30% commission on all referrals",
      "1.1x bonus multiplier",
      "Advanced analytics dashboard",
      "Priority email support",
      "Custom referral materials"
    ]
  },
  {
    tier: "Gold",
    minReferrals: 25,
    commission: 35,
    bonusMultiplier: 1.25,
    color: "text-amber-400",
    bgColor: "from-amber-800/20 to-yellow-800/20",
    borderColor: "border-amber-500",
    features: [
      "35% commission on all referrals",
      "1.25x bonus multiplier",
      "Dedicated account manager",
      "Custom landing pages",
      "Live chat support",
      "Monthly performance reviews"
    ],
    popular: true
  },
  {
    tier: "Platinum", 
    minReferrals: 50,
    commission: 40,
    bonusMultiplier: 1.5,
    color: "text-purple-400",
    bgColor: "from-purple-900/20 to-pink-900/20",
    borderColor: "border-purple-500",
    features: [
      "40% commission on all referrals",
      "1.5x bonus multiplier",
      "White-label solutions",
      "API access for integration",
      "Phone support",
      "Quarterly business reviews",
      "Co-marketing opportunities"
    ]
  },
  {
    tier: "Diamond",
    minReferrals: 100,
    commission: 50,
    bonusMultiplier: 2.0,
    color: "text-cyan-400",
    bgColor: "from-cyan-900/20 to-blue-900/20",
    borderColor: "border-cyan-500",
    features: [
      "50% commission on all referrals",
      "2x bonus multiplier",
      "Enterprise partnership program",
      "Revenue sharing opportunities",
      "24/7 dedicated support",
      "Annual partner summit",
      "Exclusive beta access",
      "Custom integration support"
    ]
  }
]

const howItWorksSteps = [
  {
    step: 1,
    title: "Sign Up",
    description: "Create your free Nexural Trading account and access your unique referral link",
    icon: Users
  },
  {
    step: 2, 
    title: "Share Your Link",
    description: "Share your referral link via social media, email, or direct messaging",
    icon: Share2
  },
  {
    step: 3,
    title: "Friends Sign Up",
    description: "Your referrals create accounts and start trading on our platform",
    icon: UserCheck
  },
  {
    step: 4,
    title: "Earn Commissions",
    description: "Get paid instantly when your referrals trade, with monthly bonus payouts",
    icon: DollarSign
  }
]

const successStories = [
  {
    name: "Sarah Martinez",
    username: "crypto_sarah",
    avatar: "",
    tier: "Platinum",
    monthlyEarnings: 4250,
    totalReferrals: 127,
    joinDate: "March 2023",
    testimonial: "The Nexural referral program has become my primary source of passive income. The commission structure is generous and the support team is incredible.",
    growth: "+340% in 6 months"
  },
  {
    name: "David Kim", 
    username: "trading_david",
    avatar: "",
    tier: "Gold",
    monthlyEarnings: 2890,
    totalReferrals: 89,
    joinDate: "June 2023", 
    testimonial: "I love how easy it is to track my referrals and earnings. The platform provides everything I need to build a successful referral business.",
    growth: "+280% in 4 months"
  },
  {
    name: "Emma Rodriguez",
    username: "fintech_emma", 
    avatar: "",
    tier: "Silver",
    monthlyEarnings: 1650,
    totalReferrals: 45,
    joinDate: "September 2023",
    testimonial: "Started as a hobby but now it's serious income. The automated payouts and detailed analytics make everything so professional.",
    growth: "+190% in 3 months"
  }
]

const faqData = [
  {
    question: "How much can I earn per referral?",
    answer: "You earn a percentage of the trading fees generated by your referrals, ranging from 25% to 50% depending on your tier. Additionally, you get a signup bonus of $25-$50 for each successful referral."
  },
  {
    question: "When do I get paid?",
    answer: "Commission payments are made monthly via bank transfer, PayPal, or cryptocurrency. Signup bonuses are paid instantly once your referral completes account verification."
  },
  {
    question: "Is there a limit to how much I can earn?",
    answer: "No limits! Your earning potential scales with the number and activity level of your referrals. Our top affiliates earn over $10,000 monthly."
  },
  {
    question: "How do I track my referrals?",
    answer: "Your referral dashboard provides real-time tracking of clicks, signups, active referrals, and earnings. You can see detailed analytics and performance metrics."
  },
  {
    question: "What marketing materials do you provide?",
    answer: "We provide banners, landing pages, email templates, and social media content. Higher tier members get access to custom materials and white-label solutions."
  },
  {
    question: "Can I refer myself or use misleading tactics?",
    answer: "No. Self-referrals, fake accounts, and misleading advertising are prohibited. We monitor for fraudulent activity and maintain high program integrity."
  },
  {
    question: "How long do referrals remain active?",
    answer: "Referrals remain active for lifetime as long as they continue trading on our platform. You'll continue earning from their trading activity indefinitely."
  },
  {
    question: "What support do you provide to affiliates?",
    answer: "All affiliates get access to email support, marketing resources, and analytics. Higher tiers receive dedicated account managers and priority support."
  }
]

function UserCheck(props: any) {
  return <Users {...props} />
}

export default function ReferralProgramClient() {
  const [selectedTier, setSelectedTier] = useState('Gold')
  const [calculatorReferrals, setCalculatorReferrals] = useState(25)
  const [calculatorAvgDeposit, setCalculatorAvgDeposit] = useState(2500)
  
  const selectedTierData = tierStructure.find(t => t.tier === selectedTier) || tierStructure[2]
  
  // Calculate potential earnings
  const avgMonthlyVolume = calculatorAvgDeposit * 0.1 // Assume 10% monthly trading volume  
  const platformFee = avgMonthlyVolume * 0.002 // 0.2% platform fee
  const monthlyCommission = platformFee * (selectedTierData.commission / 100) * calculatorReferrals
  const signupBonus = calculatorReferrals * 25 * selectedTierData.bonusMultiplier
  const totalMonthly = monthlyCommission + signupBonus / 12 // Amortize signup bonus over year

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-amber-600">Affiliate Program</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Earn Up To <span className="text-amber-400">50%</span> Commissions
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Join thousands of successful affiliates earning passive income by referring traders to Nexural's 
              AI-powered trading platform. Industry-leading payouts and lifetime commissions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-black font-bold" asChild>
                <Link href="/register">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Earning Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#calculator">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Earnings
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <Card className="bg-gray-900/50 border-gray-800 text-center">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">$2.1M+</div>
                <div className="text-sm text-gray-400">Paid to Affiliates</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800 text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">5,000+</div>
                <div className="text-sm text-gray-400">Active Affiliates</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800 text-center">
              <CardContent className="p-6">
                <Percent className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">50%</div>
                <div className="text-sm text-gray-400">Max Commission</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800 text-center">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">24h</div>
                <div className="text-sm text-gray-400">Payout Time</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Commission Tiers */}
      <div className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Commission <span className="text-amber-400">Tiers</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Advance through our tier system to unlock higher commission rates, 
              exclusive benefits, and personalized support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tierStructure.map((tier, index) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full bg-gradient-to-br ${tier.bgColor} border ${tier.borderColor} hover:scale-105 transition-transform ${tier.popular ? 'ring-2 ring-amber-500' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-amber-600 text-black font-bold">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-6 text-center">
                    <div className={`text-2xl font-bold ${tier.color} mb-2`}>
                      {tier.tier}
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white">{tier.commission}%</div>
                      <div className="text-sm text-gray-400">Commission Rate</div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-lg font-semibold text-amber-400">
                        {tier.bonusMultiplier}x
                      </div>
                      <div className="text-xs text-gray-400">Bonus Multiplier</div>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-6">
                      {tier.minReferrals === 0 ? 'No minimum' : `${tier.minReferrals}+ referrals`}
                    </div>
                    
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How It <span className="text-cyan-400">Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Start earning in 4 simple steps. Our streamlined process makes it easy 
              to begin building your passive income stream today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">{step.step}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Earnings Calculator */}
      <div id="calculator" className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Earnings <span className="text-green-400">Calculator</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See your potential monthly earnings based on the number of referrals 
              and their average account activity.
            </p>
          </motion.div>

          <Card className="bg-gray-900 border-gray-800 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Number of Referrals: {calculatorReferrals}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={calculatorReferrals}
                      onChange={(e) => setCalculatorReferrals(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Average Account Size: ${calculatorAvgDeposit.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="500"
                      value={calculatorAvgDeposit}
                      onChange={(e) => setCalculatorAvgDeposit(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>$500</span>
                      <span>$10,000</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">Commission Tier</label>
                    <div className="grid grid-cols-5 gap-2">
                      {tierStructure.map((tier) => (
                        <button
                          key={tier.tier}
                          onClick={() => setSelectedTier(tier.tier)}
                          className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                            selectedTier === tier.tier
                              ? `${tier.color} bg-gray-800 border border-gray-600`
                              : 'text-gray-400 bg-gray-800/50 hover:bg-gray-800'
                          }`}
                        >
                          {tier.tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      ${Math.round(totalMonthly).toLocaleString()}
                    </div>
                    <div className="text-lg text-green-300 mb-4">Estimated Monthly Earnings</div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-black/20 p-3 rounded">
                        <div className="text-white font-semibold">${Math.round(monthlyCommission).toLocaleString()}</div>
                        <div className="text-green-400">Trading Commissions</div>
                      </div>
                      <div className="bg-black/20 p-3 rounded">
                        <div className="text-white font-semibold">${Math.round(signupBonus).toLocaleString()}</div>
                        <div className="text-amber-400">Signup Bonuses</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      ${Math.round(totalMonthly * 12).toLocaleString()}
                    </div>
                    <div className="text-gray-400">Annual Potential</div>
                  </div>
                  
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <Info className="w-5 h-5" />
                      <span className="font-semibold">Selected Tier: {selectedTier}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {selectedTierData.commission}% commission rate • {selectedTierData.bonusMultiplier}x bonus multiplier
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" size="lg" asChild>
                    <Link href="/register">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Start Earning These Commissions
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Success <span className="text-purple-400">Stories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See how our top affiliates are building substantial passive income 
              streams with our referral program.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900 border-gray-800 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-purple-600 text-lg">
                          {story.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white text-lg">{story.name}</div>
                        <div className="text-gray-400">@{story.username}</div>
                        <Badge className="bg-purple-600 mt-1">{story.tier} Member</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-800">
                        <div className="text-2xl font-bold text-green-400">
                          ${story.monthlyEarnings.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">Monthly Earnings</div>
                      </div>
                      <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                        <div className="text-2xl font-bold text-blue-400">
                          {story.totalReferrals}
                        </div>
                        <div className="text-xs text-gray-400">Total Referrals</div>
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-300 italic mb-4">
                      "{story.testimonial}"
                    </blockquote>
                    
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Joined {story.joinDate}</span>
                      <Badge className="bg-amber-600">{story.growth}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get answers to common questions about our referral program, 
              commissions, and how to maximize your earnings.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqData.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem value={`item-${index}`} className="bg-gray-900 border border-gray-800 rounded-lg px-6">
                    <AccordionTrigger className="text-white hover:text-cyan-400 text-left py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-cyan-900/30 to-blue-900/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start <span className="text-amber-400">Earning?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Join thousands of successful affiliates who are building passive income 
              with our industry-leading referral program.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-black font-bold" asChild>
                <Link href="/register">
                  <Trophy className="w-5 h-5 mr-2" />
                  Start Earning Today
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/referrals">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Dashboard
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure Payouts</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Instant Setup</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


