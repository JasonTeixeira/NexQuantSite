"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Github,
  Chrome,
  MessageCircle,
  Shield,
  Zap,
  TrendingUp,
  Users,
  AlertCircle,
  Star,
  Award,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPageClient() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Call the actual login API
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store user session
        localStorage.setItem("userToken", data.session?.sessionToken || "auth-token")
        localStorage.setItem("user", JSON.stringify({
          email: data.user?.email || formData.email,
          name: data.user?.firstName || data.user?.username || "User",
          username: data.user?.username || formData.email.split('@')[0],
          avatar: data.user?.avatarUrl || "",
          plan: data.user?.subscriptionTier || "Free",
          level: data.user?.subscriptionTier === 'premium' ? "Diamond" : "Bronze",
          isVerified: data.user?.emailVerified || true,
          joinDate: data.user?.createdAt || new Date().toISOString(),
        }))
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 500)
      } else {
        setErrors({ form: data.error || 'Invalid email or password' })
      }
    } catch (error) {
      setErrors({ form: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    setTimeout(() => {
      localStorage.setItem("userToken", "social-auth-token-12345")
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: 1,
          name: "Alex Chen",
          email: `alex@${provider.toLowerCase()}.com`,
          username: "quanttrader_pro",
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

  const features = [
    { icon: TrendingUp, title: "Advanced Analytics", desc: "Real-time market insights" },
    { icon: Zap, title: "AI Trading Bots", desc: "Automated strategies" },
    { icon: Users, title: "Community Access", desc: "Connect with traders" },
    { icon: Shield, title: "Secure Platform", desc: "Bank-grade security" },
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-center bg-cover opacity-5"></div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/30 to-green-400/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 flex min-h-screen gap-8">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col justify-center px-6 xl:px-12">
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
                <p className="text-gray-400 text-sm mt-1">Quantitative Trading Platform</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Welcome Back to the
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                    Future of Trading
                  </span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  Access cutting-edge trading tools, connect with elite traders, and take your trading to the next level
                  with our AI-powered platform.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="group p-4 rounded-xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-800/50 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-green-400/20 border border-primary/20 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                        <p className="text-gray-400 text-xs mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-8 pt-8 border-t border-gray-800/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-gray-400">Active Traders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">98.5%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">$2.5B+</div>
                  <div className="text-sm text-gray-400">Volume</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-3/5 xl:w-1/2 flex items-center justify-center p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
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
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-lg mt-3">
                    Sign in to continue your trading journey
                  </CardDescription>
                </div>

                {/* Quick Benefits */}
                <div className="lg:hidden grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-gray-300">Premium Tools</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Award className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-300">Expert Community</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Social Login Buttons */}
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12 text-base font-medium transition-all"
                    onClick={() => handleSocialLogin("Google")}
                  >
                    <Chrome className="w-5 h-5 mr-3" />
                    Continue with Google
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                      onClick={() => handleSocialLogin("LinkedIn")}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                      onClick={() => handleSocialLogin("GitHub")}
                    >
                      <Github className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                      onClick={() => handleSocialLogin("Microsoft")}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                      </svg>
                      Microsoft
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                      onClick={() => handleSocialLogin("Apple")}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                      </svg>
                      Apple
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white h-12"
                      onClick={() => handleSocialLogin("Discord")}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Discord
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Separator className="bg-gray-700/50" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-4 text-sm text-gray-400">
                    or continue with email
                  </span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 text-base">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary text-base"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </motion.div>
                    )}
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
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary text-base"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                        className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                        Remember me for 30 days
                      </Label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-black font-semibold h-12 text-base shadow-lg transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3"></div>
                        Signing you in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign In to Dashboard
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium mb-2">🔓 Demo Credentials for Testing:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">demo@nexural.com / demo123</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-blue-400 hover:text-blue-300"
                        onClick={() => {
                          setFormData({ email: 'demo@nexural.com', password: 'demo123', rememberMe: false })
                        }}
                      >
                        Use
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">user@nexural.com / user123</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-blue-400 hover:text-blue-300"
                        onClick={() => {
                          setFormData({ email: 'user@nexural.com', password: 'user123', rememberMe: false })
                        }}
                      >
                        Use
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">test@nexural.com / test123</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-blue-400 hover:text-blue-300"
                        onClick={() => {
                          setFormData({ email: 'test@nexural.com', password: 'test123', rememberMe: false })
                        }}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <span className="text-gray-400">Don't have an account? </span>
                  <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Create free account
                  </Link>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Enterprise Security</p>
                      <p className="text-xs text-gray-400">Protected with bank-level encryption & 2FA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-500 mb-4">Trusted by 50,000+ professional traders worldwide</p>
              <div className="flex justify-center space-x-6 text-xs text-gray-600">
                <span>• 99.9% Uptime Guarantee</span>
                <span>• 24/7 Expert Support</span>
                <span>• SOC 2 Type II Certified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
