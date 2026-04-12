"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Lock, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const initialRoadmapMilestones = [
  {
    id: 1,
    title: "Discord Access",
    subtitle: "Join the community",
    info: {
      title: "Join NEXURAL Discord",
      description:
        "Get instant access to our trading community with 1000+ active members sharing insights and strategies.",
      skills: ["Community", "Networking", "Free Access"],
    },
  },
  {
    id: 2,
    title: "Learn Basics",
    subtitle: "Market fundamentals",
    info: {
      title: "Trading Fundamentals",
      description:
        "Master technical analysis, chart patterns, and risk management through our comprehensive free resources.",
      skills: ["Technical Analysis", "Risk Management", "Charts"],
    },
  },
  {
    id: 3,
    title: "Paper Trading",
    subtitle: "Practice strategies",
    info: {
      title: "Risk-Free Practice",
      description:
        "Test your strategies with virtual money before risking real capital. Track performance and refine your approach.",
      skills: ["Strategy Testing", "Performance Tracking", "Zero Risk"],
    },
  },
  {
    id: 4,
    title: "Bot Development",
    subtitle: "Build trading bots",
    info: {
      title: "Automated Trading",
      description:
        "Learn to code trading bots using Python and Pine Script. Connect to exchanges via API for 24/7 trading.",
      skills: ["Python", "APIs", "Automation"],
    },
  },
  {
    id: 5,
    title: "Backtesting",
    subtitle: "Validate strategies",
    info: {
      title: "Historical Analysis",
      description:
        "Test your strategies against years of historical data. Optimize parameters and understand performance metrics.",
      skills: ["Data Analysis", "Optimization", "Metrics"],
    },
  },
  {
    id: 6,
    title: "Live Deployment",
    subtitle: "Launch your bots",
    info: {
      title: "Go Live",
      description: "Deploy your tested strategies on cloud infrastructure with real-time monitoring and risk controls.",
      skills: ["Cloud Hosting", "Monitoring", "Risk Controls"],
    },
  },
  {
    id: 7,
    title: "Advanced Strategies",
    subtitle: "Institutional methods",
    info: {
      title: "Pro Trading",
      description: "Learn market making, arbitrage, and advanced quantitative strategies used by hedge funds.",
      skills: ["Market Making", "Arbitrage", "Quant Methods"],
    },
  },
  {
    id: 8,
    title: "Portfolio Management",
    subtitle: "Scale your trading",
    info: {
      title: "Professional Scaling",
      description:
        "Manage multiple strategies, optimize portfolio allocation, and implement institutional risk management.",
      skills: ["Portfolio Theory", "Risk Parity", "Scaling"],
    },
  },
  {
    id: 9,
    title: "Fund Launch",
    subtitle: "Start your fund",
    info: {
      title: "Launch Your Fund",
      description:
        "Everything you need to start and manage your own trading fund, from legal structure to investor relations.",
      skills: ["Legal Setup", "Compliance", "Fundraising"],
    },
  },
]

const MilestoneNode = ({ milestone, index, onMilestoneClick, status, orderClass = "" }) => {
  const getIcon = () => {
    if (status === "completed") return <Check className="w-6 h-6 text-black" />
    if (status === "active") return <Cpu className="w-6 h-6 text-primary animate-pulse" />
    return <Lock className="w-5 h-5 text-gray-600" />
  }

  return (
    <motion.div
      className={cn("milestone relative flex flex-col items-center group cursor-pointer", orderClass)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onMilestoneClick(index)}
    >
      <div className="info-card absolute bottom-full mb-6 w-72 bg-black/95 backdrop-blur-md border border-primary/50 p-6 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 cyberpunk-card">
        <h4 className="text-primary font-bold mb-2 text-lg">{milestone.info.title}</h4>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{milestone.info.description}</p>
        <div className="flex flex-wrap gap-2">
          {milestone.info.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-mono border border-primary/20"
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-black border-r border-b border-primary/50 transform -translate-x-1/2 rotate-45" />
      </div>
      <div
        className={cn(
          "node w-16 h-16 rounded-full bg-black border-2 flex items-center justify-center relative transition-all duration-300 mb-4 group-hover:border-primary/50",
          status === "completed" && "bg-primary border-primary shadow-[0_0_20px_rgba(184,255,0,0.6)]",
          status === "active" && "border-primary animate-pulse shadow-[0_0_30px_rgba(184,255,0,0.8)]",
          status === "upcoming" && "border-gray-800",
        )}
      >
        {getIcon()}
      </div>
      <div className="text-center">
        <h3 className="font-bold text-white text-lg uppercase tracking-wider font-mono">{milestone.title}</h3>
        <p className="text-gray-500 text-sm">{milestone.subtitle}</p>
      </div>
    </motion.div>
  )
}

const ProgressIndicator = ({ activeIndex, totalCount }) => {
  const progressCount = activeIndex + 1
  return (
    <motion.div
      className="hidden md:block absolute top-0 right-8 bg-black/90 border-2 border-gray-800 p-6 z-10 cyberpunk-card backdrop-blur-md"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="text-sm text-gray-400 uppercase font-mono tracking-widest mb-2">Journey Progress</div>
      <div className="text-4xl font-black text-primary font-mono mb-2">
        <motion.span>{progressCount}</motion.span>/{totalCount}
      </div>
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(progressCount / totalCount) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  )
}

export default function RoadmapSection() {
  const [activeIndex, setActiveIndex] = useState(3)
  const milestones = initialRoadmapMilestones
  const totalCount = milestones.length

  const handleMilestoneClick = (index) => {
    setActiveIndex(index)
  }

  const pathD =
    "M 170 120 L 830 120 Q 880 120 880 170 L 880 280 Q 880 330 830 330 L 170 330 Q 120 330 120 380 L 120 490 Q 120 540 170 540 L 830 540"

  const progress = (activeIndex + 1) / totalCount

  const row1 = milestones.slice(0, 3)
  const row2 = milestones.slice(3, 6)
  const row3 = milestones.slice(6, 9)

  return (
    <section id="roadmap" className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/placeholder-zpfoe.png')] opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 font-mono uppercase">
            <span className="text-primary drop-shadow-[0_0_15px_rgba(184,255,0,0.7)]">NEXURAL</span> ROADMAP
          </h2>
          <p className="text-lg text-gray-400">Your journey to quantitative trading mastery.</p>
        </motion.div>

        <ProgressIndicator activeIndex={activeIndex} totalCount={totalCount} />

        <div className="relative max-w-4xl mx-auto">
          <svg className="absolute inset-0 w-full h-full hidden md:block" viewBox="0 0 1000 660">
            <motion.path d={pathD} fill="none" stroke="rgba(184, 255, 0, 0.15)" strokeWidth="3" />
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 8px #B8FF00)" }}
            />
            <defs>
              <linearGradient id="gradient" gradientUnits="userSpaceOnUse" x1="170" y1="120" x2="830" y2="540">
                <stop stopColor="#B8FF00" />
                <stop offset="1" stopColor="#50ff88" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative flex flex-col gap-y-32">
            {/* Row 1 */}
            <div className="grid md:grid-cols-3 gap-x-8">
              {row1.map((milestone, index) => {
                const originalIndex = index
                const status =
                  originalIndex < activeIndex ? "completed" : originalIndex === activeIndex ? "active" : "upcoming"
                return (
                  <MilestoneNode
                    key={milestone.id}
                    milestone={milestone}
                    index={originalIndex}
                    onMilestoneClick={handleMilestoneClick}
                    status={status}
                  />
                )
              })}
            </div>
            {/* Row 2 */}
            <div className="grid md:grid-cols-3 gap-x-8">
              {row2.map((milestone, index) => {
                const originalIndex = index + 3
                const status =
                  originalIndex < activeIndex ? "completed" : originalIndex === activeIndex ? "active" : "upcoming"
                const orderClass = () => {
                  if (originalIndex === 3) return "md:order-3" // Bot Development (4) -> right
                  if (originalIndex === 4) return "md:order-2" // Backtesting (5) -> middle
                  if (originalIndex === 5) return "md:order-1" // Live Deployment (6) -> left
                  return ""
                }
                return (
                  <MilestoneNode
                    key={milestone.id}
                    milestone={milestone}
                    index={originalIndex}
                    onMilestoneClick={handleMilestoneClick}
                    status={status}
                    orderClass={orderClass()}
                  />
                )
              })}
            </div>
            {/* Row 3 */}
            <div className="grid md:grid-cols-3 gap-x-8">
              {row3.map((milestone, index) => {
                const originalIndex = index + 6
                const status =
                  originalIndex < activeIndex ? "completed" : originalIndex === activeIndex ? "active" : "upcoming"
                return (
                  <MilestoneNode
                    key={milestone.id}
                    milestone={milestone}
                    index={originalIndex}
                    onMilestoneClick={handleMilestoneClick}
                    status={status}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button
            size="lg"
            className="cyberpunk-button bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 py-6 text-lg uppercase tracking-widest"
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
