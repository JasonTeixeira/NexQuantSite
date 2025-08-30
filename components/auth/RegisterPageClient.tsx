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
  UserPlus, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  User,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Gift,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth/auth-context"

interface RegisterError {
  message: string
  errors?: Record<string, string>
}

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function RegisterPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    allowMarketing: false,
    referralCode: searchParams?.get('ref') || ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<RegisterError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-500'
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 20
    else feedback.push('At least 8 characters')

    if (/[a-z]/.test(password)) score += 15
    else feedback.push('Lowercase letter')

    if (/[A-Z]/.test(password)) score += 15
    else feedback.push('Uppercase letter')

    if (/\d/.test(password)) score += 20
    else feedback.push('Number')

    if (/[@$!%*?&]/.test(password)) score += 30
    else feedback.push('Special character')

    let color = 'text-red-500'
    if (score >= 80) color = 'text-green-500'
    else if (score >= 60) color = 'text-yellow-500'
    else if (score >= 40) color = 'text-orange-500'

    return { score, feedback, color }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Calculate password strength for password field
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Client-side validation
    const errors: Record<string, string> = {}
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms of service'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (passwordStrength.score < 60) {
      errors.password = 'Password is too weak'
    }

    if (Object.keys(errors).length > 0) {
      setError({ message: 'Please correct the errors below', errors })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Registration successful
        setSuccess('Account created successfully! Please check your email to verify your account.')
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login?message=registration_success')
        }, 3000)
        
      } else {
        // Registration failed
        setError({
          message: data.message,
          errors: data.errors
        })
      }

    } catch (err) {
      console.error('Registration error:', err)
      setError({
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: TrendingUp, title: "Advanced Trading Tools", description: "Professional backtesting & analysis" },
    { icon: Users, title: "Expert Community", description: "Learn from successful traders" },
    { icon: Shield, title: "Educational Content", description: "Comprehensive trading education" },
    { icon: Gift, title: "Free To Start", description: "No credit card required" }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Registration Form */}
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
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-gray-400">Join thousands of successful traders</p>
              {formData.referralCode && (
                <Badge className="bg-primary/20 text-primary border-primary/50 mt-2">
                  <Gift className="w-3 h-3 mr-1" />
                  Referral code applied
                </Badge>
              )}
            </motion.div>

            {/* Registration Form */}
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
                            className={`pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary ${
                              error?.errors?.firstName ? 'border-red-500' : ''
                            }`}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        {error?.errors?.firstName && (
                          <p className="text-sm text-red-400">{error.errors.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary ${
                            error?.errors?.lastName ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={isLoading}
                        />
                        {error?.errors?.lastName && (
                          <p className="text-sm text-red-400">{error.errors.lastName}</p>
                        )}
                      </div>
                    </div>

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
                          placeholder="john@example.com"
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

                    {/* Username Field */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="johndoe123"
                          className={`pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary ${
                            error?.errors?.username ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {error?.errors?.username && (
                        <p className="text-sm text-red-400">{error.errors.username}</p>
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
                          placeholder="Create strong password"
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
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Password strength</span>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.score >= 80 ? 'Strong' : 
                               passwordStrength.score >= 60 ? 'Good' : 
                               passwordStrength.score >= 40 ? 'Fair' : 'Weak'}
                            </span>
                          </div>
                          <Progress 
                            value={passwordStrength.score} 
                            className="h-2 bg-gray-700"
                          />
                          {passwordStrength.feedback.length > 0 && (
                            <p className="text-xs text-gray-400">
                              Missing: {passwordStrength.feedback.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {error?.errors?.password && (
                        <p className="text-sm text-red-400">{error.errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          className={`pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary ${
                            error?.errors?.confirmPassword ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {error?.errors?.confirmPassword && (
                        <p className="text-sm text-red-400">{error.errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Referral Code Field */}
                    {!formData.referralCode && (
                      <div className="space-y-2">
                        <Label htmlFor="referralCode" className="text-gray-300">
                          Referral Code <span className="text-gray-500">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <Input
                            id="referralCode"
                            name="referralCode"
                            type="text"
                            value={formData.referralCode}
                            onChange={handleInputChange}
                            placeholder="Enter referral code"
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-primary"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms & Marketing */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, acceptTerms: !!checked }))
                          }
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <Label htmlFor="acceptTerms" className="text-sm text-gray-400 cursor-pointer leading-relaxed">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      {error?.errors?.acceptTerms && (
                        <p className="text-sm text-red-400">{error.errors.acceptTerms}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="allowMarketing"
                          name="allowMarketing"
                          checked={formData.allowMarketing}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, allowMarketing: !!checked }))
                          }
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <Label htmlFor="allowMarketing" className="text-sm text-gray-400 cursor-pointer leading-relaxed">
                          I'd like to receive marketing emails about trading insights and platform updates
                        </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-primary text-black hover:bg-primary/90 transition-all duration-300"
                      disabled={isLoading || !formData.acceptTerms}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-black rounded-full animate-spin mr-2" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Sign In Link */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      Already have an account?{' '}
                      <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Benefits & Trust Signals */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm">
          <div className="max-w-md">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Join Elite Traders
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Get access to institutional-grade tools and strategies used by professional traders.
              </p>
            </motion.div>

            {/* Benefits List */}
            <div className="space-y-4 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/20 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <p className="text-gray-500 text-sm mb-4">Join 25,000+ successful traders</p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Bank-level Security
                </Badge>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  <Gift className="w-3 h-3 mr-1" />
                  Free Forever Plan
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


