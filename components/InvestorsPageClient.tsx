"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  TrendingUp,
  Users,
  Globe,
  DollarSign,
  BarChart3,
  Zap,
  Target,
  Shield,
  Award,
  Brain,
  Rocket,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  FileText,
  ExternalLink,
  ArrowUp,
  ChevronRight,
  Star,
  CheckCircle,
  Briefcase,
  PieChart,
  TrendingDown,
  Activity,
  Eye,
  Lock,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Client-side background animation to avoid hydration issues
function InvestorBackground() {
  const [particles, setParticles] = useState<Array<{
    x: number
    y: number
    size: number
    duration: number
    delay: number
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,255,102,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)]" />
      
      {/* Animated Particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  )
}

export default function InvestorsPageClient() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    title: "",
    investmentSize: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setShowContactDialog(false)
    setContactForm({
      name: "",
      email: "",
      company: "",
      title: "",
      investmentSize: "",
      message: ""
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const marketData = [
    { label: "Global Algo Trading Market", value: "$18.8B", growth: "+11.1% CAGR", color: "text-green-400" },
    { label: "Retail Trading Volume", value: "$74T", growth: "+35% YoY", color: "text-blue-400" },
    { label: "AI in Finance Market", value: "$22.3B", growth: "+23.8% CAGR", color: "text-purple-400" },
    { label: "Addressable Market (TAM)", value: "$2.1T", growth: "Total Opportunity", color: "text-primary" }
  ]

  const financialMetrics = [
    { label: "Monthly Recurring Revenue", value: "$2.4M", growth: "+285% YoY", icon: TrendingUp },
    { label: "Active Users", value: "47,500+", growth: "+412% YoY", icon: Users },
    { label: "Trading Volume", value: "$890M", growth: "+523% YoY", icon: BarChart3 },
    { label: "Customer LTV", value: "$12,400", growth: "+89% YoY", icon: DollarSign },
    { label: "Gross Margin", value: "92.3%", growth: "Industry Leading", icon: Target },
    { label: "Net Revenue Retention", value: "147%", growth: "Best-in-Class", icon: Zap }
  ]

  const leadership = [
    {
      name: "Alex Chen",
      title: "CEO & Co-Founder",
      background: "Former Goldman Sachs VP, Stanford MS CS",
      image: "/placeholders/ceo-placeholder.jpg",
      experience: "15+ years in quantitative trading"
    },
    {
      name: "Dr. Sarah Kim",
      title: "CTO & Co-Founder", 
      background: "Ex-Citadel ML Lead, MIT PhD AI",
      image: "/placeholders/cto-placeholder.jpg",
      experience: "12+ years in financial AI/ML"
    },
    {
      name: "Michael Rodriguez",
      title: "CFO",
      background: "Former McKinsey Partner, Wharton MBA",
      image: "/placeholders/cfo-placeholder.jpg",
      experience: "20+ years in fintech finance"
    },
    {
      name: "Dr. James Liu",
      title: "Chief AI Officer",
      background: "Ex-Two Sigma Researcher, Princeton PhD",
      image: "/placeholders/cai-placeholder.jpg",
      experience: "18+ years in quant research"
    }
  ]

  const fundingRounds = [
    {
      stage: "Series A",
      amount: "$15M",
      date: "Q2 2024",
      investors: "Sequoia Capital, Andreessen Horowitz",
      status: "Completed",
      valuation: "$85M",
      use: "Product development, market expansion"
    },
    {
      stage: "Series B",
      amount: "$40M",
      date: "Q4 2024",
      investors: "Tiger Global, Coatue Management",
      status: "In Progress",
      valuation: "$280M",
      use: "International expansion, AI R&D"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24">
        <InvestorBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Investment Badge */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Badge 
                variant="outline" 
                className="px-6 py-2 text-sm font-medium bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
              >
                <Building className="w-4 h-4 mr-2" />
                Investment Opportunity
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-white">DEMOCRATIZING</span>
                <span className="block bg-gradient-to-r from-primary via-green-400 to-blue-400 bg-clip-text text-transparent">
                  ALGORITHMIC TRADING
                </span>
              </h1>
              <p className="max-w-4xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed">
                Join us in revolutionizing the $2.1 trillion trading industry. Our AI-powered platform 
                is making institutional-grade quantitative trading accessible to retail investors worldwide, 
                capturing a rapidly expanding market with unprecedented technology.
              </p>
            </motion.div>

            {/* Key Investment Metrics */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-primary mb-2">$2.4M</div>
                <div className="text-gray-300 text-sm">Monthly Recurring Revenue</div>
                <div className="flex items-center text-green-400 text-xs mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +285% YoY
                </div>
              </div>
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-blue-400 mb-2">47.5K+</div>
                <div className="text-gray-300 text-sm">Active Users</div>
                <div className="flex items-center text-green-400 text-xs mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +412% YoY
                </div>
              </div>
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-purple-400 mb-2">$890M</div>
                <div className="text-gray-300 text-sm">Trading Volume</div>
                <div className="flex items-center text-green-400 text-xs mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +523% YoY
                </div>
              </div>
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">92.3%</div>
                <div className="text-gray-300 text-sm">Gross Margin</div>
                <div className="flex items-center text-blue-400 text-xs mt-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Industry Leading
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Investor Relations
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download Investment Deck
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <Globe className="w-4 h-4 mr-2" />
              Market Opportunity
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Massive </span>
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Market Opportunity
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The algorithmic trading market is experiencing explosive growth, driven by democratization 
              of financial technology and increasing retail participation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketData.map((data, index) => (
              <motion.div
                key={data.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className={`text-3xl font-bold ${data.color} mb-3`}>
                      {data.value}
                    </div>
                    <div className="text-white font-medium mb-2">{data.label}</div>
                    <div className="text-green-400 text-sm flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {data.growth}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Performance Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30">
              <BarChart3 className="w-4 h-4 mr-2" />
              Financial Performance
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Exceptional </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Growth Metrics
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our financial performance demonstrates product-market fit, operational efficiency, 
              and sustainable unit economics across all key metrics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-gray-800 hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg mr-3">
                        <metric.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-white font-medium">{metric.label}</div>
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {metric.value}
                    </div>
                    <div className="text-green-400 text-sm flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.growth}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <PieChart className="w-4 h-4 mr-2" />
              Business Model
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Diversified </span>
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Revenue Streams
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Subscription Revenue (68%)</h3>
                    <p className="text-gray-300">Monthly and annual subscriptions for platform access, trading bots, and premium features.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Transaction Fees (22%)</h3>
                    <p className="text-gray-300">Revenue sharing from successful trades and performance-based fees from automated strategies.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Enterprise Licensing (10%)</h3>
                    <p className="text-gray-300">White-label solutions and API access for institutional clients and brokers.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Key Business Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Customer Acquisition Cost (CAC)</span>
                      <span className="text-primary font-bold">$127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Customer Lifetime Value (LTV)</span>
                      <span className="text-primary font-bold">$12,400</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">LTV:CAC Ratio</span>
                      <span className="text-green-400 font-bold">97.6:1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Payback Period</span>
                      <span className="text-blue-400 font-bold">2.1 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Churn Rate (Monthly)</span>
                      <span className="text-purple-400 font-bold">2.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/30">
              <Award className="w-4 h-4 mr-2" />
              Leadership Team
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">World-Class </span>
              <span className="bg-gradient-to-r from-green-400 to-primary bg-clip-text text-transparent">
                Executive Team
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our leadership combines deep financial services expertise, cutting-edge technology background, 
              and proven track record of scaling high-growth companies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-gray-800 hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-black">
                        {leader.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{leader.name}</h3>
                    <p className="text-primary font-medium mb-3">{leader.title}</p>
                    <p className="text-gray-300 text-sm mb-3">{leader.background}</p>
                    <div className="text-xs text-gray-400 border-t border-gray-700 pt-3">
                      {leader.experience}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunity Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Rocket className="w-4 h-4 mr-2" />
              Investment Opportunity
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Join Our </span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Growth Journey
              </span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {fundingRounds.map((round, index) => (
              <motion.div
                key={round.stage}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className={`${
                  round.status === "In Progress" 
                    ? "bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30" 
                    : "bg-white/5 border-gray-800"
                }`}>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{round.stage}</h3>
                        <div className="text-3xl font-bold text-primary">{round.amount}</div>
                        <Badge 
                          className={`mt-2 ${
                            round.status === "Completed" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-primary/20 text-primary border-primary/30"
                          }`}
                        >
                          {round.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Timeline</h4>
                        <p className="text-gray-300">{round.date}</p>
                        <h4 className="text-white font-medium mb-2 mt-3">Valuation</h4>
                        <p className="text-blue-400 font-bold">{round.valuation}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Key Investors</h4>
                        <p className="text-gray-300 text-sm">{round.investors}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Use of Funds</h4>
                        <p className="text-gray-300 text-sm">{round.use}</p>
                        {round.status === "In Progress" && (
                          <Button className="mt-4 bg-primary text-black hover:bg-primary/90" size="sm">
                            Learn More
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-900/80 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <Mail className="w-4 h-4 mr-2" />
              Investor Relations
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Ready to </span>
              <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                Partner With Us?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Connect with our investor relations team to learn more about our growth opportunities, 
              financial performance, and strategic vision.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6">
                <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-primary">investors@nexural.com</p>
              </div>
              
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6">
                <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                <p className="text-primary">+1 (555) 987-6543</p>
              </div>
              
              <div className="bg-white/5 border border-primary/20 rounded-2xl p-6">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                <p className="text-primary">New York, NY</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold">
                    <Mail className="w-5 h-5 mr-2" />
                    Schedule a Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Contact Investor Relations</DialogTitle>
                    <DialogDescription>
                      Fill out the form below and our investor relations team will get back to you within 24 hours.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Fund</Label>
                        <Input
                          id="company"
                          value={contactForm.company}
                          onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={contactForm.title}
                          onChange={(e) => setContactForm({...contactForm, title: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investmentSize">Investment Size Interest</Label>
                      <Input
                        id="investmentSize"
                        value={contactForm.investmentSize}
                        onChange={(e) => setContactForm({...contactForm, investmentSize: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g., $1M - $5M"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        rows={4}
                        placeholder="Tell us about your investment interests and any questions you have..."
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowContactDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary text-black hover:bg-primary/90">
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download Pitch Deck
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
