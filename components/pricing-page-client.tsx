"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Users,
  Bot,
  Zap,
  TrendingUp,
  Shield,
  Brain,
  Database,
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
  Target,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function PricingPageClient() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const plans = [
    {
      id: "community",
      name: "Discord Community",
      price: "Free",
      pricePeriod: "",
      icon: Users,
      description: "Perfect for beginners exploring quantitative trading",
      features: [
        "Community Access",
        "General Chat Channels",
        "Weekly Market Outlook",
        "Basic Educational Content",
        "Limited Support",
        "Market News & Updates",
        "Trading Fundamentals",
        "Beginner Resources",
      ],
      buttonText: "Join for Free",
      popular: false,
      status: "available",
      color: "from-blue-500/10 via-blue-400/5 to-cyan-500/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      buttonStyle:
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25",
      glowColor: "shadow-blue-500/20",
      accentColor: "bg-blue-500/20",
    },
    {
      id: "pro",
      name: "Signals Pro",
      price: "$55",
      pricePeriod: "/month",
      icon: Bot,
      description: "Advanced signals and indicators for serious traders",
      features: [
        "Everything in Community",
        "All Bot Signals (Q,R,X,O,Z)",
        "All Indicator Signals",
        "Real-time Alerts & Notifications",
        "Priority Support",
        "Exclusive Pro Channels",
        "Advanced Analytics Dashboard",
        "Strategy Performance Metrics",
        "Custom Alert Settings",
        "Mobile App Access",
      ],
      buttonText: "Get Signals Pro",
      popular: true,
      status: "available",
      color: "from-primary/15 via-emerald-500/10 to-primary/15",
      borderColor: "border-primary",
      iconColor: "text-primary",
      buttonStyle:
        "bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary text-black font-bold shadow-lg shadow-primary/30",
      glowColor: "shadow-primary/30",
      accentColor: "bg-primary/20",
    },
    {
      id: "automation",
      name: "Full Automation",
      price: "$100",
      pricePeriod: "/month",
      icon: Zap,
      description: "Complete algorithmic trading automation suite",
      features: [
        "Everything in Pro",
        "Full Trade Automation",
        "API Access & Integration",
        "Custom Strategy Builder",
        "Advanced Portfolio Management",
        "Sophisticated Risk Controls",
        "1-on-1 Onboarding Session",
        "Dedicated Account Manager",
        "White-glove Support",
        "Custom Indicator Development",
      ],
      buttonText: "Get Notified",
      popular: false,
      status: "Coming Soon",
      color: "from-yellow-500/10 via-orange-400/5 to-yellow-500/10",
      borderColor: "border-yellow-500/40",
      iconColor: "text-yellow-400",
      buttonStyle:
        "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-orange-600 hover:to-yellow-600 text-black font-bold shadow-lg shadow-yellow-500/25",
      glowColor: "shadow-yellow-500/20",
      accentColor: "bg-yellow-500/20",
    },
  ]

  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description:
        "Real-time market analysis with institutional-grade performance tracking and comprehensive reporting",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Sophisticated risk controls, position sizing algorithms, and portfolio protection mechanisms",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Brain,
      title: "AI-Powered Signals",
      description: "Machine learning algorithms trained on vast datasets for superior signal generation and accuracy",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Database,
      title: "Premium Data",
      description: "Access to institutional-grade market data, alternative datasets, and real-time market feeds",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ]

  const stats = [
    { icon: Target, value: "95%", label: "Signal Accuracy", color: "text-primary" },
    { icon: TrendingUp, value: "2.3x", label: "Avg Returns", color: "text-blue-400" },
    { icon: Shield, value: "0.12", label: "Max Drawdown", color: "text-green-400" },
    { icon: Award, value: "10k+", label: "Active Traders", color: "text-yellow-400" },
  ]

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-blue-500/3" />
        <motion.div
          className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 3, repeat: 9999 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 4, repeat: 9999, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ duration: 5, repeat: 9999, delay: 2 }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/15 to-emerald-500/15 border border-primary/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary font-mono text-sm font-semibold tracking-wider">
                PROFESSIONAL TRADING EDUCATION
              </span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-8 font-mono leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Edge</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Flexible plans designed for every type of quantitative trader. From community access to full automation
              solutions.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group cursor-pointer"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon
                    className={`w-8 h-8 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform`}
                  />

                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className={`bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 rounded-xl p-8 h-full backdrop-blur-sm transition-all duration-500 ${hoveredFeature === index ? "border-primary/50 shadow-xl shadow-primary/10" : ""}`}
                >
                  <motion.div
                    className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300`}
                    animate={hoveredFeature === index ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </motion.div>
                  <h3 className="text-white font-bold text-xl mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`relative group h-full ${plan.popular ? "pt-8" : ""} ${plan.status === "Coming Soon" ? "pt-8" : ""}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                whileHover={{
                  y: -20,
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
              >
                {/* Popular Badge */}
                <AnimatePresence>
                  {plan.popular && (
                    <motion.div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge className="bg-gradient-to-r from-primary to-emerald-400 text-black font-bold px-4 py-2 text-sm shadow-xl border-0 whitespace-nowrap">
                        <Star className="w-3 h-3 mr-1" />
                        MOST POPULAR
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Coming Soon Badge */}
                {plan.status === "Coming Soon" && (
                  <motion.div
                    className="absolute -top-3 right-4 z-20"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: 9999 }}
                  >
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold uppercase px-3 py-1.5 shadow-xl border-0 whitespace-nowrap">
                      Coming Soon
                    </Badge>
                  </motion.div>
                )}

                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${plan.glowColor}`}
                  style={{
                    background: `linear-gradient(135deg, ${plan.borderColor.replace("border-", "").replace("/30", "/20")}, transparent)`,
                  }}
                />

                <Card
                  className={`h-full bg-gradient-to-br ${plan.color} border-2 ${plan.borderColor} rounded-2xl transition-all duration-500 backdrop-blur-sm relative overflow-hidden ${plan.popular ? "shadow-2xl shadow-primary/25" : ""}`}
                >
                  {/* Decorative Corner */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 ${plan.accentColor} rounded-full blur-3xl opacity-20 -translate-y-16 translate-x-16`}
                  />

                  <CardHeader className="pb-8 relative pt-8">
                    <div className="flex items-center gap-6 mb-6">
                      <motion.div
                        className="relative"
                        animate={
                          hoveredPlan === plan.id
                            ? {
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1],
                              }
                            : {}
                        }
                        transition={{ duration: 0.8 }}
                      >
                        <div
                          className={`p-4 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 shadow-lg`}
                        >
                          <plan.icon className={`w-10 h-10 ${plan.iconColor}`} />
                        </div>
                        {hoveredPlan === plan.id && (
                          <motion.div
                            className={`absolute inset-0 rounded-xl blur-md ${plan.accentColor} opacity-50`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </motion.div>

                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold text-white font-mono mb-2">{plan.name}</CardTitle>
                        <CardDescription className="text-gray-300 text-base leading-relaxed">
                          {plan.description}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <motion.span className="text-6xl font-bold text-white font-mono" whileHover={{ scale: 1.05 }}>
                        {plan.price}
                      </motion.span>
                      {plan.pricePeriod && (
                        <span className="text-xl text-gray-400 font-medium">{plan.pricePeriod}</span>
                      )}
                    </div>

                    {plan.price !== "Free" && <p className="text-gray-400 text-sm">Billed monthly • Cancel anytime</p>}
                  </CardHeader>

                  <CardContent className="flex-grow flex flex-col relative">
                    <ul className="space-y-4 flex-grow mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-start gap-4 group/item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + featureIndex * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <motion.div
                            className="flex-shrink-0 mt-0.5"
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Check className="w-5 h-5 text-primary" />
                          </motion.div>
                          <span className="text-gray-300 group-hover/item:text-white transition-colors leading-relaxed">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div className="relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className={`w-full ${plan.buttonStyle} py-6 text-lg font-bold transition-all duration-300 group/btn relative overflow-hidden`}
                        disabled={plan.status === "Coming Soon"}
                        onClick={() => {
                          if (plan.id === "community") {
                            window.open("https://discord.gg/nexural", "_blank")
                          } else if (plan.id === "pro") {
                            window.location.href = "/checkout?plan=pro"
                          } else if (plan.id === "automation") {
                            window.location.href = "/checkout?plan=automation"
                          }
                        }}
                      >
                        <motion.div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {plan.buttonText}
                          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: 9999 }}>
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-gray-900/30 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6 font-mono">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about our pricing plans and services
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "Can I upgrade or downgrade my plan anytime?",
                answer:
                  "Yes, you can change your plan at any time through your account dashboard. Upgrades take effect immediately with prorated billing, while downgrades take effect at the next billing cycle to ensure you get full value from your current plan.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and select cryptocurrency payments including Bitcoin and Ethereum for maximum flexibility and security.",
              },
              {
                question: "Is there a free trial for paid plans?",
                answer:
                  "Yes! We offer a 7-day free trial for the Signals Pro plan with full access to all features. The upcoming Automation plan will include a 14-day trial when it launches, giving you ample time to test our advanced features.",
              },
              {
                question: "Do you offer refunds?",
                answer:
                  "Absolutely. We offer a 30-day money-back guarantee for all paid plans. If you're not completely satisfied with our service, contact our support team for a full refund, no questions asked.",
              },
              {
                question: "How do the trading signals work?",
                answer:
                  "Our AI-powered signals are generated using advanced machine learning algorithms trained on vast historical datasets. Signals are delivered in real-time through Discord, mobile notifications, and our web platform with detailed entry/exit points and risk parameters.",
              },
              {
                question: "Is my trading data secure?",
                answer:
                  "Security is our top priority. We use bank-grade encryption, never store your exchange API keys with trading permissions, and all data is processed through secure, compliant infrastructure. Your trading strategies and performance data remain completely private.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -2, scale: 1.01 }}
              >
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm group-hover:shadow-lg group-hover:shadow-primary/10">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mt-1"
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-xl mb-4 group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
