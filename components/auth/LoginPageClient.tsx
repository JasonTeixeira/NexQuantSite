"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  Shield,
  Zap,
  TrendingUp,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth/auth-context"

interface LoginError {
  message: string
  errors?: Record<string, string>
  requiresTwoFactor?: boolean
  requiresEmailVerification?: boolean
}

export default function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const redirectPath = searchParams?.get('redirect') || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath)
    }
  }, [isAuthenticated, redirectPath, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ User login successful:', data)
        
        // Login successful
        setSuccess('Login successful! Redirecting...')
        console.log('📞 Calling auth context login with:', { user: data.user, session: data.session })
        login(data.user, data.session)
        
        // Small delay to show success message
        setTimeout(() => {
          console.log('🔄 Redirecting to:', redirectPath)
          router.push(redirectPath)
        }, 1000)
        
      } else {
        // Login failed
        setError({
          message: data.message,
          errors: data.errors,
          requiresTwoFactor: data.requiresTwoFactor,
          requiresEmailVerification: data.requiresEmailVerification
        })
      }

    } catch (err) {
      console.error('Login error:', err)
      setError({
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@nexural.com',
      password: 'demo123',
      rememberMe: false
    })
    
    // Trigger form submission with demo credentials
    setTimeout(() => {
      const form = document.getElementById('login-form') as HTMLFormElement
      form?.requestSubmit()
    }, 100)
  }

  const features = [
    { icon: TrendingUp, title: "Advanced Trading Tools", description: "Professional-grade backtesting and analysis" },
    { icon: Shield, title: "Secure Platform", description: "Bank-level security with 2FA protection" },
    { icon: Users, title: "Expert Community", description: "Connect with professional traders" },
    { icon: Zap, title: "Real-time Data", description: "Live market feeds and instant alerts" }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link href="/">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Nexural Trading account</p>
            </motion.div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  {/* Error Alert */}
                  {error && (
                    <Alert className="mb-6 border-red-500/50 bg-red-900/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">
                        {error.message}
                        {error.requiresEmailVerification && (
                          <div className="mt-2">
                            <Link href="/verify-email" className="text-primary hover:underline">
                              Verify your email address →
                            </Link>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success Alert */}
                  {success && (
                    <Alert className="mb-6 border-green-500/50 bg-green-900/20">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-200">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Demo Login Button */}
                  <div className="mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary/50 text-primary hover:bg-primary/10"
                      onClick={handleDemoLogin}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Try Demo Account
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Explore the platform with demo@nexural.com
                    </p>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-gray-900 px-2 text-gray-400">Or sign in with email</span>
                    </div>
                  </div>

                  <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className={`pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary ${
                            error?.errors?.email ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {error?.errors?.email && (
                        <p className="text-sm text-red-400">{error.errors.email}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className={`pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary ${
                            error?.errors?.password ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {error?.errors?.password && (
                        <p className="text-sm text-red-400">{error.errors.password}</p>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, rememberMe: !!checked }))
                          }
                          disabled={isLoading}
                        />
                        <Label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-primary text-black hover:bg-primary/90 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-black rounded-full animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Sign Up Link */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      Don't have an account?{' '}
                      <Link href="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Sign up for free
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Features & Branding */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm">
          <div className="max-w-md">
            {/* Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Professional Trading Platform
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Join thousands of traders using advanced tools and strategies to achieve consistent profits.
              </p>
            </motion.div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/20 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500 text-sm mb-4">Trusted by traders worldwide</p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                  SOC 2 Certified
                </Badge>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  99.9% Uptime
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


