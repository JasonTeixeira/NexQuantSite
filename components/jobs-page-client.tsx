"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Heart,
  Coffee,
  Plane,
  GraduationCap,
  Zap,
  Target,
  Rocket,
  Mail,
  Phone,
  MessageSquare,
  Upload,
  Filter,
  Search,
  ChevronRight,
  Star,
  Globe,
  Award,
  TrendingUp,
  Brain,
  Shield,
  CheckCircle,
  ArrowRight,
  Send,
  Calendar,
  Code,
  BarChart3,
  Activity,
  Layers,
  Network,
  Bot,
} from "lucide-react"

// Interface for job data from API
interface Job {
  id: number
  title: string
  department: string
  location: string
  type: string
  salary: string
  experience: string
  featured: boolean
  status: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  benefits: string[]
  applications: number
  views: number
  createdAt: string
  updatedAt: string
  icon?: React.ComponentType<{ className?: string }>
}

// Default fallback jobs (in case API fails)
const fallbackJobs = [
  {
    id: 1,
    title: "Senior Quantitative Developer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    salary: "$180k - $280k",
    experience: "5+ years",
    featured: true,
    status: "active",
    description:
      "Build and optimize high-frequency trading algorithms using cutting-edge AI and machine learning techniques. Work with petabytes of market data to create predictive models that drive our trading strategies.",
    requirements: [
      "Master's degree in Computer Science, Mathematics, Physics, or related quantitative field",
      "5+ years of experience in quantitative finance, algorithmic trading, or high-performance computing",
      "Expert-level proficiency in Python and C++ with experience in performance optimization",
      "Deep understanding of machine learning frameworks (TensorFlow, PyTorch, scikit-learn)",
      "Experience with time-series analysis, statistical modeling, and financial markets",
      "Knowledge of distributed computing systems and real-time data processing",
    ],
    responsibilities: [
      "Design and implement trading algorithms for multiple asset classes",
      "Optimize code for ultra-low latency execution (microsecond level)",
      "Collaborate with researchers to productionize ML models",
      "Build robust backtesting and simulation frameworks",
    ],
    skills: ["Python", "C++", "Machine Learning", "Statistics", "Finance", "HFT", "Linux"],
    benefits: ["Equity package", "Performance bonuses", "Health insurance", "Remote flexibility"],
    applications: 45,
    views: 1247,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "AI Research Scientist",
    department: "Research",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$200k - $350k",
    experience: "PhD preferred",
    featured: true,
    status: "active",
    description:
      "Lead groundbreaking research in artificial intelligence for financial markets. Develop novel deep learning architectures and reinforcement learning algorithms that push the boundaries of quantitative trading.",
    requirements: [
      "PhD in Machine Learning, Computer Science, Mathematics, or related field",
      "3+ years of experience in AI/ML research with published papers in top-tier venues",
      "Expertise in deep learning, reinforcement learning, and natural language processing",
      "Strong mathematical foundation in optimization, probability theory, and statistics",
      "Experience with large-scale distributed training and model deployment",
      "Knowledge of financial markets and trading strategies preferred",
    ],
    responsibilities: [
      "Conduct cutting-edge research in AI for financial applications",
      "Publish research findings in top academic conferences and journals",
      "Collaborate with engineering teams to implement research prototypes",
      "Mentor junior researchers and contribute to the research roadmap",
    ],
    skills: ["PyTorch", "TensorFlow", "Research", "Deep Learning", "NLP", "Reinforcement Learning"],
    benefits: ["Research budget", "Conference attendance", "Publication bonuses", "Sabbatical program"],
    applications: 32,
    views: 876,
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-12T09:00:00Z",
    icon: Brain,
  },
  {
    id: 3,
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    salary: "$140k - $200k",
    experience: "4+ years",
    featured: false,
    status: "active",
    description:
      "Build and maintain the infrastructure that powers our trading systems. Ensure 99.99% uptime for systems processing millions of transactions per second with microsecond latency requirements.",
    requirements: [
      "Bachelor's degree in Computer Science, Engineering, or related field",
      "4+ years of experience in DevOps, SRE, or infrastructure engineering",
      "Expert knowledge of Kubernetes, Docker, and container orchestration",
      "Experience with cloud platforms (AWS, GCP, Azure) and infrastructure as code",
      "Strong background in monitoring, logging, and observability tools",
      "Understanding of network protocols and low-latency system design",
    ],
    responsibilities: [
      "Design and maintain scalable, fault-tolerant infrastructure",
      "Implement CI/CD pipelines for rapid, safe deployments",
      "Monitor system performance and optimize for ultra-low latency",
      "Ensure security compliance and disaster recovery procedures",
    ],
    skills: ["Kubernetes", "AWS", "Docker", "Terraform", "Monitoring", "Linux", "Networking"],
    benefits: ["Remote work", "On-call compensation", "Cloud certifications", "Home office setup"],
    applications: 28,
    views: 654,
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-10T14:00:00Z",
    icon: Network,
  },
  {
    id: 4,
    title: "Frontend Engineer",
    department: "Engineering",
    location: "London, UK",
    type: "Full-time",
    salary: "$120k - $180k",
    experience: "3+ years",
    featured: false,
    status: "active",
    description:
      "Create stunning, real-time trading interfaces that handle millions of data points. Build responsive dashboards and analytics tools that traders rely on for split-second decisions.",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "3+ years of experience in frontend development with React/Next.js",
      "Expert knowledge of TypeScript, modern CSS, and responsive design",
      "Experience with real-time data visualization and WebSocket connections",
      "Understanding of trading interfaces and financial data presentation",
      "Knowledge of performance optimization for data-heavy applications",
    ],
    responsibilities: [
      "Build responsive, real-time trading dashboards",
      "Implement complex data visualizations and charts",
      "Optimize frontend performance for large datasets",
      "Collaborate with designers and backend engineers",
    ],
    skills: ["React", "Next.js", "TypeScript", "D3.js", "WebSockets", "Tailwind CSS"],
    benefits: ["Flexible hours", "Learning budget", "Modern equipment", "Team events"],
    applications: 52,
    views: 1156,
    createdAt: "2024-01-08T11:00:00Z",
    updatedAt: "2024-01-08T11:00:00Z",
    icon: Layers,
  },
  {
    id: 5,
    title: "Data Scientist",
    department: "Analytics",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$130k - $190k",
    experience: "3+ years",
    featured: false,
    status: "active",
    description:
      "Analyze vast amounts of market data to uncover trading opportunities. Build predictive models and statistical frameworks that inform our investment strategies across global markets.",
    requirements: [
      "Master's degree in Statistics, Mathematics, Economics, or related field",
      "3+ years of experience in data science with focus on financial markets",
      "Proficiency in Python, R, and SQL with experience in big data technologies",
      "Strong background in statistical modeling, time-series analysis, and econometrics",
      "Experience with machine learning techniques for financial forecasting",
      "Knowledge of financial instruments and market microstructure",
    ],
    responsibilities: [
      "Develop predictive models for market movements and risk assessment",
      "Conduct statistical analysis of trading strategies and performance",
      "Create data pipelines for real-time market data processing",
      "Collaborate with traders and researchers on strategy development",
    ],
    skills: ["Python", "R", "SQL", "Statistics", "Machine Learning", "Finance", "Pandas"],
    benefits: ["Conference attendance", "Research time", "Mentorship program", "Stock options"],
    applications: 37,
    views: 892,
    createdAt: "2024-01-05T16:00:00Z",
    updatedAt: "2024-01-05T16:00:00Z",
    icon: BarChart3,
  },
  {
    id: 6,
    title: "Product Manager",
    department: "Product",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$150k - $220k",
    experience: "5+ years",
    featured: false,
    status: "active",
    description:
      "Drive product strategy for our trading platform and analytics suite. Work closely with traders, engineers, and designers to build products that revolutionize quantitative trading.",
    requirements: [
      "Bachelor's degree in Business, Engineering, or related field",
      "5+ years of product management experience, preferably in fintech or trading",
      "Strong analytical skills with experience in data-driven decision making",
      "Excellent communication and stakeholder management abilities",
      "Understanding of trading workflows and financial market operations",
      "Experience with agile development methodologies and product analytics",
    ],
    responsibilities: [
      "Define product roadmap and strategy for trading platforms",
      "Gather requirements from traders and stakeholders",
      "Work with engineering teams to prioritize features and improvements",
      "Analyze product metrics and user feedback to drive decisions",
    ],
    skills: ["Product Strategy", "Analytics", "Agile", "User Research", "Fintech", "SQL"],
    benefits: ["Product ownership", "Cross-functional collaboration", "Growth opportunities", "Equity"],
    applications: 19,
    views: 423,
    createdAt: "2024-01-03T13:00:00Z",
    updatedAt: "2024-01-03T13:00:00Z",
    icon: Target,
  },
  {
    id: 7,
    title: "Risk Management Analyst",
    department: "Risk",
    location: "Singapore",
    type: "Full-time",
    salary: "$100k - $140k",
    experience: "2+ years",
    featured: false,
    status: "active",
    description:
      "Monitor and manage risk across our global trading operations. Develop risk models and implement controls that protect our capital while maximizing trading opportunities.",
    requirements: [
      "Bachelor's degree in Finance, Mathematics, Economics, or related field",
      "2+ years of experience in risk management or quantitative analysis",
      "Strong knowledge of derivatives, portfolio theory, and risk metrics",
      "Proficiency in Python, R, or MATLAB for risk modeling",
      "Understanding of regulatory requirements and compliance frameworks",
      "Experience with Monte Carlo simulations and stress testing",
    ],
    responsibilities: [
      "Monitor real-time risk exposure across all trading strategies",
      "Develop and maintain risk models and stress testing frameworks",
      "Prepare daily risk reports for senior management",
      "Ensure compliance with regulatory capital requirements",
    ],
    skills: ["Risk Modeling", "Python", "Statistics", "Derivatives", "Compliance", "Excel"],
    benefits: ["International exposure", "Professional certifications", "Training programs", "Bonus"],
    applications: 25,
    views: 567,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
    icon: Shield,
  },
  {
    id: 8,
    title: "Machine Learning Engineer",
    department: "Engineering",
    location: "Toronto, CA",
    type: "Full-time",
    salary: "$160k - $220k",
    experience: "4+ years",
    featured: true,
    status: "active",
    description:
      "Build and deploy ML models at scale for real-time trading decisions. Work on cutting-edge problems in computer vision, NLP, and time-series forecasting for financial markets.",
    requirements: [
      "Master's degree in Computer Science, Machine Learning, or related field",
      "4+ years of experience in ML engineering with production deployments",
      "Expertise in MLOps, model versioning, and A/B testing frameworks",
      "Strong programming skills in Python with experience in ML frameworks",
      "Knowledge of distributed computing and real-time inference systems",
      "Experience with financial data and trading applications preferred",
    ],
    responsibilities: [
      "Deploy ML models to production with monitoring and alerting",
      "Build MLOps pipelines for model training and deployment",
      "Optimize model performance for real-time inference",
      "Collaborate with researchers to productionize new algorithms",
    ],
    skills: ["MLOps", "Python", "Kubernetes", "TensorFlow", "Model Deployment", "A/B Testing"],
    benefits: ["Cutting-edge projects", "Conference budget", "Remote flexibility", "Stock options"],
    applications: 41,
    views: 1034,
    createdAt: "2023-12-28T15:00:00Z",
    updatedAt: "2023-12-28T15:00:00Z",
    icon: Bot,
  },
]

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Top-tier salaries with performance bonuses and equity packages that align with company success",
    details: [
      "Base salary at 90th percentile",
      "Annual performance bonuses up to 50%",
      "Equity participation",
      "Sign-on bonuses",
    ],
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive healthcare coverage and wellness programs to keep you at your best",
    details: [
      "Premium health, dental, and vision insurance",
      "Mental health support",
      "Gym membership",
      "Wellness stipend",
    ],
  },
  {
    icon: Plane,
    title: "Work-Life Balance",
    description: "Flexible work arrangements and unlimited time off to maintain your personal well-being",
    details: ["Unlimited PTO policy", "Flexible working hours", "Remote work options", "Sabbatical program"],
  },
  {
    icon: GraduationCap,
    title: "Learning & Development",
    description: "Continuous learning opportunities with generous budgets for your professional growth",
    details: [
      "$10,000 annual learning budget",
      "Conference attendance",
      "Internal training programs",
      "Mentorship opportunities",
    ],
  },
  {
    icon: Coffee,
    title: "Office Perks",
    description: "Modern offices with all the amenities you need to do your best work",
    details: [
      "Gourmet meals and snacks",
      "Premium coffee and beverages",
      "Game rooms and relaxation areas",
      "Ergonomic workstations",
    ],
  },
  {
    icon: Rocket,
    title: "Career Growth",
    description: "Clear advancement paths and leadership opportunities in a rapidly growing company",
    details: [
      "Defined career progression",
      "Leadership development programs",
      "Cross-team collaboration",
      "Internal mobility",
    ],
  },
]

const cultureValues = [
  {
    icon: Zap,
    title: "Innovation First",
    description: "We push the boundaries of what's possible in quantitative trading and financial technology",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for perfection in everything we do, from our algorithms to our user experience",
    color: "from-blue-400 to-purple-500",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe diverse teams working together create the most innovative solutions",
    color: "from-green-400 to-blue-500",
  },
  {
    icon: Brain,
    title: "Continuous Learning",
    description: "We invest in our people's growth and encourage experimentation and learning from failure",
    color: "from-purple-400 to-pink-500",
  },
]

const stats = [
  { label: "Team Members", value: "150+", icon: Users, description: "Talented professionals worldwide" },
  { label: "Countries", value: "12", icon: Globe, description: "Global presence and diversity" },
  { label: "Years Experience", value: "8", icon: Award, description: "Proven track record in fintech" },
  { label: "Growth Rate", value: "300%", icon: TrendingUp, description: "Year-over-year revenue growth" },
]

const departments = [
  { name: "Engineering", count: 45, icon: Code, color: "text-blue-400" },
  { name: "Research", count: 25, icon: Brain, color: "text-purple-400" },
  { name: "Analytics", count: 30, icon: BarChart3, color: "text-green-400" },
  { name: "Product", count: 15, icon: Target, color: "text-yellow-400" },
  { name: "Infrastructure", count: 20, icon: Network, color: "text-red-400" },
  { name: "Risk", count: 15, icon: Shield, color: "text-indigo-400" },
]

export function JobsPageClient() {
  const [jobListings, setJobListings] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("positions")
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    coverLetter: "",
    resume: null as File | null,
    portfolio: "",
    linkedin: "",
    github: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/careers?status=active")
        const data = await response.json()
        
        if (data.success) {
          setJobListings(data.jobs)
        } else {
          // Use fallback data if API fails
          setJobListings(fallbackJobs)
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        // Use fallback data if API fails
        setJobListings(fallbackJobs)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobListings.filter((job) => {
    const matchesDepartment = filterDepartment === "all" || job.department.toLowerCase() === filterDepartment
    const matchesLocation = filterLocation === "all" || job.location.toLowerCase().includes(filterLocation)
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesDepartment && matchesLocation && matchesSearch
  })

  const uniqueDepartments = Array.from(new Set(jobListings.map((job) => job.department.toLowerCase())))
  const uniqueLocations = Array.from(
    new Set(jobListings.flatMap((job) => job.location.split(",").map((loc) => loc.trim().toLowerCase()))),
  )

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitProgress(0)

    // Simulate form submission with progress
    const interval = setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSubmitting(false)
          // Reset form
          setApplicationForm({
            name: "",
            email: "",
            phone: "",
            position: "",
            experience: "",
            coverLetter: "",
            resume: null,
            portfolio: "",
            linkedin: "",
            github: "",
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 10 * 1024 * 1024) {
      // 10MB limit
      setApplicationForm((prev) => ({ ...prev, resume: file }))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400">Loading career opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        {/* Floating Particles */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 4,
            }}
          />
        ))}
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white via-primary to-blue-400 bg-clip-text text-transparent">
                Shape the Future
              </span>
              <br />
              <span className="text-white">of Trading</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Join the world's most innovative quantitative trading firm. Build cutting-edge AI systems, work with
              brilliant minds, and help revolutionize financial markets.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-black font-bold px-8 py-4 text-lg"
                onClick={() => setActiveTab("positions")}
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Explore Positions
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 text-lg bg-transparent"
                onClick={() => setActiveTab("culture")}
              >
                <Users className="mr-2 h-5 w-5" />
                Our Culture
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-gray-900/50 border border-gray-800 h-14">
              <TabsTrigger
                value="positions"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-lg font-semibold"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Positions
              </TabsTrigger>
              <TabsTrigger
                value="culture"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-lg font-semibold"
              >
                <Heart className="mr-2 h-5 w-5" />
                Culture
              </TabsTrigger>
              <TabsTrigger
                value="benefits"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-lg font-semibold"
              >
                <Star className="mr-2 h-5 w-5" />
                Benefits
              </TabsTrigger>
              <TabsTrigger
                value="apply"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-lg font-semibold"
              >
                <Send className="mr-2 h-5 w-5" />
                Apply
              </TabsTrigger>
            </TabsList>

            {/* Positions Tab */}
            <TabsContent value="positions" className="space-y-12">
              {/* Department Overview */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h2 className="text-4xl font-bold text-center mb-8 text-primary">Our Teams</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {departments.map((dept, index) => (
                    <motion.div
                      key={dept.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-4 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-primary/50 transition-all duration-300"
                    >
                      <dept.icon className={`h-8 w-8 mx-auto mb-2 ${dept.color}`} />
                      <div className="font-semibold text-white">{dept.name}</div>
                      <div className="text-sm text-gray-400">{dept.count} people</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-4 mb-8"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search positions, skills, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-gray-900/50 border-gray-700 h-12 text-lg"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-full lg:w-48 bg-gray-900/50 border-gray-700 h-12">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full lg:w-48 bg-gray-900/50 border-gray-700 h-12">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location.charAt(0).toUpperCase() + location.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Job Listings */}
              <div className="grid gap-8">
                <AnimatePresence>
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <Card className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <job.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors">
                                    {job.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-4 mt-1">
                                    <Badge variant="outline" className="text-primary border-primary/50">
                                      {job.department}
                                    </Badge>
                                    {job.featured && (
                                      <Badge className="bg-primary text-black">
                                        <Star className="w-3 h-3 mr-1" />
                                        Featured
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <CardDescription className="text-gray-300 text-lg leading-relaxed">
                                {job.description}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
                                    onClick={() => setSelectedJob(job)}
                                  >
                                    View Details
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
                                  <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="p-2 bg-primary/10 rounded-lg">
                                        <job.icon className="h-6 w-6 text-primary" />
                                      </div>
                                      <div>
                                        <DialogTitle className="text-2xl text-white">{job.title}</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                          {job.department} • {job.location} • {job.type}
                                        </DialogDescription>
                                      </div>
                                    </div>
                                  </DialogHeader>

                                  <div className="space-y-8 mt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-lg">
                                      <div className="text-center">
                                        <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
                                        <div className="text-sm text-gray-400">Location</div>
                                        <div className="font-semibold text-white">{job.location}</div>
                                      </div>
                                      <div className="text-center">
                                        <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                                        <div className="text-sm text-gray-400">Type</div>
                                        <div className="font-semibold text-white">{job.type}</div>
                                      </div>
                                      <div className="text-center">
                                        <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
                                        <div className="text-sm text-gray-400">Salary</div>
                                        <div className="font-semibold text-white">{job.salary}</div>
                                      </div>
                                      <div className="text-center">
                                        <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                                        <div className="text-sm text-gray-400">Experience</div>
                                        <div className="font-semibold text-white">{job.experience}</div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                                        Requirements
                                      </h4>
                                      <ul className="space-y-3">
                                        {job.requirements.map((req, idx) => (
                                          <li key={idx} className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-300">{req}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <Activity className="h-5 w-5 text-primary mr-2" />
                                        Key Responsibilities
                                      </h4>
                                      <ul className="space-y-3">
                                        {job.responsibilities.map((resp, idx) => (
                                          <li key={idx} className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-300">{resp}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <Code className="h-5 w-5 text-primary mr-2" />
                                        Skills & Technologies
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, idx) => (
                                          <Badge key={idx} className="bg-primary/20 text-primary border-primary/50">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <Heart className="h-5 w-5 text-primary mr-2" />
                                        Benefits
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {job.benefits.map((benefit, idx) => (
                                          <Badge key={idx} variant="outline" className="border-gray-600 text-gray-300">
                                            {benefit}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-700">
                                      <Button
                                        className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3 text-lg"
                                        onClick={() => {
                                          setApplicationForm((prev) => ({ ...prev, position: job.title }))
                                          setActiveTab("apply")
                                        }}
                                      >
                                        Apply for this Position
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                className="bg-primary hover:bg-primary/90 text-black font-semibold"
                                onClick={() => {
                                  setApplicationForm((prev) => ({ ...prev, position: job.title }))
                                  setActiveTab("apply")
                                }}
                              >
                                Quick Apply
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              <span>{job.experience}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 5).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="border-gray-600 text-gray-300">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 5 && (
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                +{job.skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredJobs.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No positions found</h3>
                  <p className="text-gray-400">
                    Try adjusting your search criteria or check back later for new openings.
                  </p>
                </motion.div>
              )}
            </TabsContent>

            {/* Culture Tab */}
            <TabsContent value="culture" className="space-y-16">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h2 className="text-5xl font-bold mb-6 text-primary">Our Culture</h2>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  We're not just building trading algorithms – we're creating a culture where innovation thrives,
                  collaboration flourishes, and every team member can reach their full potential.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {cultureValues.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 h-full overflow-hidden group">
                      <div className={`h-2 bg-gradient-to-r ${value.color}`} />
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-4 bg-gradient-to-r ${value.color} rounded-xl`}>
                            <value.icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                            {value.title}
                          </h3>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Team Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 border border-primary/20"
              >
                <h3 className="text-3xl font-bold text-center mb-8 text-white">Join Our Global Team</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "Average Age", value: "28", unit: "years" },
                    { label: "PhD Holders", value: "35", unit: "%" },
                    { label: "Publications", value: "150", unit: "+" },
                    { label: "Patents", value: "25", unit: "+" },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {stat.value}
                        <span className="text-lg">{stat.unit}</span>
                      </div>
                      <div className="text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-16">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h2 className="text-5xl font-bold mb-6 text-primary">Benefits & Perks</h2>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  We believe in taking care of our people with comprehensive benefits that support your professional
                  growth, personal well-being, and financial security.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 h-full group">
                      <CardContent className="p-8">
                        <div className="mb-6">
                          <div className="p-4 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors">
                            <benefit.icon className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">{benefit.description}</p>
                        <ul className="space-y-2">
                          {benefit.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Additional Perks */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800"
              >
                <h3 className="text-3xl font-bold text-center mb-8 text-white">Additional Perks</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    "Stock Options Program",
                    "Home Office Stipend",
                    "Annual Team Retreats",
                    "Gym Membership",
                    "Mental Health Support",
                    "Parental Leave (16 weeks)",
                    "Sabbatical Program",
                    "Pet Insurance",
                    "Commuter Benefits",
                    "Free Meals & Snacks",
                    "Gaming & Recreation Room",
                    "Flexible Working Hours",
                  ].map((perk, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-gray-300">{perk}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* Apply Tab */}
            <TabsContent value="apply" className="space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h2 className="text-5xl font-bold mb-6 text-primary">Apply Now</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Ready to join our team? Fill out the comprehensive application below and we'll get back to you within
                  48 hours.
                </p>
              </motion.div>

              <div className="max-w-4xl mx-auto">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-8">
                    <form onSubmit={handleApplicationSubmit} className="space-y-8">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <Users className="h-6 w-6 text-primary mr-2" />
                          Personal Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name" className="text-white text-lg">
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              value={applicationForm.name}
                              onChange={(e) => setApplicationForm((prev) => ({ ...prev, name: e.target.value }))}
                              className="mt-2 bg-gray-800 border-gray-700 text-white h-12"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-white text-lg">
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={applicationForm.email}
                              onChange={(e) => setApplicationForm((prev) => ({ ...prev, email: e.target.value }))}
                              className="mt-2 bg-gray-800 border-gray-700 text-white h-12"
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-white text-lg">
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              value={applicationForm.phone}
                              onChange={(e) => setApplicationForm((prev) => ({ ...prev, phone: e.target.value }))}
                              className="mt-2 bg-gray-800 border-gray-700 text-white h-12"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkedin" className="text-white text-lg">
                              LinkedIn Profile
                            </Label>
                            <Input
                              id="linkedin"
                              value={applicationForm.linkedin}
                              onChange={(e) => setApplicationForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                              className="mt-2 bg-gray-800 border-gray-700 text-white h-12"
                              placeholder="https://linkedin.com/in/johndoe"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Position Information */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <Briefcase className="h-6 w-6 text-primary mr-2" />
                          Position Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="position" className="text-white text-lg">
                              Position of Interest *
                            </Label>
                            <Select
                              value={applicationForm.position}
                              onValueChange={(value) => setApplicationForm((prev) => ({ ...prev, position: value }))}
                            >
                              <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white h-12">
                                <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                              <SelectContent>
                                {jobListings.map((job) => (
                                  <SelectItem key={job.id} value={job.title}>
                                    {job.title} - {job.department}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="experience" className="text-white text-lg">
                              Years of Experience *
                            </Label>
                            <Select
                              value={applicationForm.experience}
                              onValueChange={(value) => setApplicationForm((prev) => ({ ...prev, experience: value }))}
                            >
                              <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white h-12">
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-1">0-1 years (Entry Level)</SelectItem>
                                <SelectItem value="2-3">2-3 years (Junior)</SelectItem>
                                <SelectItem value="4-6">4-6 years (Mid-Level)</SelectItem>
                                <SelectItem value="7-10">7-10 years (Senior)</SelectItem>
                                <SelectItem value="10+">10+ years (Expert/Lead)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <Upload className="h-6 w-6 text-primary mr-2" />
                          Documents & Links
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="resume" className="text-white text-lg">
                              Resume/CV *
                            </Label>
                            <div className="mt-2 border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                              <input
                                id="resume"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileUpload}
                                className="hidden"
                                required
                              />
                              <Label htmlFor="resume" className="cursor-pointer">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg text-gray-300 mb-2">
                                  {applicationForm.resume ? applicationForm.resume.name : "Click to upload your resume"}
                                </p>
                                <p className="text-sm text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                              </Label>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="portfolio" className="text-white text-lg">
                              Portfolio/GitHub (Optional)
                            </Label>
                            <Input
                              id="portfolio"
                              value={applicationForm.portfolio}
                              onChange={(e) => setApplicationForm((prev) => ({ ...prev, portfolio: e.target.value }))}
                              className="mt-2 bg-gray-800 border-gray-700 text-white h-12"
                              placeholder="https://github.com/johndoe or https://portfolio.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <MessageSquare className="h-6 w-6 text-primary mr-2" />
                          Cover Letter
                        </h3>
                        <div>
                          <Label htmlFor="coverLetter" className="text-white text-lg">
                            Tell us about yourself *
                          </Label>
                          <Textarea
                            id="coverLetter"
                            value={applicationForm.coverLetter}
                            onChange={(e) => setApplicationForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                            className="mt-2 bg-gray-800 border-gray-700 text-white min-h-40"
                            placeholder="Tell us why you're interested in this position, what makes you a great fit, and what you hope to achieve at Nexural Trading..."
                            required
                          />
                          <p className="text-sm text-gray-400 mt-2">
                            Minimum 100 characters. Be specific about your experience and motivation.
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6 border-t border-gray-700">
                        {isSubmitting && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                              <span>Submitting application...</span>
                              <span>{submitProgress}%</span>
                            </div>
                            <Progress value={submitProgress} className="h-2" />
                          </div>
                        )}
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 text-lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" />
                              Submitting Application...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Submit Application
                            </>
                          )}
                        </Button>
                        <p className="text-center text-sm text-gray-400 mt-4">
                          We'll review your application and get back to you within 48 hours.
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-20 px-4 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-primary">Questions About Careers?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our talent team is here to help you learn more about opportunities at Nexural Trading and guide you
              through the application process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                title: "Email Us",
                description: "Get in touch with our talent team",
                contact: "careers@nexural.com",
                action: "Send Email",
              },
              {
                icon: Phone,
                title: "Call Us",
                description: "Speak directly with a recruiter",
                contact: "+1 (555) 123-4567",
                action: "Call Now",
              },
              {
                icon: Calendar,
                title: "Schedule a Call",
                description: "Book a 30-minute career consultation",
                contact: "Available Mon-Fri 9AM-5PM EST",
                action: "Book Call",
              },
            ].map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 h-full">
                  <CardContent className="p-8 text-center">
                    <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-6">
                      <contact.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{contact.title}</h3>
                    <p className="text-gray-400 mb-4">{contact.description}</p>
                    <p className="text-primary font-semibold mb-6">{contact.contact}</p>
                    <Button
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
                    >
                      {contact.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-gray-900/50 rounded-2xl p-8 border border-gray-800"
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "What's the interview process like?",
                  answer:
                    "Our process typically includes a phone screening, technical assessment, and final interviews with team members.",
                },
                {
                  question: "Do you offer remote work options?",
                  answer:
                    "Yes! We're a remote-first company with flexible work arrangements and optional office access.",
                },
                {
                  question: "What's the typical response time?",
                  answer:
                    "We aim to respond to all applications within 48 hours and complete the process within 2 weeks.",
                },
                {
                  question: "Do you sponsor work visas?",
                  answer: "Yes, we sponsor H-1B, O-1, and other work visas for exceptional candidates.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-semibold text-primary">{faq.question}</h4>
                  <p className="text-gray-300 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
