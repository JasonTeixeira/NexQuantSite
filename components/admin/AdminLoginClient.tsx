"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2, Globe, Server, Database, Activity } from "lucide-react"

interface LoginError {
  message: string
  code: string
}

const DEMO_CREDENTIALS = [
  { email: 'admin@nexural.com', password: 'admin123', role: 'Super Admin' },
  { email: 'manager@nexural.com', password: 'manager123', role: 'Manager' }
]

export default function AdminLoginClient() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Admin login successful:', data)
        
        // Save admin token to localStorage for auth guard
        if (data.token) {
          localStorage.setItem('adminToken', data.token)
          console.log('💾 Admin token saved to localStorage')
        }
        if (data.user) {
          localStorage.setItem('adminUser', JSON.stringify(data.user))
          console.log('👤 Admin user saved to localStorage')
        }
        
        // Successful login - hard redirect to ensure clean state
        console.log('🔄 Redirecting to admin dashboard...')
        window.location.href = '/admin/dashboard'
      } else {
        setError({
          message: data.error || 'Login failed',
          code: response.status === 429 ? 'RATE_LIMITED' : 'AUTH_FAILED'
        })
      }
    } catch (err) {
      setError({
        message: 'Network error. Please try again.',
        code: 'NETWORK_ERROR'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoCredentials = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setFormData({ email: cred.email, password: cred.password })
    setShowDemoCredentials(false)
    setError(null)
  }

  const getErrorIcon = () => {
    switch (error?.code) {
      case 'RATE_LIMITED':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getErrorVariant = () => {
    return error?.code === 'RATE_LIMITED' ? 'default' : 'destructive'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10" />
        
        {/* Floating security icons */}
        {[Shield, Lock, Server, Database, Activity, Globe].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-500/20"
            animate={{
              y: [-20, -40],
              opacity: [0.3, 0.1, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-black/80 border-gray-800 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-white">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-400">
              Secure login to Nexural Trading administration
            </CardDescription>
            
            <Badge variant="outline" className="w-fit mx-auto mt-2 text-blue-400 border-blue-400">
              <Lock className="w-3 h-3 mr-1" />
              Encrypted & Protected
            </Badge>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@nexural.com"
                  required
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your admin password"
                    required
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant={getErrorVariant()} className="bg-red-900/20 border-red-800 text-red-200">
                  {getErrorIcon()}
                  <AlertDescription className="ml-2">
                    {error.message}
                    {error.code === 'RATE_LIMITED' && (
                      <div className="text-xs mt-1 opacity-80">
                        Multiple failed attempts detected. Please wait before trying again.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Demo credentials helper */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                  className="text-gray-400 hover:text-gray-300 text-xs"
                  disabled={isSubmitting}
                >
                  {showDemoCredentials ? 'Hide' : 'Show'} Demo Credentials
                </Button>
              </div>

              {showDemoCredentials && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  {DEMO_CREDENTIALS.map((cred, index) => (
                    <div key={index} className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          <div className="font-medium text-gray-300">{cred.role}</div>
                          <div>{cred.email}</div>
                          <div className="font-mono">{cred.password}</div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fillDemoCredentials(cred)}
                          className="text-xs"
                          disabled={isSubmitting}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Protected by enterprise security</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}


