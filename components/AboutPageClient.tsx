"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import {
  Target,
  Zap,
  BrainCircuit,
  BarChartBig,
  Users,
  Award,
  TrendingUp,
  Shield,
  Cpu,
  Network,
  Globe,
  ChevronRight,
  Star,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"

const teamMembers = [
  {
    name: "Alex 'Cipher' Volkov",
    role: "Founder & Lead Quant",
    imageUrl: "/placeholder.svg?height=200&width=200&text=Alex",
    bio: "Architect of the Nexural core algorithms, Alex combines a decade of market experience with a deep passion for machine learning. Former Goldman Sachs quant with expertise in high-frequency trading systems",
    expertise: ["Quantitative Analysis", "Machine Learning", "Risk Management"],
    achievements: "15+ years Wall Street experience",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Dr. Lena Petrova",
    role: "Head of AI Research",
    imageUrl: "/placeholder.svg?height=200&width=200&text=Lena",
    bio: "A PhD in computational neuroscience from MIT, Lena leads the charge in developing next-generation predictive models. Published researcher with 50+ papers in AI and finance.",
    expertise: ["Deep Learning", "Neural Networks", "Predictive Modeling"],
    achievements: "MIT PhD, 50+ publications",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Jaxon 'Glitch' Lee",
    role: "Lead Systems Engineer",
    imageUrl: "/placeholder.svg?height=200&width=200&text=Jaxon",
    bio: "The mastermind behind our low-latency infrastructure, ensuring every signal and trade is executed with microsecond precision. Former SpaceX engineer specializing in real-time systems.",
    expertise: ["System Architecture", "Low-Latency Systems", "Cloud Infrastructure"],
    achievements: "Ex-SpaceX, <1ms execution time",
    linkedin: "#",
    twitter: "#",
  },
]

const timelineEvents = [
  {
    year: "2021",
    quarter: "Q1",
    title: "The Genesis Block",
    description:
      "A small team of quants and AI researchers, disillusioned with the opaque and inefficient tools available to retail traders, begin a revolutionary project to democratize institutional-grade trading technology.",
    milestone: "Team Formation",
    icon: Users,
    stats: "3 Founders",
  },
  {
    year: "2022",
    quarter: "Q3",
    title: "Alpha Testnet Launch",
    description:
      "The first iteration of the Nexural engine goes live, consistently outperforming market benchmarks by 340% in simulated environments across multiple asset classes and market conditions.",
    milestone: "First Algorithm",
    icon: Cpu,
    stats: "340% Outperformance",
  },
  {
    year: "2023",
    quarter: "Q2",
    title: "Community Formation",
    description:
      "Our private Discord launches with 10,000+ members, creating a feedback loop that becomes instrumental in refining our bots and indicators through real-world testing and community insights.",
    milestone: "10K+ Community",
    icon: Network,
    stats: "10,000+ Members",
  },
  {
    year: "2024",
    quarter: "Q1",
    title: "Public Launch",
    description:
      "Nexural Trading opens its doors to the public, offering a suite of tools previously reserved for institutional players. Within months, we manage over $50M in assets.",
    milestone: "$50M+ AUM",
    icon: Globe,
    stats: "$50M+ Managed",
  },
]

const techPillars = [
  {
    icon: BrainCircuit,
    title: "Predictive AI",
    description:
      "Our neural networks analyze terabytes of market data, identifying patterns invisible to human traders with industry-leading accuracy rates.",
    stats: "94.7% Accuracy",
    color: "from-blue-500 to-cyan-500",
    features: ["Deep Learning Models", "Pattern Recognition", "Sentiment Analysis"],
  },
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    description:
      "Infrastructure designed for speed with sub-millisecond execution times, ensuring your strategies are executed at the optimal moment.",
    stats: "<1ms Execution",
    color: "from-yellow-500 to-orange-500",
    features: ["Real-time Processing", "Edge Computing", "Optimized Networks"],
  },
  {
    icon: BarChartBig,
    title: "Quantitative Excellence",
    description:
      "Every tool is built on rigorous statistical analysis with extensive backtesting data across multiple market conditions and timeframes.",
    stats: "10+ Years Data",
    color: "from-green-500 to-emerald-500",
    features: ["Statistical Models", "Risk Analytics", "Backtesting Engine"],
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Advanced risk controls and portfolio optimization algorithms protect your capital while maximizing returns through intelligent position sizing.",
    stats: "99.9% Uptime",
    color: "from-purple-500 to-pink-500",
    features: ["Portfolio Optimization", "Risk Controls", "Capital Protection"],
  },
]

const achievements = [
  { label: "Active Users", value: "50,000+", icon: Users, description: "Traders worldwide" },
  { label: "Total Volume", value: "$2.5B+", icon: TrendingUp, description: "Traded successfully" },
  { label: "Success Rate", value: "94.7%", icon: Award, description: "Algorithm accuracy" },
  { label: "Uptime", value: "99.9%", icon: Shield, description: "System reliability" },
]

const values = [
  {
    title: "Innovation & Excellence",
    description:
      "We push the boundaries of what's possible in quantitative trading, constantly evolving our algorithms and infrastructure.",
    icon: Cpu,
  },
  {
    title: "Transparency",
    description:
      "Every strategy, every algorithm, every decision is backed by data and shared openly with our community.",
    icon: Globe,
  },
  {
    title: "Community Driven",
    description: "Our users are our partners. Their feedback shapes our roadmap and drives continuous improvement.",
    icon: Users,
  },
]

export default function AboutPageClient() {
  const [activeSection, setActiveSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const heroY = useTransform(scrollYProgress, [0, 0.5], ["0%", "25%"])

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setScrollProgress(latest)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        damping: 12,
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut" as const,
      },
    },
  }

  return (
    <div ref={containerRef} className="overflow-x-hidden relative">
      {/* Animated Background */}
      <motion.div className="fixed inset-0 z-0" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,255,136,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ff88%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </motion.div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative z-10 pt-32 pb-20 text-center min-h-screen flex items-center"
        style={{ y: heroY }}
      >
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div variants={floatingVariants} animate="animate" className="mb-8">
            <div className="inline-block p-6 bg-primary/10 rounded-full border border-primary/60 backdrop-blur-sm">
              <Target className="w-16 h-16 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white pb-6 leading-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Redefining
            <br />
            <span className="text-primary">Quantitative Trading</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We are a collective of elite traders, data scientists, and engineers dedicated to democratizing
            institutional-grade trading technology for the next generation of quantitative traders.
          </motion.p>

          <motion.div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-6 border border-gray-800 group-hover:border-primary/50 transition-all duration-300 backdrop-blur-sm">
                  <achievement.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{achievement.value}</div>
                  <div className="text-sm text-gray-400 mb-1">{achievement.label}</div>
                  <div className="text-xs text-gray-500">{achievement.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="bg-primary text-black font-bold py-4 px-8 rounded-xl text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Our Platform
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              className="border border-primary text-primary font-bold py-4 px-8 rounded-xl text-lg hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission & Values Section */}
      <motion.section
        className="relative z-10 py-32 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm font-medium">
                Our Mission
              </div>
              <h2 className="text-5xl font-bold text-white leading-tight">
                Leveling the
                <span className="text-primary"> Playing Field</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                For too long, sophisticated trading algorithms and market insights have been locked away in the vaults
                of Wall Street institutions. We believe that with the right technology, data, and community, every
                trader deserves access to institutional-grade tools.
              </p>
              <div className="space-y-4">
                {[
                  "Democratize advanced trading technology",
                  "Empower retail traders with institutional tools",
                  "Build the future of quantitative finance",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Our Core Values</h3>
                  <div className="space-y-6">
                    {values.map((value, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-primary/50 transition-all duration-300"
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <value.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">{value.title}</h4>
                          <p className="text-gray-400 text-sm">{value.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm font-medium mb-4">
              Our Journey
            </div>
            <h2 className="text-5xl font-bold text-white mb-4">From Vision to Reality</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Every breakthrough moment that brought us closer to our mission to revolutionize quantitative trading
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"></div>

            <motion.div
              className="space-y-20"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex items-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left order-2"}`}>
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-gray-800 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${index % 2 === 0 ? "order-2" : ""}`}>
                          <span className="text-primary font-mono text-xl font-bold">{event.year}</span>
                          <span className="text-gray-500 ml-2 text-sm">{event.quarter}</span>
                        </div>
                        <div
                          className={`inline-block p-3 bg-primary/10 rounded-xl ${index % 2 === 0 ? "order-1" : ""}`}
                        >
                          <event.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                      <p className="text-gray-400 mb-4 leading-relaxed">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-primary text-sm font-medium">
                          {event.milestone}
                        </div>
                        <div className="text-primary font-mono text-sm font-bold">{event.stats}</div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black border-4 border-primary rounded-full z-10 flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>

                  <div className={`w-1/2 ${index % 2 === 0 ? "pl-12" : "pr-12 order-1"}`}></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-32 bg-gradient-to-r from-black to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm font-medium mb-4">
              Leadership Team
            </div>
            <h2 className="text-5xl font-bold text-white mb-4">Meet the Architects</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The visionaries behind the revolution in quantitative trading technology
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={itemVariants} className="group relative" whileHover={{ y: -10 }}>
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-800 group-hover:border-primary/50 transition-all duration-500 backdrop-blur-sm h-full">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto mb-4 relative">
                      <Image
                        src={member.imageUrl || "/placeholder.svg"}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="rounded-full object-cover border-4 border-gray-700 group-hover:border-primary transition-colors duration-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-primary font-mono text-sm mb-3">{member.role}</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <p className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                        {member.achievements}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{member.bio}</p>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm font-medium mb-4">
              Technology Stack
            </div>
            <h2 className="text-5xl font-bold text-white mb-4">Our Technological Edge</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built on cutting-edge infrastructure that processes millions of data points per second to deliver
              unparalleled trading insights
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {techPillars.map((pillar, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-800 group-hover:border-primary/50 transition-all duration-500 backdrop-blur-sm h-full">
                  <div
                    className={`inline-block p-4 bg-gradient-to-r ${pillar.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <pillar.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{pillar.description}</p>

                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-primary text-sm font-mono font-bold">
                      {pillar.stats}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Features</p>
                    <div className="space-y-1">
                      {pillar.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-gray-400 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 py-32 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-12 border border-gray-800 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
            <div className="relative z-10">
              <motion.div variants={floatingVariants} animate="animate" className="mb-9">
                <div className="inline-block p-4 bg-primary/10 rounded-full border border-primary/60">
                  <Globe className="w-12 h-12 text-primary" />
                </div>
              </motion.div>

              <h2 className="text-5xl font-bold text-white mb-6">
                Ready to Join the
                <span className="text-primary"> Revolution?</span>
              </h2>

              <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                Become part of a growing community of forward-thinking traders. Access institutional-grade tools, share
                insights, and redefine your trading edge with Nexural.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="bg-primary text-black font-bold py-4 px-8 rounded-xl text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 136, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Trading Now
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className="border border-primary text-primary font-bold py-4 px-8 rounded-xl text-lg hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Documentation
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mt-8 text-sm text-gray-500">Join 50,000+ traders already using Nexural</div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
