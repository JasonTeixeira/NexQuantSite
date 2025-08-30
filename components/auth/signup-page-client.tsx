"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  TrendingUp,
  Shield,
  Star,
  Award,
  Chrome,
  Github,
  MessageCircle,
  AlertCircle,
  Zap,
  Users,
  Activity,
  Crown,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FormData {
  // Step 1: Account Basics
  email: string
  username: string
  password: string
  confirmPassword: string

  // Step 2: Profile Setup
  fullName: string
  bio: string
  location: string
  timezone: string

  // Step 3: Trading Experience
  experience: string
  preferredMarkets: string[]
  tradingGoals: string[]
  riskTolerance: string

  // Step 4: Plan Selection
  selectedPlan: string

  // Step 5: Agreements
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingOptIn: boolean
  referralCode: string
}

const steps = [
  { id: 1, title: "Account", icon: User, description: "Basic information" },
  { id: 2, title: "Profile", icon: Upload, description: "Personal details" },
  { id: 3, title: "Experience", icon: TrendingUp, description: "Trading background" },
  { id: 4, title: "Plan", icon: Star, description: "Choose your tier" },
  { id: 5, title: "Complete", icon: Check, description: "Final setup" },
]

const plans = [
  {
    id: "free",
    name: "Free Starter",
    price: 0,
    badge: "Perfect to Start",
    description: "Access to community and basic educational content",
    features: [
      "Community access & discussions",
      "Basic educational content",
      "Market news & updates",
      "Basic portfolio tracking",
      "Mobile app access",
      "Email support",
    ],
    color: "from-gray-600 to-gray-700",
    popular: false,
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro Trader",
    price: 55,
    badge: "Most Popular",
    description: "Full access to trading tools and premium features",
    features: [
      "Everything in Free",
      "Advanced trading signals",
      "Technical analysis tools",
      "Portfolio analytics",
      "Priority community access",
      "Live trading sessions",
      "Premium educational content",
      "API access for automation",
      "Priority support",
    ],
    color: "from-primary to-green-400",
    popular: true,
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite Master",
    price: 300,
    badge: "Ultimate Experience",
    description: "Exclusive access to everything plus personalized guidance",
    features: [
      "Everything in Pro",
      "Custom trading strategies",
      "1-on-1 coaching sessions",
      "Exclusive market insights",
      "Direct access to experts",
      "Custom indicator development",
      "White-glove onboarding",
      "Dedicated account manager",
      "Phone & video support",
    ],
    color: "from-purple-500 to-blue-500",
    popular: false,
    highlight: false,
  },
]

const features = [
  { icon: TrendingUp, title: "AI-Powered Insights", desc: "Advanced market analysis" },
  { icon: Users, title: "Elite Community", desc: "Learn from the best" },
  { icon: Shield, title: "Secure Platform", desc: "Bank-grade security" },
  { icon: Zap, title: "Real-time Data", desc: "Lightning-fast execution" },
]

export default function SignupPageClient() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    bio: "",
    location: "",
    timezone: "",
    experience: "",
    preferredMarkets: [],
    tradingGoals: [],
    riskTolerance: "",
    selectedPlan: "pro",
    termsAccepted: false,
    privacyAccepted: false,
    marketingOptIn: true,
    referralCode: "",
  })

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = "Email is required"
        if (!formData.username) newErrors.username = "Username is required"
        if (!formData.password) newErrors.password = "Password is required"
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match"
        if (passwordStrength < 50) newErrors.password = "Password must be stronger (use uppercase, numbers, symbols)"
        break
      case 2:
        if (!formData.fullName) newErrors.fullName = "Full name is required"
        if (!formData.location) newErrors.location = "Location is required"
        if (!formData.timezone) newErrors.timezone = "Timezone is required"
        break
      case 3:
        if (!formData.experience) newErrors.experience = "Experience level is required"
        if (formData.preferredMarkets.length === 0) newErrors.preferredMarkets = "Select at least one market"
        if (formData.tradingGoals.length === 0) newErrors.tradingGoals = "Select at least one trading goal"
        if (!formData.riskTolerance) newErrors.riskTolerance = "Risk tolerance is required"
        break
      case 5:
        if (!formData.termsAccepted) newErrors.terms = "You must accept the terms of service"
        if (!formData.privacyAccepted) newErrors.privacy = "You must accept the privacy policy"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    setIsLoading(true)

    // Simulate account creation
    setTimeout(() => {
      setIsLoading(false)

      // Store user session
      localStorage.setItem("userToken", "new-user-token-12345")
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: Math.floor(Math.random() * 10000),
          name: formData.fullName,
          email: formData.email,
          username: formData.username,
          avatar: "",
          bio: formData.bio,
          location: formData.location,
          plan: plans.find((p) => p.id === formData.selectedPlan)?.name || "Free",
          level: "Bronze",
          isVerified: false,
          joinDate: new Date().toISOString(),
          experience: formData.experience,
          preferredMarkets: formData.preferredMarkets,
          tradingGoals: formData.tradingGoals,
          riskTolerance: formData.riskTolerance,
        }),
      )

      router.push("/dashboard")
      window.location.reload()
    }, 3000)
  }

  const toggleArrayItem = (array: string[], item: string, setArray: (newArray: string[]) => void) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
    setArray(newArray)
  }

  const handleSocialSignup = (provider: string) => {
    setTimeout(() => {
      localStorage.setItem("userToken", `${provider.toLowerCase()}-signup-token-12345`)
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: Math.floor(Math.random() * 10000),
          name: "Alex Chen",
          email: `alex@${provider.toLowerCase()}.com`,
          username: "trader_" + Math.floor(Math.random() * 1000),
          avatar: "",
          plan: "Free",
          level: "Bronze",
          isVerified: true,
          joinDate: new Date().toISOString(),
        }),
      )
      router.push("/dashboard")
      window.location.reload()
    }, 1500)
  }

  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-center bg-cover opacity-5"></div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            rotate: [0, 15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/30 to-green-400/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 50, 0],
            rotate: [0, -20, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute bottom-32 left-20 w-48 h-48 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 flex min-h-screen gap-6">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-2/5 xl:w-2/5 flex-col justify-center px-6 xl:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-green-400 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-bold text-black">N</span>
              </div>
              <div>
                <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  NEXURAL
                </span>
                <p className="text-gray-400 text-sm mt-1">Join the Trading Revolution</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Join the Elite
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                    Trading Community
                  </span>
                </h1>

                <p className="text-lg text-gray-300 leading-relaxed">
                  Start your quantitative trading journey with AI-powered insights, connect with professional traders,
                  and access world-class educational content.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-green-400/20 border border-primary/20">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-8 pt-8 border-t border-gray-800/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50K+</div>
                  <div className="text-xs text-gray-400">Traders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">$2.5B+</div>
                  <div className="text-xs text-gray-400">Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">98.5%</div>
                  <div className="text-xs text-gray-400">Satisfaction</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-3/5 xl:w-3/5 flex items-center justify-center p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800/50 shadow-2xl">
              <CardHeader className="text-center space-y-6 pb-8">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-green-400 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">N</span>
                  </div>
                  <span className="text-2xl font-bold text-white">NEXURAL</span>
                </div>

                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-lg mt-3">
                    Join thousands of successful traders worldwide
                  </CardDescription>
                </div>

                {/* Progress Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Step {currentStep} of 5</span>
                    <span className="text-primary font-medium">{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-gray-800 rounded-full" />

                  {/* Step Indicators */}
                  <div className="flex justify-center space-x-3">
                    {steps.map((step) => {
                      const Icon = step.icon
                      return (
                        <div
                          key={step.id}
                          className={`relative group transition-all duration-300 ${
                            step.id === currentStep ? "scale-110" : ""
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2 ${
                              step.id === currentStep
                                ? "bg-primary text-black border-primary shadow-lg shadow-primary/25"
                                : step.id < currentStep
                                  ? "bg-green-500 text-white border-green-500"
                                  : "bg-gray-800 text-gray-400 border-gray-700"
                            }`}
                          >
                            {step.id < currentStep ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-gray-700 shadow-xl">
                              <div className="font-medium">{step.title}</div>
                              <div className="text-gray-400">{step.description}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Account Basics */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Create Your Account</h3>
                        <p className="text-gray-400">Let's start with your basic information</p>
                      </div>

                      {/* Social Signup Options */}
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="w-full bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12 text-base font-medium"
                          onClick={() => handleSocialSignup("Google")}
                        >
                          <Chrome className="w-5 h-5 mr-3" />
                          Continue with Google
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                            onClick={() => handleSocialSignup("LinkedIn")}
                          >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                            onClick={() => handleSocialSignup("GitHub")}
                          >
                            <Github className="w-5 h-5 mr-2" />
                            GitHub
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                            onClick={() => handleSocialSignup("Microsoft")}
                          >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                            </svg>
                            Microsoft
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                            onClick={() => handleSocialSignup("Apple")}
                          >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                            </svg>
                            Apple
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                            onClick={() => handleSocialSignup("Discord")}
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Discord
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                            onClick={() => handleSocialSignup("Twitter")}
                          >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            X (Twitter)
                          </Button>
                        </div>
                      </div>

                      <div className="relative my-6">
                        <Separator className="bg-gray-700/50" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-4 text-sm text-gray-400">
                          or continue with email
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-300 text-base">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                          {errors.email && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-gray-300 text-base">
                            Username
                          </Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="username"
                              placeholder="Choose a username"
                              className="pl-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                          </div>
                          {errors.username && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.username}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300 text-base">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="pl-12 pr-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {formData.password && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Progress value={passwordStrength} className="flex-1 h-2" />
                              <span
                                className={`text-xs font-medium ${
                                  passwordStrength < 30
                                    ? "text-red-400"
                                    : passwordStrength < 60
                                      ? "text-yellow-400"
                                      : "text-green-400"
                                }`}
                              >
                                {passwordStrength < 30 ? "Weak" : passwordStrength < 60 ? "Good" : "Strong"}
                              </span>
                            </div>
                          </div>
                        )}
                        {errors.password && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.password}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300 text-base">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-12 pr-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.confirmPassword}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referralCode" className="text-gray-300 text-base">
                          Referral Code (Optional)
                        </Label>
                        <Input
                          id="referralCode"
                          placeholder="Enter referral code for exclusive bonuses"
                          className="h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                          value={formData.referralCode}
                          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                        />
                        {formData.referralCode && (
                          <div className="flex items-center space-x-2 text-green-400 text-sm">
                            <Award className="w-4 h-4" />
                            <span>+1 month free with valid referral code</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Profile Setup */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Build Your Profile</h3>
                        <p className="text-gray-400">Tell us about yourself to personalize your experience</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-300 text-base">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          className="h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                        {errors.fullName && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.fullName}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-gray-300 text-base">
                          Bio (Optional)
                        </Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your trading background and interests..."
                          rows={3}
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary resize-none"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-gray-300 text-base">
                            Location
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="location"
                              placeholder="City, Country"
                              className="pl-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary text-base"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                          </div>
                          {errors.location && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300 text-base">Timezone</Label>
                          <Select
                            value={formData.timezone}
                            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                          >
                            <SelectTrigger className="h-12 bg-gray-800/50 border-gray-700/50 text-white">
                              <SelectValue placeholder="Select your timezone" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                              <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                              <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                              <SelectItem value="UTC+1">Central European (UTC+1)</SelectItem>
                              <SelectItem value="UTC+8">Singapore (UTC+8)</SelectItem>
                              <SelectItem value="UTC+9">Japan (UTC+9)</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.timezone && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.timezone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Trading Experience */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Trading Experience</h3>
                        <p className="text-gray-400">Help us customize your learning path and experience</p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-gray-300 text-base">Experience Level</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "Beginner", label: "Beginner", desc: "New to trading", icon: GraduationCap },
                            { id: "Intermediate", label: "Intermediate", desc: "Some experience", icon: TrendingUp },
                            { id: "Advanced", label: "Advanced", desc: "Experienced trader", icon: Activity },
                            {
                              id: "Professional",
                              label: "Professional",
                              desc: "Trading professionally",
                              icon: Briefcase,
                            },
                          ].map((level) => {
                            const Icon = level.icon
                            return (
                              <button
                                key={level.id}
                                onClick={() => setFormData({ ...formData, experience: level.id })}
                                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                  formData.experience === level.id
                                    ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/25 scale-105"
                                    : "border-gray-700/50 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50"
                                }`}
                              >
                                <div className="flex items-center space-x-3 mb-2">
                                  <Icon className="w-6 h-6" />
                                  <div className="font-semibold">{level.label}</div>
                                </div>
                                <div className="text-sm text-gray-400">{level.desc}</div>
                              </button>
                            )
                          })}
                        </div>
                        {errors.experience && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.experience}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-gray-300 text-base">
                          Preferred Markets (Select all that interest you)
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {["Stocks", "Forex", "Crypto", "Futures", "Options", "Commodities"].map((market) => (
                            <button
                              key={market}
                              onClick={() =>
                                toggleArrayItem(formData.preferredMarkets, market, (newArray) =>
                                  setFormData({ ...formData, preferredMarkets: newArray }),
                                )
                              }
                              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                                formData.preferredMarkets.includes(market)
                                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/25"
                                  : "border-gray-700/50 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50"
                              }`}
                            >
                              <div className="font-medium">{market}</div>
                            </button>
                          ))}
                        </div>
                        {errors.preferredMarkets && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.preferredMarkets}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-gray-300 text-base">Trading Goals (Select all that apply)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            "Generate income",
                            "Build long-term wealth",
                            "Learn new strategies",
                            "Network with traders",
                            "Automate trading",
                            "Risk management",
                          ].map((goal) => (
                            <button
                              key={goal}
                              onClick={() =>
                                toggleArrayItem(formData.tradingGoals, goal, (newArray) =>
                                  setFormData({ ...formData, tradingGoals: newArray }),
                                )
                              }
                              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                formData.tradingGoals.includes(goal)
                                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/25"
                                  : "border-gray-700/50 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50"
                              }`}
                            >
                              <div className="font-medium">{goal}</div>
                            </button>
                          ))}
                        </div>
                        {errors.tradingGoals && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.tradingGoals}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-gray-300 text-base">Risk Tolerance</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              id: "Conservative",
                              label: "Conservative",
                              desc: "Prefer lower risk, steady returns",
                              color: "green",
                            },
                            {
                              id: "Moderate",
                              label: "Moderate",
                              desc: "Balanced risk/reward approach",
                              color: "yellow",
                            },
                            {
                              id: "Aggressive",
                              label: "Aggressive",
                              desc: "Higher risk for higher potential returns",
                              color: "red",
                            },
                          ].map((risk) => (
                            <button
                              key={risk.id}
                              onClick={() => setFormData({ ...formData, riskTolerance: risk.id })}
                              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                                formData.riskTolerance === risk.id
                                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/25 scale-105"
                                  : "border-gray-700/50 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50"
                              }`}
                            >
                              <div className="font-semibold mb-2">{risk.label}</div>
                              <div className="text-sm text-gray-400">{risk.desc}</div>
                            </button>
                          ))}
                        </div>
                        {errors.riskTolerance && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.riskTolerance}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Plan Selection */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h3>
                        <p className="text-gray-400">Start with a 14-day free trial on any plan</p>
                      </div>

                      <div className="space-y-6">
                        {plans.map((plan) => (
                          <motion.button
                            key={plan.id}
                            onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                              formData.selectedPlan === plan.id
                                ? "border-primary bg-primary/10 shadow-2xl shadow-primary/25 scale-105"
                                : "border-gray-700/50 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50"
                            }`}
                          >
                            {plan.popular && (
                              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-green-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                                {plan.badge}
                              </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}
                                >
                                  {plan.id === "free" && <Users className="w-6 h-6 text-white" />}
                                  {plan.id === "pro" && <Crown className="w-6 h-6 text-black" />}
                                  {plan.id === "elite" && <Star className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                                  <p className="text-sm text-gray-400">{plan.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-white">
                                  ${plan.price}
                                  {plan.price > 0 && <span className="text-lg text-gray-400">/mo</span>}
                                </div>
                                {plan.price === 0 && (
                                  <div className="text-sm text-green-400 font-medium">Forever Free</div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start text-sm text-gray-300">
                                  <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            {plan.popular && (
                              <div className="text-center mt-4">
                                <Badge className="bg-gradient-to-r from-primary to-green-400 text-black font-medium">
                                  Recommended for most traders
                                </Badge>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      <div className="text-center">
                        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">14-Day Free Trial</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            All plans include a 14-day free trial • Cancel anytime • No hidden fees
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Complete Setup */}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Complete Your Setup</h3>
                        <p className="text-gray-400">Review your information and accept our terms</p>
                      </div>

                      {/* Account Summary */}
                      <div className="bg-gradient-to-r from-primary/10 to-green-400/10 rounded-2xl p-6 border border-primary/20">
                        <h4 className="font-bold text-white mb-4 flex items-center text-lg">
                          <Check className="w-6 h-6 text-green-400 mr-3" />
                          Account Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400">Email:</span>
                              <div className="text-white font-medium">{formData.email}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Username:</span>
                              <div className="text-white font-medium">@{formData.username}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Full Name:</span>
                              <div className="text-white font-medium">{formData.fullName}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Location:</span>
                              <div className="text-white font-medium">{formData.location}</div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400">Plan:</span>
                              <div className="text-primary font-bold">
                                {plans.find((p) => p.id === formData.selectedPlan)?.name}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400">Experience:</span>
                              <div className="text-white font-medium">{formData.experience}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Markets:</span>
                              <div className="text-white font-medium">{formData.preferredMarkets.join(", ")}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Risk Tolerance:</span>
                              <div className="text-white font-medium">{formData.riskTolerance}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Agreements */}
                      <div className="space-y-6">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="terms"
                            checked={formData.termsAccepted}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, termsAccepted: checked as boolean })
                            }
                            className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                          />
                          <div className="text-sm">
                            <Label htmlFor="terms" className="text-gray-300 cursor-pointer">
                              I agree to the{" "}
                              <Link href="/legal" className="text-primary hover:underline font-medium">
                                Terms of Service
                              </Link>{" "}
                              and understand the risks involved in trading and investment activities
                            </Label>
                          </div>
                        </div>
                        {errors.terms && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm ml-6">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.terms}</span>
                          </div>
                        )}

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="privacy"
                            checked={formData.privacyAccepted}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, privacyAccepted: checked as boolean })
                            }
                            className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                          />
                          <div className="text-sm">
                            <Label htmlFor="privacy" className="text-gray-300 cursor-pointer">
                              I agree to the{" "}
                              <Link href="/legal" className="text-primary hover:underline font-medium">
                                Privacy Policy
                              </Link>{" "}
                              and consent to the processing of my personal data
                            </Label>
                          </div>
                        </div>
                        {errors.privacy && (
                          <div className="flex items-center space-x-2 text-red-400 text-sm ml-6">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.privacy}</span>
                          </div>
                        )}

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="marketing"
                            checked={formData.marketingOptIn}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, marketingOptIn: checked as boolean })
                            }
                            className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                          />
                          <div className="text-sm">
                            <Label htmlFor="marketing" className="text-gray-300 cursor-pointer">
                              Send me trading insights, market updates, and platform news (optional)
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* MAXIMUM RISK DISCLAIMER */}
                      <div className="space-y-4">
                        <Alert className="bg-red-900/50 border-2 border-red-500">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <AlertDescription className="text-white font-bold">
                            <span className="text-red-400 font-black">EXTREME WARNING:</span> YOU WILL LOSE YOUR MONEY! 
                            95% of traders lose EVERYTHING. We do NOT hold your funds - money stays with YOUR broker. 
                            We are NOT investment advisors. This is execution software ONLY.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="bg-black/60 border border-yellow-500 rounded-lg p-4">
                          <p className="text-yellow-300 font-bold text-sm text-center mb-3">
                            ⚠️ BY CREATING AN ACCOUNT YOU ACKNOWLEDGE ⚠️
                          </p>
                          <ul className="space-y-1 text-xs text-gray-300">
                            <li>✓ You will likely LOSE ALL your money</li>
                            <li>✓ We do NOT hold or handle your funds</li>
                            <li>✓ We are NOT a financial institution</li>
                            <li>✓ This is NOT investment advice</li>
                            <li>✓ You accept 100% responsibility for ALL losses</li>
                            <li>✓ You CANNOT sue us for ANY reason</li>
                            <li>✓ NO REFUNDS for ANY reason</li>
                            <li>✓ Subject to BINDING ARBITRATION</li>
                          </ul>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="risk-acceptance"
                            required
                            className="border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 mt-1"
                          />
                          <Label htmlFor="risk-acceptance" className="text-xs text-red-300 cursor-pointer">
                            <strong>I ACCEPT that I will likely lose ALL my money, that Nexural does NOT hold my funds, 
                            is NOT responsible for my losses, and I waive ALL rights to sue or claim damages. 
                            I have read and accept the FULL LEGAL DISCLAIMER.</strong>
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-gray-800/50">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 disabled:opacity-50 px-6 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {currentStep < 5 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-black font-semibold px-8"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-black font-semibold px-8"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Create Account
                          <Check className="w-5 h-5 ml-3" />
                        </div>
                      )}
                    </Button>
                  )}
                </div>

                <div className="text-center text-sm text-gray-400 pt-4">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Sign in here
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                <Shield className="w-4 h-4" />
                <span>Your data is protected with enterprise-grade security</span>
              </div>
              <div className="flex justify-center space-x-6 text-xs text-gray-600">
                <span>• SSL Encrypted</span>
                <span>• GDPR Compliant</span>
                <span>• SOC 2 Certified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
